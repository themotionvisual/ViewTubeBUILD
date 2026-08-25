/**
 * ViewTube Hero Visual Animation Engine — PR #10 compatible upgrade
 *
 * Target branch:
 *   integration/full-compilation-2026-08-20
 *
 * Drop-in replacement for:
 *   src/components/heroVisualAnimations.ts
 *
 * 12 visuals with 3-7 deterministic replayable animation variants.
 *
 * Variant convention:
 *   0 = INTRO
 *   1 = SHOWCASE
 *   2 = ALT
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
  variant?: number
}

export interface HeroIntroController {
  replay: (overrides?: { variant?: number }) => void
  reset: () => void
  destroy: () => void
}

export const HERO_VISUAL_VARIANT_COUNT: Record<HeroVisualId, number> = {
  // Extended set (7 variants) — 4 new animations per visual added on top of
  // the original 3-variant baseline. Variants 3–6 are unique mechanics that
  // deliberately do NOT share a physics model with 0–2 or with each other.
  "traffic-source-evolution": 7,
  "channel-progress": 7,
  "heat-matrix": 7,
  "shorts-retention": 7,
  "title-keyword-network": 7,
  // Baseline 3-variant visuals — unchanged pending their extension pass.
  "channel-vital-signs": 3,
  "clockburst": 3,
  "barcode-fingerprint": 3,
  "geography-map": 3,
  "engagement-pulse": 3,
  "format-dominance": 3,
  "keyword-venn": 3,
}

type AnimationRunner = (root: ParentNode, options?: HeroIntroOptions) => Animation[]

const SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)"
const SOFT_SPRING = "cubic-bezier(0.22, 1.22, 0.36, 1)"
const SOFT_OUT = "cubic-bezier(0.16, 1, 0.3, 1)"
const GLIDE = "cubic-bezier(0.22, 1, 0.36, 1)"
const LINEAR = "linear"

const modeScale = (mode?: HeroIntroMode) =>
  mode === "none" ? 0 : mode === "fast" ? 0.46 : 1

const ms = (value: number, mode?: HeroIntroMode) =>
  Math.max(1, Math.round(value * modeScale(mode)))

// The mod-count defaults to 3 so untouched runners keep their existing
// behavior. Extended runners pass their own count (typically 7) so higher
// variant slots wrap correctly.
const normalizedVariant = (options?: HeroIntroOptions, count = 3) => {
  const safeCount = Math.max(1, count | 0)
  return (((options?.variant ?? 0) % safeCount) + safeCount) % safeCount
}

const queryAll = <T extends Element = Element>(
  root: ParentNode,
  selector: string,
): T[] => Array.from(root.querySelectorAll<T>(selector))

const release = (animation: Animation) => {
  animation.finished.catch(() => undefined).then(() => {
    try { animation.cancel() } catch {}
  })
  return animation
}

const play = (
  element: Element,
  keyframes: Keyframe[],
  options: KeyframeAnimationOptions,
) => {
  const animation = release(element.animate(keyframes, { fill: "both", ...options }))
  animation.finished.catch(() => undefined).then(() => {
    const animatedElement = element as HTMLElement | SVGElement
    animatedElement.style.willChange = ""
  })
  return animation
}

const setTransformOrigin = (element: Element, origin = "center center") => {
  const svg = element as SVGElement
  svg.style.transformBox = "fill-box"
  svg.style.transformOrigin = origin
  svg.style.willChange = "transform, opacity"
}

const boundedStagger = (
  count: number,
  budget: number,
  duration: number,
  min = 10,
  max = 120,
) => {
  if (count <= 1) return 0
  return Math.max(min, Math.min(max, (budget - duration) / (count - 1)))
}

const seededRandom = (seedInput: string | number = "viewtube") => {
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

const seededShuffle = <T,>(values: readonly T[], seed: string | number) => {
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
  duration: number,
  delay: number,
  easing = SOFT_OUT,
) => {
  let length = 0
  try { length = element.getTotalLength() } catch { return null }
  if (!Number.isFinite(length) || length <= 0) return null
  element.style.strokeDasharray = `${length}`
  element.style.strokeDashoffset = `${length}`
  const animation = element.animate(
    [
      { strokeDashoffset: `${length}`, opacity: 0.08 },
      { strokeDashoffset: "0", opacity: 1 },
    ],
    { duration, delay, easing, fill: "both" },
  )
  animation.finished.catch(() => undefined).then(() => {
    element.style.strokeDasharray = "none"
    element.style.strokeDashoffset = "0"
    try { animation.cancel() } catch {}
  })
  return animation
}

const x = (element: Element) => {
  try { return (element as SVGGraphicsElement).getBBox().x }
  catch { return element.getBoundingClientRect().left }
}
const y = (element: Element) => {
  try { return (element as SVGGraphicsElement).getBBox().y }
  catch { return element.getBoundingClientRect().top }
}
const sortedX = <T extends Element>(items: T[]) => [...items].sort((a,b) => x(a)-x(b))
const sortedY = <T extends Element>(items: T[]) => [...items].sort((a,b) => y(a)-y(b))

/* 01 TRAFFIC SOURCE EVOLUTION -------------------------------------------- */

export const animateTrafficSourceEvolution: AnimationRunner = (root, options={}) => {
  if (options.mode === "none") return []
  const variant = normalizedVariant(options, 7)
  const areas = queryAll<SVGGElement>(
    root,
    ".tse-plot .recharts-area,[class*='tse-area-'].recharts-area,.recharts-area",
  )
  const animations: Animation[] = []
  if (!areas.length) return animations

  if (variant === 0) {
    // LAYERED RIVER
    const stagger = ms(boundedStagger(areas.length, 4200, 1050, 180, 420), options.mode)
    areas.forEach((area,index) => {
      setTransformOrigin(area,index%2===0 ? "left center":"right center")
      animations.push(play(area,[
        {transform:"scaleX(.001)",opacity:.08},
        {transform:"scaleX(1.028)",opacity:1,offset:.88},
        {transform:"scaleX(1)",opacity:1},
      ],{duration:ms(1050,options.mode),delay:index*stagger,easing:GLIDE}))
    })
    return animations
  }

  if (variant === 1) {
    // SOURCE RACE — threads grow into the areas while crossing
    areas.forEach((area,index) => {
      setTransformOrigin(area,"left center")
      animations.push(play(area,[
        {transform:"scaleX(.002) scaleY(.055)",opacity:.2},
        {transform:"scaleX(1) scaleY(.12)",opacity:.8,offset:.55},
        {transform:"scaleX(1) scaleY(1.035)",opacity:1,offset:.9},
        {transform:"scaleX(1) scaleY(1)",opacity:1},
      ],{
        duration:ms(3000+index*120,options.mode),
        delay:ms(index*95,options.mode),
        easing:SOFT_OUT,
      }))
    })
    return animations
  }

  if (variant === 2) {
    // GEOLOGICAL FORMATION
    areas.forEach((area,index) => {
      setTransformOrigin(area,"center bottom")
      animations.push(play(area,[
        {transform:"scaleY(.001)",opacity:.08},
        {transform:"scaleY(1.04)",opacity:1,offset:.87},
        {transform:"scaleY(1)",opacity:1},
      ],{
        duration:ms(1200,options.mode),
        delay:ms(index*360,options.mode),
        easing:GLIDE,
      }))
    })
    return animations
  }

  if (variant === 3) {
    // TIDAL BLOOM — radial expansion + soft blur bloom, then sharpen. Origin
    // is the middle of the plot so the flood reads as a shockwave outward
    // from the center rather than a horizontal wipe.
    areas.forEach((area,index) => {
      setTransformOrigin(area,"center center")
      animations.push(play(area,[
        {transform:"scale(.05)",opacity:0,filter:"blur(18px) saturate(2)"},
        {transform:"scale(1.18)",opacity:1,offset:.55,filter:"blur(4px) saturate(1.35)"},
        {transform:"scale(.98)",opacity:1,offset:.82,filter:"blur(0) saturate(1)"},
        {transform:"scale(1)",opacity:1,filter:"blur(0) saturate(1)"},
      ],{
        duration:ms(1500,options.mode),
        delay:ms(index*140,options.mode),
        easing:SOFT_SPRING,
      }))
    })
    return animations
  }

  if (variant === 4) {
    // STROBE STACK — sharp flashes from top layer downward. Each area starts
    // over-bright, snaps to normal after a brief hold. Reverse order because
    // stacked areas paint bottom→top in most Recharts fills.
    const order=[...areas].reverse()
    const flashStep=ms(160,options.mode)
    order.forEach((area,index) => {
      setTransformOrigin(area,"center center")
      animations.push(play(area,[
        {transform:"scale(1)",opacity:0,filter:"brightness(2.4)"},
        {transform:"scale(1.015)",opacity:1,offset:.12,filter:"brightness(1.85)"},
        {transform:"scale(1)",opacity:1,offset:.28,filter:"brightness(1.15)"},
        {transform:"scale(1)",opacity:1,filter:"brightness(1)"},
      ],{
        duration:ms(720,options.mode),
        delay:index*flashStep,
        easing:LINEAR,
      }))
    })
    return animations
  }

  if (variant === 5) {
    // CARBON DATE — bottom-up strata reveal using clipPath inset. Each area
    // exposes from its baseline upward, evoking a geological x-ray one layer
    // at a time.
    const stepBeat=ms(430,options.mode)
    areas.forEach((area,index) => {
      area.style.transformBox="fill-box"
      area.style.transformOrigin="center bottom"
      area.style.clipPath="inset(100% 0 0 0)"
      area.style.willChange="clip-path,opacity"
      animations.push(play(area,[
        {clipPath:"inset(100% 0 0 0)",opacity:.15},
        {clipPath:"inset(0 0 0 0)",opacity:1,offset:.92},
        {clipPath:"inset(0 0 0 0)",opacity:1},
      ],{
        duration:ms(1100,options.mode),
        delay:index*stepBeat,
        easing:SOFT_OUT,
      }))
    })
    return animations
  }

  // variant === 6 — PULSE MESH: only the top stroke of every layer draws,
  // simultaneously, on a shared dash-offset pulse. The fill itself remains
  // visible from the previous state; this is the flourish that reads as the
  // sources electrifying at once.
  const strokes:SVGGeometryElement[]=[]
  areas.forEach(area => {
    const curve=area.querySelector<SVGGeometryElement>(".recharts-area-curve, path.recharts-curve")
    if (curve) strokes.push(curve)
  })
  if (!strokes.length) {
    // Fall back to a light glimmer on the fills so the flourish never
    // silently no-ops when the sub-paths cannot be identified.
    areas.forEach((area,index) => {
      setTransformOrigin(area,"center center")
      animations.push(play(area,[
        {opacity:1,filter:"brightness(1)"},
        {opacity:1,filter:"brightness(1.4)",offset:.35},
        {opacity:1,filter:"brightness(1)"},
      ],{
        duration:ms(950,options.mode),
        delay:ms(index*60,options.mode),
        easing:LINEAR,
      }))
    })
    return animations
  }
  const pulseStagger=ms(80,options.mode)
  strokes.forEach((stroke,index) => {
    const anim=drawSvgStroke(
      stroke,
      ms(1300,options.mode),
      index*pulseStagger,
      SOFT_OUT,
    )
    if (anim) animations.push(anim)
    // Follow-up glimmer so the mesh feels charged after the trace lands.
    animations.push(play(stroke,[
      {opacity:1,filter:"brightness(1)",offset:0},
      {opacity:1,filter:"brightness(1.7) saturate(1.5)",offset:.45},
      {opacity:1,filter:"brightness(1)",offset:1},
    ],{
      duration:ms(720,options.mode),
      delay:ms(1300,options.mode)+index*pulseStagger,
      easing:LINEAR,
    }))
  })
  return animations
}

/* 02 CHANNEL PROGRESS ---------------------------------------------------- */

const channelBars = (root: ParentNode) =>
  sortedX(queryAll<SVGGraphicsElement>(
    root,
    "[data-vt-channel-progress-bar],.recharts-bar-rectangle .recharts-rectangle,.recharts-bar-rectangle path,.recharts-bar-rectangle rect,.recharts-bar-rectangle",
  ))

const channelLines = (root: ParentNode) =>
  queryAll<SVGGeometryElement>(
    root,
    "[data-vt-channel-progress-line],.recharts-line-curve",
  )

const channelDots = (root: ParentNode) =>
  sortedX(queryAll<SVGGraphicsElement>(
    root,
    "[data-vt-channel-progress-dot],.recharts-line-dot,circle.recharts-dot",
  ))

const channelBarSeries = (root: ParentNode): SVGGraphicsElement[][] => {
  const series = queryAll<SVGGElement>(root, ".recharts-bar")
    .map((group) => queryAll<SVGGraphicsElement>(group, ".recharts-rectangle,path,rect"))
    .filter((bars) => bars.length > 0)
  return series.length > 0 ? series : [channelBars(root)]
}

const channelDotSeries = (root: ParentNode): SVGGraphicsElement[][] => {
  const series = queryAll<SVGGElement>(root, ".recharts-line")
    .map((group) => sortedX(queryAll<SVGGraphicsElement>(group, ".recharts-line-dot,circle.recharts-dot")))
    .filter((dots) => dots.length > 0)
  return series.length > 0 ? series : [channelDots(root)]
}

const safeChannelPeak = (bar: SVGGraphicsElement, travel: number, maxOvershoot=1.13) => {
  try {
    const box = bar.getBBox()
    if (!box.height) return 1.03
    const bell = Math.sin(Math.PI*Math.max(0,Math.min(1,travel)))
    const desired = 1.025 + bell*(maxOvershoot-1.025)
    // Prevent the visual ceiling collision. Scale occurs around bar bottom.
    const safe = 1 + Math.max(0,box.y-7)/box.height
    return Math.max(1.005,Math.min(desired,safe))
  } catch {
    return 1.035
  }
}

const travelDelay = (
  index:number,
  count:number,
  direction:"ltr"|"rtl",
  span:number,
) => {
  if (count <= 1) return 0
  const natural=index/(count-1)
  const travel=direction==="ltr"?natural:1-natural
  // Slow launch, gently accelerates toward the far axis.
  return Math.pow(Math.max(0,Math.min(1,travel)),.62)*span
}

const runChannelTide = (
  root:ParentNode,
  options:HeroIntroOptions,
  echoCount=1,
) => {
  const barSeries=channelBarSeries(root)
  const lines=channelLines(root)
  const dotSeries=channelDotSeries(root)
  const bars=barSeries.flat()
  const animations:Animation[]=[]
  if (!bars.length) return animations

  // Infer metric series from line count. The choreography remains deterministic.
  const metricCount=Math.max(1,barSeries.length,lines.length,dotSeries.length)
  const outboundSpan=ms(3900,options.mode)

  for (let metricIndex=0;metricIndex<metricCount;metricIndex++) {
    const metricBars=barSeries[metricIndex] ?? []
    const metricDots=dotSeries[metricIndex] ?? []
    const direction:"ltr"|"rtl" =
      metricCount===2 ? (metricIndex===0?"ltr":"rtl") :
      metricIndex%2===0 ? "ltr":"rtl"
    const start=metricCount>=3 ? ms(metricIndex*300,options.mode) : 0

    for (let echo=0;echo<echoCount;echo++) {
      const echoDelay=ms(echo*620,options.mode)
      const echoPeak=echo===0?1.13:echo===1?1.16:1.07
      metricBars.forEach((bar,index) => {
        const n=metricBars.length<=1?.5:index/(metricBars.length-1)
        const travel=direction==="ltr"?n:1-n
        setTransformOrigin(bar,"center bottom")
        animations.push(play(bar,[
          {transform:"scaleY(.06)",opacity:.12,offset:0},
          {transform:`scaleY(${safeChannelPeak(bar,travel,echoPeak)})`,opacity:1,offset:.44},
          {transform:"scaleY(.965)",opacity:1,offset:.66},
          {transform:"scaleY(1.018)",opacity:1,offset:.86},
          {transform:"scaleY(1)",opacity:1,offset:1},
        ],{
          duration:ms(1450,options.mode),
          delay:start+echoDelay+ms(travelDelay(index,metricBars.length,direction,3900),options.mode),
          easing:LINEAR,
        }))
      })
    }

    // Return half-wave from the far axis. Dots lead, line follows.
    const returnDirection:"ltr"|"rtl"=direction==="ltr"?"rtl":"ltr"
    const returnStart=start+outboundSpan+ms(170+(echoCount-1)*620,options.mode)

    metricDots.forEach((dot,index) => {
      setTransformOrigin(dot)
      animations.push(play(dot,[
        {transform:"scale(0)",opacity:0,offset:0},
        {transform:"scale(1.34)",opacity:1,offset:.46},
        {transform:"scale(.9)",opacity:1,offset:.7},
        {transform:"scale(1.055)",opacity:1,offset:.88},
        {transform:"scale(1)",opacity:1,offset:1},
      ],{
        duration:ms(800,options.mode),
        delay:returnStart+ms(travelDelay(index,metricDots.length,returnDirection,1950),options.mode),
        easing:SPRING,
      }))
    })

    const line=lines[metricIndex] ?? lines[0]
    if (line) {
      const animation=drawSvgStroke(
        line,
        ms(2350,options.mode),
        returnStart+ms(250,options.mode),
        SOFT_OUT,
      )
      if (animation) animations.push(animation)
    }
  }
  return animations
}

export const animateChannelProgress: AnimationRunner = (root,options={}) => {
  if (options.mode==="none") return []
  const variant=normalizedVariant(options, 7)
  if (variant===0) return runChannelTide(root,options,1)       // TRAVELING TIDE
  if (variant===1) return runChannelTide(root,options,3)       // ECHO WAVES

  if (variant===2) {
    // GROWTH IGNITION
    const bars=channelBars(root)
    const lines=channelLines(root)
    const animations:Animation[]=[]
    const stagger=ms(boundedStagger(bars.length,3700,900,25,105),options.mode)
    bars.forEach((bar,index)=>{
      setTransformOrigin(bar,"center bottom")
      const progress=bars.length<=1?0:index/(bars.length-1)
      animations.push(play(bar,[
        {transform:"scaleY(.04)",opacity:.15},
        {transform:`scaleY(${1.035+progress*.08})`,opacity:1,offset:.72},
        {transform:"scaleY(.97)",opacity:1,offset:.86},
        {transform:"scaleY(1)",opacity:1},
      ],{
        duration:ms(900-progress*120,options.mode),
        delay:index*stagger,
        easing:SOFT_SPRING,
      }))
    })
    lines.forEach((line,index)=>{
      const a=drawSvgStroke(line,ms(1700,options.mode),ms(3150+index*180,options.mode),SOFT_OUT)
      if (a) animations.push(a)
    })
    return animations
  }

  if (variant===3) {
    // METRONOME MARCH — 3D domino flip. Bars start rotated back on the
    // X axis (invisible edge to the viewer) and flip forward one by one.
    // Reads as clean rhythmic reveal, no scale bounce.
    const bars=channelBars(root)
    const lines=channelLines(root)
    const animations:Animation[]=[]
    const dominoStep=ms(boundedStagger(bars.length,3200,650,32,140),options.mode)
    bars.forEach((bar,index)=>{
      setTransformOrigin(bar,"center bottom")
      // Perspective sits on the parent chart; setting on the bar keeps the
      // rotation local so bars don't shear each other.
      bar.style.perspective="600px"
      animations.push(play(bar,[
        {transform:"perspective(600px) rotateX(-92deg)",opacity:0},
        {transform:"perspective(600px) rotateX(6deg)",opacity:1,offset:.75},
        {transform:"perspective(600px) rotateX(-3deg)",opacity:1,offset:.9},
        {transform:"perspective(600px) rotateX(0)",opacity:1},
      ],{
        duration:ms(650,options.mode),
        delay:index*dominoStep,
        easing:SPRING,
      }))
    })
    // Lines drape in AFTER the dominoes settle.
    const linesStart=ms(400,options.mode)+bars.length*dominoStep
    lines.forEach((line,index)=>{
      const a=drawSvgStroke(line,ms(1400,options.mode),linesStart+ms(index*160,options.mode),SOFT_OUT)
      if (a) animations.push(a)
    })
    return animations
  }

  if (variant===4) {
    // STAIRCASE ASCENT — bars pause at prior bar's height first, then jump
    // to their real value. Reads as a rising staircase where each step
    // "catches up" to the next. Directionally left→right, escalating.
    const bars=channelBars(root)
    const lines=channelLines(root)
    const animations:Animation[]=[]
    const stepBeat=ms(boundedStagger(bars.length,3600,720,50,180),options.mode)
    bars.forEach((bar,index)=>{
      setTransformOrigin(bar,"center bottom")
      // Percentage-of-final-height that acts as the "prior step" landing pad.
      // First bar starts small; later bars catch closer to their final size.
      const priorFraction=bars.length<=1?.2:Math.min(.85,.15+(index/(bars.length-1))*.6)
      animations.push(play(bar,[
        {transform:"scaleY(.02)",opacity:0},
        {transform:`scaleY(${priorFraction})`,opacity:1,offset:.4,easing:SOFT_OUT},
        {transform:`scaleY(${priorFraction})`,opacity:1,offset:.55},
        {transform:"scaleY(1.04)",opacity:1,offset:.85,easing:SPRING},
        {transform:"scaleY(1)",opacity:1},
      ],{
        duration:ms(720,options.mode),
        delay:index*stepBeat,
        easing:LINEAR,
      }))
    })
    lines.forEach((line,index)=>{
      const a=drawSvgStroke(
        line,
        ms(1600,options.mode),
        ms(200,options.mode)+bars.length*stepBeat+ms(index*160,options.mode),
        SOFT_OUT,
      )
      if (a) animations.push(a)
    })
    return animations
  }

  if (variant===5) {
    // QUANTUM COLLAPSE — all bars appear at once as translucent probability
    // clouds across their full expected height range, then collapse
    // simultaneously to their real values. Reads sci-fi.
    const bars=channelBars(root)
    const lines=channelLines(root)
    const animations:Animation[]=[]
    bars.forEach((bar,index)=>{
      setTransformOrigin(bar,"center bottom")
      const jitter=(((index*97)%13)-6)*.008 // deterministic per-bar wobble
      animations.push(play(bar,[
        {transform:`scaleY(1.15) translateY(${jitter*20}px)`,opacity:0,filter:"blur(6px)"},
        {transform:`scaleY(1.15) translateY(${jitter*20}px)`,opacity:.34,offset:.24,filter:"blur(6px)"},
        {transform:"scaleY(1.05)",opacity:.75,offset:.55,filter:"blur(2px)"},
        {transform:"scaleY(.97)",opacity:1,offset:.82,filter:"blur(0)"},
        {transform:"scaleY(1)",opacity:1,filter:"blur(0)"},
      ],{
        duration:ms(1500,options.mode),
        delay:ms(120,options.mode), // all bars share one collapse — no stagger
        easing:SOFT_OUT,
      }))
    })
    lines.forEach((line,index)=>{
      const a=drawSvgStroke(line,ms(1400,options.mode),ms(1150+index*160,options.mode),SOFT_OUT)
      if (a) animations.push(a)
    })
    return animations
  }

  // variant === 6 — HELIX RIBBON: bars pop up bottom-up quickly, then the
  // lines draw as if unspooling from a rotating ribbon (rotation via a
  // parent group transform). The lines get an initial spin that decays into
  // the true trace shape.
  const bars=channelBars(root)
  const lines=channelLines(root)
  const animations:Animation[]=[]
  const barStagger=ms(boundedStagger(bars.length,1800,500,15,60),options.mode)
  bars.forEach((bar,index)=>{
    setTransformOrigin(bar,"center bottom")
    animations.push(play(bar,[
      {transform:"scaleY(.06)",opacity:.2},
      {transform:"scaleY(1.03)",opacity:1,offset:.78},
      {transform:"scaleY(1)",opacity:1},
    ],{
      duration:ms(500,options.mode),
      delay:index*barStagger,
      easing:SOFT_SPRING,
    }))
  })
  const linesStart=ms(300,options.mode)+bars.length*barStagger
  lines.forEach((line,index)=>{
    // Parent-group ribbon spin. Applying transform-origin to the line's
    // own bounding box gives us a swirl that unwinds into the trace.
    line.style.transformBox="fill-box"
    line.style.transformOrigin="left center"
    line.style.willChange="transform,opacity"
    // Preserve initial state so stroke draw can also target it.
    animations.push(play(line,[
      {transform:"rotate(-14deg) scaleY(.4)",opacity:.4},
      {transform:"rotate(6deg) scaleY(1.1)",opacity:.85,offset:.55},
      {transform:"rotate(-2deg) scaleY(1)",opacity:1,offset:.82},
      {transform:"rotate(0) scaleY(1)",opacity:1},
    ],{
      duration:ms(1350,options.mode),
      delay:linesStart+ms(index*200,options.mode),
      easing:SPRING,
    }))
    const a=drawSvgStroke(line,ms(1200,options.mode),linesStart+ms(index*200,options.mode),SOFT_OUT)
    if (a) animations.push(a)
  })
  return animations
}

/* 03 HEAT MATRIX --------------------------------------------------------- */

const groupTilesIntoRows = (tiles:HTMLElement[]) => {
  const rows=new Map<number,HTMLElement[]>()
  tiles.forEach(tile=>{
    const rect=tile.getBoundingClientRect()
    const key=Math.round(rect.top/3)*3
    const bucket=rows.get(key)??[]
    bucket.push(tile); rows.set(key,bucket)
  })
  return [...rows.entries()]
    .sort(([a],[b])=>a-b)
    .map(([,row])=>[...row].sort((a,b)=>a.getBoundingClientRect().left-b.getBoundingClientRect().left))
}

const groupTilesIntoColumns = (tiles:HTMLElement[]) => {
  const cols=new Map<number,HTMLElement[]>()
  tiles.forEach(tile=>{
    const rect=tile.getBoundingClientRect()
    const key=Math.round(rect.left/3)*3
    const bucket=cols.get(key)??[]
    bucket.push(tile); cols.set(key,bucket)
  })
  return [...cols.entries()]
    .sort(([a],[b])=>a-b)
    .map(([,col])=>[...col].sort((a,b)=>a.getBoundingClientRect().top-b.getBoundingClientRect().top))
}

const heatSpringFrames=(peak=1.5):Keyframe[]=>[
  {transform:"scale(.14)",opacity:.08,offset:0},
  {transform:`scale(${peak})`,opacity:1,offset:.34},
  {transform:"scale(.75)",opacity:1,offset:.56},
  {transform:"scale(1.075)",opacity:1,offset:.88},
  {transform:"scale(1)",opacity:1,offset:1},
]

export const animateHeatMatrix: AnimationRunner = (root,options={}) => {
  if (options.mode==="none") return []
  const variant=normalizedVariant(options, 7)
  const tiles=queryAll<HTMLElement>(root,".vt-heat-tile,[data-vt-heat-tile]")
  if (!tiles.length) return []
  const animations:Animation[]=[]

  if (variant===0) {
    // HORIZONTAL THERMAL WAVE — requested canonical.
    const rows=groupTilesIntoRows(tiles)
    const maxCols=Math.max(1,...rows.map(r=>r.length))
    rows.forEach((row,rowIndex)=>{
      row.forEach((tile,colIndex)=>{
        setTransformOrigin(tile)
        // Much wider envelope: 5+ neighboring cells overlap in motion.
        const delay=ms(colIndex*58+rowIndex*38,options.mode)
        animations.push(play(tile,heatSpringFrames(1.5),{
          duration:ms(1280,options.mode),
          delay,
          easing:LINEAR,
        }))
      })
    })

    // Row rebound comes back the other direction.
    const outboundEnd=ms(maxCols*58+1280+150,options.mode)
    rows.forEach((row,rowIndex)=>{
      [...row].reverse().forEach((tile,reverseIndex)=>{
        animations.push(play(tile,[
          {transform:"scale(1)"},
          {transform:"scale(1.22)",offset:.28},
          {transform:"scale(.84)",offset:.50},
          {transform:"scale(1.045)",offset:.82},
          {transform:"scale(1)"},
        ],{
          duration:ms(920,options.mode),
          delay:outboundEnd+ms(reverseIndex*44+rowIndex*80,options.mode),
          easing:SPRING,
        }))
      })
    })
    return animations
  }

  if (variant===1) {
    // HEAT DROP
    const cx=tiles.reduce((s,t)=>s+t.getBoundingClientRect().left,0)/tiles.length
    const cy=tiles.reduce((s,t)=>s+t.getBoundingClientRect().top,0)/tiles.length
    const ordered=[...tiles].sort((a,b)=>{
      const ar=a.getBoundingClientRect(), br=b.getBoundingClientRect()
      const ad=Math.hypot(ar.left-cx,ar.top-cy), bd=Math.hypot(br.left-cx,br.top-cy)
      return ad-bd
    })
    const stagger=ms(boundedStagger(ordered.length,3000,1000,12,55),options.mode)
    ordered.forEach((tile,index)=>{
      setTransformOrigin(tile)
      animations.push(play(tile,heatSpringFrames(index===0?1.62:1.42),{
        duration:ms(1080,options.mode),
        delay:index*stagger,
        easing:SPRING,
      }))
    })
    return animations
  }

  if (variant===2) {
    // DIGITAL RAIN
    const columns=groupTilesIntoColumns(tiles)
    columns.forEach((column,colIndex)=>{
      column.forEach((tile,rowIndex)=>{
        setTransformOrigin(tile)
        animations.push(play(tile,heatSpringFrames(1.44),{
          duration:ms(980,options.mode),
          delay:ms(colIndex*95+rowIndex*80,options.mode),
          easing:SPRING,
        }))
      })
    })
    return animations
  }

  if (variant===3) {
    // QUENCH FLASH — all tiles flash white simultaneously, then colors bleed
    // in with a soft brightness decay. Reads as a lens exposure or a
    // thermal-quench moment.
    tiles.forEach((tile,index)=>{
      setTransformOrigin(tile)
      const microJitter=((index%7)-3)*.006 // subtle per-tile timing spread
      animations.push(play(tile,[
        {transform:"scale(1)",opacity:0,filter:"brightness(3.4) saturate(0)"},
        {transform:"scale(1.04)",opacity:1,offset:.14,filter:"brightness(2.6) saturate(0)"},
        {transform:"scale(1)",opacity:1,offset:.36,filter:"brightness(1.6) saturate(.55)"},
        {transform:"scale(1)",opacity:1,offset:.7,filter:"brightness(1.12) saturate(1)"},
        {transform:"scale(1)",opacity:1,filter:"brightness(1) saturate(1)"},
      ],{
        duration:ms(1400,options.mode),
        delay:ms(20+microJitter*400,options.mode),
        easing:SOFT_OUT,
      }))
    })
    return animations
  }

  if (variant===4) {
    // CRYSTAL LATTICE — checkerboard fill. Even-parity tiles pop first,
    // then the odd tiles fill the gaps. Feels like a lattice crystallizing.
    const rows=groupTilesIntoRows(tiles)
    const evens:HTMLElement[]=[]
    const odds:HTMLElement[]=[]
    rows.forEach((row,rowIndex)=>{
      row.forEach((tile,colIndex)=>{
        if ((rowIndex+colIndex)%2===0) evens.push(tile)
        else odds.push(tile)
      })
    })
    const evenStagger=ms(boundedStagger(evens.length,1200,520,8,32),options.mode)
    const oddStart=ms(700,options.mode)
    const oddStagger=ms(boundedStagger(odds.length,1200,520,8,32),options.mode)
    evens.forEach((tile,index)=>{
      setTransformOrigin(tile)
      animations.push(play(tile,heatSpringFrames(1.35),{
        duration:ms(520,options.mode),
        delay:index*evenStagger,
        easing:SPRING,
      }))
    })
    odds.forEach((tile,index)=>{
      setTransformOrigin(tile)
      animations.push(play(tile,heatSpringFrames(1.35),{
        duration:ms(520,options.mode),
        delay:oddStart+index*oddStagger,
        easing:SPRING,
      }))
    })
    return animations
  }

  if (variant===5) {
    // RIPPLE POND — concentric rings expand outward from the hottest tile.
    // Hottest = the one marked rank-one (see ThermalImagingModuleInner). If
    // no rank-one marker exists, use the geometric center as the source.
    const rankOne=tiles.find(tile=>tile.classList.contains("is-rank-one"))??tiles[0]
    const source=rankOne.getBoundingClientRect()
    const sx=source.left+source.width/2
    const sy=source.top+source.height/2
    // Bucket tiles into ripple rings by rounded distance so groups of tiles
    // pop together per ring, giving the effect real thickness.
    const withDistance=tiles.map(tile=>{
      const rect=tile.getBoundingClientRect()
      const d=Math.hypot((rect.left+rect.width/2)-sx,(rect.top+rect.height/2)-sy)
      return {tile,d}
    })
    // Ring bucketing: quantize to a coarse ring width proportional to a tile
    // size so adjacent-distance tiles land in the same ring.
    const ringWidth=Math.max(28,source.width*.9)
    const rings=new Map<number,HTMLElement[]>()
    withDistance.forEach(({tile,d})=>{
      const key=Math.round(d/ringWidth)
      const bucket=rings.get(key)??[]; bucket.push(tile); rings.set(key,bucket)
    })
    const sortedRings=[...rings.entries()].sort(([a],[b])=>a-b).map(([,r])=>r)
    const ringBeat=ms(140,options.mode)
    sortedRings.forEach((ring,ringIndex)=>{
      ring.forEach((tile,indexInRing)=>{
        setTransformOrigin(tile)
        // A small intra-ring jitter keeps the ring from looking robotic.
        const jitter=(indexInRing%3)*ms(30,options.mode)
        animations.push(play(tile,heatSpringFrames(ringIndex===0?1.72:1.42),{
          duration:ms(760,options.mode),
          delay:ringIndex*ringBeat+jitter,
          easing:SPRING,
        }))
      })
    })
    return animations
  }

  // variant === 6 — NIGHT VISION SWEEP: dark canvas, a horizontal green
  // scanline sweeps top→bottom. Tiles ignite as the line crosses them. All
  // tiles start invisible with a green pre-glow; each ignites when its own
  // row's scan tick arrives. Bottom rows fire last.
  const rows=groupTilesIntoRows(tiles)
  const rowBeat=ms(180,options.mode)
  rows.forEach((row,rowIndex)=>{
    // Small left-to-right ripple inside the row so the scan feels like it
    // has micro-fine granularity rather than a hard row flash.
    row.forEach((tile,colIndex)=>{
      setTransformOrigin(tile)
      const intraDelay=ms(colIndex*22,options.mode)
      animations.push(play(tile,[
        {transform:"scale(.85)",opacity:0,filter:"brightness(.35) saturate(0) hue-rotate(90deg)"},
        {transform:"scale(1.32)",opacity:1,offset:.16,filter:"brightness(3.2) saturate(2.4) hue-rotate(80deg)"},
        {transform:"scale(1.08)",opacity:1,offset:.42,filter:"brightness(2) saturate(1.6) hue-rotate(45deg)"},
        {transform:"scale(1)",opacity:1,offset:.72,filter:"brightness(1.35) saturate(1.15) hue-rotate(12deg)"},
        {transform:"scale(1)",opacity:1,filter:"brightness(1) saturate(1) hue-rotate(0)"},
      ],{
        duration:ms(900,options.mode),
        delay:rowIndex*rowBeat+intraDelay,
        easing:SOFT_OUT,
      }))
    })
  })
  return animations
}

/* 04 SHORTS RETENTION / SCATTERS ---------------------------------------- */

const scatterTargets=(root:ParentNode)=>{
  const preferred=queryAll<SVGElement>(root,".vt-scatter-bubble-core")
  return preferred.length?preferred:queryAll<SVGElement>(root,".recharts-scatter-symbol")
}

export const animateScatterBubbles: AnimationRunner=(root,options={})=>{
  if(options.mode==="none") return []
  const variant=normalizedVariant(options, 7)
  const bubbles=scatterTargets(root)
  const animations:Animation[]=[]
  if(!bubbles.length) return animations

  if(variant===0){
    // POPCORN UNIVERSE
    const shuffled=seededShuffle(bubbles,options.seed??"viewtube-popcorn")
    const stagger=ms(boundedStagger(shuffled.length,3000,650,10,55),options.mode)
    shuffled.forEach((bubble,index)=>{
      setTransformOrigin(bubble)
      animations.push(play(bubble,[
        {transform:"scale(0)",opacity:0},
        {transform:"scale(1.6)",opacity:1,offset:.5},
        {transform:"scale(.8)",opacity:1,offset:.72},
        {transform:"scale(1.05)",opacity:1,offset:.88},
        {transform:"scale(1)",opacity:1},
      ],{duration:ms(650,options.mode),delay:index*stagger,easing:SPRING}))
    })
    return animations
  }

  if(variant===1){
    // DATA CANNON
    bubbles.forEach((bubble,index)=>{
      setTransformOrigin(bubble)
      const rect=bubble.getBoundingClientRect()
      const rootRect=(root as Element).getBoundingClientRect?.() ?? {left:0,bottom:0}
      const dx=(rootRect.left-rect.left)
      const dy=(rootRect.bottom-rect.bottom)
      animations.push(play(bubble,[
        {transform:`translate(${dx}px,${dy}px) scale(.2)`,opacity:0},
        {transform:"translate(0,0) scale(1.15)",opacity:1,offset:.82},
        {transform:"translate(0,0) scale(1)",opacity:1},
      ],{
        duration:ms(1500,options.mode),
        delay:ms(index*28,options.mode),
        easing:SOFT_SPRING,
      }))
    })
    return animations
  }

  if(variant===2){
    // GRAVITY DROP
    bubbles.forEach((bubble,index)=>{
      setTransformOrigin(bubble)
      animations.push(play(bubble,[
        {transform:"translateY(-120px) scale(.75)",opacity:0},
        {transform:"translateY(12px) scale(1.05)",opacity:1,offset:.72},
        {transform:"translateY(-5px) scale(.98)",opacity:1,offset:.86},
        {transform:"translateY(0) scale(1)",opacity:1},
      ],{
        duration:ms(1100,options.mode),
        delay:ms(index*30,options.mode),
        easing:SPRING,
      }))
    })
    return animations
  }

  // Shared helper for radial vectors relative to the plot center.
  const plotRect=(root as Element).getBoundingClientRect?.() ?? {left:0,top:0,width:0,height:0} as DOMRect
  const cx=plotRect.left+plotRect.width/2
  const cy=plotRect.top+plotRect.height/2

  if(variant===3){
    // CENTRIFUGE — every bubble starts collapsed at the plot's center and
    // flies out on its own radial vector to its true position. Overshoots
    // slightly before settling to convey momentum.
    const shuffled=seededShuffle(bubbles,options.seed??"viewtube-centrifuge")
    const spin=ms(1050,options.mode)
    shuffled.forEach((bubble,index)=>{
      setTransformOrigin(bubble)
      const rect=bubble.getBoundingClientRect()
      const bx=rect.left+rect.width/2
      const by=rect.top+rect.height/2
      const dx=cx-bx
      const dy=cy-by
      // Small tangent kick so bubbles arc out rather than moving perfectly
      // radial — deterministic per bubble.
      const swirl=((index%5)-2)*.35
      animations.push(play(bubble,[
        {transform:`translate(${dx}px,${dy}px) scale(0) rotate(${swirl*180}deg)`,opacity:0},
        {transform:`translate(${dx*.35}px,${dy*.35}px) scale(1.28) rotate(${swirl*60}deg)`,opacity:1,offset:.55},
        {transform:`translate(${dx*-.06}px,${dy*-.06}px) scale(.92) rotate(0)`,opacity:1,offset:.82},
        {transform:"translate(0,0) scale(1) rotate(0)",opacity:1},
      ],{
        duration:spin,
        delay:ms(index*22,options.mode),
        easing:SOFT_SPRING,
      }))
    })
    return animations
  }

  if(variant===4){
    // SLING SHOT — bubbles arc in from the nearest off-screen edge on
    // parabolic paths. Each bubble picks its edge based on the quadrant it
    // lives in. Reads as projectile motion, not orbital.
    const shuffled=seededShuffle(bubbles,options.seed??"viewtube-slingshot")
    shuffled.forEach((bubble,index)=>{
      setTransformOrigin(bubble)
      const rect=bubble.getBoundingClientRect()
      const bx=rect.left+rect.width/2
      const by=rect.top+rect.height/2
      // Pick the nearest edge; travel a couple hundred pixels beyond it.
      const distances={
        left:bx-plotRect.left,
        right:(plotRect.left+plotRect.width)-bx,
        top:by-plotRect.top,
        bottom:(plotRect.top+plotRect.height)-by,
      }
      const min=Math.min(distances.left,distances.right,distances.top,distances.bottom)
      const edge=(Object.keys(distances) as (keyof typeof distances)[]).find(k=>distances[k]===min)!
      const throwDistance=180
      let fromX=0,fromY=0,peakX=0,peakY=0
      if(edge==="left"){fromX=-(distances.left+throwDistance);fromY=-40;peakX=fromX*.5;peakY=-90}
      else if(edge==="right"){fromX=distances.right+throwDistance;fromY=-40;peakX=fromX*.5;peakY=-90}
      else if(edge==="top"){fromY=-(distances.top+throwDistance);fromX=-40;peakY=fromY*.5;peakX=-90}
      else{fromY=distances.bottom+throwDistance;fromX=-40;peakY=fromY*.5;peakX=-90}
      animations.push(play(bubble,[
        {transform:`translate(${fromX}px,${fromY}px) scale(.6)`,opacity:0},
        {transform:`translate(${peakX}px,${peakY}px) scale(.9)`,opacity:.9,offset:.55},
        {transform:"translate(0,0) scale(1.14)",opacity:1,offset:.82},
        {transform:"translate(0,0) scale(1)",opacity:1},
      ],{
        duration:ms(1200,options.mode),
        delay:ms(index*30,options.mode),
        easing:SOFT_OUT,
      }))
    })
    return animations
  }

  if(variant===5){
    // CONSTELLATION FORM — bubbles fade in dim, brighten to full, then a
    // brief bloom pulse fires across the whole set as if constellations
    // wired together and lit briefly.
    const beat=ms(30,options.mode)
    bubbles.forEach((bubble,index)=>{
      setTransformOrigin(bubble)
      animations.push(play(bubble,[
        {transform:"scale(.4)",opacity:0,filter:"brightness(.6)"},
        {transform:"scale(1.1)",opacity:.6,offset:.4,filter:"brightness(1.4)"},
        {transform:"scale(1)",opacity:1,offset:.7,filter:"brightness(1)"},
        {transform:"scale(1.05)",opacity:1,offset:.86,filter:"brightness(2.2) saturate(1.5)"},
        {transform:"scale(1)",opacity:1,filter:"brightness(1) saturate(1)"},
      ],{
        duration:ms(1200,options.mode),
        delay:index*beat,
        easing:SOFT_OUT,
      }))
    })
    return animations
  }

  // variant === 6 — SHUFFLE DECK: bubbles slide in from the top-left corner
  // in a shuffled order, snapping into position one by one. Reads as cards
  // being dealt at speed.
  const shuffled=seededShuffle(bubbles,options.seed??"viewtube-shuffle-deck")
  const dealBeat=ms(38,options.mode)
  const dealOrigin={x:plotRect.left-140,y:plotRect.top-140}
  shuffled.forEach((bubble,index)=>{
    setTransformOrigin(bubble)
    const rect=bubble.getBoundingClientRect()
    const dx=(dealOrigin.x-(rect.left+rect.width/2))
    const dy=(dealOrigin.y-(rect.top+rect.height/2))
    animations.push(play(bubble,[
      {transform:`translate(${dx}px,${dy}px) scale(.85) rotate(-25deg)`,opacity:0},
      {transform:`translate(${dx*.25}px,${dy*.25}px) scale(1) rotate(-8deg)`,opacity:1,offset:.55},
      {transform:"translate(0,0) scale(1.08) rotate(4deg)",opacity:1,offset:.82},
      {transform:"translate(0,0) scale(1) rotate(0)",opacity:1},
    ],{
      duration:ms(700,options.mode),
      delay:index*dealBeat,
      easing:SPRING,
    }))
  })
  return animations
}

/* 05 CHANNEL VITAL SIGNS ------------------------------------------------- */

export const animateChannelVitalSigns:AnimationRunner=(root,options={})=>{
  if(options.mode==="none") return []
  const variant=normalizedVariant(options)
  const traces=queryAll<SVGGeometryElement>(
    root,
    "[data-vt-vital-trace],.vt-vital-trace,.recharts-line-curve,polyline",
  )
  const animations:Animation[]=[]

  if(variant===0){
    // ECG STARTUP
    traces.forEach((trace,index)=>{
      const a=drawSvgStroke(trace,ms(2200,options.mode),ms(index*240,options.mode),GLIDE)
      if(a) animations.push(a)
    })
    return animations
  }

  if(variant===1){
    // DEFIBRILLATOR
    traces.forEach((trace,index)=>{
      setTransformOrigin(trace,"left center")
      animations.push(play(trace,[
        {transform:"scaleY(.015)",opacity:.4},
        {transform:"scaleY(1.35)",opacity:1,offset:.28},
        {transform:"scaleY(.88)",opacity:1,offset:.46},
        {transform:"scaleY(1)",opacity:1},
      ],{
        duration:ms(1150,options.mode),
        delay:ms(300+index*100,options.mode),
        easing:SPRING,
      }))
      const a=drawSvgStroke(trace,ms(2100,options.mode),ms(800+index*180,options.mode),SOFT_OUT)
      if(a) animations.push(a)
    })
    return animations
  }

  // MULTI-MONITOR BOOT
  traces.forEach((trace,index)=>{
    setTransformOrigin(trace,"left center")
    animations.push(play(trace,[
      {transform:"scaleY(.08)",opacity:.22},
      {transform:"scaleY(1.18)",opacity:1,offset:.35},
      {transform:"scaleY(.92)",opacity:1,offset:.55},
      {transform:"scaleY(1)",opacity:1},
    ],{
      duration:ms(750,options.mode),
      delay:ms(index*360,options.mode),
      easing:SPRING,
    }))
    const a=drawSvgStroke(trace,ms(2400,options.mode),ms(900+index*260,options.mode),GLIDE)
    if(a) animations.push(a)
  })
  return animations
}

/* 06 CLOCKBURST ---------------------------------------------------------- */

const clockSectors=(root:ParentNode)=>queryAll<SVGGraphicsElement>(
  root,
  "[data-vt-clock-sector],.recharts-pie-sector path,.recharts-sector",
)

export const animateClockburst:AnimationRunner=(root,options={})=>{
  if(options.mode==="none") return []
  const variant=normalizedVariant(options)
  const sectors=clockSectors(root)
  const svg=(root as Element).querySelector?.("svg")
  const animations:Animation[]=[]

  if(variant===0){
    // CLOCK WINDING
    if(svg){
      setTransformOrigin(svg)
      animations.push(play(svg,[
        {transform:"rotate(0deg)"},
        {transform:"rotate(-120deg)",offset:.28},
        {transform:"rotate(11deg)",offset:.86},
        {transform:"rotate(0deg)"},
      ],{duration:ms(3000,options.mode),easing:GLIDE}))
    }
    sectors.forEach((sector,index)=>{
      setTransformOrigin(sector)
      animations.push(play(sector,[
        {transform:"scale(.08)",opacity:0},
        {transform:"scale(1.45)",opacity:1,offset:.55},
        {transform:"scale(.92)",opacity:1,offset:.8},
        {transform:"scale(1)",opacity:1},
      ],{
        duration:ms(620,options.mode),
        delay:ms(650+index*85,options.mode),
        easing:SPRING,
      }))
    })
    return animations
  }

  if(variant===1){
    // RADIAL EXPLOSION
    sectors.forEach((sector,index)=>{
      setTransformOrigin(sector)
      const angle=(index/Math.max(1,sectors.length))*Math.PI*2
      const dx=Math.cos(angle)*38, dy=Math.sin(angle)*38
      animations.push(play(sector,[
        {transform:`translate(${-dx}px,${-dy}px) scale(.12)`,opacity:0},
        {transform:`translate(${dx*0.15}px,${dy*0.15}px) scale(1.2)`,opacity:1,offset:.72},
        {transform:"translate(0,0) scale(1)",opacity:1},
      ],{
        duration:ms(1050,options.mode),
        delay:ms(index*55,options.mode),
        easing:SPRING,
      }))
    })
    if(svg) animations.push(play(svg,[
      {transform:"rotate(-35deg)"},
      {transform:"rotate(20deg)",offset:.82},
      {transform:"rotate(0deg)"},
    ],{duration:ms(2700,options.mode),easing:GLIDE}))
    return animations
  }

  // TIME SWEEP
  sectors.forEach((sector,index)=>{
    setTransformOrigin(sector)
    animations.push(play(sector,[
      {transform:"scale(.03)",opacity:0},
      {transform:"scale(1.35)",opacity:1,offset:.68},
      {transform:"scale(1)",opacity:1},
    ],{
      duration:ms(700,options.mode),
      delay:ms(index*95,options.mode),
      easing:SPRING,
    }))
  })
  if(svg) animations.push(play(svg,[
    {transform:"rotate(-360deg)"},
    {transform:"rotate(0deg)"},
  ],{duration:ms(3400,options.mode),easing:SOFT_OUT}))
  return animations
}

/* 07 TITLE KEYWORD NETWORK ------------------------------------------------ */

export const animateTitleKeywordNetwork:AnimationRunner=(root,options={})=>{
  if(options.mode==="none") return []
  const variant=normalizedVariant(options, 7)
  const nodes=queryAll<SVGGraphicsElement>(
    root,
    "[data-vt-network-node],.vt-network-node,.title-network-node,circle",
  ).filter(node=>{
    try { const b=node.getBBox(); return b.width>=6 && b.width<180 }
    catch { return false }
  })
  const edges=queryAll<SVGGeometryElement>(
    root,
    "[data-vt-network-edge],.vt-network-edge,.title-network-edge,line",
  )
  const animations:Animation[]=[]

  if(variant===0){
    // NEURAL NETWORK
    const ordered=seededShuffle(nodes,options.seed??"vt-neural")
    ordered.forEach((node,index)=>{
      setTransformOrigin(node)
      animations.push(play(node,[
        {transform:"scale(.04)",opacity:0},
        {transform:"scale(1.28)",opacity:1,offset:.7},
        {transform:"scale(1)",opacity:1},
      ],{
        duration:ms(720,options.mode),
        delay:ms(index*65,options.mode),
        easing:SPRING,
      }))
    })
    edges.forEach((edge,index)=>{
      const a=drawSvgStroke(edge,ms(820,options.mode),ms(550+index*28,options.mode),SOFT_OUT)
      if(a) animations.push(a)
    })
    return animations
  }

  if(variant===1){
    // MAGNETIC ASSEMBLY
    nodes.forEach((node,index)=>{
      setTransformOrigin(node)
      const side=index%4
      const dx=side===0?-90:side===1?90:0
      const dy=side===2?-90:side===3?90:0
      animations.push(play(node,[
        {transform:`translate(${dx}px,${dy}px) scale(.55)`,opacity:0},
        {transform:"translate(0,0) scale(1.08)",opacity:1,offset:.82},
        {transform:"translate(0,0) scale(1)",opacity:1},
      ],{
        duration:ms(1600,options.mode),
        delay:ms(index*42,options.mode),
        easing:SOFT_SPRING,
      }))
    })
    edges.forEach((edge,index)=>{
      animations.push(play(edge,[{opacity:0},{opacity:1}],{
        duration:ms(800,options.mode),
        delay:ms(1500+index*18,options.mode),
        easing:GLIDE,
      }))
    })
    return animations
  }

  if(variant===2){
    // SIGNAL TRANSMISSION
    nodes.forEach((node,index)=>{
      setTransformOrigin(node)
      animations.push(play(node,[
        {transform:"scale(.55)",opacity:.25},
        {transform:"scale(1.24)",opacity:1,offset:.65},
        {transform:"scale(1)",opacity:1},
      ],{
        duration:ms(650,options.mode),
        delay:ms(index*95,options.mode),
        easing:SPRING,
      }))
    })
    edges.forEach((edge,index)=>{
      const a=drawSvgStroke(edge,ms(900,options.mode),ms(index*55,options.mode),LINEAR)
      if(a) animations.push(a)
    })
    return animations
  }

  if(variant===3){
    // INK DIFFUSION — nodes bloom outward with `filter: blur` fading to
    // sharp; edges draw as ink spreading (dash-offset draw with a soft
    // easing). Reads as ink drops hitting paper.
    const shuffled=seededShuffle(nodes,options.seed??"vt-ink-diffusion")
    shuffled.forEach((node,index)=>{
      setTransformOrigin(node)
      animations.push(play(node,[
        {transform:"scale(.05)",opacity:0,filter:"blur(14px) saturate(1.6)"},
        {transform:"scale(1.32)",opacity:1,offset:.42,filter:"blur(6px) saturate(1.4)"},
        {transform:"scale(.96)",opacity:1,offset:.72,filter:"blur(2px) saturate(1.15)"},
        {transform:"scale(1)",opacity:1,filter:"blur(0) saturate(1)"},
      ],{
        duration:ms(1100,options.mode),
        delay:ms(index*60,options.mode),
        easing:SOFT_OUT,
      }))
    })
    // Edges follow, drawing left-to-right like ink spreading through fibers.
    const edgeStart=ms(500,options.mode)
    edges.forEach((edge,index)=>{
      const a=drawSvgStroke(
        edge,
        ms(1300,options.mode),
        edgeStart+ms(index*40,options.mode),
        SOFT_OUT,
      )
      if(a) animations.push(a)
    })
    return animations
  }

  if(variant===4){
    // GRAVITY WELL — nodes fall from above the canvas on a gravity easing
    // then compress on impact. Edges snap in only after everything lands.
    nodes.forEach((node,index)=>{
      setTransformOrigin(node)
      // Deterministic per-node horizontal drift so nodes don't fall in a
      // perfect line.
      const drift=((index*47)%13)-6
      animations.push(play(node,[
        {transform:`translate(${drift}px,-260px) scale(.95)`,opacity:0},
        {transform:`translate(${drift*.3}px,-40px) scale(1)`,opacity:1,offset:.6},
        {transform:`translate(0,10px) scale(1.14) scaleY(.8)`,opacity:1,offset:.75},
        {transform:"translate(0,-3px) scale(.96) scaleY(1.05)",opacity:1,offset:.86},
        {transform:"translate(0,0) scale(1)",opacity:1},
      ],{
        duration:ms(1400,options.mode),
        delay:ms(index*44,options.mode),
        // Custom cubic that accelerates then decelerates hard (gravity+impact).
        easing:"cubic-bezier(0.6, 0, 0.35, 1.4)",
      }))
    })
    const edgeStart=ms(700,options.mode)+nodes.length*ms(44,options.mode)
    edges.forEach((edge,index)=>{
      const a=drawSvgStroke(edge,ms(700,options.mode),edgeStart+ms(index*22,options.mode),GLIDE)
      if(a) animations.push(a)
    })
    return animations
  }

  if(variant===5){
    // NETWORK BOOT — deterministic sequential scan like a computer booting.
    // Nodes flip on in fixed index order with a green terminal-style glow,
    // decaying to normal. Edges illuminate in-between passes.
    nodes.forEach((node,index)=>{
      setTransformOrigin(node)
      animations.push(play(node,[
        {transform:"scale(.4)",opacity:0,filter:"brightness(2.6) saturate(0) hue-rotate(90deg)"},
        {transform:"scale(1.42)",opacity:1,offset:.18,filter:"brightness(2.8) saturate(1.6) hue-rotate(80deg)"},
        {transform:"scale(.9)",opacity:1,offset:.5,filter:"brightness(1.65) saturate(1.2) hue-rotate(30deg)"},
        {transform:"scale(1)",opacity:1,filter:"brightness(1) saturate(1) hue-rotate(0)"},
      ],{
        duration:ms(500,options.mode),
        delay:ms(index*80,options.mode), // strict order — no shuffle
        easing:SOFT_OUT,
      }))
    })
    // Edges scan on after all nodes settle.
    const edgeStart=ms(200,options.mode)+nodes.length*ms(80,options.mode)
    edges.forEach((edge,index)=>{
      const a=drawSvgStroke(edge,ms(400,options.mode),edgeStart+ms(index*28,options.mode),LINEAR)
      if(a) animations.push(a)
    })
    return animations
  }

  // variant === 6 — QUANTUM ENTANGLEMENT: connected pairs of nodes appear
  // simultaneously; unconnected nodes stay dark until the very last beat.
  // Edges are the source of pairing; each edge's endpoints get an entangled
  // synchronized reveal.
  // Step 1: index all nodes by center point so we can match edge endpoints.
  const nodeCenterKey=(node:SVGGraphicsElement)=>{
    try { const b=node.getBBox(); return `${Math.round(b.x+b.width/2)}:${Math.round(b.y+b.height/2)}` }
    catch { return `n${nodes.indexOf(node)}` }
  }
  const nodesByCenter=new Map<string,SVGGraphicsElement>()
  nodes.forEach(node=>nodesByCenter.set(nodeCenterKey(node),node))
  // Step 2: build entangled pairs by matching each edge's endpoints to
  // known nodes. Endpoint queries fall back gracefully for arbitrary paths.
  const readEdgeEndpoints=(edge:SVGGeometryElement):[string,string]|null=>{
    try {
      const l=edge.getTotalLength?.()
      if(!l||!edge.getPointAtLength) return null
      const p0=edge.getPointAtLength(0)
      const p1=edge.getPointAtLength(l)
      return [`${Math.round(p0.x)}:${Math.round(p0.y)}`,`${Math.round(p1.x)}:${Math.round(p1.y)}`]
    } catch { return null }
  }
  const seen=new Set<SVGGraphicsElement>()
  const pairs:Array<[SVGGraphicsElement,SVGGraphicsElement,SVGGeometryElement]>=[]
  edges.forEach(edge=>{
    const endpoints=readEdgeEndpoints(edge)
    if(!endpoints) return
    // Try exact match, then nearest-center within a small radius.
    const findNearest=(key:string)=>{
      const [ex,ey]=key.split(":").map(Number)
      let best:SVGGraphicsElement|null=null; let bestDist=Number.POSITIVE_INFINITY
      for (const node of nodes) {
        const k=nodeCenterKey(node); const [nx,ny]=k.split(":").map(Number)
        const d=Math.hypot(ex-nx,ey-ny)
        if(d<bestDist){bestDist=d; best=node}
      }
      return bestDist<40?best:null
    }
    const a=nodesByCenter.get(endpoints[0])??findNearest(endpoints[0])
    const b=nodesByCenter.get(endpoints[1])??findNearest(endpoints[1])
    if(a && b && a!==b && !seen.has(a) && !seen.has(b)) {
      pairs.push([a,b,edge]); seen.add(a); seen.add(b)
    }
  })
  const pairBeat=ms(300,options.mode)
  pairs.forEach(([a,b,edge],pairIndex)=>{
    const delay=pairIndex*pairBeat
    ;[a,b].forEach(node=>{
      setTransformOrigin(node)
      animations.push(play(node,[
        {transform:"scale(.02)",opacity:0,filter:"blur(8px) hue-rotate(45deg)"},
        {transform:"scale(1.42)",opacity:1,offset:.5,filter:"blur(0) hue-rotate(0)"},
        {transform:"scale(.94)",opacity:1,offset:.78},
        {transform:"scale(1)",opacity:1},
      ],{
        duration:ms(650,options.mode),
        delay,
        easing:SPRING,
      }))
    })
    const strokeAnim=drawSvgStroke(edge,ms(650,options.mode),delay,SOFT_OUT)
    if(strokeAnim) animations.push(strokeAnim)
  })
  // Unpaired nodes light up at the end, dim, so pairs stay the visual story.
  const unpaired=nodes.filter(node=>!seen.has(node))
  const tailStart=Math.max(0,pairs.length*pairBeat-ms(120,options.mode))+ms(280,options.mode)
  unpaired.forEach((node,index)=>{
    setTransformOrigin(node)
    animations.push(play(node,[
      {transform:"scale(.4)",opacity:0},
      {transform:"scale(1.08)",opacity:.75,offset:.7},
      {transform:"scale(1)",opacity:1},
    ],{
      duration:ms(500,options.mode),
      delay:tailStart+ms(index*30,options.mode),
      easing:SOFT_OUT,
    }))
  })
  return animations
}

/* 08 BARCODE FINGERPRINT -------------------------------------------------- */

const barcodeBars=(root:ParentNode)=>sortedX(
  queryAll<SVGGraphicsElement>(root,"[data-vt-barcode-bar],.vt-barcode-bar,rect")
    .filter(el=>{
      try { const b=el.getBBox(); return b.width>0 && b.width<36 && b.height>10 }
      catch { return false }
    }),
)

export const animateBarcodeFingerprint:AnimationRunner=(root,options={})=>{
  if(options.mode==="none") return []
  const variant=normalizedVariant(options)
  const bars=barcodeBars(root)
  const animations:Animation[]=[]

  if(variant===0){
    // SCANNER
    bars.forEach((bar,index)=>{
      setTransformOrigin(bar,"center bottom")
      animations.push(play(bar,[
        {transform:"scaleY(.025)",opacity:.08},
        {transform:"scaleY(1.16)",opacity:1,offset:.72},
        {transform:"scaleY(1)",opacity:1},
      ],{
        duration:ms(520,options.mode),
        delay:ms(index*Math.max(10,Math.min(34,2100/Math.max(1,bars.length))),options.mode),
        easing:SOFT_SPRING,
      }))
    })
    return animations
  }

  if(variant===1){
    // DNA ASSEMBLY
    bars.forEach((bar,index)=>{
      setTransformOrigin(bar,index%2===0?"center top":"center bottom")
      animations.push(play(bar,[
        {transform:"scaleY(.02)",opacity:0},
        {transform:"scaleY(1.2)",opacity:1,offset:.72},
        {transform:"scaleY(1)",opacity:1},
      ],{
        duration:ms(650,options.mode),
        delay:ms(index*26,options.mode),
        easing:SPRING,
      }))
    })
    return animations
  }

  // AUDIO DECODE
  bars.forEach((bar,index)=>{
    setTransformOrigin(bar,"center bottom")
    animations.push(play(bar,[
      {transform:"scaleY(.12)",opacity:.3},
      {transform:"scaleY(1.18)",opacity:1,offset:.78},
      {transform:"scaleY(1)",opacity:1},
    ],{
      duration:ms(850,options.mode),
      delay:ms(index*45,options.mode),
      easing:SOFT_SPRING,
    }))
  })
  return animations
}

/* 09 GEOGRAPHY ----------------------------------------------------------- */

export const animateGeographyMap:AnimationRunner=(root,options={})=>{
  if(options.mode==="none") return []
  const variant=normalizedVariant(options)
  const mapPaths=queryAll<SVGGeometryElement>(
    root,
    "[data-vt-map-region],.vt-map-region,path",
  ).filter(path=>{
    try { const b=path.getBBox(); return b.width>5 && b.height>5 }
    catch { return false }
  })
  const dots=queryAll<SVGGraphicsElement>(
    root,
    "[data-vt-geo-dot],.vt-geo-dot,circle",
  )
  const animations:Animation[]=[]

  if(variant===0){
    // GLOBAL SIGNAL
    mapPaths.slice(0,80).forEach((path,index)=>{
      const a=drawSvgStroke(path,ms(850,options.mode),ms(index*10,options.mode),SOFT_OUT)
      if(a) animations.push(a)
    })
    seededShuffle(dots,options.seed??"vt-global").forEach((dot,index)=>{
      setTransformOrigin(dot)
      animations.push(play(dot,[
        {transform:"scale(0)",opacity:0},
        {transform:"scale(1.4)",opacity:1,offset:.62},
        {transform:"scale(1)",opacity:1},
      ],{
        duration:ms(600,options.mode),
        delay:ms(900+index*55,options.mode),
        easing:SPRING,
      }))
    })
    return animations
  }

  if(variant===1){
    // AUDIENCE CONSTELLATION
    const ordered=[...dots].sort((a,b)=>{
      const ar=Number(a.getAttribute("r")||0),br=Number(b.getAttribute("r")||0)
      return br-ar
    })
    ordered.forEach((dot,index)=>{
      setTransformOrigin(dot)
      animations.push(play(dot,[
        {transform:"scale(0)",opacity:0},
        {transform:"scale(1.55)",opacity:1,offset:.55},
        {transform:"scale(.92)",opacity:1,offset:.78},
        {transform:"scale(1)",opacity:1},
      ],{
        duration:ms(720,options.mode),
        delay:ms(index*85,options.mode),
        easing:SPRING,
      }))
    })
    return animations
  }

  // SATELLITE SWEEP
  const ordered=[...mapPaths].sort((a,b)=>x(a)-x(b)+.35*(y(a)-y(b)))
  ordered.forEach((path,index)=>{
    animations.push(play(path,[{opacity:.05},{opacity:1}],{
      duration:ms(500,options.mode),
      delay:ms(index*20,options.mode),
      easing:LINEAR,
    }))
  })
  dots.forEach((dot,index)=>{
    setTransformOrigin(dot)
    animations.push(play(dot,[
      {transform:"scale(0)",opacity:0},
      {transform:"scale(1.3)",opacity:1,offset:.7},
      {transform:"scale(1)",opacity:1},
    ],{
      duration:ms(600,options.mode),
      delay:ms(1600+index*40,options.mode),
      easing:SPRING,
    }))
  })
  return animations
}

/* 10 ENGAGEMENT PULSE ---------------------------------------------------- */

export const animateEngagementPulse:AnimationRunner=(root,options={})=>{
  if(options.mode==="none") return []
  const variant=normalizedVariant(options)
  const lines=queryAll<SVGGeometryElement>(
    root,
    "[data-vt-engagement-line],.recharts-line-curve",
  )
  const animations:Animation[]=[]

  if(variant===0){
    // PULSE CHASE
    lines.forEach((line,index)=>{
      const a=drawSvgStroke(line,ms(3200,options.mode),ms(index*300,options.mode),SOFT_OUT)
      if(a) animations.push(a)
    })
    return animations
  }

  if(variant===1){
    // SYNCHRONIZED HEARTBEAT
    lines.forEach((line,index)=>{
      setTransformOrigin(line,"left center")
      animations.push(play(line,[
        {transform:"scaleY(.02)",opacity:.25},
        {transform:"scaleY(1.16)",opacity:1,offset:.55},
        {transform:"scaleY(.96)",opacity:1,offset:.78},
        {transform:"scaleY(1)",opacity:1},
      ],{
        duration:ms(1600,options.mode),
        delay:ms(index*80,options.mode),
        easing:SOFT_SPRING,
      }))
      const a=drawSvgStroke(line,ms(2400,options.mode),ms(250+index*80,options.mode),GLIDE)
      if(a) animations.push(a)
    })
    return animations
  }

  // METRIC CONVERSATION
  lines.forEach((line,index)=>{
    const a=drawSvgStroke(
      line,
      ms(1450,options.mode),
      ms(index*720,options.mode),
      GLIDE,
    )
    if(a) animations.push(a)
  })
  return animations
}

/* 11 FORMAT DOMINANCE ---------------------------------------------------- */

export const animateFormatDominance:AnimationRunner=(root,options={})=>{
  if(options.mode==="none") return []
  const variant=normalizedVariant(options)

  // INTRO intentionally returns [] so the visual's original/native Recharts
  // animation remains authoritative. This is the requested revert behavior.
  if(variant===0) return []

  const sectors=queryAll<SVGGraphicsElement>(
    root,
    ".recharts-pie-sector path,.recharts-sector,[data-vt-format-sector]",
  )
  const animations:Animation[]=[]

  if(variant===1){
    // FORMAT TAKEOVER
    sectors.forEach((sector,index)=>{
      setTransformOrigin(sector)
      const side=index%2===0?-1:1
      animations.push(play(sector,[
        {transform:`translateX(${side*70}px) scale(.35)`,opacity:0},
        {transform:`translateX(${side*-5}px) scale(1.08)`,opacity:1,offset:.8},
        {transform:"translateX(0) scale(1)",opacity:1},
      ],{
        duration:ms(1350,options.mode),
        delay:ms(index*160,options.mode),
        easing:SOFT_SPRING,
      }))
    })
    return animations
  }

  // CHAMPIONSHIP PODIUM
  sectors.forEach((sector,index)=>{
    setTransformOrigin(sector)
    animations.push(play(sector,[
      {transform:"scale(.72)",opacity:.4},
      {transform:`scale(${1.12-index*.025})`,opacity:1,offset:.72},
      {transform:"scale(1)",opacity:1},
    ],{
      duration:ms(1050,options.mode),
      delay:ms(index*220,options.mode),
      easing:SPRING,
    }))
  })
  return animations
}

/* 12 KEYWORD VENN -------------------------------------------------------- */

export const animateKeywordVenn:AnimationRunner=(root,options={})=>{
  if(options.mode==="none") return []
  const variant=normalizedVariant(options)
  const circles=queryAll<SVGGraphicsElement>(
    root,
    "[data-vt-venn-circle],.vt-venn-circle,svg circle",
  ).filter(c=>Number(c.getAttribute("r")||0)>35).slice(0,3)
  const animations:Animation[]=[]
  if(!circles.length) return animations

  if(variant===0){
    // COLLISION
    circles.forEach((circle,index)=>{
      setTransformOrigin(circle)
      const dx=(index-1)*110
      animations.push(play(circle,[
        {transform:`translateX(${dx}px) scale(.35)`,opacity:0},
        {transform:`translateX(${dx*.08}px) scale(1.15)`,opacity:1,offset:.78},
        {transform:"translateX(0) scale(1)",opacity:1},
      ],{
        duration:ms(1500,options.mode),
        delay:ms(index*230,options.mode),
        easing:SOFT_SPRING,
      }))
    })
    return animations
  }

  if(variant===1){
    // COMBINATION BUILDER
    circles.forEach((circle,index)=>{
      setTransformOrigin(circle)
      animations.push(play(circle,[
        {transform:"scale(0)",opacity:0},
        {transform:"scale(1.22)",opacity:1,offset:.72},
        {transform:"scale(1)",opacity:1},
      ],{
        duration:ms(800,options.mode),
        delay:ms(index*700,options.mode),
        easing:SPRING,
      }))
    })
    return animations
  }

  // ELASTIC ORBIT
  circles.forEach((circle,index)=>{
    setTransformOrigin(circle)
    const angle=index*(Math.PI*2/3)
    const dx=Math.cos(angle)*90,dy=Math.sin(angle)*70
    animations.push(play(circle,[
      {transform:`translate(${dx}px,${dy}px) rotate(-120deg) scale(.5)`,opacity:.15},
      {transform:"translate(0,0) rotate(15deg) scale(1.12)",opacity:1,offset:.82},
      {transform:"translate(0,0) rotate(0deg) scale(1)",opacity:1},
    ],{
      duration:ms(2100,options.mode),
      delay:ms(index*170,options.mode),
      easing:SOFT_SPRING,
    }))
  })
  return animations
}

/* RUNNER REGISTRY --------------------------------------------------------- */

export const HERO_ANIMATION_RUNNERS:Record<HeroVisualId,AnimationRunner>={
  "traffic-source-evolution":animateTrafficSourceEvolution,
  "channel-progress":animateChannelProgress,
  "heat-matrix":animateHeatMatrix,
  "shorts-retention":animateScatterBubbles,
  "channel-vital-signs":animateChannelVitalSigns,
  "clockburst":animateClockburst,
  "title-keyword-network":animateTitleKeywordNetwork,
  "barcode-fingerprint":animateBarcodeFingerprint,
  "geography-map":animateGeographyMap,
  "engagement-pulse":animateEngagementPulse,
  "format-dominance":animateFormatDominance,
  "keyword-venn":animateKeywordVenn,
}

const resetInlineAnimationStyles=(root:ParentNode)=>{
  queryAll<HTMLElement|SVGElement>(root,
    "[data-vt-hero-visual] *, .vt-heat-tile, .recharts-wrapper *, svg *",
  ).forEach(element=>{
    try {
      element.getAnimations().forEach(animation=>animation.cancel())
    } catch {}
  })
}

export const createHeroIntroController=(
  visualId:HeroVisualId,
  root:ParentNode,
  options:HeroIntroOptions={},
):HeroIntroController=>{
  let animations:Animation[]=[]
  let destroyed=false
  let currentVariant=normalizedVariant(options)
  let scheduledFrame:number|null=null
  let readinessObserver:MutationObserver|null=null
  let readinessTimeout:number|null=null

  const cancelReadinessWait=()=>{
    if(scheduledFrame!==null){
      cancelAnimationFrame(scheduledFrame)
      scheduledFrame=null
    }
    readinessObserver?.disconnect()
    readinessObserver=null
    if(readinessTimeout!==null){
      clearTimeout(readinessTimeout)
      readinessTimeout=null
    }
  }

  const stop=()=>{
    cancelReadinessWait()
    animations.forEach(animation=>{
      try { animation.cancel() } catch {}
    })
    animations=[]
  }

  const runWhenReady=()=>{
    if(destroyed) return
    const runner=HERO_ANIMATION_RUNNERS[visualId]
    animations=runner(root,{...options,variant:currentVariant})
    if(animations.length>0){
      cancelReadinessWait()
      return
    }

    if(typeof MutationObserver==="undefined"||readinessObserver) return
    readinessObserver=new MutationObserver(()=>{
      if(destroyed||scheduledFrame!==null) return
      scheduledFrame=requestAnimationFrame(()=>{
        scheduledFrame=null
        runWhenReady()
      })
    })
    readinessObserver.observe(root as Node,{childList:true,subtree:true})
    readinessTimeout=setTimeout(cancelReadinessWait,2000) as unknown as number
  }

  const replay=(overrides?:{variant?:number})=>{
    if(destroyed) return
    stop()
    if(overrides?.variant!==undefined){
      currentVariant=((overrides.variant%3)+3)%3
    }
    scheduledFrame=requestAnimationFrame(()=>{
      scheduledFrame=requestAnimationFrame(()=>{
        scheduledFrame=null
        runWhenReady()
      })
    })
  }

  return {
    replay,
    reset:()=>{
      stop()
      resetInlineAnimationStyles(root)
    },
    destroy:()=>{
      destroyed=true
      stop()
    },
  }
}

export const readHeroIntroModeFromUrl=(fallback:HeroIntroMode="full"):HeroIntroMode=>{
  if(typeof window==="undefined") return fallback
  const params=new URLSearchParams(window.location.search)
  const raw=(params.get("vtHeroIntro")??params.get("heroIntro")??"").toLowerCase()
  if(raw==="none"||raw==="off"||raw==="0") return "none"
  if(raw==="fast"||raw==="quick") return "fast"
  if(raw==="full"||raw==="on"||raw==="1") return "full"
  return fallback
}

export const getHeroVariantLabel=(visualId:HeroVisualId,variant:number)=>{
  // Labels are indexed by variant. Extended visuals carry 7 labels; baseline
  // visuals still carry 3. The variant is wrapped by the visual's actual
  // slot count so a caller can safely feed any integer.
  const labels:Record<HeroVisualId,readonly string[]>={
    "traffic-source-evolution":["LAYERED RIVER","SOURCE RACE","GEOLOGICAL FORMATION","TIDAL BLOOM","STROBE STACK","CARBON DATE","PULSE MESH"],
    "channel-progress":["TRAVELING TIDE","ECHO WAVES","GROWTH IGNITION","METRONOME MARCH","STAIRCASE ASCENT","QUANTUM COLLAPSE","HELIX RIBBON"],
    "heat-matrix":["HORIZONTAL THERMAL WAVE","HEAT DROP","DIGITAL RAIN","QUENCH FLASH","CRYSTAL LATTICE","RIPPLE POND","NIGHT VISION SWEEP"],
    "shorts-retention":["POPCORN UNIVERSE","DATA CANNON","GRAVITY DROP","CENTRIFUGE","SLING SHOT","CONSTELLATION FORM","SHUFFLE DECK"],
    "title-keyword-network":["NEURAL NETWORK","MAGNETIC ASSEMBLY","SIGNAL TRANSMISSION","INK DIFFUSION","GRAVITY WELL","NETWORK BOOT","QUANTUM ENTANGLEMENT"],
    // Baseline (3 variants) — extension pending.
    "channel-vital-signs":["ECG STARTUP","DEFIBRILLATOR","MULTI-MONITOR BOOT"],
    "clockburst":["CLOCK WINDING","RADIAL EXPLOSION","TIME SWEEP"],
    "barcode-fingerprint":["SCANNER","DNA ASSEMBLY","AUDIO DECODE"],
    "geography-map":["GLOBAL SIGNAL","AUDIENCE CONSTELLATION","SATELLITE SWEEP"],
    "engagement-pulse":["PULSE CHASE","SYNCHRONIZED HEARTBEAT","METRIC CONVERSATION"],
    "format-dominance":["ORIGINAL VIEWTUBE","FORMAT TAKEOVER","CHAMPIONSHIP PODIUM"],
    "keyword-venn":["COLLISION","COMBINATION BUILDER","ELASTIC ORBIT"],
  }
  const slots=labels[visualId]
  const count=Math.max(1,slots.length)
  const v=((variant%count)+count)%count
  return slots[v]
}
