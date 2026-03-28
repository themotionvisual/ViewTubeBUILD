import { ytApiQueue } from '../views/RequestQueue';

const DEFAULT_CLIENT_ID = '365513395077-1cpc5mgn763t62ggcujkgbiv11rdbhsv.apps.googleusercontent.com';
const SCOPES = [
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/yt-analytics.readonly',
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube.force-ssl'
].join(' ');

class YouTubeClient {
    private BASE_URL = 'https://www.googleapis.com/youtube/v3';

    constructor() {
        // Automatically intercept OAuth redirects on boot
        this.handleAuthRedirect();
    }

    // --- Authentication & Token Management ---

    private getClientId(): string {
        return localStorage.getItem('yt_google_client_id') || DEFAULT_CLIENT_ID;
    }

    public getAccessToken(): string | null {
        return localStorage.getItem('yt_access_token');
    }

    public isAuthenticated(): boolean {
        const token = this.getAccessToken();
        const expiry = localStorage.getItem('yt_token_expiry');
        if (!token || !expiry) return false;
        return Date.now() < parseInt(expiry, 10);
    }

    public login() {
        const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        authUrl.searchParams.append('client_id', this.getClientId());
        authUrl.searchParams.append('redirect_uri', window.location.origin);
        authUrl.searchParams.append('response_type', 'token');
        authUrl.searchParams.append('scope', SCOPES);
        authUrl.searchParams.append('include_granted_scopes', 'true');
        authUrl.searchParams.append('prompt', 'consent');

        window.location.href = authUrl.toString();
    }

    public logout() {
        localStorage.removeItem('yt_access_token');
        localStorage.removeItem('yt_token_expiry');
        localStorage.removeItem('yt_analytics_cache');
        window.location.reload();
    }

    private handleAuthRedirect() {
        if (window.location.hash.includes('access_token=')) {
            const params = new URLSearchParams(window.location.hash.substring(1));
            const accessToken = params.get('access_token');
            const expiresIn = params.get('expires_in');

            if (accessToken && expiresIn) {
                localStorage.setItem('yt_access_token', accessToken);
                // Convert 'expires_in' (seconds) to an absolute timestamp
                localStorage.setItem('yt_token_expiry', (Date.now() + parseInt(expiresIn, 10) * 1000).toString());
                window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
            }
        }
    }

    // --- Unified Request Engine (Queued & Rate-Limited) ---

    public async request<T>(url: string, options: RequestInit = {}): Promise<T> {
        // All requests are routed through the Queue automatically
        return ytApiQueue.add(async () => {
            const token = this.getAccessToken();
            if (!token) throw new Error('Unauthenticated: Please connect your YouTube account.');

            const response = await fetch(url, {
                ...options,
                headers: {
                    ...options.headers,
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            });

            if (response.status === 401) {
                this.logout();
                throw new Error('Session Expired: Reconnecting required.');
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `YouTube API Error: ${response.status}`);
            }

            return response.json();
        });
    }

    // --- Direct API Helpers ---

    public async getChannelProfile() {
        const data = await this.request<any>(`${this.BASE_URL}/channels?part=snippet,contentDetails,statistics&mine=true`);
        if (!data.items?.[0]) throw new Error('No channel found');
        return data.items[0];
    }

    // Additional specific endpoints can be easily mapped here later...
}

export const ytClient = new YouTubeClient();