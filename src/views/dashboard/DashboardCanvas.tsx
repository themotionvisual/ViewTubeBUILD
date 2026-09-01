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
import { CSS, getEventCoordinates } from "@dnd-kit/utilities"
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
import { getDashboardResizedInstance, moveDashboardWidgetOrder } from "./dashboardMiniLayout"
import type { DashboardMoveDirection, DashboardResizeDirection } from "./dashboardMiniLayout"
import {
  getDashboardEdgeScrollDelta,
  getDashboardInteractionPermissions,
} from "./dashboardDrag"

interface DashboardCanvasProps {
  data: DashboardData
  onNavigate: (to: string) => void
}

const DeferredDashboardWidget: React.FC<{ eager: boolean; children: React.ReactNode }> = ({ eager, children }) => {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const [isVisible, setIsVisible] = useState(eager)

  useEffect(() => {
    if (eager || isVisible) return
    const host = hostRef.current
    if (!host || typeof IntersectionObserver === "undefined") {
      setIsVisible(true)
      return
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      setIsVisible(true)
      observer.disconnect()
    }, { rootMargin: "700px 0px" })
    observer.observe(host)
    return () => observer.disconnect()
  }, [eager, isVisible])

  return <div ref={hostRef} className="h-full">{isVisible ? children : null}</div>
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
  const dragPointerYRef = useRef<number | null>(null)
  const dragAutoScrollFrameRef = useRef<number | null>(null)

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

  const { canEdit, canReorder, canResize } = getDashboardInteractionPermissions({
    editMode,
    locked: layout.locked,
  })

  const runDragAutoScroll = useCallback(() => {
    const scrollNextFrame = () => {
      const pointerY = dragPointerYRef.current
      const scrollingElement = document.scrollingElement
      if (pointerY === null || !scrollingElement) {
        dragAutoScrollFrameRef.current = null
        return
      }

      const delta = getDashboardEdgeScrollDelta({
        pointerY,
        viewportHeight: window.innerHeight,
        scrollTop: scrollingElement.scrollTop,
        scrollHeight: scrollingElement.scrollHeight,
      })
      if (delta !== 0) window.scrollBy({ top: delta, left: 0, behavior: "auto" })
      dragAutoScrollFrameRef.current = window.requestAnimationFrame(scrollNextFrame)
    }

    dragAutoScrollFrameRef.current = window.requestAnimationFrame(scrollNextFrame)
  }, [])

  const updateDragPointerPosition = useCallback((event: PointerEvent) => {
    dragPointerYRef.current = event.clientY
  }, [])

  const startDragAutoScroll = useCallback((event: Event) => {
    const coordinates = getEventCoordinates(event)
    if (!coordinates) return
    dragPointerYRef.current = coordinates.y
    window.addEventListener("pointermove", updateDragPointerPosition, { passive: true })
    if (dragAutoScrollFrameRef.current === null) {
      runDragAutoScroll()
    }
  }, [runDragAutoScroll, updateDragPointerPosition])

  const stopDragAutoScroll = useCallback(() => {
    window.removeEventListener("pointermove", updateDragPointerPosition)
    dragPointerYRef.current = null
    if (dragAutoScrollFrameRef.current !== null) {
      window.cancelAnimationFrame(dragAutoScrollFrameRef.current)
      dragAutoScrollFrameRef.current = null
    }
  }, [updateDragPointerPosition])

  useEffect(() => stopDragAutoScroll, [stopDragAutoScroll])

  const handleDragStart = (event: DragStartEvent) => {
    if (!canReorder) return
    const activeId = String(event.active.id)
    if (visibleWidgetIds.includes(activeId)) {
      setDragPreviewOrder(visibleWidgetIds)
      startDragAutoScroll(event.activatorEvent)
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    if (!canReorder || !event.over) return
    setDragPreviewOrder((current) => {
      const order = current || visibleWidgetIds
      const oldIndex = order.indexOf(String(event.active.id))
      const newIndex = order.indexOf(String(event.over?.id))
      if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return order
      return arrayMove(order, oldIndex, newIndex)
    })
  }

  const handleDragCancel = () => {
    stopDragAutoScroll()
    setDragPreviewOrder(null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    stopDragAutoScroll()
    if (!canReorder) return
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

  const onToggleCollapse = useCallback((widgetId: string) => {
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
  }, [])

  const handleMoveWidget = useCallback((widgetId: string, direction: DashboardMoveDirection) => {
    setLayout((prev) => {
      const order = moveDashboardWidgetOrder(prev, widgetId, direction)
      return order === prev.order ? prev : { ...prev, order }
    })
  }, [])

  const handleResizeWidget = useCallback((widgetId: string, direction: DashboardResizeDirection) => {
    setLayout((prev) => {
      if (prev.locked) return prev
      const instance = prev.instances[widgetId]
      if (!instance) return prev
      const resized = getDashboardResizedInstance(widgetId, instance, direction)
      if (resized === instance) return prev
      return {
        ...prev,
        instances: { ...prev.instances, [widgetId]: resized },
      }
    })
  }, [])

  const onCycleSize = (widgetId: string) => {
    if (!canResize) return
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
    if (!canResize) return
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
    if (!canResize) return
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
    if (!canResize) return
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
    if (!canResize) return
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

  const handleToggleWidget = useCallback((widgetId: string) => {
    toggleWidgetVisibility(widgetId)
  }, [])

  const handleShowAll = useCallback(() => {
    setLayout((prev) => ({
      ...prev,
      hidden: [],
    }))
  }, [])

  const handleHideAll = useCallback(() => {
    setLayout((prev) => ({
      ...prev,
      hidden: prev.order.filter((id) => id !== "dashboard-controls"),
    }))
  }, [])

  const handleApplyPreset = useCallback((presetId: string) => {
    // Six presets = 3 balanced defaults + 3 specialty unique layouts.
    // Every preset includes "dashboard-controls" so the user always has
    // the layout hub visible after switching.
    const presetMap: Record<string, string[]> = {
      "default-standard": [
        "app-verification-explainer", "kpi-cluster", "overview-data-visuals",
        "comment-replier",
        "consistency-heatmap", "realtime-performance", "goals-tracker", "keyword-engine",
        "daily-oracle", "community-post",
        "image-generator", "data-edit",
        "traffic-sources", "shorts-vs-long", "publish-momentum", "audience-matrix",
        "dashboard-controls", "account-billing",
      ],
      "default-analytics": [
        "kpi-cluster", "overview-data-visuals",
        "consistency-heatmap", "realtime-performance", "revenue-momentum", "publish-momentum",
        "traffic-sources", "shorts-vs-long", "audience-matrix", "audience-retention",
        "relative-retention-benchmark", "ad-stack-intelligence", "reach-funnel",
        "revenue-chart", "keyword-overlap-intelligence", "retention-sim",
        "dashboard-controls",
      ],
      "default-creator": [
        "app-verification-explainer", "kpi-cluster",
        "script-studio", "image-generator", "thumb-ai", "video-uploader",
        "data-edit", "community-post", "community-post-studio", "shorts-generator",
        "comment-replier", "title-rewriter", "description-editor",
        "tag-generator", "hashtag-analyzer",
        "dashboard-controls", "account-billing",
      ],
      "unique-command": [
        "daily-command-center", "opportunity-desk", "idea-portfolio",
        "brain-hub", "brain-control-center",
        "daily-oracle", "goals-tracker", "quick-actions",
        "kpi-cluster", "dashboard-controls",
      ],
      "unique-minimal": [
        "kpi-cluster", "daily-oracle", "quick-actions",
        "dashboard-controls", "account-billing",
      ],
      "unique-atlas": DASHBOARD_WIDGET_REGISTRY.map((w) => w.id),
    }
    const targetIds = presetMap[presetId]
    if (!targetIds) return
    const visibleSet = new Set(targetIds)
    setLayout((prev) => ({
      ...prev,
      hidden: prev.order.filter((id) => !visibleSet.has(id)),
    }))
  }, [])

  useEffect(() => {
    registerActions({
      exportLayout: handleExport,
      importLayout: handleImportClick,
      resetLayout: handleReset,
      toggleLock: handleToggleLock,
      toggleWidget: handleToggleWidget,
      toggleWidgetCollapse: onToggleCollapse,
      moveWidget: handleMoveWidget,
      resizeWidget: handleResizeWidget,
      showAllWidgets: handleShowAll,
      hideAllWidgets: handleHideAll,
      applyPreset: handleApplyPreset,
      getLayout: () => layout,
    })
  }, [
    handleExport,
    handleImportClick,
    handleReset,
    handleToggleLock,
    handleToggleWidget,
    onToggleCollapse,
    handleMoveWidget,
    handleResizeWidget,
    handleShowAll,
    handleHideAll,
    handleApplyPreset,
    layout,
    registerActions,
  ])

  return (
    <DashboardBarrier>
    <div className="w-full pb-24 px-3 sm:px-4 md:px-5 xl:px-6">
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
        autoScroll={false}
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
                   disabled={!canReorder}
                   className={`vt-dash-cell ${instance.collapsed ? "is-collapsed" : ""} ${sizeBucketClassName(instance.size)} ${instance.collapsed ? "h-[48px]" : heightBucketClassName(instance.height)}`}>
                    <DeferredDashboardWidget eager={editMode}>
                      <WidgetErrorBoundary widgetId={widgetId}>
                        <Suspense fallback={null}>
                          <WidgetRenderer
                          widget={themedWidget}
                          instance={instance}
                          editMode={editMode}
                          canEdit={canEdit}
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
                    </DeferredDashboardWidget>
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
