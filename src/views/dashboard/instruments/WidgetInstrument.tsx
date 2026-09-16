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
  onSelect?: (stageId: string) => void
}> = ({ stages, activeId, onSelect }) => (
  <ol className="widget-instrument__stages">
    {stages.map((stage, index) => {
      const state = stage.id === activeId ? "active" : stage.state || "idle"
      const content = <><b>{index + 1}</b><span><strong>{stage.label}</strong>{stage.detail ? <small>{stage.detail}</small> : null}</span></>
      return <li key={stage.id} data-state={state}>
        {onSelect ? <button type="button" onClick={() => onSelect(stage.id)} aria-current={state === "active" ? "step" : undefined}>{content}</button> : <div>{content}</div>}
      </li>
    })}
  </ol>
)

export const InstrumentSignals: React.FC<{
  signals: readonly WidgetInstrumentSignal[]
  selectedId?: string
  onSelect?: (signalId: string) => void
}> = ({ signals, selectedId, onSelect }) => (
  <div className="widget-instrument__signals">
    {signals.map((signal) => <button
      type="button"
      key={signal.id}
      data-direction={signal.direction || "neutral"}
      data-selected={signal.id === selectedId}
      style={{ "--instrument-intensity": Math.max(0.08, Math.min(1, signal.intensity ?? .5)) } as React.CSSProperties}
      onClick={() => onSelect?.(signal.id)}
      disabled={!onSelect}
    >
      <span>{signal.label}</span><strong>{signal.value}</strong>
    </button>)}
  </div>
)

export const InstrumentExplanation: React.FC<{
  purpose: string
  process: string
  result: string
}> = ({ purpose, process, result }) => (
  <details className="widget-instrument__explanation">
    <summary>HOW THIS SYSTEM WORKS</summary>
    <dl><div><dt>PURPOSE</dt><dd>{purpose}</dd></div><div><dt>PROCESS</dt><dd>{process}</dd></div><div><dt>RESULT</dt><dd>{result}</dd></div></dl>
  </details>
)
