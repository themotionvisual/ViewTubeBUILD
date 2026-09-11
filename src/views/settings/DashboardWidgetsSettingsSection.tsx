import React, { useCallback, useMemo, useState } from "react"
import { Eye, EyeOff, LayoutGrid, RotateCcw, Search } from "lucide-react"
import {
  buildDefaultDashboardLayout,
  loadDashboardLayout,
  saveDashboardLayout,
} from "../dashboard/storage"
import { DASHBOARD_WIDGET_REGISTRY } from "../dashboard/WidgetRegistry"
import type { DashboardLayoutState, DashboardWidgetCategory } from "../dashboard/types"

const CATEGORIES: Array<{ id: "all" | DashboardWidgetCategory; label: string }> = [
  { id: "all", label: "All" },
  { id: "core", label: "Core" },
  { id: "analytics", label: "Analytics" },
  { id: "ai", label: "AI" },
  { id: "creation", label: "Creation" },
  { id: "community", label: "Community" },
  { id: "system", label: "System" },
]

const buttonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border-[3px] border-black px-4 py-3 text-xs font-black uppercase tracking-[0.08em] shadow-[3px_3px_0_0_#000] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_#000] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2"

export const DashboardWidgetsSettingsSection: React.FC = () => {
  const [layout, setLayout] = useState<DashboardLayoutState>(() => loadDashboardLayout())
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<"all" | DashboardWidgetCategory>("all")

  const hiddenSet = useMemo(() => new Set(layout.hidden), [layout.hidden])

  const commit = useCallback((next: DashboardLayoutState) => {
    saveDashboardLayout(next)
    setLayout(next)
  }, [])

  const setHidden = useCallback(
    (hiddenIds: string[]) => {
      const allowed = new Set(layout.order)
      commit({ ...layout, hidden: layout.order.filter((id) => hiddenIds.includes(id) && allowed.has(id)) })
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
    () =>
      [...DASHBOARD_WIDGET_REGISTRY]
        .filter((widget) => widget.releaseTier !== "hidden")
        .sort((left, right) => left.defaultOrder - right.defaultOrder),
    [],
  )

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return widgets
      .filter((widget) => category === "all" || widget.category === category)
      .filter(
        (widget) =>
          !needle ||
          `${widget.title} ${widget.subtitle} ${widget.category}`.toLowerCase().includes(needle),
      )
  }, [category, query, widgets])

  const visibleCount = widgets.length - hiddenSet.size
  // Two widgets ship as `prototype`: coded, but not certified for production
  // data and interaction. They are shown here so the list is honest about what
  // "Show all" reveals, rather than silently mixing them in with finished ones.
  const previewCount = widgets.filter((widget) => widget.status !== "ready").length

  return (
    <section className="grid gap-5">
      <div className="rounded-[20px] border-[4px] border-black bg-[#111] p-5 text-white shadow-[7px_7px_0_0_#3FEE56]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <LayoutGrid size={22} strokeWidth={3} aria-hidden="true" />
            <div>
              <h2 className="text-2xl font-[1000] uppercase leading-none tracking-[-0.04em]">
                Dashboard Widgets
              </h2>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white/60">
                Choose which widgets appear on your dashboard
              </p>
            </div>
          </div>
          <div className="rounded-xl border-[3px] border-white/25 bg-white/5 px-4 py-2 text-center">
            <div className="text-3xl font-[1000] leading-none text-[#CCFF00]">
              {visibleCount}
              <span className="text-lg text-white/50">/{widgets.length}</span>
            </div>
            <div className="mt-1 text-[9px] font-black uppercase tracking-[0.16em] text-white/55">
              Visible
            </div>
            {previewCount > 0 ? (
              <div className="mt-1 text-[9px] font-black uppercase tracking-[0.14em] text-[#FFD84D]">
                {previewCount} preview
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setHidden(widgets.filter((widget) => widget.status !== "ready").map((widget) => widget.id))}
          className={`${buttonClass} bg-[#CCFF00]`}
        >
          <Eye size={16} aria-hidden="true" /> Show all ready
        </button>
        <button
          type="button"
          onClick={() => setHidden([])}
          className={`${buttonClass} bg-white`}
          title="Includes preview widgets that are not production-certified"
        >
          <Eye size={16} aria-hidden="true" /> Show all + previews
        </button>
        <button
          type="button"
          onClick={() => setHidden(widgets.map((widget) => widget.id))}
          className={`${buttonClass} bg-white`}
        >
          <EyeOff size={16} aria-hidden="true" /> Hide all
        </button>
        <button
          type="button"
          onClick={() => commit(buildDefaultDashboardLayout())}
          className={`${buttonClass} bg-[#00F0FF]`}
        >
          <RotateCcw size={16} aria-hidden="true" /> Reset to defaults
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
        <label className="relative flex items-center">
          <Search
            size={18}
            aria-hidden="true"
            className="pointer-events-none absolute left-4 text-black/40"
          />
          <span className="sr-only">Search widgets</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search widgets..."
            className="min-h-12 w-full rounded-xl border-[3px] border-black bg-white pl-11 pr-4 font-bold outline-none focus-visible:ring-4 focus-visible:ring-[#00F0FF]"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((entry) => (
            <button
              key={entry.id}
              type="button"
              aria-pressed={category === entry.id}
              onClick={() => setCategory(entry.id)}
              className={`min-h-11 rounded-xl border-[3px] border-black px-3 text-[11px] font-black uppercase tracking-[0.08em] ${
                category === entry.id ? "bg-[#FF4FD8] text-white" : "bg-white"
              }`}
            >
              {entry.label}
            </button>
          ))}
        </div>
      </div>

      <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((widget) => {
          const isVisible = !hiddenSet.has(widget.id)
          return (
            <li key={widget.id}>
              <button
                type="button"
                role="switch"
                aria-checked={isVisible}
                onClick={() => toggleWidget(widget.id)}
                className={`flex w-full items-center gap-3 rounded-[16px] border-[3px] border-black p-3 text-left shadow-[4px_4px_0_0_#000] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#000] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 ${
                  isVisible ? "bg-white" : "bg-black/5 opacity-60"
                }`}
              >
                <span
                  aria-hidden="true"
                  className="h-10 w-10 flex-shrink-0 rounded-lg border-[3px] border-black"
                  style={{ background: widget.headerColor }}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="min-w-0 truncate text-sm font-[1000] uppercase leading-tight">
                      {widget.title}
                    </span>
                    {widget.status !== "ready" ? (
                      <span className="flex-shrink-0 rounded border-2 border-black bg-[#FFD84D] px-1 text-[8px] font-[1000] uppercase tracking-[0.1em]">
                        Preview
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] font-bold text-black/55">
                    {widget.subtitle}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className={`flex h-7 w-12 flex-shrink-0 items-center rounded-full border-[3px] border-black px-0.5 ${
                    isVisible ? "justify-end bg-[#CCFF00]" : "justify-start bg-white"
                  }`}
                >
                  <span className="h-4 w-4 rounded-full border-2 border-black bg-black" />
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      {filtered.length === 0 ? (
        <p className="rounded-xl border-[3px] border-dashed border-black/30 p-6 text-center text-sm font-bold text-black/55">
          No widgets match that search.
        </p>
      ) : null}

      <p className="text-[11px] font-bold leading-5 text-black/55">
        Changes save immediately and apply the next time the dashboard renders. Widget size, height
        and position are still edited on the dashboard itself. Widgets marked Preview are built but
        not production-certified, so their data and controls may be incomplete.
      </p>
    </section>
  )
}

export default DashboardWidgetsSettingsSection
