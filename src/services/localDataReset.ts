import { unifiedAuth } from "./auth/authSession"
import { clearYouTubeAnalyticsCache } from "./analytics/DataStore"
import { clearCanonicalSyncDb } from "./canonicalSync/storage"

export const LOCAL_DATA_CHANGED_EVENT = "vt_local_data_changed"

const dispatchLocalDataChanged = () => {
 try {
  window.dispatchEvent(new Event(LOCAL_DATA_CHANGED_EVENT))
 } catch {
  // no-op
 }
}

const clearCookies = () => {
 try {
  if (typeof document === "undefined") return
  const cookies = document.cookie ? document.cookie.split(";") : []
  const hostname = window.location.hostname
  const domainParts = hostname.split(".").filter(Boolean)
  const candidateDomains = new Set<string>(["", hostname])
  for (let index = 0; index < domainParts.length - 1; index += 1) {
   candidateDomains.add(`.${domainParts.slice(index).join(".")}`)
  }

  cookies.forEach((entry) => {
   const cookieName = entry.split("=")[0]?.trim()
   if (!cookieName) return
   candidateDomains.forEach((domain) => {
    const domainSegment = domain ? `;domain=${domain}` : ""
    document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/${domainSegment}`
   })
  })
 } catch {
  // ignore
 }
}

// Keys that represent large cached payloads or derived sync artifacts.
const SOFT_CLEAR_KEYS: string[] = [
 "yt_analytics_cache",
 "yt_analytics_last_sync",
 "vt_canonical_sync_enabled",
 "vt_canonical_sync_validation_mode",
 "vt_canonical_sync_export_format",
 "vt_canonical_owner_mode_enabled",
 "vt_canonical_owner_id",
 "ga4_analytics_cache",
 "ga4_properties_cache",
 "vt_uploaded_csv_cache",
 "vt_video_details_cache_v1",
 "vt_last_sync_date",
 "vt_retention_cache",
 "vt_workspace_brain",
 "vt_auth",
 "vt_master_table_metric_audit",
 "vt_master_table_stage_results",
]

const HARD_ANALYTICS_RESET_KEYS: string[] = [
 ...SOFT_CLEAR_KEYS,
 "vt_video_sync_batch_state",
 "vt_channel_sync_status",
 "vt_sync_source_mode",
 "vt_sync_merge_policy",
]

export const clearCachedDataSoft = async (): Promise<void> => {
 try {
  localStorage.clear()
 } catch {
  // ignore
 }
 try {
  sessionStorage.clear()
 } catch {
  // ignore
 }
 clearCookies()
 await Promise.all([clearServiceWorkerCaches(), unregisterServiceWorkers(), clearIndexedDb()])
 await clearYouTubeAnalyticsCache()
 await clearCanonicalSyncDb()
 dispatchLocalDataChanged()
}

export const clearAnalyticsStateForFreshSync = async (): Promise<void> => {
 HARD_ANALYTICS_RESET_KEYS.forEach((key) => {
  try {
   localStorage.removeItem(key)
  } catch {
   // ignore
  }
 })

 try {
  sessionStorage.removeItem("yt_analytics_cache")
 } catch {
  // ignore
 }

 await clearYouTubeAnalyticsCache()
 await clearCanonicalSyncDb()
 dispatchLocalDataChanged()
}

const clearServiceWorkerCaches = async () => {
 try {
  if (!("caches" in window)) return
  const names = await caches.keys()
  await Promise.all(names.map((name) => caches.delete(name)))
 } catch {
  // ignore
 }
}

const unregisterServiceWorkers = async () => {
 try {
  if (!("serviceWorker" in navigator)) return
  const registrations = await navigator.serviceWorker.getRegistrations()
  await Promise.all(
   registrations.map((registration) => registration.unregister().catch(() => false)),
  )
 } catch {
  // ignore
 }
}

const clearIndexedDb = async () => {
 try {
  const anyIndexedDb = indexedDB as unknown as {
   databases?: () => Promise<Array<{ name?: string | null }>>
  }
  if (!anyIndexedDb.databases) return
  const dbs = await anyIndexedDb.databases()
  await Promise.all(
   (dbs || [])
    .map((db) => db?.name)
    .filter((name): name is string => typeof name === "string" && name.length > 0)
    .map(
     (name) =>
      new Promise<void>((resolve) => {
       try {
        const req = indexedDB.deleteDatabase(name)
        req.onsuccess = () => resolve()
        req.onerror = () => resolve()
        req.onblocked = () => resolve()
       } catch {
        resolve()
       }
      }),
    ),
  )
 } catch {
  // ignore
 }
}

export const factoryResetAll = async (): Promise<void> => {
 // Clear storage first.
 try {
  localStorage.clear()
 } catch {
  // ignore
 }
 try {
  sessionStorage.clear()
 } catch {
  // ignore
 }
 clearCookies()

 // Clear other persistence layers.
 await Promise.all([
  clearServiceWorkerCaches(),
  unregisterServiceWorkers(),
  clearIndexedDb(),
 ])

 // Belt-and-suspenders: attempt logout after wiping.
 try {
  unifiedAuth.logout()
 } catch {
  // ignore
 }

 await clearYouTubeAnalyticsCache()
 await clearCanonicalSyncDb()
 dispatchLocalDataChanged()
}
