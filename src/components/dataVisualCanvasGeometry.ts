import React from "react"
import {
 dataVisualDefaultSelection,
 dataVisualDensityBudget,
 dataVisualMarkScale,
 dataVisualPanelBudget,
 dataVisualSeriesBudget,
 scaleMark,
 type DataVisualMarkFloor,
 type DataVisualViewportBucket,
 type RegisteredDataVisualModuleId,
} from "./dataVisualModuleContract"

/**
 * Media queries that define the three Data Visual compositions. They are kept
 * here (not duplicated per renderer) so JS-side density decisions and the
 * CSS-side geometry in `styles/data-visual-canvas.css` stay in agreement.
 */
export const DATA_VISUAL_PORTRAIT_QUERY = "(orientation: portrait) and (max-width: 768px)"
export const DATA_VISUAL_LANDSCAPE_QUERY = "(orientation: landscape) and (max-height: 560px)"

const readBucket = (): DataVisualViewportBucket => {
 if (typeof window === "undefined" || typeof window.matchMedia !== "function") return "desktop"
 if (window.matchMedia(DATA_VISUAL_LANDSCAPE_QUERY).matches) return "landscape"
 if (window.matchMedia(DATA_VISUAL_PORTRAIT_QUERY).matches) return "portrait"
 return "desktop"
}

/**
 * Which composition the current viewport is asking for. Subscribes to the two
 * canonical media queries instead of polling `window.resize`.
 */
export const useDataVisualViewportBucket = (): DataVisualViewportBucket => {
 const [bucket, setBucket] = React.useState<DataVisualViewportBucket>(readBucket)

 React.useEffect(() => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return
  const queries = [window.matchMedia(DATA_VISUAL_PORTRAIT_QUERY), window.matchMedia(DATA_VISUAL_LANDSCAPE_QUERY)]
  const sync = () => setBucket(readBucket())
  sync()
  queries.forEach((query) => query.addEventListener?.("change", sync))
  return () => queries.forEach((query) => query.removeEventListener?.("change", sync))
 }, [])

 return bucket
}

/**
 * Simultaneous-mark budget for a registered module in the active composition.
 * Renderers use this to *reduce information density* on small screens instead
 * of scaling desktop density down into unreadable marks.
 */
export const useDataVisualDensityBudget = (
 id: RegisteredDataVisualModuleId,
 fallback: number,
): { bucket: DataVisualViewportBucket; budget: number } => {
 const bucket = useDataVisualViewportBucket()
 return { bucket, budget: dataVisualDensityBudget(id, bucket) ?? fallback }
}

/**
 * Mark-geometry multiplier for the active composition.
 *
 * Pair it with `scaleMark` so every scaled value clamps to its legibility or
 * touch floor: `scaleMark(32, markScale, "bubbleRadius")`.
 */
export const useDataVisualMarkScale = (id: RegisteredDataVisualModuleId): number => {
 const bucket = useDataVisualViewportBucket()
 return dataVisualMarkScale(id, bucket)
}

/**
 * Convenience pairing of the multiplier with a bound `scale` helper, so a
 * renderer scales several dimensions without repeating the floor names.
 */
export const useDataVisualMarks = (
 id: RegisteredDataVisualModuleId,
): {
 bucket: DataVisualViewportBucket
 markScale: number
 scale: (base: number, floor: DataVisualMarkFloor | number) => number
} => {
 const bucket = useDataVisualViewportBucket()
 const markScale = dataVisualMarkScale(id, bucket)
 return {
  bucket,
  markScale,
  scale: (base, floor) => scaleMark(base, markScale, floor),
 }
}

/**
 * Where the module's count control should start in the active composition.
 * Falls back to the module's own desktop default when nothing is registered.
 */
export const useDataVisualDefaultSelection = (
 id: RegisteredDataVisualModuleId,
 fallback: number,
): number => {
 const bucket = useDataVisualViewportBucket()
 return dataVisualDefaultSelection(id, bucket) ?? fallback
}

/**
 * Count state that opens at the composition default and then respects the
 * reader.
 *
 * The module starts at whatever the contract registers for the active
 * composition — Engagement Pulse opens on 10 videos in portrait rather than 25.
 * Once the reader moves the control, their choice is theirs: rotating the
 * phone will not silently overwrite it. Only an untouched control re-picks the
 * default when the composition changes.
 */
export const useDataVisualSelection = (
 id: RegisteredDataVisualModuleId,
 fallback: number,
): [number, (next: number) => void] => {
 const bucket = useDataVisualViewportBucket()
 const resolved = dataVisualDefaultSelection(id, bucket) ?? fallback
 const [value, setValue] = React.useState(resolved)
 const touched = React.useRef(false)

 React.useEffect(() => {
  if (touched.current) return
  setValue(resolved)
 }, [resolved])

 const select = React.useCallback((next: number) => {
  touched.current = true
  setValue(next)
 }, [])

 return [value, select]
}

/** How many sub-panels this canvas may draw at once. */
export const useDataVisualPanelBudget = (
 id: RegisteredDataVisualModuleId,
 fallback: number,
): number => {
 const bucket = useDataVisualViewportBucket()
 return dataVisualPanelBudget(id, bucket) ?? fallback
}

/** How many simultaneous series / metric traces this canvas may draw. */
export const useDataVisualSeriesBudget = (
 id: RegisteredDataVisualModuleId,
 fallback: number,
): number => {
 const bucket = useDataVisualViewportBucket()
 return dataVisualSeriesBudget(id, bucket) ?? fallback
}

export interface VisualCanvasBox {
 width: number
 height: number
}

/**
 * Measured content box of a canvas host. The observer watches the *container*,
 * so a renderer reacts to the viewport geometry handed down by
 * `VisualCanvasViewport` rather than to `window.resize`.
 */
export const useVisualCanvasBox = (ref: React.RefObject<HTMLElement | null>): VisualCanvasBox => {
 const [box, setBox] = React.useState<VisualCanvasBox>({ width: 0, height: 0 })

 React.useEffect(() => {
  const node = ref.current
  if (!node) return
  let frame = 0

  const measure = () => {
   if (frame) cancelAnimationFrame(frame)
   frame = requestAnimationFrame(() => {
    const host = ref.current
    if (!host || !host.isConnected) return
    const rect = host.getBoundingClientRect()
    const width = Number.isFinite(rect.width) && rect.width > 1 ? rect.width : 0
    const height = Number.isFinite(rect.height) && rect.height > 1 ? rect.height : 0
    setBox((current) => (current.width === width && current.height === height ? current : { width, height }))
   })
  }

  measure()
  if (typeof ResizeObserver === "undefined") return () => { if (frame) cancelAnimationFrame(frame) }
  const observer = new ResizeObserver(measure)
  observer.observe(node)
  return () => {
   if (frame) cancelAnimationFrame(frame)
   observer.disconnect()
  }
 }, [ref])

 return box
}

/**
 * Keeps a native `<canvas>` backing store in step with its CSS box and the
 * device pixel ratio. The element is sized by CSS (`width/height: 100%`); this
 * hook only owns the backing store and the drawing transform.
 */
export const useHiDPICanvas = (ref: React.RefObject<HTMLCanvasElement | null>): void => {
 React.useEffect(() => {
  const canvas = ref.current
  if (!canvas) return

  const resize = () => {
   const rect = canvas.getBoundingClientRect()
   if (rect.width < 1 || rect.height < 1) return
   const dpr = window.devicePixelRatio || 1
   const nextWidth = Math.round(rect.width * dpr)
   const nextHeight = Math.round(rect.height * dpr)
   if (canvas.width !== nextWidth) canvas.width = nextWidth
   if (canvas.height !== nextHeight) canvas.height = nextHeight
   const ctx = canvas.getContext("2d")
   if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  resize()
  if (typeof ResizeObserver === "undefined") return
  const observer = new ResizeObserver(resize)
  observer.observe(canvas)
  return () => observer.disconnect()
 }, [ref])
}
