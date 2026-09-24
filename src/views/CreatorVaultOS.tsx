import React, { useEffect, useMemo, useState } from "react"
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
 createLocalVaultAsset,
 listVaultAssets,
 searchVaultAssets,
} from "../services/vaultAdapter"
import {
 readVaultWorkspaceState,
 writeVaultWorkspaceState,
 type VaultWorkspaceSort,
 type VaultWorkspaceViewMode,
} from "../services/vaultWorkspaceState"
import type { VaultAsset, VaultAssetKind } from "../types"

type PendingImport = {
 id: string
 name: string
 kind: VaultAssetKind
 mimeType: string | null
 size: number
 tags: string[]
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

const kindFromFile = (file: File): VaultAssetKind => {
 if (file.type.startsWith("image/")) return "image"
 if (file.type.startsWith("video/")) return "video"
 if (file.type.startsWith("audio/")) return "audio"
 if (file.type.startsWith("font/")) return "font"
 if (file.type.includes("json")) return "document"
 if (file.type.startsWith("text/") || file.type.includes("pdf")) return "document"
 return "other"
}

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
 const initialWorkspace = useMemo(() => readVaultWorkspaceState(), [])
 const [refreshTick, setRefreshTick] = useState(0)
 const [query, setQuery] = useState(initialWorkspace.query)
 const [filterKind, setFilterKind] = useState<"all" | VaultAssetKind>(initialWorkspace.filterKind)
 const [selectedTag, setSelectedTag] = useState<string | null>(initialWorkspace.selectedTag)
 const [source, setSource] = useState(initialWorkspace.source)
 const [sort, setSort] = useState<VaultWorkspaceSort>(initialWorkspace.sort)
 const [viewMode, setViewMode] = useState<VaultWorkspaceViewMode>(initialWorkspace.viewMode)
 const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null)
 const [pending, setPending] = useState<PendingImport[]>([])
 const [importProject, setImportProject] = useState("")
 const [importTags, setImportTags] = useState<string[]>(["imported"])

 const allAssets = useMemo(() => listVaultAssets(), [refreshTick])
 const visibleAssets = useMemo(() => {
  return searchVaultAssets({
   query,
   kind: filterKind === "all" ? null : filterKind,
   tags: selectedTag ? [selectedTag] : [],
   source: source === "all" ? null : source,
   sort,
   limit: 100,
  })
 }, [query, filterKind, selectedTag, source, sort, refreshTick])

 useEffect(() => {
  writeVaultWorkspaceState({
   query,
   selectedTag,
   filterKind,
   source,
   sort,
   viewMode,
  })
 }, [query, selectedTag, filterKind, source, sort, viewMode])

 const selectedAsset = useMemo(
  () => allAssets.find((asset) => asset.id === selectedAssetId) || null,
  [allAssets, selectedAssetId],
 )

 const availableTags = useMemo(
  () => Array.from(new Set([...CORE_TAGS, ...allAssets.flatMap((asset) => asset.tags || [])]))
   .sort((a, b) => a.localeCompare(b)),
  [allAssets],
 )

 const stageFiles = (files: FileList | null) => {
  if (!files?.length) return
  const staged = Array.from(files).map<PendingImport>((file) => ({
   id: crypto.randomUUID(),
   name: file.name,
   kind: kindFromFile(file),
   mimeType: file.type || null,
   size: file.size,
   tags: [...importTags],
  }))
  setPending((current) => [...current, ...staged])
 }

 const toggleImportTag = (tag: string) => {
  setImportTags((current) => (
   current.includes(tag) ? current.filter((value) => value !== tag) : [...current, tag]
  ))
 }

 const ingestOne = (item: PendingImport) => {
  createLocalVaultAsset({
   name: item.name,
   kind: item.kind,
   projectName: importProject.trim() || null,
   toolId: "creator-vault-os",
   mimeType: item.mimeType,
   tags: item.tags,
   metadata: {
    byteSize: item.size,
    ingestSource: "vault-import-station",
   },
  })
  setPending((current) => current.filter((candidate) => candidate.id !== item.id))
  setRefreshTick((value) => value + 1)
 }

 const ingestAll = () => {
  pending.forEach((item) => {
   createLocalVaultAsset({
    name: item.name,
    kind: item.kind,
    projectName: importProject.trim() || null,
    toolId: "creator-vault-os",
    mimeType: item.mimeType,
    tags: item.tags,
    metadata: {
     byteSize: item.size,
     ingestSource: "vault-import-station",
    },
   })
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
         ]}
        />
        <SubToolboxDropdownControl
         label="Asset kind"
         value={filterKind}
         onChange={(value) => setFilterKind(value as "all" | VaultAssetKind)}
         options={["all", "image", "video", "audio", "document", "font", "template", "generated", "other"]}
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
          value: query,
          onChange: (event) => setQuery(event.target.value),
          placeholder: "Search names, projects, tags, kinds, and metadata…",
          "aria-label": "Search Vault assets",
         }}
        />
        {visibleAssets.length ? (
         <div className={viewMode === "grid"
          ? "grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-3"
          : "flex flex-col gap-2"}
         >
          {visibleAssets.map((asset) => (
           <SubToolboxVaultAsset
            key={asset.id}
            level="l1"
            kind={vaultCardKind(asset)}
            title={asset.name}
            icon={assetIcon(asset)}
            selected={selectedAssetId === asset.id}
            onSelectedChange={(selected) => setSelectedAssetId(selected ? asset.id : null)}
            tags={(
             <div className="flex flex-wrap gap-1">
              {(asset.tags || []).slice(0, 5).map((tag) => (
               <SubToolboxAlphabeticalTag key={tag} level="l2" label={tag} spectrumKey={tag} />
              ))}
             </div>
            )}
            notes={`${asset.kind.toUpperCase()} · ${asset.projectName || "UNASSIGNED"}`}
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
       <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(260px,0.9fr)]">
        <SubToolboxFileTarget
         level="l1"
         multiple
         minHeight={180}
         icon={<UploadCloud />}
         label="DROP OR CHOOSE A BATCH"
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
          <div className="min-w-0">
           <div className="truncate text-sm font-black uppercase">{item.name}</div>
           <div className="text-xs font-bold opacity-60">
            {item.kind.toUpperCase()} · {(item.size / 1024 / 1024).toFixed(2)} MB
           </div>
          </div>
          <SubToolboxInnerActionButton
           label="Ingest"
           iconName="plus"
           tone="cyan"
           onClick={() => ingestOne(item)}
          />
         </div>
        )) : (
         <SubToolboxStatePanel level="l1" state="ready" message="Import Station is ready for a batch." />
        )}
       </div>
      </SubToolbox>
     </div>

     <div className="flex min-w-0 flex-col gap-4">
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
