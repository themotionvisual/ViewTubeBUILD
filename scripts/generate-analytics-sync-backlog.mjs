import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"

const repoRoot = resolve(new URL("..", import.meta.url).pathname)
const coverageCatalogPath = resolve(repoRoot, "src", "services", "dataCoverageCatalog.ts")
const outputPath = resolve(repoRoot, "docs", "analytics", "video-metric-sync-backlog.json")

const ACTIVE_VIDEO_SYNC_METRICS = new Set([
  "views",
  "estimatedMinutesWatched",
  "averageViewDuration",
  "averageViewPercentage",
  "subscribersGained",
  "likes",
  "comments",
  "shares",
  "engagedViews",
  "subscribersLost",
  "dislikes",
  "cardImpressions",
  "cardClicks",
  "videoThumbnailImpressions",
  "videoThumbnailImpressionsClickRate",
  "estimatedRevenue",
  "estimatedAdRevenue",
  "rpm",
  "cpm",
  "monetizedPlaybacks",
  "playbackBasedCpm",
  "adImpressions",
  "annotationClickThroughRate",
  "annotationCloseRate",
  "redViews",
  "estimatedRedPartnerRevenue",
])

const UNSYNCABLE_VIDEO_METRICS = new Set(["casualViewers", "regularViewers", "newViewers", "returningViewers", "uniqueViewers"])

const text = readFileSync(coverageCatalogPath, "utf8")
const re = /\{ categoryName: "([^"]+)", canonicalKey: "([^"]+)", source: mapSource\("[^"]+"\), scope: mapScope\("([^"]+)"\), rawName: "([^"]+)" \}/g

const matrix = []
const dedupe = new Set()
for (const m of text.matchAll(re)) {
  const metric = m[2]
  const scope = m[3]
  if (!["video_shared", "short_only", "long_only", "channel", "geo", "demographic", "traffic", "device", "monetization", "daily", "history"].includes(scope)) {
    continue
  }
  const key = `${metric}::${scope}`
  if (dedupe.has(key)) continue
  dedupe.add(key)

  let sourceCapability = "api"
  let reasonCode = "api_supported"
  if (["video_shared", "short_only", "long_only"].includes(scope)) {
    if (UNSYNCABLE_VIDEO_METRICS.has(metric)) {
      sourceCapability = "csv_only"
      reasonCode = "csv_or_sheet_only"
    } else if (!ACTIVE_VIDEO_SYNC_METRICS.has(metric)) {
      sourceCapability = metric.includes("formula") || metric.includes("derived") ? "derived" : "unsupported"
      reasonCode = sourceCapability === "derived" ? "formula_derived" : "not_in_active_sync"
    }
  }

  matrix.push({
    metric,
    scope,
    sourceCapability,
    reasonCode,
  })
}

const backlog = matrix
  .filter((row) => ["video_shared", "short_only", "long_only"].includes(row.scope))
  .map((row) => ({
    metric: row.metric,
    scope: row.scope,
    status: ACTIVE_VIDEO_SYNC_METRICS.has(row.metric) ? "active_sync" : "missing_from_active_sync",
    nextAction: ACTIVE_VIDEO_SYNC_METRICS.has(row.metric)
      ? "keep_in_current_sync"
      : row.sourceCapability === "csv_only"
        ? "keep_import_only_and_label_provenance"
        : "add_metric_group_or_compat_fetch",
    requiredEndpoint: "youtube_analytics_v2",
    requiredDimensions: row.scope === "short_only" ? ["video", "creatorContentType=SHORTS"] : row.scope === "long_only" ? ["video", "creatorContentType=VIDEO"] : ["video"],
    grain: "video",
    fallbackBehavior: row.sourceCapability === "derived" ? "derive_if_inputs_exist" : "mark_unavailable",
  }))

const bigQueryReadmePath = resolve(repoRoot, "..", "docs", "DATA_ANALYTICS", "youtube-bigquery-pipeline-main", "README.md")
let tableHints = []
if (existsSync(bigQueryReadmePath)) {
  const txt = readFileSync(bigQueryReadmePath, "utf8")
  tableHints = ["video_metadata", "daily_video_stats", "daily_video_analytics", "daily_traffic_sources"].filter((name) => txt.includes(name))
}

mkdirSync(dirname(outputPath), { recursive: true })
writeFileSync(outputPath, JSON.stringify({
  generatedAt: new Date().toISOString(),
  bigQueryAudit: { mode: "read_only", sourcePath: bigQueryReadmePath, tableHints },
  summary: {
    matrixCount: matrix.length,
    videoBacklogCount: backlog.length,
    missingCount: backlog.filter((item) => item.status === "missing_from_active_sync").length,
  },
  matrix,
  backlog,
}, null, 2))

console.log(`Wrote ${outputPath}`)
