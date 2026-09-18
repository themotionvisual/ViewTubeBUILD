import React from "react"
import type { SubToolboxControlSize, SubToolboxState } from "./tokens"

type PrimitiveTone = "accent" | "neutral" | "ink" | "danger" | "warning" | "success"
type SplitActionVariant = "head" | "tail"

const classes = (...values: Array<string | false | null | undefined>) => values.filter(Boolean).join(" ")

export const SubToolboxFieldLabel: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ className, ...props }) => <label className={classes("vt-subtoolbox-label", className)} {...props} />

export interface SubToolboxInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  controlSize?: "micro" | "standard"
}
export const SubToolboxInput = React.forwardRef<HTMLInputElement, SubToolboxInputProps>(({ className, controlSize = "standard", ...props }, ref) => <input ref={ref} className={classes("vt-subtoolbox-input", `is-${controlSize}`, className)} {...props} />)
SubToolboxInput.displayName = "SubToolboxInput"

export const SubToolboxTextArea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & { height?: "compact" | "standard" | "fill" }>(({ className, height = "standard", ...props }, ref) => <textarea ref={ref} className={classes("vt-subtoolbox-input", "vt-subtoolbox-textarea", `is-${height}`, className)} {...props} />)
SubToolboxTextArea.displayName = "SubToolboxTextArea"

export interface SubToolboxSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  controlSize?: "micro" | "standard"
}
export const SubToolboxSelect = React.forwardRef<HTMLSelectElement, SubToolboxSelectProps>(({ className, controlSize = "standard", ...props }, ref) => <select ref={ref} className={classes("vt-subtoolbox-input", "vt-subtoolbox-select", `is-${controlSize}`, className)} {...props} />)
SubToolboxSelect.displayName = "SubToolboxSelect"

export interface SubToolboxButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { size?: SubToolboxControlSize; tone?: PrimitiveTone; selected?: boolean; icon?: React.ReactNode }
export const SubToolboxButton: React.FC<SubToolboxButtonProps> = ({ className, size = "standard", tone = "accent", selected = false, icon, children, type = "button", ...props }) => <button type={type} className={classes("vt-subtoolbox-button", `is-${size}`, `is-${tone}`, selected && "is-selected", className)} aria-pressed={props["aria-pressed"] ?? (selected || undefined)} {...props}>{icon ? <span className="vt-subtoolbox-button-icon" aria-hidden="true">{icon}</span> : null}<span className="vt-subtoolbox-button-label">{children}</span></button>

export const SubToolboxLinkButton: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement> & { size?: SubToolboxControlSize; tone?: PrimitiveTone; icon?: React.ReactNode }> = ({ className, size = "action", tone = "accent", icon, children, ...props }) => <a className={classes("vt-subtoolbox-button", `is-${size}`, `is-${tone}`, className)} {...props}>{icon ? <span className="vt-subtoolbox-button-icon" aria-hidden="true">{icon}</span> : null}<span className="vt-subtoolbox-button-label">{children}</span></a>

export interface SubToolboxSplitActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: SplitActionVariant
  icon: React.ReactNode
  children: React.ReactNode
}
export const SubToolboxSplitActionButton: React.FC<SubToolboxSplitActionButtonProps> = ({ variant = "head", icon, children, className, type = "button", ...props }) => (
  <button type={type} className={classes("vt-subtoolbox-split-action", `is-${variant}`, className)} {...props}>
    <span className="vt-subtoolbox-split-action-icon" aria-hidden="true">{icon}</span>
    <span className="vt-subtoolbox-split-action-title">{children}</span>
  </button>
)

export const SubToolboxCheckbox: React.FC<Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & { label: React.ReactNode }> = ({ label, className, ...props }) => (
  <label className={classes("vt-subtoolbox-binary", "is-checkbox", className)}>
    <input type="checkbox" {...props} />
    <span className="vt-subtoolbox-binary-mark" aria-hidden="true" />
    <span className="vt-subtoolbox-binary-label">{label}</span>
  </label>
)

export const SubToolboxRadio: React.FC<Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & { label: React.ReactNode }> = ({ label, className, ...props }) => (
  <label className={classes("vt-subtoolbox-binary", "is-radio", className)}>
    <input type="radio" {...props} />
    <span className="vt-subtoolbox-binary-mark" aria-hidden="true" />
    <span className="vt-subtoolbox-binary-label">{label}</span>
  </label>
)

export const SubToolboxToggle: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { pressed: boolean; label: React.ReactNode }> = ({ pressed, label, className, type = "button", ...props }) => (
  <button type={type} className={classes("vt-subtoolbox-binary", "is-toggle", pressed && "is-on", className)} aria-pressed={pressed} {...props}>
    <span className="vt-subtoolbox-toggle-track" aria-hidden="true"><span className="vt-subtoolbox-toggle-thumb" /></span>
    <span className="vt-subtoolbox-binary-label">{label}</span>
  </button>
)

export const SubToolboxBadge: React.FC<React.HTMLAttributes<HTMLSpanElement> & { active?: boolean }> = ({ active = true, className, children, ...props }) => <span className={classes("vt-subtoolbox-chip", "is-badge", active && "is-active", className)} {...props}>{children}</span>

export const SubToolboxTag: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }> = ({ selected = false, className, children, type = "button", ...props }) => <button type={type} className={classes("vt-subtoolbox-chip", "is-tag", selected && "is-active", className)} aria-pressed={selected} {...props}>{children}</button>

export const SubToolboxSurface: React.FC<React.HTMLAttributes<HTMLDivElement> & { tone?: "white" | "subtle" | "accent"; scroll?: boolean; children: React.ReactNode }> = ({ tone = "white", scroll = false, className, children, ...props }) => <div className={classes("vt-subtoolbox-surface", `is-${tone}`, scroll && "is-scroll", className)} {...props}>{children}</div>

export const SubToolboxMetric: React.FC<{ label: React.ReactNode; value: React.ReactNode; accentColor?: string; className?: string }> = ({ label, value, accentColor, className }) => <SubToolboxSurface className={classes("vt-subtoolbox-metric", className)} style={accentColor ? { ["--vt-subtoolbox-card-fill" as string]: accentColor } : undefined}><div className="vt-subtoolbox-metric-label">{label}</div><div className="vt-subtoolbox-metric-value">{value}</div></SubToolboxSurface>

export const SubToolboxOutputCard: React.FC<Omit<React.HTMLAttributes<HTMLElement>, "title"> & { title: React.ReactNode; icon?: React.ReactNode; accentColor?: string; badge?: React.ReactNode; action?: React.ReactNode; scroll?: boolean; children: React.ReactNode }> = ({ title, icon, accentColor, badge, action, scroll = false, className, children, style, ...props }) => <article className={classes("vt-subtoolbox-output", scroll && "is-scroll", className)} style={{ ...style, ...(accentColor ? { ["--vt-subtoolbox-card-fill" as string]: accentColor } : {}) }} {...props}><header className="vt-subtoolbox-output-header"><div className="vt-subtoolbox-output-title">{icon ? <span aria-hidden="true">{icon}</span> : null}<span>{title}</span></div>{action ?? (badge ? <span className="vt-subtoolbox-output-badge">{badge}</span> : null)}</header><div className="vt-subtoolbox-output-body">{children}</div></article>

/* Canonical Toolbox upload primitive: Tight Reveal (#05).
 * Seven flush nested bands replace the legacy dashed drop-zone treatment. */
export const SubToolboxFileTarget: React.FC<{ label: React.ReactNode; icon?: React.ReactNode; accept?: string; multiple?: boolean; minHeight?: number; onFiles?: (files: FileList | null) => void; className?: string }> = ({ label, icon, accept, multiple = false, minHeight = 220, onFiles, className }) => {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = React.useState(false)
  const choose = () => inputRef.current?.click()
  return <SubToolboxSurface className={classes("vt-subtoolbox-file-target", "vt-upload-tight-reveal", dragging && "is-dragging", className)} style={{ minHeight, border: 0 }}>
    <input ref={inputRef} type="file" accept={accept} multiple={multiple} className="hidden" onChange={(event) => onFiles?.(event.target.files)} />
    <button type="button" className="vt-subtoolbox-file-target-button" onClick={choose} onDragEnter={(e) => { e.preventDefault(); setDragging(true) }} onDragOver={(e) => { e.preventDefault(); setDragging(true) }} onDragLeave={(e) => { e.preventDefault(); setDragging(false) }} onDrop={(e) => { e.preventDefault(); setDragging(false); onFiles?.(e.dataTransfer.files) }}>
      <span className="vt-upload-tight-reveal-layers" aria-hidden="true">{[7,6,5,4,3,2,1].map((layer) => <span key={layer} className={`vt-upload-tight-reveal-layer is-l${layer}`} />)}</span>
      <span className="vt-upload-tight-reveal-center"><span className="vt-subtoolbox-file-target-icon" aria-hidden="true">{icon}</span><span className="vt-upload-tight-reveal-label">{label}</span></span>
    </button>
  </SubToolboxSurface>
}

const DEFAULT_STATE_COPY: Record<SubToolboxState, string> = { loading: "Loading…", ready: "Ready.", empty: "Nothing to show yet.", "filtered-empty": "No results match the current filters.", disconnected: "Connect your channel to load this.", blocked: "A required connection is unavailable.", stale: "This information may be out of date.", permission: "You do not have access to this.", error: "This section could not be loaded." }
export const SubToolboxStatePanel: React.FC<{ state: SubToolboxState; message?: React.ReactNode; action?: React.ReactNode; className?: string }> = ({ state, message, action, className }) => { const urgent = state === "error" || state === "blocked"; return <section className={classes("vt-subtoolbox-state", `is-${state}`, className)} data-subtoolbox-state={state} role={urgent ? "alert" : "status"} aria-live={urgent ? "assertive" : "polite"}><p>{message ?? DEFAULT_STATE_COPY[state]}</p>{action}</section> }
