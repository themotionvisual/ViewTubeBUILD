import React, { useMemo, useState } from "react"
import { ArrowRight, Brain, Sparkles, WandSparkles } from "lucide-react"
import { useBrain } from "../../../context/useBrain"
import { hasGeminiKey } from "../../../services/gemini"
import {
  buildAIBrainContextSnapshot,
  buildAIBrainSystemPrompt,
} from "../../../services/aiBrainCommandInterface"
import { buildCreatorGrowthContext } from "../../../services/aiBrainConversationStore"
import { runBrainTask } from "../../../services/brain/runtime/BrainRuntime"
import type { CreatorBrainResponse } from "../../../types"
import { WidgetShell } from "../WidgetShell"
import {
  WidgetBadge,
  WidgetLeftSplitButton,
  WidgetModuleFrame,
  WidgetModuleHeader,
  WidgetScrollArea,
  WidgetSizedButton,
  WidgetTextInput,
} from "../WidgetPrimitives"
import type { CommonWidgetProps } from "../types"
import type { DashboardData } from "../useDashboardData"
import "./AIPromptBoxWidget.css"

const QUICK_PROMPTS = [
  {
    id: "next",
    label: "NEXT MOVE",
    prompt: "What is the single highest-value creator action I should take next, based only on current ViewTube evidence?",
  },
  {
    id: "winner",
    label: "TOP VIDEO",
    prompt: "What can I learn from my strongest current video, and what should I repeat without blindly copying it?",
  },
  {
    id: "risk",
    label: "BIGGEST RISK",
    prompt: "What is the biggest current risk or weakness in my channel evidence that deserves attention now?",
  },
  {
    id: "idea",
    label: "NEXT IDEA",
    prompt: "Give me one evidence-backed next-video direction that fits my channel and current audience signals.",
  },
] as const

const compactVideo = (row: any) => ({
  videoId: String(row?.videoId || row?.id || ""),
  title: String(row?.title || "Untitled"),
  views: Number(row?.metrics?.views?.value ?? row?.metrics?.views ?? row?.views ?? 0) || 0,
})

export const AIPromptBoxWidget: React.FC<
  CommonWidgetProps & { data: DashboardData; onNavigate?: (to: string) => void }
> = ({ data, onNavigate, ...common }) => {
  const { brain, authState, channelConnection, getBrainMemory } = useBrain()
  const [input, setInput] = useState("")
  const [lastPrompt, setLastPrompt] = useState("")
  const [answer, setAnswer] = useState<CreatorBrainResponse | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  const snapshot = useMemo(() => buildAIBrainContextSnapshot({
    brain,
    authState,
    channelConnection,
    brainMemory: getBrainMemory(),
    recentConversationTurns: [],
  }), [authState, brain, channelConnection, getBrainMemory])

  const growthContext = useMemo(
    () => buildCreatorGrowthContext(snapshot, [], []),
    [snapshot],
  )

  const channelId = authState.channelId || null

  const visibleContext = useMemo(() => ({
    dashboardWidget: "ai-prompt-box",
    channelTitle: data.channelTitle,
    topPerformer: data.topPerformer ? compactVideo(data.topPerformer) : null,
    recentUploads: (data.recentUploads || []).slice(0, 3).map(compactVideo),
    alerts: (data.alerts || []).slice(0, 4),
    trafficSources: (data.trafficSources || []).slice(0, 5),
    todayTaskCount: (data.todayTasks || []).length,
  }), [
    data.alerts,
    data.channelTitle,
    data.recentUploads,
    data.todayTasks,
    data.topPerformer,
    data.trafficSources,
  ])

  const submit = async (promptOverride?: string) => {
    const text = (promptOverride ?? input).trim()
    if (!text || busy) return

    setBusy(true)
    setError("")
    setLastPrompt(text)
    if (promptOverride) setInput("")

    try {
      const result = await runBrainTask({
        surface: "ai-prompt-box-widget",
        channelId,
        userText: text,
        snapshot,
        systemPrompt: buildAIBrainSystemPrompt({
          brain,
          authState,
          channelConnection,
          brainMemory: getBrainMemory(),
          recentConversationTurns: [],
        }) + "\n\nAI PROMPT BOX POLICY\nThis is a compact dashboard reasoning surface. Answer the creator's current question directly from bounded channel/dashboard evidence. State when evidence is missing. Prefer one useful conclusion and a small number of next actions. Do not perform external mutations. Suggest opening the full Brain only when the request genuinely needs a larger workspace.",
        growthContext,
        allowModel: hasGeminiKey(),
        visibleContext,
        requestedOutput: "compact creator-facing answer with evidence and next actions",
      })
      setAnswer(result.response)
      setInput("")
    } catch (caught) {
      console.warn("[AIPromptBoxWidget] Brain request failed", caught)
      setError("Brain could not complete that request. Your prompt is still here.")
      setInput(text)
    } finally {
      setBusy(false)
    }
  }

  return (
    <WidgetShell
      {...common}
      icon={<WandSparkles size={22} />}
      hasAI
      aiDisabled={busy}
      aiDisabledReason={busy ? "Brain is answering the current prompt" : undefined}
      onRegenerate={lastPrompt ? () => void submit(lastPrompt) : undefined}
    >
      <div className="ai-prompt-box-widget">
        <div className="ai-prompt-box-presets" aria-label="Quick strategy prompts">
          {QUICK_PROMPTS.map((preset) => (
            <WidgetSizedButton
              key={preset.id}
              height={24}
              tone="default"
              textFit="adaptive"
              disabled={busy}
              onClick={() => void submit(preset.prompt)}
            >
              {preset.label}
            </WidgetSizedButton>
          ))}
        </div>

        <div className="ai-prompt-box-composer">
          <WidgetTextInput
            value={input}
            onChange={(event) => setInput(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") void submit()
            }}
            height={32}
            tone="default"
            aria-label="Ask ViewTube Brain"
            placeholder="Ask about your channel, videos, strategy, or next move…"
            disabled={busy}
          />
          <WidgetLeftSplitButton
            icon={<Sparkles />}
            height={32}
            tone="primary"
            textFit="adaptive"
            disabled={!input.trim() || busy}
            onClick={() => void submit()}
          >
            {busy ? "THINKING…" : "ASK"}
          </WidgetLeftSplitButton>
        </div>

        <div className="ai-prompt-box-status" aria-label="Prompt context status">
          <WidgetBadge height={18} status={channelId ? "positive" : "warning"}>
            {channelId ? "CHANNEL CONTEXT" : "LOCAL CONTEXT"}
          </WidgetBadge>
          <WidgetBadge height={18} tone="purple">
            {snapshot.evidencePack.items.length} EVIDENCE
          </WidgetBadge>
          <WidgetBadge height={18} tone="royal">
            APPROVAL GATED
          </WidgetBadge>
          {lastPrompt ? <span className="ai-prompt-box-last">LAST · {lastPrompt}</span> : null}
        </div>

        <WidgetScrollArea ariaLabel="AI Prompt Box answer" className="ai-prompt-box-scroll">
          {answer ? (
            <WidgetModuleFrame
              className="ai-prompt-box-answer"
              header={
                <WidgetModuleHeader
                  icon={<Brain />}
                  title={answer.headline || "Brain answer"}
                  subtitle={answer.confidence.toUpperCase() + " CONFIDENCE"}
                  controls={<WidgetBadge height={18} status="positive">LIVE</WidgetBadge>}
                />
              }
            >
              <div className="ai-prompt-box-answer-copy">
                <strong>{answer.keyInsight || answer.body}</strong>
                {answer.keyInsight && answer.body && answer.body !== answer.keyInsight ? <p>{answer.body}</p> : null}
              </div>

              {answer.evidenceChips?.length ? (
                <div className="ai-prompt-box-evidence" aria-label="Answer evidence">
                  {answer.evidenceChips.slice(0, 4).map((chip) => (
                    <WidgetBadge key={chip} height={18}>{chip}</WidgetBadge>
                  ))}
                </div>
              ) : null}

              {answer.actions?.length ? (
                <div className="ai-prompt-box-actions">
                  {answer.actions.slice(0, 2).map((action, index) => (
                    <span key={action + "-" + index}><b>{index + 1}</b>{action}</span>
                  ))}
                </div>
              ) : null}
            </WidgetModuleFrame>
          ) : (
            <div className="ai-prompt-box-empty">
              <Brain aria-hidden="true" />
              <div>
                <strong>ASK THE CHANNEL, NOT A GENERIC BOT</strong>
                <span>BrainRuntime receives bounded dashboard, analytics, creator-memory and channel context for each prompt.</span>
              </div>
            </div>
          )}
        </WidgetScrollArea>

        <div className="ai-prompt-box-footer">
          {error ? <span className="ai-prompt-box-error" role="alert">{error}</span> : <span>FAST ASK · SHARED BRAINRUNTIME · NO EXTERNAL WRITES</span>}
          <WidgetSizedButton height={24} tone="secondary" textFit="adaptive" onClick={() => onNavigate?.("/ai-brain")}>
            OPEN BRAIN <ArrowRight aria-hidden="true" />
          </WidgetSizedButton>
        </div>
      </div>
    </WidgetShell>
  )
}
