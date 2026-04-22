import React, { useState, useEffect } from "react"
import { WidgetShell } from "../WidgetShell"
import { Check, Rocket, RotateCcw } from "lucide-react"

const STORAGE_KEY = "vt_flight_check"

const DEFAULT_ITEMS = [
 { text: "Rendered in 4K/1080p", done: false },
 { text: "Thumbnail A/B Uploaded", done: false },
 { text: "Tags & Description SEO", done: false },
 { text: "Cards & End Screens", done: false },
 { text: "Community Post Drafted", done: false },
 { text: "Monetization Checks Pass", done: false },
]

export const FlightCheckWidget = ({
 widget, instance, editMode, onToggleCollapse, onCycleSize, onRemove, data,
}: any) => {
 const common = { widget, instance, editMode, canEdit: true, onToggleCollapse, onCycleSize, onRemove }
 const [items, setItems] = useState(() => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") || DEFAULT_ITEMS }
  catch { return DEFAULT_ITEMS }
 })

 useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) }, [items])

 const toggle = (idx: number) => {
  setItems((prev: any) => prev.map((item: any, i: number) => i === idx ? { ...item, done: !item.done } : item))
 }
 const reset = () => setItems(DEFAULT_ITEMS)
 const doneCount = items.filter((i: any) => i.done).length
 const pct = Math.round((doneCount / items.length) * 100)
 const allDone = pct === 100

 return (
  <WidgetShell {...common} icon={<Check size={22} />}>
   <div style={{ display: "flex", flexDirection: "column", gap: "8px", height: "100%" }}>
    {/* Progress Bar */}
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
     <div style={{ flex: 1, height: "14px", background: "#eee", borderRadius: "7px", border: "2px solid #000", overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: allDone ? "#4FFF5B" : "repeating-linear-gradient(45deg, #FFE357, #FFE357 6px, #FFCC00 6px, #FFCC00 12px)", transition: "width 0.3s" }} />
     </div>
     <span style={{ fontSize: "12px", fontWeight: 1000, minWidth: "36px" }}>{pct}%</span>
    </div>

    {/* Checklist */}
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
     {items.map((item: any, idx: number) => (
      <div
       key={idx}
       onClick={() => toggle(idx)}
       style={{
        display: "flex", alignItems: "center", gap: "8px", padding: "6px 8px",
        background: item.done ? "rgba(79,255,91,0.1)" : "#fff",
        border: "2px solid #000", borderRadius: "8px", cursor: "pointer",
        transition: "all 0.15s",
       }}>
       <div style={{
        width: "18px", height: "18px", border: "2px solid #000", borderRadius: "4px",
        background: item.done ? "#4FFF5B" : "#fff", display: "flex", alignItems: "center",
        justifyContent: "center", flexShrink: 0, boxShadow: item.done ? "none" : "inset 1px 1px 0 rgba(0,0,0,0.1)",
       }}>
        {item.done && <Check size={12} strokeWidth={4} />}
       </div>
       <span style={{
        fontSize: "11px", fontWeight: 900, textTransform: "uppercase",
        opacity: item.done ? 0.4 : 1, textDecoration: item.done ? "line-through" : "none",
       }}>{item.text}</span>
      </div>
     ))}
    </div>

    {/* Actions */}
    <div style={{ display: "flex", gap: "6px" }}>
     <button
      disabled={!allDone}
      style={{
       flex: 1, height: "36px", border: "2px solid #000", borderRadius: "8px",
       background: allDone ? "#4FFF5B" : "#eee", fontSize: "10px", fontWeight: 1000,
       textTransform: "uppercase", cursor: allDone ? "pointer" : "not-allowed",
       display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
       boxShadow: "2px 2px 0 0 #000", opacity: allDone ? 1 : 0.5,
      }}>
      <Rocket size={14} /> Publish
     </button>
     <button onClick={reset} style={{
      width: "36px", height: "36px", border: "2px solid #000", borderRadius: "8px",
      background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
     }}>
      <RotateCcw size={14} />
     </button>
    </div>
   </div>
  </WidgetShell>
 )
}
