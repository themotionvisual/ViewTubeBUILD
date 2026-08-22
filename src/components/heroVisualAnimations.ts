/**
 * ViewTube Hero Visual Animation Engine — PR #10 compatible upgrade
 *
 * Target branch:
 *   integration/full-compilation-2026-08-20
 *
 * Drop-in replacement for:
 *   src/components/heroVisualAnimations.ts
 *
 * 12 visuals × 3 variants = 36 deterministic replayable animations.
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
  "traffic-source-evolution": 3,
  "channel-progress": 3,
  "heat-matrix": 3,
  "shorts-retention": 3,
  "channel-vital-signs": 3,
  "clockburst": 3,
  "title-keyword-network": 3,
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

const normalizedVariant = (options?: HeroIntroOptions) =>
  (((options?.variant ?? 0) % 3) + 3) % 3

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
) => release(element.animate(keyframes, { fill: "both", ...options }))

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
  const variant = normalizedVariant(options)
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
  const variant=normalizedVariant(options)
  if (variant===0) return runChannelTide(root,options,1)       // TRAVELING TIDE
  if (variant===1) return runChannelTide(root,options,3)       // ECHO WAVES

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
  const variant=normalizedVariant(options)
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

/* 04 SHORTS RETENTION / SCATTERS ---------------------------------------- */

const scatterTargets=(root:ParentNode)=>{
  const preferred=queryAll<SVGElement>(root,".vt-scatter-bubble-core")
  return preferred.length?preferred:queryAll<SVGElement>(root,".recharts-scatter-symbol")
}

export const animateScatterBubbles: AnimationRunner=(root,options={})=>{
  if(options.mode==="none") return []
  const variant=normalizedVariant(options)
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
  const variant=normalizedVariant(options)
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
  let outerFrame:number|null=null
  let innerFrame:number|null=null

  const stop=()=>{
    if(outerFrame!==null) cancelAnimationFrame(outerFrame)
    if(innerFrame!==null) cancelAnimationFrame(innerFrame)
    outerFrame=null
    innerFrame=null
    animations.forEach(animation=>{
      try { animation.cancel() } catch {
        // A detached visual may already have released its Web Animation handle.
      }
    })
    animations=[]
  }

  const replay=(overrides?:{variant?:number})=>{
    if(destroyed) return
    stop()
    if(overrides?.variant!==undefined){
      currentVariant=((overrides.variant%3)+3)%3
    }
    outerFrame=requestAnimationFrame(()=>{
      outerFrame=null
      innerFrame=requestAnimationFrame(()=>{
        innerFrame=null
        if(destroyed) return
        const runner=HERO_ANIMATION_RUNNERS[visualId]
        animations=runner(root,{...options,variant:currentVariant})
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
  const v=((variant%3)+3)%3
  const labels:Record<HeroVisualId,[string,string,string]>={
    "traffic-source-evolution":["LAYERED RIVER","SOURCE RACE","GEOLOGICAL FORMATION"],
    "channel-progress":["TRAVELING TIDE","ECHO WAVES","GROWTH IGNITION"],
    "heat-matrix":["HORIZONTAL THERMAL WAVE","HEAT DROP","DIGITAL RAIN"],
    "shorts-retention":["POPCORN UNIVERSE","DATA CANNON","GRAVITY DROP"],
    "channel-vital-signs":["ECG STARTUP","DEFIBRILLATOR","MULTI-MONITOR BOOT"],
    "clockburst":["CLOCK WINDING","RADIAL EXPLOSION","TIME SWEEP"],
    "title-keyword-network":["NEURAL NETWORK","MAGNETIC ASSEMBLY","SIGNAL TRANSMISSION"],
    "barcode-fingerprint":["SCANNER","DNA ASSEMBLY","AUDIO DECODE"],
    "geography-map":["GLOBAL SIGNAL","AUDIENCE CONSTELLATION","SATELLITE SWEEP"],
    "engagement-pulse":["PULSE CHASE","SYNCHRONIZED HEARTBEAT","METRIC CONVERSATION"],
    "format-dominance":["ORIGINAL VIEWTUBE","FORMAT TAKEOVER","CHAMPIONSHIP PODIUM"],
    "keyword-venn":["COLLISION","COMBINATION BUILDER","ELASTIC ORBIT"],
  }
  return labels[visualId][v]
}
