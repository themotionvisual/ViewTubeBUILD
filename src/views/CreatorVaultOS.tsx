import React, { useEffect, useMemo, useRef, useState } from "react"
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
 SubToolboxFileTarget,
 SubToolboxSegmentedToggle,
 SubToolboxSplitField,
 SubToolboxStatePanel,
 SubToolboxVaultAsset,
} from "../components/subtoolbox/SubToolboxPrimitives"
import {
 createImportedVaultAsset,
 findVaultDuplicateByHash,
 listVaultAssets,
 searchVaultAssets,
 setVaultAssetState,
 updateVaultAsset,
} from "../services/vaultAdapter"
import {
 readVaultWorkspaceState,
 writeVaultWorkspaceState,
 type VaultWorkspaceSort,
 type VaultWorkspaceViewMode,
} from "../services/vaultWorkspaceState"
import { createPendingVaultImport, updatePendingVaultImport, type PendingVaultImport } from "../services/vaultImport"
import { extractVaultFileMetadata } from "../services/vaultFileMetadata"
import { computeVaultFileHash } from "../services/vaultFileHash"
import { buildVaultExplorerGroups } from "../services/vaultExplorer"
import { resolveVaultSelection } from "../services/vaultSelection"
import {
 createVaultSmartCollection,
 deleteVaultSmartCollection,
 listVaultSmartCollections,
 type VaultSmartCollection,
} from "../services/vaultCollections"
import { resolveVaultKeyboardCommand } from "../services/vaultKeyboard"
import { SubToolboxMediaInspector, SubToolboxMediaPlayer } from "../components/subtoolbox/SubToolboxMediaPrimitives"
import { useBrain } from "../context/useBrain"
import { initializeProjectContentIdentity } from "../services/projects/ProjectContentIdentityService"
import { attachAssetToContentBuild } from "../services/asset-engine/ContentBuildRepository"
import { buildVaultSelectionProjectDraft } from "../services/vaultProjectHandoff"
import type { VaultAsset, VaultAssetKind } from "../types"

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

const assetIcon = (asset: VaultAsset) => {
 if (asset.kind === "video") return <Video />
 if (asset.kind === "audio") return <FileAudio />
 if (asset.kind === "document" || asset.kind === "font" || asset.kind === "template") return <FileText />
 return <FileImage />
}

const CreatorVaultOS: React.FC = () => {
 const { brain, addProject, setActiveProject, channelIdentity } = useBrain()
 const initialWorkspace = useMemo(() => readVaultWorkspaceState(), [])
 const [refreshTick, setRefreshTick] = useState(0)
 const [query, setQuery] = useState(initialWorkspace.query)
 const [filterKind, setFilterKind] = useState<"all" | VaultAssetKind>(initialWorkspace.filterKind)
 const [selectedTag, setSelectedTag] = useState<string | null>(initialWorkspace.selectedTag)
 const [source, setSource] = useState(initialWorkspace.source)
 const [sort, setSort] = useState<VaultWorkspaceSort>(initialWorkspace.sort)
 const [special, setSpecial] = useState(initialWorkspace.special)
 const [viewMode, setViewMode] = useState<VaultWorkspaceViewMode>(initialWorkspace.viewMode)
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
 const [smartCollectionName, setSmartCollectionName] = useState("")
 const [collectionRefresh, setCollectionRefresh] = useState(0)
 const [selectionProjectName, setSelectionProjectName] = useState("")
 const [explorerProject, setExplorerProject] = useState<"all" | "unassigned" | string>("all")
 const searchInputRef = useRef<HTMLInputElement | null>(null)
 const selectionProjectInputRef = useRef<HTMLInputElement | null>(null)

 const allAssets = useMemo(() => listVaultAssets(), [refreshTick])
 const smartCollections = useMemo(() => listVaultSmartCollections(), [collectionRefresh])
 const explorerGroups = useMemo(() => buildVaultExplorerGroups(allAssets), [allAssets])
 const visibleAssets = useMemo(() => {
  const base = searchVaultAssets({
   query,
   kind: filterKind === "all" ? null : filterKind,
   tags: selectedTag ? [selectedTag] : [],
   source: source === "all" ? null : source,
   sort,
   special,
   limit: 100,
  })
  if (explorerProject === "all") return base
  if (explorerProject === "unassigned") return base.filter((asset) => !asset.projectName)
  return base.filter((asset) => asset.projectName === explorerProject)
 }, [query, filterKind, selectedTag, source, sort, special, explorerProject, refreshTick])

 useEffect(() => {
  writeVaultWorkspaceState({
   query,
   selectedTag,
   filterKind,
   source,
   sort,
   special,
   viewMode,
  })
 }, [query, selectedTag, filterKind, source, sort, special, viewMode])

 const selectedAsset = useMemo(
  () => allAssets.find((asset) => asset.id === selectedAssetIds[0]) || null,
  [allAssets, selectedAssetIds],
 )

 const availableTags = useMemo(
  () => Array.from(new Set([...CORE_TAGS, ...allAssets.flatMap((asset) => asset.tags || [])]))
   .sort((a, b) => a.localeCompare(b)),
  [allAssets],
 )

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
   const [metadata, contentHash] = await Promise.all([
    extractVaultFileMetadata(file),
    computeVaultFileHash(file),
   ])
   const duplicate = contentHash ? findVaultDuplicateByHash(contentHash) : null
   return createPendingVaultImport(
    file,
    importTags,
    crypto.randomUUID(),
    {
     ...metadata,
     contentHash,
     duplicateAssetId: duplicate?.id || null,
     duplicateAssetName: duplicate?.name || null,
    },
   )
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
  <main className="mx-auto flex w-full max-w-[1800px] flex-col gap-4 p-3 sm:p-4 lg:p-6">
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
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(220px,0.72fr)_minmax(0,2.1fr)_minmax(260px,0.9fr)]">
     <div className="flex min-w-0 flex-col gap-4">
      <SubToolbox
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
         onClick={() => setExplorerProject("all")}
        />
        {explorerGroups.unassignedCount ? (
         <SubToolboxInnerActionButton
          label={`Unassigned · ${explorerGroups.unassignedCount}`}
          iconName="collection"
          tone={explorerProject === "unassigned" ? "pink" : "cyan"}
          onClick={() => setExplorerProject("unassigned")}
         />
        ) : null}
        {explorerGroups.projects.map((project) => (
         <SubToolboxInnerActionButton
          key={project.name}
          label={`${project.name} · ${project.count}`}
          iconName="collection"
          tone={explorerProject === project.name ? "pink" : "cyan"}
          onClick={() => setExplorerProject(project.name)}
         />
        ))}
       </div>
      </SubToolbox>

      <SubToolbox
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
        {visibleAssets.length ? (
         <div className={viewMode === "grid"
          ? "grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-3"
          : viewMode === "timeline"
           ? "flex flex-col gap-4 border-l-[4px] border-current pl-4"
           : "flex flex-col gap-2"}
         >
          {visibleAssets.map((asset) => (
           <SubToolboxVaultAsset
            key={asset.id}
            level="l1"
            kind={vaultCardKind(asset)}
            title={asset.name}
            icon={assetIcon(asset)}
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
             <div className="flex flex-wrap gap-1">
              {(asset.tags || []).slice(0, 5).map((tag) => (
               <SubToolboxAlphabeticalTag key={tag} level="l2" label={tag} spectrumKey={tag} />
              ))}
             </div>
            )}
            notes={viewMode === "timeline"
             ? `${new Date(asset.createdAt).toLocaleString()} · ${asset.kind.toUpperCase()} · ${asset.projectName || "UNASSIGNED"}`
             : `${asset.kind.toUpperCase()} · ${asset.projectName || "UNASSIGNED"}`}
           />
          ))}
         </div>
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
           {item.metadata.duplicateAssetId ? (
            <SubToolboxStatePanel
             level="l1"
             state="warning"
             message={`Exact duplicate of ${String(item.metadata.duplicateAssetName || "an existing Vault asset")}. Review before ingesting.`}
            />
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
