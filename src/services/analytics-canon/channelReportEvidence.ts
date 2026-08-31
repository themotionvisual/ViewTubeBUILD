import type {
 ResolvedAnalyticsDataset,
 ResolvedAnalyticsDatasetBundleV2,
 ResolvedAnalyticsRow,
} from "../../features/vt-sync-local/adapters/resolvedAnalyticsBundle"
import type {
 CanonicalIntelligenceSource,
 ChannelReportEvidencePackV2,
 ReportEvidenceItemV2,
 ReportFactV2,
} from "./contracts"

export const CHANNEL_REPORT_EVIDENCE_VERSION = "channel-report-evidence-v2" as const

const canonicalSource = (source: string): CanonicalIntelligenceSource => {
 if (source === "youtube_data_v3" || source === "youtube_analytics_v2" || source === "youtube_reporting_v1") return source
 if (source === "manual_import" || source === "derived") return source
 return "unknown"
}

const numeric = (row: ResolvedAnalyticsRow, keys: string[]): number | undefined => {
 for (const key of keys) {
  const value = row[key]
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string" && value.trim()) {
   const parsed = Number(value.replace(/[$,%\s,]/g, ""))
   if (Number.isFinite(parsed)) return parsed
  }
 }
 return undefined
}

const text = (row: ResolvedAnalyticsRow, keys: string[]): string => {
 for (const key of keys) {
  const value = row[key]
  if (value !== null && value !== undefined && String(value).trim()) return String(value).trim()
 }
 return ""
}

const compactNumber = (value: number): string => new Intl.NumberFormat("en-US", {
 maximumFractionDigits: value >= 100 ? 0 : 2,
}).format(value)

type PackBuilder = {
 facts: ReportFactV2[]
 evidenceIndex: Record<string, ReportEvidenceItemV2>
 sectionFactIds: Record<string, string[]>
 addFact: (input: {
  id: string
  label: string
  statement: string
  value?: string | number | null
  unit?: string
  sectionIds: string[]
  evidenceIds: string[]
  dataset: ResolvedAnalyticsDataset
  formula?: string
  confidence?: number
 }) => void
}

const makeBuilder = (bundle: ResolvedAnalyticsDatasetBundleV2): PackBuilder => {
 const facts: ReportFactV2[] = []
 const evidenceIndex: Record<string, ReportEvidenceItemV2> = {}
 const sectionFactIds: Record<string, string[]> = {}
 return {
  facts,
  evidenceIndex,
  sectionFactIds,
  addFact: (input) => {
   const aggregateId = `agg:${bundle.bundleFingerprint}:${input.id}`
   input.evidenceIds.forEach((evidenceId) => {
    const index = input.dataset.rowProvenance.findIndex((entry) => entry.evidenceId === evidenceId)
    const provenance = input.dataset.rowProvenance[index]
    if (!provenance || evidenceIndex[evidenceId]) return
    evidenceIndex[evidenceId] = {
     id: evidenceId,
     datasetId: input.dataset.id,
     datasetVersion: input.dataset.datasetVersion,
     kind: "row",
     label: provenance.rowIdentity,
     sourceEvidenceIds: [],
     sources: provenance.sources.map(canonicalSource),
     window: provenance.window,
     capturedAt: provenance.capturedAt,
    }
   })
   evidenceIndex[aggregateId] = {
    id: aggregateId,
    datasetId: input.dataset.id,
    datasetVersion: input.dataset.datasetVersion,
    kind: "aggregate",
    label: input.label,
    value: input.value,
    unit: input.unit,
    sourceEvidenceIds: input.evidenceIds,
    sources: input.dataset.sources.map(canonicalSource),
    window: bundle.selectedWindow,
    capturedAt: input.dataset.updatedAt,
    formula: input.formula,
   }
   facts.push({
    id: input.id,
    label: input.label,
    statement: input.statement,
    value: input.value,
    unit: input.unit,
    classification: "fact",
    evidenceIds: [aggregateId],
    confidence: input.confidence ?? (input.dataset.status === "available" ? 1 : 0.75),
    formula: input.formula,
   })
   input.sectionIds.forEach((sectionId) => {
    sectionFactIds[sectionId] = [...(sectionFactIds[sectionId] || []), input.id]
   })
  },
 }
}

const addTotal = (
 builder: PackBuilder,
 dataset: ResolvedAnalyticsDataset | undefined,
 keys: string[],
 factId: string,
 label: string,
 unit: string,
 sectionIds: string[],
): void => {
 if (!dataset?.rows.length) return
 const values = dataset.rows.map((row) => numeric(row, keys)).filter((value): value is number => value !== undefined)
 if (!values.length) return
 const value = values.reduce((total, entry) => total + entry, 0)
 const evidenceIds = dataset.rowProvenance
  .filter((_, index) => numeric(dataset.rows[index], keys) !== undefined)
  .map((entry) => entry.evidenceId)
 builder.addFact({
  id: factId,
  label,
  statement: `${label} is ${compactNumber(value)} for the selected ${dataset.id} evidence.`,
  value,
  unit,
  sectionIds,
  evidenceIds,
  dataset,
  formula: `sum(${keys.join("|")})`,
 })
}

const addTopVideos = (builder: PackBuilder, dataset: ResolvedAnalyticsDataset | undefined): void => {
 if (!dataset?.rows.length) return
 const ranked = dataset.rows
  .map((row, index) => ({ row, index, views: numeric(row, ["views"]) }))
  .filter((entry): entry is { row: ResolvedAnalyticsRow; index: number; views: number } => entry.views !== undefined)
  .sort((left, right) => right.views - left.views)
  .slice(0, 10)
 ranked.forEach((entry, rank) => {
  const title = text(entry.row, ["title", "videoTitle", "name"]) || `Video ${rank + 1}`
  builder.addFact({
   id: `top-video-${rank + 1}`,
   label: `Top video ${rank + 1}`,
   statement: `${title} has ${compactNumber(entry.views)} views in the resolved video dataset.`,
   value: entry.views,
   unit: "views",
   sectionIds: ["executive-summary", "strategy-engine", "comparative-analysis", "growth-sentinel"],
   evidenceIds: [dataset.rowProvenance[entry.index].evidenceId],
   dataset,
   formula: "rank(videos.views desc)",
  })
 })
}

const addFormatFacts = (builder: PackBuilder, dataset: ResolvedAnalyticsDataset | undefined): void => {
 if (!dataset?.rows.length) return
 const groups = new Map<string, Array<{ index: number; views: number }>>()
 dataset.rows.forEach((row, index) => {
  const views = numeric(row, ["views"])
  if (views === undefined) return
  const raw = text(row, ["format", "formatCode", "contentType", "creatorContentType"]).toLowerCase()
  const format = /short/.test(raw) ? "Shorts" : /long|video|upload/.test(raw) ? "Long-form" : "Unknown format"
  groups.set(format, [...(groups.get(format) || []), { index, views }])
 })
 groups.forEach((entries, format) => {
  const total = entries.reduce((sum, entry) => sum + entry.views, 0)
  const average = total / entries.length
  builder.addFact({
   id: `format-${format.toLowerCase().replace(/[^a-z]+/g, "-")}`,
   label: `${format} performance`,
   statement: `${format} has ${compactNumber(total)} total views across ${entries.length} videos, averaging ${compactNumber(average)} views.`,
   value: average,
   unit: "average views",
   sectionIds: ["strategy-engine", "sculpting-engine", "comparative-analysis", "content-velocity"],
   evidenceIds: entries.map((entry) => dataset.rowProvenance[entry.index].evidenceId),
   dataset,
   formula: "sum(views) / video_count grouped by normalized format",
  })
 })
}

const addPackagingFacts = (builder: PackBuilder, dataset: ResolvedAnalyticsDataset | undefined): void => {
 if (!dataset?.rows.length) return
 const candidates = dataset.rows.map((row, index) => ({
  row,
  index,
  ctr: numeric(row, ["ctr", "impressionsCtr", "impressionsClickThroughRate"]),
  retention: numeric(row, ["averagePercentageViewed", "averageViewPercentage", "avgViewPercentage"]),
 })).filter((entry): entry is typeof entry & { ctr: number; retention: number } => entry.ctr !== undefined && entry.retention !== undefined)
 if (candidates.length < 2) return
 const ctrBaseline = candidates.reduce((sum, entry) => sum + entry.ctr, 0) / candidates.length
 const retentionBaseline = candidates.reduce((sum, entry) => sum + entry.retention, 0) / candidates.length
 candidates.slice(0, 30).forEach((entry, index) => {
  const title = text(entry.row, ["title", "videoTitle"]) || `Video ${index + 1}`
  const quadrant = entry.ctr >= ctrBaseline
   ? entry.retention >= retentionBaseline ? "high CTR / high retention" : "high CTR / low retention"
   : entry.retention >= retentionBaseline ? "low CTR / high retention" : "low CTR / low retention"
  builder.addFact({
   id: `packaging-${index + 1}`,
   label: "Packaging and payoff",
   statement: `${title} is ${quadrant} relative to this channel's resolved-video baselines (${compactNumber(entry.ctr)}% CTR, ${compactNumber(entry.retention)}% average viewed).`,
   value: quadrant,
   sectionIds: ["algorithm-diagnosis", "sculpting-engine", "retention-burnout", "honesty-scale", "weakness-audit"],
   evidenceIds: [dataset.rowProvenance[entry.index].evidenceId],
   dataset,
   formula: "compare CTR and average percentage viewed with channel-local format-inclusive means",
  })
 })
}

const addTopDimension = (
 builder: PackBuilder,
 dataset: ResolvedAnalyticsDataset | undefined,
 factId: string,
 label: string,
 dimensionKeys: string[],
 valueKeys: string[],
 unit: string,
 sectionIds: string[],
): void => {
 if (!dataset?.rows.length) return
 const ranked = dataset.rows.map((row, index) => ({ row, index, value: numeric(row, valueKeys) }))
  .filter((entry): entry is { row: ResolvedAnalyticsRow; index: number; value: number } => entry.value !== undefined)
  .sort((left, right) => right.value - left.value)
  .slice(0, 10)
 ranked.forEach((entry, rank) => {
  const dimension = text(entry.row, dimensionKeys) || `${label} ${rank + 1}`
  builder.addFact({
   id: `${factId}-${rank + 1}`,
   label,
   statement: `${dimension} has ${compactNumber(entry.value)} ${unit} in ${dataset.label}.`,
   value: entry.value,
   unit,
   sectionIds,
   evidenceIds: [dataset.rowProvenance[entry.index].evidenceId],
   dataset,
   formula: `rank(${valueKeys.join("|")} desc)`,
  })
 })
}

export const buildChannelReportEvidencePack = (
 bundle: ResolvedAnalyticsDatasetBundleV2,
): ChannelReportEvidencePackV2 => {
 const builder = makeBuilder(bundle)
 const videos = bundle.datasets.videos
 addTotal(builder, bundle.datasets.channel_totals || bundle.datasets.daily, ["views"], "channel-views", "Views", "views", ["executive-summary", "comparative-analysis", "growth-trajectory"])
 addTotal(builder, bundle.datasets.channel_totals || bundle.datasets.daily, ["watchTime", "estimatedMinutesWatched"], "channel-watch-time", "Watch time", "hours", ["executive-summary", "retention-burnout"])
 addTotal(builder, bundle.datasets.channel_totals || bundle.datasets.daily, ["subscribersGained", "subscribers"], "subscribers-gained", "Subscribers gained", "subscribers", ["executive-summary", "engagement-matrix"])
 addTotal(builder, bundle.datasets.revenue, ["revenue", "estimatedRevenue", "adRevenue"], "revenue-total", "Revenue", "currency units", ["executive-summary", "revenue-dynamics", "monetization-engine"])
 addTopVideos(builder, videos)
 addFormatFacts(builder, videos)
 addPackagingFacts(builder, videos)
 addTopDimension(builder, bundle.datasets.traffic, "traffic-source", "Traffic source", ["term", "trafficSource", "source"], ["views", "watchTime"], "views", ["algorithm-diagnosis", "strategy-engine", "engagement-matrix"])
 addTopDimension(builder, bundle.datasets.traffic_detail_search_terms, "search-term", "Search term", ["term", "searchTerm", "query"], ["views", "watchTime"], "views", ["keyword-matrix"])
 addTopDimension(builder, bundle.datasets.geography, "country", "Audience country", ["countryName", "countryCode", "country"], ["views", "watchTime"], "views", ["channel-pulse"])
 addTopDimension(builder, bundle.datasets.devices, "device", "Device", ["deviceType", "term", "device"], ["views", "watchTime"], "views", ["channel-pulse"])

 const missingInputs = bundle.datasetOrder
  .filter((id) => ["videos", "daily", "traffic", "retentions", "revenue", "demographics"].includes(id))
  .filter((id) => !bundle.datasets[id] || ["unavailable", "failed"].includes(bundle.datasets[id].status))
  .map((id) => `${id} evidence is unavailable for this report window.`)

 return {
  version: CHANNEL_REPORT_EVIDENCE_VERSION,
  channelId: bundle.channelId,
  snapshotId: bundle.snapshotId,
  selectedWindow: bundle.selectedWindow as ChannelReportEvidencePackV2["selectedWindow"],
  bundleFingerprint: bundle.bundleFingerprint,
  privacyFingerprint: bundle.privacyFingerprint,
  datasets: bundle.datasetOrder.map((id) => {
   const dataset = bundle.datasets[id]
   return {
    id,
    datasetVersion: dataset.datasetVersion,
    status: dataset.status,
    rowCount: dataset.rowCount,
    sources: dataset.sources.map(canonicalSource),
    updatedAt: dataset.updatedAt,
    missingMetrics: dataset.missingMetrics,
   }
  }),
  facts: builder.facts,
  sectionFactIds: builder.sectionFactIds,
  evidenceIndex: builder.evidenceIndex,
  contradictions: [],
  missingInputs,
 }
}

