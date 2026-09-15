import React from "react"
import { VisualCanvasViewport } from "./VisualCanvasViewport"
import { usePublishedChromeHeight } from "./dataVisualCanvasGeometry"
import { dataVisualModuleContract, type RegisteredDataVisualModuleId } from "./dataVisualModuleContract"

export interface DataVisualCanvasProps {
 id: RegisteredDataVisualModuleId
 className?: string
 children: React.ReactNode
}

/**
 * Canvas-only boundary for registered Data Visual modules.
 *
 * Resolves the module's registered canvas contract — family, aspect, density
 * and overflow policy — and hands geometry to `VisualCanvasViewport`. The
 * emitted attributes are the contract surface CSS and renderers read; nothing
 * here inspects a module title.
 */
export const DataVisualCanvas: React.FC<DataVisualCanvasProps> = ({ id, className, children }) => {
 const contract = dataVisualModuleContract(id)
 const canvasRef = React.useRef<HTMLDivElement | null>(null)
 // The landscape height clamp needs this module's real chrome height, not a
 // flat guess, or the canvas sizes itself against space the module has not got.
 usePublishedChromeHeight(canvasRef)

 return (
  <VisualCanvasViewport ref={canvasRef} id={contract.id} family={contract.family} aspect={contract.canvasAspect} className={className}>
   <div
    className="h-full min-h-0 w-full min-w-0"
    data-vt-data-visual-module={id}
    data-vt-data-visual-density={contract.density ?? "normal"}
    data-vt-data-visual-overflow={contract.overflow ?? "clip"}
    data-vt-data-visual-plot-aspect={contract.plotAspect ?? "natural"}
   >
    {children}
   </div>
  </VisualCanvasViewport>
 )
}
