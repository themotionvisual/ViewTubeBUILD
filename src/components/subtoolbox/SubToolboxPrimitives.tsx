import React from "react"
import "../../styles/toolbox-entry.css"
import type { SubToolboxControlSize, SubToolboxState } from "./tokens"

type PrimitiveTone = "accent" | "neutral" | "ink" | "danger" | "warning" | "success"
type SplitActionVariant = "head" | "tail"

const classes = (...values: Array<string | false | null | undefined>) => values.filter(Boolean).join(" ")

export const SubToolboxFieldLabel: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ className, ...props }) => <label className={classes("vt-subtoolbox-label", className)} {...props} />

export interface SubToolboxInputProps extends React.InputHTMLAttributes<HTMLInputElement> { controlSize?: "micro" | "standard" }
export const SubToolboxInput = React.forwardRef<HTMLInputElement, SubToolboxInputProps>(({ className, controlSize = "standard", ...props }, ref) => <input ref={ref} className={classes("vt-subtoolbox-input", `is-${controlSize}`, className)} {...props} />)
SubToolboxInput.displayName = "SubToolboxInput"

export const SubToolboxTextArea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & { height?: "compact" | "standard" | "fill" }>(({ className, height = "standard", ...props }, ref) => <textarea ref={ref} className={classes("vt-subtoolbox-input", "vt-subtoolbox-textarea", `is-${height}`, className)} {...props} />)
SubToolboxTextArea.displayName = "SubToolboxTextArea"

export interface SubToolboxSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> { controlSize?: SubToolboxControlSize }
export const SubToolboxSelect = React.forwardRef<HTMLSelectElement, SubToolboxSelectProps>(({ className, controlSize = "standard", ...props }, ref) => <select ref={ref} className={classes("vt-subtoolbox-select", `is-${controlSize}`, className)} {...props} />)
SubToolboxSelect.displayName = "SubToolboxSelect"

export interface SubToolboxButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { tone?: PrimitiveTone; controlSize?: SubToolboxControlSize }
export const SubToolboxButton: React.FC<SubToolboxButtonProps> = ({ className, tone = "accent", controlSize = "standard", type = "button", ...props }) => <button type={type} className={classes("vt-subtoolbox-button", `is-${tone}`, `is-${controlSize}`, className)} {...props} />

export const SubToolboxIconButton: React.FC<SubToolboxButtonProps & { label: string }> = ({ label, className, ...props }) => <SubToolboxButton aria-label={label} title={label} className={classes("vt-subtoolbox-icon-button", className)} {...props} />

export const SubToolboxField: React.FC<React.HTMLAttributes<HTMLDivElement> & { label?: React.ReactNode; hint?: React.ReactNode }> = ({ label, hint, className, children, ...props }) => <div className={classes("vt-subtoolbox-field", className)} {...props}>{label ? <SubToolboxFieldLabel>{label}</SubToolboxFieldLabel> : null}{children}{hint ? <small className="vt-subtoolbox-hint">{hint}</small> : null}</div>

export const SubToolboxStateSurface: React.FC<React.HTMLAttributes<HTMLDivElement> & { state: SubToolboxState }> = ({ state, className, ...props }) => <div className={classes("vt-subtoolbox-state", `is-${state}`, className)} data-state={state} {...props} />

export const SubToolboxSplitAction: React.FC<SubToolboxButtonProps & { variant?: SplitActionVariant; icon?: React.ReactNode }> = ({ variant = "head", icon, children, className, ...props }) => <SubToolboxButton className={classes("vt-subtoolbox-split-action", `is-${variant}`, className)} {...props}>{icon ? <span className="vt-subtoolbox-split-action-icon" aria-hidden="true">{icon}</span> : null}<span>{children}</span></SubToolboxButton>
