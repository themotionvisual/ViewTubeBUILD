import fs from 'fs'
import path from 'path'

// 1. Update TubeExplorerVisualModules.tsx
const p1 = '/Users/cwb/Downloads/viewtube/viewtubeX/src/components/TubeExplorerVisualModules.tsx'
let code1 = fs.readFileSync(p1, 'utf-8')

code1 = code1.replace('csvFiles?: CsvFileWithTag[]\n  collapsible?: boolean', 'csvFiles?: CsvFileWithTag[]\n  trafficRows?: any[]\n  geographyRows?: any[]\n  collapsible?: boolean')

code1 = code1.replace(
  '() => buildTubeExplorerVisualData(props.data, props.csvFiles || [])',
  '() => buildTubeExplorerVisualData(props.data, props.csvFiles || [], props.trafficRows || [], props.geographyRows || [])'
)

code1 = code1.replace(
  'createModule("TITLE WORD NETWORK", "TITLE TOKEN NETWORK", (d) => <TitleWordNetworkRenderer dataset={d} />, { color: "#CCFF00", height: 420 })',
  'createModule("TITLE WORD NETWORK", "TITLE TOKEN NETWORK", (d) => <TitleWordNetworkRenderer dataset={d} />, { color: "#CCFF00", height: 420, flushShell: true })'
)

code1 = code1.replace(
  'createModule("CLOCK RADIAL BURST", "UPLOAD DAY BURST"',
  'createModule("CLOCK RADIAL BURST", "TRAFFIC SOURCE BURST"'
)

// Also add Subtitle to TitleWordNetworkRenderer
code1 = code1.replace(
  `  <ExplorerCanvas\n   footerLeft={\n    <>\n     <InsightBadge label="Personal Insight" />\n     <span className="text-[11px] font-medium leading-5 text-white/85">\n      Words that frequently appear together are pulled into clusters. Node size represents the total view volume associated with titles containing that word.\n     </span>\n    </>\n   }>`,
  `  <ExplorerCanvas\n   footerLeft={\n    <>\n     <InsightBadge label="Personal Insight" />\n     <span className="text-[11px] font-medium leading-5 text-white/85">\n      Words that frequently appear together are pulled into clusters. Node size represents the total view volume associated with titles containing that word.\n     </span>\n    </>\n   }>\n   <div className="absolute top-4 left-6 pointer-events-none">\n    <h3 className="text-2xl font-[1000] text-white tracking-tight uppercase">Title Word Network</h3>\n    <p className="text-[11px] font-black tracking-[0.14em] text-[#CCFF00] uppercase mt-1">Title Token Network Visualizer</p>\n   </div>`
)

fs.writeFileSync(p1, code1)

// 2. Update tubeExplorerVisualData.ts
const p2 = '/Users/cwb/Downloads/viewtube/viewtubeX/src/components/tubeExplorerVisualData.ts'
let code2 = fs.readFileSync(p2, 'utf-8')

code2 = code2.replace(
  `export const buildTubeExplorerVisualData = (
 rows: CanonicalVideoRow[],
 csvFiles: CsvFileWithTag[] = [],
): TubeExplorerVisualDataset => {
 const videos = rows.map(toVideoPoint)
 const traffic = buildTrafficRows(csvFiles)
 const geography = buildGeoRows(csvFiles)`,
  `export const buildTubeExplorerVisualData = (
 rows: CanonicalVideoRow[],
 csvFiles: CsvFileWithTag[] = [],
 trafficRows: any[] = [],
 geographyRows: any[] = []
): TubeExplorerVisualDataset => {
 const videos = rows.map(toVideoPoint)
 const trafficMap = new Map<string, TubeExplorerTrafficPoint>()
 const traffic = buildTrafficRows(csvFiles)
 for (const r of traffic) {
   trafficMap.set(r.sourceType + "::" + (r.sourceDetail || r.sourceTitle), r)
 }
 for (const r of trafficRows) {
   const st = String(r.trafficSourceType || "Unknown")
   const sd = String(r.trafficSourceDetail || "")
   const key = st + "::" + sd
   const existing = trafficMap.get(key)
   if (existing) {
     existing.views += r.metrics.views?.value || 0
     existing.watchHours += r.metrics.watchHours?.value || 0
     existing.engagedViews += r.metrics.engagedViews?.value || 0
   } else {
     trafficMap.set(key, {
       sourceType: st,
       sourceDetail: sd,
       sourceTitle: String(r.sourceTitle || r.sourceLabel || sd || st),
       views: r.metrics.views?.value || 0,
       watchHours: r.metrics.watchHours?.value || 0,
       engagedViews: r.metrics.engagedViews?.value || 0,
       avp: 0, impressions: r.metrics.impressions?.value || 0, ctr: 0,
       rowCount: 1, sourceOrigin: "cache"
     })
   }
 }
 const finalTraffic = [...trafficMap.values()].sort((a,b) => b.views - a.views)

 const geoMap = new Map<string, TubeExplorerGeoPoint>()
 const geography = buildGeoRows(csvFiles)
 for (const r of geography) {
   geoMap.set(r.label, r)
 }
 for (const r of geographyRows) {
   const label = String(r.country || r.province || r.city || r.geography || "Unknown")
   const existing = geoMap.get(label)
   if (existing) {
     existing.views += r.metrics.views?.value || 0
     existing.watchHours += r.metrics.watchHours?.value || 0
   } else {
     geoMap.set(label, {
       label,
       regionType: r.city ? "city" : r.province ? "state" : "country",
       views: r.metrics.views?.value || 0,
       watchHours: r.metrics.watchHours?.value || 0,
       engagedViews: r.metrics.engagedViews?.value || 0,
       subscribersGained: r.metrics.subscribersGained?.value || 0,
       revenue: r.metrics.revenue?.value || 0,
       rowCount: 1, sourceOrigin: "cache"
     })
   }
 }
 const finalGeography = [...geoMap.values()].sort((a,b) => b.views - a.views)`
)

// Update the return statement references
code2 = code2.replace(/traffic: traffic/g, 'traffic: finalTraffic')
code2 = code2.replace(/traffic,/g, 'traffic: finalTraffic,')
code2 = code2.replace(/geography: geography/g, 'geography: finalGeography')
code2 = code2.replace(/geography,/g, 'geography: finalGeography,')

fs.writeFileSync(p2, code2)

// 3. Update VtSyncDataVisualsToolbox.tsx
const p3 = '/Users/cwb/Downloads/viewtube/viewtubeX/src/features/vt-sync-local/shell/VtSyncDataVisualsToolbox.tsx'
let code3 = fs.readFileSync(p3, 'utf-8')

code3 = code3.replace(
  ` const moduleProps: TubeExplorerVisualProps = {
  data: visualData.rows,
  csvFiles: visualData.csvFiles,
 }`,
  ` const moduleProps: TubeExplorerVisualProps = {
  data: visualData.rows,
  csvFiles: visualData.csvFiles,
  trafficRows: visualData.canonicalContext.trafficRows,
  geographyRows: visualData.canonicalContext.geographyRows,
 }`
)

fs.writeFileSync(p3, code3)
