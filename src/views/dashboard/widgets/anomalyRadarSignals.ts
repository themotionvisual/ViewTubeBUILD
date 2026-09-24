import type { AlgorithmSignal } from "../../../services/brain/AlgorithmStrategyEngine"

const LABELS: Record<string, string> = {
  views: "VIEWS",
  subscribers: "SUBSCRIBERS",
  subscribersGained: "SUBSCRIBERS",
  estimatedRevenue: "REVENUE",
  revenue: "REVENUE",
  ctr: "CTR",
  clickThroughRate: "CTR",
  impressionClickThroughRate: "CTR",
  averageViewPercentage: "AVP",
  avgViewPercentage: "AVP",
  browse: "BROWSE",
  trafficBrowseFeatures: "BROWSE",
}

const labelFor = (signal: AlgorithmSignal) => {
  const raw = String(signal.metric || signal.entity || signal.kind || "signal")
  return LABELS[raw] || raw.replaceAll("_", " ").toUpperCase()
}

export const describeAlgorithmAnomaly = (signal: AlgorithmSignal) => {
  const delta = Number.isFinite(signal.relativeDelta) ? Number(signal.relativeDelta) : 0
  const impact = Math.max(0, Math.min(100, Math.round(signal.impactScore || 0)))
  const confidence = Math.max(0, Math.min(100, Math.round(signal.confidence || 0)))
  const severity = impact >= 70 && confidence >= 70 ? "SIGNIFICANT" : "WATCH"

  return {
    id: signal.id,
    label: labelFor(signal),
    direction: delta < 0 ? "down" as const : delta > 0 ? "up" as const : "neutral" as const,
    delta,
    current: signal.currentValue ?? null,
    baseline: signal.baselineValue ?? null,
    severity,
    impact,
    confidence,
    evidenceCount: signal.evidenceIds.length,
    kind: signal.kind,
  }
}
