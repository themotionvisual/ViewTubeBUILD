import type { BrainConfidenceLevel, SuperToolId } from "../../types"
import type { ChannelIntelligenceSnapshot } from "./ChannelIntelligence"

export type PrimingPhase =
 | "PRE_LAUNCH"
 | "LAUNCH"
 | "EARLY_POST_LAUNCH"
 | "SUSTAIN"
 | "LEARN"

export type PrimingObjective =
 | "WARM_CORE_AUDIENCE"
 | "CREATE_EXPECTATION"
 | "BUILD_SESSION_PATH"
 | "TEST_HOOK"
 | "PREPARE_PACKAGING"
 | "AMPLIFY_LAUNCH"
 | "REINFORCE_DISCOVERY"
 | "CREATE_DERIVATIVES"
 | "CAPTURE_LEARNING"

export interface PrimingVideoContext {
 channelId: string
 projectId?: string | null
 videoId?: string | null
 title?: string | null
 topic?: string | null
 format?: string | null
 plannedPublishAt?: string | null
 targetAudience?: string[]
 supportingVideoIds?: string[]
 evidenceIds?: string[]
}

export interface PrimingStep {
 id: string
 phase: PrimingPhase
 objective: PrimingObjective
 title: string
 description: string
 relativeTiming: string
 targetToolId: SuperToolId | null
 requiresApproval: boolean
 evidenceIds: string[]
 dependsOn: string[]
 outputKind:
  | "analysis"
  | "community_post"
  | "short"
  | "package"
  | "session_route"
  | "launch_check"
  | "derivative_plan"
  | "learning_record"
 payload: Record<string, unknown>
}

export interface AlgorithmPrimingPlan {
 id: string
 channelId: string
 projectId?: string | null
 videoId?: string | null
 generatedAt: string
 launchAt?: string | null
 confidence: BrainConfidenceLevel
 objectiveSummary: string
 steps: PrimingStep[]
 guardrails: string[]
 evidenceIds: string[]
}

const confidenceFor = (intelligence?: ChannelIntelligenceSnapshot | null): BrainConfidenceLevel => {
 if (!intelligence) return "low"
 if (intelligence.analyticsAvailable && intelligence.patterns.length >= 3) return "high"
 if (intelligence.analyticsAvailable || intelligence.patterns.length >= 1) return "medium"
 return "low"
}

const step = (input: Omit<PrimingStep, "evidenceIds" | "dependsOn"> & {
 evidenceIds?: string[]
 dependsOn?: string[]
}): PrimingStep => ({ ...input, evidenceIds: input.evidenceIds || [], dependsOn: input.dependsOn || [] })

export const buildAlgorithmPrimingPlan = (input: {
 video: PrimingVideoContext
 intelligence?: ChannelIntelligenceSnapshot | null
}): AlgorithmPrimingPlan => {
 const { video, intelligence } = input
 const evidenceIds = [...new Set([
  ...(video.evidenceIds || []),
  ...(intelligence?.patterns.flatMap((pattern) => pattern.evidenceIds) || []),
 ])]
 const subject = video.title || video.topic || "upcoming video"
 const steps: PrimingStep[] = [
  step({ id:"priming:qualify", phase:"PRE_LAUNCH", objective:"CREATE_EXPECTATION", title:"Qualify the launch candidate", description:`Confirm that ${subject} fits the current channel/audience strategy before spending launch energy.`, relativeTiming:"T-7d to T-3d", targetToolId:"cinematic-analytics-lab", requiresApproval:false, outputKind:"analysis", payload:{videoId:video.videoId||null,topic:video.topic||null} }),
  step({ id:"priming:core-audience", phase:"PRE_LAUNCH", objective:"WARM_CORE_AUDIENCE", title:"Warm the likely seed audience", description:"Prepare one audience-aligned Community interaction that creates curiosity without exhausting the launch premise.", relativeTiming:"T-72h to T-36h", targetToolId:"audience-loop-studio", requiresApproval:true, outputKind:"community_post", dependsOn:["priming:qualify"], payload:{targetAudience:video.targetAudience||[],videoId:video.videoId||null} }),
  step({ id:"priming:hook-test", phase:"PRE_LAUNCH", objective:"TEST_HOOK", title:"Test a short-form hook bridge", description:"Prepare a Short/open-loop concept that tests audience interest while routing attention toward the upcoming or related long-form video.", relativeTiming:"T-48h to T-18h", targetToolId:"creator-canvas-os", requiresApproval:true, outputKind:"short", dependsOn:["priming:qualify"], payload:{title:video.title||null,topic:video.topic||null,videoId:video.videoId||null} }),
  step({ id:"priming:package", phase:"PRE_LAUNCH", objective:"PREPARE_PACKAGING", title:"Lock a testable launch package", description:"Prepare the title/thumbnail promise and preserve alternate variants without creating unnecessary last-minute churn.", relativeTiming:"T-24h to T-2h", targetToolId:"packaging-lab-pro", requiresApproval:true, outputKind:"package", dependsOn:["priming:qualify"], payload:{title:video.title||null,format:video.format||null} }),
  step({ id:"priming:session-path", phase:"PRE_LAUNCH", objective:"BUILD_SESSION_PATH", title:"Prepare the session path", description:"Identify the strongest supporting catalog videos and next-video routes so launch traffic has somewhere relevant to continue.", relativeTiming:"T-24h to T0", targetToolId:"packaging-lab-pro", requiresApproval:true, outputKind:"session_route", dependsOn:["priming:qualify"], payload:{supportingVideoIds:video.supportingVideoIds||[],videoId:video.videoId||null} }),
  step({ id:"priming:launch", phase:"LAUNCH", objective:"AMPLIFY_LAUNCH", title:"Coordinate launch actions", description:"Publish only approved launch-support assets and begin measurement checkpoints without changing strategy before evidence arrives.", relativeTiming:"T0 to T+6h", targetToolId:"audience-loop-studio", requiresApproval:true, outputKind:"launch_check", dependsOn:["priming:core-audience","priming:package","priming:session-path"], payload:{plannedPublishAt:video.plannedPublishAt||null,videoId:video.videoId||null} }),
  step({ id:"priming:early-post", phase:"EARLY_POST_LAUNCH", objective:"REINFORCE_DISCOVERY", title:"Use early evidence without overreacting", description:"Inspect launch quality, traffic source mix, retention and audience expansion before deciding whether to hold, amplify, repackage or retarget.", relativeTiming:"T+6h to T+48h", targetToolId:"cinematic-analytics-lab", requiresApproval:false, outputKind:"analysis", dependsOn:["priming:launch"], payload:{videoId:video.videoId||null} }),
  step({ id:"priming:derivatives", phase:"SUSTAIN", objective:"CREATE_DERIVATIVES", title:"Create evidence-led derivatives", description:"Use validated high-retention moments, search demand or audience response to prepare Shorts, posts or follow-up concepts.", relativeTiming:"T+2d to T+14d", targetToolId:"creator-canvas-os", requiresApproval:true, outputKind:"derivative_plan", dependsOn:["priming:early-post"], payload:{videoId:video.videoId||null} }),
  step({ id:"priming:learn", phase:"LEARN", objective:"CAPTURE_LEARNING", title:"Evaluate the launch system", description:"Compare planned actions, creator choices and measured outcomes so future priming plans become channel-specific rather than generic.", relativeTiming:"T+7d onward", targetToolId:null, requiresApproval:false, outputKind:"learning_record", dependsOn:["priming:early-post"], payload:{projectId:video.projectId||null,videoId:video.videoId||null} }),
 ]
 return {
  id:`priming:${video.projectId||video.videoId||video.channelId}`,
  channelId:video.channelId,
  projectId:video.projectId,
  videoId:video.videoId,
  generatedAt:new Date().toISOString(),
  launchAt:video.plannedPublishAt,
  confidence:confidenceFor(intelligence),
  objectiveSummary:`Prime ${subject} before launch, protect early evidence collection, then sustain only the signals that prove useful.`,
  steps:steps.map((candidate)=>({...candidate,evidenceIds:[...new Set([...candidate.evidenceIds,...evidenceIds])]})),
  guardrails:["Priming is proactive planning; it is not anomaly detection.","Do not create artificial engagement or misleading audience manipulation.","Do not treat a pre-launch action as successful until post-launch evidence supports it.","Any external publishing/write step remains creator-approval controlled."],
  evidenceIds,
 }
}

export const getPrimingPhaseSteps = (plan: AlgorithmPrimingPlan, phase: PrimingPhase) =>
 plan.steps.filter((candidate) => candidate.phase === phase)
