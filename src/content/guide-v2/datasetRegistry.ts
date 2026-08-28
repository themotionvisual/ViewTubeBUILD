import { VT_SYNC_VISIBLE_TABLE_DEFINITIONS } from "../../features/vt-sync-local/upstream/tableRegistry"

export interface GuideDatasetDefinition {
 id: string
 label: string
 description: string
 categoryIds: readonly string[]
 canonicalDatasetId: string
 syncUnitId?: string
 exportName: string
 columnCount: number
 metricColumnCount: number
}

export const GUIDE_DATASETS: readonly GuideDatasetDefinition[] = Object.freeze(
 VT_SYNC_VISIBLE_TABLE_DEFINITIONS.map((table) => ({
  id: table.id,
  label: table.label,
  description: table.description,
  categoryIds: table.categoryIds,
  canonicalDatasetId: table.performanceHubDatasetId,
  syncUnitId: table.syncUnitId,
  exportName: table.exportName,
  columnCount: table.columns.length,
  metricColumnCount: table.columns.filter((column) => column.semanticRole === "metric").length,
 })),
)

export const guideDatasetById = (id: string) => GUIDE_DATASETS.find((dataset) => dataset.id === id) ?? null
