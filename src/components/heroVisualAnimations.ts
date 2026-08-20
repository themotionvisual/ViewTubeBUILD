/**
 * ViewTube Hero Visual Intro Animation Engine
 *
 * Drop into: src/components/heroVisualAnimations.ts
 *
 * Uses the browser Web Animations API so it works with:
 * - custom SVG
 * - Recharts SVG output
 * - ordinary DOM tiles
 *
 * All animations are deterministic and replayable for Showcase / investor capture.
 */

export type HeroIntroMode = "full" | "fast" | "none"

export type HeroVisualId =
  | "traffic-source-evolution"
  | "channel-progress"
  | "heat-matrix"
  | "shorts-retention"
  | "channel-vital-signs"
  | "clockburst"
  | "title-keyword-network"
  | "barcode-fingerprint"
  | "geography-map"
  | "engagement-pulse"
  | "format-dominance"
  | "keyword-venn"

export interface HeroIntroOptions {
  mode?: HeroIntroMode
  seed?: string | number
}

export interface HeroIntroController {
  replay: () => void
  reset: () => void
  destroy: () => void
}

type AnimationRunner = (
  root: ParentNode,
  options?: HeroIntroOptions,
) => Animation[]

const SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)"
const SOFT_OUT = "cubic-bezier(0.16, 1, 0.3, 1)"
const GLIDE = "cubic-bezier(0.22, 1, 0.36, 1)"

const modeScale = (mode: HeroIntroMode | undefined): number =>
  mode === "none" ? 0 : mode === "fast" ? 0.46 : 1

const ms = (value: number, mode: HeroIntroMode | undefined): number =>
  Math.max(1, Math.round(value * modeScale(mode)))

const queryAll = <T extends Element = Element>(
  root: ParentNode,
  selector: string,
): T[] => Array.from(root.querySelectorAll<T>(selector))

const releaseWhenFinished = (animation: Animation): Animation => {
  animation.finished
    .catch(() => undefined)
    .then(() => {
      try {
        animation.cancel()
      } catch {
        // Ignore cancellation after DOM removal.
      }
    })
  return animation
}

const play = (
  element: Element,
  keyframes: Keyframe[],
  options: KeyframeAnimationOptions,
): Animation => releaseWhenFinished(element.animate(keyframes, {
  fill: "both",
  ...options,
}))

const setTransformOrigin = (
  element: Element,
  origin = "center center",
): void => {
  const svgElement = element as SVGElement
  svgElement.style.transformBox = "fill-box"
  svgElement.style.transformOrigin = origin
  svgElement.style.willChange = "transform, opacity"
}

const boundedStagger = (
  count: number,
  totalBudgetMs: number,
  itemDurationMs: number,
  minMs = 12,
  maxMs = 120,
): number => {
  if (count <= 1) return 0
  const available = Math.max(0, totalBudgetMs - itemDurationMs)
  return Math.max(minMs, Math.min(maxMs, available / (count - 1)))
}

/** Deterministic PRNG — same seed = same bubble order every recording. */
const seededRandom = (seedInput: string | number = "viewtube"): (() => number) => {
  const text = String(seedInput)
  let seed = 2166136261
  for (let i = 0; i < text.length; i += 1) {
    seed ^= text.charCodeAt(i)
    seed = Math.imul(seed, 16777619)
  }
  return () => {
    seed += 0x6D2B79F5
    let t = seed
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const seededShuffle = <T,>(
  values: readonly T[],
  seed: string | number,
): T[] => {
  const random = seededRandom(seed)
  const out = [...values]
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

const drawSvgStroke = (
  element: SVGGeometryElement,
  durationMs: number,
  delayMs: number,
  easing = SOFT_OUT,
): Animation | null => {
  let length = 0
  try {
    length = element.getTotalLength()
  } catch {
    return null
  }
  if (!Number.isFinite(length) || length <= 0) return null

  element.style.strokeDasharray = `${length}`
  element.style.strokeDashoffset = `${length}`

  const animation = element.animate(
    [
      { strokeDashoffset: `${length}`, opacity: 0.25 },
      { strokeDashoffset: "0", opacity: 1 },
    ],
    {
      duration: durationMs,
      delay: delayMs,
      easing,
      fill: "both",
    },
  )

  animation.finished
    .catch(() => undefined)
    .then(() => {
      element.style.strokeDasharray = "none"
      element.style.strokeDashoffset = "0"
      try {
        animation.cancel()
      } catch {
        // no-op
      }
    })

  return animation
}

/* -------------------------------------------------------------------------- */
/* 01. TRAFFIC SOURCE EVOLUTION                                               */
/* -------------------------------------------------------------------------- */

export const animateTrafficSourceEvolution: AnimationRunner = (
  root,
  options = {},
) => {
  if (options.mode === "none") return []

  const groups = queryAll<SVGGElement>(
    root,
    ".tse-plot .recharts-area, [class*='tse-area-'].recharts-area",
  )

  const duration = ms(980, options.mode)
  const stagger = ms(
    boundedStagger(groups.length, 3600, 980, 150, 360),
    options.mode,
  )

  return groups.map((group, index) => {
    const fromLeft = index % 2 === 0
    setTransformOrigin(group, fromLeft ? "left center" : "right center")

    return play(
      group,
      [
        { transform: "scaleX(0.001)", opacity: 0.12 },
        { transform: "scaleX(1.025)", opacity: 1, offset: 0.86 },
        { transform: "scaleX(1)", opacity: 1 },
      ],
      {
        duration,
        delay: index * stagger,
        easing: GLIDE,
      },
    )
  })
}

/* -------------------------------------------------------------------------- */
/* 02. CHANNEL PROGRESS                                                       */
/* -------------------------------------------------------------------------- */

export const animateChannelProgress: AnimationRunner = (
  root,
  options = {},
) => {
  if (options.mode === "none") return []

  const bars = queryAll<SVGElement>(
    root,
    ".recharts-bar-rectangle, [data-vt-channel-progress-bar]",
  )
  const lines = queryAll<SVGGeometryElement>(
    root,
    ".recharts-line-curve, [data-vt-channel-progress-line]",
  )

  const animations: Animation[] = []
  const barDuration = ms(620, options.mode)
  const barStagger = ms(
    boundedStagger(bars.length, 1800, 620, 20, 80),
    options.mode,
  )

  bars.forEach((bar, index) => {
    setTransformOrigin(bar, "center bottom")
    animations.push(play(
      bar,
      [
        { transform: "scaleY(0.03)", opacity: 0.25 },
        { transform: "scaleY(1.08)", opacity: 1, offset: 0.78 },
        { transform: "scaleY(1)", opacity: 1 },
      ],
      {
        duration: barDuration,
        delay: index * barStagger,
        easing: SPRING,
      },
    ))
  })

  lines.forEach((line, index) => {
    const animation = drawSvgStroke(
      line,
      ms(1000, options.mode),
      ms(350 + index * 180, options.mode),
      SOFT_OUT,
    )
    if (animation) animations.push(animation)
  })

  return animations
}

/* -------------------------------------------------------------------------- */
/* 03. HEAT MATRIX — SERPENTINE COLUMN SPRING                                 */
/* -------------------------------------------------------------------------- */

const orderTilesBySerpentineColumns = (tiles: HTMLElement[]): HTMLElement[] => {
  if (tiles.length <= 1) return tiles

  const columns = new Map<number, HTMLElement[]>()

  tiles.forEach((tile) => {
    const rect = tile.getBoundingClientRect()
    const key = Math.round(rect.left / 2) * 2
    const bucket = columns.get(key) ?? []
    bucket.push(tile)
    columns.set(key, bucket)
  })

  return [...columns.entries()]
    .sort(([a], [b]) => a - b)
    .flatMap(([, column], columnIndex) => {
      const sorted = [...column].sort(
        (a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top,
      )
      return columnIndex % 2 === 0 ? sorted.reverse() : sorted
    })
}

export const animateHeatMatrix: AnimationRunner = (
  root,
  options = {},
) => {
  if (options.mode === "none") return []

  const tiles = orderTilesBySerpentineColumns(
    queryAll<HTMLElement>(root, ".vt-heat-tile, [data-vt-heat-tile]"),
  )

  const duration = ms(470, options.mode)
  const stagger = ms(
    boundedStagger(tiles.length, 3500, 470, 10, 52),
    options.mode,
  )

  return tiles.map((tile, index) => {
    setTransformOrigin(tile)
    return play(
      tile,
      [
        { transform: "scale(0.12)", opacity: 0 },
        { transform: "scale(1.6)", opacity: 1, offset: 0.52 },
        { transform: "scale(0.91)", opacity: 1, offset: 0.78 },
        { transform: "scale(1)", opacity: 1 },
      ],
      {
        duration,
        delay: index * stagger,
        easing: SPRING,
      },
    )
  })
}

/* -------------------------------------------------------------------------- */
/* 04. SHORTS RETENTION + ALL SCATTER/BUBBLE VISUALS                          */
/* -------------------------------------------------------------------------- */

export const animateScatterBubbles: AnimationRunner = (
  root,
  options = {},
) => {
  if (options.mode === "none") return []

  // Preferred target is the inner scale group added to ViewTubeScatterBubble.
  // Fallback supports ordinary Recharts symbols.
  const preferred = queryAll<SVGElement>(root, ".vt-scatter-bubble-core")
  const fallback = queryAll<SVGElement>(root, ".recharts-scatter-symbol")
  const bubbles = preferred.length ? preferred : fallback

  const shuffled = seededShuffle(
    bubbles,
    options.seed ?? "viewtube-scatter-intro",
  )

  const duration = ms(500, options.mode)
  const stagger = ms(
    boundedStagger(shuffled.length, 2800, 500, 10, 54),
    options.mode,
  )

  return shuffled.map((bubble, index) => {
    setTransformOrigin(bubble)
    return play(
      bubble,
      [
        { transform: "scale(0)", opacity: 0 },
        { transform: "scale(1.55)", opacity: 1, offset: 0.55 },
        { transform: "scale(0.9)", opacity: 1, offset: 0.8 },
        { transform: "scale(1)", opacity: 1 },
      ],
      {
        duration,
        delay: index * stagger,
        easing: SPRING,
      },
    )
  })
}

/* -------------------------------------------------------------------------- */
/* 05. CHANNEL VITAL SIGNS — HEART MONITOR TRACE DRAW                         */
/* -------------------------------------------------------------------------- */

export const animateChannelVitalSigns: AnimationRunner = (
  root,
  options = {},
) => {
  if (options.mode === "none") return []

  const traces = queryAll<SVGGeometryElement>(
    root,
    "[data-vt-vital-trace], .vt-vital-trace",
  )
  const lanes = queryAll<SVGElement>(
    root,
    "[data-vt-vital-lane], .vt-vital-lane",
  )

  const animations: Animation[] = []

  lanes.forEach((lane, index) => {
    animations.push(play(
      lane,
      [
        { opacity: 0 },
        { opacity: 0.35, offset: 0.55 },
        { opacity: 1 },
      ],
      {
        duration: ms(500, options.mode),
        delay: ms(index * 35, options.mode),
        easing: "ease-out",
      },
    ))
  })

  traces.forEach((trace, index) => {
    const animation = drawSvgStroke(
      trace,
      ms(1450, options.mode),
      ms(180 + index * 145, options.mode),
      "cubic-bezier(0.22, 0.7, 0.2, 1)",
    )
    if (animation) animations.push(animation)
  })

  return animations
}

/* -------------------------------------------------------------------------- */
/* 06. CLOCKBURST — ROTOR + WEDGE SPRINGS                                     */
/* -------------------------------------------------------------------------- */

export const animateClockburst: AnimationRunner = (
  root,
  options = {},
) => {
  if (options.mode === "none") return []

  const rotors = queryAll<SVGElement>(
    root,
    "[data-vt-clock-rotor], .vt-clock-rotor",
  )
  const sectors = queryAll<SVGElement>(
    root,
    "[data-vt-clock-sector], .vt-clock-sector",
  )

  const animations: Animation[] = []

  rotors.forEach((rotor) => {
    setTransformOrigin(rotor)
    animations.push(play(
      rotor,
      [
        { transform: "rotate(-170deg)" },
        { transform: "rotate(14deg)", offset: 0.82 },
        { transform: "rotate(0deg)" },
      ],
      {
        duration: ms(2700, options.mode),
        easing: GLIDE,
      },
    ))
  })

  const duration = ms(520, options.mode)
  const stagger = ms(
    boundedStagger(sectors.length, 2500, 520, 55, 145),
    options.mode,
  )

  sectors.forEach((sector, index) => {
    setTransformOrigin(sector)
    animations.push(play(
      sector,
      [
        { transform: "scale(0.12)", opacity: 0 },
        { transform: "scale(1.5)", opacity: 1, offset: 0.56 },
        { transform: "scale(0.93)", opacity: 1, offset: 0.82 },
        { transform: "scale(1)", opacity: 1 },
      ],
      {
        duration,
        delay: index * stagger,
        easing: SPRING,
      },
    ))
  })

  return animations
}

/* -------------------------------------------------------------------------- */
/* 07. TITLE KEYWORD NETWORK — CONSTELLATION FORMATION                         */
/* -------------------------------------------------------------------------- */

export const animateTitleKeywordNetwork: AnimationRunner = (
  root,
  options = {},
) => {
  if (options.mode === "none") return []

  const nodes = queryAll<SVGElement>(
    root,
    "[data-vt-network-node], .vt-network-node",
  )
  const edges = queryAll<SVGGeometryElement>(
    root,
    "[data-vt-network-edge], .vt-network-edge",
  )

  const animations: Animation[] = []
  const shuffledNodes = seededShuffle(
    nodes,
    options.seed ?? "viewtube-keyword-network",
  )

  const nodeDuration = ms(760, options.mode)
  const nodeStagger = ms(
    boundedStagger(shuffledNodes.length, 2300, 620, 22, 75),
    options.mode,
  )

  shuffledNodes.forEach((node, index) => {
    setTransformOrigin(node)
    animations.push(play(
      node,
      [
        { transform: "translate(0px, 0px) scale(0.08)", opacity: 0 },
        { transform: "translate(0px, 0px) scale(1.24)", opacity: 1, offset: 0.72 },
        { transform: "translate(0px, 0px) scale(1)", opacity: 1 },
      ],
      {
        duration: nodeDuration,
        delay: index * nodeStagger,
        easing: SPRING,
      },
    ))
  })

  edges.forEach((edge, index) => {
    const animation = drawSvgStroke(
      edge,
      ms(780, options.mode),
      ms(620 + index * 26, options.mode),
      SOFT_OUT,
    )
    if (animation) animations.push(animation)
  })

  return animations
}

/* -------------------------------------------------------------------------- */
/* 08. BARCODE FINGERPRINT — SCANNER BUILD                                    */
/* -------------------------------------------------------------------------- */

export const animateBarcodeFingerprint: AnimationRunner = (
  root,
  options = {},
) => {
  if (options.mode === "none") return []

  const bars = queryAll<SVGElement>(
    root,
    "[data-vt-barcode-bar], .vt-barcode-bar",
  )

  const duration = ms(440, options.mode)
  const stagger = ms(
    boundedStagger(bars.length, 2600, 440, 10, 36),
    options.mode,
  )

  return bars.map((bar, index) => {
    setTransformOrigin(bar)
    return play(
      bar,
      [
        { transform: "scaleY(0.03)", opacity: 0.18 },
        { transform: "scaleY(1.18)", opacity: 1, offset: 0.72 },
        { transform: "scaleY(1)", opacity: 1 },
      ],
      {
        duration,
        delay: index * stagger,
        easing: SPRING,
      },
    )
  })
}

/* -------------------------------------------------------------------------- */
/* 09. GEOGRAPHY / GEOTAG CIRCLE GRID                                         */
/* -------------------------------------------------------------------------- */

export const animateGeographyMap: AnimationRunner = (
  root,
  options = {},
) => {
  if (options.mode === "none") return []

  const marks = queryAll<SVGElement | HTMLElement>(
    root,
    "[data-vt-geo-mark], .vt-geo-mark",
  )

  const ordered = seededShuffle(
    marks,
    options.seed ?? "viewtube-geo-ranked-wave",
  )

  const duration = ms(540, options.mode)
  const stagger = ms(
    boundedStagger(ordered.length, 3000, 540, 14, 72),
    options.mode,
  )

  return ordered.map((mark, index) => {
    setTransformOrigin(mark)
    return play(
      mark,
      [
        { transform: "scale(0.06)", opacity: 0 },
        { transform: "scale(1.42)", opacity: 1, offset: 0.58 },
        { transform: "scale(0.94)", opacity: 1, offset: 0.82 },
        { transform: "scale(1)", opacity: 1 },
      ],
      {
        duration,
        delay: index * stagger,
        easing: SPRING,
      },
    )
  })
}

/* -------------------------------------------------------------------------- */
/* 10. ENGAGEMENT PULSE                                                       */
/* -------------------------------------------------------------------------- */

export const animateEngagementPulse: AnimationRunner = (
  root,
  options = {},
) => {
  if (options.mode === "none") return []

  const lines = queryAll<SVGGeometryElement>(
    root,
    ".engagement-line-reveal .recharts-line-curve, .engagement-line-reveal.recharts-line .recharts-line-curve",
  )

  const animations: Animation[] = []

  lines.forEach((line, index) => {
    const primary = index === 0
    const animation = drawSvgStroke(
      line,
      ms(primary ? 1900 : 720, options.mode),
      ms(primary ? 0 : 1850 + (index - 1) * 620, options.mode),
      SOFT_OUT,
    )
    if (animation) animations.push(animation)
  })

  return animations
}

/* -------------------------------------------------------------------------- */
/* 11. FORMAT DOMINANCE — DONUT/POLAR SECTOR SPRING                           */
/* -------------------------------------------------------------------------- */

export const animateFormatDominance: AnimationRunner = (
  root,
  options = {},
) => {
  if (options.mode === "none") return []

  const sectors = queryAll<SVGElement>(
    root,
    ".recharts-pie-sector, [data-vt-format-sector]",
  )

  const duration = ms(620, options.mode)
  const stagger = ms(
    boundedStagger(sectors.length, 2500, 620, 80, 210),
    options.mode,
  )

  return sectors.map((sector, index) => {
    setTransformOrigin(sector)
    return play(
      sector,
      [
        { transform: "scale(0.08) rotate(-14deg)", opacity: 0 },
        { transform: "scale(1.14) rotate(2deg)", opacity: 1, offset: 0.78 },
        { transform: "scale(1) rotate(0deg)", opacity: 1 },
      ],
      {
        duration,
        delay: index * stagger,
        easing: SPRING,
      },
    )
  })
}

/* -------------------------------------------------------------------------- */
/* 12. KEYWORD VENN — THREE-CIRCLE SPRING                                     */
/* -------------------------------------------------------------------------- */

export const animateKeywordVenn: AnimationRunner = (
  root,
  options = {},
) => {
  if (options.mode === "none") return []

  const circles = queryAll<SVGElement>(
    root,
    "[data-vt-venn-circle], .vt-venn-circle",
  ).slice(0, 3)

  return circles.map((circle, index) => {
    setTransformOrigin(circle)
    return play(
      circle,
      [
        { transform: "scale(0.06)", opacity: 0 },
        { transform: "scale(1.22)", opacity: 1, offset: 0.68 },
        { transform: "scale(0.96)", opacity: 1, offset: 0.86 },
        { transform: "scale(1)", opacity: 1 },
      ],
      {
        duration: ms(720, options.mode),
        delay: ms(index * 220, options.mode),
        easing: SPRING,
      },
    )
  })
}

/* -------------------------------------------------------------------------- */
/* Registry + replay controller                                               */
/* -------------------------------------------------------------------------- */

export const HERO_INTRO_RUNNERS: Record<HeroVisualId, AnimationRunner> = {
  "traffic-source-evolution": animateTrafficSourceEvolution,
  "channel-progress": animateChannelProgress,
  "heat-matrix": animateHeatMatrix,
  "shorts-retention": animateScatterBubbles,
  "channel-vital-signs": animateChannelVitalSigns,
  "clockburst": animateClockburst,
  "title-keyword-network": animateTitleKeywordNetwork,
  "barcode-fingerprint": animateBarcodeFingerprint,
  "geography-map": animateGeographyMap,
  "engagement-pulse": animateEngagementPulse,
  "format-dominance": animateFormatDominance,
  "keyword-venn": animateKeywordVenn,
}

export const runHeroVisualIntro = (
  id: HeroVisualId,
  root: ParentNode,
  options: HeroIntroOptions = {},
): Animation[] => HERO_INTRO_RUNNERS[id](root, options)

export const createHeroIntroController = (
  id: HeroVisualId,
  root: ParentNode,
  options: HeroIntroOptions = {},
): HeroIntroController => {
  let animations: Animation[] = []

  const reset = () => {
    animations.forEach((animation) => {
      try {
        animation.cancel()
      } catch {
        // no-op
      }
    })
    animations = []
  }

  const replay = () => {
    reset()
    // Two frames guarantees layout is stable before geometry-based ordering.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        animations = runHeroVisualIntro(id, root, options)
      })
    })
  }

  const destroy = () => reset()

  return { replay, reset, destroy }
}

export const readHeroIntroModeFromUrl = (
  fallback: HeroIntroMode = "full",
): HeroIntroMode => {
  if (typeof window === "undefined") return fallback
  const raw = new URLSearchParams(window.location.search).get("vtIntro")
  if (raw === "none" || raw === "fast" || raw === "full") return raw
  return fallback
}

/**
 * Global replay helper for Showcase Mode:
 *
 * window.dispatchEvent(new CustomEvent("vt:replay-hero-intro"))
 */
export const bindHeroIntroReplayEvent = (
  controller: HeroIntroController,
): (() => void) => {
  if (typeof window === "undefined") return () => undefined
  const replay = () => controller.replay()
  window.addEventListener("vt:replay-hero-intro", replay)
  return () => window.removeEventListener("vt:replay-hero-intro", replay)
}
