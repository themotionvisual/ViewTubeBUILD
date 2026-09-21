import React, { useEffect, useMemo, useState } from "react"
import { Activity, BrainCircuit, CheckCircle2, CircleStop, Database, Eye, LockKeyhole, Play, ShieldCheck, SlidersHorizontal, Target, Wrench } from "lucide-react"
import { useBrain } from "../../../context/useBrain"
import { readBrainEngineControls, writeBrainEngineControls, type BrainEngineControls } from "../../../services/brain/BrainEngineControls"
import { readBrainUserControls, setActiveBrainControlChannel, writeBrainUserControls, type BrainUserControls } from "../../../services/brain/BrainUserControls"
import { WidgetShell } from "../WidgetShell"
import { WidgetBadge, WidgetLeftSplitButton, WidgetProgressBar, WidgetScrollArea, WidgetSizedButton, WidgetStepTabs, WidgetTextInput, WidgetToggleSwitch } from "../WidgetPrimitives"
import type { CommonWidgetProps } from "../types"
import type { DashboardData } from "../useDashboardData"
import "./BrainControlWidget.css"

type Page = "observe" | "direct" | "permissions" | "audit"
type DirectiveStatus = "idle" | "draft" | "awaiting-approval" | "approved" | "stopped"
type AuditOutcome = "info" | "approved" | "stopped" | "changed"
type AuditEntry = { id: string; at: string; action: string; detail: string; outcome: AuditOutcome }

const PAGES = [
  { id: "observe", label: "Observe" },
  { id: "direct", label: "Direct" },
  { id: "permissions", label: "Permissions" },
  { id: "audit", label: "Audit" },
] as const

const DEFAULT_OBJECTIVE = "Protect creator intent while preparing the next best action."
const channelKey = (channelId: string | null) => channelId?.trim() || "unbound"
const storageKey = (name: string, channelId: string | null) => `vt_brain_control_${name}_v1:${channelKey(channelId)}`
const hasStorage = () => typeof window !== "undefined" && typeof localStorage !== "undefined"
const readText = (key: string, fallback = "") => hasStorage() ? localStorage.getItem(key) || fallback : fallback
const readAudit = (channelId: string | null): AuditEntry[] => {
  if (!hasStorage()) return []
  try {
    const value = JSON.parse(localStorage.getItem(storageKey("audit", channelId)) || "[]")
    return Array.isArray(value) ? value.slice(0, 40) : []
  } catch { return [] }
}

export const BrainControlWidget: React.FC<CommonWidgetProps & { data: DashboardData; onNavigate?: (to: string) => void }> = ({ onNavigate, ...common }) => {
  const { authState, getBrainMemory } = useBrain()
  const channelId = authState.channelId || authState.channelHandle || null
  const [page, setPage] = useState<Page>("observe")
  const [controls, setControls] = useState<BrainUserControls>(() => readBrainUserControls(channelId))
  const [engines, setEngines] = useState<BrainEngineControls>(() => readBrainEngineControls(channelId))
  const [objective, setObjective] = useState(() => readText(storageKey("objective", channelId), DEFAULT_OBJECTIVE))
  const [directive, setDirective] = useState(() => readText(storageKey("directive", channelId)))
  const [status, setStatus] = useState<DirectiveStatus>("idle")
  const [audit, setAudit] = useState<AuditEntry[]>(() => readAudit(channelId))

  useEffect(() => {
    setActiveBrainControlChannel(channelId)
    setControls(readBrainUserControls(channelId))
    setEngines(readBrainEngineControls(channelId))
    setObjective(readText(storageKey("objective", channelId), DEFAULT_OBJECTIVE))
    setDirective(readText(storageKey("directive", channelId)))
    setStatus("idle")
    setAudit(readAudit(channelId))
  }, [channelId])

  const log = (action: string, detail: string, outcome: AuditOutcome) => {
    const entry: AuditEntry = { id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, at: new Date().toISOString(), action, detail, outcome }
    setAudit((current) => {
      const next = [entry, ...current].slice(0, 40)
      if (hasStorage()) localStorage.setItem(storageKey("audit", channelId), JSON.stringify(next))
      return next
    })
  }

  const updateControl = <K extends keyof BrainUserControls>(key: K, value: BrainUserControls[K]) => {
    setControls(writeBrainUserControls({ ...controls, [key]: value }, channelId))
    log("Permission changed", `${String(key)} set to ${String(value)}`, "changed")
  }
  const updateEngine = <K extends keyof BrainEngineControls>(key: K, value: BrainEngineControls[K]) => {
    setEngines(writeBrainEngineControls({ ...engines, [key]: value }, channelId))
    log("Tool scope changed", `${String(key)} set to ${String(value)}`, "changed")
  }

  const enabledTools = useMemo(() => [engines.channelIntelligence, engines.anomalyIntelligence, engines.opportunityIntelligence, engines.algorithmPriming, engines.videoPackages].filter(Boolean).length, [engines])
  const permissions = useMemo(() => [controls.allowAnalytics, controls.allowProjects, controls.allowComments, controls.allowVault, controls.allowPublisher].filter(Boolean).length, [controls])
  const memories = useMemo(() => {
    if (!controls.personalization) return 0
    const memory = getBrainMemory()
    return memory && typeof memory === "object" ? Object.keys(memory as unknown as Record<string, unknown>).length : 0
  }, [controls.personalization, getBrainMemory])
  const scopeReady = controls.enabled && enabledTools > 0 && permissions > 0
  const mode = !controls.enabled ? "OFFLINE" : status === "awaiting-approval" ? "APPROVAL" : status === "approved" ? "READY" : status === "stopped" ? "STOPPED" : "OBSERVE"

  const saveObjective = () => {
    const value = objective.trim() || DEFAULT_OBJECTIVE
    setObjective(value)
    if (hasStorage()) localStorage.setItem(storageKey("objective", channelId), value)
    log("Objective saved", value, "changed")
  }
  const stageDirective = () => {
    const value = directive.trim()
    if (!value || !scopeReady) return
    if (hasStorage()) localStorage.setItem(storageKey("directive", channelId), value)
    const next = controls.externalActionsRequireApproval ? "awaiting-approval" : "approved"
    setStatus(next)
    log("Directive staged", controls.externalActionsRequireApproval ? `${value} · creator approval required` : `${value} · approval gate disabled`, next === "approved" ? "approved" : "info")
  }
  const approve = () => { if (status === "awaiting-approval") { setStatus("approved"); log("Directive approved", directive, "approved") } }
  const stop = () => { if (status === "awaiting-approval" || status === "approved") { setStatus("stopped"); log("Directive stopped", directive, "stopped") } }

  const core = <section className="brain-control-core" aria-label="Governed Brain command core">
    <button type="button" className="brain-control-ring is-execution" onClick={() => setPage("audit")} aria-label={`Execution: ${mode}`}><span>EXECUTION</span><strong>{mode}</strong></button>
    <button type="button" className="brain-control-ring is-tools" onClick={() => setPage("permissions")} aria-label={`Tools: ${enabledTools} of 5 enabled`}><span>TOOLS</span><strong>{enabledTools}/5</strong></button>
    <button type="button" className="brain-control-ring is-context" onClick={() => setPage("observe")} aria-label={`Context: ${memories} memory fields`}><span>CONTEXT</span><strong>{memories + (channelId ? 1 : 0)}</strong></button>
    <button type="button" className="brain-control-ring is-objective" onClick={() => setPage("direct")} aria-label={`Objective: ${objective}`}><span>OBJECTIVE</span><strong>SET</strong></button>
    <div className="brain-control-nucleus" aria-live="polite"><BrainCircuit aria-hidden="true" /><strong>{mode}</strong><span>{scopeReady ? "SCOPE VALID" : "SCOPE BLOCKED"}</span></div>
    <ol className="vt-visually-hidden"><li>Objective: {objective}</li><li>Context: {memories} memory fields</li><li>Tools: {enabledTools} of 5</li><li>Execution: {mode}</li></ol>
  </section>

  const observe = <div className="brain-control-observe">
    {core}
    <section className="brain-control-status-rail" aria-label="Brain control status">
      <Status icon={<Eye />} value={controls.enabled ? "OBSERVING" : "DISABLED"} label="Operating mode" />
      <Status icon={<Database />} value={String(memories)} label="Memory fields" />
      <Status icon={<Wrench />} value={`${enabledTools}/5`} label="Tools enabled" />
      <Status icon={<ShieldCheck />} value={`${permissions}/5`} label="Permissions" />
    </section>
    <section className="brain-control-objective-summary"><span>CURRENT OBJECTIVE</span><strong>{objective}</strong><WidgetSizedButton height={24} tone="secondary" onClick={() => setPage("direct")}>EDIT DIRECTIVE</WidgetSizedButton></section>
  </div>

  const direct = <div className="brain-control-direct">
    <ControlCard icon={<Target />} title="OBJECTIVE" detail="Persistent intent used to judge every directive">
      <WidgetTextInput height={38} tone="secondary" aria-label="Brain objective" value={objective} onChange={(event) => setObjective(event.currentTarget.value)} onBlur={saveObjective} />
    </ControlCard>
    <ControlCard icon={<SlidersHorizontal />} title="DIRECTIVE" detail="One governed instruction for Brain handoff" badge={status.replace("-", " ").toUpperCase()} badgeStatus={status === "approved" ? "positive" : status === "stopped" ? "danger" : status === "awaiting-approval" ? "warning" : "neutral"} large>
      <WidgetTextInput height={38} tone="primary" aria-label="Brain directive" placeholder="Describe the governed action…" value={directive} onChange={(event) => { setDirective(event.currentTarget.value); setStatus(event.currentTarget.value.trim() ? "draft" : "idle") }} />
      <div className="brain-control-direct-actions">
        <WidgetLeftSplitButton icon={<LockKeyhole />} height={32} tone="primary" width="full" disabled={!directive.trim() || !scopeReady} onClick={stageDirective}>STAGE DIRECTIVE</WidgetLeftSplitButton>
        {status === "awaiting-approval" ? <WidgetLeftSplitButton icon={<CheckCircle2 />} height={32} tone="secondary" width="full" onClick={approve}>APPROVE</WidgetLeftSplitButton> : null}
        {status === "awaiting-approval" || status === "approved" ? <WidgetLeftSplitButton icon={<CircleStop />} height={32} tone="default" width="full" className="brain-control-stop" onClick={stop}>STOP</WidgetLeftSplitButton> : null}
      </div>
    </ControlCard>
    <section className="brain-control-handoff"><div><Play aria-hidden="true" /><span><strong>EXECUTION HANDOFF</strong><small>Approved directives open in the full Brain workspace. This widget never silently performs an external write.</small></span></div><WidgetSizedButton height={32} tone="primary" disabled={status !== "approved"} onClick={() => onNavigate?.("/ai-brain")}>OPEN BRAIN</WidgetSizedButton></section>
  </div>

  const permissionRows = [
    ["Brain enabled", "Allow governed Brain requests.", controls.enabled, (v: boolean) => updateControl("enabled", v)],
    ["Personalization", "Use creator memory and recent context.", controls.personalization, (v: boolean) => updateControl("personalization", v)],
    ["Analytics", "Read canonical channel analytics.", controls.allowAnalytics, (v: boolean) => updateControl("allowAnalytics", v)],
    ["Projects", "Read project and planning state.", controls.allowProjects, (v: boolean) => updateControl("allowProjects", v)],
    ["Comments", "Read comment and community context.", controls.allowComments, (v: boolean) => updateControl("allowComments", v)],
    ["Vault", "Read asset and video-package context.", controls.allowVault, (v: boolean) => updateControl("allowVault", v)],
    ["Publisher", "Prepare publishing handoffs.", controls.allowPublisher, (v: boolean) => updateControl("allowPublisher", v)],
    ["Require approval", "Gate external writes and publishing.", controls.externalActionsRequireApproval, (v: boolean) => updateControl("externalActionsRequireApproval", v)],
  ] as const
  const engineRows = [
    ["Channel Intelligence", "Channel-specific patterns.", engines.channelIntelligence, (v: boolean) => updateEngine("channelIntelligence", v)],
    ["Anomaly Intelligence", "Unusual performance changes.", engines.anomalyIntelligence, (v: boolean) => updateEngine("anomalyIntelligence", v)],
    ["Opportunity Intelligence", "Actionable content openings.", engines.opportunityIntelligence, (v: boolean) => updateEngine("opportunityIntelligence", v)],
    ["Algorithm Priming", "Pre-launch and sustain plans.", engines.algorithmPriming, (v: boolean) => updateEngine("algorithmPriming", v)],
    ["Video Packages", "Asset Engine package context.", engines.videoPackages, (v: boolean) => updateEngine("videoPackages", v)],
  ] as const
  const permissionsPage = <div className="brain-control-permissions"><SwitchGroup title="PERMISSIONS" detail={`${permissions}/5 context capabilities available`} icon={<ShieldCheck />} rows={permissionRows} /><SwitchGroup title="TOOLS" detail={`${enabledTools}/5 intelligence engines enabled`} icon={<Wrench />} rows={engineRows} /></div>

  const auditPage = <div className="brain-control-audit">
    <div className="brain-control-audit-summary"><WidgetProgressBar value={audit.length} max={40} label="AUDIT BUFFER" displayValue={`${audit.length}/40`} height={24} tone="secondary" /><WidgetBadge status={status === "stopped" ? "danger" : status === "approved" ? "positive" : "neutral"}>{mode}</WidgetBadge></div>
    {audit.length ? audit.map((entry) => <article className="brain-control-audit-row" key={entry.id}><span className={`brain-control-audit-mark is-${entry.outcome}`} aria-hidden="true" /><div><strong>{entry.action}</strong><small>{entry.detail}</small></div><div className="brain-control-audit-meta"><WidgetBadge status={entry.outcome === "approved" ? "positive" : entry.outcome === "stopped" ? "danger" : entry.outcome === "changed" ? "warning" : "neutral"}>{entry.outcome.toUpperCase()}</WidgetBadge><time dateTime={entry.at}>{new Date(entry.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time></div></article>) : <div className="brain-control-empty"><Activity aria-hidden="true" /><strong>NO CONTROL EVENTS YET</strong><span>Permission, objective, directive, approval, and Stop events will appear here.</span></div>}
  </div>

  return <WidgetShell {...common} icon={<BrainCircuit size={22} />} controlDensity="compact" headerContent={<WidgetBadge status={scopeReady ? "positive" : "warning"}>{mode}</WidgetBadge>}>
    <div className="brain-control-widget"><WidgetStepTabs label="Brain Control pages" value={page} items={PAGES} onChange={setPage} /><WidgetScrollArea ariaLabel={`${PAGES.find((item) => item.id === page)?.label || "Brain Control"} page`} className="brain-control-scroll">{page === "observe" ? observe : page === "direct" ? direct : page === "permissions" ? permissionsPage : auditPage}</WidgetScrollArea></div>
  </WidgetShell>
}

const Status: React.FC<{ icon: React.ReactNode; value: string; label: string }> = ({ icon, value, label }) => <div><span aria-hidden="true">{icon}</span><span><strong>{value}</strong><small>{label}</small></span></div>

const ControlCard: React.FC<{ icon: React.ReactNode; title: string; detail: string; badge?: string; badgeStatus?: "positive" | "warning" | "danger" | "neutral"; large?: boolean; children: React.ReactNode }> = ({ icon, title, detail, badge, badgeStatus, large, children }) => <section className={`brain-control-directive-card ${large ? "is-large" : ""}`}><div className="brain-control-section-heading"><span>{icon}</span><div><strong>{title}</strong><small>{detail}</small></div>{badge ? <WidgetBadge status={badgeStatus}>{badge}</WidgetBadge> : null}</div>{children}</section>

type SwitchRow = readonly [string, string, boolean, (value: boolean) => void]
const SwitchGroup: React.FC<{ title: string; detail: string; icon: React.ReactNode; rows: readonly SwitchRow[] }> = ({ title, detail, icon, rows }) => <section><div className="brain-control-group-heading"><span aria-hidden="true">{icon}</span><span><strong>{title}</strong><small>{detail}</small></span></div>{rows.map(([label, rowDetail, checked, onChange]) => <div className="brain-control-switch-row" key={label}><span><strong>{label}</strong><small>{rowDetail}</small></span><WidgetToggleSwitch checked={checked} onChange={onChange} label={label} height={32} tone={checked ? "primary" : "default"} /></div>)}</section>
