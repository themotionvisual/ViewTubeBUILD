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
  "overview-data-visuals": ["Show format share + revenue-source breakdown", "Inspect a share segment", "light"],
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
  "script-studio": ["Edit script and estimate video runtime", "Rewrite selection with AI", "heavy"],
  "hashtag-analyzer": ["Evaluate hashtag fit", "Analyze hashtags", "heavy"],
  "dashboard-controls": ["Manage dashboard layout, widget toggles, presets, and backup", "Toggle widget visibility or switch preset", "light"],
  "sync-controller": ["Monitor and trigger VT-SYNC dataset operations", "Trigger dataset sync", "moderate"],
  "flight-check": ["Pre-publish checklist and sanity scan", "Review upload readiness", "moderate"],
  // ── widgets promoted into the default cohort with brain-parity layout ─
  "tag-generator": ["Generate discovery tags for a video", "Regenerate tag set", "heavy"],
  "superfan-card": ["Surface top loyal viewer for reply", "Send superfan message", "light"],
  "channel-overview": ["Summarize 28-day channel performance", "Change reporting window", "light"],
  "audience-retention": ["Compare audience retention curves", "Inspect a retention point", "moderate"],
  "relative-retention-benchmark": ["Benchmark retention vs peers", "Change benchmark cohort", "moderate"],
  "ad-stack-intelligence": ["Analyze monetization stack and CPMs", "Change ad metric window", "heavy"],
  "revenue-chart": ["Chart daily revenue trend", "Change revenue window", "moderate"],
  "recent-uploads": ["Audit recent upload performance", "Open a recent upload", "moderate"],
  "top-performer": ["Highlight best performing video", "Inspect the top performer", "light"],
  "alerts-ticker": ["Broadcast latest channel alerts", "Open an alert", "light"],
  "burnout-monitor": ["Warn about publishing overload", "Adjust workload target", "light"],
  "ui-reference-library": ["Browse widget UI reference patterns", "Open a reference component", "light"],
  "alerts-feed": ["List actionable channel alerts", "Resolve an alert", "light"],
  "bridge-efficiency": ["Measure cross-video bridge conversion", "Inspect a bridge path", "moderate"],
  "collab-matchmaker": ["Surface collaboration matches", "Send a collab intro", "moderate"],
  "mini-calendar": ["Preview upcoming publish schedule", "Open a schedule day", "light"],
  "reach-funnel": ["Visualize impressions-to-views funnel", "Inspect a funnel stage", "moderate"],
  "task-stack": ["Stack of pending creator tasks", "Complete a task", "light"],
  "video-autopsy": ["Post-mortem underperforming videos", "Open a video autopsy", "moderate"],
  "account-billing": ["Manage account, YouTube connection, plan, AI credits", "Sign in, disconnect channel, or manage plan", "light"],
  "daily-command-center": ["Prioritize today's action queue with focus timer", "Toggle a task or start focus block", "moderate"],
  "opportunity-desk": ["Rank topic candidates with evidence and confidence", "Save the winning opportunity or compare two", "moderate"],
  "idea-portfolio": ["Score and commit concepts to the idea portfolio", "Commit a concept or generate stronger angles", "light"],
  "community-post-studio": ["Draft, generate, and schedule community posts", "Generate variants or publish via clipboard bridge", "heavy"],
  "brain-control-center": ["Visualize Brain, signals, memory fields, and data sources", "Run a reflection cycle or export state", "moderate"],
  "shorts-generator": ["Plan, generate, and arrange Short clips end-to-end", "Generate a clip or send timeline to editor", "heavy"],
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
