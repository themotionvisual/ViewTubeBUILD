import React, { useCallback, useEffect, useMemo, useState } from "react"
import {
  Boxes,
  Clapperboard,
  FileText,
  ImageIcon,
  Layers3,
  MessageCircle,
  PackageOpen,
  PanelTop,
  RefreshCcw,
  Tags,
  Type,
} from "lucide-react"
import type { VaultAsset } from "@/types"
import { getAssetLineage, listAssets, listContentBuildSnapshots } from "../../../services/assetEngine"
import { listVideoPackages } from "../../../services/video-package/VideoPackageRepository"
import { projectPublishingPackage, type PublishingPackageProjection } from "../../../services/asset-engine/PublishingPackageProjection"
import { listPublishTransactions, type ContentBuildPublishTransaction } from "../../../services/asset-engine/PublishTransaction"
import type { ViewTubeVideoPackage } from "../../../services/video-package/contracts"
import { WidgetShell } from "../WidgetShell"
import {
  WidgetActionButton,
  WidgetBadge,
  WidgetMediaUploadFrame,
  WidgetProgressBar,
  WidgetScrollArea,
  WidgetSizedButton,
  WidgetStatePanel,
  WidgetStepTabs,
} from "../WidgetPrimitives"
import type { CommonWidgetProps } from "../types"
import type { DashboardData } from "../useDashboardData"
import { describeContentBuildReadiness, scopeAssetsToContentBuild } from "./contentBuildWidgetModel"
import "./VideoAssetEngineWidget.css"

type AssetEngineMode = "package" | "publish" | "assets" | "handoff"

type PublishingWidgetState = {
  videoPackage: ViewTubeVideoPackage | null
  projection: PublishingPackageProjection | null
  transaction: ContentBuildPublishTransaction | null
}

type PackageSlot = {
  id: string
  label: string
  detail: string
  keys: readonly string[]
  icon: React.ReactNode
}

const PACKAGE_SLOTS: readonly PackageSlot[] = [
  { id: "thumbnail", label: "THUMBNAIL", detail: "Primary package image", keys: ["thumbnail", "image"], icon: <ImageIcon /> },
  { id: "title", label: "TITLE", detail: "Selected title or variant", keys: ["title", "headline"], icon: <Type /> },
  { id: "description", label: "DESCRIPTION", detail: "Publishing description", keys: ["description"], icon: <FileText /> },
  { id: "tags", label: "TAGS / SEO", detail: "Tags and search metadata", keys: ["tag", "keyword", "seo", "metadata"], icon: <Tags /> },
  { id: "script", label: "SCRIPT", detail: "Script, outline or hook", keys: ["script", "outline", "hook"], icon: <Clapperboard /> },
  { id: "community", label: "COMMUNITY", detail: "Pinned or community copy", keys: ["community", "pinned comment", "comment"], icon: <MessageCircle /> },
  { id: "routing", label: "ROUTING", detail: "End screen, cards or playlist", keys: ["end screen", "end-screen", "card", "playlist"], icon: <PanelTop /> },
  { id: "production", label: "PRODUCTION", detail: "Editor, timeline or render asset", keys: ["editor", "timeline", "render", "video"], icon: <Layers3 /> },
] as const

const searchableAssetText = (asset: VaultAsset) =>
  [
    asset.name,
    asset.kind,
    asset.projectName,
    asset.toolId,
    ...(asset.tags || []),
    JSON.stringify(asset.metadata || {}),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()

const matchSlotAsset = (assets: VaultAsset[], slot: PackageSlot) =>
  assets.find((asset) => {
    const haystack = searchableAssetText(asset)
    return slot.keys.some((key) => haystack.includes(key))
  }) || null

const formatAssetTime = (timestamp: number) => {
  if (!Number.isFinite(timestamp)) return "UNKNOWN"
  const ageMinutes = Math.max(0, Math.round((Date.now() - timestamp) / 60_000))
  if (ageMinutes < 1) return "NOW"
  if (ageMinutes < 60) return ageMinutes + "M"
  const hours = Math.round(ageMinutes / 60)
  if (hours < 24) return hours + "H"
  return Math.round(hours / 24) + "D"
}

export const VideoAssetEngineWidget: React.FC<
  CommonWidgetProps & { data: DashboardData; onNavigate?: (to: string) => void }
> = ({ onNavigate, ...common }) => {
  const [mode, setMode] = useState<AssetEngineMode>("package")
  const [assets, setAssets] = useState<VaultAsset[]>([])
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null)

  const refreshAssets = useCallback(() => {
    const next = listAssets()
    setAssets(next)
    setSelectedAssetId((current) => current && next.some((asset) => asset.id === current) ? current : next[0]?.id || null)
  }, [])

  useEffect(() => {
    refreshAssets()
  }, [refreshAssets])

  const videoPackages = useMemo(() => listVideoPackages(), [assets])
  const contentBuilds = useMemo(() => listContentBuildSnapshots(), [assets])
  const activeVideoPackage = videoPackages[0] || null
  const activeBuild = contentBuilds.find((build) => build.id === activeVideoPackage?.contentBuildId) || contentBuilds[0] || null
  const scopedAssets = useMemo(
    () => scopeAssetsToContentBuild(assets, activeBuild),
    [assets, activeBuild],
  )
  useEffect(() => {
    setSelectedAssetId((current) => current && scopedAssets.some((asset) => asset.id === current)
      ? current
      : scopedAssets[0]?.id || null)
  }, [scopedAssets])

  const slotAssets = useMemo(
    () => PACKAGE_SLOTS.map((slot) => ({ slot, asset: matchSlotAsset(scopedAssets, slot) })),
    [scopedAssets],
  )
  const readyCount = slotAssets.filter((entry) => Boolean(entry.asset)).length
  const readiness = Math.round((readyCount / PACKAGE_SLOTS.length) * 100)
  const selectedAsset = scopedAssets.find((asset) => asset.id === selectedAssetId) || null
  const previewAsset = selectedAsset?.previewUrl || selectedAsset?.url
    ? selectedAsset
    : scopedAssets.find((asset) => Boolean(asset.previewUrl || asset.url)) || null
  const previewUrl = previewAsset?.previewUrl || previewAsset?.url || null
  const lineage = useMemo(
    () => selectedAsset ? getAssetLineage(selectedAsset.id).slice(0, 5) : [],
    [selectedAsset],
  )
  const packageName = activeBuild?.legacyProjectName || selectedAsset?.projectName || previewAsset?.projectName || "LATEST VIDEO PACKAGE"
  const buildReadiness = describeContentBuildReadiness(activeBuild)

  const publishingState = useMemo<PublishingWidgetState>(() => {
    const videoPackage = activeVideoPackage
    if (!videoPackage) return { videoPackage: null, projection: null, transaction: null }
    try {
      const projection = projectPublishingPackage(videoPackage)
      const transaction = listPublishTransactions(projection.contentBuildId)[0] || null
      return { videoPackage, projection, transaction }
    } catch {
      return { videoPackage, projection: null, transaction: null }
    }
  }, [activeVideoPackage, assets])

  const packageView = (
    <div className="vt-asset-engine-package">
      <div className="vt-asset-engine-composer">
        <section className="vt-asset-engine-preview-panel">
          <div className="vt-asset-engine-package-label">
            <span>PACKAGE COMPOSER</span>
            <WidgetBadge status={readiness === 100 ? "positive" : "warning"} height={18}>
              {readyCount}/{PACKAGE_SLOTS.length} READY
            </WidgetBadge>
          </div>
          <WidgetMediaUploadFrame
            icon={<PackageOpen />}
            title={packageName}
            detail={scopedAssets.length ? "Open the canonical Vault to inspect or replace assets attached to this ContentBuild." : activeBuild ? "This ContentBuild has no attached durable assets yet." : "No durable Asset Engine media is available yet."}
            hasValue={Boolean(previewUrl)}
            preview={previewUrl ? <img src={previewUrl} alt="" /> : undefined}
            onBrowse={() => onNavigate?.("/vault")}
            className="vt-asset-engine-preview"
          />
          {activeBuild ? (
            <div className="vt-asset-engine-build-summary">
              <span>CONTENTBUILD</span>
              <strong>{activeBuild.stage.toUpperCase()} · REV {activeBuild.revision}</strong>
              <small>{buildReadiness.assetCount} ASSETS · {buildReadiness.selectedCount} SELECTED · {buildReadiness.finalCount} FINAL · {buildReadiness.variantCount} VARIANTS</small>
            </div>
          ) : null}
          <WidgetProgressBar
            value={readyCount}
            max={PACKAGE_SLOTS.length}
            label="PACKAGE READINESS"
            displayValue={readiness + "%"}
            height={24}
            tone={readiness === 100 ? "primary" : "secondary"}
          />
        </section>

        <section className="vt-asset-engine-slot-panel" aria-label="Video package asset slots">
          <div className="vt-asset-engine-slot-grid">
            {slotAssets.map(({ slot, asset }) => (
              <button
                key={slot.id}
                type="button"
                className={"vt-asset-engine-slot " + (asset?.id === selectedAssetId ? "is-selected" : "")}
                onClick={() => asset && setSelectedAssetId(asset.id)}
                disabled={!asset}
                aria-label={asset ? "Inspect " + slot.label + ": " + asset.name : slot.label + " is missing"}
              >
                <span className="vt-asset-engine-slot-icon" aria-hidden="true">{slot.icon}</span>
                <span className="vt-asset-engine-slot-copy">
                  <strong>{slot.label}</strong>
                  <small>{asset ? asset.name : slot.detail}</small>
                </span>
                <WidgetBadge status={asset ? "positive" : "warning"} height={18}>
                  {asset ? "READY" : "MISSING"}
                </WidgetBadge>
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="vt-asset-engine-inspector">
        <div>
          <span>SELECTED ASSET</span>
          <strong>{selectedAsset?.name || "NO ASSET SELECTED"}</strong>
          <small>{selectedAsset ? (selectedAsset.kind + " · " + (selectedAsset.projectName || "UNSCOPED")) : "Select a ready package slot to inspect its canonical Vault asset."}</small>
        </div>
        <WidgetSizedButton height={24} tone="secondary" onClick={refreshAssets}>
          <RefreshCcw aria-hidden="true" /> REFRESH
        </WidgetSizedButton>
      </div>
    </div>
  )

  const publishView = publishingState.projection ? (
    <div className="vt-asset-engine-handoff">
      <section className="vt-asset-engine-handoff-card">
        <div className="vt-asset-engine-handoff-head">
          <span>PUBLISHING PACKAGE</span>
          <WidgetBadge status={publishingState.projection.ready ? "positive" : "warning"} height={18}>
            {publishingState.projection.ready ? "READY" : publishingState.projection.missing.length + " MISSING"}
          </WidgetBadge>
        </div>
        <strong className="vt-asset-engine-handoff-title">{publishingState.videoPackage?.identity.workingTitle || "VIDEO PACKAGE"}</strong>
        <p>{publishingState.transaction
          ? "Transaction " + publishingState.transaction.status.toUpperCase() + " · " + Object.values(publishingState.transaction.steps).filter(step => step?.status === "completed").length + " STEPS COMPLETE"
          : publishingState.projection.ready ? "Canonical package is approved and ready to enter the resumable publishing pipeline." : "Resolve: " + publishingState.projection.missing.join(" · ")}</p>
      </section>
      <WidgetProgressBar
        value={publishingState.transaction ? Object.values(publishingState.transaction.steps).filter(step => step?.status === "completed").length : (publishingState.projection.ready ? 10 : Math.max(0, 10 - publishingState.projection.missing.length))}
        max={10}
        label="PUBLISH PIPELINE"
        displayValue={publishingState.transaction?.status.toUpperCase() || (publishingState.projection.ready ? "READY" : "PREFLIGHT")}
        height={24}
        tone={publishingState.projection.ready ? "primary" : "secondary"}
      />
      <div className="vt-asset-engine-destinations">
        <WidgetActionButton tone="primary" height={32} onClick={() => onNavigate?.("/video-publisher")}>
          {publishingState.transaction ? "RESUME PUBLISHING" : publishingState.projection.ready ? "PUBLISH VIDEO" : "FIX PUBLISH PACKAGE"}
        </WidgetActionButton>
        <WidgetActionButton height={32} onClick={() => onNavigate?.("/studio")}>OPEN STUDIO HUB</WidgetActionButton>
      </div>
    </div>
  ) : (
    <WidgetStatePanel state={{ status: "empty", data: null, message: "No canonical Publishing Package is available yet. Open Studio Hub to finish the video package." }} />
  )

  const assetsView = scopedAssets.length ? (
    <WidgetScrollArea ariaLabel="Recent Asset Engine assets" className="vt-asset-engine-scroll">
      <div className="vt-asset-engine-asset-list">
        {scopedAssets.slice(0, 24).map((asset) => (
          <button
            key={asset.id}
            type="button"
            className={"vt-asset-engine-asset-row " + (asset.id === selectedAssetId ? "is-selected" : "")}
            onClick={() => setSelectedAssetId(asset.id)}
          >
            <span className="vt-asset-engine-asset-kind">{asset.kind.slice(0, 1).toUpperCase()}</span>
            <span className="vt-asset-engine-asset-copy">
              <strong>{asset.name}</strong>
              <small>{asset.projectName || asset.toolId || "UNSCOPED ASSET"}</small>
            </span>
            <WidgetBadge height={18}>{formatAssetTime(asset.updatedAt)}</WidgetBadge>
          </button>
        ))}
      </div>
    </WidgetScrollArea>
  ) : (
    <WidgetStatePanel
      state={{
        status: "empty",
        data: null,
        message: activeBuild ? "No durable Vault assets are attached to the active ContentBuild yet." : "No durable Vault assets exist yet. Generate or save an asset from a creator tool to populate this engine.",
      }}
    />
  )

  const handoffView = (
    <div className="vt-asset-engine-handoff">
      <section className="vt-asset-engine-handoff-card">
        <div className="vt-asset-engine-handoff-head">
          <span>ACTIVE ASSET</span>
          <WidgetBadge status={selectedAsset ? "positive" : "neutral"} height={18}>
            {selectedAsset ? selectedAsset.kind.toUpperCase() : "NONE"}
          </WidgetBadge>
        </div>
        <strong className="vt-asset-engine-handoff-title">{selectedAsset?.name || "SELECT AN ASSET"}</strong>
        <p>{selectedAsset ? "Move this canonical asset forward without losing its Vault identity, project scope, or lineage." : "Choose an asset in Package or Assets mode before handing work to another ViewTube system."}</p>
      </section>

      <section className="vt-asset-engine-lineage">
        <span>LINEAGE</span>
        <div className="vt-asset-engine-lineage-track">
          {lineage.length ? lineage.map((asset, index) => (
            <React.Fragment key={asset.id}>
              <WidgetSizedButton height={24} tone="secondary" onClick={() => setSelectedAssetId(asset.id)}>{asset.name}</WidgetSizedButton>
              {index < lineage.length - 1 ? <i aria-hidden="true">→</i> : null}
            </React.Fragment>
          )) : <small>NO LINEAGE AVAILABLE</small>}
        </div>
      </section>

      <div className="vt-asset-engine-destinations">
        <WidgetActionButton tone="primary" height={32} disabled={!selectedAsset} onClick={() => onNavigate?.("/studio")}>
          OPEN IN STUDIO
        </WidgetActionButton>
        <WidgetActionButton height={32} disabled={!selectedAsset} onClick={() => onNavigate?.("/editor")}>
          SEND TO EDITOR
        </WidgetActionButton>
        <WidgetActionButton height={32} onClick={() => onNavigate?.("/vault")}>
          OPEN VAULT
        </WidgetActionButton>
      </div>
    </div>
  )

  return (
    <WidgetShell {...common} icon={<Boxes size={22} />} controlDensity="compact">
      <div className="vt-asset-engine-widget">
        <WidgetStepTabs
          label="Asset Engine mode"
          value={mode}
          items={[
            { id: "package", label: "PACKAGE" },
            { id: "publish", label: "PUBLISH" },
            { id: "assets", label: "ASSETS" },
            { id: "handoff", label: "HANDOFF" },
          ]}
          onChange={setMode}
        />
        <main className="vt-asset-engine-main">
          {mode === "package" ? packageView : mode === "publish" ? publishView : mode === "assets" ? assetsView : handoffView}
        </main>
        <footer className="vt-asset-engine-footer">
          <WidgetActionButton tone="primary" height={32} onClick={() => onNavigate?.("/studio")}>
            {readyCount < PACKAGE_SLOTS.length ? "FIX " + (PACKAGE_SLOTS.length - readyCount) + " MISSING ASSETS" : "OPEN FULL ASSET ENGINE"}
          </WidgetActionButton>
          <WidgetActionButton height={32} onClick={() => onNavigate?.("/vault")}>
            VAULT
          </WidgetActionButton>
        </footer>
      </div>
    </WidgetShell>
  )
}
