/**
 * ViewTUBE Auth Service
 * Handles redirect-based Google OAuth2 for a non-popup experience.
 */

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const REDIRECT_URI = window.location.origin + '/'; // Return to home
const SCOPES = [
  'https://www.googleapis.com/auth/youtube.force-ssl',
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/yt-analytics.readonly',
  'https://www.googleapis.com/auth/yt-analytics-monetary.readonly',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/spreadsheets'
].join(' ');

export interface AuthSession {
  accessToken: string;
  expiresAt: number;
}

class AuthService {
  private session: AuthSession | null = null;

  constructor() {
    this.loadSession();
    this.handleRedirectCallback();
  }

  private loadSession() {
    const saved = localStorage.getItem('vt_session');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.expiresAt > Date.now()) {
        this.session = parsed;
      } else {
        localStorage.removeItem('vt_session');
      }
    }
  }

  private handleRedirectCallback() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const expiresIn = params.get('expires_in');

    if (accessToken && expiresIn) {
      const session: AuthSession = {
        accessToken,
        expiresAt: Date.now() + parseInt(expiresIn) * 1000
      };
      this.session = session;
      localStorage.setItem('vt_session', JSON.stringify(session));
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }

  public login() {
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
      `response_type=token&` +
      `scope=${encodeURIComponent(SCOPES)}&` +
      `include_granted_scopes=true&` +
      `state=vt_auth_state`;

    window.location.href = authUrl;
  }

  public logout() {
    this.session = null;
    localStorage.removeItem('vt_session');
    window.location.reload();
  }

  public getAccessToken(): string | null {
    if (this.session && this.session.expiresAt > Date.now()) {
      return this.session.accessToken;
    }
    return null;
  }

  public isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

export const authService = new AuthService();
