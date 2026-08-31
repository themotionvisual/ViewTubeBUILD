import type {
 AuthState,
 BrainCommandAction,
 SuperToolId,
 SuperToolSurface,
 WorkspaceBrain,
} from "@/types"
import type { ChannelConnectionSnapshot } from "./connectionState"
import { consultBrainSync, annotateSystemPrompt } from "./brain/Utils"
import { SUPER_TOOLS, getSuperTool } from "./superToolRegistry"
import { DASHBOARD_WIDGET_REGISTRY } from "../views/dashboard/WidgetRegistry"
import { listGenerationRecords } from "./generationStore"
import { listWorkflowChains } from "./workflowEngine"
import {
 createBrainCommandAction,
 createSuperToolActionPacket,
 listBrainCommandActions,
 resolveBrainCommandRoute,
} from "./superToolActionPackets"
import { BRAIN_OS_CONTROL_SURFACE_TOOL_ID } from "./brainOwnershipPolicy"

type IntelligenceCategory =
 | "brain"
 | "generation"
 | "analysis"
 | "planning"
 | "dashboard"
 | "onboarding"
 | "memory"
 | "workflow"

interface IntelligenceSystemDefinition {
 id: string
 title: string
 category: IntelligenceCategory
 route: string
 sourceOfTruth: string
 assistantAccess: "read" | "queue"
 summary: string
 targetToolId: SuperToolId
 surface: SuperToolSurface
}

interface AssistantSnapshotInput {
 brain: WorkspaceBrain
 authState: AuthState
 channelConnection: ChannelConnectionSnapshot
}

const normalize = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()

const toSystemDefinition = (toolId: SuperToolId): IntelligenceSystemDefinition => {
 const tool = getSuperTool(toolId)
 return {
  id: toolId,
  title: tool?.title || toolId,
  category:
   tool?.surface === "analytics" ? "analysis"
   : tool?.surface === "projects" ? "planning"
   : tool?.surface === "workflow" ? "workflow"
   : tool?.surface === "brain" ? "brain"
   : "generation",
  route: tool?.routes[0] || "/data-transparency",
  sourceOfTruth: tool?.sourceOfTruth || "Super-tool registry",
  assistantAccess: "queue",
  summary: tool?.summary || "Registered ViewTube intelligence tool.",
  targetToolId: toolId,
  surface: tool?.surface || "brain",
 }
}

const targetForWidget = (category: string, id: string): SuperToolId => {
 if (id.includes("journal") || id.includes("brain") || id.includes("oracle") || id.includes("ask") || id.includes("goals")) {
  return BRAIN_OS_CONTROL_SURFACE_TOOL_ID
 }
 if (category === "analytics" || id.includes("retention") || id.includes("performance")) {
  return "cinematic-analytics-lab"
 }
 if (category === "community") return "audience-loop-studio"
 if (category === "creation") return "creator-canvas-os"
 return "workflow-chain-builder"
}

export const ASSISTANT_INTELLIGENCE_SYSTEMS: IntelligenceSystemDefinition[] = [
 {
  id: "central-brain-memory",
  title: "Brain OS",
  category: "brain",
  route: "/data-transparency?internalTool=brain-command-center",
  sourceOfTruth: "src/services/brain + /Users/cwb/Downloads/viewtube/docs/VT Brain/VIEWTUBEX_BRAIN_OS_CANONICAL_GOVERNANCE.md",
  assistantAccess: "queue",
  summary: "Application-wide intelligence owner for memory, prompt policy, reflection, onboarding, creator profile, channel knowledge, and context access.",
  targetToolId: BRAIN_OS_CONTROL_SURFACE_TOOL_ID,
  surface: "brain",
 },
 {
  id: "onboarding-brain-bootstrap",
  title: "Onboarding Brain Bootstrap",
  category: "onboarding",
  route: "/settings",
  sourceOfTruth: "src/services/brain/OnboardingBootstrap.ts",
  assistantAccess: "queue",
  summary: "First-run channel evidence, knowledge hypotheses, personalized questions, and ToolContextPack.",
  targetToolId: BRAIN_OS_CONTROL_SURFACE_TOOL_ID,
  surface: "brain",
 },
 {
  id: "ai-journal",
  title: "AI Journal",
  category: "memory",
  route: "/",
  sourceOfTruth: "src/views/dashboard/widgets/AIJournalWidget.tsx",
  assistantAccess: "queue",
  summary: "Creator notes, follow-ups, micro-polls, goals, and personal preference learning.",
  targetToolId: BRAIN_OS_CONTROL_SURFACE_TOOL_ID,
  surface: "brain",
 },
 ...SUPER_TOOLS.map((tool) => toSystemDefinition(tool.id)),
 ...DASHBOARD_WIDGET_REGISTRY.filter((widget) =>
  ["ai", "analytics", "community", "creation", "system"].includes(widget.category),
 ).map((widget) => {
  const targetToolId = targetForWidget(widget.category, widget.id)
  const tool = getSuperTool(targetToolId)
  return {
   id: `widget:${widget.id}`,
   title: widget.title,
   category:
    widget.category === "ai" ? "brain"
    : widget.category === "analytics" ? "analysis"
    : widget.category === "community" ? "memory"
    : widget.category === "creation" ? "generation"
    : "dashboard",
   route: "/",
   sourceOfTruth: "src/views/dashboard/WidgetRegistry.ts",
   assistantAccess: "queue",
   summary: widget.subtitle,
   targetToolId,
   surface: tool?.surface || "brain",
  } satisfies IntelligenceSystemDefinition
 }),
]

export const listAssistantIntelligenceSystems = (): IntelligenceSystemDefinition[] =>
 ASSISTANT_INTELLIGENCE_SYSTEMS

export const inferAssistantTargetTool = (text: string): SuperToolId => {
 const normalizedText = normalize(text)
 const direct = ASSISTANT_INTELLIGENCE_SYSTEMS.find((system) => {
  const candidates = [system.id, system.title, system.category, system.summary].map(normalize)
  return candidates.some((candidate) => candidate && normalizedText.includes(candidate))
 })
 if (direct) return direct.targetToolId
 if (/\b(goal|journal|memory|brain|onboarding|assistant|chat)\b/.test(normalizedText)) return BRAIN_OS_CONTROL_SURFACE_TOOL_ID
 if (/\b(audio|video|analy[sz]e|retention|analytics|history|ctr|views)\b/.test(normalizedText)) return "cinematic-analytics-lab"
 if (/\b(comment|community|audience|reply)\b/.test(normalizedText)) return "audience-loop-studio"
 if (/\bthumbnail|title|hook|script|generator|content|idea|seo\b/.test(normalizedText)) return "creator-canvas-os"
 if (/\b(workflow|chain|automation|handoff)\b/.test(normalizedText)) return "workflow-chain-builder"
 return BRAIN_OS_CONTROL_SURFACE_TOOL_ID
}

export const buildAssistantIntelligenceSnapshot = ({
 brain,
 authState,
 channelConnection,
}: AssistantSnapshotInput): string => {
 const generations = listGenerationRecords().slice(0, 8)
 const workflows = listWorkflowChains().slice(0, 8)
 const commandActions = listBrainCommandActions().slice(0, 8)
 const systems = ASSISTANT_INTELLIGENCE_SYSTEMS.map((system) => ({
  id: system.id,
  title: system.title,
  category: system.category,
  route: system.route,
  access: system.assistantAccess,
  targetToolId: system.targetToolId,
  sourceOfTruth: system.sourceOfTruth,
 }))
 const snapshot = {
  channel: {
   connected: channelConnection.isConnected,
   label: authState.channelName || brain.channelProfile?.name || channelConnection.title,
   handle: authState.channelHandle || brain.channelProfile?.channelHandle || null,
   subscribers: authState.subscriberCount || brain.recentMetrics?.currentSubscribers || null,
   totalViews: authState.totalViews || brain.recentMetrics?.lifetimeViews || null,
  },
  brainWorkspace: {
   coreConcept: brain.coreConcept,
   targetNiche: brain.targetNiche,
   onboarding: brain.onboarding || {},
   activeProjects: brain.projects?.length || 0,
   journalEntries: brain.journalEntries?.length || 0,
   pendingFollowUps: (brain.journalFollowUps || []).filter((item) => !item.answer).length,
   pendingMicroPolls: (brain.microPolls || []).filter((item) => !item.answer).length,
   recentMetrics: brain.recentMetrics || {},
  },
  connectedSystems: systems,
  recentGenerationRecords: generations.map((record) => ({
   id: record.id,
   toolId: record.toolId,
   status: record.status,
   summary: record.outputText || record.metadata?.moduleId || record.model,
  })),
  workflowChains: workflows.map((workflow) => ({
   id: workflow.id,
   title: workflow.title,
   status: workflow.status,
   primaryToolId: workflow.primaryToolId,
  })),
  queuedBrainCommands: commandActions.map((action) => ({
   id: action.id,
   targetToolId: action.targetToolId,
   priority: action.priority,
   confidence: action.confidence,
   status: action.status,
   note: action.note,
  })),
 }
 return JSON.stringify(snapshot, null, 2)
}

export const buildAssistantSystemPrompt = (input: AssistantSnapshotInput): string => {
 const brainPacket = consultBrainSync("AI_ASSISTANT")
 const intelligenceSnapshot = buildAssistantIntelligenceSnapshot(input)
 const basePrompt = `
IDENTITY: You are the ViewTube integrated intelligence assistant in the sidebar.
ROLE: You are the conversational face of the Brain system, not a second Brain.

OPERATING RULES:
1. Use Brain memory, ToolContextPack evidence, dashboard widgets, super-tools, generation records, workflows, channel history, goals, onboarding, AI journal, media analysis, and analytics context when answering.
2. When evidence is missing, say what is missing and route the user to the right ViewTube tool instead of guessing.
3. You may recommend and prepare queued actions, but direct external mutations, uploads, deletes, publishing, comments, syncs, and render actions require explicit user action inside the target tool.
4. Prefer concise answers with concrete next steps and named tool routes.
5. Preserve the Neo-Brutalist product voice: direct, useful, and specific.

AVAILABLE INTELLIGENCE SYSTEMS:
${intelligenceSnapshot}
`
 return annotateSystemPrompt(basePrompt, brainPacket)
}

export const queueAssistantCommand = async (input: {
 request: string
 response?: string
 channelId?: string | null
 priority?: BrainCommandAction["priority"]
 confidence?: BrainCommandAction["confidence"]
}): Promise<{
 action: BrainCommandAction
 recordId: string
 workflowId: string
 targetToolId: SuperToolId
}> => {
 const targetToolId = inferAssistantTargetTool(input.request)
 const tool = getSuperTool(targetToolId)
 const priority = input.priority || "medium"
 const confidence = input.confidence || "medium"
 const commandActionId = crypto.randomUUID()
 const sourceEvidence = [
  "assistant:user-request",
  input.response ? "assistant:model-response" : "",
  input.channelId ? `channel:${input.channelId}` : "",
 ].filter(Boolean)
 const note = input.response ? `${input.request}\n\nAssistant context:\n${input.response}` : input.request
 const packet = createSuperToolActionPacket({
  toolId: BRAIN_OS_CONTROL_SURFACE_TOOL_ID,
  moduleId: "assistant-intelligence-router",
  title: "Sidebar assistant queued command",
  summary: `Queued assistant request for ${tool?.title || targetToolId}.`,
  inputs: {
   request: input.request,
   assistantResponse: input.response || null,
   targetToolId,
   channelId: input.channelId || null,
  },
  outputs: {
   commandActionId,
   targetToolId,
   status: "queued",
  },
  confidence,
  evidence: sourceEvidence,
  missingInputs: [],
  handoffTargets: [`workflow:${targetToolId}`, `brain:${BRAIN_OS_CONTROL_SURFACE_TOOL_ID}`],
  workflowTitle: `${tool?.title || targetToolId} assistant handoff`,
  workflowGoal: "Review the assistant request, confirm the target tool, and execute the next user-approved step.",
  workflowSteps: [
   {
    title: "Review assistant command",
    surface: "brain",
    toolId: BRAIN_OS_CONTROL_SURFACE_TOOL_ID,
    details: input.request,
   },
   {
    title: `Open ${tool?.title || targetToolId}`,
    surface: tool?.surface || "brain",
    toolId: targetToolId,
    details: "Use the queued request as context; do not perform external mutations without user confirmation.",
   },
  ],
  tags: ["assistant-intelligence", targetToolId, priority, confidence],
 })
 const action = createBrainCommandAction({
  id: commandActionId,
  priority,
  confidence,
  sourceEvidence,
  targetToolId,
  note,
  source: "assistant",
  generationId: packet.recordId,
  workflowId: packet.chain.id,
  assistantRequest: input.request,
  assistantResponse: input.response || null,
  targetRoute: resolveBrainCommandRoute(targetToolId, commandActionId),
 })
 return {
  action,
  recordId: packet.recordId,
  workflowId: packet.chain.id,
  targetToolId,
 }
}
