import React, { useEffect, useRef, useState } from "react"
import {
  createHeroIntroController,
  HERO_VISUAL_VARIANT_COUNT,
  readHeroIntroModeFromUrl,
  type HeroIntroMode,
  type HeroVisualId,
} from "./heroVisualAnimations"

export interface HeroIntroBoundaryProps {
  visualId: HeroVisualId
  replayKey?: string | number
  seed?: string | number
  mode?: HeroIntroMode
  className?: string
  children: React.ReactNode
}

/**
 * Ask every mounted HeroIntroBoundary of the given `visualId` to replay,
 * optionally at a specific `variant`. Consumed by `HeaderHeroPlayButton`
 * and any external showcase controls.
 */
export const replayHeroVisual = (visualId: HeroVisualId, variant?: number) => {
  if (typeof window === "undefined") return
  window.dispatchEvent(
    new CustomEvent("vt:replay-hero-intro", {
      detail: { visualId, variant },
    }),
  )
}

/**
 * The old in-canvas play button. Kept as an export for compatibility, but no
 * longer used by the hero visuals — they now render `HeaderHeroPlayButton`
 * at the shell header level so the control is not inside the chart canvas.
 *
 * @deprecated Prefer `<HeaderHeroPlayButton>` at the visual header.
 */
export const HeroAnimationPlayButton: React.FC<{
  visualId: HeroVisualId
  className?: string
}> = ({ visualId, className = "" }) => (
  <button
    type="button"
    aria-label="Replay visual animation"
    title="Replay animation"
    className={`absolute right-2 top-2 z-30 grid h-8 w-8 place-items-center rounded-md border-[2px] border-black bg-white text-[14px] font-black text-black shadow-none ${className}`}
    onClick={(event) => {
      event.preventDefault()
      event.stopPropagation()
      replayHeroVisual(visualId)
    }}
  >
    ▶
  </button>
)

/**
 * Header-anchored replay button. Renders itself absolutely inside a
 * `relative` parent (the visual's outer card), positioned at the top-right
 * of the header band and clear of the top-right controller row.
 *
 * Each click cycles the animation variant (0 → 1 → … → n-1 → 0) and
 * dispatches a replay event carrying the new variant so any listening
 * `HeroIntroBoundary` with a matching `visualId` re-runs at that variant.
 * A brief "V·i / n" badge appears next to the button so the tester can see
 * which variant just fired.
 *
 * Placement is chosen to sit LEFT of the shell's top-right controller row
 * without needing the shell to expose a slot for it. The `rightPx` prop
 * lets a caller nudge the offset if a particular visual has an unusually
 * wide controller stack.
 */
export const HeaderHeroPlayButton: React.FC<{
  visualId: HeroVisualId
  className?: string
  /** Distance in px from the right edge of the wrapping card. Default 80 clears the controller row. */
  rightPx?: number
  /** Distance in px from the top edge of the wrapping card. Default 10 sits inside the header band. */
  topPx?: number
}> = ({ visualId, className = "", rightPx = 80, topPx = 10 }) => {
  const variantCount = HERO_VISUAL_VARIANT_COUNT[visualId] ?? 1
  const [variant, setVariant] = useState(0)
  const [badgeVisible, setBadgeVisible] = useState(false)
  const badgeTimerRef = useRef<number | null>(null)

  useEffect(() => () => {
    if (badgeTimerRef.current !== null) window.clearTimeout(badgeTimerRef.current)
  }, [])

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    const next = variantCount > 1 ? (variant + 1) % variantCount : 0
    setVariant(next)
    replayHeroVisual(visualId, next)
    if (variantCount > 1) {
      setBadgeVisible(true)
      if (badgeTimerRef.current !== null) window.clearTimeout(badgeTimerRef.current)
      badgeTimerRef.current = window.setTimeout(() => setBadgeVisible(false), 1200)
    }
  }

  const label = variantCount > 1
    ? `Replay animation (cycles ${variantCount} variants)`
    : "Replay animation"

  return (
    <div
      className={`pointer-events-none absolute z-40 flex items-center gap-2 ${className}`}
      style={{ top: `${topPx}px`, right: `${rightPx}px` }}
    >
      {variantCount > 1 && badgeVisible ? (
        <span className="pointer-events-none inline-flex select-none items-center rounded-md border-[2px] border-black bg-[#C9FF18] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-black shadow-[3px_3px_0_0_black]">
          V{variant + 1} / {variantCount}
        </span>
      ) : null}
      <button
        type="button"
        aria-label={label}
        title={label}
        onClick={handleClick}
        className="pointer-events-auto grid h-8 w-8 place-items-center rounded-md border-[2px] border-black bg-white text-[14px] font-black text-black shadow-[3px_3px_0_0_black] transition-transform hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
      >
        ▶
      </button>
    </div>
  )
}

export const HeroIntroBoundary: React.FC<HeroIntroBoundaryProps> = ({
  visualId,
  replayKey = 0,
  seed,
  mode,
  className,
  children,
}) => {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches

    const effectiveMode: HeroIntroMode =
      prefersReducedMotion ? "none" : mode ?? readHeroIntroModeFromUrl("full")

    const controller = createHeroIntroController(visualId, root, {
      mode: effectiveMode,
      seed,
    })

    const replay = (event: Event) => {
      const detail = (event as CustomEvent<{ visualId?: HeroVisualId; variant?: number }>).detail
      if (detail?.visualId && detail.visualId !== visualId) return
      controller.replay(detail?.variant !== undefined ? { variant: detail.variant } : undefined)
    }

    window.addEventListener("vt:replay-hero-intro", replay)
    controller.replay()

    return () => {
      window.removeEventListener("vt:replay-hero-intro", replay)
      controller.destroy()
    }
  }, [visualId, replayKey, seed, mode])

  return (
    <div
      ref={rootRef}
      className={`relative ${className ?? ""}`}
      data-vt-hero-visual={visualId}
    >
      {children}
    </div>
  )
}
