import crypto from "node:crypto";
import {
  consumeOAuthState,
  createAccountSession,
  getAccountSnapshotData,
  getGoogleCredentialRecord,
  getSessionUserId,
  resolveGoogleAccount,
  revokeAccountSession,
  saveGoogleConnection,
  saveOAuthState,
} from "./account-store.mjs";

const SESSION_COOKIE = "vt_session";
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_TOKEN_INFO_URL = "https://oauth2.googleapis.com/tokeninfo";
const OAUTH_TTL_MS = 10 * 60 * 1000;

export const CORE_SCOPES = Object.freeze([
  "openid",
  "profile",
  "email",
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/youtube.force-ssl",
  "https://www.googleapis.com/auth/yt-analytics.readonly",
  "https://www.googleapis.com/auth/yt-analytics-monetary.readonly",
]);

const cleanOrigin = (value) => String(value || "").replace(/\/$/, "");
export const publicOrigin = () => cleanOrigin(
  process.env.ACCOUNT_PUBLIC_ORIGIN ||
  process.env.VIEWTUBE_PUBLIC_ORIGIN ||
  (process.env.NODE_ENV === "production" ? "https://viewtube.live" : "http://localhost:5173")
);
const callbackUrl = () => String(
  process.env.NODE_ENV === "production"
    ? `${publicOrigin()}/api/auth-callback`
    : process.env.GOOGLE_SIMPLE_OAUTH_REDIRECT_URI || `${publicOrigin()}/api/auth-callback`
);
const clientId = () => String(process.env.GOOGLE_OAUTH_CLIENT_ID || "").trim();
const clientSecret = () => String(process.env.GOOGLE_OAUTH_CLIENT_SECRET || "").trim();
const configured = () => Boolean(clientId() && clientSecret());

const base64url = (buffer) => Buffer.from(buffer).toString("base64url");
const randomToken = (bytes = 32) => base64url(crypto.randomBytes(bytes));
const codeChallenge = (verifier) => base64url(crypto.createHash("sha256").update(verifier).digest());

const parseCookies = (req) => Object.fromEntries(
  String(req.headers.cookie || "").split(";").map((part) => part.trim()).filter(Boolean).map((part) => {
    const index = part.indexOf("=");
    return index < 0 ? [part, ""] : [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
  }),
);

export const sanitizeReturnTo = (input) => {
  const value = String(input || "/").trim();
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  try {
    const parsed = new URL(value, "https://viewtube.local");
    if (parsed.origin !== "https://viewtube.local") return "/";
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return "/";
  }
};

const sessionCookie = (token, expiresAt) => {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax${secure}; Expires=${new Date(expiresAt).toUTCString()}`;
};
const clearSessionCookie = () =>
  `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;

const encryptionKey = () => {
  const configuredKey = String(process.env.ACCOUNT_TOKEN_ENCRYPTION_KEY || "").trim();
  if (process.env.NODE_ENV === "production" && !configuredKey) {
    throw new Error("ACCOUNT_TOKEN_ENCRYPTION_KEY is required in production.");
  }
  if (/^[a-f0-9]{64}$/i.test(configuredKey)) return Buffer.from(configuredKey, "hex");
  if (configuredKey) {
    const decoded = Buffer.from(configuredKey, "base64");
    if (decoded.length === 32) return decoded;
  }
  return crypto.createHash("sha256").update(configuredKey || "viewtube-development-token-key").digest();
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

const exchangeCode = async (code, verifier) => {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId(),
      client_secret: clientSecret(),
      redirect_uri: callbackUrl(),
      grant_type: "authorization_code",
      code_verifier: verifier,
    }),
    signal: AbortSignal.timeout(15_000),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.access_token || !payload.id_token) {
    throw new Error(payload.error_description || payload.error || "Google token exchange failed.");
  }
  return payload;
};

const fetchIdentity = async (idToken) => {
  const response = await fetch(`${GOOGLE_TOKEN_INFO_URL}?id_token=${encodeURIComponent(idToken)}`, {
    signal: AbortSignal.timeout(10_000),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.sub || !payload.email) throw new Error("Google identity verification failed.");
  if (String(payload.aud || "") !== clientId()) throw new Error("Google identity audience mismatch.");
  return payload;
};

const fetchChannel = async (accessToken) => {
  const response = await fetch("https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&mine=true", {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(15_000),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error?.message || "YouTube channel lookup failed.");
  const channel = payload.items?.[0];
  if (!channel) throw new Error("No YouTube channel is available for this Google account.");
  return {
    channelId: channel.id || null,
    channelTitle: channel.snippet?.title || null,
    channelHandle: channel.snippet?.customUrl || null,
    channelThumbnail: channel.snippet?.thumbnails?.medium?.url || channel.snippet?.thumbnails?.default?.url || null,
  };
};

const capabilitySet = (scopes) => {
  const set = new Set(scopes || []);
  return {
    youtubeRead: set.has("https://www.googleapis.com/auth/youtube.readonly") || set.has("https://www.googleapis.com/auth/youtube.force-ssl"),
    youtubeWrite: set.has("https://www.googleapis.com/auth/youtube.force-ssl"),
    analyticsRead: set.has("https://www.googleapis.com/auth/yt-analytics.readonly"),
    monetaryRead: set.has("https://www.googleapis.com/auth/yt-analytics-monetary.readonly"),
    upload: set.has("https://www.googleapis.com/auth/youtube.upload"),
  };
};

export const buildSimpleSession = async (userId) => {
  if (!userId) {
    return {
      status: "signed_out",
      user: null,
      channel: null,
      capabilities: capabilitySet([]),
    };
  }
  const data = await getAccountSnapshotData(userId);
  if (!data) {
    return {
      status: "signed_out",
      user: null,
      channel: null,
      capabilities: capabilitySet([]),
    };
  }
  const capabilities = capabilitySet(data.scopes || []);
  const connected = data.connectionStatus === "connected" && data.hasRefreshToken && capabilities.youtubeRead;
  return {
    status: connected ? "ready" : "reconnect_required",
    user: {
      id: data.id,
      email: data.email || null,
      name: data.displayName || null,
      avatar: data.channelThumbnail || null,
    },
    channel: data.channelId ? {
      id: data.channelId,
      title: data.channelTitle || "",
      handle: data.channelHandle || null,
      thumbnail: data.channelThumbnail || null,
    } : null,
    capabilities,
  };
};

const requestSessionUserId = async (req) => getSessionUserId(parseCookies(req)[SESSION_COOKIE] || "");

export const beginSimpleGoogleAuth = async ({ req, res, parsedUrl }) => {
  if (!configured()) {
    res.writeHead(503, { "Content-Type": "application/json", "Cache-Control": "no-store" });
    res.end(JSON.stringify({ error: "Google OAuth server credentials are not configured." }));
    return;
  }
  const state = randomToken();
  const nonce = randomToken();
  const verifier = randomToken(48);
  const returnTo = sanitizeReturnTo(parsedUrl.searchParams.get("returnTo") || "/");
  await saveOAuthState({
    state,
    codeVerifier: verifier,
    nonce,
    intent: "simple_google",
    returnTo,
    expiresAt: new Date(Date.now() + OAUTH_TTL_MS).toISOString(),
  });
  const url = new URL(GOOGLE_AUTH_URL);
  url.search = new URLSearchParams({
    client_id: clientId(),
    redirect_uri: callbackUrl(),
    response_type: "code",
    scope: CORE_SCOPES.join(" "),
    state,
    nonce,
    code_challenge: codeChallenge(verifier),
    code_challenge_method: "S256",
    access_type: "offline",
    include_granted_scopes: "true",
    prompt: "consent",
  }).toString();
  res.writeHead(302, { Location: url.toString(), "Cache-Control": "no-store" });
  res.end();
};

export const completeSimpleGoogleAuth = async ({ req, res, parsedUrl }) => {
  const state = parsedUrl.searchParams.get("state") || "";
  const saved = await consumeOAuthState(state);
  if (!saved || saved.intent !== "simple_google") {
    res.writeHead(302, { Location: `${publicOrigin()}/?authError=invalid_state`, "Cache-Control": "no-store" });
    res.end();
    return;
  }
  const oauthError = parsedUrl.searchParams.get("error");
  if (oauthError) {
    res.writeHead(302, { Location: `${publicOrigin()}${saved.returnTo}?authError=${encodeURIComponent(oauthError)}`, "Cache-Control": "no-store" });
    res.end();
    return;
  }
  try {
    const token = await exchangeCode(parsedUrl.searchParams.get("code") || "", saved.codeVerifier);
    const identity = await fetchIdentity(token.id_token);
    if (identity.nonce !== saved.nonce) throw new Error("Google identity nonce mismatch.");

    let userId = await requestSessionUserId(req);
    if (userId) {
      const linked = await getGoogleCredentialRecord(userId);
      if (linked?.googleSubject && linked.googleSubject !== identity.sub) {
        throw new Error("Selected Google account does not match this ViewTube session.");
      }
    }
    if (!userId) {
      userId = await resolveGoogleAccount({
        googleSubject: identity.sub,
        email: identity.email,
        displayName: identity.name || identity.email,
        intent: "sign_up",
      });
    }
    if (!userId) throw new Error("ViewTube account creation failed.");

    const scopes = String(token.scope || "").split(/\s+/).filter(Boolean);
    const channel = await fetchChannel(token.access_token);
    await saveGoogleConnection(userId, identity.sub, {
      accessTokenCiphertext: encryptToken(token.access_token),
      refreshTokenCiphertext: encryptToken(token.refresh_token),
      tokenExpiresAt: new Date(Date.now() + Number(token.expires_in || 3600) * 1000).toISOString(),
      scopes,
      ...channel,
      contentOwners: [],
      activeContentOwnerId: null,
      connectionStatus: "connected",
    });

    const session = await createAccountSession(userId);
    const destination = new URL(saved.returnTo, publicOrigin());
    destination.searchParams.set("auth", "ready");
    res.writeHead(302, {
      Location: destination.toString(),
      "Set-Cookie": sessionCookie(session.token, session.expiresAt),
      "Cache-Control": "no-store",
    });
    res.end();
  } catch (error) {
    console.error("[simple-auth] callback failed:", error instanceof Error ? error.message : String(error));
    const destination = new URL(saved.returnTo, publicOrigin());
    destination.searchParams.set("authError", "authorization_failed");
    res.writeHead(302, { Location: destination.toString(), "Cache-Control": "no-store" });
    res.end();
  }
};

export const readSimpleSession = async ({ req, res }) => {
  const session = await buildSimpleSession(await requestSessionUserId(req));
  res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(session));
};

export const logoutSimpleSession = async ({ req, res }) => {
  const token = parseCookies(req)[SESSION_COOKIE] || "";
  if (token) await revokeAccountSession(token);
  res.writeHead(200, {
    "Content-Type": "application/json; charset=utf-8",
    "Set-Cookie": clearSessionCookie(),
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify({ ok: true }));
};
