import React, { useMemo } from "react"
import { WidgetShell } from "../WidgetShell"
import { WidgetSection } from "../WidgetPrimitives"
import { Search } from "lucide-react"
import { metricCellValue } from "../../../services/analytics/Selectors"
import { useInitialChannelBootstrap } from "../../../context/InitialChannelBootstrapContext"
import { getVtSyncSnapshot } from "../../../features/vt-sync-local"

const STOP_WORDS = new Set([
 "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "with", "of", "is", "are", "was", "were", "this", "that", "it", "how", "what", "why", "when", "where", "you", "your", "my", "i",
])

export const KeywordEngineWidget = ({
 widget,
 instance,
 editMode,
 onToggleCollapse,
 onCycleSize,
 onCycleHeight,
 onDecSize,
 onDecHeight,
 onRemove,
 data,
}: any) => {
 const common = {
  widget,
  instance,
  editMode,
  canEdit: true,
  onToggleCollapse,
  onCycleSize,
  onCycleHeight,
  onRemove,
  onDecSize,
  onDecHeight,
 }

 const { snapshot: initialBootstrap } = useInitialChannelBootstrap()

 const keywords = useMemo(() => {
  const snapshot = getVtSyncSnapshot()

  const syncRows = snapshot?.videos || []
  const hasViewsInSync = syncRows.length > 0 && typeof syncRows[0]?.metrics?.views === "number"
  const rows = hasViewsInSync ? syncRows : (initialBootstrap?.videos || data.canonicalRows || data.brain?.canonicalRows || [])

  const map = new Map<string, { views: number; count: number }>()

  rows.forEach((row: any) => {
   const originalData = row.originalData || row._originalData || {}
   const title = row.title || row["Video title"] || originalData["Video title"] || ""
   const v = row.metrics || {}
   const vByWindow = row.metricsByWindow?.lifetime || {}
   const views = (typeof vByWindow.views === 'object' ? metricCellValue(vByWindow.views) : Number(vByWindow.views || 0))
     || (typeof v.views === 'object' ? metricCellValue(v.views) : Number(v.views || 0))
     || Number(row.views)
     || Number(row.Views)
     || Number(row.viewCount)
     || Number(row.statistics?.viewCount)
     || Number(originalData.Views)
     || Number(originalData.views)
     || 0

   const words = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
   const uniqueWords = Array.from(new Set(words))

   uniqueWords.forEach((word) => {
    if (typeof word !== "string" || word.length < 3 || STOP_WORDS.has(word)) return
    if (!map.has(word)) map.set(word, { views: 0, count: 0 })
    const stat = map.get(word)!
    stat.views += views
    stat.count += 1
   })
  })

  let entries = Array.from(map.entries())
  let filtered = entries.filter(([_, stat]) => stat.count >= 2)
  if (filtered.length === 0) {
    filtered = entries.filter(([_, stat]) => stat.count >= 1)
  }

  return filtered
   .map(([word, stat]) => ({word, avgViews: Math.round(stat.views / Math.max(1, stat.count)), count: stat.count}))
   .sort((a, b) => b.avgViews - a.avgViews)
   .slice(0, 10)
 }, [data.canonicalRows, data.brain?.canonicalRows, initialBootstrap, data.lastSyncComplete])

 const maxViews = Math.max(...keywords.map((k) => k.avgViews), 1)

 return (
  <WidgetShell {...common} icon={<Search size={22} />}>
   <div
    style={{
     display: "flex",
     flexDirection: "column",
     height: "100%",
     gap: "4px",
     minHeight: 0,
    }}>
    <WidgetSection edge="full" className="keyword-engine-heading">
     <span
      style={{ fontSize: "10px", fontWeight: 900, textTransform: "uppercase" }}>
      Top Keywords
     </span>
     <span
      style={{
       fontSize: "9px",
       fontWeight: 900,
       textTransform: "uppercase",
       opacity: 0.5,
      }}>
      Avg Views
     </span>
    </WidgetSection>

    <div className="keyword-engine-list" aria-label="Keyword engine results">
    {keywords.length === 0 && (
     <div
      style={{
       padding: "20px",
       textAlign: "center",
       fontSize: "12px",
       fontWeight: 700,
       opacity: 0.5,
      }}>
      Not enough data
     </div>
    )}

    {keywords.map((kw) => {
     const widthPct = Math.max((kw.avgViews / maxViews) * 100, 5)
     return (
      <div
       key={kw.word}
       className="keyword-engine-bar">
       <div
       className="keyword-engine-bar-fill"
       style={{
        width: `${widthPct}%`,
       }} />
       <div className="keyword-engine-bar-copy">
        <span>{kw.word}</span>
        <strong>{kw.avgViews.toLocaleString()}</strong>
       </div>
      </div>
     )
    })}
    </div>
   </div>
  </WidgetShell>
 )
}
