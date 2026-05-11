import { AnalyticsWindow } from "../analyticsContract";

export type AnalyticsMetricGroupName =
 | "core_performance"
 | "engagement"
 | "impressions_ctr"
 | "monetization"
 | "audience_mix"
 | "end_screen"

export type AnalyticsGroupFetchResult = {
 ok: boolean
 metrics: string[]
 idsTried: string[]
 error?: string
 warnings?: string[]
 rowCount?: number
}

export type AnalyticsRequestClass =
 | "video_filter_chunk"
 | "video_top_videos_channel_filter"
 | "channel_creator_content_type"

export interface YouTubeReportHeader {
 name: string;
 columnType?: string;
 dataType?: string;
}

export interface YouTubeReportPayload {
 columnHeaders: YouTubeReportHeader[];
 rows: (string | number)[][];
}

export interface AnalyticsOptions {
  window?: AnalyticsWindow
  targetVideoIds?: string[]
  optionalMetricsEnabled?: boolean
  batchMode?: "initial" | "next"
}
