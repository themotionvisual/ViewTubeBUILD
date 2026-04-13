/**
 * Legacy authService compatibility wrapper.
 * Canonical auth flow now lives in authSession.ts (PKCE-first).
 */

import { unifiedAuth } from './authSession';

export interface AuthSession {
  accessToken: string;
  expiresAt: number;
}

class AuthService {
  private hasLoggedPopupClose = false;

  public async login() {
    try {
      await unifiedAuth.login();
      this.hasLoggedPopupClose = false;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.toLowerCase().includes('window was closed')) {
        if (!this.hasLoggedPopupClose) {
          this.hasLoggedPopupClose = true;
          console.info('Authentication popup was closed before completion.');
        }
        return;
      }
      console.error('Authentication failed:', error);
    }
  }

  public logout() {
    unifiedAuth.logout();
  }

  public getAccessToken(): string | null {
    return unifiedAuth.getAccessToken();
  }

  public isAuthenticated(): boolean {
    return unifiedAuth.isAuthenticated();
  }
}

export const authService = new AuthService();
