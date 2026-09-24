import React, { useCallback, useMemo, useState } from "react"
import { Eye, EyeOff, LayoutGrid, RotateCcw, Search } from "lucide-react"
import { SubToolbox } from "../../components/Toolbox"
import { SubToolboxActions, SubToolboxGrid, SubToolboxStack } from "../../components/subtoolbox/SubToolboxLayouts"
import {
  SubToolboxAlert,
  SubToolboxButton,
  SubToolboxInput,
  SubToolboxSelect,
  SubToolboxSettingsSwitch,
  SubToolboxStatusBadge,
} from "../../components/subtoolbox/SubToolboxPrimitives"
import {
  buildDefaultDashboardLayout,
  loadDashboardLayout,
  saveDashboardLayout,
} from "../dashboard/storage"
import { DASHBOARD_WIDGET_REGISTRY } from "../dashboard/WidgetRegistry"
import type { DashboardLayoutState, DashboardWidgetCategory } from "../dashboard/types"

const CATEGORIES: Array<{ id: "all" | DashboardWidgetCategory; label: string }> = [
  { id: "all", label: "All categories" },
  { id: "core", label: "Core" },
  { id: "analytics", label: "Analytics" },
  { id: "ai", label: "AI" },
  { id: "creation", label: "Creation" },
  { id: "community", label: "Community" },
  { id: "system", label: "System" },
]

export const DashboardWidgetsSettingsSection: React.FC = () => {
  const [layout, setLayout] = useState<DashboardLayoutState>(() => loadDashboardLayout())
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<"all" | DashboardWidgetCategory>("all")
  const hiddenSet = useMemo(() => new Set(layout.hidden), [layout.hidden])

  const commit = useCallback((next: DashboardLayoutState) => {
    saveDashboardLayout(next)
    setLayout(next)
  }, [])

  const setHidden = useCallback((hiddenIds: string[]) => {
    const allowed = new Set(layout.order)
    commit({ ...layout, hidden: layout.order.filter((id) => hiddenIds.includes(id) && allowed.has(id)) })
  }, [commit, layout])

  const toggleWidget = useCallback((widgetId: string) => {
    const next = hiddenSet.has(widgetId)
      ? layout.hidden.filter((id) => id !== widgetId)
      : [...layout.hidden, widgetId]
    setHidden(next)
  }, [hiddenSet, layout.hidden, setHidden])

  const widgets = useMemo(
    () => [...DASHBOARD_WIDGET_REGISTRY]
      .filter((widget) => widget.releaseTier !== "hidden")
      .sort((left, right) => left.defaultOrder - right.defaultOrder),
    [],
  )

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return widgets
      .filter((widget) => category === "all" || widget.category === category)
      .filter((widget) => !needle || `${widget.title} ${widget.subtitle} ${widget.category}`.toLowerCase().includes(needle))
  }, [category, query, widgets])

  const visibleCount = widgets.length - hiddenSet.size
  const previewCount = widgets.filter((widget) => widget.status !== "ready").length

  return (
    <div className="grid gap-3">
      <SubToolbox
        title="Widget Visibility"
        icon={<LayoutGrid />}
        paletteIndex={3}
        persistenceId="settings-dashboard-widgets"
        helpText="Manage which production and preview widgets appear on the Dashboard."
      >
        <SubToolboxStack density="dense">
          <SubToolboxAlert
            level="l1"
            tone="info"
            icon={<LayoutGrid size={20} />}
            title={`${visibleCount} of ${widgets.length} visible`}
            detail={previewCount ? `${previewCount} preview widget${previewCount === 1 ? "" : "s"} available` : "All widgets are production ready"}
            action={<SubToolboxStatusBadge level="l2">{filtered.length} shown</SubToolboxStatusBadge>}
          />

          <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_220px]">
            <SubToolboxInput
              level="l1"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search widgets…"
              aria-label="Search widgets"
            />
            <SubToolboxSelect
              value={category}
              aria-label="Filter widget category"
              onChange={(event) => setCategory(event.target.value as "all" | DashboardWidgetCategory)}
            >
              {CATEGORIES.map((entry) => <option key={entry.id} value={entry.id}>{entry.label}</option>)}
            </SubToolboxSelect>
          </div>

          <SubToolboxActions columns={4}>
            <SubToolboxButton level="l1" size="compact" icon={<Eye size={17} />} onClick={() => setHidden(widgets.filter((widget) => widget.status !== "ready").map((widget) => widget.id))}>
              Ready
            </SubToolboxButton>
            <SubToolboxButton level="l1" size="compact" tone="neutral" icon={<Eye size={17} />} onClick={() => setHidden([])}>
              All + previews
            </SubToolboxButton>
            <SubToolboxButton level="l1" size="compact" tone="neutral" icon={<EyeOff size={17} />} onClick={() => setHidden(widgets.map((widget) => widget.id))}>
              Hide all
            </SubToolboxButton>
            <SubToolboxButton level="l1" size="compact" icon={<RotateCcw size={17} />} onClick={() => commit(buildDefaultDashboardLayout())}>
              Defaults
            </SubToolboxButton>
          </SubToolboxActions>
        </SubToolboxStack>
      </SubToolbox>

      <SubToolbox
        title="Dashboard Modules"
        icon={<Search />}
        paletteIndex={4}
        persistenceId="settings-dashboard-widget-list"
        helpText="Each row is one widget. Changes save immediately."
      >
        {filtered.length ? (
          <SubToolboxGrid minItemWidth="standard" density="dense">
            {filtered.map((widget) => {
              const isVisible = !hiddenSet.has(widget.id)
              return (
                <SubToolboxAlert
                  key={widget.id}
                  level="l1"
                  tone={isVisible ? "info" : "warning"}
                  icon={<span className="block size-5" style={{ background: widget.headerColor }} />}
                  title={
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="truncate">{widget.title}</span>
                      {widget.status !== "ready" ? <SubToolboxStatusBadge level="l2">Preview</SubToolboxStatusBadge> : null}
                    </span>
                  }
                  detail={widget.subtitle}
                  action={
                    <SubToolboxSettingsSwitch
                      level="l1"
                      pressed={isVisible}
                      aria-label={`${isVisible ? "Hide" : "Show"} ${widget.title}`}
                      onClick={() => toggleWidget(widget.id)}
                    />
                  }
                />
              )
            })}
          </SubToolboxGrid>
        ) : (
          <SubToolboxAlert
            level="l1"
            tone="warning"
            icon={<Search size={20} />}
            title="No matching widgets"
            detail="Change the search or category filter."
          />
        )}
      </SubToolbox>
    </div>
  )
}

export default DashboardWidgetsSettingsSection
