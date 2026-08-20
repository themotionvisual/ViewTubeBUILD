import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import * as authSession from '../services/auth/authSession';

export interface SessionMeta {
  id: string;
  expiresAt: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isConnected: boolean;
  token: string | null;
  sessionMeta: SessionMeta | null;
  login: (token: string, meta: SessionMeta) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [sessionMeta, setSessionMeta] = useState<SessionMeta | null>(null);

  const syncAuth = useCallback(() => {
    const freshToken = authSession.getAccessToken();
    const meta = authSession.getSessionMeta();
    const nextSessionMeta = meta ? {
      id: meta.clientId || 'unknown',
      expiresAt: meta.expiresAt?.toString() || ''
    } : null;

    setToken((current) => current === freshToken ? current : freshToken);
    setIsAuthenticated((current) => current === !!freshToken ? current : !!freshToken);

    // Convert old session meta structure if needed, or keep as is
    setSessionMeta((current) => {
      if (!current && !nextSessionMeta) return current;
      if (
        current &&
        nextSessionMeta &&
        current.id === nextSessionMeta.id &&
        current.expiresAt === nextSessionMeta.expiresAt
      ) {
        return current;
      }
      return nextSessionMeta;
    });
  }, []);

  useEffect(() => {
    syncAuth();

    window.addEventListener('vt_auth_changed', syncAuth);
    return () => window.removeEventListener('vt_auth_changed', syncAuth);
  }, [syncAuth]);

  const isConnected = !!token; // Derived state

  const login = (token: string, meta: SessionMeta) => {
    setToken(token);
    setSessionMeta(meta);
    setIsAuthenticated(true);
    window.dispatchEvent(new Event('vt_auth_changed'));
  };

  const logout = () => {
    authSession.logout();
    setToken(null);
    setSessionMeta(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isConnected, token, sessionMeta, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
