import React from "react"

export type VisualCanvasFamily = "spatial" | "temporal" | "radial" | "natural"
export type VisualCanvasAspect = "16:9" | "1:1" | "natural"

export interface VisualCanvasViewportProps {
 id: string
 family: VisualCanvasFamily
 aspect?: VisualCanvasAspect
 className?: string
 children: React.ReactNode
}

const aspectRatioFor = (aspect: VisualCanvasAspect): React.CSSProperties["aspectRatio"] => {
 if (aspect === "16:9") return "16 / 9"
 if (aspect === "1:1") return "1 / 1"
 return "auto"
}

/**
 * Canonical analytical-canvas boundary for responsive ViewTube visuals.
 *
 * This component owns canvas geometry only. Toolbox/Analytics shell chrome,
 * controls, legends and explanation content remain the responsibility of the
 * parent visual frame. New renderer migrations should use this boundary
 * instead of relying on title matching or a fixed parent pixel height.
 */
export const VisualCanvasViewport: React.FC<VisualCanvasViewportProps> = ({
 id,
 family,
 aspect = "16:9",
 className,
 children,
}) => (
 <div
  className={className}
  data-vt-visual-canvas={id}
  data-vt-visual-family={family}
  data-vt-visual-aspect={aspect}
  style={{
   width: "100%",
   maxWidth: "100%",
   aspectRatio: aspectRatioFor(aspect),
   minWidth: 0,
   minHeight: 0,
   overflow: aspect === "natural" ? "visible" : "hidden",
   touchAction: "pan-y",
  }}
 >
  {children}
 </div>
)
