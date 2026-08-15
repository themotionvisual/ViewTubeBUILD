import React, { useId, useMemo, useRef, useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { Check, Grid3X3, Search, X } from "lucide-react"
import type { DashboardLayoutState, DashboardWidgetCategory, WidgetDefinition } from "./types"
import { resolveDashboardSpectrum, resolveVisibleWidgetSpectrum } from "./spectrum"
import { WidgetSelect } from "./WidgetPrimitives"

interface WidgetPickerPanelProps {
  open: boolean
  widgets: WidgetDefinition[]
  layout: DashboardLayoutState
  onClose: () => void
  onToggleWidget: (widgetId: string) => void
}

const CATEGORIES: Array<"all" | DashboardWidgetCategory> = [
  "all",
  "core",
  "analytics",
  "ai",
  "creation",
  "community",
  "system",
]

export const WidgetPickerPanel: React.FC<WidgetPickerPanelProps> = ({
  open,
  widgets,
  layout,
  onClose,
  onToggleWidget,
}) => {
  const searchId = useId()
  const categoryId = useId()
  const searchRef = useRef<HTMLInputElement | null>(null)
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<"all" | DashboardWidgetCategory>("all")
  const hiddenSet = useMemo(() => new Set(layout.hidden), [layout.hidden])
  const visibleIds = useMemo(
    () => layout.order.filter((id) => !hiddenSet.has(id)),
    [hiddenSet, layout.order],
  )
  const spectrumById = useMemo(
    () => resolveVisibleWidgetSpectrum(layout.order, hiddenSet),
    [hiddenSet, layout.order],
  )
  const appendedSpectrum = resolveDashboardSpectrum(visibleIds.length)

  const filteredWidgets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return [...widgets]
      .filter((widget) => widget.releaseTier !== "hidden")
      .filter((widget) => category === "all" || widget.category === category)
      .filter((widget) => !normalizedQuery
        || `${widget.title} ${widget.subtitle} ${widget.category}`.toLowerCase().includes(normalizedQuery))
      .sort((left, right) => left.defaultOrder - right.defaultOrder)
  }, [category, query, widgets])

  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <Dialog.Overlay className="widget-picker-overlay" />
      <Dialog.Content
        className="widget-picker-drawer"
        onOpenAutoFocus={(event) => {
          if (window.matchMedia("(min-width: 768px)").matches) {
            event.preventDefault()
            searchRef.current?.focus()
          }
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          document.querySelector<HTMLElement>("[aria-controls='vt-adaptive-account-menu']")?.focus()
        }}
      >
          <header className="widget-picker-header">
            <div className="widget-picker-heading">
              <Grid3X3 size={22} strokeWidth={2} aria-hidden="true" />
              <div>
                <Dialog.Title>Dashboard widgets</Dialog.Title>
                <Dialog.Description>
                  {visibleIds.length} active · colors follow dashboard position
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close className="widget-picker-close" aria-label="Close widget picker">
              <X size={20} strokeWidth={2} />
            </Dialog.Close>
          </header>

          <div className="widget-picker-filters">
            <label htmlFor={searchId}>Search widgets</label>
            <div className="widget-picker-search">
              <Search size={18} strokeWidth={2} aria-hidden="true" />
              <input
                id={searchId}
                ref={searchRef}
                type="search"
                name="dashboard-widget-search"
                autoComplete="off"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name or function…"
              />
            </div>

            <label id={categoryId}>Category</label>
            <WidgetSelect
              value={category}
              onChange={(value) => setCategory(value as typeof category)}
              label="Widget category"
              options={CATEGORIES.map((option) => ({
                value: option,
                label: option === "all" ? "All categories" : option,
              }))}
            />
          </div>

          <div className="widget-picker-results" aria-live="polite">
            <p className="widget-picker-count">{filteredWidgets.length} widgets</p>
            <div className="widget-picker-grid">
              {filteredWidgets.map((widget) => {
                const active = !hiddenSet.has(widget.id)
                const spectrum = spectrumById[widget.id] || appendedSpectrum
                return (
                  <button
                    type="button"
                    key={widget.id}
                    onClick={() => onToggleWidget(widget.id)}
                    className={`widget-picker-card ${active ? "is-active" : "is-hidden"}`}
                    style={{ "--picker-spectrum": spectrum.headerColor } as React.CSSProperties}
                    aria-pressed={active}
                    aria-label={`${active ? "Hide" : "Add"} ${widget.title}`}
                  >
                    <span className="widget-picker-card-topline">
                      <span className="widget-picker-swatch" aria-hidden="true" />
                      <span className={`widget-picker-tier is-${widget.releaseTier}`}>{widget.releaseTier}</span>
                      {active && <Check size={16} strokeWidth={3} aria-hidden="true" />}
                    </span>
                    <strong>{widget.title}</strong>
                    <span className="widget-picker-card-description">{widget.subtitle}</span>
                    <span className="widget-picker-dependency">
                      {widget.dependency.includes("none") ? "Local" : widget.dependency.join(" · ").replaceAll("_", " ")}
                    </span>
                  </button>
                )
              })}
            </div>
            {filteredWidgets.length === 0 && (
              <div className="widget-picker-empty">
                <strong>No matching widgets</strong>
                <span>Try another search term or category.</span>
              </div>
            )}
          </div>
      </Dialog.Content>
    </Dialog.Root>
  )
}
