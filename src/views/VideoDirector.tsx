import React, { useCallback, useEffect, useMemo, useState } from "react"
import {
  Activity,
  Aperture,
  AudioLines,
  Ban,
  Blend,
  BookmarkPlus,
  Captions,
  Camera,
  CheckCircle2,
  CircleGauge,
  Clapperboard,
  Crosshair,
  Eye,
  Film,
  Focus,
  Gauge,
  Grid2X2,
  ImagePlus,
  Images,
  Layers3,
  Lightbulb,
  Lock,
  Mic2,
  MonitorPlay,
  Move3D,
  Music2,
  Palette,
  Play,
  RotateCcw,
  Save,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Timer,
  Type,
  Unlock,
  Upload,
  Volume2,
  WandSparkles,
} from "lucide-react"
import {
  SubToolbox,
  SubToolboxDropdownControl,
  SubToolboxGridActionButton,
  SubToolboxInnerActionButton,
  ToolboxScaffold,
} from "../components/Toolbox"
import {
  SubToolboxActions,
  SubToolboxGrid,
  SubToolboxSection,
  SubToolboxStack,
} from "../components/subtoolbox/SubToolboxLayouts"
import {
  SubToolboxBadge,
  SubToolboxCheckbox,
  SubToolboxFieldLabel,
  SubToolboxFileTarget,
  SubToolboxMetric,
  SubToolboxSurface,
  SubToolboxTag,
  SubToolboxToggle,
} from "../components/subtoolbox/SubToolboxPrimitives"
import {
  StudioButton,
  StudioInput,
  StudioNumberInput,
  StudioSelect,
  StudioSplitLeftButton,
  StudioTextArea,
} from "../studio-ui"
import {
  VIDEO_DIRECTOR_CATEGORY_BY_ID,
  VIDEO_DIRECTOR_CATEGORY_GROUPS,
  VIDEO_DIRECTOR_CATEGORY_REGISTRY,
  VideoDirectorProjectSchema,
  applyVideoDirectorConflicts,
  applyVideoDirectorRecipe,
  applyVideoDirectorSuggestion,
  buildVideoDirectorStoryboard,
  cancelVideoDirectorJob,
  createDefaultVideoDirectorCategories,
  createEmptyVideoDirectorProject,
  createVideoDirectorAutosaveController,
  createVideoDirectorCategoryRecipe,
  createVideoDirectorProjectRecipe,
  compileSemanticDirectorPacket,
  deriveVideoDirectorCategoryStatus,
  duplicateVideoDirectorShot,
  ensureVideoDirectorVariants,
  evaluateVideoDirectorSuggestions,
  listVideoDirectorJobs,
  listVideoDirectorScopeOptions,
  parseVideoDirectorScopeKey,
  readVideoDirectorRecipeLibrary,
  readVideoDirectorState,
  removeVideoDirectorShot,
  reorderVideoDirectorShot,
  resetVideoDirectorScopedCategory,
  resolveVideoDirectorScopedCategoryState,
  saveVideoDirectorDraft,
  saveVideoDirectorRecipe,
  setVideoDirectorScopedCategoryField,
  toggleVideoDirectorScopedCategoryLock,
  type VideoDirectorCategoryGroup,
  type VideoDirectorCategoryId,
  type VideoDirectorCategoryStatus,
  type VideoDirectorMode,
  type VideoDirectorProject,
  type VideoDirectorRecipe,
  type VideoDirectorRemoteJob,
  type VideoDirectorScope,
} from "../features/video-director"

export interface VideoDirectorProps {
  embedded?: boolean
  collapsible?: boolean
  isOpenInitial?: boolean
  paletteIndex?: number
}

const STATUS_SYMBOL: Record<VideoDirectorCategoryStatus, string> = {
  empty: "○",
  mixed: "◐",
  configured: "●",
  recipe: "◆",
  conflict: "!",
}

const STATUS_LABEL: Record<VideoDirectorCategoryStatus, string> = {
  empty: "Empty / Auto",
  mixed: "Mixed",
  configured: "Configured",
  recipe: "Recipe",
  conflict: "Conflict",
}

const GROUP_LABEL: Record<VideoDirectorCategoryGroup, string> = {
  creative: "Creative",
  camera: "Camera",
  image: "Image",
  motion: "Motion",
  audio: "Audio",
  graphics: "Graphics",
  generation: "Generation",
}

const GROUP_ICON: Record<VideoDirectorCategoryGroup, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  creative: WandSparkles,
  camera: Camera,
  image: Palette,
  motion: Activity,
  audio: Volume2,
  graphics: Type,
  generation: Settings2,
}

const MODE_OPTIONS: Array<{ id: VideoDirectorMode; label: string; icon: React.ComponentType<{ size?: number }> }> = [
  { id: "single", label: "Single", icon: Film },
  { id: "variations", label: "Variations", icon: Grid2X2 },
  { id: "sequence", label: "Sequence", icon: Layers3 },
  { id: "campaign", label: "Campaign", icon: MonitorPlay },
]

const safeNumber = (value: string, fallback: number) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const statusForProject = (project: VideoDirectorProject, categoryId: VideoDirectorCategoryId) =>
  deriveVideoDirectorCategoryStatus(project.categories[categoryId])

const categoryOptionLabel = (project: VideoDirectorProject, categoryId: VideoDirectorCategoryId) => {
  const definition = VIDEO_DIRECTOR_CATEGORY_BY_ID[categoryId]
  return `${STATUS_SYMBOL[statusForProject(project, categoryId)]} ${definition.label}`
}

const MutedNote: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[10px] font-black uppercase tracking-[0.08em] opacity-50 leading-snug">{children}</p>
)

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <SubToolboxSection label={<SubToolboxFieldLabel>{label}</SubToolboxFieldLabel>}>{children}</SubToolboxSection>
)

const NumberField: React.FC<{
  label: string
  value: number
  min?: number
  max?: number
  step?: number
  unit?: string
  onChange: (value: number) => void
}> = ({ label, value, min, max, step, unit, onChange }) => (
  <Field label={label}>
    <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
      <StudioNumberInput
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(safeNumber(event.currentTarget.value, value))}
        aria-label={label}
      />
      {unit ? <SubToolboxBadge>{unit}</SubToolboxBadge> : null}
    </div>
  </Field>
)

const TextField: React.FC<{
  label: string
  value: string
  placeholder?: string
  multiline?: boolean
  onChange: (value: string) => void
}> = ({ label, value, placeholder, multiline = false, onChange }) => (
  <Field label={label}>
    {multiline ? (
      <StudioTextArea
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        placeholder={placeholder}
        aria-label={label}
        style={{ minHeight: 100, textTransform: "none", fontWeight: 700 }}
      />
    ) : (
      <StudioInput
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        placeholder={placeholder}
        aria-label={label}
        style={{ textTransform: "none" }}
      />
    )}
  </Field>
)

const SelectField: React.FC<{
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}> = ({ label, value, options, onChange }) => (
  <Field label={label}>
    <StudioSelect value={value} onChange={(event) => onChange(event.currentTarget.value)} aria-label={label}>
      {options.map((option) => <option value={option} key={option}>{option}</option>)}
    </StudioSelect>
  </Field>
)

const CameraPreview: React.FC<{ focalLength: number; aperture: number; movement?: string }> = ({ focalLength, aperture, movement }) => {
  const fieldWidth = Math.max(18, Math.min(86, 90 - Math.log2(Math.max(1, focalLength) / 14) * 16))
  return (
    <SubToolboxSurface tone="subtle" className="relative overflow-hidden min-h-[160px] grid place-items-center">
      <div className="absolute inset-3 border-[3px] border-current rounded-[10px] opacity-25" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[76%] border-[3px] border-current rounded-[10px] opacity-70" style={{ width: `${fieldWidth}%` }} />
      <Crosshair size={46} strokeWidth={2.5} aria-hidden="true" />
      <div className="absolute left-3 right-3 bottom-3 grid grid-cols-3 gap-2 text-[9px] font-black uppercase">
        <span>{focalLength}mm</span><span className="text-center">f/{aperture}</span><span className="text-right">{movement || "Auto"}</span>
      </div>
    </SubToolboxSurface>
  )
}

const MoodPreview: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <SubToolboxSurface tone="subtle" className="relative min-h-[170px] overflow-hidden">
    <div className="absolute left-1/2 top-3 bottom-3 border-l-[2px] border-current opacity-25" />
    <div className="absolute top-1/2 left-3 right-3 border-t-[2px] border-current opacity-25" />
    <span className="absolute left-3 top-3 text-[9px] font-black uppercase opacity-55">Somber</span>
    <span className="absolute right-3 top-3 text-[9px] font-black uppercase opacity-55">Triumphant</span>
    <span className="absolute left-3 bottom-3 text-[9px] font-black uppercase opacity-55">Calm</span>
    <span className="absolute right-3 bottom-3 text-[9px] font-black uppercase opacity-55">Energetic</span>
    <span
      className="absolute w-8 h-8 rounded-full border-[3px] border-current bg-white shadow-[3px_3px_0_current]"
      style={{ left: `calc(${((x + 1) / 2) * 100}% - 16px)`, top: `calc(${((1 - y) / 2) * 100}% - 16px)` }}
    />
  </SubToolboxSurface>
)

const PalettePreview: React.FC<{ colors: string[]; exactLock: boolean }> = ({ colors, exactLock }) => (
  <div className="grid grid-cols-3 sm:grid-cols-6 border-[3px] border-current rounded-[10px] overflow-hidden min-h-[88px]">
    {colors.map((color, index) => (
      <div key={`${color}-${index}`} className="relative min-h-[76px]" style={{ backgroundColor: color }}>
        <span className="absolute bottom-1 left-1 text-[8px] font-black px-1 bg-white/80 rounded">{color.toUpperCase()}</span>
      </div>
    ))}
    {exactLock ? <span className="absolute sr-only">Palette is exactly locked.</span> : null}
  </div>
)

const LightingPreview: React.FC<{ azimuth: number; elevation: number; warmth: number }> = ({ azimuth, elevation, warmth }) => {
  const x = 50 + Math.sin((azimuth * Math.PI) / 180) * 35
  const y = 50 - Math.sin((elevation * Math.PI) / 180) * 35
  return (
    <SubToolboxSurface tone="subtle" className="relative min-h-[170px] grid place-items-center overflow-hidden">
      <div className="w-28 h-28 rounded-full border-[3px] border-current bg-white/60 shadow-inner" />
      <div className="absolute w-8 h-8 rounded-full border-[3px] border-current" style={{ left: `calc(${x}% - 16px)`, top: `calc(${y}% - 16px)`, backgroundColor: warmth < 4500 ? "#FFB15C" : warmth > 7000 ? "#A9D8FF" : "#FFF0B4" }} />
      <Lightbulb size={30} strokeWidth={2.5} aria-hidden="true" />
    </SubToolboxSurface>
  )
}

const CompositionPreview: React.FC<{ x: number; y: number; horizon: number; safeZones: boolean }> = ({ x, y, horizon, safeZones }) => (
  <SubToolboxSurface tone="subtle" className="relative aspect-video overflow-hidden">
    <div className="absolute inset-y-0 left-1/3 border-l-[2px] border-current opacity-25" />
    <div className="absolute inset-y-0 left-2/3 border-l-[2px] border-current opacity-25" />
    <div className="absolute inset-x-0 top-1/3 border-t-[2px] border-current opacity-25" />
    <div className="absolute inset-x-0 top-2/3 border-t-[2px] border-current opacity-25" />
    <div className="absolute left-0 right-0 border-t-[3px] border-current opacity-55" style={{ top: `${horizon * 100}%` }} />
    {safeZones ? <div className="absolute inset-[8%] border-[2px] border-dashed border-current opacity-40 rounded-[8px]" /> : null}
    <div className="absolute w-11 h-11 rounded-full border-[3px] border-current bg-white/80" style={{ left: `calc(${x * 100}% - 22px)`, top: `calc(${y * 100}% - 22px)` }} />
  </SubToolboxSurface>
)

const PacingPreview: React.FC<{ duration: number; hook: number; hold: number }> = ({ duration, hook, hold }) => {
  const safeDuration = Math.max(1, duration)
  const hookPct = Math.min(100, (hook / safeDuration) * 100)
  const holdPct = Math.min(100, (hold / safeDuration) * 100)
  return (
    <SubToolboxSurface tone="subtle" className="p-3">
      <div className="h-12 border-[3px] border-current rounded-[8px] overflow-hidden flex">
        <div className="h-full opacity-80" style={{ width: `${hookPct}%`, background: "var(--vt-subtoolbox-fill, #FA618A)" }} />
        <div className="h-full flex-1 bg-white" />
        <div className="h-full opacity-60" style={{ width: `${holdPct}%`, background: "var(--vt-subtoolbox-fill, #FA618A)" }} />
      </div>
      <div className="mt-2 flex justify-between text-[9px] font-black uppercase opacity-60"><span>Hook {hook}s</span><span>{duration}s total</span><span>Hold {hold}s</span></div>
    </SubToolboxSurface>
  )
}

const AudioMatrixPreview: React.FC = () => (
  <SubToolboxSurface tone="subtle" className="relative aspect-[2/1] overflow-hidden">
    <div className="absolute inset-0 grid grid-cols-5 grid-rows-3 opacity-20">
      {Array.from({ length: 15 }).map((_, index) => <span key={index} className="border-r border-b border-current" />)}
    </div>
    <div className="absolute left-[18%] top-[42%] w-7 h-7 rounded-full border-[3px] border-current bg-white grid place-items-center text-[8px] font-black">SFX</div>
    <div className="absolute left-[49%] top-[48%] w-9 h-9 rounded-full border-[3px] border-current bg-white grid place-items-center text-[8px] font-black">VO</div>
    <div className="absolute right-[14%] top-[30%] w-8 h-8 rounded-full border-[3px] border-current bg-white grid place-items-center text-[8px] font-black">AMB</div>
  </SubToolboxSurface>
)

const OutputPreview: React.FC<{ ratio: string; quality: string; outputs: number }> = ({ ratio, quality, outputs }) => {
  const aspect = ratio === "9:16" ? "9 / 16" : ratio === "1:1" ? "1 / 1" : ratio === "21:9" ? "21 / 9" : "16 / 9"
  return (
    <SubToolboxSurface tone="subtle" className="min-h-[190px] grid place-items-center p-4">
      <div className="max-h-[150px] max-w-full border-[4px] border-current rounded-[10px] bg-white grid place-items-center" style={{ aspectRatio: aspect, width: ratio === "9:16" ? "84px" : "78%" }}>
        <div className="text-center"><MonitorPlay size={28} className="mx-auto" /><strong className="block text-[12px] font-black uppercase mt-1">{ratio}</strong><small className="text-[9px] font-black uppercase opacity-55">{quality} · {outputs} output{outputs === 1 ? "" : "s"}</small></div>
      </div>
    </SubToolboxSurface>
  )
}

const VideoDirector: React.FC<VideoDirectorProps> = ({
  embedded = false,
  collapsible = true,
  isOpenInitial = false,
  paletteIndex = 11,
}) => {
  const [open, setOpen] = useState(isOpenInitial)
  const [project, setProject] = useState<VideoDirectorProject>(() =>
    readVideoDirectorState() ?? createEmptyVideoDirectorProject(),
  )
  const [notice, setNotice] = useState("")
  const [recipeName, setRecipeName] = useState("")
  const [inspectorView, setInspectorView] = useState<"prompt" | "json">("prompt")
  const [scopeKey, setScopeKey] = useState("project")
  const [recipes, setRecipes] = useState<VideoDirectorRecipe[]>(() => readVideoDirectorRecipeLibrary())
  const [jobs, setJobs] = useState<VideoDirectorRemoteJob[]>([])
  const [jobsLoading, setJobsLoading] = useState(false)
  const [jobsUnavailable, setJobsUnavailable] = useState(false)
  const autosave = useMemo(() => createVideoDirectorAutosaveController(350), [])

  useEffect(() => {
    autosave.schedule(project)
  }, [autosave, project])

  useEffect(() => () => autosave.flush(), [autosave])

  const refreshJobs = useCallback(async () => {
    setJobsLoading(true)
    try {
      const remote = await listVideoDirectorJobs({ projectId: project.id, limit: 24 })
      setJobs(remote)
      setJobsUnavailable(false)
    } catch (error: any) {
      if (error?.status === 401) {
        setJobs([])
        setJobsUnavailable(true)
      } else {
        setNotice(error instanceof Error ? error.message : "Could not load Video Director jobs.")
      }
    } finally {
      setJobsLoading(false)
    }
  }, [project.id])

  useEffect(() => {
    if (!open) return
    void refreshJobs()
  }, [open, refreshJobs])

  useEffect(() => {
    if (!open || !jobs.some((job) => job.status === "queued" || job.status === "running" || job.status === "post-processing")) return
    const timer = window.setInterval(() => { void refreshJobs() }, 4_000)
    return () => window.clearInterval(timer)
  }, [jobs, open, refreshJobs])

  const mutateProject = useCallback((mutator: (draft: VideoDirectorProject) => void) => {
    setProject((current) => {
      const draft = structuredClone(current)
      mutator(draft)
      draft.updatedAt = new Date().toISOString()
      return applyVideoDirectorConflicts(VideoDirectorProjectSchema.parse(draft))
    })
  }, [])

  const setCategoryField = useCallback((
    categoryId: VideoDirectorCategoryId,
    field: string,
    value: unknown,
  ) => {
    mutateProject((draft) => {
      const state = draft.categories[categoryId] as any
      state.payload[field] = value
      state.fieldSources[field] = "user"
    })
  }, [mutateProject])

  const resetCategory = useCallback((categoryId: VideoDirectorCategoryId) => {
    mutateProject((draft) => {
      const defaults = createDefaultVideoDirectorCategories()
      ;(draft.categories as any)[categoryId] = structuredClone(defaults[categoryId])
    })
    setNotice(`${VIDEO_DIRECTOR_CATEGORY_BY_ID[categoryId].label} reset to Auto.`)
  }, [mutateProject])

  const toggleCategoryLock = useCallback((categoryId: VideoDirectorCategoryId) => {
    mutateProject((draft) => {
      draft.categories[categoryId].locked = !draft.categories[categoryId].locked
    })
  }, [mutateProject])

  const compiledPacket = useMemo(() => compileSemanticDirectorPacket(project), [project])

  const activeCategoryId = project.activeCategoryId
  const activeDefinition = VIDEO_DIRECTOR_CATEGORY_BY_ID[activeCategoryId]
  const activeState = project.categories[activeCategoryId]
  const activeStatus = statusForProject(project, activeCategoryId)
  const activePayload = activeState.payload as any

  const categoryOptions = useMemo(
    () => VIDEO_DIRECTOR_CATEGORY_REGISTRY.map((definition) => categoryOptionLabel(project, definition.id)),
    [project],
  )

  const onCategoryOptionChange = (option: string) => {
    const definition = VIDEO_DIRECTOR_CATEGORY_REGISTRY.find(
      (candidate) => option === categoryOptionLabel(project, candidate.id),
    )
    if (!definition) return
    mutateProject((draft) => { draft.activeCategoryId = definition.id })
  }

  const configuredCount = VIDEO_DIRECTOR_CATEGORY_REGISTRY.filter((definition) => {
    const status = statusForProject(project, definition.id)
    return status === "configured" || status === "mixed" || status === "recipe"
  }).length
  const conflictCount = VIDEO_DIRECTOR_CATEGORY_REGISTRY.filter(
    (definition) => statusForProject(project, definition.id) === "conflict",
  ).length
  const suggestions = useMemo(() => evaluateVideoDirectorSuggestions(project), [project])
  const lockedCount = VIDEO_DIRECTOR_CATEGORY_REGISTRY.filter(
    (definition) => project.categories[definition.id].locked,
  ).length

  const renderCategoryEditor = () => {
    switch (activeCategoryId) {
      case "concept-direction":
        return <SubToolboxStack>
          <TextField label="Creative Brief" value={activePayload.brief} multiline placeholder="What should ViewTube direct?" onChange={(value) => setCategoryField(activeCategoryId, "brief", value)} />
          <SubToolboxGrid minItemWidth="wide">
            <TextField label="Objective" value={activePayload.objective} placeholder="Educate, tease, sell, explain…" onChange={(value) => setCategoryField(activeCategoryId, "objective", value)} />
            <TextField label="Audience" value={activePayload.audience} placeholder="Who is this for?" onChange={(value) => setCategoryField(activeCategoryId, "audience", value)} />
            <TextField label="Call to Action" value={activePayload.callToAction} placeholder="What should viewers do?" onChange={(value) => setCategoryField(activeCategoryId, "callToAction", value)} />
          </SubToolboxGrid>
          <SelectField label="Target Platform" value={activePayload.targetPlatform} options={["youtube", "youtube-shorts", "multi-platform", "custom"]} onChange={(value) => setCategoryField(activeCategoryId, "targetPlatform", value)} />
          <SelectField label="Variation Strength" value={activePayload.variationStrength} options={["subtle", "balanced", "radical"]} onChange={(value) => setCategoryField(activeCategoryId, "variationStrength", value)} />
        </SubToolboxStack>

      case "visual-style":
        return <SubToolboxStack>
          <SelectField label="Medium" value={activePayload.medium} options={["auto", "cinematic", "documentary", "commercial", "animation", "illustration", "archival", "experimental"]} onChange={(value) => setCategoryField(activeCategoryId, "medium", value)} />
          <NumberField label="Realism" value={activePayload.realism * 100} min={0} max={100} unit="%" onChange={(value) => setCategoryField(activeCategoryId, "realism", value / 100)} />
          <NumberField label="Stylization" value={activePayload.stylization * 100} min={0} max={100} unit="%" onChange={(value) => setCategoryField(activeCategoryId, "stylization", value / 100)} />
          <TextField label="Period / Era" value={activePayload.period} placeholder="1805, 1970s, near future…" onChange={(value) => setCategoryField(activeCategoryId, "period", value)} />
          <MutedNote>Recipes will stack on top of these parameters without destroying user overrides.</MutedNote>
        </SubToolboxStack>

      case "emotion-tone":
        return <SubToolboxStack>
          <MoodPreview x={activePayload.triumphantVsSomber} y={activePayload.energeticVsCalm} />
          <SubToolboxGrid>
            <NumberField label="Somber ↔ Triumphant" value={activePayload.triumphantVsSomber} min={-1} max={1} step={0.1} onChange={(value) => setCategoryField(activeCategoryId, "triumphantVsSomber", value)} />
            <NumberField label="Calm ↔ Energetic" value={activePayload.energeticVsCalm} min={-1} max={1} step={0.1} onChange={(value) => setCategoryField(activeCategoryId, "energeticVsCalm", value)} />
            <NumberField label="Tension" value={activePayload.tension * 100} min={0} max={100} unit="%" onChange={(value) => setCategoryField(activeCategoryId, "tension", value / 100)} />
            <NumberField label="Intensity" value={activePayload.intensity * 100} min={0} max={100} unit="%" onChange={(value) => setCategoryField(activeCategoryId, "intensity", value / 100)} />
          </SubToolboxGrid>
        </SubToolboxStack>

      case "composition":
        return <SubToolboxStack>
          <CompositionPreview x={activePayload.subjectX} y={activePayload.subjectY} horizon={activePayload.horizonY} safeZones={activePayload.safeZones} />
          <SubToolboxGrid>
            <SelectField label="Shot Scale" value={activePayload.shotScale} options={["auto", "extreme-wide", "wide", "full", "medium", "medium-close", "close", "extreme-close"]} onChange={(value) => setCategoryField(activeCategoryId, "shotScale", value)} />
            <SelectField label="Framing" value={activePayload.framing} options={["auto", "thirds", "centered", "symmetrical", "negative-space", "leading-lines", "custom"]} onChange={(value) => setCategoryField(activeCategoryId, "framing", value)} />
            <NumberField label="Subject X" value={Math.round(activePayload.subjectX * 100)} min={0} max={100} unit="%" onChange={(value) => setCategoryField(activeCategoryId, "subjectX", value / 100)} />
            <NumberField label="Subject Y" value={Math.round(activePayload.subjectY * 100)} min={0} max={100} unit="%" onChange={(value) => setCategoryField(activeCategoryId, "subjectY", value / 100)} />
            <NumberField label="Horizon" value={Math.round(activePayload.horizonY * 100)} min={0} max={100} unit="%" onChange={(value) => setCategoryField(activeCategoryId, "horizonY", value / 100)} />
          </SubToolboxGrid>
          <SubToolboxToggle pressed={activePayload.safeZones} label="Show / enforce safe zones" onClick={() => setCategoryField(activeCategoryId, "safeZones", !activePayload.safeZones)} />
        </SubToolboxStack>

      case "camera-lens":
        return <SubToolboxStack>
          <CameraPreview focalLength={activePayload.focalLengthMm} aperture={activePayload.aperture} />
          <SubToolboxGrid>
            <SelectField label="Capture Family" value={activePayload.captureFamily} options={["auto", "cinema", "full-frame", "super35", "medium-format", "phone", "action-camera", "vintage-video"]} onChange={(value) => setCategoryField(activeCategoryId, "captureFamily", value)} />
            <NumberField label="Focal Length" value={activePayload.focalLengthMm} min={1} max={1200} unit="mm" onChange={(value) => setCategoryField(activeCategoryId, "focalLengthMm", value)} />
            <NumberField label="Aperture" value={activePayload.aperture} min={0.7} max={64} step={0.1} unit="f/" onChange={(value) => setCategoryField(activeCategoryId, "aperture", value)} />
            <NumberField label="Anamorphic Squeeze" value={activePayload.anamorphicSqueeze} min={1} max={2.5} step={0.05} unit="×" onChange={(value) => setCategoryField(activeCategoryId, "anamorphicSqueeze", value)} />
            <NumberField label="Fisheye" value={Math.round(activePayload.fisheye * 100)} min={0} max={100} unit="%" onChange={(value) => setCategoryField(activeCategoryId, "fisheye", value / 100)} />
            <NumberField label="Lens Distortion" value={activePayload.distortion} min={-1} max={1} step={0.1} onChange={(value) => setCategoryField(activeCategoryId, "distortion", value)} />
          </SubToolboxGrid>
        </SubToolboxStack>

      case "camera-movement":
        return <SubToolboxStack>
          <CameraPreview focalLength={project.categories["camera-lens"].payload.focalLengthMm} aperture={project.categories["camera-lens"].payload.aperture} movement={activePayload.type} />
          <SelectField label="Movement" value={activePayload.type} options={["auto", "static", "pan", "tilt", "dolly", "truck", "pedestal", "orbit", "crane", "drone", "handheld", "steadicam", "pov"]} onChange={(value) => setCategoryField(activeCategoryId, "type", value)} />
          <SubToolboxGrid>
            <NumberField label="Speed" value={Math.round(activePayload.speed * 100)} min={0} max={100} unit="%" onChange={(value) => setCategoryField(activeCategoryId, "speed", value / 100)} />
            <NumberField label="Distance" value={activePayload.distanceMeters} min={0} max={10000} step={0.1} unit="m" onChange={(value) => setCategoryField(activeCategoryId, "distanceMeters", value)} />
            <NumberField label="Pan" value={activePayload.panDegrees} min={-360} max={360} unit="°" onChange={(value) => setCategoryField(activeCategoryId, "panDegrees", value)} />
            <NumberField label="Tilt" value={activePayload.tiltDegrees} min={-180} max={180} unit="°" onChange={(value) => setCategoryField(activeCategoryId, "tiltDegrees", value)} />
            <NumberField label="Orbit" value={activePayload.orbitDegrees} min={-360} max={360} unit="°" onChange={(value) => setCategoryField(activeCategoryId, "orbitDegrees", value)} />
            <NumberField label="Shake" value={Math.round(activePayload.shake * 100)} min={0} max={100} unit="%" onChange={(value) => setCategoryField(activeCategoryId, "shake", value / 100)} />
          </SubToolboxGrid>
        </SubToolboxStack>

      case "focus-depth":
        return <SubToolboxStack>
          <SelectField label="Focus Mode" value={activePayload.mode} options={["auto", "deep", "shallow", "subject-lock", "rack-focus", "custom"]} onChange={(value) => setCategoryField(activeCategoryId, "mode", value)} />
          <SubToolboxGrid>
            <NumberField label="Focus Distance" value={activePayload.focusDistanceMeters} min={0.05} max={100000} step={0.1} unit="m" onChange={(value) => setCategoryField(activeCategoryId, "focusDistanceMeters", value)} />
            {activePayload.mode === "rack-focus" ? <NumberField label="Rack Focus End" value={activePayload.rackFocusEndMeters ?? 8} min={0.05} max={100000} step={0.1} unit="m" onChange={(value) => setCategoryField(activeCategoryId, "rackFocusEndMeters", value)} /> : null}
            <NumberField label="Depth Strength" value={Math.round(activePayload.depthStrength * 100)} min={0} max={100} unit="%" onChange={(value) => setCategoryField(activeCategoryId, "depthStrength", value / 100)} />
            <NumberField label="Bokeh" value={Math.round(activePayload.bokeh * 100)} min={0} max={100} unit="%" onChange={(value) => setCategoryField(activeCategoryId, "bokeh", value / 100)} />
          </SubToolboxGrid>
        </SubToolboxStack>

      case "perspective-capture":
        return <SubToolboxStack>
          <SelectField label="Capture Rig" value={activePayload.rig} options={["auto", "tripod", "shoulder", "phone-pov", "security-camera", "drone", "bodycam", "dashcam", "webcam", "action-camera", "helmet-cam"]} onChange={(value) => setCategoryField(activeCategoryId, "rig", value)} />
          <SubToolboxGrid>
            <NumberField label="Camera Height" value={activePayload.cameraHeightMeters} min={0} max={10000} step={0.1} unit="m" onChange={(value) => setCategoryField(activeCategoryId, "cameraHeightMeters", value)} />
            <NumberField label="Pitch" value={activePayload.pitchDegrees} min={-90} max={90} unit="°" onChange={(value) => setCategoryField(activeCategoryId, "pitchDegrees", value)} />
            <NumberField label="Yaw" value={activePayload.yawDegrees} min={-180} max={180} unit="°" onChange={(value) => setCategoryField(activeCategoryId, "yawDegrees", value)} />
            <NumberField label="Roll" value={activePayload.rollDegrees} min={-180} max={180} unit="°" onChange={(value) => setCategoryField(activeCategoryId, "rollDegrees", value)} />
            <NumberField label="Field of View" value={activePayload.fieldOfViewDegrees} min={1} max={179} unit="°" onChange={(value) => setCategoryField(activeCategoryId, "fieldOfViewDegrees", value)} />
          </SubToolboxGrid>
          <SubToolboxToggle pressed={activePayload.firstPerson} label="First-person viewpoint" onClick={() => setCategoryField(activeCategoryId, "firstPerson", !activePayload.firstPerson)} />
        </SubToolboxStack>

      case "color-palette":
        return <SubToolboxStack>
          <PalettePreview colors={activePayload.colors} exactLock={activePayload.exactLock} />
          <SubToolboxGrid minItemWidth="compact">
            {activePayload.colors.map((color: string, index: number) => <StudioInput key={index} type="color" value={color} aria-label={`Palette color ${index + 1}`} onChange={(event) => {
              const next = [...activePayload.colors]
              next[index] = event.currentTarget.value.toUpperCase()
              setCategoryField(activeCategoryId, "colors", next)
            }} />)}
          </SubToolboxGrid>
          <SubToolboxToggle pressed={activePayload.exactLock} label="Exact palette lock" onClick={() => setCategoryField(activeCategoryId, "exactLock", !activePayload.exactLock)} />
          <SubToolboxActions columns={2}>
            <SubToolboxInnerActionButton label="Extract From Asset" iconName="image" tone="cyan" disabled />
            <SubToolboxInnerActionButton label="Use Channel Palette" iconName="paint-bucket" tone="purple" disabled />
          </SubToolboxActions>
        </SubToolboxStack>

      case "grade-exposure":
        return <SubToolboxStack><SubToolboxGrid>
          <NumberField label="Exposure" value={activePayload.exposureEv} min={-5} max={5} step={0.1} unit="EV" onChange={(value) => setCategoryField(activeCategoryId, "exposureEv", value)} />
          <NumberField label="Contrast" value={activePayload.contrast} min={-100} max={100} onChange={(value) => setCategoryField(activeCategoryId, "contrast", value)} />
          <NumberField label="Highlights" value={activePayload.highlights} min={-100} max={100} onChange={(value) => setCategoryField(activeCategoryId, "highlights", value)} />
          <NumberField label="Shadows" value={activePayload.shadows} min={-100} max={100} onChange={(value) => setCategoryField(activeCategoryId, "shadows", value)} />
          <NumberField label="Temperature" value={activePayload.temperatureK} min={1000} max={20000} unit="K" onChange={(value) => setCategoryField(activeCategoryId, "temperatureK", value)} />
          <NumberField label="Saturation" value={activePayload.saturation} min={0} max={200} unit="%" onChange={(value) => setCategoryField(activeCategoryId, "saturation", value)} />
          <NumberField label="Vibrance" value={activePayload.vibrance} min={-100} max={100} onChange={(value) => setCategoryField(activeCategoryId, "vibrance", value)} />
          <NumberField label="Gamma" value={activePayload.gamma} min={0.1} max={5} step={0.1} onChange={(value) => setCategoryField(activeCategoryId, "gamma", value)} />
        </SubToolboxGrid></SubToolboxStack>

      case "texture-film":
        return <SubToolboxStack><SubToolboxGrid>
          {["grain", "halation", "bloom", "vignette", "scratches", "dust", "gateWeave", "chromaticAberration"].map((field) => <NumberField key={field} label={field.replace(/([A-Z])/g, " $1")} value={activePayload[field]} min={0} max={100} unit="%" onChange={(value) => setCategoryField(activeCategoryId, field, value)} />)}
          <NumberField label="Sharpness" value={activePayload.sharpness} min={-100} max={100} onChange={(value) => setCategoryField(activeCategoryId, "sharpness", value)} />
        </SubToolboxGrid><TextField label="Film Stock / Texture Recipe" value={activePayload.filmStock} placeholder="Fine 35mm, 16mm newsreel…" onChange={(value) => setCategoryField(activeCategoryId, "filmStock", value)} /></SubToolboxStack>

      case "lighting":
        return <SubToolboxStack>
          <LightingPreview azimuth={activePayload.keyAzimuthDegrees} elevation={activePayload.keyElevationDegrees} warmth={activePayload.temperatureK} />
          <SubToolboxGrid>
            <NumberField label="Azimuth" value={activePayload.keyAzimuthDegrees} min={-180} max={180} unit="°" onChange={(value) => setCategoryField(activeCategoryId, "keyAzimuthDegrees", value)} />
            <NumberField label="Elevation" value={activePayload.keyElevationDegrees} min={-90} max={90} unit="°" onChange={(value) => setCategoryField(activeCategoryId, "keyElevationDegrees", value)} />
            <NumberField label="Temperature" value={activePayload.temperatureK} min={1000} max={20000} unit="K" onChange={(value) => setCategoryField(activeCategoryId, "temperatureK", value)} />
            <NumberField label="Softness" value={Math.round(activePayload.softness * 100)} min={0} max={100} unit="%" onChange={(value) => setCategoryField(activeCategoryId, "softness", value / 100)} />
            <NumberField label="Fill" value={Math.round(activePayload.fillIntensity * 100)} min={0} max={100} unit="%" onChange={(value) => setCategoryField(activeCategoryId, "fillIntensity", value / 100)} />
            <NumberField label="Volumetric" value={Math.round(activePayload.volumetric * 100)} min={0} max={100} unit="%" onChange={(value) => setCategoryField(activeCategoryId, "volumetric", value / 100)} />
          </SubToolboxGrid>
        </SubToolboxStack>

      case "timing-pacing":
        return <SubToolboxStack>
          <PacingPreview duration={activePayload.durationSeconds} hook={activePayload.openingHookSeconds} hold={activePayload.finalHoldSeconds} />
          <SubToolboxGrid>
            <NumberField label="Duration" value={activePayload.durationSeconds} min={1} max={3600} step={0.5} unit="sec" onChange={(value) => setCategoryField(activeCategoryId, "durationSeconds", value)} />
            <SelectField label="Frame Rate" value={String(activePayload.frameRate)} options={["15", "23.976", "24", "25", "30", "48", "50", "60"]} onChange={(value) => setCategoryField(activeCategoryId, "frameRate", Number(value))} />
            <SelectField label="Pacing" value={activePayload.pacing} options={["auto", "slow", "measured", "standard", "fast", "frenetic"]} onChange={(value) => setCategoryField(activeCategoryId, "pacing", value)} />
            <NumberField label="Opening Hook" value={activePayload.openingHookSeconds} min={0} max={60} step={0.25} unit="sec" onChange={(value) => setCategoryField(activeCategoryId, "openingHookSeconds", value)} />
            <NumberField label="Final Hold" value={activePayload.finalHoldSeconds} min={0} max={60} step={0.25} unit="sec" onChange={(value) => setCategoryField(activeCategoryId, "finalHoldSeconds", value)} />
          </SubToolboxGrid>
        </SubToolboxStack>

      case "shot-structure":
        return <SubToolboxStack>
          <SelectField label="Structure" value={activePayload.mode} options={["single-take", "auto-multi-shot", "manual-storyboard", "montage", "interview-broll", "narrative-sequence", "trailer", "product-demo", "explainer"]} onChange={(value) => setCategoryField(activeCategoryId, "mode", value)} />
          <SubToolboxGrid>
            <NumberField label="Shot Count" value={activePayload.shotCount} min={1} max={100} onChange={(value) => setCategoryField(activeCategoryId, "shotCount", Math.round(value))} />
            <NumberField label="Average Shot" value={activePayload.averageShotSeconds} min={0.25} max={600} step={0.25} unit="sec" onChange={(value) => setCategoryField(activeCategoryId, "averageShotSeconds", value)} />
            <NumberField label="Continuity Strength" value={Math.round(activePayload.continuityStrength * 100)} min={0} max={100} unit="%" onChange={(value) => setCategoryField(activeCategoryId, "continuityStrength", value / 100)} />
          </SubToolboxGrid>
          <SubToolboxToggle pressed={activePayload.preserveScreenDirection} label="Preserve screen direction" onClick={() => setCategoryField(activeCategoryId, "preserveScreenDirection", !activePayload.preserveScreenDirection)} />
          <SubToolboxToggle pressed={activePayload.preserveTimeOfDay} label="Preserve time of day" onClick={() => setCategoryField(activeCategoryId, "preserveTimeOfDay", !activePayload.preserveTimeOfDay)} />
        </SubToolboxStack>

      case "transitions":
        return <SubToolboxStack><SubToolboxGrid>
          <SelectField label="Default Transition" value={activePayload.defaultType} options={["cut", "crossfade", "match-cut", "dip", "wipe", "optical-bridge", "custom"]} onChange={(value) => setCategoryField(activeCategoryId, "defaultType", value)} />
          <NumberField label="Duration" value={activePayload.durationFrames} min={0} max={240} unit="frames" onChange={(value) => setCategoryField(activeCategoryId, "durationFrames", Math.round(value))} />
          <NumberField label="Audio Crossfade" value={activePayload.audioCrossfadeMs} min={0} max={10000} unit="ms" onChange={(value) => setCategoryField(activeCategoryId, "audioCrossfadeMs", Math.round(value))} />
        </SubToolboxGrid><SubToolboxToggle pressed={activePayload.matchMotion} label="Match motion across cuts" onClick={() => setCategoryField(activeCategoryId, "matchMotion", !activePayload.matchMotion)} /></SubToolboxStack>

      case "speed-motion":
        return <SubToolboxStack><SubToolboxGrid>
          <NumberField label="Playback Rate" value={activePayload.playbackRate} min={0.05} max={20} step={0.05} unit="×" onChange={(value) => setCategoryField(activeCategoryId, "playbackRate", value)} />
          <SelectField label="Interpolation" value={activePayload.interpolation} options={["none", "optical-flow", "rife", "film"]} onChange={(value) => setCategoryField(activeCategoryId, "interpolation", value)} />
          <NumberField label="Motion Blur" value={Math.round(activePayload.motionBlur * 100)} min={0} max={100} unit="%" onChange={(value) => setCategoryField(activeCategoryId, "motionBlur", value / 100)} />
        </SubToolboxGrid><SubToolboxToggle pressed={activePayload.preserveAudioPitch} label="Preserve audio pitch" onClick={() => setCategoryField(activeCategoryId, "preserveAudioPitch", !activePayload.preserveAudioPitch)} /></SubToolboxStack>

      case "voice-dialogue":
        return <SubToolboxStack>
          <SubToolboxToggle pressed={activePayload.enabled} label="Enable voice / dialogue" onClick={() => setCategoryField(activeCategoryId, "enabled", !activePayload.enabled)} />
          <SelectField label="Source" value={activePayload.source} options={["auto", "generated", "upload", "recorded"]} onChange={(value) => setCategoryField(activeCategoryId, "source", value)} />
          <TextField label="Script" value={activePayload.script} multiline placeholder="Paste narration or dialogue…" onChange={(value) => setCategoryField(activeCategoryId, "script", value)} />
          <SubToolboxGrid>
            <TextField label="Language" value={activePayload.language} onChange={(value) => setCategoryField(activeCategoryId, "language", value)} />
            <NumberField label="Speaking Rate" value={activePayload.speakingRate} min={0.5} max={2} step={0.05} unit="×" onChange={(value) => setCategoryField(activeCategoryId, "speakingRate", value)} />
            <NumberField label="Expressiveness" value={Math.round(activePayload.expressiveness * 100)} min={0} max={100} unit="%" onChange={(value) => setCategoryField(activeCategoryId, "expressiveness", value / 100)} />
          </SubToolboxGrid>
        </SubToolboxStack>

      case "music":
        return <SubToolboxStack>
          <SubToolboxToggle pressed={activePayload.enabled} label="Enable music" onClick={() => setCategoryField(activeCategoryId, "enabled", !activePayload.enabled)} />
          <SelectField label="Source" value={activePayload.source} options={["auto", "generated", "upload", "library"]} onChange={(value) => setCategoryField(activeCategoryId, "source", value)} />
          <TextField label="Music Brief" value={activePayload.prompt} multiline placeholder="Describe score, instrumentation, arc…" onChange={(value) => setCategoryField(activeCategoryId, "prompt", value)} />
          <SubToolboxGrid>
            <NumberField label="BPM" value={activePayload.bpm} min={20} max={300} unit="BPM" onChange={(value) => setCategoryField(activeCategoryId, "bpm", value)} />
            <TextField label="Key" value={activePayload.key} placeholder="D minor" onChange={(value) => setCategoryField(activeCategoryId, "key", value)} />
            <TextField label="Genre" value={activePayload.genre} placeholder="Orchestral, ambient…" onChange={(value) => setCategoryField(activeCategoryId, "genre", value)} />
            <SelectField label="Beat Sync" value={activePayload.beatSync} options={["off", "quarter", "half", "bar", "drops", "auto"]} onChange={(value) => setCategoryField(activeCategoryId, "beatSync", value)} />
          </SubToolboxGrid>
        </SubToolboxStack>

      case "sound-effects":
        return <SubToolboxStack>
          <SubToolboxToggle pressed={activePayload.enabled} label="Enable sound effects" onClick={() => setCategoryField(activeCategoryId, "enabled", !activePayload.enabled)} />
          <SubToolboxToggle pressed={activePayload.autoDetectEvents} label="Auto-detect scene events" onClick={() => setCategoryField(activeCategoryId, "autoDetectEvents", !activePayload.autoDetectEvents)} />
          <SubToolboxSurface tone="subtle"><MutedNote>{activePayload.cues.length} timed cue{activePayload.cues.length === 1 ? "" : "s"} configured. Cue editor arrives with the storyboard timeline.</MutedNote></SubToolboxSurface>
        </SubToolboxStack>

      case "ambience-mix":
        return <SubToolboxStack>
          <AudioMatrixPreview />
          <SubToolboxToggle pressed={activePayload.ambienceEnabled} label="Enable ambience" onClick={() => setCategoryField(activeCategoryId, "ambienceEnabled", !activePayload.ambienceEnabled)} />
          <TextField label="Ambience Brief" value={activePayload.ambiencePrompt} placeholder="Winter wind, distant artillery…" onChange={(value) => setCategoryField(activeCategoryId, "ambiencePrompt", value)} />
          <SubToolboxGrid>
            <NumberField label="Spatial Width" value={Math.round(activePayload.spatialWidth * 100)} min={0} max={100} unit="%" onChange={(value) => setCategoryField(activeCategoryId, "spatialWidth", value / 100)} />
            <NumberField label="Dialogue Ducking" value={activePayload.dialogueDuckingDb} min={0} max={30} unit="dB" onChange={(value) => setCategoryField(activeCategoryId, "dialogueDuckingDb", value)} />
            <NumberField label="Target Loudness" value={activePayload.targetLufs} min={-40} max={-5} unit="LUFS" onChange={(value) => setCategoryField(activeCategoryId, "targetLufs", value)} />
          </SubToolboxGrid>
        </SubToolboxStack>

      case "captions":
        return <SubToolboxStack>
          <SubToolboxToggle pressed={activePayload.enabled} label="Enable captions" onClick={() => setCategoryField(activeCategoryId, "enabled", !activePayload.enabled)} />
          <SubToolboxGrid>
            <SelectField label="Source" value={activePayload.source} options={["auto", "transcription", "script", "upload"]} onChange={(value) => setCategoryField(activeCategoryId, "source", value)} />
            <SelectField label="Position" value={activePayload.position} options={["top", "upper-third", "center", "lower-third", "bottom"]} onChange={(value) => setCategoryField(activeCategoryId, "position", value)} />
            <SelectField label="Animation" value={activePayload.animation} options={["none", "word-pop", "karaoke", "fade", "slide", "custom"]} onChange={(value) => setCategoryField(activeCategoryId, "animation", value)} />
            <NumberField label="Max Words / Line" value={activePayload.maxWordsPerLine} min={1} max={20} onChange={(value) => setCategoryField(activeCategoryId, "maxWordsPerLine", Math.round(value))} />
          </SubToolboxGrid>
          <SubToolboxToggle pressed={activePayload.burnIn} label="Burn captions into final render" onClick={() => setCategoryField(activeCategoryId, "burnIn", !activePayload.burnIn)} />
        </SubToolboxStack>

      case "text-titles":
        return <SubToolboxStack>
          <CompositionPreview x={0.5} y={0.72} horizon={0.5} safeZones={activePayload.safeMargins} />
          <SubToolboxToggle pressed={activePayload.safeMargins} label="Title-safe margins" onClick={() => setCategoryField(activeCategoryId, "safeMargins", !activePayload.safeMargins)} />
          <SubToolboxSurface tone="subtle"><MutedNote>{activePayload.overlays.length} text overlay{activePayload.overlays.length === 1 ? "" : "s"} configured. Direct manipulation connects to the ViewTube Editor overlay canvas.</MutedNote></SubToolboxSurface>
        </SubToolboxStack>

      case "stickers-overlays":
        return <SubToolboxStack>
          <SubToolboxFileTarget icon={<ImagePlus size={30} />} label="Add Overlay Asset" accept="image/*,.svg" onFiles={() => setNotice("File intake UI is ready; Vault/object-storage binding follows the asset phase.")} />
          <SubToolboxSurface tone="subtle"><MutedNote>{activePayload.items.length} overlay layer{activePayload.items.length === 1 ? "" : "s"} in this scope.</MutedNote></SubToolboxSurface>
        </SubToolboxStack>

      case "visual-effects":
        return <SubToolboxStack>
          <SubToolboxGrid minItemWidth="compact">
            {["Fog", "Snow", "Dust", "Bloom", "Lens Flare", "Grain", "Deflicker", "Stabilize"].map((label) => {
              const type = label.toLowerCase().replace(" ", "-")
              const selected = activePayload.effects.some((effect: any) => effect.type === type)
              return <SubToolboxTag
                key={label}
                selected={selected}
                onClick={() => {
                  const effects = selected
                    ? activePayload.effects.filter((effect: any) => effect.type !== type)
                    : [...activePayload.effects, { id: `fx-${type}-${Date.now().toString(36)}`, type, intensity: 0.5, startSeconds: 0, blendMode: "normal" }]
                  setCategoryField(activeCategoryId, "effects", effects)
                }}
              >{label}</SubToolboxTag>
            })}
          </SubToolboxGrid>
          <SubToolboxSurface tone="subtle"><MutedNote>Effects are deterministic post-processing layers whenever possible, rather than permanent prompt text.</MutedNote></SubToolboxSurface>
        </SubToolboxStack>

      case "references-seeds":
        return <SubToolboxStack>
          <SubToolboxFileTarget icon={<Upload size={30} />} label="Add Visual / Audio Reference" accept="image/*,video/*,audio/*" onFiles={() => setNotice("Reference file intake selected; direct object-storage upload is a later backend slice.")} />
          <SubToolboxGrid>
            <NumberField label="Seed" value={activePayload.seed ?? 0} min={0} max={2147483647} onChange={(value) => setCategoryField(activeCategoryId, "seed", Math.round(value))} />
            <NumberField label="Variation Noise" value={Math.round(activePayload.variationNoise * 100)} min={0} max={100} unit="%" onChange={(value) => setCategoryField(activeCategoryId, "variationNoise", value / 100)} />
          </SubToolboxGrid>
          <SubToolboxToggle pressed={activePayload.lockSeed} label="Lock seed" onClick={() => setCategoryField(activeCategoryId, "lockSeed", !activePayload.lockSeed)} />
          <SubToolboxSurface tone="subtle"><MutedNote>{activePayload.references.length} weighted reference{activePayload.references.length === 1 ? "" : "s"} configured.</MutedNote></SubToolboxSurface>
        </SubToolboxStack>

      case "consistency-continuity":
        return <SubToolboxStack>
          <SubToolboxGrid>
            <NumberField label="Identity" value={Math.round(activePayload.identityStrength * 100)} min={0} max={100} unit="%" onChange={(value) => setCategoryField(activeCategoryId, "identityStrength", value / 100)} />
            <NumberField label="Wardrobe" value={Math.round(activePayload.wardrobeStrength * 100)} min={0} max={100} unit="%" onChange={(value) => setCategoryField(activeCategoryId, "wardrobeStrength", value / 100)} />
            <NumberField label="Environment" value={Math.round(activePayload.environmentStrength * 100)} min={0} max={100} unit="%" onChange={(value) => setCategoryField(activeCategoryId, "environmentStrength", value / 100)} />
            <NumberField label="Color" value={Math.round(activePayload.colorContinuity * 100)} min={0} max={100} unit="%" onChange={(value) => setCategoryField(activeCategoryId, "colorContinuity", value / 100)} />
          </SubToolboxGrid>
          <SubToolboxSurface tone="subtle"><MutedNote>{activePayload.entities.length} continuity entit{activePayload.entities.length === 1 ? "y" : "ies"} in the ledger. Character/asset drag-in connects to Vault in the asset phase.</MutedNote></SubToolboxSurface>
        </SubToolboxStack>

      case "negative-constraints":
        return <SubToolboxStack>
          <SelectField label="Enforcement" value={activePayload.enforcement} options={["advisory", "standard", "strict"]} onChange={(value) => setCategoryField(activeCategoryId, "enforcement", value)} />
          <TextField label="Negative Instructions" value={activePayload.freeText} multiline placeholder="No modern objects, no fantasy armor, no graphic gore…" onChange={(value) => setCategoryField(activeCategoryId, "freeText", value)} />
          <SubToolboxGrid minItemWidth="compact">
            {activePayload.tags.map((tag: string) => <SubToolboxTag selected key={tag}>{tag}</SubToolboxTag>)}
          </SubToolboxGrid>
        </SubToolboxStack>

      case "generation-output":
        return <SubToolboxStack>
          <OutputPreview ratio={activePayload.aspectRatio} quality={activePayload.quality} outputs={activePayload.outputs} />
          <SubToolboxGrid>
            <SelectField label="Provider Routing" value={activePayload.providerMode} options={["auto", "manual"]} onChange={(value) => setCategoryField(activeCategoryId, "providerMode", value)} />
            <SelectField label="Quality" value={activePayload.quality} options={["draft", "preview", "final"]} onChange={(value) => setCategoryField(activeCategoryId, "quality", value)} />
            <SelectField label="Resolution" value={activePayload.resolution} options={["480p", "720p", "1080p", "2k", "4k"]} onChange={(value) => setCategoryField(activeCategoryId, "resolution", value)} />
            <SelectField label="Aspect Ratio" value={activePayload.aspectRatio} options={["21:9", "16:9", "4:3", "1:1", "3:4", "9:16", "custom"]} onChange={(value) => setCategoryField(activeCategoryId, "aspectRatio", value)} />
            <NumberField label="Outputs" value={activePayload.outputs} min={1} max={24} onChange={(value) => setCategoryField(activeCategoryId, "outputs", Math.round(value))} />
          </SubToolboxGrid>
          {activePayload.providerMode === "manual" ? <SubToolboxGrid>
            <TextField label="Provider ID" value={activePayload.providerId ?? ""} placeholder="provider…" onChange={(value) => setCategoryField(activeCategoryId, "providerId", value || undefined)} />
            <TextField label="Model ID" value={activePayload.modelId ?? ""} placeholder="model…" onChange={(value) => setCategoryField(activeCategoryId, "modelId", value || undefined)} />
          </SubToolboxGrid> : null}
          <SubToolboxToggle pressed={activePayload.generateAudio} label="Request native audio when supported" onClick={() => setCategoryField(activeCategoryId, "generateAudio", !activePayload.generateAudio)} />
          <SubToolboxToggle pressed={activePayload.upscale} label="Upscale after approval" onClick={() => setCategoryField(activeCategoryId, "upscale", !activePayload.upscale)} />
          <SubToolboxToggle pressed={activePayload.hdr} label="HDR only when source pipeline supports it" onClick={() => setCategoryField(activeCategoryId, "hdr", !activePayload.hdr)} />
        </SubToolboxStack>

      default:
        return <SubToolboxSurface tone="subtle"><MutedNote>This Director category is registered but does not yet have an editor surface.</MutedNote></SubToolboxSurface>
    }
  }

  return (
    <div id="video-director" className="scroll-mt-24">
      <ToolboxScaffold
        title="Video Director"
        subtitle="Direct single videos, variations, sequences + campaigns from one traceable Video DNA system"
        icon={<Clapperboard />}
        paletteIndex={paletteIndex}
        collapsible={collapsible}
        isOpen={open}
        onToggle={() => setOpen((value) => !value)}
        unmountWhenClosed={false}
        embedded={embedded}
        helpText="Start with a brief and Generate later, or progressively direct camera, image, motion, audio, graphics and generation settings. Every advanced category is optional."
      >
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.06fr)_minmax(0,.94fr)] gap-1 items-start w-full bg-white">
          <div className="flex flex-col gap-1 min-w-0">
            <SubToolbox title="Director Brief" icon={<WandSparkles />} collapsible isOpenInitial>
              <SubToolboxStack>
                <TextField
                  label="Project Name"
                  value={project.name}
                  placeholder="Untitled project"
                  onChange={(value) => mutateProject((draft) => { draft.name = value })}
                />
                <TextField
                  label="Idea / Brief"
                  value={project.categories["concept-direction"].payload.brief}
                  multiline
                  placeholder="Describe the video you want ViewTube to direct…"
                  onChange={(value) => setCategoryField("concept-direction", "brief", value)}
                />
                <SubToolboxGrid minItemWidth="compact" density="dense" aria-label="Video Director mode">
                  {MODE_OPTIONS.map(({ id, label, icon: Icon }) => (
                    <StudioSplitLeftButton
                      key={id}
                      sizeVariant="standard"
                      selected={project.mode === id}
                      aria-pressed={project.mode === id}
                      icon={<Icon size={17} />}
                      onClick={() => mutateProject((draft) => { draft.mode = id })}
                    >
                      {label}
                    </StudioSplitLeftButton>
                  ))}
                </SubToolboxGrid>
                <SubToolboxGrid>
                  <NumberField
                    label="Duration"
                    value={project.categories["timing-pacing"].payload.durationSeconds}
                    min={1}
                    max={3600}
                    step={0.5}
                    unit="sec"
                    onChange={(value) => setCategoryField("timing-pacing", "durationSeconds", value)}
                  />
                  <SelectField
                    label="Ratio"
                    value={project.categories["generation-output"].payload.aspectRatio}
                    options={["16:9", "9:16", "1:1", "21:9", "4:3", "3:4", "custom"]}
                    onChange={(value) => setCategoryField("generation-output", "aspectRatio", value)}
                  />
                  <NumberField
                    label="Outputs"
                    value={project.categories["generation-output"].payload.outputs}
                    min={1}
                    max={24}
                    onChange={(value) => setCategoryField("generation-output", "outputs", Math.round(value))}
                  />
                </SubToolboxGrid>
              </SubToolboxStack>
            </SubToolbox>

            <SubToolbox
              title="Director Settings"
              subtitle={activeDefinition.purpose}
              icon={React.createElement(GROUP_ICON[activeDefinition.group], { size: 24 })}
              collapsible
              isOpenInitial
              actionButton={<SubToolboxBadge>{STATUS_SYMBOL[activeStatus]} {STATUS_LABEL[activeStatus]}</SubToolboxBadge>}
            >
              <SubToolboxStack>
                <SubToolboxDropdownControl
                  label="Active Category"
                  value={categoryOptionLabel(project, activeCategoryId)}
                  options={categoryOptions}
                  onChange={onCategoryOptionChange}
                  tone="purple"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <SubToolboxBadge>{GROUP_LABEL[activeDefinition.group]}</SubToolboxBadge>
                  <SubToolboxBadge>{activeDefinition.compoundComponent}</SubToolboxBadge>
                  {activeState.locked ? <SubToolboxBadge>Locked</SubToolboxBadge> : null}
                  {activeState.recipeId ? <SubToolboxBadge>Recipe: {activeState.recipeId}</SubToolboxBadge> : null}
                </div>
                {activeState.conflicts.length ? (
                  <SubToolboxSurface tone="accent" className="space-y-2">
                    {activeState.conflicts.map((item) => (
                      <div key={item.id} className="flex gap-2 items-start text-[10px] font-black uppercase">
                        <Ban size={16} className="shrink-0" aria-hidden="true" />
                        <span>{item.message}</span>
                      </div>
                    ))}
                  </SubToolboxSurface>
                ) : null}
                {renderCategoryEditor()}
                <SubToolboxActions columns={3}>
                  <StudioButton sizeVariant="standard" tone="neutral" onClick={() => toggleCategoryLock(activeCategoryId)}>
                    {activeState.locked ? <Unlock size={15} /> : <Lock size={15} />}
                    {activeState.locked ? "Unlock" : "Lock"}
                  </StudioButton>
                  <StudioButton sizeVariant="standard" tone="neutral" onClick={() => resetCategory(activeCategoryId)}>
                    <RotateCcw size={15} />Reset
                  </StudioButton>
                  <StudioButton
                    sizeVariant="standard"
                    tone="neutral"
                    onClick={() => {
                      const recipe = createVideoDirectorCategoryRecipe({
                        project,
                        categoryId: activeCategoryId,
                        name: recipeName.trim() || `${activeDefinition.label} Recipe`,
                      })
                      setRecipes(saveVideoDirectorRecipe(recipe))
                      setNotice(`${activeDefinition.label} recipe saved.`)
                    }}
                  >
                    <BookmarkPlus size={15} />Recipe
                  </StudioButton>
                </SubToolboxActions>
              </SubToolboxStack>
            </SubToolbox>
          </div>

          <div className="flex flex-col gap-1 min-w-0">
            <SubToolbox title="Director Readiness" icon={<CircleGauge />} collapsible isOpenInitial>
              <SubToolboxGrid minItemWidth="compact">
                <SubToolboxMetric label="Configured" value={configuredCount} />
                <SubToolboxMetric label="Locked" value={lockedCount} />
                <SubToolboxMetric label="Conflicts" value={conflictCount} />
                <SubToolboxMetric label="Categories" value={VIDEO_DIRECTOR_CATEGORY_REGISTRY.length} />
              </SubToolboxGrid>
              <SubToolboxStack>
                <MutedNote>Optional categories do not reduce readiness. Only unresolved blockers and invalid generation requirements should prevent execution.</MutedNote>
                {notice ? <SubToolboxSurface tone="subtle" role="status">{notice}</SubToolboxSurface> : null}
              </SubToolboxStack>
            </SubToolbox>

            <SubToolbox title={`Job Queue · ${jobs.length}`} icon={<Activity />} collapsible isOpenInitial={false}>
              <SubToolboxStack>
                <div className="flex items-center justify-between gap-2">
                  <MutedNote>Persistent server queue for this Video Director project.</MutedNote>
                  <StudioButton
                    sizeVariant="compact"
                    tone="neutral"
                    loading={jobsLoading}
                    onClick={() => { void refreshJobs() }}
                  >
                    Refresh
                  </StudioButton>
                </div>
                {jobsUnavailable ? (
                  <SubToolboxSurface tone="subtle">
                    <MutedNote>Sign in to ViewTube to access durable generation jobs.</MutedNote>
                  </SubToolboxSurface>
                ) : null}
                {!jobsUnavailable && !jobs.length && !jobsLoading ? (
                  <SubToolboxSurface tone="subtle">
                    <MutedNote>No generation jobs have been submitted for this project yet.</MutedNote>
                  </SubToolboxSurface>
                ) : null}
                <div className="flex flex-col gap-2">
                  {jobs.map((job) => {
                    const active = job.status === "queued" || job.status === "running" || job.status === "post-processing"
                    return (
                      <SubToolboxSurface key={job.id} tone={job.status === "dead-letter" || job.status === "failed" ? "accent" : "white"}>
                        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 items-start">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1">
                              <SubToolboxBadge>{job.status}</SubToolboxBadge>
                              <SubToolboxBadge>{Math.round(job.progress * 100)}%</SubToolboxBadge>
                              {job.providerId ? <SubToolboxBadge>{job.providerId}</SubToolboxBadge> : null}
                              {job.modelId ? <SubToolboxBadge>{job.modelId}</SubToolboxBadge> : null}
                            </div>
                            <strong className="block mt-2 text-[12px] font-black uppercase truncate">{job.stage}</strong>
                            <p className="mt-1 text-[10px] font-bold opacity-60">{job.progressMessage || "Waiting for the next worker update."}</p>
                            <div className="mt-2 h-3 border-[2px] border-current rounded-full overflow-hidden bg-white" aria-label={`${Math.round(job.progress * 100)} percent complete`}>
                              <span className="block h-full bg-current opacity-40" style={{ width: `${Math.round(job.progress * 100)}%` }} />
                            </div>
                            <div className="mt-2 text-[9px] font-black uppercase opacity-50">
                              Attempt {job.attemptCount}/{job.maxAttempts} · {job.eventLog.length} event{job.eventLog.length === 1 ? "" : "s"}
                            </div>
                            {job.previewAssetUri ? (
                              <img src={job.previewAssetUri} alt="Generation preview" className="mt-2 w-full max-h-40 object-cover border-[2px] border-current rounded-[8px]" />
                            ) : null}
                          </div>
                          {active ? (
                            <StudioButton
                              sizeVariant="compact"
                              tone="danger"
                              onClick={async () => {
                                try {
                                  await cancelVideoDirectorJob(job.id)
                                  setNotice("Cancellation requested.")
                                  await refreshJobs()
                                } catch (error) {
                                  setNotice(error instanceof Error ? error.message : "Could not cancel generation.")
                                }
                              }}
                            >
                              Cancel
                            </StudioButton>
                          ) : null}
                        </div>
                      </SubToolboxSurface>
                    )
                  })}
                </div>
              </SubToolboxStack>
            </SubToolbox>

            <SubToolbox title={`Director Suggestions · ${suggestions.length}`} icon={<Lightbulb />} collapsible isOpenInitial={suggestions.length > 0}>
              <SubToolboxStack>
                {suggestions.map((item) => (
                  <SubToolboxSurface key={item.id} tone={item.priority === "high" ? "accent" : "subtle"}>
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 items-start">
                      <div className="min-w-0">
                        <strong className="block text-[13px] font-black uppercase tracking-tight">{item.title}</strong>
                        <p className="mt-1 text-[10px] font-bold leading-snug opacity-65">{item.reason}</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {item.targetCategoryIds.map((categoryId) => (
                            <SubToolboxBadge key={categoryId}>{VIDEO_DIRECTOR_CATEGORY_BY_ID[categoryId].shortLabel}</SubToolboxBadge>
                          ))}
                        </div>
                      </div>
                      <StudioButton
                        sizeVariant="compact"
                        tone="neutral"
                        onClick={() => {
                          setProject((current) => applyVideoDirectorConflicts(applyVideoDirectorSuggestion(current, item)))
                          setNotice(`${item.title} applied to Auto/inherited fields only.`)
                        }}
                      >
                        Apply
                      </StudioButton>
                    </div>
                  </SubToolboxSurface>
                ))}
                {!suggestions.length ? (
                  <SubToolboxSurface tone="subtle">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase opacity-55">
                      <CheckCircle2 size={17} aria-hidden="true" />
                      <span>No contextual Director suggestions right now.</span>
                    </div>
                  </SubToolboxSurface>
                ) : null}
                <MutedNote>Suggestions can modify Auto, provider-default, recipe, or earlier AI-directed fields. User, shot, and variant overrides remain protected.</MutedNote>
              </SubToolboxStack>
            </SubToolbox>

            <SubToolbox title="Catalog Digest" icon={<Grid2X2 />} collapsible isOpenInitial>
              <SubToolboxStack>
                {VIDEO_DIRECTOR_CATEGORY_GROUPS.map((group) => {
                  const Icon = GROUP_ICON[group]
                  const definitions = VIDEO_DIRECTOR_CATEGORY_REGISTRY.filter((definition) => definition.group === group)
                  return (
                    <SubToolboxSection
                      key={group}
                      label={<div className="flex items-center gap-2 text-[11px] font-black uppercase"><Icon size={16} /><span>{GROUP_LABEL[group]}</span></div>}
                    >
                      <SubToolboxGrid minItemWidth="compact" density="dense">
                        {definitions.map((definition) => {
                          const status = statusForProject(project, definition.id)
                          const selected = definition.id === activeCategoryId
                          return (
                            <StudioButton
                              key={definition.id}
                              sizeVariant="standard"
                              tone={status === "conflict" ? "danger" : "neutral"}
                              selected={selected}
                              onClick={() => mutateProject((draft) => { draft.activeCategoryId = definition.id })}
                              aria-label={`${definition.label}: ${STATUS_LABEL[status]}`}
                              title={definition.purpose}
                            >
                              <span className="font-black text-[14px]" aria-hidden="true">{STATUS_SYMBOL[status]}</span>
                              <span className="truncate">{definition.shortLabel}</span>
                              {project.categories[definition.id].locked ? <Lock size={12} aria-label="Locked" /> : null}
                            </StudioButton>
                          )
                        })}
                      </SubToolboxGrid>
                    </SubToolboxSection>
                  )
                })}
              </SubToolboxStack>
            </SubToolbox>

            <SubToolbox title="Recipe Library" icon={<BookmarkPlus />} collapsible isOpenInitial={false}>
              <SubToolboxStack>
                <TextField
                  label="Recipe Name"
                  value={recipeName}
                  placeholder="Battlefield camera, cold documentary…"
                  onChange={setRecipeName}
                />
                <SubToolboxActions columns={2}>
                  <StudioButton
                    sizeVariant="standard"
                    tone="neutral"
                    onClick={() => {
                      const recipe = createVideoDirectorCategoryRecipe({
                        project,
                        categoryId: activeCategoryId,
                        name: recipeName.trim() || `${activeDefinition.label} Recipe`,
                      })
                      setRecipes(saveVideoDirectorRecipe(recipe))
                      setNotice(`${activeDefinition.label} recipe saved.`)
                    }}
                  >
                    <BookmarkPlus size={15} />Save Category
                  </StudioButton>
                  <StudioButton
                    sizeVariant="standard"
                    tone="neutral"
                    onClick={() => {
                      const recipe = createVideoDirectorProjectRecipe({
                        project,
                        name: recipeName.trim() || `${project.name || "Video Director"} Recipe`,
                      })
                      setRecipes(saveVideoDirectorRecipe(recipe))
                      setNotice("Project recipe saved.")
                    }}
                  >
                    <Save size={15} />Save Project
                  </StudioButton>
                </SubToolboxActions>
                <SubToolboxSurface tone="subtle" scroll className="max-h-64">
                  <div className="flex flex-col gap-2">
                    {recipes.map((recipe) => (
                      <div key={recipe.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 items-center border-[2px] border-current rounded-[8px] p-2 bg-white">
                        <button
                          type="button"
                          className="min-w-0 text-left"
                          onClick={() => {
                            setProject((current) => applyVideoDirectorConflicts(applyVideoDirectorRecipe(current, recipe)))
                            setNotice(`${recipe.name} applied without replacing later user overrides.`)
                          }}
                        >
                          <strong className="block truncate text-[12px] font-black uppercase">{recipe.name}</strong>
                          <span className="block text-[9px] font-black uppercase opacity-50">
                            {recipe.scope} · v{recipe.version} · {recipe.categories.length} categor{recipe.categories.length === 1 ? "y" : "ies"}
                          </span>
                        </button>
                        <SubToolboxBadge>◆</SubToolboxBadge>
                      </div>
                    ))}
                    {!recipes.length ? <MutedNote>No saved Director recipes yet.</MutedNote> : null}
                  </div>
                </SubToolboxSurface>
                <MutedNote>Recipe application is inherited. Existing user, shot, and variant overrides remain authoritative unless a future explicit “force apply” action is used.</MutedNote>
              </SubToolboxStack>
            </SubToolbox>

            <SubToolbox title="Prompt Inspector" icon={<Eye />} collapsible isOpenInitial={false}>
              <SubToolboxStack>
                <SubToolboxActions columns={2}>
                  <StudioButton
                    sizeVariant="standard"
                    tone="neutral"
                    selected={inspectorView === "prompt"}
                    onClick={() => setInspectorView("prompt")}
                  >
                    Semantic Prompt
                  </StudioButton>
                  <StudioButton
                    sizeVariant="standard"
                    tone="neutral"
                    selected={inspectorView === "json"}
                    onClick={() => setInspectorView("json")}
                  >
                    Video DNA JSON
                  </StudioButton>
                </SubToolboxActions>
                <StudioTextArea
                  readOnly
                  value={inspectorView === "prompt" ? compiledPacket.prompt : compiledPacket.json}
                  aria-label={inspectorView === "prompt" ? "Compiled Director prompt" : "Compiled Director JSON"}
                  style={{ minHeight: 260, textTransform: "none", fontWeight: 650, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 11 }}
                />
                <SubToolboxActions columns={2}>
                  <StudioButton
                    sizeVariant="standard"
                    tone="neutral"
                    onClick={async () => {
                      const text = inspectorView === "prompt" ? compiledPacket.prompt : compiledPacket.json
                      try {
                        await navigator.clipboard.writeText(text)
                        setNotice(`${inspectorView === "prompt" ? "Prompt" : "Video DNA JSON"} copied.`)
                      } catch {
                        setNotice("Copy failed in this browser.")
                      }
                    }}
                  >
                    Copy {inspectorView === "prompt" ? "Prompt" : "JSON"}
                  </StudioButton>
                  <StudioButton
                    sizeVariant="standard"
                    tone="neutral"
                    onClick={() => {
                      mutateProject((draft) => { draft.activeCategoryId = "generation-output" })
                      setNotice("Generation & Output opened for final preflight settings.")
                    }}
                  >
                    Review Output
                  </StudioButton>
                </SubToolboxActions>
                <MutedNote>The semantic plan is deterministic and provider-agnostic. Provider adapters will translate this packet into model-specific fields without changing the underlying Video DNA.</MutedNote>
              </SubToolboxStack>
            </SubToolbox>

            <SubToolbox title="Generation Plan" icon={<Play />} collapsible isOpenInitial>
              <SubToolboxStack>
                <OutputPreview
                  ratio={project.categories["generation-output"].payload.aspectRatio}
                  quality={project.categories["generation-output"].payload.quality}
                  outputs={project.categories["generation-output"].payload.outputs}
                />
                <SubToolboxGrid>
                  <SubToolboxMetric label="Mode" value={project.mode.toUpperCase()} />
                  <SubToolboxMetric label="Duration" value={`${project.categories["timing-pacing"].payload.durationSeconds}s`} />
                  <SubToolboxMetric label="Provider" value={project.categories["generation-output"].payload.providerMode === "auto" ? "AUTO" : project.categories["generation-output"].payload.providerId || "MANUAL"} />
                  <SubToolboxMetric label="Quality" value={project.categories["generation-output"].payload.quality.toUpperCase()} />
                </SubToolboxGrid>
                <SubToolboxActions columns={2}>
                  <SubToolboxGridActionButton
                    label="Save Draft"
                    iconName="database"
                    tone="yellow"
                    onClick={() => {
                      saveVideoDirectorDraft(project.name, project)
                      setNotice("Video Director draft saved.")
                    }}
                  />
                  <SubToolboxGridActionButton
                    label={conflictCount ? "Resolve Conflicts" : "Preview Plan"}
                    iconName={conflictCount ? "checklist" : "eye"}
                    tone={conflictCount ? "orange" : "green"}
                    onClick={() => {
                      const valid = VideoDirectorProjectSchema.safeParse(project)
                      setNotice(
                        valid.success && conflictCount === 0
                          ? "Video DNA is structurally valid. Provider capability + credit preflight comes next."
                          : `Resolve ${conflictCount} conflict${conflictCount === 1 ? "" : "s"} before provider preflight.`,
                      )
                    }}
                  />
                </SubToolboxActions>
                <StudioButton sizeVariant="action" tone="accent" disabled title="Provider adapters, cost reservation and persistent generation queue are the next execution layer.">
                  <Sparkles size={19} />Generate — Provider Layer Next
                </StudioButton>
              </SubToolboxStack>
            </SubToolbox>
          </div>
        </div>
      </ToolboxScaffold>
    </div>
  )
}

export default VideoDirector
