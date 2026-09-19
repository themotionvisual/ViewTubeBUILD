import React, { createContext, useEffect, useState } from "react"
import { CircleQuestionMark, Eye, GripVertical, Layers, Minus, Plus, Settings2, Trash2 } from "lucide-react"
import { VTLottie } from "../../components/VTLottie"
import { cn } from "../../lib/utils"
import type { DashboardHeightBucket, DashboardSizeBucket, WidgetDefinition, WidgetInstanceState } from "./types"
import { WIDGET_DESCRIPTIONS } from "./WidgetRegistry"
import { loadDashboardLayout, saveDashboardLayout } from "./storage"

export interface WidgetDragHandleBindings {
 attributes?: React.ButtonHTMLAttributes<HTMLButtonElement>
 listeners?: React.DOMAttributes<HTMLButtonElement>
 setActivatorNodeRef?: (node: HTMLButtonElement | null) => void
 disabled?: boolean
}

const WidgetDragHandleContext = createContext<WidgetDragHandleBindings>({ disabled: true })
const WIDGET_COLLAPSE_DURATION_MS = 600

export const WidgetDragHandleProvider: React.FC<WidgetDragHandleBindings & { children: React.ReactNode }> = ({ children, ...bindings }) => (
 <WidgetDragHandleContext.Provider value={bindings}>{children}</WidgetDragHandleContext.Provider>
)

const WIDTH_LABELS: Record<DashboardSizeBucket, string> = {
 full: "1/1", "three-quarters": "3/4", "two-thirds": "2/3", half: "1/2", between: "5/12", third: "1/3", companion: "7/24", quarter: "1/4",
}
const HEIGHT_LABELS: Record<DashboardHeightBucket, string> = { short: "S", medium: "M", tall: "L", xtall: "XL", massive: "XXL" }

export const WidgetShell: React.FC<{
 widget: WidgetDefinition; instance: WidgetInstanceState; editMode: boolean; canEdit: boolean
 onToggleCollapse?: () => void; onCycleSize?: () => void; onDecSize?: () => void
 onCycleHeight?: () => void; onDecHeight?: () => void; onRemove?: () => void
 children: React.ReactNode; icon?: React.ReactNode; headerContent?: React.ReactNode; helpContent?: React.ReactNode
 contentLayout?: "inset" | "flush"; controlDensity?: "default" | "compact"; hasAI?: boolean; onRegenerate?: () => void
 aiCost?: number; aiDisabled?: boolean; aiDisabledReason?: string
}> = ({ widget, instance, editMode, canEdit, onToggleCollapse = () => {}, onCycleSize = () => {}, onDecSize = () => {}, onCycleHeight = () => {}, onDecHeight = () => {}, onRemove = () => {}, children, icon, headerContent, helpContent, contentLayout = "inset", controlDensity = "default", hasAI, onRegenerate, aiCost, aiDisabled, aiDisabledReason }) => {
 const [isSubtitleOpen, setIsSubtitleOpen] = useState(false)
 const [keepClosingContentMounted, setKeepClosingContentMounted] = useState(!instance.collapsed)
 const description = WIDGET_DESCRIPTIONS[widget.id] || { short: "INTERACTIVE SOURCE PREVIEW RETAINED AS IDEA-BANK.", detailed: "View raw data streams and historical references before promoting components to the main dashboard." }
 const handleShowAllWidgets = () => { const layout = loadDashboardLayout(); if (layout.hidden.length === 0) return; saveDashboardLayout({ ...layout, hidden: [] }); window.location.reload() }

 useEffect(() => {
  if (!instance.collapsed) {
   setKeepClosingContentMounted(true)
   return
  }
  const timer = window.setTimeout(() => setKeepClosingContentMounted(false), WIDGET_COLLAPSE_DURATION_MS)
  return () => window.clearTimeout(timer)
 }, [instance.collapsed])

 const shouldRenderContent = !instance.collapsed || keepClosingContentMounted

 return <div className={cn("vt-widget", instance.collapsed ? "is-collapsed" : "open")} style={{ "--widget-color": widget.headerColor, "--widget-icon-rail-color": widget.iconRailColor } as React.CSSProperties} data-responsive-mode={widget.responsiveMode} data-control-density={controlDensity} data-widget-width={instance.size} data-widget-height={instance.height}>
  <div className="vt-widget-header">
   <div className="left"><div className="icon-rail">{icon || <Layers size={22}/>}</div><span className="title">{widget.title}</span></div>
   {headerContent && <div className="header-extra" onClick={e=>e.stopPropagation()} onPointerDown={e=>e.stopPropagation()} onTouchStart={e=>e.stopPropagation()} style={{flex:1,display:"flex",justifyContent:"center"}}>{headerContent}</div>}
   <div className="toggle flex items-center gap-2" onClick={e=>e.stopPropagation()} onPointerDown={e=>e.stopPropagation()} onTouchStart={e=>e.stopPropagation()}>
    {hasAI && <div className="flex items-center gap-1.5 mr-1">{typeof aiCost === "number" && <span className="widget-ai-cost-chip">{aiCost}T</span>}<button className="widget-header-btn ai-btn" title={aiDisabled && aiDisabledReason ? aiDisabledReason : "Regenerate with AI"} onClick={onRegenerate} disabled={aiDisabled}><VTLottie animationUrl="https://assets3.lottiefiles.com/packages/lf20_m6cu8sh9.json" size={16}/></button></div>}
    <div className="flex flex-row items-center gap-1">
     <button type="button" onClick={()=>setIsSubtitleOpen(!isSubtitleOpen)} className={`widget-header-btn ${isSubtitleOpen?"is-active":""}`} aria-label={`${isSubtitleOpen?"Hide":"Show"} information for ${widget.title}`} aria-expanded={isSubtitleOpen} title="Widget information"><CircleQuestionMark size={13} strokeWidth={2.5}/></button>
     {canEdit && editMode && <WidgetDragHandleContext.Consumer>{dragHandle=><button type="button" ref={dragHandle.setActivatorNodeRef} {...dragHandle.attributes} {...dragHandle.listeners} className="widget-header-btn cursor-grab active:cursor-grabbing" aria-label={`Reorder ${widget.title}`} title="Drag to reorder" disabled={dragHandle.disabled}><GripVertical size={18} strokeWidth={2}/></button>}</WidgetDragHandleContext.Consumer>}
     {canEdit && editMode && <details className="widget-edit-menu"><summary className="widget-header-btn" aria-label={`Resize or remove ${widget.title}`} title="Widget layout options"><Settings2 size={18} strokeWidth={2}/></summary><div className="widget-edit-menu-popover" role="group" aria-label={`Layout options for ${widget.title}`}>
      <div className="widget-edit-dimensions" aria-label="Current widget dimensions"><strong>H: {HEIGHT_LABELS[instance.height]}</strong><strong>W: {WIDTH_LABELS[instance.size]}</strong></div>
      <div className="widget-edit-resize-grid"><button type="button" onClick={onDecSize} className="widget-edit-action" aria-label="Decrease widget width">W−</button><button type="button" onClick={onCycleSize} className="widget-edit-action" aria-label="Increase widget width">W+</button><button type="button" onClick={onDecHeight} className="widget-edit-action" aria-label="Decrease widget height">H−</button><button type="button" onClick={onCycleHeight} className="widget-edit-action" aria-label="Increase widget height">H+</button></div>
      <button type="button" onClick={onRemove} className="widget-edit-action is-danger"><Trash2 size={16} aria-hidden="true"/> Remove</button>
     </div></details>}
     <button type="button" onClick={onToggleCollapse} className="widget-header-btn" aria-label={`${instance.collapsed?"Expand":"Collapse"} ${widget.title}`} aria-expanded={!instance.collapsed} title={instance.collapsed?"Expand widget":"Collapse widget"}>{instance.collapsed?<Plus size={16} strokeWidth={2}/>:<Minus size={16} strokeWidth={2}/>}</button>
    </div>
   </div>
  </div>
  <div className={cn("vt-widget-collapse-region", instance.collapsed ? "is-closed" : "is-open")}>
   <div className="vt-widget-collapse-inner">
    {shouldRenderContent && <>
     <div className={`widget-subtitle ${isSubtitleOpen?'open':''}`}><div className="widget-subtitle-content" style={{flexDirection:"column",alignItems:"stretch",gap:"8px"}}><div><div style={{fontWeight:900,textTransform:"uppercase",fontSize:"12px",lineHeight:1.2}}>{description.short}</div><div style={{fontWeight:600,fontSize:"11px",opacity:.7,lineHeight:1.3,textTransform:"none"}}>{description.detailed}</div></div>{helpContent ? <div className="widget-help-guide">{helpContent}</div> : null}</div></div>
     <div className="vt-widget-content"><div className={cn("vt-widget-body",contentLayout==="flush"&&"vt-widget-body--flush")} onPointerDown={e=>e.stopPropagation()} onTouchStart={e=>e.stopPropagation()}>{widget.id==="system-micro-stack"&&<button type="button" className="vt-button" onClick={handleShowAllWidgets} style={{width:"100%",minHeight:"34px",fontSize:"9px",marginBottom:"8px",background:"#fff"}}><Eye size={14} aria-hidden="true"/>SHOW ALL WIDGETS</button>}{children}</div></div>
    </>}
   </div>
  </div>
 </div>
}
