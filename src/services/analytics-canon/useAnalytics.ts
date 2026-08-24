// React hooks over the canonical analytics adapter. Consumers should
// almost always use these instead of calling the adapter directly —
// they subscribe to VT Sync snapshot mutations, memoize per-window, and
// stay stable when the underlying data hasn't changed.
//
// Migration usage:
//   OLD:
//     const rows = getMasterRows("28d", "hybrid", brain.csvFiles)
//     const summary = getMetricSummary("28d", "hybrid", brain.csvFiles)
//   NEW:
//     const rows = useCanonicalRows("28d")
//     const summary = useCanonicalMetricSummary("28d")
//
// The old signatures required brain.csvFiles for CSV hybrid mode — that
// entire code path is going away with the migration. All data flows
// through vt-sync now, so consumers no longer manage CSV bookkeeping.

import { useMemo, useSyncExternalStore } from "react"
import {
 getVtSyncSnapshot,
 getVtSyncSnapshotVersion,
 subscribeToVtSyncSnapshot,
} from "../../features/vt-sync-local/adapters/snapshot"
import type { AnalyticsWindow, CanonicalVideoRow, MetricSummary, WindowTotals } from "./contracts"
import {
 getCanonicalRowsFromVtSync,
 getMetricSummaryFromVtSync,
 getWindowTotalsFromVtSync,
} from "./vtSyncAdapter"

/**
 * Live subscription to the VT Sync snapshot version — every consumer
 * ends up here. useSyncExternalStore guarantees a re-render exactly
 * when the snapshot version bumps, no more, no less.
 */
const useVtSyncSnapshotVersion = (): number =>
 useSyncExternalStore(
  subscribeToVtSyncSnapshot,
  getVtSyncSnapshotVersion,
  getVtSyncSnapshotVersion,
 )

/**
 * Canonical rows for a window. Memoized on snapshot version so a stable
 * snapshot returns a stable reference — downstream `React.memo`
 * boundaries can rely on that.
 */
export const useCanonicalRows = (window: AnalyticsWindow): CanonicalVideoRow[] => {
 const version = useVtSyncSnapshotVersion()
 return useMemo(
  () => getCanonicalRowsFromVtSync(getVtSyncSnapshot(), window),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [version, window],
 )
}

/**
 * Canonical metric summary for a window. Same memoization strategy.
 */
export const useCanonicalMetricSummary = (window: AnalyticsWindow): MetricSummary => {
 const version = useVtSyncSnapshotVersion()
 return useMemo(
  () => getMetricSummaryFromVtSync(getVtSyncSnapshot(), window),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [version, window],
 )
}

/**
 * Thin per-window totals (views, watchHours, subs, revenue, ctr) — the
 * shape most stat blocks / hero widgets need.
 */
export const useCanonicalWindowTotals = (window: AnalyticsWindow): WindowTotals => {
 const version = useVtSyncSnapshotVersion()
 return useMemo(
  () => getWindowTotalsFromVtSync(getVtSyncSnapshot(), window),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [version, window],
 )
}

/**
 * Channel identity slice — pulled from the same snapshot so widgets
 * that display "your channel is X" no longer need GlobalDataContext.
 */
export const useCanonicalChannelIdentity = () => {
 const version = useVtSyncSnapshotVersion()
 return useMemo(() => {
  const snap = getVtSyncSnapshot()
  return {
   channelId: snap?.channelId ?? null,
   channelName: snap?.channelName ?? null,
   channelHandle: snap?.channelCustomUrl ?? null,
   avatarUrl: snap?.avatarUrl ?? null,
   subscriberCount: snap?.subscriberCount ?? null,
   videoCount: snap?.channelVideoCount ?? null,
   totalViews: snap?.channelViewCount ?? null,
   publishedAt: snap?.channelPublishedAt ?? null,
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [version])
}
