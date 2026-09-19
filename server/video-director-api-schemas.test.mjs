import assert from "node:assert/strict";
import test from "node:test";
import {
  VideoDirectorJobSubmitSchema,
  parseVideoDirectorJobSubmit,
} from "./video-director-api-schemas.mjs";

const request = {
  schemaVersion: 1,
  projectId: "project-1",
  providerId: "provider",
  modelId: "model",
  durationSeconds: 8,
  aspectRatio: "16:9",
  resolution: "720p",
  outputCount: 1,
  nativeAudio: false,
  seed: null,
  referenceAssetIds: [],
  negativeConstraints: [],
  compiledPrompt: "test",
  providerParameters: {},
};

test("accepts a strict matching generation envelope", () => {
  const parsed = parseVideoDirectorJobSubmit({
    projectId: "project-1",
    idempotencyKey: "vtd-0123456789abcdef",
    request,
  });
  assert.equal(parsed.projectId, "project-1");
  assert.equal(parsed.maxAttempts, 3);
});

test("rejects envelope/request project mismatches", () => {
  assert.throws(
    () => parseVideoDirectorJobSubmit({
      projectId: "other-project",
      idempotencyKey: "vtd-0123456789abcdef",
      request,
    }),
    /projectId must match/,
  );
});

test("rejects unknown fields instead of leaking arbitrary payloads into the queue", () => {
  const result = VideoDirectorJobSubmitSchema.safeParse({
    projectId: "project-1",
    idempotencyKey: "vtd-0123456789abcdef",
    request,
    injected: "not allowed",
  });
  assert.equal(result.success, false);
});

test("rejects invalid generation ranges server-side even when a client is bypassed", () => {
  const result = VideoDirectorJobSubmitSchema.safeParse({
    projectId: "project-1",
    idempotencyKey: "vtd-0123456789abcdef",
    request: { ...request, durationSeconds: 99_999 },
  });
  assert.equal(result.success, false);
});
