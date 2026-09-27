import React, { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { getComponentLevelCssVars } from "./tokens"
import type { ToolboxControlLevel } from "./tokens"
import { ChevronDown } from "lucide-react"
import "../../styles/toolbox-entry.css"
import "../../styles/subtoolbox-split-primitives.css"

const classes = (...values: Array<string | false | null | undefined>) => values.filter(Boolean).join(" ")

export interface SubToolboxSplitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode
  children: React.ReactNode
  selected?: boolean
  level?: ToolboxControlLevel
}

export const SubToolboxSplitButton: React.FC<SubToolboxSplitButtonProps> = ({
  icon,
  children,
  selected = false,
  level,
  className,
  style,
  type = "button",
  ...props
}) => (
  <button
    type={type}
    data-vt-control-level={level}
    className={classes("vt-subtoolbox-split-button", level && "has-component-level", selected && "is-selected", className)}
    aria-pressed={props["aria-pressed"] ?? (selected || undefined)}
    style={{
      ...style,
      ...(level ? getComponentLevelCssVars(level) : {}),
    }}
    {...props}
  >
    <span className="vt-subtoolbox-split-button-rail" aria-hidden="true">{icon}</span>
    <span className="vt-subtoolbox-split-button-label">{children}</span>
  </button>
)

export interface SubToolboxShellActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode
  children: React.ReactNode
  level?: ToolboxControlLevel
}

export const SubToolboxShellAction: React.FC<SubToolboxShellActionProps> = ({
  icon,
  children,
  level = "l0",
  className,
  style,
  type = "button",
  ...props
}) => (
  <button
    type={type}
    data-vt-control-level={level}
    className={classes("vt-subtoolbox-shell-action", className)}
    style={{
      ...getComponentLevelCssVars(level),
      ...style,
    }}
    {...props}
  >
    <span className="vt-subtoolbox-shell-action-rail" aria-hidden="true">{icon}</span>
    <span className="vt-subtoolbox-shell-action-title">{children}</span>
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
  icon?: React.ReactNode
  railLabel?: React.ReactNode
  chevron?: React.ReactNode
  defaultOpen?: boolean
  ariaLabel: string
  className?: string
  level?: ToolboxControlLevel
}

export const SubToolboxSplitDropdown: React.FC<SubToolboxSplitDropdownProps> = ({
  value,
  options,
  onChange,
  icon,
  chevron,
  defaultOpen = false,
  ariaLabel,
  className,
  level,
}) => {
  const [open, setOpen] = useState(defaultOpen)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const pendingFocus = useRef<1 | -1 | null>(null)
  const [placement, setPlacement] = useState<{ left: number; top: number; width: number; maxHeight: number; above: boolean; pairA: string; pairB: string } | null>(null)
  const selected = options.find((option) => option.value === value)

  useEffect(() => {
    if (!open) return
    const sync = () => {
      const trigger = triggerRef.current
      if (!trigger) return
      const rect = trigger.getBoundingClientRect()
      const margin = 8
      const below = window.innerHeight - rect.bottom - margin - 4
      const aboveSpace = rect.top - margin - 4
      const above = below < Math.min(180, options.length * rect.height) && aboveSpace > below
      const rootStyle = getComputedStyle(rootRef.current ?? trigger)
      setPlacement({
        left: Math.max(margin, Math.min(rect.left, window.innerWidth - margin - rect.width)),
        top: above ? rect.top - 4 : rect.bottom + 4,
        width: Math.min(rect.width, window.innerWidth - margin * 2),
        maxHeight: Math.max(48, Math.min(420, above ? aboveSpace : below)),
        above,
        pairA: rootStyle.getPropertyValue("--pair-a").trim(),
        pairB: rootStyle.getPropertyValue("--pair-b").trim(),
      })
    }
    sync()
    window.addEventListener("resize", sync)
    window.addEventListener("scroll", sync, true)
    return () => {
      window.removeEventListener("resize", sync)
      window.removeEventListener("scroll", sync, true)
    }
  }, [open, options.length])

  useEffect(() => {
    if (!open || !placement || pendingFocus.current === null) return
    const direction = pendingFocus.current
    pendingFocus.current = null
    const enabled = Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? [])
    enabled[direction === 1 ? 0 : enabled.length - 1]?.focus()
  }, [open, placement])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node) && !menuRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  const focusOption = (direction: 1 | -1) => {
    const enabled = Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? [])
    if (!enabled.length) return
    const current = enabled.indexOf(document.activeElement as HTMLButtonElement)
    enabled[(current + direction + enabled.length) % enabled.length]?.focus()
  }

  const style = {
    ...(level ? getComponentLevelCssVars(level) : {}),
  } as React.CSSProperties

  return (
    <div ref={rootRef} data-vt-control-level={level} className={classes("vt-subtoolbox-split-dropdown", level && "has-component-level", open && "is-open", className)} style={style}>
      <button
        ref={triggerRef}
        type="button"
        className="vt-subtoolbox-split-dropdown-trigger"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault()
            const direction = event.key === "ArrowDown" ? 1 : -1
            if (open) focusOption(direction)
            else {
              pendingFocus.current = direction
              setOpen(true)
            }
          }
        }}
      >
        <span className="vt-subtoolbox-split-dropdown-rail" aria-hidden="true">{icon}</span>
        <span className="vt-subtoolbox-split-dropdown-label">
          <b>{selected?.label ?? value}</b>
          <span className="vt-subtoolbox-split-dropdown-chevron" aria-hidden="true">{chevron ?? <ChevronDown size={18} strokeWidth={3.4} />}</span>
        </span>
      </button>
      {open ? (() => {
        const menu = <div
          ref={menuRef}
          className={classes("vt-subtoolbox-split-dropdown-menu", level && "has-component-level")}
          role="listbox"
          aria-label={ariaLabel}
          data-vt-control-level={level}
          data-placement={placement?.above ? "above" : "below"}
          style={placement && typeof document !== "undefined" ? {
            ...style,
            ...(placement.pairA ? { ["--pair-a" as string]: placement.pairA } : {}),
            ...(placement.pairB ? { ["--pair-b" as string]: placement.pairB } : {}),
            position: "fixed", left: placement.left, top: placement.top, width: placement.width,
            maxHeight: placement.maxHeight, transform: placement.above ? "translateY(-100%)" : undefined,
          } : undefined}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault()
              focusOption(event.key === "ArrowDown" ? 1 : -1)
            }
          }}
        >
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
                <span className="vt-subtoolbox-split-dropdown-option-label">
                  <b>{option.label}</b>
                  {active ? <span className="vt-subtoolbox-split-dropdown-option-check" aria-hidden="true">✓</span> : null}
                </span>
              </button>
            )
          })}
        </div>
        return placement && typeof document !== "undefined" ? createPortal(menu, document.body) : menu
      })() : null}
    </div>
  )
}

export interface SubToolboxKpiCardProps extends React.HTMLAttributes<HTMLElement> {
  label: React.ReactNode
  value: React.ReactNode
  sublabel?: React.ReactNode
  icon?: React.ReactNode
  level?: ToolboxControlLevel
}

export const SubToolboxKpiCard: React.FC<SubToolboxKpiCardProps> = ({
  label,
  value,
  sublabel,
  icon,
  level,
  className,
  style,
  ...props
}) => (
  <article
    data-vt-control-level={level}
    className={classes("vt-subtoolbox-kpi-card", level && "has-component-level", className)}
    style={{
      ...style,
      ...(level ? getComponentLevelCssVars(level) : {}),
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
