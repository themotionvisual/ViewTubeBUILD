import type { BrainCommandAction, GenerationArtifact, SuperToolActionPacket, SuperToolId, SuperToolSurface, WorkflowChain } from "../types"
import { createGenerationRecord, updateGenerationRecord } from "./generationStore"
import { getSuperTool } from "./superToolRegistry"
import { MOUNTED_INTERNAL_TOOL_IDS } from "./superToolRuntimePlanRegistry"
import { ingestGenerationArtifacts } from "./vaultAdapter"
import { createWorkflowChain, createWorkflowStep } from "./workflowEngine"
import { createViewTubeActionPacket, persistViewTubeActionPacket, type ViewTubePayloadKind, type ViewTubeToolKind } from "./viewTubeToolChains"
import { attachAssetToContentBuild, ensureContentBuild } from "./asset-engine/ContentBuildRepository"
import { recordContentBuildToolInput, recordContentBuildToolOutput } from "./asset-engine/ToolContext"

const BRAIN_COMMAND_ACTIONS_STORAGE_KEY="vt_brain_command_actions_v1"
const canUseStorage=()=>typeof window!=="undefined"&&typeof localStorage!=="undefined"
const readJson=<T,>(key:string,fallback:T):T=>{if(!canUseStorage())return fallback;try{const raw=localStorage.getItem(key);return raw?(JSON.parse(raw) as T):fallback}catch{return fallback}}
const writeJson=<T,>(key:string,value:T)=>{if(canUseStorage())localStorage.setItem(key,JSON.stringify(value))}
export type BrainCommandFilter="all"|"assistant"|"manual"
const isKnownToolId=(toolId:unknown):toolId is SuperToolId=>typeof toolId==="string"&&Boolean(getSuperTool(toolId as SuperToolId))
export const resolveBrainCommandRoute=(targetToolId:SuperToolId,commandActionId?:string|null):string=>{const tool=getSuperTool(targetToolId);const baseRoute=MOUNTED_INTERNAL_TOOL_IDS.has(targetToolId)?`/tools/${targetToolId}`:tool?.routes[0]||`/tools/${targetToolId}`;if(!commandActionId)return baseRoute;return `${baseRoute}${baseRoute.includes("?")?"&":"?"}commandActionId=${encodeURIComponent(commandActionId)}`}
export const normalizeBrainCommandAction=(raw:Partial<BrainCommandAction>&Record<string,unknown>):BrainCommandAction|null=>{if(!raw||typeof raw!=="object"||!raw.id||!isKnownToolId(raw.targetToolId))return null;const id=String(raw.id);return{id,priority:raw.priority==="low"||raw.priority==="medium"||raw.priority==="high"||raw.priority==="urgent"?raw.priority:"medium",confidence:raw.confidence==="high"||raw.confidence==="medium"||raw.confidence==="low"?raw.confidence:"medium",sourceEvidence:Array.isArray(raw.sourceEvidence)?raw.sourceEvidence.map(String):[],targetToolId:raw.targetToolId,note:typeof raw.note==="string"?raw.note:"",status:raw.status==="dispatched"||raw.status==="resolved"||raw.status==="queued"?raw.status:"queued",createdAt:typeof raw.createdAt==="number"?raw.createdAt:Date.now(),source:raw.source==="assistant"?"assistant":"manual",generationId:typeof raw.generationId==="string"?raw.generationId:null,workflowId:typeof raw.workflowId==="string"?raw.workflowId:null,assistantRequest:typeof raw.assistantRequest==="string"?raw.assistantRequest:null,assistantResponse:typeof raw.assistantResponse==="string"?raw.assistantResponse:null,targetRoute:typeof raw.targetRoute==="string"?raw.targetRoute:resolveBrainCommandRoute(raw.targetToolId,id)}}
export const filterBrainCommandActions=(actions:BrainCommandAction[],filter:BrainCommandFilter)=>filter==="all"?actions:actions.filter(action=>(action.source||"manual")===filter)
export const listBrainCommandActions=():BrainCommandAction[]=>readJson<Array<Partial<BrainCommandAction>&Record<string,unknown>>>(BRAIN_COMMAND_ACTIONS_STORAGE_KEY,[]).map(normalizeBrainCommandAction).filter((action):action is BrainCommandAction=>Boolean(action)).sort((a,b)=>b.createdAt-a.createdAt)
export const createBrainCommandAction=(input:Omit<BrainCommandAction,"id"|"createdAt"|"status"|"source"|"generationId"|"workflowId"|"assistantRequest"|"assistantResponse"|"targetRoute">&{status?:BrainCommandAction["status"];id?:string;createdAt?:number;source?:BrainCommandAction["source"];generationId?:string|null;workflowId?:string|null;assistantRequest?:string|null;assistantResponse?:string|null;targetRoute?:string}):BrainCommandAction=>{const id=input.id||crypto.randomUUID();const action:BrainCommandAction={...input,id,status:input.status||"queued",createdAt:input.createdAt||Date.now(),source:input.source||"manual",generationId:input.generationId||null,workflowId:input.workflowId||null,assistantRequest:input.assistantRequest||null,assistantResponse:input.assistantResponse||null,targetRoute:input.targetRoute||resolveBrainCommandRoute(input.targetToolId,id)};writeJson(BRAIN_COMMAND_ACTIONS_STORAGE_KEY,[action,...listBrainCommandActions()]);return action}
export const updateBrainCommandAction=(id:string,updates:Partial<BrainCommandAction>):BrainCommandAction|null=>{let updatedAction:BrainCommandAction|null=null;const next=listBrainCommandActions().map(action=>{if(action.id!==id)return action;const normalized=normalizeBrainCommandAction({...action,...updates,targetRoute:updates.targetRoute||action.targetRoute||resolveBrainCommandRoute(updates.targetToolId||action.targetToolId,action.id)});updatedAction=normalized;return normalized||action});writeJson(BRAIN_COMMAND_ACTIONS_STORAGE_KEY,next);return updatedAction}
export const getBrainCommandAction=(id?:string|null):BrainCommandAction|null=>!id?null:listBrainCommandActions().find(action=>action.id===id)||null

const destinationAliases:Record<string,string>={
 "projects:project-command-kanban":"project-calendar","projects:project-calendar":"project-calendar","studio:packaging-lab-pro":"thumbnail-studio","editor:motion-scene-builder":"video-editor","editor:video-editor":"video-editor","vault:creator-vault-os":"vault","vault:vault":"vault","brain:brain-command-center":"ai-brain","brain:ai-brain":"ai-brain","studio:video-publisher":"video-publisher","studio:community-posts":"community-posts","project:storyboard-studio":"storyboard-studio","projects:storyboard-studio":"storyboard-studio",
}
const inferPayloadKind=(moduleId:string,outputs:Record<string,unknown>):ViewTubePayloadKind=>{const text=`${moduleId} ${Object.keys(outputs).join(" ")}`.toLowerCase();if(text.includes("storyboard")||text.includes("scene"))return "storyboard";if(text.includes("script")||text.includes("hook"))return "script";if(text.includes("calendar")||text.includes("schedule"))return "calendar-item";if(text.includes("project")||text.includes("milestone"))return "project";if(text.includes("thumbnail"))return "thumbnail";if(text.includes("image"))return "image";if(text.includes("metadata")||text.includes("title"))return "metadata";if(text.includes("analysis"))return "analysis";return "json"}
const inferSourceKind=(toolId:string):ViewTubeToolKind=>toolId.includes("project")?"project":toolId.includes("vault")?"vault":toolId.includes("brain")?"brain":toolId.includes("scene")||toolId.includes("editor")?"editor":"super-tool"

export interface CreateSuperToolActionPacketInput {
 toolId: SuperToolId
 moduleId: string
 title: string
 summary: string
 contentBuildId?: string | null
 projectId?: string | null
 projectName?: string | null
 channelId?: string | null
 videoId?: string | null
 traceId?: string | null
 outputRef?: string | null
 inputs: Record<string, unknown>
 outputs: Record<string, unknown>
 confidence: SuperToolActionPacket["confidence"]
 evidence: string[]
 missingInputs: string[]
 handoffTargets: string[]
 workflowTitle: string
 workflowGoal: string
 workflowSteps: Array<{ title: string; surface: SuperToolSurface; toolId: SuperToolId; details: string }>
 tags?: string[]
}

const stringScope = (value: unknown) => typeof value === "string" && value.trim() ? value.trim() : null

const resolveSuperToolContentBuild = (input: CreateSuperToolActionPacketInput) => {
 const contentBuildId = input.contentBuildId || stringScope(input.inputs.contentBuildId)
 const projectId = input.projectId || stringScope(input.inputs.projectId)
 const projectName = input.projectName || stringScope(input.inputs.projectName) || stringScope(input.inputs.project)
 const channelId = input.channelId || stringScope(input.inputs.channelId)
 const videoId = input.videoId || stringScope(input.inputs.videoId)

 const build = ensureContentBuild({
  id: contentBuildId || undefined,
  channelId,
  legacyProjectId: projectId,
  legacyProjectName: projectName,
  videoId,
  profile: projectName ? { workingConcept: projectName } : undefined,
  toolId: input.toolId,
 })

 return { build, contentBuildId: build?.id || null, projectId, projectName, channelId, videoId }
}

export const createSuperToolActionPacket = (
 input: CreateSuperToolActionPacketInput,
): { packet: SuperToolActionPacket; recordId: string; artifactId: string; chain: WorkflowChain } => {
 const scope = resolveSuperToolContentBuild(input)

 if (scope.contentBuildId) {
  recordContentBuildToolInput({
   contentBuildId: scope.contentBuildId,
   toolId: input.toolId,
   evidenceIds: input.evidence,
   summary: input.summary,
   metadata: {
    moduleId: input.moduleId,
    traceId: input.traceId || null,
    outputRef: input.outputRef || null,
    projectId: scope.projectId,
    channelId: scope.channelId,
    videoId: scope.videoId,
    missingInputs: input.missingInputs,
   },
  })
 }

 const packet: SuperToolActionPacket = {
  id: crypto.randomUUID(),
  toolId: input.toolId,
  moduleId: input.moduleId,
  title: input.title,
  summary: input.summary,
  contentBuildId: scope.contentBuildId,
  projectId: scope.projectId,
  channelId: scope.channelId,
  videoId: scope.videoId,
  traceId: input.traceId || null,
  outputRef: input.outputRef || null,
  inputs: input.inputs,
  outputs: input.outputs,
  confidence: input.confidence,
  evidence: input.evidence,
  missingInputs: input.missingInputs,
  handoffTargets: input.handoffTargets,
  createdAt: Date.now(),
 }

 const selfImprovement = {
  inputsUsed: Object.keys(input.inputs).filter(key => {
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

 const outputJson = { ...packet, metadata: { selfImprovement } }
 const record = createGenerationRecord({
  toolId: input.toolId,
  provider: "mock",
  model: "viewtube-supertool-action-v1",
  prompt: JSON.stringify({ moduleId: input.moduleId, title: input.title, inputs: input.inputs }),
  status: "running",
  artifacts: [],
  metadata: {
   actionPacketId: packet.id,
   moduleId: input.moduleId,
   contentBuildId: scope.contentBuildId,
   projectId: scope.projectId,
   channelId: scope.channelId,
   videoId: scope.videoId,
   traceId: input.traceId || null,
   outputRef: input.outputRef || null,
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

 const [vaultAsset] = ingestGenerationArtifacts([artifact], {
  toolId: input.toolId,
  projectId: scope.projectId,
  projectName: scope.projectName,
  generationId: record.id,
  tags: [
   input.toolId,
   input.moduleId,
   "super-tool-action",
   ...(scope.contentBuildId ? ["content-build"] : []),
   ...(input.tags || []),
  ],
 })

 if (scope.contentBuildId && vaultAsset) {
  attachAssetToContentBuild(scope.contentBuildId, vaultAsset.id, {
   toolId: input.toolId,
   evidenceIds: input.evidence,
   generationRecordId: record.id,
   metadata: {
    moduleId: input.moduleId,
    actionPacketId: packet.id,
    traceId: input.traceId || null,
    outputRef: input.outputRef || null,
   },
  })
  recordContentBuildToolOutput({
   contentBuildId: scope.contentBuildId,
   toolId: input.toolId,
   assetIds: [vaultAsset.id],
   evidenceIds: input.evidence,
   generationRecordId: record.id,
   summary: input.summary,
   metadata: {
    moduleId: input.moduleId,
    actionPacketId: packet.id,
    traceId: input.traceId || null,
    outputRef: input.outputRef || null,
    workflowTitle: input.workflowTitle,
   },
  })
 }

 const chain = createWorkflowChain({
  title: input.workflowTitle,
  goal: input.workflowGoal,
  projectId: scope.projectId,
  primaryToolId: input.toolId,
  steps: input.workflowSteps.map(step => createWorkflowStep(step.title, step.surface, step.toolId, step.details)),
  provenance: [
   `${input.toolId}.${input.moduleId}.${packet.id}`,
   ...(input.traceId ? [`brain-trace:${input.traceId}`] : []),
   ...(input.outputRef ? [`brain-output:${input.outputRef}`] : []),
   ...(scope.contentBuildId ? [`content-build:${scope.contentBuildId}`] : []),
   ...input.evidence,
   ...input.handoffTargets,
  ],
 })

 const liveTargets = [
  ...new Set(
   input.handoffTargets
    .map(target => destinationAliases[target] || target.split(":").pop() || "")
    .filter(Boolean),
  ),
 ]
 const payloadKind = inferPayloadKind(input.moduleId, input.outputs)

 if (liveTargets.length) {
  const livePacket = createViewTubeActionPacket({
   sourceToolId: input.toolId,
   sourceKind: inferSourceKind(input.toolId),
   payloadKind,
   title: input.title,
   summary: input.summary,
   contentBuildId: scope.contentBuildId,
   projectId: scope.projectId,
   channelId: scope.channelId,
   videoId: scope.videoId,
   payload: {
    ...input.inputs,
    ...input.outputs,
    contentBuildId: scope.contentBuildId,
    confidence: input.confidence,
    missingInputs: input.missingInputs,
    workflowId: chain.id,
    sourceActionPacketId: packet.id,
    traceId: input.traceId || null,
    outputRef: input.outputRef || null,
   },
   evidence: input.evidence,
   provenance: [
    `${input.toolId}.${input.moduleId}.${packet.id}`,
    `workflow:${chain.id}`,
    ...(input.traceId ? [`brain-trace:${input.traceId}`] : []),
    ...(input.outputRef ? [`brain-output:${input.outputRef}`] : []),
    ...(scope.contentBuildId ? [`content-build:${scope.contentBuildId}`] : []),
   ],
   suggestedTargets: liveTargets,
  })
  persistViewTubeActionPacket(livePacket)
 }

 return { packet, recordId: record.id, artifactId: artifact.id, chain }
}

