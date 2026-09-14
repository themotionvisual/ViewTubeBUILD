import React from "react"
import {
  SubToolboxActions as BaseActions,
  SubToolboxGrid as BaseGrid,
  SubToolboxSection as BaseSection,
  SubToolboxStack as BaseStack,
} from "../../components/subtoolbox/SubToolboxLayouts"

export const SubToolboxStack = BaseStack
export const SubToolboxGrid = BaseGrid
export const SubToolboxActions = BaseActions
export const SubToolboxSection = BaseSection

const classes = (...values: Array<string | false | null | undefined>) => values.filter(Boolean).join(" ")

export const SubToolboxSplit: React.FC<React.HTMLAttributes<HTMLDivElement> & {
  ratio?: "1/1" | "1/2" | "2/1"
  children: React.ReactNode
}> = ({ ratio = "1/1", className, children, ...props }) => (
  <div data-vt-studio-layout="split" data-ratio={ratio} className={classes("vt-studio-layout-split", className)} {...props}>
    {children}
  </div>
)

export const SubToolboxScroll: React.FC<React.HTMLAttributes<HTMLDivElement> & {
  maxHeight?: "compact" | "standard" | "large"
  children: React.ReactNode
}> = ({ maxHeight = "standard", className, children, ...props }) => (
  <div data-vt-studio-layout="scroll" data-max-height={maxHeight} className={classes("vt-studio-layout-scroll", className)} {...props}>
    {children}
  </div>
)

export const SubToolboxMetrics: React.FC<React.HTMLAttributes<HTMLDivElement> & {
  columns?: 2 | 3 | 4 | 6
  children: React.ReactNode
}> = ({ columns = 4, className, children, ...props }) => (
  <div data-vt-studio-layout="metrics" data-columns={columns} className={classes("vt-studio-layout-metrics", className)} {...props}>
    {children}
  </div>
)
