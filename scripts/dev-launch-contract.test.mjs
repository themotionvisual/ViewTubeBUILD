import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptsDir, "..");
const packageJson = JSON.parse(
  await readFile(path.join(projectRoot, "package.json"), "utf8"),
);
const vercelConfig = JSON.parse(
  await readFile(path.join(projectRoot, "vercel.json"), "utf8"),
);

const FULL_STACK_COMMAND = "node --env-file-if-exists=.env.local scripts/dev-all.mjs";

test("default local commands launch the tracked full-stack supervisor", async () => {
  await access(path.join(scriptsDir, "dev-all.mjs"));

  assert.equal(packageJson.scripts.x, FULL_STACK_COMMAND);
  assert.equal(packageJson.scripts.dev, FULL_STACK_COMMAND);
  assert.equal(packageJson.scripts["dev:all"], FULL_STACK_COMMAND);
  assert.equal(packageJson.scripts["dev:web"], "vite");
  assert.equal(
    packageJson.scripts["dev:staging"],
    `${FULL_STACK_COMMAND} --mode staging`,
  );
  assert.equal(packageJson.scripts["dev:staging:web"], "vite --mode staging");
});

test("API commands are explicit and no package script executes ignored docs", () => {
  assert.equal(
    packageJson.scripts["api:dev"],
    "node --env-file-if-exists=.env.local server/billing-server.mjs",
  );
  assert.equal(packageJson.scripts["billing:dev"], "npm run api:dev");

  for (const [name, command] of Object.entries(packageJson.scripts)) {
    assert.doesNotMatch(command, /(?:^|\s)docs\//, `${name} executes ignored docs`);
  }
});

test("Vercel keeps flat auth URLs while deploying one auth function", async () => {
  await access(path.join(projectRoot, "api", "auth.mjs"));

  const expectedRewrites = {
    "/api/auth-start": "/api/auth?__vt_auth_operation=start",
    "/api/auth-callback": "/api/auth?__vt_auth_operation=callback",
    "/api/auth-session": "/api/auth?__vt_auth_operation=session",
    "/api/auth-logout": "/api/auth?__vt_auth_operation=logout",
  };
  const configuredRewrites = Object.fromEntries(
    vercelConfig.rewrites.map(({ source, destination }) => [source, destination]),
  );
  assert.deepEqual(
    Object.fromEntries(Object.keys(expectedRewrites).map((source) => [source, configuredRewrites[source]])),
    expectedRewrites,
  );

  for (const retiredFile of [
    "auth-start.mjs",
    "auth-callback.mjs",
    "auth-session.mjs",
    "auth-logout.mjs",
  ]) {
    await assert.rejects(access(path.join(projectRoot, "api", retiredFile)));
  }
});
