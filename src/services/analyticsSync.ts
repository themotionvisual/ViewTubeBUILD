/**
 * YouTube Analytics Sync Service
 * Refactored to be a thin wrapper around SyncCoordinator
 */
import { syncCoordinator } from "./SyncCoordinator"

export const performSync = (
 force = false,
 options: { batchMode?: "initial" | "next" } = {},
) => syncCoordinator.syncYouTube(force, options)

export const startAutoSync = (intervalMinutes = 30) => 
 syncCoordinator.startAutoSync(intervalMinutes)

export const stopAutoSync = () => 
 syncCoordinator.stopAutoSync()
