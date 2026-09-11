import type { ViewTubeAnomaly } from "./contracts"

export const buildAnomalyBrainContext = (anomalies: ViewTubeAnomaly[], maximum = 8): string => {
 if (!anomalies.length) return "ANOMALY SIGNALS\nNo material anomalies detected in the current canonical scan."
 return [
  "ANOMALY SIGNALS",
  "These are derived observations from VT-SYNC evidence, not causal conclusions.",
  ...anomalies.slice(0, Math.max(1, maximum)).map((anomaly) =>
   [
    `- ${anomaly.kind.toUpperCase()} · ${anomaly.entity || anomaly.datasetId} · ${anomaly.metric}`,
    `current=${anomaly.currentValue}; baseline=${anomaly.baselineValue}; delta=${(anomaly.relativeDelta * 100).toFixed(1)}%; impact=${anomaly.impactScore}; confidence=${anomaly.confidence}`,
    `evidence=${anomaly.evidence.map((entry) => entry.id).join(",")}`,
   ].join(" | "),
  ),
 ].join("\n")
}
