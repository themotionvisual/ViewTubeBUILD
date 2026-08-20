import React, { useEffect, useRef } from "react"

export type ViewTubeMarkType = "line" | "bar" | "scatter" | "composed"

export const VIEWTUBE_CARTESIAN = {
  axisStroke: "#000000",
  axisStrokeWidth: 2,
  axisCornerRadius: 3,
  tickColor: "#B7B7B7",
  tickFontWeight: 800,
  tickFontSize: 10,
  tickInset: 9,
  scatterHoverScale: 1.25,
  scatterHoverGrowMs: 750,
  scatterHoverShrinkMs: 350,
  scatterEase: "cubic-bezier(0.22, 1, 0.36, 1)",
  barTargetFill: 0.86,
  barMinVisibleRatio: 0.035,
} as const

const NICE_FACTORS = [1, 2, 2.5, 3, 5, 10] as const

const niceStep = (rawStep: number) => {
  if (!Number.isFinite(rawStep) || rawStep <= 0) return 1
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)))
  const normalized = rawStep / magnitude
  let factor = NICE_FACTORS[0]
  let bestDistance = Infinity
  for (const candidate of NICE_FACTORS) {
    const distance = Math.abs(candidate - normalized)
    if (distance < bestDistance) {
      bestDistance = distance
      factor = candidate
    }
  }
  return factor * magnitude
}

export interface ViewTubeNiceScale {
  domain: [number, number]
  ticks: number[]
  step: number
}

export const getNiceScale = (
  values: Array<number | null | undefined>,
  options: {
    targetIntervals?: number
    includeZero?: boolean
    clampMin?: number
  } = {},
): ViewTubeNiceScale => {
  const finite = values.map(Number).filter(Number.isFinite) as number[]
  if (!finite.length) return { domain: [0, 1], ticks: [1], step: 1 }

  const targetIntervals = Math.max(2, options.targetIntervals ?? 5)
  let min = Math.min(...finite)
  let max = Math.max(...finite)

  if (options.includeZero) min = Math.min(0, min)
  if (Number.isFinite(options.clampMin)) min = Math.max(options.clampMin as number, min)

  if (min === max) {
    const delta = Math.max(Math.abs(min) * 0.1, 1)
    min -= delta
    max += delta
  }

  const step = niceStep((max - min) / targetIntervals)
  const niceMin = options.includeZero && min >= 0 ? 0 : Math.floor(min / step) * step
  const niceMax = Math.ceil(max / step) * step

  const ticks: number[] = []
  const epsilon = Math.abs(step) * 1e-8
  for (let value = niceMin; value <= niceMax + epsilon; value += step) {
    const rounded = Number(value.toPrecision(12))
    if (Math.abs(rounded) > epsilon) ticks.push(rounded)
  }

  return {
    domain: [niceMin, niceMax],
    ticks,
    step,
  }
}

export const getRelativeScatterDomain = (
  values: Array<number | null | undefined>,
): [number, number] => getNiceScale(values, { targetIntervals: 5 }).domain

export const getRelativeScatterScale = (
  values: Array<number | null | undefined>,
): ViewTubeNiceScale => getNiceScale(values, { targetIntervals: 5 })

/**
 * Legacy-compatible helper. Bubble safety is now handled by overflow-visible
 * chart geometry rather than shrinking the data domain. Returning zero keeps
 * older call sites compiling without adding visual headroom.
 */
export const getBubbleSafePadding = (_maxBubbleRadius = 0) => ({
  x: { left: 0, right: 0 },
  y: { top: 0, bottom: 0 },
})

export const formatRoundedAxisTick = (
  value: number,
  options: { unit?: string; currency?: boolean; percent?: boolean } = {},
): string => {
  if (!Number.isFinite(value) || Math.abs(value) < 1e-10) return ""

  const prefix = options.currency ? "$" : ""
  const suffix = options.percent ? "%" : (options.unit ?? "")
  const abs = Math.abs(value)

  let body: string
  if (abs >= 1_000_000_000) body = `${Number((value / 1_000_000_000).toFixed(1))}B`
  else if (abs >= 1_000_000) body = `${Number((value / 1_000_000).toFixed(1))}M`
  else if (abs >= 1_000) body = `${Number((value / 1_000).toFixed(1))}K`
  else if (abs >= 10) body = `${Math.round(value)}`
  else body = `${Number(value.toFixed(1))}`

  return `${prefix}${body}${suffix}`
}

export const viewTubeCartesianMargin = (
  markType: ViewTubeMarkType,
  _legacyRadius?: number,
) => {
  // Margins are for exterior axis titles only. Data marks may overlap the plot edge.
  if (markType === "scatter") return { top: 10, right: 10, bottom: 8, left: 38 }
  if (markType === "bar") return { top: 12, right: 34, bottom: 26, left: 34 }
  if (markType === "composed") return { top: 14, right: 36, bottom: 28, left: 36 }
  return { top: 10, right: 34, bottom: 22, left: 34 }
}

export const viewTubeAxisLine = {
  stroke: VIEWTUBE_CARTESIAN.axisStroke,
  strokeWidth: VIEWTUBE_CARTESIAN.axisStrokeWidth,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
}

export const viewTubeNumericYAxisProps = (orientation: "left" | "right" = "left") => ({
  orientation,
  width: 1,
  tickLine: false,
  axisLine: viewTubeAxisLine,
})

export const viewTubeNumericXAxisProps = {
  height: 1,
  tickLine: false,
  axisLine: viewTubeAxisLine,
} as const

export const ViewTubeYAxisTick = ({
  x = 0,
  y = 0,
  payload,
  orientation = "left",
  formatter = formatRoundedAxisTick,
}: any) => {
  const label = formatter(Number(payload?.value ?? 0))
  if (!label) return null
  const isLeft = orientation === "left"
  return (
    <text
      x={x + (isLeft ? VIEWTUBE_CARTESIAN.tickInset : -VIEWTUBE_CARTESIAN.tickInset)}
      y={y}
      dy="0.32em"
      textAnchor={isLeft ? "start" : "end"}
      fill={VIEWTUBE_CARTESIAN.tickColor}
      fontSize={VIEWTUBE_CARTESIAN.tickFontSize}
      fontWeight={VIEWTUBE_CARTESIAN.tickFontWeight}
      pointerEvents="none"
    >
      {label}
    </text>
  )
}

export const ViewTubeXAxisTick = ({
  x = 0,
  y = 0,
  payload,
  formatter = formatRoundedAxisTick,
}: any) => {
  const label = formatter(Number(payload?.value ?? 0))
  if (!label) return null
  return (
    <text
      x={x}
      y={y - VIEWTUBE_CARTESIAN.tickInset}
      textAnchor="middle"
      fill={VIEWTUBE_CARTESIAN.tickColor}
      fontSize={VIEWTUBE_CARTESIAN.tickFontSize}
      fontWeight={VIEWTUBE_CARTESIAN.tickFontWeight}
      pointerEvents="none"
    >
      {label}
    </text>
  )
}

export const ViewTubeYAxisTitle = ({
  viewBox,
  title,
  orientation = "left",
  color = "#000000",
}: {
  viewBox?: { x: number; y: number; width: number; height: number }
  title: string
  orientation?: "left" | "right"
  color?: string
}) => {
  if (!viewBox) return null
  const isLeft = orientation === "left"
  const x = isLeft ? viewBox.x - 24 : viewBox.x + viewBox.width + 24
  const y = viewBox.y + viewBox.height / 2
  return (
    <g transform={`translate(${x},${y}) rotate(${isLeft ? -90 : 90})`}>
      <text
        textAnchor="middle"
        dominantBaseline="middle"
        fill={color}
        fontSize={13}
        fontWeight={1000}
        letterSpacing="0.08em"
      >
        {title}
      </text>
    </g>
  )
}

export const getRelativeBarAxisMax = (
  values: Array<number | null | undefined>,
  targetFill = VIEWTUBE_CARTESIAN.barTargetFill,
) => {
  const finite = values.map(Number).filter((v) => Number.isFinite(v) && v >= 0) as number[]
  const max = finite.length ? Math.max(...finite) : 0
  if (max <= 0) return 1
  return getNiceScale([0, max / targetFill], { includeZero: true, targetIntervals: 4 }).domain[1]
}

export const getRelativeBarScale = (
  values: Array<number | null | undefined>,
  targetFill = VIEWTUBE_CARTESIAN.barTargetFill,
) => {
  const max = getRelativeBarAxisMax(values, targetFill)
  return getNiceScale([0, max], { includeZero: true, targetIntervals: 4 })
}

export const getRelativeBarMinPointSize = (plotHeight: number) =>
  Math.max(3, Math.ceil(plotHeight * VIEWTUBE_CARTESIAN.barMinVisibleRatio))

export const viewTubeSelectedLineDot = (
  selected: boolean,
  lightTone: string,
  darkTone: string,
) =>
  selected
    ? { r: 5, fill: lightTone, stroke: darkTone, strokeWidth: 2 }
    : false

export const viewTubeActiveLineDot = (lightTone: string, darkTone: string) => ({
  r: 6,
  fill: "#FFFFFF",
  stroke: darkTone || lightTone,
  strokeWidth: 2,
})

export const ViewTubeScatterYAxisTitle: React.FC<{
  title: string
  side?: "left" | "right"
}> = ({ title, side = "left" }) => (
  <div
    className="pointer-events-none absolute top-1/2 z-20 flex -translate-y-1/2 items-center justify-center"
    style={{ [side]: 2, width: 26, height: "calc(100% - 24px)" }}
    aria-hidden="true"
  >
    <span
      className="whitespace-nowrap text-[13px] font-[1000] uppercase tracking-[0.08em] text-black"
      style={{ transform: `rotate(${side === "left" ? -90 : 90}deg)`, transformOrigin: "center" }}
    >
      {title}
    </span>
  </div>
)

export interface ViewTubeScatterBubbleProps {
  cx?: number
  cy?: number
  radius: number
  fill: string
  isHovered: boolean
  stroke?: string
  onEnter?: () => void
  onLeave?: () => void
  fillOpacity?: number
}

export const ViewTubeScatterBubble: React.FC<ViewTubeScatterBubbleProps> = ({
  cx = 0,
  cy = 0,
  radius,
  fill,
  stroke = fill,
  isHovered,
  onEnter,
  onLeave,
  fillOpacity = 0.55,
}) => {
  const bubbleIntroRef = useRef<SVGGElement>(null)

  useEffect(() => {
    const node = bubbleIntroRef.current
    if (!node) return

    const hash = Math.abs(Math.sin(cx * 12.9898 + cy * 78.233 + radius * 3.17) * 43758.5453)
    const delay = 70 + (hash - Math.floor(hash)) * 1450
    let animation: Animation | null = null

    const playIntro = () => {
      try { animation?.cancel() } catch { /* detached */ }
      animation = node.animate(
        [
          { transform: "scale(0)", opacity: 0, offset: 0 },
          { transform: "scale(1.55)", opacity: 1, offset: 0.55 },
          { transform: "scale(0.9)", opacity: 1, offset: 0.8 },
          { transform: "scale(1)", opacity: 1, offset: 1 },
        ],
        {
          duration: 620,
          delay,
          fill: "both",
          easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        },
      )
      animation.finished.catch(() => undefined).then(() => {
        try { animation?.cancel() } catch { /* detached */ }
      })
    }

    const replay = () => playIntro()
    window.addEventListener("vt:replay-scatter-intro", replay)
    playIntro()

    return () => {
      window.removeEventListener("vt:replay-scatter-intro", replay)
      try { animation?.cancel() } catch { /* detached */ }
    }
  }, [cx, cy, radius])

  return (
    <g
      transform={`translate(${cx} ${cy})`}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{ cursor: "pointer" }}
    >
      <g
        ref={bubbleIntroRef}
        className="vt-scatter-bubble-core"
        data-vt-scatter-bubble
        style={{ transformOrigin: "0px 0px", transformBox: "fill-box" }}
      >
        <g
          style={{
            transformOrigin: "0px 0px",
            transform: `scale(${isHovered ? VIEWTUBE_CARTESIAN.scatterHoverScale : 1})`,
            transition: `transform ${
              isHovered ? VIEWTUBE_CARTESIAN.scatterHoverGrowMs : VIEWTUBE_CARTESIAN.scatterHoverShrinkMs
            }ms ${VIEWTUBE_CARTESIAN.scatterEase}`,
            willChange: "transform",
          }}
        >
          <circle
            cx={0}
            cy={0}
            r={radius}
            fill={fill}
            fillOpacity={isHovered ? 0.72 : fillOpacity}
            stroke={stroke}
            strokeWidth={isHovered ? 2.5 : 1.5}
            vectorEffect="non-scaling-stroke"
            style={{
              transition:
                `fill-opacity ${
                  isHovered ? VIEWTUBE_CARTESIAN.scatterHoverGrowMs : VIEWTUBE_CARTESIAN.scatterHoverShrinkMs
                }ms ease, stroke-width ${
                  isHovered ? VIEWTUBE_CARTESIAN.scatterHoverGrowMs : VIEWTUBE_CARTESIAN.scatterHoverShrinkMs
                }ms ease`,
            }}
          />
        </g>
      </g>
    </g>
  )
}
