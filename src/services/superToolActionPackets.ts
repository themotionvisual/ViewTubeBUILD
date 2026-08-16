import type {
 BrainCommandAction,
 GenerationArtifact,
 SuperToolActionPacket,
 SuperToolId,
 SuperToolSurface,
 WorkflowChain,
} from "../types"
import { createGenerationRecord, updateGenerationRecord } from "./generationStore"
import { getSuperTool } from "./superToolRegistry"
import { MOUNTED_INTERNAL_TOOL_IDS } from "./superToolRuntimePlanRegistry"
import { ingestGenerationArtifacts } from "./vaultAdapter"
import { createWorkflowChain, createWorkflowStep } from "./workflowEngine"

const BRAIN_COMMAND_ACTIONS_STORAGE_KEY = "vt_brain_command_actions_v1"

const canUseStorage = () => typeof window !== "undefined" && typeof localStorage !== "undefined"

const readJson = <T,>(key: string, fallback: T): T => {
 if (!canUseStorage()) return fallback
 try {
  const raw = localStorage.getItem(key)
  return raw ? (JSON.parse(raw) as T) : fallback
 } catch {
  return fallback
 }
}

const writeJson = <T,>(key: string, value: T) => {
 if (!canUseStorage()) return
 localStorage.setItem(key, JSON.stringify(value))
}

export type BrainCommandFilter = "all" | "assistant" | "manual"

const isKnownToolId = (toolId: unknown): toolId is SuperToolId =>
 typeof toolId === "string" && Boolean(getSuperTool(toolId as SuperToolId))

export const resolveBrainCommandRoute = (
 targetToolId: SuperToolId,
 commandActionId?: string | null,
): string => {
 const tool = getSuperTool(targetToolId)
 const baseRoute =
  MOUNTED_INTERNAL_TOOL_IDS.has(targetToolId) ?
   `/data-transparency?internalTool=${targetToolId}`
  : tool?.routes[0] || `/data-transparency?internalTool=${targetToolId}`
 if (!commandActionId) return baseRoute
 const separator = baseRoute.includes("?") ? "&" : "?"
 return `${baseRoute}${separator}commandActionId=${encodeURIComponent(commandActionId)}`
}

export const normalizeBrainCommandAction = (
 raw: Partial<BrainCommandAction> & Record<string, unknown>,
): BrainCommandAction | null => {
 if (!raw || typeof raw !== "object") return null
 if (!raw.id || !isKnownToolId(raw.targetToolId)) return null
 const id = String(raw.id)
 const source = raw.source === "assistant" ? "assistant" : "manual"
 return {
  id,
  priority:
   raw.priority === "low" || raw.priority === "medium" || raw.priority === "high" || raw.priority === "urgent" ?
    raw.priority
   : "medium",
  confidence:
   raw.confidence === "high" || raw.confidence === "medium" || raw.confidence === "low" ?
    raw.confidence
   : "medium",
  sourceEvidence: Array.isArray(raw.sourceEvidence) ? raw.sourceEvidence.map(String) : [],
  targetToolId: raw.targetToolId,
  note: typeof raw.note === "string" ? raw.note : "",
  status:
   raw.status === "dispatched" || raw.status === "resolved" || raw.status === "queued" ?
    raw.status
   : "queued",
  createdAt: typeof raw.createdAt === "number" ? raw.createdAt : Date.now(),
  source,
  generationId: typeof raw.generationId === "string" ? raw.generationId : null,
  workflowId: typeof raw.workflowId === "string" ? raw.workflowId : null,
  assistantRequest: typeof raw.assistantRequest === "string" ? raw.assistantRequest : null,
  assistantResponse: typeof raw.assistantResponse === "string" ? raw.assistantResponse : null,
  targetRoute:
   typeof raw.targetRoute === "string" ?
    raw.targetRoute
   : resolveBrainCommandRoute(raw.targetToolId, id),
 }
}

export const filterBrainCommandActions = (
 actions: BrainCommandAction[],
 filter: BrainCommandFilter,
): BrainCommandAction[] => {
 if (filter === "all") return actions
 return actions.filter((action) => (action.source || "manual") === filter)
}

export const listBrainCommandActions = (): BrainCommandAction[] =>
 readJson<Array<Partial<BrainCommandAction> & Record<string, unknown>>>(
  BRAIN_COMMAND_ACTIONS_STORAGE_KEY,
  [],
 )
  .map((action) => normalizeBrainCommandAction(action))
  .filter((action): action is BrainCommandAction => Boolean(action))
  .sort((a, b) => b.createdAt - a.createdAt)

export const createBrainCommandAction = (
 input: Omit<BrainCommandAction, "id" | "createdAt" | "status"> & {
  status?: BrainCommandAction["status"]
  id?: string
  createdAt?: number
 },
): BrainCommandAction => {
 const id = input.id || crypto.randomUUID()
 const action: BrainCommandAction = {
  ...input,
  id,
  status: input.status || "queued",
  createdAt: input.createdAt || Date.now(),
  source: input.source || "manual",
  generationId: input.generationId || null,
  workflowId: input.workflowId || null,
  assistantRequest: input.assistantRequest || null,
  assistantResponse: input.assistantResponse || null,
  targetRoute: input.targetRoute || resolveBrainCommandRoute(input.targetToolId, id),
 }
 writeJson(BRAIN_COMMAND_ACTIONS_STORAGE_KEY, [action, ...listBrainCommandActions()])
 return action
}

export const updateBrainCommandAction = (
 id: string,
 updates: Partial<BrainCommandAction>,
): BrainCommandAction | null => {
 let updatedAction: BrainCommandAction | null = null
 const next = listBrainCommandActions().map((action) => {
  if (action.id !== id) return action
  const normalized = normalizeBrainCommandAction({
   ...action,
   ...updates,
   targetRoute:
    updates.targetRoute ||
    action.targetRoute ||
    resolveBrainCommandRoute(updates.targetToolId || action.targetToolId, action.id),
  })
  updatedAction = normalized
  return normalized || action
 })
 writeJson(BRAIN_COMMAND_ACTIONS_STORAGE_KEY, next)
 return updatedAction
}

export const getBrainCommandAction = (id?: string | null): BrainCommandAction | null => {
 if (!id) return null
 return listBrainCommandActions().find((action) => action.id === id) || null
}

export const createSuperToolActionPacket = (input: {
 toolId: SuperToolId
 moduleId: string
 title: string
 summary: string
 inputs: Record<string, unknown>
 outputs: Record<string, unknown>
 confidence: SuperToolActionPacket["confidence"]
 evidence: string[]
 missingInputs: string[]
 handoffTargets: string[]
 workflowTitle: string
 workflowGoal: string
 workflowSteps: Array<{
  title: string
  surface: SuperToolSurface
  toolId: SuperToolId
  details: string
 }>
 tags?: string[]
}): {
 packet: SuperToolActionPacket
 recordId: string
 artifactId: string
 chain: WorkflowChain
} => {
 const packet: SuperToolActionPacket = {
  id: crypto.randomUUID(),
  toolId: input.toolId,
  moduleId: input.moduleId,
  title: input.title,
  summary: input.summary,
  inputs: input.inputs,
  outputs: input.outputs,
  confidence: input.confidence,
  evidence: input.evidence,
  missingInputs: input.missingInputs,
  handoffTargets: input.handoffTargets,
  createdAt: Date.now(),
 }
 const selfImprovement = {
  inputsUsed: Object.keys(input.inputs).filter((key) => {
   const value = input.inputs[key]
   return value !== null && value !== undefined && value !== ""
  }),
  inferred: input.summary,
  missing: input.missingInputs,
  handedOffTo: input.handoffTargets,
  improveNext: [
   `Review ${input.moduleId} confidence after handoff`,
   "Compare output against later workflow outcomes",
  ],
 }
 const outputJson = {
  ...packet,
  metadata: {
   selfImprovement,
  },
 }
 const record = createGenerationRecord({
  toolId: input.toolId,
  provider: "mock",
  model: "viewtube-supertool-action-v1",
  prompt: JSON.stringify({
   moduleId: input.moduleId,
   title: input.title,
   inputs: input.inputs,
  }),
  status: "running",
  artifacts: [],
  metadata: {
   actionPacketId: packet.id,
   moduleId: input.moduleId,
   selfImprovement,
  },
 })
 const artifact: GenerationArtifact = {
  id: crypto.randomUUID(),
  kind: "json",
  label: `${input.title} action packet`,
  sourceRecordId: record.id,
  metadata: outputJson,
 }
 updateGenerationRecord(record.id, {
  status: "complete",
  outputText: input.summary,
  outputJson,
  artifacts: [artifact],
  usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
  estimatedCostCents: 0,
 })
 ingestGenerationArtifacts([artifact], {
  toolId: input.toolId,
  generationId: record.id,
  tags: [input.toolId, input.moduleId, "super-tool-action", ...(input.tags || [])],
 })
 const chain = createWorkflowChain({
  title: input.workflowTitle,
  goal: input.workflowGoal,
  primaryToolId: input.toolId,
  steps: input.workflowSteps.map((step) =>
   createWorkflowStep(step.title, step.surface, step.toolId, step.details),
  ),
  provenance: [
   `${input.toolId}.${input.moduleId}.${packet.id}`,
   ...input.evidence,
   ...input.handoffTargets,
  ],
 })
 return {
  packet,
  recordId: record.id,
  artifactId: artifact.id,
  chain,
 }
}
