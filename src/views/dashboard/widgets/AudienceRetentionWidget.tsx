import React from "react"
import { WidgetShell } from "../WidgetShell"
import { TrendingDown } from "lucide-react"
import { InstrumentExplanation, InstrumentSignals, WidgetInstrument } from "../instruments/WidgetInstrument"

export const AudienceRetentionWidget = ({ widget, instance, editMode, onToggleCollapse, onCycleSize, onDecSize, onCycleHeight, onDecHeight, onRemove }: any) => {
 const common = {
  widget,
  instance,
  editMode,
  canEdit: true,
  onToggleCollapse,
  onCycleSize,
  onRemove,
  onDecSize,
  onCycleHeight,
  onDecHeight,
 }

 // A mock SV curve for audience retention
 // Start 100%, sharp drop to 60%, slow slope to 30%, drop end screen to 15%
 const pathData = "M 0 10 C 10 10, 20 50, 30 50 C 60 60, 80 70, 95 85 L 100 85"

 return (
  <WidgetShell {...common} icon={<TrendingDown size={22} />} helpContent={
   <WidgetInstrument archetype="lens" label="RETENTION LENS" summary="FOLLOW VIEWER HOLD ACROSS THE VIDEO">
    <InstrumentSignals signals={[
     { id: "open", label: "Opening", value: "HOOK", direction: "neutral", intensity: 1 },
     { id: "average", label: "Middle", value: "HOLD", direction: "down", intensity: .5 },
     { id: "end", label: "End screen", value: "EXIT", direction: "down", intensity: .2 },
    ]} />
    <InstrumentExplanation purpose="Explain where viewer attention is retained or lost." process="The lens follows the retention curve from the opening hook through the end screen." result="Investigate sharp drops and use them to improve pacing, structure and future hooks." />
   </WidgetInstrument>
  }>
   <div
    style={{
     display: "flex",
     flexDirection: "column",
     height: "100%",
     gap: "8px",
    }}>
    <div
     style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
     }}>
     <span
      style={{ fontSize: "10px", fontWeight: 900, textTransform: "uppercase" }}>
      Avg Retention
     </span>
     <span style={{ fontSize: "16px", fontWeight: 1000, color: "#FF1744" }}>
      42.5%
     </span>
    </div>

    <div
     style={{
      flex: 1,
      position: "relative",
      border: "1px solid #000",
      borderRadius: "8px",
      background: "#fafafa",
      overflow: "hidden",
      display: "flex",
      alignItems: "flex-end",
      padding: "10px 0 0 0",
     }}>
     <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ width: "100%", height: "100%" }}>
      <linearGradient id="retention-grad" x1="0" y1="0" x2="0" y2="1">
       <stop offset="0%" stopColor="#C9F830" stopOpacity={0.8} />
       <stop offset="100%" stopColor="#C9F830" stopOpacity={0.1} />
      </linearGradient>
      <path d={`${pathData} L 100 100 L 0 100 Z`} fill="url(#retention-grad)" />
      <path
       d={pathData}
       fill="none"
       stroke="#000"
       strokeWidth="2"
       vectorEffect="non-scaling-stroke"
      />
     </svg>

     {/* Grid lines mock */}
     <div
      style={{
       position: "absolute",
       left: 0,
       top: "25%",
       width: "100%",
       borderTop: "1px dashed rgba(0,0,0,0.1)",
      }}
     />
     <div
      style={{
       position: "absolute",
       left: 0,
       top: "50%",
       width: "100%",
       borderTop: "1px dashed rgba(0,0,0,0.1)",
      }}
     />
     <div
      style={{
       position: "absolute",
       left: 0,
       top: "75%",
       width: "100%",
       borderTop: "1px dashed rgba(0,0,0,0.1)",
      }}
     />
    </div>
   </div>
  </WidgetShell>
 )
}
