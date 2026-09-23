import type { VtSyncSnapshot } from "../../features/vt-sync-local/adapters/contracts"
import { getCanonicalIntelligenceDatasetCatalog } from "../analytics-canon"
import {
 lifecycleObservationKey,
 type AlgorithmLifecycleObservation,
} from "./AlgorithmLifecycleCohorts"
import { loadPersistedBrainIntelligence, persistBrainIntelligence } from "./BrainIntelligencePersistence"

const STORAGE_KEY = "vt_algorithm_lifecycle_observations_v1"
export const ALGORITHM_LIFECYCLE_OBSERVATIONS_CHANGED = "vt_algorithm_lifecycle_observations_changed"
const MAX_OBSERVATIONS = 12000

const canUseStorage = () => typeof window !== "undefined" && typeof localStorage !== "undefined"

const numeric = (value: unknown): number | null => {
 if (typeof value === "number" && Number.isFinite(value)) return value
 if (typeof value !== "string" || !value.trim()) return null
 const parsed = Number(value.replace(/[$,% ,]/g, ""))
 return Number.isFinite(parsed) ? parsed : null
}

const timestamp = (value: unknown): number | null => {
 const parsed = Date.parse(String(value || ""))
 return Number.isFinite(parsed) ? parsed : null
}

const read = (): AlgorithmLifecycleObservation[] => {
 if (!canUseStorage()) return []
 try {
  const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
  return Array.isArray(parsed) ? parsed : []
 } catch {
  return []
 }
}

const write = (rows: AlgorithmLifecycleObservation[]) => {
 if (!canUseStorage()) return
 const bounded = rows
  .sort((left, right) => right.observedAt - left.observedAt)
  .slice(0, MAX_OBSERVATIONS)
 localStorage.setItem(STORAGE_KEY, JSON.stringify(bounded))
 window.dispatchEvent(new CustomEvent(ALGORITHM_LIFECYCLE_OBSERVATIONS_CHANGED, { detail: bounded.length }))
}

export const hydrateAlgorithmLifecycleObservations = async (channelId: string) => {
 const persisted = await loadPersistedBrainIntelligence(channelId)
 if (!persisted) return { hydrated: 0 }
 const remote = (persisted.observations || []) as AlgorithmLifecycleObservation[]
 const local = read()
 const byKey = new Map(local.map((row) => [lifecycleObservationKey(row), row]))
 remote.forEach((row) => {
  if (!row?.videoId || row.channelId !== channelId) return
  const key = lifecycleObservationKey(row)
  const current = byKey.get(key)
  if (!current || row.observedAt >= current.observedAt) byKey.set(key, row)
 })
 write([...byKey.values()])
 return { hydrated: remote.length }
}

export const listAlgorithmLifecycleObservations = (input: {
 channelId?: string | null
 videoId?: string | null
 metric?: string | null
} = {}) => read()
 .filter((row) => !input.channelId || row.channelId === input.channelId)
 .filter((row) => !input.videoId || row.videoId === input.videoId)
 .filter((row) => !input.metric || row.metric === input.metric)
 .sort((left, right) => right.observedAt - left.observedAt)

export const upsertAlgorithmLifecycleObservations = (
 observations: AlgorithmLifecycleObservation[],
) => {
 const existing = read()
 const byKey = new Map(existing.map((row) => [lifecycleObservationKey(row), row]))
 observations.forEach((observation) => {
  const key = lifecycleObservationKey(observation)
  const current = byKey.get(key)
  if (!current || observation.observedAt >= current.observedAt) byKey.set(key, observation)
 })
 const next = [...byKey.values()]
 write(next)
 const byChannel = new Map<string, AlgorithmLifecycleObservation[]>()
 observations.forEach((row) => {
  const rows = byChannel.get(row.channelId) || []
  rows.push(row)
  byChannel.set(row.channelId, rows)
 })
 byChannel.forEach((rows, channelId) => {
  void persistBrainIntelligence({ channelId, observations: rows }).catch((error) => {
   console.warn("[AlgorithmLifecycleObservationStore] durable sync deferred:", error)
  })
 })
 return observations
}

const semanticMetricsForVideoRow = (row: Record<string, unknown>) => {
 const views = numeric(row.views)
 const engagedViews = numeric(row.engagedViews)
 const watchQuality = numeric(row.averagePercentageViewed)
  ?? numeric(row.avgPercentageViewed)
  ?? numeric(row.averageViewPercentage)
  ?? numeric(row.avgViewDuration)
  ?? numeric(row.averageViewDuration)
 const ctr = numeric(row.impressionsCtr)
  ?? numeric(row.impressionsClickThroughRate)
  ?? numeric(row.clickThroughRate)
  ?? numeric(row.ctr)
 const metrics: Array<[string, number | null]> = [
  ["views", views],
  ["qualified_views", engagedViews ?? views],
  ["watch_quality", watchQuality],
  ["ctr", ctr],
  ["watch_time", numeric(row.watchTime)],
  ["impressions", numeric(row.impressions)],
  ["revenue", numeric(row.revenue) ?? numeric(row.estimatedRevenue)],
  ["subscribers_gained", numeric(row.subscribersGained)],
  ["likes", numeric(row.likes)],
  ["comments", numeric(row.comments)],
  ["shares", numeric(row.shares)],
 ]
 return metrics.filter((entry): entry is [string, number] => entry[1] != null)
}

/**
 * Captures genuine lifecycle evidence from a canonical VT-SYNC snapshot.
 *
 * A video row is only useful as lifecycle evidence because the snapshot has a
 * concrete capture time and the video has a concrete publish time. We store the
 * actual lifecycle age at capture; we never relabel a current/lifetime total as
 * T+24h or T+72h after the fact.
 */
export const captureCanonicalLifecycleObservations = (input: {
 channelId: string
 snapshot: VtSyncSnapshot
 maximumVideos?: number
}) => {
 const observedAt = timestamp(input.snapshot.capturedAt) ?? Date.now()
 const videos = getCanonicalIntelligenceDatasetCatalog(
  input.snapshot,
  Math.max(1, Math.min(5000, input.maximumVideos || 2000)),
 ).find((dataset) => dataset.id === "videos")
 if (!videos || videos.status === "failed" || videos.status === "unavailable") {
  return { captured: 0, observations: [] as AlgorithmLifecycleObservation[] }
 }

 const observations = videos.sampleRows.flatMap((row, rowIndex) => {
  const videoId = String(row.videoId || row.id || "").trim()
  const publishedAt = timestamp(row.publishedAt || row.published || row.publishDate)
  if (!videoId || publishedAt == null || observedAt < publishedAt) return []
  const lifecycleHour = (observedAt - publishedAt) / 3600000
  if (!Number.isFinite(lifecycleHour) || lifecycleHour < 0) return []
  const format = String(row.format || row.contentType || row.creatorContentType || "").trim() || null
  const durationSeconds = numeric(row.durationSeconds)
  const topicKey = String(row.topicKey || row.topic || row.category || "").trim() || null
  return semanticMetricsForVideoRow(row).map(([metric, value]) => ({
   channelId: input.channelId,
   videoId,
   metric,
   value,
   lifecycleHour,
   observedAt,
   format,
   durationSeconds,
   topicKey,
   evidenceId: `${input.snapshot.snapshotId}:videos:${rowIndex + 1}:${metric}`,
  }))
 })

 upsertAlgorithmLifecycleObservations(observations)
 return { captured: observations.length, observations }
}

export const summarizeAlgorithmLifecycleObservationStore = (channelId: string) => {
 const rows = listAlgorithmLifecycleObservations({ channelId })
 return {
  observations: rows.length,
  videos: new Set(rows.map((row) => row.videoId)).size,
  metrics: [...new Set(rows.map((row) => row.metric))].sort(),
  newestObservationAt: rows[0]?.observedAt || null,
  oldestObservationAt: rows.at(-1)?.observedAt || null,
 }
}
