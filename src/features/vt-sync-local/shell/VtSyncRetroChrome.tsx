import React from "react"
import "./VtSyncRetroChrome.css"

export const RetroRivets: React.FC = () => (
 <>
  <span className="vt-retro-rivet vt-retro-rivet--tl" aria-hidden="true" />
  <span className="vt-retro-rivet vt-retro-rivet--tr" aria-hidden="true" />
  <span className="vt-retro-rivet vt-retro-rivet--bl" aria-hidden="true" />
  <span className="vt-retro-rivet vt-retro-rivet--br" aria-hidden="true" />
 </>
)

export type RetroLedSpec = {
 id: string
 label: string
 tone: string
 lit: boolean
 pulse?: boolean
}

export const RetroLedRow: React.FC<{ leds: RetroLedSpec[] }> = ({ leds }) => (
 <div className="vt-retro-led-row" role="status" aria-label="Sync status lights">
  {leds.map((led) => (
   <span
    key={led.id}
    className={`vt-retro-led ${led.lit ? "is-lit" : ""} ${led.pulse ? "is-pulse" : ""}`}
    style={{ color: led.tone }}
    title={led.label}
   />
  ))}
 </div>
)

export const RetroLcd: React.FC<{ tone: string; children: React.ReactNode; className?: string }> = ({ tone, children, className = "" }) => (
 <span className={`vt-retro-lcd ${className}`} style={{ "--tone": tone } as React.CSSProperties}>
  {children}
 </span>
)

export type RetroSyncExecutionStatus = "idle" | "queued" | "running" | "complete" | "partial" | "failed"

export const RetroSyncExecutionSwitch: React.FC<{
 status: RetroSyncExecutionStatus
 idleLabel: string
 onClick?: () => void
 disabled?: boolean
}> = ({ status, idleLabel, onClick, disabled = false }) => {
 const statusClass =
  status === "running" ? "is-syncing"
  : status === "queued" ? "is-waiting"
  : status === "complete" ? "is-completed"
  : status === "partial" ? "is-partial"
  : status === "failed" ? "is-failed"
  : ""
 const statusLabel =
  status === "running" ? "RUNNING"
  : status === "queued" ? "QUEUED"
  : status === "complete" ? "DONE"
  : status === "partial" ? "PARTIAL"
  : status === "failed" ? "FAILED"
  : idleLabel
 const isBusyState = status === "running" || status === "queued"

 return (
  <div
   className={`vt-retro-pcb-group is-category-action ${status === "running" ? "is-active" : ""} ${statusClass}`}
   data-sync-status={status}
   style={{
    "--active-col": "var(--led-green)",
    "--active-col-rgb": "var(--led-green-rgb)",
   } as React.CSSProperties}
  >
   <div className="vt-retro-pcb-controls">
    <button
     type="button"
     disabled={disabled || isBusyState || !onClick}
     onClick={onClick}
     className="switch-hitbox"
     aria-pressed={status === "running"}
     title={`${statusLabel} Sync`}
     aria-label={`${statusLabel} Sync`}
    >
     <div className="sw-slide-housing">
      <div className="sw-slide-track">
       <div className="sw-slide-nub" />
      </div>
      <div className="led-rim" aria-hidden="true">
       <div className="led-bulb" />
      </div>
     </div>
    </button>
   </div>
   <div className="comp-label">{statusLabel}</div>
  </div>
 )
}

export const RetroVuMeter: React.FC<{ tone: string; percent: number }> = ({ tone, percent }) => (
 <span
  className="vt-retro-vu"
  style={{ "--tone": tone, "--fill": `${Math.max(0, Math.min(100, percent))}%` } as React.CSSProperties}
 >
  <i />
 </span>
)
