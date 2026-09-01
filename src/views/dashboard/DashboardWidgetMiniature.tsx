import React, { memo } from "react"
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Eye,
  EyeOff,
  Minus,
  Move,
  Plus,
} from "lucide-react"
import type { DashboardSpectrumTokens } from "./spectrum"
import type {
  DashboardMiniPlacement,
  DashboardMoveDirection,
  DashboardResizeDirection,
} from "./dashboardMiniLayout"
import type { WidgetDefinition, WidgetInstanceState } from "./types"

const DIRECTIONS: readonly DashboardMoveDirection[] = ["up", "right", "left", "down"]
const RESIZE_DIRECTIONS: readonly DashboardResizeDirection[] = ["thinner", "wider", "shorter", "taller"]

const DIRECTION_ICONS = {
  up: ArrowUp,
  right: ArrowRight,
  left: ArrowLeft,
  down: ArrowDown,
} as const

export type DashboardMiniMoveTargets = Record<DashboardMoveDirection, string | null>
export type DashboardMiniResizeAvailability = Record<DashboardResizeDirection, boolean>

const RESIZE_LABELS: Record<DashboardResizeDirection, string> = {
  thinner: "W−",
  wider: "W+",
  shorter: "H−",
  taller: "H+",
}

export interface DashboardMiniatureActionsProps {
  widget: WidgetDefinition
  instance: WidgetInstanceState
  hidden: boolean
  locked: boolean
  moveTargets: DashboardMiniMoveTargets
  resizeAvailability: DashboardMiniResizeAvailability
  expanded?: boolean
  onToggleVisibility: () => void
  onToggleCollapse: () => void
  onMove: (direction: DashboardMoveDirection) => void
  onResize: (direction: DashboardResizeDirection) => void
}

export const DashboardMiniatureActions: React.FC<DashboardMiniatureActionsProps> = ({
  widget,
  instance,
  hidden,
  locked,
  moveTargets,
  resizeAvailability,
  expanded = false,
  onToggleVisibility,
  onToggleCollapse,
  onMove,
  onResize,
}) => (
  <div
    className={`dashboard-miniature-actions ${expanded ? "is-expanded" : "is-compact"}`}
    role="group"
    aria-label={`${widget.title} dashboard controls`}
  >
    <button
      type="button"
      className="dashboard-miniature-action is-visibility"
      aria-label={`${hidden ? "Show" : "Hide"} ${widget.title}`}
      aria-pressed={!hidden}
      onClick={onToggleVisibility}
    >
      {hidden ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
      {expanded ? <span>{hidden ? "Show" : "Hide"}</span> : null}
    </button>
    <button
      type="button"
      className="dashboard-miniature-action is-collapse"
      aria-label={`${instance.collapsed ? "Expand" : "Collapse"} ${widget.title}`}
      aria-expanded={!instance.collapsed}
      onClick={onToggleCollapse}
    >
      {instance.collapsed ? <Plus aria-hidden="true" /> : <Minus aria-hidden="true" />}
      {expanded ? <span>{instance.collapsed ? "Expand" : "Collapse"}</span> : null}
    </button>
    {RESIZE_DIRECTIONS.map((direction) => (
      <button
        key={direction}
        type="button"
        className={`dashboard-miniature-action is-resize is-${direction}`}
        aria-label={`${direction[0].toUpperCase()}${direction.slice(1)} ${widget.title}`}
        disabled={locked || !resizeAvailability[direction]}
        onClick={() => onResize(direction)}
      >
        <span aria-hidden="true">{RESIZE_LABELS[direction]}</span>
        {expanded ? <span>{direction}</span> : null}
      </button>
    ))}
    {DIRECTIONS.map((direction) => {
      const Icon = DIRECTION_ICONS[direction]
      const disabled = hidden || locked || !moveTargets[direction]
      return (
        <button
          key={direction}
          type="button"
          className={`dashboard-miniature-action is-direction is-${direction}`}
          aria-label={`Move ${widget.title} ${direction}`}
          disabled={disabled}
          onClick={() => onMove(direction)}
        >
          <Icon aria-hidden="true" />
          {expanded ? <span>{direction}</span> : null}
        </button>
      )
    })}
  </div>
)

export interface DashboardWidgetMiniatureProps extends DashboardMiniatureActionsProps {
  placement: DashboardMiniPlacement
  palette: DashboardSpectrumTokens
  filteredOut?: boolean
  selected?: boolean
  onSelect?: () => void
}

const DashboardWidgetMiniatureComponent: React.FC<DashboardWidgetMiniatureProps> = ({
  widget,
  instance,
  placement,
  palette,
  hidden,
  locked,
  moveTargets,
  resizeAvailability,
  filteredOut = false,
  selected = false,
  onSelect,
  onToggleVisibility,
  onToggleCollapse,
  onMove,
  onResize,
}) => {
  // Icon rail uses a LIGHTENED version of the widget's header color so the
  // miniature reads as one hue instead of picking a second palette tone
  // (which was the old toolbox-UI-2 pattern the user vetoed). Kept as a
  // CSS var so `.dashboard-widget-miniature-icon` in the CSS can consume it.
  const style = {
    "--widget-color": palette.headerColor,
    "--mini-widget-icon-color": `color-mix(in srgb, ${palette.headerColor} 55%, #fff)`,
    "--widget-border": palette.borderColor,
    "--widget-shadow": palette.shadowColor,
    gridColumn: `span ${placement.columnSpan}`,
  } as React.CSSProperties

  return (
    <article
      className="dashboard-widget-miniature"
      style={style}
      data-widget-id={widget.id}
      data-size={instance.size}
      data-height={instance.height}
      data-collapsed={instance.collapsed ? "true" : "false"}
      data-visibility={hidden ? "hidden" : "visible"}
      data-filtered-out={filteredOut ? "true" : "false"}
      data-selected={selected ? "true" : "false"}
      aria-hidden={filteredOut || undefined}
      inert={filteredOut || undefined}
    >
      <button
        type="button"
        className="dashboard-widget-miniature-header"
        aria-label={`Select ${widget.title}`}
        aria-pressed={selected}
        onClick={onSelect}
      >
        <span className="dashboard-widget-miniature-icon" aria-hidden="true">
          <Move />
        </span>
        <span className="dashboard-widget-miniature-title">{widget.title}</span>
      </button>
      <div className="dashboard-widget-miniature-body">
        <span className="dashboard-widget-miniature-meter" aria-hidden="true" />
        <DashboardMiniatureActions
          widget={widget}
          instance={instance}
          hidden={hidden}
          locked={locked}
          moveTargets={moveTargets}
          resizeAvailability={resizeAvailability}
          onToggleVisibility={onToggleVisibility}
          onToggleCollapse={onToggleCollapse}
          onMove={onMove}
          onResize={onResize}
        />
      </div>
    </article>
  )
}

export const DashboardWidgetMiniature = memo(DashboardWidgetMiniatureComponent)
