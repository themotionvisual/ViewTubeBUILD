import React, { useState } from "react"
import { Layers, X, GripVertical, ChevronsUpDown, ChevronsLeftRight, Sparkles, CircleQuestionMark, Minus } from "lucide-react"
import { VTLottie } from "../../components/VTLottie"
import type { WidgetDefinition, WidgetInstanceState } from "./types"
import { WIDGET_DESCRIPTIONS } from "./WidgetRegistry"

export const WidgetShell: React.FC<{
 widget: WidgetDefinition
 instance: WidgetInstanceState
 editMode: boolean
 canEdit: boolean
 onToggleCollapse?: () => void
 onCycleSize?: () => void
 onDecSize?: () => void
 onCycleHeight?: () => void
 onDecHeight?: () => void
 onRemove?: () => void
 children: React.ReactNode
 icon?: React.ReactNode
 headerContent?: React.ReactNode
 hasAI?: boolean
 onRegenerate?: () => void
 aiCost?: number
 aiDisabled?: boolean
 aiDisabledReason?: string
}> = ({
 widget,
 editMode,
 canEdit,
 onToggleCollapse = () => {},
 onCycleSize = () => {},
 onDecSize = () => {},
 onCycleHeight = () => {},
 onDecHeight = () => {},
 onRemove = () => {},
 children,
 icon,
 headerContent,
 hasAI,
 onRegenerate,
 aiCost,
 aiDisabled,
 aiDisabledReason,
}) => {
 const [isSubtitleOpen, setIsSubtitleOpen] = useState(false);

 const words = widget.title.split(" ");
 const formattedTitle = words.length >= 2 ? (
  <>
   {words[0]}<br/>{words.slice(1).join(" ")}
  </>
 ) : (
  widget.title
 );

 
 const description = WIDGET_DESCRIPTIONS[widget.id] || {
  short: "INTERACTIVE SOURCE PREVIEW RETAINED AS IDEA-BANK.",
  detailed: "View raw data streams and historical references before promoting components to the main dashboard."
 };

 return (
  <div
   className="vt-widget open"
   style={{ "--widget-color": widget.headerColor } as any}
  >
   <div className="vt-widget-header">
    <div className="left">
     <div className="icon-rail">
      {icon || <Layers size={22} />}
     </div>
     <span className="title">{formattedTitle}</span>
    </div>

    {headerContent && (
     <div className="header-extra" onClick={(e) => e.stopPropagation()} style={{ flex: 1, display: "flex", justifyContent: "center" }}>
      {headerContent}
     </div>
    )}

    <div className="toggle flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
     {canEdit && editMode ?
      <div className="flex flex-col gap-1 mr-1">
       <div className="flex items-center gap-1">
        <button
         onClick={onCycleSize}
         className="widget-header-btn"
         title="Go Wider">
         <span className="text-[8px] font-black">+W</span>
        </button>
        <button
         onClick={onDecSize}
         className="widget-header-btn"
         title="Go Smaller">
         <span className="text-[8px] font-black">-W</span>
        </button>
       </div>
       <div className="flex items-center gap-1">
        <button
         onClick={onCycleHeight}
         className="widget-header-btn"
         title="Go Taller">
         <span className="text-[8px] font-black">+H</span>
        </button>
        <button
         onClick={onDecHeight}
         className="widget-header-btn"
         title="Go Shorter">
         <span className="text-[8px] font-black">-H</span>
        </button>
       </div>
      </div>
     : null}
     
     {hasAI && (
      <div className="flex items-center gap-1.5 mr-1">
       {typeof aiCost === "number" && (
        <span className="widget-ai-cost-chip">{aiCost}T</span>
       )}
       <button
        className="widget-header-btn ai-btn"
        title={aiDisabled && aiDisabledReason ? aiDisabledReason : "Regenerate with AI"}
        onClick={onRegenerate}
        disabled={aiDisabled}>
        <VTLottie
         animationUrl="https://assets3.lottiefiles.com/packages/lf20_m6cu8sh9.json"
         size={16}
        />
       </button>
      </div>
     )}

      <div className="flex flex-row items-center gap-1">
        <button
          type="button"
          onClick={() => setIsSubtitleOpen(!isSubtitleOpen)}
          className={`widget-header-btn ${isSubtitleOpen ? "is-active" : ""}`}
          aria-label="Help"
          title="Toggle Info"
        >
          <CircleQuestionMark size={13} strokeWidth={2.5} />
        </button>

        {canEdit && editMode && (
          <button
            type="button"
            onClick={onRemove}
            className="widget-header-btn is-danger"
            aria-label="Close"
            title="Remove widget"
          >
            <X size={13} strokeWidth={2.5} />
          </button>
        )}

        {canEdit && editMode && (
          <button
            type="button"
            className="widget-header-btn cursor-grab active:cursor-grabbing"
            aria-label="Drag"
            title="Drag to reorder"
          >
            <GripVertical size={13} strokeWidth={2.5} />
          </button>
        )}

        <button
          type="button"
          onClick={onToggleCollapse}
          className="widget-header-btn"
          aria-label="Minimize"
          title="Toggle Collapse"
        >
          <Minus size={13} strokeWidth={2.5} />
        </button>
      </div>
    </div>
   </div>

   <div className={`widget-subtitle ${isSubtitleOpen ? 'open' : ''}`}>
    <div className="widget-subtitle-content" style={{ flexDirection: "column", alignItems: "flex-start", gap: "2px" }}>
     <div style={{ fontWeight: 900, textTransform: "uppercase", fontSize: "12px", lineHeight: 1.2 }}>
      {description.short}
     </div>
     <div style={{ fontWeight: 600, fontSize: "11px", opacity: 0.7, lineHeight: 1.3, textTransform: "none" }}>
      {description.detailed}
     </div>
    </div>
   </div>

   <div className="vt-widget-content">
    <div className="vt-widget-body">{children}</div>
   </div>
  </div>
 )
}
