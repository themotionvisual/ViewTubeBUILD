import * as Select from "@radix-ui/react-select"
import React, { useCallback, useEffect, useId, useRef, useState } from "react"
import { AlertTriangle, Ban, Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Clock3, Inbox, LoaderCircle, RotateCw, X } from "lucide-react"
import type { WidgetDataState } from "./types"
import { resolveWidgetViewportSegment } from "./widgetScrollGeometry"

export interface WidgetScrollAreaProps {
  ariaLabel: string
  enabled?: boolean
  axis?: "vertical" | "both"
  edge?: "inset" | "full"
  className?: string
  contentClassName?: string
  viewportRef?: React.RefObject<HTMLDivElement | null>
  children: React.ReactNode
}

export const WidgetScrollArea: React.FC<WidgetScrollAreaProps> = ({
  ariaLabel,
  enabled = true,
  axis = "vertical",
  edge = "inset",
  className = "",
  contentClassName = "",
  viewportRef,
  children,
}) => {
  const internalViewportRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const controllerRef = useRef<HTMLDivElement>(null)
  const visualRef = useRef<HTMLSpanElement>(null)
  const segmentRef = useRef<HTMLDivElement>(null)
  const dragOffsetRef = useRef(0)
  const frameRef = useRef<HTMLDivElement>(null)

  const assignViewportRef = useCallback((node: HTMLDivElement | null) => {
    internalViewportRef.current = node
    if (viewportRef) viewportRef.current = node
  }, [viewportRef])

  const syncIndicator = useCallback(() => {
    const viewport = internalViewportRef.current
    const controller = controllerRef.current
    const visual = visualRef.current
    const segment = segmentRef.current
    const frame = frameRef.current
    if (!viewport || !controller || !visual || !segment || !frame) return

    const controllerHeight = Math.max(0, visual.clientHeight - 4)
    const metrics = resolveWidgetViewportSegment({
      clientHeight: viewport.clientHeight,
      scrollHeight: viewport.scrollHeight,
      scrollTop: viewport.scrollTop,
      controllerHeight,
    })

    frame.dataset.overflowing = String(metrics.hasOverflow)
    controller.hidden = !metrics.hasOverflow
    segment.style.height = `${metrics.height}px`
    segment.style.transform = `translateY(${metrics.top}px)`
  }, [])

  const scrollFromPointer = useCallback((clientY: number) => {
    const viewport = internalViewportRef.current
    const visual = visualRef.current
    const segment = segmentRef.current
    if (!viewport || !visual || !segment) return

    const innerTop = visual.getBoundingClientRect().top + 2
    const innerHeight = Math.max(0, visual.clientHeight - 4)
    const segmentHeight = segment.offsetHeight
    const travel = Math.max(1, innerHeight - segmentHeight)
    const segmentTop = Math.min(
      travel,
      Math.max(0, clientY - innerTop - dragOffsetRef.current),
    )
    const scrollRange = Math.max(0, viewport.scrollHeight - viewport.clientHeight)
    viewport.scrollTop = (segmentTop / travel) * scrollRange
  }, [])

  useEffect(() => {
    if (!enabled) return
    const viewport = internalViewportRef.current
    const content = contentRef.current
    if (!viewport || !content) return

    let frame: number | undefined
    const scheduleSync = () => {
      if (frame !== undefined) return
      frame = window.requestAnimationFrame(() => {
        frame = undefined
        syncIndicator()
      })
    }
    const observer = new ResizeObserver(scheduleSync)
    observer.observe(viewport)
    observer.observe(content)
    viewport.addEventListener("scroll", scheduleSync, { passive: true })
    scheduleSync()

    return () => {
      if (frame !== undefined) window.cancelAnimationFrame(frame)
      observer.disconnect()
      viewport.removeEventListener("scroll", scheduleSync)
    }
  }, [enabled, syncIndicator])

  if (!enabled) {
    return <div className={`widget-scroll-static ${className}`.trim()}>{children}</div>
  }

  return (
    <div
      ref={frameRef}
      className={`widget-scroll-area is-${axis} is-${edge} ${className}`.trim()}
      data-overflowing="false"
    >
      <div
        ref={assignViewportRef}
        className="widget-scroll-viewport"
        role="region"
        aria-label={ariaLabel}
        tabIndex={0}
      >
        <div ref={contentRef} className={`widget-scroll-content ${contentClassName}`.trim()}>
          {children}
        </div>
      </div>
      <div
        ref={controllerRef}
        className="widget-scroll-controller"
        aria-hidden="true"
        hidden
        onPointerDown={(event) => {
          const segment = segmentRef.current
          const pressedSegment = event.target === segment
          dragOffsetRef.current = pressedSegment && segment
            ? event.clientY - segment.getBoundingClientRect().top
            : (segment?.offsetHeight || 0) / 2
          event.currentTarget.setPointerCapture(event.pointerId)
          event.currentTarget.dataset.dragging = "true"
          scrollFromPointer(event.clientY)
          event.preventDefault()
        }}
        onPointerMove={(event) => {
          if (!event.currentTarget.hasPointerCapture(event.pointerId)) return
          scrollFromPointer(event.clientY)
        }}
        onPointerUp={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId)
          }
          delete event.currentTarget.dataset.dragging
        }}
        onPointerCancel={(event) => {
          delete event.currentTarget.dataset.dragging
        }}
      >
        <span ref={visualRef} className="widget-scroll-visual">
          <span ref={segmentRef} className="widget-scroll-segment" />
        </span>
      </div>
    </div>
  )
}

export const WidgetSection: React.FC<{
  edge?: "inset" | "full"
  surface?: "transparent" | "white" | "subtle"
  className?: string
  children: React.ReactNode
}> = ({ edge = "inset", surface = "transparent", className = "", children }) => (
  <section className={`widget-section is-${edge} is-${surface} ${className}`.trim()}>{children}</section>
)

export const WidgetDivider: React.FC<{
  edge?: "content" | "full"
  className?: string
}> = ({ edge = "content", className = "" }) => (
  <hr className={`widget-divider is-${edge} ${className}`.trim()} />
)

export const WidgetFooter: React.FC<{
  surface?: "white" | "subtle"
  divider?: boolean
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}> = ({ surface = "white", divider = true, className = "", style, children }) => (
  <footer className={`widget-footer is-${surface} ${divider ? "has-divider" : "without-divider"} ${className}`.trim()} style={style}>{children}</footer>
)

/**
 * Shared flex region for compact workflows.  It reserves the footer's space by
 * growing inside the widget body instead of asking each widget to calculate a
 * remaining height with margins or inline styles.
 */
export const WidgetWorkflowMain: React.FC<{
  className?: string
  children: React.ReactNode
}> = ({ className = "", children }) => (
  <main className={`widget-workflow-main ${className}`.trim()}>{children}</main>
)

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

export const WidgetSplitButton: React.FC<
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
    icon: React.ReactNode
    children: React.ReactNode
    tone?: "primary" | "soft" | "neutral"
    size?: "compact" | "small" | "medium" | "large"
    width?: "auto" | "compact" | "wide" | "full"
  }
> = ({ icon, children, tone = "neutral", size = "medium", width = "auto", className = "", type = "button", ...props }) => (
  <button
    type={type}
    className={`widget-split-button is-${tone} is-${size} is-${width} ${className}`.trim()}
    {...props}
  >
    <span className="widget-split-button-icon" aria-hidden="true">{icon}</span>
    <span className="widget-split-button-label">{children}</span>
  </button>
)

export const WidgetSwitch: React.FC<{
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  name?: string
}> = ({ label, checked, onChange, disabled = false, name }) => (
  <label className="widget-control-switch">
    <input
      type="checkbox"
      role="switch"
      name={name}
      checked={checked}
      disabled={disabled}
      onChange={(event) => onChange(event.currentTarget.checked)}
    />
    <span className="widget-control-switch-track" aria-hidden="true" />
    <span className="widget-control-switch-label">{label}</span>
  </label>
)

export const WidgetTag: React.FC<{
  children: React.ReactNode
  onRemove?: () => void
  removeLabel?: string
  muted?: boolean
  className?: string
}> = ({ children, onRemove, removeLabel, muted = false, className = "" }) => (
  <span className={`widget-tag-chip ${muted ? "is-muted" : ""} ${className}`.trim()}>
    <span>{children}</span>
    {onRemove ? (
      <button type="button" className="widget-tag-chip-remove" aria-label={removeLabel || `Remove ${String(children)} tag`} onClick={onRemove}>
        <X aria-hidden="true" />
      </button>
    ) : null}
  </span>
)

export const WidgetTooltip: React.FC<{
  content: React.ReactNode
  children: React.ReactElement
  className?: string
  style?: React.CSSProperties
  variant?:
    | "standard-spout"
    | "side-borderless"
    | "drawer"
    | "top-center-outline"
    | "top-center-borderless"
    | "top-center-ink"
    | "left-icon"
    | "left-compact"
    | "right-visual"
    | "right-subtitle"
    | "right-table"
    | "right-note"
}> = ({ content, children, className = "", style, variant = "standard-spout" }) => {
  const tooltipId = useId()
  const trigger = React.cloneElement(children, {
    "aria-describedby": tooltipId,
  } as React.HTMLAttributes<HTMLElement>)

  return (
    <span className={`widget-tooltip tip is-${variant} ${className}`.trim()} style={style}>
      {trigger}
      <span id={tooltipId} role="tooltip" className="widget-tooltip-bubble bub">{content}</span>
    </span>
  )
}

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
  disabled?: boolean
  className?: string
  style?: React.CSSProperties
}> = ({ value, onChange, options, label, placeholder = "Select…", disabled = false, className = "", style }) => {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [menuColor, setMenuColor] = useState("#FA618A")
  const [menuInk, setMenuInk] = useState("#9f3653")

  return (
    <Select.Root
      value={value || EMPTY_WIDGET_SELECT_VALUE}
      onValueChange={(next) => onChange(next === EMPTY_WIDGET_SELECT_VALUE ? "" : next)}
      onOpenChange={(open) => {
        if (!open || !triggerRef.current) return
        const computed = getComputedStyle(triggerRef.current)
        const color = computed.getPropertyValue("--widget-color").trim()
        const ink = computed.getPropertyValue("--widget-border").trim() || computed.color
        if (color) setMenuColor(color)
        if (ink) setMenuInk(ink)
      }}
    >
      <Select.Trigger
        ref={triggerRef}
        className={`widget-select-trigger ${className}`.trim()}
        aria-label={label}
        disabled={disabled}
        style={style}
      >
        <Select.Value placeholder={placeholder} />
        <Select.Icon><ChevronDown aria-hidden="true" /></Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          className="widget-select-content"
          position="popper"
          sideOffset={4}
          collisionPadding={12}
          style={{
            "--widget-select-color": menuColor,
            "--widget-select-ink": menuInk,
          } as React.CSSProperties}
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
}) => {
  const activeIndex = Math.max(0, items.findIndex((item) => item.id === value))
  const toggleStyle = {
    "--widget-header-toggle-count": String(Math.max(1, items.length)),
    "--widget-header-toggle-index": String(activeIndex),
  } as React.CSSProperties

  return (
  <div className="widget-header-toggle" role="group" aria-label={label} style={toggleStyle}>
    <span className="widget-header-toggle-indicator" aria-hidden="true" />
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
}

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
> = ({ icon, endIcon, title, detail, hasValue = false, className = "", type = "button", onDragOver, onDragLeave, onDrop, ...props }) => {
  const [isDragging, setIsDragging] = useState(false)
  return (
    <button
      type={type}
      className={`widget-dropzone ${hasValue ? "has-value" : ""} ${isDragging ? "is-dragging" : ""} ${className}`.trim()}
      onDragOver={(event) => { event.preventDefault(); setIsDragging(true); onDragOver?.(event) }}
      onDragLeave={(event) => { setIsDragging(false); onDragLeave?.(event) }}
      onDrop={(event) => { setIsDragging(false); onDrop?.(event) }}
      {...props}
    >
      <span className="widget-dropzone-icon" aria-hidden="true">{icon}</span>
      <span className="widget-dropzone-copy"><strong>{title}</strong><small>{detail}</small></span>
      {endIcon ? <span className="widget-dropzone-end" aria-hidden="true">{endIcon}</span> : null}
    </button>
  )
}

/**
 * Shared media-picker anatomy for publishing workflows. The visual frame never
 * changes size: it presents an empty drop target before selection and the file
 * or preview inside the very same space once a file is available.
 */
export const WidgetMediaUploadFrame: React.FC<{
  icon: React.ReactNode
  title: React.ReactNode
  detail: React.ReactNode
  actionLabel?: React.ReactNode
  preview?: React.ReactNode
  hasValue?: boolean
  onBrowse: () => void
  onDropFile?: (file: File | undefined) => void
  className?: string
}> = ({
  icon,
  title,
  detail,
  actionLabel,
  preview,
  hasValue = false,
  onBrowse,
  onDropFile,
  className = "",
}) => {
  const [isDragging, setIsDragging] = useState(false)

  return (
    <section className={`widget-media-upload ${actionLabel ? "has-action" : ""} ${hasValue ? "has-value" : ""} ${isDragging ? "is-dragging" : ""} ${className}`.trim()}>
      {actionLabel ? <WidgetMediaUploadAction onClick={onBrowse}>{actionLabel}</WidgetMediaUploadAction> : null}
      <button
        type="button"
        className="widget-media-upload-frame"
        onClick={onBrowse}
        onDragOver={(event) => { event.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setIsDragging(false)
          onDropFile?.(event.dataTransfer.files?.[0])
        }}
        aria-label={`${title}: ${hasValue ? "file selected" : "choose or drop a file"}`}
      >
        {preview ? <span className="widget-media-upload-preview">{preview}</span> : (
          <span className="widget-media-upload-empty">
            <span className="widget-media-upload-icon" aria-hidden="true">{icon}</span>
            <span className="widget-media-upload-copy"><strong>{title}</strong><small>{detail}</small></span>
          </span>
        )}
      </button>
    </section>
  )
}

export const WidgetMediaUploadAction: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ className = "", type = "button", children, ...props }) => (
  <button type={type} className={`vt-button widget-media-upload-action ${className}`.trim()} {...props}>
    {children}
  </button>
)

// ═══════════════════════════════════════════════════════════
// WidgetBadge — canonical 12-slot spectrum badge, 2px stroke.
// Wraps the existing .vt-spectrum-badge class so styling stays
// in one source (src/styles/spectrumBadge.css). Every consumer
// picks a spectrum slot by index or semantic name, or an intent
// which maps to a slot; the badge stays monochromatic in that
// hue (stroke + text + translucent fill).
// ═══════════════════════════════════════════════════════════
import { VT_SPECTRUM_PALETTE_06 } from "../../styles/toolboxPalette"

export const WIDGET_BADGE_SPECTRUM = [
  "rose", "coral", "orange", "yellow", "lime", "green",
  "teal", "cyan", "royal", "purple", "magenta", "pink",
] as const

export type WidgetBadgeSpectrumName = typeof WIDGET_BADGE_SPECTRUM[number]
export type WidgetBadgeTone = WidgetBadgeSpectrumName | number
export type WidgetBadgeStatus = "positive" | "warning" | "danger" | "neutral"

const STATUS_TO_SLOT: Record<WidgetBadgeStatus, number> = {
  positive: 5,  // green
  warning:  3,  // yellow
  danger:   0,  // rose
  neutral:  8,  // royal
}

const resolveBadgeHue = (tone?: WidgetBadgeTone, status?: WidgetBadgeStatus): string => {
  if (typeof tone === "number") {
    return VT_SPECTRUM_PALETTE_06[((tone % 12) + 12) % 12]
  }
  if (typeof tone === "string") {
    const idx = WIDGET_BADGE_SPECTRUM.indexOf(tone as WidgetBadgeSpectrumName)
    if (idx >= 0) return VT_SPECTRUM_PALETTE_06[idx]
  }
  if (status) return VT_SPECTRUM_PALETTE_06[STATUS_TO_SLOT[status]]
  // No hint → use widget's palette color (CSS var falls back per-widget).
  return "var(--widget-color, #40C6E9)"
}

export const WidgetBadge: React.FC<{
  tone?: WidgetBadgeTone
  status?: WidgetBadgeStatus
  icon?: React.ReactNode
  className?: string
  children: React.ReactNode
}> = ({ tone, status, icon, className = "", children }) => {
  const hue = resolveBadgeHue(tone, status)
  return (
    <span
      className={`vt-spectrum-badge ${className}`.trim()}
      style={{ ["--vt-spectrum-badge-stroke" as string]: hue }}
    >
      {icon && <span className="vt-spectrum-badge__icon" aria-hidden="true">{icon}</span>}
      <span>{children}</span>
    </span>
  )
}
