import { execFileSync } from "node:child_process";

const expectedIndex = process.argv.indexOf("--expected");
const expected = expectedIndex >= 0
  ? String(process.argv[expectedIndex + 1] || "").trim()
  : execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
const endpoint = process.env.VT_RELEASE_URL || "https://viewtube.live/api/release";

if (!expected) throw new Error("Expected release SHA is required.");

const response = await fetch(endpoint, {
  headers: { Accept: "application/json" },
  signal: AbortSignal.timeout(10_000),
});
if (!response.ok) throw new Error(`Release endpoint returned HTTP ${response.status}.`);

const metadata = await response.json();
if (metadata.environment !== "production") {
  throw new Error(`Expected production metadata, received ${String(metadata.environment)}.`);
}
if (metadata.commit !== expected) {
  throw new Error(`Live commit ${String(metadata.commit)} does not match expected ${expected}.`);
}

console.log(`viewtube.live is serving production commit ${expected}.`);
