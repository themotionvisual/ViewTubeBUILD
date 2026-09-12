import React from "react"
import type { SubToolboxControlSize, SubToolboxState } from "./tokens"

type PrimitiveTone = "accent" | "neutral" | "danger" | "warning" | "success"

const classes = (...values: Array<string | false | null | undefined>) => values.filter(Boolean).join(" ")

export const SubToolboxFieldLabel: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({
  className,
  ...props
}) => <label className={classes("vt-subtoolbox-label", className)} {...props} />

export const SubToolboxInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={classes("vt-subtoolbox-input", className)} {...props} />
  ),
)
SubToolboxInput.displayName = "SubToolboxInput"

export const SubToolboxTextArea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { height?: "compact" | "standard" | "fill" }
>(({ className, height = "standard", ...props }, ref) => (
  <textarea
    ref={ref}
    className={classes("vt-subtoolbox-input", "vt-subtoolbox-textarea", `is-${height}`, className)}
    {...props}
  />
))
SubToolboxTextArea.displayName = "SubToolboxTextArea"

export const SubToolboxSelect = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select ref={ref} className={classes("vt-subtoolbox-input", "vt-subtoolbox-select", className)} {...props} />
))
SubToolboxSelect.displayName = "SubToolboxSelect"

export interface SubToolboxButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: SubToolboxControlSize
  tone?: PrimitiveTone
  selected?: boolean
  icon?: React.ReactNode
}

export const SubToolboxButton: React.FC<SubToolboxButtonProps> = ({
  className,
  size = "standard",
  tone = "accent",
  selected = false,
  icon,
  children,
  type = "button",
  ...props
}) => (
  <button
    type={type}
    className={classes("vt-subtoolbox-button", `is-${size}`, `is-${tone}`, selected && "is-selected", className)}
    aria-pressed={props["aria-pressed"] ?? (selected || undefined)}
    {...props}
  >
    {icon ? <span className="vt-subtoolbox-button-icon" aria-hidden="true">{icon}</span> : null}
    <span className="vt-subtoolbox-button-label">{children}</span>
  </button>
)

export const SubToolboxLinkButton: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  size?: SubToolboxControlSize
  tone?: PrimitiveTone
  icon?: React.ReactNode
}> = ({ className, size = "action", tone = "accent", icon, children, ...props }) => (
  <a className={classes("vt-subtoolbox-button", `is-${size}`, `is-${tone}`, className)} {...props}>
    {icon ? <span className="vt-subtoolbox-button-icon" aria-hidden="true">{icon}</span> : null}
    <span className="vt-subtoolbox-button-label">{children}</span>
  </a>
)

export const SubToolboxSurface: React.FC<{
  tone?: "white" | "subtle" | "accent"
  scroll?: boolean
  className?: string
  children: React.ReactNode
}> = ({ tone = "white", scroll = false, className, children }) => (
  <div className={classes("vt-subtoolbox-surface", `is-${tone}`, scroll && "is-scroll", className)}>{children}</div>
)

const DEFAULT_STATE_COPY: Record<SubToolboxState, string> = {
  loading: "Loading…",
  ready: "Ready.",
  empty: "Nothing to show yet.",
  blocked: "A required connection is unavailable.",
  stale: "This information may be out of date.",
  error: "This section could not be loaded.",
}

export const SubToolboxStatePanel: React.FC<{
  state: SubToolboxState
  message?: React.ReactNode
  action?: React.ReactNode
  className?: string
}> = ({ state, message, action, className }) => {
  const urgent = state === "error" || state === "blocked"
  return (
    <section
      className={classes("vt-subtoolbox-state", `is-${state}`, className)}
      data-subtoolbox-state={state}
      role={urgent ? "alert" : "status"}
      aria-live={urgent ? "assertive" : "polite"}
    >
      <p>{message ?? DEFAULT_STATE_COPY[state]}</p>
      {action}
    </section>
  )
}
