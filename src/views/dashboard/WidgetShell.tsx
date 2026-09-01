import React, { createContext, useContext, useEffect, useRef, useState } from "react"
import {
  CircleQuestionMark,
  EyeOff,
  GripVertical,
  Layers,
  Minus,
  Move,
  MoveHorizontal,
  MoveVertical,
  Plus,
  Settings2,
} from "lucide-react"
import { VTLottie } from "../../components/VTLottie"
import { cn } from "../../lib/utils"
import type { WidgetDefinition, WidgetInstanceState } from "./types"
import { WIDGET_DESCRIPTIONS } from "./WidgetRegistry"

export interface WidgetDragHandleBindings {
  attributes?: React.ButtonHTMLAttributes<HTMLButtonElement>
  listeners?: React.DOMAttributes<HTMLButtonElement>
  setActivatorNodeRef?: (node: HTMLButtonElement | null) => void
  disabled?: boolean
}

const WidgetDragHandleContext = createContext<WidgetDragHandleBindings>({ disabled: true })

export const WidgetDragHandleProvider: React.FC<WidgetDragHandleBindings & { children: React.ReactNode }> = ({
  children,
  ...bindings
}) => (
  <WidgetDragHandleContext.Provider value={bindings}>
    {children}
  </WidgetDragHandleContext.Provider>
)

/**
 * WidgetSettingsMenu — the dropdown behind the header's settings gear.
 * Contains W±, H±, Drag, Hide as square vt-buttons. Never renders black
 * chrome; every stroke is var(--widget-border).
 *
 * The Drag action doesn't drag directly — it arms the temporary drag chip
 * above the widget body (see WidgetShell). The chip carries the dnd-kit
 * activator bindings.
 */
const WidgetSettingsMenu: React.FC<{
  onCycleSize: () => void
  onDecSize: () => void
  onCycleHeight: () => void
  onDecHeight: () => void
  onArmDrag: () => void
  onHide: () => void
  widgetTitle: string
}> = ({ onCycleSize, onDecSize, onCycleHeight, onDecHeight, onArmDrag, onHide, widgetTitle }) => {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (event: MouseEvent) => {
      if (!wrapRef.current) return
      if (wrapRef.current.contains(event.target as Node)) return
      setOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [open])

  const item = (icon: React.ReactNode, label: string, action: () => void, tone: "" | "is-danger" = "") => (
    <button
      type="button"
      className={`widget-settings-menu__item ${tone}`}
      onClick={() => { action(); setOpen(false) }}
    >
      <span className="widget-settings-menu__icon">{icon}</span>
      <span className="widget-settings-menu__label">{label}</span>
    </button>
  )

  return (
    <div ref={wrapRef} className="widget-settings-menu">
      <button
        type="button"
        className={`widget-header-btn ${open ? "is-active" : ""}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Widget settings for ${widgetTitle}`}
        title="Widget settings"
        onClick={() => setOpen((prev) => !prev)}
      >
        <Settings2 size={16} strokeWidth={2} />
      </button>
      {open && (
        <div className="widget-settings-menu__popover" role="menu" aria-label={`Settings for ${widgetTitle}`}>
          <div className="widget-settings-menu__grid">
            {item(<MoveHorizontal size={14} />, "Wider", onCycleSize)}
            {item(<MoveHorizontal size={14} style={{ transform: "scaleX(-1)" }} />, "Narrower", onDecSize)}
            {item(<MoveVertical size={14} />, "Taller", onCycleHeight)}
            {item(<MoveVertical size={14} style={{ transform: "scaleY(-1)" }} />, "Shorter", onDecHeight)}
            {item(<Move size={14} />, "Drag", onArmDrag)}
            {item(<EyeOff size={14} />, "Hide", onHide, "is-danger")}
          </div>
        </div>
      )}
    </div>
  )
}

export const WidgetShell: React.FC<{
  widget: WidgetDefinition
  instance: WidgetInstanceState
  editMode: boolean
  canEdit: boolean
  onToggleCollapse?: () => void
  onCycleSize?: () => void
  onDecSize?: () => void
  onCycleHeight?: () => void
  onDecHeight?: () => void
  onRemove?: () => void
  children: React.ReactNode
  icon?: React.ReactNode
  headerContent?: React.ReactNode
  contentLayout?: "inset" | "flush"
  hasAI?: boolean
  onRegenerate?: () => void
  aiCost?: number
  aiDisabled?: boolean
  aiDisabledReason?: string
}> = ({
  widget,
  instance,
  editMode,
  canEdit,
  onToggleCollapse = () => {},
  onCycleSize = () => {},
  onDecSize = () => {},
  onCycleHeight = () => {},
  onDecHeight = () => {},
  onRemove = () => {},
  children,
  icon,
  headerContent,
  contentLayout = "inset",
  hasAI,
  onRegenerate,
  aiCost,
  aiDisabled,
  aiDisabledReason,
}) => {
  const [isSubtitleOpen, setIsSubtitleOpen] = useState(false)
  const [dragArmed, setDragArmed] = useState(false)
  const dragHandle = useContext(WidgetDragHandleContext)

  const widgetId = widget?.id || "unmapped"
  const description = WIDGET_DESCRIPTIONS[widgetId] || {
    short: "INTERACTIVE SOURCE PREVIEW RETAINED AS IDEA-BANK.",
    detailed: "View raw data streams and historical references before promoting components to the main dashboard.",
  }

  // Clear the armed drag chip after any drag ends (dnd-kit fires
  // pointerup / touchend on window when the drag operation completes).
  useEffect(() => {
    if (!dragArmed) return
    const clear = () => setDragArmed(false)
    window.addEventListener("pointerup", clear)
    window.addEventListener("touchend", clear)
    return () => {
      window.removeEventListener("pointerup", clear)
      window.removeEventListener("touchend", clear)
    }
  }, [dragArmed])

  const helpButton = (
    <button
      type="button"
      onClick={() => setIsSubtitleOpen((prev) => !prev)}
      className={`widget-header-btn ${isSubtitleOpen ? "is-active" : ""}`}
      aria-label={`${isSubtitleOpen ? "Hide" : "Show"} information for ${widget.title}`}
      aria-expanded={isSubtitleOpen}
      title="Widget information"
    >
      <CircleQuestionMark size={14} strokeWidth={2.5} />
    </button>
  )

  const collapseButton = (
    <button
      type="button"
      onClick={onToggleCollapse}
      className="widget-header-btn"
      aria-label={`${instance.collapsed ? "Expand" : "Collapse"} ${widget.title}`}
      aria-expanded={!instance.collapsed}
      title={instance.collapsed ? "Expand widget" : "Collapse widget"}
    >
      {instance.collapsed
        ? <Plus size={16} strokeWidth={2} />
        : <Minus size={16} strokeWidth={2} />}
    </button>
  )

  // Header right cluster:
  //   • Global rearrange mode (editMode on): [−W] [+W] [−H] [+H] [Drag] [?] [−]
  //   • Drag armed: the 3-button cluster is replaced by a full-width Drag
  //     bar occupying the same footprint — grabbing/dropping it commits the
  //     move; clicking clears the armed state and the buttons return.
  //   • Default: [?] [settings] [−] — always visible, regardless of canEdit,
  //     so a signed-out or locked viewer can still see help / collapse and
  //     the settings menu (individual items no-op when the handler is a
  //     no-op default, so no harm if not editable).
  let rightCluster: React.ReactNode
  if (editMode) {
    rightCluster = (
      <div className="widget-header-rearrange-strip" role="group" aria-label={`Rearrange ${widget.title}`}>
        <button type="button" onClick={onDecSize} className="widget-header-btn is-mini" title="Narrower"><span>-W</span></button>
        <button type="button" onClick={onCycleSize} className="widget-header-btn is-mini" title="Wider"><span>+W</span></button>
        <button type="button" onClick={onDecHeight} className="widget-header-btn is-mini" title="Shorter"><span>-H</span></button>
        <button type="button" onClick={onCycleHeight} className="widget-header-btn is-mini" title="Taller"><span>+H</span></button>
        <button
          type="button"
          ref={dragHandle.setActivatorNodeRef}
          {...dragHandle.attributes}
          {...dragHandle.listeners}
          className="widget-header-btn cursor-grab active:cursor-grabbing"
          aria-label={`Reorder ${widget.title}`}
          title="Drag to reorder"
          disabled={dragHandle.disabled}
        >
          <GripVertical size={14} strokeWidth={2} />
        </button>
        {helpButton}
        {collapseButton}
      </div>
    )
  } else if (dragArmed) {
    rightCluster = (
      <button
        type="button"
        ref={dragHandle.setActivatorNodeRef}
        {...dragHandle.attributes}
        {...dragHandle.listeners}
        className="widget-header-drag-bar"
        aria-label={`Drag ${widget.title} to a new position`}
        title="Drag to reorder — click to cancel"
        disabled={dragHandle.disabled}
        onClick={(e) => {
          // Only clear if this was a real click (no drag started).
          // dnd-kit calls its own listeners on pointerdown, so onClick fires
          // only when no drag occurred.
          e.stopPropagation()
          setDragArmed(false)
        }}
      >
        <GripVertical size={14} strokeWidth={2} />
        <span>Drag me</span>
      </button>
    )
  } else {
    rightCluster = (
      <div className="widget-header-default-cluster">
        {helpButton}
        <WidgetSettingsMenu
          onCycleSize={onCycleSize}
          onDecSize={onDecSize}
          onCycleHeight={onCycleHeight}
          onDecHeight={onDecHeight}
          onArmDrag={() => setDragArmed(true)}
          onHide={onRemove}
          widgetTitle={widget.title}
        />
        {collapseButton}
      </div>
    )
  }

  return (
    <div
      className={cn("vt-widget", instance?.collapsed ? "is-collapsed" : "open")}
      style={{
        "--widget-color": widget?.headerColor || "#36E0F6",
        "--widget-icon-rail-color": widget?.iconRailColor || "#C0F240",
      } as React.CSSProperties}
      data-responsive-mode={widget?.responsiveMode || "container"}
      data-drag-armed={dragArmed || undefined}
      data-collapsed={instance?.collapsed ? "true" : "false"}
    >
      <div className="vt-widget-header">
        <div className="left">
          <div className="icon-rail">
            {icon || <Layers size={22} />}
          </div>
          <span className="title">{widget?.title || "Widget"}</span>
        </div>

        {headerContent && (
          <div
            className="header-extra"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 6px", minWidth: 0 }}
          >
            {headerContent}
          </div>
        )}

        <div
          className="toggle flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          {hasAI && (
            <div className="flex items-center gap-1.5 mr-1">
              {typeof aiCost === "number" && (
                <span className="widget-ai-cost-chip">{aiCost}T</span>
              )}
              <button
                className="widget-header-btn ai-btn"
                title={aiDisabled && aiDisabledReason ? aiDisabledReason : "Regenerate with AI"}
                onClick={onRegenerate}
                disabled={aiDisabled}
              >
                <VTLottie
                  animationUrl="https://assets3.lottiefiles.com/packages/lf20_m6cu8sh9.json"
                  size={16}
                />
              </button>
            </div>
          )}

          {rightCluster}
        </div>
      </div>

      {/*
        Subtitle + content stay in the DOM even when collapsed, so a CSS
        max-height / opacity transition can animate collapse instead of a
        snap-remove. The header remains identical and its bottom border
        becomes the module's bottom stroke when the body height reaches 0
        — matching how the toolbox / subtoolbox family collapse.
      */}
      <div className={`widget-subtitle ${isSubtitleOpen ? "open" : ""}`}>
        <div className="widget-subtitle-content" style={{ flexDirection: "column", alignItems: "flex-start", gap: "2px" }}>
          <div style={{ fontWeight: 900, textTransform: "uppercase", fontSize: "12px", lineHeight: 1.2 }}>
            {description.short}
          </div>
          <div style={{ fontWeight: 600, fontSize: "11px", opacity: 0.7, lineHeight: 1.3, textTransform: "none" }}>
            {description.detailed}
          </div>
        </div>
      </div>

      <div className="vt-widget-content" aria-hidden={instance?.collapsed || undefined}>
        <div
          className={cn("vt-widget-body", contentLayout === "flush" && "vt-widget-body--flush")}
          onPointerDown={(e) => {
            // Prevent DnD-kit's PointerSensor on the sortable card from swallowing
            // taps on interactive widget content (buttons, inputs, links).
            e.stopPropagation()
          }}
          onTouchStart={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
