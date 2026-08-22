import { DASHBOARD_WIDGET_BY_ID, SUPPORTED_DASHBOARD_WIDGET_IDS } from "./WidgetRegistry"
import type {
  DashboardHeightBucket,
  DashboardSizeBucket,
  DashboardWidgetDataStatus,
} from "./types"

export type WidgetContainerVariant = "compact" | "standard" | "wide"
export type WidgetPerformanceCost = "light" | "moderate" | "heavy"

export interface WidgetCertificationContract {
  widgetId: string
  informationPriority: string
  primaryAction: string
  supportedSizes: readonly DashboardSizeBucket[]
  supportedHeights: readonly DashboardHeightBucket[]
  supportedDimensions: readonly Readonly<{ size: DashboardSizeBucket; height: DashboardHeightBucket }>[]
  containerVariants: readonly WidgetContainerVariant[]
  dataStates: readonly DashboardWidgetDataStatus[]
  keyboardPath: string
  performanceCost: WidgetPerformanceCost
}

const STANDARD_STATES = ["loading", "ready", "empty", "blocked", "stale", "error"] as const
const STANDARD_VARIANTS = ["compact", "standard", "wide"] as const

const CERTIFICATION_INTENT: Record<string, readonly [string, string, WidgetPerformanceCost]> = {
  "app-verification-explainer": ["Explain product trust and data access", "Open account or help guidance", "light"],
  "kpi-cluster": ["Summarize channel health", "Change analytics time window", "moderate"],
  "community-post": ["Draft an audience update", "Create community post", "moderate"],
  "comment-replier": ["Resolve recent audience replies", "Draft a reply", "moderate"],
  "consistency-heatmap": ["Show publishing cadence", "Inspect an upload day", "light"],
  "realtime-performance": ["Expose current performance pulse", "Refresh live metrics", "moderate"],
  "goals-tracker": ["Track creator targets", "Update a goal", "light"],
  "keyword-engine": ["Discover search opportunities", "Analyze a keyword", "heavy"],
  "daily-oracle": ["Prioritize the next creator action", "Generate daily guidance", "heavy"],
  "ask-me": ["Answer a focused channel question", "Ask the Brain", "heavy"],
  "ai-journal": ["Capture creator context", "Add journal entry", "moderate"],
  "image-generator": ["Create campaign imagery", "Generate an image", "heavy"],
  "video-uploader": ["Prepare a new upload", "Publish video", "moderate"],
  "data-edit": ["Correct canonical metadata", "Edit a data field", "moderate"],
  "traffic-sources": ["Explain discovery mix", "Inspect a traffic source", "moderate"],
  "shorts-vs-long": ["Compare publishing formats", "Inspect format performance", "moderate"],
  "publish-momentum": ["Show publishing trajectory", "Inspect momentum period", "moderate"],
  "audience-matrix": ["Segment audience behavior", "Inspect an audience segment", "moderate"],
  "system-micro-stack": ["Expose dashboard system controls", "Show or hide dashboard card controls", "light"],
  "keyword-overlap-intelligence": ["Reveal competing keyword clusters", "Compare keyword overlap", "heavy"],
  "retention-sim": ["Model retention changes", "Run retention simulation", "heavy"],
  "upload-scheduler": ["Plan publishing time", "Schedule an upload", "moderate"],
  "brain-hub": ["Summarize governed AI context", "Open Brain workspace", "heavy"],
  "thumb-ai": ["Improve thumbnail direction", "Generate thumbnail concepts", "heavy"],
  "quick-actions": ["Surface frequent creator tasks", "Launch a quick action", "light"],
  "ai-prompt-box": ["Run a fast strategy prompt", "Submit an AI prompt", "heavy"],
  "revenue-momentum": ["Show monetization trajectory", "Change revenue metric", "moderate"],
  "title-rewriter": ["Improve video title options", "Rewrite a title", "heavy"],
  "description-editor": ["Improve video description copy", "Save description draft", "moderate"],
  "hashtag-analyzer": ["Evaluate hashtag fit", "Analyze hashtags", "heavy"],
}

export const WIDGET_CERTIFICATION_MATRIX: Record<string, WidgetCertificationContract> =
  Object.fromEntries(SUPPORTED_DASHBOARD_WIDGET_IDS.flatMap((widgetId) => {
    const definition = DASHBOARD_WIDGET_BY_ID[widgetId]
    const intent = CERTIFICATION_INTENT[widgetId]
    if (!definition || !intent) return []
    return [[widgetId, {
      widgetId,
      informationPriority: intent[0],
      primaryAction: intent[1],
      supportedSizes: definition.supportedSizes,
      supportedHeights: definition.supportedHeights,
      supportedDimensions: definition.supportedDimensions,
      containerVariants: STANDARD_VARIANTS,
      dataStates: STANDARD_STATES,
      keyboardPath: "Tab to header controls; use the labelled primary action; Shift+Tab returns to the widget header.",
      performanceCost: intent[2],
    } satisfies WidgetCertificationContract]]
  }))

export const buildWidgetCertificationReport = () => {
  const missing = SUPPORTED_DASHBOARD_WIDGET_IDS.filter((id) => !WIDGET_CERTIFICATION_MATRIX[id])
  const invalid = SUPPORTED_DASHBOARD_WIDGET_IDS.filter((id) => {
    const contract = WIDGET_CERTIFICATION_MATRIX[id]
    return !contract
      || contract.supportedSizes.length === 0
      || contract.supportedHeights.length === 0
      || contract.supportedDimensions.length === 0
      || contract.containerVariants.length !== 3
      || contract.dataStates.length !== STANDARD_STATES.length
      || !contract.primaryAction.trim()
  })

  return {
    certified: missing.length === 0 && invalid.length === 0,
    supportedCount: SUPPORTED_DASHBOARD_WIDGET_IDS.length,
    missing,
    invalid,
  }
}
