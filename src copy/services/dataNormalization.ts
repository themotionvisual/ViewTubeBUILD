import { toNumber } from "./dataUtils"
import { METRIC_REGISTRY } from "./analyticsContract"

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

 // Shorts feed views (used for format detection AND as a metric)
 "Views from Shorts feed": "Shorts feed views",
 "Shorts feed views": "Shorts feed views",

 // Membership & Shopping
 "Members gained": "Members Gained",
 "Members lost": "Members Lost",
 "Total members": "Total Members",
 "Product clicks": "Product Clicks",
 Orders: "Orders",
}

Object.values(METRIC_REGISTRY).forEach((def) => {
 const standardKey = def.displayVariants.commonName
 def.aliases.forEach((alias) => {
  HEADER_MAP[alias] = standardKey
 })
 HEADER_MAP[def.key] = standardKey
})

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
    normalized[standardKey] = toNumber(val)
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
