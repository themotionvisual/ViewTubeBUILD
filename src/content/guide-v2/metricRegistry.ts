export type GuideMetricFormat = "number" | "percent" | "duration" | "hours" | "currency" | "ratio"

export interface GuideMetricDefinition {
 id: string
 label: string
 format: GuideMetricFormat
 definition: string
 source: "YouTube Analytics API" | "YouTube Data API" | "Derived"
 aliases?: readonly string[]
}

export const GUIDE_METRICS: readonly GuideMetricDefinition[] = Object.freeze([
 { id:"views", label:"Views", format:"number", definition:"Valid views reported for the selected scope and time window.", source:"YouTube Analytics API" },
 { id:"watchTime", label:"Watch Time", format:"hours", definition:"Total estimated minutes watched, presented as hours where appropriate.", source:"YouTube Analytics API", aliases:["estimatedMinutesWatched"] },
 { id:"averageViewDuration", label:"Average View Duration", format:"duration", definition:"Average playback duration per view.", source:"YouTube Analytics API", aliases:["AVD"] },
 { id:"averagePercentageViewed", label:"Average Percentage Viewed", format:"percent", definition:"Average percentage of the video watched per view.", source:"YouTube Analytics API", aliases:["AVP","AVP%"] },
 { id:"subscribers", label:"Subscribers", format:"number", definition:"Subscriber change or subscriber count according to the dataset context.", source:"YouTube Analytics API" },
 { id:"likes", label:"Likes", format:"number", definition:"Likes attributed to the selected content and scope.", source:"YouTube Analytics API" },
 { id:"comments", label:"Comments", format:"number", definition:"Comments attributed to the selected content and scope.", source:"YouTube Analytics API" },
 { id:"shares", label:"Shares", format:"number", definition:"Sharing actions attributed to the selected content and scope.", source:"YouTube Analytics API" },
 { id:"revenue", label:"Estimated Revenue", format:"currency", definition:"Estimated creator revenue for the selected scope.", source:"YouTube Analytics API", aliases:["estimatedRevenue"] },
 { id:"adRevenue", label:"Ad Revenue", format:"currency", definition:"Estimated advertising revenue.", source:"YouTube Analytics API" },
 { id:"redRevenue", label:"YouTube Premium Revenue", format:"currency", definition:"Estimated YouTube Premium revenue.", source:"YouTube Analytics API" },
 { id:"impressions", label:"Impressions", format:"number", definition:"Eligible thumbnail impressions where supported by the upstream report.", source:"YouTube Analytics API" },
 { id:"ctr", label:"Impressions CTR", format:"percent", definition:"Percentage of eligible impressions that became views.", source:"YouTube Analytics API", aliases:["impressionsClickThroughRate"] },
 { id:"audienceWatchRatio", label:"Audience Watch Ratio", format:"ratio", definition:"Audience retention ratio at a point in elapsed video time.", source:"YouTube Analytics API" },
 { id:"relativeRetentionPerformance", label:"Relative Retention Performance", format:"ratio", definition:"Retention performance relative to videos of similar length.", source:"YouTube Analytics API" },
])

export const guideMetricById = (id: string) => GUIDE_METRICS.find((metric) => metric.id === id || metric.aliases?.includes(id)) ?? null
