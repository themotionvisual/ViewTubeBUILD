/**
 * YouTube Data Normalization Service
 * Maps polymorphic CSV headers and API keys to a standardized internal schema.
 */

export const HEADER_MAP: Record<string, string> = {
 // Dimensions
 "Video title": "Dimension",
 Title: "Dimension",
 Video: "Dimension",
 Geography: "Dimension",
 "Traffic source": "Dimension",
 "Device type": "Dimension",
 "Subscription status": "Dimension",
 "Viewer age": "Dimension",
 "Viewer gender": "Dimension",
 Date: "Date",

 // Core Metrics
 Views: "Views",
 "View count": "Views",
 "Watch time (hours)": "Watch Time (Hours)",
 "Watch Time (Hours)": "Watch Time (Hours)",
 "Estimated revenue": "Revenue",
 "Estimated revenue (USD)": "Revenue",
 "Estimated revenue (Local)": "Revenue",
 estimatedRevenue: "Revenue",
 Revenue: "Revenue",
 "Your estimated revenue (USD)": "Revenue",
 RPM: "RPM",
 "RPM (USD)": "RPM",
 CPM: "CPM",
 "CPM (USD)": "CPM",
 Subscribers: "Subscribers Gained",
 "Subscribers gained": "Subscribers Gained",
 subscribersGained: "Subscribers Gained",

 // Engagement
 Impressions: "Impressions",
 impressions: "Impressions",
 videoThumbnailImpressions: "Impressions",
 "Impressions click-through rate (%)": "CTR (%)",
 impressionClickThroughRate: "CTR (%)",
 videoThumbnailImpressionsClickRate: "CTR (%)",
 "CTR (%)": "CTR (%)",
 "Average view duration": "AVD (Sec)",
 averageViewDuration: "AVD (Sec)",
 "Average view percentage (%)": "AVP (%)",
 averageViewPercentage: "AVP (%)",
 "AVP (%)": "AVP (%)",
 estimatedMinutesWatched: "Watch Time (Hours)",
 Likes: "Likes",
 likes: "Likes",
 Dislikes: "Dislikes",
 dislikes: "Dislikes",
 Comments: "Comments",
 comments: "Comments",
 "Comments added": "Comments",
 Shares: "Shares",
 shares: "Shares",
 Hypes: "Hypes",
 "Hype points": "Hype Points",

 // Audience
 "Unique viewers": "Unique Viewers",
 "New viewers": "New Viewers",
 "Returning viewers": "Returning Viewers",
 "Casual viewers": "Casual Viewers",
 "Regular viewers": "Regular Viewers",
 "Average views per viewer": "Avg Views Per Viewer",

 // Shorts-specific engagement (CSV export column names)
 "Stayed to watch (%)": "STW %",
 "Stayed to watch at 0:30 (%)": "STW %",
 stayedToWatch: "STW %",

 // End screen & cards (CSV export column names)
 "End screen click rate": "End screen click rate",
 "Clicks per end screen element shown (%)": "End screen click rate",
 endScreenClickRate: "End screen click rate",
 "Card click rate": "Card click rate",
 cardClickRate: "Card click rate",
 annotationClickThroughRate: "Card click rate",

 // Engaged views
 "Engaged views": "Engaged views",
 "Engaged Views": "Engaged views",
 engagedViews: "Engaged views",

 // Shorts feed views (used for format detection AND as a metric)
 "Views from Shorts feed": "Shorts feed views",
 "Shorts feed views": "Shorts feed views",

 // Subscribers lost
 "Subscribers lost": "Subscribers Lost",
 subscribersLost: "Subscribers Lost",

 // Membership & Shopping
 "Members gained": "Members Gained",
 "Members lost": "Members Lost",
 "Total members": "Total Members",
 "Product clicks": "Product Clicks",
 Orders: "Orders",

 // YouTube Analytics API v2 field names (exact matches from API response)
 // Note: These are already covered by the string versions above, so no duplicates needed
}

export const normalizeRow = (row: Record<string, any>): Record<string, any> => {
 const normalized: Record<string, any> = {}

 const lowerHeaderMap = Object.keys(HEADER_MAP).reduce(
  (acc, key) => {
   acc[key.toLowerCase()] = HEADER_MAP[key]
   return acc
  },
  {} as Record<string, string>,
 )

 Object.keys(row).forEach((key) => {
  const val = row[key]
  const lowerKey = key.toLowerCase()
  const standardKey = lowerHeaderMap[lowerKey]

  if (standardKey) {
   if (standardKey === "Dimension" && typeof val === "string") {
    normalized["titleLength"] = val.length
   }
   if (
    typeof val === "string" &&
    standardKey !== "Dimension" &&
    standardKey !== "Date"
   ) {
    const cleaned = val.replace(/[^0-9.-]/g, "")
    normalized[standardKey] = cleaned === "" ? 0 : Number(cleaned)
   } else {
    normalized[standardKey] = val
   }
   if (lowerKey === "estimatedminuteswatched") {
    normalized[standardKey] = (Number(normalized[standardKey]) || 0) / 60
   }
  } else if (key.startsWith("_")) {
   normalized[key] = val
  } else {
   normalized[key] = val
  }
 })

 return normalized
}

export const getStandardKey = (rawKey: string): string => {
 return HEADER_MAP[rawKey] || rawKey
}

export const METRIC_COLORS: Record<string, string> = {
 Views: "#FF7497",
 Revenue: "#CCFF00",
 "Subscribers Gained": "#00CCFF",
 "Watch Time (Hours)": "#FFDD00",
 "CTR (%)": "#FF00FF",
 "AVP (%)": "#00FFCC",
}
