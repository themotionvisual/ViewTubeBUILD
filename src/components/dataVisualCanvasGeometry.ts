import React from "react"
import {
 dataVisualDensityBudget,
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
