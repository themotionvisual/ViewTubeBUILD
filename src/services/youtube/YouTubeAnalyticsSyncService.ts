import { refreshTokenIfExpired, proxyFetch, handleYouTubeApiError } from "./youtubeApiClient";
import { logout } from "../authSession";
import {
  AnalyticsMetricGroupName,
  AnalyticsGroupFetchResult,
  AnalyticsOptions
} from "./analyticsTypes";
import {
  disabledAnalyticsGroups,
  unsupportedVideoAnalyticsMetrics,
  SESSION_KNOWN_INVALID_COMBOS,
  IMPRESSIONS_PROBE_CACHE,
  METRIC_CAPABILITY_BY_METRIC,
  ANALYTICS_VIDEO_PAGE_SIZE,
  MAX_ANALYTICS_VIDEO_PAGES
} from "./analyticsRegistry";
import {
  flattenReportPayloads,
  filterPayloadToTargetVideos,
  parseVideoFilterIds,
  buildVideoFilterCandidates,
  buildScopedVideoMetricGroups,
  getAnalyticsRequestClass,
  buildChannelScopedVideoIdCandidates,
  shouldForceViewsMetric,
  getErrorStatus
} from "./analyticsUtils";

export class YouTubeAnalyticsSyncService {
  private runDisabledMetrics = new Set<string>();
  private runMetricCapabilities = new Map<string, {
    metric: string;
    status: "available" | "unsupported_for_dimension" | "missing_scope" | "temporarily_blocked" | "api_request_failed";
    reasonCode?: string;
    source: "api";
  }>();
  private knownInvalidCombos: Set<string>;
  private suppressedInvalidComboCount = 0;
  private diagnosticsFailures: any[] = [];
  private loggedFailureDedup = new Set<string>();
  private requestCharCounts: number[] = [];
  private maxRequestChars = 1900;
  private splitRetries = 0;
  private targetVideoIdSet: Set<string>;

  constructor(
    private startDate: string,
    private endDate: string,
    private channelId: string | undefined,
    private options: AnalyticsOptions = {}
  ) {
    this.knownInvalidCombos = new Set(SESSION_KNOWN_INVALID_COMBOS);
    this.targetVideoIdSet = new Set(
      Array.isArray(options.targetVideoIds)
        ? options.targetVideoIds.filter((videoId): videoId is string => !!videoId)
        : []
    );
  }

  public async run(): Promise<{
    payloads: Partial<Record<AnalyticsMetricGroupName, any[]>>;
    groupResults: Record<AnalyticsMetricGroupName, AnalyticsGroupFetchResult>;
    diagnostics: any;
  }> {
    if (this.options.batchMode === "initial") {
      console.log("[Analytics] Initial sync mode: Bypassing heavy interaction metrics for instant load");
    }

    const channelIdCandidates = buildChannelScopedVideoIdCandidates(this.channelId);
    const scopedMetricGroups = buildScopedVideoMetricGroups();

    const filteredMetricGroups: Record<AnalyticsMetricGroupName, string[]> = {
      core_performance: scopedMetricGroups.core_performance.filter(
        (m) => !unsupportedVideoAnalyticsMetrics.has(m) && !this.runDisabledMetrics.has(m)
      ),
      engagement: scopedMetricGroups.engagement.filter(
        (m) => !unsupportedVideoAnalyticsMetrics.has(m) && !this.runDisabledMetrics.has(m)
      ),
      impressions_ctr: scopedMetricGroups.impressions_ctr.filter(
        (m) => !unsupportedVideoAnalyticsMetrics.has(m) && !this.runDisabledMetrics.has(m)
      ),
      monetization: scopedMetricGroups.monetization.filter(
        (m) => !unsupportedVideoAnalyticsMetrics.has(m) && !this.runDisabledMetrics.has(m)
      ),
      audience_mix: scopedMetricGroups.audience_mix.filter(
        (m) => !unsupportedVideoAnalyticsMetrics.has(m) && !this.runDisabledMetrics.has(m)
      ),
      end_screen: scopedMetricGroups.end_screen.filter(
        (m) => !unsupportedVideoAnalyticsMetrics.has(m) && !this.runDisabledMetrics.has(m)
      ),
    };

    if (disabledAnalyticsGroups.size > 0) {
      (Object.keys(filteredMetricGroups) as AnalyticsMetricGroupName[]).forEach((groupName) => {
        if (disabledAnalyticsGroups.has(groupName)) {
          filteredMetricGroups[groupName] = [];
        }
      });
    }

    const urlIdsForFiltered = this.channelId ? `channel==${this.channelId}` : "channel==MINE";
    const maxMetricsString = (Object.values(filteredMetricGroups) as string[][]).reduce((currentMax, metrics) => {
      const safeMetrics = Array.from(new Set(metrics));
      const asString = safeMetrics.join(",");
      return asString.length > currentMax.length ? asString : currentMax;
    }, "views");

    const filteredIdCandidates =
      this.targetVideoIdSet.size > 0
        ? buildVideoFilterCandidates(
            Array.from(this.targetVideoIdSet),
            urlIdsForFiltered,
            this.startDate,
            this.endDate,
            maxMetricsString,
            this.maxRequestChars
          )
        : [];
    const idCandidates = filteredIdCandidates.length > 0 ? filteredIdCandidates : [...channelIdCandidates];

    const groupResults: Record<AnalyticsMetricGroupName, AnalyticsGroupFetchResult> = {
      core_performance: { ok: false, metrics: filteredMetricGroups.core_performance, idsTried: [] },
      engagement: { ok: false, metrics: filteredMetricGroups.engagement, idsTried: [] },
      impressions_ctr: { ok: false, metrics: filteredMetricGroups.impressions_ctr, idsTried: [] },
      monetization: { ok: false, metrics: filteredMetricGroups.monetization, idsTried: [] },
      audience_mix: { ok: false, metrics: filteredMetricGroups.audience_mix, idsTried: [] },
      end_screen: { ok: false, metrics: filteredMetricGroups.end_screen, idsTried: [] },
    };

    const payloads: Partial<Record<AnalyticsMetricGroupName, any[]>> = {};
    const groupNames = Object.keys(filteredMetricGroups) as AnalyticsMetricGroupName[];

    for (const groupName of groupNames) {
      const metrics = filteredMetricGroups[groupName];
      const aggregatedPayloads: any[] = [];
      
      if (metrics.length === 0) {
        groupResults[groupName].ok = true;
        groupResults[groupName].warnings = disabledAnalyticsGroups.has(groupName)
          ? ["Skipped: metric group disabled for this session due to repeated API errors."]
          : groupName === "impressions_ctr"
          ? ["Required thumbnail impressions/CTR metrics unavailable for this sync context."]
          : ["No supported metrics for youtube_analytics_v2 + video scope."];
        continue;
      }

      if (this.options.batchMode === "initial" && ["impressions_ctr", "audience_mix", "end_screen"].includes(groupName)) {
        groupResults[groupName].ok = true;
        groupResults[groupName].warnings = ["Skipped: Bypassing heavy interaction metrics during initial sync for instant UI boot."];
        continue;
      }

      const requiresVideoFilters = ["impressions_ctr", "audience_mix", "end_screen"].includes(groupName);
      const groupIdCandidates = requiresVideoFilters ? idCandidates : channelIdCandidates;

      if (requiresVideoFilters && groupIdCandidates.length === 0) {
        groupResults[groupName].ok = true;
        groupResults[groupName].warnings = ["Skipped: No video IDs provided for chunking interaction metrics."];
        metrics.forEach((metric) => {
          this.runMetricCapabilities.set(metric, {
            metric,
            status: "temporarily_blocked",
            reasonCode: "blocked_by_missing_video_ids",
            source: "api",
          });
        });
        continue;
      }

      for (const ids of groupIdCandidates) {
        const activeMetrics = metrics.filter(
          (m) => !unsupportedVideoAnalyticsMetrics.has(m) && !this.runDisabledMetrics.has(m)
        );
        if (activeMetrics.length === 0) {
          groupResults[groupName].ok = true;
          break;
        }
        groupResults[groupName].idsTried.push(ids);

        if (groupName === "impressions_ctr") {
          await this.fetchImpressionsCtrGroup(ids, activeMetrics, groupName, aggregatedPayloads, urlIdsForFiltered, groupResults);
        } else {
          await this.fetchStandardGroup(ids, activeMetrics, groupName, aggregatedPayloads, groupResults);
        }
      }

      if (aggregatedPayloads.length > 0) {
        payloads[groupName] = aggregatedPayloads;
        groupResults[groupName].rowCount = aggregatedPayloads.reduce((sum, p) => sum + (p?.rows?.length || 0), 0);
      }
    }

    return {
      payloads,
      groupResults,
      diagnostics: {
        window: this.options.window || "lifetime",
        targetVideoIds: Array.from(this.targetVideoIdSet),
        requestCharCounts: this.requestCharCounts,
        splitRetries: this.splitRetries,
        failureReasons: this.diagnosticsFailures,
        suppressedInvalidComboCount: this.suppressedInvalidComboCount,
        metricCapabilities: Array.from(this.runMetricCapabilities.values()),
      },
    };
  }

  private async fetchImpressionsCtrGroup(
    ids: string,
    activeMetrics: string[],
    groupName: AnalyticsMetricGroupName,
    aggregatedPayloads: any[],
    urlIdsForFiltered: string,
    groupResults: Record<AnalyticsMetricGroupName, AnalyticsGroupFetchResult>
  ) {
    const shapeKey = `${this.options.window || "lifetime"}::${groupName}::${ids}`;
    const comboKey = `${shapeKey}::${activeMetrics.join(",")}`;
    const cachedShape = IMPRESSIONS_PROBE_CACHE.get(shapeKey);
    
    let groupStatus: number | undefined;
    let payload: any = null;
    let skipped = false;

    if (this.knownInvalidCombos.has(comboKey)) {
      this.suppressedInvalidComboCount++;
      skipped = true;
      groupStatus = 400;
    } else {
      try {
        payload = await this.fetchVideoReportWithSplitRetries(ids, activeMetrics, urlIdsForFiltered, 0, false, {
          includeSort: false,
          includeStartIndex: false,
          includeMaxResults: true,
        });
        IMPRESSIONS_PROBE_CACHE.set(shapeKey, { groupedSupported: true, minimalPagingSupported: true });
        aggregatedPayloads.push(filterPayloadToTargetVideos(payload, this.targetVideoIdSet));
        activeMetrics.forEach((m) => {
          METRIC_CAPABILITY_BY_METRIC.set(m, { status: "available" });
          this.runMetricCapabilities.set(m, { metric: m, status: "available", source: "api" });
        });
        groupResults[groupName].ok = true;
      } catch (err) {
        groupStatus = getErrorStatus(err);
        this.recordFailure({
          group: groupName,
          ids,
          metrics: activeMetrics,
          status: groupStatus,
          reason: err instanceof Error ? err.message : String(err),
          requestClass: "video_top_videos_channel_filter",
          outcome: groupStatus === 400 ? "quarantined" : "failed",
        });
      }
    }

    if (!groupResults[groupName].ok) {
      if (groupStatus === 400 && !skipped) {
        SESSION_KNOWN_INVALID_COMBOS.add(comboKey);
        IMPRESSIONS_PROBE_CACHE.set(shapeKey, { groupedSupported: false, minimalPagingSupported: false });
      }

      const shouldTryPerMetric = !cachedShape || cachedShape.groupedSupported === false;
      if (shouldTryPerMetric) {
        const metricPromises = activeMetrics.map(async (metric) => {
          const mComboKey = `${groupName}::${ids}::${metric}`;
          if (this.knownInvalidCombos.has(mComboKey)) {
             return { success: false, suppressed: true, metric };
          }
          try {
            const p = await this.fetchVideoReportWithSplitRetries(ids, [metric], urlIdsForFiltered, 0, false, {
              includeSort: false,
              includeStartIndex: false,
              includeMaxResults: true,
            });
            return { success: true, payload: filterPayloadToTargetVideos(p, this.targetVideoIdSet), metric };
          } catch (e) {
            return { success: false, error: e, metric };
          }
        });

        const results = await Promise.allSettled(metricPromises);
        const successes: any[] = [];
        for (const res of results) {
          if (res.status === "fulfilled") {
            const val = res.value;
            if (val.success) {
              successes.push(val.payload);
              METRIC_CAPABILITY_BY_METRIC.set(val.metric, { status: "available" });
              this.runMetricCapabilities.set(val.metric, { metric: val.metric, status: "available", source: "api" });
            } else if (val.suppressed) {
               this.suppressedInvalidComboCount++;
            } else {
               const status = getErrorStatus(val.error);
               const blockedStatus = status === 400 ? "temporarily_blocked" : status === 403 ? "missing_scope" : "api_request_failed";
               this.runMetricCapabilities.set(val.metric, { metric: val.metric, status: blockedStatus as any, source: "api" });
               if (status === 400) {
                 SESSION_KNOWN_INVALID_COMBOS.add(`${groupName}::${ids}::${val.metric}`);
               }
            }
          }
        }
        if (successes.length > 0) {
          aggregatedPayloads.push(flattenReportPayloads(successes));
          groupResults[groupName].ok = true;
        }
      }
    }
  }

  private async fetchStandardGroup(
    ids: string,
    activeMetrics: string[],
    groupName: AnalyticsMetricGroupName,
    aggregatedPayloads: any[],
    groupResults: Record<AnalyticsMetricGroupName, AnalyticsGroupFetchResult>
  ) {
    const comboKey = `${groupName}::${ids}::${activeMetrics.join(",")}`;
    if (this.knownInvalidCombos.has(comboKey)) return;

    try {
      const payload = await this.fetchVideoReportWithSplitRetries(ids, activeMetrics, ids, 0, true);
      aggregatedPayloads.push(payload);
      groupResults[groupName].ok = true;
    } catch (error) {
      const status = getErrorStatus(error);
      this.recordFailure({
        group: groupName,
        ids,
        metrics: activeMetrics,
        status,
        reason: error instanceof Error ? error.message : String(error),
        requestClass: getAnalyticsRequestClass(ids, activeMetrics),
        outcome: "failed",
      });
      if (status === 400) {
        SESSION_KNOWN_INVALID_COMBOS.add(comboKey);
      }
      
      const metricPromises = activeMetrics.map(async (metric) => {
        try {
          const p = await this.fetchVideoReportWithSplitRetries(ids, [metric], ids, 0, true);
          return { success: true, payload: p, metric };
        } catch (e) {
          return { success: false, error: e, metric };
        }
      });

      const results = await Promise.allSettled(metricPromises);
      const successes: any[] = [];
      for (const res of results) {
        if (res.status === "fulfilled" && res.value.success) {
          successes.push(res.value.payload);
        }
      }
      if (successes.length > 0) {
        aggregatedPayloads.push(flattenReportPayloads(successes));
        groupResults[groupName].ok = true;
      }
    }
  }

  private async fetchVideoReportWithSplitRetries(
    ids: string,
    metrics: string[],
    urlIds: string,
    depth = 0,
    allowSplitOn400 = true,
    requestOptions?: any
  ): Promise<any> {
    try {
      return await this.fetchVideoReport(ids, metrics, urlIds, requestOptions);
    } catch (error) {
      const status = getErrorStatus(error);
      if (status === 401) {
        logout();
        throw new Error("Your YouTube session has expired. Please reconnect in Settings.");
      }
      const filterIds = parseVideoFilterIds(ids);
      if (allowSplitOn400 && status === 400 && filterIds && filterIds.length > 1 && depth < 10) {
        this.splitRetries++;
        const mid = Math.ceil(filterIds.length / 2);
        const left = `video==${filterIds.slice(0, mid).join(",")}`;
        const right = `video==${filterIds.slice(mid).join(",")}`;
        const results = await Promise.allSettled([
          this.fetchVideoReportWithSplitRetries(left, metrics, urlIds, depth + 1, allowSplitOn400, requestOptions),
          this.fetchVideoReportWithSplitRetries(right, metrics, urlIds, depth + 1, allowSplitOn400, requestOptions)
        ]);
        const payloads: any[] = [];
        for (const res of results) {
          if (res.status === "fulfilled") payloads.push(res.value);
        }
        if (payloads.length > 0) return flattenReportPayloads(payloads);
      }
      throw error;
    }
  }

  private async fetchVideoReport(ids: string, metrics: string[], urlIds: string, opts?: any): Promise<any> {
    const isVideoFilter = ids.startsWith("video==");
    if (isVideoFilter) {
      const p = await this.fetchVideoReportPage(ids, metrics, urlIds, 1, opts);
      return flattenReportPayloads([p]);
    }
    const pages: any[] = [];
    let startIndex = 1;
    for (let page = 0; page < MAX_ANALYTICS_VIDEO_PAGES; page++) {
      let p: any;
      try {
        p = await this.fetchVideoReportPage(ids, metrics, urlIds, startIndex, opts);
      } catch (e) {
        if (page > 0 && getErrorStatus(e) === 400) break;
        throw e;
      }
      pages.push(p);
      const rowCount = p?.rows?.length || 0;
      if (rowCount < ANALYTICS_VIDEO_PAGE_SIZE) break;
      startIndex += rowCount;
    }
    return flattenReportPayloads(pages);
  }

  private async fetchVideoReportPage(ids: string, metrics: string[], urlIds: string, startIndex = 1, opts: any = {}): Promise<any> {
    const isVideoFilter = ids.startsWith("video==");
    const includeSort = opts.includeSort ?? !isVideoFilter;
    const includeMaxResults = opts.includeMaxResults ?? true;
    const safeMetrics = Array.from(new Set(metrics.filter(m => m !== "creatorContentType")));
    if (shouldForceViewsMetric(ids, safeMetrics, metrics.includes("creatorContentType")) && !safeMetrics.includes("views")) {
      safeMetrics.unshift("views");
    }
    if (safeMetrics.length === 0) safeMetrics.push("views");
    
    const filters = isVideoFilter ? `&filters=${encodeURIComponent(ids)}` : "";
    const dims = metrics.includes("creatorContentType") ? "video,creatorContentType" : "video";
    const maxResults = includeMaxResults ? `&maxResults=${ANALYTICS_VIDEO_PAGE_SIZE}` : "";
    const startIdx = !isVideoFilter && opts.includeStartIndex ? `&startIndex=${startIndex}` : "";
    const sort = !isVideoFilter && includeSort ? "&sort=-views" : "";
    
    const url = `https://youtubeanalytics.googleapis.com/v2/reports?ids=${urlIds}&startDate=${this.startDate}&endDate=${this.endDate}&metrics=${safeMetrics.join(",")}&dimensions=${dims}${filters}${maxResults}${startIdx}${sort}`;
    this.requestCharCounts.push(url.length);
    
    const token = await refreshTokenIfExpired();
    const response = await proxyFetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) throw await handleYouTubeApiError(response);
    return await response.json();
  }

  private recordFailure(failure: any) {
    const key = `${failure.group}::${failure.ids}::${failure.status}::${failure.reason}`;
    if (this.loggedFailureDedup.has(key)) return;
    this.loggedFailureDedup.add(key);
    this.diagnosticsFailures.push(failure);
  }
}
