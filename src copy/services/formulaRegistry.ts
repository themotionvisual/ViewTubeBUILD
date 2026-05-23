import type { MetricAccuracyClass } from "./productArchitecture"

export interface FormulaSpec {
 id: string
 label: string
 outputCanonicalKey: string
 inputs: string[]
 unit: string
 description: string
 expectedScope:
  | "channel"
  | "video_shared"
  | "short_only"
  | "long_only"
  | "geo"
  | "demographic"
  | "traffic"
  | "device"
  | "retention"
  | "monetization"
}

export interface FormulaValidationResult {
 formulaId: string
 passed: boolean
 issues: string[]
 accuracyClass: MetricAccuracyClass
}

export interface FormulaEvaluationResult {
 formulaId: string
 value: number | null
 validation: FormulaValidationResult
}

export const FORMULA_REGISTRY: FormulaSpec[] = [
 {
  id: "watch_hours_from_minutes",
  label: "Watch Hours",
  outputCanonicalKey: "watchHours",
  inputs: ["estimatedMinutesWatched"],
  unit: "hours",
  description: "Converts estimated minutes watched to hours.",
  expectedScope: "video_shared",
 },
 {
  id: "engagement_rate_basic",
  label: "Engagement Rate",
  outputCanonicalKey: "engagementRate",
  inputs: ["likes", "comments", "shares", "views"],
  unit: "percent",
  description: "(likes + comments + shares) / views * 100",
  expectedScope: "video_shared",
 },
 {
  id: "rpm_from_revenue_and_views",
  label: "RPM",
  outputCanonicalKey: "rpm",
  inputs: ["estimatedRevenue", "views"],
  unit: "currency_per_thousand_views",
  description: "estimatedRevenue / views * 1000",
  expectedScope: "video_shared",
 },
 {
  id: "subscriber_conversion_rate",
  label: "Subscriber Conversion Rate",
  outputCanonicalKey: "subscriberConversionRate",
  inputs: ["subscribersGained", "views"],
  unit: "percent",
  description: "subscribersGained / views * 100",
  expectedScope: "video_shared",
 },
 {
  id: "impression_ctr_derived",
  label: "Impression Click-Through Rate",
  outputCanonicalKey: "ctr",
  inputs: ["clicks", "impressions"],
  unit: "percent",
  description: "clicks / impressions * 100",
  expectedScope: "video_shared",
 },
 {
  id: "retention_quality_index",
  label: "Retention Quality Index",
  outputCanonicalKey: "retentionQualityIndex",
  inputs: ["avp", "durationSeconds"],
  unit: "index",
  description: "avp / (durationSeconds / 60)",
  expectedScope: "video_shared",
 },
 {
  id: "monetization_efficiency",
  label: "Monetization Efficiency",
  outputCanonicalKey: "monetizationEfficiency",
  inputs: ["rpm", "cpm"],
  unit: "percent",
  description: "(rpm / cpm) * 100",
  expectedScope: "monetization",
 },
 {
  id: "audience_loyalty_score",
  label: "Audience Loyalty Score",
  outputCanonicalKey: "audienceLoyaltyScore",
  inputs: ["returningViewers", "uniqueViewers"],
  unit: "percent",
  description: "(returningViewers / uniqueViewers) * 100",
  expectedScope: "channel",
 },
 {
  id: "shorts_viral_threshold",
  label: "Shorts Viral Threshold",
  outputCanonicalKey: "shortsViralThreshold",
  inputs: ["ctr", "avp"],
  unit: "index",
  description: "(ctr * avp) / 100",
  expectedScope: "short_only",
 },
 {
  id: "audience_quality_score",
  label: "Audience Quality Score",
  outputCanonicalKey: "audienceQualityScore",
  inputs: ["authenticatedViewers", "views"],
  unit: "percent",
  description: "(authenticatedViewers / views) * 100",
  expectedScope: "channel",
 },
]

const finiteNumber = (value: unknown): number | null => {
 if (typeof value === "number" && Number.isFinite(value)) return value
 if (typeof value === "string") {
  const parsed = Number(value.replace(/,/g, "").trim())
  return Number.isFinite(parsed) ? parsed : null
 }
 return null
}

export const validateFormulaInputs = (
 formula: FormulaSpec,
 values: Record<string, unknown>,
): FormulaValidationResult => {
 const issues: string[] = []
 for (const input of formula.inputs) {
  const rawValue = values[input]
  const num = finiteNumber(rawValue)
  if (num === null) {
   issues.push(`Missing numeric input: ${input}`)
  } else if (num < 0) {
   issues.push(`Negative value not allowed for ${input}`)
  }
 }

 const passed = issues.length === 0
 return {
  formulaId: formula.id,
  passed,
  issues,
  accuracyClass: passed ? "derived_exact" : "unavailable",
 }
}

const calc = (formulaId: string, values: Record<string, number>): number | null => {
 if (formulaId === "watch_hours_from_minutes") {
  return values.estimatedMinutesWatched / 60
 }

 if (formulaId === "engagement_rate_basic") {
  if (values.views <= 0) return null
  return ((values.likes + values.comments + values.shares) / values.views) * 100
 }

 if (formulaId === "rpm_from_revenue_and_views") {
  if (values.views <= 0) return null
  return (values.estimatedRevenue / values.views) * 1000
 }

 if (formulaId === "subscriber_conversion_rate") {
  if (values.views <= 0) return null
  return (values.subscribersGained / values.views) * 100
 }

 if (formulaId === "impression_ctr_derived") {
  if (values.impressions <= 0) return null
  return (values.clicks / values.impressions) * 100
 }

 if (formulaId === "retention_quality_index") {
  if (values.durationSeconds <= 0) return null
  return values.avp / (values.durationSeconds / 60)
 }

 if (formulaId === "monetization_efficiency") {
  if (values.cpm <= 0) return null
  return (values.rpm / values.cpm) * 100
 }

 if (formulaId === "audience_loyalty_score") {
  if (values.uniqueViewers <= 0) return null
  return (values.returningViewers / values.uniqueViewers) * 100
 }

 if (formulaId === "shorts_viral_threshold") {
  return (values.ctr * values.avp) / 100
 }

 if (formulaId === "audience_quality_score") {
  if (values.views <= 0) return null
  return (values.authenticatedViewers / values.views) * 100
 }

 return null
}

export const evaluateFormula = (
 formulaId: string,
 values: Record<string, unknown>,
): FormulaEvaluationResult => {
 const formula = FORMULA_REGISTRY.find((item) => item.id === formulaId)
 if (!formula) {
  return {
   formulaId,
   value: null,
   validation: {
    formulaId,
    passed: false,
    issues: ["Unknown formula"],
    accuracyClass: "unavailable",
   },
  }
 }

 const validation = validateFormulaInputs(formula, values)
 if (!validation.passed) {
  return { formulaId, value: null, validation }
 }

 const numericValues: Record<string, number> = {}
 for (const input of formula.inputs) {
  numericValues[input] = finiteNumber(values[input]) as number
 }

 const output = calc(formula.id, numericValues)
 if (output === null || !Number.isFinite(output)) {
  return {
   formulaId,
   value: null,
   validation: {
    formulaId,
    passed: false,
    issues: ["Formula preconditions were not met (likely zero denominator)."],
    accuracyClass: "unavailable",
   },
  }
 }

 return {
  formulaId,
  value: output,
  validation,
 }
}
