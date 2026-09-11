import type { SuperToolActionPacket, SuperToolId } from "../../types"

const STORAGE_KEY = "vt_brain_handoff_inbox_v1"
export const BRAIN_HANDOFF_EVENT = "vt_brain_handoff_inbox_changed"

export type BrainHandoffStatus = "queued" | "opened" | "accepted" | "completed" | "dismissed"

export interface BrainHandoffEnvelope {
 id: string
 packetId: string
 sourceToolId: SuperToolId
 target: string
 targetToolId: SuperToolId | null
 title: string
 summary: string
 inputs: Record<string, unknown>
 outputs: Record<string, unknown>
 evidence: string[]
 missingInputs: string[]
 confidence: SuperToolActionPacket["confidence"]
 status: BrainHandoffStatus
 createdAt: number
 updatedAt: number
}

const canUseStorage = () => typeof window !== "undefined" && typeof localStorage !== "undefined"

const read = (): BrainHandoffEnvelope[] => {
 if (!canUseStorage()) return []
 try {
  const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
  return Array.isArray(value) ? value : []
 } catch {
  return []
 }
}

const write = (items: BrainHandoffEnvelope[]) => {
 if (!canUseStorage()) return
 localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 250)))
 window.dispatchEvent(new CustomEvent(BRAIN_HANDOFF_EVENT, { detail: items }))
}

const parseToolTarget = (target: string): SuperToolId | null => {
 const match = /^(?:studio|workflow|brain|tool):(.+)$/.exec(target)
 return match?.[1] ? match[1] as SuperToolId : null
}

export const listBrainHandoffs = (targetToolId?: SuperToolId | null): BrainHandoffEnvelope[] => {
 const items = read().sort((a, b) => b.createdAt - a.createdAt)
 return targetToolId ? items.filter((item) => item.targetToolId === targetToolId) : items
}

export const enqueueBrainHandoffs = (packet: SuperToolActionPacket): BrainHandoffEnvelope[] => {
 const now = Date.now()
 const existing = read()
 const additions = packet.handoffTargets
  .filter((target) => !existing.some((item) => item.packetId === packet.id && item.target === target))
  .map((target): BrainHandoffEnvelope => ({
   id: crypto.randomUUID(),
   packetId: packet.id,
   sourceToolId: packet.toolId,
   target,
   targetToolId: parseToolTarget(target),
   title: packet.title,
   summary: packet.summary,
   inputs: packet.inputs,
   outputs: packet.outputs,
   evidence: packet.evidence,
   missingInputs: packet.missingInputs,
   confidence: packet.confidence,
   status: "queued",
   createdAt: now,
   updatedAt: now,
  }))
 if (additions.length) write([...additions, ...existing])
 return additions
}

export const updateBrainHandoffStatus = (
 id: string,
 status: BrainHandoffStatus,
): BrainHandoffEnvelope | null => {
 let changed: BrainHandoffEnvelope | null = null
 const next = read().map((item) => {
  if (item.id !== id) return item
  changed = { ...item, status, updatedAt: Date.now() }
  return changed
 })
 if (changed) write(next)
 return changed
}

export const consumeNewestBrainHandoff = (targetToolId: SuperToolId): BrainHandoffEnvelope | null => {
 const item = listBrainHandoffs(targetToolId).find((candidate) => candidate.status === "queued") || null
 if (!item) return null
 return updateBrainHandoffStatus(item.id, "opened")
}

export const clearCompletedBrainHandoffs = () => {
 const next = read().filter((item) => item.status !== "completed" && item.status !== "dismissed")
 write(next)
}
