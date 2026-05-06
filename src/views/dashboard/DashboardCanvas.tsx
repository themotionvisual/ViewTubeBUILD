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
import { DashboardBarrier } from "./DashboardBarrier"
import { DASHBOARD_WIDGET_REGISTRY, DASHBOARD_WIDGET_BY_ID } from "./WidgetRegistry"
import { WidgetPickerPanel } from "./WidgetPickerPanel"
import {
  exportDashboardLayout,
  importDashboardLayout,
  loadDashboardLayout,
  nextHeightBucket,
  prevHeightBucket,
  nextSizeBucket,
  prevSizeBucket,
  resetDashboardLayout,
  saveDashboardLayout,
  sizeBucketClassName,
  heightBucketClassName,
} from "./storage"
import type { DashboardLayoutState } from "./types"
import type { DashboardData } from "./useDashboardData"
import { DashboardHeader } from "./DashboardHeader"
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
    <div ref={setNodeRef} style={style} className={className} data-widget-id={id} {...attributes} {...listeners}>
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

  const onDecSize = (widgetId: string) => {
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
            size: prevSizeBucket(widgetId, current.size),
          },
        },
      }
    })
  }

  const onCycleHeight = (widgetId: string) => {
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
            height: nextHeightBucket(widgetId, current.height),
          },
        },
      }
    })
  }

  const onDecHeight = (widgetId: string) => {
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
            height: prevHeightBucket(widgetId, current.height),
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
    <DashboardBarrier>
    <div className="w-full max-w-[1720px] mx-auto pb-24 px-4 md:px-6 xl:px-8">
       <input
         ref={fileInputRef}
         type="file"
         accept="application/json"
         onChange={handleImportFile}
         className="hidden"
       />

       <DashboardHeader 
         data={data}
         dashboardControls={{
           editMode,
           setEditMode,
           locked: layout.locked,
           toggleLock: () => setLayout(prev => ({ ...prev, locked: !prev.locked })),
           openPicker: () => setPickerOpen(true),
           resetLayout: () => setLayout(resetDashboardLayout()),
           handleExport,
           handleImportClick
         }}
       />

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
                   className={`${sizeBucketClassName(instance.size)} ${heightBucketClassName(instance.height)} transition-all duration-300`}>
                    <WidgetRenderer
                      widget={widget}
                      instance={instance}
                      editMode={editMode}
                      canEdit={canDrag}
                      data={data}
                      onNavigate={onNavigate}
                      onToggleCollapse={onToggleCollapse}
                      onCycleSize={onCycleSize}
                      onDecSize={onDecSize}
                      onCycleHeight={onCycleHeight}
                      onDecHeight={onDecHeight}
                      onRemoveWidget={onRemoveWidget}
                      dashboardControls={{
                        editMode,
                        setEditMode,
                        locked: layout.locked,
                        toggleLock: () => setLayout(prev => ({ ...prev, locked: !prev.locked })),
                        openPicker: () => setPickerOpen(true),
                        resetLayout: () => setLayout(resetDashboardLayout()),
                        handleExport,
                        handleImportClick
                      }}
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
    </DashboardBarrier>
  )
}
