import React, { useCallback, useEffect, useMemo, useState } from "react"
import {
 BarChart3,
 Brain,
 Database,
 ExternalLink,
 FolderKanban,
 MessageSquare,
 Package,
 Radar,
 RefreshCw,
 Send,
 Settings2,
 ShieldCheck,
 Sparkles,
 Target,
} from "lucide-react"
import { Link } from "react-router-dom"
import { WidgetShell } from "../WidgetShell"
import { InstrumentExplanation, InstrumentStages, WidgetInstrument } from "../instruments/WidgetInstrument"
import {
 WidgetBadge,
 WidgetFooter,
 WidgetHeaderToggle,
 WidgetScrollArea,
 WidgetIconButton,
 WidgetLeftSplitButton,
 WidgetTextInput,
 WidgetToggleSwitch,
} from "../WidgetPrimitives"
import type { CommonWidgetProps } from "../types"
import type { DashboardData } from "../useDashboardData"
import { useBrain } from "../../../context/useBrain"
import { hasGeminiKey } from "../../../services/gemini"
import {
 buildAIBrainContextSnapshot,
 buildAIBrainSystemPrompt,
} from "../../../services/aiBrainCommandInterface"
import { buildCreatorGrowthContext } from "../../../services/aiBrainConversationStore"
import {
 buildBrainConversationHistory,
 loadBrainConversationState,
 notifyBrainConversationChanged,
 subscribeBrainConversationChanges,
} from "../../../services/brain/BrainConversationController"
import { runBrainTask } from "../../../services/brain/runtime/BrainRuntime"
import {
 readBrainUserControls,
 setActiveBrainControlChannel,
 writeBrainUserControls,
 type BrainUserControls,
} from "../../../services/brain/BrainUserControls"
import {
 readBrainEngineControls,
 writeBrainEngineControls,
 type BrainEngineControls,
} from "../../../services/brain/BrainEngineControls"
import {
 readAlgorithmIntelligenceForBrain,
 type AlgorithmIntelligenceAccessResult,
} from "../../../services/brain/AlgorithmIntelligenceAccess"
import type { AlgorithmIntelligencePortfolio } from "../../../services/brain/AlgorithmIntelligenceOrchestrator"
import { searchVaultForBrain } from "../../../services/brain/BrainVaultAdapter"
import type { AIBrainConversationTurn, AIBrainEvidenceItem } from "../../../types"
import "./BrainHubWidget.css"

interface BrainHubWidgetProps extends CommonWidgetProps {
 data: DashboardData
}

type MainPage = "chat" | "controls"
type ChatPage = "conversation" | "intelligence" | "evidence" | "packages"

const MAIN_PAGES = [
 { id: "chat", label: "Chat" },
 { id: "controls", label: "Controls" },
] as const

const CHAT_PAGES: readonly {
 id: ChatPage
 label: string
 icon: React.ReactNode
}[] = [
 { id: "conversation", label: "Chat", icon: <MessageSquare /> },
 { id: "intelligence", label: "Intel", icon: <Target /> },
 { id: "evidence", label: "Evidence", icon: <Database /> },
 { id: "packages", label: "Packages", icon: <Package /> },
]
const BrainIntelligenceNexus: React.FC<{
 portfolio: AlgorithmIntelligencePortfolio | null
 status: string
 onRefresh: () => void
}> = ({ portfolio, status, onRefresh }) => {
 const patterns = portfolio?.channelIntelligence.patterns.length || 0
 const anomalies = portfolio?.anomalySignals.length || 0
 const opportunities = portfolio?.opportunitySignals.length || 0
 const recommendation = portfolio?.primaryRecommendation || null

 return (
  <section className="brain-hub-intelligence-nexus" aria-label="Brain Intelligence Nexus">
   <div className="brain-hub-intelligence-nexus__orbit" aria-hidden="true" />

   <div className="brain-hub-intelligence-nexus__core">
    <Brain aria-hidden="true" />
    <strong>{portfolio ? "INTEL" : "IDLE"}</strong>
    <small>{status}</small>
   </div>

   <div className="brain-hub-intelligence-nexus__node is-patterns">
    <BarChart3 aria-hidden="true" />
    <span>CHANNEL</span>
    <strong>{patterns}</strong>
    <small>PATTERNS</small>
   </div>

   <div className="brain-hub-intelligence-nexus__node is-anomalies">
    <Radar aria-hidden="true" />
    <span>ANOMALY</span>
    <strong>{anomalies}</strong>
    <small>SIGNALS</small>
   </div>

   <div className="brain-hub-intelligence-nexus__node is-opportunities">
    <Target aria-hidden="true" />
    <span>OPPORTUNITY</span>
    <strong>{opportunities}</strong>
    <small>SIGNALS</small>
   </div>

   <div className="brain-hub-intelligence-nexus__recommendation">
    <WidgetBadge tone="yellow">PRIMARY</WidgetBadge>
    <strong>{recommendation?.title || "NO GOVERNED RECOMMENDATION YET"}</strong>
    <small>{recommendation
     ? `${recommendation.confidence.toUpperCase()} CONFIDENCE · ${recommendation.evidenceIds.length} EVIDENCE`
     : "REFRESH INTELLIGENCE TO BUILD A RECOMMENDATION."}</small>
   </div>

   <WidgetIconButton
    icon={<RefreshCw />}
    label="Refresh algorithm intelligence"
    height={32}
    tone="secondary"
    className="brain-hub-intelligence-nexus__refresh"
    onClick={onRefresh}
   />
  </section>
 )
}

export const BrainHubWidget: React.FC<BrainHubWidgetProps> = ({ data: _data, ...common }) => {
 const { brain, authState, channelConnection, getBrainMemory } = useBrain()
 const channelId = authState.channelId || authState.channelHandle || null

 const [mainPage, setMainPage] = useState<MainPage>("chat")
 const [chatPage, setChatPage] = useState<ChatPage>("conversation")
 const [input, setInput] = useState("")
 const [busy, setBusy] = useState(false)
 const [hydratingConversation, setHydratingConversation] = useState(true)
 const [error, setError] = useState<string | null>(null)
 const [turns, setTurns] = useState<AIBrainConversationTurn[]>([])
 const [answer, setAnswer] = useState<AIBrainConversationTurn | null>(null)
 const [controls, setControls] = useState<BrainUserControls>(() => readBrainUserControls(channelId))
 const [engines, setEngines] = useState<BrainEngineControls>(() => readBrainEngineControls(channelId))
 const [portfolio, setPortfolio] = useState<AlgorithmIntelligencePortfolio | null>(null)
 const [intelStatus, setIntelStatus] = useState("Not loaded")

 const restoreConversation = useCallback(async () => {
  try {
   const state = await loadBrainConversationState(channelId)
   setTurns(state.turns)
   setAnswer(state.latestVisibleTurn)
  } catch (caught) {
   console.warn("[BrainHubWidget] shared thread unavailable", caught)
  } finally {
   setHydratingConversation(false)
  }
 }, [channelId])

 useEffect(() => {
  setActiveBrainControlChannel(channelId)
  setControls(readBrainUserControls(channelId))
  setEngines(readBrainEngineControls(channelId))

  const refresh = () => {
   setControls(readBrainUserControls(channelId))
   setEngines(readBrainEngineControls(channelId))
  }

  window.addEventListener("vt_brain_user_controls_changed", refresh)
  window.addEventListener("vt_brain_engine_controls_changed", refresh)
  return () => {
   window.removeEventListener("vt_brain_user_controls_changed", refresh)
   window.removeEventListener("vt_brain_engine_controls_changed", refresh)
  }
 }, [channelId])

 useEffect(() => {
  setHydratingConversation(true)
  void restoreConversation()
  return subscribeBrainConversationChanges(channelId, () => {
   void restoreConversation()
  })
 }, [channelId, restoreConversation])

 const snapshot = useMemo(
  () => buildAIBrainContextSnapshot({
   brain,
   authState,
   channelConnection,
   brainMemory: controls.personalization ? getBrainMemory() : null,
   recentConversationTurns: controls.personalization ? turns : [],
  }),
  [brain, authState, channelConnection, controls.personalization, turns, getBrainMemory],
 )

 const growthContext = useMemo(
  () => buildCreatorGrowthContext(snapshot, turns, []),
  [snapshot, turns],
 )

 const packages = useMemo(
  () => controls.allowVault && engines.videoPackages
   ? searchVaultForBrain({ query: "package", limit: 8 })
   : { assets: [], evidence: [] },
  [controls.allowVault, engines.videoPackages, answer],
 )

 const evidence = useMemo(() => {
  if (!controls.enabled || !controls.allowAnalytics || snapshot.evidencePack.channelId !== channelId) return []
  return snapshot.evidencePack.items.slice(0, engines.maxEvidenceItems) as AIBrainEvidenceItem[]
 }, [snapshot.evidencePack, engines.maxEvidenceItems, controls.enabled, controls.allowAnalytics, channelId])

 const updateUserControl = <K extends keyof BrainUserControls>(key: K, value: BrainUserControls[K]) => {
  const next = writeBrainUserControls({ ...controls, [key]: value }, channelId)
  setControls(next)
 }

 const updateEngineControl = <K extends keyof BrainEngineControls>(key: K, value: BrainEngineControls[K]) => {
  const next = writeBrainEngineControls({ ...engines, [key]: value }, channelId)
  setEngines(next)
 }

 const loadIntelligence = async () => {
  if (!channelId || !controls.enabled || !controls.allowAnalytics) {
   setIntelStatus("Analytics access disabled")
   return
  }

  setIntelStatus("Building portfolio…")
  const result: AlgorithmIntelligenceAccessResult<AlgorithmIntelligencePortfolio> =
   await readAlgorithmIntelligenceForBrain({
    channelId,
    includeAnomalies: engines.anomalyIntelligence,
   })

  if (result.status === "ok") {
   setPortfolio(result.value)
   setIntelStatus("Ready")
  } else {
   setIntelStatus(result.message)
  }
 }

 const send = async () => {
  const text = input.trim()
  if (!text || busy || !controls.enabled) return

  setInput("")
  setError(null)
  setBusy(true)

  try {
   if (engines.channelIntelligence && !portfolio) await loadIntelligence()

   const systemPrompt = buildAIBrainSystemPrompt({
    brain,
    authState,
    channelConnection,
    brainMemory: controls.personalization ? getBrainMemory() : null,
    recentConversationTurns: controls.personalization ? turns : [],
   }) + `\n\nBRAIN HUB WIDGET POLICY\nAnalytics=${controls.allowAnalytics}; Projects=${controls.allowProjects}; Vault=${controls.allowVault}; Publisher=${controls.allowPublisher}; ApprovalRequired=${controls.externalActionsRequireApproval}.\nEngine policy: channelIntelligence=${engines.channelIntelligence}; anomalyIntelligence=${engines.anomalyIntelligence}; opportunityIntelligence=${engines.opportunityIntelligence}; algorithmPriming=${engines.algorithmPriming}; videoPackages=${engines.videoPackages}.\nNever claim an engine supplied evidence when it is disabled or absent. External write or publish actions remain explicit approval-aware handoffs.`

   const result = await runBrainTask({
    surface: "brain-hub-widget",
    channelId,
    userText: text,
    snapshot,
    systemPrompt,
    growthContext,
    recentTurns: controls.personalization ? turns : [],
    history: controls.personalization ? buildBrainConversationHistory(turns) : [],
    allowModel: hasGeminiKey(),
    visibleContext: {
     dashboardWidget: "brain-hub",
     mainPage,
     chatPage,
     evidenceCount: evidence.length,
     intelligenceReady: Boolean(portfolio),
    },
    artifactRefs: packages.assets.map((asset) => asset.id),
    requestedOutput: "creator-facing Brain answer with evidence and next actions",
   })

   setAnswer(result.turn)
   await restoreConversation()
   notifyBrainConversationChanged({
    channelId,
    source: "brain-hub-widget",
    turnId: result.turn.id,
   })
   setChatPage("conversation")
  } catch (caught) {
   console.warn("[BrainHubWidget] turn failed", caught)
   setError("Brain could not complete that request. Your prompt was preserved.")
   setInput(text)
  } finally {
   setBusy(false)
  }
 }

 const headerContent = (
  <WidgetHeaderToggle
   label="Brain workspace"
   value={mainPage}
   items={MAIN_PAGES}
   onChange={setMainPage}
  />
 )

 return (
  <WidgetShell {...common} icon={<Brain size={22} />} headerContent={headerContent} helpContent={
   <WidgetInstrument archetype="ooda" label="BRAIN OODA CORE" summary="EVIDENCE INTO A GOVERNED NEXT ACTION" compact>
    <InstrumentStages stages={[
     { id: "observe", label: "Observe", detail: "Collect evidence" },
     { id: "orient", label: "Orient", detail: "Find patterns" },
     { id: "decide", label: "Decide", detail: "Form advice" },
     { id: "act", label: "Act", detail: "Request approval" },
    ]} />
    <InstrumentExplanation purpose="Explain how the Brain turns channel evidence into advice." process="It observes evidence, orients around patterns, decides on an insight, then returns any external action to you for approval." result="A traceable recommendation whose evidence and permissions remain visible." />
   </WidgetInstrument>
  }>
   <div className="brain-hub-widget">
    {mainPage === "chat" ? (
     <>
      <div className="brain-hub-context-row" aria-label="Brain context status">
       <WidgetBadge tone="rose">{hydratingConversation ? "Restoring" : "Ready"}</WidgetBadge>
       <WidgetBadge tone="cyan">{channelId ? "Channel" : "No channel"}</WidgetBadge>
       <WidgetBadge tone="yellow">{evidence.length} evidence</WidgetBadge>
       <WidgetBadge tone="purple">{portfolio ? "Intel ready" : "Intel idle"}</WidgetBadge>
       {turns.length ? <WidgetBadge tone="green">{turns.length} turns</WidgetBadge> : null}
       {controls.externalActionsRequireApproval ? <WidgetBadge tone="royal">Approval gated</WidgetBadge> : null}
      </div>

      <div className="brain-hub-nav" role="navigation" aria-label="Brain chat views">
       {CHAT_PAGES.map((page) => (
        <WidgetLeftSplitButton
         key={page.id}
         icon={page.icon}
         height={32}
         tone={chatPage === page.id ? "primary" : "default"}
         width="full"
         onClick={() => setChatPage(page.id)}
        >
         {page.label}
        </WidgetLeftSplitButton>
       ))}
      </div>

      <WidgetScrollArea ariaLabel="Brain workspace" className="brain-hub-scroll">
       <div className="brain-hub-panel">
        {chatPage === "conversation" ? (
         <div className="brain-hub-conversation">
          {answer?.response ? (
           <article className="brain-hub-answer">
            <header>
             <span>ViewTube Brain</span>
             <span>{answer.response.confidence}</span>
            </header>
            <div className="brain-hub-answer-copy">
             <strong>{answer.response.keyInsight}</strong>
             <div className="brain-hub-answer-badges">
              <WidgetBadge tone="cyan">{answer.response.evidenceIds?.length || 0} evidence</WidgetBadge>
              <WidgetBadge tone="purple">{answer.response.modules?.length || 0} modules</WidgetBadge>
              {turns.length > 1 ? <WidgetBadge tone="orange">Shared thread</WidgetBadge> : null}
              {controls.externalActionsRequireApproval ? <WidgetBadge tone="green">Approval gated</WidgetBadge> : null}
             </div>
            </div>
           </article>
          ) : hydratingConversation ? (
           <div className="brain-hub-empty">
            <RefreshCw aria-hidden="true" />
            <strong>Restoring Brain thread</strong>
            <span>Loading the same durable conversation used by the Sidebar and full Brain workspace.</span>
           </div>
          ) : (
           <div className="brain-hub-empty">
            <Sparkles aria-hidden="true" />
            <strong>Brain Command</strong>
            <span>Ask about analytics, evidence, anomalies, opportunities, priming, packages or next actions.</span>
           </div>
          )}
          {error ? <div className="brain-hub-error" role="alert">{error}</div> : null}
         </div>
        ) : null}

        {chatPage === "intelligence" ? (
         <div className="brain-hub-stack">
          <div className="brain-hub-section-head">
           <div>
            <strong>Algorithm Intelligence</strong>
            <span>{intelStatus}</span>
           </div>
          </div>

          <BrainIntelligenceNexus
           portfolio={portfolio}
           status={intelStatus}
           onRefresh={() => void loadIntelligence()}
          />

          {portfolio?.primaryRecommendation ? (
           <div className="brain-hub-recommendation">
            <WidgetBadge tone="yellow">Primary</WidgetBadge>
            <strong>{portfolio.primaryRecommendation.title}</strong>
           </div>
          ) : null}
         </div>
        ) : null}

        {chatPage === "evidence" ? (
         <div className="brain-hub-stack">
          <div className="brain-hub-section-head">
           <div>
            <strong>Evidence used</strong>
            <span>Showing {evidence.length} of {engines.maxEvidenceItems} allowed items</span>
           </div>
          </div>
          <div className="brain-hub-evidence-list">
           {evidence.length ? evidence.map((item, index) => (
            <div className="brain-hub-evidence-row" key={item.id}>
             <span className="brain-hub-evidence-index">{index + 1}</span>
             <span>
              <strong>{item.label || item.id}</strong>
              <small>{item.source || "evidence"}{item.detail ? ` · ${item.detail}` : ""}</small>
             </span>
            </div>
           )) : <div className="brain-hub-empty compact">No bounded evidence is available for the current snapshot.</div>}
          </div>
         </div>
        ) : null}

        {chatPage === "packages" ? (
         <div className="brain-hub-stack">
          <div className="brain-hub-section-head">
           <div>
            <strong>Video Packages + Vault</strong>
            <span>{controls.allowVault && engines.videoPackages ? `${packages.assets.length} matching assets` : "Package access disabled"}</span>
           </div>
          </div>
          <div className="brain-hub-package-list">
           {packages.assets.length ? packages.assets.map((asset) => (
            <div className="brain-hub-package-row" key={asset.id}>
             <Package aria-hidden="true" />
             <span><strong>{asset.name}</strong><small>{asset.kind} · {asset.projectName || "No project"} · {asset.source}</small></span>
            </div>
           )) : <div className="brain-hub-empty compact">No matching package assets are available.</div>}
          </div>
         </div>
        ) : null}
       </div>
      </WidgetScrollArea>

      <WidgetFooter className="brain-hub-footer">
       <div className="brain-hub-composer">
        <WidgetTextInput
         value={input}
         onChange={(event) => setInput(event.currentTarget.value)}
         onKeyDown={(event) => {
          if (event.key === "Enter") void send()
         }}
         disabled={!controls.enabled || busy || hydratingConversation}
         placeholder={controls.enabled ? "Ask Brain…" : "Brain disabled"}
         height={32}
         tone="default"
        />
        <WidgetIconButton
         icon={<Send />}
         label="Send to Brain"
         height={32}
         tone="primary"
         disabled={!input.trim() || busy || hydratingConversation || !controls.enabled}
         onClick={() => void send()}
        />
       </div>
       <div className="brain-hub-footer-meta">
        <span><ShieldCheck aria-hidden="true" /> {controls.externalActionsRequireApproval ? "Approval gated" : "Approval policy relaxed"}</span>
        <span>{busy ? "Brain working…" : hydratingConversation ? "Restoring thread…" : "Enter to send"}</span>
       </div>
      </WidgetFooter>
     </>
    ) : (
     <WidgetScrollArea ariaLabel="Brain controls" className="brain-hub-scroll controls">
      <div className="brain-hub-controls">
       <div className="brain-hub-control-badges">
        <WidgetBadge tone="purple">Brain controls</WidgetBadge>
        <WidgetBadge tone="green">Personalized</WidgetBadge>
        <WidgetBadge tone="royal">Approval-aware</WidgetBadge>
       </div>

       <section className="brain-hub-control-section">
        <h3>Access + memory</h3>
        <ControlRow label="Brain enabled" detail="Allow creator-facing Brain requests.">
         <WidgetToggleSwitch checked={controls.enabled} onChange={(value) => updateUserControl("enabled", value)} label="Brain enabled" height={32} tone="primary" />
        </ControlRow>
        <ControlRow label="Personalization" detail="Use creator memory and recent conversation context.">
         <WidgetToggleSwitch checked={controls.personalization} onChange={(value) => updateUserControl("personalization", value)} label="Brain personalization" height={32} tone="primary" />
        </ControlRow>
        <ControlRow label="Analytics evidence" detail="Allow canonical channel analytics evidence.">
         <WidgetToggleSwitch checked={controls.allowAnalytics} onChange={(value) => updateUserControl("allowAnalytics", value)} label="Analytics evidence" height={32} tone="primary" />
        </ControlRow>
        <ControlRow label="Projects" detail="Allow project state and planning context.">
         <WidgetToggleSwitch checked={controls.allowProjects} onChange={(value) => updateUserControl("allowProjects", value)} label="Projects access" height={32} tone="primary" />
        </ControlRow>
        <ControlRow label="Vault" detail="Allow asset and package context.">
         <WidgetToggleSwitch checked={controls.allowVault} onChange={(value) => updateUserControl("allowVault", value)} label="Vault access" height={32} tone="primary" />
        </ControlRow>
        <ControlRow label="Publisher" detail="Allow publishing handoffs; writes remain approval-aware.">
         <WidgetToggleSwitch checked={controls.allowPublisher} onChange={(value) => updateUserControl("allowPublisher", value)} label="Publisher access" height={32} tone="primary" />
        </ControlRow>
        <ControlRow label="Require approval" detail="Keep external writes and publish actions gated.">
         <WidgetToggleSwitch checked={controls.externalActionsRequireApproval} onChange={(value) => updateUserControl("externalActionsRequireApproval", value)} label="Require approval for external actions" height={32} tone="primary" />
        </ControlRow>
       </section>

       <section className="brain-hub-control-section">
        <h3>Intelligence engines</h3>
        <ControlRow label="Channel Intelligence" detail="Use durable channel-specific patterns.">
         <WidgetToggleSwitch checked={engines.channelIntelligence} onChange={(value) => updateEngineControl("channelIntelligence", value)} label="Channel Intelligence" height={32} tone="secondary" />
        </ControlRow>
        <ControlRow label="Anomaly Intelligence" detail="Observe unusual changes without collapsing into priming.">
         <WidgetToggleSwitch checked={engines.anomalyIntelligence} onChange={(value) => updateEngineControl("anomalyIntelligence", value)} label="Anomaly Intelligence" height={32} tone="secondary" />
        </ControlRow>
        <ControlRow label="Opportunity Intelligence" detail="Find strategically useful openings.">
         <WidgetToggleSwitch checked={engines.opportunityIntelligence} onChange={(value) => updateEngineControl("opportunityIntelligence", value)} label="Opportunity Intelligence" height={32} tone="secondary" />
        </ControlRow>
        <ControlRow label="Algorithm Priming" detail="Plan proactive pre-launch through sustain actions.">
         <WidgetToggleSwitch checked={engines.algorithmPriming} onChange={(value) => updateEngineControl("algorithmPriming", value)} label="Algorithm Priming" height={32} tone="secondary" />
        </ControlRow>
        <ControlRow label="Video Packages" detail="Allow package and Vault-assisted creator outputs.">
         <WidgetToggleSwitch checked={engines.videoPackages} onChange={(value) => updateEngineControl("videoPackages", value)} label="Video Packages" height={32} tone="secondary" />
        </ControlRow>
       </section>

       <div className="brain-hub-control-actions">
        <WidgetLeftSplitButton icon={<Settings2 />} height={32} tone="secondary" width="full" onClick={() => setMainPage("chat")}>Return to Brain</WidgetLeftSplitButton>
        <Link to="/ai-brain" className="brain-hub-link-button">
         <FolderKanban aria-hidden="true" />
         <span>Open full Brain</span>
         <ExternalLink aria-hidden="true" />
        </Link>
       </div>
      </div>
     </WidgetScrollArea>
    )}
   </div>
  </WidgetShell>
 )
}

const ControlRow: React.FC<{
 label: string
 detail: string
 children: React.ReactNode
}> = ({ label, detail, children }) => (
 <div className="brain-hub-control-row">
  <span>
   <strong>{label}</strong>
   <small>{detail}</small>
  </span>
  {children}
 </div>
)
