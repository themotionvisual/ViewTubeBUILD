import { evaluateViewTubeControl } from "./viewTubeUserControls"

export interface WorkflowPreferenceSignal {
 id: string
 at: number
 sourceToolId: string
 payloadKind: string
 targetToolId: string
 accepted: boolean
 chainId?: string | null
 channelId?: string | null
 projectId?: string | null
}

const KEY = "viewtube:workflow-preferences:v1"

const readSignals = (): WorkflowPreferenceSignal[] => {
 if (typeof window === "undefined") return []
 try { return JSON.parse(window.localStorage.getItem(KEY) || "[]") as WorkflowPreferenceSignal[] } catch { return [] }
}

export const recordWorkflowPreferenceSignal = (signal: Omit<WorkflowPreferenceSignal, "id" | "at">) => {
 if (!evaluateViewTubeControl("creator-learning").allowed) return null
 const item = { ...signal, id: crypto.randomUUID(), at: Date.now() }
 if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify([item, ...readSignals()].slice(0, 2000)))
 return item
}

export const rankWorkflowTargets = (sourceToolId: string, payloadKind: string, targetIds: string[], channelId?: string | null) => {
 if (!evaluateViewTubeControl("creator-learning").allowed) return targetIds
 const signals = readSignals().filter((signal) => signal.sourceToolId === sourceToolId && signal.payloadKind === payloadKind)
 const score = (targetId: string) => signals.reduce((total, signal) => {
  if (signal.targetToolId !== targetId) return total
  const channelWeight = channelId && signal.channelId === channelId ? 2 : 1
  return total + (signal.accepted ? 1 : -0.5) * channelWeight
 }, 0)
 return [...targetIds].sort((a, b) => score(b) - score(a))
}

export const getWorkflowLearningSummary = () => {
 const signals = readSignals()
 const accepted = signals.filter((signal) => signal.accepted).length
 return { signals: signals.length, accepted, rejected: signals.length - accepted }
}
