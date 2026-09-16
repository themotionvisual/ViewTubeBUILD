import React from "react"
import { dataVisualModuleContract, type RegisteredDataVisualModuleId } from "./dataVisualModuleContract"

export interface DataVisualPlotProps {
 id: RegisteredDataVisualModuleId
 className?: string
 children: React.ReactNode
}

/**
 * Internal plot boundary for Data Visual modules. The outer canvas aspect and
 * the internal plot aspect are separate concepts: a radial module keeps a
 * square plot centred inside a wide evidence canvas without the module or the
 * canvas ever becoming square. Geometry lives in `data-visual-canvas.css`.
 */
export const DataVisualPlot: React.FC<DataVisualPlotProps> = ({ id, className, children }) => {
 const { plotAspect } = dataVisualModuleContract(id)

 return (
  <div
   className={`flex h-full min-h-0 w-full min-w-0 items-center justify-center ${className ?? ""}`.trim()}
   data-vt-data-visual-plot-host={id}
  >
   <div
    className="min-h-0 min-w-0"
    data-vt-data-visual-plot={id}
    data-vt-data-visual-plot-aspect={plotAspect ?? "natural"}
    style={plotAspect === "natural" || !plotAspect ? { width: "100%", height: "100%" } : undefined}
   >
    {children}
   </div>
  </div>
 )
}
