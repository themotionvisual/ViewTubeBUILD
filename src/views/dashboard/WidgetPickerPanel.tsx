import React from "react"
import { Grid3X3, X } from "lucide-react"
import type { DashboardLayoutState, WidgetDefinition } from "./types"

interface WidgetPickerPanelProps {
  open: boolean
  widgets: WidgetDefinition[]
  layout: DashboardLayoutState
  onClose: () => void
  onToggleWidget: (widgetId: string) => void
}

export const WidgetPickerPanel: React.FC<WidgetPickerPanelProps> = ({
  open,
  widgets,
  layout,
  onClose,
  onToggleWidget,
}) => {
  const hiddenSet = new Set(layout.hidden)

  return (
    <aside
      className={`fixed top-0 right-0 h-screen w-[320px] max-w-[92vw] z-50 border-l-[5px] border-black bg-white shadow-[-8px_0_24px_rgba(0,0,0,0.2)] transition-transform duration-500 ${
        open ? "translate-x-0" : "translate-x-full"
      }`}>
      <header className="h-[60px] border-b-[4px] border-black bg-[#C9F830] px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Grid3X3 size={18} className="text-black" />
          <h3 className="text-lg font-black uppercase tracking-tight">Widgets</h3>
        </div>
        <button
          onClick={onClose}
          className="h-8 w-8 border-[2px] border-black rounded-lg bg-white inline-flex items-center justify-center">
          <X size={14} />
        </button>
      </header>

      <div className="p-4 overflow-y-auto h-[calc(100%-60px)]">
        <div className="grid grid-cols-4 gap-3">
          {widgets.map((widget) => {
            const active = !hiddenSet.has(widget.id)
            return (
              <button
                key={widget.id}
                onClick={() => onToggleWidget(widget.id)}
                className={`aspect-square rounded-xl border-[3px] flex flex-col items-center justify-center gap-1 transition-transform hover:scale-105 ${
                  active ? "border-black" : "border-[#bdbdbd] opacity-55"
                }`}
                style={{
                  backgroundColor: active ? widget.headerColor : "#E3E3E3",
                  color: "#000",
                }}>
                <span className="text-[8px] font-black uppercase leading-tight px-1 text-center">{widget.title}</span>
              </button>
            )
          })}
        </div>
      </div>
    </aside>
  )
}
