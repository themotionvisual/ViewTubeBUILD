/**
 * BrainTrace — one inspectable record per AI operation.
 *
 * Before this existed, a Brain turn scattered fragments of its own history across a
 * learning event and a conversation turn, and an asset generation recorded nothing at all.
 * There was no way to answer "what evidence did this answer use", "which model actually
 * served it", or "why was this repaired" after the fact, which makes both debugging and
 * outcome attribution guesswork.
 *
 * A trace is the unit that later joins a recommendation to its measured outcome, so it
 * carries `outputRef`: the stable id of whatever the operation produced.
 *
 * Storage is behind a sink because traces belong server-side. The default sink is
 * browser-local and capped, which is enough to build and inspect against but is explicitly
 * not the destination: it is per-device, lost on cache clear, and cannot be aggregated for
 * calibration. Phase 1 registers a server sink and no caller changes.
 */

import type { ModelResolution } from "./modelRouting"

export type BrainTraceKind = "question" | "asset" | "report" | "analysis"

export type BrainTraceStatus = "running" | "complete" | "fallback" | "failed"

export interface BrainTraceEvidence {
 /** Evidence classes the planner asked for. */
 requested: string[]
 /** Evidence refs actually resolved. */
 returned: string[]
 /** Asked for and unavailable. The most diagnostic field in the trace. */
 missing: string[]
}

export interface BrainTraceContext {
 tokensEstimated: number
 sectionsIncluded: string[]
 sectionsDropped: string[]
}

export interface BrainTraceClaims {
 /** Figures with no basis in evidence. */
 fabricated: string[]
 /** Percentages and rates not directly present. */
 unverifiedDerived: string[]
}

export interface BrainTrace {
 id: string
 channelId: string | null
 kind: BrainTraceKind
 /** Set for kind === "asset". */
 assetType?: string
 createdAt: string
 completedAt?: string
 latencyMs?: number
 status: BrainTraceStatus
 failureReason?: string

 intent?: string
 taskProfileId?: string
 capabilitiesInvoked: string[]

 evidence: BrainTraceEvidence
 context: BrainTraceContext
 claims: BrainTraceClaims

 styleProfileId?: string
 /** 0-100. Absent when no style profile applied. */
 styleScore?: number

 /** Independently versioned inputs, so an outcome can be attributed to a configuration. */
 promptVersions: Record<string, string>
 model?: ModelResolution

 /** Named grader results, 0-100. */
 grades: Record<string, number>
 repairAttempts: number

 /** Stable id of the produced asset or answer, for outcome joining. */
 outputRef?: string
}

const STORAGE_KEY = "vt_brain_traces_v1"
const MAXIMUM_RETAINED = 200
export const BRAIN_TRACE_EVENT = "vt_brain_trace_recorded"

export interface BrainTraceSink {
 write: (trace: BrainTrace) => void
 list: (channelId?: string | null) => BrainTrace[]
}

const canUseStorage = (): boolean =>
 typeof window !== "undefined" && typeof localStorage !== "undefined"

const readAll = (): BrainTrace[] => {
 if (!canUseStorage()) return []
 try {
  const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
  return Array.isArray(parsed) ? (parsed as BrainTrace[]) : []
 } catch {
  return []
 }
}

/**
 * Interim sink. Traces are shared, durable, queryable state in the target design; this is
 * a local stand-in so the contract can be exercised before the gateway exists.
 */
const localSink: BrainTraceSink = {
 write: (trace) => {
  if (!canUseStorage()) return
  const next = [trace, ...readAll().filter((entry) => entry.id !== trace.id)]
   .slice(0, MAXIMUM_RETAINED)
  try {
   localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
   window.dispatchEvent(new CustomEvent(BRAIN_TRACE_EVENT, { detail: trace }))
  } catch {
   // A full quota must never break a generation the creator is waiting on.
  }
 },
 list: (channelId) => {
  const all = readAll()
  return channelId ? all.filter((entry) => entry.channelId === channelId) : all
 },
}

let activeSink: BrainTraceSink = localSink

/** Phase 1 calls this once with a server-backed sink. */
export const setBrainTraceSink = (sink: BrainTraceSink): void => {
 activeSink = sink
}

export const resetBrainTraceSink = (): void => {
 activeSink = localSink
}

export const listBrainTraces = (channelId?: string | null): BrainTrace[] =>
 activeSink.list(channelId)

const makeTraceId = (): string =>
 typeof crypto !== "undefined" && "randomUUID" in crypto
  ? `trace_${crypto.randomUUID()}`
  : `trace_${Date.now()}_${Math.random().toString(36).slice(2)}`

export interface BrainTraceRecorder {
 readonly id: string
 /** Current snapshot. Useful in tests and for surfacing a running operation. */
 snapshot: () => BrainTrace
 setIntent: (input: { intent?: string; taskProfileId?: string }) => void
 recordCapabilities: (capabilityIds: string[]) => void
 recordEvidence: (evidence: Partial<BrainTraceEvidence>) => void
 recordContext: (context: Partial<BrainTraceContext>) => void
 recordModel: (model: ModelResolution) => void
 recordPromptVersion: (name: string, version: string) => void
 recordClaims: (claims: Partial<BrainTraceClaims>) => void
 recordStyle: (input: { styleProfileId?: string; styleScore?: number }) => void
 recordGrade: (name: string, score: number) => void
 recordRepairAttempt: () => void
 complete: (input?: {
  status?: BrainTraceStatus
  outputRef?: string
  failureReason?: string
 }) => BrainTrace
}

export const beginBrainTrace = (input: {
 kind: BrainTraceKind
 channelId?: string | null
 assetType?: string
}): BrainTraceRecorder => {
 const startedAt = Date.now()
 const trace: BrainTrace = {
  id: makeTraceId(),
  channelId: input.channelId ?? null,
  kind: input.kind,
  ...(input.assetType ? { assetType: input.assetType } : {}),
  createdAt: new Date(startedAt).toISOString(),
  status: "running",
  capabilitiesInvoked: [],
  evidence: { requested: [], returned: [], missing: [] },
  context: { tokensEstimated: 0, sectionsIncluded: [], sectionsDropped: [] },
  claims: { fabricated: [], unverifiedDerived: [] },
  promptVersions: {},
  grades: {},
  repairAttempts: 0,
 }

 return {
  id: trace.id,
  snapshot: () => ({ ...trace }),
  setIntent: ({ intent, taskProfileId }) => {
   if (intent) trace.intent = intent
   if (taskProfileId) trace.taskProfileId = taskProfileId
  },
  recordCapabilities: (capabilityIds) => {
   trace.capabilitiesInvoked = [...new Set([...trace.capabilitiesInvoked, ...capabilityIds])]
  },
  recordEvidence: (evidence) => {
   trace.evidence = {
    requested: evidence.requested ?? trace.evidence.requested,
    returned: evidence.returned ?? trace.evidence.returned,
    missing: evidence.missing ?? trace.evidence.missing,
   }
  },
  recordContext: (context) => {
   trace.context = { ...trace.context, ...context }
  },
  recordModel: (model) => {
   trace.model = model
  },
  recordPromptVersion: (name, version) => {
   trace.promptVersions[name] = version
  },
  recordClaims: (claims) => {
   trace.claims = {
    fabricated: claims.fabricated ?? trace.claims.fabricated,
    unverifiedDerived: claims.unverifiedDerived ?? trace.claims.unverifiedDerived,
   }
  },
  recordStyle: ({ styleProfileId, styleScore }) => {
   if (styleProfileId) trace.styleProfileId = styleProfileId
   if (typeof styleScore === "number") trace.styleScore = styleScore
  },
  recordGrade: (name, score) => {
   trace.grades[name] = score
  },
  recordRepairAttempt: () => {
   trace.repairAttempts += 1
  },
  complete: (completion) => {
   const completedAt = Date.now()
   trace.status = completion?.status ?? "complete"
   trace.completedAt = new Date(completedAt).toISOString()
   trace.latencyMs = completedAt - startedAt
   if (completion?.outputRef) trace.outputRef = completion.outputRef
   if (completion?.failureReason) trace.failureReason = completion.failureReason
   const finished = { ...trace }
   activeSink.write(finished)
   return finished
  },
 }
}
