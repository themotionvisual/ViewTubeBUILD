import { refreshTokenIfExpired, proxyFetch, handleYouTubeApiError, YouTubeApiError, ANALYTICS_URL } from "./youtubeApiClient";
import { logout } from "../authSession";
import { filterSupportedMetrics, AnalyticsWindow } from "../analyticsContract";
import type { SyncDiagnostics } from "../productArchitecture";
import {
  AnalyticsMetricGroupName,
  AnalyticsGroupFetchResult,
  buildScopedVideoMetricGroups,
  getAnalyticsRequestClass,
  shouldForceViewsMetric,
} from "./youtubeAnalyticsFetcher";

export interface YouTubeReportHeader {
  name: string;
  columnType?: string;
  dataType?: string;
}

export interface YouTubeReportPayload {
  columnHeaders: YouTubeReportHeader[];
  rows: (string | number)[][];
}

const ANALYTICS_VIDEO_PAGE_SIZE = 200;
const MAX_ANALYTICS_VIDEO_PAGES = 50;
const MAX_VIDEO_IDS_PER_FILTER = 25;

export const buildVideoFilterCandidates = (
  videoIds: string[],
  urlIdsForFiltered: string,
  startDate: string,
  endDate: string,
  maxMetricsString: string,
  maxRequestChars: number
): string[] => {
  if (videoIds.length === 0) return [];
  const basePrefix = `https://youtubeanalytics.googleapis.com/v2/reports?ids=${urlIdsForFiltered}&startDate=${startDate}&endDate=${endDate}&metrics=${maxMetricsString}&dimensions=video&filters=`;
  const baseSuffix = `&maxResults=200`;
  const candidates: string[] = [];
  let current: string[] = [];
  const flush = () => {
    if (current.length === 0) return;
    candidates.push(`video==${current.join(",")}`);
    current = [];
  };
  for (const videoId of videoIds) {
    if (current.length >= MAX_VIDEO_IDS_PER_FILTER) {
      flush();
    }
    current.push(videoId);
    const filterValue = `video==${current.join(",")}`;
    const encoded = encodeURIComponent(filterValue);
    const nextUrlLen = basePrefix.length + encoded.length + baseSuffix.length;
    if (nextUrlLen > maxRequestChars && current.length > 1) {
      current.pop();
      flush();
      current.push(videoId);
    }
  }
  flush();
  return candidates;
};

export const flattenReportPayloads = (payloadList: any[]): YouTubeReportPayload => {
  const rowsOut: any[] = [];
  let headersOut: YouTubeReportHeader[] = [];
  payloadList.forEach((payload) => {
    if (!payload || !Array.isArray(payload.rows) || !Array.isArray(payload.columnHeaders)) return;
    if (headersOut.length === 0) {
      headersOut = payload.columnHeaders.map((header: any) => ({ name: String(header?.name || "") }));
    }
    payload.rows.forEach((row: any) => {
      if (Array.isArray(row)) rowsOut.push(row);
    });
  });
  return { columnHeaders: headersOut, rows: rowsOut };
};

export const filterPayloadToTargetVideos = (payload: any, targetVideoIdSet: Set<string>): any => {
  if (targetVideoIdSet.size === 0) return payload;
  if (!payload || !Array.isArray(payload.columnHeaders) || !Array.isArray(payload.rows)) return payload;
  const headers = payload.columnHeaders.map((header: any) => String(header?.name || "").toLowerCase());
  const videoIdx = headers.findIndex((h) => h === "video" || h === "videoid");
  if (videoIdx < 0) return payload;
  return {
    ...payload,
    rows: payload.rows.filter((row: any) => {
      if (!Array.isArray(row)) return false;
      const videoId = String(row[videoIdx] || "");
      return targetVideoIdSet.has(videoId);
    }),
  };
};

export const parseVideoFilterIds = (filter: string): string[] | null => {
  if (!filter.startsWith("video==")) return null;
  return filter.slice("video==".length).split(",").map((id) => id.trim()).filter(Boolean);
};

export class ImpressionsFallbackService {
  constructor(private fetcher: any) {}

  public async fetchImpressionsGroup(
    ids: string,
    activeMetrics: string[],
    groupName: string,
    shapeKey: string,
    comboKey: string,
    cachedShape: any,
    baseAttemptShape: any
  ) {
    let groupStatus: number | undefined = undefined;
    let groupError: any = null;
    let payload: any = null;
    let skippedGroupedRequest = false;

    if (this.fetcher.knownInvalidCombos.has(comboKey)) {
      this.fetcher.suppressedInvalidComboCount += 1;
      skippedGroupedRequest = true;
      groupStatus = 400;
    } else {
      try {
        payload = await this.fetcher.fetchVideoReportWithSplitRetries(ids, activeMetrics, 0, false, {
          includeSort: false,
          includeStartIndex: false,
          includeMaxResults: true,
        });
        this.fetcher.impressionsProbeCache.set(shapeKey, { groupedSupported: true, minimalPagingSupported: true });
        this.fetcher.aggregatedPayloads.push(filterPayloadToTargetVideos(payload, this.fetcher.targetVideoIdSet));
        activeMetrics.forEach((metric) => {
          this.fetcher.metricCapabilityByMetric.set(metric, { status: "available" });
          this.fetcher.runMetricCapabilities.set(metric, { metric, status: "available", source: "api" });
        });
        this.fetcher.groupResults[groupName as AnalyticsMetricGroupName].ok = true;
      } catch (err) {
        groupError = err;
        const groupErrorMessage = groupError instanceof Error ? groupError.message : String(groupError);
        groupStatus = this.fetcher.getErrorStatus(groupError);
        this.fetcher.recordFailure({
          group: groupName,
          ids,
          metrics: activeMetrics,
          status: groupStatus,
          reason: groupErrorMessage,
          requestClass: "video_top_videos_channel_filter",
          outcome: groupStatus === 400 ? "quarantined" : "failed",
          attemptedShape: baseAttemptShape,
        });
      }
    }

    if (!this.fetcher.groupResults[groupName as AnalyticsMetricGroupName].ok) {
      if (groupStatus === 400 && !skippedGroupedRequest) {
        this.fetcher.knownInvalidCombos.add(comboKey);
        this.fetcher.impressionsProbeCache.set(shapeKey, { groupedSupported: false, minimalPagingSupported: false });
      }

      let groupedMinimalPayload: any | null = null;
      if (groupStatus === 400 && !skippedGroupedRequest) {
        try {
          groupedMinimalPayload = await this.fetcher.fetchVideoReportWithSplitRetries(ids, activeMetrics, 0, false, {
            includeSort: false,
            includeStartIndex: false,
            includeMaxResults: false,
          });
          this.fetcher.impressionsProbeCache.set(shapeKey, { groupedSupported: true, minimalPagingSupported: true });
        } catch (minimalError) {
          const minimalErrorMessage = minimalError instanceof Error ? minimalError.message : String(minimalError);
          const minimalStatus = this.fetcher.getErrorStatus(minimalError);
          this.fetcher.recordFailure({
            group: groupName,
            ids,
            metrics: activeMetrics,
            status: minimalStatus,
            reason: minimalErrorMessage,
            requestClass: "video_top_videos_channel_filter",
            outcome: minimalStatus === 400 ? "quarantined" : "failed",
            attemptedShape: { dimensions: "video", includesSort: false, includesStartIndex: false, includesMaxResults: false, includeContentType: false },
          });
          if (minimalStatus === 400) {
            this.fetcher.knownInvalidCombos.add(comboKey);
            this.fetcher.impressionsProbeCache.set(shapeKey, { groupedSupported: false, minimalPagingSupported: false });
          }
        }
      }

      if (groupedMinimalPayload) {
        this.fetcher.aggregatedPayloads.push(filterPayloadToTargetVideos(groupedMinimalPayload, this.fetcher.targetVideoIdSet));
        activeMetrics.forEach((metric) => {
          this.fetcher.metricCapabilityByMetric.set(metric, { status: "available" });
          this.fetcher.runMetricCapabilities.set(metric, { metric, status: "available", source: "api" });
        });
        this.fetcher.groupResults[groupName as AnalyticsMetricGroupName].ok = true;
        return;
      }

      const shouldTryPerMetric = !cachedShape || cachedShape.groupedSupported === false;
      if (shouldTryPerMetric) {
        const metricPromises = activeMetrics.map(async (metric) => {
          const metricComboKey = `${groupName}::${ids}::${metric}`;
          if (this.fetcher.knownInvalidCombos.has(metricComboKey)) {
            this.fetcher.suppressedInvalidComboCount += 1;
            this.fetcher.recordFailure({
              group: groupName,
              ids,
              metrics: [metric],
              status: 400,
              reason: "Suppressed known-invalid impressions/CTR metric request for this sync.",
              requestClass: "video_top_videos_channel_filter",
              outcome: "suppressed",
            });
            return null;
          }
          try {
            const metricPayload = await this.fetcher.fetchVideoReportWithSplitRetries(ids, [metric], 0, false, {
              includeSort: false,
              includeStartIndex: false,
              includeMaxResults: true,
            });
            return { metric, payload: filterPayloadToTargetVideos(metricPayload, this.fetcher.targetVideoIdSet), success: true };
          } catch (metricError) {
            return { metric, error: metricError, success: false };
          }
        });

        const metricPayloads: any[] = [];
        const metricWarnings: string[] = [];
        const results = await Promise.allSettled(metricPromises);
        for (const result of results) {
          if (result.status === "fulfilled" && result.value) {
            if (result.value.success) {
              metricPayloads.push(result.value.payload);
              this.fetcher.metricCapabilityByMetric.set(result.value.metric, { status: "available" });
              this.fetcher.runMetricCapabilities.set(result.value.metric, { metric: result.value.metric, status: "available", source: "api" });
            } else {
              const metric = result.value.metric;
              const metricError = result.value.error;
              const metricComboKey = `${groupName}::${ids}::${metric}`;
              const metricErrorMessage = metricError instanceof Error ? metricError.message : String(metricError);
              const metricStatus = this.fetcher.getErrorStatus(metricError);
              metricWarnings.push(`${metric}: ${metricErrorMessage}`);
              this.fetcher.recordFailure({
                group: groupName,
                ids,
                metrics: [metric],
                status: metricStatus,
                reason: metricErrorMessage,
                requestClass: "video_top_videos_channel_filter",
                outcome: metricStatus === 400 ? "quarantined" : "failed",
                attemptedShape: baseAttemptShape,
              });
              const blockedStatus = metricStatus === 400 ? "temporarily_blocked" : metricStatus === 403 ? "missing_scope" : "api_request_failed";
              this.fetcher.metricCapabilityByMetric.set(metric, { status: blockedStatus, reasonCode: blockedStatus });
              this.fetcher.runMetricCapabilities.set(metric, { metric, status: blockedStatus, reasonCode: blockedStatus, source: "api" });
              if (metricStatus === 400) {
                this.fetcher.knownInvalidCombos.add(metricComboKey);
              }
            }
          }
        }

        if (metricPayloads.length > 0) {
          this.fetcher.aggregatedPayloads.push(flattenReportPayloads(metricPayloads));
          this.fetcher.groupResults[groupName as AnalyticsMetricGroupName].ok = true;
          this.fetcher.impressionsProbeCache.set(shapeKey, { groupedSupported: false, minimalPagingSupported: true });
          this.fetcher.recordFailure({
            group: groupName,
            ids,
            metrics: activeMetrics,
            status: groupStatus,
            reason: "Recovered impressions/CTR with per-metric top-videos fallback after grouped request failed.",
            requestClass: "video_top_videos_channel_filter",
            outcome: "fallback_succeeded",
          });
        } else {
          this.fetcher.groupResults[groupName as AnalyticsMetricGroupName].ok = false;
          if (groupStatus === 400) {
            this.fetcher.knownInvalidCombos.add(comboKey);
          }
        }
        if (metricWarnings.length > 0) {
          this.fetcher.aggregatedWarnings.push(...metricWarnings);
        }
      }
    }
  }
}
