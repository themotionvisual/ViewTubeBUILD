import React, { useMemo } from "react"
import { WidgetShell } from "../WidgetShell"
import { PieChart } from "lucide-react"
import { metricCellValue } from "../../../services/analytics/Selectors"
import { useInitialChannelBootstrap } from "../../../context/InitialChannelBootstrapContext"
import { getVtSyncSnapshot } from "../../../features/vt-sync-local"

export const FormatClashWidget = ({ widget, instance, editMode, onToggleCollapse, onCycleSize, onCycleHeight, onDecSize, onDecHeight, onRemove, data }: any) => {
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

 const stats = useMemo(() => {
  const snapshot = getVtSyncSnapshot()
  const syncRows = snapshot?.videos || []
  const hasViewsInSync = syncRows.length > 0 && typeof syncRows[0]?.metrics?.views === "number"
  const rows = hasViewsInSync ? syncRows : (initialBootstrap?.videos || data.canonicalRows || data.brain?.canonicalRows || [])

  const s = {
   shorts: { views: 0, watch: 0, subs: 0, rev: 0 },
   longs: { views: 0, watch: 0, subs: 0, rev: 0 },
  }

  rows.forEach((row: any) => {
   const isShort = row.format === "shorts" || row.duration < 60 || row.duration === "shorts" || row.VideoType === "shorts"
   const target = isShort ? s.shorts : s.longs

   const v = row.metrics || {}
   const vByWindow = row.metricsByWindow?.lifetime || {}

   // Try to get metrics from VT sync, fallback to canonical
   target.views += metricCellValue(vByWindow.views) || metricCellValue(v.views) || Number(row.Views) || 0
   target.watch += metricCellValue(vByWindow.watchTimeHours) || metricCellValue(v.watchHours) || Number(row["Watch time (hours)"]) || 0
   target.subs += metricCellValue(vByWindow.subscribersGained) || metricCellValue(v.subscribersGained) || Number(row.Subscribers) || 0
   target.rev += metricCellValue(vByWindow.estimatedRevenue) || metricCellValue(v.revenue) || Number(row["Your estimated revenue (USD)"]) || 0
  })

  return s
 }, [data.canonicalRows, data.brain?.canonicalRows, initialBootstrap])

  const renderPie = (title: string, shortsVal: number, longsVal: number) => {
    const total = shortsVal + longsVal
    const pct = total > 0 ? (shortsVal / total) * 100 : 0
    const shortsPct = pct.toFixed(1)
    const longsPct = (100 - pct).toFixed(1)

    return (
      <div
        className="tip"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          width: "100%",
          height: "100%",
        }}>
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: `conic-gradient(#FF00FF 0% ${pct}%, #00D2FF ${pct}% 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "none",
            boxShadow: "none",
          }}>
          <div style={{ pointerEvents: "none" }}>
            <span
              style={{
                color: "white",
                fontSize: "27px",
                fontWeight: "1000",
                textTransform: "uppercase",
                textAlign: "center",
                lineHeight: "1",
                WebkitTextStroke: "2px #000",
              }}>
              {title}
            </span>
          </div>
        </div>
        <div className="bub" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "2px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div style={{ width: "8px", height: "8px", background: "#FF00FF", border: "var(--widget-module-stroke, 2px) solid var(--widget-border, #000)" }} />
            <span>SHORTS: {shortsPct}%</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div style={{ width: "8px", height: "8px", background: "#00D2FF", border: "var(--widget-module-stroke, 2px) solid var(--widget-border, #000)" }} />
            <span>LONGS: {longsPct}%</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <WidgetShell {...common} icon={<PieChart size={22} />}>
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          padding: "4px 8px"
        }}>
          <div style={{ fontSize: "9px", fontWeight: 900, textTransform: "uppercase", opacity: 0.4 }}>All Time</div>
        </div>

        {/* Chart Grid */}
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridTemplateRows: "1fr 1fr",
            gap: "5px",
            padding: "5px",
            aspectRatio: "1/1",
            margin: "0 auto",
          }}>
          {renderPie("Views", stats.shorts.views, stats.longs.views)}
          {renderPie("Hours", stats.shorts.watch, stats.longs.watch)}
          {renderPie("Subs", stats.shorts.subs, stats.longs.subs)}
          {renderPie("Rev", stats.shorts.rev, stats.longs.rev)}
        </div>

        {/* Legend */}
        <div
         style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          justifyContent: "center",
          borderTop: "var(--widget-module-stroke, 2px) solid var(--widget-border, #000)",
          paddingTop: "6px",
          marginTop: "4px",
          paddingBottom: "4px",
         }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
           <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: "#FF00FF", border: "var(--widget-module-stroke, 2px) solid var(--widget-border, #000)", flexShrink: 0 }} />
           <span style={{ fontSize: "8px", fontWeight: 900, textTransform: "uppercase" }}>SHORTS</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
           <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: "#00D2FF", border: "var(--widget-module-stroke, 2px) solid var(--widget-border, #000)", flexShrink: 0 }} />
           <span style={{ fontSize: "8px", fontWeight: 900, textTransform: "uppercase" }}>LONGS</span>
          </div>
        </div>
      </div>
    </WidgetShell>
  )
}
