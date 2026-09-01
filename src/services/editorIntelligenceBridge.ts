export const EDITOR_INTELLIGENCE_CONTEXT_SCHEMA = "VT_E1.EditorIntelligenceContext.v1" as const
export const EDITOR_INTELLIGENCE_PROPOSAL_SCHEMA = "VT_E1.EditorIntelligenceProposal.v1" as const

export type EditorProposalKind =
 | "creative-brief"
 | "script"
 | "hook"
 | "caption-plan"
 | "broll-plan"
 | "template-match"
 | "shorts-framing"
 | "svg-motion-scene"

export type EditorProposalStatus = "draft" | "reviewed" | "applied" | "rejected"

export interface EditorIntelligenceEvidence {
 id: string
 label: string
 source: "project" | "creator" | "channel" | "analytics" | "calendar" | "asset"
 freshness: "live" | "saved" | "unknown"
}

export interface EditorIntelligenceContextPack {
 schemaVersion: typeof EDITOR_INTELLIGENCE_CONTEXT_SCHEMA
 id: string
 createdAt: string
 project: {
 name: string
 aspectRatio: "16:9" | "9:16" | "unknown"
 durationSec: number
 fps: number
 visualDNA: string | null
 clipCount: number
 layerCount: number
 selectedClipId: string | null
 selectedLayerId: string | null
 playheadSec: number
 }
 creatorBrief: string
 evidence: EditorIntelligenceEvidence[]
 missingInputs: string[]
}

export interface EditorIntelligenceProposal {
 schemaVersion: typeof EDITOR_INTELLIGENCE_PROPOSAL_SCHEMA
 id: string
 createdAt: string
 kind: EditorProposalKind
 status: EditorProposalStatus
 contextPackId: string
 requestedOutcome: string
 evidenceIds: string[]
 missingInputs: string[]
 reviewRequired: true
 timelinePatch: null
}

type ProjectLike = {
 meta?: Record<string, unknown>
 clips?: Array<{ id?: string }>
 layers?: Array<{ id?: string }>
}

const safeNumber = (value: unknown, fallback = 0): number => {
 const number = Number(value)
 return Number.isFinite(number) ? number : fallback
}

const normalizedText = (value: unknown): string => String(value || "").trim()

const stableId = (prefix: string, parts: Array<string | number>): string => {
 const text = parts.join("|")
 let hash = 5381
 for (let index = 0; index < text.length; index += 1) hash = ((hash * 33) ^ text.charCodeAt(index)) >>> 0
 return `${prefix}_${hash.toString(36)}`
}

export const buildEditorIntelligenceContextPack = (input: {
 project: ProjectLike
 creatorBrief?: string
 selectedClipId?: string | null
 selectedLayerId?: string | null
 playheadSec?: number
 evidence?: EditorIntelligenceEvidence[]
 now?: Date
}): EditorIntelligenceContextPack => {
 const meta = input.project.meta || {}
 const createdAt = (input.now || new Date()).toISOString()
 const projectName = normalizedText(meta.projectName) || "Untitled project"
 const aspectRatio = meta.aspectRatio === "16:9" || meta.aspectRatio === "9:16"
  ? meta.aspectRatio
  : "unknown"
 const durationSec = Math.max(0, safeNumber(meta.durationSec))
 const fps = Math.max(0, safeNumber(meta.fps))
 const visualDNA = normalizedText(meta.visualDNA) || null
 const creatorBrief = normalizedText(input.creatorBrief)
 const evidence = [
  {
   id: stableId("project", [projectName, durationSec, aspectRatio]),
   label: `${projectName} project state`,
   source: "project" as const,
   freshness: "live" as const,
  },
  ...(input.evidence || []),
 ]
 const missingInputs = [
  creatorBrief ? "" : "Creator brief or intended viewer outcome is missing.",
  visualDNA ? "" : "Project visual DNA has not been selected.",
  input.evidence?.some((item) => item.source === "channel") ? "" : "Channel profile evidence is not connected to this editor session.",
  input.evidence?.some((item) => item.source === "analytics") ? "" : "Analytics evidence is not connected to this editor session.",
 ].filter(Boolean)

 return {
  schemaVersion: EDITOR_INTELLIGENCE_CONTEXT_SCHEMA,
  id: stableId("editor_context", [projectName, createdAt, input.selectedClipId || "", input.selectedLayerId || ""]),
  createdAt,
  project: {
   name: projectName,
   aspectRatio,
   durationSec,
   fps,
   visualDNA,
   clipCount: Array.isArray(input.project.clips) ? input.project.clips.length : 0,
   layerCount: Array.isArray(input.project.layers) ? input.project.layers.length : 0,
   selectedClipId: input.selectedClipId || null,
   selectedLayerId: input.selectedLayerId || null,
   playheadSec: Math.max(0, safeNumber(input.playheadSec)),
  },
  creatorBrief,
  evidence,
  missingInputs,
 }
}

export const createEditorIntelligenceProposal = (input: {
 contextPack: EditorIntelligenceContextPack
 kind: EditorProposalKind
 requestedOutcome: string
 now?: Date
}): EditorIntelligenceProposal => {
 const createdAt = (input.now || new Date()).toISOString()
 const requestedOutcome = normalizedText(input.requestedOutcome) || "Create a reviewable editor draft."
 return {
  schemaVersion: EDITOR_INTELLIGENCE_PROPOSAL_SCHEMA,
  id: stableId("editor_proposal", [input.contextPack.id, input.kind, requestedOutcome, createdAt]),
  createdAt,
  kind: input.kind,
  status: "draft",
  contextPackId: input.contextPack.id,
  requestedOutcome,
  evidenceIds: input.contextPack.evidence.map((item) => item.id),
  missingInputs: input.contextPack.missingInputs,
  reviewRequired: true,
  // AI output is intentionally not a timeline mutation. A future adapter may only
  // populate a validated patch after the creator explicitly reviews it.
  timelinePatch: null,
 }
}

export const reviewEditorIntelligenceProposal = (
 proposal: EditorIntelligenceProposal,
 status: Exclude<EditorProposalStatus, "draft">,
): EditorIntelligenceProposal => ({ ...proposal, status })
