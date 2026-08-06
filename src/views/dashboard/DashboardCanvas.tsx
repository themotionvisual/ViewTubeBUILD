import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import type { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { motion, useReducedMotion } from "framer-motion"
import { DashboardBarrier } from "./DashboardBarrier"
import { useDashboard } from "../../context/DashboardContext"
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
import { WidgetRenderer } from "./WidgetRenderer"
import { WidgetErrorBoundary } from "./WidgetErrorBoundary"
import { resolveVisibleWidgetSpectrum } from "./spectrum"
import { WidgetDragHandleProvider } from "./WidgetShell"
import { WidgetStatePanel } from "./WidgetPrimitives"

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
  const reduceMotion = useReducedMotion()
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    isDragging,
  } = useSortable({ id, disabled })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    zIndex: isDragging ? 20 : undefined,
    position: "relative",
  }

  return (
    <motion.div 
      ref={setNodeRef} 
      layout
      transition={reduceMotion ? { duration: 0 } : {
        layout: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }}
      style={style} 
      className={`dashboard-widget-slot ${className} ${isDragging ? 'opacity-60' : 'opacity-100'}`}
      data-widget-id={id}
      inert={isDragging}
    >
      <WidgetDragHandleProvider
        attributes={attributes as unknown as React.ButtonHTMLAttributes<HTMLButtonElement>}
        listeners={listeners as unknown as React.DOMAttributes<HTMLButtonElement>}
        setActivatorNodeRef={setActivatorNodeRef as (node: HTMLButtonElement | null) => void}
        disabled={disabled}
      >
        {children}
      </WidgetDragHandleProvider>
    </motion.div>
  )
}

export const DashboardCanvas: React.FC<DashboardCanvasProps> = ({ data, onNavigate }) => {
  const { 
    editMode, setEditMode, 
    setIsLocked,
    pickerOpen, setPickerOpen, 
    registerActions 
  } = useDashboard()
  const [layout, setLayout] = useState<DashboardLayoutState>(() => loadDashboardLayout())
  const [dragPreviewOrder, setDragPreviewOrder] = useState<string[] | null>(null)
  const [recentlyRemovedId, setRecentlyRemovedId] = useState<string | null>(null)
  const [showWelcomeBanner, setShowWelcomeBanner] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get("onboarding") === "welcome"
  })
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

  const displayedWidgetIds = dragPreviewOrder || visibleWidgetIds
  const spectrumByWidgetId = useMemo(
    () => resolveVisibleWidgetSpectrum(displayedWidgetIds, hiddenSet),
    [displayedWidgetIds, hiddenSet],
  )

  useEffect(() => {
    saveDashboardLayout(layout)
  }, [layout])

  const canDrag = editMode && !layout.locked

  const handleDragStart = (event: DragStartEvent) => {
    if (!canDrag) return
    const activeId = String(event.active.id)
    if (visibleWidgetIds.includes(activeId)) setDragPreviewOrder(visibleWidgetIds)
  }

  const handleDragOver = (event: DragOverEvent) => {
    if (!canDrag || !event.over) return
    setDragPreviewOrder((current) => {
      const order = current || visibleWidgetIds
      const oldIndex = order.indexOf(String(event.active.id))
      const newIndex = order.indexOf(String(event.over?.id))
      if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return order
      return arrayMove(order, oldIndex, newIndex)
    })
  }

  const handleDragCancel = () => {
    setDragPreviewOrder(null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    if (!canDrag) return
    const { active, over } = event
    const proposedOrder = dragPreviewOrder
    setDragPreviewOrder(null)
    if (!over || active.id === over.id || !proposedOrder) return

    setLayout((prev) => ({
      ...prev,
      order: [...proposedOrder, ...prev.order.filter((id) => prev.hidden.includes(id))],
    }))
  }

  const toggleWidgetVisibility = (widgetId: string) => {
    setLayout((prev) => {
      const hidden = new Set(prev.hidden)
      if (hidden.has(widgetId)) {
        hidden.delete(widgetId)
        return {
          ...prev,
          order: [...prev.order.filter((id) => id !== widgetId), widgetId],
          hidden: [...hidden],
        }
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
          ...(prev.instances[widgetId] || { collapsed: false, size: "quarter", height: "medium" }),
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
    setLayout((prev) => ({
      ...prev,
      hidden: prev.hidden.includes(widgetId) ? prev.hidden : [...prev.hidden, widgetId],
    }))
    setRecentlyRemovedId(widgetId)
  }

  const handleExport = useCallback(() => {
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
  }, [layout])

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const raw = String(reader.result || "")
      try {
        const imported = importDashboardLayout(raw)
        setLayout(imported)
        setIsLocked(imported.locked)
      } catch {
        window.alert("Invalid dashboard layout JSON. Keeping current layout.")
      }
    }
    reader.readAsText(file)

    event.target.value = ""
  }

  const handleToggleLock = useCallback(() => {
    const nextLocked = !layout.locked
    setLayout((current) => ({ ...current, locked: nextLocked }))
    setIsLocked(nextLocked)
  }, [layout.locked, setIsLocked])

  const handleReset = useCallback(() => {
    const reset = resetDashboardLayout()
    setLayout(reset)
    setIsLocked(reset.locked)
  }, [setIsLocked])

  useEffect(() => {
    registerActions({
      exportLayout: handleExport,
      importLayout: handleImportClick,
      resetLayout: handleReset,
      toggleLock: handleToggleLock,
    })
  }, [handleExport, handleImportClick, handleReset, handleToggleLock, registerActions])

  return (
    <DashboardBarrier>
    <div className="w-full max-w-[1720px] mx-auto pb-24 px-2 sm:px-4 md:px-6 xl:px-8">
       <input
         ref={fileInputRef}
         type="file"
         accept="application/json"
         onChange={handleImportFile}
         className="hidden"
       />


      {showWelcomeBanner && (
        <div className="mb-4 border-[3px] border-black rounded-2xl bg-[#3FEE56] px-4 py-3 shadow-[4px_4px_0_0_#000] flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm md:text-base font-black uppercase">You’re set. Next: Connect channel.</p>
          <button
            onClick={() => setShowWelcomeBanner(false)}
            className="border-[2px] border-black rounded-lg bg-white px-3 py-1 text-[10px] font-black uppercase"
          >
            Dismiss
          </button>
        </div>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragCancel={handleDragCancel}
        onDragEnd={handleDragEnd}
        accessibility={{
          screenReaderInstructions: {
            draggable: "Press space to pick up a widget. Use arrow keys to move it, then press space to drop or Escape to cancel.",
          },
          announcements: {
            onDragStart: ({ active }) => `${DASHBOARD_WIDGET_BY_ID[String(active.id)]?.title || "Widget"} picked up.`,
            onDragOver: ({ active, over }) => over
              ? `${DASHBOARD_WIDGET_BY_ID[String(active.id)]?.title || "Widget"} will be position ${displayedWidgetIds.indexOf(String(over.id)) + 1} of ${displayedWidgetIds.length}.`
              : undefined,
            onDragEnd: ({ active, over }) => over
              ? `${DASHBOARD_WIDGET_BY_ID[String(active.id)]?.title || "Widget"} moved to position ${displayedWidgetIds.indexOf(String(over.id)) + 1} of ${displayedWidgetIds.length}.`
              : "Widget was not moved.",
            onDragCancel: () => "Widget move cancelled.",
          },
        }}
      >
        <SortableContext items={visibleWidgetIds} strategy={rectSortingStrategy}>
           <div className="grid grid-cols-[repeat(24,minmax(0,1fr))] gap-3 sm:gap-4 md:gap-5">
             {visibleWidgetIds.map((widgetId) => {
               const widget = DASHBOARD_WIDGET_BY_ID[widgetId]
               const instance = layout.instances[widgetId]
               if (!widget || !instance) return null
               const spectrum = spectrumByWidgetId[widgetId]
               const themedWidget = spectrum ? {
                 ...widget,
                 headerColor: spectrum.headerColor,
                 iconRailColor: spectrum.iconRailColor,
               } : widget

               return (
                 <SortableWidgetItem
                   key={widgetId}
                   id={widgetId}
                   disabled={!canDrag}
                   className={`${sizeBucketClassName(instance.size)} ${instance.collapsed ? "h-[48px]" : heightBucketClassName(instance.height)}`}>
                    <WidgetErrorBoundary widgetId={widgetId}>
                      <Suspense fallback={<WidgetStatePanel state={{ status: "loading", data: null, message: `Loading ${widget.title}…` }} />}>
                        <WidgetRenderer
                          widget={themedWidget}
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
                            toggleLock: handleToggleLock,
                            openPicker: () => setPickerOpen(true),
                            resetLayout: handleReset,
                            handleExport,
                            handleImportClick
                          }}
                        />
                      </Suspense>
                    </WidgetErrorBoundary>
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
      {recentlyRemovedId && (
        <div className="widget-removal-toast" role="status" aria-live="polite">
          <span>{DASHBOARD_WIDGET_BY_ID[recentlyRemovedId]?.title || "Widget"} removed.</span>
          <button
            type="button"
            onClick={() => {
              setLayout((prev) => ({
                ...prev,
                hidden: prev.hidden.filter((id) => id !== recentlyRemovedId),
              }))
              setRecentlyRemovedId(null)
            }}
          >
            Undo
          </button>
          <button type="button" aria-label="Dismiss removal message" onClick={() => setRecentlyRemovedId(null)}>×</button>
        </div>
      )}
    </div>
    </DashboardBarrier>
  )
}
