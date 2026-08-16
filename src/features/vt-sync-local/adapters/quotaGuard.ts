import { VT_SYNC_DISABLE_PERFORMANCE_HUB_API_SYNC_KEY } from "./contracts"

const viteEnv = (import.meta as unknown as { env?: Record<string, string | boolean | undefined> }).env || {}

export const isPerformanceHubApiSyncDisabledForVtSyncRepair = (): boolean => {
 const envValue = viteEnv.VITE_DISABLE_PERFORMANCE_HUB_API_SYNC
 const envText = String(envValue || "").toLowerCase()
 if (envText === "false") return false
 const envDisabled = envValue === true || envText === "true"
 const storageValue = typeof window !== "undefined" ? window.localStorage.getItem(VT_SYNC_DISABLE_PERFORMANCE_HUB_API_SYNC_KEY) : null
 if (storageValue === "false") return false
 const storageDisabled = storageValue === "true"
 // Default-on during the VT-SYNC local repair phase so background sync cannot burn quota accidentally.
 return envDisabled || storageDisabled || (envText === "" && storageValue === null)
}

export const VT_SYNC_REPAIR_SYNC_DISABLED_MESSAGE = "Performance Hub API sync is disabled for VT-SYNC local data parity repair."
