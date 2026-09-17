import { loadEnvFile } from "node:process";
import { resolve } from "node:path";
import { existsSync } from "node:fs";
import { emitKeypressEvents } from "node:readline";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../security/password.js";

const env = resolve(".env");
if (existsSync(env)) loadEnvFile(env);
const email = (process.env.OWNER_EMAIL ?? "dj.dhananjay20@gmail.com").trim().toLowerCase();
const prisma = new PrismaClient();

function passwordPrompt(label: string): Promise<string> {
  if (!process.stdin.isTTY) throw new Error("Run owner:setup in an interactive terminal. Passwords are never accepted as command arguments.");
  process.stdout.write(label);
  emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.resume();
  return new Promise((resolve, reject) => {
    let value = "";
    const cleanup = () => {
      process.stdin.removeListener("keypress", onKey);
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdout.write("\n");
    };
    function onKey(text: string | undefined, key: { name?: string; ctrl?: boolean }) {
      if (key.ctrl && key.name === "c") { cleanup(); reject(new Error("Cancelled.")); }
      else if (key.name === "return") { cleanup(); resolve(value); }
      else if (key.name === "backspace") value = value.slice(0, -1);
      else if (text && !key.ctrl && !/[\u0000-\u001f\u007f]/.test(text) && value.length + text.length <= 128) value += text;
    }
    process.stdin.on("keypress", onKey);
  });
}

try {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("OWNER_EMAIL must be a valid email address.");
  const existing = await prisma.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } } });
  if (existing?.deletedAt) throw new Error("The owner account is archived. Restore it through your trusted database administrator first.");
  if (existing?.passwordHash && !process.argv.includes("--reset")) throw new Error("Owner already has a password. Use owner:setup --reset to replace it and revoke existing sessions.");
  console.log(`Set the owner password for ${email}. Input is hidden. Minimum 14 characters.`);
  let password = await passwordPrompt("New password: ");
  let confirmation = await passwordPrompt("Repeat password: ");
  if (password !== confirmation) throw new Error("Passwords did not match. No account changes were made.");
  const passwordHash = await hashPassword(password);
  password = "";
  confirmation = "";
  await prisma.$transaction(async (tx) => {
    const role = await tx.role.upsert({ where: { slug: "super_admin" }, create: { slug: "super_admin", name: "Super Admin", isSystem: true }, update: {} });
    if (role.deletedAt) throw new Error("The owner role is archived.");
    if (existing) await tx.user.update({ where: { id: existing.id }, data: { email, passwordHash, roleId: role.id } });
    else await tx.user.create({ data: { email, passwordHash, name: "NordicDrive owner", roleId: role.id } });
    await tx.loginThrottle.deleteMany({ where: { key: "owner" } });
  });
  console.log("Owner account configured. Sign in at /login. No password or hash has been printed.");
} catch (error) {
  console.error(error instanceof Error && !error.message.includes("prisma") ? error.message : "Owner setup failed. Check the database connection and migrations.");
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
