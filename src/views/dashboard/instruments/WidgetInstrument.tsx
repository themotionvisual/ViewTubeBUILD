import React from "react"
import type { WidgetInstrumentArchetype, WidgetInstrumentSignal, WidgetInstrumentStage } from "./types"
import "./widgetInstruments.css"

export const WidgetInstrument: React.FC<{
  archetype: WidgetInstrumentArchetype
  label: string
  summary: string
  compact?: boolean
  children: React.ReactNode
}> = ({ archetype, label, summary, compact = false, children }) => (
  <section className={`widget-instrument is-${archetype} ${compact ? "is-compact" : ""}`.trim()} aria-label={label}>
    <header className="widget-instrument__heading">
      <strong>{label}</strong>
      <span>{summary}</span>
    </header>
    <div className="widget-instrument__model">{children}</div>
  </section>
)

export const InstrumentStages: React.FC<{
  stages: readonly WidgetInstrumentStage[]
  activeId?: string
}> = ({ stages, activeId }) => (
  <ol className="widget-instrument__stages">
    {stages.map((stage, index) => {
      const state = stage.id === activeId ? "active" : stage.state || "idle"
      return <li key={stage.id} data-state={state}>
        <div aria-current={state === "active" ? "step" : undefined}><b>{index + 1}</b><span><strong>{stage.label}</strong>{stage.detail ? <small>{stage.detail}</small> : null}</span></div>
      </li>
    })}
  </ol>
)

export const InstrumentSignals: React.FC<{
  signals: readonly WidgetInstrumentSignal[]
  selectedId?: string
}> = ({ signals, selectedId }) => (
  <div className="widget-instrument__signals">
    {signals.map((signal) => <div
      key={signal.id}
      data-direction={signal.direction || "neutral"}
      data-selected={signal.id === selectedId}
      style={{ "--instrument-intensity": Math.max(0.08, Math.min(1, signal.intensity ?? .5)) } as React.CSSProperties}
    >
      <span>{signal.label}</span><strong>{signal.value}</strong>
    </div>)}
  </div>
)

export const InstrumentExplanation: React.FC<{
  purpose: string
  process: string
  result: string
}> = ({ purpose, process, result }) => (
  <div className="widget-instrument__explanation">
    <strong className="widget-instrument__explanation-title">HOW THIS SYSTEM WORKS</strong>
    <dl><div><dt>PURPOSE</dt><dd>{purpose}</dd></div><div><dt>PROCESS</dt><dd>{process}</dd></div><div><dt>RESULT</dt><dd>{result}</dd></div></dl>
  </div>
)
