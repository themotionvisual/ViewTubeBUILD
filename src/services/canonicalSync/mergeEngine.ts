import type {
 AnalyticsWindow,
 CanonicalMergeLedger,
 CanonicalMergeLedgerEntry,
 CanonicalMetricMeta,
 CanonicalMetricValue,
 CanonicalSyncSource,
 CanonicalSyncStage,
 CanonicalVideoRecord,
} from "./contracts"

const toMetricMeta = ({
 value: _value,
 ...meta
}: CanonicalMetricValue): CanonicalMetricMeta => meta

const maxValue = (left: number | null, right: number | null): number | null => {
 if (left === null) return right
 if (right === null) return left
 return Math.max(left, right)
}

export const buildVideoIdentityKey = (channelId: string, videoId: string): string =>
 `${channelId}::${videoId}`

export const buildMergeLedger = (
 channelId: string,
 videoId: string,
 entry?: Partial<CanonicalMergeLedgerEntry>,
): CanonicalMergeLedger => {
 const mergedAt = entry?.mergedAt || new Date().toISOString()
 return {
  identityKey: buildVideoIdentityKey(channelId, videoId),
  lockedVideoId: videoId,
  lockedChannelId: channelId,
  lastMergedAt: mergedAt,
  entries: entry
   ? [
      {
       source: "derived",
       stage: "video_inventory",
       scope: "record",
       ...entry,
       mergedAt,
      },
     ]
   : [],
 }
}

export const appendMergeLedgerEntry = (
 ledger: CanonicalMergeLedger | undefined,
 channelId: string,
 videoId: string,
 entry: CanonicalMergeLedgerEntry,
): CanonicalMergeLedger => {
 const current = ledger || buildMergeLedger(channelId, videoId)
 return {
  ...current,
  lastMergedAt: entry.mergedAt,
  entries: [...current.entries, entry].slice(-20),
 }
}

export const mergeMetricWindowIntoVideoRecord = (
 existing: CanonicalVideoRecord,
 window: AnalyticsWindow,
 metrics: Record<string, CanonicalMetricValue>,
 stage: CanonicalSyncStage,
 source: CanonicalSyncSource,
): CanonicalVideoRecord => {
 const nextWindowValues = { ...(existing.metricsByWindow[window] || {}) }
 const nextWindowMeta = { ...(existing.metricMetaByWindow?.[window] || {}) }
 Object.entries(metrics).forEach(([metricKey, incoming]) => {
  const currentValue = nextWindowValues[metricKey] ?? null
  const nextValue = maxValue(currentValue, incoming.value)
  const currentMeta = nextWindowMeta[metricKey]
  const incomingMeta = toMetricMeta(incoming)
  nextWindowValues[metricKey] = nextValue
  nextWindowMeta[metricKey] =
   currentMeta && currentValue !== null && nextValue === currentValue
    ? currentMeta
    : incomingMeta
 })
 const mergedAt = new Date().toISOString()
 return {
  ...existing,
  metricsByWindow: {
   ...existing.metricsByWindow,
   [window]: nextWindowValues,
  },
  metricMetaByWindow: {
   ...existing.metricMetaByWindow,
   [window]: nextWindowMeta,
  },
  mergeLedger: appendMergeLedgerEntry(existing.mergeLedger, existing.channelId, existing.videoId, {
   mergedAt,
   source,
   stage,
   scope: "metrics",
   metricKeys: Object.keys(metrics),
  }),
  syncedAt: mergedAt,
 }
}

export const mergeVideoRecordIdentity = (
 existing: CanonicalVideoRecord | null,
 incoming: CanonicalVideoRecord,
 stage: CanonicalSyncStage,
 source: CanonicalSyncSource,
 note?: string,
): CanonicalVideoRecord => {
 if (!existing) {
  const mergedAt = new Date().toISOString()
  return {
   ...incoming,
   identityKey: buildVideoIdentityKey(incoming.channelId, incoming.videoId),
   mergeLedger: appendMergeLedgerEntry(
    incoming.mergeLedger,
    incoming.channelId,
    incoming.videoId,
    {
     mergedAt,
     source,
     stage,
     scope: "record",
     note,
    },
   ),
   syncedAt: mergedAt,
  }
 }
 const mergedAt = new Date().toISOString()
 return {
  ...existing,
  ...incoming,
  channelId: existing.channelId,
  videoId: existing.videoId,
  identityKey: existing.identityKey || buildVideoIdentityKey(existing.channelId, existing.videoId),
  metricsByWindow: {
   ...existing.metricsByWindow,
   ...incoming.metricsByWindow,
  },
  metricMetaByWindow: {
   ...existing.metricMetaByWindow,
   ...incoming.metricMetaByWindow,
  },
  mergeLedger: appendMergeLedgerEntry(existing.mergeLedger, existing.channelId, existing.videoId, {
   mergedAt,
   source,
   stage,
   scope: "overlay",
   note,
  }),
  syncedAt: mergedAt,
 }
}
