import crypto from "node:crypto";
import {
  consumeOAuthState,
  consumeAiCredits,
  createAccountSession,
  deleteAccountRecord,
  getAccountSnapshotData,
  getGoogleCredentialRecord,
  getSessionUserId,
  markGoogleConnectionExpired,
  markGoogleConnectionRevoked,
  resolveGoogleAccount,
  revokeAccountSession,
  saveGoogleConnection,
  selectGoogleContentOwner,
  saveOAuthState,
  setServerSubscription,
  updateOnboarding,
} from "./account-store.mjs";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_TOKEN_INFO_URL = "https://oauth2.googleapis.com/tokeninfo";
const GOOGLE_REVOKE_URL = "https://oauth2.googleapis.com/revoke";
const SESSION_COOKIE = "vt_session";
const OAUTH_TTL_MS = 10 * 60 * 1000;
const VALID_INTENTS = new Set(["sign_up", "log_in", "connect_channel", "reconnect_channel"]);
const VALID_ONBOARDING_STATUS = new Set(["not_started", "in_progress", "complete"]);
const FREE_PLAN_IDS = new Set(["basic", "beta"]);
const tokenRefreshes = new Map();
export const GOOGLE_PROXY_ERROR_CODES = Object.freeze({
  AUTH_REQUIRED: "AUTH_REQUIRED",
  INVALID_DESTINATION: "INVALID_DESTINATION",
  GOOGLE_RECONNECT_REQUIRED: "GOOGLE_RECONNECT_REQUIRED",
  GOOGLE_SCOPE_REQUIRED: "GOOGLE_SCOPE_REQUIRED",
  GOOGLE_QUOTA_EXHAUSTED: "GOOGLE_QUOTA_EXHAUSTED",
  GOOGLE_RATE_LIMITED: "GOOGLE_RATE_LIMITED",
  GOOGLE_UPSTREAM_UNAVAILABLE: "GOOGLE_UPSTREAM_UNAVAILABLE",
  GOOGLE_PROXY_TIMEOUT: "GOOGLE_PROXY_TIMEOUT",
});

class GoogleProxyFailure extends Error {
  constructor(code, message, options = {}) {
    super(message);
    this.name = "GoogleProxyFailure";
    this.code = code;
    this.status = Number(options.status || 500);
    this.retryable = Boolean(options.retryable);
    this.reconnectRequired = Boolean(options.reconnectRequired);
    this.upstreamStatus = options.upstreamStatus;
  }
}

const googleProxyErrorBody = (failure, requestId) => ({
  error: {
    code: failure.code,
    message: failure.message,
    retryable: failure.retryable,
    reconnectRequired: failure.reconnectRequired,
    ...(Number.isFinite(failure.upstreamStatus) ? { upstreamStatus: failure.upstreamStatus } : {}),
    requestId,
  },
});

const isTimeoutError = (error) => error?.name === "TimeoutError" || error?.name === "AbortError";

const googleErrorReason = (payload) => String(
  payload?.error?.errors?.[0]?.reason || payload?.error?.status || payload?.error?.reason || "",
).toLowerCase();

export const classifyGoogleProxyResponse = (status, payload = {}) => {
  const reason = googleErrorReason(payload);
  const message = String(payload?.error?.message || payload?.error_description || "Google API request failed.");
  if (status === 401) {
    return new GoogleProxyFailure(GOOGLE_PROXY_ERROR_CODES.GOOGLE_RECONNECT_REQUIRED, "Google authorization expired; reconnect required.", {
      status: 409, reconnectRequired: true, upstreamStatus: status,
    });
  }
  if (status === 429 || reason.includes("ratelimit") || reason.includes("userratelimit")) {
    return new GoogleProxyFailure(GOOGLE_PROXY_ERROR_CODES.GOOGLE_RATE_LIMITED, message, {
      status: 429, retryable: true, upstreamStatus: status,
    });
  }
  if (reason.includes("quota") || reason.includes("dailylimit")) {
    return new GoogleProxyFailure(GOOGLE_PROXY_ERROR_CODES.GOOGLE_QUOTA_EXHAUSTED, message, {
      status: 403, upstreamStatus: status,
    });
  }
  if (status === 403) {
    return new GoogleProxyFailure(GOOGLE_PROXY_ERROR_CODES.GOOGLE_SCOPE_REQUIRED, message, {
      status: 403, upstreamStatus: status,
    });
  }
  if (status >= 500) {
    return new GoogleProxyFailure(GOOGLE_PROXY_ERROR_CODES.GOOGLE_UPSTREAM_UNAVAILABLE, message, {
      status: 503, retryable: true, upstreamStatus: status,
    });
  }
  return new GoogleProxyFailure(GOOGLE_PROXY_ERROR_CODES.GOOGLE_UPSTREAM_UNAVAILABLE, message, {
    status, upstreamStatus: status,
  });
};
const contentOwnerDiscoveryEnabled = () => process.env.YOUTUBE_CONTENT_OWNER_DISCOVERY_ENABLED === "true";
export const GOOGLE_SCOPES = [
  "openid",
  "profile",
  "email",
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/youtube.force-ssl",
  "https://www.googleapis.com/auth/youtube.upload",
  "https://www.googleapis.com/auth/yt-analytics.readonly",
  "https://www.googleapis.com/auth/yt-analytics-monetary.readonly",
  ...(contentOwnerDiscoveryEnabled() ? ["https://www.googleapis.com/auth/youtubepartner"] : []),
];
// Compatibility export for external tooling that has not yet moved to GOOGLE_SCOPES.
export const READ_ONLY_SCOPES = GOOGLE_SCOPES;
export const PUBLIC_PLANS = [
  { id: "basic", label: "Basic", priceUsd: 0, trialHours: 0, monthlyCredits: 0 },
  { id: "beta", label: "Beta (BYOK)", priceUsd: 0, trialHours: 0, monthlyCredits: 0 },
  { id: "creator", label: "Creator", priceUsd: 9.99, trialHours: 48, monthlyCredits: 1000 },
  { id: "creator_plus", label: "Creator Plus", priceUsd: 19.99, trialHours: 48, monthlyCredits: 2000 },
  { id: "creator_pro", label: "Creator Pro", priceUsd: 39.99, trialHours: 48, monthlyCredits: 4000 },
  { id: "executive", label: "Executive", priceUsd: 69.99, trialHours: 48, monthlyCredits: null },
];

const cleanOrigin = (value) => String(value || "").replace(/\/$/, "");
const publicOrigin = () => cleanOrigin(process.env.ACCOUNT_PUBLIC_ORIGIN || "http://localhost:5173");
const callbackUrl = () => String(process.env.GOOGLE_OAUTH_REDIRECT_URI || `${publicOrigin()}/api/account/auth/callback`);
const clientId = () => String(process.env.GOOGLE_OAUTH_CLIENT_ID || "").trim();
const clientSecret = () => String(process.env.GOOGLE_OAUTH_CLIENT_SECRET || "").trim();
const base64url = (buffer) => Buffer.from(buffer).toString("base64url");
const randomToken = (bytes = 32) => base64url(crypto.randomBytes(bytes));
const codeChallenge = (verifier) => base64url(crypto.createHash("sha256").update(verifier).digest());

export const sanitizeReturnTo = (input) => {
  const value = String(input || "").trim();
  if (!value.startsWith("/") || value.startsWith("//")) return "/account";
  try {
    const parsed = new URL(value, "https://viewtube.local");
    if (parsed.origin !== "https://viewtube.local") return "/account";
    const allowed = [
      "/", "/account", "/settings", "/subscribe", "/studio", "/performance",
      "/local-analytics", "/vt-sync-local", "/ai-brain", "/editor", "/projects",
      "/data-transparency", "/video-publisher", "/media-analyzer", "/seo-generator",
      "/hook-generator", "/reference-studio", "/user-guide",
    ];
    const permitted = allowed.some((path) => path === "/" ? parsed.pathname === "/" : parsed.pathname === path || parsed.pathname.startsWith(`${path}/`));
    if (!permitted) return "/account";
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch { return "/account"; }
};

const parseCookies = (req) => Object.fromEntries(
  String(req.headers.cookie || "").split(";").map((part) => part.trim()).filter(Boolean).map((part) => {
    const index = part.indexOf("=");
    return index < 0 ? [part, ""] : [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
  }),
);

const normalizeTrustedHostname = (hostname) => String(hostname || "").replace(/^www\./i, "").toLowerCase();
const normalizePort = (url) => url.port || (url.protocol === "https:" ? "443" : url.protocol === "http:" ? "80" : "");

export const isTrustedAccountOrigin = (originValue) => {
  const origin = String(originValue || "").trim();
  if (!origin) return process.env.NODE_ENV !== "production";
  try {
    const requestUrl = new URL(origin);
    const configuredUrl = new URL(publicOrigin());
    return (
      requestUrl.protocol === configuredUrl.protocol &&
      normalizePort(requestUrl) === normalizePort(configuredUrl) &&
      normalizeTrustedHostname(requestUrl.hostname) === normalizeTrustedHostname(configuredUrl.hostname)
    );
  } catch {
    return false;
  }
};

const sessionCookie = (token, expiresAt) => {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax${secure}; Expires=${new Date(expiresAt).toUTCString()}`;
};
const clearSessionCookie = () => `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;

const encryptionKey = () => {
  const configured = String(process.env.ACCOUNT_TOKEN_ENCRYPTION_KEY || "").trim();
  if (process.env.NODE_ENV === "production" && !configured) throw new Error("ACCOUNT_TOKEN_ENCRYPTION_KEY is required in production.");
  if (/^[a-f0-9]{64}$/i.test(configured)) return Buffer.from(configured, "hex");
  if (configured) {
    const decoded = Buffer.from(configured, "base64");
    if (decoded.length === 32) return decoded;
  }
  return crypto.createHash("sha256").update(configured || "viewtube-development-token-key").digest();
};

export const encryptToken = (value) => {
  if (!value) return null;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(String(value), "utf8"), cipher.final()]);
  return `${iv.toString("base64url")}.${cipher.getAuthTag().toString("base64url")}.${ciphertext.toString("base64url")}`;
};

export const decryptToken = (value) => {
  if (!value) return null;
  const [iv, tag, ciphertext] = String(value).split(".");
  if (!iv || !tag || !ciphertext) throw new Error("Encrypted token payload is invalid.");
  const decipher = crypto.createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(ciphertext, "base64url")), decipher.final()]).toString("utf8");
};

const oauthConfigured = () => Boolean(clientId() && clientSecret());

const readJsonBody = async (req, readBody) => {
  const raw = await readBody(req, 64 * 1024);
  if (raw.length > 64 * 1024) throw new Error("Request body is too large.");
  try { return JSON.parse(raw.toString("utf8") || "{}"); }
  catch { throw new Error("Invalid JSON body."); }
};

// Vercel serverless requests cap below 4.5MB. Keep room for proxy overhead.
const MAX_UPLOAD_CHUNK_BYTES = 3 * 1024 * 1024;
const MAX_THUMBNAIL_BYTES = 2 * 1024 * 1024;
const UPLOAD_SESSION_TTL_MS = 60 * 60 * 1000;
const youtubeId = (value) => /^[A-Za-z0-9_-]{6,128}$/.test(String(value || ""));
const plainText = (value, max) => String(value || "").trim().slice(0, max);

const googleError = async (response, fallback) => {
  const body = await response.text();
  try { return JSON.parse(body || "{}"); }
  catch { return { error: fallback, detail: body.slice(0, 500) }; }
};

export const sendGoogleJson = async (json, res, response, fallback) => {
  const payload = await googleError(response, fallback);
  return json(res, response.status, payload);
};

const requireGoogleScope = async (req, res, scope) => {
  const userId = await sessionUserId(req);
  if (!userId) {
    json(res, 401, { error: "Authentication required." });
    return null;
  }
  const credential = await getGoogleCredentialRecord(userId);
  if (!credential || credential.connectionStatus === "revoked" || !credential.scopes?.includes(scope)) {
    json(res, 403, { error: "Reconnect your YouTube channel to grant this capability." });
    return null;
  }
  return userId;
};

export const isAllowedYouTubeUploadUrl = (value) => {
  try {
    const url = new URL(String(value || ""));
    return url.protocol === "https:" && url.hostname === "www.googleapis.com" &&
      url.pathname.startsWith("/upload/youtube/v3/videos");
  } catch { return false; }
};

const decodeUploadSession = (sessionId, userId) => {
  const raw = decryptToken(sessionId);
  const session = JSON.parse(raw || "{}");
  if (session.userId !== userId || !Number.isFinite(session.expiresAt) || session.expiresAt <= Date.now() ||
      !Number.isFinite(session.contentLength) || session.contentLength <= 0 || !isAllowedYouTubeUploadUrl(session.uploadUrl)) {
    throw new Error("Upload session is invalid or expired.");
  }
  return session;
};

const sessionUserId = async (req) => getSessionUserId(parseCookies(req)[SESSION_COOKIE] || "");
const hasTrustedOrigin = (req) => {
  return isTrustedAccountOrigin(req.headers.origin);
};

export const resolveGoogleNextIntent = ({ googleStatus, monetaryScopeGranted }) => {
  if (googleStatus === "revoked" || googleStatus === "expired") return "reconnect_channel";
  if (googleStatus === "connected" && !monetaryScopeGranted) return "reconnect_channel";
  return googleStatus === "connected" ? "manage_account" : "connect_channel";
};

const buildSnapshot = async (userId) => {
  if (!userId) {
    return {
      viewtubeUserId: null,
      profile: { email: null, displayName: null },
      authentication: { status: "anonymous", accountExists: null },
      google: { status: "disconnected", youtubeScopesGranted: false, channelId: null, channelTitle: null, channelHandle: null, channelThumbnail: null, contentOwners: [], activeContentOwnerId: null, contentOwnerSelectionRequired: false },
      onboarding: { status: "not_started", nextStep: null },
      billing: { status: "inactive", planId: null },
      ai: { planId: null, availableCredits: 0 },
      grantedCapabilities: [],
      nextIntent: "sign_up",
      error: null,
    };
  }
  const record = await getAccountSnapshotData(userId);
  if (!record) return buildSnapshot(null);
  const scopes = new Set(record.scopes || []);
  const youtubeScopesGranted = scopes.has("https://www.googleapis.com/auth/youtube.readonly") &&
    scopes.has("https://www.googleapis.com/auth/yt-analytics.readonly");
  const expired = youtubeScopesGranted && record.tokenExpiresAt &&
    Date.parse(record.tokenExpiresAt) <= Date.now() && !record.hasRefreshToken;
  const googleStatus = record.connectionStatus === "revoked" ? "revoked"
    : record.connectionStatus === "expired" || expired ? "expired"
      : youtubeScopesGranted && record.channelId ? "connected" : "disconnected";
  const monetaryScopeGranted = scopes.has("https://www.googleapis.com/auth/yt-analytics-monetary.readonly");
  const nextIntent = resolveGoogleNextIntent({ googleStatus, monetaryScopeGranted });
  const grantedCapabilities = [];
  if (scopes.has("https://www.googleapis.com/auth/youtube.readonly")) grantedCapabilities.push("youtube_read");
  if (scopes.has("https://www.googleapis.com/auth/yt-analytics.readonly")) grantedCapabilities.push("youtube_analytics_read");
  if (monetaryScopeGranted) grantedCapabilities.push("youtube_monetary_read");
  if (scopes.has("https://www.googleapis.com/auth/youtube.upload")) grantedCapabilities.push("youtube_upload");
  if (scopes.has("https://www.googleapis.com/auth/youtube.force-ssl")) grantedCapabilities.push("youtube_comments");
  if (contentOwnerDiscoveryEnabled() && googleStatus === "connected" && record.activeContentOwnerId && (record.contentOwners || []).some((owner) => owner.id === record.activeContentOwnerId)) grantedCapabilities.push("youtube_content_owner");
  if (scopes.has("https://www.googleapis.com/auth/webmasters.readonly")) grantedCapabilities.push("search_console_read");
  return {
    viewtubeUserId: userId,
    profile: { email: record.email || null, displayName: record.displayName || null },
    authentication: { status: "authenticated", accountExists: true },
    google: {
      status: googleStatus,
      youtubeScopesGranted,
      channelId: record.channelId || null,
      channelTitle: record.channelTitle || null,
      channelHandle: record.channelHandle || null,
      channelThumbnail: record.channelThumbnail || null,
      contentOwners: contentOwnerDiscoveryEnabled() ? record.contentOwners || [] : [],
      activeContentOwnerId: contentOwnerDiscoveryEnabled() ? record.activeContentOwnerId || null : null,
      contentOwnerSelectionRequired: contentOwnerDiscoveryEnabled() && (record.contentOwners || []).length > 1 && !record.activeContentOwnerId,
    },
    onboarding: { status: record.onboarding?.status || "not_started", nextStep: record.onboarding?.nextStep || null },
    billing: { status: record.subscription?.status || "inactive", planId: record.subscription?.planId || null },
    ai: { planId: record.subscription?.planId || null, availableCredits: Math.max(0, Number(record.availableCredits || 0)) },
    grantedCapabilities,
    nextIntent,
    error: null,
  };
};

const fetchTokenInfo = async (idToken) => {
  const response = await fetch(`${GOOGLE_TOKEN_INFO_URL}?id_token=${encodeURIComponent(idToken)}`, { signal: AbortSignal.timeout(10_000) });
  const payload = await response.json();
  if (!response.ok) throw new Error("Google identity token validation failed.");
  if (payload.aud !== clientId()) throw new Error("Google identity token audience mismatch.");
  if (!new Set(["accounts.google.com", "https://accounts.google.com"]).has(payload.iss)) throw new Error("Google identity token issuer mismatch.");
  if (Number(payload.exp || 0) * 1000 <= Date.now()) throw new Error("Google identity token expired.");
  if (!payload.sub || !payload.email || String(payload.email_verified) !== "true") {
    throw new Error("Google identity email is not verified.");
  }
  return payload;
};

const discoverContentOwners = async (accessToken, scopes) => {
  if (!contentOwnerDiscoveryEnabled() || !scopes.includes("https://www.googleapis.com/auth/youtubepartner")) return [];
  const response = await fetch("https://www.googleapis.com/youtube/partner/v1/contentOwners?fetchMine=true", {
    headers: { Authorization: `Bearer ${accessToken}` }, signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) return [];
  const payload = await response.json();
  return (payload.items || []).map((owner) => ({
    id: String(owner.id || ""),
    displayName: String(owner.displayName || owner.id || "Content Owner"),
  })).filter((owner) => owner.id);
};

const exchangeCode = async (code, verifier) => {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, client_id: clientId(), client_secret: clientSecret(),
      redirect_uri: callbackUrl(), grant_type: "authorization_code", code_verifier: verifier }),
    signal: AbortSignal.timeout(15_000),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error_description || "Google authorization code exchange failed.");
  return payload;
};

const getServerGoogleAccessToken = async (userId) => {
  const existingRefresh = tokenRefreshes.get(userId);
  if (existingRefresh) return existingRefresh;
  const task = (async () => {
    const credential = await getGoogleCredentialRecord(userId);
    if (!credential || credential.connectionStatus === "expired" || credential.connectionStatus === "revoked") {
      throw new GoogleProxyFailure(
        GOOGLE_PROXY_ERROR_CODES.GOOGLE_RECONNECT_REQUIRED,
        "Google authorization expired; reconnect required.",
        { status: 409, reconnectRequired: true },
      );
    }
    const expiresAt = Date.parse(credential.tokenExpiresAt || "");
    if (credential.accessTokenCiphertext && Number.isFinite(expiresAt) && expiresAt > Date.now() + 60_000) {
      return decryptToken(credential.accessTokenCiphertext);
    }
    const refreshToken = decryptToken(credential.refreshTokenCiphertext);
    if (!refreshToken) {
      await markGoogleConnectionExpired(userId);
      throw new GoogleProxyFailure(
        GOOGLE_PROXY_ERROR_CODES.GOOGLE_RECONNECT_REQUIRED,
        "Google authorization expired; reconnect required.",
        { status: 409, reconnectRequired: true },
      );
    }
    let response;
    try {
      response = await fetch(GOOGLE_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ client_id: clientId(), client_secret: clientSecret(),
          refresh_token: refreshToken, grant_type: "refresh_token" }),
        signal: AbortSignal.timeout(15_000),
      });
    } catch (error) {
      if (isTimeoutError(error)) {
        throw new GoogleProxyFailure(GOOGLE_PROXY_ERROR_CODES.GOOGLE_PROXY_TIMEOUT, "Google token refresh timed out.", {
          status: 504, retryable: true,
        });
      }
      throw error;
    }
    const payload = await response.json();
    if (!response.ok) {
      if (response.status === 400 || response.status === 401) {
        await markGoogleConnectionExpired(userId);
        throw new GoogleProxyFailure(
          GOOGLE_PROXY_ERROR_CODES.GOOGLE_RECONNECT_REQUIRED,
          "Google authorization expired; reconnect required.",
          { status: 409, reconnectRequired: true, upstreamStatus: response.status },
        );
      }
      throw classifyGoogleProxyResponse(response.status, payload);
    }
    await saveGoogleConnection(userId, credential.googleSubject, {
      accessTokenCiphertext: encryptToken(payload.access_token), refreshTokenCiphertext: null,
      tokenExpiresAt: new Date(Date.now() + Number(payload.expires_in || 3600) * 1000).toISOString(),
      scopes: credential.scopes || [], connectionStatus: "connected",
    });
    return payload.access_token;
  })();
  tokenRefreshes.set(userId, task);
  try { return await task; }
  finally { tokenRefreshes.delete(userId); }
};

export const isAllowedGoogleApiUrl = (input) => {
  try {
    const url = new URL(String(input || ""));
    if (url.protocol !== "https:") return false;
    if (url.hostname === "www.googleapis.com") return url.pathname.startsWith("/youtube/v3/");
    // Analytics reports may include a trailing slash depending on the client
    // URL builder. Keep this narrow to the reports endpoint, not a host-wide proxy.
    if (url.hostname === "youtubeanalytics.googleapis.com") return /^\/v2\/reports\/?$/.test(url.pathname);
    return false;
  } catch { return false; }
};

const fetchChannel = async (accessToken, scopes) => {
  if (!scopes.includes("https://www.googleapis.com/auth/youtube.readonly")) return null;
  const response = await fetch("https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&mine=true", {
    headers: { Authorization: `Bearer ${accessToken}` }, signal: AbortSignal.timeout(15_000),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.error?.message || "YouTube channel verification failed.");
  const channel = payload.items?.[0];
  if (!channel) throw new Error("No YouTube channel is available for this Google account.");
  return { channelId: channel.id || null, channelTitle: channel.snippet?.title || null,
    channelHandle: channel.snippet?.customUrl || null,
    channelThumbnail: channel.snippet?.thumbnails?.medium?.url || channel.snippet?.thumbnails?.default?.url || null };
};

const redirectWithError = (res, returnTo, code) => {
  const destination = new URL(sanitizeReturnTo(returnTo), publicOrigin());
  destination.searchParams.set("accountError", code);
  res.writeHead(302, { Location: destination.toString(), "Cache-Control": "no-store" });
  res.end();
};

const popupCompletionHtml = (payload, fallbackUrl) => {
  const serializedPayload = JSON.stringify(payload).replace(/</g, "\\u003c");
  const serializedFallback = JSON.stringify(fallbackUrl).replace(/</g, "\\u003c");
  const serializedOrigin = JSON.stringify(publicOrigin()).replace(/</g, "\\u003c");
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="referrer" content="no-referrer" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>ViewTube Account</title>
    <style>
      :root { color-scheme: light; }
      body { margin: 0; font: 600 14px/1.4 system-ui, sans-serif; background: #fff8d6; color: #111; }
      main { min-height: 100vh; display: grid; place-items: center; padding: 24px; text-align: center; }
      .card { max-width: 420px; border: 4px solid #000; box-shadow: 6px 6px 0 #000; background: #fff; padding: 20px; }
      h1 { margin: 0 0 8px; font-size: 24px; line-height: 1; text-transform: uppercase; }
      p { margin: 0; }
      .hint { margin-top: 12px; font-size: 12px; text-transform: uppercase; }
    </style>
  </head>
  <body>
    <main>
      <div class="card">
        <h1>Account connected</h1>
        <p>Closing popup and returning to ViewTube.</p>
        <p class="hint">If this window stays open, you can close it manually.</p>
      </div>
    </main>
    <script>
      (function () {
        const payload = ${serializedPayload};
        const fallbackUrl = ${serializedFallback};
        const origin = ${serializedOrigin};
        try {
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage(payload, origin);
            window.close();
            return;
          }
        } catch (error) {
          console.warn("[account] popup completion relay failed", error);
        }
        window.location.replace(fallbackUrl);
      })();
    </script>
  </body>
</html>`;
};

export const handleAccountRoute = async ({ req, res, method, pathname, parsedUrl, json, readBody }) => {
  const aliases = new Map([
    ["/api/auth/session", "/api/account/snapshot"],
    ["/api/auth/google/start", "/api/account/auth/start"],
    ["/oauth/google/callback", "/api/account/auth/callback"],
    ["/api/auth/logout", "/api/account/sign-out"],
    ["/api/auth/revoke", "/api/account/revoke"],
    ["/api/account/capabilities", "/api/account/capabilities"],
    ["/api/plans", "/api/plans"],
  ]);
  pathname = aliases.get(pathname) || pathname;
  if (!pathname.startsWith("/api/account") && pathname !== "/api/plans") return false;
  if ((method === "POST" || method === "PUT" || method === "DELETE") && !hasTrustedOrigin(req)) {
    json(res, 403, { error: "Request origin is not allowed." });
    return true;
  }

  if (method === "POST" && pathname === "/api/account/auth/start") {
    if (!oauthConfigured()) {
      json(res, 503, { error: "Google OAuth server credentials are not configured." });
      return true;
    }
    const payload = await readJsonBody(req, readBody);
    const intent = String(payload.intent || "");
    if (!VALID_INTENTS.has(intent)) return json(res, 400, { error: "Invalid account intent." }), true;
    if ((intent === "connect_channel" || intent === "reconnect_channel") && !(await sessionUserId(req))) {
      return json(res, 401, { error: "Sign in before connecting a YouTube channel." }), true;
    }
    const state = randomToken();
    const nonce = randomToken();
    const verifier = randomToken(48);
    const returnTo = sanitizeReturnTo(payload.returnTo);
    await saveOAuthState({ state, codeVerifier: verifier, nonce, intent, returnTo,
      expiresAt: new Date(Date.now() + OAUTH_TTL_MS).toISOString() });
    const scopes = [...GOOGLE_SCOPES];
    const url = new URL(GOOGLE_AUTH_URL);
    url.search = new URLSearchParams({ client_id: clientId(), redirect_uri: callbackUrl(), response_type: "code",
      scope: scopes.join(" "), state, nonce, code_challenge: codeChallenge(verifier), code_challenge_method: "S256",
      access_type: "offline", include_granted_scopes: "true",
      prompt: intent === "connect_channel" || intent === "reconnect_channel" ? "consent" : "select_account" }).toString();
    json(res, 200, { authorizationUrl: url.toString(), intent, returnTo });
    return true;
  }

  if (method === "GET" && pathname === "/api/account/auth/callback") {
    const state = parsedUrl.searchParams.get("state") || "";
    const saved = await consumeOAuthState(state);
    if (!saved) { redirectWithError(res, "/account", "invalid_or_expired_state"); return true; }
    const oauthError = parsedUrl.searchParams.get("error");
    if (oauthError) { redirectWithError(res, saved.returnTo, oauthError); return true; }
    try {
      const token = await exchangeCode(parsedUrl.searchParams.get("code") || "", saved.codeVerifier);
      const identity = await fetchTokenInfo(token.id_token);
      if (!identity.nonce || identity.nonce !== saved.nonce) throw new Error("Google identity token nonce mismatch.");
      let userId = await sessionUserId(req);
      if (userId) {
        const linkedIdentity = await getGoogleCredentialRecord(userId);
        if (linkedIdentity?.googleSubject && linkedIdentity.googleSubject !== identity.sub) {
          throw new Error("The selected Google identity does not match the signed-in ViewTube account.");
        }
      }
      if (!userId) {
        userId = await resolveGoogleAccount({ googleSubject: identity.sub, email: identity.email,
          displayName: identity.name, intent: saved.intent });
      }
      if (!userId) { redirectWithError(res, saved.returnTo, "account_not_found"); return true; }
      const scopes = String(token.scope || "").split(/\s+/).filter(Boolean);
      const channel = await fetchChannel(token.access_token, scopes);
      const contentOwners = await discoverContentOwners(token.access_token, scopes);
      await saveGoogleConnection(userId, identity.sub, {
        accessTokenCiphertext: encryptToken(token.access_token),
        refreshTokenCiphertext: encryptToken(token.refresh_token),
        tokenExpiresAt: new Date(Date.now() + Number(token.expires_in || 3600) * 1000).toISOString(),
        scopes, ...(channel || {}), contentOwners,
        activeContentOwnerId: contentOwners.length === 1 ? contentOwners[0].id : null,
        connectionStatus: channel ? "connected" : "disconnected",
      });
      const session = await createAccountSession(userId);
      const destination = new URL(saved.returnTo, publicOrigin());
      destination.searchParams.set("account", channel ? "connected" : "authenticated");
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Set-Cookie": sessionCookie(session.token, session.expiresAt),
        "Cache-Control": "no-store",
      });
      res.end(popupCompletionHtml({
        type: "VT_UNIFIED_ACCOUNT_AUTH_SUCCESS",
        returnTo: destination.toString(),
        accountStatus: channel ? "connected" : "authenticated",
      }, destination.toString()));
    } catch (error) {
      console.error("[account] OAuth callback failed:", error instanceof Error ? error.message : String(error));
      redirectWithError(res, saved.returnTo, "authorization_failed");
    }
    return true;
  }

  if (method === "GET" && pathname === "/api/account/snapshot") {
    return json(res, 200, await buildSnapshot(await sessionUserId(req))), true;
  }

  if (method === "GET" && pathname === "/api/account/capabilities") {
    const snapshot = await buildSnapshot(await sessionUserId(req));
    return json(res, 200, { grantedCapabilities: snapshot.grantedCapabilities || [] }), true;
  }

  if (method === "PUT" && pathname === "/api/account/content-owner") {
    if (!contentOwnerDiscoveryEnabled()) return json(res, 404, { error: "Content Owner discovery is not enabled." }), true;
    if (!isTrustedAccountOrigin(req.headers.origin || req.headers.referer || "")) {
      return json(res, 403, { error: "Untrusted request origin." }), true;
    }
    const userId = await sessionUserId(req);
    if (!userId) return json(res, 401, { error: "ViewTube sign-in required." }), true;
    const payload = await readJsonBody(req, readBody);
    const ownerId = plainText(payload.ownerId, 128);
    const selected = await selectGoogleContentOwner(userId, ownerId);
    if (!selected) return json(res, 400, { error: "Choose a Content Owner available to this Google account." }), true;
    return json(res, 200, { activeContentOwnerId: selected }), true;
  }

  if (method === "GET" && pathname === "/api/plans") {
    return json(res, 200, { plans: PUBLIC_PLANS }), true;
  }

  if (method === "POST" && pathname === "/api/account/youtube/comment-replies") {
    const userId = await requireGoogleScope(req, res, "https://www.googleapis.com/auth/youtube.force-ssl");
    if (!userId) return true;
    const payload = await readJsonBody(req, readBody);
    const parentId = plainText(payload.parentId, 128);
    const text = plainText(payload.text, 10_000);
    if (!youtubeId(parentId) || !text) return json(res, 400, { error: "A valid comment and reply text are required." }), true;
    const accessToken = await getServerGoogleAccessToken(userId);
    const response = await fetch("https://www.googleapis.com/youtube/v3/comments?part=snippet", {
      method: "POST", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ snippet: { parentId, textOriginal: text } }), signal: AbortSignal.timeout(30_000),
    });
    await sendGoogleJson(json, res, response, "Failed to post comment reply.");
    return true;
  }

  if (method === "POST" && pathname === "/api/account/youtube/comment-threads") {
    const userId = await requireGoogleScope(req, res, "https://www.googleapis.com/auth/youtube.force-ssl");
    if (!userId) return true;
    const payload = await readJsonBody(req, readBody);
    const videoId = plainText(payload.videoId, 128);
    const text = plainText(payload.text, 10_000);
    if (!youtubeId(videoId) || !text) return json(res, 400, { error: "A valid video and comment text are required." }), true;
    const accessToken = await getServerGoogleAccessToken(userId);
    const response = await fetch("https://www.googleapis.com/youtube/v3/commentThreads?part=snippet", {
      method: "POST", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ snippet: { videoId, topLevelComment: { snippet: { textOriginal: text } } } }), signal: AbortSignal.timeout(30_000),
    });
    await sendGoogleJson(json, res, response, "Failed to post comment.");
    return true;
  }

  const commentMatch = pathname.match(/^\/api\/account\/youtube\/comments\/([A-Za-z0-9_-]{6,128})$/);
  if (method === "PUT" && commentMatch) {
    const userId = await requireGoogleScope(req, res, "https://www.googleapis.com/auth/youtube.force-ssl");
    if (!userId) return true;
    const payload = await readJsonBody(req, readBody);
    const text = plainText(payload.text, 10_000);
    if (!text) return json(res, 400, { error: "Comment text is required." }), true;
    const accessToken = await getServerGoogleAccessToken(userId);
    const response = await fetch("https://www.googleapis.com/youtube/v3/comments?part=snippet", {
      method: "PUT", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ id: commentMatch[1], snippet: { textOriginal: text } }), signal: AbortSignal.timeout(30_000),
    });
    await sendGoogleJson(json, res, response, "Failed to update comment.");
    return true;
  }

  if (method === "POST" && pathname === "/api/account/youtube/playlist-items") {
    const userId = await requireGoogleScope(req, res, "https://www.googleapis.com/auth/youtube.force-ssl");
    if (!userId) return true;
    const payload = await readJsonBody(req, readBody);
    const playlistId = plainText(payload.playlistId, 128);
    const videoId = plainText(payload.videoId, 128);
    if (!youtubeId(playlistId) || !youtubeId(videoId)) return json(res, 400, { error: "Valid playlist and video IDs are required." }), true;
    const accessToken = await getServerGoogleAccessToken(userId);
    const response = await fetch("https://www.googleapis.com/youtube/v3/playlistItems?part=snippet", {
      method: "POST", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ snippet: { playlistId, resourceId: { kind: "youtube#video", videoId } } }), signal: AbortSignal.timeout(30_000),
    });
    await sendGoogleJson(json, res, response, "Failed to add video to playlist.");
    return true;
  }

  const playlistItemMatch = pathname.match(/^\/api\/account\/youtube\/playlist-items\/([A-Za-z0-9_-]{6,128})$/);
  if (method === "DELETE" && playlistItemMatch) {
    const userId = await requireGoogleScope(req, res, "https://www.googleapis.com/auth/youtube.force-ssl");
    if (!userId) return true;
    const accessToken = await getServerGoogleAccessToken(userId);
    const response = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?id=${encodeURIComponent(playlistItemMatch[1])}`, {
      method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` }, signal: AbortSignal.timeout(30_000),
    });
    if (response.status === 204) return json(res, 200, { success: true }), true;
    await sendGoogleJson(json, res, response, "Failed to remove video from playlist.");
    return true;
  }

  const videoMatch = pathname.match(/^\/api\/account\/youtube\/videos\/([A-Za-z0-9_-]{6,128})$/);
  if (method === "PUT" && videoMatch) {
    const userId = await requireGoogleScope(req, res, "https://www.googleapis.com/auth/youtube.force-ssl");
    if (!userId) return true;
    const payload = await readJsonBody(req, readBody);
    const title = plainText(payload.title, 100);
    if (!title) return json(res, 400, { error: "Video title is required." }), true;
    const privacyStatus = ["public", "private", "unlisted"].includes(payload.privacyStatus) ? payload.privacyStatus : "private";
    const tags = Array.isArray(payload.tags) ? payload.tags.map((tag) => plainText(tag, 100)).filter(Boolean).slice(0, 500) : [];
    const accessToken = await getServerGoogleAccessToken(userId);
    const response = await fetch("https://www.googleapis.com/youtube/v3/videos?part=snippet,status", {
      method: "PUT", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ id: videoMatch[1], snippet: { title, description: plainText(payload.description, 5_000), tags, categoryId: plainText(payload.categoryId, 8) || "22" }, status: { privacyStatus } }),
      signal: AbortSignal.timeout(30_000),
    });
    await sendGoogleJson(json, res, response, "Failed to update video.");
    return true;
  }

  const thumbnailMatch = pathname.match(/^\/api\/account\/youtube\/thumbnails\/([A-Za-z0-9_-]{6,128})$/);
  if (method === "POST" && thumbnailMatch) {
    const userId = await requireGoogleScope(req, res, "https://www.googleapis.com/auth/youtube.force-ssl");
    if (!userId) return true;
    const contentType = String(req.headers["content-type"] || "").toLowerCase();
    if (!/^image\/(jpeg|png|webp)$/.test(contentType)) return json(res, 400, { error: "Thumbnail must be JPEG, PNG, or WebP." }), true;
    const body = await readBody(req, MAX_THUMBNAIL_BYTES);
    if (!body.length || body.length > MAX_THUMBNAIL_BYTES) return json(res, 413, { error: "Thumbnail exceeds 2MB limit." }), true;
    const accessToken = await getServerGoogleAccessToken(userId);
    const response = await fetch(`https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=${encodeURIComponent(thumbnailMatch[1])}`, {
      method: "POST", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": contentType }, body, signal: AbortSignal.timeout(60_000),
    });
    await sendGoogleJson(json, res, response, "Failed to update thumbnail.");
    return true;
  }

  if (method === "POST" && pathname === "/api/account/youtube/uploads") {
    const userId = await requireGoogleScope(req, res, "https://www.googleapis.com/auth/youtube.upload");
    if (!userId) return true;
    const payload = await readJsonBody(req, readBody);
    const contentLength = Number(payload.contentLength);
    const contentType = plainText(payload.contentType, 120) || "video/*";
    if (!Number.isSafeInteger(contentLength) || contentLength <= 0 || contentLength > 20 * 1024 * 1024 * 1024 || !/^video\//.test(contentType)) {
      return json(res, 400, { error: "A valid video file is required." }), true;
    }
    const metadata = payload.metadata || {};
    const title = plainText(metadata.title, 100);
    if (!title) return json(res, 400, { error: "Video title is required." }), true;
    const accessToken = await getServerGoogleAccessToken(userId);
    const response = await fetch("https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status", {
      method: "POST", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json", "X-Upload-Content-Length": String(contentLength), "X-Upload-Content-Type": contentType },
      body: JSON.stringify({ snippet: { title, description: plainText(metadata.description, 5_000), tags: Array.isArray(metadata.tags) ? metadata.tags.map((tag) => plainText(tag, 100)).filter(Boolean).slice(0, 500) : [], categoryId: plainText(metadata.categoryId, 8) || "22" }, status: { privacyStatus: ["public", "private", "unlisted"].includes(metadata.privacyStatus) ? metadata.privacyStatus : "private" } }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) { await sendGoogleJson(json, res, response, "Failed to create upload session."); return true; }
    const uploadUrl = response.headers.get("location");
    if (!isAllowedYouTubeUploadUrl(uploadUrl)) return json(res, 502, { error: "YouTube returned an invalid upload session." }), true;
    const sessionId = encryptToken(JSON.stringify({ userId, uploadUrl, contentLength, contentType, expiresAt: Date.now() + UPLOAD_SESSION_TTL_MS }));
    return json(res, 201, { sessionId, chunkSize: MAX_UPLOAD_CHUNK_BYTES }), true;
  }

  const uploadMatch = pathname.match(/^\/api\/account\/youtube\/uploads\/([^/]+)$/);
  if (method === "PUT" && uploadMatch) {
    const userId = await requireGoogleScope(req, res, "https://www.googleapis.com/auth/youtube.upload");
    if (!userId) return true;
    let session;
    try { session = decodeUploadSession(decodeURIComponent(uploadMatch[1]), userId); }
    catch { return json(res, 400, { error: "Upload session is invalid or expired." }), true; }
    const contentRange = String(req.headers["content-range"] || "");
    const range = contentRange.match(/^bytes (\d+)-(\d+)\/(\d+)$/);
    if (!range || Number(range[3]) !== session.contentLength || Number(range[2]) < Number(range[1])) return json(res, 400, { error: "Upload range is invalid." }), true;
    const body = await readBody(req, MAX_UPLOAD_CHUNK_BYTES);
    if (!body.length || body.length > MAX_UPLOAD_CHUNK_BYTES || body.length !== Number(range[2]) - Number(range[1]) + 1) return json(res, 413, { error: "Upload chunk is invalid." }), true;
    const accessToken = await getServerGoogleAccessToken(userId);
    const response = await fetch(session.uploadUrl, { method: "PUT", redirect: "manual", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": session.contentType, "Content-Range": contentRange, "Content-Length": String(body.length) }, body, signal: AbortSignal.timeout(120_000) });
    if (response.status === 308) return json(res, 200, { complete: false, range: response.headers.get("range") || null }), true;
    if (!response.ok) { await sendGoogleJson(json, res, response, "Video upload failed."); return true; }
    return json(res, 200, { complete: true, video: await googleError(response, "Video upload failed.") }), true;
  }

  if (method === "POST" && pathname === "/api/account/google-proxy") {
    const requestId = crypto.randomUUID();
    const userId = await sessionUserId(req);
    if (!userId) {
      const failure = new GoogleProxyFailure(GOOGLE_PROXY_ERROR_CODES.AUTH_REQUIRED, "Authentication required.", { status: 401 });
      return json(res, failure.status, googleProxyErrorBody(failure, requestId)), true;
    }
    const payload = await readJsonBody(req, readBody);
    if (!isAllowedGoogleApiUrl(payload.url)) {
      const failure = new GoogleProxyFailure(GOOGLE_PROXY_ERROR_CODES.INVALID_DESTINATION, "Google API destination is not allowed.", { status: 400 });
      return json(res, failure.status, googleProxyErrorBody(failure, requestId)), true;
    }
    let response;
    try {
      const accessToken = await getServerGoogleAccessToken(userId);
      response = await fetch(payload.url, { headers: { Authorization: `Bearer ${accessToken}` }, signal: AbortSignal.timeout(30_000) });
    } catch (error) {
      const failure = error instanceof GoogleProxyFailure
        ? error
        : isTimeoutError(error)
          ? new GoogleProxyFailure(GOOGLE_PROXY_ERROR_CODES.GOOGLE_PROXY_TIMEOUT, "Google API request timed out.", { status: 504, retryable: true })
          : new GoogleProxyFailure(GOOGLE_PROXY_ERROR_CODES.GOOGLE_UPSTREAM_UNAVAILABLE, "Google API request failed.", { status: 503, retryable: true });
      return json(res, failure.status, googleProxyErrorBody(failure, requestId)), true;
    }
    const body = await response.text();
    if (!response.ok) {
      let upstreamPayload = {};
      try { upstreamPayload = JSON.parse(body || "{}"); }
      catch { upstreamPayload = { error: { message: body.slice(0, 500) } }; }
      const failure = classifyGoogleProxyResponse(response.status, upstreamPayload);
      if (failure.reconnectRequired) await markGoogleConnectionExpired(userId);
      if (response.headers.get("retry-after")) res.setHeader("Retry-After", response.headers.get("retry-after"));
      return json(res, failure.status, googleProxyErrorBody(failure, requestId)), true;
    }
    res.writeHead(response.status, {
      "Content-Type": response.headers.get("content-type") || "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": process.env.BILLING_ORIGIN || "http://localhost:5173",
      "Access-Control-Allow-Credentials": "true", "Cache-Control": "no-store", "X-ViewTube-Request-Id": requestId,
    });
    res.end(body);
    return true;
  }

  if (method === "POST" && pathname === "/api/account/sign-out") {
    await revokeAccountSession(parseCookies(req)[SESSION_COOKIE] || "");
    res.setHeader("Set-Cookie", clearSessionCookie());
    return json(res, 200, { ok: true }), true;
  }

  if (method === "POST" && pathname === "/api/account/revoke") {
    const userId = await sessionUserId(req);
    if (!userId) return json(res, 401, { error: "Authentication required." }), true;
    const credential = await getGoogleCredentialRecord(userId);
    const token = decryptToken(credential?.refreshTokenCiphertext || credential?.accessTokenCiphertext);
    if (token) await fetch(GOOGLE_REVOKE_URL, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ token }), signal: AbortSignal.timeout(10_000) }).catch(() => undefined);
    await markGoogleConnectionRevoked(userId);
    return json(res, 200, await buildSnapshot(userId)), true;
  }

  if (method === "DELETE" && pathname === "/api/account") {
    const userId = await sessionUserId(req);
    if (!userId) return json(res, 401, { error: "Authentication required." }), true;
    const credential = await getGoogleCredentialRecord(userId);
    const token = decryptToken(credential?.refreshTokenCiphertext || credential?.accessTokenCiphertext);
    if (token) await fetch(GOOGLE_REVOKE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ token }),
      signal: AbortSignal.timeout(10_000),
    }).catch(() => undefined);
    const result = await deleteAccountRecord(userId);
    if (!result.deleted && result.reason === "active_billing") {
      return json(res, 409, { error: "Cancel the active subscription in the billing portal before deleting this account." }), true;
    }
    if (!result.deleted) return json(res, 404, { error: "Account was not found." }), true;
    res.setHeader("Set-Cookie", clearSessionCookie());
    return json(res, 200, { deleted: true }), true;
  }

  if (method === "PUT" && pathname === "/api/account/onboarding") {
    const userId = await sessionUserId(req);
    if (!userId) return json(res, 401, { error: "Authentication required." }), true;
    const payload = await readJsonBody(req, readBody);
    if (!VALID_ONBOARDING_STATUS.has(payload.status)) return json(res, 400, { error: "Invalid onboarding status." }), true;
    const nextStep = payload.nextStep === null ? null : String(payload.nextStep || "").slice(0, 120) || null;
    await updateOnboarding(userId, { status: payload.status, nextStep, context: payload.context || null });
    return json(res, 200, await buildSnapshot(userId)), true;
  }

  if (method === "PUT" && pathname === "/api/account/plan") {
    const userId = await sessionUserId(req);
    if (!userId) return json(res, 401, { error: "Authentication required." }), true;
    const payload = await readJsonBody(req, readBody);
    const planId = String(payload.planId || "");
    if (!FREE_PLAN_IDS.has(planId)) return json(res, 400, { error: "Paid plans require Stripe Checkout." }), true;
    await setServerSubscription(userId, { status: "active", planId });
    return json(res, 200, await buildSnapshot(userId)), true;
  }

  if (method === "POST" && pathname === "/api/account/ai-credits/consume") {
    const userId = await sessionUserId(req);
    if (!userId) return json(res, 401, { error: "Authentication required." }), true;
    const payload = await readJsonBody(req, readBody);
    const credits = Math.trunc(Number(payload.credits));
    if (!Number.isFinite(credits) || credits <= 0) return json(res, 400, { error: "credits must be a positive integer." }), true;
    const result = await consumeAiCredits(userId, {
      credits,
      idempotencyKey: payload.idempotencyKey,
      metadata: payload.metadata || {},
    });
    if (!result.allowed) return json(res, 409, { error: "Insufficient AI credits.", ...result }), true;
    return json(res, 200, { ...result, snapshot: await buildSnapshot(userId) }), true;
  }

  json(res, 404, { error: `Not found: ${method} ${pathname}` });
  return true;
};

export const getAuthenticatedViewtubeUserId = sessionUserId;
