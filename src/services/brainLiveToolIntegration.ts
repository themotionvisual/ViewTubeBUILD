import type { ViewTubeActionPacket, ViewTubePayloadKind } from "./viewTubeToolChains"
import { getViewTubeToolCapability, loadViewTubeActionPacket } from "./viewTubeToolChains"
import { listBrainHandoffs, updateBrainHandoffState, type BrainHandoffInboxItem } from "./brainHandoffInbox"
import { recordBrainWorkflowResult } from "./brainWorkflowLearning"

export type BrainToolIntegrationState = "ready" | "blocked" | "consumed"

export interface BrainToolIntegrationEnvelope<T = unknown> {
  handoff: BrainHandoffInboxItem
  packet: ViewTubeActionPacket<T>
  destinationToolId: string
  payloadKind: ViewTubePayloadKind
  state: BrainToolIntegrationState
  reason?: string
}

export const getPendingToolIntegrations = (destinationToolId: string): BrainToolIntegrationEnvelope[] => {
  const target = getViewTubeToolCapability(destinationToolId)
  return listBrainHandoffs(destinationToolId)
    .filter(item => item.state === "queued" || item.state === "opened")
    .map(handoff => {
      const packet = loadViewTubeActionPacket(handoff.packetId)
      if (!packet) return { handoff, packet: null, destinationToolId, payloadKind: handoff.payloadKind, state: "blocked" as const, reason: "ActionPacket is no longer available." }
      if (!target) return { handoff, packet, destinationToolId, payloadKind: packet.payloadKind, state: "blocked" as const, reason: "Destination tool is not registered." }
      if (!target.accepts.includes(packet.payloadKind)) return { handoff, packet, destinationToolId, payloadKind: packet.payloadKind, state: "blocked" as const, reason: `${target.label} cannot accept ${packet.payloadKind}.` }
      return { handoff, packet, destinationToolId, payloadKind: packet.payloadKind, state: "ready" as const }
    })
    .filter((row): row is BrainToolIntegrationEnvelope => Boolean(row.packet))
}

export const openToolIntegration = (handoffId: string) => updateBrainHandoffState(handoffId, "opened")
export const acceptToolIntegration = (handoffId: string) => updateBrainHandoffState(handoffId, "accepted")
export const completeToolIntegration = (handoffId: string, channelId?: string | null, chainId = "live-tool-handoff") => {
  const item = updateBrainHandoffState(handoffId, "completed")
  if (item && channelId) recordBrainWorkflowResult({ channelId, chainId, goal: "produce", outcome: "completed", scoreBefore: 0.5 })
  return item
}
export const dismissToolIntegration = (handoffId: string, channelId?: string | null, chainId = "live-tool-handoff") => {
  const item = updateBrainHandoffState(handoffId, "dismissed")
  if (item && channelId) recordBrainWorkflowResult({ channelId, chainId, goal: "produce", outcome: "rejected", scoreBefore: 0.5 })
  return item
}

export const extractToolPrefill = <T extends Record<string, unknown> = Record<string, unknown>>(packet: ViewTubeActionPacket): Partial<T> => {
  if (packet.payload && typeof packet.payload === "object" && !Array.isArray(packet.payload)) return packet.payload as Partial<T>
  return { handoffValue: packet.payload } as Partial<T>
}
