import React, { useEffect, useMemo, useState } from "react"
import {
  Activity,
  Brain,
  CheckCircle2,
  Image as ImageIcon,
  Pencil,
  Sparkles,
  Target,
} from "lucide-react"
import { WidgetShell } from "../WidgetShell"
import {
  WidgetBadge,
  WidgetDataGrid,
  WidgetLeftSplitButton,
  WidgetModuleFrame,
  WidgetModuleHeader,
  WidgetScrollArea,
  WidgetSizedButton,
  WidgetSizedSelect,
  WidgetStepTabs,
  WidgetTextInput,
  WidgetToggleSwitch,
  WidgetVideoSelect,
} from "../WidgetPrimitives"
import type { DashboardData } from "../useDashboardData"
import type { CommonWidgetProps } from "../types"
import { useBrain } from "../../../context/useBrain"
import { hasGeminiKey } from "../../../services/gemini"
import {
  buildAIBrainContextSnapshot,
  buildAIBrainSystemPrompt,
} from "../../../services/aiBrainCommandInterface"
import { buildCreatorGrowthContext } from "../../../services/aiBrainConversationStore"
import {
  createLongformOptimizationHandoff,
  listLongformOptimizationHistory,
  rankLongformOptimizationCandidates,
  recordLongformOptimizationCreatorReview,
  recordLongformOptimizationExecution,
  runLongformOptimizationAnalysis,
  type LongformOptimizationAnalysis,
  type LongformOptimizationVideoInput,
} from "../../../services/longformOptimization"
import {
  fetchAndRecordLongformOptimizationDailyComparison,
  readLatestLongformOptimizationDailyComparison,
  type LongformOptimizationDailyComparison,
} from "../../../services/longformOptimizationComparison"
import { deriveLegacyContentBuildId } from "../../../services/asset-engine/ContentBuildRepository"
import "./LongformOptimizationWidget.css"

type Page = "report" | "changes" | "outcome"
type CreatorReview = "improved" | "same" | "worse" | "inconclusive"
type CreatorDecision = "keep" | "iterate" | "rollback"

const PAGES: readonly { id: Page; label: string }[] = [
  { id: "report", label: "REPORT" },
  { id: "changes", label: "CHANGES" },
  { id: "outcome", label: "OUTCOME" },
]

const numberFrom = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null
  if (typeof value === "object" && value !== null && "value" in value) {
    return numberFrom((value as { value?: unknown }).value)
  }
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

const metricFrom = (row: Record<string, unknown>, ...keys: string[]) => {
  const metrics = row.metrics && typeof row.metrics === "object"
    ? row.metrics as Record<string, unknown>
    : {}
  for (const key of keys) {
    const value = numberFrom(metrics[key] ?? row[key])
    if (value != null) return value
  }
  return null
}

const textFrom = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value
  }
  return ""
}

const stringList = (value: unknown): string[] => Array.isArray(value)
  ? value.map(String).map((item) => item.trim()).filter(Boolean)
  : []

const recordFrom = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? value as Record<string, unknown> : {}

const formatNumber = (value: number | null | undefined) => {
  if (value == null || !Number.isFinite(value)) return "—"
  return new Intl.NumberFormat("en-US", { notation: value >= 10000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(value)
}

const formatMoney = (value: number | null | undefined) => {
  if (value == null || !Number.isFinite(value)) return "—"
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: value >= 10000 ? "compact" : "standard", maximumFractionDigits: 0 }).format(value)
}

const buildVideoInputs = (data: DashboardData): LongformOptimizationVideoInput[] => {
  const rows = (data.canonicalRows || []) as unknown as Record<string, unknown>[]
  const rowsById = new Map(rows.map((row) => [String(row.videoId || row.id || ""), row]))
  const ids = new Set<string>([
    ...rows.map((row) => String(row.videoId || row.id || "")).filter(Boolean),
    ...(data.videoAssets || []).map((asset) => asset.videoId),
  ])

  return [...ids].map((videoId) => {
    const row = rowsById.get(videoId) || {}
    const original = recordFrom(row.originalData)
    const snippet = recordFrom(original.snippet)
    const asset = (data.videoAssets || []).find((candidate) => candidate.videoId === videoId)
    const rawThumbnailAnalysis = recordFrom(
      original.thumbnailAnalysis ?? row.thumbnailAnalysis ?? original.mediaAnalysis,
    )
    const hasThumbnailAnalysis = Object.keys(rawThumbnailAnalysis).length > 0
    const transcript = textFrom(
      row.transcript,
      original.transcript,
      original.transcriptText,
      original.captionsText,
    )

    return {
      videoId,
      title: textFrom(row.title, asset?.title, snippet.title, "Untitled video"),
      format: textFrom(row.format, row.contentType, asset?.format),
      durationSec: numberFrom(row.durationSec ?? row.durationSeconds ?? asset?.durationSeconds),
      thumbnailUrl: textFrom(row.thumbnailUrl, asset?.thumbnailUrl, snippet.thumbnailUrl) || null,
      description: textFrom(row.description, snippet.description, original.description),
      tags: stringList(row.tags).length ? stringList(row.tags) : stringList(snippet.tags),
      transcript: transcript || null,
      thumbnailAnalysis: hasThumbnailAnalysis ? {
        status: rawThumbnailAnalysis.status === "stale" ? "stale" : "ready",
        concept: textFrom(rawThumbnailAnalysis.concept, rawThumbnailAnalysis.subject),
        style: textFrom(rawThumbnailAnalysis.style, rawThumbnailAnalysis.visualStyle),
        composition: textFrom(rawThumbnailAnalysis.composition),
        text: textFrom(rawThumbnailAnalysis.text, rawThumbnailAnalysis.overlayText),
        notes: textFrom(rawThumbnailAnalysis.notes, rawThumbnailAnalysis.summary),
        evidenceId: textFrom(rawThumbnailAnalysis.evidenceId) || undefined,
      } : {
        status: "missing",
      },
      categoryId: textFrom(row.categoryId, snippet.categoryId) || null,
      playlistIds: stringList(row.playlistIds).length ? stringList(row.playlistIds) : stringList(original.playlistIds),
      publishedAt: textFrom(row.uploadDate, asset?.publishedAt, snippet.publishedAt) || null,
      views: metricFrom(row, "views"),
      revenue: metricFrom(row, "revenue", "estimatedRevenue"),
      likes: metricFrom(row, "likes"),
      comments: metricFrom(row, "comments"),
      watchTimeHours: metricFrom(row, "watchTime", "watchHours", "estimatedHoursWatched"),
      impressions: metricFrom(row, "impressions", "videoThumbnailImpressions"),
      ctr: metricFrom(row, "ctr", "videoThumbnailImpressionsClickRate"),
      avp: metricFrom(row, "averageViewPercentage", "avgViewPercentage", "avp"),
    }
  })
}

const ToggleLabel: React.FC<{
  label: string
  checked: boolean
  onChange: (next: boolean) => void
}> = ({ label, checked, onChange }) => (
  <div className="longform-optimizer-experiment">
    <span>{label}</span>
    <WidgetToggleSwitch
      checked={checked}
      onChange={onChange}
      label={`${label} ${checked ? "enabled" : "disabled"}`}
      height={24}
      tone={checked ? "primary" : "default"}
    />
    <b>{checked ? "YES" : "NO"}</b>
  </div>
)

export const LongformOptimizationWidget: React.FC<
  CommonWidgetProps & { data: DashboardData; onNavigate?: (to: string) => void }
> = ({ data, onNavigate, ...common }) => {
  const { brain, authState, channelConnection, getBrainMemory } = useBrain()
  const [page, setPage] = useState<Page>("report")
  const [selectedVideoId, setSelectedVideoId] = useState("")
  const [titleAbc, setTitleAbc] = useState(true)
  const [thumbnailAbc, setThumbnailAbc] = useState(true)
  const [analysis, setAnalysis] = useState<LongformOptimizationAnalysis | null>(null)
  const [analysisVideoId, setAnalysisVideoId] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState("")
  const [historyRevision, setHistoryRevision] = useState(0)
  const [review, setReview] = useState<CreatorReview>("inconclusive")
  const [decision, setDecision] = useState<CreatorDecision>("iterate")
  const [reviewNote, setReviewNote] = useState("")
  const [reviewSaved, setReviewSaved] = useState(false)
  const [dailyComparison, setDailyComparison] = useState<LongformOptimizationDailyComparison | null>(null)
  const [dailyLoading, setDailyLoading] = useState(false)
  const [dailyError, setDailyError] = useState("")

  const ranked = useMemo(
    () => rankLongformOptimizationCandidates(buildVideoInputs(data)),
    [data.canonicalRows, data.videoAssets],
  )

  useEffect(() => {
    if (!ranked.length) {
      setSelectedVideoId("")
      return
    }
    setSelectedVideoId((current) => current && ranked.some((video) => video.videoId === current)
      ? current
      : ranked[0].videoId)
  }, [ranked])

  useEffect(() => {
    if (analysisVideoId && selectedVideoId !== analysisVideoId) {
      setAnalysis(null)
      setAnalysisVideoId(null)
      setPage("report")
    }
    setError("")
    setReviewSaved(false)
  }, [analysisVideoId, selectedVideoId])

  const selected = ranked.find((video) => video.videoId === selectedVideoId) || ranked[0] || null
  const channelId = authState.channelId
    || (selected ? data.videoAssets.find((asset) => asset.videoId === selected.videoId)?.channelId : null)
    || null
  const projectId = null
  const brainSnapshot = useMemo(() => buildAIBrainContextSnapshot({
    brain,
    authState,
    channelConnection,
    brainMemory: getBrainMemory(),
    recentConversationTurns: [],
  }), [authState, brain, channelConnection, getBrainMemory])
  const growthContext = useMemo(
    () => buildCreatorGrowthContext(brainSnapshot, [], []),
    [brainSnapshot],
  )

  const videoOptions = ranked.map((video, index) => ({
    value: video.videoId,
    label: video.title,
    thumbnail: video.thumbnailUrl || undefined,
    meta: `#${index + 1} · ${formatNumber(video.views)} views · score ${Math.round(video.priorityScore)}`,
  }))

  const activeAnalysis = analysis && analysisVideoId === selectedVideoId ? analysis : null
  const selectedContentBuildId = activeAnalysis?.contentBuildId
    || (selected ? deriveLegacyContentBuildId({ videoId: selected.videoId }) : null)
  const history = useMemo(() => selected ? listLongformOptimizationHistory({
    channelId,
    videoId: selected.videoId,
    contentBuildId: selectedContentBuildId,
  }) : [], [channelId, historyRevision, selected, selectedContentBuildId])

  const executionEvent = history.find((event) => event.kind === "RECOMMENDATION_EXECUTED") || null
  const measuredEvent = history.find((event) => event.kind === "OUTCOME_MEASURED") || null
  const measuredEvaluation = recordFrom(measuredEvent?.metadata?.evaluation)
  const targetResults = Array.isArray(measuredEvaluation.targetResults)
    ? measuredEvaluation.targetResults.map(recordFrom)
    : []

  useEffect(() => {
    if (!selected?.videoId || !selectedContentBuildId) {
      setDailyComparison(null)
      setDailyError("")
      return
    }
    setDailyComparison(readLatestLongformOptimizationDailyComparison({
      contentBuildId: selectedContentBuildId,
      videoId: selected.videoId,
    }))
  }, [historyRevision, selected?.videoId, selectedContentBuildId])

  const analyze = async () => {
    if (!selected) return
    setAnalyzing(true)
    setError("")
    try {
      const next = await runLongformOptimizationAnalysis({
        channelId,
        projectId,
        video: selected,
        experiment: { titleAbc, thumbnailAbc },
        brainRuntime: {
          snapshot: brainSnapshot,
          systemPrompt: buildAIBrainSystemPrompt({
            brain,
            authState,
            channelConnection,
            brainMemory: getBrainMemory(),
            recentConversationTurns: [],
          }) + "\n\nLONGFORM OPTIMIZER POLICY\nTreat current YouTube/VT-SYNC evidence, Channel Profile/Knowledge, ContentBuild lineage, Asset Engine context and creator controls as bounded context. Do not invent missing transcript or thumbnail-vision evidence. External YouTube mutations remain approval-gated outside this widget.",
          growthContext,
          allowModel: hasGeminiKey(),
        },
      })
      setAnalysis(next)
      setAnalysisVideoId(selected.videoId)
      setHistoryRevision((value) => value + 1)
      setPage("report")
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The analysis could not be completed.")
    } finally {
      setAnalyzing(false)
    }
  }

  const handoff = (targetToolId: "thumbnail-studio" | "video-manager" | "content-analysis" | "ai-brain") => {
    if (!activeAnalysis) return
    const result = createLongformOptimizationHandoff({
      targetToolId,
      channelId,
      projectId,
      analysis: activeAnalysis,
    })
    setHistoryRevision((value) => value + 1)
    onNavigate?.(result.route)
  }

  const markApplied = () => {
    if (!activeAnalysis) return
    recordLongformOptimizationExecution({
      channelId,
      projectId,
      analysis: activeAnalysis,
    })
    setHistoryRevision((value) => value + 1)
    setPage("changes")
  }

  const refreshDailyComparison = async () => {
    if (!selected || !selectedContentBuildId || !executionEvent) return
    setDailyLoading(true)
    setDailyError("")
    try {
      const next = await fetchAndRecordLongformOptimizationDailyComparison({
        videoId: selected.videoId,
        contentBuildId: selectedContentBuildId,
        channelId,
        changeAt: executionEvent.at,
      })
      setDailyComparison(next)
      setHistoryRevision((value) => value + 1)
    } catch (reason) {
      setDailyError(reason instanceof Error ? reason.message : "The 7+7 comparison could not be refreshed.")
    } finally {
      setDailyLoading(false)
    }
  }

  const saveReview = () => {
    if (!selectedContentBuildId) return
    recordLongformOptimizationCreatorReview({
      contentBuildId: selectedContentBuildId,
      review,
      decision,
      note: reviewNote,
    })
    setReviewSaved(true)
    setHistoryRevision((value) => value + 1)
  }

  const historyRows = history.slice(0, 20).map((event) => ({
    id: event.id,
    cells: {
      when: new Date(event.at).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      event: String(event.kind).replaceAll("_", " ").replaceAll(".", " "),
      source: event.source === "algorithm" ? "BRAIN / EVAL" : "CONTENTBUILD",
      summary: event.summary,
    },
  }))

  const outcomeRows = targetResults.map((result, index) => ({
    id: `outcome-${index}`,
    cells: {
      metric: String(result.metric || "metric"),
      before: result.baselineValue == null ? "—" : formatNumber(Number(result.baselineValue)),
      after: result.observedValue == null ? "—" : formatNumber(Number(result.observedValue)),
      delta: result.relativeChange == null ? "—" : `${(Number(result.relativeChange) * 100).toFixed(1)}%`,
      result: String(result.status || "unavailable").toUpperCase(),
    },
  }))

  const dailyRows = (dailyComparison?.days || []).map((day) => ({
    id: `daily-${day.relativeDay}`,
    cells: {
      day: day.relativeDay === 0 ? "CHANGE" : `D${day.relativeDay > 0 ? "+" : ""}${day.relativeDay}`,
      date: day.date,
      views: day.pending ? "PENDING" : formatNumber(day.views),
      watch: day.pending ? "PENDING" : day.watchTimeMinutes == null ? "—" : `${formatNumber(day.watchTimeMinutes)}m`,
      avp: day.pending ? "PENDING" : day.avp == null ? "—" : `${day.avp.toFixed(1)}%`,
      likes: day.pending ? "PENDING" : formatNumber(day.likes),
      comments: day.pending ? "PENDING" : formatNumber(day.comments),
      revenue: day.pending ? "PENDING" : formatMoney(day.revenue),
    },
  }))

  const dailySubtitle = !executionEvent
    ? "MARK A CHANGE APPLIED TO START THE COMPARISON CLOCK"
    : !dailyComparison
      ? "READY TO READ VIDEO-SCOPED YOUTUBE ANALYTICS"
      : dailyComparison.status === "ready"
        ? "7 BEFORE + 7 AFTER COMPLETE"
        : `${dailyComparison.after.daysObserved}/7 AFTER DAYS COMPLETE · THROUGH ${dailyComparison.completeThrough}`

  return (
    <WidgetShell
      {...common}
      icon={<Target size={22} />}
      hasAI
      aiDisabled={!selected || analyzing}
      aiDisabledReason={!selected ? "Select a longform video first" : undefined}
      onRegenerate={() => void analyze()}
    >
      <div className="longform-optimizer-widget">
        {ranked.length ? (
          <>
            <div className="longform-optimizer-command">
              <WidgetVideoSelect
                className="longform-optimizer-video-select"
                value={selectedVideoId}
                onChange={setSelectedVideoId}
                options={videoOptions}
                label="Longform video to analyze"
                placeholder="Select a longform video…"
                height={32}
                tone="default"
                searchable
              />
              <ToggleLabel label="TITLE A/B/C" checked={titleAbc} onChange={setTitleAbc} />
              <ToggleLabel label="THUMB A/B/C" checked={thumbnailAbc} onChange={setThumbnailAbc} />
              <WidgetLeftSplitButton
                className="longform-optimizer-analyze"
                height={32}
                tone="primary"
                textFit="adaptive"
                icon={<Sparkles />}
                disabled={!selected || analyzing}
                onClick={() => void analyze()}
              >
                {analyzing ? "ANALYZING…" : "ANALYZE"}
              </WidgetLeftSplitButton>
            </div>

            {selected ? (
              <section className="longform-optimizer-summary" aria-label="Selected longform video">
                <div className="longform-optimizer-identity">
                  {selected.thumbnailUrl ? <img src={selected.thumbnailUrl} alt="" /> : <span className="longform-optimizer-thumb-placeholder"><ImageIcon /></span>}
                  <div>
                    <span>#{ranked.findIndex((video) => video.videoId === selected.videoId) + 1} TOP-PERFORMER PRIORITY · SCORE {Math.round(selected.priorityScore)}</span>
                    <strong>{selected.title}</strong>
                  </div>
                </div>
                <div className="longform-optimizer-kpis" aria-label="Selected video metrics">
                  <span><small>VIEWS</small><b>{formatNumber(selected.views)}</b></span>
                  <span><small>REVENUE</small><b>{formatMoney(selected.revenue)}</b></span>
                  <span><small>LIKES</small><b>{formatNumber(selected.likes)}</b></span>
                  <span><small>COMMENTS</small><b>{formatNumber(selected.comments)}</b></span>
                </div>
              </section>
            ) : null}

            <WidgetStepTabs label="Longform optimization workflow" value={page} items={PAGES} onChange={setPage} />

            <WidgetScrollArea
              ariaLabel={`Longform optimizer ${page}`}
              className="longform-optimizer-workspace"
              contentClassName="longform-optimizer-scroll-content"
            >
              {page === "report" ? (
                <div className="longform-optimizer-report">
                  <WidgetModuleFrame
                    className="longform-optimizer-report-card"
                    header={<WidgetModuleHeader
                      icon={<Brain />}
                      title={activeAnalysis?.response.headline || "AI OPTIMIZATION REPORT"}
                      subtitle={activeAnalysis ? `${activeAnalysis.response.confidence.toUpperCase()} CONFIDENCE · ${activeAnalysis.context.missingEvidence.length} EVIDENCE GAPS` : "ANALYZE THE SELECTED VIDEO TO BUILD AN EVIDENCE-BOUNDED REPORT"}
                      controls={activeAnalysis ? <WidgetBadge height={18} status={activeAnalysis.response.confidence === "high" ? "positive" : activeAnalysis.response.confidence === "medium" ? "warning" : "neutral"}>{activeAnalysis.response.confidence}</WidgetBadge> : undefined}
                    />}
                    footer={activeAnalysis ? (
                      <div className="longform-optimizer-handoffs">
                        <WidgetSizedButton height={24} tone="primary" textFit="adaptive" onClick={() => handoff("thumbnail-studio")}>THUMBNAIL STUDIO</WidgetSizedButton>
                        <WidgetSizedButton height={24} tone="default" textFit="adaptive" onClick={() => handoff("video-manager")}>VIDEO MANAGER</WidgetSizedButton>
                        <WidgetSizedButton height={24} tone="default" textFit="adaptive" onClick={() => handoff("content-analysis")}>CONTENT ANALYSIS</WidgetSizedButton>
                        <WidgetSizedButton height={24} tone="secondary" textFit="adaptive" onClick={() => handoff("ai-brain")}>OPEN IN BRAIN</WidgetSizedButton>
                      </div>
                    ) : undefined}
                  >
                    {activeAnalysis ? (
                      <div className="longform-optimizer-report-copy">
                        <strong>{activeAnalysis.response.keyInsight}</strong>
                        <p>{activeAnalysis.response.body}</p>
                        <div className="longform-optimizer-evidence">
                          {(activeAnalysis.response.evidenceChips || []).slice(0, 5).map((chip) => <WidgetBadge key={chip} height={18}>{chip}</WidgetBadge>)}
                          {activeAnalysis.context.missingEvidence.map((item) => <WidgetBadge key={item} height={18} status="warning">MISSING: {item}</WidgetBadge>)}
                        </div>
                      </div>
                    ) : (
                      <div className="longform-optimizer-ready">
                        <Sparkles aria-hidden="true" />
                        <div>
                          <strong>TOP-PERFORMING LONGFORM FIRST</strong>
                          <p>ViewTube will combine the current package, transcript when available, thumbnail-analysis evidence when available, analytics, Channel/Brain context and prior outcomes. It can also recommend leaving the video unchanged.</p>
                        </div>
                      </div>
                    )}
                  </WidgetModuleFrame>
                  {error ? <div className="longform-optimizer-error" role="alert">{error}</div> : null}
                </div>
              ) : null}

              {page === "changes" ? (
                <div className="longform-optimizer-changes">
                  <div className="longform-optimizer-change-actions">
                    <div>
                      <strong>CHANGE / EXPERIMENT LEDGER</strong>
                      <span>ContentBuild + recommendation/evaluation lineage; no parallel widget-only ledger.</span>
                    </div>
                    <WidgetSizedButton height={24} tone="primary" textFit="adaptive" disabled={!activeAnalysis} onClick={markApplied}>
                      MARK CURRENT CHANGE APPLIED
                    </WidgetSizedButton>
                  </div>
                  {historyRows.length ? (
                    <WidgetDataGrid
                      ariaLabel="Longform optimization change ledger"
                      minWidth={640}
                      columns={[
                        { key: "when", label: "DATE", width: "80px" },
                        { key: "event", label: "EVENT", width: "150px" },
                        { key: "source", label: "SOURCE", width: "120px" },
                        { key: "summary", label: "SUMMARY", width: "minmax(280px,1fr)" },
                      ]}
                      rows={historyRows}
                    />
                  ) : (
                    <div className="longform-optimizer-empty">No optimization change has been recorded for this selected analysis yet.</div>
                  )}
                </div>
              ) : null}

              {page === "outcome" ? (
                <div className="longform-optimizer-outcome">
                  <WidgetModuleFrame
                    className="longform-optimizer-daily"
                    header={<WidgetModuleHeader
                      icon={<Activity />}
                      title="DAILY 7 BEFORE / 7 AFTER"
                      subtitle={dailySubtitle}
                      controls={<WidgetSizedButton
                        height={24}
                        tone="primary"
                        textFit="adaptive"
                        disabled={!executionEvent || !selectedContentBuildId || dailyLoading}
                        onClick={() => void refreshDailyComparison()}
                      >
                        {dailyLoading ? "REFRESHING…" : "REFRESH 7+7"}
                      </WidgetSizedButton>}
                    />}
                  >
                    {dailyRows.length ? (
                      <>
                        <div className="longform-optimizer-daily-summary">
                          <WidgetBadge height={18}>BEFORE {dailyComparison?.before.daysObserved || 0}/7</WidgetBadge>
                          <WidgetBadge height={18} status={dailyComparison?.status === "ready" ? "positive" : "warning"}>AFTER {dailyComparison?.after.daysObserved || 0}/7</WidgetBadge>
                          <span>Observed association only; this comparison does not prove causation.</span>
                        </div>
                        <WidgetDataGrid
                          className="longform-optimizer-daily-grid"
                          ariaLabel="Daily seven days before and after optimization change"
                          minWidth={760}
                          columns={[
                            { key: "day", label: "DAY", width: "76px" },
                            { key: "date", label: "DATE", width: "96px" },
                            { key: "views", label: "VIEWS", align: "end" },
                            { key: "watch", label: "WATCH", align: "end" },
                            { key: "avp", label: "AVP", align: "end" },
                            { key: "likes", label: "LIKES", align: "end" },
                            { key: "comments", label: "COMMENTS", align: "end" },
                            { key: "revenue", label: "REVENUE", align: "end" },
                          ]}
                          rows={dailyRows}
                        />
                      </>
                    ) : (
                      <p className="longform-optimizer-outcome-note">
                        {executionEvent
                          ? "Refresh to load real video-scoped daily YouTube Analytics for D−7 through D+7. Future days remain pending until YouTube has complete data."
                          : "Mark the selected recommendation as applied before starting a before/after comparison."}
                      </p>
                    )}
                    {dailyError ? <div className="longform-optimizer-error" role="alert">{dailyError}</div> : null}
                  </WidgetModuleFrame>

                  <WidgetModuleFrame
                    header={<WidgetModuleHeader
                      icon={<Activity />}
                      title="MEASURED OUTCOME"
                      subtitle={measuredEvent ? String(measuredEvaluation.status || "MEASURED").toUpperCase() : "WAITING FOR THE CANONICAL 168H EVALUATION"}
                      controls={measuredEvent ? <WidgetBadge height={18} status={measuredEvaluation.status === "positive" ? "positive" : measuredEvaluation.status === "negative" ? "danger" : "neutral"}>{String(measuredEvaluation.status || "measured")}</WidgetBadge> : undefined}
                    />}
                  >
                    {outcomeRows.length ? (
                      <WidgetDataGrid
                        ariaLabel="Measured optimization outcome"
                        minWidth={520}
                        columns={[
                          { key: "metric", label: "METRIC" },
                          { key: "before", label: "BEFORE", align: "end" },
                          { key: "after", label: "AFTER", align: "end" },
                          { key: "delta", label: "Δ", align: "end" },
                          { key: "result", label: "RESULT" },
                        ]}
                        rows={outcomeRows}
                      />
                    ) : (
                      <p className="longform-optimizer-outcome-note">The daily 7+7 projection is descriptive evidence. The existing Algorithm Monitoring evaluator remains the authority for the final measured outcome and learning candidate.</p>
                    )}
                  </WidgetModuleFrame>

                  <div className="longform-optimizer-review">
                    <div className="longform-optimizer-review-heading">
                      <CheckCircle2 aria-hidden="true" />
                      <div><strong>CREATOR REVIEW</strong><span>Recorded separately from measured analytics.</span></div>
                    </div>
                    <WidgetSizedSelect
                      height={24}
                      value={review}
                      onChange={(value) => setReview(value as CreatorReview)}
                      label="Creator assessment"
                      options={[
                        { value: "improved", label: "Improved" },
                        { value: "same", label: "About the same" },
                        { value: "worse", label: "Worse" },
                        { value: "inconclusive", label: "Inconclusive" },
                      ]}
                    />
                    <WidgetSizedSelect
                      height={24}
                      value={decision}
                      onChange={(value) => setDecision(value as CreatorDecision)}
                      label="Creator decision"
                      options={[
                        { value: "keep", label: "Keep" },
                        { value: "iterate", label: "Iterate" },
                        { value: "rollback", label: "Roll back" },
                      ]}
                    />
                    <WidgetTextInput height={24} value={reviewNote} onChange={(event) => setReviewNote(event.currentTarget.value)} placeholder="Optional review note…" aria-label="Creator review note" />
                    <WidgetSizedButton height={24} tone="primary" textFit="adaptive" disabled={!activeAnalysis?.contentBuildId} onClick={saveReview}>
                      {reviewSaved ? "REVIEW SAVED" : "SAVE REVIEW"}
                    </WidgetSizedButton>
                  </div>
                </div>
              ) : null}
            </WidgetScrollArea>
          </>
        ) : (
          <div className="longform-optimizer-no-data">
            <Target aria-hidden="true" />
            <strong>NO LONGFORM VIDEO DATA YET</strong>
            <span>Connect/sync the channel or import canonical video analytics to rank and analyze longform videos.</span>
            <WidgetSizedButton height={32} tone="primary" onClick={() => onNavigate?.("/analytics")}>OPEN ANALYTICS</WidgetSizedButton>
          </div>
        )}
      </div>
    </WidgetShell>
  )
}
