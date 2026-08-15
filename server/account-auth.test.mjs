import assert from "node:assert/strict";
import test from "node:test";
import {
  PUBLIC_PLANS,
  GOOGLE_SCOPES,
  decryptToken,
  encryptToken,
  isAllowedGoogleApiUrl,
  isAllowedYouTubeUploadUrl,
  isTrustedAccountOrigin,
  resolveGoogleNextIntent,
  sanitizeReturnTo,
  sendGoogleJson,
} from "./account-auth.mjs";

test("account return destinations remain internal", () => {
  assert.equal(sanitizeReturnTo("/local-analytics?tab=sync#run"), "/local-analytics?tab=sync#run");
  assert.equal(sanitizeReturnTo("https://evil.example"), "/account");
  assert.equal(sanitizeReturnTo("//evil.example"), "/account");
  assert.equal(sanitizeReturnTo("/admin/unknown"), "/account");
});

test("OAuth approval scope lane includes only implemented ViewTube capabilities", () => {
  assert.deepEqual(GOOGLE_SCOPES, [
    "openid",
    "profile",
    "email",
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/youtube.force-ssl",
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/yt-analytics.readonly",
    "https://www.googleapis.com/auth/yt-analytics-monetary.readonly",
  ]);
});

test("existing core-connected users receive an incremental monetary reconnect action", () => {
  assert.equal(resolveGoogleNextIntent({
    googleStatus: "connected",
    monetaryScopeGranted: false,
  }), "reconnect_channel");
  assert.equal(resolveGoogleNextIntent({
    googleStatus: "connected",
    monetaryScopeGranted: true,
  }), "manage_account");
  assert.equal(resolveGoogleNextIntent({
    googleStatus: "disconnected",
    monetaryScopeGranted: false,
  }), "connect_channel");
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

test("resumable upload session URLs stay pinned to YouTube uploads", () => {
  assert.equal(isAllowedYouTubeUploadUrl("https://www.googleapis.com/upload/youtube/v3/videos?upload_id=abc"), true);
  assert.equal(isAllowedYouTubeUploadUrl("https://www.googleapis.com/youtube/v3/videos"), false);
  assert.equal(isAllowedYouTubeUploadUrl("https://evil.example/upload/youtube/v3/videos"), false);
});

test("Google write-route responses use the injected JSON responder", async () => {
  let result;
  const response = new Response(JSON.stringify({ id: "reply-id" }), { status: 200 });
  await sendGoogleJson((res, status, payload) => { result = { res, status, payload }; }, "response", response, "Reply failed.");
  assert.deepEqual(result, { res: "response", status: 200, payload: { id: "reply-id" } });
});

test("trusted account origins accept the www and apex production hostnames", () => {
  const previousOrigin = process.env.ACCOUNT_PUBLIC_ORIGIN;
  process.env.ACCOUNT_PUBLIC_ORIGIN = "https://viewtube.live";
  assert.equal(isTrustedAccountOrigin("https://viewtube.live"), true);
  assert.equal(isTrustedAccountOrigin("https://www.viewtube.live"), true);
  assert.equal(isTrustedAccountOrigin("https://evil.viewtube.live"), false);
  process.env.ACCOUNT_PUBLIC_ORIGIN = previousOrigin;
});
