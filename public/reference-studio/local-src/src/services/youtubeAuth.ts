/// <reference types="vite/client" />
export function generateRandomString(length: number) {
    const array = new Uint32Array(Math.ceil(length / 2));
    window.crypto.getRandomValues(array);
    return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('').substr(0, length);
}

export async function generateCodeChallenge(codeVerifier: string) {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

export const connectChannel = async (): Promise<void> => {
    return new Promise(async (resolve, reject) => {
        const clientId = localStorage.getItem('yt_google_client_id') || import.meta.env.VITE_GOOGLE_CLIENT_ID;
        if (!clientId) {
            reject(new Error("Google Client ID is not set. Please provide it in Settings."));
            return;
        }

        const redirectUri = `${window.location.origin}/auth/callback`;
        console.log("YouTube Auth: Initiating connection with:", {
            clientId,
            redirectUri,
            origin: window.location.origin
        });

        const codeVerifier = generateRandomString(64);
        const codeChallenge = await generateCodeChallenge(codeVerifier);
        const state = generateRandomString(32);

        localStorage.setItem('yt_code_verifier', codeVerifier);
        localStorage.removeItem('yt_oauth_code');
        localStorage.removeItem('yt_oauth_error');
        localStorage.removeItem('yt_oauth_status');

        const scopes = [
            'https://www.googleapis.com/auth/youtube',
            'https://www.googleapis.com/auth/youtube.readonly',
            'https://www.googleapis.com/auth/yt-analytics.readonly',
            'https://www.googleapis.com/auth/yt-analytics-monetary.readonly'
        ].join(' ');

        const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        authUrl.searchParams.append('client_id', clientId);
        authUrl.searchParams.append('redirect_uri', redirectUri);
        authUrl.searchParams.append('response_type', 'code');
        authUrl.searchParams.append('scope', scopes);
        authUrl.searchParams.append('code_challenge', codeChallenge);
        authUrl.searchParams.append('code_challenge_method', 'S256');
        authUrl.searchParams.append('access_type', 'offline');
        authUrl.searchParams.append('prompt', 'consent');
        authUrl.searchParams.append('state', state);

        const popup = window.open(authUrl.toString(), 'oauth_popup', 'width=600,height=700');

        if (!popup) {
            reject(new Error("Popup was blocked. Please allow popups for this site."));
            return;
        }

        let settled = false;
        let callbackReached = false;

        const cleanup = () => {
            settled = true;
            clearInterval(checkClosed);
            clearInterval(checkLocalStorage);
            clearInterval(checkServerStatus);
            window.removeEventListener('message', handleMessage);
            localStorage.removeItem('yt_oauth_code');
            localStorage.removeItem('yt_oauth_error');
            localStorage.removeItem('yt_oauth_status');
        };

        const handleMessage = async (event: MessageEvent) => {
            if (settled) return;

            if (event.data?.type === 'OAUTH_CALLBACK_REACHED') {
                callbackReached = true;
                return;
            }

            if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
                cleanup();
                try {
                    await exchangeCodeForToken(event.data.code, codeVerifier, redirectUri, clientId);
                    resolve();
                } catch (error: any) {
                    reject(error);
                }
            } else if (event.data?.type === 'OAUTH_AUTH_ERROR') {
                cleanup();
                reject(new Error(event.data.error || "Authentication failed"));
            }
        };

        window.addEventListener('message', handleMessage);

        const checkClosed = setInterval(() => {
            if (popup.closed && !settled) {
                clearInterval(checkClosed);
                setTimeout(async () => {
                    if (settled) return;
                    const code = localStorage.getItem('yt_oauth_code');
                    const error = localStorage.getItem('yt_oauth_error');

                    if (code) {
                        cleanup();
                        exchangeCodeForToken(code, codeVerifier, redirectUri, clientId).then(resolve).catch(reject);
                    } else if (error) {
                        cleanup();
                        reject(new Error(error));
                    } else {
                        try {
                            const response = await fetch(`/api/auth/status?state=${state}&t=${Date.now()}`);
                            if (response.ok) {
                                const data = await response.json();
                                if (data.code) {
                                    cleanup();
                                    exchangeCodeForToken(data.code, codeVerifier, redirectUri, clientId).then(resolve).catch(reject);
                                    return;
                                } else if (data.error) {
                                    cleanup();
                                    reject(new Error(data.error));
                                    return;
                                }
                            }
                        } catch (e) { }

                        cleanup();
                        if (callbackReached) {
                            reject(new Error("Authentication was interrupted after reaching the callback. Please try again."));
                        } else {
                            reject(new Error("Authentication window was closed before completion."));
                        }
                    }
                }, 2000);
            }
        }, 500);

        const checkLocalStorage = setInterval(() => {
            if (settled) return;
            const code = localStorage.getItem('yt_oauth_code');
            const error = localStorage.getItem('yt_oauth_error');
            if (code) {
                cleanup();
                try { popup.close(); } catch (e) { }
                exchangeCodeForToken(code, codeVerifier, redirectUri, clientId).then(resolve).catch(reject);
            } else if (error) {
                cleanup();
                try { popup.close(); } catch (e) { }
                reject(new Error(error));
            }
        }, 500);

        const checkServerStatus = setInterval(async () => {
            if (settled) return;
            try {
                const response = await fetch(`/api/auth/status?state=${state}&t=${Date.now()}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.code) {
                        cleanup();
                        try { popup.close(); } catch (e) { }
                        exchangeCodeForToken(data.code, codeVerifier, redirectUri, clientId).then(resolve).catch(reject);
                    } else if (data.error) {
                        cleanup();
                        try { popup.close(); } catch (e) { }
                        reject(new Error(data.error));
                    }
                }
            } catch (e) { }
        }, 1000);
    });
};

async function exchangeCodeForToken(code: string, codeVerifier: string, redirectUri: string, clientId: string) {
    const response = await fetch('/api/auth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: clientId, code, code_verifier: codeVerifier, redirect_uri: redirectUri })
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to exchange code for token: ${errorData.error_description || errorData.error}`);
    }
    const data = await response.json();
    const expiryTime = Date.now() + (data.expires_in * 1000);
    localStorage.setItem('yt_access_token', data.access_token);
    localStorage.setItem('yt_token_expiry', expiryTime.toString());
    if (data.refresh_token) {
        localStorage.setItem('yt_refresh_token', data.refresh_token);
    }
}

export const refreshTokenIfExpired = async (): Promise<string | null> => {
    // Check PKCE-based token first
    const pkceToken = localStorage.getItem('yt_access_token');
    if (pkceToken) return pkceToken;

    // Fallback: check redirect-based authService session
    try {
        const session = JSON.parse(localStorage.getItem('vt_session') || 'null');
        if (session && session.accessToken && session.expiresAt > Date.now()) {
            return session.accessToken;
        }
    } catch (e) { /* ignore */ }

    return null;
};

export const disconnectChannel = () => {
    localStorage.removeItem('yt_access_token');
    localStorage.removeItem('yt_token_expiry');
    localStorage.removeItem('yt_refresh_token');
    localStorage.removeItem('yt_code_verifier');
    localStorage.removeItem('yt_analytics_cache');
    localStorage.removeItem('vt_session');
};

export const isChannelConnected = (): boolean => {
    if (localStorage.getItem('yt_access_token')) return true;

    // Also check redirect-based session
    try {
        const session = JSON.parse(localStorage.getItem('vt_session') || 'null');
        return !!(session && session.accessToken && session.expiresAt > Date.now());
    } catch (e) { return false; }
};