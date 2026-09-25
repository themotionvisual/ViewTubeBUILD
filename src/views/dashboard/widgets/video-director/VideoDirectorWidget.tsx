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
  writeVideoDirectorSurfaceHandoff,
  type VideoDirectorCategoryId,
  type VideoDirectorMode,
  type VideoDirectorProject,
  type VideoDirectorRemoteJob,
  type VideoDirectorScope,
} from "../../../../features/video-director"
import {
  DirectorWidgetAudioStage,
  DirectorWidgetCameraPath,
  DirectorWidgetCaptionPreview,
  DirectorWidgetCompositionVisual,
  DirectorWidgetContinuityLedger,
  DirectorWidgetFocusDepth,
  DirectorWidgetLensVisual,
  DirectorWidgetLightingVisual,
  DirectorWidgetMoodVisual,
  DirectorWidgetMusicBeat,
  DirectorWidgetNegativeBank,
  DirectorWidgetPacingVisual,
  DirectorWidgetProviderRoute,
  DirectorWidgetReferenceBoard,
  DirectorWidgetShotStrip,
  DirectorWidgetTextureStack,
  DirectorWidgetTransitionBridge,
} from "./VideoDirectorWidgetComponents"
import {
  DirectorWidgetConceptDeck,
  DirectorWidgetDialogueLane,
  DirectorWidgetEffectsStack,
  DirectorWidgetGradeBoard,
  DirectorWidgetOutputCard,
  DirectorWidgetOverlayStack,
  DirectorWidgetPaletteBoard,
  DirectorWidgetPerspectiveRig,
  DirectorWidgetSfxLane,
  DirectorWidgetShotStructure,
  DirectorWidgetSpeedCurve,
  DirectorWidgetStyleDeck,
  DirectorWidgetTitleCanvas,
} from "./VideoDirectorWidgetMoreComponents"
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

const DirectorButton: React.FC<React.ComponentProps<typeof WidgetSizedButton>> = ({
  textFit = "adaptive",
  ...props
}) => <WidgetSizedButton textFit={textFit} {...props} />

const DirectorActionButton: React.FC<React.ComponentProps<typeof WidgetActionButton>> = ({
  textFit = "adaptive",
  ...props
}) => <WidgetActionButton textFit={textFit} {...props} />

const DirectorSelect: React.FC<React.ComponentProps<typeof WidgetSizedSelect>> = ({
  textFit = "adaptive",
  ...props
}) => <WidgetSizedSelect textFit={textFit} {...props} />

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

  const openStudio = useCallback(() => {
    writeVideoDirectorSurfaceHandoff({
      categoryId: project.activeCategoryId,
      scopeKey,
      source: "dashboard",
      target: "studio",
    })
    onNavigate?.("/studio#video-director")
  }, [onNavigate, project.activeCategoryId, scopeKey])

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
      return <div className="flex flex-col gap-2"><DirectorWidgetOutputCard ratio={activePayload.aspectRatio} resolution={activePayload.resolution} quality={activePayload.quality} outputs={activePayload.outputs} nativeAudio={activePayload.generateAudio} upscale={activePayload.upscale} hdr={activePayload.hdr} /><DirectorWidgetProviderRoute mode={activePayload.providerMode} provider={activePayload.providerId} model={activePayload.modelId} /></div>
    }
    if (activeCategoryId === "camera-movement") {
      return <DirectorWidgetCameraPath type={activePayload.type} speed={activePayload.speed} panDegrees={activePayload.panDegrees} tiltDegrees={activePayload.tiltDegrees} orbitDegrees={activePayload.orbitDegrees} />
    }
    if (activeCategoryId === "focus-depth") {
      return <DirectorWidgetFocusDepth mode={activePayload.mode} focusDistanceMeters={activePayload.focusDistanceMeters} depthStrength={activePayload.depthStrength} bokeh={activePayload.bokeh} />
    }
    if (activeCategoryId === "texture-film") {
      return <DirectorWidgetTextureStack grain={activePayload.grain} halation={activePayload.halation} bloom={activePayload.bloom} vignette={activePayload.vignette} filmStock={activePayload.filmStock} />
    }
    if (activeCategoryId === "transitions") {
      return <DirectorWidgetTransitionBridge type={activePayload.defaultType} durationFrames={activePayload.durationFrames} matchMotion={activePayload.matchMotion} />
    }
    if (activeCategoryId === "music") {
      return <DirectorWidgetMusicBeat bpm={activePayload.bpm} intensity={activePayload.intensity} beatSync={activePayload.beatSync} />
    }
    if (activeCategoryId === "captions") {
      return <DirectorWidgetCaptionPreview position={activePayload.position} animation={activePayload.animation} maxWordsPerLine={activePayload.maxWordsPerLine} burnIn={activePayload.burnIn} />
    }
    if (activeCategoryId === "references-seeds") {
      return <DirectorWidgetReferenceBoard referenceCount={activePayload.references.length} seed={activePayload.seed} lockSeed={activePayload.lockSeed} variationNoise={activePayload.variationNoise} />
    }
    if (activeCategoryId === "consistency-continuity") {
      return <DirectorWidgetContinuityLedger entityCount={activePayload.entities.length} identityStrength={activePayload.identityStrength} wardrobeStrength={activePayload.wardrobeStrength} environmentStrength={activePayload.environmentStrength} />
    }
    if (activeCategoryId === "negative-constraints") {
      return <DirectorWidgetNegativeBank tagCount={activePayload.tags.length} enforcement={activePayload.enforcement} freeText={activePayload.freeText} />
    }
    if (activeCategoryId === "concept-direction") {
      return <DirectorWidgetConceptDeck objective={activePayload.objective} audience={activePayload.audience} treatment={activePayload.treatment} conceptCount={activePayload.conceptCount} variationStrength={activePayload.variationStrength} />
    }
    if (activeCategoryId === "visual-style") {
      return <DirectorWidgetStyleDeck medium={activePayload.medium} period={activePayload.period} realism={activePayload.realism} stylization={activePayload.stylization} descriptorCount={activePayload.descriptors.length} recipeCount={activePayload.recipeIds.length} />
    }
    if (activeCategoryId === "perspective-capture") {
      return <DirectorWidgetPerspectiveRig rig={activePayload.rig} cameraHeightMeters={activePayload.cameraHeightMeters} pitchDegrees={activePayload.pitchDegrees} yawDegrees={activePayload.yawDegrees} fieldOfViewDegrees={activePayload.fieldOfViewDegrees} firstPerson={activePayload.firstPerson} />
    }
    if (activeCategoryId === "color-palette") {
      return <DirectorWidgetPaletteBoard colors={activePayload.colors} exactLock={activePayload.exactLock} />
    }
    if (activeCategoryId === "grade-exposure") {
      return <DirectorWidgetGradeBoard exposureEv={activePayload.exposureEv} contrast={activePayload.contrast} highlights={activePayload.highlights} shadows={activePayload.shadows} temperatureK={activePayload.temperatureK} saturation={activePayload.saturation} />
    }
    if (activeCategoryId === "shot-structure") {
      return <DirectorWidgetShotStructure mode={activePayload.mode} shotCount={activePayload.shotCount} averageShotSeconds={activePayload.averageShotSeconds} continuityStrength={activePayload.continuityStrength} />
    }
    if (activeCategoryId === "speed-motion") {
      return <DirectorWidgetSpeedCurve playbackRate={activePayload.playbackRate} interpolation={activePayload.interpolation} motionBlur={activePayload.motionBlur} pointCount={activePayload.speedCurve.length} />
    }
    if (activeCategoryId === "voice-dialogue") {
      return <DirectorWidgetDialogueLane enabled={activePayload.enabled} source={activePayload.source} language={activePayload.language} speakingRate={activePayload.speakingRate} expressiveness={activePayload.expressiveness} scriptLength={activePayload.script.length} />
    }
    if (activeCategoryId === "sound-effects") {
      return <DirectorWidgetSfxLane enabled={activePayload.enabled} cueCount={activePayload.cues.length} autoDetectEvents={activePayload.autoDetectEvents} />
    }
    if (activeCategoryId === "text-titles") {
      return <DirectorWidgetTitleCanvas overlayCount={activePayload.overlays.length} safeMargins={activePayload.safeMargins} />
    }
    if (activeCategoryId === "stickers-overlays") {
      return <DirectorWidgetOverlayStack itemCount={activePayload.items.length} />
    }
    if (activeCategoryId === "visual-effects") {
      return <DirectorWidgetEffectsStack effects={activePayload.effects} />
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
          <WidgetTextInput height={24} type="number" min={1} max={1200} value={activePayload.focalLengthMm} onChange={(event) => setScopedField(activeCategoryId, "focalLengthMm", finite(event.currentTarget.value, activePayload.focalLengthMm))} />
        </Field>
        <Field label="Aperture">
          <WidgetTextInput height={24} type="number" min={0.7} max={64} step={0.1} value={activePayload.aperture} onChange={(event) => setScopedField(activeCategoryId, "aperture", finite(event.currentTarget.value, activePayload.aperture))} />
        </Field>
      </div>
    }
    if (activeCategoryId === "emotion-tone") {
      return <div className="vtdw-field-grid">
        <Field label="Somber ↔ Triumphant">
          <WidgetTextInput height={24} type="number" min={-1} max={1} step={0.1} value={activePayload.triumphantVsSomber} onChange={(event) => setScopedField(activeCategoryId, "triumphantVsSomber", finite(event.currentTarget.value, activePayload.triumphantVsSomber))} />
        </Field>
        <Field label="Calm ↔ Energetic">
          <WidgetTextInput height={24} type="number" min={-1} max={1} step={0.1} value={activePayload.energeticVsCalm} onChange={(event) => setScopedField(activeCategoryId, "energeticVsCalm", finite(event.currentTarget.value, activePayload.energeticVsCalm))} />
        </Field>
      </div>
    }
    if (activeCategoryId === "composition") {
      return <div className="vtdw-field-grid">
        <Field label="Subject X %"><WidgetTextInput height={24} type="number" min={0} max={100} value={Math.round(activePayload.subjectX * 100)} onChange={(event) => setScopedField(activeCategoryId, "subjectX", finite(event.currentTarget.value, activePayload.subjectX * 100) / 100)} /></Field>
        <Field label="Subject Y %"><WidgetTextInput height={24} type="number" min={0} max={100} value={Math.round(activePayload.subjectY * 100)} onChange={(event) => setScopedField(activeCategoryId, "subjectY", finite(event.currentTarget.value, activePayload.subjectY * 100) / 100)} /></Field>
        <Field label="Horizon %"><WidgetTextInput height={24} type="number" min={0} max={100} value={Math.round(activePayload.horizonY * 100)} onChange={(event) => setScopedField(activeCategoryId, "horizonY", finite(event.currentTarget.value, activePayload.horizonY * 100) / 100)} /></Field>
        <Field label="Safe Zones"><WidgetToggleSwitch height={24} checked={activePayload.safeZones} onChange={(checked) => setScopedField(activeCategoryId, "safeZones", checked)} label="Safe zones" /></Field>
      </div>
    }
    if (activeCategoryId === "lighting") {
      return <div className="vtdw-field-grid">
        <Field label="Azimuth"><WidgetTextInput height={24} type="number" min={-180} max={180} value={activePayload.keyAzimuthDegrees} onChange={(event) => setScopedField(activeCategoryId, "keyAzimuthDegrees", finite(event.currentTarget.value, activePayload.keyAzimuthDegrees))} /></Field>
        <Field label="Elevation"><WidgetTextInput height={24} type="number" min={-90} max={90} value={activePayload.keyElevationDegrees} onChange={(event) => setScopedField(activeCategoryId, "keyElevationDegrees", finite(event.currentTarget.value, activePayload.keyElevationDegrees))} /></Field>
        <Field label="Temperature"><WidgetTextInput height={24} type="number" min={1000} max={20000} value={activePayload.temperatureK} onChange={(event) => setScopedField(activeCategoryId, "temperatureK", finite(event.currentTarget.value, activePayload.temperatureK))} /></Field>
      </div>
    }
    if (activeCategoryId === "timing-pacing") {
      return <div className="vtdw-field-grid">
        <Field label="Duration"><WidgetTextInput height={24} type="number" min={1} max={3600} step={0.5} value={activePayload.durationSeconds} onChange={(event) => setScopedField(activeCategoryId, "durationSeconds", finite(event.currentTarget.value, activePayload.durationSeconds))} /></Field>
        <Field label="Opening Hook"><WidgetTextInput height={24} type="number" min={0} max={60} step={0.25} value={activePayload.openingHookSeconds} onChange={(event) => setScopedField(activeCategoryId, "openingHookSeconds", finite(event.currentTarget.value, activePayload.openingHookSeconds))} /></Field>
        <Field label="Final Hold"><WidgetTextInput height={24} type="number" min={0} max={60} step={0.25} value={activePayload.finalHoldSeconds} onChange={(event) => setScopedField(activeCategoryId, "finalHoldSeconds", finite(event.currentTarget.value, activePayload.finalHoldSeconds))} /></Field>
      </div>
    }
    if (activeCategoryId === "ambience-mix") {
      return <div className="vtdw-field-grid">
        <Field label="Spatial Width %"><WidgetTextInput height={24} type="number" min={0} max={100} value={Math.round(activePayload.spatialWidth * 100)} onChange={(event) => setScopedField(activeCategoryId, "spatialWidth", finite(event.currentTarget.value, activePayload.spatialWidth * 100) / 100)} /></Field>
        <Field label="Target LUFS"><WidgetTextInput height={24} type="number" min={-40} max={-5} value={activePayload.targetLufs} onChange={(event) => setScopedField(activeCategoryId, "targetLufs", finite(event.currentTarget.value, activePayload.targetLufs))} /></Field>
      </div>
    }
    if (activeCategoryId === "concept-direction") {
      return <div className="vtdw-field-grid">
        <Field label="Objective"><WidgetTextInput height={24} value={activePayload.objective} onChange={(e)=>setScopedField(activeCategoryId,"objective",e.currentTarget.value)} /></Field>
        <Field label="Audience"><WidgetTextInput height={24} value={activePayload.audience} onChange={(e)=>setScopedField(activeCategoryId,"audience",e.currentTarget.value)} /></Field>
        <Field label="Concepts"><WidgetStepper height={24} value={activePayload.conceptCount} min={1} max={12} label="Concept count" onChange={(value)=>setScopedField(activeCategoryId,"conceptCount",value)} /></Field>
        <Field label="Variation"><DirectorSelect height={24} value={activePayload.variationStrength} label="Variation strength" options={["subtle","balanced","radical"].map(value=>({value,label:value.toUpperCase()}))} onChange={(value)=>setScopedField(activeCategoryId,"variationStrength",value)} /></Field>
      </div>
    }
    if (activeCategoryId === "visual-style") {
      return <div className="vtdw-field-grid">
        <Field label="Medium"><DirectorSelect height={24} value={activePayload.medium} label="Visual medium" options={["auto","cinematic","documentary","commercial","animation","illustration","archival","experimental"].map(value=>({value,label:value.toUpperCase()}))} onChange={(value)=>setScopedField(activeCategoryId,"medium",value)} /></Field>
        <Field label="Period / Era"><WidgetTextInput height={24} value={activePayload.period} onChange={(e)=>setScopedField(activeCategoryId,"period",e.currentTarget.value)} /></Field>
        <Field label="Realism %"><WidgetTextInput height={24} type="number" min={0} max={100} value={Math.round(activePayload.realism*100)} onChange={(e)=>setScopedField(activeCategoryId,"realism",finite(e.currentTarget.value,activePayload.realism*100)/100)} /></Field>
        <Field label="Stylization %"><WidgetTextInput height={24} type="number" min={0} max={100} value={Math.round(activePayload.stylization*100)} onChange={(e)=>setScopedField(activeCategoryId,"stylization",finite(e.currentTarget.value,activePayload.stylization*100)/100)} /></Field>
      </div>
    }
    if (activeCategoryId === "camera-movement") {
      return <div className="vtdw-field-grid">
        <Field label="Movement"><DirectorSelect height={24} value={activePayload.type} label="Camera movement" options={["auto","static","pan","tilt","dolly","truck","pedestal","orbit","crane","drone","handheld","steadicam","pov"].map(value=>({value,label:value.toUpperCase()}))} onChange={(value)=>setScopedField(activeCategoryId,"type",value)} /></Field>
        <Field label="Speed %"><WidgetTextInput height={24} type="number" min={0} max={100} value={Math.round(activePayload.speed*100)} onChange={(e)=>setScopedField(activeCategoryId,"speed",finite(e.currentTarget.value,activePayload.speed*100)/100)} /></Field>
        <Field label="Pan °"><WidgetTextInput height={24} type="number" min={-360} max={360} value={activePayload.panDegrees} onChange={(e)=>setScopedField(activeCategoryId,"panDegrees",finite(e.currentTarget.value,activePayload.panDegrees))} /></Field>
        <Field label="Orbit °"><WidgetTextInput height={24} type="number" min={-360} max={360} value={activePayload.orbitDegrees} onChange={(e)=>setScopedField(activeCategoryId,"orbitDegrees",finite(e.currentTarget.value,activePayload.orbitDegrees))} /></Field>
      </div>
    }
    if (activeCategoryId === "focus-depth") {
      return <div className="vtdw-field-grid">
        <Field label="Focus Mode"><DirectorSelect height={24} value={activePayload.mode} label="Focus mode" options={["auto","deep","shallow","subject-lock","rack-focus","custom"].map(value=>({value,label:value.toUpperCase()}))} onChange={(value)=>setScopedField(activeCategoryId,"mode",value)} /></Field>
        <Field label="Focus Distance"><WidgetTextInput height={24} type="number" min={0.05} step={0.1} value={activePayload.focusDistanceMeters} onChange={(e)=>setScopedField(activeCategoryId,"focusDistanceMeters",finite(e.currentTarget.value,activePayload.focusDistanceMeters))} /></Field>
        <Field label="Depth %"><WidgetTextInput height={24} type="number" min={0} max={100} value={Math.round(activePayload.depthStrength*100)} onChange={(e)=>setScopedField(activeCategoryId,"depthStrength",finite(e.currentTarget.value,activePayload.depthStrength*100)/100)} /></Field>
        <Field label="Bokeh %"><WidgetTextInput height={24} type="number" min={0} max={100} value={Math.round(activePayload.bokeh*100)} onChange={(e)=>setScopedField(activeCategoryId,"bokeh",finite(e.currentTarget.value,activePayload.bokeh*100)/100)} /></Field>
      </div>
    }
    if (activeCategoryId === "perspective-capture") {
      return <div className="vtdw-field-grid">
        <Field label="Capture Rig"><DirectorSelect height={24} value={activePayload.rig} label="Capture rig" options={["auto","tripod","shoulder","phone-pov","security-camera","drone","bodycam","dashcam","webcam","action-camera","helmet-cam"].map(value=>({value,label:value.toUpperCase()}))} onChange={(value)=>setScopedField(activeCategoryId,"rig",value)} /></Field>
        <Field label="Camera Height"><WidgetTextInput height={24} type="number" min={0} step={0.1} value={activePayload.cameraHeightMeters} onChange={(e)=>setScopedField(activeCategoryId,"cameraHeightMeters",finite(e.currentTarget.value,activePayload.cameraHeightMeters))} /></Field>
        <Field label="FOV °"><WidgetTextInput height={24} type="number" min={1} max={179} value={activePayload.fieldOfViewDegrees} onChange={(e)=>setScopedField(activeCategoryId,"fieldOfViewDegrees",finite(e.currentTarget.value,activePayload.fieldOfViewDegrees))} /></Field>
        <Field label="First Person"><WidgetToggleSwitch height={24} checked={activePayload.firstPerson} onChange={(checked)=>setScopedField(activeCategoryId,"firstPerson",checked)} label="First person" /></Field>
      </div>
    }
    if (activeCategoryId === "color-palette") {
      return <div className="vtdw-field-grid">
        <Field label="Dominance %"><WidgetTextInput height={24} type="number" min={0} max={100} value={Math.round(activePayload.dominance*100)} onChange={(e)=>setScopedField(activeCategoryId,"dominance",finite(e.currentTarget.value,activePayload.dominance*100)/100)} /></Field>
        <Field label="Exact Lock"><WidgetToggleSwitch height={24} checked={activePayload.exactLock} onChange={(checked)=>setScopedField(activeCategoryId,"exactLock",checked)} label="Exact palette lock" /></Field>
      </div>
    }
    if (activeCategoryId === "grade-exposure") {
      return <div className="vtdw-field-grid">
        <Field label="Exposure EV"><WidgetTextInput height={24} type="number" min={-5} max={5} step={0.1} value={activePayload.exposureEv} onChange={(e)=>setScopedField(activeCategoryId,"exposureEv",finite(e.currentTarget.value,activePayload.exposureEv))} /></Field>
        <Field label="Contrast"><WidgetTextInput height={24} type="number" min={-100} max={100} value={activePayload.contrast} onChange={(e)=>setScopedField(activeCategoryId,"contrast",finite(e.currentTarget.value,activePayload.contrast))} /></Field>
        <Field label="Temperature"><WidgetTextInput height={24} type="number" min={1000} max={20000} value={activePayload.temperatureK} onChange={(e)=>setScopedField(activeCategoryId,"temperatureK",finite(e.currentTarget.value,activePayload.temperatureK))} /></Field>
        <Field label="Saturation %"><WidgetTextInput height={24} type="number" min={0} max={200} value={activePayload.saturation} onChange={(e)=>setScopedField(activeCategoryId,"saturation",finite(e.currentTarget.value,activePayload.saturation))} /></Field>
      </div>
    }
    if (activeCategoryId === "texture-film") {
      return <div className="vtdw-field-grid">
        {["grain","halation","bloom","vignette"].map(field=><Field key={field} label={field}><WidgetTextInput height={24} type="number" min={0} max={100} value={activePayload[field]} onChange={(e)=>setScopedField(activeCategoryId,field,finite(e.currentTarget.value,activePayload[field]))} /></Field>)}
      </div>
    }
    if (activeCategoryId === "shot-structure") {
      return <div className="vtdw-field-grid">
        <Field label="Structure"><DirectorSelect height={24} value={activePayload.mode} label="Shot structure" options={["single-take","auto-multi-shot","manual-storyboard","montage","interview-broll","narrative-sequence","trailer","product-demo","explainer"].map(value=>({value,label:value.toUpperCase()}))} onChange={(value)=>setScopedField(activeCategoryId,"mode",value)} /></Field>
        <Field label="Shot Count"><WidgetStepper height={24} value={activePayload.shotCount} min={1} max={100} label="Shot count" onChange={(value)=>setScopedField(activeCategoryId,"shotCount",value)} /></Field>
        <Field label="Average Shot"><WidgetTextInput height={24} type="number" min={0.25} step={0.25} value={activePayload.averageShotSeconds} onChange={(e)=>setScopedField(activeCategoryId,"averageShotSeconds",finite(e.currentTarget.value,activePayload.averageShotSeconds))} /></Field>
        <Field label="Continuity %"><WidgetTextInput height={24} type="number" min={0} max={100} value={Math.round(activePayload.continuityStrength*100)} onChange={(e)=>setScopedField(activeCategoryId,"continuityStrength",finite(e.currentTarget.value,activePayload.continuityStrength*100)/100)} /></Field>
      </div>
    }
    if (activeCategoryId === "transitions") {
      return <div className="vtdw-field-grid">
        <Field label="Transition"><DirectorSelect height={24} value={activePayload.defaultType} label="Transition type" options={["cut","crossfade","match-cut","dip","wipe","optical-bridge","custom"].map(value=>({value,label:value.toUpperCase()}))} onChange={(value)=>setScopedField(activeCategoryId,"defaultType",value)} /></Field>
        <Field label="Frames"><WidgetStepper height={24} value={activePayload.durationFrames} min={0} max={240} label="Transition frames" onChange={(value)=>setScopedField(activeCategoryId,"durationFrames",value)} /></Field>
        <Field label="Match Motion"><WidgetToggleSwitch height={24} checked={activePayload.matchMotion} onChange={(checked)=>setScopedField(activeCategoryId,"matchMotion",checked)} label="Match motion" /></Field>
      </div>
    }
    if (activeCategoryId === "speed-motion") {
      return <div className="vtdw-field-grid">
        <Field label="Playback Rate"><WidgetTextInput height={24} type="number" min={0.05} max={20} step={0.05} value={activePayload.playbackRate} onChange={(e)=>setScopedField(activeCategoryId,"playbackRate",finite(e.currentTarget.value,activePayload.playbackRate))} /></Field>
        <Field label="Interpolation"><DirectorSelect height={24} value={activePayload.interpolation} label="Interpolation" options={["none","optical-flow","rife","film"].map(value=>({value,label:value.toUpperCase()}))} onChange={(value)=>setScopedField(activeCategoryId,"interpolation",value)} /></Field>
        <Field label="Motion Blur %"><WidgetTextInput height={24} type="number" min={0} max={100} value={Math.round(activePayload.motionBlur*100)} onChange={(e)=>setScopedField(activeCategoryId,"motionBlur",finite(e.currentTarget.value,activePayload.motionBlur*100)/100)} /></Field>
      </div>
    }
    if (activeCategoryId === "voice-dialogue") {
      return <div className="vtdw-field-grid">
        <Field label="Voice"><WidgetToggleSwitch height={24} checked={activePayload.enabled} onChange={(checked)=>setScopedField(activeCategoryId,"enabled",checked)} label="Enable voice" /></Field>
        <Field label="Source"><DirectorSelect height={24} value={activePayload.source} label="Voice source" options={["auto","generated","upload","recorded"].map(value=>({value,label:value.toUpperCase()}))} onChange={(value)=>setScopedField(activeCategoryId,"source",value)} /></Field>
        <Field label="Speaking Rate"><WidgetTextInput height={24} type="number" min={0.5} max={2} step={0.05} value={activePayload.speakingRate} onChange={(e)=>setScopedField(activeCategoryId,"speakingRate",finite(e.currentTarget.value,activePayload.speakingRate))} /></Field>
        <Field label="Expressiveness %"><WidgetTextInput height={24} type="number" min={0} max={100} value={Math.round(activePayload.expressiveness*100)} onChange={(e)=>setScopedField(activeCategoryId,"expressiveness",finite(e.currentTarget.value,activePayload.expressiveness*100)/100)} /></Field>
      </div>
    }
    if (activeCategoryId === "music") {
      return <div className="vtdw-field-grid">
        <Field label="Music"><WidgetToggleSwitch height={24} checked={activePayload.enabled} onChange={(checked)=>setScopedField(activeCategoryId,"enabled",checked)} label="Enable music" /></Field>
        <Field label="BPM"><WidgetTextInput height={24} type="number" min={20} max={300} value={activePayload.bpm} onChange={(e)=>setScopedField(activeCategoryId,"bpm",finite(e.currentTarget.value,activePayload.bpm))} /></Field>
        <Field label="Beat Sync"><DirectorSelect height={24} value={activePayload.beatSync} label="Beat sync" options={["off","quarter","half","bar","drops","auto"].map(value=>({value,label:value.toUpperCase()}))} onChange={(value)=>setScopedField(activeCategoryId,"beatSync",value)} /></Field>
        <Field label="Intensity %"><WidgetTextInput height={24} type="number" min={0} max={100} value={Math.round(activePayload.intensity*100)} onChange={(e)=>setScopedField(activeCategoryId,"intensity",finite(e.currentTarget.value,activePayload.intensity*100)/100)} /></Field>
      </div>
    }
    if (activeCategoryId === "sound-effects") {
      return <div className="vtdw-field-grid">
        <Field label="SFX"><WidgetToggleSwitch height={24} checked={activePayload.enabled} onChange={(checked)=>setScopedField(activeCategoryId,"enabled",checked)} label="Enable sound effects" /></Field>
        <Field label="Auto Events"><WidgetToggleSwitch height={24} checked={activePayload.autoDetectEvents} onChange={(checked)=>setScopedField(activeCategoryId,"autoDetectEvents",checked)} label="Auto detect events" /></Field>
      </div>
    }
    if (activeCategoryId === "captions") {
      return <div className="vtdw-field-grid">
        <Field label="Captions"><WidgetToggleSwitch height={24} checked={activePayload.enabled} onChange={(checked)=>setScopedField(activeCategoryId,"enabled",checked)} label="Enable captions" /></Field>
        <Field label="Position"><DirectorSelect height={24} value={activePayload.position} label="Caption position" options={["top","upper-third","center","lower-third","bottom"].map(value=>({value,label:value.toUpperCase()}))} onChange={(value)=>setScopedField(activeCategoryId,"position",value)} /></Field>
        <Field label="Animation"><DirectorSelect height={24} value={activePayload.animation} label="Caption animation" options={["none","word-pop","karaoke","fade","slide","custom"].map(value=>({value,label:value.toUpperCase()}))} onChange={(value)=>setScopedField(activeCategoryId,"animation",value)} /></Field>
        <Field label="Burn In"><WidgetToggleSwitch height={24} checked={activePayload.burnIn} onChange={(checked)=>setScopedField(activeCategoryId,"burnIn",checked)} label="Burn captions" /></Field>
      </div>
    }
    if (activeCategoryId === "references-seeds") {
      return <div className="vtdw-field-grid">
        <Field label="Seed"><WidgetTextInput height={24} type="number" min={0} max={2147483647} value={activePayload.seed ?? 0} onChange={(e)=>setScopedField(activeCategoryId,"seed",Math.round(finite(e.currentTarget.value,activePayload.seed ?? 0)))} /></Field>
        <Field label="Lock Seed"><WidgetToggleSwitch height={24} checked={activePayload.lockSeed} onChange={(checked)=>setScopedField(activeCategoryId,"lockSeed",checked)} label="Lock seed" /></Field>
        <Field label="Variation Noise %"><WidgetTextInput height={24} type="number" min={0} max={100} value={Math.round(activePayload.variationNoise*100)} onChange={(e)=>setScopedField(activeCategoryId,"variationNoise",finite(e.currentTarget.value,activePayload.variationNoise*100)/100)} /></Field>
      </div>
    }
    if (activeCategoryId === "consistency-continuity") {
      return <div className="vtdw-field-grid">
        {([["identityStrength","Identity"],["wardrobeStrength","Wardrobe"],["environmentStrength","Environment"],["colorContinuity","Color"]] as const).map(([field,label])=><Field key={field} label={label+" %"}><WidgetTextInput height={24} type="number" min={0} max={100} value={Math.round(activePayload[field]*100)} onChange={(e)=>setScopedField(activeCategoryId,field,finite(e.currentTarget.value,activePayload[field]*100)/100)} /></Field>)}
      </div>
    }
    if (activeCategoryId === "negative-constraints") {
      return <div className="vtdw-field-grid">
        <Field label="Enforcement"><DirectorSelect height={24} value={activePayload.enforcement} label="Constraint enforcement" options={["advisory","standard","strict"].map(value=>({value,label:value.toUpperCase()}))} onChange={(value)=>setScopedField(activeCategoryId,"enforcement",value)} /></Field>
        <Field label="Negative Note"><WidgetTextInput height={24} value={activePayload.freeText} onChange={(e)=>setScopedField(activeCategoryId,"freeText",e.currentTarget.value)} /></Field>
      </div>
    }
    return (
      <div className="vtdw-field-grid">
        <DirectorButton height={24} tone="secondary" onClick={openStudio}>
          OPEN FULL {activeDefinition.shortLabel.toUpperCase()} CONTROLS
        </DirectorButton>
        <WidgetBadge>{activeDefinition.group.toUpperCase()}</WidgetBadge>
      </div>
    )
  }

  const directPage = (
    <>
      <WidgetSection>
        <div className="vtdw-mode-row">
          {MODES.map((mode) => (
            <DirectorButton
              key={mode.id}
              height={24}
              tone={project.mode === mode.id ? "primary" : "default"}
              aria-pressed={project.mode === mode.id}
              onClick={() => commit(VideoDirectorProjectSchema.parse({ ...project, mode: mode.id }))}
            >
              {mode.label}
            </DirectorButton>
          ))}
        </div>
      </WidgetSection>

      <WidgetSection>
        <div className="vtdw-field-grid">
          <Field label="Idea / Brief">
            <WidgetTextInput
              height={24}
              value={project.categories["concept-direction"].payload.brief}
              placeholder="Describe the video…"
              onChange={(event) => setProjectField("concept-direction", "brief", event.currentTarget.value)}
            />
          </Field>
          <Field label="Edit Scope">
            <DirectorSelect
              height={24}
              value={scopeKey}
              label="Video Director edit scope"
              options={scopeOptions.map((option) => ({ value: option.key, label: option.label }))}
              onChange={setScopeKey}
            />
          </Field>
        </div>
        <div className="vtdw-quick-row">
          <DirectorButton className="vtdw-autofill" tone="primary" height={24} disabled={autoFillLoading} onClick={() => void runAutoFill()}>
            <Sparkles size={15} aria-hidden="true" /> {autoFillLoading ? "DIRECTING…" : "AUTO-FILL DIRECTOR"}
          </DirectorButton>
        </div>
      </WidgetSection>

      <WidgetSection className="vtdw-category-switcher">
        <div className="vtdw-category-head">
          <div className="vtdw-category-copy">
            <strong>{STATUS_SYMBOL[activeStatus]} {activeDefinition.label}</strong>
            <small>{activeDefinition.purpose}</small>
          </div>
          <DirectorSelect
            height={24}
            className="vtdw-category-select"
            value={activeCategoryId}
            label="Director category"
            options={categoryOptions}
            onChange={(value) => selectCategory(value as VideoDirectorCategoryId)}
          />
        </div>
      </WidgetSection>

      <WidgetSection>{renderSignature()}</WidgetSection>
      <WidgetSection>{renderPrimaryControls()}</WidgetSection>

      <WidgetSection className="vtdw-category-shortcuts">
        <div className="vtdw-category-strip" aria-label="Director category quick switch">
          {VIDEO_DIRECTOR_CATEGORY_REGISTRY.map((definition) => {
            const state = resolveVideoDirectorScopedCategoryState(project, definition.id, activeScope)
            const status = deriveVideoDirectorCategoryStatus(state)
            return (
              <DirectorButton
                key={definition.id}
                height={24}
                tone={definition.id === activeCategoryId ? "primary" : "default"}
                onClick={() => selectCategory(definition.id)}
                title={definition.label}
              >
                {STATUS_SYMBOL[status]} {definition.shortLabel}
              </DirectorButton>
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
          <DirectorActionButton
            tone="primary"
            height={24}
            onClick={() => {
              const next = commit(buildVideoDirectorStoryboard(project))
              setNotice(`STORYBOARD READY · ${next.shots.length} SHOTS.`)
            }}
          >
            BUILD / SYNC STORYBOARD
          </DirectorActionButton>
          <DirectorButton height={24} tone="secondary" onClick={openStudio}>EDIT SHOTS IN STUDIO</DirectorButton>
        </div>
      </WidgetSection>
      <WidgetSection>
        <div className="vtdw-summary-row">
          {project.shots.map((shot, index) => (
            <DirectorButton key={shot.id} height={24} tone={scopeKey === `shot:${shot.id}` ? "primary" : "default"} onClick={() => { setScopeKey(`shot:${shot.id}`); setPage("direct") }}>
              {String(index + 1).padStart(2, "0")} · {shot.durationSeconds.toFixed(1)}S
            </DirectorButton>
          ))}
        </div>
      </WidgetSection>
    </>
  )

  const variationsPage = (
    <>
      <WidgetSection>
        <div className="vtdw-quick-row">
          <DirectorActionButton
            tone="primary"
            height={24}
            onClick={() => {
              const count = Math.max(2, project.categories["generation-output"].payload.outputs)
              const next = commit(ensureVideoDirectorVariants(project, count))
              setVariantId(next.variants[0]?.id || "")
              setNotice(`${next.variants.length} VARIATION LANES READY.`)
            }}
          >
            BUILD VARIANTS
          </DirectorActionButton>
          {project.variants.map((variant, index) => (
            <DirectorButton key={variant.id} height={24} tone={selectedVariant?.id === variant.id ? "primary" : "default"} onClick={() => setVariantId(variant.id)}>
              {String.fromCharCode(65 + index)}
            </DirectorButton>
          ))}
        </div>
      </WidgetSection>
      {selectedVariant ? (
        <>
          <WidgetSection>
            <div className="vtdw-field-grid">
              <Field label="Variation Strength">
                <DirectorSelect
                  height={24}
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
                  <DirectorButton
                    key={definition.id}
                    height={24}
                    tone={allowed ? "primary" : "default"}
                    disabled={locked}
                    onClick={() => commit(setVideoDirectorVariantCategoryAllowed(project, selectedVariant.id, definition.id, !allowed))}
                    title={locked ? "Project category is locked." : definition.purpose}
                  >
                    {allowed ? "●" : "○"} {definition.shortLabel}
                  </DirectorButton>
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
            <DirectorSelect height={24} value={output.aspectRatio} label="Aspect ratio" options={["21:9","16:9","4:3","1:1","3:4","9:16","custom"].map((value) => ({ value, label: value }))} onChange={(value) => setProjectField("generation-output", "aspectRatio", value)} />
          </Field>
          <Field label="Resolution">
            <DirectorSelect height={24} value={output.resolution} label="Resolution" options={["480p","720p","1080p","2k","4k"].map((value) => ({ value, label: value.toUpperCase() }))} onChange={(value) => setProjectField("generation-output", "resolution", value)} />
          </Field>
          <Field label="Quality">
            <DirectorSelect height={24} value={output.quality} label="Quality" options={["draft","preview","final"].map((value) => ({ value, label: value.toUpperCase() }))} onChange={(value) => setProjectField("generation-output", "quality", value)} />
          </Field>
          <Field label="Outputs">
            <WidgetStepper height={24} value={output.outputs} min={1} max={24} label="Output count" onChange={(value) => setProjectField("generation-output", "outputs", value)} />
          </Field>
        </div>
      </WidgetSection>
      <WidgetSection>
        <div className="vtdw-summary-row">
          <DirectorButton height={24} tone="secondary" onClick={() => {
            const packet = compileSemanticDirectorPacket(project)
            setNotice(`PLAN READY · ${packet.prompt.split("\n").length} DIRECTING LINES · PROVIDER EXECUTION STILL GATED.`)
          }}>PREVIEW PLAN</DirectorButton>
          <DirectorButton height={24} tone="secondary" disabled={jobsLoading} onClick={() => void refreshJobs()}>{jobsLoading ? "REFRESHING…" : "REFRESH JOBS"}</DirectorButton>
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
                <DirectorButton height={24} tone="secondary" onClick={async () => { await cancelVideoDirectorJob(job.id); await refreshJobs() }}>CANCEL</DirectorButton>
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
      headerContent={
        <DirectorButton
          height={24}
          tone="secondary"
          className="widget-header-toggle vtdw-header-studio"
          onClick={openStudio}
          aria-label="Open Video Director in Studio Hub"
          title="Open Video Director in Studio Hub"
        >
          <ExternalLink size={13} aria-hidden="true" /> STUDIO
        </DirectorButton>
      }
    >
      <div className="vt-video-director-widget">
        <WidgetWorkflowMain>
          <WidgetSection surface="white">
            <div className="vtdw-topline">
              <div className="vtdw-page-row" role="tablist" aria-label="Video Director pages">
                {PAGES.map((item) => (
                  <DirectorButton key={item.id} height={24} tone={page === item.id ? "primary" : "default"} aria-pressed={page === item.id} onClick={() => setPage(item.id)}>
                    {item.label}
                  </DirectorButton>
                ))}
              </div>
              <WidgetBadge className="vtdw-project-badge">{project.name || "UNTITLED"}</WidgetBadge>
            </div>
          </WidgetSection>
          <WidgetScrollArea ariaLabel="Video Director workflow" edge="inset" className="vtdw-scroll-area" contentClassName="vtdw-scroll-content">
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
            <DirectorActionButton className="vtdw-generate" tone="primary" height={24} disabled title="Provider quote, credit reservation and production adapter are still gated.">
              GENERATE
            </DirectorActionButton>
          </div>
        </WidgetFooter>
      </div>
    </WidgetShell>
  )
}

export default VideoDirectorWidget
