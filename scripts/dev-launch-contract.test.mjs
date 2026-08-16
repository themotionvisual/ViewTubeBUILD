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
