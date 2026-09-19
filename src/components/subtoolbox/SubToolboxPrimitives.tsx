import React from "react"
import { getComponentLevelCssVars } from "./tokens"
import type { SubToolboxControlSize, SubToolboxState, ToolboxControlLevel } from "./tokens"
import { getAlphabeticalSpectrumColor } from "../../styles/toolboxPalette"

type PrimitiveTone = "accent" | "neutral" | "ink" | "danger" | "warning" | "success"
type SplitActionVariant = "head" | "tail"

const classes = (...values: Array<string | false | null | undefined>) => values.filter(Boolean).join(" ")

const withComponentLevelStyle = (
  level: ToolboxControlLevel | undefined,
  style: React.CSSProperties | undefined,
): React.CSSProperties | undefined => level
  ? { ...style, ...getComponentLevelCssVars(level) } as React.CSSProperties
  : style

export const SubToolboxFieldLabel: React.FC<React.LabelHTMLAttributes<HTMLLabelElement> & { level?: ToolboxControlLevel }> = ({ level, className, style, ...props }) => <label data-vt-control-level={level} style={withComponentLevelStyle(level, style)} className={classes("vt-subtoolbox-label", level && "has-component-level", className)} {...props} />

export interface SubToolboxInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  controlSize?: "micro" | "standard"
  level?: ToolboxControlLevel
}
export const SubToolboxInput = React.forwardRef<HTMLInputElement, SubToolboxInputProps>(({ className, controlSize = "standard", level, style, ...props }, ref) => <input ref={ref} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} className={classes("vt-subtoolbox-input", `is-${controlSize}`, level && "has-component-level", className)} {...props} />)
SubToolboxInput.displayName = "SubToolboxInput"

export const SubToolboxTextArea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & { height?: "compact" | "standard" | "fill"; level?: ToolboxControlLevel }>(({ className, height = "standard", level, style, ...props }, ref) => <textarea ref={ref} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} className={classes("vt-subtoolbox-input", "vt-subtoolbox-textarea", `is-${height}`, level && "has-component-level", className)} {...props} />)
SubToolboxTextArea.displayName = "SubToolboxTextArea"

export interface SubToolboxSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  controlSize?: "micro" | "standard"
}
export const SubToolboxSelect = React.forwardRef<HTMLSelectElement, SubToolboxSelectProps>(({ className, controlSize = "standard", ...props }, ref) => <select ref={ref} className={classes("vt-subtoolbox-input", "vt-subtoolbox-select", `is-${controlSize}`, className)} {...props} />)
SubToolboxSelect.displayName = "SubToolboxSelect"

export interface SubToolboxButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { size?: SubToolboxControlSize; tone?: PrimitiveTone; selected?: boolean; icon?: React.ReactNode; level?: ToolboxControlLevel }
export const SubToolboxButton: React.FC<SubToolboxButtonProps> = ({ className, size = "standard", tone = "accent", selected = false, icon, children, type = "button", level, style, ...props }) => <button type={type} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} className={classes("vt-subtoolbox-button", `is-${size}`, `is-${tone}`, level && "has-component-level", selected && "is-selected", className)} aria-pressed={props["aria-pressed"] ?? (selected || undefined)} {...props}>{icon ? <span className="vt-subtoolbox-button-icon" aria-hidden="true">{icon}</span> : null}<span className="vt-subtoolbox-button-label">{children}</span></button>

export interface SubToolboxIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  level?: ToolboxControlLevel
  icon: React.ReactNode
  ariaLabel: string
}
export const SubToolboxIconButton: React.FC<SubToolboxIconButtonProps> = ({ level = "l0", icon, ariaLabel, className, style, type = "button", ...props }) => (
  <button type={type} aria-label={ariaLabel} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} className={classes("vt-subtoolbox-icon-button", className)} {...props}>{icon}</button>
)

export interface SubToolboxToggleSwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  level?: ToolboxControlLevel
  pressed: boolean
}
export const SubToolboxToggleSwitch: React.FC<SubToolboxToggleSwitchProps> = ({ level = "l0", pressed, className, style, type = "button", ...props }) => (
  <button type={type} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} className={classes("vt-subtoolbox-toggle-switch", pressed && "is-on", className)} aria-pressed={pressed} {...props}><span aria-hidden="true" /></button>
)

export interface SubToolboxCheckControlProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  level?: ToolboxControlLevel
  checked: boolean
}
export const SubToolboxCheckControl: React.FC<SubToolboxCheckControlProps> = ({ level = "l0", checked, className, style, type = "button", ...props }) => (
  <button type={type} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} className={classes("vt-subtoolbox-check-control", checked && "is-on", className)} aria-pressed={checked} {...props}><span aria-hidden="true" /></button>
)

export interface SubToolboxRadioControlProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  level?: ToolboxControlLevel
  checked: boolean
}
export const SubToolboxRadioControl: React.FC<SubToolboxRadioControlProps> = ({ level = "l0", checked, className, style, type = "button", ...props }) => (
  <button type={type} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} className={classes("vt-subtoolbox-radio-control", checked && "is-on", className)} aria-pressed={checked} {...props}><span aria-hidden="true" /></button>
)

export interface SubToolboxStatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  level?: ToolboxControlLevel
}
export const SubToolboxStatusBadge: React.FC<SubToolboxStatusBadgeProps> = ({ level = "l0", className, style, children, ...props }) => (
  <span data-vt-control-level={level} style={withComponentLevelStyle(level, style)} className={classes("vt-subtoolbox-status-badge", className)} {...props}><i aria-hidden="true" />{children}</span>
)

export const SubToolboxLinkButton: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement> & { size?: SubToolboxControlSize; tone?: PrimitiveTone; icon?: React.ReactNode; level?: ToolboxControlLevel }> = ({ className, size = "action", tone = "accent", icon, children, level, style, ...props }) => <a data-vt-control-level={level} style={withComponentLevelStyle(level, style)} className={classes("vt-subtoolbox-button", `is-${size}`, `is-${tone}`, level && "has-component-level", className)} {...props}>{icon ? <span className="vt-subtoolbox-button-icon" aria-hidden="true">{icon}</span> : null}<span className="vt-subtoolbox-button-label">{children}</span></a>

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

export const SubToolboxBadge: React.FC<React.HTMLAttributes<HTMLSpanElement> & { active?: boolean; level?: ToolboxControlLevel }> = ({ active = true, level, className, children, style, ...props }) => <span data-vt-control-level={level} style={withComponentLevelStyle(level, style)} className={classes("vt-subtoolbox-chip", "is-badge", level && "has-component-level", active && "is-active", className)} {...props}>{children}</span>

export const SubToolboxTag: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean; level?: ToolboxControlLevel }> = ({ selected = false, level, className, children, type = "button", style, ...props }) => <button type={type} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} className={classes("vt-subtoolbox-chip", "is-tag", level && "has-component-level", selected && "is-active", className)} aria-pressed={selected} {...props}>{children}</button>

export type SubToolboxTooltipLevel = ToolboxControlLevel

export interface SubToolboxTooltipProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "content"> {
  content?: React.ReactNode
  level?: SubToolboxTooltipLevel
  forceOpen?: boolean
  triggerLabel?: React.ReactNode
  triggerAriaLabel?: string
}

export const SubToolboxTooltip: React.FC<SubToolboxTooltipProps> = ({
  content = "TOOLTIP",
  level = "l0",
  forceOpen = false,
  triggerLabel = "?",
  triggerAriaLabel = "Show tooltip",
  className,
  style,
  ...props
}) => {
  const tooltipId = React.useId()
  return (
    <span className={classes("vt-subtoolbox-tooltip", `is-${level}`, forceOpen && "is-open", className)} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} {...props}>
      <button type="button" className="vt-subtoolbox-tooltip-trigger" aria-label={triggerAriaLabel} aria-describedby={tooltipId}>{triggerLabel}</button>
      <span id={tooltipId} role="tooltip" className="vt-subtoolbox-tooltip-bubble">{content}</span>
    </span>
  )
}


export interface SubToolboxStepperProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  level?: ToolboxControlLevel
  value: React.ReactNode
  onDecrease?: () => void
  onIncrease?: () => void
  decreaseIcon?: React.ReactNode
  increaseIcon?: React.ReactNode
  decreaseLabel?: string
  increaseLabel?: string
}
export const SubToolboxStepper: React.FC<SubToolboxStepperProps> = ({
  level = "l0",
  value,
  onDecrease,
  onIncrease,
  decreaseIcon = "−",
  increaseIcon = "+",
  decreaseLabel = "Decrease",
  increaseLabel = "Increase",
  className,
  style,
  ...props
}) => (
  <div className={classes("vt-subtoolbox-stepper", className)} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} {...props}>
    <button type="button" aria-label={decreaseLabel} onClick={onDecrease}>{decreaseIcon}</button>
    <strong>{value}</strong>
    <button type="button" aria-label={increaseLabel} onClick={onIncrease}>{increaseIcon}</button>
  </div>
)

export interface SubToolboxSegmentedOption {
  value: string
  label: React.ReactNode
}
export interface SubToolboxSegmentedToggleProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  level?: ToolboxControlLevel
  options: SubToolboxSegmentedOption[]
  value: string
  onValueChange?: (value: string) => void
  ariaLabel?: string
}
export const SubToolboxSegmentedToggle: React.FC<SubToolboxSegmentedToggleProps> = ({
  level = "l0",
  options,
  value,
  onValueChange,
  ariaLabel = "Choose an option",
  className,
  style,
  ...props
}) => (
  <div className={classes("vt-subtoolbox-segmented", className)} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} role="group" aria-label={ariaLabel} {...props}>
    {options.map((option) => (
      <button type="button" key={option.value} className={value === option.value ? "is-active" : ""} aria-pressed={value === option.value} onClick={() => onValueChange?.(option.value)}>
        {option.label}
      </button>
    ))}
  </div>
)


export interface SubToolboxMenuOption {
  value: string
  label: React.ReactNode
  disabled?: boolean
}
export interface SubToolboxMenuProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  level?: ToolboxControlLevel
  value: string
  options: SubToolboxMenuOption[]
  onValueChange?: (value: string) => void
  variant?: "dropdown" | "select" | "context"
  triggerLabel?: React.ReactNode
  triggerIcon?: React.ReactNode
  chevronIcon?: React.ReactNode
  ariaLabel?: string
}
export const SubToolboxMenu: React.FC<SubToolboxMenuProps> = ({
  level = "l0",
  value,
  options,
  onValueChange,
  variant = "dropdown",
  triggerLabel,
  triggerIcon,
  chevronIcon,
  ariaLabel = "Choose an option",
  className,
  style,
  ...props
}) => {
  const [open, setOpen] = React.useState(false)
  const selected = options.find((option) => option.value === value)
  return (
    <div className={classes("vt-subtoolbox-menu", `is-${variant}`, open && "is-open", className)} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} {...props}>
      <button type="button" className="vt-subtoolbox-menu-trigger" aria-haspopup="menu" aria-expanded={open} aria-label={ariaLabel} onClick={() => setOpen((current) => !current)}>
        {variant === "context" ? <span className="vt-subtoolbox-menu-context-icon" aria-hidden="true">{triggerIcon}</span> : <span className="vt-subtoolbox-menu-label"><b>{triggerLabel ?? selected?.label ?? value}</b>{chevronIcon ? <span aria-hidden="true">{chevronIcon}</span> : null}</span>}
      </button>
      {open ? (
        <div className="vt-subtoolbox-menu-panel" role="menu" aria-label={ariaLabel}>
          {options.map((option) => (
            <button type="button" role="menuitem" key={option.value} disabled={option.disabled} className={value === option.value ? "is-selected" : ""} onClick={() => { if (!option.disabled) { onValueChange?.(option.value); setOpen(false) } }}>
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export interface SubToolboxSplitFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: ToolboxControlLevel
  icon: React.ReactNode
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>
}
export const SubToolboxSplitField: React.FC<SubToolboxSplitFieldProps> = ({ level = "l0", icon, inputProps, className, style, ...props }) => (
  <div className={classes("vt-subtoolbox-split-field", className)} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} {...props}>
    <span className="vt-subtoolbox-split-field-rail" aria-hidden="true">{icon}</span>
    <input {...inputProps} />
  </div>
)

export interface SubToolboxSliderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  level?: ToolboxControlLevel
  value: number
  onValueChange?: (value: number) => void
  railIcon?: React.ReactNode
  onReset?: () => void
}
export const SubToolboxSlider: React.FC<SubToolboxSliderProps> = ({ level = "l0", value, onValueChange, railIcon, onReset, className, style, ...props }) => (
  <div className={classes("vt-subtoolbox-slider", className)} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} {...props}>
    <button type="button" className="vt-subtoolbox-slider-rail" aria-label="Reset slider" onClick={onReset}>{railIcon}</button>
    <div className="vt-subtoolbox-slider-center"><input aria-label="Slider value" type="range" min="0" max="100" value={value} style={{ ["--pct" as string]: `${value}%` }} onChange={(event) => onValueChange?.(Number(event.target.value))} /></div>
    <output>{value}</output>
  </div>
)

export interface SubToolboxRangeSliderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  level?: ToolboxControlLevel
  low: number
  high: number
  onLowChange?: (value: number) => void
  onHighChange?: (value: number) => void
  railIcon?: React.ReactNode
  onReset?: () => void
}
export const SubToolboxRangeSlider: React.FC<SubToolboxRangeSliderProps> = ({ level = "l0", low, high, onLowChange, onHighChange, railIcon, onReset, className, style, ...props }) => (
  <div className={classes("vt-subtoolbox-range", className)} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} {...props}>
    <button type="button" className="vt-subtoolbox-slider-rail" aria-label="Reset range" onClick={onReset}>{railIcon}</button>
    <div className="vt-subtoolbox-range-center">
      <div className="vt-subtoolbox-range-track"><span className="vt-subtoolbox-range-fill" style={{ left: `${low}%`, right: `${100-high}%` }} /></div>
      <input aria-label="Range minimum" type="range" min="0" max="100" value={low} onChange={(event) => onLowChange?.(Math.min(Number(event.target.value), high - 1))} />
      <input aria-label="Range maximum" type="range" min="0" max="100" value={high} onChange={(event) => onHighChange?.(Math.max(Number(event.target.value), low + 1))} />
    </div>
    <output>{low}–{high}</output>
  </div>
)

export interface SubToolboxSettingsSwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  level?: ToolboxControlLevel
  pressed: boolean
}
export const SubToolboxSettingsSwitch: React.FC<SubToolboxSettingsSwitchProps> = ({ level = "l0", pressed, className, style, type = "button", ...props }) => (
  <button type={type} className={classes("vt-subtoolbox-settings-switch", pressed && "is-on", className)} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} aria-pressed={pressed} {...props}><span aria-hidden="true" /></button>
)

export interface SubToolboxButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: ToolboxControlLevel
  items: Array<{ value: string; label: React.ReactNode }>
  value?: string
  onValueChange?: (value: string) => void
}
export const SubToolboxButtonGroup: React.FC<SubToolboxButtonGroupProps> = ({ level = "l0", items, value, onValueChange, className, style, ...props }) => (
  <div className={classes("vt-subtoolbox-button-group", className)} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} {...props}>
    {items.map((item) => <button type="button" key={item.value} className={value === item.value ? "is-active" : ""} aria-pressed={value === item.value} onClick={() => onValueChange?.(item.value)}>{item.label}</button>)}
  </div>
)

export interface SubToolboxRemovableTagProps extends React.HTMLAttributes<HTMLSpanElement> {
  level?: ToolboxControlLevel
  onRemove?: () => void
  removeIcon?: React.ReactNode
}
export const SubToolboxRemovableTag: React.FC<SubToolboxRemovableTagProps> = ({ level = "l0", onRemove, removeIcon = "×", children, className, style, ...props }) => (
  <span className={classes("vt-subtoolbox-removable-tag", className)} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} {...props}>{children}<button type="button" aria-label="Remove" onClick={onRemove}>{removeIcon}</button></span>
)

export interface SubToolboxSelectableTagProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  level?: ToolboxControlLevel
  selected: boolean
  selectedIcon?: React.ReactNode
  unselectedIcon?: React.ReactNode
}
export const SubToolboxSelectableTag: React.FC<SubToolboxSelectableTagProps> = ({ level = "l0", selected, selectedIcon, unselectedIcon, children, className, style, type = "button", ...props }) => (
  <button type={type} className={classes("vt-subtoolbox-selectable-tag", selected && "is-selected", className)} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} aria-pressed={selected} {...props}><span aria-hidden="true">{selected ? selectedIcon : unselectedIcon}</span><span>{children}</span></button>
)

export interface SubToolboxTagEditorProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: ToolboxControlLevel
  tags: string[]
  onTagsChange?: (tags: string[]) => void
  addIcon?: React.ReactNode
  saveIcon?: React.ReactNode
  removeIcon?: React.ReactNode
}
export const SubToolboxTagEditor: React.FC<SubToolboxTagEditorProps> = ({ level = "l0", tags, onTagsChange, addIcon = "+", saveIcon = "✓", removeIcon = "×", className, style, ...props }) => {
  const [editing, setEditing] = React.useState(false)
  const [draft, setDraft] = React.useState("")
  const save = () => {
    const next = draft.trim().toUpperCase()
    if (next) onTagsChange?.([...tags, next])
    setDraft("")
    setEditing(false)
  }
  return (
    <div className={classes("vt-subtoolbox-tag-editor", editing && "is-editing", className)} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} {...props}>
      <div className="vt-subtoolbox-tag-editor-tags">{tags.map((tag) => <SubToolboxRemovableTag key={tag} level={level} onRemove={() => onTagsChange?.(tags.filter((item) => item !== tag))} removeIcon={removeIcon}>{tag}</SubToolboxRemovableTag>)}</div>
      {editing ? <><input aria-label="New tag" value={draft} placeholder="ADD TAG" onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") save() }} /><button type="button" className="submit" aria-label="Save tag" onClick={save}>{saveIcon}</button></> : <button type="button" className="add" aria-label="Add tag" onClick={() => setEditing(true)}>{addIcon}</button>}
    </div>
  )
}

export interface SubToolboxProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: ToolboxControlLevel
  value: number
}
export const SubToolboxProgressBar: React.FC<SubToolboxProgressBarProps> = ({ level = "l0", value, className, style, ...props }) => (
  <div className={classes("vt-subtoolbox-progress-stack", className)} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} {...props}><div className="vt-subtoolbox-progress is-rounded"><span style={{ width: `${value}%` }} /></div><div className="vt-subtoolbox-progress is-rect"><span style={{ width: `${value}%` }} /></div></div>
)

export interface SubToolboxProgressValueProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: ToolboxControlLevel
  value: number
}
export const SubToolboxProgressValue: React.FC<SubToolboxProgressValueProps> = ({ level = "l0", value, className, style, ...props }) => (
  <div className={classes("vt-subtoolbox-progress-value", className)} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} {...props}><div className="bar"><span style={{ width: `${value}%` }} /></div><output>{value}%</output></div>
)

export interface SubToolboxStatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: ToolboxControlLevel
  label: React.ReactNode
  value: React.ReactNode
  delta?: React.ReactNode
}
export const SubToolboxStatCard: React.FC<SubToolboxStatCardProps> = ({ level = "l0", label, value, delta, className, style, ...props }) => (
  <div className={classes("vt-subtoolbox-stat-card", className)} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} {...props}><small>{label}</small><strong>{value}</strong>{delta != null ? <span>{delta}</span> : null}</div>
)

export interface SubToolboxKnobProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  level?: ToolboxControlLevel
  value: number
  min?: number
  max?: number
  step?: number
  onValueChange?: (value: number) => void
  label?: React.ReactNode
  ariaLabel?: string
}
export const SubToolboxKnob: React.FC<SubToolboxKnobProps> = ({
  level = "l0",
  value,
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  label = "VALUE",
  ariaLabel = "Dial value",
  className,
  style,
  ...props
}) => {
  const safeMax = max <= min ? min + 1 : max
  const clamped = Math.min(safeMax, Math.max(min, value))
  const pct = (clamped - min) / (safeMax - min)
  const angle = -135 + pct * 270
  const mergedStyle = {
    ...(withComponentLevelStyle(level, style) ?? {}),
    ["--vt-knob-angle" as string]: `${angle}deg`,
    ["--vt-knob-pct" as string]: `${pct * 100}%`,
  } as React.CSSProperties

  return (
    <div className={classes("vt-subtoolbox-knob", className)} data-vt-control-level={level} style={mergedStyle} {...props}>
      <div className="vt-subtoolbox-knob-dial">
        <span className="vt-subtoolbox-knob-ticks" aria-hidden="true" />
        <span className="vt-subtoolbox-knob-face" aria-hidden="true">
          <i className="vt-subtoolbox-knob-pointer" />
          <strong>{clamped}</strong>
        </span>
        <input
          type="range"
          min={min}
          max={safeMax}
          step={step}
          value={clamped}
          aria-label={ariaLabel}
          onChange={(event) => onValueChange?.(Number(event.target.value))}
        />
      </div>
      <b className="vt-subtoolbox-knob-label">{label}</b>
    </div>
  )
}

export interface SubToolboxAlphabeticalTagProps extends React.HTMLAttributes<HTMLSpanElement> {
  level?: ToolboxControlLevel
  label: string
}
export const SubToolboxAlphabeticalTag: React.FC<SubToolboxAlphabeticalTagProps> = ({
  level = "l0",
  label,
  className,
  style,
  ...props
}) => {
  const color = getAlphabeticalSpectrumColor(label)
  return (
    <span
      className={classes("vt-subtoolbox-alpha-tag", className)}
      data-vt-control-level={level}
      style={{
        ...(withComponentLevelStyle(level, style) ?? {}),
        ["--vt-alpha-color" as string]: color,
      } as React.CSSProperties}
      {...props}
    >
      {label}
    </span>
  )
}

export const SubToolboxAlphabeticalSpectrumTags: React.FC<{
  level?: ToolboxControlLevel
  className?: string
  suffix?: string
}> = ({ level = "l0", className, suffix = "TAG" }) => (
  <div className={classes("vt-subtoolbox-alpha-tag-row", className)}>
    {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => (
      <SubToolboxAlphabeticalTag key={letter} level={level} label={`${letter} · ${suffix}`} />
    ))}
  </div>
)

export interface SubToolboxDataTableColumn<T extends Record<string, React.ReactNode>> {
  key: keyof T
  label: React.ReactNode
  align?: "left" | "center" | "right"
}
export interface SubToolboxDataTableProps<T extends Record<string, React.ReactNode>> extends React.HTMLAttributes<HTMLDivElement> {
  level?: ToolboxControlLevel
  columns: SubToolboxDataTableColumn<T>[]
  rows: T[]
  getRowKey?: (row: T, index: number) => React.Key
}
export const SubToolboxDataTable = <T extends Record<string, React.ReactNode>,>({
  level = "l0",
  columns,
  rows,
  getRowKey,
  className,
  style,
  ...props
}: SubToolboxDataTableProps<T>) => (
  <div className={classes("vt-subtoolbox-data-table-wrap", className)} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} {...props}>
    <table className="vt-subtoolbox-data-table">
      <thead><tr>{columns.map((column) => <th key={String(column.key)} data-align={column.align ?? "left"}>{column.label}</th>)}</tr></thead>
      <tbody>{rows.map((row, index) => <tr key={getRowKey?.(row, index) ?? index}>{columns.map((column) => <td key={String(column.key)} data-align={column.align ?? "left"}>{row[column.key]}</td>)}</tr>)}</tbody>
    </table>
  </div>
)

export interface SubToolboxColorPickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  level?: ToolboxControlLevel
  value: string
  onValueChange?: (value: string) => void
  label?: React.ReactNode
}
export const SubToolboxColorPicker: React.FC<SubToolboxColorPickerProps> = ({ level = "l0", value, onValueChange, label = "COLOR", className, style, ...props }) => (
  <div className={classes("vt-subtoolbox-color-picker", className)} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} {...props}>
    <label>
      <input type="color" value={value} aria-label={typeof label === "string" ? label : "Choose color"} onChange={(event) => onValueChange?.(event.target.value)} />
      <span className="vt-subtoolbox-color-swatch" style={{ background: value }} aria-hidden="true" />
      <strong>{label}</strong>
    </label>
    <input className="vt-subtoolbox-color-value" value={value.toUpperCase()} aria-label="Color hex value" onChange={(event) => onValueChange?.(event.target.value)} />
  </div>
)

export interface SubToolboxMediaCardProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "title"> {
  level?: ToolboxControlLevel
  title: React.ReactNode
  meta?: React.ReactNode
  preview?: React.ReactNode
  selected?: boolean
  trailing?: React.ReactNode
}
export const SubToolboxMediaCard: React.FC<SubToolboxMediaCardProps> = ({ level = "l0", title, meta, preview, selected = false, trailing, className, style, type = "button", ...props }) => (
  <button type={type} className={classes("vt-subtoolbox-media-card", selected && "is-selected", className)} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} aria-pressed={selected} {...props}>
    <span className="vt-subtoolbox-media-card-preview">{preview}</span>
    <span className="vt-subtoolbox-media-card-copy"><strong>{title}</strong>{meta ? <small>{meta}</small> : null}</span>
    {trailing ? <span className="vt-subtoolbox-media-card-trailing">{trailing}</span> : null}
  </button>
)

export interface SubToolboxSelectableListRowProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "title"> {
  level?: ToolboxControlLevel
  title: React.ReactNode
  detail?: React.ReactNode
  leading?: React.ReactNode
  trailing?: React.ReactNode
  selected?: boolean
}
export const SubToolboxSelectableListRow: React.FC<SubToolboxSelectableListRowProps> = ({ level = "l0", title, detail, leading, trailing, selected = false, className, style, type = "button", ...props }) => (
  <button type={type} className={classes("vt-subtoolbox-list-row", selected && "is-selected", className)} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} aria-pressed={selected} {...props}>
    {leading ? <span className="vt-subtoolbox-list-row-leading" aria-hidden="true">{leading}</span> : null}
    <span className="vt-subtoolbox-list-row-copy"><strong>{title}</strong>{detail ? <small>{detail}</small> : null}</span>
    {trailing ? <span className="vt-subtoolbox-list-row-trailing">{trailing}</span> : null}
  </button>
)

export interface SubToolboxReorderRowProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  level?: ToolboxControlLevel
  title: React.ReactNode
  detail?: React.ReactNode
  onMoveUp?: () => void
  onMoveDown?: () => void
  onRemove?: () => void
  disableUp?: boolean
  disableDown?: boolean
  upIcon?: React.ReactNode
  downIcon?: React.ReactNode
  removeIcon?: React.ReactNode
}
export const SubToolboxReorderRow: React.FC<SubToolboxReorderRowProps> = ({
  level = "l0", title, detail, onMoveUp, onMoveDown, onRemove, disableUp = false, disableDown = false,
  upIcon = "↑", downIcon = "↓", removeIcon = "×", className, style, ...props
}) => (
  <div className={classes("vt-subtoolbox-reorder-row", className)} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} {...props}>
    <span className="vt-subtoolbox-reorder-row-copy"><strong>{title}</strong>{detail ? <small>{detail}</small> : null}</span>
    <span className="vt-subtoolbox-reorder-row-actions">
      <button type="button" aria-label="Move up" disabled={disableUp} onClick={onMoveUp}>{upIcon}</button>
      <button type="button" aria-label="Move down" disabled={disableDown} onClick={onMoveDown}>{downIcon}</button>
      <button type="button" aria-label="Remove" onClick={onRemove}>{removeIcon}</button>
    </span>
  </div>
)

export interface SubToolboxTabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  level?: ToolboxControlLevel
  items: Array<{ value: string; label: React.ReactNode }>
  value: string
  onValueChange?: (value: string) => void
  ariaLabel?: string
}
export const SubToolboxTabs: React.FC<SubToolboxTabsProps> = ({ level = "l0", items, value, onValueChange, ariaLabel = "Sections", className, style, ...props }) => (
  <div className={classes("vt-subtoolbox-tabs", className)} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} role="tablist" aria-label={ariaLabel} {...props}>
    {items.map((item) => <button type="button" role="tab" key={item.value} aria-selected={value === item.value} className={value === item.value ? "is-active" : ""} onClick={() => onValueChange?.(item.value)}>{item.label}</button>)}
  </div>
)

export interface SubToolboxAlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  level?: ToolboxControlLevel
  tone?: "info" | "success" | "warning" | "danger"
  title: React.ReactNode
  detail?: React.ReactNode
  icon?: React.ReactNode
  action?: React.ReactNode
}
export const SubToolboxAlert: React.FC<SubToolboxAlertProps> = ({ level = "l0", tone = "info", title, detail, icon, action, className, style, ...props }) => (
  <div className={classes("vt-subtoolbox-alert", `is-${tone}`, className)} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} role={tone === "danger" ? "alert" : "status"} {...props}>
    {icon ? <span className="vt-subtoolbox-alert-icon" aria-hidden="true">{icon}</span> : null}
    <span className="vt-subtoolbox-alert-copy"><strong>{title}</strong>{detail ? <small>{detail}</small> : null}</span>
    {action ? <span className="vt-subtoolbox-alert-action">{action}</span> : null}
  </div>
)

export interface SubToolboxStepIndicatorProps extends React.HTMLAttributes<HTMLOListElement> {
  level?: ToolboxControlLevel
  steps: Array<{ label: React.ReactNode; state?: "complete" | "active" | "upcoming" }>
}
export const SubToolboxStepIndicator: React.FC<SubToolboxStepIndicatorProps> = ({ level = "l0", steps, className, style, ...props }) => (
  <ol className={classes("vt-subtoolbox-step-indicator", className)} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} {...props}>
    {steps.map((step, index) => <li key={index} className={`is-${step.state ?? "upcoming"}`}><span>{index + 1}</span><b>{step.label}</b></li>)}
  </ol>
)

export interface SubToolboxDialogProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  level?: ToolboxControlLevel
  open: boolean
  onOpenChange?: (open: boolean) => void
  title: React.ReactNode
  triggerLabel?: React.ReactNode
  children: React.ReactNode
}
export const SubToolboxDialog: React.FC<SubToolboxDialogProps> = ({ level = "l0", open, onOpenChange, title, triggerLabel = "OPEN DIALOG", children, className, style, ...props }) => (
  <div className={classes("vt-subtoolbox-dialog-host", className)} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} {...props}>
    <button type="button" className="vt-subtoolbox-dialog-trigger" onClick={() => onOpenChange?.(true)}>{triggerLabel}</button>
    {open ? <div className="vt-subtoolbox-dialog-overlay" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onOpenChange?.(false) }}>
      <section className="vt-subtoolbox-dialog" role="dialog" aria-modal="true" aria-label={typeof title === "string" ? title : "Dialog"}>
        <header><strong>{title}</strong><button type="button" aria-label="Close dialog" onClick={() => onOpenChange?.(false)}>×</button></header>
        <div className="vt-subtoolbox-dialog-body">{children}</div>
      </section>
    </div> : null}
  </div>
)

export interface SubToolboxDrawerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  level?: ToolboxControlLevel
  open: boolean
  onOpenChange?: (open: boolean) => void
  title: React.ReactNode
  triggerLabel?: React.ReactNode
  side?: "left" | "right"
  children: React.ReactNode
}
export const SubToolboxDrawer: React.FC<SubToolboxDrawerProps> = ({ level = "l0", open, onOpenChange, title, triggerLabel = "OPEN DRAWER", side = "right", children, className, style, ...props }) => (
  <div className={classes("vt-subtoolbox-drawer-host", className)} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} {...props}>
    <button type="button" className="vt-subtoolbox-drawer-trigger" onClick={() => onOpenChange?.(true)}>{triggerLabel}</button>
    {open ? <div className="vt-subtoolbox-drawer-overlay" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onOpenChange?.(false) }}>
      <aside className={classes("vt-subtoolbox-drawer", `is-${side}`)} role="dialog" aria-modal="true" aria-label={typeof title === "string" ? title : "Drawer"}>
        <header><strong>{title}</strong><button type="button" aria-label="Close drawer" onClick={() => onOpenChange?.(false)}>×</button></header>
        <div className="vt-subtoolbox-drawer-body">{children}</div>
      </aside>
    </div> : null}
  </div>
)

export interface SubToolboxCalendarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  level?: ToolboxControlLevel
  monthLabel?: React.ReactNode
  days?: number
  startOffset?: number
  selectedDay?: number
  onSelectDay?: (day: number) => void
}
export const SubToolboxCalendar: React.FC<SubToolboxCalendarProps> = ({ level = "l0", monthLabel = "SEPTEMBER", days = 30, startOffset = 2, selectedDay, onSelectDay, className, style, ...props }) => (
  <div className={classes("vt-subtoolbox-calendar", className)} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} {...props}>
    <header>{monthLabel}</header>
    <div className="vt-subtoolbox-calendar-weekdays">{"SMTWTFS".split("").map((day, index) => <b key={index}>{day}</b>)}</div>
    <div className="vt-subtoolbox-calendar-grid">
      {Array.from({ length: Math.max(0, startOffset) }, (_, index) => <span key={`blank-${index}`} aria-hidden="true" />)}
      {Array.from({ length: Math.max(1, days) }, (_, index) => index + 1).map((day) => <button type="button" key={day} className={selectedDay === day ? "is-selected" : ""} aria-pressed={selectedDay === day} onClick={() => onSelectDay?.(day)}>{day}</button>)}
    </div>
  </div>
)

export interface SubToolboxLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: ToolboxControlLevel
  variant?: "spinner" | "dots"
  label?: React.ReactNode
}
export const SubToolboxLoader: React.FC<SubToolboxLoaderProps> = ({ level = "l0", variant = "spinner", label = "LOADING", className, style, ...props }) => (
  <div className={classes("vt-subtoolbox-loader", `is-${variant}`, className)} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} role="status" aria-live="polite" {...props}>
    {variant === "spinner" ? <span className="vt-subtoolbox-loader-spinner" aria-hidden="true" /> : <span className="vt-subtoolbox-loader-dots" aria-hidden="true"><i /><i /><i /></span>}
    <b>{label}</b>
  </div>
)

export interface SubToolboxSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: ToolboxControlLevel
  lines?: number
}
export const SubToolboxSkeleton: React.FC<SubToolboxSkeletonProps> = ({ level = "l0", lines = 3, className, style, ...props }) => (
  <div className={classes("vt-subtoolbox-skeleton", className)} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} aria-busy="true" aria-label="Loading content" {...props}>
    {Array.from({ length: Math.max(1, lines) }, (_, index) => <span key={index} style={{ width: `${Math.max(42, 100 - index * 16)}%` }} />)}
  </div>
)

export interface SubToolboxToastProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  level?: ToolboxControlLevel
  tone?: "info" | "success" | "warning" | "danger"
  title: React.ReactNode
  detail?: React.ReactNode
  onDismiss?: () => void
}
export const SubToolboxToast: React.FC<SubToolboxToastProps> = ({ level = "l0", tone = "info", title, detail, onDismiss, className, style, ...props }) => (
  <div className={classes("vt-subtoolbox-toast", `is-${tone}`, className)} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} role={tone === "danger" ? "alert" : "status"} {...props}>
    <span className="vt-subtoolbox-toast-rail" aria-hidden="true" />
    <span className="vt-subtoolbox-toast-copy"><strong>{title}</strong>{detail ? <small>{detail}</small> : null}</span>
    {onDismiss ? <button type="button" aria-label="Dismiss notification" onClick={onDismiss}>×</button> : null}
  </div>
)

export interface SubToolboxPopoverProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  level?: ToolboxControlLevel
  title?: React.ReactNode
  trigger: React.ReactNode
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}
export const SubToolboxPopover: React.FC<SubToolboxPopoverProps> = ({ level = "l0", title = "OPTIONS", trigger, children, open: controlledOpen, onOpenChange, className, style, ...props }) => {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = (next: boolean) => { setInternalOpen(next); onOpenChange?.(next) }
  return (
    <div className={classes("vt-subtoolbox-popover", open && "is-open", className)} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} {...props}>
      <button type="button" className="vt-subtoolbox-popover-trigger" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(!open)}>{trigger}</button>
      {open ? <div className="vt-subtoolbox-popover-panel" role="dialog" aria-label={typeof title === "string" ? title : "Popover"}>
        <header><strong>{title}</strong><button type="button" aria-label="Close popover" onClick={() => setOpen(false)}>×</button></header>
        <div>{children}</div>
      </div> : null}
    </div>
  )
}

export interface SubToolboxDisclosureProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  level?: ToolboxControlLevel
  title: React.ReactNode
  icon?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}
export const SubToolboxDisclosure: React.FC<SubToolboxDisclosureProps> = ({ level = "l0", title, icon, open: controlledOpen, onOpenChange, children, className, style, ...props }) => {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = (next: boolean) => { setInternalOpen(next); onOpenChange?.(next) }
  return (
    <section className={classes("vt-subtoolbox-disclosure", open && "is-open", className)} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} {...props}>
      <button type="button" className="vt-subtoolbox-disclosure-head" aria-expanded={open} onClick={() => setOpen(!open)}>
        {icon ? <span aria-hidden="true">{icon}</span> : null}<strong>{title}</strong><i aria-hidden="true">›</i>
      </button>
      {open ? <div className="vt-subtoolbox-disclosure-body">{children}</div> : null}
    </section>
  )
}

export interface SubToolboxDividerProps extends React.HTMLAttributes<HTMLHRElement> {
  level?: ToolboxControlLevel
}
export const SubToolboxDivider: React.FC<SubToolboxDividerProps> = ({ level = "l0", className, style, ...props }) => (
  <hr className={classes("vt-subtoolbox-divider", className)} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} {...props} />
)

export interface SubToolboxPaginationProps extends Omit<React.HTMLAttributes<HTMLElement>, "onChange"> {
  level?: ToolboxControlLevel
  page: number
  pages: number
  onPageChange?: (page: number) => void
  previousIcon?: React.ReactNode
  nextIcon?: React.ReactNode
}
export const SubToolboxPagination: React.FC<SubToolboxPaginationProps> = ({ level = "l0", page, pages, onPageChange, previousIcon = "‹", nextIcon = "›", className, style, ...props }) => {
  const total = Math.max(1, pages)
  const current = Math.min(total, Math.max(1, page))
  const visible = Array.from({ length: Math.min(total, 5) }, (_, index) => index + 1)
  return (
    <nav className={classes("vt-subtoolbox-pagination", className)} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} aria-label="Pagination" {...props}>
      <button type="button" aria-label="Previous page" disabled={current <= 1} onClick={() => onPageChange?.(current - 1)}>{previousIcon}</button>
      {visible.map((item) => <button type="button" key={item} aria-current={current === item ? "page" : undefined} className={current === item ? "is-active" : ""} onClick={() => onPageChange?.(item)}>{item}</button>)}
      <button type="button" aria-label="Next page" disabled={current >= total} onClick={() => onPageChange?.(current + 1)}>{nextIcon}</button>
    </nav>
  )
}

export interface SubToolboxControllerSwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  level?: ToolboxControlLevel
  pressed: boolean
  labelOn?: React.ReactNode
  labelOff?: React.ReactNode
}
export const SubToolboxControllerSwitch: React.FC<SubToolboxControllerSwitchProps> = ({ level = "l0", pressed, labelOn = "ON", labelOff = "OFF", className, style, type = "button", ...props }) => (
  <button type={type} className={classes("vt-subtoolbox-controller-switch", pressed && "is-on", className)} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} aria-pressed={pressed} {...props}>
    <span aria-hidden="true"><i /></span><strong>{pressed ? labelOn : labelOff}</strong>
  </button>
)

export interface SubToolboxLedProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: ToolboxControlLevel
  active?: boolean
  label?: React.ReactNode
}
export const SubToolboxLed: React.FC<SubToolboxLedProps> = ({ level = "l0", active = true, label = "ACTIVE", className, style, ...props }) => (
  <div className={classes("vt-subtoolbox-led", active && "is-active", className)} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} role="status" aria-label={typeof label === "string" ? label : "Status"} {...props}>
    <i aria-hidden="true" /><strong>{label}</strong>
  </div>
)

export interface SubToolboxIconRailControlProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  level?: ToolboxControlLevel
  icon: React.ReactNode
  label: React.ReactNode
}
export const SubToolboxIconRailControl: React.FC<SubToolboxIconRailControlProps> = ({ level = "l0", icon, label, className, style, type = "button", ...props }) => (
  <button type={type} className={classes("vt-subtoolbox-icon-rail-control", className)} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} {...props}>
    <span aria-hidden="true">{icon}</span><strong>{label}</strong>
  </button>
)

export interface SubToolboxHoverCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "content"> {
  level?: ToolboxControlLevel
  trigger: React.ReactNode
  content: React.ReactNode
}
export const SubToolboxHoverCard: React.FC<SubToolboxHoverCardProps> = ({ level = "l0", trigger, content, className, style, ...props }) => (
  <div className={classes("vt-subtoolbox-hover-card", className)} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} {...props}>
    <button type="button" className="vt-subtoolbox-hover-card-trigger">{trigger}</button>
    <div className="vt-subtoolbox-hover-card-panel" role="note">{content}</div>
  </div>
)

export interface SubToolboxMeterProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: ToolboxControlLevel
  value: number
  max?: number
  label?: React.ReactNode
}
export const SubToolboxMeter: React.FC<SubToolboxMeterProps> = ({ level = "l0", value, max = 100, label = "METER", className, style, ...props }) => {
  const safeMax = max <= 0 ? 100 : max
  const clamped = Math.min(safeMax, Math.max(0, value))
  const pct = (clamped / safeMax) * 100
  return (
    <div className={classes("vt-subtoolbox-meter", className)} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} {...props}>
      <span><b>{label}</b><output>{clamped}</output></span>
      <div role="meter" aria-valuemin={0} aria-valuemax={safeMax} aria-valuenow={clamped}><i style={{ width: `${pct}%` }} /></div>
    </div>
  )
}

export interface SubToolboxAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: ToolboxControlLevel
  name: string
  src?: string
  meta?: React.ReactNode
}
export const SubToolboxAvatar: React.FC<SubToolboxAvatarProps> = ({ level = "l0", name, src, meta, className, style, ...props }) => {
  const initials = name.trim().split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()
  return (
    <div className={classes("vt-subtoolbox-avatar", className)} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} {...props}>
      <span className="vt-subtoolbox-avatar-image">{src ? <img src={src} alt="" /> : <b>{initials}</b>}</span>
      <span className="vt-subtoolbox-avatar-copy"><strong>{name}</strong>{meta ? <small>{meta}</small> : null}</span>
    </div>
  )
}

export interface SubToolboxNameValueListProps extends React.HTMLAttributes<HTMLDListElement> {
  level?: ToolboxControlLevel
  items: Array<{ name: React.ReactNode; value: React.ReactNode }>
}
export const SubToolboxNameValueList: React.FC<SubToolboxNameValueListProps> = ({ level = "l0", items, className, style, ...props }) => (
  <dl className={classes("vt-subtoolbox-name-value", className)} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} {...props}>
    {items.map((item, index) => <React.Fragment key={index}><dt>{item.name}</dt><dd>{item.value}</dd></React.Fragment>)}
  </dl>
)

export interface SubToolboxBreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  level?: ToolboxControlLevel
  items: Array<{ label: React.ReactNode; href?: string }>
  separator?: React.ReactNode
}
export const SubToolboxBreadcrumb: React.FC<SubToolboxBreadcrumbProps> = ({ level = "l0", items, separator = "›", className, style, ...props }) => (
  <nav className={classes("vt-subtoolbox-breadcrumb", className)} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} aria-label="Breadcrumb" {...props}>
    <ol>{items.map((item, index) => <React.Fragment key={index}><li>{item.href ? <a href={item.href}>{item.label}</a> : <span aria-current={index === items.length - 1 ? "page" : undefined}>{item.label}</span>}</li>{index < items.length - 1 ? <li className="separator" aria-hidden="true">{separator}</li> : null}</React.Fragment>)}</ol>
  </nav>
)

export interface SubToolboxCarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: ToolboxControlLevel
  items: React.ReactNode[]
  index?: number
  onIndexChange?: (index: number) => void
  previousIcon?: React.ReactNode
  nextIcon?: React.ReactNode
}
export const SubToolboxCarousel: React.FC<SubToolboxCarouselProps> = ({ level = "l0", items, index: controlledIndex, onIndexChange, previousIcon = "‹", nextIcon = "›", className, style, ...props }) => {
  const [internalIndex, setInternalIndex] = React.useState(0)
  const count = Math.max(1, items.length)
  const index = Math.min(count - 1, Math.max(0, controlledIndex ?? internalIndex))
  const setIndex = (next: number) => { const normalized = ((next % count) + count) % count; setInternalIndex(normalized); onIndexChange?.(normalized) }
  return (
    <div className={classes("vt-subtoolbox-carousel", className)} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} {...props}>
      <button type="button" aria-label="Previous item" onClick={() => setIndex(index - 1)}>{previousIcon}</button>
      <div className="vt-subtoolbox-carousel-stage">{items[index] ?? null}</div>
      <button type="button" aria-label="Next item" onClick={() => setIndex(index + 1)}>{nextIcon}</button>
    </div>
  )
}

export interface SubToolboxCommandPaletteProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: ToolboxControlLevel
  items: Array<{ id: string; label: React.ReactNode; keywords?: string }>
  onSelect?: (id: string) => void
  placeholder?: string
}
export const SubToolboxCommandPalette: React.FC<SubToolboxCommandPaletteProps> = ({ level = "l0", items, onSelect, placeholder = "SEARCH COMMANDS", className, style, ...props }) => {
  const [query, setQuery] = React.useState("")
  const normalized = query.trim().toLowerCase()
  const matches = items.filter((item) => !normalized || `${String(item.label)} ${item.keywords ?? ""}`.toLowerCase().includes(normalized))
  return (
    <div className={classes("vt-subtoolbox-command", className)} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} {...props}>
      <input value={query} placeholder={placeholder} aria-label={placeholder} onChange={(event) => setQuery(event.target.value)} />
      <div role="listbox" aria-label="Commands">{matches.map((item) => <button type="button" role="option" key={item.id} onClick={() => onSelect?.(item.id)}>{item.label}</button>)}</div>
    </div>
  )
}

export interface SubToolboxScrollbarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  level?: ToolboxControlLevel
  orientation?: "horizontal" | "vertical"
  value: number
  onValueChange?: (value: number) => void
  decrementIcon?: React.ReactNode
  incrementIcon?: React.ReactNode
}
export const SubToolboxScrollbar: React.FC<SubToolboxScrollbarProps> = ({ level = "l0", orientation = "horizontal", value, onValueChange, decrementIcon = "‹", incrementIcon = "›", className, style, ...props }) => {
  const clamped = Math.min(100, Math.max(0, value))
  return (
    <div className={classes("vt-subtoolbox-scrollbar", `is-${orientation}`, className)} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} {...props}>
      <button type="button" aria-label={orientation === "horizontal" ? "Scroll left" : "Scroll up"} onClick={() => onValueChange?.(Math.max(0, clamped - 10))}>{decrementIcon}</button>
      <div className="vt-subtoolbox-scrollbar-track"><span style={orientation === "horizontal" ? { left: `${clamped * .58}%` } : { top: `${clamped * .58}%` }} /></div>
      <button type="button" aria-label={orientation === "horizontal" ? "Scroll right" : "Scroll down"} onClick={() => onValueChange?.(Math.min(100, clamped + 10))}>{incrementIcon}</button>
    </div>
  )
}

export interface SubToolboxMetricStripProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: ToolboxControlLevel
  items: Array<{ label: React.ReactNode; value: React.ReactNode }>
}
export const SubToolboxMetricStrip: React.FC<SubToolboxMetricStripProps> = ({ level = "l0", items, className, style, ...props }) => (
  <div className={classes("vt-subtoolbox-metric-strip", className)} data-vt-control-level={level} style={{ ...(withComponentLevelStyle(level, style) ?? {}), ["--vt-metric-count" as string]: Math.max(1, items.length) } as React.CSSProperties} {...props}>
    {items.map((item, index) => <span key={index}><b>{item.label}</b><strong>{item.value}</strong></span>)}
  </div>
)

export interface SubToolboxDataStatsProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: ToolboxControlLevel
  label: React.ReactNode
  value: React.ReactNode
  delta?: React.ReactNode
  variant?: "standard" | "two-color" | "monochrome" | "tiny"
}
export const SubToolboxDataStats: React.FC<SubToolboxDataStatsProps> = ({ level = "l0", label, value, delta, variant = "standard", className, style, ...props }) => (
  <div className={classes("vt-subtoolbox-data-stats", `is-${variant}`, className)} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} {...props}>
    <small>{label}</small><strong>{value}</strong>{delta != null ? <span>{delta}</span> : null}
  </div>
)

export type SubToolboxVaultAssetKind = "landscape" | "portrait" | "audio" | "document"
export interface SubToolboxVaultAssetProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  level?: ToolboxControlLevel
  kind: SubToolboxVaultAssetKind
  title: React.ReactNode
  preview?: React.ReactNode
  tags?: React.ReactNode
  notes?: React.ReactNode
  icon?: React.ReactNode
  selected?: boolean
  onSelectedChange?: (selected: boolean) => void
  onRemove?: () => void
  removeIcon?: React.ReactNode
}
export const SubToolboxVaultAsset: React.FC<SubToolboxVaultAssetProps> = ({
  level = "l0", kind, title, preview, tags, notes, icon, selected = false, onSelectedChange, onRemove, removeIcon = "×",
  className, style, ...props
}) => (
  <article className={classes("vt-subtoolbox-vault-asset", `is-${kind}`, selected && "is-selected", className)} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} {...props}>
    <header><button type="button" className="select" aria-pressed={selected} aria-label="Select asset" onClick={() => onSelectedChange?.(!selected)}><span /></button><strong>{title}</strong></header>
    <div className="vt-subtoolbox-vault-body">
      <div className="vt-subtoolbox-vault-preview">{preview ?? icon}</div>
      <div className="vt-subtoolbox-vault-meta">
        <div className="tags">{tags ?? "ASSET"}</div>
        <div className="notes">{notes ?? "NOTES"}</div>
      </div>
    </div>
    <button type="button" className="remove" aria-label="Remove asset" onClick={onRemove}>{removeIcon}</button>
  </article>
)

export interface SubToolboxTreeNode {
  id: string
  label: React.ReactNode
  children?: SubToolboxTreeNode[]
}
export interface SubToolboxTreeProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: ToolboxControlLevel
  nodes: SubToolboxTreeNode[]
  defaultOpenIds?: string[]
}
export const SubToolboxTree: React.FC<SubToolboxTreeProps> = ({ level = "l0", nodes, defaultOpenIds = [], className, style, ...props }) => {
  const [openIds, setOpenIds] = React.useState<string[]>(defaultOpenIds)
  const toggle = (id: string) => setOpenIds((ids) => ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id])
  const renderNodes = (items: SubToolboxTreeNode[], depth = 0): React.ReactNode => items.map((node) => {
    const hasChildren = Boolean(node.children?.length)
    const open = openIds.includes(node.id)
    return <React.Fragment key={node.id}>
      <button type="button" className="vt-subtoolbox-tree-row" style={{ ["--vt-tree-depth" as string]: depth }} aria-expanded={hasChildren ? open : undefined} onClick={() => hasChildren && toggle(node.id)}>
        <span aria-hidden="true">{hasChildren ? (open ? "−" : "+") : "·"}</span><strong>{node.label}</strong>
      </button>
      {hasChildren && open ? <div className="vt-subtoolbox-tree-children">{renderNodes(node.children ?? [], depth + 1)}</div> : null}
    </React.Fragment>
  })
  return <div className={classes("vt-subtoolbox-tree", className)} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} role="tree" {...props}>{renderNodes(nodes)}</div>
}

export const SubToolboxSurface: React.FC<React.HTMLAttributes<HTMLDivElement> & { tone?: "white" | "subtle" | "accent"; scroll?: boolean; children: React.ReactNode; level?: ToolboxControlLevel }> = ({ tone = "white", scroll = false, level, className, children, style, ...props }) => <div data-vt-control-level={level} style={withComponentLevelStyle(level, style)} className={classes("vt-subtoolbox-surface", `is-${tone}`, scroll && "is-scroll", level && "has-component-level", className)} {...props}>{children}</div>

export const SubToolboxMetric: React.FC<{ label: React.ReactNode; value: React.ReactNode; accentColor?: string; className?: string; level?: ToolboxControlLevel; style?: React.CSSProperties }> = ({ label, value, accentColor, className, level, style }) => <SubToolboxSurface level={level} className={classes("vt-subtoolbox-metric", className)} style={{ ...style, ...(accentColor ? { ["--vt-subtoolbox-card-fill" as string]: accentColor } : {}) }}><div className="vt-subtoolbox-metric-label">{label}</div><div className="vt-subtoolbox-metric-value">{value}</div></SubToolboxSurface>

export const SubToolboxOutputCard: React.FC<Omit<React.HTMLAttributes<HTMLElement>, "title"> & { title: React.ReactNode; icon?: React.ReactNode; accentColor?: string; badge?: React.ReactNode; action?: React.ReactNode; scroll?: boolean; children: React.ReactNode; level?: ToolboxControlLevel }> = ({ title, icon, accentColor, badge, action, scroll = false, level, className, children, style, ...props }) => <article data-vt-control-level={level} className={classes("vt-subtoolbox-output", scroll && "is-scroll", level && "has-component-level", className)} style={{ ...(withComponentLevelStyle(level, style) ?? {}), ...(accentColor ? { ["--vt-subtoolbox-card-fill" as string]: accentColor } : {}) }} {...props}><header className="vt-subtoolbox-output-header"><div className="vt-subtoolbox-output-title">{icon ? <span aria-hidden="true">{icon}</span> : null}<span>{title}</span></div>{action ?? (badge ? <span className="vt-subtoolbox-output-badge">{badge}</span> : null)}</header><div className="vt-subtoolbox-output-body">{children}</div></article>

/* Canonical Toolbox upload primitive: Tight Reveal (#05).
 * Seven flush nested bands replace the legacy dashed drop-zone treatment. */
export const SubToolboxFileTarget: React.FC<{ label: React.ReactNode; icon?: React.ReactNode; accept?: string; multiple?: boolean; minHeight?: number; onFiles?: (files: FileList | null) => void; className?: string; level?: ToolboxControlLevel; style?: React.CSSProperties }> = ({ label, icon, accept, multiple = false, minHeight = 220, onFiles, className, level, style }) => {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = React.useState(false)
  const choose = () => inputRef.current?.click()
  return <SubToolboxSurface level={level} className={classes("vt-subtoolbox-file-target", "vt-upload-tight-reveal", dragging && "is-dragging", className)} style={{ ...style, minHeight, border: 0 }}>
    <input ref={inputRef} type="file" accept={accept} multiple={multiple} className="hidden" onChange={(event) => onFiles?.(event.target.files)} />
    <button type="button" className="vt-subtoolbox-file-target-button" onClick={choose} onDragEnter={(e) => { e.preventDefault(); setDragging(true) }} onDragOver={(e) => { e.preventDefault(); setDragging(true) }} onDragLeave={(e) => { e.preventDefault(); setDragging(false) }} onDrop={(e) => { e.preventDefault(); setDragging(false); onFiles?.(e.dataTransfer.files) }}>
      <span className="vt-upload-tight-reveal-layers" aria-hidden="true">{[7,6,5,4,3,2,1].map((layer) => <span key={layer} className={`vt-upload-tight-reveal-layer is-l${layer}`} />)}</span>
      <span className="vt-upload-tight-reveal-center"><span className="vt-subtoolbox-file-target-icon" aria-hidden="true">{icon}</span><span className="vt-upload-tight-reveal-label">{label}</span></span>
    </button>
  </SubToolboxSurface>
}

const DEFAULT_STATE_COPY: Record<SubToolboxState, string> = { loading: "Loading…", ready: "Ready.", empty: "Nothing to show yet.", "filtered-empty": "No results match the current filters.", disconnected: "Connect your channel to load this.", blocked: "A required connection is unavailable.", stale: "This information may be out of date.", permission: "You do not have access to this.", error: "This section could not be loaded." }
export const SubToolboxStatePanel: React.FC<{ state: SubToolboxState; message?: React.ReactNode; action?: React.ReactNode; className?: string; level?: ToolboxControlLevel; style?: React.CSSProperties }> = ({ state, message, action, className, level, style }) => { const urgent = state === "error" || state === "blocked"; return <section className={classes("vt-subtoolbox-state", `is-${state}`, level && "has-component-level", className)} data-vt-control-level={level} style={withComponentLevelStyle(level, style)} data-subtoolbox-state={state} role={urgent ? "alert" : "status"} aria-live={urgent ? "assertive" : "polite"}><p>{message ?? DEFAULT_STATE_COPY[state]}</p>{action}</section> }
