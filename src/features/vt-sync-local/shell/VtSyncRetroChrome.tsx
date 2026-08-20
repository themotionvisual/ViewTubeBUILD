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

export const RetroVuMeter: React.FC<{ tone: string; percent: number }> = ({ tone, percent }) => (
 <span
  className="vt-retro-vu"
  style={{ "--tone": tone, "--fill": `${Math.max(0, Math.min(100, percent))}%` } as React.CSSProperties}
 >
  <i />
 </span>
)
