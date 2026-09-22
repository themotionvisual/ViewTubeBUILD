import React, { useEffect, useState } from "react"
import { BarChart3, Check, Copy, FileText, Sparkles, Type, Upload, Zap } from "lucide-react"
import JSZip from "jszip"
import { useBrain } from "../context/useBrain"
import { generateSeoData, hasGeminiKey } from "../services/gemini"
import {
 addAssetVariant,
 createAssetVariantGroup,
 createVersionedAsset,
} from "../services/assetEngine"
import {
 recordContentBuildToolInput,
 recordContentBuildToolOutput,
 resolveWorkspaceContentBuildToolContext,
} from "../services/asset-engine/ToolContext"
import {
  approvePublishTransaction,
  beginPublishTransaction,
  completePublishStep,
  completePublishTransaction,
  failPublishTransaction,
  type ContentBuildPublishTransaction,
} from "../services/asset-engine/PublishTransaction"
import { YouTubeUploadService } from "../services/youtube/youtubeUploadService"
import {
  addUnifiedPlaylistItem,
  getUnifiedVideo,
  updateUnifiedThumbnail,
  updateUnifiedVideo,
  uploadUnifiedCaptions,
} from "../services/youtube/youtubeWriteTransport"
import { nexusSyncService } from "../services/nexusSyncService"
import { sheetsService } from "../services/sheetsService"
import type { SeoResult } from "../types"
import BrainLiveToolInbox from "../components/brain/BrainLiveToolInbox"
import { PostActionReflection } from "../components/PostActionReflection"
import { SubToolbox, SubToolboxGridActionButton, ToolboxScaffold } from "../components/Toolbox"
import { SubToolboxActions, SubToolboxGrid, SubToolboxStack } from "../components/subtoolbox/SubToolboxLayouts"
import {
  SubToolboxButton,
  SubToolboxFileTarget,
  SubToolboxInput,
  SubToolboxLinkButton,
  SubToolboxOutputCard,
  SubToolboxStatePanel,
  SubToolboxTextArea,
} from "../components/subtoolbox/SubToolboxPrimitives"
import { hexToRgba } from "../components/ToolboxUISystem"
import { getToolboxPaletteColors } from "../styles/toolboxPalette"

const CopyBox: React.FC<{
  label: string
  content: string
  multiline?: boolean
  accentColor?: string
  icon?: React.ReactNode
}> = ({ label, content, multiline = false, accentColor = "#ccff00", icon }) => {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    void navigator.clipboard.writeText(content)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <SubToolboxOutputCard
      title={label}
      icon={icon}
      accentColor={accentColor}
      scroll
      action={
        <SubToolboxButton aria-label={`Copy ${label}`} size="compact" tone="ink" icon={copied ? <Check size={18} /> : <Copy size={18} />} onClick={handleCopy} className="!w-10 shrink-0" />
      }
    >
      <div className={multiline ? "whitespace-pre-wrap font-mono text-sm leading-relaxed" : "text-xl font-black tracking-tight"}>{content}</div>
    </SubToolboxOutputCard>
  )
}

const ConsolidatedCopyBox: React.FC<{
  label: string
  items: string[]
  accentColor?: string
  icon?: React.ReactNode
}> = ({ label, items, accentColor = "#00d2ff", icon }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const handleCopy = (text: string, index: number) => {
    void navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    window.setTimeout(() => setCopiedIndex(null), 2000)
  }

  if (!items.length) return null

  return (
    <SubToolboxOutputCard title={label} icon={icon} accentColor={accentColor} badge={items.length} scroll>
      <SubToolboxStack density="dense">
        {items.map((item, index) => (
          <div key={`${index}-${item}`} className="flex items-start gap-3 border-b-2 border-black/10 pb-2 last:border-0 last:pb-0">
            <span className="mt-2 font-black text-black/25">{index + 1}</span>
            <div className="min-w-0 flex-1 py-2 text-sm font-bold leading-tight">{item}</div>
            <SubToolboxButton aria-label={`Copy title option ${index + 1}`} size="compact" tone="ink" icon={copiedIndex === index ? <Check size={14} /> : <Copy size={14} />} onClick={() => handleCopy(item, index)} className="!w-10 shrink-0" />
          </div>
        ))}
      </SubToolboxStack>
    </SubToolboxOutputCard>
  )
}

interface VideoPublisherProps {
  embedded?: boolean
  collapsible?: boolean
  isOpenInitial?: boolean
  paletteIndex?: number
}

const VideoPublisher: React.FC<VideoPublisherProps> = ({ embedded = false, collapsible = false, isOpenInitial = true, paletteIndex }) => {
  const basePalette = paletteIndex ?? 0
  const generateAssetsPalette = getToolboxPaletteColors(basePalette + 3)
  const { brain, updateBrain, registerProvider, unregisterProvider, setSeoState, authState } = useBrain()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SeoResult | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [exportUrl, setExportUrl] = useState<string | null>(null)
  const [concept, setConcept] = useState(brain.coreConcept)
  const [niche, setNiche] = useState(brain.targetNiche)
  const [audience, setAudience] = useState("")
  const [script, setScript] = useState("")
  const [videoLength, setVideoLength] = useState("10:00")
  const [channelHandle, setChannelHandle] = useState("https://youtube.com/@yourchannel")
  const [resourceLinks, setResourceLinks] = useState("")
  const [durationStats, setDurationStats] = useState("Avg. Views")
  const [formatMode, setFormatMode] = useState<"longform" | "shorts">("longform")
  const [isOpen, setIsOpen] = useState(isOpenInitial)
  const [missingFields, setMissingFields] = useState({ concept: false, niche: false })
  const [insightsImported, setInsightsImported] = useState(false)
  const [publishTransaction, setPublishTransaction] = useState<ContentBuildPublishTransaction | null>(null)
  const [publishFile, setPublishFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState("")
  const [publishThumbnailFile, setPublishThumbnailFile] = useState<File | null>(null)
  const [remoteVerified, setRemoteVerified] = useState(false)
  const [captionFile, setCaptionFile] = useState<File | null>(null)
  const [captionLanguage, setCaptionLanguage] = useState("en")
  const [playlistId, setPlaylistId] = useState("")
  const [publishMode, setPublishMode] = useState<"private" | "unlisted" | "public" | "scheduled">("private")
  const [publishAt, setPublishAt] = useState("")

  useEffect(() => {
    registerProvider("VIDEO_PUBLISHER")
    return () => unregisterProvider("VIDEO_PUBLISHER")
  }, [])

  const applyPrefill = (payload: Record<string, unknown>) => {
    const prefill = payload as Record<string, any>
    if (prefill.concept) setConcept(String(prefill.concept))
    if (prefill.niche) setNiche(String(prefill.niche))
    if (prefill.audience) setAudience(String(prefill.audience))
    if (prefill.script) setScript(String(prefill.script))
    if (prefill.videoLength) setVideoLength(String(prefill.videoLength))
    if (prefill.channelHandle) setChannelHandle(String(prefill.channelHandle))
    if (prefill.formatMode === "shorts" || prefill.formatMode === "longform") setFormatMode(prefill.formatMode)
    const insights = [prefill.analysis, prefill.strategicAnalysis, prefill.resourceLinks].filter(Boolean).join("\n\n")
    if (insights) setResourceLinks((previous) => [previous, insights].filter(Boolean).join("\n\n"))
    setInsightsImported(true)
  }

  useEffect(() => {
    const onInsights = (event: Event) => applyPrefill((event as CustomEvent<Record<string, unknown>>).detail || {})
    window.addEventListener("vt_media_analysis_insights_ready", onInsights as EventListener)
    try {
      const cached = localStorage.getItem("vt_video_publisher_prefill")
      if (cached) applyPrefill(JSON.parse(cached))
    } catch {
      // Ignore malformed legacy prefill data.
    }
    return () => window.removeEventListener("vt_media_analysis_insights_ready", onInsights as EventListener)
  }, [])

  const handleGenerate = async () => {
    if (!concept || !niche) {
      setMissingFields({ concept: !concept, niche: !niche })
      return
    }
    setLoading(true)
    try {
      updateBrain({ coreConcept: concept, targetNiche: niche })
      const contentContext = resolveWorkspaceContentBuildToolContext(
        brain,
        "video-publisher",
        ["script", "title", "thumbnail", "description", "tags"],
      )
      if (contentContext) {
        recordContentBuildToolInput({
          contentBuildId: contentContext.contentBuildId,
          toolId: "video-publisher",
          assetIds: Object.values(contentContext.selectedAssets).filter(Boolean).map(asset => asset!.id),
          summary: "Generate publishing metadata from the active ContentBuild package.",
          metadata: { concept, niche, formatMode, videoLength },
        })
      }

      const data = await generateSeoData(concept, niche, script, "", videoLength, channelHandle, resourceLinks, formatMode === "longform" ? "Longform" : "Shorts", undefined, brain)
      setResult(data)
      setSeoState({ winningTitle: data.titleSets[0].title, winningKeywords: data.tags.split(",").map((keyword) => keyword.trim()).slice(0, 5), descriptionDraft: data.description })

      if (contentContext) {
        const titleGroup = createAssetVariantGroup({
          contentBuildId: contentContext.contentBuildId,
          slot: "title",
          label: "Publisher title candidates",
          sourceToolId: "video-publisher",
        })
        const titleAssets = data.titleSets.map((titleSet, index) => {
          const created = createVersionedAsset({
            sourceToolId: "video-publisher",
            sourceKind: "studio-tool",
            payloadKind: "metadata",
            name: `Title candidate ${index + 1}`,
            summary: titleSet.title,
            kind: "document",
            payload: titleSet,
            tags: ["title", "candidate", "publishing", "content-build"],
            slot: "title",
            label: `Title ${index + 1}`,
            parentAssetId: contentContext.selectedAssets.title?.id || null,
            context: {
              contentBuildId: contentContext.contentBuildId,
              projectId: contentContext.build.legacyProjectId || null,
              projectName: contentContext.build.legacyProjectName || null,
              videoId: contentContext.build.youtube?.videoId || null,
              stage: "metadata",
              parentAssetIds: contentContext.selectedAssets.title ? [contentContext.selectedAssets.title.id] : [],
            },
          })
          addAssetVariant({
            contentBuildId: contentContext.contentBuildId,
            groupId: titleGroup.id,
            assetId: created.asset.id,
            versionId: created.version?.id || null,
            label: `Candidate ${index + 1}`,
            sourceToolId: "video-publisher",
          })
          return created
        })
        const descriptionAsset = createVersionedAsset({
          sourceToolId: "video-publisher",
          sourceKind: "studio-tool",
          payloadKind: "metadata",
          name: "Publishing description",
          summary: data.description,
          kind: "document",
          payload: { description: data.description },
          tags: ["description", "publishing", "content-build"],
          slot: "description",
          label: "Generated description",
          parentAssetId: contentContext.selectedAssets.description?.id || null,
          context: {
            contentBuildId: contentContext.contentBuildId,
            projectId: contentContext.build.legacyProjectId || null,
            projectName: contentContext.build.legacyProjectName || null,
            videoId: contentContext.build.youtube?.videoId || null,
            stage: "metadata",
          },
        })
        const tagsAsset = createVersionedAsset({
          sourceToolId: "video-publisher",
          sourceKind: "studio-tool",
          payloadKind: "metadata",
          name: "Publishing tags",
          summary: data.tags,
          kind: "document",
          payload: { tags: data.tags },
          tags: ["tags", "publishing", "content-build"],
          slot: "tags",
          label: "Generated tags",
          parentAssetId: contentContext.selectedAssets.tags?.id || null,
          context: {
            contentBuildId: contentContext.contentBuildId,
            projectId: contentContext.build.legacyProjectId || null,
            projectName: contentContext.build.legacyProjectName || null,
            videoId: contentContext.build.youtube?.videoId || null,
            stage: "metadata",
          },
        })
        recordContentBuildToolOutput({
          contentBuildId: contentContext.contentBuildId,
          toolId: "video-publisher",
          assetIds: [...titleAssets.map(item => item.asset.id), descriptionAsset.asset.id, tagsAsset.asset.id],
          summary: `Created ${titleAssets.length} title variants plus description and tags for the active ContentBuild.`,
          metadata: { titleVariantGroupId: titleGroup.id },
        })
      }
    } catch (error: any) {
      console.error(error)
      alert(`SEO Protocols failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const preparePublishTransaction = () => {
    const contentContext = resolveWorkspaceContentBuildToolContext(
      brain,
      "video-publisher",
      ["final-render", "title", "thumbnail", "description", "tags"],
    )
    if (!contentContext) {
      alert("Open this Publisher from a Project or ContentBuild before preparing publication.")
      return
    }
    const required = ["final-render", "title", "thumbnail", "description"]
    const missing = required.filter(slot => !contentContext.selectedAssets[slot])
    if (missing.length) {
      alert(`Publishing package is missing: ${missing.join(", ")}.`)
      return
    }
    const transaction = beginPublishTransaction({
      contentBuildId: contentContext.contentBuildId,
      toolId: "video-publisher",
    })
    setPublishTransaction(transaction)
  }

  const approvePreparedPublish = () => {
    if (!publishTransaction) return
    setPublishTransaction(approvePublishTransaction(publishTransaction.id, "video-publisher"))
  }

  const uploadApprovedPublish = async () => {
    if (!publishTransaction || publishTransaction.status !== "approved" || !publishFile || !result) return
    setUploadError("")
    setUploadProgress(0)
    try {
      const title = result.titleSets[0]?.title?.trim()
      if (!title) throw new Error("A final publishing title is required.")
      const uploaded = await YouTubeUploadService.uploadVideo(
        publishFile,
        {
          title,
          description: result.description,
          tags: result.tags.split(",").map(tag => tag.trim()).filter(Boolean),
          privacyStatus: "private",
        },
        setUploadProgress,
      ) as { id?: string }
      if (!uploaded?.id) throw new Error("YouTube completed the upload without returning a video ID.")
      const next = completePublishStep({
        transactionId: publishTransaction.id,
        step: "upload-video",
        youtubeVideoId: uploaded.id,
        youtubeBinding: {
          status: "private",
          uploadCompletedAt: new Date().toISOString(),
        },
        receipt: { videoId: uploaded.id, privacyStatus: "private", filename: publishFile.name, size: publishFile.size },
        toolId: "video-publisher",
      })
      setPublishTransaction(next)
    } catch (error) {
      const failed = failPublishTransaction(publishTransaction.id, "upload-video", error, "video-publisher")
      setPublishTransaction(failed)
      setUploadError(error instanceof Error ? error.message : String(error))
    }
  }

  const applyAndVerifyPublishingPackage = async () => {
    if (!publishTransaction?.youtubeVideoId || !result) return
    setUploadError("")
    setRemoteVerified(false)
    const videoId = publishTransaction.youtubeVideoId
    try {
      const title = result.titleSets[0]?.title?.trim()
      if (!title) throw new Error("A final title is required.")
      await updateUnifiedVideo(videoId, {
        title,
        description: result.description,
        tags: result.tags.split(",").map(tag => tag.trim()).filter(Boolean),
        privacyStatus: "private",
      })
      let next = completePublishStep({
        transactionId: publishTransaction.id,
        step: "apply-metadata",
        receipt: { title, privacyStatus: "private" },
        toolId: "video-publisher",
      })
      if (publishThumbnailFile) {
        await updateUnifiedThumbnail(videoId, publishThumbnailFile)
        next = completePublishStep({
          transactionId: publishTransaction.id,
          step: "apply-thumbnail",
          receipt: { filename: publishThumbnailFile.name, size: publishThumbnailFile.size, type: publishThumbnailFile.type },
          toolId: "video-publisher",
        })
      }
      const remote = await getUnifiedVideo(videoId) as { items?: Array<{ snippet?: { title?: string; description?: string }; status?: { privacyStatus?: string } }> }
      const actual = remote.items?.[0]
      if (!actual) throw new Error("YouTube did not return the uploaded video during remote verification.")
      const mismatches = [
        actual.snippet?.title !== title ? "title" : null,
        actual.snippet?.description !== result.description ? "description" : null,
        actual.status?.privacyStatus !== "private" ? "privacyStatus" : null,
      ].filter(Boolean)
      if (mismatches.length) throw new Error(`Remote verification mismatch: ${mismatches.join(", ")}`)
      next = completePublishStep({
        transactionId: publishTransaction.id,
        step: "verify-remote-state",
        youtubeVideoId: videoId,
        youtubeBinding: { status: "private", lastVerifiedAt: new Date().toISOString() },
        receipt: { verified: true, title: actual.snippet?.title, privacyStatus: actual.status?.privacyStatus },
        toolId: "video-publisher",
      })
      setPublishTransaction(next)
      setRemoteVerified(true)
    } catch (error) {
      const failed = failPublishTransaction(publishTransaction.id, "verify-remote-state", error, "video-publisher")
      setPublishTransaction(failed)
      setUploadError(error instanceof Error ? error.message : String(error))
    }
  }

  const finishPublishingTransaction = async () => {
    if (!publishTransaction?.youtubeVideoId || !result || !remoteVerified) return
    setUploadError("")
    const videoId = publishTransaction.youtubeVideoId
    try {
      let next = publishTransaction
      if (captionFile) {
        const captionReceipt = await uploadUnifiedCaptions(videoId, captionFile, { language: captionLanguage })
        next = completePublishStep({
          transactionId: next.id,
          step: "apply-captions",
          receipt: { language: captionLanguage, filename: captionFile.name, response: captionReceipt },
          toolId: "video-publisher",
        })
      }
      if (playlistId.trim()) {
        const playlistReceipt = await addUnifiedPlaylistItem(playlistId.trim(), videoId)
        next = completePublishStep({
          transactionId: next.id,
          step: "apply-routing",
          receipt: { playlistId: playlistId.trim(), response: playlistReceipt },
          toolId: "video-publisher",
        })
      }
      const scheduledIso = publishMode === "scheduled" && publishAt ? new Date(publishAt).toISOString() : null
      const privacyStatus = publishMode === "scheduled" ? "private" : publishMode
      await updateUnifiedVideo(videoId, {
        title: result.titleSets[0]?.title,
        description: result.description,
        tags: result.tags.split(",").map(tag => tag.trim()).filter(Boolean),
        privacyStatus,
        ...(scheduledIso ? { publishAt: scheduledIso } : {}),
      })
      next = completePublishStep({
        transactionId: next.id,
        step: "apply-schedule-privacy",
        youtubeVideoId: videoId,
        youtubeBinding: {
          status: scheduledIso ? "scheduled" : privacyStatus === "public" ? "published" : privacyStatus,
          scheduledAt: scheduledIso,
          publishedAt: privacyStatus === "public" ? new Date().toISOString() : null,
        },
        receipt: { privacyStatus, publishAt: scheduledIso },
        toolId: "video-publisher",
      })
      const remote = await getUnifiedVideo(videoId) as { items?: Array<{ snippet?: { title?: string }; status?: { privacyStatus?: string; publishAt?: string } }> }
      const actual = remote.items?.[0]
      if (!actual) throw new Error("YouTube did not return the video during final verification.")
      if (actual.snippet?.title !== result.titleSets[0]?.title || actual.status?.privacyStatus !== privacyStatus) {
        throw new Error("Final YouTube verification did not match the intended publishing state.")
      }
      next = completePublishStep({
        transactionId: next.id,
        step: "verify-remote-state",
        youtubeVideoId: videoId,
        youtubeBinding: {
          status: scheduledIso ? "scheduled" : privacyStatus === "public" ? "published" : privacyStatus,
          scheduledAt: scheduledIso,
          publishedAt: privacyStatus === "public" ? new Date().toISOString() : null,
          lastVerifiedAt: new Date().toISOString(),
        },
        receipt: { final: true, privacyStatus: actual.status?.privacyStatus, publishAt: actual.status?.publishAt || null },
        toolId: "video-publisher",
      })
      next = completePublishTransaction(next.id, "video-publisher")
      setPublishTransaction(next)
    } catch (error) {
      const failed = failPublishTransaction(publishTransaction.id, "verify-remote-state", error, "video-publisher")
      setPublishTransaction(failed)
      setUploadError(error instanceof Error ? error.message : String(error))
    }
  }

  const handleExport = async () => {
    if (!result) return
    setIsExporting(true)
    try {
      const exportResult = await sheetsService.exportSeoResult(concept, result)
      setExportUrl(exportResult.spreadsheetUrl)
    } catch (error) {
      console.error(error)
      alert("Sheets Export failed. Check connection.")
    } finally {
      setIsExporting(false)
    }
  }

  const handleSyncToDrive = async () => {
    if (!result) return
    setIsSyncing(true)
    try {
      await nexusSyncService.syncSeoToDrive(concept, result)
      alert("SEO Assets synced to Cloud Vault!")
    } catch (error: any) {
      console.error(error)
      alert(`Cloud Sync failed: ${error.message}`)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleDownloadZip = async () => {
    if (!result) return
    const zip = new JSZip()
    zip.file("seo_report.txt", `VIEW TUBE SEO REPORT\nConcept: ${concept}\n\nTITLES:\n${result.titleSets.map((title) => title.title).join("\n")}\n\nDESCRIPTION:\n${result.description}`)
    const content = await zip.generateAsync({ type: "blob" })
    const url = URL.createObjectURL(content)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `viewtube_seo_${Date.now()}.zip`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <ToolboxScaffold
      title="VIDEO PUBLISHER"
      subtitle="Create SEO optimized titles, descriptions, tags + more for all your new + published content"
      icon={<Zap size={40} strokeWidth={3} className="text-black" />}
      headerColor="bg-[#CCFF00]"
      iconBoxColor="bg-[#00FF99]"
      paletteIndex={paletteIndex}
      collapsible={collapsible}
      isOpen={isOpen}
      onToggle={() => setIsOpen(!isOpen)}
      embedded={embedded}
      helpText="Create a full metadata package for your video. Generate titles, descriptions, tags, and packaging prompts from your concept."
      shellClassName="animate-fade-in"
      contentClassName={embedded ? "p-0" : "p-8"}
      headerActions={
        <SubToolboxActions
          columns={2}
          className="mr-2 w-[210px]"
          aria-label="Video format"
          style={{
            ["--vt-subtoolbox-fill" as string]: "#CCFF00",
            ["--vt-subtoolbox-shadow" as string]: hexToRgba("#CCFF00", 0.45),
          }}
        >
          <SubToolboxButton size="compact" tone={formatMode === "longform" ? "ink" : "neutral"} selected={formatMode === "longform"} aria-pressed={formatMode === "longform"} onClick={(event) => { event.stopPropagation(); setFormatMode("longform") }}>Longform</SubToolboxButton>
          <SubToolboxButton size="compact" tone={formatMode === "shorts" ? "ink" : "neutral"} selected={formatMode === "shorts"} aria-pressed={formatMode === "shorts"} onClick={(event) => { event.stopPropagation(); setFormatMode("shorts") }}>Shorts</SubToolboxButton>
        </SubToolboxActions>
      }
    >
      {!result ? (
        <SubToolboxStack density="comfortable">
          <BrainLiveToolInbox destinationToolId="video-publisher" channelId={(authState as any)?.channelId ?? null} onPrefill={applyPrefill} />
          {insightsImported ? <SubToolboxStatePanel state="ready" message="Incoming Brain/tool context loaded. Review before generating or publishing." /> : null}
          <SubToolboxGrid minItemWidth="wide">
            <SubToolbox title="Video Upload" icon={<Upload size={20} strokeWidth={3} />} collapsible isOpenInitial shellClassName="h-full">
              <SubToolboxFileTarget label={<>Drop files or click to upload<br />Upload video</>} icon={<Upload size={28} strokeWidth={3} />} minHeight={220} />
            </SubToolbox>
            <SubToolbox title="Video Script" icon={<FileText size={20} strokeWidth={3} />} collapsible isOpenInitial shellClassName="h-full" contentClassName="h-full">
              <SubToolboxTextArea aria-label="Video script" value={script} onChange={(event) => setScript(event.target.value)} placeholder="Paste your script here..." height="fill" className="text-base" />
            </SubToolbox>
          </SubToolboxGrid>
          <SubToolbox title="Video Info" icon={<Sparkles size={20} strokeWidth={3} />} collapsible isOpenInitial>
            <SubToolboxStack>
              <SubToolboxGrid minItemWidth="compact">
                <SubToolboxInput aria-label="Video concept" aria-invalid={missingFields.concept} value={concept} onChange={(event) => setConcept(event.target.value)} placeholder="Video concept" />
                <SubToolboxInput aria-label="Target niche" aria-invalid={missingFields.niche} value={niche} onChange={(event) => setNiche(event.target.value)} placeholder="Target niche" />
                <SubToolboxInput aria-label="Intended audience" value={audience} onChange={(event) => setAudience(event.target.value)} placeholder="Intended audience" />
                <SubToolboxInput aria-label="Video length" value={videoLength} onChange={(event) => setVideoLength(event.target.value)} placeholder="10:45" />
                <SubToolboxInput aria-label="Channel URL" value={channelHandle} onChange={(event) => setChannelHandle(event.target.value)} placeholder="Channel URL" />
                <SubToolboxInput aria-label="Current statistics" value={durationStats} onChange={(event) => setDurationStats(event.target.value)} placeholder="Current stats" />
              </SubToolboxGrid>
              <SubToolboxInput aria-label="Description links or imported context" value={resourceLinks} onChange={(event) => setResourceLinks(event.target.value)} placeholder="Description links / imported context" />
            </SubToolboxStack>
          </SubToolbox>
          {!hasGeminiKey() ? (
            <SubToolboxButton size="action" tone="warning" onClick={() => { window.location.href = "/settings" }}>Missing AI Key: Connect in Settings</SubToolboxButton>
          ) : (
            <SubToolboxGridActionButton onClick={handleGenerate} disabled={loading} tone="yellow" surfaceColor={generateAssetsPalette.header} controlColor={generateAssetsPalette.icon} shadowColor={hexToRgba(generateAssetsPalette.header, 0.45)} iconName="zap" showIconSection label={loading ? "Generating..." : "Generate All Assets"} />
          )}
        </SubToolboxStack>
      ) : (
        <SubToolboxStack density="comfortable">
          <SubToolboxActions columns={4}>
            <SubToolboxButton tone="neutral" onClick={() => setResult(null)}>Back</SubToolboxButton>
            <SubToolboxButton disabled={isExporting} onClick={handleExport}>{isExporting ? "Exporting…" : "Export"}</SubToolboxButton>
            <SubToolboxButton tone="success" disabled={isSyncing} onClick={handleSyncToDrive}>{isSyncing ? "Syncing…" : "Vault"}</SubToolboxButton>
            <SubToolboxButton tone="warning" onClick={handleDownloadZip}>ZIP</SubToolboxButton>
          </SubToolboxActions>
          <SubToolbox title="Publish Transaction" icon={<Upload size={20} strokeWidth={3} />} collapsible isOpenInitial>
            <SubToolboxStack>
              <SubToolboxStatePanel
                state={publishTransaction?.status === "approved" ? "ready" : publishTransaction ? "warning" : "empty"}
                message={publishTransaction
                  ? `ContentBuild publication is ${publishTransaction.status}. Upload remains blocked until the creator explicitly approves it.`
                  : "Validate the canonical ContentBuild package and prepare an idempotent publish transaction."}
              />
              <SubToolboxActions columns={2}>
                <SubToolboxButton tone="neutral" onClick={preparePublishTransaction}>Validate + Prepare</SubToolboxButton>
                <SubToolboxButton
                  tone="success"
                  disabled={!publishTransaction || publishTransaction.status !== "awaiting-approval"}
                  onClick={approvePreparedPublish}
                >
                  Approve Publish
                </SubToolboxButton>
              </SubToolboxActions>
              {publishTransaction?.status === "approved" ? (
                <>
                  <SubToolboxStatePanel
                    state="ready"
                    message="Creator approval recorded. Choose the final rendered video file, then upload it privately through the canonical resumable YouTube transport."
                  />
                  <input
                    aria-label="Final video file"
                    type="file"
                    accept="video/*"
                    onChange={(event) => setPublishFile(event.target.files?.[0] || null)}
                  />
                  <SubToolboxButton tone="success" disabled={!publishFile} onClick={uploadApprovedPublish}>
                    {uploadProgress > 0 && uploadProgress < 100 ? `Uploading ${Math.round(uploadProgress)}%` : "Upload Private Video"}
                  </SubToolboxButton>
                </>
              ) : null}
              {publishTransaction?.youtubeVideoId ? (
                <>
                  <SubToolboxStatePanel state={remoteVerified ? "ready" : "warning"} message={remoteVerified
                    ? `YouTube video ${publishTransaction.youtubeVideoId} matches the intended private publishing state.`
                    : `YouTube video ${publishTransaction.youtubeVideoId} is bound. Apply the canonical package and verify the remote state before changing visibility.`} />
                  <input
                    aria-label="YouTube thumbnail file"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => setPublishThumbnailFile(event.target.files?.[0] || null)}
                  />
                  <SubToolboxButton tone="success" onClick={applyAndVerifyPublishingPackage}>
                    Apply Package + Verify
                  </SubToolboxButton>
                </>
              ) : null}
              {remoteVerified && publishTransaction?.youtubeVideoId ? (
                <>
                  <input aria-label="Caption file" type="file" accept=".srt,.vtt,text/vtt,application/x-subrip" onChange={(event) => setCaptionFile(event.target.files?.[0] || null)} />
                  <SubToolboxInput value={captionLanguage} onChange={(event) => setCaptionLanguage(event.target.value)} placeholder="Caption language · en" />
                  <SubToolboxInput value={playlistId} onChange={(event) => setPlaylistId(event.target.value)} placeholder="Optional YouTube playlist ID" />
                  <SubToolboxSelect value={publishMode} onChange={(event) => setPublishMode(event.target.value as typeof publishMode)}>
                    <option value="private">Keep Private</option>
                    <option value="unlisted">Unlisted</option>
                    <option value="public">Publish Now</option>
                    <option value="scheduled">Schedule</option>
                  </SubToolboxSelect>
                  {publishMode === "scheduled" ? (
                    <SubToolboxInput type="datetime-local" value={publishAt} onChange={(event) => setPublishAt(event.target.value)} />
                  ) : null}
                  <SubToolboxButton tone="success" disabled={publishMode === "scheduled" && !publishAt} onClick={finishPublishingTransaction}>
                    Apply Final State + Complete
                  </SubToolboxButton>
                </>
              ) : null}
              {uploadError ? <SubToolboxStatePanel state="error" message={uploadError} /> : null}
            </SubToolboxStack>
          </SubToolbox>
          <ConsolidatedCopyBox label="Title Options" items={result.titleSets.map((title) => title.title)} accentColor="#ff4d6f" icon={<Type size={20} />} />
          <CopyBox label="Description" content={result.description} multiline accentColor="#00d2ff" icon={<FileText size={20} />} />
          <CopyBox label="Tags" content={result.tags} multiline accentColor="#ccff00" icon={<BarChart3 size={20} />} />
          {exportUrl ? <SubToolboxLinkButton href={exportUrl} target="_blank" rel="noreferrer">Open exported sheet</SubToolboxLinkButton> : null}
          <PostActionReflection toolId="VIDEO_PUBLISHER" />
        </SubToolboxStack>
      )}
    </ToolboxScaffold>
  )
}

export default VideoPublisher
