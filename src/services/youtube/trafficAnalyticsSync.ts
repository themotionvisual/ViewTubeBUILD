import {
 ANALYTICS_URL,
 REPORTING_URL,
 handleYouTubeApiError,
 proxyFetch,
 refreshTokenIfExpired,
 YouTubeApiError,
} from "./youtubeApiClient"

export type TrafficTableType =
 | "traffic_overview"
 | "traffic_daily_by_type"
 | "traffic_video_by_type"
 | "traffic_detail_by_type"
 | "traffic_reporting_bulk"
 | "unknown"

export type TrafficSourceOrigin =
 | "analytics_api"
 | "reporting_api"
 | "csv"
 | "merged"

export type TrafficDiagnosticSeverity = "info" | "warning" | "error"

export type NormalizedTrafficRow = {
 trafficTableType: TrafficTableType
 date?: string
 videoId?: string
 countryCode?: string
 trafficSourceType?: string
 trafficSourceDetail?: string
 sourceLabel?: string
 sourceTitle?: string
 sourceVideoId?: string
 sourceOrigin: TrafficSourceOrigin
 views?: number
 watchHours?: number
 watchMinutes?: number
 averageViewDuration?: number
 engagedViews?: number
 averagePercentageViewed?: number
 impressions?: number
 ctr?: number
 premiumViews?: number
 premiumWatchHours?: number
 playlistWatchHours?: number
 viewsFromPlaylist?: number
 viewsPerPlaylistStart?: number
 raw?: Record<string, unknown>
}

export type TrafficDiagnosticEntry = {
 code: string
 severity: TrafficDiagnosticSeverity
 message: string
 requestShape?: string
 sourceType?: string
 status?: number
 reason?: string
}

export type TrafficDiagnostics = {
 fetchedAt: number
 unavailableMetrics: string[]
 unsupportedDetailTypes: string[]
 rowLimits: Record<string, number>
 sourceCoverage: {
  analyticsApiRows: number
  reportingRows: number
  csvRows: number
  mergedRows: number
 }
 entries: TrafficDiagnosticEntry[]
}

export type TrafficAnalyticsSyncOptions = {
 startDate: string
 endDate: string
 channelId?: string
 targetVideoIds?: string[]
 countryCode?: string
 includeReporting?: boolean
 reportingMode?: "diagnose" | "discover" | "create_if_missing"
 detailVideoLimit?: number
}

export type TrafficAnalyticsSyncResult = {
 trafficOverview: NormalizedTrafficRow[]
 trafficDailyByType: NormalizedTrafficRow[]
 trafficVideoByType: NormalizedTrafficRow[]
 trafficDetailByType: NormalizedTrafficRow[]
 trafficReportingBulk: NormalizedTrafficRow[]
 trafficDiagnostics: TrafficDiagnostics
 rawReports: {
  overview?: any
  dailyByType?: any
  videoByType?: any
  searchDetails?: any[]
  externalDetails?: any[]
 }
}

const TRAFFIC_REPORT_TYPE_ID = "channel_traffic_source_a3"
const MAX_VIDEO_FILTER_IDS = 25

const UNSUPPORTED_ANALYTICS_DETAIL_TYPES = [
 "END_SCREEN",
 "NOTIFICATION",
 "CAMPAIGN_CARD",
 "VIDEO_REMIXES",
 "NO_LINK_EMBEDDED",
]

const TRAFFIC_SOURCE_LABELS: Record<string, string> = {
 "1": "Advertising",
 "3": "Browse Features",
 "4": "Channel Pages",
 "5": "YouTube Search",
 "7": "Suggested Videos",
 "9": "External",
 "18": "Shorts Feed",
 "20": "End Screens",
 ADVERTISING: "Advertising",
 SUBSCRIBER: "Browse Features",
 YT_CHANNEL: "Channel Pages",
 YT_SEARCH: "YouTube Search",
 RELATED_VIDEO: "Suggested Videos",
 YT_RELATED: "Suggested Videos",
 EXT_URL: "External",
 SHORTS: "Shorts Feed",
 SHORTS_CONTENT_LINKS: "Shorts Content Links",
 END_SCREEN: "End Screens",
}

const NUMERIC_TRAFFIC_TYPE_TO_CANONICAL: Record<string, string> = {
 "1": "ADVERTISING",
 "3": "SUBSCRIBER",
 "4": "YT_CHANNEL",
 "5": "YT_SEARCH",
 "7": "RELATED_VIDEO",
 "9": "EXT_URL",
 "18": "SHORTS",
 "20": "END_SCREEN",
}

const text = (value: unknown): string => String(value ?? "").trim()

const numberFromUnknown = (value: unknown): number | undefined => {
 if (value === null || value === undefined || value === "") return undefined
 if (typeof value === "number") return Number.isFinite(value) ? value : undefined
 const parsed = Number(String(value).replace(/[$,%\s]/g, ""))
 return Number.isFinite(parsed) ? parsed : undefined
}

const chunk = <T>(values: T[], size: number): T[][] => {
 const out: T[][] = []
 for (let index = 0; index < values.length; index += size) {
  out.push(values.slice(index, index + size))
 }
 return out
}

export const normalizeTrafficSourceType = (value: unknown): string => {
 const raw = text(value)
 if (!raw) return ""
 const upper = raw.toUpperCase()
 return NUMERIC_TRAFFIC_TYPE_TO_CANONICAL[upper] || upper
}

export const trafficSourceLabel = (value: unknown): string => {
 const raw = text(value)
 if (!raw) return "Unknown"
 const canonical = normalizeTrafficSourceType(raw)
 return TRAFFIC_SOURCE_LABELS[raw] || TRAFFIC_SOURCE_LABELS[canonical] || raw
}

const parseSourceVideoId = (value: unknown): string | undefined => {
 const raw = text(value)
 const match = raw.match(/^(?:YT_RELATED|RELATED_VIDEO|SHORTS_CONTENT_LINKS)\.([A-Za-z0-9_-]{6,})$/i)
 return match?.[1]
}

const headersForPayload = (payload: any): string[] =>
 Array.isArray(payload?.columnHeaders)
  ? payload.columnHeaders.map((header: any) => text(header?.name))
  : []

export const reportToRecords = (payload: any): Record<string, unknown>[] => {
 const headers = headersForPayload(payload)
 if (!headers.length || !Array.isArray(payload?.rows)) return []
 return payload.rows
  .filter((row: unknown) => Array.isArray(row))
  .map((row: any[]) =>
   headers.reduce<Record<string, unknown>>((record, header, index) => {
    record[header] = row[index]
    return record
   }, {}),
  )
}

const mapCommonTrafficFields = (
 record: Record<string, unknown>,
 tableType: TrafficTableType,
 origin: TrafficSourceOrigin,
): NormalizedTrafficRow => {
 const trafficSourceType =
  normalizeTrafficSourceType(
   record.insightTrafficSourceType ||
    record.traffic_source_type ||
    record["Traffic source type"] ||
    record.trafficSourceType,
  ) || undefined
 const trafficSourceDetail =
  text(
   record.insightTrafficSourceDetail ||
    record.traffic_source_detail ||
    record["Traffic source"] ||
    record.trafficSourceDetail,
  ) || undefined
 const watchMinutes =
  numberFromUnknown(record.estimatedMinutesWatched) ??
  numberFromUnknown(record.watch_time_minutes)
 const averageViewDuration =
  numberFromUnknown(record.averageViewDuration) ??
  numberFromUnknown(record.average_view_duration_seconds)

 return {
  trafficTableType: tableType,
  date: text(record.day || record.date) || undefined,
  videoId: text(record.video || record.video_id || record.videoId) || undefined,
  countryCode: text(record.country || record.country_code || record.countryCode) || undefined,
  trafficSourceType,
  trafficSourceDetail,
  sourceLabel: trafficSourceDetail
   ? trafficSourceLabel(trafficSourceDetail)
   : trafficSourceLabel(trafficSourceType),
  sourceTitle: trafficSourceDetail,
  sourceVideoId: parseSourceVideoId(trafficSourceDetail),
  sourceOrigin: origin,
  views: numberFromUnknown(record.views),
  watchMinutes,
  watchHours:
   numberFromUnknown(record["Watch time (hours)"]) ??
   (watchMinutes !== undefined ? watchMinutes / 60 : undefined),
  averageViewDuration,
  raw: record,
 }
}

export const normalizeAnalyticsTrafficPayload = (
 payload: any,
 tableType: TrafficTableType,
): NormalizedTrafficRow[] =>
 reportToRecords(payload).map((record) =>
  mapCommonTrafficFields(record, tableType, "analytics_api"),
 )

export const normalizeReportingTrafficPayload = (payload: any): NormalizedTrafficRow[] =>
 reportToRecords(payload).map((record) =>
  mapCommonTrafficFields(record, "traffic_reporting_bulk", "reporting_api"),
 )

const buildAnalyticsUrl = (params: Record<string, string>): string => {
 const search = new URLSearchParams(params)
 return `${ANALYTICS_URL}/reports?${search.toString()}`
}

const fetchAnalyticsReport = async (
 token: string,
 params: Record<string, string>,
 defaultMessage: string,
) => {
 const response = await proxyFetch(buildAnalyticsUrl(params), {
  headers: { Authorization: `Bearer ${token}` },
 })
 if (!response.ok) await handleYouTubeApiError(response, defaultMessage)
 return response.json()
}

const addDiagnostic = (
 diagnostics: TrafficDiagnostics,
 entry: TrafficDiagnosticEntry,
) => {
 diagnostics.entries.push(entry)
}

const captureFailure = (
 diagnostics: TrafficDiagnostics,
 requestShape: string,
 error: unknown,
) => {
 addDiagnostic(diagnostics, {
  code: "traffic_request_failed",
  severity: "warning",
  message:
   error instanceof Error
    ? error.message
    : `Traffic request failed for ${requestShape}`,
  requestShape,
  status:
   typeof error === "object" && error && "code" in error
    ? Number((error as { code?: unknown }).code)
    : undefined,
  reason:
   typeof error === "object" && error && "reason" in error
    ? text((error as { reason?: unknown }).reason)
    : undefined,
 })
}

const discoverTrafficReportingJob = async (
 token: string,
 diagnostics: TrafficDiagnostics,
 reportingMode: NonNullable<TrafficAnalyticsSyncOptions["reportingMode"]>,
) => {
 if (reportingMode === "diagnose") {
  addDiagnostic(diagnostics, {
   code: "reporting_api_not_run",
   severity: "info",
   message:
    "Reporting API traffic bulk sync is available when reporting jobs and scopes are configured.",
   requestShape: TRAFFIC_REPORT_TYPE_ID,
  })
  return null
 }

 try {
  const jobsResponse = await proxyFetch(`${REPORTING_URL}/jobs`, {
   headers: { Authorization: `Bearer ${token}` },
  })
  if (!jobsResponse.ok) {
   await handleYouTubeApiError(jobsResponse, "Failed to discover traffic reporting jobs")
  }
  const jobsPayload = await jobsResponse.json()
  const jobs = Array.isArray(jobsPayload?.jobs) ? jobsPayload.jobs : []
  const existing = jobs.find((job: any) => job?.reportTypeId === TRAFFIC_REPORT_TYPE_ID)
  if (existing?.id) return existing

  if (reportingMode !== "create_if_missing") {
   addDiagnostic(diagnostics, {
    code: "reporting_job_missing",
    severity: "info",
    message: "No channel_traffic_source_a3 Reporting API job exists yet.",
    requestShape: TRAFFIC_REPORT_TYPE_ID,
   })
   return null
  }

  const createResponse = await proxyFetch(`${REPORTING_URL}/jobs`, {
   method: "POST",
   headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
   },
   body: JSON.stringify({
    reportTypeId: TRAFFIC_REPORT_TYPE_ID,
    name: "ViewTube Traffic Source Bulk Sync",
   }),
  })
  if (!createResponse.ok) {
   await handleYouTubeApiError(createResponse, "Failed to create traffic reporting job")
  }
  return createResponse.json()
 } catch (error) {
  captureFailure(diagnostics, "reporting_api_job_discovery", error)
  return null
 }
}

export const syncTrafficAnalytics = async (
 options: TrafficAnalyticsSyncOptions,
): Promise<TrafficAnalyticsSyncResult> => {
 const token = await refreshTokenIfExpired()
 if (!token) {
  throw new YouTubeApiError(
   "Your YouTube session has expired or is invalid. Please reconnect your channel in Settings.",
   401,
   "authError",
  )
 }

 const diagnostics: TrafficDiagnostics = {
  fetchedAt: Date.now(),
  unavailableMetrics: [
   "engagedViews",
   "averagePercentageViewed",
   "impressions",
   "ctr",
   "premiumViews",
   "premiumWatchHours",
   "playlistWatchHours",
   "viewsFromPlaylist",
   "viewsPerPlaylistStart",
  ],
  unsupportedDetailTypes: [...UNSUPPORTED_ANALYTICS_DETAIL_TYPES],
  rowLimits: {
   ytSearchDetailPerRequest: 10,
   externalDetailPerRequest: 25,
   videoFilterIdsPerRequest: MAX_VIDEO_FILTER_IDS,
  },
  sourceCoverage: {
   analyticsApiRows: 0,
   reportingRows: 0,
   csvRows: 0,
   mergedRows: 0,
  },
  entries: UNSUPPORTED_ANALYTICS_DETAIL_TYPES.map((sourceType) => ({
   code: "unsupported_detail_type",
   severity: "info",
   message: `${sourceType} detail rows are not queried through Analytics API v2 because the request shape is known to be unsupported or unreliable.`,
   sourceType,
  })),
 }

 const idParam = options.channelId ? `channel==${options.channelId}` : "channel==MINE"
 const rawReports: TrafficAnalyticsSyncResult["rawReports"] = {}
 let trafficOverview: NormalizedTrafficRow[] = []
 let trafficDailyByType: NormalizedTrafficRow[] = []
 let trafficVideoByType: NormalizedTrafficRow[] = []
 const trafficDetailByType: NormalizedTrafficRow[] = []
 const trafficReportingBulk: NormalizedTrafficRow[] = []

 try {
  rawReports.overview = await fetchAnalyticsReport(
   token,
   {
    ids: idParam,
    startDate: options.startDate,
    endDate: options.endDate,
    metrics: "views,estimatedMinutesWatched",
    dimensions: "insightTrafficSourceType",
    sort: "-views",
   },
   "Failed to fetch traffic overview",
  )
  trafficOverview = normalizeAnalyticsTrafficPayload(
   rawReports.overview,
   "traffic_overview",
  )
 } catch (error) {
  captureFailure(diagnostics, "insightTrafficSourceType overview", error)
 }

 try {
  rawReports.dailyByType = await fetchAnalyticsReport(
   token,
   {
    ids: idParam,
    startDate: options.startDate,
    endDate: options.endDate,
    metrics: "views,estimatedMinutesWatched",
    dimensions: "day,insightTrafficSourceType",
    sort: "day",
   },
   "Failed to fetch daily traffic by source",
  )
  trafficDailyByType = normalizeAnalyticsTrafficPayload(
   rawReports.dailyByType,
   "traffic_daily_by_type",
  )
 } catch (error) {
  captureFailure(diagnostics, "day,insightTrafficSourceType", error)
 }

 const targetVideoIds = Array.from(
  new Set((options.targetVideoIds || []).map((id) => text(id)).filter(Boolean)),
 ).slice(0, options.detailVideoLimit || 50)

 if (targetVideoIds.length > 0) {
  const videoByTypeReports: any[] = []
  for (const ids of chunk(targetVideoIds, MAX_VIDEO_FILTER_IDS)) {
   try {
    const payload = await fetchAnalyticsReport(
     token,
     {
      ids: idParam,
      startDate: options.startDate,
      endDate: options.endDate,
      metrics: "views,estimatedMinutesWatched,averageViewDuration",
      dimensions: "video,insightTrafficSourceType",
      filters: `video==${ids.join(",")}`,
      maxResults: "200",
     },
     "Failed to fetch video traffic by source",
    )
    videoByTypeReports.push(payload)
    trafficVideoByType.push(
     ...normalizeAnalyticsTrafficPayload(payload, "traffic_video_by_type"),
    )
   } catch (error) {
    captureFailure(diagnostics, "video,insightTrafficSourceType", error)
   }
  }
  rawReports.videoByType = videoByTypeReports

  const searchDetails: any[] = []
  const externalDetails: any[] = []
  for (const ids of chunk(targetVideoIds, MAX_VIDEO_FILTER_IDS)) {
   try {
    const payload = await fetchAnalyticsReport(
     token,
     {
      ids: idParam,
      startDate: options.startDate,
      endDate: options.endDate,
      metrics: "views",
      dimensions: "insightTrafficSourceDetail",
      filters: `video==${ids.join(",")};insightTrafficSourceType==YT_SEARCH`,
      sort: "-views",
      maxResults: "10",
     },
     "Failed to fetch YouTube Search traffic detail",
    )
    searchDetails.push(payload)
    trafficDetailByType.push(
     ...normalizeAnalyticsTrafficPayload(payload, "traffic_detail_by_type").map(
      (row) => ({
       ...row,
       trafficSourceType: "YT_SEARCH",
       sourceLabel: row.trafficSourceDetail || row.sourceLabel,
      }),
     ),
    )
   } catch (error) {
    captureFailure(diagnostics, "YT_SEARCH insightTrafficSourceDetail", error)
   }

   try {
    const payload = await fetchAnalyticsReport(
     token,
     {
      ids: idParam,
      startDate: options.startDate,
      endDate: options.endDate,
      metrics: "estimatedMinutesWatched,views",
      dimensions: "insightTrafficSourceDetail",
      filters: `video==${ids.join(",")};insightTrafficSourceType==EXT_URL`,
      sort: "-estimatedMinutesWatched",
      maxResults: "25",
     },
     "Failed to fetch External traffic detail",
    )
    externalDetails.push(payload)
    trafficDetailByType.push(
     ...normalizeAnalyticsTrafficPayload(payload, "traffic_detail_by_type").map(
      (row) => ({
       ...row,
       trafficSourceType: "EXT_URL",
       sourceLabel: row.trafficSourceDetail || row.sourceLabel,
      }),
     ),
    )
   } catch (error) {
    captureFailure(diagnostics, "EXT_URL insightTrafficSourceDetail", error)
   }
  }
  rawReports.searchDetails = searchDetails
  rawReports.externalDetails = externalDetails
 }

 if (options.includeReporting) {
  const reportingJob = await discoverTrafficReportingJob(
   token,
   diagnostics,
   options.reportingMode || "diagnose",
  )
  if (reportingJob?.id) {
   addDiagnostic(diagnostics, {
    code: "reporting_job_discovered",
    severity: "info",
    message:
     "Traffic Reporting API job discovered. Report download normalization is ready for CSV-like bulk rows when download URLs are available.",
    requestShape: TRAFFIC_REPORT_TYPE_ID,
   })
  }
 } else {
  addDiagnostic(diagnostics, {
   code: "reporting_api_deferred",
   severity: "info",
   message:
    "Reporting API bulk traffic sync is deferred until the user enables reporting enrichment.",
   requestShape: TRAFFIC_REPORT_TYPE_ID,
  })
 }

 diagnostics.sourceCoverage.analyticsApiRows =
  trafficOverview.length +
  trafficDailyByType.length +
  trafficVideoByType.length +
  trafficDetailByType.length
 diagnostics.sourceCoverage.reportingRows = trafficReportingBulk.length
 diagnostics.sourceCoverage.mergedRows =
  diagnostics.sourceCoverage.analyticsApiRows + trafficReportingBulk.length

 return {
  trafficOverview,
  trafficDailyByType,
  trafficVideoByType,
  trafficDetailByType,
  trafficReportingBulk,
  trafficDiagnostics: diagnostics,
  rawReports,
 }
}
