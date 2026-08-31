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
  Check,
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
import { DASHBOARD_WIDGET_REGISTRY } from "../WidgetRegistry"
import type { DashboardWidgetCategory, WidgetDefinition } from "../types"

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

const PRESET_DEFINITIONS = [
  {
    id: "default",
    title: "Default Signature",
    description: "Standard balanced ViewTube suite for daily creator workflow",
    icon: Sparkles,
    color: "#FA618A",
    count: 18,
  },
  {
    id: "analytics",
    title: "Analytics Master",
    description: "Deep statistical metrics, graphs, audience retention & traffic",
    icon: BarChart3,
    color: "#40C6E9",
    count: 15,
  },
  {
    id: "studio",
    title: "Creation & Studio",
    description: "Script writing, thumbnail generation, publishing & video editing",
    icon: Video,
    color: "#579AFF",
    count: 12,
  },
  {
    id: "oracle",
    title: "AI & Intelligence",
    description: "Daily Oracle strategy, Brain OS loop, AI journal & recommendations",
    icon: Brain,
    color: "#7A2BFF",
    count: 11,
  },
  {
    id: "full",
    title: "Full Studio Suite",
    description: "All 40 signature ViewTube dashboard widgets active simultaneously",
    icon: LayoutGrid,
    color: "#FFE357",
    count: 40,
  },
  {
    id: "minimal",
    title: "Minimal Focus",
    description: "Core metrics and Daily Command Center with maximum speed",
    icon: Zap,
    color: "#4FFF5B",
    count: 4,
  },
]

export const DashboardControlWidget = ({
  widget,
  instance,
  editMode: instanceEditMode,
  onToggleCollapse,
  onCycleSize,
  onCycleHeight,
  onDecSize,
  onDecHeight,
  onRemove,
}: any) => {
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
              <div className="flex flex-col justify-between p-2.5 bg-white border-[2px] border-black rounded-lg shadow-[2px_2px_0_0_#000]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 font-black text-[11px] uppercase tracking-wider">
                    <Edit3 size={14} className="text-[#FF1744]" />
                    <span>Rearrange Mode</span>
                  </div>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase border border-black ${
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
              <div className="flex flex-col justify-between p-2.5 bg-white border-[2px] border-black rounded-lg shadow-[2px_2px_0_0_#000]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 font-black text-[11px] uppercase tracking-wider">
                    {isLocked ? <Lock size={14} className="text-[#FA618A]" /> : <LockOpen size={14} className="text-[#40C6E9]" />}
                    <span>Layout Lock</span>
                  </div>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase border border-black ${
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
                  placeholder="Search all 40 widgets..."
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
                      className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border border-black transition-colors ${
                        selectedCategory === cat.id
                          ? "bg-black text-white"
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
                    className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-[#4FFF5B] border border-black hover:opacity-80"
                    title="Show all widgets"
                  >
                    <Eye size={10} className="inline mr-0.5" /> All
                  </button>
                  <button
                    type="button"
                    onClick={hideAllWidgets}
                    className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-gray-200 border border-black hover:opacity-80"
                    title="Hide non-essential widgets"
                  >
                    <EyeOff size={10} className="inline mr-0.5" /> Clear
                  </button>
                </div>
              </div>
            </div>

            {/* Widgets List */}
            <div className="flex flex-col gap-1 pr-0.5">
              {filteredWidgets.map((w: WidgetDefinition) => {
                const isVisible = !hiddenSet.has(w.id)
                return (
                  <div
                    key={w.id}
                    onClick={() => toggleWidget(w.id)}
                    className={`flex items-center justify-between p-2 rounded-lg border-[2px] border-black cursor-pointer transition-all ${
                      isVisible
                        ? "bg-white shadow-[2px_2px_0_0_#000]"
                        : "bg-gray-100 opacity-60 hover:opacity-90"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center border border-black shrink-0 ${
                          isVisible ? "bg-[#C9F830]" : "bg-white"
                        }`}
                      >
                        {isVisible && <Check size={12} strokeWidth={3} />}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-black text-[11px] uppercase tracking-wide truncate">
                          {w.title}
                        </span>
                        <span className="text-[9px] font-bold text-gray-500 truncate">
                          {w.subtitle}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-gray-200 border border-black">
                        {w.category}
                      </span>
                      <span className="text-[8px] font-extrabold uppercase opacity-50">
                        {w.defaultSize}
                      </span>
                    </div>
                  </div>
                )
              })}

              {filteredWidgets.length === 0 && (
                <div className="p-4 text-center text-[11px] font-bold text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  No widgets found matching "{searchQuery}"
                </div>
              )}
            </div>
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
                <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-[#4FFF5B] border border-black animate-pulse">
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
                    className="flex flex-col justify-between p-2.5 bg-white border-[2px] border-black rounded-lg shadow-[2px_2px_0_0_#000] hover:shadow-[3px_3px_0_0_#000] transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 font-black text-[11px] uppercase tracking-wide">
                          <IconComponent size={14} style={{ color: preset.color }} />
                          <span>{preset.title}</span>
                        </div>
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-gray-100 border border-black">
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
