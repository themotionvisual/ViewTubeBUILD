export type AccountIntent =
  | "sign_up"
  | "log_in"
  | "connect_channel"
  | "reconnect_channel"
  | "manage_account"
  | "sign_out"

export type AccountActionLabel =
  | "Connect"
  | "Sign in"
  | "Sign up"
  | "Connect Channel"
  | "Reconnect Channel"
  | "Account"
  | "Connecting…"

export type AccountSurface = "topbar" | "sidebar" | "settings"

export type AccountCapability =
  | "youtube_read"
  | "youtube_analytics_read"
  | "youtube_monetary_read"
  | "youtube_upload"
  | "youtube_comments"
  | "search_console_read"

export interface UnifiedAccountSnapshot {
  viewtubeUserId: string | null
  profile: {
    email: string | null
    displayName: string | null
  }
  authentication: {
    status: "anonymous" | "pending" | "authenticated" | "expired"
    accountExists: boolean | null
  }
  google: {
    status: "disconnected" | "connected" | "expired" | "revoked"
    youtubeScopesGranted: boolean
    channelId: string | null
  }
  onboarding: {
    status: "not_started" | "in_progress" | "complete"
    nextStep: string | null
  }
  billing: {
    status: "inactive" | "trialing" | "active" | "past_due" | "unavailable"
    planId: string | null
  }
  ai: {
    planId: string | null
    availableCredits: number
  }
  grantedCapabilities: AccountCapability[]
  nextIntent: AccountIntent | null
  error?: {
    code: string
    message: string
    recoverable: boolean
  } | null
}

export const ANONYMOUS_ACCOUNT_SNAPSHOT: UnifiedAccountSnapshot = {
  viewtubeUserId: null,
  profile: {
    email: null,
    displayName: null,
  },
  authentication: {
    status: "anonymous",
    accountExists: null,
  },
  google: {
    status: "disconnected",
    youtubeScopesGranted: false,
    channelId: null,
  },
  onboarding: {
    status: "not_started",
    nextStep: null,
  },
  billing: {
    status: "inactive",
    planId: null,
  },
  ai: {
    planId: null,
    availableCredits: 0,
  },
  grantedCapabilities: [],
  nextIntent: "sign_up",
  error: null,
}

export const resolveAccountIntent = (
  snapshot: UnifiedAccountSnapshot,
): AccountIntent => {
  if (snapshot.authentication.status === "pending") {
    return snapshot.google.youtubeScopesGranted ? "log_in" : "connect_channel"
  }
  if (snapshot.authentication.status === "anonymous") {
    return snapshot.authentication.accountExists ? "log_in" : "sign_up"
  }
  if (snapshot.authentication.status === "expired") return "log_in"
  if (snapshot.google.status === "expired" || snapshot.google.status === "revoked") {
    return "reconnect_channel"
  }
  if (!snapshot.google.youtubeScopesGranted || snapshot.google.status === "disconnected") {
    return "connect_channel"
  }
  return "manage_account"
}

export const resolveAccountActionLabel = (
  snapshot: UnifiedAccountSnapshot,
): AccountActionLabel => {
  if (snapshot.authentication.status === "pending") {
    return "Connecting…"
  }

  const intent = resolveAccountIntent(snapshot)
  if (intent === "sign_up") return "Sign up"
  if (intent === "log_in") return "Sign in"
  if (intent === "connect_channel") return "Connect Channel"
  if (intent === "reconnect_channel") return "Reconnect Channel"
  return "Account"
}

export const resolveAccountChipLabel = (snapshot: UnifiedAccountSnapshot): string => {
  if (snapshot.authentication.status === "pending") return "Connecting…"
  const intent = resolveAccountIntent(snapshot)
  if (intent === "sign_up") return "Sign up"
  if (intent === "log_in") return "Sign in"
  if (intent === "connect_channel") return "Connect Channel"
  if (intent === "reconnect_channel") return "Reconnect Channel"
  return "Connected"
}

export const resolveAccountSurfaceLabel = (
  snapshot: UnifiedAccountSnapshot,
  surface: AccountSurface,
  channelSyncing = false,
): string => {
  if (channelSyncing) return surface === "settings" ? "Syncing Channel Data…" : "Syncing…"
  const base = resolveAccountActionLabel(snapshot)
  if (base !== "Account") {
    if (surface === "settings" && base === "Sign in") return "Sign in to ViewTube"
    if (surface === "settings" && base === "Sign up") return "Sign up for ViewTube"
    if (surface === "settings" && base === "Connect") return "Connect to ViewTube"
    if (surface === "settings" && base === "Connect Channel") return "Connect YouTube Channel"
    return base
  }
  if (surface === "sidebar") return "Sync Data"
  return "Connected"
}

export const isAccountActionPending = (snapshot: UnifiedAccountSnapshot): boolean =>
  snapshot.authentication.status === "pending"

export const sanitizeInternalReturnTo = (value: string | null | undefined): string => {
  const candidate = String(value || "").trim()
  if (!candidate.startsWith("/") || candidate.startsWith("//")) return "/account"
  try {
    const parsed = new URL(candidate, "https://viewtube.local")
    if (parsed.origin !== "https://viewtube.local") return "/account"
    const allowed = [
      "/", "/account", "/settings", "/subscribe", "/studio", "/performance",
      "/local-analytics", "/vt-sync-local", "/ai-brain", "/editor", "/projects",
      "/data-transparency", "/video-publisher", "/media-analyzer", "/seo-generator",
      "/hook-generator", "/reference-studio", "/user-guide",
    ]
    const permitted = allowed.some((path) => path === "/" ? parsed.pathname === "/" : parsed.pathname === path || parsed.pathname.startsWith(`${path}/`))
    if (!permitted) return "/account"
    return `${parsed.pathname}${parsed.search}${parsed.hash}`
  } catch {
    return "/account"
  }
}

export const buildAccountRoute = (
  intent: AccountIntent,
  returnTo: string,
  capability?: AccountCapability,
): string => {
  const query = new URLSearchParams({
    intent,
    returnTo: sanitizeInternalReturnTo(returnTo),
  })
  if (capability) query.set("capability", capability)
  return `/account/connect?${query.toString()}`
}

export const parseAccountIntent = (value: string | null | undefined): AccountIntent | null => {
  const candidate = String(value || "") as AccountIntent
  return ["sign_up", "log_in", "connect_channel", "reconnect_channel", "manage_account", "sign_out"].includes(candidate)
    ? candidate
    : null
}
