import * as Select from "@radix-ui/react-select"
import React, { useRef, useState } from "react"
import { AlertTriangle, Ban, Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Clock3, Inbox, LoaderCircle, RotateCw } from "lucide-react"
import type { WidgetDataState } from "./types"

const DEFAULT_MESSAGES = {
  loading: "Loading widget data…",
  ready: "Widget data is ready.",
  empty: "There is no data to show yet.",
  blocked: "Connect the required data source to continue.",
  stale: "This data may be out of date.",
  error: "This widget could not load its data.",
} as const

const STATE_ICONS = {
  loading: LoaderCircle,
  ready: Clock3,
  empty: Inbox,
  blocked: Ban,
  stale: Clock3,
  error: AlertTriangle,
} as const

export const WidgetStatePanel = <T,>({
  state,
  onRecover,
}: {
  state: WidgetDataState<T>
  onRecover?: () => void
}) => {
  const Icon = STATE_ICONS[state.status]
  const isAlert = state.status === "error" || state.status === "blocked"

  return (
    <section
      className={`widget-state-panel is-${state.status}`}
      data-widget-state={state.status}
      role={isAlert ? "alert" : "status"}
      aria-live={isAlert ? "assertive" : "polite"}
    >
      <Icon className={state.status === "loading" ? "is-spinning" : undefined} size={24} strokeWidth={2} aria-hidden="true" />
      <strong>{state.status === "error" ? "Something went wrong" : state.status}</strong>
      <p>{state.message || DEFAULT_MESSAGES[state.status]}</p>
      {state.provenance && <small>Source: {state.provenance}</small>}
      {state.updatedAt && <small>Updated: {state.updatedAt}</small>}
      {onRecover && state.recoveryAction && (
        <button type="button" className="widget-state-recovery" onClick={onRecover}>
          <RotateCw size={16} strokeWidth={2} aria-hidden="true" />
          {state.recoveryAction}
        </button>
      )}
    </section>
  )
}

export const WidgetMetric: React.FC<{
  label: string
  value: React.ReactNode
  detail?: React.ReactNode
  tone?: string
}> = ({ label, value, detail, tone }) => (
  <div className="widget-metric" style={{ "--metric-tone": tone } as React.CSSProperties}>
    <span className="widget-metric-label">{label}</span>
    <strong className="widget-metric-value">{value}</strong>
    {detail && <span className="widget-metric-detail">{detail}</span>}
  </div>
)

export const WidgetActionButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "primary" | "neutral" | "danger"
}> = ({ className = "", tone = "neutral", type = "button", ...props }) => (
  <button type={type} className={`widget-action is-${tone} ${className}`.trim()} {...props} />
)

const EMPTY_WIDGET_SELECT_VALUE = "__vt_none__"

export interface WidgetSelectOption {
  value: string
  label: string
}

export const WidgetSelect: React.FC<{
  value: string
  onChange: (value: string) => void
  options: WidgetSelectOption[]
  label: string
  placeholder?: string
}> = ({ value, onChange, options, label, placeholder = "Select…" }) => {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [menuColor, setMenuColor] = useState("#FA618A")

  return (
    <Select.Root
      value={value || EMPTY_WIDGET_SELECT_VALUE}
      onValueChange={(next) => onChange(next === EMPTY_WIDGET_SELECT_VALUE ? "" : next)}
      onOpenChange={(open) => {
        if (!open || !triggerRef.current) return
        const color = getComputedStyle(triggerRef.current).getPropertyValue("--widget-color").trim()
        if (color) setMenuColor(color)
      }}
    >
      <Select.Trigger ref={triggerRef} className="widget-select-trigger" aria-label={label}>
        <Select.Value placeholder={placeholder} />
        <Select.Icon><ChevronDown aria-hidden="true" /></Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          className="widget-select-content"
          position="popper"
          sideOffset={4}
          collisionPadding={12}
          style={{ "--widget-select-color": menuColor } as React.CSSProperties}
        >
          <Select.ScrollUpButton className="widget-select-scroll"><ChevronUp /></Select.ScrollUpButton>
          <Select.Viewport className="widget-select-viewport">
            <Select.Item className="widget-select-item" value={EMPTY_WIDGET_SELECT_VALUE}>
              <Select.ItemText>{placeholder}</Select.ItemText>
              <Select.ItemIndicator><Check /></Select.ItemIndicator>
            </Select.Item>
            {options.filter((option) => option.value).map((option) => (
              <Select.Item className="widget-select-item" value={option.value} key={option.value}>
                <Select.ItemText>{option.label}</Select.ItemText>
                <Select.ItemIndicator><Check /></Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
          <Select.ScrollDownButton className="widget-select-scroll"><ChevronDown /></Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}

export const WidgetField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="widget-control-field">
    <span>{label}</span>
    {children}
  </label>
)

export const WidgetDisclosure: React.FC<{
  title: string
  children: React.ReactNode
}> = ({ title, children }) => (
  <details className="widget-control-disclosure">
    <summary><span>{title}</span><ChevronDown aria-hidden="true" /></summary>
    <div className="widget-control-disclosure-body">{children}</div>
  </details>
)

export const WidgetChoice: React.FC<{
  label: string
  checked: boolean
  onChange: () => void
  type?: "checkbox" | "radio"
  name?: string
  value?: string
}> = ({ label, checked, onChange, type = "checkbox", name, value }) => (
  <label className="widget-control-choice">
    <input type={type} name={name} value={value} checked={checked} onChange={onChange} />
    <span>{label}</span>
  </label>
)

export const WidgetHeaderToggle = <T extends string>({
  label,
  value,
  items,
  onChange,
}: {
  label: string
  value: T
  items: readonly { id: T; label: string }[]
  onChange: (value: T) => void
}) => (
  <div className="widget-header-toggle" role="group" aria-label={label}>
    {items.map((item) => (
      <button
        key={item.id}
        type="button"
        className={value === item.id ? "is-active" : undefined}
        aria-pressed={value === item.id}
        onClick={() => onChange(item.id)}
      >
        {item.label}
      </button>
    ))}
  </div>
)

export const WidgetHeaderStepper = ({
  label,
  value,
  onPrevious,
  onNext,
  canPrevious = true,
  canNext = true,
}: {
  label: string
  value: string
  onPrevious: () => void
  onNext: () => void
  canPrevious?: boolean
  canNext?: boolean
}) => (
  <div className="widget-header-toggle widget-header-stepper" role="group" aria-label={label}>
    <button type="button" className="is-active" aria-label={`Previous ${label}`} disabled={!canPrevious} onClick={onPrevious}>
      <ChevronLeft aria-hidden="true" size={14} />
    </button>
    <span className="widget-header-stepper-value" aria-live="polite">{value}</span>
    <button type="button" className="is-active" aria-label={`Next ${label}`} disabled={!canNext} onClick={onNext}>
      <ChevronRight aria-hidden="true" size={14} />
    </button>
  </div>
)

export const WidgetStepTabs = <T extends string>({
  label,
  value,
  items,
  onChange,
}: {
  label: string
  value: T
  items: readonly { id: T; label: string }[]
  onChange: (value: T) => void
}) => (
  <nav className="widget-step-tabs" aria-label={label}>
    {items.map((item, index) => (
      <button
        key={item.id}
        type="button"
        className={value === item.id ? "is-active" : undefined}
        aria-current={value === item.id ? "step" : undefined}
        onClick={() => onChange(item.id)}
      >
        <span aria-hidden="true">{index + 1}</span>
        {item.label}
      </button>
    ))}
  </nav>
)

export const WidgetDropzone: React.FC<
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
    icon: React.ReactNode
    endIcon?: React.ReactNode
    title: React.ReactNode
    detail: React.ReactNode
    hasValue?: boolean
  }
> = ({ icon, endIcon, title, detail, hasValue = false, className = "", type = "button", ...props }) => (
  <button
    type={type}
    className={`widget-dropzone ${hasValue ? "has-value" : ""} ${className}`.trim()}
    {...props}
  >
    <span className="widget-dropzone-icon" aria-hidden="true">{icon}</span>
    <span className="widget-dropzone-copy"><strong>{title}</strong><small>{detail}</small></span>
    {endIcon ? <span className="widget-dropzone-end" aria-hidden="true">{endIcon}</span> : null}
  </button>
)
