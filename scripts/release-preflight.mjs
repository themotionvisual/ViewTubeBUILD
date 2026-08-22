import { execFileSync, spawnSync } from "node:child_process";
import { collectReleaseStatus } from "./release-status.mjs";

const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
const structuralOnly = process.argv.includes("--structural-only");
const status = await collectReleaseStatus();
const failures = [];

if (!status.branch) failures.push("Detached HEAD is not releasable.");
if (status.branch === "main") failures.push("Release preparation must never run on main.");
if (status.dirtyFiles.length) failures.push(`Working tree is dirty (${status.dirtyFiles.length} file(s)).`);
if (!status.upstream) failures.push("The current branch has no upstream.");
if ((status.behindUpstream || 0) > 0) failures.push("The current branch is behind its upstream.");
if (!status.originMain) failures.push("origin/main is unavailable.");

if (status.originMain && status.head) {
  const containsMain = spawnSync("git", ["merge-base", "--is-ancestor", status.originMain, status.head]);
  if (containsMain.status !== 0) failures.push("The release branch is not current with origin/main.");
}

const tracked = git("ls-files").split("\n").filter(Boolean);
const allowedPatch = /^governance\/canonical-code-pack\/[^/]+\.patch$/;
const forbidden = tracked.filter((file) => {
  if (file === ".env.billing.example") return false;
  if (allowedPatch.test(file)) return false;
  return /(^|\/)\.env(?:\.|$)|\.(?:pem|key|patch|zip|tar|tgz|gz|7z)$/i.test(file)
    || file.startsWith("src/generated/");
});
if (forbidden.length) failures.push(`Forbidden tracked artifacts: ${forbidden.join(", ")}`);

if (failures.length) {
  for (const failure of failures) console.error(`[release:preflight] ${failure}`);
  process.exit(1);
}

if (structuralOnly) {
  console.log("Release structural preflight passed.");
  process.exit(0);
}

const gates = [
  ["source routes", ["run", "check:routes"]],
  ["CSS parse", ["run", "check:css"]],
  ["quarantine integrity", ["run", "check:quarantine"]],
  ["source governance", ["run", "check:src-governance"]],
  ["privacy source audit", ["run", "check:privacy-src"]],
  ["focused contracts", ["run", "test:focused"]],
  ["Node account contracts", ["run", "account:test"]],
  ["full Vitest suite", ["test"]],
  ["TypeScript", ["run", "typecheck"]],
  ["runtime lint", ["run", "lint:runtime"]],
  ["production build", ["run", "build"]],
  ["local smoke", ["run", "smoke:local"]],
];

const failedGates = [];
for (const [label, args] of gates) {
  console.log(`\n[release:preflight] ${label}`);
  const result = spawnSync(process.platform === "win32" ? "npm.cmd" : "npm", args, {
    stdio: "inherit",
    env: process.env,
  });
  if (result.status !== 0) failedGates.push(label);
}

if (failedGates.length) {
  console.error(`\nRelease preflight failed: ${failedGates.join(", ")}`);
  process.exit(1);
}

console.log("\nRelease preflight passed all gates.");
