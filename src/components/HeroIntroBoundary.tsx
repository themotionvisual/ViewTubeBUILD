import React, { useEffect, useRef } from "react"
import {
  createHeroIntroController,
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
  showPlayButton?: boolean
  children: React.ReactNode
}

export const replayHeroVisual = (visualId: HeroVisualId) => {
  if (typeof window === "undefined") return
  window.dispatchEvent(
    new CustomEvent("vt:replay-hero-intro", { detail: { visualId } }),
  )
}

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

export const HeroIntroBoundary: React.FC<HeroIntroBoundaryProps> = ({
  visualId,
  replayKey = 0,
  seed,
  mode,
  className,
  showPlayButton = true,
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
      const detail = (event as CustomEvent<{ visualId?: HeroVisualId }>).detail
      if (detail?.visualId && detail.visualId !== visualId) return
      controller.replay()
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
      {showPlayButton ? <HeroAnimationPlayButton visualId={visualId} /> : null}
      {children}
    </div>
  )
}
