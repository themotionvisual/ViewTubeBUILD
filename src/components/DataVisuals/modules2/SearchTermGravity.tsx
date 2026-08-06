/**
 * Search Term Gravity Map — Data Visuals 2 port of 07-SearchTermGravity.tsx.
 * The source's fixed bubble placements are preserved so the "gravity" of the
 * layout stays intact; the term text and stats hook onto the top-N search
 * terms from the active VT-Sync snapshot instead of the demo `SEARCH_TERMS`.
 */

import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import type { TubeExplorerVisualProps } from "../../TubeExplorerVisualModules"
import { ChartModule, LegBubbles, SlabControl, type Stat } from "../ChartModule"
import { useVt2Theme } from "./theme"
import { flattenSearchTermsForVt2, type Vt2SearchTermRow } from "./dataBridge"

type Placement = { x: number; y: number; r: number; color: string }

const buildPlacements = (hues: string[]): Placement[] => {
  const h = hues
  // Same coordinates as the source — the layout communicates gravity through
  // proximity rather than any data-driven positioning.
  return [
    { x: 400, y: 200, r: 52, color: h[3] },
    { x: 270, y: 160, r: 44, color: h[2] },
    { x: 540, y: 155, r: 40, color: h[0] },
    { x: 180, y: 240, r: 38, color: h[1] },
    { x: 620, y: 220, r: 36, color: h[4] },
    { x: 310, y: 295, r: 34, color: h[5] },
    { x: 500, y: 290, r: 32, color: h[1] },
    { x: 160, y: 320, r: 30, color: h[2] },
    { x: 650, y: 300, r: 28, color: h[0] },
    { x: 380, y: 340, r: 26, color: h[5] },
    { x: 240, y: 355, r: 24, color: h[4] },
    { x: 530, y: 355, r: 22, color: h[1] },
    { x: 680, y: 155, r: 20, color: h[5] },
    { x: 120, y: 185, r: 18, color: h[1] },
    { x: 700, y: 340, r: 16, color: h[2] },
    { x: 420,  y: 95, r: 15, color: h[3] },
    { x: 590,  y: 95, r: 13, color: h[2] },
    { x: 135, y: 120, r: 12, color: h[0] },
  ]
}

const COUNTS = [8, 12, 15, 18]
const TYPES = ["TOP SEARCHES", "ALL SEARCHES"] as const
const METRICS = ["VIEWS", "IMPRESSIONS", "WATCH MIN"] as const

type Metric = (typeof METRICS)[number]
type TypeChoice = (typeof TYPES)[number]

export const SearchTermGravityModule: React.FC<TubeExplorerVisualProps> = ({ data, trafficRows }) => {
  const { palette } = useVt2Theme()
  const [hovered, setHovered] = useState<number | null>(null)
  const [count, setCount] = useState<number>(18)
  const [vizType, setVizType] = useState<TypeChoice>("TOP SEARCHES")
  const [metric, setMetric] = useState<Metric>("VIEWS")

  const terms = useMemo<Vt2SearchTermRow[]>(
    () => flattenSearchTermsForVt2(trafficRows ?? [], data ?? []),
    [trafficRows, data],
  )
  const placements = useMemo(() => buildPlacements(palette.hue), [palette])

  const W = 800, H = 400
  // ALL SEARCHES shows every bubble, TOP SEARCHES obeys the count picker.
  const activeCount = vizType === "ALL SEARCHES" ? placements.length : count
  const visible = placements.slice(0, activeCount)
  const hovTerm = hovered !== null ? terms[hovered] : null

  const stats: Stat[] = hovTerm ? [
    { value: `${(hovTerm.views / 1000).toFixed(0)}K`, label: "VIEWS", bg: palette.accent },
    { value: `${(hovTerm.minutes / 1000).toFixed(0)}K`, label: "WATCH MIN", bg: palette.hue[1] },
    { value: `#${(hovered ?? 0) + 1}`, label: "RANK", bg: palette.hue[0] },
  ] : []

  const empty = terms.length === 0

  return (
    <ChartModule
      icon={<Search size={44} strokeWidth={2.5} />}
      iconBg={palette.purple}
      titleBg={palette.purple}
      title="SEARCH TERM GRAVITY MAP"
      controlBlock={
        <SlabControl
          cfg={{
            r1: palette.purple, r2: palette.accent, r3: palette.hue[0],
            accent: palette.purple,
            count, countOptions: COUNTS, onCount: setCount,
            type: vizType, typeOptions: [...TYPES], onType: (t) => setVizType(t as TypeChoice),
            metric, metricOptions: [...METRICS], onMetric: (m) => setMetric(m as Metric),
          }}
        />
      }
      hovTitle={
        hovTerm
          ? `"${hovTerm.term}" — ${hovTerm.views.toLocaleString()} VIEWS`
          : empty
            ? "NO SEARCH TERMS IN SNAPSHOT — RUN A SYNC WITH SEARCH DATA"
            : "HOVER BUBBLES — BUBBLE SIZE = FIXED GRAVITY POSITION · TEXT = TOP SEARCH TERMS"
      }
      stats={stats}
      legendLeft={<LegBubbles label="VIEWS" />}
      legendRight={<>PROXIMITY = CONCEPTUAL CLUSTER · CENTER = HIGHEST VOLUME</>}
      chartInsight={`Top search terms: ${terms.slice(0, 3).map((t) => `"${t.term}"`).join(" · ") || "no data"}.`}
      personalInsight="Build a content series around your top-5 search terms to compound search discovery."
      bodyBg="#0a0a0f"
      minHeight={340}
    >
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }} preserveAspectRatio="xMidYMid meet">
        {Array.from({ length: 20 }).map((_, i) =>
          Array.from({ length: 10 }).map((_, j) => (
            <circle key={`${i}-${j}`} cx={20 + i * 38} cy={12 + j * 38} r={1} fill="#333" />
          )),
        )}
        {visible.slice(1).map((p, i) => {
          const center = placements[0]
          const isHov = hovered === i + 1
          return (
            <line
              key={i}
              x1={center.x} y1={center.y} x2={p.x} y2={p.y}
              stroke={p.color} strokeWidth={isHov ? 1.5 : 0.5}
              strokeDasharray="3 4" opacity={isHov ? 0.6 : 0.2}
            />
          )
        })}
        {[90, 160, 230].map((r) => (
          <circle
            key={r}
            cx={placements[0].x} cy={placements[0].y} r={r}
            fill="none" stroke={palette.accent} strokeWidth="0.5"
            strokeDasharray="6 6" opacity="0.12"
          />
        ))}
        {visible.map((p, i) => {
          const term = terms[i]
          const isHov = hovered === i
          const isCenter = i === 0
          return (
            <g
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer" }}
            >
              {(isHov || isCenter) && (
                <circle cx={p.x} cy={p.y} r={p.r + 10} fill={p.color} opacity="0.2" />
              )}
              <circle
                cx={p.x} cy={p.y} r={p.r}
                fill={p.color}
                stroke="#fff" strokeWidth={isCenter ? 3 : isHov ? 2 : 0}
                opacity={isHov ? 1 : 0.85}
              />
              {p.r >= 12 && term && (
                <text
                  x={p.x} y={p.y + (p.r >= 24 ? -2 : 3)}
                  fontSize={Math.max(7, Math.min(11, p.r / 2.8))}
                  fontWeight="900" fill="#0a0a0a"
                  fontFamily="monospace" textAnchor="middle"
                  style={{ pointerEvents: "none" }}
                >
                  {term.term.split(" ")[0]}
                </text>
              )}
              {p.r >= 30 && term && (
                <text
                  x={p.x} y={p.y + 8}
                  fontSize={Math.max(7, Math.min(10, p.r / 5))}
                  fontWeight="700" fill="#0a0a0a"
                  fontFamily="monospace" textAnchor="middle"
                  style={{ pointerEvents: "none" }}
                >
                  {term.term.split(" ")[1] || ""}
                </text>
              )}
              {p.r >= 24 && term && (
                <text
                  x={p.x} y={p.y + (p.r >= 30 ? 20 : 10)}
                  fontSize="8" fontWeight="900" fill="#0a0a0a"
                  fontFamily="monospace" textAnchor="middle"
                  style={{ pointerEvents: "none" }}
                >
                  {`${(term.views / 1000).toFixed(0)}K`}
                </text>
              )}
              {isHov && term && (
                <g>
                  <rect
                    x={p.x - 75} y={p.y - p.r - 58}
                    width={150} height={52}
                    fill="#0a0a0a" stroke={p.color} strokeWidth="2"
                  />
                  <text x={p.x} y={p.y - p.r - 44} fontSize="10" fontWeight="900" fill="#fff" fontFamily="monospace" textAnchor="middle">"{term.term}"</text>
                  <text x={p.x} y={p.y - p.r - 31} fontSize="9" fill={palette.accent} fontFamily="monospace" textAnchor="middle">{term.views.toLocaleString()} VIEWS</text>
                  <text x={p.x} y={p.y - p.r - 18} fontSize="9" fill={palette.hue[1]} fontFamily="monospace" textAnchor="middle">{(term.minutes / 1000).toFixed(0)}K WATCH MIN</text>
                  <text x={p.x} y={p.y - p.r - 6} fontSize="8" fill={palette.hue[0]} fontFamily="monospace" textAnchor="middle">RANK #{i + 1} SEARCH TERM</text>
                </g>
              )}
            </g>
          )
        })}
      </svg>
    </ChartModule>
  )
}

export default SearchTermGravityModule
