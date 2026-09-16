import React from "react"

export type VisualCanvasFamily = "spatial" | "temporal" | "radial" | "natural"
export type VisualCanvasAspect = "16:9" | "1:1" | "natural"

export interface VisualCanvasViewportProps {
 id: string
 family: VisualCanvasFamily
 aspect?: VisualCanvasAspect
 /**
  * What the canvas does with its ratio on a landscape phone. `"fill"` takes the
  * full width and whatever height is left; a fixed aspect letterboxes instead.
  */
 landscapeAspect?: VisualCanvasAspect | "fill"
 className?: string
 children: React.ReactNode
}

/**
 * Canonical analytical-canvas boundary for responsive ViewTube visuals.
 *
 * This component owns canvas geometry only — width, aspect ratio, bounded
 * height and orientation behaviour. Module chrome (header, controls, legend,
 * explanation) remains the responsibility of the parent visual frame, and the
 * renderer inside only draws.
 *
 * The geometry itself is expressed in `styles/data-visual-canvas.css`, keyed on
 * the data attributes emitted here, so there is exactly one place that decides
 * what a canvas measures in each orientation. Renderer migrations should use
 * this boundary instead of title matching or a fixed parent pixel height.
 */
export const VisualCanvasViewport = React.forwardRef<HTMLDivElement, VisualCanvasViewportProps>(({
 id,
 family,
 aspect = "16:9",
 landscapeAspect = "fill",
 className,
 children,
}, ref) => (
 <div
  ref={ref}
  className={className}
  data-vt-visual-canvas={id}
  data-vt-visual-family={family}
  data-vt-visual-aspect={aspect}
  data-vt-canvas-landscape-aspect={landscapeAspect}
  style={{ touchAction: "pan-y" }}
 >
  {children}
 </div>
))

VisualCanvasViewport.displayName = "VisualCanvasViewport"
