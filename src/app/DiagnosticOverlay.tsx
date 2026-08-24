// On-screen diagnostic overlay — visible feed of the diagnostic buffer for
// mobile users who can't reach the browser console. Toggle via URL param
// `?vtDiagnostics=1` or by running `localStorage.setItem("vt_diagnostics","1")`
// in a desktop console once.
//
// This exists because the diagnostic system already collects long-task
// summaries, fetch timings, boot phases, and reportDiagnostic() entries into
// an in-memory buffer, but the only surface for reading it is the console —
// which is unreachable from a phone without Mac + USB. The overlay renders
// the buffer inline, refreshes every 500ms, and stays out of the way
// (bottom-right, small, dismissible) until asked to expand.
//
// Not wired into production sessions unless diagnostics are explicitly
// enabled, so shipping this does not affect regular users.

import React, { useEffect, useState } from "react"
import type { DiagnosticEntry } from "../services/diagnostics"
import { readDiagnostics } from "../services/diagnostics"

const LEVEL_COLOR: Record<DiagnosticEntry["level"], string> = {
 info: "#8b91a3",
 warn: "#ffab58",
 error: "#f87171",
}

const fmtTime = (ms: number): string => {
 if (ms < 1000) return `${ms}ms`
 return `${(ms / 1000).toFixed(1)}s`
}

export const DiagnosticOverlay: React.FC = () => {
 const [entries, setEntries] = useState<readonly DiagnosticEntry[]>([])
 const [expanded, setExpanded] = useState(false)
 const [copyState, setCopyState] = useState<"idle" | "copied">("idle")

 useEffect(() => {
  const tick = () => setEntries(readDiagnostics())
  tick()
  const id = window.setInterval(tick, 500)
  return () => window.clearInterval(id)
 }, [])

 const warnCount = entries.filter((e) => e.level === "warn").length
 const errCount = entries.filter((e) => e.level === "error").length

 const copyAll = () => {
  const text = entries
   .map((e) => `[${fmtTime(e.lastSeen)}] ${e.level.toUpperCase()} ${e.tag}: ${e.message}${e.count > 1 ? ` (x${e.count})` : ""}`)
   .join("\n")
  const done = () => {
   setCopyState("copied")
   window.setTimeout(() => setCopyState("idle"), 1200)
  }
  if (navigator.clipboard?.writeText) {
   navigator.clipboard.writeText(text).then(done).catch(done)
  } else {
   const ta = document.createElement("textarea")
   ta.value = text
   document.body.appendChild(ta)
   ta.select()
   try {
    document.execCommand("copy")
    done()
   } catch {
    /* no-op */
   }
   ta.remove()
  }
 }

 const containerStyle: React.CSSProperties = {
  position: "fixed",
  right: 8,
  bottom: 8,
  zIndex: 2147483000, // above everything else in the app
  fontFamily: "ui-monospace, 'SF Mono', 'Menlo', monospace",
  fontSize: 11,
  lineHeight: 1.3,
  color: "#e8eaf0",
  background: "rgba(11,13,19,0.92)",
  border: "1px solid rgba(140,140,155,0.35)",
  borderRadius: 8,
  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
  backdropFilter: "blur(6px)",
  WebkitBackdropFilter: "blur(6px)",
  pointerEvents: "auto",
  maxWidth: expanded ? "min(94vw, 460px)" : "160px",
  maxHeight: expanded ? "min(70vh, 480px)" : "36px",
  transition: "max-width 160ms ease, max-height 160ms ease",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
 }

 const headerStyle: React.CSSProperties = {
  padding: "8px 10px",
  display: "flex",
  gap: 8,
  alignItems: "center",
  justifyContent: "space-between",
  cursor: "pointer",
  userSelect: "none",
  borderBottom: expanded ? "1px solid rgba(140,140,155,0.25)" : "none",
 }

 const badgeStyle = (color: string): React.CSSProperties => ({
  display: "inline-block",
  padding: "1px 5px",
  borderRadius: 3,
  fontSize: 10,
  fontWeight: 600,
  color,
  background: `${color}22`,
 })

 return (
  <div style={containerStyle} role="region" aria-label="ViewTube diagnostics">
   <div
    style={headerStyle}
    onClick={() => setExpanded((v) => !v)}
    aria-expanded={expanded}
   >
    <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
     <span style={{ letterSpacing: "0.08em", fontWeight: 600 }}>DIAG</span>
     <span style={{ opacity: 0.6 }}>{entries.length}</span>
     {warnCount > 0 && <span style={badgeStyle(LEVEL_COLOR.warn)}>{warnCount}w</span>}
     {errCount > 0 && <span style={badgeStyle(LEVEL_COLOR.error)}>{errCount}e</span>}
    </span>
    <span style={{ opacity: 0.5 }}>{expanded ? "▾" : "▴"}</span>
   </div>

   {expanded && (
    <>
     <div style={{ display: "flex", gap: 6, padding: "6px 10px", borderBottom: "1px solid rgba(140,140,155,0.25)" }}>
      <button
       type="button"
       onClick={(e) => { e.stopPropagation(); copyAll() }}
       style={{
        all: "unset",
        cursor: "pointer",
        padding: "3px 8px",
        borderRadius: 4,
        background: copyState === "copied" ? "rgba(186,250,53,0.2)" : "rgba(140,140,155,0.15)",
        color: copyState === "copied" ? "#bafa35" : "#e8eaf0",
        fontSize: 10,
        letterSpacing: "0.05em",
       }}
      >
       {copyState === "copied" ? "COPIED" : "COPY ALL"}
      </button>
      <span style={{ opacity: 0.5, fontSize: 10, alignSelf: "center" }}>
       tap header to collapse
      </span>
     </div>

     <div
      style={{
       overflowY: "auto",
       overflowX: "hidden",
       WebkitOverflowScrolling: "touch",
       padding: "6px 10px 10px",
       display: "flex",
       flexDirection: "column-reverse",
       gap: 4,
      }}
      onClick={(e) => e.stopPropagation()}
     >
      {entries.length === 0 ? (
       <div style={{ opacity: 0.55, padding: "12px 4px", textAlign: "center" }}>
        No diagnostics yet — trigger login or other action.
       </div>
      ) : (
       entries.map((e, i) => (
        <div
         key={`${e.firstSeen}-${e.tag}-${i}`}
         style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: 6,
          borderLeft: `2px solid ${LEVEL_COLOR[e.level]}`,
          paddingLeft: 6,
         }}
        >
         <span style={{ color: "#8b91a3", fontVariantNumeric: "tabular-nums" }}>
          {fmtTime(e.lastSeen)}
         </span>
         <span style={{ minWidth: 0 }}>
          <span style={{ color: LEVEL_COLOR[e.level], fontWeight: 600 }}>{e.tag}</span>
          {e.count > 1 && <span style={{ color: "#8b91a3" }}> ×{e.count}</span>}
          <span style={{ display: "block", color: "#cfd3df", overflowWrap: "anywhere" }}>
           {e.message}
          </span>
         </span>
        </div>
       ))
      )}
     </div>
    </>
   )}
  </div>
 )
}
