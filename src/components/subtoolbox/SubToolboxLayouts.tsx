import React from "react"
import "../../styles/toolbox-entry.css"
import type { SubToolboxLayoutDensity } from "./tokens"

const classes = (...values: Array<string | false | null | undefined>) => values.filter(Boolean).join(" ")

export const SubToolboxStack: React.FC<React.HTMLAttributes<HTMLDivElement> & {
  density?: SubToolboxLayoutDensity
  className?: string
  children: React.ReactNode
}> = ({ density = "standard", className, children, ...props }) => (
  <div className={classes("vt-subtoolbox-stack", `is-${density}`, className)} {...props}>{children}</div>
)

export const SubToolboxGrid: React.FC<React.HTMLAttributes<HTMLDivElement> & {
  minItemWidth?: "compact" | "standard" | "wide"
  density?: SubToolboxLayoutDensity
  className?: string
  children: React.ReactNode
}> = ({ minItemWidth = "standard", density = "standard", className, children, ...props }) => (
  <div className={classes("vt-subtoolbox-grid", `is-${minItemWidth}`, `is-${density}`, className)} {...props}>{children}</div>
)

export const SubToolboxActions: React.FC<React.HTMLAttributes<HTMLDivElement> & {
  columns?: 1 | 2 | 3 | 4
  className?: string
  children: React.ReactNode
}> = ({ columns = 2, className, children, ...props }) => (
  <div className={classes("vt-subtoolbox-actions", `has-${columns}-columns`, className)} {...props}>{children}</div>
)

export const SubToolboxSection: React.FC<{
  label?: React.ReactNode
  className?: string
  children: React.ReactNode
}> = ({ label, className, children }) => (
  <section className={classes("vt-subtoolbox-section", className)}>
    {label ? <div className="vt-subtoolbox-section-label">{label}</div> : null}
    {children}
  </section>
)
