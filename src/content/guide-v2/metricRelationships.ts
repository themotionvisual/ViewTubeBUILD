import type { GuideMetricDefinition } from "./metricRegistry"

export interface GuideMetricRelationship {
 metricId: string
 pairWith: readonly string[]
 why: string
}

export const GUIDE_METRIC_RELATIONSHIPS: readonly GuideMetricRelationship[] = Object.freeze([
 { metricId:"views", pairWith:["impressions","ctr","watchTime","averagePercentageViewed"], why:"Views tells you the size of the outcome. Pair it with discovery and watch-quality metrics to understand how that outcome was created." },
 { metricId:"impressions", pairWith:["ctr","views","watchTime"], why:"Impressions measures eligible exposure. CTR shows packaging response; Views and Watch Time show whether that exposure produced meaningful consumption." },
 { metricId:"ctr", pairWith:["impressions","views","averagePercentageViewed","watchTime"], why:"CTR is most useful when you can see both opportunity size and what viewers did after clicking." },
 { metricId:"watchTime", pairWith:["views","averageViewDuration","averagePercentageViewed"], why:"Total attention is easier to diagnose when separated into audience size and depth of viewing." },
 { metricId:"averageViewDuration", pairWith:["averagePercentageViewed","watchTime","views"], why:"AVD provides clock-time depth while AVP% normalizes for video length." },
 { metricId:"averagePercentageViewed", pairWith:["averageViewDuration","audienceWatchRatio","views"], why:"AVP% summarizes consumption depth; retention shape reveals where that average was won or lost." },
 { metricId:"audienceWatchRatio", pairWith:["averagePercentageViewed","relativeRetentionPerformance"], why:"Absolute retention shape and relative retention answer different questions: what happened in this video and how unusual that behavior is for its length." },
 { metricId:"relativeRetentionPerformance", pairWith:["audienceWatchRatio","averagePercentageViewed"], why:"Use the benchmark alongside the video's own retention curve so relative performance does not replace the underlying viewer behavior." },
 { metricId:"revenue", pairWith:["views","watchTime","adRevenue","redRevenue"], why:"Revenue should be explained by audience scale, attention, and monetization mix rather than interpreted as a standalone quality score." },
 { metricId:"adRevenue", pairWith:["revenue","views","watchTime"], why:"Ad revenue is one component of total earnings and can move differently from audience growth." },
 { metricId:"redRevenue", pairWith:["revenue","watchTime"], why:"Premium revenue reflects a different monetization stream and should be separated from advertising." },
 { metricId:"subscribers", pairWith:["views","watchTime","averagePercentageViewed"], why:"Subscriber movement becomes more meaningful when compared with the amount and quality of attention that produced it." },
 { metricId:"likes", pairWith:["views","comments","shares"], why:"Engagement actions are easier to interpret as a family than as isolated totals." },
 { metricId:"comments", pairWith:["views","likes","shares"], why:"Comments can signal depth of response, but their meaning changes with reach and the surrounding engagement pattern." },
 { metricId:"shares", pairWith:["views","likes","comments"], why:"Shares can indicate strong utility or emotional response; compare them with reach and other engagement actions." },
])

export const guideMetricRelationship = (metric: GuideMetricDefinition) =>
 GUIDE_METRIC_RELATIONSHIPS.find((relationship) => relationship.metricId === metric.id) ?? null
