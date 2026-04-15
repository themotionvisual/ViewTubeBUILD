import { authService } from "./authService"

export const LOCAL_DATA_CHANGED_EVENT = "vt_local_data_changed"

const dispatchLocalDataChanged = () => {
 try {
  window.dispatchEvent(new Event(LOCAL_DATA_CHANGED_EVENT))
 } catch {
  // no-op
 }
}

// Keys that represent large cached payloads or derived sync artifacts.
const SOFT_CLEAR_KEYS: string[] = [
 "yt_analytics_cache",
 "yt_analytics_last_sync",
 "ga4_analytics_cache",
 "ga4_properties_cache",
 "vt_uploaded_csv_cache",
 "vt_video_details_cache_v1",
]

export const clearCachedDataSoft = async (): Promise<void> => {
 SOFT_CLEAR_KEYS.forEach((key) => {
  try {
   localStorage.removeItem(key)
  } catch {
   // ignore
  }
 })

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

 // Clear other persistence layers.
 await Promise.all([clearServiceWorkerCaches(), clearIndexedDb()])

 // Belt-and-suspenders: attempt logout after wiping.
 try {
  authService.logout()
 } catch {
  // ignore
 }

 dispatchLocalDataChanged()
}

