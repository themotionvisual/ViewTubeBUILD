import React, { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
 Archive,
 Database,
 FileAudio,
 FileImage,
 FileText,
 Filter,
 Search,
 UploadCloud,
 Video,
} from "lucide-react"
import {
 StandardInput,
 SubToolbox,
 SubToolboxDropdownControl,
 SubToolboxInnerActionButton,
 Toolbox,
} from "../components/Toolbox"
import {
 SubToolboxAlphabeticalTag,
 SubToolboxDataTable,
 SubToolboxFileTarget,
 SubToolboxInput,
 SubToolboxSegmentedToggle,
 SubToolboxSelect,
 SubToolboxSplitField,
 SubToolboxStatePanel,
 SubToolboxTextArea,
 SubToolboxVaultAsset,
} from "../components/subtoolbox/SubToolboxPrimitives"
import {
 createImportedVaultAsset,
 deleteVaultAsset,
 findVaultDuplicateByHash,
 listVaultAssets,
 searchVaultAssets,
 setVaultAssetLifecycle,
 setVaultAssetProtection,
 setVaultAssetState,
 updateVaultAsset,
 type VaultAssetLifecycle,
} from "../services/vaultAdapter"
import {
 readVaultWorkspaceState,
 writeVaultWorkspaceState,
 DEFAULT_VAULT_MODULE_ORDER,
 type VaultWorkspaceDensity,
 type VaultWorkspaceModuleId,
 type VaultWorkspaceSort,
 type VaultWorkspaceViewMode,
} from "../services/vaultWorkspaceState"
import { createPendingVaultImport, updatePendingVaultImport, type PendingVaultImport } from "../services/vaultImport"
import { extractVaultFileMetadata } from "../services/vaultFileMetadata"
import { computeVaultFileHash } from "../services/vaultFileHash"
import { extractVaultVideoThumbnail } from "../services/vaultVideoThumbnail"
import { extractVaultImagePreview } from "../services/vaultImagePreview"
import { extractVaultExifMetadata } from "../services/vaultExif"
import {
 computeVaultImagePerceptualHash,
 findVaultSimilarAssets,
} from "../services/vaultImageSimilarity"
import { computeVaultImagePalette } from "../services/vaultImagePalette"
import { buildVaultExplorerGroups } from "../services/vaultExplorer"
import { getAssetLineage } from "../services/assetEngine"
import {
 detachVaultAssetVersion,
 getVaultAssetVersionStack,
} from "../services/vaultVersions"
import {
 clearCompletedVaultTasks,
 createVaultTask,
 getVaultTask,
 listVaultTasks,
 retryVaultTask,
 updateVaultTask,
} from "../services/vaultTaskCenter"
import { resolveVaultSelection } from "../services/vaultSelection"
import { resolveVaultComparePair } from "../services/vaultCompare"
import {
 createVaultSmartCollection,
 deleteVaultSmartCollection,
 listVaultSmartCollections,
 type VaultSmartCollection,
} from "../services/vaultCollections"
import {
 addAssetsToVaultCollection,
 createVaultCollection,
 deleteVaultCollection,
 listVaultCollections,
 removeAssetFromVaultCollection,
 setVaultCollectionRole,
} from "../services/vaultManualCollections"
import { resolveVaultKeyboardCommand } from "../services/vaultKeyboard"
import { SubToolboxMediaInspector, SubToolboxMediaPlayer } from "../components/subtoolbox/SubToolboxMediaPrimitives"
import { useBrain } from "../context/useBrain"
import { initializeProjectContentIdentity } from "../services/projects/ProjectContentIdentityService"
import {
 attachAssetToContentBuild,
 getContentBuild,
} from "../services/asset-engine/ContentBuildRepository"
import {
 attachVaultAssetIdsToProject,
 buildVaultSelectionProjectDraft,
} from "../services/vaultProjectHandoff"
import { getVaultAssetUsage } from "../services/vaultUsage"
import {
 createVaultSelectionManifest,
 serializeVaultSelectionManifest,
} from "../services/vaultManifest"
import {
 serializeVaultAssetsCsv,
 serializeVaultAssetsJson,
} from "../services/vaultMetadataExport"
import {
 createVaultScratchpad,
 deleteVaultScratchpad,
 listVaultScratchpads,
} from "../services/vaultScratchpads"
import {
 createVaultChecklistItem,
 deleteVaultChecklistItem,
 listVaultChecklistItems,
 toggleVaultChecklistItem,
} from "../services/vaultChecklists"
import {
 captionLinesToSrt,
 captionLinesToVtt,
 createCaptionAsset,
 transcriptToScriptAsset,
 type VaultCaptionLine,
} from "../services/vaultCaptions"
import { getVaultProjectReadiness } from "../services/vaultReadiness"
import {
 createVaultAssetHandoff,
 getVaultAssetToolTargets,
} from "../services/vaultToolLauncher"
import {
 createVaultCustomField,
 deleteVaultCustomField,
 listVaultCustomFields,
 setVaultCustomFieldValue,
 type VaultCustomFieldType,
} from "../services/vaultCustomFields"
import {
 resolveVaultTranscriptVideoId,
 runVaultTranscriptTask,
} from "../services/vaultTranscriptTask"
import type { VaultAsset, VaultAssetKind } from "../types"

const VAULT_MODULE_LABELS: Record<VaultWorkspaceModuleId, string> = {
 navigator: "Navigator",
 explorer: "Explorer",
 "workspace-notes": "Workspace Notes",
 "spectrum-tags": "Spectrum Tags",
 "asset-library": "Asset Library",
 "import-station": "Import Station",
 "task-center": "Task Center",
 "batch-processor": "Batch Processor",
 inspector: "Inspector",
}

const CORE_TAGS = [
 "B-Roll",
 "Brand",
 "Draft",
 "Map",
 "Music",
 "Reference",
 "Research",
 "Script",
 "SFX",
 "Thumbnail",
] as const

const vaultCardKind = (asset: VaultAsset): "landscape" | "portrait" | "audio" | "document" => {
 if (asset.kind === "audio") return "audio"
 if (asset.kind === "document" || asset.kind === "font" || asset.kind === "template") return "document"
 return "landscape"
}

const formatVaultBytes = (bytes: number) => {
 if (bytes < 1024) return `${bytes} B`
 if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
 if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
 return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`
}

const assetIcon = (asset: VaultAsset) => {
 if (asset.kind === "video") return <Video />
 if (asset.kind === "audio") return <FileAudio />
 if (asset.kind === "document" || asset.kind === "font" || asset.kind === "template") return <FileText />
 return <FileImage />
}

const CreatorVaultOS: React.FC = () => {
 const navigate = useNavigate()
 const { brain, addProject, updateProject, setActiveProject, channelIdentity } = useBrain()
 const initialWorkspace = useMemo(() => readVaultWorkspaceState(), [])
 const [refreshTick, setRefreshTick] = useState(0)
 const [query, setQuery] = useState(initialWorkspace.query)
 const [filterKind, setFilterKind] = useState<"all" | VaultAssetKind>(initialWorkspace.filterKind)
 const [selectedTag, setSelectedTag] = useState<string | null>(initialWorkspace.selectedTag)
 const [source, setSource] = useState(initialWorkspace.source)
 const [sort, setSort] = useState<VaultWorkspaceSort>(initialWorkspace.sort)
 const [special, setSpecial] = useState(initialWorkspace.special)
 const [filterLifecycle, setFilterLifecycle] = useState(initialWorkspace.filterLifecycle)
 const [filterMimeType, setFilterMimeType] = useState(initialWorkspace.filterMimeType)
 const [filterMinWidth, setFilterMinWidth] = useState(initialWorkspace.filterMinWidth)
 const [filterMinHeight, setFilterMinHeight] = useState(initialWorkspace.filterMinHeight)
 const [filterMinDuration, setFilterMinDuration] = useState(initialWorkspace.filterMinDuration)
 const [filterMaxDuration, setFilterMaxDuration] = useState(initialWorkspace.filterMaxDuration)
 const [filterMinBytesMb, setFilterMinBytesMb] = useState(initialWorkspace.filterMinBytesMb)
 const [filterMaxBytesMb, setFilterMaxBytesMb] = useState(initialWorkspace.filterMaxBytesMb)
 const [viewMode, setViewMode] = useState<VaultWorkspaceViewMode>(initialWorkspace.viewMode)
 const [density, setDensity] = useState<VaultWorkspaceDensity>(initialWorkspace.density)
 const [arrangeMode, setArrangeMode] = useState(initialWorkspace.arrangeMode)
 const [visibleModules, setVisibleModules] = useState<VaultWorkspaceModuleId[]>(initialWorkspace.visibleModules)
 const [moduleOrder, setModuleOrder] = useState<VaultWorkspaceModuleId[]>(initialWorkspace.moduleOrder)
 const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([])
 const [selectionAnchorId, setSelectionAnchorId] = useState<string | null>(null)
 const selectionShiftRef = useRef(false)
 const [batchTag, setBatchTag] = useState("")
 const [batchPrefix, setBatchPrefix] = useState("")
 const [batchProject, setBatchProject] = useState("")
 const [pending, setPending] = useState<PendingVaultImport[]>([])
 const [importMode, setImportMode] = useState<"direct" | "staged">("staged")
 const [importProject, setImportProject] = useState("")
 const [importTags, setImportTags] = useState<string[]>(["imported"])
 const [quickLookCurrent, setQuickLookCurrent] = useState(0)
 const [quickLookPlaying, setQuickLookPlaying] = useState(false)
 const [quickLookMuted, setQuickLookMuted] = useState(false)
 const [quickLookVolume, setQuickLookVolume] = useState(0.8)
 const [quickLookSpeed, setQuickLookSpeed] = useState(1)
 const [quickLookOpen, setQuickLookOpen] = useState(true)
 const [compareReveal, setCompareReveal] = useState(50)
 const [smartCollectionName, setSmartCollectionName] = useState("")
 const [collectionRefresh, setCollectionRefresh] = useState(0)
 const [manualCollectionName, setManualCollectionName] = useState("")
 const [manualCollectionRefresh, setManualCollectionRefresh] = useState(0)
 const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null)
 const [targetCollectionId, setTargetCollectionId] = useState("")
 const [taskRefresh, setTaskRefresh] = useState(0)
 const [scratchpadRefresh, setScratchpadRefresh] = useState(0)
 const [scratchpadTitle, setScratchpadTitle] = useState("")
 const [scratchpadContent, setScratchpadContent] = useState("")
 const [checklistRefresh, setChecklistRefresh] = useState(0)
 const [checklistText, setChecklistText] = useState("")
 const [selectionProjectName, setSelectionProjectName] = useState("")
 const [existingProjectId, setExistingProjectId] = useState("")
 const [captionLines, setCaptionLines] = useState<VaultCaptionLine[]>([])
 const [customFieldRefresh, setCustomFieldRefresh] = useState(0)
 const [customFieldName, setCustomFieldName] = useState("")
 const [customFieldType, setCustomFieldType] = useState<VaultCustomFieldType>("text")
 const [explorerProject, setExplorerProject] = useState<"all" | "unassigned" | string>("all")
 const searchInputRef = useRef<HTMLInputElement | null>(null)
 const selectionProjectInputRef = useRef<HTMLInputElement | null>(null)

 const allAssets = useMemo(() => listVaultAssets(), [refreshTick])
 const smartCollections = useMemo(() => listVaultSmartCollections(), [collectionRefresh])
 const manualCollections = useMemo(() => listVaultCollections(), [manualCollectionRefresh])
 const brandKit = useMemo(
  () => manualCollections.find((collection) => collection.role === "brand-kit") || null,
  [manualCollections],
 )
 const tasks = useMemo(() => listVaultTasks(), [taskRefresh])
 const scratchpads = useMemo(() => listVaultScratchpads(), [scratchpadRefresh])
 const checklistItems = useMemo(() => listVaultChecklistItems(), [checklistRefresh])
 const customFields = useMemo(() => listVaultCustomFields(), [customFieldRefresh])
 const explorerGroups = useMemo(() => buildVaultExplorerGroups(allAssets), [allAssets])
 const visibleAssets = useMemo(() => {
  const base = searchVaultAssets({
   query,
   kind: filterKind === "all" ? null : filterKind,
   tags: selectedTag ? [selectedTag] : [],
   source: source === "all" ? null : source,
   sort,
   special,
   lifecycle: filterLifecycle === "all" ? null : filterLifecycle,
   mimeType: filterMimeType.trim() || null,
   minWidth: filterMinWidth ? Number(filterMinWidth) : null,
   minHeight: filterMinHeight ? Number(filterMinHeight) : null,
   minDurationSec: filterMinDuration ? Number(filterMinDuration) : null,
   maxDurationSec: filterMaxDuration ? Number(filterMaxDuration) : null,
   minBytes: filterMinBytesMb ? Number(filterMinBytesMb) * 1024 * 1024 : null,
   maxBytes: filterMaxBytesMb ? Number(filterMaxBytesMb) * 1024 * 1024 : null,
   limit: 100,
  })
  let scoped = base
  if (explorerProject === "unassigned") scoped = base.filter((asset) => !asset.projectName)
  else if (explorerProject !== "all") scoped = base.filter((asset) => asset.projectName === explorerProject)
  if (!activeCollectionId) return scoped
  const collection = manualCollections.find((item) => item.id === activeCollectionId)
  if (!collection) return scoped
  const ids = new Set(collection.assetIds)
  return scoped.filter((asset) => ids.has(asset.id))
 }, [
  query,
  filterKind,
  selectedTag,
  source,
  sort,
  special,
  filterLifecycle,
  filterMimeType,
  filterMinWidth,
  filterMinHeight,
  filterMinDuration,
  filterMaxDuration,
  filterMinBytesMb,
  filterMaxBytesMb,
  explorerProject,
  activeCollectionId,
  manualCollections,
  refreshTick,
 ])

 useEffect(() => {
  writeVaultWorkspaceState({
   query,
   selectedTag,
   filterKind,
   source,
   sort,
   special,
   filterLifecycle,
   filterMimeType,
   filterMinWidth,
   filterMinHeight,
   filterMinDuration,
   filterMaxDuration,
   filterMinBytesMb,
   filterMaxBytesMb,
   viewMode,
   density,
   arrangeMode,
   visibleModules,
   moduleOrder,
  })
 }, [
  query,
  selectedTag,
  filterKind,
  source,
  sort,
  special,
  filterLifecycle,
  filterMimeType,
  filterMinWidth,
  filterMinHeight,
  filterMinDuration,
  filterMaxDuration,
  filterMinBytesMb,
  filterMaxBytesMb,
  viewMode,
  density,
  arrangeMode,
  visibleModules,
  moduleOrder,
 ])

 const selectedAsset = useMemo(
  () => allAssets.find((asset) => asset.id === selectedAssetIds[0]) || null,
  [allAssets, selectedAssetIds],
 )
 const rightsLicense = selectedAsset ? String(selectedAsset.metadata?.license || "") : ""
 const rightsSource = selectedAsset ? String(selectedAsset.metadata?.rightsSource || selectedAsset.metadata?.sourceAttribution || "") : ""
 const rightsExpiry = selectedAsset ? String(selectedAsset.metadata?.rightsExpiry || "") : ""
 const rightsRestrictions = selectedAsset ? String(selectedAsset.metadata?.rightsRestrictions || selectedAsset.metadata?.rights || "") : ""
 const comparePair = useMemo(
  () => resolveVaultComparePair({ selectedIds: selectedAssetIds, assets: allAssets }),
  [selectedAssetIds, allAssets],
 )
 const finderListRows = useMemo(() => visibleAssets.map((asset) => ({
  select: (
   <input
    type="checkbox"
    aria-label={`Select ${asset.name}`}
    checked={selectedAssetIds.includes(asset.id)}
    onChange={(event) => {
     const checked = event.target.checked
     setSelectedAssetIds((current) => checked
      ? Array.from(new Set([...current, asset.id]))
      : current.filter((id) => id !== asset.id))
     setSelectionAnchorId(asset.id)
    }}
   />
  ),
  preview: (
   <div className="h-10 w-16 overflow-hidden border-[2px] border-current">
    {asset.previewUrl || asset.url ? (
     <img src={asset.previewUrl || asset.url || undefined} alt="" className="h-full w-full object-cover" />
    ) : (
     <div className="flex h-full items-center justify-center">{assetIcon(asset)}</div>
    )}
   </div>
  ),
  name: <strong className="block max-w-[220px] truncate" title={asset.name}>{asset.name}</strong>,
  type: asset.kind.toUpperCase(),
  project: asset.projectName || "UNASSIGNED",
  source: asset.source.toUpperCase(),
  dimensions: typeof asset.metadata?.width === "number" && typeof asset.metadata?.height === "number"
   ? `${asset.metadata.width}×${asset.metadata.height}`
   : "—",
  duration: typeof asset.metadata?.durationSeconds === "number"
   ? `${Number(asset.metadata.durationSeconds).toFixed(1)}s`
   : "—",
  size: typeof asset.metadata?.byteSize === "number"
   ? formatVaultBytes(Number(asset.metadata.byteSize))
   : "—",
  lifecycle: String(asset.metadata?.lifecycle || "DRAFT"),
  updated: new Date(asset.updatedAt).toLocaleDateString(),
  assetId: asset.id,
 })), [visibleAssets, selectedAssetIds])
 const selectedVersionStack = useMemo(
  () => selectedAsset ? getVaultAssetVersionStack(selectedAsset.id) : [],
  [selectedAsset, refreshTick],
 )
 const selectedVersionRecord = useMemo(
  () => selectedAsset
   ? selectedVersionStack.find((version) => version.assetId === selectedAsset.id) || null
   : null,
  [selectedAsset, selectedVersionStack],
 )
 const selectedLineage = useMemo(
  () => selectedAsset ? getAssetLineage(selectedAsset.id) : [],
  [selectedAsset, refreshTick],
 )
 const selectedUsage = useMemo(
  () => selectedAsset ? getVaultAssetUsage(selectedAsset.id) : [],
  [selectedAsset, refreshTick],
 )
 const selectedSimilarAssets = useMemo(
  () => selectedAsset ? findVaultSimilarAssets(selectedAsset, 8) : [],
  [selectedAsset, refreshTick],
 )
 const selectedProject = useMemo(
  () => selectedAsset?.projectId
   ? brain.projects.find((project) => project.id === selectedAsset.projectId) || null
   : null,
  [selectedAsset, brain.projects],
 )
 const selectedReadiness = useMemo(
  () => selectedProject ? getVaultProjectReadiness({
   project: selectedProject,
   assets: allAssets.filter((asset) => asset.projectId === selectedProject.id),
  }) : null,
  [selectedProject, allAssets, refreshTick],
 )
 const selectedToolTargets = useMemo(
  () => selectedAsset ? getVaultAssetToolTargets(selectedAsset.kind) : [],
  [selectedAsset],
 )
 const selectedContentBuild = useMemo(
  () => selectedProject?.contentBuildId ? getContentBuild(selectedProject.contentBuildId) : null,
  [selectedProject],
 )
 const selectedYouTubeVideoId = useMemo(() => {
  if (!selectedAsset) return null
  const direct = resolveVaultTranscriptVideoId({
   asset: selectedAsset,
   contentBuildVideoId: selectedContentBuild?.youtube?.videoId || null,
  })
  if (direct) return direct
  for (const usage of selectedUsage) {
   const usageVideoId = getContentBuild(usage.contentBuildId)?.youtube?.videoId || null
   const resolved = resolveVaultTranscriptVideoId({
    asset: selectedAsset,
    contentBuildVideoId: usageVideoId,
   })
   if (resolved) return resolved
  }
  return null
 }, [selectedAsset, selectedContentBuild, selectedUsage])
 const activeCaptionAsset = useMemo(() => {
  if (!selectedAsset) return null
  if (selectedAsset.metadata?.captionFormat === "timed-lines") return selectedAsset
  if (selectedAsset.kind !== "video" && selectedAsset.kind !== "audio") return null
  return allAssets.find((asset) => (
   asset.metadata?.captionFormat === "timed-lines"
   && Array.isArray(asset.metadata?.parentAssetIds)
   && asset.metadata.parentAssetIds.includes(selectedAsset.id)
  )) || null
 }, [selectedAsset, allAssets])
 const captionSourceAsset = useMemo(() => {
  if (!selectedAsset) return null
  if (selectedAsset.kind === "video" || selectedAsset.kind === "audio") return selectedAsset
  if (selectedAsset.metadata?.captionFormat === "timed-lines" && Array.isArray(selectedAsset.metadata?.parentAssetIds)) {
   const parentId = selectedAsset.metadata.parentAssetIds.find((id): id is string => typeof id === "string")
   return parentId ? allAssets.find((asset) => asset.id === parentId) || null : null
  }
  return null
 }, [selectedAsset, allAssets])

 const availableTags = useMemo(
  () => Array.from(new Set([...CORE_TAGS, ...allAssets.flatMap((asset) => asset.tags || [])]))
   .sort((a, b) => a.localeCompare(b)),
  [allAssets],
 )

 useEffect(() => {
  const stored = activeCaptionAsset?.metadata?.captionLines
  if (Array.isArray(stored) && stored.length) {
   setCaptionLines(stored.filter((line): line is VaultCaptionLine => (
    Boolean(line)
    && typeof line === "object"
    && typeof (line as VaultCaptionLine).id === "string"
    && typeof (line as VaultCaptionLine).startMs === "number"
    && typeof (line as VaultCaptionLine).endMs === "number"
    && typeof (line as VaultCaptionLine).text === "string"
   )).map((line) => ({ ...line })))
   return
  }
  if (captionSourceAsset) {
   setCaptionLines([{ id: crypto.randomUUID(), startMs: 0, endMs: 3000, text: "" }])
   return
  }
  setCaptionLines([])
 }, [activeCaptionAsset?.id, captionSourceAsset?.id])

 const createManualCollection = () => {
  const name = manualCollectionName.trim()
  if (!name) return
  const collection = createVaultCollection(name)
  if (selectedAssetIds.length) addAssetsToVaultCollection(collection.id, selectedAssetIds)
  setManualCollectionName("")
  setActiveCollectionId(collection.id)
  setTargetCollectionId(collection.id)
  setManualCollectionRefresh((value) => value + 1)
 }

 const addSelectionToCollection = () => {
  if (!targetCollectionId || !selectedAssetIds.length) return
  addAssetsToVaultCollection(targetCollectionId, selectedAssetIds)
  setManualCollectionRefresh((value) => value + 1)
 }

 const removeSelectedAssetFromActiveCollection = () => {
  if (!activeCollectionId || !selectedAsset) return
  removeAssetFromVaultCollection(activeCollectionId, selectedAsset.id)
  setManualCollectionRefresh((value) => value + 1)
 }

 const makeBrandKit = (id: string) => {
  setVaultCollectionRole(id, "brand-kit")
  setManualCollectionRefresh((value) => value + 1)
 }

 const addSelectionToBrandKit = () => {
  if (!brandKit || !selectedAssetIds.length) return
  addAssetsToVaultCollection(brandKit.id, selectedAssetIds)
  setManualCollectionRefresh((value) => value + 1)
 }

 const removeManualCollection = (id: string) => {
  deleteVaultCollection(id)
  if (activeCollectionId === id) setActiveCollectionId(null)
  if (targetCollectionId === id) setTargetCollectionId("")
  setManualCollectionRefresh((value) => value + 1)
 }

 const saveSmartCollection = () => {
  const name = smartCollectionName.trim()
  if (!name) return
  createVaultSmartCollection({
   name,
   query,
   tags: selectedTag ? [selectedTag] : [],
   kind: filterKind,
   source,
  })
  setSmartCollectionName("")
  setCollectionRefresh((value) => value + 1)
 }

 const applySmartCollection = (collection: VaultSmartCollection) => {
  setQuery(collection.query)
  setSelectedTag(collection.tags[0] || null)
  setFilterKind(collection.kind)
  setSource(collection.source)
 }

 const removeSmartCollection = (id: string) => {
  deleteVaultSmartCollection(id)
  setCollectionRefresh((value) => value + 1)
 }

 useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
   const target = event.target as HTMLElement | null
   const isTyping = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable
   const command = resolveVaultKeyboardCommand({
    key: event.key,
    metaKey: event.metaKey,
    ctrlKey: event.ctrlKey,
   })
   if (!command) return
   if (isTyping && command !== "focus-search" && command !== "close-transient") return

   if (command === "focus-search") {
    event.preventDefault()
    searchInputRef.current?.focus()
    return
   }
   if (command === "project-selection" && selectedAssetIds.length) {
    event.preventDefault()
    selectionProjectInputRef.current?.focus()
    return
   }
   if (command === "toggle-quick-look" && selectedAsset) {
    event.preventDefault()
    setQuickLookOpen((open) => !open)
    return
   }
   if (command === "toggle-mute" && selectedAsset && (selectedAsset.kind === "video" || selectedAsset.kind === "audio")) {
    event.preventDefault()
    setQuickLookMuted((muted) => !muted)
    return
   }
   if (command === "close-transient") {
    setQuickLookOpen(false)
   }
  }
  window.addEventListener("keydown", handleKeyDown)
  return () => window.removeEventListener("keydown", handleKeyDown)
 }, [selectedAsset, selectedAssetIds.length])

 const createImportedRecord = (item: PendingVaultImport, mode: "direct" | "staged") => {
  return createImportedVaultAsset({
   name: item.name,
   kind: item.kind,
   projectName: importProject.trim() || null,
   toolId: "creator-vault-os",
   mimeType: item.mimeType,
   previewUrl: item.previewUrl,
   tags: item.tags,
   metadata: {
    ...item.metadata,
    byteSize: item.size,
    ingestSource: "vault-import-station",
    importMode: mode,
   },
  })
 }

 const stageFiles = async (files: FileList | null) => {
  if (!files?.length) return
  const prepared = await Promise.all(Array.from(files).map(async (file) => {
   const task = createVaultTask({
    type: "ingest-preflight",
    label: `Preflight · ${file.name}`,
    assetName: file.name,
    detail: "Queued for metadata, hash and preview extraction.",
   })
   setTaskRefresh((value) => value + 1)
   updateVaultTask(task.id, {
    status: "processing",
    progress: 20,
    detail: "Reading browser file metadata.",
   })
   setTaskRefresh((value) => value + 1)

   try {
    const exifTask = /^image\/(jpeg|jpg)$/i.test(file.type) || /\.jpe?g$/i.test(file.name)
     ? createVaultTask({
      type: "metadata",
      label: `EXIF · ${file.name}`,
      assetName: file.name,
      detail: "Queued for factual JPEG EXIF extraction.",
     })
     : null
    if (exifTask) {
     updateVaultTask(exifTask.id, {
      status: "processing",
      progress: 20,
      detail: "Reading EXIF metadata.",
     })
     setTaskRefresh((value) => value + 1)
    }

    const [metadata, contentHash, imagePreviewUrl, videoPreviewUrl, exif, perceptualHash, imagePalette] = await Promise.all([
     extractVaultFileMetadata(file),
     computeVaultFileHash(file),
     extractVaultImagePreview(file),
     extractVaultVideoThumbnail(file),
     extractVaultExifMetadata(file),
     computeVaultImagePerceptualHash(file),
     computeVaultImagePalette(file),
    ])
    const previewUrl = imagePreviewUrl || videoPreviewUrl

    if (exifTask) {
     updateVaultTask(exifTask.id, {
      status: "completed",
      progress: 100,
      detail: Object.keys(exif).length ? "EXIF metadata extracted." : "No EXIF metadata found.",
     })
     setTaskRefresh((value) => value + 1)
    }
    const duplicate = contentHash ? findVaultDuplicateByHash(contentHash) : null
    updateVaultTask(task.id, {
     status: "completed",
     progress: 100,
     detail: duplicate
      ? `Exact duplicate found: ${duplicate.name}`
      : "Metadata, content hash and preview are ready.",
    })
    setTaskRefresh((value) => value + 1)
    return createPendingVaultImport(
     file,
     importTags,
     crypto.randomUUID(),
     {
      ...metadata,
      contentHash,
      exifMake: exif.make || null,
      exifModel: exif.model || null,
      exifOrientation: exif.orientation || null,
      exifDateTime: exif.dateTime || null,
      exifDateTimeOriginal: exif.dateTimeOriginal || null,
      exifImageWidth: exif.imageWidth || exif.pixelWidth || null,
      exifImageHeight: exif.imageHeight || exif.pixelHeight || null,
      duplicateAssetId: duplicate?.id || null,
      duplicateAssetName: duplicate?.name || null,
     },
     previewUrl,
    )
   } catch (error) {
    updateVaultTask(task.id, {
     status: "failed",
     progress: 100,
     detail: error instanceof Error ? error.message : "Preflight failed.",
    })
    setTaskRefresh((value) => value + 1)
    return createPendingVaultImport(file, importTags)
   }
  }))
  if (importMode === "direct") {
   const duplicates = prepared.filter((item) => item.metadata.duplicateAssetId)
   const unique = prepared.filter((item) => !item.metadata.duplicateAssetId)
   unique.forEach((item) => createImportedRecord(item, "direct"))
   if (duplicates.length) {
    setPending((current) => [...current, ...duplicates])
   }
   setRefreshTick((value) => value + 1)
   return
  }
  setPending((current) => [...current, ...prepared])
 }

 const toggleImportTag = (tag: string) => {
  setImportTags((current) => (
   current.includes(tag) ? current.filter((value) => value !== tag) : [...current, tag]
  ))
 }

 const ingestOne = (item: PendingVaultImport) => {
  createImportedRecord(item, "staged")
  setPending((current) => current.filter((candidate) => candidate.id !== item.id))
  setRefreshTick((value) => value + 1)
 }

 const resolvePendingDuplicate = (item: PendingVaultImport) => {
  const duplicateId = typeof item.metadata.duplicateAssetId === "string"
   ? item.metadata.duplicateAssetId
   : ""
  if (!duplicateId) return
  const existing = allAssets.find((asset) => asset.id === duplicateId)
  if (!existing) return
  setPending((current) => current.filter((candidate) => candidate.id !== item.id))
  setSelectedAssetIds([duplicateId])
  setSelectionAnchorId(duplicateId)
  setRefreshTick((value) => value + 1)
 }

 const applyBatchTag = () => {
  const tag = batchTag.trim()
  if (!tag || !selectedAssetIds.length) return
  selectedAssetIds.forEach((assetId) => {
   const asset = allAssets.find((candidate) => candidate.id === assetId)
   if (!asset) return
   updateVaultAsset(asset.id, {
    tags: Array.from(new Set([...(asset.tags || []), tag])),
   })
  })
  setBatchTag("")
  setRefreshTick((value) => value + 1)
 }

 const applyBatchPrefix = () => {
  const prefix = batchPrefix.trim()
  if (!prefix || !selectedAssetIds.length) return
  selectedAssetIds.forEach((assetId) => {
   const asset = allAssets.find((candidate) => candidate.id === assetId)
   if (!asset) return
   updateVaultAsset(asset.id, { name: `${prefix}${asset.name}` })
  })
  setBatchPrefix("")
  setRefreshTick((value) => value + 1)
 }

 const isModuleVisible = (id: VaultWorkspaceModuleId) => visibleModules.includes(id)

 const toggleModuleVisibility = (id: VaultWorkspaceModuleId) => {
  setVisibleModules((current) => current.includes(id)
   ? current.filter((item) => item !== id)
   : [...current, id])
 }

 const moveModule = (id: VaultWorkspaceModuleId, direction: -1 | 1) => {
  setModuleOrder((current) => {
   const normalized = [...current, ...DEFAULT_VAULT_MODULE_ORDER.filter((item) => !current.includes(item))]
   const index = normalized.indexOf(id)
   const target = index + direction
   if (index < 0 || target < 0 || target >= normalized.length) return normalized
   const next = [...normalized]
   const [item] = next.splice(index, 1)
   next.splice(target, 0, item)
   return next
  })
 }

 const moduleStyle = (id: VaultWorkspaceModuleId): React.CSSProperties => ({
  order: moduleOrder.indexOf(id),
  display: isModuleVisible(id) ? undefined : "none",
 })

 const sendSelectedAssetToTool = (targetToolId: string) => {
  if (!selectedAsset) return
  const result = createVaultAssetHandoff({
   asset: selectedAsset,
   targetToolId,
   contentBuildId: selectedProject?.contentBuildId || null,
   projectId: selectedProject?.id || selectedAsset.projectId || null,
   channelId: channelIdentity.channelId || null,
  })
  navigate(result.route)
 }

 const resolveAssetYouTubeVideoId = (asset: VaultAsset): string | null => {
  const direct = asset.metadata?.youtubeVideoId || asset.metadata?.videoId
  if (typeof direct === "string" && direct.trim()) return direct.trim()
  const usage = getVaultAssetUsage(asset.id)
  for (const item of usage) {
   const videoId = getContentBuild(item.contentBuildId)?.youtube?.videoId
   if (videoId) return videoId
  }
  return null
 }

 const acquireTranscriptForAsset = async (asset: VaultAsset, taskId?: string | null) => {
  const videoId = resolveAssetYouTubeVideoId(asset)
  if (!videoId) return
  const result = await runVaultTranscriptTask({
   asset,
   videoId,
   taskId: taskId || null,
  })
  setTaskRefresh((value) => value + 1)
  setRefreshTick((value) => value + 1)
  if (result.asset) setSelectedAssetIds([result.asset.id])
 }

 const retryTask = async (taskId: string) => {
  const existing = getVaultTask(taskId)
  if (!existing) return
  if (existing.type === "transcript" && existing.targetAssetId) {
   const asset = allAssets.find((candidate) => candidate.id === existing.targetAssetId)
   if (!asset) return
   const videoId = resolveAssetYouTubeVideoId(asset)
   if (!videoId) return
   const retried = retryVaultTask(taskId)
   if (!retried) return
   setTaskRefresh((value) => value + 1)
   await acquireTranscriptForAsset(asset, taskId)
   return
  }
  const task = retryVaultTask(taskId)
  if (!task) return
  setTaskRefresh((value) => value + 1)
 }

 const patchCaptionLine = (id: string, patch: Partial<VaultCaptionLine>) => {
  setCaptionLines((current) => current.map((line) => line.id === id ? { ...line, ...patch, id } : line))
 }

 const addCaptionLine = () => {
  const previous = captionLines[captionLines.length - 1]
  const startMs = previous ? previous.endMs : 0
  setCaptionLines((current) => [...current, {
   id: crypto.randomUUID(),
   startMs,
   endMs: startMs + 3000,
   text: "",
  }])
 }

 const removeCaptionLine = (id: string) => {
  setCaptionLines((current) => current.filter((line) => line.id !== id))
 }

 const saveCaptionArtifact = () => {
  if (!captionSourceAsset || !captionLines.length) return
  if (activeCaptionAsset) {
   updateVaultAsset(activeCaptionAsset.id, {
    metadata: {
     ...(activeCaptionAsset.metadata || {}),
     captionFormat: "timed-lines",
     captionLines: captionLines.map((line) => ({ ...line })),
     transcriptText: captionLines.map((line) => line.text.trim()).filter(Boolean).join("\n"),
    },
   })
  } else {
   createCaptionAsset(captionSourceAsset, captionLines)
  }
  setRefreshTick((value) => value + 1)
 }

 const downloadCaptionText = (format: "srt" | "vtt") => {
  if (!captionLines.length) return
  const content = format === "srt" ? captionLinesToSrt(captionLines) : captionLinesToVtt(captionLines)
  const blob = new Blob([content], { type: format === "srt" ? "application/x-subrip" : "text/vtt" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  const baseName = (captionSourceAsset?.name || selectedAsset?.name || "captions").replace(/\.[^.]+$/, "")
  link.href = url
  link.download = `${baseName}.${format}`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
 }

 const createScriptFromTranscript = () => {
  const source = activeCaptionAsset || captionSourceAsset
  if (!source || !captionLines.length) return
  const script = transcriptToScriptAsset(source, captionLines)
  setRefreshTick((value) => value + 1)
  setSelectedAssetIds([script.id])
 }

 const createCustomField = () => {
  if (!customFieldName.trim()) return
  createVaultCustomField({ name: customFieldName, type: customFieldType })
  setCustomFieldName("")
  setCustomFieldRefresh((value) => value + 1)
 }

 const removeCustomField = (fieldId: string) => {
  deleteVaultCustomField(fieldId)
  setCustomFieldRefresh((value) => value + 1)
  setRefreshTick((value) => value + 1)
 }

 const updateCustomFieldValue = (
  asset: VaultAsset,
  fieldId: string,
  type: VaultCustomFieldType,
  rawValue: string | boolean,
 ) => {
  const value = type === "number"
   ? (rawValue === "" ? null : Number(rawValue))
   : type === "boolean"
    ? Boolean(rawValue)
    : rawValue
  setVaultCustomFieldValue(asset.id, fieldId, value)
  setRefreshTick((current) => current + 1)
 }

 const updateAssetRights = (
  asset: VaultAsset,
  patch: {
   license?: string
   rightsSource?: string
   rightsExpiry?: string
   rightsRestrictions?: string
  },
 ) => {
  const metadata = { ...(asset.metadata || {}) }
  for (const [key, value] of Object.entries(patch)) {
   const trimmed = String(value || "").trim()
   if (trimmed) metadata[key] = trimmed
   else delete metadata[key]
  }
  updateVaultAsset(asset.id, { metadata })
  setRefreshTick((value) => value + 1)
 }

 const updateAssetTitle = (asset: VaultAsset, nextName: string) => {
  const name = nextName.trim()
  if (!name || name === asset.name) return
  updateVaultAsset(asset.id, { name })
  setRefreshTick((value) => value + 1)
 }

 const addAssetTag = (asset: VaultAsset, rawTag: string) => {
  const tag = rawTag.trim()
  if (!tag) return
  updateVaultAsset(asset.id, {
   tags: Array.from(new Set([...(asset.tags || []), tag])),
  })
  setRefreshTick((value) => value + 1)
 }

 const removeAssetTag = (asset: VaultAsset, tag: string) => {
  updateVaultAsset(asset.id, {
   tags: (asset.tags || []).filter((value) => value !== tag),
  })
  setRefreshTick((value) => value + 1)
 }

 const updateAssetLifecycle = (asset: VaultAsset, lifecycle: VaultAssetLifecycle) => {
  setVaultAssetLifecycle(asset.id, lifecycle)
  setRefreshTick((value) => value + 1)
 }

 const toggleAssetProtection = (asset: VaultAsset) => {
  const lifecycle = String(asset.metadata?.lifecycle || "").toUpperCase()
  const isProtected = asset.metadata?.protected === true || (lifecycle === "GOLDEN" && asset.metadata?.protected !== false)
  setVaultAssetProtection(asset.id, !isProtected)
  setRefreshTick((value) => value + 1)
 }

 const assignAssetToProject = (asset: VaultAsset, projectId: string) => {
  if (!projectId) {
   updateVaultAsset(asset.id, { projectId: null, projectName: null })
   setRefreshTick((value) => value + 1)
   return
  }
  const project = brain.projects.find((candidate) => candidate.id === projectId)
  if (!project) return
  const identity = attachVaultAssetIdsToProject({
   project,
   assetIds: [asset.id],
   channelId: channelIdentity.channelId || null,
  })
  if (identity.project.contentBuildId !== project.contentBuildId) {
   updateProject(project.id, { contentBuildId: identity.project.contentBuildId })
  }
  updateVaultAsset(asset.id, {
   projectId: project.id,
   projectName: project.name,
  })
  setRefreshTick((value) => value + 1)
 }

 const toggleAssetFavorite = (asset: VaultAsset) => {
  setVaultAssetState(asset.id, { favorite: asset.metadata?.favorite !== true })
  setRefreshTick((value) => value + 1)
 }

 const archiveAsset = (asset: VaultAsset) => {
  const updated = setVaultAssetState(asset.id, { archived: true, trashed: false })
  if (!updated) return
  setSelectedAssetIds((current) => current.filter((id) => id !== asset.id))
  setRefreshTick((value) => value + 1)
 }

 const trashAsset = (asset: VaultAsset) => {
  const updated = setVaultAssetState(asset.id, { trashed: true, archived: false })
  if (!updated) return
  setSelectedAssetIds((current) => current.filter((id) => id !== asset.id))
  setRefreshTick((value) => value + 1)
 }

 const restoreAsset = (asset: VaultAsset) => {
  setVaultAssetState(asset.id, { archived: false, trashed: false })
  setRefreshTick((value) => value + 1)
 }

 const permanentlyDeleteAsset = (asset: VaultAsset) => {
  const accepted = typeof window === "undefined"
   ? false
   : window.confirm(`Permanently delete "${asset.name}"? This cannot be undone.`)
  if (!accepted) return
  if (!deleteVaultAsset(asset.id)) return
  setSelectedAssetIds((current) => current.filter((id) => id !== asset.id))
  setRefreshTick((value) => value + 1)
 }

 const replaceAssetPreview = async (asset: VaultAsset, file: File | null) => {
  if (!file) return
  const previewUrl = await extractVaultImagePreview(file)
  if (!previewUrl) return
  updateVaultAsset(asset.id, { previewUrl })
  setRefreshTick((value) => value + 1)
 }

 const updateAssetNotes = (asset: VaultAsset, notes: string) => {
  if (String(asset.metadata?.notes || "") === notes) return
  updateVaultAsset(asset.id, {
   metadata: {
    ...(asset.metadata || {}),
    notes,
   },
  })
  setRefreshTick((value) => value + 1)
 }

 const addChecklistItem = () => {
  const text = checklistText.trim()
  if (!text) return
  createVaultChecklistItem(text)
  setChecklistText("")
  setChecklistRefresh((value) => value + 1)
 }

 const toggleChecklistItem = (id: string) => {
  toggleVaultChecklistItem(id)
  setChecklistRefresh((value) => value + 1)
 }

 const removeChecklistItem = (id: string) => {
  deleteVaultChecklistItem(id)
  setChecklistRefresh((value) => value + 1)
 }

 const saveScratchpad = () => {
  if (!scratchpadTitle.trim() && !scratchpadContent.trim()) return
  createVaultScratchpad({
   title: scratchpadTitle,
   content: scratchpadContent,
  })
  setScratchpadTitle("")
  setScratchpadContent("")
  setScratchpadRefresh((value) => value + 1)
 }

 const removeScratchpad = (id: string) => {
  deleteVaultScratchpad(id)
  setScratchpadRefresh((value) => value + 1)
 }

 const downloadVaultText = (content: string, fileName: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
 }

 const exportVaultMetadata = (assets: VaultAsset[], format: "json" | "csv") => {
  if (!assets.length) return
  const date = new Date().toISOString().slice(0, 10)
  if (format === "json") {
   downloadVaultText(
    serializeVaultAssetsJson(assets),
    `viewtube-vault-metadata-${date}.json`,
    "application/json",
   )
   return
  }
  downloadVaultText(
   serializeVaultAssetsCsv(assets),
   `viewtube-vault-metadata-${date}.csv`,
   "text/csv;charset=utf-8",
  )
 }

 const exportSelectionManifest = () => {
  const selected = allAssets.filter((asset) => selectedAssetIds.includes(asset.id))
  if (!selected.length) return
  const manifest = createVaultSelectionManifest({
   assets: selected,
   usageByAssetId: Object.fromEntries(
    selected.map((asset) => [asset.id, getVaultAssetUsage(asset.id)]),
   ),
  })
  const blob = new Blob([serializeVaultSelectionManifest(manifest)], {
   type: "application/json",
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `viewtube-vault-selection-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
 }

 const toggleFavoriteSelection = () => {
  if (!selectedAssetIds.length) return
  const selected = allAssets.filter((asset) => selectedAssetIds.includes(asset.id))
  const shouldFavorite = selected.some((asset) => asset.metadata?.favorite !== true)
  selected.forEach((asset) => setVaultAssetState(asset.id, { favorite: shouldFavorite }))
  setRefreshTick((value) => value + 1)
 }

 const archiveSelection = () => {
  selectedAssetIds.forEach((id) => setVaultAssetState(id, { archived: true, trashed: false }))
  setSelectedAssetIds([])
  setRefreshTick((value) => value + 1)
 }

 const trashSelection = () => {
  selectedAssetIds.forEach((id) => setVaultAssetState(id, { trashed: true, archived: false }))
  setSelectedAssetIds([])
  setRefreshTick((value) => value + 1)
 }

 const restoreSelection = () => {
  selectedAssetIds.forEach((id) => setVaultAssetState(id, { archived: false, trashed: false }))
  setRefreshTick((value) => value + 1)
 }

 const detachSelectedVersion = () => {
  if (!selectedAsset || !selectedVersionRecord) return
  const detached = detachVaultAssetVersion(selectedAsset, {
   versionId: selectedVersionRecord.id,
  })
  setSelectedAssetIds([detached.id])
  setRefreshTick((value) => value + 1)
 }

 const attachSelectionToExistingProject = () => {
  const project = brain.projects.find((candidate) => candidate.id === existingProjectId)
  if (!project || !selectedAssetIds.length) return
  const identity = attachVaultAssetIdsToProject({
   project,
   assetIds: selectedAssetIds,
   channelId: channelIdentity.channelId || null,
  })
  if (identity.project.contentBuildId !== project.contentBuildId) {
   updateProject(project.id, { contentBuildId: identity.project.contentBuildId })
  }
  selectedAssetIds.forEach((assetId) => {
   updateVaultAsset(assetId, {
    projectId: project.id,
    projectName: project.name,
   })
  })
  setActiveProject(project.id)
  setRefreshTick((value) => value + 1)
 }

 const createProjectFromSelection = () => {
  const selected = allAssets.filter((asset) => selectedAssetIds.includes(asset.id))
  const projectName = selectionProjectName.trim()
  if (!selected.length || !projectName) return

  const draft = buildVaultSelectionProjectDraft({
   name: projectName,
   targetNiche: brain.targetNiche,
   assetNames: selected.map((asset) => asset.name),
  })

  const identity = initializeProjectContentIdentity(draft, {
   channelId: channelIdentity.channelId || null,
   sourceToolId: "creator-vault-os",
  })
  const project = identity.project

  selected.forEach((asset) => {
   attachAssetToContentBuild(identity.contentBuildId, asset.id, {
    toolId: "creator-vault-os",
    metadata: { source: "vault-selection-project" },
   })
   updateVaultAsset(asset.id, {
    projectId: project.id,
    projectName: project.name,
   })
  })

  addProject(project)
  setActiveProject(project.id)
  setSelectionProjectName("")
  setRefreshTick((value) => value + 1)
 }

 const applyBatchProject = () => {
  const projectName = batchProject.trim()
  if (!projectName || !selectedAssetIds.length) return
  selectedAssetIds.forEach((assetId) => {
   updateVaultAsset(assetId, { projectName })
  })
  setBatchProject("")
  setRefreshTick((value) => value + 1)
 }

 const patchPending = (id: string, patch: Partial<Omit<PendingVaultImport, "id">>) => {
  setPending((current) => current.map((item) => (
   item.id === id ? updatePendingVaultImport(item, patch) : item
  )))
 }

 const togglePendingTag = (id: string, tag: string) => {
  const item = pending.find((candidate) => candidate.id === id)
  if (!item) return
  const nextTags = item.tags.includes(tag)
   ? item.tags.filter((value) => value !== tag)
   : [...item.tags, tag]
  patchPending(id, { tags: Array.from(new Set(nextTags)) })
 }

 const addPendingTag = (id: string, rawTag: string) => {
  const tag = rawTag.trim()
  if (!tag) return
  const item = pending.find((candidate) => candidate.id === id)
  if (!item) return
  patchPending(id, { tags: Array.from(new Set([...item.tags, tag])) })
 }

 const rejectPending = (id: string) => {
  setPending((current) => current.filter((item) => item.id !== id))
 }

 const ingestAll = () => {
  pending.forEach((item) => {
   createImportedRecord(item, "staged")
  })
  setPending([])
  setRefreshTick((value) => value + 1)
 }

 return (
  <main
   onDragOver={(event) => {
    if (event.dataTransfer?.types?.includes("Files")) event.preventDefault()
   }}
   onDrop={(event) => {
    if (!event.dataTransfer?.files?.length) return
    event.preventDefault()
    void stageFiles(event.dataTransfer.files)
   }}
   className={density === "compact"
   ? "mx-auto flex w-full max-w-[1800px] flex-col gap-2 p-2 sm:p-3 lg:p-4"
   : "mx-auto flex w-full max-w-[1800px] flex-col gap-4 p-3 sm:p-4 lg:p-6"}>
   <Toolbox
    title="ViewTube Vault"
    subtitle="Canonical creator assets, intake, organization, inspection, and cross-tool reuse."
    icon={<Archive />}
    paletteIndex={7}
    collapsible
    isOpenInitial
    persistenceId="creator-vault-production"
    contentClassName="p-3 sm:p-4"
   >
    <SubToolbox
     title="Workspace Controls"
     subtitle="Density, module visibility, and Arrange Mode"
     icon={<Filter />}
     paletteIndex={5}
     isOpenInitial={false}
     persistenceId="vault-workspace-controls"
    >
     <div className="flex flex-col gap-3">
      <SubToolboxSegmentedToggle
       level="l1"
       ariaLabel="Vault workspace density"
       value={density}
       onValueChange={(value) => setDensity(value as VaultWorkspaceDensity)}
       options={[
        { value: "comfortable", label: "COMFORTABLE" },
        { value: "compact", label: "COMPACT" },
       ]}
      />
      <SubToolboxInnerActionButton
       label={arrangeMode ? "Exit Arrange Mode" : "Enter Arrange Mode"}
       iconName="layers"
       tone={arrangeMode ? "pink" : "cyan"}
       onClick={() => setArrangeMode((current) => !current)}
      />
      <div className="flex flex-col gap-2">
       {DEFAULT_VAULT_MODULE_ORDER.map((id) => (
        <div key={id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
         <SubToolboxInnerActionButton
          label={`${isModuleVisible(id) ? "Hide" : "Show"} · ${VAULT_MODULE_LABELS[id]}`}
          iconName={isModuleVisible(id) ? "eye-off" : "plus"}
          tone={isModuleVisible(id) ? "cyan" : "green"}
          onClick={() => toggleModuleVisibility(id)}
         />
         {arrangeMode ? (
          <div className="grid grid-cols-2 gap-1">
           <SubToolboxInnerActionButton
            label="↑"
            iconName="layers"
            tone="yellow"
            onClick={() => moveModule(id, -1)}
           />
           <SubToolboxInnerActionButton
            label="↓"
            iconName="layers"
            tone="yellow"
            onClick={() => moveModule(id, 1)}
           />
          </div>
         ) : null}
        </div>
       ))}
      </div>
     </div>
    </SubToolbox>

    <div className={density === "compact"
     ? "grid grid-cols-1 gap-2 xl:grid-cols-[minmax(220px,0.72fr)_minmax(0,2.1fr)_minmax(260px,0.9fr)]"
     : "grid grid-cols-1 gap-4 xl:grid-cols-[minmax(220px,0.72fr)_minmax(0,2.1fr)_minmax(260px,0.9fr)]"}>
     <div className="flex min-w-0 flex-col gap-4">
      <SubToolbox
       style={moduleStyle("navigator" as VaultWorkspaceModuleId)}
       title="Navigator"
       subtitle="Library views and smart filters"
       icon={<Filter />}
       paletteIndex={8}
       isOpenInitial
       persistenceId="vault-navigator"
      >
       <div className="flex flex-col gap-3">
        <SubToolboxSegmentedToggle
         level="l1"
         ariaLabel="Vault view"
         value={viewMode}
         onValueChange={(value) => setViewMode(value as VaultWorkspaceViewMode)}
         options={[
          { value: "grid", label: "GRID" },
          { value: "masonry", label: "MASONRY" },
          { value: "list", label: "LIST" },
          { value: "timeline", label: "TIMELINE" },
         ]}
        />
        <SubToolboxDropdownControl
         label="Asset kind"
         value={filterKind}
         onChange={(value) => setFilterKind(value as "all" | VaultAssetKind)}
         options={["all", "image", "video", "audio", "document", "font", "template", "generated", "other"]}
        />
        <SubToolboxSegmentedToggle
         level="l1"
         ariaLabel="Vault library state"
         value={special}
         onValueChange={(value) => setSpecial(value as typeof special)}
         options={[
          { value: "active", label: "LIBRARY" },
          { value: "inbox", label: "INBOX" },
          { value: "favorites", label: "FAVORITES" },
          { value: "archive", label: "ARCHIVE" },
          { value: "trash", label: "TRASH" },
         ]}
        />
        <SubToolboxDropdownControl
         label="Source"
         value={source}
         onChange={(value) => setSource(value as typeof source)}
         options={["all", "local", "drive", "generated", "project", "imported"]}
        />
        <SubToolboxDropdownControl
         label="Sort"
         value={sort}
         onChange={(value) => setSort(value as VaultWorkspaceSort)}
         options={["updated-desc", "updated-asc", "name-asc", "name-desc"]}
        />
        <SubToolboxInnerActionButton
         label={selectedTag ? `Clear Tag: ${selectedTag}` : "All Spectrum Tags"}
         iconName="tag"
         tone="cyan"
         onClick={() => setSelectedTag(null)}
        />
        <details className="border-t-[3px] border-current pt-3">
         <summary className="cursor-pointer text-xs font-black uppercase">Advanced Metadata Filters</summary>
         <div className="mt-3 flex flex-col gap-2">
          <SubToolboxDropdownControl
           label="Lifecycle"
           value={filterLifecycle}
           onChange={setFilterLifecycle}
           options={["all", "DRAFT", "CANDIDATE", "APPROVED", "FINAL", "GOLDEN", "SUPERSEDED", "ARCHIVED", "TRASHED"]}
          />
          <SubToolboxInput
           value={filterMimeType}
           onChange={(event) => setFilterMimeType(event.target.value)}
           placeholder="MIME TYPE · video/mp4"
           aria-label="Vault MIME type filter"
          />
          <div className="grid grid-cols-2 gap-2">
           <SubToolboxInput
            type="number"
            min={0}
            value={filterMinWidth}
            onChange={(event) => setFilterMinWidth(event.target.value)}
            placeholder="MIN WIDTH"
            aria-label="Minimum asset width"
           />
           <SubToolboxInput
            type="number"
            min={0}
            value={filterMinHeight}
            onChange={(event) => setFilterMinHeight(event.target.value)}
            placeholder="MIN HEIGHT"
            aria-label="Minimum asset height"
           />
          </div>
          <div className="grid grid-cols-2 gap-2">
           <SubToolboxInput
            type="number"
            min={0}
            step="0.1"
            value={filterMinDuration}
            onChange={(event) => setFilterMinDuration(event.target.value)}
            placeholder="MIN DURATION S"
            aria-label="Minimum asset duration seconds"
           />
           <SubToolboxInput
            type="number"
            min={0}
            step="0.1"
            value={filterMaxDuration}
            onChange={(event) => setFilterMaxDuration(event.target.value)}
            placeholder="MAX DURATION S"
            aria-label="Maximum asset duration seconds"
           />
          </div>
          <div className="grid grid-cols-2 gap-2">
           <SubToolboxInput
            type="number"
            min={0}
            step="0.1"
            value={filterMinBytesMb}
            onChange={(event) => setFilterMinBytesMb(event.target.value)}
            placeholder="MIN SIZE MB"
            aria-label="Minimum asset size megabytes"
           />
           <SubToolboxInput
            type="number"
            min={0}
            step="0.1"
            value={filterMaxBytesMb}
            onChange={(event) => setFilterMaxBytesMb(event.target.value)}
            placeholder="MAX SIZE MB"
            aria-label="Maximum asset size megabytes"
           />
          </div>
          <SubToolboxInnerActionButton
           label="Clear Metadata Filters"
           iconName="x"
           tone="cyan"
           onClick={() => {
            setFilterLifecycle("all")
            setFilterMimeType("")
            setFilterMinWidth("")
            setFilterMinHeight("")
            setFilterMinDuration("")
            setFilterMaxDuration("")
            setFilterMinBytesMb("")
            setFilterMaxBytesMb("")
           }}
          />
         </div>
        </details>
        <StandardInput
         value={smartCollectionName}
         onChange={(event) => setSmartCollectionName(event.target.value)}
         placeholder="Name current smart filter"
         aria-label="Smart collection name"
        />
        <SubToolboxInnerActionButton
         label="Save Smart Collection"
         iconName="collection"
         tone="green"
         onClick={saveSmartCollection}
         disabled={!smartCollectionName.trim()}
        />
        {smartCollections.length ? (
         <div className="flex flex-col gap-2">
          {smartCollections.map((collection) => (
           <div key={collection.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
            <SubToolboxInnerActionButton
             label={collection.name}
             iconName="collection"
             tone="cyan"
             onClick={() => applySmartCollection(collection)}
            />
            <SubToolboxInnerActionButton
             label="×"
             iconName="x"
             tone="pink"
             onClick={() => removeSmartCollection(collection.id)}
            />
           </div>
          ))}
         </div>
        ) : null}
       </div>
      </SubToolbox>

      <SubToolbox
       style={moduleStyle("explorer" as VaultWorkspaceModuleId)}
       title="Explorer"
       subtitle="Logical project views over canonical Vault assets"
       icon={<Archive />}
       paletteIndex={7}
       isOpenInitial
       persistenceId="vault-explorer"
      >
       <div className="flex flex-col gap-2">
        <SubToolboxInnerActionButton
         label={`All Assets · ${allAssets.length}`}
         iconName="collection"
         tone={explorerProject === "all" ? "pink" : "cyan"}
         onClick={() => {
          setActiveCollectionId(null)
          setExplorerProject("all")
         }}
        />
        {explorerGroups.unassignedCount ? (
         <SubToolboxInnerActionButton
          label={`Unassigned · ${explorerGroups.unassignedCount}`}
          iconName="collection"
          tone={explorerProject === "unassigned" ? "pink" : "cyan"}
          onClick={() => {
           setActiveCollectionId(null)
           setExplorerProject("unassigned")
          }}
         />
        ) : null}
        {explorerGroups.projects.map((project) => (
         <SubToolboxInnerActionButton
          key={project.name}
          label={`${project.name} · ${project.count}`}
          iconName="collection"
          tone={explorerProject === project.name ? "pink" : "cyan"}
          onClick={() => {
           setActiveCollectionId(null)
           setExplorerProject(project.name)
          }}
         />
        ))}
        <div className="mt-2 border-t-[3px] border-current pt-3">
         <div className="mb-2 text-xs font-black uppercase opacity-60">Collections</div>
         {brandKit ? (
          <div className="mb-3 flex flex-col gap-2">
           <SubToolboxInnerActionButton
            label={`Brand Kit · ${brandKit.assetIds.length}`}
            iconName="sparkles"
            tone={activeCollectionId === brandKit.id ? "pink" : "yellow"}
            onClick={() => setActiveCollectionId(brandKit.id)}
           />
           <SubToolboxInnerActionButton
            label="Add Selection to Brand Kit"
            iconName="plus"
            tone="green"
            onClick={addSelectionToBrandKit}
            disabled={!selectedAssetIds.length}
           />
          </div>
         ) : null}
         <SubToolboxInnerActionButton
          label="All Collections / Clear Filter"
          iconName="collection"
          tone={!activeCollectionId ? "pink" : "cyan"}
          onClick={() => setActiveCollectionId(null)}
         />
         {manualCollections.map((collection) => (
          <div key={collection.id} className="flex flex-col gap-1">
           <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
            <SubToolboxInnerActionButton
             label={`${collection.role === "brand-kit" ? "★ " : ""}${collection.name} · ${collection.assetIds.length}`}
             iconName="collection"
             tone={activeCollectionId === collection.id ? "pink" : collection.role === "brand-kit" ? "yellow" : "cyan"}
             onClick={() => setActiveCollectionId(collection.id)}
            />
            <SubToolboxInnerActionButton
             label="×"
             iconName="x"
             tone="pink"
             onClick={() => removeManualCollection(collection.id)}
            />
           </div>
           {collection.role !== "brand-kit" ? (
            <SubToolboxInnerActionButton
             label="Set as Brand Kit"
             iconName="sparkles"
             tone="yellow"
             onClick={() => makeBrandKit(collection.id)}
            />
           ) : null}
          </div>
         ))}
        </div>
       </div>
      </SubToolbox>

      <SubToolbox
       style={moduleStyle("workspace-notes" as VaultWorkspaceModuleId)}
       title="Workspace Notes"
       subtitle="Saved Vault scratchpads that do not become assets or Brain memory"
       icon={<FileText />}
       paletteIndex={6}
       isOpenInitial={false}
       persistenceId="vault-workspace-notes"
      >
       <div className="flex flex-col gap-3">
        <StandardInput
         value={scratchpadTitle}
         onChange={(event) => setScratchpadTitle(event.target.value)}
         placeholder="Note title"
         aria-label="Vault note title"
        />
        <SubToolboxTextArea
         value={scratchpadContent}
         onChange={(event) => setScratchpadContent(event.target.value)}
         placeholder="Write a Vault workspace note…"
         aria-label="Vault note content"
         rows={4}
        />
        <SubToolboxInnerActionButton
         label="Save Workspace Note"
         iconName="archive"
         tone="yellow"
         onClick={saveScratchpad}
         disabled={!scratchpadTitle.trim() && !scratchpadContent.trim()}
        />
        {scratchpads.map((note) => (
         <div key={note.id} className="flex flex-col gap-2">
          <div className="text-sm font-black uppercase">{note.title}</div>
          <div className="whitespace-pre-wrap text-xs font-bold opacity-70">{note.content}</div>
          <SubToolboxInnerActionButton
           label="Delete Note"
           iconName="eye-off"
           tone="pink"
           onClick={() => removeScratchpad(note.id)}
          />
         </div>
        ))}
        <div className="mt-2 border-t-[3px] border-current pt-3">
         <div className="mb-2 text-xs font-black uppercase opacity-60">Workspace Checklist</div>
         <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
          <StandardInput
           value={checklistText}
           onChange={(event) => setChecklistText(event.target.value)}
           placeholder="Add checklist item"
           aria-label="Vault checklist item"
           onKeyDown={(event) => {
            if (event.key === "Enter") addChecklistItem()
           }}
          />
          <SubToolboxInnerActionButton
           label="+"
           iconName="plus"
           tone="green"
           onClick={addChecklistItem}
           disabled={!checklistText.trim()}
          />
         </div>
         <div className="mt-2 flex flex-col gap-2">
          {checklistItems.map((item) => (
           <div key={item.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
            <button
             type="button"
             aria-label={item.done ? "Mark checklist item incomplete" : "Mark checklist item complete"}
             onClick={() => toggleChecklistItem(item.id)}
             className="text-lg font-black"
            >
             {item.done ? "☒" : "☐"}
            </button>
            <div className={item.done ? "text-xs font-bold line-through opacity-45" : "text-xs font-bold"}>
             {item.text}
            </div>
            <SubToolboxInnerActionButton
             label="×"
             iconName="x"
             tone="pink"
             onClick={() => removeChecklistItem(item.id)}
            />
           </div>
          ))}
         </div>
        </div>
       </div>
      </SubToolbox>

      <SubToolbox
       style={moduleStyle("spectrum-tags" as VaultWorkspaceModuleId)}
       title="Spectrum Tags"
       subtitle="Canonical alphabetical spectrum labels"
       icon={<Database />}
       paletteIndex={9}
       isOpenInitial
       persistenceId="vault-spectrum-tags"
      >
       <div className="flex flex-wrap gap-2">
        {availableTags.map((tag) => (
         <button
          key={tag}
          type="button"
          aria-pressed={selectedTag === tag}
          onClick={() => setSelectedTag((current) => current === tag ? null : tag)}
          className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
         >
          <SubToolboxAlphabeticalTag
           level="l2"
           label={tag}
           spectrumKey={tag}
           className={selectedTag === tag ? "is-selected" : ""}
          />
         </button>
        ))}
       </div>
      </SubToolbox>
     </div>

     <div className="flex min-w-0 flex-col gap-4">
      <SubToolbox
       style={moduleStyle("asset-library" as VaultWorkspaceModuleId)}
       title="Asset Library"
       subtitle="Search, select, preview, and organize canonical Vault assets"
       icon={<Search />}
       paletteIndex={10}
       isOpenInitial
       persistenceId="vault-asset-library"
      >
       <div className="flex flex-col gap-3">
        <SubToolboxSplitField
         level="l1"
         variant="search"
         icon={<Search />}
         inputProps={{
          ref: searchInputRef,
          value: query,
          onChange: (event) => setQuery(event.target.value),
          placeholder: "Search names, projects, tags, kinds, and metadata…",
          "aria-label": "Search Vault assets",
         }}
        />
        {comparePair ? (
         <div>
          <div className="mb-2 text-xs font-black uppercase opacity-60">Compare Selection</div>
          <div className="flex gap-3 overflow-x-auto pb-2">
           {comparePair.map((asset, index) => (
            <div key={asset.id} className="min-w-[260px] flex-1 border-[3px] border-current p-2">
             <div className="mb-2 text-xs font-black uppercase opacity-60">
              {index === 0 ? "A" : "B"} · {asset.kind.toUpperCase()}
             </div>
             <div className="text-sm font-black uppercase">{asset.name}</div>
             <div className="mt-2 aspect-video overflow-hidden border-[3px] border-current">
              {asset.previewUrl || asset.url ? (
               <img
                src={asset.previewUrl || asset.url || undefined}
                alt=""
                className="h-full w-full object-cover"
               />
              ) : (
               <div className="flex h-full items-center justify-center">{assetIcon(asset)}</div>
              )}
             </div>
             <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] font-bold">
              <div>
               <div className="font-black uppercase opacity-60">Project</div>
               <div>{asset.projectName || "UNASSIGNED"}</div>
              </div>
              <div>
               <div className="font-black uppercase opacity-60">Source</div>
               <div>{asset.source.toUpperCase()}</div>
              </div>
              <div>
               <div className="font-black uppercase opacity-60">Dimensions</div>
               <div>
                {typeof asset.metadata?.width === "number" && typeof asset.metadata?.height === "number"
                 ? `${asset.metadata.width}×${asset.metadata.height}`
                 : "—"}
               </div>
              </div>
              <div>
               <div className="font-black uppercase opacity-60">Size</div>
               <div>
                {typeof asset.metadata?.byteSize === "number"
                 ? formatVaultBytes(Number(asset.metadata.byteSize))
                 : "—"}
               </div>
              </div>
             </div>
             <div className="mt-2 flex flex-wrap gap-1">
              {(asset.tags || []).map((tag) => (
               <SubToolboxAlphabeticalTag key={tag} level="l2" label={tag} spectrumKey={tag} />
              ))}
             </div>
            </div>
           ))}
          </div>
         </div>
        ) : null}
        {comparePair
         && comparePair.every((asset) => asset.kind === "image" && (asset.previewUrl || asset.url)) ? (
         <div>
          <div className="mb-2 text-xs font-black uppercase opacity-60">Before / After</div>
          <div className="relative aspect-video overflow-hidden border-[3px] border-current">
           <img
            src={comparePair[0].previewUrl || comparePair[0].url || undefined}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
           />
           <img
            src={comparePair[1].previewUrl || comparePair[1].url || undefined}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{ clipPath: `inset(0 ${100 - compareReveal}% 0 0)` }}
           />
           <div
            aria-hidden="true"
            className="absolute inset-y-0 w-[3px] bg-current"
            style={{ left: `calc(${compareReveal}% - 1px)` }}
           />
          </div>
          <SubToolboxInput
           type="range"
           min={0}
           max={100}
           value={compareReveal}
           aria-label="Before after reveal"
           onChange={(event) => setCompareReveal(Number(event.target.value))}
          />
         </div>
        ) : null}
        {visibleAssets.length ? (
         viewMode === "list" ? (
          <div className="overflow-x-auto">
           <div className="min-w-[1080px]">
            <SubToolboxDataTable
             level="l1"
             columns={[
              { key: "select", label: "" },
              { key: "preview", label: "PREVIEW" },
              { key: "name", label: "NAME" },
              { key: "type", label: "TYPE" },
              { key: "project", label: "PROJECT" },
              { key: "source", label: "SOURCE" },
              { key: "dimensions", label: "DIMENSIONS" },
              { key: "duration", label: "DURATION" },
              { key: "size", label: "SIZE" },
              { key: "lifecycle", label: "LIFECYCLE" },
              { key: "updated", label: "UPDATED" },
             ]}
             rows={finderListRows}
             getRowKey={(row) => String(row.assetId)}
            />
           </div>
          </div>
         ) : (
         <div className={viewMode === "grid"
          ? "grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-3"
          : viewMode === "masonry"
           ? "columns-1 gap-3 sm:columns-2 2xl:columns-3"
           : "flex flex-col gap-4 border-l-[4px] border-current pl-4"}
         >
          {visibleAssets.map((asset) => (
           <SubToolboxVaultAsset
            key={asset.id}
            level="l1"
            className={viewMode === "masonry" ? "mb-3 break-inside-avoid" : undefined}
            kind={vaultCardKind(asset)}
            title={(
             <StandardInput
              defaultValue={asset.name}
              aria-label={`Edit title for ${asset.name}`}
              onBlur={(event) => updateAssetTitle(asset, event.target.value)}
              onKeyDown={(event) => {
               if (event.key === "Enter") event.currentTarget.blur()
              }}
             />
            )}
            preview={(asset.previewUrl || asset.url) ? (
             <img
              src={asset.previewUrl || asset.url || undefined}
              alt=""
              className="h-full w-full object-cover"
             />
            ) : assetIcon(asset)}
            selected={selectedAssetIds.includes(asset.id)}
            onClickCapture={(event) => {
             selectionShiftRef.current = event.shiftKey
            }}
            onSelectedChange={(selected) => {
             const next = resolveVaultSelection({
              visibleIds: visibleAssets.map((item) => item.id),
              selectedIds: selectedAssetIds,
              clickedId: asset.id,
              nextSelected: selected,
              anchorId: selectionAnchorId,
              shiftKey: selectionShiftRef.current,
             })
             selectionShiftRef.current = false
             setSelectedAssetIds(next.selectedIds)
             setSelectionAnchorId(next.anchorId)
            }}
            tags={(
             <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-1">
               {(asset.tags || []).map((tag) => (
                <button
                 key={tag}
                 type="button"
                 aria-label={`Remove tag ${tag}`}
                 onClick={() => removeAssetTag(asset, tag)}
                >
                 <SubToolboxAlphabeticalTag
                  level="l2"
                  label={`× ${tag}`}
                  spectrumKey={tag}
                 />
                </button>
               ))}
              </div>
              {selectedAssetIds.includes(asset.id) ? (
               <StandardInput
                placeholder="+ TAG"
                aria-label={`Add tag to ${asset.name}`}
                onKeyDown={(event) => {
                 if (event.key !== "Enter") return
                 event.preventDefault()
                 addAssetTag(asset, event.currentTarget.value)
                 event.currentTarget.value = ""
                }}
               />
              ) : null}
             </div>
            )}
            notes={(
             <div className="flex flex-col gap-2">
              <div className="text-xs font-black uppercase opacity-60">
               {viewMode === "timeline"
                ? `${new Date(asset.createdAt).toLocaleString()} · ${asset.kind.toUpperCase()} · ${asset.projectName || "UNASSIGNED"}`
                : `${asset.kind.toUpperCase()} · ${asset.projectName || "UNASSIGNED"}`}
              </div>
              {selectedAssetIds.includes(asset.id) ? (
               <>
                {activeCollectionId
                 && manualCollections.find((collection) => collection.id === activeCollectionId)?.assetIds.includes(asset.id) ? (
                 <SubToolboxInnerActionButton
                  label="Remove from Collection"
                  iconName="x"
                  tone="pink"
                  onClick={removeSelectedAssetFromActiveCollection}
                 />
                ) : null}
                <SubToolboxSelect
                 value={asset.projectId || ""}
                 aria-label="Asset project assignment"
                 onChange={(event) => assignAssetToProject(asset, event.target.value)}
                >
                 <option value="">UNASSIGNED</option>
                 {brain.projects.map((project) => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                 ))}
                </SubToolboxSelect>
                <SubToolboxSelect
                 value={String(asset.metadata?.lifecycle || "DRAFT")}
                 aria-label="Asset lifecycle"
                 onChange={(event) => updateAssetLifecycle(asset, event.target.value as VaultAssetLifecycle)}
                >
                 {["DRAFT", "CANDIDATE", "APPROVED", "FINAL", "GOLDEN", "SUPERSEDED"].map((value) => (
                  <option key={value} value={value}>{value}</option>
                 ))}
                </SubToolboxSelect>
                <SubToolboxInnerActionButton
                 label={(asset.metadata?.protected === true || (String(asset.metadata?.lifecycle || "").toUpperCase() === "GOLDEN" && asset.metadata?.protected !== false))
                  ? "Unlock Protected Asset"
                  : "Protect Asset"}
                 iconName="checklist"
                 tone="purple"
                 onClick={() => toggleAssetProtection(asset)}
                />
                <div className="grid grid-cols-2 gap-2">
                 <SubToolboxInnerActionButton
                  label={asset.metadata?.favorite === true ? "Unfavorite" : "Favorite"}
                  iconName="sparkles"
                  tone="orange"
                  onClick={() => toggleAssetFavorite(asset)}
                  aria-label="Toggle asset favorite"
                 />
                 {special === "archive" ? (
                  <SubToolboxInnerActionButton
                   label="Restore from Archive"
                   iconName="archive"
                   tone="green"
                   onClick={() => restoreAsset(asset)}
                  />
                 ) : special === "trash" ? (
                  <SubToolboxInnerActionButton
                   label="Restore from Trash"
                   iconName="archive"
                   tone="green"
                   onClick={() => restoreAsset(asset)}
                  />
                 ) : (
                  <SubToolboxInnerActionButton
                   label="Archive"
                   iconName="archive"
                   tone="cyan"
                   onClick={() => archiveAsset(asset)}
                   aria-label="Archive asset"
                  />
                 )}
                </div>
                {special === "trash" ? (
                 <SubToolboxInnerActionButton
                  label="Delete Permanently"
                  iconName="x"
                  tone="pink"
                  onClick={() => permanentlyDeleteAsset(asset)}
                 />
                ) : (
                 <SubToolboxInnerActionButton
                  label="Move to Trash"
                  iconName="x"
                  tone="pink"
                  onClick={() => trashAsset(asset)}
                 />
                )}
                <SubToolboxInput
                 type="file"
                 accept="image/*"
                 aria-label={`Replace preview for ${asset.name}`}
                 title="Replace Preview"
                 onChange={(event) => {
                  const file = event.currentTarget.files?.[0] || null
                  void replaceAssetPreview(asset, file)
                  event.currentTarget.value = ""
                 }}
                />
                <span className="text-[10px] font-black uppercase opacity-60">Replace Preview</span>
                <SubToolboxTextArea
                 height="compact"
                 defaultValue={String(asset.metadata?.notes || "")}
                 placeholder="Add notes…"
                 aria-label={`Notes for ${asset.name}`}
                 onBlur={(event) => updateAssetNotes(asset, event.target.value)}
                />
               </>
              ) : (
               <div className="text-[10px] font-black uppercase opacity-50">SELECT TO EDIT DETAILS</div>
              )}
             </div>
            )}
           />
          ))}
         </div>
         )
        ) : (
         <SubToolboxStatePanel
          level="l1"
          state={allAssets.length ? "filtered-empty" : "empty"}
          message={allAssets.length
           ? "No Vault assets match the current search and filters."
           : "No Vault assets yet. Use Import Station to stage your first batch."}
         />
        )}
       </div>
      </SubToolbox>

      <SubToolbox
       style={moduleStyle("import-station" as VaultWorkspaceModuleId)}
       title="Import Station"
       subtitle="Stage multiple files before creating canonical Vault records"
       icon={<UploadCloud />}
       paletteIndex={11}
       isOpenInitial
       persistenceId="vault-import-station"
      >
       <div className="mb-4">
        <SubToolboxSegmentedToggle
         level="l1"
         ariaLabel="Import mode"
         value={importMode}
         onValueChange={(value) => setImportMode(value as "direct" | "staged")}
         options={[
          { value: "direct", label: "DIRECT" },
          { value: "staged", label: "STAGED" },
         ]}
        />
       </div>
       <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(260px,0.9fr)]">
        <SubToolboxFileTarget
         level="l1"
         multiple
         minHeight={180}
         icon={<UploadCloud />}
         label={importMode === "direct" ? "DROP OR CHOOSE · IMPORT DIRECTLY" : "DROP OR CHOOSE · REVIEW IN STAGING"}
         onFiles={stageFiles}
        />
        <div className="flex min-w-0 flex-col gap-3">
         <StandardInput
          value={importProject}
          onChange={(event) => setImportProject(event.target.value)}
          placeholder="Optional project name"
          aria-label="Import project name"
         />
         <div>
          <div className="mb-2 text-xs font-black uppercase tracking-wide">Import Spectrum Tags</div>
          <div className="flex flex-wrap gap-2">
           {CORE_TAGS.map((tag) => (
            <button
             key={tag}
             type="button"
             aria-pressed={importTags.includes(tag)}
             onClick={() => toggleImportTag(tag)}
             className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            >
             <SubToolboxAlphabeticalTag
              level="l2"
              label={importTags.includes(tag) ? `× ${tag}` : `+ ${tag}`}
              spectrumKey={tag}
             />
            </button>
           ))}
          </div>
         </div>
         <SubToolboxInnerActionButton
          label={pending.length ? `Ingest All (${pending.length})` : "Ingest All"}
          iconName="database"
          tone="green"
          onClick={ingestAll}
          disabled={!pending.length}
         />
        </div>
       </div>

       <div className="mt-4 flex flex-col gap-2">
        {pending.length ? pending.map((item) => (
         <div key={item.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0 flex flex-col gap-2">
           {item.previewUrl ? (
            <SubToolboxMediaInspector
             level="l1"
             title="Staged Preview"
             poster={item.previewUrl}
             items={[
              { label: "TYPE", value: item.kind.toUpperCase() },
              { label: "STATUS", value: item.metadata.duplicateAssetId ? "DUPLICATE REVIEW" : "READY" },
             ]}
            />
           ) : null}
           <StandardInput
            value={item.name}
            onChange={(event) => patchPending(item.id, { name: event.target.value })}
            aria-label={`Pending asset name ${item.name}`}
           />
           <SubToolboxDropdownControl
            label="Type"
            value={item.kind}
            onChange={(value) => patchPending(item.id, { kind: value as VaultAssetKind })}
            options={["image", "video", "audio", "document", "json", "font", "template", "generated", "other"]}
           />
           <div>
            <div className="mb-2 text-[10px] font-black uppercase opacity-60">Pending tags for {item.name}</div>
            <div className="mb-2 flex flex-wrap gap-1">
             {item.tags.map((tag) => (
              <button
               key={tag}
               type="button"
               aria-label={`Remove pending tag ${tag}`}
               onClick={() => togglePendingTag(item.id, tag)}
              >
               <SubToolboxAlphabeticalTag
                level="l2"
                label={`× ${tag}`}
                spectrumKey={tag}
               />
              </button>
             ))}
            </div>
            <SubToolboxInput
             placeholder="+ TAG"
             aria-label={`Pending tags for ${item.name}`}
             onKeyDown={(event) => {
              if (event.key !== "Enter") return
              event.preventDefault()
              addPendingTag(item.id, event.currentTarget.value)
              event.currentTarget.value = ""
             }}
            />
           </div>
           {item.metadata.duplicateAssetId ? (
            <>
             <SubToolboxStatePanel
              level="l1"
              state="stale"
              message={`Exact duplicate of ${String(item.metadata.duplicateAssetName || "an existing Vault asset")}. Review before ingesting.`}
             />
             <SubToolboxInnerActionButton
              label="Use Existing Duplicate"
              iconName="link"
              tone="purple"
              onClick={() => resolvePendingDuplicate(item)}
             />
            </>
           ) : null}
           <div className="text-xs font-bold opacity-60">
            {(item.size / 1024 / 1024).toFixed(2)} MB
            {typeof item.metadata.width === "number" && typeof item.metadata.height === "number"
             ? ` · ${item.metadata.width}×${item.metadata.height}`
             : ""}
            {typeof item.metadata.durationSeconds === "number"
             ? ` · ${Number(item.metadata.durationSeconds).toFixed(1)}s`
             : ""}
           </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
           <SubToolboxInnerActionButton
            label="Ingest"
            iconName="plus"
            tone="cyan"
            onClick={() => ingestOne(item)}
           />
           <SubToolboxInnerActionButton
            label="Reject"
            iconName="x"
            tone="pink"
            onClick={() => rejectPending(item.id)}
           />
          </div>
         </div>
        )) : (
         <SubToolboxStatePanel level="l1" state="ready" message="Import Station is ready for a batch." />
        )}
       </div>
      </SubToolbox>
     </div>

     <div className="flex min-w-0 flex-col gap-4">
      <SubToolbox
       style={moduleStyle("task-center" as VaultWorkspaceModuleId)}
       title="Task Center"
       subtitle="Ingest and background processing jobs"
       icon={<Database />}
       paletteIndex={2}
       isOpenInitial
       persistenceId="vault-task-center"
      >
       <div className="flex flex-col gap-2">
        {tasks.length ? tasks.slice(0, 12).map((task) => (
         <div key={task.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
           <div className="truncate text-sm font-black uppercase">{task.label}</div>
           <div className="text-xs font-bold opacity-60">
            {task.status.toUpperCase()} · {Math.round(task.progress)}%
            {task.detail ? ` · ${task.detail}` : ""}
           </div>
          </div>
          <div className="flex flex-col items-end gap-2">
           <div className="text-xs font-black uppercase">{task.type.replace("-", " ")}</div>
           {task.status === "failed" && task.type === "transcript" ? (
            <SubToolboxInnerActionButton
             label="Retry Task"
             iconName="checklist"
             tone="orange"
             onClick={() => void retryTask(task.id)}
            />
           ) : null}
          </div>
         </div>
        )) : (
         <SubToolboxStatePanel level="l1" state="empty" message="No Vault background tasks yet." />
        )}
        {tasks.some((task) => task.status === "completed") ? (
         <SubToolboxInnerActionButton
          label="Clear Completed"
          iconName="checklist"
          tone="cyan"
          onClick={() => {
           clearCompletedVaultTasks()
           setTaskRefresh((value) => value + 1)
          }}
         />
        ) : null}
       </div>
      </SubToolbox>

      <SubToolbox
       style={moduleStyle("batch-processor" as VaultWorkspaceModuleId)}
       title="Batch Processor"
       subtitle="Apply organization changes to the current asset selection"
       icon={<Database />}
       paletteIndex={1}
       isOpenInitial
       persistenceId="vault-batch-processor"
      >
       <div className="flex flex-col gap-3">
        <div className="text-sm font-black uppercase">
         {selectedAssetIds.length} selected
        </div>
        <StandardInput
         value={batchTag}
         onChange={(event) => setBatchTag(event.target.value)}
         placeholder="Add tag to selection"
         aria-label="Batch tag"
        />
        <SubToolboxInnerActionButton
         label="Apply Tag"
         iconName="tag"
         tone="pink"
         onClick={applyBatchTag}
         disabled={!selectedAssetIds.length || !batchTag.trim()}
        />
        <StandardInput
         value={batchPrefix}
         onChange={(event) => setBatchPrefix(event.target.value)}
         placeholder="Rename prefix, e.g. EP01_"
         aria-label="Batch rename prefix"
        />
        <SubToolboxInnerActionButton
         label="Apply Prefix"
         iconName="edit"
         tone="orange"
         onClick={applyBatchPrefix}
         disabled={!selectedAssetIds.length || !batchPrefix.trim()}
        />
        <StandardInput
         value={batchProject}
         onChange={(event) => setBatchProject(event.target.value)}
         placeholder="Assign project name"
         aria-label="Batch project"
        />
        <SubToolboxInnerActionButton
         label="Assign Project"
         iconName="folder"
         tone="green"
         onClick={applyBatchProject}
         disabled={!selectedAssetIds.length || !batchProject.trim()}
        />
        {brain.projects.length ? (
         <>
          <SubToolboxSelect
           value={existingProjectId}
           onChange={(event) => setExistingProjectId(event.target.value)}
           aria-label="Existing project for selected Vault assets"
          >
           <option value="">Attach to existing project…</option>
           {brain.projects.map((project) => (
            <option key={project.id} value={project.id}>{project.name}</option>
           ))}
          </SubToolboxSelect>
          <SubToolboxInnerActionButton
           label="Attach Selection to Project"
           iconName="link"
           tone="blue"
           onClick={attachSelectionToExistingProject}
           disabled={!selectedAssetIds.length || !existingProjectId}
          />
         </>
        ) : null}
        <StandardInput
         ref={selectionProjectInputRef}
         value={selectionProjectName}
         onChange={(event) => setSelectionProjectName(event.target.value)}
         placeholder="New project from selection"
         aria-label="New project from selected assets"
        />
        <SubToolboxInnerActionButton
         label="Create Project From Selection"
         iconName="checklist"
         tone="purple"
         onClick={createProjectFromSelection}
         disabled={!selectedAssetIds.length || !selectionProjectName.trim()}
        />
        <div className="border-t-[3px] border-current pt-3">
         <div className="mb-2 text-xs font-black uppercase opacity-60">Collections</div>
         <StandardInput
          value={manualCollectionName}
          onChange={(event) => setManualCollectionName(event.target.value)}
          placeholder="New collection name"
          aria-label="New Vault collection name"
         />
         <SubToolboxInnerActionButton
          label="Create Collection"
          iconName="collection"
          tone="green"
          onClick={createManualCollection}
          disabled={!manualCollectionName.trim()}
         />
         {manualCollections.length ? (
          <>
           <SubToolboxSelect
            value={targetCollectionId}
            onChange={(event) => setTargetCollectionId(event.target.value)}
            aria-label="Target Vault collection"
           >
            <option value="">Choose collection…</option>
            {manualCollections.map((collection) => (
             <option key={collection.id} value={collection.id}>{collection.name}</option>
            ))}
           </SubToolboxSelect>
           <SubToolboxInnerActionButton
            label="Add Selection to Collection"
            iconName="collection"
            tone="blue"
            onClick={addSelectionToCollection}
            disabled={!selectedAssetIds.length || !targetCollectionId}
           />
           {activeCollectionId && selectedAsset ? (
            <SubToolboxInnerActionButton
             label="Remove Selected Asset From Active Collection"
             iconName="x"
             tone="orange"
             onClick={removeSelectedAssetFromActiveCollection}
            />
           ) : null}
          </>
         ) : null}
        </div>
        <SubToolboxInnerActionButton
         label="Download Selection Manifest"
         iconName="database"
         tone="yellow"
         onClick={exportSelectionManifest}
         disabled={!selectedAssetIds.length}
        />
        <SubToolboxInnerActionButton
         label="Toggle Favorite"
         iconName="sparkles"
         tone="orange"
         onClick={toggleFavoriteSelection}
         disabled={!selectedAssetIds.length}
        />
        {special === "archive" || special === "trash" ? (
         <SubToolboxInnerActionButton
          label="Restore Selection"
          iconName="checklist"
          tone="green"
          onClick={restoreSelection}
          disabled={!selectedAssetIds.length}
         />
        ) : (
         <>
          <SubToolboxInnerActionButton
           label="Archive Selection"
           iconName="archive"
           tone="cyan"
           onClick={archiveSelection}
           disabled={!selectedAssetIds.length}
          />
          <SubToolboxInnerActionButton
           label="Move to Trash"
           iconName="eye-off"
           tone="pink"
           onClick={trashSelection}
           disabled={!selectedAssetIds.length}
          />
         </>
        )}
        <SubToolboxInnerActionButton
         label="Clear Selection"
         iconName="x"
         tone="cyan"
         onClick={() => setSelectedAssetIds([])}
         disabled={!selectedAssetIds.length}
        />
       </div>
      </SubToolbox>

      <SubToolbox
       style={moduleStyle("inspector" as VaultWorkspaceModuleId)}
       title="Inspector"
       subtitle="Selected asset details and provenance"
       icon={<Database />}
       paletteIndex={0}
       isOpenInitial
       persistenceId="vault-inspector"
      >
       {selectedAsset ? (
        <div className="flex flex-col gap-3">
         <div>
          <div className="mb-2 text-xs font-black uppercase opacity-60">Quick Look</div>
          {!quickLookOpen ? (
           <SubToolboxStatePanel
            level="l1"
            state="ready"
            message="Quick Look is closed. Press Space to reopen it."
           />
          ) : selectedAsset.kind === "image" && (selectedAsset.previewUrl || selectedAsset.url) ? (
           <SubToolboxMediaInspector
            level="l1"
            title="Quick Look"
            poster={selectedAsset.previewUrl || selectedAsset.url || undefined}
            items={[
             { label: "KIND", value: selectedAsset.kind.toUpperCase() },
             { label: "PROJECT", value: selectedAsset.projectName || "UNASSIGNED" },
            ]}
           />
          ) : (selectedAsset.kind === "video" || selectedAsset.kind === "audio") && (selectedAsset.url || selectedAsset.previewUrl) ? (
           <SubToolboxMediaPlayer
            level="l1"
            title="Quick Look"
            meta={`${selectedAsset.kind.toUpperCase()} · ${selectedAsset.projectName || "UNASSIGNED"}`}
            src={selectedAsset.url || selectedAsset.previewUrl || undefined}
            poster={selectedAsset.previewUrl || undefined}
            current={quickLookCurrent}
            duration={Number(selectedAsset.metadata?.durationSeconds || selectedAsset.metadata?.duration || 60)}
            playing={quickLookPlaying}
            muted={quickLookMuted}
            volume={quickLookVolume}
            speed={quickLookSpeed}
            onCurrentChange={setQuickLookCurrent}
            onPlayingChange={setQuickLookPlaying}
            onMutedChange={setQuickLookMuted}
            onVolumeChange={setQuickLookVolume}
            onSpeedChange={setQuickLookSpeed}
           />
          ) : (
           <SubToolboxStatePanel
            level="l1"
            state="empty"
            message="This Vault record does not have a compatible preview source yet."
           />
          )}
         </div>
         <div>
          <div className="text-xs font-black uppercase opacity-60">Name</div>
          <div className="text-lg font-black uppercase">{selectedAsset.name}</div>
         </div>
         <div className="grid grid-cols-2 gap-3">
          <div>
           <div className="text-xs font-black uppercase opacity-60">Kind</div>
           <div className="text-sm font-black uppercase">{selectedAsset.kind}</div>
          </div>
          <div>
           <div className="text-xs font-black uppercase opacity-60">Source</div>
           <div className="text-sm font-black uppercase">{selectedAsset.source}</div>
          </div>
         </div>
         <div>
          <div className="text-xs font-black uppercase opacity-60">Project</div>
          <div className="text-sm font-black uppercase">{selectedAsset.projectName || "Unassigned"}</div>
         </div>
         <div>
          <div className="mb-2 text-xs font-black uppercase opacity-60">Spectrum Tags</div>
          <div className="flex flex-wrap gap-1">
           {(selectedAsset.tags || []).map((tag) => (
            <SubToolboxAlphabeticalTag key={tag} level="l2" label={tag} spectrumKey={tag} />
           ))}
          </div>
         </div>
         {selectedAsset && (selectedAsset.kind === "video" || selectedAsset.kind === "audio") ? (
          <div>
           <div className="mb-2 text-xs font-black uppercase opacity-60">Transcript Acquisition</div>
           {selectedYouTubeVideoId ? (
            <div className="flex flex-col gap-2">
             <div className="text-xs font-bold opacity-60">
              YOUTUBE VIDEO · {selectedYouTubeVideoId}
             </div>
             <SubToolboxInnerActionButton
              label="Acquire YouTube Transcript"
              iconName="database"
              tone="green"
              onClick={() => void acquireTranscriptForAsset(selectedAsset)}
             />
            </div>
           ) : (
            <SubToolboxStatePanel
             level="l1"
             state="blocked"
             message="No YouTube video ID is available for this asset. Local-file speech transcription requires a real speech-to-text backend and is not simulated."
            />
           )}
          </div>
         ) : null}
         {(captionSourceAsset || activeCaptionAsset) ? (
          <div>
           <div className="mb-2 text-xs font-black uppercase opacity-60">Captions & Transcript</div>
           <div className="flex flex-col gap-2">
            {captionLines.map((line, index) => (
             <div key={line.id} className="grid grid-cols-[72px_72px_minmax(0,1fr)_auto] gap-2">
              <SubToolboxInput
               type="number"
               min={0}
               step={100}
               value={line.startMs}
               aria-label={`Caption ${index + 1} start milliseconds`}
               onChange={(event) => patchCaptionLine(line.id, { startMs: Number(event.target.value) || 0 })}
              />
              <SubToolboxInput
               type="number"
               min={0}
               step={100}
               value={line.endMs}
               aria-label={`Caption ${index + 1} end milliseconds`}
               onChange={(event) => patchCaptionLine(line.id, { endMs: Number(event.target.value) || 0 })}
              />
              <SubToolboxInput
               value={line.text}
               placeholder={`Caption line ${index + 1}`}
               aria-label={`Caption ${index + 1} text`}
               onChange={(event) => patchCaptionLine(line.id, { text: event.target.value })}
              />
              <SubToolboxInnerActionButton
               label="×"
               iconName="x"
               tone="pink"
               onClick={() => removeCaptionLine(line.id)}
              />
             </div>
            ))}
            <SubToolboxInnerActionButton
             label="Add Caption Line"
             iconName="plus"
             tone="cyan"
             onClick={addCaptionLine}
            />
            <SubToolboxInnerActionButton
             label="Save Caption Artifact"
             iconName="archive"
             tone="green"
             onClick={saveCaptionArtifact}
             disabled={!captionLines.length}
            />
            <div className="grid grid-cols-2 gap-2">
             <SubToolboxInnerActionButton
              label="Export SRT"
              iconName="database"
              tone="yellow"
              onClick={() => downloadCaptionText("srt")}
              disabled={!captionLines.length}
             />
             <SubToolboxInnerActionButton
              label="Export VTT"
              iconName="database"
              tone="yellow"
              onClick={() => downloadCaptionText("vtt")}
              disabled={!captionLines.length}
             />
            </div>
            <SubToolboxInnerActionButton
             label="Create Script From Transcript"
             iconName="edit"
             tone="purple"
             onClick={createScriptFromTranscript}
             disabled={!captionLines.some((line) => line.text.trim())}
            />
           </div>
          </div>
         ) : null}
         <div>
          <div className="mb-2 text-xs font-black uppercase opacity-60">Versions</div>
          {selectedVersionStack.length ? (
           <>
            <div className="flex gap-2 overflow-x-auto pb-1">
            {selectedVersionStack.map((version) => {
             const asset = allAssets.find((candidate) => candidate.id === version.assetId)
             return (
              <SubToolboxInnerActionButton
               key={version.id}
               label={`V${version.version} · ${version.label || asset?.name || version.assetId}`}
               iconName="layers"
               tone={version.assetId === selectedAsset.id ? "pink" : "cyan"}
               onClick={() => setSelectedAssetIds([version.assetId])}
              />
             )
            })}
            </div>
            {selectedVersionRecord ? (
             <SubToolboxInnerActionButton
              label="Detach Version as Independent Asset"
              iconName="layers"
              tone="purple"
              onClick={detachSelectedVersion}
             />
            ) : null}
           </>
          ) : (
           <SubToolboxStatePanel
            level="l1"
            state="empty"
            message="No canonical version stack is recorded for this asset."
           />
          )}
         </div>
         {selectedAsset.kind === "image" ? (
          <div>
           <div className="mb-2 text-xs font-black uppercase opacity-60">Find Similar</div>
           {selectedAsset.metadata?.perceptualHash ? (
            selectedSimilarAssets.length ? (
             <div className="flex flex-col gap-2">
              {selectedSimilarAssets.slice(0, 8).map((asset) => (
               <SubToolboxInnerActionButton
                key={asset.id}
                label={asset.name}
                iconName="search"
                tone="cyan"
                onClick={() => setSelectedAssetIds([asset.id])}
               />
              ))}
             </div>
            ) : (
             <SubToolboxStatePanel
              level="l1"
              state="empty"
              message="No visually similar imported images are currently indexed."
             />
            )
           ) : (
            <SubToolboxStatePanel
             level="l1"
             state="stale"
             message="This image predates local perceptual indexing. Re-import or replace its preview source to generate a similarity fingerprint."
            />
           )}
          </div>
         ) : null}
         <div>
          <div className="mb-2 text-xs font-black uppercase opacity-60">Lineage</div>
          {selectedLineage.length > 1 ? (
           <div className="flex flex-col gap-2">
            {selectedLineage.map((asset, index) => (
             <SubToolboxInnerActionButton
              key={asset.id}
              label={`${index === 0 ? "CURRENT" : `PARENT ${index}`} · ${asset.name}`}
              iconName="layers"
              tone={index === 0 ? "pink" : "cyan"}
              onClick={() => setSelectedAssetIds([asset.id])}
             />
            ))}
           </div>
          ) : (
           <SubToolboxStatePanel
            level="l1"
            state="empty"
            message="No parent lineage is recorded for this asset."
           />
          )}
         </div>
         <div>
          <div className="mb-2 text-xs font-black uppercase opacity-60">Custom Fields</div>
          <div className="flex flex-col gap-2">
           <div className="grid grid-cols-[minmax(0,1fr)_120px] gap-2">
            <SubToolboxInput
             value={customFieldName}
             onChange={(event) => setCustomFieldName(event.target.value)}
             placeholder="FIELD NAME"
             aria-label="Custom field name"
             onKeyDown={(event) => {
              if (event.key === "Enter") createCustomField()
             }}
            />
            <SubToolboxSelect
             value={customFieldType}
             aria-label="Custom field type"
             onChange={(event) => setCustomFieldType(event.target.value as VaultCustomFieldType)}
            >
             <option value="text">TEXT</option>
             <option value="number">NUMBER</option>
             <option value="date">DATE</option>
             <option value="boolean">BOOLEAN</option>
            </SubToolboxSelect>
           </div>
           <SubToolboxInnerActionButton
            label="Create Custom Field"
            iconName="plus"
            tone="green"
            onClick={createCustomField}
            disabled={!customFieldName.trim()}
           />
           {customFields.map((field) => {
            const values = selectedAsset.metadata?.customFields
            const currentValue = values && typeof values === "object" && !Array.isArray(values)
             ? (values as Record<string, unknown>)[field.id]
             : undefined
            return (
             <div key={field.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2">
              <div className="min-w-0">
               <div className="mb-1 text-[10px] font-black uppercase opacity-60">{field.name}</div>
               {field.type === "boolean" ? (
                <SubToolboxSelect
                 value={currentValue === true ? "true" : currentValue === false ? "false" : ""}
                 aria-label={`Custom field ${field.name}`}
                 onChange={(event) => {
                  if (!event.target.value) {
                   setVaultCustomFieldValue(selectedAsset.id, field.id, null)
                   setRefreshTick((value) => value + 1)
                   return
                  }
                  updateCustomFieldValue(selectedAsset, field.id, field.type, event.target.value === "true")
                 }}
                >
                 <option value="">UNSET</option>
                 <option value="true">TRUE</option>
                 <option value="false">FALSE</option>
                </SubToolboxSelect>
               ) : (
                <SubToolboxInput
                 type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                 value={currentValue == null ? "" : String(currentValue)}
                 aria-label={`Custom field ${field.name}`}
                 onChange={(event) => updateCustomFieldValue(
                  selectedAsset,
                  field.id,
                  field.type,
                  event.target.value,
                 )}
                />
               )}
              </div>
              <SubToolboxInnerActionButton
               label="×"
               iconName="x"
               tone="pink"
               onClick={() => removeCustomField(field.id)}
               aria-label={`Delete custom field ${field.name}`}
              />
             </div>
            )
           })}
          </div>
         </div>
         <div>
          <div className="mb-2 text-xs font-black uppercase opacity-60">Lifecycle & Protection</div>
          <div className="flex flex-col gap-2">
           <SubToolboxSelect
            value={String(selectedAsset.metadata?.lifecycle || "DRAFT")}
            aria-label="Asset lifecycle"
            onChange={(event) => updateAssetLifecycle(selectedAsset, event.target.value as VaultAssetLifecycle)}
           >
            {["DRAFT", "CANDIDATE", "APPROVED", "FINAL", "GOLDEN", "SUPERSEDED"].map((value) => (
             <option key={value} value={value}>{value}</option>
            ))}
           </SubToolboxSelect>
           <SubToolboxInnerActionButton
            label={(selectedAsset.metadata?.protected === true || (String(selectedAsset.metadata?.lifecycle || "").toUpperCase() === "GOLDEN" && selectedAsset.metadata?.protected !== false))
             ? "Unlock Protected Asset"
             : "Protect Asset"}
            iconName="checklist"
            tone="purple"
            onClick={() => toggleAssetProtection(selectedAsset)}
           />
          </div>
         </div>
         <div>
          <div className="mb-2 text-xs font-black uppercase opacity-60">Send To</div>
          {selectedToolTargets.length ? (
           <div className="flex flex-wrap gap-2">
            {selectedToolTargets.map((target) => (
             <SubToolboxInnerActionButton
              key={target.id}
              label={target.label}
              iconName="link"
              tone="blue"
              onClick={() => sendSelectedAssetToTool(target.id)}
             />
            ))}
           </div>
          ) : (
           <SubToolboxStatePanel
            level="l1"
            state="empty"
            message="No compatible ViewTube tools are registered for this asset type."
           />
          )}
         </div>
         {selectedReadiness ? (
          <div>
           <div className="mb-2 text-xs font-black uppercase opacity-60">Project Readiness</div>
           <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
             <SubToolboxStatePanel
              level="l1"
              state={selectedReadiness.packageReady ? "ready" : "stale"}
              message={selectedReadiness.packageReady ? "PACKAGE READY" : `${selectedReadiness.missingPackaging.length} PACKAGING DEPENDENCIES MISSING`}
             />
             <SubToolboxStatePanel
              level="l1"
              state={selectedReadiness.publishReady ? "ready" : "stale"}
              message={selectedReadiness.publishReady ? "PUBLISH READY" : "FINAL RENDER NOT READY"}
             />
            </div>
            <div className="grid grid-cols-2 gap-2">
             {selectedReadiness.slots.map((slot) => (
              <div key={slot.id} className="text-xs font-bold">
               <div className="font-black uppercase">{slot.label}</div>
               <div className="opacity-60">{slot.state.toUpperCase()}</div>
              </div>
             ))}
            </div>
            <div className="text-xs font-bold">
             <div className="font-black uppercase">Known Package Size</div>
             <div className="opacity-60">
              {formatVaultBytes(selectedReadiness.storage.knownBytes)}
              {selectedReadiness.storage.unknownSizeCount
               ? ` · ${selectedReadiness.storage.unknownSizeCount} asset(s) with unknown size`
               : ""}
             </div>
            </div>
           </div>
          </div>
         ) : null}
         <div>
          <div className="mb-2 text-xs font-black uppercase opacity-60">Usage</div>
          {selectedUsage.length ? (
           <div className="flex flex-col gap-2">
            {selectedUsage.map((usage) => (
             <div key={usage.contentBuildId} className="text-xs font-bold">
              <div className="font-black uppercase">{usage.projectName || usage.contentBuildId}</div>
              <div className="opacity-60">
               {usage.stage.toUpperCase()}
               {usage.selectedSlots.length ? ` · SELECTED: ${usage.selectedSlots.join(", ").toUpperCase()}` : ""}
              </div>
             </div>
            ))}
           </div>
          ) : (
           <SubToolboxStatePanel
            level="l1"
            state="empty"
            message="This asset is not attached to a ContentBuild yet."
           />
          )}
         </div>
         {Array.isArray(selectedAsset.metadata?.imagePalette)
          && selectedAsset.metadata.imagePalette.length ? (
          <div>
           <div className="mb-2 text-xs font-black uppercase opacity-60">Color Palette</div>
           <div className="flex flex-wrap gap-2">
            {(selectedAsset.metadata.imagePalette as string[]).map((color) => (
             <button
              key={color}
              type="button"
              title={color}
              aria-label={`Copy palette color ${color}`}
              onClick={() => {
               if (navigator.clipboard?.writeText) void navigator.clipboard.writeText(color)
              }}
              className="flex items-center gap-2 border-[2px] border-current px-2 py-1 text-[10px] font-black uppercase"
             >
              <span
               aria-hidden="true"
               className="h-4 w-4 border-[2px] border-current"
               style={{ backgroundColor: color }}
              />
              {color}
             </button>
            ))}
           </div>
          </div>
         ) : null}
         {(selectedAsset.metadata?.exifMake
          || selectedAsset.metadata?.exifModel
          || selectedAsset.metadata?.exifDateTimeOriginal
          || typeof selectedAsset.metadata?.exifOrientation === "number") ? (
          <div>
           <div className="mb-2 text-xs font-black uppercase opacity-60">EXIF Metadata</div>
           <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            {selectedAsset.metadata?.exifMake ? (
             <div><div className="font-black uppercase">Make</div><div className="opacity-60">{String(selectedAsset.metadata.exifMake)}</div></div>
            ) : null}
            {selectedAsset.metadata?.exifModel ? (
             <div><div className="font-black uppercase">Model</div><div className="opacity-60">{String(selectedAsset.metadata.exifModel)}</div></div>
            ) : null}
            {typeof selectedAsset.metadata?.exifOrientation === "number" ? (
             <div><div className="font-black uppercase">Orientation</div><div className="opacity-60">{String(selectedAsset.metadata.exifOrientation)}</div></div>
            ) : null}
            {selectedAsset.metadata?.exifDateTimeOriginal ? (
             <div><div className="font-black uppercase">Captured</div><div className="opacity-60">{String(selectedAsset.metadata.exifDateTimeOriginal)}</div></div>
            ) : null}
           </div>
          </div>
         ) : null}
         <div>
          <div className="mb-2 text-xs font-black uppercase opacity-60">Rights & License</div>
          <div className="flex flex-col gap-2">
           <SubToolboxInput
            defaultValue={rightsLicense}
            placeholder="LICENSE · owned / licensed / CC / public domain"
            aria-label="Asset license"
            onBlur={(event) => updateAssetRights(selectedAsset, { license: event.target.value })}
           />
           <SubToolboxInput
            defaultValue={rightsSource}
            placeholder="SOURCE / ATTRIBUTION"
            aria-label="Asset rights source"
            onBlur={(event) => updateAssetRights(selectedAsset, { rightsSource: event.target.value })}
           />
           <SubToolboxInput
            type="date"
            defaultValue={rightsExpiry}
            aria-label="Asset rights expiry"
            onBlur={(event) => updateAssetRights(selectedAsset, { rightsExpiry: event.target.value })}
           />
           <SubToolboxTextArea
            height="compact"
            defaultValue={rightsRestrictions}
            placeholder="Usage restrictions, territory, platform, attribution notes…"
            aria-label="Asset rights restrictions"
            onBlur={(event) => updateAssetRights(selectedAsset, { rightsRestrictions: event.target.value })}
           />
          </div>
         </div>
         {(typeof selectedAsset.metadata?.width === "number"
          || typeof selectedAsset.metadata?.durationSeconds === "number") ? (
          <div className="grid grid-cols-2 gap-3">
           {typeof selectedAsset.metadata?.width === "number" && typeof selectedAsset.metadata?.height === "number" ? (
            <div>
             <div className="text-xs font-black uppercase opacity-60">Dimensions</div>
             <div className="text-sm font-black uppercase">
              {String(selectedAsset.metadata.width)}×{String(selectedAsset.metadata.height)}
             </div>
            </div>
           ) : null}
           {typeof selectedAsset.metadata?.durationSeconds === "number" ? (
            <div>
             <div className="text-xs font-black uppercase opacity-60">Duration</div>
             <div className="text-sm font-black uppercase">
              {Number(selectedAsset.metadata.durationSeconds).toFixed(1)}s
             </div>
            </div>
           ) : null}
          </div>
         ) : null}
         <div>
          <div className="mb-2 text-xs font-black uppercase opacity-60">Metadata Export</div>
          <div className="grid grid-cols-2 gap-2">
           <SubToolboxInnerActionButton
            label="Export Metadata JSON"
            iconName="database"
            tone="cyan"
            onClick={() => exportVaultMetadata([selectedAsset], "json")}
           />
           <SubToolboxInnerActionButton
            label="Export Metadata CSV"
            iconName="database"
            tone="cyan"
            onClick={() => exportVaultMetadata([selectedAsset], "csv")}
           />
          </div>
         </div>
         <div>
          <div className="text-xs font-black uppercase opacity-60">Updated</div>
          <div className="text-sm font-bold">{new Date(selectedAsset.updatedAt).toLocaleString()}</div>
         </div>
        </div>
       ) : (
        <SubToolboxStatePanel
         level="l1"
         state="empty"
         message="Select an asset in the library to inspect its canonical Vault record."
        />
       )}
      </SubToolbox>
     </div>
    </div>
   </Toolbox>
  </main>
 )
}

export default CreatorVaultOS
