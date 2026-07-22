import assert from "node:assert/strict";
import test from "node:test";
import {
  PUBLIC_PLANS,
  READ_ONLY_SCOPES,
  decryptToken,
  encryptToken,
  isAllowedGoogleApiUrl,
  isTrustedAccountOrigin,
  sanitizeReturnTo,
} from "./account-auth.mjs";

test("account return destinations remain internal", () => {
  assert.equal(sanitizeReturnTo("/local-analytics?tab=sync#run"), "/local-analytics?tab=sync#run");
  assert.equal(sanitizeReturnTo("https://evil.example"), "/account");
  assert.equal(sanitizeReturnTo("//evil.example"), "/account");
  assert.equal(sanitizeReturnTo("/admin/unknown"), "/account");
});

test("first approval scope lane stays read-only and complete", () => {
  assert.deepEqual(READ_ONLY_SCOPES, [
    "openid",
    "profile",
    "email",
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/yt-analytics.readonly",
  ]);
});

test("server plan catalog owns every public plan id", () => {
  assert.deepEqual(PUBLIC_PLANS.map((plan) => plan.id), [
    "basic", "beta", "creator", "creator_plus", "creator_pro", "executive",
  ]);
});

test("OAuth tokens are encrypted at rest", () => {
  const ciphertext = encryptToken("secret-token");
  assert.notEqual(ciphertext, "secret-token");
  assert.equal(decryptToken(ciphertext), "secret-token");
});

test("Google proxy accepts only read-only YouTube API hosts and paths", () => {
  assert.equal(isAllowedGoogleApiUrl("https://www.googleapis.com/youtube/v3/videos?part=snippet&id=x"), true);
  assert.equal(isAllowedGoogleApiUrl("https://youtubeanalytics.googleapis.com/v2/reports?ids=channel%3D%3DMINE"), true);
  assert.equal(isAllowedGoogleApiUrl("https://www.googleapis.com/drive/v3/files"), false);
  assert.equal(isAllowedGoogleApiUrl("http://localhost:3000/internal"), false);
});

test("trusted account origins accept the www and apex production hostnames", () => {
  const previousOrigin = process.env.ACCOUNT_PUBLIC_ORIGIN;
  process.env.ACCOUNT_PUBLIC_ORIGIN = "https://viewtube.live";
  assert.equal(isTrustedAccountOrigin("https://viewtube.live"), true);
  assert.equal(isTrustedAccountOrigin("https://www.viewtube.live"), true);
  assert.equal(isTrustedAccountOrigin("https://evil.viewtube.live"), false);
  process.env.ACCOUNT_PUBLIC_ORIGIN = previousOrigin;
});
