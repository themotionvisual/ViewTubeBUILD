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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const nullableString = (value: unknown): string | null =>
  typeof value === "string" && value.trim() ? value : null;

export const normalizeSimpleSession = (value: unknown): SimpleSession => {
  if (!isRecord(value)) return SIGNED_OUT_SESSION;

  const rawStatus = value.status;
  const status: SimpleSessionStatus =
    rawStatus === "ready" || rawStatus === "reconnect_required" || rawStatus === "signed_out"
      ? rawStatus
      : "signed_out";

  const rawUser = isRecord(value.user) ? value.user : null;
  const rawChannel = isRecord(value.channel) ? value.channel : null;
  const rawCapabilities = isRecord(value.capabilities) ? value.capabilities : {};

  const userId = nullableString(rawUser?.id);
  const channelId = nullableString(rawChannel?.id);

  return {
    status,
    user: userId
      ? {
          id: userId,
          email: nullableString(rawUser?.email),
          name: nullableString(rawUser?.name),
          avatar: nullableString(rawUser?.avatar),
        }
      : null,
    channel: channelId
      ? {
          id: channelId,
          title: nullableString(rawChannel?.title) || "",
          handle: nullableString(rawChannel?.handle),
          thumbnail: nullableString(rawChannel?.thumbnail),
        }
      : null,
    capabilities: {
      youtubeRead: rawCapabilities.youtubeRead === true,
      youtubeWrite: rawCapabilities.youtubeWrite === true,
      analyticsRead: rawCapabilities.analyticsRead === true,
      monetaryRead: rawCapabilities.monetaryRead === true,
      upload: rawCapabilities.upload === true,
    },
  };
};

export const fetchSimpleSession = async (): Promise<SimpleSession> => {
  const response = await fetch("/api/auth/session", {
    credentials: "include",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Session request failed (${response.status})`);
  return normalizeSimpleSession(await response.json());
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
