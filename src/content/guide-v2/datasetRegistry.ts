import { VT_SYNC_VISIBLE_TABLE_DEFINITIONS } from "../../features/vt-sync-local/upstream/tableRegistry"

export interface GuideDatasetDefinition {
 id: string
 label: string
 description: string
 categoryIds: readonly string[]
 datasetId?: string
}

export const GUIDE_DATASETS: readonly GuideDatasetDefinition[] = Object.freeze(
 VT_SYNC_VISIBLE_TABLE_DEFINITIONS.map((table) => ({
  id: table.id,
  label: table.label,
  description: table.description,
  categoryIds: table.categoryIds,
  datasetId: table.datasetId,
 })),
)

export const guideDatasetById = (id: string) => GUIDE_DATASETS.find((dataset) => dataset.id === id) ?? null
