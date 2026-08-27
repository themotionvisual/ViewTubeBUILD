import type { SuperToolId } from "../../types"

export interface BrainHandoffPacket<TPayload = Record<string, unknown>> {
 id: string
 channelId: string | null
 projectId: string | null
 sourceToolId: SuperToolId | "brain-command-center"
 destinationToolId: SuperToolId | "brain-command-center"
 objective: string
 payload: TPayload
 evidenceIds: string[]
 creatorDecisions: Array<{ type: string; choice: string }>
 createdAt: string
}

export const BRAIN_HANDOFF_EVENT = "vt_brain_handoff"
export const BRAIN_HANDOFF_STORAGE_KEY = "vt_brain_handoff_v1"

export const createBrainHandoff = <TPayload extends Record<string, unknown>>(input: {
 channelId?: string | null
 projectId?: string | null
 sourceToolId: BrainHandoffPacket["sourceToolId"]
 destinationToolId: BrainHandoffPacket["destinationToolId"]
 objective: string
 payload: TPayload
 evidenceIds?: string[]
 creatorDecisions?: BrainHandoffPacket["creatorDecisions"]
}): BrainHandoffPacket<TPayload> => ({
 id: crypto.randomUUID(),
 channelId: input.channelId ?? null,
 projectId: input.projectId ?? null,
 sourceToolId: input.sourceToolId,
 destinationToolId: input.destinationToolId,
 objective: input.objective,
 payload: input.payload,
 evidenceIds: input.evidenceIds ?? [],
 creatorDecisions: input.creatorDecisions ?? [],
 createdAt: new Date().toISOString(),
})

export const publishBrainHandoff = <TPayload extends Record<string, unknown>>(
 packet: BrainHandoffPacket<TPayload>,
): BrainHandoffPacket<TPayload> => {
 if (typeof window !== "undefined") {
  try {
   localStorage.setItem(BRAIN_HANDOFF_STORAGE_KEY, JSON.stringify(packet))
  } catch {
   // Storage failure must not block the in-memory handoff event.
  }
  window.dispatchEvent(new CustomEvent(BRAIN_HANDOFF_EVENT, { detail: packet }))
 }
 return packet
}

export const readLatestBrainHandoff = (): BrainHandoffPacket | null => {
 if (typeof window === "undefined") return null
 try {
  const raw = localStorage.getItem(BRAIN_HANDOFF_STORAGE_KEY)
  return raw ? JSON.parse(raw) as BrainHandoffPacket : null
 } catch {
  return null
 }
}
