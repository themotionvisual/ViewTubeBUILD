import React, { useMemo, useState } from "react"
import { Check, ChevronDown, FileVideo2, Search } from "lucide-react"
import {
  WIDGET_BADGE_SPECTRUM,
  WidgetSelect,
  WidgetSplitButton,
  type WidgetBadgeSpectrumName,
  type WidgetBadgeTone,
  type WidgetSelectOption,
} from "./WidgetPrimitives"
import { VT_SPECTRUM_PALETTE_06 } from "../../styles/toolboxPalette"
import "./widgetPrimitiveVariants.css"
import "./widgetPrimitiveExactHeights.css"
import "./widgetPrimitiveTones.css"
import "./widgetMatrixPrimitives.css"

export type WidgetControlHeight = 18 | 24 | 32 | 38
export type WidgetPrimitiveTone = "default" | "primary" | "secondary"
export type WidgetSplitIconStyle = "white-on-color" | "color-on-light"

export const widgetControlHeightClass = (height: WidgetControlHeight = 32) =>
  `vt-sized-control is-height-${height}`

const toneClass = (tone: WidgetPrimitiveTone = "default") => `is-tone-${tone}`

export const WidgetSizedButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    height?: WidgetControlHeight
    tone?: WidgetPrimitiveTone
  }
> = ({ height = 32, tone = "default", className = "", type = "button", ...props }) => (
  <button
    type={type}
    className={`vt-button ${widgetControlHeightClass(height)} ${toneClass(tone)} ${className}`.trim()}
    {...props}
  />
)

export const WidgetLeftSplitButton: React.FC<
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
    icon: React.ReactNode
    children: React.ReactNode
    tone?: WidgetPrimitiveTone
    iconStyle?: WidgetSplitIconStyle
    width?: "auto" | "compact" | "wide" | "full"
    height?: WidgetControlHeight
  }
> = ({
  icon,
  children,
  tone = "default",
  iconStyle = "white-on-color",
  width = "auto",
  height = 32,
  className = "",
  ...props
}) => (
  <WidgetSplitButton
    icon={icon}
    tone="neutral"
    width={width}
    className={`is-left-split ${widgetControlHeightClass(height)} ${toneClass(tone)} is-icon-${iconStyle} ${className}`.trim()}
    {...props}
  >
    {children}
  </WidgetSplitButton>
)

export const WidgetTextInput: React.FC<
  React.InputHTMLAttributes<HTMLInputElement> & {
    height?: WidgetControlHeight
    tone?: WidgetPrimitiveTone
  }
> = ({ height = 32, tone = "default", className = "", ...props }) => (
  <input
    className={`vt-input widget-text-input ${widgetControlHeightClass(height)} ${toneClass(tone)} ${className}`.trim()}
    {...props}
  />
)

export const WidgetSizedSelect: React.FC<{
  value: string
  onChange: (value: string) => void
  options: WidgetSelectOption[]
  label: string
  placeholder?: string
  disabled?: boolean
  className?: string
  style?: React.CSSProperties
  height?: WidgetControlHeight
  tone?: WidgetPrimitiveTone
}> = ({ height = 32, tone = "default", className = "", ...props }) => (
  <WidgetSelect
    className={`${widgetControlHeightClass(height)} ${toneClass(tone)} ${className}`.trim()}
    contentClassName={`${widgetControlHeightClass(height)} ${toneClass(tone)}`}
    {...props}
  />
)

export interface WidgetVideoSelectOption {
  value: string
  label: string
  thumbnail?: string
  meta?: string
}

export const WidgetVideoSelect: React.FC<{
  value: string
  onChange: (value: string) => void
  options: WidgetVideoSelectOption[]
  label: string
  placeholder?: string
  height?: WidgetControlHeight
  tone?: WidgetPrimitiveTone
  iconStyle?: WidgetSplitIconStyle
  searchable?: boolean
  disabled?: boolean
  className?: string
}> = ({
  value,
  onChange,
  options,
  label,
  placeholder = "Select a video…",
  height = 38,
  tone = "default",
  iconStyle = "white-on-color",
  searchable = true,
  disabled = false,
  className = "",
}) => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const selected = options.find((option) => option.value === value)
  const visibleOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return options
    return options.filter((option) =>
      `${option.label} ${option.meta || ""}`.toLowerCase().includes(normalized),
    )
  }, [options, query])

  return (
    <div className={`widget-video-select ${open ? "is-open" : ""} ${className}`.trim()}>
      <button
        type="button"
        className={`widget-video-select-trigger ${widgetControlHeightClass(height)} ${toneClass(tone)} is-icon-${iconStyle}`}
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="widget-video-select-trigger-icon" aria-hidden="true">
          <FileVideo2 strokeWidth={2.5} />
        </span>
        <span className="widget-video-select-trigger-copy">
          {selected?.thumbnail ? <img src={selected.thumbnail} alt="" /> : null}
          <span>{selected?.label || placeholder}</span>
        </span>
        <span className="widget-video-select-trigger-chevron" aria-hidden="true">
          <ChevronDown strokeWidth={2.5} />
        </span>
      </button>

      {open ? (
        <div className={`widget-video-select-menu ${widgetControlHeightClass(height)} ${toneClass(tone)}`} role="listbox" aria-label={label}>
          {searchable ? (
            <div className="widget-video-select-search">
              <Search size={13} aria-hidden="true" style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", opacity: .55 }} />
              <WidgetTextInput
                height={32}
                tone="secondary"
                value={query}
                onChange={(event) => setQuery(event.currentTarget.value)}
                placeholder="Search videos…"
                style={{ paddingLeft: 28 }}
              />
            </div>
          ) : null}

          {visibleOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              className={`widget-video-select-option ${option.value === value ? "is-selected" : ""}`.trim()}
              onClick={() => {
                onChange(option.value)
                setOpen(false)
              }}
            >
              {option.thumbnail ? <img src={option.thumbnail} alt="" /> : <span />}
              <span className="widget-video-select-option-copy">
                <strong>{option.label}</strong>
                {option.meta ? <small>{option.meta}</small> : null}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export const WidgetProgressBar: React.FC<{
  value: number
  max?: number
  label?: React.ReactNode
  displayValue?: React.ReactNode
  height?: WidgetControlHeight
  tone?: WidgetPrimitiveTone
  className?: string
  style?: React.CSSProperties
}> = ({
  value,
  max = 100,
  label,
  displayValue,
  height = 24,
  tone = "default",
  className = "",
  style,
}) => {
  const percentage = Math.max(0, Math.min(100, max > 0 ? (value / max) * 100 : 0))
  return (
    <div
      className={`widget-progress-bar is-height-${height} ${toneClass(tone)} ${className}`.trim()}
      style={{ ...style, ["--widget-progress" as string]: `${percentage}%` }}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.max(0, Math.min(max, value))}
    >
      <span className="widget-progress-bar-fill" aria-hidden="true" />
      <span className="widget-progress-bar-copy">
        <span>{label}</span>
        <strong>{displayValue ?? `${Math.round(percentage)}%`}</strong>
      </span>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   Widget Library v12 matrix primitives.
   Every control below takes the same `height` (18/24/32/38) and `tone`
   (default/primary/secondary) contract as the controls above, carries
   `vt-sized-control` so the exact-height lattice applies, and reads its colour
   from the widget's own --widget-color/--widget-ink palette.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Square 1:1 icon button. Icon fills 90% of the box, matching the v12 matrix. */
export const WidgetIconButton: React.FC<
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
    icon: React.ReactNode
    label: string
    height?: WidgetControlHeight
    tone?: WidgetPrimitiveTone
  }
> = ({ icon, label, height = 32, tone = "default", className = "", type = "button", ...props }) => (
  <button
    type={type}
    aria-label={label}
    title={label}
    className={`widget-icon-button ${widgetControlHeightClass(height)} ${toneClass(tone)} ${className}`.trim()}
    {...props}
  >
    <span className="widget-icon-button-glyph" aria-hidden="true">{icon}</span>
  </button>
)

/** Square 1:1 icon badge — the non-interactive twin of WidgetIconButton. */
export const WidgetIconBadge: React.FC<{
  icon: React.ReactNode
  label?: string
  height?: WidgetControlHeight
  tone?: WidgetPrimitiveTone
  className?: string
}> = ({ icon, label, height = 32, tone = "default", className = "" }) => (
  <span
    role={label ? "img" : undefined}
    aria-label={label}
    aria-hidden={label ? undefined : true}
    className={`widget-icon-badge ${widgetControlHeightClass(height)} ${toneClass(tone)} ${className}`.trim()}
  >
    <span className="widget-icon-button-glyph">{icon}</span>
  </span>
)

/** Numeric stepper: − value +, clamped to [min, max]. */
export const WidgetStepper: React.FC<{
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  label: string
  height?: WidgetControlHeight
  tone?: WidgetPrimitiveTone
  className?: string
}> = ({ value, onChange, min = 0, max = 99, step = 1, label, height = 32, tone = "default", className = "" }) => {
  const clamp = (next: number) => Math.max(min, Math.min(max, next))
  return (
    <div
      className={`widget-stepper ${widgetControlHeightClass(height)} ${toneClass(tone)} ${className}`.trim()}
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        className="widget-stepper-step"
        aria-label={`Decrease ${label}`}
        disabled={value <= min}
        onClick={() => onChange(clamp(value - step))}
      >
        −
      </button>
      <span className="widget-stepper-value" aria-live="polite">{value}</span>
      <button
        type="button"
        className="widget-stepper-step"
        aria-label={`Increase ${label}`}
        disabled={value >= max}
        onClick={() => onChange(clamp(value + step))}
      >
        +
      </button>
    </div>
  )
}

/** Page selector. Renders every page when the count is small, else a windowed range. */
export const WidgetPagination: React.FC<{
  page: number
  pageCount: number
  onChange: (page: number) => void
  label?: string
  height?: WidgetControlHeight
  tone?: WidgetPrimitiveTone
  className?: string
}> = ({ page, pageCount, onChange, label = "Pagination", height = 32, tone = "default", className = "" }) => {
  const pages = useMemo(() => {
    if (pageCount <= 5) return Array.from({ length: pageCount }, (_, index) => index + 1)
    const start = Math.max(1, Math.min(page - 2, pageCount - 4))
    return Array.from({ length: 5 }, (_, index) => start + index)
  }, [page, pageCount])

  return (
    <div
      className={`widget-pagination ${widgetControlHeightClass(height)} ${toneClass(tone)} ${className}`.trim()}
      role="navigation"
      aria-label={label}
    >
      {pages.map((entry) => (
        <button
          key={entry}
          type="button"
          className={`widget-pagination-page ${entry === page ? "is-active" : ""}`.trim()}
          aria-current={entry === page ? "page" : undefined}
          aria-label={`Page ${entry}`}
          onClick={() => onChange(entry)}
        >
          {entry}
        </button>
      ))}
    </div>
  )
}

/** Split-left badge: a 1:1 icon bay followed by a label. Read-only. */
export const WidgetLeftSplitBadge: React.FC<{
  icon: React.ReactNode
  children: React.ReactNode
  height?: WidgetControlHeight
  tone?: WidgetPrimitiveTone
  iconStyle?: WidgetSplitIconStyle
  className?: string
}> = ({ icon, children, height = 32, tone = "default", iconStyle = "white-on-color", className = "" }) => (
  <span
    className={`widget-split-badge is-left-split ${widgetControlHeightClass(height)} ${toneClass(tone)} is-icon-${iconStyle} ${className}`.trim()}
  >
    <span className="widget-split-badge-icon" aria-hidden="true">{icon}</span>
    <span className="widget-split-badge-label">{children}</span>
  </span>
)

/** Split-left search bar: a 1:1 search bay joined to a text field. */
export const WidgetSearchInput: React.FC<
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
    label: string
    height?: WidgetControlHeight
    tone?: WidgetPrimitiveTone
    iconStyle?: WidgetSplitIconStyle
  }
> = ({ label, height = 32, tone = "default", iconStyle = "white-on-color", className = "", ...props }) => (
  <label
    className={`widget-search-input is-left-split ${widgetControlHeightClass(height)} ${toneClass(tone)} is-icon-${iconStyle} ${className}`.trim()}
  >
    <span className="widget-search-input-icon" aria-hidden="true">
      <Search strokeWidth={2.5} />
    </span>
    <span className="vt-visually-hidden">{label}</span>
    <input type="search" aria-label={label} {...props} />
  </label>
)

/** Live badge — pill with a pulsing dot. Honours prefers-reduced-motion. */
export const WidgetLiveBadge: React.FC<{
  children?: React.ReactNode
  height?: WidgetControlHeight
  tone?: WidgetPrimitiveTone
  className?: string
}> = ({ children = "Live", height = 24, tone = "primary", className = "" }) => (
  <span className={`widget-live-badge ${widgetControlHeightClass(height)} ${toneClass(tone)} ${className}`.trim()}>
    <span className="widget-live-badge-dot" aria-hidden="true" />
    <span>{children}</span>
  </span>
)

/** Borderless badge in one of the 12 spectrum colours, with white text. */
export const WidgetSpectrumFillBadge: React.FC<{
  tone: WidgetBadgeTone
  children: React.ReactNode
  height?: WidgetControlHeight
  className?: string
}> = ({ tone, children, height = 24, className = "" }) => {
  const index =
    typeof tone === "number"
      ? ((tone % 12) + 12) % 12
      : Math.max(0, WIDGET_BADGE_SPECTRUM.indexOf(tone as WidgetBadgeSpectrumName))
  return (
    <span
      className={`widget-spectrum-fill-badge ${widgetControlHeightClass(height)} ${className}`.trim()}
      style={{ ["--widget-spectrum-fill" as string]: VT_SPECTRUM_PALETTE_06[index] }}
    >
      {children}
    </span>
  )
}

/** Toggle switch. */
export const WidgetToggleSwitch: React.FC<{
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  height?: WidgetControlHeight
  tone?: WidgetPrimitiveTone
  disabled?: boolean
  className?: string
}> = ({ checked, onChange, label, height = 32, tone = "default", disabled = false, className = "" }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={`widget-toggle-switch ${widgetControlHeightClass(height)} ${toneClass(tone)} ${checked ? "is-on" : ""} ${className}`.trim()}
  >
    <span className="widget-toggle-switch-knob" aria-hidden="true" />
  </button>
)

/** Radio button. Give every member of a group the same `name`. */
export const WidgetRadio: React.FC<{
  checked: boolean
  onChange: () => void
  label: string
  name: string
  height?: WidgetControlHeight
  tone?: WidgetPrimitiveTone
  disabled?: boolean
  className?: string
}> = ({ checked, onChange, label, name, height = 32, tone = "default", disabled = false, className = "" }) => (
  <button
    type="button"
    role="radio"
    name={name}
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    onClick={onChange}
    className={`widget-radio ${widgetControlHeightClass(height)} ${toneClass(tone)} ${checked ? "is-on" : ""} ${className}`.trim()}
  >
    <span className="widget-radio-dot" aria-hidden="true" />
  </button>
)

/** Checkbox. */
export const WidgetCheckbox: React.FC<{
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  height?: WidgetControlHeight
  tone?: WidgetPrimitiveTone
  disabled?: boolean
  className?: string
}> = ({ checked, onChange, label, height = 32, tone = "default", disabled = false, className = "" }) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={`widget-checkbox ${widgetControlHeightClass(height)} ${toneClass(tone)} ${checked ? "is-on" : ""} ${className}`.trim()}
  >
    <span className="widget-checkbox-mark" aria-hidden="true">
      <Check strokeWidth={3.5} />
    </span>
  </button>
)
