import React, { useEffect, useMemo, useRef, useState } from "react"

export type InsightBadgeTone = "cyan" | "lime" | "white"

export interface InsightMarqueeSegment {
  badge: string
  text: string
  badgeTone?: InsightBadgeTone
}

export interface InsightMarqueeProps {
  segments: InsightMarqueeSegment[]
  durationMs?: number
  mode?: "insight-lock" | "simple-scroll"
}

const badgeToneClass = (tone?: InsightBadgeTone): string => {
  if (tone === "cyan") return "bg-[#00CCFF] text-black"
  if (tone === "lime") return "bg-[#CCFF00] text-black"
  return "bg-white text-black"
}

type TimelineState = {
  segmentIdx: number
  badgeX: number
  textX: number
  locked: boolean
}

const BADGE_W = 116
const BADGE_GAP = 14
const LOCK_X = 8

export const InsightMarquee: React.FC<InsightMarqueeProps> = ({
  segments,
  durationMs = 52000,
  mode = "insight-lock",
}) => {
  const windowRef = useRef<HTMLDivElement | null>(null)
  const textMeasureRef = useRef<HTMLSpanElement | null>(null)
  const [windowWidth, setWindowWidth] = useState(1000)
  const [textWidth, setTextWidth] = useState(600)

  const safeSegments = useMemo<InsightMarqueeSegment[]>(
    () =>
      segments.length > 0
        ? segments
        : [{ badge: "Insight", text: "No insights available.", badgeTone: "white" }],
    [segments],
  )

  const [state, setState] = useState<TimelineState>({
    segmentIdx: 0,
    badgeX: 1040,
    textX: 1040 + BADGE_W + BADGE_GAP,
    locked: false,
  })

  const active = safeSegments[state.segmentIdx % safeSegments.length]
  const leftMaskStart = 124

  useEffect(() => {
    const node = windowRef.current
    if (!node) return
    const measure = () => setWindowWidth(node.clientWidth || 1000)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(node)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (!textMeasureRef.current) return
    setTextWidth(textMeasureRef.current.scrollWidth || 600)
  }, [active.text])

  useEffect(() => {
    setState((prev) => ({
      ...prev,
      badgeX: windowWidth + 48,
      textX: windowWidth + 48 + BADGE_W + BADGE_GAP,
      locked: false,
    }))
  }, [windowWidth, state.segmentIdx])

  useEffect(() => {
    if (mode !== "insight-lock") return

    const pxPerSecond = Math.max(36, windowWidth / (durationMs / 2000))
    let raf = 0
    let lastTs = performance.now()

    const loop = (ts: number) => {
      const dt = Math.min(0.04, (ts - lastTs) / 1000)
      lastTs = ts

      setState((prev) => {
        const next = { ...prev }
        const move = pxPerSecond * dt

        if (!next.locked) {
          next.badgeX = next.badgeX - move
          next.textX = next.textX - move

          if (next.badgeX <= LOCK_X) {
            next.badgeX = LOCK_X
            next.locked = true
          }
          return next
        }

        next.badgeX = LOCK_X
        next.textX = next.textX - move

        const textRightEdge = next.textX + textWidth
        if (textRightEdge <= leftMaskStart) {
          next.locked = false
          return next
        }

        return next
      })

      raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [durationMs, leftMaskStart, mode, textWidth, windowWidth])

  useEffect(() => {
    if (state.badgeX + BADGE_W >= 0) return
    setState((prev) => ({
      segmentIdx: (prev.segmentIdx + 1) % safeSegments.length,
      badgeX: windowWidth + 48,
      textX: windowWidth + 48 + BADGE_W + BADGE_GAP,
      locked: false,
    }))
  }, [safeSegments.length, state.badgeX, windowWidth])

  return (
    <div className="insight-marquee-shell border-t-[0px] border-black">
      <div className="insight-marquee-window" ref={windowRef}>
        <span className={`insight-actor-badge ${badgeToneClass(active.badgeTone)}`} style={{ transform: `translateX(${Math.round(state.badgeX)}px)` }}>
          {active.badge}
        </span>

        <span
          className="insight-text insight-text-actor"
          style={{
            transform: `translateX(${Math.round(state.textX)}px)`,
            clipPath: state.locked ? `inset(0 0 0 ${leftMaskStart}px)` : "none",
          }}
        >
          {active.text}
        </span>

        <span ref={textMeasureRef} className="insight-text insight-text-measure">
          {active.text}
        </span>
      </div>
    </div>
  )
}
