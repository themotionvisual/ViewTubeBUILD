export type SimpleSessionStatus = "ready" | "signed_out" | "reconnect_required";

export interface SimpleSession {
  status: SimpleSessionStatus;
  user: { id: string; email: string | null; name: string | null; avatar: string | null } | null;
  channel: { id: string; title: string; handle: string | null; thumbnail: string | null } | null;
  capabilities: {
    youtubeRead: boolean;
    youtubeWrite: boolean;
    analyticsRead: boolean;
    monetaryRead: boolean;
    upload: boolean;
  };
}

export const SIGNED_OUT_SESSION: SimpleSession = {
  status: "signed_out",
  user: null,
  channel: null,
  capabilities: {
    youtubeRead: false,
    youtubeWrite: false,
    analyticsRead: false,
    monetaryRead: false,
    upload: false,
  },
};

export const fetchSimpleSession = async (): Promise<SimpleSession> => {
  const response = await fetch("/api/auth/session", {
    credentials: "include",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Session request failed (${response.status})`);
  return response.json();
};

export const beginSimpleLogin = (returnTo = window.location.pathname + window.location.search + window.location.hash) => {
  window.location.assign(`/api/auth/google/start?returnTo=${encodeURIComponent(returnTo)}`);
};

export const simpleLogout = async (): Promise<void> => {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  if (!response.ok) throw new Error("Logout failed.");
};
