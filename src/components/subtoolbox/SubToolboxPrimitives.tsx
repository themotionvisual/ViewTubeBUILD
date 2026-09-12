import React from "react"
import type { SubToolboxControlSize, SubToolboxState } from "./tokens"

type PrimitiveTone = "accent" | "neutral" | "ink" | "danger" | "warning" | "success"

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

export const SubToolboxSurface: React.FC<React.HTMLAttributes<HTMLDivElement> & {
  tone?: "white" | "subtle" | "accent"
  scroll?: boolean
  children: React.ReactNode
}> = ({ tone = "white", scroll = false, className, children, ...props }) => (
  <div className={classes("vt-subtoolbox-surface", `is-${tone}`, scroll && "is-scroll", className)} {...props}>{children}</div>
)

export const SubToolboxMetric: React.FC<{
  label: React.ReactNode
  value: React.ReactNode
  accentColor?: string
  className?: string
}> = ({ label, value, accentColor, className }) => (
  <SubToolboxSurface
    className={classes("vt-subtoolbox-metric", className)}
    style={accentColor ? { ["--vt-subtoolbox-card-fill" as string]: accentColor } : undefined}
  >
    <div className="vt-subtoolbox-metric-label">{label}</div>
    <div className="vt-subtoolbox-metric-value">{value}</div>
  </SubToolboxSurface>
)

export const SubToolboxOutputCard: React.FC<Omit<React.HTMLAttributes<HTMLElement>, "title"> & {
  title: React.ReactNode
  icon?: React.ReactNode
  accentColor?: string
  badge?: React.ReactNode
  action?: React.ReactNode
  scroll?: boolean
  children: React.ReactNode
}> = ({ title, icon, accentColor, badge, action, scroll = false, className, children, style, ...props }) => (
  <article
    className={classes("vt-subtoolbox-output", scroll && "is-scroll", className)}
    style={{
      ...style,
      ...(accentColor ? { ["--vt-subtoolbox-card-fill" as string]: accentColor } : {}),
    }}
    {...props}
  >
    <header className="vt-subtoolbox-output-header">
      <div className="vt-subtoolbox-output-title">
        {icon ? <span aria-hidden="true">{icon}</span> : null}
        <span>{title}</span>
      </div>
      {action ?? (badge ? <span className="vt-subtoolbox-output-badge">{badge}</span> : null)}
    </header>
    <div className="vt-subtoolbox-output-body">{children}</div>
  </article>
)

export const SubToolboxFileTarget: React.FC<{
  label: React.ReactNode
  icon?: React.ReactNode
  accept?: string
  multiple?: boolean
  minHeight?: number
  onFiles?: (files: FileList | null) => void
  className?: string
}> = ({ label, icon, accept, multiple = false, minHeight = 220, onFiles, className }) => {
  const inputRef = React.useRef<HTMLInputElement>(null)
  return (
    <SubToolboxSurface className={classes("vt-subtoolbox-file-target", className)} style={{ minHeight }}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(event) => onFiles?.(event.target.files)}
      />
      <button type="button" className="vt-subtoolbox-file-target-button" onClick={() => inputRef.current?.click()}>
        {icon ? <span className="vt-subtoolbox-file-target-icon" aria-hidden="true">{icon}</span> : null}
        <span>{label}</span>
      </button>
    </SubToolboxSurface>
  )
}

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
