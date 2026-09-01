import React, { useMemo, useState } from "react"
import {
  Sliders,
  Edit3,
  Lock,
  LockOpen,
  Layers,
  RotateCcw,
  Download,
  Upload,
  Search,
  Eye,
  EyeOff,
  Sparkles,
  BarChart3,
  Video,
  Brain,
  LayoutGrid,
  Zap,
} from "lucide-react"
import { WidgetShell } from "../WidgetShell"
import {
  WidgetHeaderToggle,
  WidgetScrollArea,
  WidgetSection,
} from "../WidgetPrimitives"
import { useDashboard } from "../../../context/DashboardContext"
import { DASHBOARD_WIDGET_BY_ID, DASHBOARD_WIDGET_REGISTRY } from "../WidgetRegistry"
import type { CommonWidgetProps, DashboardWidgetCategory, WidgetDefinition } from "../types"
import {
  DashboardMiniatureActions,
  DashboardWidgetMiniature,
  type DashboardMiniMoveTargets,
  type DashboardMiniResizeAvailability,
} from "../DashboardWidgetMiniature"
import {
  buildDashboardMiniLayout,
  canResizeDashboardWidget,
  getDashboardMoveTarget,
  type DashboardMiniPlacement,
  type DashboardMoveDirection,
  type DashboardResizeDirection,
} from "../dashboardMiniLayout"
import { resolveDashboardSpectrum, resolveVisibleWidgetSpectrum } from "../spectrum"

type ControlSection = "layout" | "widgets" | "presets"

const CATEGORIES: Array<{ id: "all" | DashboardWidgetCategory; label: string }> = [
  { id: "all", label: "All" },
  { id: "core", label: "Core" },
  { id: "analytics", label: "Analytics" },
  { id: "ai", label: "AI" },
  { id: "creation", label: "Creation" },
  { id: "community", label: "Community" },
  { id: "system", label: "System" },
]

/**
 * Six preset layouts: 3 "default" balanced flavors + 3 "unique" specialty
 * arrangements. Every preset ends with `dashboard-controls` so the user
 * always has the layout hub visible after switching.
 */
const PRESET_DEFINITIONS = [
  // ── 3 default flavors ─────────────────────────────────────────────
  {
    id: "default-standard",
    title: "Standard",
    description: "Balanced daily creator suite — overview, creation, analytics, community",
    icon: Sparkles,
    color: "#FA618A",
    tone: "default" as const,
    count: 18,
  },
  {
    id: "default-analytics",
    title: "Analytics-first",
    description: "KPI + traffic + retention up top, creation tools below",
    icon: BarChart3,
    color: "#40C6E9",
    tone: "default" as const,
    count: 17,
  },
  {
    id: "default-creator",
    title: "Creator-first",
    description: "Script + image + video + community leads; analytics as reference",
    icon: Video,
    color: "#579AFF",
    tone: "default" as const,
    count: 17,
  },
  // ── 3 unique specialty layouts ────────────────────────────────────
  {
    id: "unique-command",
    title: "Command Center",
    description: "Daily Command Center + Opportunity Desk + Idea Portfolio front and center",
    icon: Brain,
    color: "#7A2BFF",
    tone: "unique" as const,
    count: 12,
  },
  {
    id: "unique-minimal",
    title: "Minimal",
    description: "Only the essentials — KPI, Oracle, Quick Actions, Controls",
    icon: Zap,
    color: "#4FFF5B",
    tone: "unique" as const,
    count: 5,
  },
  {
    id: "unique-atlas",
    title: "Atlas",
    description: "Every registered widget active — full observability",
    icon: LayoutGrid,
    color: "#FFE357",
    tone: "unique" as const,
    count: 58,
  },
]

export const DashboardControlWidget: React.FC<CommonWidgetProps> = ({
  widget,
  instance,
  editMode: instanceEditMode,
  onToggleCollapse,
  onCycleSize,
  onCycleHeight,
  onDecSize,
  onDecHeight,
  onRemove,
}) => {
  const common = {
    widget,
    instance,
    editMode: instanceEditMode,
    canEdit: true,
    onToggleCollapse,
    onCycleSize,
    onCycleHeight,
    onRemove,
    onDecSize,
    onDecHeight,
  }

  const {
    editMode,
    setEditMode,
    isLocked,
    toggleLock,
    setPickerOpen,
    exportLayout,
    importLayout,
    resetLayout,
    toggleWidget,
    toggleWidgetCollapse,
    moveWidget,
    resizeWidget,
    showAllWidgets,
    hideAllWidgets,
    applyPreset,
    getLayout,
  } = useDashboard()

  const [activeSection, setActiveSection] = useState<ControlSection>("layout")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<"all" | DashboardWidgetCategory>("all")
  const [resetConfirm, setResetConfirm] = useState(false)
  const [appliedPreset, setAppliedPreset] = useState<string | null>(null)
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null)
  const [layoutAnnouncement, setLayoutAnnouncement] = useState("")

  const layout = getLayout()
  const hiddenSet = useMemo(() => new Set(layout.hidden || []), [layout.hidden])
  const totalWidgets = DASHBOARD_WIDGET_REGISTRY.length
  const activeCount = totalWidgets - hiddenSet.size

  const filteredWidgets = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return DASHBOARD_WIDGET_REGISTRY.filter((w: WidgetDefinition) => {
      if (w.releaseTier === "hidden") return false
      if (selectedCategory !== "all" && w.category !== selectedCategory) return false
      if (query && !`${w.title} ${w.subtitle} ${w.category}`.toLowerCase().includes(query)) {
        return false
      }
      return true
    }).sort((a: WidgetDefinition, b: WidgetDefinition) => a.defaultOrder - b.defaultOrder)
  }, [searchQuery, selectedCategory])

  const matchingWidgetIds = useMemo(
    () => new Set(filteredWidgets.map((widget) => widget.id)),
    [filteredWidgets],
  )
  const visibleGeometry = useMemo(() => buildDashboardMiniLayout(layout), [layout])
  const hiddenWidgetIds = useMemo(
    () => layout.order.filter((id) => {
      const widget = DASHBOARD_WIDGET_BY_ID[id]
      return hiddenSet.has(id) && widget?.releaseTier !== "hidden"
    }),
    [hiddenSet, layout.order],
  )
  const hiddenGeometry = useMemo(() => buildDashboardMiniLayout({
    ...layout,
    order: hiddenWidgetIds,
    hidden: [],
  }), [hiddenWidgetIds, layout])
  const spectrumByWidgetId = useMemo(
    () => resolveVisibleWidgetSpectrum(layout.order, hiddenSet),
    [hiddenSet, layout.order],
  )
  const moveTargetsByWidgetId = useMemo(() => Object.fromEntries(
    visibleGeometry.placements.map(({ widgetId }) => [widgetId, {
      up: getDashboardMoveTarget(layout, widgetId, "up"),
      right: getDashboardMoveTarget(layout, widgetId, "right"),
      left: getDashboardMoveTarget(layout, widgetId, "left"),
      down: getDashboardMoveTarget(layout, widgetId, "down"),
    } satisfies DashboardMiniMoveTargets]),
  ) as Record<string, DashboardMiniMoveTargets>, [layout, visibleGeometry.placements])

  const emptyMoveTargets: DashboardMiniMoveTargets = {
    up: null,
    right: null,
    left: null,
    down: null,
  }

  const getResizeAvailability = (
    widgetId: string,
    instance: CommonWidgetProps["instance"],
  ): DashboardMiniResizeAvailability => ({
    wider: canResizeDashboardWidget(widgetId, instance, "wider"),
    thinner: canResizeDashboardWidget(widgetId, instance, "thinner"),
    taller: canResizeDashboardWidget(widgetId, instance, "taller"),
    shorter: canResizeDashboardWidget(widgetId, instance, "shorter"),
  })

  const announceVisibility = (widget: WidgetDefinition, hidden: boolean) => {
    toggleWidget(widget.id)
    setLayoutAnnouncement(`${widget.title} ${hidden ? "shown" : "hidden"}.`)
  }

  const announceCollapse = (widget: WidgetDefinition, collapsed: boolean) => {
    toggleWidgetCollapse(widget.id)
    setLayoutAnnouncement(`${widget.title} ${collapsed ? "expanded" : "collapsed"}.`)
  }

  const announceMove = (
    widget: WidgetDefinition,
    direction: DashboardMoveDirection,
    targets: DashboardMiniMoveTargets,
  ) => {
    const targetId = targets[direction]
    if (!targetId) return
    moveWidget(widget.id, direction)
    const targetTitle = DASHBOARD_WIDGET_BY_ID[targetId]?.title
    setLayoutAnnouncement(`${widget.title} moved ${direction}${targetTitle ? ` near ${targetTitle}` : ""}.`)
  }

  const announceResize = (
    widget: WidgetDefinition,
    direction: DashboardResizeDirection,
  ) => {
    resizeWidget(widget.id, direction)
    setLayoutAnnouncement(`${widget.title} is now ${direction}.`)
  }

  const renderMiniature = (
    placement: DashboardMiniPlacement,
    hidden: boolean,
    palettePosition: number,
  ) => {
    const widget = DASHBOARD_WIDGET_BY_ID[placement.widgetId]
    const instance = layout.instances[placement.widgetId]
    if (!widget || !instance) return null
    const palette = hidden
      ? resolveDashboardSpectrum(palettePosition)
      : spectrumByWidgetId[widget.id] || resolveDashboardSpectrum(palettePosition)
    const moveTargets = hidden ? emptyMoveTargets : moveTargetsByWidgetId[widget.id] || emptyMoveTargets
    const resizeAvailability = getResizeAvailability(widget.id, instance)

    return (
      <DashboardWidgetMiniature
        key={widget.id}
        widget={widget}
        instance={instance}
        placement={placement}
        palette={palette}
        hidden={hidden}
        locked={layout.locked}
        moveTargets={moveTargets}
        resizeAvailability={resizeAvailability}
        filteredOut={!matchingWidgetIds.has(widget.id)}
        selected={selectedWidgetId === widget.id}
        onSelect={() => setSelectedWidgetId(widget.id)}
        onToggleVisibility={() => announceVisibility(widget, hidden)}
        onToggleCollapse={() => announceCollapse(widget, instance.collapsed)}
        onMove={(direction) => announceMove(widget, direction, moveTargets)}
        onResize={(direction) => announceResize(widget, direction)}
      />
    )
  }

  const selectedWidget = selectedWidgetId
    ? DASHBOARD_WIDGET_BY_ID[selectedWidgetId]
    : undefined
  const selectedInstance = selectedWidget ? layout.instances[selectedWidget.id] : undefined
  const selectedHidden = selectedWidget ? hiddenSet.has(selectedWidget.id) : false
  const selectedTargets = selectedWidget && !selectedHidden
    ? moveTargetsByWidgetId[selectedWidget.id] || emptyMoveTargets
    : emptyMoveTargets
  const selectedResizeAvailability = selectedWidget && selectedInstance
    ? getResizeAvailability(selectedWidget.id, selectedInstance)
    : { wider: false, thinner: false, taller: false, shorter: false }
  const selectedPalette = selectedWidget
    ? spectrumByWidgetId[selectedWidget.id] || resolveDashboardSpectrum(visibleGeometry.placements.length)
    : undefined

  const handleApplyPresetClick = (presetId: string) => {
    applyPreset(presetId)
    setAppliedPreset(presetId)
    setTimeout(() => setAppliedPreset(null), 2500)
  }

  const handleResetClick = () => {
    if (!resetConfirm) {
      setResetConfirm(true)
      setTimeout(() => setResetConfirm(false), 4000)
      return
    }
    resetLayout()
    setResetConfirm(false)
  }

  return (
    <WidgetShell
      {...common}
      icon={<Sliders size={22} />}
      headerContent={
        <WidgetHeaderToggle
          label="Dashboard Controls"
          value={activeSection}
          items={[
            { id: "layout", label: "Layout" },
            { id: "widgets", label: "Widgets" },
            { id: "presets", label: "Presets" },
          ]}
          onChange={(val) => setActiveSection(val as ControlSection)}
        />
      }
    >
      <WidgetScrollArea
        ariaLabel="Dashboard Control Center"
        contentClassName="flex min-h-full flex-col gap-3 p-1"
      >
        {/* ═════════════════════════════════════════════════════════ */}
        {/* TAB 1: LAYOUT & GENERAL CONTROLS                          */}
        {/* ═════════════════════════════════════════════════════════ */}
        {activeSection === "layout" && (
          <div className="flex flex-col gap-3">
            {/* Primary Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Rearrange Mode Toggle */}
              <div className="flex flex-col justify-between widget-control-card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 font-black text-[11px] uppercase tracking-wider">
                    <Edit3 size={14} className="text-[#FF1744]" />
                    <span>Rearrange Mode</span>
                  </div>
                  <span
                    className={`widget-control-pill ${
                      editMode ? "bg-[#C9F830] text-black" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {editMode ? "Active" : "Locked"}
                  </span>
                </div>
                <p className="text-[10px] font-bold text-gray-600 mb-2 leading-tight">
                  Drag widgets, change width & height, or resize slots on the canvas.
                </p>
                <button
                  type="button"
                  onClick={() => setEditMode((prev) => !prev)}
                  className={`vt-button w-full text-[10px] font-black uppercase ${
                    editMode ? "bg-[#C9F830]" : "primary"
                  }`}
                >
                  {editMode ? "Done (Exit Edit Mode)" : "Rearrange Widgets"}
                </button>
              </div>

              {/* Lock Layout Toggle */}
              <div className="flex flex-col justify-between widget-control-card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 font-black text-[11px] uppercase tracking-wider">
                    {isLocked ? <Lock size={14} className="text-[#FA618A]" /> : <LockOpen size={14} className="text-[#40C6E9]" />}
                    <span>Layout Lock</span>
                  </div>
                  <span
                    className={`widget-control-pill ${
                      isLocked ? "bg-[#FF1744] text-white" : "bg-[#4FFF5B] text-black"
                    }`}
                  >
                    {isLocked ? "Locked" : "Unlocked"}
                  </span>
                </div>
                <p className="text-[10px] font-bold text-gray-600 mb-2 leading-tight">
                  Prevent accidental dragging or resizing of widgets.
                </p>
                <button
                  type="button"
                  onClick={toggleLock}
                  className="vt-button w-full text-[10px] font-black uppercase"
                >
                  {isLocked ? "Unlock Layout" : "Lock Layout"}
                </button>
              </div>
            </div>

            {/* Quick Actions Strip */}
            <WidgetSection edge="full" className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider">
                  Layout Management
                </span>
                <span className="text-[9px] font-extrabold uppercase opacity-60">
                  {activeCount} of {totalWidgets} Active
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="vt-button flex items-center justify-center gap-1.5 text-[10px] font-black uppercase bg-[#C9F830]"
                >
                  <Layers size={13} />
                  <span>Add Widgets</span>
                </button>

                <button
                  type="button"
                  onClick={exportLayout}
                  className="vt-button flex items-center justify-center gap-1.5 text-[10px] font-black uppercase"
                  title="Download JSON layout backup"
                >
                  <Download size={13} />
                  <span>Export JSON</span>
                </button>

                <button
                  type="button"
                  onClick={importLayout}
                  className="vt-button flex items-center justify-center gap-1.5 text-[10px] font-black uppercase"
                  title="Upload JSON layout file"
                >
                  <Upload size={13} />
                  <span>Import JSON</span>
                </button>
              </div>
            </WidgetSection>

            {/* Reset Layout Section */}
            <div className="p-2.5 bg-[#FFF0F2] border-[2px] border-[#FF1744] rounded-lg flex items-center justify-between gap-2">
              <div>
                <strong className="block text-[11px] font-black uppercase text-[#FF1744]">
                  Reset to Factory Layout
                </strong>
                <span className="text-[9px] font-bold text-gray-700">
                  Restores original 14 signature widgets and default positions.
                </span>
              </div>
              <button
                type="button"
                onClick={handleResetClick}
                className={`vt-button shrink-0 text-[10px] font-black uppercase ${
                  resetConfirm ? "bg-[#FF1744] text-white" : ""
                }`}
              >
                <RotateCcw size={12} className="inline mr-1" />
                {resetConfirm ? "Confirm Reset?" : "Reset Layout"}
              </button>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════ */}
        {/* TAB 2: WIDGET SELECTION & TOGGLES                         */}
        {/* ═════════════════════════════════════════════════════════ */}
        {activeSection === "widgets" && (
          <div className="flex flex-col gap-2.5">
            {/* Search & Category Filter */}
            <div className="flex flex-col gap-1.5">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-50" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search all ${totalWidgets} widgets...`}
                  className="vt-input w-full pl-8 text-[11px]"
                />
              </div>

              {/* Category Pills & Bulk Actions */}
              <div className="flex items-center justify-between gap-1 flex-wrap">
                <div className="flex items-center gap-1 flex-wrap">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`widget-control-tab ${
                        selectedCategory === cat.id
                          ? "is-active"
                          : "bg-white text-black hover:bg-gray-100"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={showAllWidgets}
                    className="widget-control-mini-btn is-primary"
                    title="Show all widgets"
                  >
                    <Eye size={10} className="inline mr-0.5" /> All
                  </button>
                  <button
                    type="button"
                    onClick={hideAllWidgets}
                    className="widget-control-mini-btn"
                    title="Hide non-essential widgets"
                  >
                    <EyeOff size={10} className="inline mr-0.5" /> Clear
                  </button>
                </div>
              </div>
            </div>

            {filteredWidgets.length === 0 ? (
              <div className="dashboard-miniature-empty">
                No widgets found matching "{searchQuery}"
              </div>
            ) : (
              <div className="dashboard-miniature-workspace">
                <section className="dashboard-miniature-section" aria-labelledby="dashboard-miniature-visible-title">
                  <header className="dashboard-miniature-section-header">
                    <h3 id="dashboard-miniature-visible-title">Current Dashboard</h3>
                    <span>{visibleGeometry.placements.length} visible</span>
                  </header>
                  <div className="dashboard-miniature-grid" aria-label="Current dashboard miniature layout">
                    {visibleGeometry.placements.map((placement, index) =>
                      renderMiniature(placement, false, index))}
                  </div>
                </section>

                <section className="dashboard-miniature-section is-hidden-shelf" aria-labelledby="dashboard-miniature-hidden-title">
                  <header className="dashboard-miniature-section-header">
                    <h3 id="dashboard-miniature-hidden-title">Hidden Widgets</h3>
                    <span>{hiddenGeometry.placements.length} hidden</span>
                  </header>
                  {hiddenGeometry.placements.length ? (
                    <div className="dashboard-miniature-grid" aria-label="Hidden dashboard widgets">
                      {hiddenGeometry.placements.map((placement, index) =>
                        renderMiniature(placement, true, visibleGeometry.placements.length + index))}
                    </div>
                  ) : (
                    <p className="dashboard-miniature-shelf-empty">All available widgets are visible.</p>
                  )}
                </section>

                {selectedWidget && selectedInstance && selectedPalette ? (
                  <section
                    className="dashboard-miniature-selected-controls"
                    aria-label={`Selected widget controls for ${selectedWidget.title}`}
                    style={{
                      "--widget-color": selectedPalette.headerColor,
                      "--widget-border": selectedPalette.borderColor,
                      "--widget-shadow": selectedPalette.shadowColor,
                    } as React.CSSProperties}
                  >
                    <strong>{selectedWidget.title}</strong>
                    <DashboardMiniatureActions
                      widget={selectedWidget}
                      instance={selectedInstance}
                      hidden={selectedHidden}
                      locked={layout.locked}
                      moveTargets={selectedTargets}
                      resizeAvailability={selectedResizeAvailability}
                      expanded
                      onToggleVisibility={() => announceVisibility(selectedWidget, selectedHidden)}
                      onToggleCollapse={() => announceCollapse(selectedWidget, selectedInstance.collapsed)}
                      onMove={(direction) => announceMove(selectedWidget, direction, selectedTargets)}
                      onResize={(direction) => announceResize(selectedWidget, direction)}
                    />
                  </section>
                ) : null}
              </div>
            )}

            <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
              {layoutAnnouncement}
            </span>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════ */}
        {/* TAB 3: PRESET LAYOUTS                                     */}
        {/* ═════════════════════════════════════════════════════════ */}
        {activeSection === "presets" && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider">
                Select Layout Preset
              </span>
              {appliedPreset && (
                <span className="widget-control-live-tag">
                  Applied!
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_DEFINITIONS.map((preset) => {
                const IconComponent = preset.icon
                return (
                  <div
                    key={preset.id}
                    className="flex flex-col justify-between widget-control-card"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 font-black text-[11px] uppercase tracking-wide">
                          <IconComponent size={14} style={{ color: preset.color }} />
                          <span>{preset.title}</span>
                        </div>
                        <span className="widget-control-tag">
                          {preset.count} Widgets
                        </span>
                      </div>
                      <p className="text-[9px] font-bold text-gray-600 mb-2 leading-snug">
                        {preset.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleApplyPresetClick(preset.id)}
                      className="vt-button w-full text-[9px] font-black uppercase"
                      style={{ backgroundColor: preset.color }}
                    >
                      Apply {preset.title}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </WidgetScrollArea>
    </WidgetShell>
  )
}
