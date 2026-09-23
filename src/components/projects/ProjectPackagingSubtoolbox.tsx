import React from "react"
import { Image as ImageIcon, Images, PackageOpen, Trash2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useBrain } from "../../context/useBrain"
import type { Project, VaultAsset } from "../../types"
import { getContentBuild } from "../../services/asset-engine/ContentBuildRepository"
import { listAssets } from "../../services/assetEngine"
import { createLocalVaultAsset } from "../../services/vaultAdapter"
import {
 clearProjectVideoPackageThumbnail,
 selectProjectVideoPackageThumbnail,
} from "../../services/video-package/ProjectVideoPackageBridge"
import { SubToolbox } from "../Toolbox"
import { SubToolboxGrid, SubToolboxSection, SubToolboxStack } from "../subtoolbox/SubToolboxLayouts"
import { SubToolboxBadge, SubToolboxButton, SubToolboxInput, SubToolboxMediaCard, SubToolboxStatePanel } from "../subtoolbox/SubToolboxPrimitives"

const isThumbnailCandidate = (
 asset: VaultAsset,
 project: Project,
 buildAssetIds: string[],
) => {
 const thumbnailTag = asset.tags.some(tag => tag.toLowerCase().includes("thumbnail"))
 const isImage = asset.kind === "image" || asset.mimeType?.startsWith("image/") || thumbnailTag
 const belongsToProject = asset.projectId === project.id || buildAssetIds.includes(asset.id)
 const reusableUnscopedThumbnail = !asset.projectId && thumbnailTag
 return Boolean(isImage && (belongsToProject || reusableUnscopedThumbnail))
}

const ProjectPackagingSubtoolbox: React.FC<{
 project: Project
 onUpdate: (updates: Partial<Project>) => void
}> = ({ project, onUpdate }) => {
 const navigate = useNavigate()
 const { channelIdentity } = useBrain()
 const build = project.contentBuildId ? getContentBuild(project.contentBuildId) : null
 const assets = listAssets()
 const candidates = assets
  .filter(asset => isThumbnailCandidate(asset, project, build?.assetIds || []))
  .slice(0, 8)
 const selectedAssetId = build?.selections.thumbnail || null
 const selectedAsset = selectedAssetId ? assets.find(asset => asset.id === selectedAssetId) || null : null
 const thumbnailUrl = selectedAsset?.previewUrl || selectedAsset?.url || project.thumbnailUrl || ""
 const hasThumbnail = Boolean(thumbnailUrl)

 const selectThumbnail = (asset: VaultAsset) => {
  if (!project.contentBuildId) return
  selectProjectVideoPackageThumbnail(project, asset, {
   channelId: channelIdentity.channelId || null,
   sourceToolId: "project-builder",
  })
  onUpdate({ thumbnailUrl: asset.previewUrl || asset.url || project.thumbnailUrl || "" })
 }

 const clearThumbnail = () => {
  if (project.contentBuildId) {
   clearProjectVideoPackageThumbnail(project, { sourceToolId: "project-builder" })
  }
  onUpdate({ thumbnailUrl: "" })
 }

 const importCompatibilityUrl = () => {
  const url = project.thumbnailUrl?.trim()
  if (!url || !project.contentBuildId) return
  const existing = assets.find(asset =>
   asset.projectId === project.id &&
   (asset.url === url || asset.previewUrl === url)
  )
  const asset = existing || createLocalVaultAsset({
   name: `${project.videoTitle || project.name} thumbnail`,
   kind: "image",
   projectId: project.id,
   projectName: project.name,
   url,
   tags: ["thumbnail", "project-builder", "imported-url"],
   metadata: {
    contentBuildId: project.contentBuildId,
    sourceToolId: "project-builder",
   },
  })
  selectThumbnail(asset)
 }

 return <SubToolbox
  title="PACKAGING"
  subtitle="Thumbnail selection, Vault identity and packaging handoff"
  icon={<Images />}
  collapsible
  isOpenInitial
  openUnits={5}
 >
  <SubToolboxStack density="comfortable">
   <SubToolboxSection label="Current thumbnail">
    {hasThumbnail ? (
     <SubToolboxMediaCard
      title={project.videoTitle || project.name}
      meta={selectedAsset ? `Selected Vault asset · ${selectedAsset.name}` : "Legacy / external thumbnail reference"}
      preview={<img src={thumbnailUrl} alt="" className="h-full w-full object-cover" />}
      trailing={<div className="flex items-center gap-1"><ImageIcon size={16}/>{selectedAsset ? <SubToolboxBadge>CANONICAL</SubToolboxBadge> : <SubToolboxBadge>LEGACY</SubToolboxBadge>}</div>}
      onClick={() => navigate("/thumbnail-studio")}
     />
    ) : (
     <SubToolboxStatePanel state="empty" message="No thumbnail is selected. Choose a Vault candidate or open Thumbnail Studio." />
    )}
   </SubToolboxSection>

   <SubToolboxSection label="Canonical thumbnail candidates">
    {candidates.length ? (
     <SubToolboxGrid minItemWidth="compact" density="dense">
      {candidates.map(asset => {
       const preview = asset.previewUrl || asset.url || ""
       return <SubToolboxMediaCard
        key={asset.id}
        selected={selectedAssetId === asset.id}
        title={asset.name}
        meta={asset.projectId === project.id ? "Project asset" : "Thumbnail candidate"}
        preview={preview
         ? <img src={preview} alt="" className="h-full w-full object-cover" />
         : <div className="grid h-full w-full place-items-center"><ImageIcon size={24}/></div>}
        trailing={selectedAssetId === asset.id ? <SubToolboxBadge>SELECTED</SubToolboxBadge> : null}
        onClick={() => selectThumbnail(asset)}
       />
      })}
     </SubToolboxGrid>
    ) : (
     <SubToolboxStatePanel state="empty" message="No image/thumbnail Vault assets are attached to this project yet." />
    )}
   </SubToolboxSection>

   <SubToolboxSection label="Compatibility thumbnail URL">
    <SubToolboxGrid minItemWidth="wide" density="dense">
     <SubToolboxInput
      value={project.thumbnailUrl || ""}
      onChange={event => onUpdate({ thumbnailUrl: event.target.value })}
      placeholder="Legacy/external thumbnail URL…"
      aria-label="Compatibility thumbnail URL"
     />
     <SubToolboxButton
      tone="neutral"
      disabled={!project.thumbnailUrl?.trim() || !project.contentBuildId}
      onClick={importCompatibilityUrl}
     >
      Import URL to Vault
     </SubToolboxButton>
    </SubToolboxGrid>
   </SubToolboxSection>

   <SubToolboxGrid minItemWidth="compact" density="dense">
    <SubToolboxButton tone="accent" icon={<Images size={16}/>} onClick={() => navigate("/thumbnail-studio")}>Open Thumbnail Studio</SubToolboxButton>
    <SubToolboxButton tone="neutral" icon={<PackageOpen size={16}/>} onClick={() => navigate("/vault")}>Open Vault</SubToolboxButton>
    {hasThumbnail ? <SubToolboxButton tone="danger" icon={<Trash2 size={16}/>} onClick={clearThumbnail}>Clear Thumbnail</SubToolboxButton> : null}
   </SubToolboxGrid>
  </SubToolboxStack>
 </SubToolbox>
}

export default ProjectPackagingSubtoolbox
