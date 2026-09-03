export type AnomalyKind =
 | "spike"
 | "drop"
 | "new_entity"
 | "share_shift"
 | "distribution_shift"
 | "change_point"

export type AnomalyEvidenceRef = {
 id: string
 datasetId: string
 source: string
 snapshotId: string
 updatedAt?: string
}

export type ViewTubeAnomaly = {
 id: string
 channelId: string | null
 detectedAt: string
 datasetId: string
 family: string
 kind: AnomalyKind
 entity?: string
 metric: string
 currentValue: number
 baselineValue: number
 relativeDelta: number
 surpriseScore: number
 impactScore: number
 confidence: number
 evidence: AnomalyEvidenceRef[]
}

export type CanonicalAnomalyDatasetRows = {
 datasetId: string
 label: string
 status: string
 snapshotId: string
 channelId: string | null
 updatedAt?: string
 sources: string[]
 rows: Array<Record<string, unknown>>
}
