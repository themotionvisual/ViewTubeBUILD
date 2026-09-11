export interface BrainEngineControls {
 channelIntelligence: boolean
 anomalyIntelligence: boolean
 opportunityIntelligence: boolean
 algorithmPriming: boolean
 videoPackages: boolean
 autoLoadEvidence: boolean
 maxEvidenceItems: number
 anomalyMinimumImpact: number
 anomalyMinimumConfidence: number
}

export const BRAIN_ENGINE_CONTROLS_KEY = "vt_brain_engine_controls_v1"

export const DEFAULT_BRAIN_ENGINE_CONTROLS: BrainEngineControls = {
 channelIntelligence: true,
 anomalyIntelligence: true,
 opportunityIntelligence: true,
 algorithmPriming: true,
 videoPackages: true,
 autoLoadEvidence: true,
 maxEvidenceItems: 12,
 anomalyMinimumImpact: 0.55,
 anomalyMinimumConfidence: 0.6,
}

const available = () => typeof window !== "undefined" && typeof localStorage !== "undefined"
const keyFor = (channelId?: string | null) => channelId ? `${BRAIN_ENGINE_CONTROLS_KEY}:${channelId}` : BRAIN_ENGINE_CONTROLS_KEY

export const readBrainEngineControls = (channelId?: string | null): BrainEngineControls => {
 if (!available()) return DEFAULT_BRAIN_ENGINE_CONTROLS
 try {
  const globalRaw = localStorage.getItem(BRAIN_ENGINE_CONTROLS_KEY)
  const channelRaw = channelId ? localStorage.getItem(keyFor(channelId)) : null
  return {
   ...DEFAULT_BRAIN_ENGINE_CONTROLS,
   ...(globalRaw ? JSON.parse(globalRaw) : {}),
   ...(channelRaw ? JSON.parse(channelRaw) : {}),
  }
 } catch { return DEFAULT_BRAIN_ENGINE_CONTROLS }
}

export const writeBrainEngineControls = (next: BrainEngineControls, channelId?: string | null) => {
 const normalized: BrainEngineControls = {
  ...DEFAULT_BRAIN_ENGINE_CONTROLS,
  ...next,
  maxEvidenceItems: Math.max(3, Math.min(30, Number(next.maxEvidenceItems) || 12)),
  anomalyMinimumImpact: Math.max(0, Math.min(1, Number(next.anomalyMinimumImpact) || 0)),
  anomalyMinimumConfidence: Math.max(0, Math.min(1, Number(next.anomalyMinimumConfidence) || 0)),
 }
 if (available()) {
  localStorage.setItem(keyFor(channelId), JSON.stringify(normalized))
  window.dispatchEvent(new CustomEvent("vt_brain_engine_controls_changed", { detail: normalized }))
 }
 return normalized
}

export const resetBrainEngineControls = (channelId?: string | null) => {
 if (available()) localStorage.removeItem(keyFor(channelId))
 const value = readBrainEngineControls(channelId)
 if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("vt_brain_engine_controls_changed", { detail: value }))
 return value
}
