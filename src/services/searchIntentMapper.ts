import {
 createViewTubeActionPacket,
 getViewTubeToolCapability,
 persistViewTubeActionPacket,
} from "./viewTubeToolChains"

export type SearchIntentKind = "EXPLAIN" | "COMPARE" | "DISCOVER"
export type SearchIntentDatasetState = "ready" | "missing" | "withheld" | "zero" | "stale" | "error"
export type SearchIntentCoverage = "matched" | "unanswered"

export interface SearchIntentTermInput {
 term: string
 views?: number | null
 watchTime?: number | null
 videoId?: string | null
 source: string
 observedAt: string
 coverageStatus?: "complete" | "partial" | "unavailable" | "unsupported" | null
}

export interface SearchIntentVideoCoverageInput {
 videoId: string
 title: string
 tags?: string[]
}

export interface SearchIntentMappedTerm {
 term: string
 intent: SearchIntentKind
 observedViews: number
 watchTime: number | null
 videoId: string | null
 matchedVideoIds: string[]
 coverage: SearchIntentCoverage
 matchReason: "direct-video" | "catalog-title" | "none"
 source: string
 observedAt: string
 evidenceId: string
}

export interface SearchIntentCluster {
 id: string
 intent: SearchIntentKind
 label: string
 terms: SearchIntentMappedTerm[]
 observedViews: number
 coveragePct: number
 matchedCount: number
 unansweredCount: number
 evidenceIds: string[]
 topTerm: string
}

const STOP_WORDS = new Set([
 "a","an","and","are","as","at","be","did","do","does","for","from","how","i","in","is","it",
 "of","on","or","the","to","was","were","what","when","where","which","who","why","with",
])

const normalize = (value: string) => value
 .toLowerCase()
 .normalize("NFKD")
 .replace(/[\u0300-\u036f]/g, "")
 .replace(/[^a-z0-9]+/g, " ")
 .trim()

const tokens = (value: string) => normalize(value)
 .split(/\s+/)
 .filter(Boolean)
 .filter(token => !STOP_WORDS.has(token))

const numeric = (value: number | null | undefined) => {
 const parsed = Number(value)
 return Number.isFinite(parsed) ? parsed : 0
}

export const classifySearchIntent = (query: string): SearchIntentKind => {
 const value = ` ${normalize(query)} `
 if (/\b(vs|versus|compare|comparison|difference|different|better|best|top|review|reviews)\b/.test(value)) return "COMPARE"
 if (/\b(how|why|what|when|where|who|explained|explain|guide|tutorial|meaning|history)\b/.test(value)) return "EXPLAIN"
 return "DISCOVER"
}

export const resolveSearchIntentDatasetState = (input: {
 rows: readonly unknown[]
 freshnessStatus?: "synced" | "partial" | "placeholder" | "stale" | "failed" | null
 searchTrafficViews?: number | null
}): SearchIntentDatasetState => {
 if (input.freshnessStatus === "failed") return "error"
 if (input.freshnessStatus === "stale") return "stale"
 if (input.rows.length > 0) return "ready"
 if (!input.freshnessStatus || input.freshnessStatus === "placeholder") return "missing"
 if ((numeric(input.searchTrafficViews)) > 0) return "withheld"
 return "zero"
}

const evidenceIdFor = (row: SearchIntentTermInput) =>
 `${row.source}|${row.observedAt}|${normalize(row.term)}`

const explicitCatalogMatch = (
 row: SearchIntentTermInput,
 videos: SearchIntentVideoCoverageInput[],
): { ids: string[]; reason: SearchIntentMappedTerm["matchReason"] } => {
 const direct = row.videoId
  ? videos.find(video => video.videoId === row.videoId)
  : null
 if (direct) return { ids: [direct.videoId], reason: "direct-video" }

 const queryTokens = tokens(row.term)
 if (!queryTokens.length) return { ids: [], reason: "none" }
 const matched = videos.filter(video => {
  const titleAndTags = new Set(tokens([video.title, ...(video.tags || [])].join(" ")))
  return queryTokens.every(token => titleAndTags.has(token))
 })
 return matched.length
  ? { ids: matched.map(video => video.videoId), reason: "catalog-title" }
  : { ids: [], reason: "none" }
}

export const buildSearchIntentClusters = (
 rows: SearchIntentTermInput[],
 videos: SearchIntentVideoCoverageInput[],
): SearchIntentCluster[] => {
 const grouped = new Map<SearchIntentKind, SearchIntentMappedTerm[]>()

 rows.forEach(row => {
  const term = row.term.trim()
  if (!term) return
  const intent = classifySearchIntent(term)
  const match = explicitCatalogMatch(row, videos)
  const mapped: SearchIntentMappedTerm = {
   term,
   intent,
   observedViews: Math.max(0, numeric(row.views)),
   watchTime: row.watchTime == null ? null : Math.max(0, numeric(row.watchTime)),
   videoId: row.videoId || null,
   matchedVideoIds: match.ids,
   coverage: match.ids.length ? "matched" : "unanswered",
   matchReason: match.reason,
   source: row.source,
   observedAt: row.observedAt,
   evidenceId: evidenceIdFor(row),
  }
  const current = grouped.get(intent) || []
  current.push(mapped)
  grouped.set(intent, current)
 })

 return [...grouped.entries()]
  .map(([intent, intentTerms]) => {
   const sorted = [...intentTerms].sort((left, right) =>
    right.observedViews - left.observedViews || left.term.localeCompare(right.term)
   )
   const matchedCount = sorted.filter(term => term.coverage === "matched").length
   const observedViews = sorted.reduce((sum, term) => sum + term.observedViews, 0)
   return {
    id: `intent:${intent.toLowerCase()}`,
    intent,
    label: `${intent} INTENT`,
    terms: sorted,
    observedViews,
    coveragePct: sorted.length ? Math.round((matchedCount / sorted.length) * 100) : 0,
    matchedCount,
    unansweredCount: sorted.length - matchedCount,
    evidenceIds: sorted.map(term => term.evidenceId),
    topTerm: sorted[0]?.term || intent,
   }
  })
  .sort((left, right) => right.observedViews - left.observedViews || left.intent.localeCompare(right.intent))
}

export const createSearchIntentProjectHandoff = (input: {
 cluster: SearchIntentCluster
 channelId?: string | null
}) => {
 const target = getViewTubeToolCapability("project-calendar")
 if (!target) throw new Error("Projects handoff capability is unavailable.")
 const unanswered = input.cluster.terms.filter(term => term.coverage === "unanswered")
 const packet = createViewTubeActionPacket({
  sourceToolId: "search-intent-mapper",
  sourceKind: "widget",
  payloadKind: "project",
  title: `Search gap: ${unanswered[0]?.term || input.cluster.topTerm}`,
  summary: `${input.cluster.intent} search cluster with ${input.cluster.unansweredCount} unanswered observed term${input.cluster.unansweredCount === 1 ? "" : "s"} and ${input.cluster.coveragePct}% explicit catalog coverage.`,
  payload: {
   intent: input.cluster.intent,
   clusterId: input.cluster.id,
   topTerm: input.cluster.topTerm,
   terms: input.cluster.terms.map(term => ({
    term: term.term,
    observedViews: term.observedViews,
    coverage: term.coverage,
    matchedVideoIds: term.matchedVideoIds,
    source: term.source,
    observedAt: term.observedAt,
    evidenceId: term.evidenceId,
   })),
   coveragePct: input.cluster.coveragePct,
   observedViews: input.cluster.observedViews,
   rule: "Observed YouTube search terms only. Observed views are channel-attributed search views, not public search volume.",
  },
  channelId: input.channelId || null,
  evidence: input.cluster.evidenceIds,
  provenance: [
   "VT-SYNC search_terms",
   "Search Intent Mapper deterministic intent rules",
   "explicit video association/catalog-title coverage",
  ],
  suggestedTargets: ["project-calendar"],
 })
 persistViewTubeActionPacket(packet)
 const separator = target.route.includes("?") ? "&" : "?"
 return {
  packet,
  route: `${target.route}${separator}handoff=${encodeURIComponent(packet.id)}`,
 }
}
