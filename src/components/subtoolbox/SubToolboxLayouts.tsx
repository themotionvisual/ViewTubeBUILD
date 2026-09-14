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
  columns?: 1 | 2 | 3 | 4
  density?: SubToolboxLayoutDensity
  className?: string
  children: React.ReactNode
}> = ({ columns = 2, density = "standard", className, children, ...props }) => (
  <div className={classes("vt-subtoolbox-grid", `is-${columns}-columns`, `is-${density}`, className)} {...props}>{children}</div>
)

export const SubToolboxActionRow: React.FC<React.HTMLAttributes<HTMLDivElement> & { align?: "start" | "between" | "end"; className?: string; children: React.ReactNode }> = ({ align = "end", className, children, ...props }) => <div className={classes("vt-subtoolbox-actions", `is-${align}`, className)} {...props}>{children}</div>

export const SubToolboxSection: React.FC<React.HTMLAttributes<HTMLElement> & { title?: React.ReactNode; description?: React.ReactNode; actions?: React.ReactNode; children: React.ReactNode }> = ({ title, description, actions, className, children, ...props }) => <section className={classes("vt-subtoolbox-section", className)} {...props}>{title || description || actions ? <header className="vt-subtoolbox-section-header"><div>{title ? <h4>{title}</h4> : null}{description ? <p>{description}</p> : null}</div>{actions}</header> : null}<div className="vt-subtoolbox-section-body">{children}</div></section>
