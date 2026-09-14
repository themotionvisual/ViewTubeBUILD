import React from "react"
import { dataVisualModuleContract, type RegisteredDataVisualModuleId } from "./dataVisualModuleContract"

export interface DataVisualPlotProps {
 id: RegisteredDataVisualModuleId
 className?: string
 children: React.ReactNode
}

/**
 * Optional inner plot boundary for Data Visual modules. Radial modules can
 * preserve a square plot inside a wide evidence canvas without making the
 * complete module or outer canvas square.
 */
export const DataVisualPlot: React.FC<DataVisualPlotProps> = ({ id, className, children }) => {
 const { plotAspect } = dataVisualModuleContract(id)
 const aspectRatio = plotAspect === "16:9" ? "16 / 9" : plotAspect === "1:1" ? "1 / 1" : undefined

 return (
  <div
   className={`mx-auto h-full min-h-0 max-h-full max-w-full ${className ?? ""}`.trim()}
   data-vt-data-visual-plot={id}
   data-vt-data-visual-plot-aspect={plotAspect ?? "natural"}
   style={{
    aspectRatio,
    width: aspectRatio ? "auto" : "100%",
   }}
  >
   {children}
  </div>
 )
}
