import React, { useCallback, useMemo, useState } from "react"
import { Eye, EyeOff, LayoutGrid, RotateCcw, Search } from "lucide-react"
import { SubToolbox } from "../../components/Toolbox"
import { SubToolboxGrid, SubToolboxStack } from "../../components/subtoolbox/SubToolboxLayouts"
import {
  SubToolboxAlert,
  SubToolboxButton,
  SubToolboxMetricStrip,
  SubToolboxSettingsSwitch,
  SubToolboxStatePanel,
  SubToolboxStatusBadge,
} from "../../components/subtoolbox/SubToolboxPrimitives"
import {
  SubToolboxSplitDropdown,
  type SubToolboxSplitDropdownOption,
} from "../../components/subtoolbox/SubToolboxSplitPrimitives"
import { StudioSearchInput } from "../../studio-ui"
import {
  buildDefaultDashboardLayout,
  loadDashboardLayout,
  saveDashboardLayout,
} from "../dashboard/storage"
import { DASHBOARD_WIDGET_REGISTRY } from "../dashboard/WidgetRegistry"
import type { DashboardLayoutState } from "../dashboard/types"
import {
  DASHBOARD_WIDGET_SETTINGS_CATEGORIES,
  filterDashboardWidgetSettings,
  getManageableDashboardWidgets,
  summarizeDashboardWidgetVisibility,
  type DashboardWidgetSettingsCategory,
} from "./dashboardWidgetSettingsModel"

export const DashboardWidgetsSettingsSection: React.FC = () => {
  const [layout, setLayout] = useState<DashboardLayoutState>(() => loadDashboardLayout())
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<DashboardWidgetSettingsCategory>("all")

  const hiddenSet = useMemo(() => new Set(layout.hidden), [layout.hidden])

  const commit = useCallback((next: DashboardLayoutState) => {
    saveDashboardLayout(next)
    setLayout(next)
  }, [])

  const setHidden = useCallback(
    (hiddenIds: string[]) => {
      const allowed = new Set(layout.order)
      commit({
        ...layout,
        hidden: layout.order.filter((id) => hiddenIds.includes(id) && allowed.has(id)),
      })
    },
    [commit, layout],
  )

  const toggleWidget = useCallback(
    (widgetId: string) => {
      const next = hiddenSet.has(widgetId)
        ? layout.hidden.filter((id) => id !== widgetId)
        : [...layout.hidden, widgetId]
      setHidden(next)
    },
    [hiddenSet, layout.hidden, setHidden],
  )

  const widgets = useMemo(
    () => getManageableDashboardWidgets(DASHBOARD_WIDGET_REGISTRY),
    [],
  )

  const filtered = useMemo(
    () => filterDashboardWidgetSettings(widgets, category, query),
    [category, query, widgets],
  )

  const summary = useMemo(
    () => summarizeDashboardWidgetVisibility(widgets, layout.hidden),
    [layout.hidden, widgets],
  )

  const categoryOptions: SubToolboxSplitDropdownOption[] =
    DASHBOARD_WIDGET_SETTINGS_CATEGORIES.map((entry) => ({
      value: entry.id,
      label: entry.label,
      icon: <LayoutGrid size={17} />,
    }))

  return (
    <div className="grid gap-3">
      <SubToolbox
        title="Widget Visibility"
        icon={<LayoutGrid />}
        paletteIndex={3}
        collapsible
        isOpenInitial
        persistenceId="settings-dashboard-widget-visibility"
        helpText="Choose which supported and preview widgets appear on the Dashboard. Size and position stay editable on the Dashboard itself."
      >
        <SubToolboxStack density="dense">
          <SubToolboxMetricStrip
            level="l1"
            aria-label="Dashboard widget visibility summary"
            items={[
              { label: "Visible", value: `${summary.visible}/${summary.total}` },
              { label: "Preview", value: summary.preview },
            ]}
          />

          <div className="grid min-w-0 gap-2 md:grid-cols-[minmax(0,1fr)_220px]">
            <div className="relative min-w-0">
              <Search
                size={18}
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2"
              />
              <StudioSearchInput
                sizeVariant="standard"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search widgets…"
                aria-label="Search dashboard widgets"
                style={{ paddingLeft: "42px" }}
              />
            </div>
            <SubToolboxSplitDropdown
              level="l1"
              ariaLabel="Filter widgets by category"
              value={category}
              options={categoryOptions}
              icon={<LayoutGrid size={17} />}
              onChange={(value) => setCategory(value as DashboardWidgetSettingsCategory)}
            />
          </div>

          <SubToolboxGrid minItemWidth="compact" density="dense" aria-label="Widget visibility actions">
            <SubToolboxButton
              level="l2"
              size="compact"
              tone="success"
              icon={<Eye size={15} />}
              onClick={() =>
                setHidden(
                  widgets
                    .filter((widget) => widget.status !== "ready")
                    .map((widget) => widget.id),
                )
              }
            >
              Show ready
            </SubToolboxButton>
            <SubToolboxButton
              level="l2"
              size="compact"
              tone="accent"
              icon={<Eye size={15} />}
              title="Includes preview widgets that are not production-certified"
              onClick={() => setHidden([])}
            >
              Show all
            </SubToolboxButton>
            <SubToolboxButton
              level="l2"
              size="compact"
              tone="neutral"
              icon={<EyeOff size={15} />}
              onClick={() => setHidden(widgets.map((widget) => widget.id))}
            >
              Hide all
            </SubToolboxButton>
            <SubToolboxButton
              level="l2"
              size="compact"
              tone="accent"
              icon={<RotateCcw size={15} />}
              onClick={() => commit(buildDefaultDashboardLayout())}
            >
              Defaults
            </SubToolboxButton>
          </SubToolboxGrid>
        </SubToolboxStack>
      </SubToolbox>

      <SubToolbox
        title={`Widgets · ${filtered.length}`}
        icon={<LayoutGrid />}
        paletteIndex={4}
        collapsible
        isOpenInitial
        persistenceId="settings-dashboard-widget-list"
        helpText="Preview widgets are built but not production-certified, so their data or controls may still be incomplete."
      >
        {filtered.length ? (
          <SubToolboxGrid minItemWidth="wide" density="dense">
            {filtered.map((widget) => {
              const visible = !hiddenSet.has(widget.id)
              return (
                <SubToolboxAlert
                  key={widget.id}
                  level="l1"
                  role="group"
                  aria-label={widget.title}
                  tone={visible ? "info" : "warning"}
                  icon={<span className="size-5" style={{ background: widget.headerColor }} />}
                  title={widget.title}
                  detail={widget.subtitle}
                  action={
                    <span className="flex items-center gap-2">
                      {widget.status !== "ready" ? (
                        <SubToolboxStatusBadge level="l2">Preview</SubToolboxStatusBadge>
                      ) : null}
                      <SubToolboxSettingsSwitch
                        level="l1"
                        pressed={visible}
                        aria-label={`${visible ? "Hide" : "Show"} ${widget.title}`}
                        onClick={() => toggleWidget(widget.id)}
                      />
                    </span>
                  }
                />
              )
            })}
          </SubToolboxGrid>
        ) : (
          <SubToolboxStatePanel
            state="empty"
            message="No widgets match this search and category."
          />
        )}
      </SubToolbox>
    </div>
  )
}

export default DashboardWidgetsSettingsSection
