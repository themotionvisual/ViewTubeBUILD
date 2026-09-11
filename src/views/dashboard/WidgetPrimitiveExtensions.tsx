import React, { useMemo, useState } from "react"
import { ChevronDown, FileVideo2, Search } from "lucide-react"
import { WidgetSelect, WidgetSplitButton, type WidgetSelectOption } from "./WidgetPrimitives"
import "./widgetPrimitiveVariants.css"
import "./widgetPrimitiveExactHeights.css"
import "./widgetPrimitiveTones.css"

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
        <div className="widget-video-select-menu" role="listbox" aria-label={label}>
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
