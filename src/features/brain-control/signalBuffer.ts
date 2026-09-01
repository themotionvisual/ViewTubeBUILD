// Session-only ring buffer for brain / signal events.
//
// The full Brain Engine's `emitSignal` API is scattered across services;
// this buffer gives the Control Center widget one subscribable surface
// without touching those services. Wire the widget to it first, then
// swap the buffer's `push` call into `brainEngine.emitSignal` in P2.

export type BrainSignal = {
  ts: number
  tool: string
  event: string
  payload?: unknown
}

const CAP = 500
const buffer: BrainSignal[] = []
const listeners = new Set<() => void>()

export const pushSignal = (sig: Omit<BrainSignal, "ts"> & { ts?: number }) => {
  buffer.push({ ts: sig.ts || Date.now(), tool: sig.tool, event: sig.event, payload: sig.payload })
  if (buffer.length > CAP) buffer.splice(0, buffer.length - CAP)
  listeners.forEach((l) => l())
}

export const getSignals = (): BrainSignal[] => [...buffer]

export const subscribeToSignals = (listener: () => void): (() => void) => {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

// Optional: expose a hook-friendly counter so React components can
// re-render on new signals without hand-rolling subscribe/unsubscribe.
import { useEffect, useState } from "react"
export const useLiveSignals = (limit = 100): BrainSignal[] => {
  const [snap, setSnap] = useState<BrainSignal[]>(() => getSignals().slice(-limit))
  useEffect(() => {
    const off = subscribeToSignals(() => setSnap(getSignals().slice(-limit)))
    return off
  }, [limit])
  return snap
}
