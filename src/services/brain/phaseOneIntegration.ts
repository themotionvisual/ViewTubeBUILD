import { SUPER_TOOLS } from "../superToolRegistry"

export type BrainEvidenceRole = "primary" | "baseline" | "context" | "contradiction"

export interface BrainEvidenceItem {
 id: string
 label: string
 role: BrainEvidenceRole
 source: "vt-sync" | "project" | "youtube" | "vault" | "brain" | "tool"
 detail?: string
 route?: string
 freshness?: string
}

export interface BrainEvidenceExplanation {
 claim: string
 confidence: number
 inference: boolean
 evidence: BrainEvidenceItem[]
 missingEvidence: string[]
 caveats: string[]
}

export interface BrainSurfaceContext {
 route: string
 projectId?: string | null
 videoId?: string | null
 commentId?: string | null
 dateRange?: string | null
}

export interface BrainCapabilityBinding {
 id: string
 routes: string[]
 sourceOfTruth: string
 reads: string[]
 writes: string[]
 externalSideEffect: boolean
 status: "wired" | "integration-ready" | "planned"
}

/**
 * Phase-One map to the ACTUAL production ViewTube systems on the integration
 * branch. Brain points at existing canonical services rather than duplicating
 * analytics/projects/studio/vault state.
 */
export const PHASE_ONE_BRAIN_BINDINGS: BrainCapabilityBinding[] = [
 {
  id: "analytics",
  routes: ["/analytics", "/local-analytics", "/performance", "/graphs"],
  sourceOfTruth: "src/services/analytics/{DataStore,MetricRegistry,Selectors,SyncPipeline}.ts + VT-SYNC local analytics",
  reads: ["canonical metrics", "time series", "traffic", "retention", "metric provenance"],
  writes: [],
  externalSideEffect: false,
  status: "integration-ready",
 },
 {
  id: "projects",
  routes: ["/projects", "/project-calendar"],
  sourceOfTruth: "BrainContext projects + ProjectStudio / ProjectCalendarPage",
  reads: ["project", "tasks", "storyboard", "publish date", "channel goals"],
  writes: ["project", "task", "storyboard", "decision"],
  externalSideEffect: false,
  status: "wired",
 },
 {
  id: "comment-responder",
  routes: ["/studio"],
  sourceOfTruth: "features/creator-engagement/useCommentResponderController + youtubeService",
  reads: ["comment thread", "source video metadata", "creator video catalog", "Brain profile"],
  writes: ["reply draft", "manual comment reply"],
  externalSideEffect: true,
  status: "wired",
 },
 {
  id: "studio-hub",
  routes: ["/studio", "/thumbnail-studio", "/storyboard-studio"],
  sourceOfTruth: "StudioHub + superToolRegistry + liveCanvasRegistry",
  reads: ["active tool", "project context", "Brain profile", "tool inputs"],
  writes: ["generation artifact", "handoff packet", "project output"],
  externalSideEffect: false,
  status: "integration-ready",
 },
 {
  id: "vault",
  routes: ["/vault", "/reference-studio/toolbox-system"],
  sourceOfTruth: "services/vaultAdapter.ts + nexusSyncService",
  reads: ["local assets", "generated assets", "Drive-linked assets"],
  writes: ["vault asset", "generation artifact", "Drive vault link"],
  externalSideEffect: false,
  status: "wired",
 },
 {
  id: "publisher",
  routes: ["/video-publisher"],
  sourceOfTruth: "views/VideoPublisher.tsx + sheetsService + nexusSyncService",
  reads: ["Brain project/channel context", "video concept", "script", "SEO metadata result"],
  writes: ["SEO metadata draft", "Google Sheets export", "Drive/Vault SEO sync", "local ZIP export"],
  externalSideEffect: true,
  status: "wired",
 },
 {
  id: "editor",
  routes: ["/editor"],
  sourceOfTruth: "EditorV1Page / VT_E1 runtime",
  reads: ["timeline", "selected clip", "project", "vault assets"],
  writes: ["timeline insertion", "scene plan", "caption/asset handoff"],
  externalSideEffect: false,
  status: "planned",
 },
]

export const getBrainBindingForRoute = (route: string) =>
 PHASE_ONE_BRAIN_BINDINGS.filter((binding) =>
  binding.routes.some((candidate) => route === candidate || route.startsWith(`${candidate}/`)),
 )

export const explainBrainEvidence = (
 claim: string,
 evidence: BrainEvidenceItem[],
 options: Partial<Pick<BrainEvidenceExplanation, "confidence" | "inference" | "missingEvidence" | "caveats">> = {},
): BrainEvidenceExplanation => ({
 claim,
 confidence: Math.max(0, Math.min(1, options.confidence ?? 0.5)),
 inference: options.inference ?? true,
 evidence,
 missingEvidence: options.missingEvidence ?? [],
 caveats: options.caveats ?? [],
})

export const getPhaseOneSuperToolBindings = () =>
 SUPER_TOOLS.map((tool) => ({
  id: tool.id,
  title: tool.title,
  routes: tool.routes,
  brainHook: tool.brainHook,
  sourceOfTruth: tool.sourceOfTruth,
  status: tool.status,
  visibility: tool.visibility,
 }))
