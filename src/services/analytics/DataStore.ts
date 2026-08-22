// --- BEGIN canonicalAnalyticsStore.ts ---

export type CanonicalMetricAvailability = "available" | "unavailable"

export interface CanonicalMetricValue {
 value: number | null
 availability: CanonicalMetricAvailability
 confidence: MetricConfidence
 reasonCode?: string
 lineage?: {
  sourceField?: string
  formulaId?: string
  inputMetrics?: CanonicalMetricKey[]
 }
}

export interface DatasetMetricCapability {
 metric: string
 status: "available" | "unsupported"
 reasonCode?: string
 source?: "api" | "csv"
}

export interface CanonicalDatasetWindow {
 window: AnalyticsWindow
 rows: CanonicalVideoRow[]
 syncedAt: number | null
 startDate?: string
 endDate?: string
}

export interface CanonicalDataset {
 channelLifetime: {
  startDate?: string
  endDate?: string
  syncedAt: number | null
 }
 videosLifetime: CanonicalVideoRow[]
 windows: Partial<Record<AnalyticsWindow, CanonicalDatasetWindow>>
 capabilities: Partial<Record<AnalyticsWindow, DatasetMetricCapability[]>>
 syncMeta: {
  lastSynced: number | null
  source: MetricSource
 }
}

export interface ChartDefinition {
 id: string
 requiredMetrics: CanonicalMetricKey[]
 acceptedConfidences: MetricConfidence[]
 minCoverage?: number
 failClosedBehavior: "show_missing_metrics_panel" | "hide_chart"
}

const YT_ANALYTICS_CACHE_KEY = "yt_analytics_cache"
const warnedStorageReads = new Set<string>()

export interface LedgerEntry {
 source: "youtube_analytics_v2" | "youtube_data_v3" | "google_search_console" | "ga4"
 context:
  | "channel"
  | "video"
  | "traffic_source"
  | "traffic_daily"
  | "traffic_video"
  | "search_console"
  | "geography"
  | "demographics"
  | "device_os"
  | "ad_type"
  | "sharing_service"
  | "subscription_status"
  | "subscription_source"
  | "subscriber_detail"
  | "creator_content_type"
  | "playlist"
  | "retention"
 dimensions: string[]
 metrics: string[]
 payload: any // Exactly as it comes from API
 syncedAt: number
 window?: AnalyticsWindow
}

export type RawAnalyticsCache = Record<string, unknown> & {
 analyticsByWindow?: Partial<
  Record<
   AnalyticsWindow,
   {
    startDate?: string
    endDate?: string
    fetchedAt?: number
    report?: unknown
   }
  >
 >
 metricCapabilitiesByWindow?: Partial<
  Record<AnalyticsWindow, DatasetMetricCapability[]>
 >
 videoContentType?: Record<string, string>
 videoContentTypeStatus?: {
  status: "available" | "quarantined"
  requestClass: "channel_creator_content_type"
  idsTried: string[]
  disabledForSession: boolean
  rowCount: number
  reason?: string
  fetchedAt?: number
 }
 lastSyncedByWindow?: Partial<Record<AnalyticsWindow, number>>
 lastSynced?: number
 syncRunSummary?: {
  runAt: string
  cacheBytesBefore: number
  cacheBytesAfter: number
  videoCount: number
  statsCount: number
  dataApiCallCounts: unknown
  warning?: string
  analyticsVerification?: {
   window: AnalyticsWindow
   thumbnailMetrics: {
    impressionsAvailable: boolean
    ctrAvailable: boolean
    requestShapeHealthy: boolean
    failureEvents: number
    quarantinedFailures: number
    suppressedRetries: number
   }
   creatorContentType: {
    status: "available" | "quarantined"
    disabledForSession: boolean
    rowCount: number
    reason?: string
   }
  }
 }
 ledger?: Record<string, LedgerEntry>
}

const safeParse = <T>(raw: string | null, fallback: T): T => {
 if (!raw) return fallback
 try {
  return JSON.parse(raw) as T
 } catch {
  return fallback
 }
}

export const markDeprecatedLocalStorageRead = (
 caller: string,
 key = YT_ANALYTICS_CACHE_KEY,
): void => {
 const warningKey = `${caller}::${key}`
 if (warnedStorageReads.has(warningKey)) return
 warnedStorageReads.add(warningKey)
 console.warn(
  `[canonical-store] Deprecated direct localStorage read detected in ${caller}. Use canonical analytics store selectors instead.`,
 )
}

export const readYouTubeAnalyticsCache = (): RawAnalyticsCache =>
  safeParse<RawAnalyticsCache>(localStorage.getItem(YT_ANALYTICS_CACHE_KEY), {})

export const readGA4AnalyticsCache = (): Record<string, unknown> =>
  safeParse<Record<string, unknown>>(localStorage.getItem("ga4_analytics_cache"), {})

/**
 * @deprecated Use canonical analytics store selectors from analyticsSelectors.ts if possible.
 * For lower-level access, this is the official store-based reader.
 */
export const getCanonicalAnalyticsCache = (): RawAnalyticsCache => readYouTubeAnalyticsCache()

export const writeYouTubeAnalyticsCache = (cache: RawAnalyticsCache): void => {
 localStorage.setItem(YT_ANALYTICS_CACHE_KEY, JSON.stringify(cache))
}

export const hasYouTubeAnalyticsCache = (
 cache: RawAnalyticsCache = readYouTubeAnalyticsCache(),
): boolean =>
 Boolean(
  cache.lastSynced ||
   (Array.isArray(cache.videos) && cache.videos.length > 0) ||
   (cache.profile && typeof cache.profile === "object") ||
   (cache.ledger && Object.keys(cache.ledger).length > 0),
 )

export const clearYouTubeAnalyticsCache = async (): Promise<void> => {
 try {
  localStorage.removeItem(YT_ANALYTICS_CACHE_KEY)
 } catch {
  // no-op
 }
 try {
  sessionStorage.removeItem(YT_ANALYTICS_CACHE_KEY)
 } catch {
  // no-op
 }
}

/**
 * The dominant method to record API data.
 * Differentiates metrics with same names by namespacing the dimension.
 */
export const updateCanonicalAnalyticsCache = async (updates: Partial<RawAnalyticsCache>): Promise<void> => {
  const cache = readYouTubeAnalyticsCache()
  const next = { ...cache, ...updates }
  writeYouTubeAnalyticsCache(next)
}

/**
 * Commits raw API or CSV data into the canonical storage.
 * This ensures that for any channel, the 'Ground Truth' data is saved properly.
 */
export const commitToCanonicalAnalyticsStore = (
  channelId: string, 
  data: any, 
  source: 'api' | 'csv' = 'api'
) => {
  console.log(`[Store] Committing ${source} data for channel: ${channelId}`);
  
  // Logic to merge data into the global state/ledger
  const timestamp = new Date().toISOString();
  
  // Standardizing the payload
  const payload = {
    ...data,
    lastUpdated: timestamp,
    dataSource: source
  };

  // Dispatch global event for UI components to listen to
  window.dispatchEvent(new CustomEvent('canonical_store_updated', {
    detail: { channelId, payload }
  }));

  // If using localStorage as a backup
  localStorage.setItem(`yt_canonical_${channelId}`, JSON.stringify(payload));
};

export const upsertLedgerEntry = (
 cache: RawAnalyticsCache,
 entry: Omit<LedgerEntry, "syncedAt">,
): RawAnalyticsCache => {
 const ledger = { ...(cache.ledger || {}) }
 const windowPart = entry.window ? `::${entry.window}` : ""
 const key = `${entry.source}::${entry.context}::${entry.dimensions.join(",")}${windowPart}`
 ledger[key] = { ...entry, syncedAt: Date.now() }
 return { ...cache, ledger }
}

export const getWindowCapabilityReason = (
 cache: RawAnalyticsCache,
 window: AnalyticsWindow,
 metric: string,
): string | null => {
 const capabilities = cache.metricCapabilitiesByWindow?.[window]
 if (!Array.isArray(capabilities)) return null
 const match = capabilities.find((cap) => cap.metric === metric)
 if (!match || match.status !== "unsupported") return null
 return match.reasonCode || "api_unsupported"
}

export const buildCanonicalMetricValue = (
 value: number | null,
 status: MetricStatus,
 confidence: MetricConfidence,
 reasonCode?: string,
 sourceField?: string,
 formulaId?: string,
 inputMetrics?: CanonicalMetricKey[],
): CanonicalMetricValue => {
 const availability: CanonicalMetricAvailability =
  status === "unavailable" || value === null ? "unavailable" : "available"
 return {
  value,
  availability,
  confidence,
  reasonCode,
  lineage:
   sourceField || formulaId || (inputMetrics && inputMetrics.length > 0)
    ? {
       sourceField,
       formulaId,
       inputMetrics,
      }
    : undefined,
 }
}

// --- END canonicalAnalyticsStore.ts ---

// --- BEGIN analyticsContract.ts ---
export type AnalyticsWindow = "7d" | "28d" | "90d" | "365d" | "lifetime"

export const ANALYTICS_WINDOWS: AnalyticsWindow[] = [
 "lifetime",
 "365d",
 "90d",
 "28d",
 "7d",
]

export type MetricStatus = "actual" | "derived" | "unavailable"
export type MetricSource = "api" | "csv_table" | "ga4" | "hybrid"
export type MetricAvailability = "available" | "unavailable"
export type MetricConfidence = "raw_direct" | "derived_exact" | "unavailable"
export type CanonicalRowCoverageState =
 | "api_only"
 | "csv_only"
 | "hybrid_complete"
 | "hybrid_partial"
export type CanonicalRowMatchConfidence =
 | "exact_video_id"
 | "title_only_fallback"
 | "unmatched"
export type CanonicalFormatConfidence =
 | "high"
 | "medium"
 | "low"
 | "unknown"
export type MasterMetricArbitrationPolicy =
 | "api_authoritative"
 | "csv_authoritative"
 | "net_from_csv"
 | "csv_preferred_if_api_missing"
 | "compare_only"

export type CanonicalMetricKey =
 | "views"
 | "watchHours"
 | "likes"
 | "dislikes"
 | "comments"
 | "shares"
 | "saves"
 | "subscribersGained"
 | "subscribersLost"
 | "subscribersNet"
 | "impressions"
 | "revenue"
 | "cpm"
 | "rpm"
 | "ctr"
 | "newViewers"
 | "returningViewers"
 | "casualViewers"
 | "regularViewers"
 | "uniqueViewers"
 | "avdSeconds"
 | "avp"
 | "engagedViews"
 | "stw"
 | "endScreenClickRate"
 | "endScreenClicks"
 | "endScreenImpressions"
 | "cardClickRate"
 | "cardTeaserClickRate"
 | "cardTeaserClicks"
 | "cardTeaserImpressions"
 | "annotationImpressions"
 | "annotationClickableImpressions"
 | "annotationClosableImpressions"
 | "annotationClicks"
 | "annotationCloses"
 | "redWatchHours"
 | "estimatedAdRevenue"
 | "grossRevenue"
 | "playbackBasedCpm"
 | "adImpressions"
 | "monetizedPlaybacks"
 | "estimatedPremiumRevenue"
 | "endScreenElementClicks"
 | "endScreenElementsShown"
 | "clicksPerEndScreenElementShown"
 | "cardClicks"
 | "cardsShown"
 | "clicksPerCardShown"
 | "hypes"
 | "hypePoints"
 | "remixCount"
 | "remixesOfYourContent"
 | "remixViews"
 | "shortsFunnelPercentWatched"
 | "shortsFunnelSwipeAwayRate"

export interface MetricCell {
 value: number | null
 status: MetricStatus
 source: MetricSource
 availability: MetricAvailability
 confidence: MetricConfidence
 reasonCode?: string
 sourceField?: string
 windowScope?: AnalyticsWindow | "multi" | "unknown"
 sourceClass?: "owner_analytics" | "manual_import" | "reporting_exports" | "derived" | "public_catalog"
 authMode?: "channel_owner" | "content_owner" | "manual" | "reporting" | "unknown"
 officialStatus?: "official" | "imported" | "derived"
 estimatedStatus?: boolean
 mergedStatus?: "finalized" | "estimated" | "blocked"
 finalizedAt?: number
 fetchedAt?: number
 derivedAt?: number
 importedAt?: number
 availabilityReason?: "available" | "unavailable" | "not_requested" | "auth_required"
}

export interface CanonicalMetricDefinition {
 key: CanonicalMetricKey
 label: string
 unit: "count" | "hours" | "seconds" | "currency" | "rate" | "percent"
 apiFieldName: string // Canonical API name from YouTube
 displayVariants: {
  tableHeader: string
  commonName: string
  nickname: string
 }
 aliases: string[]
 rawPolicy: "raw_preferred" | "derived_ok"
 sourceWindows: {
  api: AnalyticsWindow[]
  csv_table: AnalyticsWindow[]
  ga4: AnalyticsWindow[]
 }
}


export interface CanonicalVideoRow {
 id: string
 videoId: string
 title: string
 thumbnailUrl?: string
 uploadDate: string
 format: "shorts" | "long" | "live" | "story" | "unknown"
 durationSeconds: number
 aspectRatioBucket?: "portrait" | "square" | "landscape" | "unknown"
 aspectRatioWidth?: number
 aspectRatioHeight?: number
 aspectRatioSource?: "playerEmbed" | "contentDetails" | "unknown"
 formatDiagnostics?: {
  durationSeconds: number
  contentType: string
  shortsPlaylistSignal: boolean
  metadataShortSignal: boolean
  aspectRatioBucket: "portrait" | "square" | "landscape" | "unknown"
  finalFormat: "shorts" | "long" | "live" | "story" | "unknown"
 }
 coverageState?: CanonicalRowCoverageState
 apiPresent?: boolean
 csvPresent?: boolean
 apiSnapshotTimestamp?: number
 csvImportTimestamp?: number
 formatEvidence?: string[]
 formatConfidence?: CanonicalFormatConfidence
 rowMatchConfidence?: CanonicalRowMatchConfidence
 sourceMode: MetricSource
 metrics: Record<CanonicalMetricKey, MetricCell>
 originalData?: Record<string, unknown>
 supplementalData?: Record<string, unknown>
}

export const METRIC_REGISTRY: Record<CanonicalMetricKey, CanonicalMetricDefinition> = {
  views: {
   key: "views",
   label: "Views",
   unit: "count",
   apiFieldName: "views",
   displayVariants: {
    tableHeader: "Views",
    commonName: "Views",
    nickname: "Views",
   },
   aliases: ["Views", "View count", "views", "viewCount", "screenPageViews"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  watchHours: {
   key: "watchHours",
   label: "Watch Time (Hours)",
   unit: "hours",
   apiFieldName: "estimatedMinutesWatched",
   displayVariants: {
    tableHeader: "Watch Hrs",
    commonName: "Watch Time (Hours)",
    nickname: "Watch Hrs",
   },
   aliases: [
    "Watch Time (Hours)",
    "Watch time (hours)",
    "Watch Hrs",
    "watchHrs",
    "estimatedMinutesWatched",
    "Estimated minutes watched",
    "Watch Min",
    "averageSessionDuration",
   ],
   rawPolicy: "derived_ok",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  likes: {
   key: "likes",
   label: "Likes",
   unit: "count",
   apiFieldName: "likes",
   displayVariants: {
    tableHeader: "Likes +",
    commonName: "Likes",
    nickname: "Likes +",
   },
   aliases: ["Likes", "likes", "likeCount"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  dislikes: {
   key: "dislikes",
   label: "Dislikes",
   unit: "count",
   apiFieldName: "dislikes",
   displayVariants: {
    tableHeader: "Likes -",
    commonName: "Dislikes",
    nickname: "Likes -",
   },
   aliases: ["Dislikes", "dislikes", "dislikeCount"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  comments: {
   key: "comments",
   label: "Comments",
   unit: "count",
   apiFieldName: "comments",
   displayVariants: {
    tableHeader: "Comments",
    commonName: "Comments",
    nickname: "Comments",
   },
   aliases: ["Comments", "comments", "commentCount", "Comments added"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  shares: {
   key: "shares",
   label: "Shares",
   unit: "count",
   apiFieldName: "shares",
   displayVariants: {
    tableHeader: "Shares",
    commonName: "Shares",
    nickname: "Shares",
   },
   aliases: ["Shares", "shares", "shareCount"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  saves: {
   key: "saves",
   label: "Playlist Saves",
   unit: "count",
   apiFieldName: "videosAddedToPlaylists",
   displayVariants: {
    tableHeader: "Playlist Saves",
    commonName: "Playlist Saves",
    nickname: "Saves",
   },
   aliases: ["Playlist Saves", "Saves", "saves", "videosAddedToPlaylists"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  subscribersGained: {
   key: "subscribersGained",
   label: "Subscribers Gained",
   unit: "count",
   apiFieldName: "subscribersGained",
   displayVariants: {
    tableHeader: "Subs +",
    commonName: "Subscribers Gained",
    nickname: "Subs +",
   },
   aliases: [
    "Subscribers Gained",
    "Subscribers gained",
    "subscribersGained",
    "Subs +",
    "activeUsers",
   ],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  subscribersLost: {
   key: "subscribersLost",
   label: "Subscribers Lost",
   unit: "count",
   apiFieldName: "subscribersLost",
   displayVariants: {
    tableHeader: "Subs -",
    commonName: "Subscribers Lost",
    nickname: "Subs -",
   },
   aliases: ["Subscribers Lost", "Subscribers lost", "subscribersLost", "Subs -"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  subscribersNet: {
   key: "subscribersNet",
   label: "Subscribers Net",
   unit: "count",
   apiFieldName: "subscribersNet",
   displayVariants: {
    tableHeader: "Subs Net",
    commonName: "Subscribers Net",
    nickname: "Subs Net",
   },
   aliases: ["Subscribers", "subscribersNet", "Subs Net"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  impressions: {
   key: "impressions",
   label: "Impressions",
   unit: "count",
   apiFieldName: "videoThumbnailImpressions",
   displayVariants: {
    tableHeader: "Impressions",
    commonName: "Impressions",
    nickname: "Impressions",
   },
   aliases: ["Impressions", "videoThumbnailImpressions", "sessions"],
   rawPolicy: "derived_ok",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  revenue: {
   key: "revenue",
   label: "Revenue",
   unit: "currency",
   apiFieldName: "estimatedRevenue",
   displayVariants: {
    tableHeader: "Revenue",
    commonName: "Estimated Revenue",
    nickname: "Revenue",
   },
   aliases: [
    "Revenue",
    "Estimated revenue",
    "Your estimated revenue (USD)",
    "estimatedRevenue",
    "Estimated revenue (USD)",
   ],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  cpm: {
   key: "cpm",
   label: "CPM",
   unit: "currency",
   apiFieldName: "cpm",
   displayVariants: {
    tableHeader: "CPM",
    commonName: "CPM",
    nickname: "CPM",
   },
   aliases: ["CPM", "CPM (USD)", "cpm"],
   rawPolicy: "derived_ok",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  rpm: {
   key: "rpm",
   label: "RPM",
   unit: "currency",
   apiFieldName: "estimatedRevenuePer1000Views", // Using closest, although often derived
   displayVariants: {
    tableHeader: "RPM",
    commonName: "RPM",
    nickname: "RPM",
   },
   aliases: [
    "RPM",
    "RPM (USD)",
    "Estimated RPM",
    "estimatedRevenuePer1000Views",
    "rpm",
   ],
   rawPolicy: "derived_ok",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  ctr: {
   key: "ctr",
   label: "Click-Through Rate (CTR)",
   unit: "percent",
   apiFieldName: "videoThumbnailImpressionsClickRate",
   displayVariants: {
    tableHeader: "CTR",
    commonName: "Click-Through Rate (CTR)",
    nickname: "CTR",
   },
  aliases: [
    "CTR %",
    "CTR (%)",
    "CTR",
    "ctr",
    "Impressions click-through rate",
    "Impressions click-through rate (%)",
    "videoThumbnailImpressionsClickRate",
    "Click-Through Rate (CTR)",
    "clickThroughRate",
   ],
   rawPolicy: "derived_ok",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  newViewers: {
   key: "newViewers",
   label: "New Viewers",
   unit: "count",
   apiFieldName: "newViewers",
   displayVariants: {
    tableHeader: "New",
    commonName: "New Viewers",
    nickname: "New",
   },
   aliases: ["New Viewers", "New viewers", "newViewers"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  returningViewers: {
   key: "returningViewers",
   label: "Returning Viewers",
   unit: "count",
   apiFieldName: "returningViewers",
   displayVariants: {
    tableHeader: "Returning",
    commonName: "Returning Viewers",
    nickname: "Returning",
   },
   aliases: ["Returning Viewers", "Returning viewers", "returningViewers"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  casualViewers: {
   key: "casualViewers",
   label: "Casual viewers",
   unit: "count",
   apiFieldName: "casualViewers",
   displayVariants: {
    tableHeader: "Casual",
    commonName: "Casual viewers",
    nickname: "Casual",
   },
   aliases: ["Casual viewers", "Casual Viewers", "casualViewers"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  regularViewers: {
   key: "regularViewers",
   label: "Regular viewers",
   unit: "count",
   apiFieldName: "regularViewers",
   displayVariants: {
    tableHeader: "Regular",
    commonName: "Regular viewers",
    nickname: "Regular",
   },
   aliases: ["Regular viewers", "Regular Viewers", "regularViewers"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  uniqueViewers: {
   key: "uniqueViewers",
   label: "Unique viewers",
   unit: "count",
   apiFieldName: "uniqueViewers",
   displayVariants: {
    tableHeader: "Unique",
    commonName: "Unique viewers",
    nickname: "Unique",
   },
   aliases: ["Unique viewers", "Unique Viewers", "uniqueViewers", "Unique viewers"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  avdSeconds: {
   key: "avdSeconds",
   label: "AVD (Average View Duration)",
   unit: "seconds",
   apiFieldName: "averageViewDuration",
   displayVariants: {
    tableHeader: "AVD",
    commonName: "AVD (Average View Duration)",
    nickname: "AVD",
   },
   aliases: [
    "AVD (Sec)",
    "AVD (Average View Duration)",
    "Average view duration",
    "averageViewDuration",
   ],
   rawPolicy: "derived_ok",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  avp: {
   key: "avp",
   label: "AVP (%)",
   unit: "percent",
   apiFieldName: "averageViewPercentage",
   displayVariants: {
    tableHeader: "AVP %",
    commonName: "AVP (%)",
    nickname: "AVP",
   },
  aliases: [
    "AVP %",
    "AVP (%)",
    "Average percentage viewed (%)",
    "averageViewPercentage",
    "adjustedAVP",
   ],
   rawPolicy: "derived_ok",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  engagedViews: {
   key: "engagedViews",
   label: "Engaged views",
   unit: "count",
   apiFieldName: "engagedViews",
   displayVariants: {
    tableHeader: "Engaged",
    commonName: "Engaged views",
    nickname: "Engaged",
   },
   aliases: ["Engaged views", "Engaged Views", "engagedViews"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  stw: {
   key: "stw",
   label: "STW %",
   unit: "percent",
   apiFieldName: "stayedToWatch", // Internal to Shorts
   displayVariants: {
    tableHeader: "STW %",
    commonName: "STW %",
    nickname: "STW",
   },
   aliases: ["STW %", "Stayed to watch (%)", "stayedToWatch", "stayedToWatch0:30"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  endScreenClickRate: {
   key: "endScreenClickRate",
   label: "End screen click rate",
   unit: "percent",
   apiFieldName: "endScreenClickRate", // Derived from endScreenElementClicks / endScreenElementImpressions
   displayVariants: {
    tableHeader: "End Screen %",
    commonName: "End screen click rate",
    nickname: "End Screen %",
   },
   aliases: [
    "End screen click rate",
    "Clicks per end screen element shown (%)",
    "clicksPerEndScreenElementShown",
   ],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  cardClickRate: {
   key: "cardClickRate",
   label: "Card click rate",
   unit: "percent",
   apiFieldName: "cardClickRate",
   displayVariants: {
    tableHeader: "Card %",
    commonName: "Card click rate",
    nickname: "Card %",
   },
   aliases: ["Card click rate", "cardClickRate", "Card CTR (%)"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  cardTeaserClickRate: {
   key: "cardTeaserClickRate",
   label: "Card teaser click rate",
   unit: "percent",
   apiFieldName: "cardTeaserClickRate",
   displayVariants: { tableHeader: "Teaser %", commonName: "Card teaser click rate", nickname: "Teaser %" },
   aliases: ["Card teaser click rate", "cardTeaserClickRate"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  cardTeaserClicks: {
   key: "cardTeaserClicks",
   label: "Card teaser clicks",
   unit: "count",
   apiFieldName: "cardTeaserClicks",
   displayVariants: { tableHeader: "Teaser Clicks", commonName: "Card teaser clicks", nickname: "Teaser Clicks" },
   aliases: ["Card teaser clicks", "cardTeaserClicks"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  cardTeaserImpressions: {
   key: "cardTeaserImpressions",
   label: "Card teaser impressions",
   unit: "count",
   apiFieldName: "cardTeaserImpressions",
   displayVariants: { tableHeader: "Teaser Impr", commonName: "Card teaser impressions", nickname: "Teaser Impr" },
   aliases: ["Card teaser impressions", "cardTeaserImpressions"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  annotationImpressions: {
   key: "annotationImpressions",
   label: "Annotation impressions",
   unit: "count",
   apiFieldName: "annotationImpressions",
   displayVariants: { tableHeader: "Ann Impr", commonName: "Annotation impressions", nickname: "Ann Impr" },
   aliases: ["Annotation impressions", "annotationImpressions", "annotation_impressions"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  annotationClickableImpressions: {
   key: "annotationClickableImpressions",
   label: "Annotation clickable impressions",
   unit: "count",
   apiFieldName: "annotationClickableImpressions",
   displayVariants: { tableHeader: "Ann Click Impr", commonName: "Annotation clickable impressions", nickname: "Ann Click Impr" },
   aliases: ["Annotation clickable impressions", "annotationClickableImpressions"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  annotationClosableImpressions: {
   key: "annotationClosableImpressions",
   label: "Annotation closable impressions",
   unit: "count",
   apiFieldName: "annotationClosableImpressions",
   displayVariants: { tableHeader: "Ann Close Impr", commonName: "Annotation closable impressions", nickname: "Ann Close Impr" },
   aliases: ["Annotation closable impressions", "annotationClosableImpressions"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  annotationClicks: {
   key: "annotationClicks",
   label: "Annotation clicks",
   unit: "count",
   apiFieldName: "annotationClicks",
   displayVariants: { tableHeader: "Ann Clicks", commonName: "Annotation clicks", nickname: "Ann Clicks" },
   aliases: ["Annotation clicks", "annotationClicks", "annotation_clicks"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  annotationCloses: {
   key: "annotationCloses",
   label: "Annotation closes",
   unit: "count",
   apiFieldName: "annotationCloses",
   displayVariants: { tableHeader: "Ann Closes", commonName: "Annotation closes", nickname: "Ann Closes" },
   aliases: ["Annotation closes", "annotationCloses", "annotation_closes"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  endScreenClicks: {
   key: "endScreenClicks",
   label: "End screen clicks",
   unit: "count",
   apiFieldName: "endScreenClicks",
   displayVariants: { tableHeader: "ES Clicks", commonName: "End screen clicks", nickname: "ES Clicks" },
   aliases: ["End screen clicks", "endScreenClicks", "endScreenElementClicks"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  endScreenImpressions: {
   key: "endScreenImpressions",
   label: "End screen impressions",
   unit: "count",
   apiFieldName: "endScreenImpressions",
   displayVariants: { tableHeader: "ES Impr", commonName: "End screen impressions", nickname: "ES Impr" },
   aliases: ["End screen impressions", "endScreenImpressions", "endScreenElementImpressions"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  redWatchHours: {
   key: "redWatchHours",
   label: "YouTube Premium Watch Time",
   unit: "hours",
   apiFieldName: "estimatedRedMinutesWatched",
   displayVariants: { tableHeader: "Red Hrs", commonName: "YouTube Premium Watch Time", nickname: "Red Hrs" },
   aliases: ["Red Watch Hrs", "estimatedRedMinutesWatched", "red_watch_time_minutes"],
   rawPolicy: "derived_ok",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  estimatedAdRevenue: {
   key: "estimatedAdRevenue",
   label: "Ad Revenue",
   unit: "currency",
   apiFieldName: "estimatedAdRevenue",
   displayVariants: { tableHeader: "Ad Revenue", commonName: "Ad Revenue", nickname: "Ad Revenue" },
   aliases: ["Ad Revenue", "Estimated Ad Revenue", "estimatedAdRevenue"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  grossRevenue: {
   key: "grossRevenue",
   label: "Gross Revenue",
   unit: "currency",
   apiFieldName: "grossRevenue",
   displayVariants: { tableHeader: "Gross Revenue", commonName: "Gross Revenue", nickname: "Gross Revenue" },
   aliases: ["Gross Revenue", "grossRevenue"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  playbackBasedCpm: {
   key: "playbackBasedCpm",
   label: "Playback Based CPM",
   unit: "currency",
   apiFieldName: "playbackBasedCpm",
   displayVariants: { tableHeader: "Playback Based CPM", commonName: "Playback Based CPM", nickname: "Playback CPM" },
   aliases: ["Playback Based CPM", "playbackBasedCpm"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  adImpressions: {
   key: "adImpressions",
   label: "Ad Impressions",
   unit: "count",
   apiFieldName: "adImpressions",
   displayVariants: { tableHeader: "Ad Impressions", commonName: "Ad Impressions", nickname: "Ad Impr" },
   aliases: ["Ad Impressions", "adImpressions"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  monetizedPlaybacks: {
   key: "monetizedPlaybacks",
   label: "Monetized Playbacks",
   unit: "count",
   apiFieldName: "monetizedPlaybacks",
   displayVariants: { tableHeader: "Monetized Playbacks", commonName: "Monetized Playbacks", nickname: "Monetized" },
   aliases: ["Monetized Playbacks", "monetizedPlaybacks"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  estimatedPremiumRevenue: {
   key: "estimatedPremiumRevenue",
   label: "Premium Revenue",
   unit: "currency",
   apiFieldName: "estimatedRedPartnerRevenue",
   displayVariants: { tableHeader: "Premium Revenue", commonName: "Premium Revenue", nickname: "Premium Revenue" },
   aliases: ["Premium Revenue", "Estimated Premium Revenue", "estimatedRedPartnerRevenue"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  endScreenElementClicks: {
   key: "endScreenElementClicks",
   label: "End screen element clicks",
   unit: "count",
   apiFieldName: "endScreenClicks",
   displayVariants: { tableHeader: "End screen element clicks", commonName: "End screen element clicks", nickname: "ES Element Clicks" },
   aliases: ["End screen element clicks", "endScreenElementClicks", "endScreenClicks"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  endScreenElementsShown: {
   key: "endScreenElementsShown",
   label: "End screen elements shown",
   unit: "count",
   apiFieldName: "endScreenImpressions",
   displayVariants: { tableHeader: "End screen elements shown", commonName: "End screen elements shown", nickname: "ES Elements Shown" },
   aliases: ["End screen elements shown", "endScreenElementsShown", "endScreenImpressions"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  clicksPerEndScreenElementShown: {
   key: "clicksPerEndScreenElementShown",
   label: "Clicks per end screen element shown (%)",
   unit: "percent",
   apiFieldName: "clicksPerEndScreenElementShown",
   displayVariants: { tableHeader: "Clicks per end screen element shown (%)", commonName: "Clicks per end screen element shown (%)", nickname: "ES Element CTR" },
   aliases: ["Clicks per end screen element shown (%)", "clicksPerEndScreenElementShown"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  cardClicks: {
   key: "cardClicks",
   label: "Card clicks",
   unit: "count",
   apiFieldName: "cardClicks",
   displayVariants: { tableHeader: "Card clicks", commonName: "Card clicks", nickname: "Card Clicks" },
   aliases: ["Card clicks", "cardClicks"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  cardsShown: {
   key: "cardsShown",
   label: "Cards shown",
   unit: "count",
   apiFieldName: "cardImpressions",
   displayVariants: { tableHeader: "Cards shown", commonName: "Cards shown", nickname: "Cards Shown" },
   aliases: ["Cards shown", "cardImpressions", "Card impressions"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  clicksPerCardShown: {
   key: "clicksPerCardShown",
   label: "Clicks per card shown (%)",
   unit: "percent",
   apiFieldName: "cardClickRate",
   displayVariants: { tableHeader: "Clicks per card shown (%)", commonName: "Clicks per card shown (%)", nickname: "Card CTR" },
   aliases: ["Clicks per card shown (%)", "cardClickRate", "Card click rate"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  hypes: {
   key: "hypes",
   label: "Hypes",
   unit: "count",
   apiFieldName: "hypes",
   displayVariants: { tableHeader: "Hypes", commonName: "Hypes", nickname: "Hypes" },
   aliases: ["Hypes", "hypes"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  hypePoints: {
   key: "hypePoints",
   label: "Hype points",
   unit: "count",
   apiFieldName: "hypePoints",
   displayVariants: { tableHeader: "Hype points", commonName: "Hype points", nickname: "Hype Pts" },
   aliases: ["Hype points", "hypePoints"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  remixCount: {
   key: "remixCount",
   label: "Remix count",
   unit: "count",
   apiFieldName: "remixCount",
   displayVariants: { tableHeader: "Remix count", commonName: "Remix count", nickname: "Remix Cnt" },
   aliases: ["Remix count", "remixCount"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  remixesOfYourContent: {
   key: "remixesOfYourContent",
   label: "Remixes of Your Content",
   unit: "count",
   apiFieldName: "remixesOfYourContent",
   displayVariants: { tableHeader: "Remixes of Your Content", commonName: "Remixes of Your Content", nickname: "Remixes" },
   aliases: ["Remixes of Your Content", "remixesOfYourContent"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  remixViews: {
   key: "remixViews",
   label: "Remix views",
   unit: "count",
   apiFieldName: "remixViews",
   displayVariants: { tableHeader: "Remix views", commonName: "Remix views", nickname: "Remix Views" },
   aliases: ["Remix views", "remixViews"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  shortsFunnelPercentWatched: {
   key: "shortsFunnelPercentWatched",
   label: "Shorts Funnel Percent Watched",
   unit: "percent",
   apiFieldName: "shortsFunnelPercentWatched",
   displayVariants: { tableHeader: "Shorts Funnel Percent Watched", commonName: "Shorts Funnel Percent Watched", nickname: "Shorts Watched %" },
   aliases: ["Shorts Funnel Percent Watched", "shortsFunnelPercentWatched"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
  shortsFunnelSwipeAwayRate: {
   key: "shortsFunnelSwipeAwayRate",
   label: "Shorts Funnel Swipe Away Rate",
   unit: "percent",
   apiFieldName: "shortsFunnelSwipeAwayRate",
   displayVariants: { tableHeader: "Shorts Funnel Swipe Away Rate", commonName: "Shorts Funnel Swipe Away Rate", nickname: "Shorts Swipe %" },
   aliases: ["Shorts Funnel Swipe Away Rate", "shortsFunnelSwipeAwayRate"],
   rawPolicy: "raw_preferred",
   sourceWindows: { api: ANALYTICS_WINDOWS, csv_table: ANALYTICS_WINDOWS, ga4: ANALYTICS_WINDOWS },
  },
}

export const canonicalMetricOrder: CanonicalMetricKey[] = [
 "views",
 "watchHours",
 "comments",
 "shares",
 "saves",
 "subscribersGained",
 "subscribersLost",
 "subscribersNet",
 "impressions",
 "revenue",
 "cpm",
 "rpm",
 "ctr",
 "newViewers",
 "returningViewers",
 "casualViewers",
 "regularViewers",
 "uniqueViewers",
 "avdSeconds",
 "stw",
 "endScreenClickRate",
 "endScreenClicks",
 "endScreenImpressions",
 "cardClickRate",
 "cardTeaserClickRate",
 "cardTeaserClicks",
 "cardTeaserImpressions",
 "annotationImpressions",
 "annotationClickableImpressions",
 "annotationClosableImpressions",
 "annotationClicks",
 "annotationCloses",
 "endScreenImpressions",
 "endScreenClicks",
 "redWatchHours",
 "estimatedAdRevenue",
 "grossRevenue",
 "playbackBasedCpm",
 "adImpressions",
 "monetizedPlaybacks",
 "estimatedPremiumRevenue",
 "endScreenElementClicks",
 "endScreenElementsShown",
 "clicksPerEndScreenElementShown",
 "cardClicks",
 "cardsShown",
 "clicksPerCardShown",
 "hypes",
 "hypePoints",
 "remixCount",
 "remixesOfYourContent",
 "remixViews",
 "shortsFunnelPercentWatched",
 "shortsFunnelSwipeAwayRate",
 "likes",
 "dislikes",
 "avp",
 "engagedViews",
]

export const canonicalizeMetricKey = (value: string): string =>
 value.toLowerCase().replace(/[^a-z0-9]/g, "")

const metricAliasMap = Object.entries(METRIC_REGISTRY).reduce(
 (acc, [key, def]) => {
  acc[key] = key as CanonicalMetricKey
  def.aliases.forEach((alias) => {
   acc[canonicalizeMetricKey(alias)] = key as CanonicalMetricKey
  })
  return acc
 },
 {} as Record<string, CanonicalMetricKey>,
)

const asNumber = (value: unknown): number | null => {
 if (typeof value === "number" && Number.isFinite(value)) return value
 if (typeof value !== "string") return null
 const trimmed = value.trim()
 if (!trimmed || trimmed === "-" || trimmed.toLowerCase() === "n/a") return null
 const cleaned = trimmed.replace(/,/g, "").replace(/%/g, "")
 if (!cleaned) return null
 const parsed = Number(cleaned)
 return Number.isFinite(parsed) ? parsed : null
}

const valueExists = (value: unknown): boolean => {
 if (value === null || value === undefined) return false
 if (typeof value === "string") {
  const trimmed = value.trim()
  return trimmed !== "" && trimmed !== "-" && trimmed.toLowerCase() !== "n/a"
 }
 return true
}

export const getMetricByAliases = (
 row: Record<string, unknown>,
 metricKey: CanonicalMetricKey,
): { value: number | null; found: boolean } => {
 const def = METRIC_REGISTRY[metricKey]
 const rowEntries = Object.entries(row)

 for (const alias of def.aliases) {
  if (Object.prototype.hasOwnProperty.call(row, alias)) {
   const raw = row[alias]
   if (valueExists(raw)) {
    const parsed = asNumber(raw)
    if (parsed !== null) return { value: parsed, found: true }
   }
  }
 }
 for (const [rawKey, rawValue] of rowEntries) {
  const normalized = canonicalizeMetricKey(rawKey)
  if (metricAliasMap[normalized] !== metricKey) continue
  if (valueExists(rawValue)) {
   const parsed = asNumber(rawValue)
   if (parsed !== null) return { value: parsed, found: true }
  }
 }

 return { value: null, found: false }
}

export const buildUnavailableMetricCell = (
 source: MetricSource,
 reasonCode?: string,
 meta?: Partial<Omit<MetricCell, "value" | "status" | "source" | "availability" | "confidence" | "reasonCode">>,
): MetricCell => ({
 ...meta,
 value: null,
 status: "unavailable",
 source,
 availability: "unavailable",
 confidence: "unavailable",
 reasonCode,
 windowScope: meta?.windowScope ?? "unknown",
})

export const buildActualMetricCell = (
 value: number,
 source: MetricSource,
 meta?: Partial<Omit<MetricCell, "value" | "status" | "source" | "availability" | "confidence">>,
): MetricCell => ({
 ...meta,
 value,
 status: "actual",
 source,
 availability: "available",
 confidence: "raw_direct",
 windowScope: meta?.windowScope ?? "unknown",
})

export const buildDerivedMetricCell = (
 value: number,
 source: MetricSource,
 meta?: Partial<Omit<MetricCell, "value" | "status" | "source" | "availability" | "confidence">>,
): MetricCell => ({
 ...meta,
 value,
 status: "derived",
 source,
 availability: "available",
 confidence: "derived_exact",
 windowScope: meta?.windowScope ?? "unknown",
})

export const emptyMetricCells = (source: MetricSource): Record<CanonicalMetricKey, MetricCell> =>
 canonicalMetricOrder.reduce(
  (acc, key) => {
   acc[key] = buildUnavailableMetricCell(source)
   return acc
  },
  {} as Record<CanonicalMetricKey, MetricCell>,
 )

export const resolveAlias = (rawKey: string): CanonicalMetricKey | null => {
 const normalized = canonicalizeMetricKey(rawKey)
 return metricAliasMap[normalized] || null
}

export const getDisplayLabel = (
 key: CanonicalMetricKey,
 variant: "tableHeader" | "commonName" | "nickname",
): string => {
 const def = METRIC_REGISTRY[key]
 if (!def || !def.displayVariants) return key
 return def.displayVariants[variant]
}

export const getApiFieldName = (key: CanonicalMetricKey): string | null => {
 const def = METRIC_REGISTRY[key]
 return def ? def.apiFieldName : null
}

export const toMetricSource = (value: "api" | "csv" | "ga4" | "hybrid"): MetricSource => {
 if (value === "csv") return "csv_table"
 if (value === "ga4") return "ga4"
 if (value === "hybrid") return "hybrid"
 return "api"
}

export type IngestSourceContract =
 | "youtube_data_v3"
 | "youtube_analytics_v2"
 | "youtube_reporting"
 | "google_search_console"
 | "csv"
 | "google_sheets"

export type MetricApplicability = "shared" | "shorts_only" | "long_only" | "channel_only"

export interface MetricCapability {
 metric: string
 source: IngestSourceContract
 allowedDimensions: Array<"video" | "day" | "channel" | "country" | "trafficSource">
 applicability: MetricApplicability
 enabled: boolean
}

export type MetricCapabilityRegistry = Record<string, MetricCapability>

export const METRIC_CAPABILITY_REGISTRY: MetricCapabilityRegistry = {
 views: {
  metric: "views",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel", "country", "trafficSource"],
  applicability: "shared",
  enabled: true,
 },
 estimatedMinutesWatched: {
  metric: "estimatedMinutesWatched",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel", "country", "trafficSource"],
  applicability: "shared",
  enabled: true,
 },
 averageViewDuration: {
  metric: "averageViewDuration",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "shared",
  enabled: true,
 },
 averageViewPercentage: {
  metric: "averageViewPercentage",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "shared",
  enabled: true,
 },
 subscribersGained: {
  metric: "subscribersGained",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "shared",
  enabled: true,
 },
 likes: {
  metric: "likes",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "shared",
  enabled: true,
 },
 comments: {
  metric: "comments",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "shared",
  enabled: true,
 },
 shares: {
  metric: "shares",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "shared",
  enabled: true,
 },
 engagedViews: {
  metric: "engagedViews",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "shared",
  enabled: true,
 },
 subscribersLost: {
  metric: "subscribersLost",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "shared",
  enabled: true,
 },
 dislikes: {
  metric: "dislikes",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "shared",
  enabled: true,
 },
 cardImpressions: {
  metric: "cardImpressions",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "long_only",
  enabled: true,
 },
 cardClicks: {
  metric: "cardClicks",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "long_only",
  enabled: true,
 },
 videoThumbnailImpressions: {
  metric: "videoThumbnailImpressions",
  source: "youtube_analytics_v2",
  allowedDimensions: ["day", "channel"],
  applicability: "shared",
  enabled: true,
 },
 videoThumbnailImpressionsClickRate: {
  metric: "videoThumbnailImpressionsClickRate",
  source: "youtube_analytics_v2",
  allowedDimensions: ["day", "channel"],
  applicability: "shared",
  enabled: true,
 },
 estimatedRevenue: {
  metric: "estimatedRevenue",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "shared",
  enabled: true,
 },
 estimatedAdRevenue: {
  metric: "estimatedAdRevenue",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "shared",
  enabled: true,
 },
 cpm: {
  metric: "cpm",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "shared",
  enabled: true,
 },
 monetizedPlaybacks: {
  metric: "monetizedPlaybacks",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "shared",
  enabled: true,
 },
 playbackBasedCpm: {
  metric: "playbackBasedCpm",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "shared",
  enabled: true,
 },
 adImpressions: {
  metric: "adImpressions",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "shared",
  enabled: true,
 },
 grossRevenue: {
  metric: "grossRevenue",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "shared",
  enabled: true,
 },
 cardClickRate: {
  metric: "cardClickRate",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "long_only",
  enabled: true,
 },
 videosAddedToPlaylists: {
  metric: "videosAddedToPlaylists",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "shared",
  enabled: true,
 },
 videosRemovedFromPlaylists: {
  metric: "videosRemovedFromPlaylists",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "shared",
  enabled: true,
 },
 annotationClickThroughRate: {
  metric: "annotationClickThroughRate",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "long_only",
  enabled: true,
 },
 annotationCloseRate: {
  metric: "annotationCloseRate",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "long_only",
  enabled: true,
 },
 redViews: {
  metric: "redViews",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "shared",
  enabled: true,
 },
 estimatedRedPartnerRevenue: {
  metric: "estimatedRedPartnerRevenue",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "shared",
  enabled: true,
 },
 estimatedRedMinutesWatched: {
  metric: "estimatedRedMinutesWatched",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "shared",
  enabled: true,
 },
 annotationImpressions: {
  metric: "annotationImpressions",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "long_only",
  enabled: true,
 },
 annotationClickableImpressions: {
  metric: "annotationClickableImpressions",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "long_only",
  enabled: true,
 },
 annotationClosableImpressions: {
  metric: "annotationClosableImpressions",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "long_only",
  enabled: true,
 },
 annotationClicks: {
  metric: "annotationClicks",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "long_only",
  enabled: true,
 },
 annotationCloses: {
  metric: "annotationCloses",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "long_only",
  enabled: true,
 },
 cardTeaserImpressions: {
  metric: "cardTeaserImpressions",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "long_only",
  enabled: true,
 },
 cardTeaserClicks: {
  metric: "cardTeaserClicks",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "long_only",
  enabled: true,
 },
 cardTeaserClickRate: {
  metric: "cardTeaserClickRate",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "long_only",
  enabled: true,
 },
 endScreenImpressions: {
  metric: "endScreenImpressions",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "long_only",
  enabled: true,
 },
 endScreenClicks: {
  metric: "endScreenClicks",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "long_only",
  enabled: true,
 },
 endScreenClickRate: {
  metric: "endScreenClickRate",
  source: "youtube_analytics_v2",
  allowedDimensions: ["video", "day", "channel"],
  applicability: "long_only",
  enabled: true,
 },
}

export const isMetricSupportedForScope = (
 metric: string,
 source: IngestSourceContract,
 dimension: "video" | "day" | "channel" | "country" | "trafficSource",
): boolean => {
 const capability = METRIC_CAPABILITY_REGISTRY[metric]
 if (!capability) return false
 if (!capability.enabled) return false
 if (capability.source !== source) return false
 return capability.allowedDimensions.includes(dimension)
}

export const filterSupportedMetrics = (
 metrics: string[],
 source: IngestSourceContract,
 dimension: "video" | "day" | "channel" | "country" | "trafficSource",
): string[] =>
 metrics.filter((metric) => isMetricSupportedForScope(metric, source, dimension))

// --- END analyticsContract.ts ---

// --- BEGIN canonicalStatsEngine.ts ---
export type CanonicalStatAvailability = "available" | "unavailable"
export type CanonicalStatConfidence = "raw_direct" | "derived_exact" | "unavailable"

export interface CanonicalStatCell {
 value: number | null
 unit:
  | "count"
  | "percent"
  | "currency"
  | "hours"
  | "minutes"
  | "ratio"
 availability: CanonicalStatAvailability
 confidence: CanonicalStatConfidence
 sourceField?: string
 windowScope?: "video" | "channel" | "window" | "unknown"
 reasonCode?: string
}

export type CanonicalStatKey =
 | "watch_hours"
 | "engagement_rate"
 | "rpm"
 | "subscriber_conversion"
 | "ctr_percent"
 | "impressions"
 | "attention_minutes_per_impression"
 | "like_rate_per_1k_views"
 | "comment_rate_per_1k_views"
 | "share_rate_per_1k_views"
 | "watch_time_per_video_minute"
 | "relative_lift_vs_channel_median_avd"
 | "relative_lift_vs_channel_median_apv"
 | "relative_lift_vs_channel_median_ctr"
 | "relative_lift_vs_channel_median_rpm"
 | "retention_30_percent_viewers"

export interface CanonicalStatFieldMap {
 views?: string
 likes?: string
 comments?: string
 shares?: string
 subscribersGained?: string
 impressions?: string
 ctr?: string
 estimatedRevenue?: string
 estimatedMinutesWatched?: string
 avgViewDurationSeconds?: string
 videoLengthSeconds?: string
 avgPercentageViewed?: string
 stayedToWatchAt30?: string
}

export interface CanonicalMedianMap {
 avd?: number
 apv?: number
 ctr?: number
 rpm?: number
}



const fromField = (row: Record<string, unknown>, key?: string): number | null => {
 if (!key) return null
 return asNumber(row[key])
}

const unavailable = (unit: CanonicalStatCell["unit"], reasonCode: string): CanonicalStatCell => ({
 value: null,
 unit,
 availability: "unavailable",
 confidence: "unavailable",
 windowScope: "unknown",
 reasonCode,
})

const rawDirect = (
 value: number,
 unit: CanonicalStatCell["unit"],
 sourceField?: string,
): CanonicalStatCell => ({
 value,
 unit,
 availability: "available",
 confidence: "raw_direct",
 sourceField,
 windowScope: "video",
})

const derivedExact = (
 value: number,
 unit: CanonicalStatCell["unit"],
 sourceField?: string,
): CanonicalStatCell => ({
 value,
 unit,
 availability: "available",
 confidence: "derived_exact",
 sourceField,
 windowScope: "video",
})

const safeDivide = (numerator: number | null, denominator: number | null): number | null => {
 if (numerator === null || denominator === null || denominator <= 0) return null
 const value = numerator / denominator
 return Number.isFinite(value) ? value : null
}

export const buildCanonicalStatsForRow = (
 row: Record<string, unknown>,
 fields: CanonicalStatFieldMap,
 medians: CanonicalMedianMap = {},
): Record<CanonicalStatKey, CanonicalStatCell> => {
 const views = fromField(row, fields.views)
 const likes = fromField(row, fields.likes)
 const comments = fromField(row, fields.comments)
 const shares = fromField(row, fields.shares)
 const subscribersGained = fromField(row, fields.subscribersGained)
 const impressionsRaw = fromField(row, fields.impressions)
 const ctrRaw = fromField(row, fields.ctr)
 const estimatedRevenue = fromField(row, fields.estimatedRevenue)
 const estimatedMinutesWatched = fromField(row, fields.estimatedMinutesWatched)
 const avgViewDurationSeconds = fromField(row, fields.avgViewDurationSeconds)
 const videoLengthSeconds = fromField(row, fields.videoLengthSeconds)
 const avgPercentageViewed = fromField(row, fields.avgPercentageViewed)
 const stayedToWatchAt30 = fromField(row, fields.stayedToWatchAt30)

 const watchHoursValue = safeDivide(estimatedMinutesWatched, 60)

 const engagementRateValue =
  views !== null && views > 0
   ? (((likes ?? 0) + (comments ?? 0) + (shares ?? 0)) / views) * 100
   : null

 const rpmValue =
  views !== null && views > 0 && estimatedRevenue !== null
   ? (estimatedRevenue / views) * 1000
   : null

 const subscriberConversionValue =
  views !== null && views > 0 && subscribersGained !== null
   ? (subscribersGained / views) * 100
   : null

 const ctrPercentValue =
  ctrRaw !== null
   ? ctrRaw <= 1
     ? ctrRaw * 100
     : ctrRaw
   : views !== null && impressionsRaw !== null && impressionsRaw > 0
    ? (views / impressionsRaw) * 100
    : null

 const impressionsValue =
  impressionsRaw !== null
   ? impressionsRaw
   : views !== null && ctrRaw !== null
    ? ctrRaw > 0 && (ctrRaw <= 1 ? ctrRaw * 100 : ctrRaw) > 0
      ? views / ((ctrRaw <= 1 ? ctrRaw * 100 : ctrRaw) / 100)
      : null
    : null

 const attentionPerImpressionValue =
  estimatedMinutesWatched !== null && impressionsValue !== null && impressionsValue > 0
   ? estimatedMinutesWatched / impressionsValue
   : null

 const likeRatePer1kValue =
  views !== null && views > 0 && likes !== null ? (likes / views) * 1000 : null
 const commentRatePer1kValue =
  views !== null && views > 0 && comments !== null ? (comments / views) * 1000 : null
 const shareRatePer1kValue =
  views !== null && views > 0 && shares !== null ? (shares / views) * 1000 : null

 const watchTimePerVideoMinuteValue =
  avgViewDurationSeconds !== null && videoLengthSeconds !== null && videoLengthSeconds > 0
   ? avgViewDurationSeconds / videoLengthSeconds
   : null

 const avdLiftValue =
  avgViewDurationSeconds !== null && medians.avd && medians.avd > 0
   ? ((avgViewDurationSeconds - medians.avd) / medians.avd) * 100
   : null
 const apvLiftValue =
  avgPercentageViewed !== null && medians.apv && medians.apv > 0
   ? ((avgPercentageViewed - medians.apv) / medians.apv) * 100
   : null
 const ctrLiftValue =
  ctrPercentValue !== null && medians.ctr && medians.ctr > 0
   ? ((ctrPercentValue - medians.ctr) / medians.ctr) * 100
   : null
 const rpmLiftValue =
  rpmValue !== null && medians.rpm && medians.rpm > 0
   ? ((rpmValue - medians.rpm) / medians.rpm) * 100
   : null

 const retention30Cell =
  stayedToWatchAt30 !== null
   ? rawDirect(stayedToWatchAt30, "percent", fields.stayedToWatchAt30)
   : unavailable("percent", "missing_raw_retention_30")

 return {
  watch_hours:
   watchHoursValue !== null
    ? derivedExact(watchHoursValue, "hours", fields.estimatedMinutesWatched)
    : unavailable("hours", "missing_estimated_minutes_watched"),
  engagement_rate:
   engagementRateValue !== null
    ? derivedExact(engagementRateValue, "percent", "likes+comments+shares/views")
    : unavailable("percent", "missing_engagement_prereqs"),
  rpm:
   rpmValue !== null
    ? derivedExact(rpmValue, "currency", "estimatedRevenue/views*1000")
    : unavailable("currency", "missing_rpm_prereqs"),
  subscriber_conversion:
   subscriberConversionValue !== null
    ? derivedExact(subscriberConversionValue, "percent", "subscribersGained/views")
    : unavailable("percent", "missing_subscriber_conversion_prereqs"),
  ctr_percent:
   ctrPercentValue !== null
    ? ctrRaw !== null
      ? rawDirect(ctrPercentValue, "percent", fields.ctr)
      : derivedExact(ctrPercentValue, "percent", "views/impressions*100")
    : unavailable("percent", "missing_ctr_prereqs"),
  impressions:
   impressionsValue !== null
    ? impressionsRaw !== null
      ? rawDirect(impressionsValue, "count", fields.impressions)
      : derivedExact(impressionsValue, "count", "views/(ctr/100)")
    : unavailable("count", "missing_impressions_prereqs"),
  attention_minutes_per_impression:
   attentionPerImpressionValue !== null
    ? derivedExact(attentionPerImpressionValue, "minutes", "estimatedMinutesWatched/impressions")
    : unavailable("minutes", "missing_attention_per_impression_prereqs"),
  like_rate_per_1k_views:
   likeRatePer1kValue !== null
    ? derivedExact(likeRatePer1kValue, "ratio", "likes/views*1000")
    : unavailable("ratio", "missing_like_rate_prereqs"),
  comment_rate_per_1k_views:
   commentRatePer1kValue !== null
    ? derivedExact(commentRatePer1kValue, "ratio", "comments/views*1000")
    : unavailable("ratio", "missing_comment_rate_prereqs"),
  share_rate_per_1k_views:
   shareRatePer1kValue !== null
    ? derivedExact(shareRatePer1kValue, "ratio", "shares/views*1000")
    : unavailable("ratio", "missing_share_rate_prereqs"),
  watch_time_per_video_minute:
   watchTimePerVideoMinuteValue !== null
    ? derivedExact(watchTimePerVideoMinuteValue, "ratio", "avgViewDuration/videoLength")
    : unavailable("ratio", "missing_watch_time_per_video_minute_prereqs"),
  relative_lift_vs_channel_median_avd:
   avdLiftValue !== null
    ? derivedExact(avdLiftValue, "percent", "(avd-medianAvd)/medianAvd*100")
    : unavailable("percent", "missing_channel_median_avd"),
  relative_lift_vs_channel_median_apv:
   apvLiftValue !== null
    ? derivedExact(apvLiftValue, "percent", "(apv-medianApv)/medianApv*100")
    : unavailable("percent", "missing_channel_median_apv"),
  relative_lift_vs_channel_median_ctr:
   ctrLiftValue !== null
    ? derivedExact(ctrLiftValue, "percent", "(ctr-medianCtr)/medianCtr*100")
    : unavailable("percent", "missing_channel_median_ctr"),
  relative_lift_vs_channel_median_rpm:
   rpmLiftValue !== null
    ? derivedExact(rpmLiftValue, "percent", "(rpm-medianRpm)/medianRpm*100")
    : unavailable("percent", "missing_channel_median_rpm"),
  retention_30_percent_viewers: retention30Cell,
 }
}

export const collectAvailableCanonicalStats = (
 rows: Array<Record<string, unknown>>,
 fields: CanonicalStatFieldMap,
 medians: CanonicalMedianMap = {},
): Set<CanonicalStatKey> => {
 const available = new Set<CanonicalStatKey>()
 for (const row of rows) {
  const stats = buildCanonicalStatsForRow(row, fields, medians)
  ;(Object.keys(stats) as CanonicalStatKey[]).forEach((key) => {
   if (stats[key].availability === "available") {
    available.add(key)
   }
  })
 }
 return available
}

// --- END canonicalStatsEngine.ts ---

// --- BEGIN unifiedSourceOfTruth.ts ---

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

// --- END unifiedSourceOfTruth.ts ---
