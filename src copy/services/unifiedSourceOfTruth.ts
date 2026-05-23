import type { AnalyticsWindow, CanonicalMetricKey, CanonicalVideoRow, MetricSource } from "./analyticsContract"

export type AvailabilityClass = "public" | "owner" | "content_owner" | "derived" | "unavailable"
export type VerificationStatus = "single_verified" | "double_verified" | "triple_verified"

export interface CanonicalFactRow {
  channel_id: string
  video_id: string
  date: string
  metric_name: CanonicalMetricKey
  metric_value: number | null
  source_system: MetricSource | "owner_upload" | "projection"
  window_signature: string
  availability: AvailabilityClass
  fingerprint: string
  verification_status: VerificationStatus
}

export interface CanonicalConflictRow {
  key: string
  metric_name: CanonicalMetricKey
  winner_source: CanonicalFactRow["source_system"]
  loser_source: CanonicalFactRow["source_system"]
  winner_value: number | null
  loser_value: number | null
  reason: "owner_precedence" | "api_fallback" | "projection_non_authoritative"
}

export interface VideoMetadataEnrichedRow {
  video_id: string
  title?: string
  category_id?: string | null
  category_name?: string | null
  tags: string[]
  description?: string
  default_language?: string | null
  default_audio_language?: string | null
  source: "youtube_data_api_v3" | "owner_upload_override"
  sampled_at: string
  auth_scope_used: "public" | "channel_owner" | "content_owner"
  override_reason?: string
  verified_status: VerificationStatus
}

export interface UnifiedLedgerBuildInput {
  channelId: string
  window: AnalyticsWindow
  apiRows: CanonicalVideoRow[]
  ownerRows: CanonicalVideoRow[]
  nowIso?: string
}

export interface UnifiedLedgerBuildOutput {
  facts: CanonicalFactRow[]
  conflicts: CanonicalConflictRow[]
}

const OWNER_ONLY_METRICS: CanonicalMetricKey[] = [
  "stw",
  "ctr",
  "uniqueViewers",
  "newViewers",
  "regularViewers",
  "casualViewers",
  "engagedViews",
]

const PROJECTION_METRICS: CanonicalMetricKey[] = ["views", "watchHours", "revenue", "ctr", "engagedViews"]

const toDate = (input: string): string => {
  const d = new Date(input)
  if (Number.isNaN(d.getTime())) return ""
  return d.toISOString().slice(0, 10)
}

const numericOrNull = (v: unknown): number | null => {
  if (typeof v === "number" && Number.isFinite(v)) return v
  return null
}

const metricKeysOf = (row: CanonicalVideoRow): CanonicalMetricKey[] =>
  Object.keys(row.metrics) as CanonicalMetricKey[]

const rowDate = (row: CanonicalVideoRow): string => toDate(row.uploadDate)

const stableSerialize = (value: unknown): string => {
  if (value === null || value === undefined) return ""
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value)
  }
  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableSerialize(entry)).join(",")}]`
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>
    return `{${Object.keys(obj)
      .sort()
      .map((key) => `${key}:${stableSerialize(obj[key])}`)
      .join(",")}}`
  }
  return String(value)
}

export const buildWindowSignature = (
  channelId: string,
  window: AnalyticsWindow,
  date: string,
): string => `${channelId}::${window}::${date || "undated"}`

export const buildFactFingerprint = (row: Omit<CanonicalFactRow, "fingerprint">): string => {
  return stableSerialize([
    row.channel_id,
    row.video_id,
    row.date,
    row.metric_name,
    row.metric_value,
    row.source_system,
    row.window_signature,
    row.availability,
  ])
}

const precedenceRank = (source: CanonicalFactRow["source_system"]): number => {
  if (source === "owner_upload") return 3
  if (source === "api") return 2
  if (source === "hybrid") return 2
  if (source === "csv_table") return 2
  if (source === "ga4") return 2
  return 1
}

const availabilityFor = (
  source: CanonicalFactRow["source_system"],
  metric: CanonicalMetricKey,
): AvailabilityClass => {
  if (OWNER_ONLY_METRICS.includes(metric)) {
    if (source === "owner_upload") return "owner"
    return "unavailable"
  }
  if (source === "projection") return "derived"
  if (source === "ga4") return "derived"
  if (source === "owner_upload") return "owner"
  return "public"
}

const verificationFor = (sourceCount: number, historicalConsistent: boolean): VerificationStatus => {
  if (sourceCount >= 3 && historicalConsistent) return "triple_verified"
  if (sourceCount >= 2) return "double_verified"
  return "single_verified"
}

const makeFact = (
  channelId: string,
  window: AnalyticsWindow,
  row: CanonicalVideoRow,
  metric: CanonicalMetricKey,
  source: CanonicalFactRow["source_system"],
): CanonicalFactRow | null => {
  const date = rowDate(row)
  if (!row.videoId || !date) return null
  const metricCell = row.metrics[metric]
  const metricValue = numericOrNull(metricCell?.value)
  const availability = availabilityFor(source, metric)
  const base: Omit<CanonicalFactRow, "fingerprint"> = {
    channel_id: channelId,
    video_id: row.videoId,
    date,
    metric_name: metric,
    metric_value: metricValue,
    source_system: source,
    window_signature: buildWindowSignature(channelId, window, date),
    availability,
    verification_status: "single_verified",
  }
  return {
    ...base,
    fingerprint: buildFactFingerprint(base),
  }
}

const factKey = (row: CanonicalFactRow): string =>
  `${row.channel_id}::${row.video_id}::${row.date}::${row.metric_name}::${row.window_signature}`

export const buildUnifiedLedger = (input: UnifiedLedgerBuildInput): UnifiedLedgerBuildOutput => {
  const candidateFacts: CanonicalFactRow[] = []
  const conflicts: CanonicalConflictRow[] = []

  input.apiRows.forEach((row) => {
    metricKeysOf(row).forEach((metric) => {
      const fact = makeFact(input.channelId, input.window, row, metric, row.sourceMode)
      if (fact) candidateFacts.push(fact)
    })
  })

  input.ownerRows.forEach((row) => {
    metricKeysOf(row).forEach((metric) => {
      const fact = makeFact(input.channelId, input.window, row, metric, "owner_upload")
      if (fact) candidateFacts.push(fact)
    })
  })

  const merged = new Map<string, CanonicalFactRow>()
  const evidence = new Map<string, Set<string>>()

  candidateFacts.forEach((fact) => {
    const key = factKey(fact)
    const current = merged.get(key)
    if (!current) {
      merged.set(key, fact)
      evidence.set(key, new Set([fact.source_system]))
      return
    }

    evidence.get(key)?.add(fact.source_system)

    const currentRank = precedenceRank(current.source_system)
    const nextRank = precedenceRank(fact.source_system)
    if (nextRank > currentRank) {
      conflicts.push({
        key,
        metric_name: fact.metric_name,
        winner_source: fact.source_system,
        loser_source: current.source_system,
        winner_value: fact.metric_value,
        loser_value: current.metric_value,
        reason: fact.source_system === "owner_upload" ? "owner_precedence" : "api_fallback",
      })
      merged.set(key, fact)
      return
    }

    if (nextRank === currentRank && current.source_system === "projection") {
      conflicts.push({
        key,
        metric_name: fact.metric_name,
        winner_source: current.source_system,
        loser_source: fact.source_system,
        winner_value: current.metric_value,
        loser_value: fact.metric_value,
        reason: "projection_non_authoritative",
      })
    }
  })

  const output = Array.from(merged.entries()).map(([key, fact]) => {
    const sourceCount = evidence.get(key)?.size || 1
    const historicalConsistent = fact.metric_value !== null && fact.metric_value >= 0
    return {
      ...fact,
      verification_status: verificationFor(sourceCount, historicalConsistent),
    }
  })

  return {
    facts: output,
    conflicts,
  }
}

export interface YouTubeStyleProjection {
  tableRows: Record<string, unknown>[]
  chartRows: Record<string, unknown>[]
  totalsRows: Array<{ Date: string; [metric: string]: string | number }>
}

export const buildYouTubeStyleProjection = (
  rows: CanonicalVideoRow[],
  metric: CanonicalMetricKey = "engagedViews",
): YouTubeStyleProjection => {
  const tableRows: Record<string, unknown>[] = []
  const chartRows: Record<string, unknown>[] = []
  const totalsByDate = new Map<string, number>()
  const metricLabel = metric === "revenue" ? "Estimated revenue (USD)" : metric === "engagedViews" ? "Engaged views" : "Views"

  rows.forEach((row) => {
    const date = rowDate(row)
    if (!date || !row.videoId) return
    const metricValue = numericOrNull(row.metrics[metric]?.value) ?? 0
    const views = numericOrNull(row.metrics.views?.value) ?? 0
    const watchHours = numericOrNull(row.metrics.watchHours?.value) ?? 0
    const ctr = numericOrNull(row.metrics.ctr?.value)

    tableRows.push({
      Content: row.videoId,
      "Video title": row.title,
      "Video publish time": row.uploadDate,
      Duration: row.durationSeconds,
      Views: views,
      "Watch time (hours)": watchHours,
      "Impressions click-through rate (%)": ctr ?? "",
      [metricLabel]: metricValue,
    })

    chartRows.push({
      Date: date,
      Content: row.videoId,
      "Video title": row.title,
      "Video publish time": row.uploadDate,
      Duration: row.durationSeconds,
      [metricLabel]: metricValue,
    })

    totalsByDate.set(date, (totalsByDate.get(date) || 0) + metricValue)
  })

  const totalsRows = Array.from(totalsByDate.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, value]) => ({ Date: date, [metricLabel]: value }))

  return { tableRows, chartRows, totalsRows }
}

export const selectAuthoritativeOwnerRows = (rows: CanonicalVideoRow[]): CanonicalVideoRow[] => {
  return rows.filter((row) => {
    const metricKeys = metricKeysOf(row)
    return metricKeys.some((metric) => OWNER_ONLY_METRICS.includes(metric))
  })
}

export const getProjectionMetrics = (): CanonicalMetricKey[] => [...PROJECTION_METRICS]
