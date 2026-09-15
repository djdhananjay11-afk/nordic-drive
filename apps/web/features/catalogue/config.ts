// The legacy demo is opt-in and must not be mistaken for the launch catalogue.
export function isCuratedRelease() {
  return process.env.NORDICDRIVE_RELEASE_MODE !== "demo";
}
