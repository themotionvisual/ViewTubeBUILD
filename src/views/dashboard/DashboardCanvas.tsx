import React, { useEffect, useMemo, useRef, useState } from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import type { DragEndEvent } from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Download, Edit3, Lock, LockOpen, RotateCcw, Upload } from "lucide-react"
import { DASHBOARD_WIDGET_REGISTRY, DASHBOARD_WIDGET_BY_ID } from "./WidgetRegistry"
import { WidgetPickerPanel } from "./WidgetPickerPanel"
import {
  exportDashboardLayout,
  importDashboardLayout,
  loadDashboardLayout,
  nextSizeBucket,
  resetDashboardLayout,
  saveDashboardLayout,
  sizeBucketClassName,
} from "./storage"
import type { DashboardLayoutState } from "./types"
import type { DashboardData } from "./useDashboardData"
import { WidgetRenderer } from "./WidgetRenderer"

interface DashboardCanvasProps {
  data: DashboardData
  onNavigate: (to: string) => void
}

const SortableWidgetItem: React.FC<{
  id: string
  disabled: boolean
  className: string
  children: React.ReactNode
}> = ({ id, disabled, className, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.62 : 1,
    zIndex: isDragging ? 20 : undefined,
  }

  return (
    <div ref={setNodeRef} style={style} className={className} {...attributes} {...listeners}>
      {children}
    </div>
  )
}

export const DashboardCanvas: React.FC<DashboardCanvasProps> = ({ data, onNavigate }) => {
  const [layout, setLayout] = useState<DashboardLayoutState>(() => loadDashboardLayout())
  const [editMode, setEditMode] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const hiddenSet = useMemo(() => new Set(layout.hidden), [layout.hidden])

  const visibleWidgetIds = useMemo(
    () => layout.order.filter((id) => DASHBOARD_WIDGET_BY_ID[id] && !hiddenSet.has(id)),
    [layout.order, hiddenSet],
  )

  useEffect(() => {
    saveDashboardLayout(layout)
  }, [layout])

  const canDrag = editMode && !layout.locked

  const handleDragEnd = (event: DragEndEvent) => {
    if (!canDrag) return
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = visibleWidgetIds.indexOf(String(active.id))
    const newIndex = visibleWidgetIds.indexOf(String(over.id))
    if (oldIndex < 0 || newIndex < 0) return

    const movedVisible = arrayMove(visibleWidgetIds, oldIndex, newIndex)
    const hidden = layout.order.filter((id) => hiddenSet.has(id))

    setLayout((prev) => ({
      ...prev,
      order: [...movedVisible, ...hidden],
    }))
  }

  const toggleWidgetVisibility = (widgetId: string) => {
    setLayout((prev) => {
      const hidden = new Set(prev.hidden)
      if (hidden.has(widgetId)) {
        hidden.delete(widgetId)
      } else {
        hidden.add(widgetId)
      }
      return { ...prev, hidden: [...hidden] }
    })
  }

  const onToggleCollapse = (widgetId: string) => {
    setLayout((prev) => ({
      ...prev,
      instances: {
        ...prev.instances,
        [widgetId]: {
          ...(prev.instances[widgetId] || { collapsed: false, size: "quarter", pinned: false, focus: false }),
          collapsed: !prev.instances[widgetId]?.collapsed,
        },
      },
    }))
  }

  const onCycleSize = (widgetId: string) => {
    if (!canDrag) return
    setLayout((prev) => {
      const current = prev.instances[widgetId]
      if (!current) return prev
      return {
        ...prev,
        instances: {
          ...prev.instances,
          [widgetId]: {
            ...current,
            size: nextSizeBucket(widgetId, current.size),
          },
        },
      }
    })
  }

  const onRemoveWidget = (widgetId: string) => {
    if (!canDrag) return
    toggleWidgetVisibility(widgetId)
  }

  const handleExport = () => {
    const json = exportDashboardLayout(layout)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "viewtube-dashboard-layout.json"
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const raw = String(reader.result || "")
      try {
        const imported = importDashboardLayout(raw)
        setLayout(imported)
      } catch {
        window.alert("Invalid dashboard layout JSON. Keeping current layout.")
      }
    }
    reader.readAsText(file)

    event.target.value = ""
  }

  return (
    <div className="w-full max-w-[1720px] mx-auto pb-24 px-4 md:px-6 xl:px-8">
      <div className="sticky top-2 z-40 mb-4 border-[4px] border-black rounded-2xl bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,0.35)] overflow-hidden">
        <div className="h-[56px] border-b-[4px] border-black bg-[#C9F830] px-3 md:px-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-lg md:text-2xl font-[1000] uppercase leading-none tracking-tight">Standard Dashboard</h1>
            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.12em] opacity-65 truncate">
              Modular toolbox shell with drag, add/remove, resize buckets, and persisted layout
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditMode((prev) => !prev)}
              className="h-9 px-3 border-[3px] border-black rounded-lg bg-white inline-flex items-center gap-2 text-[10px] font-black uppercase">
              <Edit3 size={14} />
              {editMode ? "Done" : "Rearrange"}
            </button>
            <button
              onClick={() => setLayout((prev) => ({ ...prev, locked: !prev.locked }))}
              className="h-9 px-3 border-[3px] border-black rounded-lg bg-white inline-flex items-center gap-2 text-[10px] font-black uppercase">
              {layout.locked ? <Lock size={14} /> : <LockOpen size={14} />}
              {layout.locked ? "Locked" : "Unlocked"}
            </button>
            <button
              onClick={() => setPickerOpen(true)}
              className="h-9 px-3 border-[3px] border-black rounded-lg bg-white text-[10px] font-black uppercase">
              Widgets
            </button>
            <button
              onClick={() => setLayout(resetDashboardLayout())}
              className="h-9 px-3 border-[3px] border-black rounded-lg bg-white inline-flex items-center gap-2 text-[10px] font-black uppercase">
              <RotateCcw size={14} /> Reset
            </button>
            <button
              onClick={handleExport}
              className="h-9 px-3 border-[3px] border-black rounded-lg bg-white inline-flex items-center gap-2 text-[10px] font-black uppercase">
              <Download size={14} /> Export
            </button>
            <button
              onClick={handleImportClick}
              className="h-9 px-3 border-[3px] border-black rounded-lg bg-white inline-flex items-center gap-2 text-[10px] font-black uppercase">
              <Upload size={14} /> Import
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={handleImportFile}
              className="hidden"
            />
          </div>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={visibleWidgetIds} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-12 gap-4 md:gap-5">
            {visibleWidgetIds.map((widgetId) => {
              const widget = DASHBOARD_WIDGET_BY_ID[widgetId]
              const instance = layout.instances[widgetId]
              if (!widget || !instance) return null

              return (
                <SortableWidgetItem
                  key={widgetId}
                  id={widgetId}
                  disabled={!canDrag}
                  className={sizeBucketClassName(instance.size)}>
                  <WidgetRenderer
                    widget={widget}
                    instance={instance}
                    editMode={editMode}
                    canEdit={canDrag}
                    data={data}
                    onNavigate={onNavigate}
                    onToggleCollapse={onToggleCollapse}
                    onCycleSize={onCycleSize}
                    onRemoveWidget={onRemoveWidget}
                  />
                </SortableWidgetItem>
              )
            })}
          </div>
        </SortableContext>
      </DndContext>

      <WidgetPickerPanel
        open={pickerOpen}
        widgets={DASHBOARD_WIDGET_REGISTRY}
        layout={layout}
        onClose={() => setPickerOpen(false)}
        onToggleWidget={toggleWidgetVisibility}
      />
    </div>
  )
}
