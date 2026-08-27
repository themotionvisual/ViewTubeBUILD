import type { SuperToolId } from "../../types"
import { createSuperToolActionPacket } from "../superToolActionPackets"
import { getSuperTool } from "../superToolRegistry"
import { emitSignal } from "./Core"
import { readBrainUserControls } from "./BrainUserControls"

export interface BrainSuperToolHandoffInput {
 channelId?: string | null
 projectId?: string | null
 sourceToolId: SuperToolId
 destinationToolId: SuperToolId
 objective: string
 payload: Record<string, unknown>
 evidenceIds?: string[]
 creatorDecisions?: Array<{ type: string; choice: string }>
 confidence?: "low" | "medium" | "high"
}

/**
 * Brain-to-tool handoffs intentionally reuse the canonical SuperTool action
 * packet / generation / Vault / workflow systems. This is a convenience
 * adapter, not a second handoff format.
 *
 * Every persisted handoff is also emitted back into the existing Brain signal
 * loop. Core.ts applies the creator's learning controls before that signal can
 * affect durable memory.
 */
export const createBrainSuperToolHandoff = async (
 input: BrainSuperToolHandoffInput,
) => {
 const controls = readBrainUserControls(input.channelId)
 if (!controls.enabled) throw new Error("ViewTube Brain is disabled in User Controls.")

 const sourceTool = getSuperTool(input.sourceToolId)
 const destinationTool = getSuperTool(input.destinationToolId)
 if (!sourceTool) throw new Error(`Unknown source Super Tool: ${input.sourceToolId}`)
 if (!destinationTool) throw new Error(`Unknown destination Super Tool: ${input.destinationToolId}`)

 const result = createSuperToolActionPacket({
  toolId: input.sourceToolId,
  moduleId: "brain-handoff",
  title: `${sourceTool.title} → ${destinationTool.title}`,
  summary: input.objective,
  inputs: {
   channelId: input.channelId ?? null,
   projectId: input.projectId ?? null,
   creatorDecisions: input.creatorDecisions ?? [],
  },
  outputs: {
   destinationToolId: input.destinationToolId,
   payload: input.payload,
  },
  confidence: input.confidence ?? "medium",
  evidence: input.evidenceIds ?? [],
  missingInputs: [],
  handoffTargets: [input.destinationToolId],
  workflowTitle: `${sourceTool.title} to ${destinationTool.title}`,
  workflowGoal: input.objective,
  workflowSteps: [
   {
    title: `Review ${sourceTool.title} handoff`,
    surface: sourceTool.surface,
    toolId: input.sourceToolId,
    details: input.objective,
   },
   {
    title: `Continue in ${destinationTool.title}`,
    surface: destinationTool.surface,
    toolId: input.destinationToolId,
    details: `Use the Brain handoff payload and evidence from ${sourceTool.title}.`,
   },
  ],
  tags: ["brain-handoff", input.destinationToolId],
 })

 await emitSignal(input.sourceToolId, "BRAIN_HANDOFF_CREATED", {
  channelId: input.channelId ?? null,
  projectId: input.projectId ?? null,
  destinationToolId: input.destinationToolId,
  objective: input.objective,
  evidenceIds: input.evidenceIds ?? [],
  creatorDecisions: input.creatorDecisions ?? [],
  actionPacketId: result.packet.id,
  generationRecordId: result.recordId,
  workflowId: result.chain.id,
 })

 return result
}
