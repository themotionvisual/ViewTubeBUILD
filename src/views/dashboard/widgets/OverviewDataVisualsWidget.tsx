import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { BarChart3 } from "lucide-react"
import { WidgetShell } from "../WidgetShell"
import type { VtSyncSnapshot } from "../../../features/vt-sync-local"
import {
  compileDashboardVtSync,
  loadMergedDashboardSnapshot,
  type DashboardCompiledData,
} from "./dashboardVtSyncCompiler"

/**
 * OverviewDataVisualsWidget — 2×2 grid of channel visuals:
 *
 *   ┌─────────────────────────┬─────────────────────────┐
 *   │ 4 format-dominance      │ Discovery (stacked area │
 *   │ donuts (icons in ring)  │ top 8 traffic sources)  │
 *   ├─────────────────────────┼─────────────────────────┤
 *   │ 3 revenue-source stack  │ Performance (12 bars +  │
 *   │ bars (icons on left)    │ line, views metric)     │
 *   └─────────────────────────┴─────────────────────────┘
 *
 * Data comes exclusively from `dashboardVtSyncCompiler` (a dashboard-scoped
 * distillation of the merged vt-sync snapshot + persisted API rows), so any
 * data-source drift is fixed in one place, never inline here.
 *
 * Tooltips use PortalHoverTooltip which renders into document.body so they
 * escape widget overflow clipping AND rise above the top navigation stacking
 * context — the standard WidgetTooltip is trapped inside the widget frame.
 */

// ── palette ───────────────────────────────────────────────────────────
const DISCOVERY_COLORS = [
  "#FF7F6B", "#FFA85C", "#FFDA47", "#3FEE56",
  "#528FFA", "#A467F4", "#F55EFC", "#FF7AC8",
]
const DONUT_STROKE_A = "#FA618A"
const DONUT_STROKE_B = "#528FFA"
const DONUT_STROKE_C = "#3FEE56"
const BAR_ICON_COLOR = "#050505"
const LINE_COLOR = "#FFDA47"
const BAR_COLOR = DONUT_STROKE_A

// ── portal-based hover tooltip that always escapes the widget frame ──
//
// The stock WidgetTooltip is a `<span class="widget-tooltip">` with an
// absolute-positioned bubble. That works for tooltips that stay inside the
// widget's overflow, but the visuals on the right column of this widget are
// on the widget's right edge — the bubble drifts outside the cell and can be
// clipped by `overflow: hidden` on any ancestor, AND the entire tooltip
// stacks below the top navigation bar (which has its own stacking context
// on the body element that `:has(...)` can't override).
//
// This implementation renders the bubble via `createPortal(document.body)`
// with `position: fixed` and `z-index: 2147483647`, then measures the
// trigger's viewport rect and positions the bubble in one of eight anchor
// slots, choosing the slot that stays inside the viewport. It never gets
// clipped by an ancestor's overflow and always sits above other content.
type PortalTooltipProps = {
  content: React.ReactNode
  children: React.ReactNode
  color?: string
  border?: string
  /** Preferred placement; auto-flipped if it would leave the viewport. */
  placement?: "top" | "bottom" | "left" | "right"
  /** Extra pixels of gap between trigger and bubble. */
  gap?: number
}

const PortalHoverTooltip: React.FC<PortalTooltipProps> = ({
  content,
  children,
  color,
  border,
  placement = "top",
  gap = 8,
}) => {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ top: number; left: number; transform: string }>({
    top: 0,
    left: 0,
    transform: "translate(-50%, -100%)",
  })
  // Bubble is portaled to document.body, so it can't inherit the widget's
  // --widget-color / --widget-border custom props. Resolve them from the
  // trigger's ancestor chain when the tooltip opens so the bubble takes on
  // the host widget's actual color instead of the ink fallback.
  const [resolvedColor, setResolvedColor] = useState<{ surface: string; edge: string }>({
    surface: color || "#528FFA",
    edge: border || "#0f172a",
  })
  const triggerRef = useRef<HTMLSpanElement>(null)
  const bubbleRef = useRef<HTMLDivElement>(null)

  // Reposition every time the tooltip opens (or on scroll while open) so it
  // tracks the trigger even if the underlying layout scrolls / resizes.
  const reposition = React.useCallback(() => {
    const tRect = triggerRef.current?.getBoundingClientRect()
    const bEl = bubbleRef.current
    if (!tRect || !bEl) return
    const bRect = bEl.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight
    const margin = 6

    // Best-fit placement: try preferred first, then rotate through the
    // others until we find one that clears the viewport with `margin` px.
    const candidates = ((): Array<"top" | "bottom" | "left" | "right"> => {
      const order: Array<"top" | "bottom" | "left" | "right"> = ["top", "bottom", "left", "right"]
      return [placement, ...order.filter((p) => p !== placement)]
    })()

    let chosen = candidates[0]
    for (const p of candidates) {
      let top = 0, left = 0
      if (p === "top") { top = tRect.top - bRect.height - gap; left = tRect.left + tRect.width / 2 - bRect.width / 2 }
      else if (p === "bottom") { top = tRect.bottom + gap; left = tRect.left + tRect.width / 2 - bRect.width / 2 }
      else if (p === "left") { top = tRect.top + tRect.height / 2 - bRect.height / 2; left = tRect.left - bRect.width - gap }
      else { top = tRect.top + tRect.height / 2 - bRect.height / 2; left = tRect.right + gap }
      if (top >= margin && left >= margin && top + bRect.height <= vh - margin && left + bRect.width <= vw - margin) {
        chosen = p
        break
      }
    }

    // Compute final coords for the chosen placement, then clamp so the
    // bubble stays fully inside the viewport as a last-resort safety net.
    let top = 0, left = 0
    if (chosen === "top") { top = tRect.top - bRect.height - gap; left = tRect.left + tRect.width / 2 - bRect.width / 2 }
    else if (chosen === "bottom") { top = tRect.bottom + gap; left = tRect.left + tRect.width / 2 - bRect.width / 2 }
    else if (chosen === "left") { top = tRect.top + tRect.height / 2 - bRect.height / 2; left = tRect.left - bRect.width - gap }
    else { top = tRect.top + tRect.height / 2 - bRect.height / 2; left = tRect.right + gap }

    top = Math.max(margin, Math.min(top, vh - bRect.height - margin))
    left = Math.max(margin, Math.min(left, vw - bRect.width - margin))
    setPos({ top, left, transform: "none" })
  }, [placement, gap])

  useLayoutEffect(() => {
    if (!open) return
    // Resolve the widget's actual color from the trigger's ancestor chain
    // — the portaled bubble can't inherit CSS custom properties through
    // document.body, so we compute the value the widget would have used
    // and pass it in as a plain string.
    const trigger = triggerRef.current
    if (trigger) {
      const styles = window.getComputedStyle(trigger)
      const surface = color || styles.getPropertyValue("--widget-color").trim() || "#528FFA"
      const edge = border || styles.getPropertyValue("--widget-border").trim() || "#0f172a"
      setResolvedColor({ surface, edge })
    }
    reposition()
    const raf = requestAnimationFrame(reposition)
    window.addEventListener("scroll", reposition, { passive: true, capture: true })
    window.addEventListener("resize", reposition)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("scroll", reposition, { capture: true } as EventListenerOptions)
      window.removeEventListener("resize", reposition)
    }
  }, [open, reposition, color, border])

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        style={{ display: "block", width: "100%", height: "100%", minWidth: 0, minHeight: 0, cursor: "default" }}
      >
        {children}
      </span>
      {open && typeof document !== "undefined" && createPortal(
        <div
          ref={bubbleRef}
          role="tooltip"
          style={{
            position: "fixed",
            top: pos.top,
            left: pos.left,
            transform: pos.transform,
            zIndex: 2147483647,
            pointerEvents: "none",
            maxWidth: 240,
            padding: "5px 8px",
            border: `2px solid ${resolvedColor.edge}`,
            borderRadius: 4,
            background: resolvedColor.surface,
            color: "#fff",
            fontSize: 10,
            fontWeight: 900,
            lineHeight: 1.25,
            textTransform: "uppercase",
            whiteSpace: "normal",
            boxShadow: "2px 2px 0 rgba(0,0,0,0.18)",
          }}
        >
          {content}
        </div>,
        document.body,
      )}
    </>
  )
}

// ── donut ─────────────────────────────────────────────────────────────
const Donut: React.FC<{
  label: string
  long: number
  shorts: number
  icon: React.ReactNode
}> = ({ label, long, shorts, icon }) => {
  const total = long + shorts
  const longPct = total > 0 ? (long / total) * 100 : 60
  const shortsPct = total > 0 ? (shorts / total) * 100 : 30
  const trailingStart = longPct + shortsPct
  const bg = `conic-gradient(${DONUT_STROKE_A} 0 ${longPct}%, ${DONUT_STROKE_B} ${longPct}% ${trailingStart}%, ${DONUT_STROKE_C} ${trailingStart}% 100%)`
  const tooltipContent = (
    <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 110 }}>
      <strong style={{ fontSize: 9, letterSpacing: "0.06em" }}>{label}</strong>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 9 }}>
        <span style={{ width: 8, height: 8, background: DONUT_STROKE_A, border: "2px solid #fff", borderRadius: 2 }} />
        <span style={{ flex: 1 }}>Long</span>
        <span>{total > 0 ? `${Math.round(longPct)}%` : "—"}</span>
      </span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 9 }}>
        <span style={{ width: 8, height: 8, background: DONUT_STROKE_B, border: "2px solid #fff", borderRadius: 2 }} />
        <span style={{ flex: 1 }}>Shorts</span>
        <span>{total > 0 ? `${Math.round(shortsPct)}%` : "—"}</span>
      </span>
    </div>
  )
  return (
    <PortalHoverTooltip content={tooltipContent} placement="top">
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", minWidth: 0 }}>
        <div style={{ position: "relative", width: "100%", aspectRatio: "1/1", borderRadius: "50%", background: bg }}>
          <div style={{ position: "absolute", inset: "29%", borderRadius: "50%", background: "#fff" }} />
          <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: "29%", aspectRatio: "1/1", display: "grid", placeItems: "center", zIndex: 2 }}>
            <svg viewBox="0 0 24 24" style={{ width: "100%", height: "100%", fill: "none", stroke: BAR_ICON_COLOR, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }}>
              {icon}
            </svg>
          </div>
        </div>
        <span style={{ fontSize: "8px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.04em", color: "#050505", lineHeight: 1 }}>{label}</span>
      </div>
    </PortalHoverTooltip>
  )
}

// ── stacked bar ───────────────────────────────────────────────────────
const StackedBar: React.FC<{
  icon: React.ReactNode
  segments: Array<{ label: string; value: number; color: string }>
  tooltipTitle?: string
}> = ({ icon, segments, tooltipTitle }) => {
  const total = segments.reduce((sum, s) => sum + s.value, 0)
  const withPct = total > 0
    ? segments.map((s) => ({ ...s, pct: (s.value / total) * 100 }))
    : segments.map((s) => ({ ...s, pct: 100 / Math.max(1, segments.length) }))
  const tooltipContent = (
    <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 120 }}>
      {tooltipTitle && <strong style={{ fontSize: 9, letterSpacing: "0.06em" }}>{tooltipTitle}</strong>}
      {withPct.map((s, i) => (
        <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 9, fontWeight: 800 }}>
          <span style={{ width: 8, height: 8, background: s.color, border: "2px solid #fff", borderRadius: 2 }} />
          <span style={{ flex: 1 }}>{s.label}</span>
          <span>{total > 0 ? `${Math.round(s.pct)}%` : "—"}</span>
        </span>
      ))}
    </div>
  )
  const bar = (
    <div style={{ position: "relative" }}>
      <div style={{ position: "absolute", left: "8px", top: 0, height: "100%", display: "flex", alignItems: "center", zIndex: 2, pointerEvents: "none" }}>
        <svg viewBox="0 0 24 24" style={{ width: "18px", height: "18px", fill: "none", stroke: BAR_ICON_COLOR, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }}>
          {icon}
        </svg>
      </div>
      <div style={{ display: "flex", height: "28px", borderRadius: "3px", overflow: "hidden" }}>
        {withPct.map((seg, i) => (
          <div key={i} style={{ width: `${seg.pct}%`, background: seg.color, display: "flex", alignItems: "center", justifyContent: "center", paddingLeft: i === 0 ? "28px" : "0", overflow: "hidden" }}>
            <span style={{ fontSize: "7px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.01em", whiteSpace: "nowrap", color: "#050505" }}>{seg.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
  return <PortalHoverTooltip content={tooltipContent} placement="top">{bar}</PortalHoverTooltip>
}

// ── discovery (stacked-area or lifetime bands) ────────────────────────
//
// Given the dashboard-compiled traffic mix, this either renders:
//
//   (a) a proper stacked-area SVG when there are ≥ 2 daily buckets, OR
//   (b) full-width lifetime bands proportional to each source's share
//       when data is too sparse for a meaningful time series.
//
// Both paths guarantee the cell is fully filled with source colors.
const DiscoveryAreaChart: React.FC<{
  mix: DashboardCompiledData["trafficMix"]
}> = ({ mix }) => {
  const { buckets, sources, sourceLifetimeShares } = mix

  const tooltipContent = (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 160 }}>
      <strong style={{ fontSize: 9, letterSpacing: "0.06em" }}>Discovery · Top {sources.length}</strong>
      {sources.map((s, i) => {
        const pct = Math.round(sourceLifetimeShares[s] || 0)
        return (
          <span key={s} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 9, fontWeight: 800 }}>
            <span style={{ width: 8, height: 8, background: DISCOVERY_COLORS[i % DISCOVERY_COLORS.length], border: "2px solid #fff", borderRadius: 2 }} />
            <span style={{ flex: 1 }}>{s}</span>
            <span>{pct}%</span>
          </span>
        )
      })}
    </div>
  )

  // Empty state — placeholder rainbow so the cell is never blank.
  if (sources.length === 0) {
    return (
      <PortalHoverTooltip content={<span style={{ fontSize: 9 }}>Awaiting traffic sync</span>} placement="left">
        <div style={{
          position: "relative", width: "100%", height: "100%", minHeight: 0, borderRadius: 3, overflow: "hidden",
          background: `linear-gradient(to bottom, ${DISCOVERY_COLORS.map((c, i) => `${c} ${(i * 100) / 8}% ${((i + 1) * 100) / 8}%`).join(", ")})`,
        }}>
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "#050505", fontSize: "8px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.06em", textShadow: "0 0 6px rgba(255,255,255,0.6)" }}>
            Awaiting Traffic Sync
          </div>
        </div>
      </PortalHoverTooltip>
    )
  }

  // Base fill: horizontal lifetime bands. Always renders, always fills.
  const baseBands = (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
      {sources.map((s, i) => (
        <div key={"band-" + s} style={{
          flex: Math.max(0.001, sourceLifetimeShares[s] || 0),
          minHeight: 0,
          background: DISCOVERY_COLORS[i % DISCOVERY_COLORS.length],
        }} />
      ))}
    </div>
  )

  // Stacked-area overlay: only rendered when we have enough daily buckets
  // for a per-day contour to be meaningful. Even if this fails or renders
  // short, the base bands underneath still fill the cell.
  let areaOverlay: React.ReactNode = null
  if (buckets.length >= 2) {
    const W = 100
    const H = 100
    const step = W / (buckets.length - 1)
    const cumRows: number[][] = buckets.map((b) => {
      let acc = 0
      return sources.map((s) => (acc += b.shares[s] || 0))
    })
    const areas = sources.map((source, sIdx) => {
      const topLine = sIdx === 0 ? new Array(buckets.length).fill(0) : cumRows.map((row) => row[sIdx - 1])
      const botLine = cumRows.map((row) => row[sIdx])
      const forward = botLine.map((y, i) => `${(i * step).toFixed(2)},${((y / 100) * H).toFixed(2)}`).join(" L ")
      const backward = [...topLine].reverse().map((y, i) => `${((buckets.length - 1 - i) * step).toFixed(2)},${((y / 100) * H).toFixed(2)}`).join(" L ")
      return { source, path: `M ${forward} L ${backward} Z`, color: DISCOVERY_COLORS[sIdx % DISCOVERY_COLORS.length] }
    })
    areaOverlay = (
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", pointerEvents: "none" }}>
        {areas.map((a) => (<path key={a.source} d={a.path} fill={a.color} />))}
      </svg>
    )
  }

  return (
    <PortalHoverTooltip content={tooltipContent} placement="left">
      <div style={{ position: "relative", width: "100%", height: "100%", minHeight: 0, borderRadius: 3, overflow: "hidden" }}>
        {baseBands}
        {areaOverlay}
      </div>
    </PortalHoverTooltip>
  )
}

// ── performance (12 monthly buckets, bars + cumulative line) ──────────
const PerformanceChart: React.FC<{
  monthlyViews: DashboardCompiledData["monthlyViews"]
}> = ({ monthlyViews }) => {
  const buckets = monthlyViews
  const totalViews = buckets.reduce((sum, b) => sum + b.value, 0)
  const avgViews = buckets.length > 0 ? totalViews / buckets.length : 0
  const barMax = Math.max(1, ...buckets.map((b) => b.value))
  const cumulative: number[] = []
  {
    let acc = 0
    for (const b of buckets) { acc += b.value; cumulative.push(acc) }
  }
  const cumMax = Math.max(1, cumulative[cumulative.length - 1] || 1)

  // Inset both ends so 5px dots aren't clipped by the container's edges.
  const xInsetPct = 4
  const xRangePct = 100 - xInsetPct * 2
  const linePoints = buckets.map((b, i) => {
    const xPct = buckets.length > 1
      ? xInsetPct + (i / (buckets.length - 1)) * xRangePct
      : 50
    const yPct = 100 - (cumulative[i] / cumMax) * 100
    return { xPct, yPct, cumValue: cumulative[i], value: b.value, label: b.label }
  })
  const linePath = linePoints.length > 0
    ? linePoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.xPct.toFixed(2)} ${p.yPct.toFixed(2)}`).join(" ")
    : ""

  const tooltipContent = (
    <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 180 }}>
      <strong style={{ fontSize: 9, letterSpacing: "0.06em" }}>Performance · Views · 12 mo</strong>
      <span style={{ fontSize: 9 }}>Combined · {totalViews.toLocaleString()}</span>
      <span style={{ fontSize: 9 }}>Avg / mo · {Math.round(avgViews).toLocaleString()}</span>
      {buckets.length > 0 && (
        <span style={{ fontSize: 9 }}>Peak · {Math.round(barMax).toLocaleString()}</span>
      )}
    </div>
  )

  const chart = (
    <div style={{ position: "relative", width: "100%", height: "100%", minHeight: 0, borderRadius: 3, overflow: "hidden" }}>
      {buckets.length === 0 ? (
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "#050505", fontSize: 8, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Awaiting Daily Sync
        </div>
      ) : (
        <>
          {/* Bars aligned to the same x-percent slots as the line dots. */}
          {buckets.map((b, i) => {
            const xPct = linePoints[i]?.xPct ?? 50
            const barWidthPct = Math.min(xRangePct / Math.max(1, buckets.length) * 0.72, 8)
            const barHeightPct = (b.value / barMax) * 100
            return (
              <div key={"bar-" + b.label + i} style={{
                position: "absolute",
                left: `${xPct}%`,
                bottom: 0,
                width: `${barWidthPct}%`,
                height: `${barHeightPct}%`,
                transform: "translateX(-50%)",
                background: BAR_COLOR,
                borderRadius: "1.5px 1.5px 0 0",
              }} />
            )
          })}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", pointerEvents: "none" }}>
            <path d={linePath} stroke={LINE_COLOR} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          </svg>
          {linePoints.map((p, i) => (
            <div key={"dot-" + i} style={{
              position: "absolute",
              left: `${p.xPct}%`,
              top: `${p.yPct}%`,
              width: 5,
              height: 5,
              transform: "translate(-50%, -50%)",
              borderRadius: "50%",
              background: LINE_COLOR,
              border: "1px solid var(--widget-border, #000)",
              boxSizing: "border-box",
            }} />
          ))}
        </>
      )}
    </div>
  )
  return <PortalHoverTooltip content={tooltipContent} placement="left">{chart}</PortalHoverTooltip>
}

// ── icons ─────────────────────────────────────────────────────────────
const IconEye = <><path d="M2.5 12s3.5-5 9.5-5 9.5 5 9.5 5-3.5 5-9.5 5-9.5-5-9.5-5Z"/><circle cx="12" cy="12" r="2.7"/></>
const IconSubs = <><circle cx="12" cy="7.2" r="3.2"/><path d="M5.3 20c0-4.1 2.8-6.3 6.7-6.3s6.7 2.2 6.7 6.3"/></>
const IconHours = <><circle cx="12" cy="12" r="8"/><path d="M12 7.2v5l3.2 2"/></>
const IconDollar = <><path d="M15 6.5c-.8-.8-1.8-1.2-3.1-1.2-1.9 0-3.1.8-3.1 2.2 0 3.2 6.5 1.4 6.5 5.2 0 1.7-1.4 2.8-3.5 2.8-1.6 0-2.9-.5-3.8-1.5"/><path d="M12 3v18"/></>
const IconCoin = <><circle cx="12" cy="12" r="8"/><path d="M14.8 8.1c-.7-.7-1.6-1.1-2.8-1.1-1.6 0-2.8.7-2.8 1.9 0 2.8 6 1.3 6 4.7 0 1.5-1.3 2.5-3.2 2.5-1.4 0-2.6-.5-3.4-1.3"/><path d="M12 5v14"/></>
const IconFormat = <><rect x="7" y="4" width="10" height="17" rx="2"/><circle cx="12" cy="8" r=".5"/><circle cx="12" cy="12" r=".5"/><circle cx="12" cy="16" r=".5"/></>
const IconCal = <><rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M3.5 9h17M8 3v3M16 3v3"/></>

export const OverviewDataVisualsWidget: React.FC<any> = ({
  widget,
  instance,
  editMode,
  canEdit,
  onToggleCollapse,
  onCycleSize,
  onDecSize,
  onCycleHeight,
  onDecHeight,
  onRemove,
}) => {
  const common = {
    widget,
    instance,
    editMode,
    canEdit,
    onToggleCollapse,
    onCycleSize,
    onDecSize,
    onCycleHeight,
    onDecHeight,
    onRemove,
  }

  const [snapshot, setSnapshot] = useState<VtSyncSnapshot | null>(null)
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const merged = await loadMergedDashboardSnapshot()
      if (!cancelled) setSnapshot(merged)
    })()
    return () => { cancelled = true }
  }, [])

  const compiled = useMemo(
    () => snapshot ? compileDashboardVtSync(snapshot) : null,
    [snapshot],
  )

  const bars = useMemo(() => {
    if (!compiled) return []
    const totals = compiled.formatTotals
    const { adTotal, premiumTotal, topDays } = compiled.revenue
    return [
      {
        icon: IconDollar,
        segments: (adTotal + premiumTotal > 0)
          ? [
              { label: "Ads", value: adTotal, color: "#528FFA" },
              { label: "Premium", value: premiumTotal, color: "#FA618A" },
            ]
          : [{ label: "Ads 60%", value: 60, color: "#528FFA" }, { label: "Premium 40%", value: 40, color: "#FA618A" }],
      },
      {
        icon: IconFormat,
        segments: (() => {
          const long = totals.revenue.long ?? 0
          const shorts = totals.revenue.shorts ?? 0
          return (long + shorts > 0)
            ? [
                { label: "Long", value: long, color: "#4EE4BE" },
                { label: "Shorts", value: shorts, color: "#FFA85C" },
              ]
            : [{ label: "Long 55%", value: 55, color: "#4EE4BE" }, { label: "Shorts 45%", value: 45, color: "#FFA85C" }]
        })(),
      },
      {
        icon: IconCal,
        segments: topDays.length > 0
          ? topDays.map((d, i) => ({
              label: d.day,
              value: d.total,
              color: ["#528FFA", "#FA618A", "#C0F240", "#FFA85C", "#4EE4BE"][i] || "#eee",
            }))
          : [{ label: "No data", value: 1, color: "#eee" }],
      },
    ]
  }, [compiled])

  const donutTotals = compiled?.formatTotals

  return (
    <WidgetShell {...common} icon={<BarChart3 size={22} />} contentLayout="flush">
      <div
        className="vt-widget__body"
        data-cols={4}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gridTemplateRows: "1fr 1fr",
          gap: "8px",
          padding: "8px",
          height: "100%",
          minHeight: 0,
          minWidth: 0,
        }}
      >
        {/* Col A · Row 1 — 4 format-dominance donuts */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "4px", alignItems: "center", minWidth: 0, minHeight: 0 }}>
          <Donut label="Views" long={donutTotals?.views.long ?? 0} shorts={donutTotals?.views.shorts ?? 0} icon={IconEye} />
          <Donut label="Subs"  long={donutTotals?.subscribersGained.long ?? 0} shorts={donutTotals?.subscribersGained.shorts ?? 0} icon={IconSubs} />
          <Donut label="Hours" long={donutTotals?.watchHours.long ?? 0} shorts={donutTotals?.watchHours.shorts ?? 0} icon={IconHours} />
          <Donut label="Rev"   long={donutTotals?.revenue.long ?? 0} shorts={donutTotals?.revenue.shorts ?? 0} icon={IconCoin} />
        </div>

        {/* Col B · Row 1 — Discovery stacked area */}
        <DiscoveryAreaChart mix={compiled?.trafficMix ?? { buckets: [], sources: [], sourceLifetimeShares: {} }} />

        {/* Col A · Row 2 — 3 revenue-source stacked bars */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0, minHeight: 0 }}>
          {bars.map((b, i) => (
            <StackedBar key={i} icon={b.icon} segments={b.segments} />
          ))}
        </div>

        {/* Col B · Row 2 — Performance (12 monthly buckets, views) */}
        <PerformanceChart monthlyViews={compiled?.monthlyViews ?? []} />
      </div>
    </WidgetShell>
  )
}
