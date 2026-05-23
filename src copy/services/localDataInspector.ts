export type LocalDataCategory =
 | "auth"
 | "analytics"
 | "uploads"
 | "preferences"
 | "ai"
 | "other"

export type LocalDataEntry = {
 key: string
 bytes: number
 category: LocalDataCategory
 sensitive: boolean
 previewRedacted: string
}

const byteLength = (value: string): number => {
 try {
  return new TextEncoder().encode(value).length
 } catch {
  return value.length
 }
}

const isSensitiveKey = (key: string): boolean => {
 const low = key.toLowerCase()
 return (
  low.includes("token") ||
  low.includes("oauth") ||
  low.includes("access") ||
  low.includes("refresh") ||
  low.includes("client_id") ||
  // API keys can be stored under a variety of aliases.
  (low.includes("api") && low.includes("key")) ||
  low.endsWith("_key")
 )
}

const categorizeKey = (key: string): LocalDataCategory => {
 const low = key.toLowerCase()

 if (
  low.includes("access_token") ||
  low.includes("refresh_token") ||
  low.includes("token_expiry") ||
  low.includes("auth") ||
  low.includes("session") ||
  low.includes("oauth")
 ) {
  return "auth"
 }

 if (low.includes("analytics") || low.includes("yt_analytics") || low.includes("ga4_")) {
  return "analytics"
 }

 if (low.includes("upload") || low.includes("csv")) {
  return "uploads"
 }

 if (low.includes("gemini") || low.includes("oracle") || low.includes("brain") || low.includes("prompt")) {
  return "ai"
 }

 if (low.includes("mode") || low.includes("preference") || low.includes("dark") || low.includes("optional")) {
  return "preferences"
 }

 return "other"
}

const redactValueString = (raw: string): string => {
 // Keep the shape visible while removing contents.
 return raw.length > 0 ? "[REDACTED]" : ""
}

const safeStringify = (value: unknown): string => {
 try {
  return JSON.stringify(value, null, 2)
 } catch {
  return String(value ?? "")
 }
}

const safeParse = (raw: string): unknown => {
 try {
  return JSON.parse(raw)
 } catch {
  return raw
 }
}

export const readLocalData = (
 key: string,
 opts: { redact: boolean } = { redact: true },
): string => {
 let raw: string | null = null
 try {
  raw = localStorage.getItem(key)
 } catch {
  raw = null
 }

 if (raw === null) return ""
 const sensitive = isSensitiveKey(key)

 if (opts.redact && sensitive) {
  return redactValueString(raw)
 }

 const parsed = safeParse(raw)
 if (typeof parsed === "string") return parsed
 return safeStringify(parsed)
}

const KNOWN_KEYS: string[] = [
 // YouTube analytics cache
 "yt_analytics_cache",
 "yt_analytics_last_sync",
 // Optional video metrics toggle
 "vt_optional_video_metrics_enabled",
 // Merge policy
 "vt_sync_merge_policy",
 // Ingest/runtime modes
 "vt_ingest_mode",
 "vt_sync_source_mode",
 "vt_storage_mode",
 // Upload/cache
 "vt_uploaded_csv_cache",
 // Global state
 "vt_workspace_brain",
 "vt_auth_state",
 // GA4 caches
 "ga4_analytics_cache",
 "ga4_properties_cache",
 // AI + daily brief caches
 "yt_algo_diagnosis",
 "yt_algo_brief",
 "vt_daily_oracle_advice",
 "vt_daily_oracle_advice_ts",
 // Settings
 "yt_model_preference",
 "vt_dark_mode",
 // Public handle mode
 "vt_public_channel_id",
 "vt_public_channel_handle",
 // OAuth/session keys (may exist)
 "yt_access_token",
 "yt_token_expiry",
 "yt_refresh_token",
 "vt_session",
 "yt_oauth_code",
 "yt_oauth_error",
 // Google/Gemini key aliases (may exist)
 "yt_api_key",
 "yt_public_api_key",
 "vt_gemini_api_key",
 "gemini_api_key",
 "google_api_key",
 "yt_google_client_id",
 "vt_google_client_id",
]

export const listLocalDataEntries = (): LocalDataEntry[] => {
 const seen = new Set<string>()
 const keys: string[] = []

 // Curated allowlist (even if missing, we'll skip).
 KNOWN_KEYS.forEach((key) => {
  if (seen.has(key)) return
  seen.add(key)
  keys.push(key)
 })

 // Enumerate all vt_/yt_/ga4_ keys in localStorage (captures unknowns).
 try {
  for (let i = 0; i < localStorage.length; i += 1) {
   const key = localStorage.key(i)
   if (!key) continue
   if (!(key.startsWith("vt_") || key.startsWith("yt_") || key.startsWith("ga4_"))) continue
   if (seen.has(key)) continue
   seen.add(key)
   keys.push(key)
  }
 } catch {
  // Ignore enumeration failures (privacy mode etc).
 }

 const entries: LocalDataEntry[] = []
 keys.forEach((key) => {
  let raw: string | null = null
  try {
   raw = localStorage.getItem(key)
  } catch {
   raw = null
  }
  if (raw === null) return

  const sensitive = isSensitiveKey(key)
  const category = categorizeKey(key)
  const preview = sensitive ? "[REDACTED]" : readLocalData(key, { redact: false })
  const previewRedacted = preview.length > 240 ? `${preview.slice(0, 240)}…` : preview

  entries.push({
   key,
   bytes: byteLength(raw),
   category,
   sensitive,
   previewRedacted,
  })
 })

 // Largest-first is the most useful default.
 entries.sort((a, b) => b.bytes - a.bytes)
 return entries
}

