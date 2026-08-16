/// <reference types="vite/client" />

import {
  beginAccountIntent,
  isAccountServerUnavailableError,
  isUnifiedAccountServerEnabled,
} from "../account/accountCoordinator"

const KEY_VT_AUTH = 'vt_auth';
const KEY_SESSION_LEGACY = 'vt_session';
let cachedAuthObj: Record<string, unknown> | null = null;

const getAuthObj = () => {
  if (cachedAuthObj) return cachedAuthObj;
  try {
    cachedAuthObj = JSON.parse(localStorage.getItem(KEY_VT_AUTH) || '{}');
  } catch {
    cachedAuthObj = {};
  }
  return cachedAuthObj;
};

const updateAuthObj = (updates: any) => {
  const current = getAuthObj();
  cachedAuthObj = { ...current, ...updates };
  localStorage.setItem(KEY_VT_AUTH, JSON.stringify(cachedAuthObj));
  window.dispatchEvent(new Event('vt_auth_changed'));
};

const LEGACY_CLIENT_ID_FALLBACK = '365513395077-1cpc5mgn763t62ggcujkgbiv11rdbhsv.apps.googleusercontent.com';

let hasMigratedLegacySession = false;

export interface AuthSessionMeta {
  source: 'implicit' | 'legacy_redirect' | null;
  expiresAt: number | null;
  hasRefreshToken: boolean;
  clientId: string | null;
}

export interface UnifiedAuthContract {
  login: (mode?: 'popup' | 'redirect') => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
  getAccessToken: () => string | null;
  getSessionMeta: () => AuthSessionMeta;
}

export function generateRandomString(length: number) {
  const array = new Uint32Array(Math.ceil(length / 2));
  window.crypto.getRandomValues(array);
  return Array.from(array, (dec) => ('0' + dec.toString(16)).substr(-2)).join('').substr(0, length);
}

export async function generateCodeChallenge(codeVerifier: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  const digestArray = new Uint8Array(digest);
  let binary = '';
  for (let i = 0; i < digestArray.byteLength; i++) {
    binary += String.fromCharCode(digestArray[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

const getConfiguredClientId = () => {
  return (
    localStorage.getItem('yt_google_client_id') ||
    localStorage.getItem('vt_google_client_id') ||
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    LEGACY_CLIENT_ID_FALLBACK
  );
};

const migrateLegacySessionIfNeeded = () => {
  if (hasMigratedLegacySession) return;
  hasMigratedLegacySession = true;

  const currentAuth = getAuthObj();
  if (currentAuth.accessToken) return;

  try {
    const legacyRaw = localStorage.getItem(KEY_SESSION_LEGACY);
    if (!legacyRaw) return;

    const legacy = JSON.parse(legacyRaw) as { accessToken?: string; expiresAt?: number } | null;
    if (!legacy?.accessToken) return;

    const expiresAt = Number(legacy.expiresAt || 0);
    if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
      localStorage.removeItem(KEY_SESSION_LEGACY);
      return;
    }

    updateAuthObj({
      accessToken: legacy.accessToken,
      tokenExpiry: expiresAt
    });
  } catch {
    // Ignore malformed legacy payloads.
  }
};

const getExpiry = (): number => {
  const auth = getAuthObj();
  const parsed = Number(auth.tokenExpiry);
  return Number.isFinite(parsed) ? parsed : 0;
};

const isTokenFresh = (token: string | null) => {
  if (!token) return false;
  const expiry = getExpiry();
  if (!expiry) return true;
  return expiry > Date.now() + 30 * 1000;
};

const setImplicitSession = (accessToken: string, expiresInSeconds: number) => {
  const expiryTime = Date.now() + expiresInSeconds * 1000;
  updateAuthObj({
    accessToken,
    tokenExpiry: expiryTime
  });
};

// Mobile browsers routinely block popups or open them as tabs that lose the
// opener relationship, so the popup+postMessage handshake times out and Sync
// looks broken to the user. Redirect mode threads through the same OAuth flow
// without needing a live opener window.
const shouldPreferRedirectFlow = (): boolean => {
  if (typeof window === "undefined" || !window.matchMedia) return false
  try {
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches
    const narrowViewport = window.matchMedia("(max-width: 760px)").matches
    return coarsePointer || narrowViewport
  } catch {
    return false
  }
}

/**
 * Implicit Grant Flow — works entirely client-side, no backend needed.
 * Opens a popup or redirects to Google, user authenticates, Google redirects back with token in the URL hash.
 */
export const login = async (mode?: 'popup' | 'redirect'): Promise<void> => {
  const effectiveMode: 'popup' | 'redirect' =
    mode || (shouldPreferRedirectFlow() ? 'redirect' : 'popup')
  if (isUnifiedAccountServerEnabled()) {
    try {
      await beginAccountIntent('connect_channel')
      return
    } catch (error) {
      if (!isAccountServerUnavailableError(error)) {
        throw error
      }
      console.warn("[AuthSession] Unified account server unavailable, falling back to legacy login.")
    }
  }
  migrateLegacySessionIfNeeded();

  const clientId = getConfiguredClientId();
  if (!clientId) {
    throw new Error('Google Client ID is not set. Please provide it in Settings.');
  }

  // Clear any existing token.
  if (window.name !== 'oauth_popup') {
    updateAuthObj({ accessToken: null, tokenExpiry: null });
  }

  const redirectUri = `${window.location.origin}`;
  const state = generateRandomString(32);

  const scopes = [
    'openid',
    'profile',
    'email',
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/youtube.force-ssl',
    'https://www.googleapis.com/auth/yt-analytics.readonly',
    'https://www.googleapis.com/auth/yt-analytics-monetary.readonly',
  ].join(' ');

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.append('client_id', clientId);
  authUrl.searchParams.append('redirect_uri', redirectUri);
  authUrl.searchParams.append('response_type', 'token');
  authUrl.searchParams.append('scope', scopes);
  authUrl.searchParams.append('state', state);
  authUrl.searchParams.append('include_granted_scopes', 'true');
  authUrl.searchParams.append('prompt', 'consent');

  if (effectiveMode === 'redirect') {
    window.location.href = authUrl.toString();
    return new Promise(() => {}); // Will be reloaded by redirect
  }

  return new Promise((resolve, reject) => {
    const popup = window.open(authUrl.toString(), 'oauth_popup', 'width=600,height=700');
    if (!popup) {
      reject(new Error('Popup was blocked. Please allow popups for this site.'));
      return;
    }

    let settled = false;
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let timeoutTimer: ReturnType<typeof setTimeout> | null = null;

    const cleanup = () => {
      settled = true;
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('storage', handleStorage);
      if (pollTimer !== null) clearInterval(pollTimer);
      if (timeoutTimer !== null) clearTimeout(timeoutTimer);
      try { popup.close(); } catch { /* ignore — COOP may block closing a severed popup */ }
    };

    // The popup writes the token straight to localStorage before it tries to
    // postMessage/close. Reading it back is COOP-proof: localStorage is shared
    // across same-origin windows regardless of whether the opener link survives
    // Google's Cross-Origin-Opener-Policy. Force a fresh read past the cache.
    const readFreshToken = (): string | null => {
      cachedAuthObj = null;
      const token = getAuthObj().accessToken;
      if (typeof token !== 'string' || !token) return null;
      return isTokenFresh(token) ? token : null;
    };

    const finishIfTokenPresent = (): boolean => {
      if (settled) return true;
      const token = readFreshToken();
      if (!token) return false;
      cleanup();
      resolve();
      return true;
    };

    // Primary, COOP-resilient signal: the token appearing in localStorage.
    const handleStorage = (event: StorageEvent) => {
      if (event.key === KEY_VT_AUTH) finishIfTokenPresent();
    };

    // Best-effort fast path when the opener relationship survives.
    const handleMessage = (event: MessageEvent) => {
      if (settled) return;
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === 'OAUTH_IMPLICIT_SUCCESS') {
        setImplicitSession(event.data.access_token, Number(event.data.expires_in || 3600));
        cleanup();
        resolve();
      } else if (event.data?.type === 'OAUTH_IMPLICIT_ERROR') {
        cleanup();
        reject(new Error(event.data.error || 'Authentication failed'));
      }
    };

    window.addEventListener('message', handleMessage);
    window.addEventListener('storage', handleStorage);

    // Poll as a backstop: storage events don't always fire (same-process popups,
    // Safari quirks), and this is also how we notice the user closing the popup.
    pollTimer = setInterval(() => {
      if (finishIfTokenPresent()) return;
      let popupClosed = false;
      try { popupClosed = popup.closed; } catch { /* COOP can throw on access */ }
      if (popupClosed) {
        // Give any in-flight token write one last chance before giving up.
        if (finishIfTokenPresent()) return;
        cleanup();
        reject(new Error('LOGIN_ABORTED'));
      }
    }, 400);

    // Absolute ceiling so a stuck popup can never hang the boot promise forever.
    timeoutTimer = setTimeout(() => {
      if (finishIfTokenPresent()) return;
      cleanup();
      reject(new Error('LOGIN_ABORTED'));
    }, 3 * 60 * 1000);
  });
};

// Keep old export name for compatibility
export const loginWithPkcePopup = login;

export const getAccessToken = (): string | null => {
  migrateLegacySessionIfNeeded();
  const token = getAuthObj().accessToken;
  if (typeof token !== 'string') return null;
  return isTokenFresh(token) ? token : null;
};

export const getValidAccessToken = async (): Promise<string | null> => {
  const token = getAccessToken();
  const expiry = getExpiry();
  
  if (!token) return null;
  
  if (expiry && Date.now() > expiry) {
    console.warn("YouTube access token has expired.");
    return null; // Force re-authentication
  }
  
  return token;
};

export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};

export const logout = (): void => {
  cachedAuthObj = null;
  localStorage.removeItem(KEY_VT_AUTH);
  localStorage.removeItem(KEY_SESSION_LEGACY);
  window.dispatchEvent(new Event('vt_auth_changed'));
};

export const getSessionMeta = (): AuthSessionMeta => {
  migrateLegacySessionIfNeeded();

  const auth = getAuthObj();
  const token = auth.accessToken || null;
  const expiresAt = getExpiry() || null;
  const hasRefreshToken = !!auth.refreshToken;
  const source: AuthSessionMeta['source'] = token ? 'implicit' : null;

  return {
    source,
    expiresAt,
    hasRefreshToken,
    clientId: getConfiguredClientId() || null,
  };
};

export const unifiedAuth: UnifiedAuthContract = {
  login,
  logout,
  isAuthenticated,
  getAccessToken,
  getSessionMeta,
};

// --- OAUTH REDIRECT LISTENER FOR POPUP (Implicit Flow) ---
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event: StorageEvent) => {
    if (event.key === KEY_VT_AUTH) cachedAuthObj = null;
  });
  const hash = window.location.hash;
  
  // Check for implicit grant token in hash fragment
  if (hash && hash.includes('access_token')) {
    const params = new URLSearchParams(hash.substring(1));
    const accessToken = params.get('access_token');
    const expiresIn = params.get('expires_in');
    const error = params.get('error');

    if (accessToken) {
      setImplicitSession(accessToken, Number(expiresIn || 3600));
      
      // Notify opener (parent window) if we're in a popup
      if (window.opener) {
        window.opener.postMessage({
          type: 'OAUTH_IMPLICIT_SUCCESS',
          access_token: accessToken,
          expires_in: expiresIn || '3600',
        }, window.location.origin);
      }

      // Clean up the URL hash and close popup
      window.history.replaceState(null, '', window.location.pathname);
      try { window.close(); } catch { /* ignore */ }
    }

    if (error) {
      if (window.opener) {
        window.opener.postMessage({
          type: 'OAUTH_IMPLICIT_ERROR',
          error,
        }, window.location.origin);
      }
      try { window.close(); } catch { /* ignore */ }
    }
  }

  // Also handle legacy code-based redirects (backward compat)
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const queryError = urlParams.get('error');

  if (code || queryError) {
    if (code) {
      localStorage.setItem('yt_oauth_code', code);
      if (window.opener) {
        window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', code }, window.location.origin);
      }
    }
    if (queryError) {
      localStorage.setItem('yt_oauth_error', queryError);
      if (window.opener) {
        window.opener.postMessage({ type: 'OAUTH_AUTH_ERROR', error: queryError }, window.location.origin);
      }
    }
    window.close();
  }
}
