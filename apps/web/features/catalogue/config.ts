// The reviewed-only view is optional; it must not hide the rest of the application.
export function isCuratedRelease() {
  return process.env.NORDICDRIVE_RELEASE_MODE === "curated";
}
