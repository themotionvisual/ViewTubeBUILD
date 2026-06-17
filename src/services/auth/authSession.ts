/// <reference types="vite/client" />

const KEY_VT_AUTH = 'vt_auth';
const KEY_SESSION_LEGACY = 'vt_session';

const getAuthObj = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY_VT_AUTH) || '{}');
  } catch {
    return {};
  }
};

const updateAuthObj = (updates: any) => {
  const current = getAuthObj();
  localStorage.setItem(KEY_VT_AUTH, JSON.stringify({ ...current, ...updates }));
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
  login: () => Promise<void>;
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

/**
 * Implicit Grant Flow — works entirely client-side, no backend needed.
 * Opens a popup, user authenticates, Google redirects back with token in the URL hash.
 */
export const loginWithImplicitPopup = async (): Promise<void> => {
  migrateLegacySessionIfNeeded();

  return new Promise((resolve, reject) => {
    const clientId = getConfiguredClientId();
    if (!clientId) {
      reject(new Error('Google Client ID is not set. Please provide it in Settings.'));
      return;
    }

    // Clear any existing token.
    // A fresh OAuth round-trip is always required when login() is called.
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
      'https://www.googleapis.com/auth/yt-analytics.readonly',
    ].join(' ');

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('response_type', 'token');
    authUrl.searchParams.append('scope', scopes);
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('include_granted_scopes', 'true');
    authUrl.searchParams.append('prompt', 'consent');

    const popup = window.open(authUrl.toString(), 'oauth_popup', 'width=600,height=700');
    if (!popup) {
      reject(new Error('Popup was blocked. Please allow popups for this site.'));
      return;
    }

    let settled = false;

    const cleanup = () => {
      settled = true;
      window.removeEventListener('message', handleMessage);
      try { popup.close(); } catch { /* ignore */ }
    };

    // Listen for postMessage from the popup
    const handleMessage = (event: MessageEvent) => {
      if (settled) return;
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === 'OAUTH_IMPLICIT_SUCCESS') {
        cleanup();
        setImplicitSession(event.data.access_token, Number(event.data.expires_in || 3600));
        resolve();
      } else if (event.data?.type === 'OAUTH_IMPLICIT_ERROR') {
        cleanup();
        reject(new Error(event.data.error || 'Authentication failed'));
      }
    };

    window.addEventListener('message', handleMessage);
  });
};

// Keep old export name for compatibility
export const loginWithPkcePopup = loginWithImplicitPopup;

export const getAccessToken = (): string | null => {
  migrateLegacySessionIfNeeded();
  const token = getAuthObj().accessToken || null;
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
  localStorage.removeItem(KEY_VT_AUTH);
  localStorage.removeItem('yt_analytics_cache');
  localStorage.removeItem(KEY_SESSION_LEGACY);
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
  login: loginWithImplicitPopup,
  logout,
  isAuthenticated,
  getAccessToken,
  getSessionMeta,
};

// --- OAUTH REDIRECT LISTENER FOR POPUP (Implicit Flow) ---
if (typeof window !== 'undefined') {
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
