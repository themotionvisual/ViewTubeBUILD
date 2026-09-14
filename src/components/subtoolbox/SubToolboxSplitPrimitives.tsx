import React, { useEffect, useRef, useState } from "react"
import { ChevronDown } from "lucide-react"
import "../../styles/toolbox-entry.css"
import "../../styles/subtoolbox-split-primitives.css"

const classes = (...values: Array<string | false | null | undefined>) => values.filter(Boolean).join(" ")

export interface SubToolboxSplitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode
  children: React.ReactNode
  selected?: boolean
  railColor?: string
  labelColor?: string
}

export const SubToolboxSplitButton: React.FC<SubToolboxSplitButtonProps> = ({ icon, children, selected = false, railColor, labelColor, className, style, type = "button", ...props }) => (
  <button type={type} className={classes("vt-subtoolbox-split-button", selected && "is-selected", className)} aria-pressed={props["aria-pressed"] ?? (selected || undefined)} style={{ ...style, ...(railColor ? { ["--vt-split-rail" as string]: railColor } : {}), ...(labelColor ? { ["--vt-split-label" as string]: labelColor } : {}) }} {...props}>
    <span className="vt-subtoolbox-split-rail" aria-hidden="true">{icon}</span><span className="vt-subtoolbox-split-label">{children}</span>
  </button>
)

export interface SubToolboxSplitDropdownOption { value: string; label: React.ReactNode; disabled?: boolean }
export interface SubToolboxSplitDropdownProps { value: string; options: SubToolboxSplitDropdownOption[]; onChange: (value: string) => void; icon: React.ReactNode; ariaLabel?: string; disabled?: boolean; railColor?: string; labelColor?: string; className?: string }
export const SubToolboxSplitDropdown: React.FC<SubToolboxSplitDropdownProps> = ({ value, options, onChange, icon, ariaLabel, disabled = false, railColor, labelColor, className }) => {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const selected = options.find((option) => option.value === value) ?? options[0]
  useEffect(() => { if (!open) return; const close = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node)) setOpen(false) }; window.addEventListener("pointerdown", close); return () => window.removeEventListener("pointerdown", close) }, [open])
  return <div ref={rootRef} className={classes("vt-subtoolbox-split-dropdown", open && "is-open", className)} style={{ ...(railColor ? { ["--vt-split-rail" as string]: railColor } : {}), ...(labelColor ? { ["--vt-split-label" as string]: labelColor } : {}) }}>
    <button type="button" className="vt-subtoolbox-split-dropdown-trigger" disabled={disabled} aria-label={ariaLabel} aria-expanded={open} onClick={() => setOpen((current) => !current)}><span className="vt-subtoolbox-split-rail" aria-hidden="true">{icon}</span><span className="vt-subtoolbox-split-label">{selected?.label}</span><ChevronDown size={14} strokeWidth={3} aria-hidden="true" /></button>
    {open ? <div className="vt-subtoolbox-split-dropdown-menu" role="listbox">{options.map((option) => <button key={option.value} type="button" role="option" aria-selected={option.value === value} disabled={option.disabled} onClick={() => { onChange(option.value); setOpen(false) }}>{option.label}</button>)}</div> : null}
  </div>
}
