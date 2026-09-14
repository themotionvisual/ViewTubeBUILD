import React from "react"
import { VisualCanvasViewport } from "./VisualCanvasViewport"
import {
 dataVisualModuleContract,
 type RegisteredDataVisualModuleId,
} from "./dataVisualModuleContract"

export interface DataVisualCanvasProps {
 id: RegisteredDataVisualModuleId
 className?: string
 children: React.ReactNode
}

/**
 * Canonical evidence-canvas wrapper for registered Data Visual modules.
 * Individual renderers fill this region; Toolbox/Analytics shell geometry
 * remains outside this component and is intentionally unaffected.
 */
export const DataVisualCanvas: React.FC<DataVisualCanvasProps> = ({ id, className, children }) => {
 const contract = dataVisualModuleContract(id)
 return (
  <VisualCanvasViewport
   id={contract.id}
   family={contract.family}
   aspect={contract.canvasAspect}
   className={className}
  >
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
