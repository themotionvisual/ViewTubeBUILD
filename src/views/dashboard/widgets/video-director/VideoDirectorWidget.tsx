import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Clapperboard, ExternalLink, Sparkles } from "lucide-react"
import { WidgetShell } from "../../WidgetShell"
import {
  WidgetActionButton,
  WidgetBadge,
  WidgetFooter,
  WidgetProgressBar,
  WidgetScrollArea,
  WidgetSection,
  WidgetSizedButton,
  WidgetSizedSelect,
  WidgetStepper,
  WidgetTextInput,
  WidgetToast,
  WidgetToggleSwitch,
  WidgetWorkflowMain,
} from "../../WidgetPrimitives"
import type { DashboardData } from "../../useDashboardData"
import type { CommonWidgetProps } from "../../types"
import {
  VIDEO_DIRECTOR_CATEGORY_REGISTRY,
  VideoDirectorProjectSchema,
  applyVideoDirectorConflicts,
  autoFillVideoDirectorProject,
  buildVideoDirectorStoryboard,
  cancelVideoDirectorJob,
  compileSemanticDirectorPacket,
  createEmptyVideoDirectorProject,
  deriveVideoDirectorCategoryStatus,
  ensureVideoDirectorVariants,
  listVideoDirectorJobs,
  listVideoDirectorScopeOptions,
  parseVideoDirectorScopeKey,
  readVideoDirectorState,
  resolveVideoDirectorScopedCategoryState,
  setVideoDirectorScopedCategoryField,
  setVideoDirectorVariantCategoryAllowed,
  setVideoDirectorVariantStrength,
  subscribeVideoDirectorState,
  writeVideoDirectorState,
  type VideoDirectorCategoryId,
  type VideoDirectorMode,
  type VideoDirectorProject,
  type VideoDirectorRemoteJob,
  type VideoDirectorScope,
} from "../../../../features/video-director"
import {
  DirectorWidgetAudioStage,
  DirectorWidgetCompositionVisual,
  DirectorWidgetLensVisual,
  DirectorWidgetLightingVisual,
  DirectorWidgetMoodVisual,
  DirectorWidgetPacingVisual,
  DirectorWidgetProviderRoute,
  DirectorWidgetShotStrip,
} from "./VideoDirectorWidgetComponents"
import "./videoDirectorWidget.css"

type Page = "direct" | "storyboard" | "variations" | "generate"

const STATUS_SYMBOL = {
  empty: "○",
  mixed: "◐",
  configured: "●",
  recipe: "◆",
  conflict: "!",
} as const

const MODES: Array<{ id: VideoDirectorMode; label: string }> = [
  { id: "single", label: "SINGLE" },
  { id: "variations", label: "VARIATIONS" },
  { id: "sequence", label: "SEQUENCE" },
  { id: "campaign", label: "CAMPAIGN" },
]

const PAGES: Array<{ id: Page; label: string }> = [
  { id: "direct", label: "DIRECT" },
  { id: "storyboard", label: "STORYBOARD" },
  { id: "variations", label: "VARIATIONS" },
  { id: "generate", label: "GENERATE" },
]

const finite = (value: string, fallback: number) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="vtdw-field">
    <span>{label}</span>
    {children}
  </label>
)

export const VideoDirectorWidget: React.FC<
  CommonWidgetProps & { data: DashboardData; onNavigate?: (to: string) => void }
> = ({ onNavigate, ...common }) => {
  const [project, setProject] = useState<VideoDirectorProject>(
    () => readVideoDirectorState() ?? createEmptyVideoDirectorProject(),
  )
  const [page, setPage] = useState<Page>("direct")
  const [scopeKey, setScopeKey] = useState("project")
  const [variantId, setVariantId] = useState("")
  const [jobs, setJobs] = useState<VideoDirectorRemoteJob[]>([])
  const [jobsLoading, setJobsLoading] = useState(false)
  const [autoFillLoading, setAutoFillLoading] = useState(false)
  const [notice, setNotice] = useState("")

  useEffect(
    () => subscribeVideoDirectorState((next) => {
      if (!next) return
      setProject((current) => current.updatedAt === next.updatedAt ? current : next)
    }),
    [],
  )

  const commit = useCallback((nextInput: VideoDirectorProject) => {
    const next = applyVideoDirectorConflicts(VideoDirectorProjectSchema.parse(nextInput))
    setProject(next)
    writeVideoDirectorState(next)
    return next
  }, [])

  const scopeOptions = useMemo(() => listVideoDirectorScopeOptions(project), [project])
  const activeScope = useMemo<VideoDirectorScope>(
    () => parseVideoDirectorScopeKey(scopeKey, project),
    [project, scopeKey],
  )

  useEffect(() => {
    if (scopeOptions.some((option) => option.key === scopeKey)) return
    setScopeKey("project")
  }, [scopeKey, scopeOptions])

  const activeCategoryId = project.activeCategoryId
  const activeDefinition = VIDEO_DIRECTOR_CATEGORY_REGISTRY.find((item) => item.id === activeCategoryId)!
  const activeState = useMemo(
    () => resolveVideoDirectorScopedCategoryState(project, activeCategoryId, activeScope),
    [activeCategoryId, activeScope, project],
  )
  const activePayload = activeState.payload as Record<string, any>
  const activeStatus = deriveVideoDirectorCategoryStatus(activeState)

  const setScopedField = useCallback((categoryId: VideoDirectorCategoryId, field: string, value: unknown) => {
    commit(setVideoDirectorScopedCategoryField({
      project,
      categoryId,
      field,
      value,
      scope: activeScope,
    }))
  }, [activeScope, commit, project])

  const setProjectField = useCallback((categoryId: VideoDirectorCategoryId, field: string, value: unknown) => {
    commit(setVideoDirectorScopedCategoryField({
      project,
      categoryId,
      field,
      value,
      scope: { type: "project" },
    }))
  }, [commit, project])

  const selectCategory = useCallback((categoryId: VideoDirectorCategoryId) => {
    commit(VideoDirectorProjectSchema.parse({ ...project, activeCategoryId: categoryId }))
    setPage("direct")
  }, [commit, project])

  const refreshJobs = useCallback(async () => {
    setJobsLoading(true)
    try {
      setJobs(await listVideoDirectorJobs({ projectId: project.id, limit: 12 }))
    } catch {
      setJobs([])
    } finally {
      setJobsLoading(false)
    }
  }, [project.id])

  useEffect(() => {
    if (page !== "generate") return
    void refreshJobs()
  }, [page, refreshJobs])

  useEffect(() => {
    if (page !== "generate") return
    if (!jobs.some((job) => job.status === "queued" || job.status === "running" || job.status === "post-processing")) return
    const timer = window.setInterval(() => { void refreshJobs() }, 4_000)
    return () => window.clearInterval(timer)
  }, [jobs, page, refreshJobs])

  const runAutoFill = useCallback(async () => {
    const brief = project.categories["concept-direction"].payload.brief.trim()
    if (!brief) {
      setNotice("ADD A BRIEF BEFORE AUTO-FILL.")
      return
    }
    setAutoFillLoading(true)
    try {
      const result = await autoFillVideoDirectorProject({ project })
      const next = commit(result.project)
      setNotice(
        `AUTO-FILL APPLIED ${result.acceptedFields.length} FIELD${result.acceptedFields.length === 1 ? "" : "S"}${result.storyboardCreated ? ` · ${next.shots.length} SHOTS CREATED` : ""}.`,
      )
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "AUTO-FILL FAILED.")
    } finally {
      setAutoFillLoading(false)
    }
  }, [commit, project])

  const categoryOptions = useMemo(
    () => VIDEO_DIRECTOR_CATEGORY_REGISTRY.map((definition) => {
      const state = resolveVideoDirectorScopedCategoryState(project, definition.id, activeScope)
      return {
        value: definition.id,
        label: `${STATUS_SYMBOL[deriveVideoDirectorCategoryStatus(state)]} ${definition.label}`,
      }
    }),
    [activeScope, project],
  )

  const selectedVariant = project.variants.find((variant) => variant.id === variantId) ?? project.variants[0] ?? null
  useEffect(() => {
    if (selectedVariant && selectedVariant.id !== variantId) setVariantId(selectedVariant.id)
  }, [selectedVariant, variantId])

  const renderSignature = () => {
    if (activeCategoryId === "camera-lens") {
      return <DirectorWidgetLensVisual focalLength={activePayload.focalLengthMm} aperture={activePayload.aperture} />
    }
    if (activeCategoryId === "emotion-tone") {
      return <DirectorWidgetMoodVisual horizontal={activePayload.triumphantVsSomber} vertical={activePayload.energeticVsCalm} />
    }
    if (activeCategoryId === "composition") {
      return <DirectorWidgetCompositionVisual subjectX={activePayload.subjectX} subjectY={activePayload.subjectY} horizonY={activePayload.horizonY} safeZones={activePayload.safeZones} />
    }
    if (activeCategoryId === "lighting") {
      return <DirectorWidgetLightingVisual azimuth={activePayload.keyAzimuthDegrees} elevation={activePayload.keyElevationDegrees} temperatureK={activePayload.temperatureK} />
    }
    if (activeCategoryId === "timing-pacing") {
      return <DirectorWidgetPacingVisual duration={activePayload.durationSeconds} hook={activePayload.openingHookSeconds} hold={activePayload.finalHoldSeconds} />
    }
    if (activeCategoryId === "ambience-mix") {
      return <DirectorWidgetAudioStage width={activePayload.spatialWidth} targetLufs={activePayload.targetLufs} />
    }
    if (activeCategoryId === "generation-output") {
      return <DirectorWidgetProviderRoute mode={activePayload.providerMode} provider={activePayload.providerId} model={activePayload.modelId} />
    }
    return (
      <div className="vtdw-signature vtdw-pacing">
        <div className="vtdw-category-copy">
          <strong>{activeDefinition.compoundComponent}</strong>
          <small>{activeDefinition.purpose}</small>
        </div>
      </div>
    )
  }

  const renderPrimaryControls = () => {
    if (activeCategoryId === "camera-lens") {
      return <div className="vtdw-field-grid">
        <Field label="Focal Length">
          <WidgetTextInput height={32} type="number" min={1} max={1200} value={activePayload.focalLengthMm} onChange={(event) => setScopedField(activeCategoryId, "focalLengthMm", finite(event.currentTarget.value, activePayload.focalLengthMm))} />
        </Field>
        <Field label="Aperture">
          <WidgetTextInput height={32} type="number" min={0.7} max={64} step={0.1} value={activePayload.aperture} onChange={(event) => setScopedField(activeCategoryId, "aperture", finite(event.currentTarget.value, activePayload.aperture))} />
        </Field>
      </div>
    }
    if (activeCategoryId === "emotion-tone") {
      return <div className="vtdw-field-grid">
        <Field label="Somber ↔ Triumphant">
          <WidgetTextInput height={32} type="number" min={-1} max={1} step={0.1} value={activePayload.triumphantVsSomber} onChange={(event) => setScopedField(activeCategoryId, "triumphantVsSomber", finite(event.currentTarget.value, activePayload.triumphantVsSomber))} />
        </Field>
        <Field label="Calm ↔ Energetic">
          <WidgetTextInput height={32} type="number" min={-1} max={1} step={0.1} value={activePayload.energeticVsCalm} onChange={(event) => setScopedField(activeCategoryId, "energeticVsCalm", finite(event.currentTarget.value, activePayload.energeticVsCalm))} />
        </Field>
      </div>
    }
    if (activeCategoryId === "composition") {
      return <div className="vtdw-field-grid">
        <Field label="Subject X %"><WidgetTextInput height={32} type="number" min={0} max={100} value={Math.round(activePayload.subjectX * 100)} onChange={(event) => setScopedField(activeCategoryId, "subjectX", finite(event.currentTarget.value, activePayload.subjectX * 100) / 100)} /></Field>
        <Field label="Subject Y %"><WidgetTextInput height={32} type="number" min={0} max={100} value={Math.round(activePayload.subjectY * 100)} onChange={(event) => setScopedField(activeCategoryId, "subjectY", finite(event.currentTarget.value, activePayload.subjectY * 100) / 100)} /></Field>
        <Field label="Horizon %"><WidgetTextInput height={32} type="number" min={0} max={100} value={Math.round(activePayload.horizonY * 100)} onChange={(event) => setScopedField(activeCategoryId, "horizonY", finite(event.currentTarget.value, activePayload.horizonY * 100) / 100)} /></Field>
        <Field label="Safe Zones"><WidgetToggleSwitch height={32} checked={activePayload.safeZones} onChange={(checked) => setScopedField(activeCategoryId, "safeZones", checked)} label="Safe zones" /></Field>
      </div>
    }
    if (activeCategoryId === "lighting") {
      return <div className="vtdw-field-grid">
        <Field label="Azimuth"><WidgetTextInput height={32} type="number" min={-180} max={180} value={activePayload.keyAzimuthDegrees} onChange={(event) => setScopedField(activeCategoryId, "keyAzimuthDegrees", finite(event.currentTarget.value, activePayload.keyAzimuthDegrees))} /></Field>
        <Field label="Elevation"><WidgetTextInput height={32} type="number" min={-90} max={90} value={activePayload.keyElevationDegrees} onChange={(event) => setScopedField(activeCategoryId, "keyElevationDegrees", finite(event.currentTarget.value, activePayload.keyElevationDegrees))} /></Field>
        <Field label="Temperature"><WidgetTextInput height={32} type="number" min={1000} max={20000} value={activePayload.temperatureK} onChange={(event) => setScopedField(activeCategoryId, "temperatureK", finite(event.currentTarget.value, activePayload.temperatureK))} /></Field>
      </div>
    }
    if (activeCategoryId === "timing-pacing") {
      return <div className="vtdw-field-grid">
        <Field label="Duration"><WidgetTextInput height={32} type="number" min={1} max={3600} step={0.5} value={activePayload.durationSeconds} onChange={(event) => setScopedField(activeCategoryId, "durationSeconds", finite(event.currentTarget.value, activePayload.durationSeconds))} /></Field>
        <Field label="Opening Hook"><WidgetTextInput height={32} type="number" min={0} max={60} step={0.25} value={activePayload.openingHookSeconds} onChange={(event) => setScopedField(activeCategoryId, "openingHookSeconds", finite(event.currentTarget.value, activePayload.openingHookSeconds))} /></Field>
        <Field label="Final Hold"><WidgetTextInput height={32} type="number" min={0} max={60} step={0.25} value={activePayload.finalHoldSeconds} onChange={(event) => setScopedField(activeCategoryId, "finalHoldSeconds", finite(event.currentTarget.value, activePayload.finalHoldSeconds))} /></Field>
      </div>
    }
    if (activeCategoryId === "ambience-mix") {
      return <div className="vtdw-field-grid">
        <Field label="Spatial Width %"><WidgetTextInput height={32} type="number" min={0} max={100} value={Math.round(activePayload.spatialWidth * 100)} onChange={(event) => setScopedField(activeCategoryId, "spatialWidth", finite(event.currentTarget.value, activePayload.spatialWidth * 100) / 100)} /></Field>
        <Field label="Target LUFS"><WidgetTextInput height={32} type="number" min={-40} max={-5} value={activePayload.targetLufs} onChange={(event) => setScopedField(activeCategoryId, "targetLufs", finite(event.currentTarget.value, activePayload.targetLufs))} /></Field>
      </div>
    }
    return (
      <div className="vtdw-field-grid">
        <WidgetSizedButton height={32} tone="secondary" onClick={() => onNavigate?.("/studio#video-director")}>
          OPEN FULL {activeDefinition.shortLabel.toUpperCase()} CONTROLS
        </WidgetSizedButton>
        <WidgetBadge>{activeDefinition.group.toUpperCase()}</WidgetBadge>
      </div>
    )
  }

  const directPage = (
    <>
      <WidgetSection>
        <div className="vtdw-mode-row">
          {MODES.map((mode) => (
            <WidgetSizedButton
              key={mode.id}
              height={32}
              tone={project.mode === mode.id ? "primary" : "default"}
              aria-pressed={project.mode === mode.id}
              onClick={() => commit(VideoDirectorProjectSchema.parse({ ...project, mode: mode.id }))}
            >
              {mode.label}
            </WidgetSizedButton>
          ))}
        </div>
      </WidgetSection>

      <WidgetSection>
        <div className="vtdw-field-grid">
          <Field label="Idea / Brief">
            <WidgetTextInput
              height={38}
              value={project.categories["concept-direction"].payload.brief}
              placeholder="Describe the video…"
              onChange={(event) => setProjectField("concept-direction", "brief", event.currentTarget.value)}
            />
          </Field>
          <Field label="Edit Scope">
            <WidgetSizedSelect
              height={38}
              value={scopeKey}
              label="Video Director edit scope"
              options={scopeOptions.map((option) => ({ value: option.key, label: option.label }))}
              onChange={setScopeKey}
            />
          </Field>
        </div>
        <div className="vtdw-quick-row">
          <WidgetActionButton tone="primary" height={38} disabled={autoFillLoading} onClick={() => void runAutoFill()}>
            <Sparkles size={15} aria-hidden="true" /> {autoFillLoading ? "DIRECTING…" : "AUTO-FILL DIRECTOR"}
          </WidgetActionButton>
          <WidgetSizedButton height={38} tone="secondary" onClick={() => onNavigate?.("/studio#video-director")}>
            <ExternalLink size={14} aria-hidden="true" /> OPEN STUDIO
          </WidgetSizedButton>
        </div>
      </WidgetSection>

      <WidgetSection>
        <div className="vtdw-category-head">
          <div className="vtdw-category-copy">
            <strong>{STATUS_SYMBOL[activeStatus]} {activeDefinition.label}</strong>
            <small>{activeDefinition.purpose}</small>
          </div>
          <WidgetSizedSelect
            height={38}
            value={activeCategoryId}
            label="Director category"
            options={categoryOptions}
            onChange={(value) => selectCategory(value as VideoDirectorCategoryId)}
          />
        </div>
      </WidgetSection>

      <WidgetSection>{renderSignature()}</WidgetSection>
      <WidgetSection>{renderPrimaryControls()}</WidgetSection>

      <WidgetSection>
        <div className="vtdw-category-strip" aria-label="Director category quick switch">
          {VIDEO_DIRECTOR_CATEGORY_REGISTRY.map((definition) => {
            const state = resolveVideoDirectorScopedCategoryState(project, definition.id, activeScope)
            const status = deriveVideoDirectorCategoryStatus(state)
            return (
              <WidgetSizedButton
                key={definition.id}
                height={24}
                tone={definition.id === activeCategoryId ? "primary" : "default"}
                onClick={() => selectCategory(definition.id)}
                title={definition.label}
              >
                {STATUS_SYMBOL[status]} {definition.shortLabel}
              </WidgetSizedButton>
            )
          })}
        </div>
      </WidgetSection>
    </>
  )

  const storyboardPage = (
    <>
      <WidgetSection>
        <DirectorWidgetShotStrip shots={project.shots} />
      </WidgetSection>
      <WidgetSection>
        <div className="vtdw-quick-row">
          <WidgetActionButton
            tone="primary"
            height={38}
            onClick={() => {
              const next = commit(buildVideoDirectorStoryboard(project))
              setNotice(`STORYBOARD READY · ${next.shots.length} SHOTS.`)
            }}
          >
            BUILD / SYNC STORYBOARD
          </WidgetActionButton>
          <WidgetSizedButton height={38} tone="secondary" onClick={() => onNavigate?.("/studio#video-director")}>EDIT SHOTS IN STUDIO</WidgetSizedButton>
        </div>
      </WidgetSection>
      <WidgetSection>
        <div className="vtdw-summary-row">
          {project.shots.map((shot, index) => (
            <WidgetSizedButton key={shot.id} height={32} tone={scopeKey === `shot:${shot.id}` ? "primary" : "default"} onClick={() => { setScopeKey(`shot:${shot.id}`); setPage("direct") }}>
              {String(index + 1).padStart(2, "0")} · {shot.durationSeconds.toFixed(1)}S
            </WidgetSizedButton>
          ))}
        </div>
      </WidgetSection>
    </>
  )

  const variationsPage = (
    <>
      <WidgetSection>
        <div className="vtdw-quick-row">
          <WidgetActionButton
            tone="primary"
            height={38}
            onClick={() => {
              const count = Math.max(2, project.categories["generation-output"].payload.outputs)
              const next = commit(ensureVideoDirectorVariants(project, count))
              setVariantId(next.variants[0]?.id || "")
              setNotice(`${next.variants.length} VARIATION LANES READY.`)
            }}
          >
            BUILD VARIANTS
          </WidgetActionButton>
          {project.variants.map((variant, index) => (
            <WidgetSizedButton key={variant.id} height={32} tone={selectedVariant?.id === variant.id ? "primary" : "default"} onClick={() => setVariantId(variant.id)}>
              {String.fromCharCode(65 + index)}
            </WidgetSizedButton>
          ))}
        </div>
      </WidgetSection>
      {selectedVariant ? (
        <>
          <WidgetSection>
            <div className="vtdw-field-grid">
              <Field label="Variation Strength">
                <WidgetSizedSelect
                  height={38}
                  value={selectedVariant.variationStrength}
                  label="Variation strength"
                  options={[
                    { value: "subtle", label: "SUBTLE" },
                    { value: "balanced", label: "BALANCED" },
                    { value: "radical", label: "RADICAL" },
                  ]}
                  onChange={(value) => commit(setVideoDirectorVariantStrength(project, selectedVariant.id, value as "subtle" | "balanced" | "radical"))}
                />
              </Field>
              <div className="vtdw-summary-row">
                <WidgetBadge>{selectedVariant.allowedCategories.length} ALLOWED</WidgetBadge>
                <WidgetBadge>{VIDEO_DIRECTOR_CATEGORY_REGISTRY.filter((definition) => project.categories[definition.id].locked).length} LOCKED</WidgetBadge>
              </div>
            </div>
          </WidgetSection>
          <WidgetSection>
            <div className="vtdw-variation-grid">
              {VIDEO_DIRECTOR_CATEGORY_REGISTRY.filter((definition) => definition.variationSupport).map((definition) => {
                const allowed = selectedVariant.allowedCategories.includes(definition.id)
                const locked = project.categories[definition.id].locked
                return (
                  <WidgetSizedButton
                    key={definition.id}
                    height={32}
                    tone={allowed ? "primary" : "default"}
                    disabled={locked}
                    onClick={() => commit(setVideoDirectorVariantCategoryAllowed(project, selectedVariant.id, definition.id, !allowed))}
                    title={locked ? "Project category is locked." : definition.purpose}
                  >
                    {allowed ? "●" : "○"} {definition.shortLabel}
                  </WidgetSizedButton>
                )
              })}
            </div>
          </WidgetSection>
        </>
      ) : <WidgetSection><WidgetToast status="neutral" title="NO VARIANTS YET" detail="Build variants to create independently directed A/B/C lanes." /></WidgetSection>}
    </>
  )

  const output = project.categories["generation-output"].payload
  const generatePage = (
    <>
      <WidgetSection>
        <DirectorWidgetProviderRoute mode={output.providerMode} provider={output.providerId} model={output.modelId} />
      </WidgetSection>
      <WidgetSection>
        <div className="vtdw-field-grid">
          <Field label="Aspect Ratio">
            <WidgetSizedSelect height={38} value={output.aspectRatio} label="Aspect ratio" options={["21:9","16:9","4:3","1:1","3:4","9:16","custom"].map((value) => ({ value, label: value }))} onChange={(value) => setProjectField("generation-output", "aspectRatio", value)} />
          </Field>
          <Field label="Resolution">
            <WidgetSizedSelect height={38} value={output.resolution} label="Resolution" options={["480p","720p","1080p","2k","4k"].map((value) => ({ value, label: value.toUpperCase() }))} onChange={(value) => setProjectField("generation-output", "resolution", value)} />
          </Field>
          <Field label="Quality">
            <WidgetSizedSelect height={38} value={output.quality} label="Quality" options={["draft","preview","final"].map((value) => ({ value, label: value.toUpperCase() }))} onChange={(value) => setProjectField("generation-output", "quality", value)} />
          </Field>
          <Field label="Outputs">
            <WidgetStepper height={38} value={output.outputs} min={1} max={24} label="Output count" onChange={(value) => setProjectField("generation-output", "outputs", value)} />
          </Field>
        </div>
      </WidgetSection>
      <WidgetSection>
        <div className="vtdw-summary-row">
          <WidgetSizedButton height={32} tone="secondary" onClick={() => {
            const packet = compileSemanticDirectorPacket(project)
            setNotice(`PLAN READY · ${packet.prompt.split("\n").length} DIRECTING LINES · PROVIDER EXECUTION STILL GATED.`)
          }}>PREVIEW PLAN</WidgetSizedButton>
          <WidgetSizedButton height={32} tone="secondary" disabled={jobsLoading} onClick={() => void refreshJobs()}>{jobsLoading ? "REFRESHING…" : "REFRESH JOBS"}</WidgetSizedButton>
        </div>
      </WidgetSection>
      {jobs.length ? <WidgetSection>
        <div className="vtdw-shot-strip">
          {jobs.slice(0, 8).map((job) => (
            <div className="vtdw-shot" key={job.id}>
              <span>{job.status.toUpperCase()}</span>
              <strong>{job.stage}</strong>
              <WidgetProgressBar height={24} value={Math.round(job.progress * 100)} label="Progress" />
              {(job.status === "queued" || job.status === "running" || job.status === "post-processing") ? (
                <WidgetSizedButton height={24} tone="secondary" onClick={async () => { await cancelVideoDirectorJob(job.id); await refreshJobs() }}>CANCEL</WidgetSizedButton>
              ) : null}
            </div>
          ))}
        </div>
      </WidgetSection> : null}
    </>
  )

  const body = page === "direct" ? directPage : page === "storyboard" ? storyboardPage : page === "variations" ? variationsPage : generatePage

  return (
    <WidgetShell
      {...common}
      icon={<Clapperboard size={22} />}
      hasAI
      onRegenerate={() => void runAutoFill()}
      aiDisabled={autoFillLoading || !project.categories["concept-direction"].payload.brief.trim()}
      aiDisabledReason="Add a brief before Auto-Fill Director."
      helpContent={<span>Compact Video Director execution surface. All project state is shared with Studio Hub.</span>}
      contentLayout="flush"
    >
      <div className="vt-video-director-widget">
        <WidgetWorkflowMain>
          <WidgetSection surface="white">
            <div className="vtdw-topline">
              <div className="vtdw-page-row" role="tablist" aria-label="Video Director pages">
                {PAGES.map((item) => (
                  <WidgetSizedButton key={item.id} height={32} tone={page === item.id ? "primary" : "default"} aria-pressed={page === item.id} onClick={() => setPage(item.id)}>
                    {item.label}
                  </WidgetSizedButton>
                ))}
              </div>
              <WidgetBadge>{project.name || "UNTITLED"}</WidgetBadge>
            </div>
          </WidgetSection>
          <WidgetScrollArea ariaLabel="Video Director workflow" edge="full">
            {notice ? <WidgetSection><WidgetToast title={notice} status="neutral" onDismiss={() => setNotice("")} /></WidgetSection> : null}
            {body}
          </WidgetScrollArea>
        </WidgetWorkflowMain>
        <WidgetFooter>
          <div className="vtdw-footer-grid">
            <div className="vtdw-footer-copy">
              <strong>{output.outputs} VIDEO{output.outputs === 1 ? "" : "S"} · {project.categories["timing-pacing"].payload.durationSeconds}S · {output.aspectRatio}</strong>
              <span>{activeScope.type.toUpperCase()} · {STATUS_SYMBOL[activeStatus]} {activeDefinition.shortLabel} · {output.providerMode === "auto" ? "AUTO ROUTE" : output.providerId || "MANUAL ROUTE"}</span>
            </div>
            <WidgetSizedButton height={38} tone="secondary" onClick={() => onNavigate?.("/studio#video-director")}>
              OPEN STUDIO
            </WidgetSizedButton>
            <WidgetActionButton className="vtdw-generate" tone="primary" height={38} disabled title="Provider quote, credit reservation and production adapter are still gated.">
              GENERATE
            </WidgetActionButton>
          </div>
        </WidgetFooter>
      </div>
    </WidgetShell>
  )
}

export default VideoDirectorWidget
