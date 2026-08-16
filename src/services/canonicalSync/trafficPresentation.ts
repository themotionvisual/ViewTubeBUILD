import type {
 CanonicalTrafficCoverageSummary,
 CanonicalTrafficDataset,
 CanonicalTrafficDiagnosticEntry,
 CanonicalTrafficDictionary,
 CanonicalTrafficRow,
 CanonicalTrafficVisualDataset,
} from "./contracts"

const numberValue = (value: number | null | undefined): number =>
 typeof value === "number" && Number.isFinite(value) ? value : 0

export const buildCanonicalTrafficDictionary = (
 rows: CanonicalTrafficRow[],
 diagnostics: CanonicalTrafficDiagnosticEntry[],
): CanonicalTrafficDictionary => {
 const trafficSourceTypes: Record<string, string> = {}
 const trafficSourceDetails: Record<string, string> = {}
 const metricKeys = new Set<string>()
 const provenanceLabels = new Set<string>()
 rows.forEach((row) => {
  trafficSourceTypes[row.trafficSourceType] = row.sourceLabel || row.trafficSourceType
  if (row.trafficSourceDetail) {
   trafficSourceDetails[row.trafficSourceDetail] = row.sourceTitle || row.trafficSourceDetail
  }
  Object.keys(row.metrics).forEach((metricKey) => metricKeys.add(metricKey))
  provenanceLabels.add(row.source)
 })
 diagnostics.forEach((entry) => provenanceLabels.add(entry.source))
 return {
  trafficSourceTypes,
  trafficSourceDetails,
  metricKeys: Array.from(metricKeys).sort(),
  provenanceLabels: Array.from(provenanceLabels).sort(),
 }
}

export const buildCanonicalTrafficCoverageSummary = (
 rows: CanonicalTrafficRow[],
 diagnostics: CanonicalTrafficDiagnosticEntry[],
): CanonicalTrafficCoverageSummary => {
 const sources: Record<string, number> = {}
 const windows: Record<string, number> = {}
 rows.forEach((row) => {
  sources[row.source] = (sources[row.source] || 0) + 1
  windows[row.window] = (windows[row.window] || 0) + 1
 })
 return {
  totalRows: rows.length,
  summaryRows: rows.filter((row) => row.datasetKind === "traffic_summary").length,
  detailRows: rows.filter((row) => row.datasetKind === "traffic_detail").length,
  dailyRows: rows.filter((row) => row.datasetKind === "traffic_daily").length,
  videoRows: rows.filter((row) => row.datasetKind === "traffic_video").length,
  reportingRows: rows.filter((row) => row.datasetKind === "traffic_reporting_bulk").length,
  playbackLocationRows: rows.filter((row) =>
   row.datasetKind === "traffic_playback_location" ||
   row.datasetKind === "traffic_playback_location_daily"
  ).length,
  diagnosticCount: diagnostics.length,
  skippedCsvMembers: diagnostics.filter((entry) => entry.code === "traffic_csv_member_skipped")
   .length,
  sources,
  windows,
 }
}

export const buildCanonicalTrafficDatasetFromRows = (
 rows: CanonicalTrafficRow[],
 diagnostics: CanonicalTrafficDiagnosticEntry[],
): CanonicalTrafficDataset => {
 const summaryRows = rows.filter((row) => row.datasetKind === "traffic_summary")
 const detailRows = rows.filter((row) => row.datasetKind === "traffic_detail")
 const dailyRows = rows.filter((row) => row.datasetKind === "traffic_daily")
 const videoRows = rows.filter((row) => row.datasetKind === "traffic_video")
 const reportingRows = rows.filter((row) => row.datasetKind === "traffic_reporting_bulk")
 const playbackLocationRows = rows.filter((row) =>
  row.datasetKind === "traffic_playback_location" ||
  row.datasetKind === "traffic_playback_location_daily"
 )
 const dictionary = buildCanonicalTrafficDictionary(rows, diagnostics)
 const coverage = buildCanonicalTrafficCoverageSummary(rows, diagnostics)
 return {
  rows,
  summaryRows,
  detailRows,
  dailyRows,
  videoRows,
  reportingRows,
  playbackLocationRows,
  diagnostics,
  dictionary,
  coverage,
 }
}

export const buildCanonicalTrafficVisualDatasetFromRows = (
 rows: CanonicalTrafficRow[],
 dictionary: CanonicalTrafficDictionary,
): CanonicalTrafficVisualDataset => {
 const sourceMixMap = new Map<string, { views: number; watchHours: number }>()
 rows
  .filter((row) => row.datasetKind === "traffic_summary")
  .forEach((row) => {
   const current = sourceMixMap.get(row.trafficSourceType) || { views: 0, watchHours: 0 }
   current.views += numberValue(row.metrics.views)
   current.watchHours += numberValue(row.metrics.watchHours)
   sourceMixMap.set(row.trafficSourceType, current)
  })

 const dailySeries = rows
  .filter((row) => row.datasetKind === "traffic_daily" && row.date)
  .map((row) => ({
   date: row.date || "",
   trafficSourceType: row.trafficSourceType,
   label: dictionary.trafficSourceTypes[row.trafficSourceType] || row.trafficSourceType,
   views: numberValue(row.metrics.views),
   watchHours: numberValue(row.metrics.watchHours),
  }))
  .sort((left, right) => left.date.localeCompare(right.date))

 const comparisonMap = new Map<string, { analyticsViews: number; reportingViews: number; csvViews: number }>()
 rows.forEach((row) => {
  const current = comparisonMap.get(row.trafficSourceType) || {
   analyticsViews: 0,
   reportingViews: 0,
   csvViews: 0,
  }
  const views = numberValue(row.metrics.views)
  if (row.source === "analytics_api") current.analyticsViews += views
  if (row.source === "reporting_api") current.reportingViews += views
  if (row.source === "csv") current.csvViews += views
  comparisonMap.set(row.trafficSourceType, current)
 })

 return {
  sourceMix: Array.from(sourceMixMap.entries())
   .map(([trafficSourceType, metrics]) => ({
    trafficSourceType,
    label: dictionary.trafficSourceTypes[trafficSourceType] || trafficSourceType,
    views: metrics.views,
    watchHours: metrics.watchHours,
   }))
   .sort((left, right) => right.views - left.views),
  dailySeries,
  comparison: Array.from(comparisonMap.entries())
   .map(([trafficSourceType, metrics]) => ({
    trafficSourceType,
    ...metrics,
   }))
   .sort((left, right) => {
    const leftTotal = left.analyticsViews + left.reportingViews + left.csvViews
    const rightTotal = right.analyticsViews + right.reportingViews + right.csvViews
    return rightTotal - leftTotal
   }),
 }
}
