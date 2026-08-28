export type GuideMetricFormat = "number" | "percent" | "duration" | "hours" | "currency" | "ratio"

export interface GuideMetricDefinition {
 id: string
 label: string
 format: GuideMetricFormat
 definition: string
 source: "YouTube Analytics API" | "YouTube Data API" | "Derived"
 aliases?: readonly string[]
 interpretation?: string
 caution?: string
}

export const GUIDE_METRICS: readonly GuideMetricDefinition[] = Object.freeze([
 { id:"views", label:"Views", format:"number", definition:"Valid views reported for the selected scope and time window.", source:"YouTube Analytics API" },
 { id:"watchTime", label:"Watch Time", format:"hours", definition:"Total estimated minutes watched, presented as hours where appropriate.", source:"YouTube Analytics API", aliases:["estimatedMinutesWatched"], interpretation:"Use Watch Time to measure total attention earned. Pair it with Views and Average View Duration/Percentage to distinguish broad reach from deep viewing.", caution:"A larger channel or longer video can naturally accumulate more watch time, so compare equivalent scopes and formats." },
 { id:"averageViewDuration", label:"Average View Duration", format:"duration", definition:"Average playback duration per view.", source:"YouTube Analytics API", aliases:["AVD"], interpretation:"Use AVD to understand the average amount of clock time a view contributes. It is especially useful when comparing videos of similar length.", caution:"AVD alone can make longer videos look stronger. Pair it with AVP% when lengths differ." },
 { id:"averagePercentageViewed", label:"Average Percentage Viewed", format:"percent", definition:"Average percentage of the video watched per view.", source:"YouTube Analytics API", aliases:["AVP","AVP%"], interpretation:"Use AVP% to compare how completely viewers consume videos, especially when video lengths differ.", caution:"A high percentage on a very short video and a lower percentage on a long video are not equivalent amounts of watch time." },
 { id:"subscribers", label:"Subscribers", format:"number", definition:"Subscriber change or subscriber count according to the dataset context.", source:"YouTube Analytics API" },
 { id:"likes", label:"Likes", format:"number", definition:"Likes attributed to the selected content and scope.", source:"YouTube Analytics API" },
 { id:"comments", label:"Comments", format:"number", definition:"Comments attributed to the selected content and scope.", source:"YouTube Analytics API" },
 { id:"shares", label:"Shares", format:"number", definition:"Sharing actions attributed to the selected content and scope.", source:"YouTube Analytics API" },
 { id:"revenue", label:"Estimated Revenue", format:"currency", definition:"Estimated creator revenue for the selected scope.", source:"YouTube Analytics API", aliases:["estimatedRevenue"], interpretation:"Use Estimated Revenue as the total monetization outcome for the selected scope, then use rate metrics and content mix to explain changes.", caution:"Revenue is sensitive to geography, ad demand, format, seasonality, monetized playbacks, and viewer mix—not views alone." },
 { id:"adRevenue", label:"Ad Revenue", format:"currency", definition:"Estimated advertising revenue.", source:"YouTube Analytics API" },
 { id:"redRevenue", label:"YouTube Premium Revenue", format:"currency", definition:"Estimated YouTube Premium revenue.", source:"YouTube Analytics API" },
 { id:"impressions", label:"Impressions", format:"number", definition:"Eligible thumbnail impressions where supported by the upstream report.", source:"YouTube Analytics API" },
 { id:"ctr", label:"Impressions CTR", format:"percent", definition:"Percentage of eligible impressions that became views.", source:"YouTube Analytics API", aliases:["impressionsClickThroughRate"], interpretation:"CTR describes how often eligible thumbnail impressions became views. Use it primarily as a packaging signal alongside impression volume and downstream watch quality.", caution:"CTR changes with traffic surface and audience expansion. A falling CTR can accompany healthy growth when YouTube shows a video to a broader audience." },
 { id:"audienceWatchRatio", label:"Audience Watch Ratio", format:"ratio", definition:"Audience retention ratio at a point in elapsed video time.", source:"YouTube Analytics API", interpretation:"Read the retention curve from left to right and focus on changes in shape: early drops, plateaus, spikes, and late-video decay.", caution:"Do not diagnose a moment from the curve alone; align the timestamp with the actual video content." },
 { id:"relativeRetentionPerformance", label:"Relative Retention Performance", format:"ratio", definition:"Retention performance relative to videos of similar length.", source:"YouTube Analytics API", interpretation:"Use relative retention to understand whether a video retention result is unusually strong or weak for content of comparable length.", caution:"It is a comparative benchmark, not the same thing as raw percentage viewed." },
])

export const guideMetricById = (id: string) => GUIDE_METRICS.find((metric) => metric.id === id || metric.aliases?.includes(id)) ?? null
