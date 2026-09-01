import React from "react"
import { Layers, Video, Upload, Activity, Image as ImageIcon, MessageSquare, MessageCircle, Monitor, Rocket, Magnet, WandSparkles, CalendarDays, Bot, RefreshCw, Settings, BookOpen } from "lucide-react"
import { WidgetShell } from "../WidgetShell"
import { WidgetSection, WidgetBadge } from "../WidgetPrimitives"

/**
 * QuickActionsWidget (BETA rebuild)
 *
 * Replaces the inline branch with a clean primitive-driven grid:
 *   - `WidgetShell` header w/ BETA badge
 *   - `WidgetSection` groups for Pages / Tools
 *   - `.vt-button` action tiles — no hardcoded colors, no ad-hoc grids
 *
 * Each tile fires `data.onNavigate(path)` when the source is a Page, and
 * `data.onOpenTool?.(id)` when it's a Tool. Both handlers are optional so
 * the widget stays intact when a consumer passes a slim data object.
 */

const ICON_MAP: Record<string, React.ComponentType<{ size?: number }>> = {
  Video, Upload, Activity, Image: ImageIcon, MessageSquare, MessageCircle,
  Monitor, Rocket, Magnet, WandSparkles, Layers, CalendarDays, Bot,
  RefreshCw, Settings, BookOpen,
}

type QuickAction = {
  id?: string
  label?: string
  icon?: string
  path?: string
  isTool?: boolean
}

export const QuickActionsWidget: React.FC<any> = ({ data, ...props }) => {
  const common = { ...props, canEdit: true }
  const actions: QuickAction[] = Array.isArray(data?.quickActions) ? data.quickActions : []
  const pages = actions.filter((a) => !a.isTool)
  const tools = actions.filter((a) => a.isTool)

  const renderTile = (action: QuickAction, key: string) => {
    const Icon = ICON_MAP[action.icon || ""] || Layers
    const label = action.label || action.id || "Action"
    return (
      <button
        key={key}
        type="button"
        className="vt-button quick-action-tile"
        onClick={() => {
          if (action.isTool) data?.onOpenTool?.(action.id)
          else data?.onNavigate?.(action.path || "/")
        }}
      >
        <Icon size={14} />
        <span>{label}</span>
      </button>
    )
  }

  return (
    <WidgetShell
      {...common}
      icon={<Layers size={22} />}
      headerContent={<WidgetBadge slot={5}>BETA</WidgetBadge>}
    >
      <div className="widget-workspace quick-actions-workspace">
        {pages.length > 0 && (
          <WidgetSection surface="subtle">
            <div className="quick-actions-section-head">Pages</div>
            <div className="quick-actions-grid">
              {pages.map((a, i) => renderTile(a, `p-${i}`))}
            </div>
          </WidgetSection>
        )}
        {tools.length > 0 && (
          <WidgetSection surface="subtle">
            <div className="quick-actions-section-head">Tools</div>
            <div className="quick-actions-grid">
              {tools.map((a, i) => renderTile(a, `t-${i}`))}
            </div>
          </WidgetSection>
        )}
        {actions.length === 0 && (
          <div className="quick-actions-empty">
            No quick actions registered yet. Add them to <code>data.quickActions</code>.
          </div>
        )}
      </div>
    </WidgetShell>
  )
}
