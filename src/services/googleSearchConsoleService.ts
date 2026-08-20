import { getAccessToken, logout } from "./auth/authSession"

const SEARCH_CONSOLE_BASE_URL = "https://www.googleapis.com/webmasters/v3"
const SEARCH_CONSOLE_BINDING_KEY = "vt_search_console_binding"

export type SearchConsoleProperty = {
 siteUrl: string
 permissionLevel: string
}

export type SearchConsoleBinding = {
 siteUrl: string
 permissionLevel: string
 lastSyncedAt?: string
}

export type SearchConsoleQueryRow = {
 sourceLane: "google_search_console"
 siteUrl: string
 query: string
 page: string
 searchAppearance: string
 device: string
 country: string
 date: string
 clicks: number
 impressions: number
 ctr: number
 position: number
}

type SearchConsoleRequestInit = RequestInit & {
 skipJsonContentType?: boolean
}

const readBinding = (): SearchConsoleBinding | null => {
 try {
  const raw = localStorage.getItem(SEARCH_CONSOLE_BINDING_KEY)
  if (!raw) return null
  const parsed = JSON.parse(raw) as SearchConsoleBinding | null
  if (!parsed?.siteUrl) return null
  return parsed
 } catch {
  return null
 }
}

const writeBinding = (binding: SearchConsoleBinding | null): void => {
 if (!binding) {
  localStorage.removeItem(SEARCH_CONSOLE_BINDING_KEY)
  return
 }
 localStorage.setItem(SEARCH_CONSOLE_BINDING_KEY, JSON.stringify(binding))
}

const ensureOk = async (response: Response): Promise<any> => {
 if (response.status === 401) {
  logout()
  throw new Error("Search Console session expired or unauthorized.")
 }
 if (!response.ok) {
  const error = await response
   .json()
   .catch(() => ({ error: { message: `Search Console API request failed: ${response.status}` } }))
  throw new Error(error?.error?.message || `Search Console API request failed: ${response.status}`)
 }
 return response.json()
}

const requestSearchConsole = async (
 endpoint: string,
 options: SearchConsoleRequestInit = {},
): Promise<any> => {
 const token = getAccessToken()
 if (!token) throw new Error("Not authenticated")
 const headers = new Headers(options.headers || {})
 headers.set("Authorization", `Bearer ${token}`)
 headers.set("Accept", "application/json")
 if (!options.skipJsonContentType && !headers.has("Content-Type")) {
  headers.set("Content-Type", "application/json")
 }
 const response = await fetch(`${SEARCH_CONSOLE_BASE_URL}${endpoint}`, {
  ...options,
  headers,
 })
 return ensureOk(response)
}

const numberFromUnknown = (value: unknown): number => {
 const parsed = Number(value ?? 0)
 return Number.isFinite(parsed) ? parsed : 0
}

const text = (value: unknown): string => String(value ?? "").trim()

const normalizeSearchAppearance = (value: unknown): string => {
 const raw = text(value)
 return raw || "All search appearances"
}

export const googleSearchConsoleService = {
 getStoredBinding(): SearchConsoleBinding | null {
  return readBinding()
 },

 setStoredBinding(binding: SearchConsoleBinding | null): void {
  writeBinding(binding)
 },

 async listProperties(): Promise<SearchConsoleProperty[]> {
  const payload = await requestSearchConsole("/sites")
  return Array.isArray(payload?.siteEntry)
   ? payload.siteEntry
      .map((entry: any) => ({
       siteUrl: text(entry?.siteUrl),
       permissionLevel: text(entry?.permissionLevel) || "unknown",
      }))
      .filter((entry: SearchConsoleProperty) => Boolean(entry.siteUrl))
   : []
 },

 async fetchSearchAppearanceOptions(
  siteUrl: string,
  startDate: string,
  endDate: string,
 ): Promise<string[]> {
  const encodedSiteUrl = encodeURIComponent(siteUrl)
  const payload = await requestSearchConsole(
   `/sites/${encodedSiteUrl}/searchAnalytics/query`,
   {
    method: "POST",
    body: JSON.stringify({
     startDate,
     endDate,
     dimensions: ["searchAppearance"],
     type: "web",
     rowLimit: 250,
    }),
   },
  )
  const rows = Array.isArray(payload?.rows) ? payload.rows : []
  return rows
   .map((row: any) => normalizeSearchAppearance(row?.keys?.[0]))
   .filter(Boolean)
 },

 async fetchQueryRows(
  siteUrl: string,
  startDate: string,
  endDate: string,
 ): Promise<SearchConsoleQueryRow[]> {
  const encodedSiteUrl = encodeURIComponent(siteUrl)
  const payload = await requestSearchConsole(
   `/sites/${encodedSiteUrl}/searchAnalytics/query`,
   {
    method: "POST",
    body: JSON.stringify({
     startDate,
     endDate,
     dimensions: ["query", "page", "date", "device", "country", "searchAppearance"],
     type: "web",
     rowLimit: 2500,
     aggregationType: "byPage",
    }),
   },
  )

  const rows = Array.isArray(payload?.rows) ? payload.rows : []
  return rows.map((row: any) => {
   const keys = Array.isArray(row?.keys) ? row.keys : []
   return {
    sourceLane: "google_search_console" as const,
    siteUrl,
    query: text(keys[0]),
    page: text(keys[1]),
    date: text(keys[2]),
    device: text(keys[3]).toUpperCase(),
    country: text(keys[4]).toUpperCase(),
    searchAppearance: normalizeSearchAppearance(keys[5]),
    clicks: numberFromUnknown(row?.clicks),
    impressions: numberFromUnknown(row?.impressions),
    ctr: numberFromUnknown(row?.ctr),
    position: numberFromUnknown(row?.position),
   }
  })
 },
}

