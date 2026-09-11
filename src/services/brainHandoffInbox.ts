import type { ViewTubeActionPacket } from "./viewTubeToolChains"

export type BrainHandoffState = "queued" | "opened" | "accepted" | "completed" | "dismissed"

export interface BrainHandoffInboxItem {
  id: string
  packetId: string
  sourceToolId: string
  destinationToolId: string
  title: string
  summary: string
  payloadKind: ViewTubeActionPacket["payloadKind"]
  evidence: string[]
  provenance: string[]
  projectId?: string | null
  channelId?: string | null
  videoId?: string | null
  state: BrainHandoffState
  createdAt: number
  updatedAt: number
}

const KEY = "viewtube:brain-handoff-inbox:v1"

const read = (): BrainHandoffInboxItem[] => {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || "[]") as BrainHandoffInboxItem[]
  } catch {
    return []
  }
}

const write = (items: BrainHandoffInboxItem[]) => {
  if (typeof window === "undefined") return
  window.localStorage.setItem(KEY, JSON.stringify(items.slice(0, 500)))
}

export const listBrainHandoffs = (destinationToolId?: string) => {
  const items = read()
  return destinationToolId ? items.filter(item => item.destinationToolId === destinationToolId) : items
}

export const enqueueBrainHandoffs = (packet: ViewTubeActionPacket) => {
  const now = Date.now()
  const existing = read()
  const additions = packet.suggestedTargets
    .filter(destinationToolId => !existing.some(item => item.packetId === packet.id && item.destinationToolId === destinationToolId))
    .map(destinationToolId => ({
      id: crypto.randomUUID(),
      packetId: packet.id,
      sourceToolId: packet.sourceToolId,
      destinationToolId,
      title: packet.title,
      summary: packet.summary,
      payloadKind: packet.payloadKind,
      evidence: packet.evidence,
      provenance: packet.provenance,
      projectId: packet.projectId,
      channelId: packet.channelId,
      videoId: packet.videoId,
      state: "queued" as const,
      createdAt: now,
      updatedAt: now,
    }))
  write([...additions, ...existing])
  return additions
}

export const updateBrainHandoffState = (id: string, state: BrainHandoffState) => {
  const items = read()
  const updatedAt = Date.now()
  let changed: BrainHandoffInboxItem | null = null
  const next = items.map(item => {
    if (item.id !== id) return item
    changed = { ...item, state, updatedAt }
    return changed
  })
  write(next)
  return changed
}

export const getPendingBrainHandoffCount = (destinationToolId?: string) =>
  listBrainHandoffs(destinationToolId).filter(item => item.state === "queued" || item.state === "opened").length
