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

const executionStatusClass = (status: RetroSyncExecutionStatus) =>
 status === "running" ? "is-syncing"
 : status === "queued" ? "is-waiting"
 : status === "complete" ? "is-completed"
 : status === "partial" ? "is-partial"
 : status === "failed" ? "is-failed"
 : ""

const executionStatusLabel = (status: RetroSyncExecutionStatus, idleLabel: string) =>
 status === "running" ? "SYNCING"
 : status === "queued" ? "QUEUED"
 : status === "complete" ? "COMPLETE"
 : status === "partial" ? "PARTIAL"
 : status === "failed" ? "FAILED"
 : idleLabel

export const RetroAnalogToggle: React.FC<{
 label: string
 active: boolean
 onChange: (next: boolean) => void
 tone?: "green" | "cyan" | "yellow" | "red"
 disabled?: boolean
 className?: string
}> = ({ label, active, onChange, tone = "green", disabled = false, className = "" }) => (
 <button
  type="button"
  className={`vt-retro-analog-toggle is-${tone} ${active ? "is-on" : ""} ${className}`}
  data-active={active ? "true" : "false"}
  aria-pressed={active}
  disabled={disabled}
  onClick={() => onChange(!active)}
  title={`${label}: ${active ? "on" : "off"}`}
 >
  <span className="vt-retro-analog-toggle__plate" aria-hidden="true">
   <span className="vt-retro-analog-toggle__led"><i /></span>
   <span className="vt-retro-analog-toggle__track"><i /></span>
  </span>
  <span className="vt-retro-analog-toggle__label">{label}</span>
 </button>
)

export const RetroSyncExecutionSwitch: React.FC<{
 status: RetroSyncExecutionStatus
 idleLabel: string
 onClick?: () => void
 disabled?: boolean
 selected?: boolean
 onSelectedChange?: (next: boolean) => void
 selectionDisabled?: boolean
 selectionLabel?: string
 labelOverride?: string
 className?: string
}> = ({
 status,
 idleLabel,
 onClick,
 disabled = false,
 selected,
 onSelectedChange,
 selectionDisabled = false,
 selectionLabel = "Batch selection",
 labelOverride,
 className = "",
}) => {
 const statusClass = executionStatusClass(status)
 const statusLabel = labelOverride || executionStatusLabel(status, idleLabel)
 const isBusyState = status === "running" || status === "queued"
 const hasSelectionControl = typeof selected === "boolean" && Boolean(onSelectedChange)

 return (
  <div
   className={`vt-retro-pcb-group is-category-action ${status === "running" ? "is-active" : ""} ${statusClass} ${hasSelectionControl ? "has-batch-selection" : ""} ${selected ? "is-batch-selected" : ""} ${className}`}
   data-sync-status={status}
   data-batch-selected={selected ? "true" : "false"}
   style={{
    "--active-col": "var(--led-green)",
    "--active-col-rgb": "var(--led-green-rgb)",
   } as React.CSSProperties}
  >
   <div className="vt-retro-pcb-controls">
    <div className="vt-retro-dual-plate">
     <div className="led-rim vt-retro-status-led" aria-hidden="true">
      <div className="led-bulb" />
     </div>
     <button
      type="button"
      disabled={disabled || isBusyState || !onClick}
      onClick={onClick}
      className="switch-hitbox vt-retro-sync-hitbox"
      aria-pressed={status === "running"}
      title={`${statusLabel} Sync`}
      aria-label={`${statusLabel} Sync`}
     >
      <div className="sw-slide-track">
       <div className="sw-slide-nub" />
      </div>
     </button>
     {hasSelectionControl ? (
      <button
       type="button"
       disabled={selectionDisabled}
       onClick={() => onSelectedChange?.(!selected)}
       className="vt-retro-batch-hitbox"
       aria-pressed={selected}
       aria-label={`${selectionLabel}: ${selected ? "selected" : "not selected"}`}
       title={`${selectionLabel}: ${selected ? "selected" : "not selected"}`}
      >
       <span className="vt-retro-batch-track" aria-hidden="true">
        <i className="vt-retro-batch-nub" />
       </span>
      </button>
     ) : null}
     {hasSelectionControl ? (
      <div className="led-rim vt-retro-selection-led" aria-hidden="true">
       <div className="led-bulb" />
      </div>
     ) : null}
    </div>
   </div>
   <div className="comp-label">{statusLabel}</div>
  </div>
 )
}

export const RetroBatchSelectionSwitch: React.FC<{
 selected: boolean
 onChange: (next: boolean) => void
 label?: string
 disabled?: boolean
 className?: string
}> = ({ selected, onChange, label = "Include in batch", disabled = false, className = "" }) => (
 <button
  type="button"
  className={`vt-retro-batch-selector ${selected ? "is-selected" : ""} ${className}`}
  data-batch-selected={selected ? "true" : "false"}
  aria-pressed={selected}
  aria-label={`${label}: ${selected ? "selected" : "not selected"}`}
  title={`${label}: ${selected ? "selected" : "not selected"}`}
  disabled={disabled}
  onClick={() => onChange(!selected)}
 >
  <span className="vt-retro-batch-selector__plate" aria-hidden="true">
   <span className="vt-retro-batch-selector__led"><i /></span>
   <span className="vt-retro-batch-selector__track">
    <i className="vt-retro-batch-selector__nub" />
   </span>
  </span>
 </button>
)

export const RetroVuMeter: React.FC<{ tone: string; percent: number }> = ({ tone, percent }) => (
 <span
  className="vt-retro-vu"
  style={{ "--tone": tone, "--fill": `${Math.max(0, Math.min(100, percent))}%` } as React.CSSProperties}
 >
  <i />
 </span>
)
