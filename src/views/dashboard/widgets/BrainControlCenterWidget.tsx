import React, { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Brain, Radio, Cpu, Database, RefreshCw, Download, Pause, Play, X, Waves } from "lucide-react"
import { WidgetShell } from "../WidgetShell"
import {
  WidgetHeaderToggle,
  WidgetSection,
  WidgetFooter,
  WidgetWorkflowMain,
} from "../WidgetPrimitives"
import { useLiveSignals, pushSignal } from "../../../features/brain-control/signalBuffer"
import { reflectAndCompress } from "../../../services/brain/Core"

/**
 * BrainControlCenterWidget — rewritten to use the shared widget vocabulary.
 * WidgetHeaderToggle switches between Map / Signals / Sources views so the
 * body always shows one focused panel instead of the previous 4-quadrant
 * grid. Every color derives from --widget-color / --widget-border.
 */

const SPOKE_NODES = [
  { key: "adaptive",  label: "Adaptive" },
  { key: "hub",       label: "Hub" },
  { key: "oracle",    label: "Oracle" },
  { key: "nexus",     label: "Nexus" },
  { key: "super",     label: "Super Tools" },
  { key: "ledger",    label: "Ledger" },
  { key: "profile",   label: "Profile" },
  { key: "workflows", label: "Workflows" },
  { key: "assets",    label: "Assets" },
  { key: "analysis",  label: "Analysis" },
] as const

const MEMORY_FIELDS = [
  { key: "identity", label: "Identity" },
  { key: "dna",      label: "Content DNA" },
  { key: "ledger",   label: "Performance Ledger" },
  { key: "future",   label: "Future-State Map" },
] as const

type ViewMode = "map" | "signals" | "sources"

const computeThroughput = (signals: { ts: number; tool: string }[]): Record<string, number> => {
  const cutoff = Date.now() - 60_000
  const counts: Record<string, number> = {}
  for (const s of signals) {
    if (s.ts < cutoff) continue
    for (const node of SPOKE_NODES) {
      if (s.tool.toLowerCase().includes(node.key)) counts[node.key] = (counts[node.key] || 0) + 1
    }
  }
  return counts
}

const NeuralMap: React.FC<{
  selected: string | null
  onSelect: (key: string | null) => void
  throughput: Record<string, number>
}> = ({ selected, onSelect, throughput }) => {
  const W = 320, H = 220
  const cx = W / 2, cy = H / 2
  const R = Math.min(cx, cy) - 26
  const positions = SPOKE_NODES.map((n, i) => {
    const angle = (i / SPOKE_NODES.length) * Math.PI * 2 - Math.PI / 2
    return { key: n.key, label: n.label, x: cx + Math.cos(angle) * R, y: cy + Math.sin(angle) * R }
  })
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" className="brain-map-svg">
      {positions.map((p) => {
        const rate = throughput[p.key] || 0
        const width = 1 + Math.min(6, rate * 0.6)
        const opacity = 0.35 + Math.min(0.55, rate * 0.05)
        return (
          <line
            key={"e-" + p.key} x1={cx} y1={cy} x2={p.x} y2={p.y}
            className={rate === 0 ? "brain-edge is-dim" : "brain-edge is-live"}
            strokeWidth={width} strokeOpacity={opacity}
          />
        )
      })}
      <circle cx={cx} cy={cy} r={22} className="brain-core" />
      <text x={cx} y={cy + 4} textAnchor="middle" className="brain-core-label">BRAIN</text>
      {positions.map((p) => {
        const isSel = selected === p.key
        return (
          <g key={"n-" + p.key} style={{ cursor: "pointer" }} onClick={() => onSelect(isSel ? null : p.key)}>
            <circle cx={p.x} cy={p.y} r={isSel ? 12 : 10} className={isSel ? "brain-node is-selected" : "brain-node"} />
            <text x={p.x} y={p.y + 22} textAnchor="middle" className="brain-node-label">{p.label}</text>
          </g>
        )
      })}
    </svg>
  )
}

export const BrainControlCenterWidget: React.FC<any> = ({ data, widget, instance, editMode, onToggleCollapse, onCycleSize, onDecSize, onCycleHeight, onDecHeight, onRemove }) => {
  const common = { widget, instance, editMode, canEdit: true, onToggleCollapse, onCycleSize, onDecSize, onCycleHeight, onDecHeight, onRemove }

  const [view, setView] = useState<ViewMode>("map")
  const [paused, setPaused] = useState(false)
  const [filter, setFilter] = useState("")
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [reflectingField, setReflectingField] = useState<string | null>(null)

  const signals = useLiveSignals(160)
  const throughput = useMemo(() => computeThroughput(signals), [signals])
  const brain = data?.brain
  const channelName = data?.channelTitle || "(no channel)"
  const isSyncing = data?.isSyncing
  const lastSync = data?.lastSyncComplete ? new Date(data.lastSyncComplete).toLocaleString() : "never"

  const superTools = [
    { key: "gemini",    label: "Gemini",      status: "ok" },
    { key: "youtube",   label: "YouTube API", status: isSyncing ? "warn" : "ok" },
    { key: "analytics", label: "Analytics",   status: "ok" },
    { key: "veo",       label: "Veo",         status: "off" },
    { key: "imagen",    label: "Imagen",      status: "off" },
    { key: "vault",     label: "Vault (IDB)", status: "ok" },
  ] as const

  const dataSources = [
    { key: "vt-sync",   label: "vt-sync analytics",   rows: data?.dailySeries?.length || 0, health: "ok",   fresh: lastSync },
    { key: "bootstrap", label: "Data API bootstrap",  rows: data?.initialBootstrap?.videos?.length || 0, health: brain?.channelProfile ? "ok" : "warn", fresh: lastSync },
    { key: "brain",     label: "Brain memory shards", rows: Object.keys(brain || {}).length, health: brain ? "ok" : "off",  fresh: brain?.updatedAt ? new Date(brain.updatedAt).toLocaleString() : "n/a" },
    { key: "signals",   label: "Signal buffer",       rows: signals.length, health: "ok", fresh: signals[signals.length - 1] ? new Date(signals[signals.length - 1].ts).toLocaleTimeString() : "empty" },
  ] as const

  const runReflection = async (field: string) => {
    setReflectingField(field)
    pushSignal({ tool: "brain-control-center", event: `reflection.request.${field}` })
    try { await reflectAndCompress() } catch { /* noop */ }
    finally { setReflectingField(null) }
  }
  const reflectAll = async () => {
    for (const f of MEMORY_FIELDS) await runReflection(f.key)
  }
  const exportState = () => {
    const payload = { generatedAt: new Date().toISOString(), signals, brainSnapshot: brain, sources: dataSources }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob); a.download = `brain-state-${Date.now()}.json`; a.click()
    URL.revokeObjectURL(a.href)
  }

  const headerContent = (
    <WidgetHeaderToggle
      label="Brain view"
      value={view}
      onChange={(v) => setView(v as ViewMode)}
      items={[
        { id: "map",     label: "Map" },
        { id: "signals", label: "Signals" },
        { id: "sources", label: "Sources" },
      ]}
    />
  )

  const filteredSignals = signals.filter((s) => !filter || s.tool.includes(filter) || s.event.includes(filter)).slice(-100).reverse()

  return (
    <WidgetShell {...common} icon={<Brain size={22} />} headerContent={headerContent}>
      <motion.div layout className="widget-workspace brain-workspace">
        <WidgetWorkflowMain className="brain-main">

          {view === "map" && (
            <div className="brain-map-container">
              <WidgetSection surface="subtle" className="brain-map-panel">
                <div className="brain-map-head">
                  <span>Neural map · {channelName}</span>
                </div>
                <div className="brain-map-body">
                  <NeuralMap selected={selectedNode} onSelect={setSelectedNode} throughput={throughput} />
                  {selectedNode && (
                    <div className="brain-map-inspector">
                      <div className="brain-map-inspector-head">
                        <span>{SPOKE_NODES.find((n) => n.key === selectedNode)?.label}</span>
                        <button type="button" className="vt-button is-icon-only" onClick={() => setSelectedNode(null)} aria-label="Close inspector">
                          <X size={11} />
                        </button>
                      </div>
                      <div className="brain-map-inspector-body">
                        Throughput · <b>{throughput[selectedNode] || 0}</b> signals / 60s
                      </div>
                      <button
                        type="button"
                        className="vt-button"
                        onClick={() => { setFilter(selectedNode); setView("signals"); setSelectedNode(null) }}
                      >Filter signals</button>
                    </div>
                  )}
                </div>
              </WidgetSection>

              <WidgetSection surface="subtle" className="brain-memory-panel">
                <div className="brain-memory-head">
                  <span>Memory fields</span>
                  <button type="button" className="vt-button" onClick={reflectAll} disabled={reflectingField !== null}>
                    <RefreshCw size={12} />
                    {reflectingField ? "Reflecting…" : "Reflect all"}
                  </button>
                </div>
                <div className="brain-memory-list">
                  {MEMORY_FIELDS.map((m) => (
                    <div key={m.key} className="brain-memory-row">
                      <span className="brain-memory-label">{m.label}</span>
                      <button
                        type="button"
                        className="vt-button"
                        onClick={() => runReflection(m.key)}
                        disabled={reflectingField === m.key}
                      >{reflectingField === m.key ? "…" : "Reflect"}</button>
                    </div>
                  ))}
                </div>
              </WidgetSection>
            </div>
          )}

          {view === "signals" && (
            <div className="brain-signals-container">
              <WidgetSection surface="subtle" className="brain-signals-head">
                <Radio size={13} />
                <input
                  className="vt-input"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="filter tool or event"
                />
                <button type="button" className="vt-button is-icon-only" onClick={() => setPaused((p) => !p)} aria-label={paused ? "Resume" : "Pause"}>
                  {paused ? <Play size={11} /> : <Pause size={11} />}
                </button>
              </WidgetSection>
              <div className="brain-signals-list">
                {filteredSignals.length === 0 ? (
                  <div className="brain-signals-empty">
                    No signals yet · call pushSignal({"{ tool, event }"}) from any tool.
                  </div>
                ) : filteredSignals.map((s, i) => (
                  <div key={s.ts + "-" + i} className="brain-signal-row">
                    <span className="brain-signal-time">{new Date(s.ts).toLocaleTimeString()}</span>
                    <span className="brain-signal-tool">{s.tool}</span>
                    <span className="brain-signal-event">{s.event}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === "sources" && (
            <div className="brain-sources-container">
              <WidgetSection surface="subtle" className="brain-sources-panel">
                <div className="brain-sources-head">
                  <Cpu size={13} />Super tools
                </div>
                <div className="brain-sources-grid">
                  {superTools.map((t) => (
                    <div key={t.key} className="brain-source-row">
                      <span className="brain-source-label">{t.label}</span>
                      <span className={`brain-source-dot is-${t.status}`} />
                    </div>
                  ))}
                </div>
              </WidgetSection>
              <WidgetSection surface="subtle" className="brain-sources-panel">
                <div className="brain-sources-head">
                  <Database size={13} />Data nexus
                </div>
                <div className="brain-sources-grid is-wide">
                  {dataSources.map((s) => (
                    <div key={s.key} className="brain-source-row is-wide">
                      <span className={`brain-source-dot is-${s.health}`} />
                      <span className="brain-source-label">{s.label}</span>
                      <span className="brain-source-meta">{s.rows} rows · {s.fresh}</span>
                    </div>
                  ))}
                </div>
              </WidgetSection>
            </div>
          )}
        </WidgetWorkflowMain>

        <WidgetFooter divider={false} className="brain-footer">
          <span className="brain-footer-meta"><Waves size={11} />{signals.length} signals in buffer{paused ? " · paused" : ""}</span>
          <button type="button" className="vt-button" onClick={exportState}>
            <Download size={12} />Export state
          </button>
        </WidgetFooter>
      </motion.div>
    </WidgetShell>
  )
}
