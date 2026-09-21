import React from "react"
import { VisualModuleController, type VisualModuleControllerProps } from "./VisualModuleController"

/** Shared placement for declarative controllers in both Analytics shells. */
export const VisualControllerRail: React.FC<React.PropsWithChildren<{
  rows?: VisualModuleControllerProps["rows"]
  width?: VisualModuleControllerProps["width"]
  density?: VisualModuleControllerProps["density"]
  background?: string
  leading?: React.ReactNode
}>> = ({ rows, width, density, background, leading, children }) => (
  <div
    className="flex w-full shrink-0 items-stretch overflow-x-auto border-t-[4px] border-black sm:w-auto sm:border-t-0"
    style={{ background }}
    onClick={(event) => event.stopPropagation()}
  >
    {leading}
    {rows ? <VisualModuleController rows={rows} width={width} density={density} /> : children}
  </div>
)
