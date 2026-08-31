import assert from "node:assert/strict";
import test from "node:test";
import { summarizeAiUsageEntries, withVerifiedPostgresSslMode } from "./account-store.mjs";
import {
  PUBLIC_PLANS,
  GOOGLE_SCOPES,
  GOOGLE_PROXY_ERROR_CODES,
  buildCommentThreadListUrl,
  commentThreadPageSize,
  classifyGoogleProxyResponse,
  decryptToken,
  encryptToken,
  isAllowedGoogleApiUrl,
  isAllowedYouTubeUploadUrl,
  isTrustedAccountOrigin,
  resolveGoogleNextIntent,
  sanitizeReturnTo,
  sendGoogleJson,
} from "./account-auth.mjs";

test("comment thread listing keeps the server-owned channel and bounded pagination contract", () => {
  assert.equal(commentThreadPageSize("0"), 1);
  assert.equal(commentThreadPageSize("250"), 100);
  assert.equal(commentThreadPageSize("invalid"), 100);
  const url = new URL(buildCommentThreadListUrl("UCchannel1", "250", "next-page"));
  assert.equal(url.pathname, "/youtube/v3/commentThreads");
  assert.equal(url.searchParams.get("allThreadsRelatedToChannelId"), "UCchannel1");
  assert.equal(url.searchParams.get("maxResults"), "100");
  assert.equal(url.searchParams.get("pageToken"), "next-page");
  assert.equal(url.searchParams.get("part"), "snippet,replies");
});

test("PostgreSQL connections explicitly verify the server identity", () => {
  const secured = new URL(withVerifiedPostgresSslMode("postgres://user:pass@db.example/viewtube?sslmode=require"));
  assert.equal(secured.searchParams.get("sslmode"), "verify-full");
});

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

test("AI usage summaries separate analysis, assets, and legacy uncategorized debits", () => {
  assert.deepEqual(summarizeAiUsageEntries([
    { deltaCredits: -12, metadata: { usageCategory: "analysis" } },
    { deltaCredits: -8, metadata: { usageCategory: "assets" } },
    { deltaCredits: -3, metadata: {} },
    { deltaCredits: 50, metadata: { usageCategory: "analysis" } },
  ]), { usedCredits: 23, byCategory: { analysis: 12, assets: 8, other: 3 } });
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

test("Google proxy failures use stable reconnect, scope, quota, rate, and upstream classifications", () => {
  const reconnect = classifyGoogleProxyResponse(401, { error: { message: "Invalid Credentials" } });
  assert.equal(reconnect.code, GOOGLE_PROXY_ERROR_CODES.GOOGLE_RECONNECT_REQUIRED);
  assert.equal(reconnect.status, 409);
  assert.equal(reconnect.reconnectRequired, true);
  assert.equal(reconnect.retryable, false);

  const scope = classifyGoogleProxyResponse(403, { error: { errors: [{ reason: "insufficientPermissions" }] } });
  assert.equal(scope.code, GOOGLE_PROXY_ERROR_CODES.GOOGLE_SCOPE_REQUIRED);
  assert.equal(scope.retryable, false);

  const quota = classifyGoogleProxyResponse(403, { error: { errors: [{ reason: "quotaExceeded" }] } });
  assert.equal(quota.code, GOOGLE_PROXY_ERROR_CODES.GOOGLE_QUOTA_EXHAUSTED);
  assert.equal(quota.retryable, false);

  const rate = classifyGoogleProxyResponse(403, { error: { errors: [{ reason: "userRateLimitExceeded" }] } });
  assert.equal(rate.code, GOOGLE_PROXY_ERROR_CODES.GOOGLE_RATE_LIMITED);
  assert.equal(rate.status, 429);
  assert.equal(rate.retryable, true);

  const upstream = classifyGoogleProxyResponse(500, { error: { message: "Backend error" } });
  assert.equal(upstream.code, GOOGLE_PROXY_ERROR_CODES.GOOGLE_UPSTREAM_UNAVAILABLE);
  assert.equal(upstream.status, 503);
  assert.equal(upstream.retryable, true);
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

test("trusted account origins accept only explicitly configured preview hosts", () => {
  const previousOrigin = process.env.ACCOUNT_PUBLIC_ORIGIN;
  const previousTrusted = process.env.ACCOUNT_TRUSTED_ORIGINS;
  process.env.ACCOUNT_PUBLIC_ORIGIN = "https://viewtube.live";
  process.env.ACCOUNT_TRUSTED_ORIGINS = "https://viewtube-git-preview.vercel.app,http://localhost:5173";
  assert.equal(isTrustedAccountOrigin("https://viewtube-git-preview.vercel.app"), true);
  assert.equal(isTrustedAccountOrigin("http://localhost:5173"), true);
  assert.equal(isTrustedAccountOrigin("https://unlisted-preview.vercel.app"), false);
  process.env.ACCOUNT_PUBLIC_ORIGIN = previousOrigin;
  process.env.ACCOUNT_TRUSTED_ORIGINS = previousTrusted;
});
