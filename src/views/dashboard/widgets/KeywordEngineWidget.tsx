import React, { useMemo } from "react"
import { WidgetShell } from "../WidgetShell"
import { Search } from "lucide-react"
import { metricCellValue } from "../../../services/analyticsSelectors"

const STOP_WORDS = new Set([
 "the",
 "a",
 "an",
 "and",
 "or",
 "but",
 "in",
 "on",
 "with",
 "for",
 "to",
 "of",
 "from",
 "at",
 "by",
 "is",
 "are",
 "was",
 "were",
 "this",
 "that",
 "it",
 "as",
 "be",
 "how",
 "what",
 "why",
])

export const KeywordEngineWidget = ({
 widget,
 instance,
 editMode,
 onToggleCollapse,
 onCycleSize,
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
  onRemove,
 }

 const keywords = useMemo(() => {
  const rows = data.canonicalRows || []
  const map = new Map<string, { views: number; count: number }>()

  rows.forEach((row: any) => {
   const title = row.title || ""
   const views = metricCellValue(row.metrics?.views) || 0

   const words = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
   const uniqueWords = Array.from(new Set(words)) // count each word max once per video

   uniqueWords.forEach((word) => {
    if (word.length < 3 || STOP_WORDS.has(word)) return
    if (!map.has(word)) map.set(word, { views: 0, count: 0 })
    const stat = map.get(word)!
    stat.views += views
    stat.count += 1
   })
  })

  const list = Array.from(map.entries())
   .filter(([_, stat]) => stat.count > 1) // Must be used in >1 video to avoid 1-hit wonder skew
   .map(([word, stat]) => ({
    word,
    avgViews: Math.round(stat.views / stat.count),
    count: stat.count,
   }))
   .sort((a, b) => b.avgViews - a.avgViews)
   .slice(0, 10)

  return list
 }, [data.canonicalRows])

 const maxViews = Math.max(...keywords.map((k) => k.avgViews), 1)

 return (
  <WidgetShell {...common} icon={<Search size={22} />}>
   <div
    style={{
     display: "flex",
     flexDirection: "column",
     height: "100%",
     gap: "4px",
     overflowY: "auto",
     paddingRight: "4px",
    }}>
    <div
     style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
      borderBottom: "3px solid #000",
      paddingBottom: "4px",
      marginBottom: "4px",
     }}>
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
    </div>

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

    {keywords.map((kw, i) => {
     const widthPct = Math.max((kw.avgViews / maxViews) * 100, 5)
     return (
      <div
       key={kw.word}
       style={{
        display: "flex",
        height: "26px",
        width: "100%",
        background: "#E5F7D3",
        borderRadius: "24px",
        border: "1px solid rgba(0,0,0,0.1)",
        overflow: "hidden",
       }}>
       <div
        style={{
         width: `${widthPct}%`,
         minWidth: "fit-content",
         height: "100%",
         background: "#4FFF5B",
         borderRadius: "24px",
         display: "flex",
         justifyContent: "space-between",
         alignItems: "center",
         padding: "0 10px",
         gap: "12px",
        }}>
        <div
         style={{
          display: "flex",
          alignItems: "center",
          fontSize: "11px",
          fontWeight: 900,
          textTransform: "uppercase",
          color: "#000",
          whiteSpace: "nowrap",
         }}>
         <span>{kw.word}</span>
        </div>
        <div style={{ fontSize: "11px", fontWeight: 1000, color: "#000" }}>
         {kw.avgViews.toLocaleString()}
        </div>
       </div>
      </div>
     )
    })}
   </div>
  </WidgetShell>
 )
}
