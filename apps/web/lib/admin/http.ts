import { NextResponse } from "next/server";
import { z } from "zod";
import { CarWriteError } from "./car-service";

export function checkWriteOrigin(request: Request) {
  const expected = new URL(process.env.AUTH_URL || request.url).origin;
  if (request.headers.get("origin") !== expected || request.headers.get("sec-fetch-site") === "cross-site")
    throw new CarWriteError(403, "Cross-site changes are not allowed.");
}
export async function readEditorJson(request: Request): Promise<unknown> {
  checkWriteOrigin(request);
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new CarWriteError(415, "Expected JSON.");
  const reader = request.body?.getReader();
  if (!reader) throw new CarWriteError(400, "Request body is missing.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const part = await reader.read();
    if (part.done) break;
    size += part.value.byteLength;
    if (size > 512000) { await reader.cancel(); throw new CarWriteError(413, "The car record is too large."); }
    chunks.push(part.value);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown; }
  catch { throw new CarWriteError(400, "Invalid JSON."); }
}
export function adminError(error: unknown) {
  let status = 500;
  let message = "The change could not be saved. Please try again.";
  let issues: Array<{ path: string; message: string }> | undefined;
  if (error instanceof z.ZodError) {
    status = 422; message = "Check the highlighted fields.";
    issues = error.issues.map(issue => ({ path: issue.path.join("."), message: issue.message }));
  } else if (error instanceof CarWriteError) { status = error.status; message = error.message; }
  else if (error && typeof error === "object" && "code" in error) {
    if (error.code === "P2002") { status = 409; message = "That slug is already used, including archived records. Choose a unique slug."; }
    if (error.code === "P2025") { status = 404; message = "Record not found."; }
    if (error.code === "P2003") { status = 422; message = "A linked record no longer exists."; }
  }
  if (status === 500) console.error("admin_write_failed");
  return NextResponse.json({ error: { message, issues } }, { status, headers: { "Cache-Control": "no-store" } });
}
