export function ownerEmail() {
  return (process.env.OWNER_EMAIL ?? "dj.dhananjay20@gmail.com").trim().toLowerCase();
}
export function isOwnerEmail(email?: string | null) {
  return Boolean(email && email.trim().toLowerCase() === ownerEmail());
}
export function isOwnerSession(session: {
  user?: { email?: string | null; role?: string; ownerAuthenticated?: boolean };
} | null | undefined) {
  return Boolean(session?.user?.ownerAuthenticated && session.user.role === "super_admin" && isOwnerEmail(session.user.email));
}
