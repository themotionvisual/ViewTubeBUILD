// TEST-ONLY — see ./types.ts. Not importable by shipped application code.

import { fallbackContext } from "../../../context/GlobalDataContextTypes"
import { getVtSyncSnapshot, type VtSyncSnapshot } from "../../../features/vt-sync-local"
import {
 buildAIBrainContextSnapshot,
 type AIBrainContextSnapshot,
} from "../../aiBrainCommandInterface"
import { buildCreatorGrowthContext } from "../../aiBrainConversationStore"
import type { BrainGoldenChannelFixture, GoldenChannelSpec, GoldenVideoSpec } from "./types"

const uniq = (values: string[]): string[] => Array.from(new Set(values.map((v) => v.trim()).filter(Boolean)))

/** Build a metric object out of only the fields the spec actually supplies. */
const videoMetrics = (video: GoldenVideoSpec): Record<string, number> => {
 const metrics: Record<string, number> = {}
 const set = (key: string, value: number | null | undefined) => {
  if (typeof value === "number" && Number.isFinite(value)) metrics[key] = value
 }
 set("views", video.views)
 set("watchTime", video.watchTime)
 set("ctr", video.ctr)
 set("averagePercentageViewed", video.retention)
 set("subscribersGained", video.subscribersGained)
 set("revenue", video.revenue)
 return metrics
}

/**
 * Turn a spec into a VtSyncSnapshot. An empty channel is modeled as `source:
 * "empty"` with no videos so the real evidence pipeline reports missing data rather
 * than fabricated zeros.
 */
const specToVtSyncSnapshot = (spec: GoldenChannelSpec): VtSyncSnapshot => {
 const base = getVtSyncSnapshot()
 if (spec.videos.length === 0) {
  return {
   ...base,
   source: "empty",
   snapshotId: `golden-${spec.id}`,
   capturedAt: "2026-07-28T00:00:00.000Z",
   channelId: spec.id,
   channelName: spec.channelName,
   channelDescription: spec.channelDescription,
   videos: [],
   searchTerms: [],
  }
 }
 return {
  ...base,
  source: "vt-sync",
  snapshotId: `golden-${spec.id}`,
  capturedAt: "2026-07-28T00:00:00.000Z",
  channelId: spec.id,
  channelName: spec.channelName,
  channelDescription: spec.channelDescription,
  videos: spec.videos.map((video) => ({
   id: video.id,
   title: video.title,
   publishedAt: video.publishedAt,
   format: video.format,
   descriptionSnippet: spec.channelDescription,
   tags: video.tags,
   topics: video.tags,
   category: video.tags[0],
   metrics: videoMetrics(video),
  })) as VtSyncSnapshot["videos"],
  searchTerms: (spec.searchTerms || []).map((term, index) => ({
   term,
   views: 900 - index * 100,
  })) as VtSyncSnapshot["searchTerms"],
  syncManifest: {
   run_id: `golden-run-${spec.id}`,
   stop_reason: "completed",
   bundles_completed: [],
   bundles_failed: [],
   diagnostics: [],
  } as unknown as VtSyncSnapshot["syncManifest"],
 }
}

/**
 * Materialize a spec into a fixture by running the real snapshot + growth-context
 * builders, so a fixture can never drift from how the Brain actually reads a channel.
 *
 * `expectedEvidenceTokens` are derived from THIS channel's own titles and inferred
 * clusters (plus any explicit additions), never from a fixed niche list, so the
 * quality checks stay topic-neutral and cannot privilege the seed niches.
 */
export const buildGoldenChannelFixture = (spec: GoldenChannelSpec): BrainGoldenChannelFixture => {
 const vtSyncSnapshot = specToVtSyncSnapshot(spec)
 const brainMemory = {
  ...fallbackContext.getBrainMemory(),
  futureStateMap: spec.goal || "",
  contentDNA: spec.contentPreference || "",
 }
 const brain = {
  ...fallbackContext.brain,
  futureStateMap: spec.goal || fallbackContext.brain.futureStateMap,
  contentDNA: spec.contentPreference || fallbackContext.brain.contentDNA,
 }
 const authState = {
  ...fallbackContext.authState,
  channelId: spec.id,
  channelName: spec.channelName,
  subscriberCount: spec.subscriberCount ?? null,
  totalViews: spec.totalViews ?? null,
 }
 const channelConnection = {
  ...fallbackContext.channelConnection,
  isConnected: spec.videos.length > 0,
  hasLocalData: spec.videos.length > 0,
 }

 const snapshot: AIBrainContextSnapshot = buildAIBrainContextSnapshot({
  brain,
  authState,
  channelConnection,
  brainMemory,
  vtSyncSnapshot,
 })
 const growthContext = buildCreatorGrowthContext(snapshot)

 const derivedExpected = [
  ...spec.videos.slice(0, 3).map((video) => video.title),
  ...snapshot.inferredProfile.topicClusters.slice(0, 4),
 ]

 return {
  id: spec.id,
  label: spec.label,
  snapshot,
  growthContext,
  expectedEvidenceTokens: uniq([...(spec.expectedEvidenceTokens || []), ...derivedExpected]),
  forbiddenEvidenceTokens: uniq(spec.forbiddenEvidenceTokens || []),
  missingEvidence: uniq([...(spec.missingEvidence || []), ...snapshot.evidencePack.missingInputs]),
 }
}
