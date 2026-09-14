import React from "react"
import { VisualCanvasViewport } from "./VisualCanvasViewport"
import { dataVisualModuleContract, type RegisteredDataVisualModuleId } from "./dataVisualModuleContract"

export interface DataVisualCanvasProps {
 id: RegisteredDataVisualModuleId
 className?: string
 children: React.ReactNode
}

/** Canvas-only boundary for source-native Data Visual modules. */
export const DataVisualCanvas: React.FC<DataVisualCanvasProps> = ({ id, className, children }) => {
 const contract = dataVisualModuleContract(id)
 const overflowClass = contract.overflow === "scroll" ? "overflow-auto" : contract.overflow === "natural" ? "overflow-visible" : "overflow-hidden"
 return (
  <VisualCanvasViewport id={contract.id} family={contract.family} aspect={contract.canvasAspect} className={className}>
   <div
    className={`h-full min-h-0 w-full min-w-0 ${overflowClass}`}
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
