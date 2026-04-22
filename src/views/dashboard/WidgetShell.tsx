import React from "react"
import { Layers, X, GripVertical, ChevronsUpDown, ChevronsLeftRight } from "lucide-react"
import type { WidgetDefinition, WidgetInstanceState } from "./types"

export const WidgetShell: React.FC<{
 widget: WidgetDefinition
 instance: WidgetInstanceState
 editMode: boolean
 canEdit: boolean
 onToggleCollapse: () => void
 onCycleSize: () => void
 onCycleHeight: () => void
 onRemove: () => void
 children: React.ReactNode
 icon?: React.ReactNode
 headerContent?: React.ReactNode
}> = ({
 widget,
 instance,
 editMode,
 canEdit,
 onToggleCollapse,
 onCycleSize,
 onCycleHeight,
 onRemove,
 children,
 icon,
 headerContent,
}) => {
 const isOpen = !instance.collapsed

 return (
  <div
   className={`subtoolbox ${isOpen ? "open" : "closed"}`}
   style={{
    boxShadow: `var(--shadow-offset) var(--shadow-offset) 0px 0px ${widget.headerColor}73`,
    border: "var(--stroke) solid black",
   }}>
   <div
    className="subtoolbox-header"
    style={{
     backgroundColor: widget.headerColor,
     borderBottom: "var(--stroke) solid black",
    }}
    onClick={onToggleCollapse}>
    <div className="left">
     <div
      className="icon-rail"
      style={{
       backgroundColor: widget.iconRailColor,
       borderRight: "var(--stroke) solid black",
      }}>
      {icon || <Layers size={22} className="text-black" />}
     </div>
     <span className="title">{widget.title}</span>
    </div>

    {headerContent && (
     <div className="header-extra" onClick={(e) => e.stopPropagation()} style={{ flex: 1, display: "flex", justifyContent: "center" }}>
      {headerContent}
     </div>
    )}

    <div className="toggle" onClick={(e) => e.stopPropagation()}>
     {canEdit && editMode ?
      <div className="flex items-center gap-1.5 mr-2">
       <button
        onClick={onCycleSize}
        className="widget-control-btn w-5"
        title="Cycle width">
        <ChevronsLeftRight size={12} strokeWidth={3} />
       </button>
       <button
        onClick={onCycleHeight}
        className="widget-control-btn w-5"
        title="Cycle height">
        <ChevronsUpDown size={12} strokeWidth={3} />
       </button>
       <button
        onClick={onRemove}
        className="widget-control-btn w-5"
        title="Remove widget">
        <X size={12} strokeWidth={3} />
       </button>
       <div className="widget-control-btn w-5 cursor-grab active:cursor-grabbing" title="Drag to reorder">
        <GripVertical size={12} strokeWidth={3} />
       </div>
      </div>
     : null}
     <div className="toggle-icon">{isOpen ? "✦" : "−"}</div>
    </div>
   </div>

   {isOpen && (
    <div className="subtoolbox-content">
     <div className="subtoolbox-body">{children}</div>
    </div>
   )}
  </div>
 )
}
