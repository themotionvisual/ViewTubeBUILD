import React, { useEffect, useRef, useState } from "react"
import {
  createHeroIntroController,
  getHeroVariantLabel,
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

export const replayHeroVisual = (
  visualId: HeroVisualId,
  variant?: number,
) => {
  if (typeof window === "undefined") return

  window.dispatchEvent(
    new CustomEvent("vt:replay-hero-intro", {
      detail: {
        visualId,
        variant,
      },
    }),
  )
}

/**
 * MAIN HERO REPLAY CONTROL
 *
 * Keep ONE of these in the title/header area of each visual.
 *
 * Existing animations remain first in the cycle.
 * Added animations are appended after them.
 *
 * Example:
 *
 * Channel Progress:
 * existing 0
 * existing 1
 * existing 2
 * Traveling Tide
 * Echo Waves
 * Growth Ignition
 *
 * Heat Matrix:
 * existing 0
 * existing 1
 * existing 2
 * Horizontal Thermal Wave
 * Heat Drop
 * Digital Rain
 */
export const HeaderHeroPlayButton: React.FC<{
  visualId: HeroVisualId
  className?: string
  placement?: "header" | "overlay"

  /**
   * Distance from right side of visual card.
   */
  rightPx?: number

  /**
   * Distance from top of visual card.
   */
  topPx?: number
}> = ({
  visualId,
  className = "",
  placement = "overlay",
  rightPx = 80,
  topPx = 10,
}) => {
  const variantCount =
    HERO_VISUAL_VARIANT_COUNT[visualId] ?? 1

  const [variant, setVariant] = useState(0)

  const [badgeVisible, setBadgeVisible] =
    useState(false)

  const badgeTimerRef =
    useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (badgeTimerRef.current !== null) {
        window.clearTimeout(
          badgeTimerRef.current,
        )
      }
    }
  }, [])

  const handleClick = (
    event: React.MouseEvent,
  ) => {
    event.preventDefault()
    event.stopPropagation()

    /**
     * IMPORTANT:
     *
     * Existing animation variants stay at
     * their existing indices.
     *
     * New animations have simply increased
     * HERO_VISUAL_VARIANT_COUNT.
     */
    const next =
      variantCount > 1
        ? (variant + 1) % variantCount
        : 0

    setVariant(next)

    replayHeroVisual(
      visualId,
      next,
    )

    if (variantCount > 1) {
      setBadgeVisible(true)

      if (
        badgeTimerRef.current !== null
      ) {
        window.clearTimeout(
          badgeTimerRef.current,
        )
      }

      badgeTimerRef.current =
        window.setTimeout(() => {
          setBadgeVisible(false)
        }, 1200)
    }
  }

  const label =
    variantCount > 1
      ? `Replay animation — ${variantCount} variants`
      : "Replay animation"
  // Extended to 7 slots for visuals that carry 4 additional variants beyond
  // the original opener/replay/alt triad. Baseline (3-variant) visuals still
  // only surface the first three labels.
  const cycleLabel = [
    "OPENER",
    "QUICK REPLAY",
    "CREATIVE ALT",
    "PHYSICS ALT",
    "STYLE ALT",
    "MOTION ALT",
    "FLOURISH",
  ][variant] ?? "REPLAY"

  return (
    <div
      className={`
        pointer-events-none
        z-40
        flex
        shrink-0
        items-center
        gap-2
        ${placement === "overlay" ? "absolute" : "relative"}
        ${className}
      `}
      style={placement === "overlay" ? {
        top: `${topPx}px`,
        right: `${rightPx}px`,
      } : undefined}
    >
      {variantCount > 1 &&
      badgeVisible ? (
        <span
          className="
            pointer-events-none
            inline-flex
            select-none
            items-center
            rounded-md
            border-[2px]
            border-black
            bg-[#C9FF18]
            px-2
            py-0.5
            text-[10px]
            font-black
            uppercase
            tracking-wider
            text-black
            shadow-[3px_3px_0_0_black]
          "
        >
          {cycleLabel} · {getHeroVariantLabel(visualId, variant)}
        </span>
      ) : null}

      <button
        type="button"
        aria-label={label}
        title={label}
        onClick={handleClick}
        className="
          pointer-events-auto
          grid
          h-8
          w-8
          place-items-center
          rounded-md
          border-[2px]
          border-black
          bg-white
          text-black
          shadow-[4px_4px_0_0_black]
          transition-all
          duration-200
          hover:translate-x-[2px]
          hover:translate-y-[2px]
          hover:shadow-[2px_2px_0_0_black]
          active:translate-x-[4px]
          active:translate-y-[4px]
          active:shadow-none
        "
      >
        {/* Circular replay arrow */}
        <svg
          viewBox="0 0 24 24"
          className="h-[19px] w-[19px]"
          aria-hidden="true"
        >
          <path
            d="
              M20 11
              a8 8 0 1 1
              -2.34 -5.66
              L20 7.68
            "
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d="
              M20 3
              v4.68
              h-4.68
            "
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  )
}

/**
 * Wrap the animated portion of a visual with this.
 *
 * The controller is responsible for:
 * - automatic intro
 * - replay
 * - animation variants
 * - animation cleanup
 * - reduced-motion handling
 */
export const HeroIntroBoundary: React.FC<
  HeroIntroBoundaryProps
> = ({
  visualId,
  replayKey = 0,
  seed,
  mode,
  className,
  children,
}) => {
  const rootRef =
    useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root =
      rootRef.current

    if (!root) return

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.(
        "(prefers-reduced-motion: reduce)",
      ).matches

    const effectiveMode:
      HeroIntroMode =
      prefersReducedMotion
        ? "none"
        : mode ??
          readHeroIntroModeFromUrl(
            "full",
          )

    const controller =
      createHeroIntroController(
        visualId,
        root,
        {
          mode: effectiveMode,
          seed,
        },
      )

    let isInViewport = false
    let hasPlayedIntro = false

    const canAnimate = () =>
      isInViewport && document.visibilityState !== "hidden"

    const playIntroOnce = () => {
      if (!canAnimate() || hasPlayedIntro) return
      hasPlayedIntro = true
      controller.replay({ variant: 0 })
    }

    const replay = (
      event: Event,
    ) => {
      const detail = (
        event as CustomEvent<{
          visualId?: HeroVisualId
          variant?: number
        }>
      ).detail

      if (
        detail?.visualId &&
        detail.visualId !== visualId
      ) {
        return
      }

      if (!canAnimate()) return

      controller.replay(
        detail?.variant !== undefined
          ? {
              variant:
                detail.variant,
            }
          : undefined,
      )
    }

    window.addEventListener(
      "vt:replay-hero-intro",
      replay,
    )

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        controller.reset()
        return
      }
      playIntroOnce()
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)

    const viewportObserver = typeof IntersectionObserver === "undefined"
      ? null
      : new IntersectionObserver(
          ([entry]) => {
            isInViewport = Boolean(entry?.isIntersecting)
            if (isInViewport) playIntroOnce()
            else controller.reset()
          },
          { rootMargin: "80px 0px", threshold: 0.01 },
        )

    if (viewportObserver) viewportObserver.observe(root)
    else {
      isInViewport = true
      playIntroOnce()
    }

    /**
     * Automatic first animation.
     *
     * Starts with the CURRENT branch's
     * first/original variant.
     */
    return () => {
      window.removeEventListener(
        "vt:replay-hero-intro",
        replay,
      )

      document.removeEventListener("visibilitychange", handleVisibilityChange)
      viewportObserver?.disconnect()

      controller.destroy()
    }
  }, [
    visualId,
    replayKey,
    seed,
    mode,
  ])

  return (
    <div
      ref={rootRef}
      className={`
        relative
        ${className ?? ""}
      `}
      data-vt-hero-visual={
        visualId
      }
    >
      {children}
    </div>
  )
}
