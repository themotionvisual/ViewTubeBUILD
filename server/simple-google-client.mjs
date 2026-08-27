import {
  getGoogleCredentialRecord,
  markGoogleConnectionExpired,
  saveGoogleConnection,
} from "./account-store.mjs";
import { decryptToken, encryptToken } from "./simple-auth.mjs";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const refreshes = new Map();

const clientId = () => String(process.env.GOOGLE_OAUTH_CLIENT_ID || "").trim();
const clientSecret = () => String(process.env.GOOGLE_OAUTH_CLIENT_SECRET || "").trim();

export class ReconnectRequiredError extends Error {
  constructor(message = "Google authorization expired; reconnect required.") {
    super(message);
    this.name = "ReconnectRequiredError";
    this.statusCode = 401;
    this.code = "RECONNECT_REQUIRED";
  }
}

export const getServerGoogleAccessToken = async (userId) => {
  const credential = await getGoogleCredentialRecord(userId);
  if (!credential || credential.connectionStatus !== "connected") throw new ReconnectRequiredError();

  const expiresAt = Date.parse(credential.tokenExpiresAt || "");
  const current = decryptToken(credential.accessTokenCiphertext);
  if (current && Number.isFinite(expiresAt) && expiresAt > Date.now() + 60_000) return current;

  if (refreshes.has(userId)) return refreshes.get(userId);
  const task = (async () => {
    const refreshToken = decryptToken(credential.refreshTokenCiphertext);
    if (!refreshToken) throw new ReconnectRequiredError();

    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId(),
        client_secret: clientSecret(),
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
      signal: AbortSignal.timeout(15_000),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.access_token) {
      if (response.status === 400 || response.status === 401) {
        await markGoogleConnectionExpired(userId);
        throw new ReconnectRequiredError();
      }
      const error = new Error(payload.error_description || payload.error || "Google token refresh failed.");
      error.statusCode = 502;
      throw error;
    }

    await saveGoogleConnection(userId, credential.googleSubject, {
      accessTokenCiphertext: encryptToken(payload.access_token),
      refreshTokenCiphertext: null,
      tokenExpiresAt: new Date(Date.now() + Number(payload.expires_in || 3600) * 1000).toISOString(),
      scopes: credential.scopes || [],
      connectionStatus: "connected",
    });
    return payload.access_token;
  })();

  refreshes.set(userId, task);
  try {
    return await task;
  } finally {
    refreshes.delete(userId);
  }
};

export const googleJson = async (userId, url, init = {}) => {
  const token = await getServerGoogleAccessToken(userId);
  const response = await fetch(url, {
    ...init,
    headers: {
      ...(init.headers || {}),
      Authorization: `Bearer ${token}`,
    },
    signal: init.signal || AbortSignal.timeout(20_000),
  });
  const payload = await response.json().catch(() => ({}));
  if (response.status === 401) {
    await markGoogleConnectionExpired(userId);
    throw new ReconnectRequiredError();
  }
  if (!response.ok) {
    const error = new Error(payload?.error?.message || `Google API request failed (${response.status}).`);
    error.statusCode = response.status;
    error.payload = payload;
    throw error;
  }
  return payload;
};
