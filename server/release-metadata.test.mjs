import assert from "node:assert/strict";
import test from "node:test";
import { buildReleaseMetadata } from "./release-metadata.mjs";

test("release metadata exposes only the public deployment identity contract", () => {
  const metadata = buildReleaseMetadata({
    env: {
      VERCEL_ENV: "preview",
      VERCEL_GIT_COMMIT_SHA: "abc123",
      VERCEL_GIT_COMMIT_REF: "feature/release",
      VERCEL_URL: "preview.example.vercel.app",
      DATABASE_URL: "must-not-leak",
      GOOGLE_OAUTH_CLIENT_SECRET: "must-not-leak",
    },
    git: () => "unused",
  });

  assert.deepEqual(metadata, {
    app: "viewtube",
    commit: "abc123",
    branch: "feature/release",
    environment: "preview",
    deployedAt: null,
    url: "https://preview.example.vercel.app",
  });
  assert.equal(JSON.stringify(metadata).includes("must-not-leak"), false);
});

test("release metadata falls back to local git identity", () => {
  const values = new Map([
    ["rev-parse HEAD", "local-sha"],
    ["branch --show-current", "local-branch"],
  ]);
  const metadata = buildReleaseMetadata({
    env: {},
    git: (args) => values.get(args.join(" ")) || "",
  });

  assert.equal(metadata.commit, "local-sha");
  assert.equal(metadata.branch, "local-branch");
  assert.equal(metadata.environment, "development");
  assert.equal(metadata.url, "http://localhost:5173");
});
