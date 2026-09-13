import React, { useEffect, useRef, useState } from "react"
import { ChevronDown } from "lucide-react"
import "../../styles/subtoolbox-split-primitives.css"

const classes = (...values: Array<string | false | null | undefined>) => values.filter(Boolean).join(" ")

export interface SubToolboxSplitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode
  children: React.ReactNode
  selected?: boolean
  railColor?: string
  labelColor?: string
}

export const SubToolboxSplitButton: React.FC<SubToolboxSplitButtonProps> = ({
  icon,
  children,
  selected = false,
  railColor,
  labelColor,
  className,
  style,
  type = "button",
  ...props
}) => (
  <button
    type={type}
    className={classes("vt-subtoolbox-split-button", selected && "is-selected", className)}
    aria-pressed={props["aria-pressed"] ?? (selected || undefined)}
    style={{
      ...style,
      ...(railColor ? { ["--vt-split-rail" as string]: railColor } : {}),
      ...(labelColor ? { ["--vt-split-label" as string]: labelColor } : {}),
    }}
    {...props}
  >
    <span className="vt-subtoolbox-split-button-rail" aria-hidden="true">{icon}</span>
    <span className="vt-subtoolbox-split-button-label">{children}</span>
  </button>
)

export interface SubToolboxSplitDropdownOption {
  value: string
  label: React.ReactNode
  icon?: React.ReactNode
  disabled?: boolean
}

export interface SubToolboxSplitDropdownProps {
  value: string
  options: SubToolboxSplitDropdownOption[]
  onChange: (value: string) => void
  icon: React.ReactNode
  ariaLabel: string
  railColor?: string
  labelColor?: string
  className?: string
}

export const SubToolboxSplitDropdown: React.FC<SubToolboxSplitDropdownProps> = ({
  value,
  options,
  onChange,
  icon,
  ariaLabel,
  railColor,
  labelColor,
  className,
}) => {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const selected = options.find((option) => option.value === value)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  const style = {
    ...(railColor ? { ["--vt-split-rail" as string]: railColor } : {}),
    ...(labelColor ? { ["--vt-split-label" as string]: labelColor } : {}),
  } as React.CSSProperties

  return (
    <div ref={rootRef} className={classes("vt-subtoolbox-split-dropdown", open && "is-open", className)} style={style}>
      <button
        type="button"
        className="vt-subtoolbox-split-dropdown-trigger"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="vt-subtoolbox-split-dropdown-rail" aria-hidden="true">{icon}</span>
        <span className="vt-subtoolbox-split-dropdown-label">{selected?.label ?? value}</span>
        <span className="vt-subtoolbox-split-dropdown-chevron" aria-hidden="true"><ChevronDown size={20} strokeWidth={3.4} /></span>
      </button>
      {open ? (
        <div className="vt-subtoolbox-split-dropdown-menu" role="listbox" aria-label={ariaLabel}>
          {options.map((option) => {
            const active = option.value === value
            return (
              <button
                type="button"
                key={option.value}
                role="option"
                aria-selected={active}
                disabled={option.disabled}
                className={classes("vt-subtoolbox-split-dropdown-option", active && "is-active")}
                onClick={() => {
                  if (option.disabled) return
                  onChange(option.value)
                  setOpen(false)
                }}
              >
                <span className="vt-subtoolbox-split-dropdown-option-rail" aria-hidden="true">{option.icon ?? icon}</span>
                <span className="vt-subtoolbox-split-dropdown-option-label">{option.label}</span>
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

export interface SubToolboxKpiCardProps extends React.HTMLAttributes<HTMLElement> {
  label: React.ReactNode
  value: React.ReactNode
  sublabel?: React.ReactNode
  icon?: React.ReactNode
  accentColor?: string
  railColor?: string
}

export const SubToolboxKpiCard: React.FC<SubToolboxKpiCardProps> = ({
  label,
  value,
  sublabel,
  icon,
  accentColor,
  railColor,
  className,
  style,
  ...props
}) => (
  <article
    className={classes("vt-subtoolbox-kpi-card", className)}
    style={{
      ...style,
      ...(accentColor ? { ["--vt-kpi-accent" as string]: accentColor } : {}),
      ...(railColor ? { ["--vt-kpi-rail" as string]: railColor } : {}),
    }}
    {...props}
  >
    <header className="vt-subtoolbox-kpi-header">
      {icon ? <span className="vt-subtoolbox-kpi-icon" aria-hidden="true">{icon}</span> : null}
      <span className="vt-subtoolbox-kpi-label">{label}</span>
    </header>
    <div className="vt-subtoolbox-kpi-body">
      <strong className="vt-subtoolbox-kpi-value">{value}</strong>
      {sublabel ? <span className="vt-subtoolbox-kpi-sublabel">{sublabel}</span> : null}
    </div>
  </article>
)
