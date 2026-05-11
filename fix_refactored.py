import re

with open('/Users/cwb/Downloads/viewtube/viewtubeX/src/services/youtube/refactored.ts', 'r') as f:
    content = f.read()

# Fix batchMode
content = content.replace(
    """options: {
  window?: AnalyticsWindow
  targetVideoIds?: string[]
  optionalMetricsEnabled?: boolean
 } = {},""",
    """options: {
  window?: AnalyticsWindow
  targetVideoIds?: string[]
  optionalMetricsEnabled?: boolean
  batchMode?: "initial" | "next"
 } = {},"""
)

# Fix Set iteration
content = content.replace(
    "new Set([...runDisabledMetrics, ...unsupportedVideoAnalyticsMetrics])",
    "new Set(Array.from(runDisabledMetrics).concat(Array.from(unsupportedVideoAnalyticsMetrics)))"
)

# Fix authSession.ts import.meta.env
# Actually, the error in authSession.ts isn't what we are supposed to fix for this task, but we can ignore it.

# Implement Promise.allSettled in the fallback logic (around line 900)
# We need to find the `for (const metric of activeMetrics) {` loop and replace it.
# This loop handles the individual metric fallback.
# It's currently synchronous and blocks UI.

old_loop = """      for (const metric of activeMetrics) {
       if (!shouldTryPerMetric) continue
       const metricComboKey = `${groupName}::${ids}::${metric}`
      if (knownInvalidCombos.has(metricComboKey)) {
       suppressedInvalidComboCount += 1
       recordFailure({
        group: groupName,
        ids,
        metrics: [metric],
        status: 400,
        reason:
         "Suppressed known-invalid impressions/CTR metric request for this sync.",
        requestClass: "video_top_videos_channel_filter",
        outcome: "suppressed",
       })
       continue
      }
       try {
        const metricPayload = await fetchVideoReportWithSplitRetries(
         ids,
         [metric],
         0,
         false,
         {
          includeSort: false,
          includeStartIndex: false,
          includeMaxResults: true,
         },
        )
        metricPayloads.push(filterPayloadToTargetVideos(metricPayload, targetVideoIdSet))
       metricCapabilityByMetric.set(metric, { status: "available" })
       runMetricCapabilities.set(metric, {
        metric,
        status: "available",
        source: "api",
       })
      } catch (metricError) {
       const metricErrorMessage =
        metricError instanceof Error ? metricError.message : String(metricError)
       const metricStatus = getErrorStatus(metricError)
       metricWarnings.push(`${metric}: ${metricErrorMessage}`)
        recordFailure({
         group: groupName,
         ids,
         metrics: [metric],
         status: metricStatus,
         reason: metricErrorMessage,
         requestClass: "video_top_videos_channel_filter",
         outcome: metricStatus === 400 ? "quarantined" : "failed",
         attemptedShape: baseAttemptShape,
        })
       metricCapabilityByMetric.set(metric, {
        status:
         metricStatus === 400
          ? "temporarily_blocked"
          : metricStatus === 403
           ? "missing_scope"
           : "api_request_failed",
        reasonCode:
         metricStatus === 400
          ? "temporarily_blocked"
          : metricStatus === 403
           ? "missing_scope"
          : "api_request_failed",
       })
       runMetricCapabilities.set(metric, {
        metric,
        status:
         metricStatus === 400
          ? "temporarily_blocked"
          : metricStatus === 403
           ? "missing_scope"
           : "api_request_failed",
        reasonCode:
         metricStatus === 400
          ? "temporarily_blocked"
          : metricStatus === 403
           ? "missing_scope"
          : "api_request_failed",
        source: "api",
       })
       if (metricStatus === 400) {
       knownInvalidCombos.add(metricComboKey)
        SESSION_KNOWN_INVALID_COMBOS.add(metricComboKey)
       }
      }
     }"""

new_loop = """      if (shouldTryPerMetric) {
       const metricPromises = activeMetrics.map(async (metric) => {
        const metricComboKey = `${groupName}::${ids}::${metric}`;
        if (knownInvalidCombos.has(metricComboKey)) {
         suppressedInvalidComboCount += 1;
         recordFailure({
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
         const metricPayload = await fetchVideoReportWithSplitRetries(
          ids,
          [metric],
          0,
          false,
          {
           includeSort: false,
           includeStartIndex: false,
           includeMaxResults: true,
          },
         );
         const filtered = filterPayloadToTargetVideos(metricPayload, targetVideoIdSet);
         return { metric, payload: filtered, success: true };
        } catch (metricError) {
         return { metric, error: metricError, success: false };
        }
       });

       const results = await Promise.allSettled(metricPromises);
       for (const result of results) {
        if (result.status === "fulfilled" && result.value) {
         if (result.value.success) {
          metricPayloads.push(result.value.payload);
          metricCapabilityByMetric.set(result.value.metric, { status: "available" });
          runMetricCapabilities.set(result.value.metric, {
           metric: result.value.metric,
           status: "available",
           source: "api",
          });
         } else {
          const metric = result.value.metric;
          const metricError = result.value.error;
          const metricComboKey = `${groupName}::${ids}::${metric}`;
          const metricErrorMessage = metricError instanceof Error ? metricError.message : String(metricError);
          const metricStatus = getErrorStatus(metricError);
          metricWarnings.push(`${metric}: ${metricErrorMessage}`);
          recordFailure({
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
          metricCapabilityByMetric.set(metric, {
           status: blockedStatus,
           reasonCode: blockedStatus,
          });
          runMetricCapabilities.set(metric, {
           metric,
           status: blockedStatus,
           reasonCode: blockedStatus,
           source: "api",
          });
          if (metricStatus === 400) {
           knownInvalidCombos.add(metricComboKey);
           SESSION_KNOWN_INVALID_COMBOS.add(metricComboKey);
          }
         }
        }
       }
      }"""

content = content.replace(old_loop, new_loop)

# Also fix the inner fallback loop for non-impressions_ctr metrics (around line 1050)
old_loop_2 = """    for (const metric of activeMetrics) {
     try {
      const metricPayload = await fetchVideoReportWithSplitRetries(
       ids,
       [metric],
       0,
       true,
      )
      metricPayloads.push(metricPayload)
     } catch (metricError) {
      const metricErrorMessage =
       metricError instanceof Error ? metricError.message : String(metricError)
      metricWarnings.push(`${metric}: ${metricErrorMessage}`)
      const metricStatus = getErrorStatus(metricError)
      recordFailure({
       group: groupName,
       ids,
       metrics: [metric],
       status: metricStatus,
       reason: metricErrorMessage,
       requestClass: getAnalyticsRequestClass(ids, [metric]),
       outcome: metricStatus === 400 ? "quarantined" : "failed",
      })
      if (metricStatus === 400) {
       unsupportedVideoAnalyticsMetrics.add(metric)
       runDisabledMetrics.add(metric)
       metricCapabilityByMetric.set(metric, {
        status: "unsupported_for_dimension",
        reasonCode: "unsupported_for_dimension",
       })
       runMetricCapabilities.set(metric, {
        metric,
        status: "unsupported_for_dimension",
        reasonCode: "unsupported_for_dimension",
        source: "api",
       })
       knownInvalidCombos.add(`${groupName}::${ids}::${metric}`)
       SESSION_KNOWN_INVALID_COMBOS.add(`${groupName}::${ids}::${metric}`)
      }
     }
    }"""

new_loop_2 = """    const metricPromises = activeMetrics.map(async (metric) => {
     try {
      const metricPayload = await fetchVideoReportWithSplitRetries(
       ids,
       [metric],
       0,
       true,
      );
      return { metric, payload: metricPayload, success: true };
     } catch (metricError) {
      return { metric, error: metricError, success: false };
     }
    });

    const results = await Promise.allSettled(metricPromises);
    for (const result of results) {
     if (result.status === "fulfilled" && result.value) {
      if (result.value.success) {
       metricPayloads.push(result.value.payload);
      } else {
       const metric = result.value.metric;
       const metricError = result.value.error;
       const metricErrorMessage = metricError instanceof Error ? metricError.message : String(metricError);
       metricWarnings.push(`${metric}: ${metricErrorMessage}`);
       const metricStatus = getErrorStatus(metricError);
       recordFailure({
        group: groupName,
        ids,
        metrics: [metric],
        status: metricStatus,
        reason: metricErrorMessage,
        requestClass: getAnalyticsRequestClass(ids, [metric]),
        outcome: metricStatus === 400 ? "quarantined" : "failed",
       });
       if (metricStatus === 400) {
        unsupportedVideoAnalyticsMetrics.add(metric);
        runDisabledMetrics.add(metric);
        metricCapabilityByMetric.set(metric, {
         status: "unsupported_for_dimension",
         reasonCode: "unsupported_for_dimension",
        });
        runMetricCapabilities.set(metric, {
         metric,
         status: "unsupported_for_dimension",
         reasonCode: "unsupported_for_dimension",
         source: "api",
        });
        knownInvalidCombos.add(`${groupName}::${ids}::${metric}`);
        SESSION_KNOWN_INVALID_COMBOS.add(`${groupName}::${ids}::${metric}`);
       }
      }
     }
    }"""

content = content.replace(old_loop_2, new_loop_2)

with open('/Users/cwb/Downloads/viewtube/viewtubeX/src/services/youtube/refactored.ts', 'w') as f:
    f.write(content)
print("Done")
