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
  /**
   * Whether to render the standardized `HeaderHeroPlayButton` inside the
   * boundary. Default `true` — every animated visual gets one replay
   * control at the same relative position without callers having to place
   * one themselves.
   */
  showHeaderPlayButton?: boolean
  /** px offset from top of boundary root — overrides the default 8. */
  playButtonTopPx?: number
  /** px offset from right of boundary root — overrides the default 12. */
  playButtonRightPx?: number
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
 * OLD IN-CANVAS BUTTON
 *
 * Retained ONLY for compatibility with any old render sites.
 * New hero visuals should use HeaderHeroPlayButton instead.
 */
export const HeroAnimationPlayButton: React.FC<{
  visualId: HeroVisualId
  className?: string
}> = ({
  visualId,
  className = "",
}) => {
  return (
    <button
      type="button"
      aria-label="Replay visual animation"
      title="Replay animation"
      className={`
        absolute
        right-2
        top-2
        z-30
        grid
        h-8
        w-8
        place-items-center
        rounded-md
        border-[2px]
        border-black
        bg-white
        text-black
        shadow-none
        ${className}
      `}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()

        replayHeroVisual(visualId)
      }}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-[19px] w-[19px]"
        aria-hidden="true"
      >
        <path
          d="M20 11a8 8 0 1 1-2.34-5.66L20 7.68"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M20 3v4.68h-4.68"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
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

  return (
    <div
      className={`
        pointer-events-none
        absolute
        z-40
        flex
        items-center
        gap-2
        ${className}
      `}
      style={{
        top: `${topPx}px`,
        right: `${rightPx}px`,
      }}
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
          V{variant + 1} / {variantCount}
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
          shadow-[3px_3px_0_0_black]
          transition-transform
          hover:-translate-y-0.5
          active:translate-x-[1px]
          active:translate-y-[1px]
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
  showHeaderPlayButton = true,
  playButtonTopPx = 8,
  playButtonRightPx = 12,
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

    /**
     * Automatic first animation.
     *
     * Starts with the CURRENT branch's
     * first/original variant.
     */
    controller.replay({
      variant: 0,
    })

    return () => {
      window.removeEventListener(
        "vt:replay-hero-intro",
        replay,
      )

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
      {showHeaderPlayButton ? (
        <HeaderHeroPlayButton
          visualId={visualId}
          topPx={playButtonTopPx}
          rightPx={playButtonRightPx}
        />
      ) : null}
      {children}
    </div>
  )
}