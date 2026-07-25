import crypto from "node:crypto";
import {
  consumeOAuthState,
  consumeAiCredits,
  createAccountSession,
  deleteAccountRecord,
  getAccountSnapshotData,
  getGoogleCredentialRecord,
  getSessionUserId,
  markGoogleConnectionRevoked,
  resolveGoogleAccount,
  revokeAccountSession,
  saveGoogleConnection,
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
export const READ_ONLY_SCOPES = [
  "openid",
  "profile",
  "email",
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/yt-analytics.readonly",
];
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
  const raw = await readBody(req);
  if (raw.length > 64 * 1024) throw new Error("Request body is too large.");
  try { return JSON.parse(raw.toString("utf8") || "{}"); }
  catch { throw new Error("Invalid JSON body."); }
};

const sessionUserId = async (req) => getSessionUserId(parseCookies(req)[SESSION_COOKIE] || "");
const hasTrustedOrigin = (req) => {
  return isTrustedAccountOrigin(req.headers.origin);
};

const buildSnapshot = async (userId) => {
  if (!userId) {
    return {
      viewtubeUserId: null,
      profile: { email: null, displayName: null },
      authentication: { status: "anonymous", accountExists: null },
      google: { status: "disconnected", youtubeScopesGranted: false, channelId: null },
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
    : expired ? "expired"
      : youtubeScopesGranted && record.channelId ? "connected" : "disconnected";
  const nextIntent = googleStatus === "revoked" || googleStatus === "expired" ? "reconnect_channel"
    : googleStatus === "connected" ? "manage_account" : "connect_channel";
  const grantedCapabilities = [];
  if (scopes.has("https://www.googleapis.com/auth/youtube.readonly")) grantedCapabilities.push("youtube_read");
  if (scopes.has("https://www.googleapis.com/auth/yt-analytics.readonly")) grantedCapabilities.push("youtube_analytics_read");
  if (scopes.has("https://www.googleapis.com/auth/yt-analytics-monetary.readonly")) grantedCapabilities.push("youtube_monetary_read");
  if (scopes.has("https://www.googleapis.com/auth/youtube.upload")) grantedCapabilities.push("youtube_upload");
  if (scopes.has("https://www.googleapis.com/auth/youtube.force-ssl")) grantedCapabilities.push("youtube_comments");
  if (scopes.has("https://www.googleapis.com/auth/webmasters.readonly")) grantedCapabilities.push("search_console_read");
  return {
    viewtubeUserId: userId,
    profile: { email: record.email || null, displayName: record.displayName || null },
    authentication: { status: "authenticated", accountExists: true },
    google: { status: googleStatus, youtubeScopesGranted, channelId: record.channelId || null },
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
    if (!credential) throw new Error("Google connection is not available.");
    const expiresAt = Date.parse(credential.tokenExpiresAt || "");
    if (credential.accessTokenCiphertext && Number.isFinite(expiresAt) && expiresAt > Date.now() + 60_000) {
      return decryptToken(credential.accessTokenCiphertext);
    }
    const refreshToken = decryptToken(credential.refreshTokenCiphertext);
    if (!refreshToken) throw new Error("Google authorization expired; reconnect required.");
    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ client_id: clientId(), client_secret: clientSecret(),
        refresh_token: refreshToken, grant_type: "refresh_token" }),
      signal: AbortSignal.timeout(15_000),
    });
    const payload = await response.json();
    if (!response.ok) {
      await markGoogleConnectionRevoked(userId);
      throw new Error("Google authorization expired; reconnect required.");
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
    if (url.hostname === "youtubeanalytics.googleapis.com") return url.pathname === "/v2/reports";
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
    const scopes = [...READ_ONLY_SCOPES];
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
      await saveGoogleConnection(userId, identity.sub, {
        accessTokenCiphertext: encryptToken(token.access_token),
        refreshTokenCiphertext: encryptToken(token.refresh_token),
        tokenExpiresAt: new Date(Date.now() + Number(token.expires_in || 3600) * 1000).toISOString(),
        scopes, ...(channel || {}), connectionStatus: channel ? "connected" : "disconnected",
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

  if (method === "GET" && pathname === "/api/plans") {
    return json(res, 200, { plans: PUBLIC_PLANS }), true;
  }

  if (method === "POST" && pathname === "/api/account/google-proxy") {
    const userId = await sessionUserId(req);
    if (!userId) return json(res, 401, { error: "Authentication required." }), true;
    const payload = await readJsonBody(req, readBody);
    if (!isAllowedGoogleApiUrl(payload.url)) return json(res, 400, { error: "Google API destination is not allowed." }), true;
    const accessToken = await getServerGoogleAccessToken(userId);
    const response = await fetch(payload.url, { headers: { Authorization: `Bearer ${accessToken}` }, signal: AbortSignal.timeout(30_000) });
    const body = await response.text();
    res.writeHead(response.status, {
      "Content-Type": response.headers.get("content-type") || "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": process.env.BILLING_ORIGIN || "http://localhost:5173",
      "Access-Control-Allow-Credentials": "true", "Cache-Control": "no-store",
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
