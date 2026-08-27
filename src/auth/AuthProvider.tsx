import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  SIGNED_OUT_SESSION,
  beginSimpleLogin,
  fetchSimpleSession,
  simpleLogout,
  type SimpleSession,
} from "./session";

interface SimpleAuthContextValue {
  session: SimpleSession;
  loading: boolean;
  refresh: () => Promise<SimpleSession>;
  login: (returnTo?: string) => void;
  logout: () => Promise<void>;
}

const SimpleAuthContext = createContext<SimpleAuthContextValue | null>(null);

export const SimpleAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<SimpleSession>(SIGNED_OUT_SESSION);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const next = await fetchSimpleSession();
    setSession(next);
    return next;
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchSimpleSession()
      .then((next) => { if (alive) setSession(next); })
      .catch(() => { if (alive) setSession(SIGNED_OUT_SESSION); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const logout = useCallback(async () => {
    await simpleLogout();
    setSession(SIGNED_OUT_SESSION);
  }, []);

  const value = useMemo<SimpleAuthContextValue>(() => ({
    session,
    loading,
    refresh,
    login: beginSimpleLogin,
    logout,
  }), [loading, logout, refresh, session]);

  return <SimpleAuthContext.Provider value={value}>{children}</SimpleAuthContext.Provider>;
};

export const useSimpleAuth = (): SimpleAuthContextValue => {
  const value = useContext(SimpleAuthContext);
  if (!value) throw new Error("useSimpleAuth must be used inside SimpleAuthProvider");
  return value;
};
