import React, { useEffect, useState } from "react"
import { BarChart3, Check, Copy, FileText, ImageIcon, RefreshCcw, Send, ShieldCheck, Sparkles, Type, Upload, Zap } from "lucide-react"
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
import { nexusSyncService } from "../services/nexusSyncService"
import { listVideoPackages } from "../services/video-package/VideoPackageRepository"
import { projectPublishingPackage } from "../services/asset-engine/PublishingPackageProjection"
import {
  applyPublishCaptions,
  applyPublishMetadata,
  applyPublishRouting,
  applyPublishSchedulePrivacy,
  applyPublishThumbnail,
  beginYouTubePublishing,
  skipOptionalPublishStep,
  uploadPublishTransactionVideo,
  verifyPublishTransactionRemoteState,
} from "../services/youtube/PublishTransactionYouTubeBridge"
import { completePublishTransaction, listPublishTransactions } from "../services/asset-engine/PublishTransaction"
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
  SubToolboxSelect,
  SubToolboxStatePanel,
  SubToolboxTextArea,
} from "../components/subtoolbox/SubToolboxPrimitives"

const CopyBox: React.FC<{
  label: string
  content: string
  multiline?: boolean
  icon?: React.ReactNode
}> = ({ label, content, multiline = false, icon }) => {
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
  icon?: React.ReactNode
}> = ({ label, items, icon }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const handleCopy = (text: string, index: number) => {
    void navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    window.setTimeout(() => setCopiedIndex(null), 2000)
  }

  if (!items.length) return null

  return (
    <SubToolboxOutputCard title={label} icon={icon} badge={items.length} scroll>
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
  const [publishRefresh, setPublishRefresh] = useState(0)
  const [publishBusy, setPublishBusy] = useState(false)
  const [publishError, setPublishError] = useState<string | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [captionFile, setCaptionFile] = useState<File | null>(null)
  const [publishTitle, setPublishTitle] = useState("")
  const [publishDescription, setPublishDescription] = useState("")
  const [publishTags, setPublishTags] = useState("")
  const [playlistIds, setPlaylistIds] = useState("")
  const [privacyStatus, setPrivacyStatus] = useState<"public"|"private"|"unlisted">("private")
  const [publishAt, setPublishAt] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)

  const publishState = React.useMemo(() => {
    const videoPackage = listVideoPackages()[0] || null
    if (!videoPackage) return { videoPackage: null, projection: null, transaction: null }
    try {
      const projection = projectPublishingPackage(videoPackage)
      return { videoPackage, projection, transaction: listPublishTransactions(projection.contentBuildId)[0] || null }
    } catch {
      return { videoPackage, projection: null, transaction: null }
    }
  }, [publishRefresh])

  useEffect(() => {
    if (!publishTitle && publishState.videoPackage?.identity.workingTitle) setPublishTitle(publishState.videoPackage.identity.workingTitle)
  }, [publishState.videoPackage?.id])

  useEffect(() => {
    if (!result) return
    setPublishTitle(result.titleSets[0]?.title || publishTitle)
    setPublishDescription(result.description || "")
    setPublishTags(result.tags || "")
  }, [result])


  const beginOrResumePublishing = () => {
    if (!publishState.projection) return
    try {
      beginYouTubePublishing(publishState.projection)
      setPublishError(null)
      setPublishRefresh(value => value + 1)
    } catch (error) {
      setPublishError(error instanceof Error ? error.message : String(error))
    }
  }

  const requireTransaction = () => {
    const transaction = listPublishTransactions(publishState.projection?.contentBuildId || "")[0] || publishState.transaction
    if (!transaction) throw new Error("Start the publishing transaction first.")
    return transaction
  }

  const runPublishAction = async (action: () => Promise<unknown>) => {
    setPublishBusy(true)
    try {
      await action()
      setPublishError(null)
      setPublishRefresh(value => value + 1)
    } catch (error) {
      setPublishError(error instanceof Error ? error.message : String(error))
    } finally {
      setPublishBusy(false)
    }
  }

  const uploadVideo = () => runPublishAction(async () => {
    const transaction = requireTransaction()
    if (!videoFile && !transaction.youtubeVideoId) throw new Error("Choose the final video file before uploading.")
    if (transaction.youtubeVideoId) return
    await uploadPublishTransactionVideo({
      transactionId: transaction.id,
      file: videoFile!,
      metadata: { title: publishTitle || publishState.videoPackage?.identity.workingTitle || "ViewTube video", description: publishDescription, tags: publishTags.split(",").map(tag => tag.trim()).filter(Boolean), privacyStatus: "private" },
      onProgress: setUploadProgress,
    })
  })

  const applyMetadata = () => runPublishAction(async () => {
    const transaction = requireTransaction()
    await applyPublishMetadata(transaction.id, { title: publishTitle, description: publishDescription, tags: publishTags.split(",").map(tag => tag.trim()).filter(Boolean), privacyStatus: "private" })
  })
  const applyThumbnail = () => runPublishAction(async () => {
    if (!thumbnailFile) throw new Error("Choose a thumbnail file first.")
    await applyPublishThumbnail(requireTransaction().id, thumbnailFile)
  })
  const applyCaptions = () => runPublishAction(async () => {
    const transaction = requireTransaction()
    if (captionFile) await applyPublishCaptions(transaction.id, captionFile)
    else await skipOptionalPublishStep(transaction.id, "apply-captions", "No captions selected.")
  })
  const applyRouting = () => runPublishAction(async () => {
    const transaction = requireTransaction()
    const ids = playlistIds.split(/[\n,]/).map(value => value.trim()).filter(Boolean)
    if (ids.length) await applyPublishRouting(transaction.id, ids)
    else await skipOptionalPublishStep(transaction.id, "apply-routing", "No playlists selected.")
  })
  const applySchedule = () => runPublishAction(async () => {
    await applyPublishSchedulePrivacy(requireTransaction().id, {
      title: publishTitle,
      description: publishDescription,
      tags: publishTags.split(",").map(tag => tag.trim()).filter(Boolean),
      privacyStatus,
      publishAt: publishAt ? new Date(publishAt).toISOString() : null,
    })
  })

  const verifyAndCompletePublishing = async () => {
    if (!publishState.transaction) return
    setPublishBusy(true)
    try {
      await verifyPublishTransactionRemoteState(publishState.transaction.id)
      completePublishTransaction(publishState.transaction.id)
      setPublishError(null)
      setPublishRefresh(value => value + 1)
    } catch (error) {
      setPublishError(error instanceof Error ? error.message : String(error))
    } finally {
      setPublishBusy(false)
    }
  }

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
        >
          <SubToolboxButton size="compact" tone={formatMode === "longform" ? "ink" : "neutral"} selected={formatMode === "longform"} aria-pressed={formatMode === "longform"} onClick={(event) => { event.stopPropagation(); setFormatMode("longform") }}>Longform</SubToolboxButton>
          <SubToolboxButton size="compact" tone={formatMode === "shorts" ? "ink" : "neutral"} selected={formatMode === "shorts"} aria-pressed={formatMode === "shorts"} onClick={(event) => { event.stopPropagation(); setFormatMode("shorts") }}>Shorts</SubToolboxButton>
        </SubToolboxActions>
      }
    >
      {publishState.projection ? (
        <SubToolboxStack density="comfortable">
          <SubToolbox title="Publishing Control" icon={<Send size={20} strokeWidth={3} />} paletteIndex={basePalette + 1} collapsible isOpenInitial>
            <SubToolboxStack density="comfortable">
              <SubToolboxGrid minItemWidth="compact">
                <SubToolboxOutputCard title="PREFLIGHT" icon={<ShieldCheck size={18} />}>
                  <div className="text-xl font-black">{publishState.projection.ready ? "READY" : publishState.projection.missing.length + " MISSING"}</div>
                  <div>{publishState.projection.ready ? "Canonical package approved." : publishState.projection.missing.join(" · ")}</div>
                </SubToolboxOutputCard>
                <SubToolboxOutputCard title="TRANSACTION" icon={<RefreshCcw size={18} />}>
                  <div className="text-xl font-black">{publishState.transaction?.status.toUpperCase() || "NOT STARTED"}</div>
                  <div>{publishState.transaction ? Object.values(publishState.transaction.steps).filter(step => step?.status === "completed").length + "/10 STEPS COMPLETE" : "Start only after preflight is ready."}</div>
                </SubToolboxOutputCard>
              </SubToolboxGrid>

              <SubToolbox title="Publication Files" icon={<Upload size={20} />} collapsible isOpenInitial>
                <SubToolboxGrid minItemWidth="compact">
                  <SubToolboxFileTarget label={videoFile ? videoFile.name : <>Final video<br/>Select file</>} icon={<Upload size={24}/>} accept="video/*" minHeight={150} onFiles={files => setVideoFile(files?.[0] || null)} />
                  <SubToolboxFileTarget label={thumbnailFile ? thumbnailFile.name : <>Thumbnail<br/>Select image</>} icon={<ImageIcon size={24}/>} accept="image/jpeg,image/png,image/webp" minHeight={150} onFiles={files => setThumbnailFile(files?.[0] || null)} />
                  <SubToolboxFileTarget label={captionFile ? captionFile.name : <>Captions<br/>VTT / SRT optional</>} icon={<FileText size={24}/>} accept=".vtt,.srt,text/vtt,application/x-subrip,text/plain" minHeight={150} onFiles={files => setCaptionFile(files?.[0] || null)} />
                </SubToolboxGrid>
              </SubToolbox>

              <SubToolbox title="YouTube Metadata" icon={<Type size={20}/>} collapsible isOpenInitial>
                <SubToolboxStack>
                  <SubToolboxInput value={publishTitle} onChange={event=>setPublishTitle(event.target.value)} placeholder="YouTube title" aria-label="YouTube title" />
                  <SubToolboxTextArea value={publishDescription} onChange={event=>setPublishDescription(event.target.value)} placeholder="Description" aria-label="YouTube description" />
                  <SubToolboxInput value={publishTags} onChange={event=>setPublishTags(event.target.value)} placeholder="Tags, comma separated" aria-label="YouTube tags" />
                  <SubToolboxInput value={playlistIds} onChange={event=>setPlaylistIds(event.target.value)} placeholder="Playlist IDs, comma separated" aria-label="Playlist IDs" />
                </SubToolboxStack>
              </SubToolbox>

              <SubToolbox title="Privacy + Schedule" icon={<ShieldCheck size={20}/>} collapsible isOpenInitial>
                <SubToolboxGrid minItemWidth="compact">
                  <SubToolboxSelect value={privacyStatus} onChange={event=>setPrivacyStatus(event.target.value as "public"|"private"|"unlisted")} aria-label="Privacy status">
                    <option value="private">Private</option><option value="unlisted">Unlisted</option><option value="public">Public</option>
                  </SubToolboxSelect>
                  <SubToolboxInput type="datetime-local" value={publishAt} onChange={event=>setPublishAt(event.target.value)} aria-label="Scheduled publish time" disabled={privacyStatus !== "private"} />
                </SubToolboxGrid>
              </SubToolbox>

              {publishError ? <SubToolboxStatePanel state="error" message={publishError} /> : null}
              {uploadProgress > 0 && uploadProgress < 100 ? <SubToolboxStatePanel state="loading" message={"VIDEO UPLOAD " + Math.round(uploadProgress) + "%"} /> : null}

              <SubToolbox title="10-Step Transaction" icon={<RefreshCcw size={20}/>} collapsible isOpenInitial>
                <SubToolboxStack density="dense">
                  {(["validate-package","creator-approval","upload-video","bind-youtube","apply-metadata","apply-thumbnail","apply-captions","apply-routing","apply-schedule-privacy","verify-remote-state"] as const).map((step,index) => (
                    <SubToolboxOutputCard key={step} title={(index+1).toString().padStart(2,"0")+" · "+step.replaceAll("-"," ").toUpperCase()}>
                      <strong>{publishState.transaction?.steps[step]?.status?.toUpperCase() || "PENDING"}</strong>
                    </SubToolboxOutputCard>
                  ))}
                </SubToolboxStack>
              </SubToolbox>

              <SubToolboxActions columns={3}>
                <SubToolboxButton tone={publishState.projection.ready ? "success" : "warning"} disabled={!publishState.projection.ready || publishBusy} onClick={beginOrResumePublishing}>{publishState.transaction ? "RESUME" : "START"}</SubToolboxButton>
                <SubToolboxButton disabled={!publishState.transaction || publishBusy} onClick={()=>void uploadVideo()}>{publishState.transaction?.youtubeVideoId ? "VIDEO BOUND" : "UPLOAD VIDEO"}</SubToolboxButton>
                <SubToolboxButton disabled={!publishState.transaction?.youtubeVideoId || publishBusy} onClick={()=>void applyMetadata()}>APPLY METADATA</SubToolboxButton>
                <SubToolboxButton disabled={!publishState.transaction?.youtubeVideoId || publishBusy} onClick={()=>void applyThumbnail()}>THUMBNAIL</SubToolboxButton>
                <SubToolboxButton disabled={!publishState.transaction?.youtubeVideoId || publishBusy} onClick={()=>void applyCaptions()}>{captionFile ? "CAPTIONS" : "SKIP CAPTIONS"}</SubToolboxButton>
                <SubToolboxButton disabled={!publishState.transaction?.youtubeVideoId || publishBusy} onClick={()=>void applyRouting()}>{playlistIds.trim() ? "PLAYLISTS" : "SKIP ROUTING"}</SubToolboxButton>
                <SubToolboxButton disabled={!publishState.transaction?.youtubeVideoId || publishBusy} onClick={()=>void applySchedule()}>PRIVACY / SCHEDULE</SubToolboxButton>
                <SubToolboxButton tone="success" disabled={!publishState.transaction?.youtubeVideoId || publishBusy} onClick={() => void verifyAndCompletePublishing()}>{publishBusy ? "WORKING…" : "VERIFY + COMPLETE"}</SubToolboxButton>
                <SubToolboxButton tone="neutral" onClick={() => setPublishRefresh(value => value + 1)}>REFRESH</SubToolboxButton>
              </SubToolboxActions>
            </SubToolboxStack>
          </SubToolbox>
        </SubToolboxStack>
      ) : (
        <SubToolboxStatePanel state="empty" message="No canonical Publishing Package is available. Finish the active Project package before publishing." />
      )}
      {!result ? (
        <SubToolboxStack density="comfortable">
          <BrainLiveToolInbox destinationToolId="video-publisher" channelId={(authState as any)?.channelId ?? null} onPrefill={applyPrefill} />
          {insightsImported ? <SubToolboxStatePanel state="ready" message="Incoming Brain/tool context loaded. Review before generating or publishing." /> : null}
          <SubToolboxGrid minItemWidth="wide">
            <SubToolbox title="Video Upload" icon={<Upload size={20} strokeWidth={3} />} collapsible isOpenInitial shellClassName="h-full">
              <SubToolboxFileTarget label={videoFile ? <>{videoFile.name}<br />Final video selected</> : <>Drop files or click to upload<br />Upload video</>} icon={<Upload size={28} strokeWidth={3} />} accept="video/*" minHeight={220} onFiles={files => setVideoFile(files?.[0] || null)} />
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
          <SubToolbox title="Generate Assets" icon={<Zap size={20} strokeWidth={3} />} paletteIndex={basePalette + 3} collapsible isOpenInitial>
           {!hasGeminiKey() ? (
            <SubToolboxButton size="action" tone="warning" onClick={() => { window.location.href = "/settings" }}>Missing AI Key: Connect in Settings</SubToolboxButton>
           ) : (
            <SubToolboxGridActionButton onClick={handleGenerate} disabled={loading} tone="yellow" iconName="zap" showIconSection label={loading ? "Generating..." : "Generate All Assets"} />
           )}
          </SubToolbox>
        </SubToolboxStack>
      ) : (
        <SubToolboxStack density="comfortable">
          <SubToolboxActions columns={4}>
            <SubToolboxButton tone="neutral" onClick={() => setResult(null)}>Back</SubToolboxButton>
            <SubToolboxButton disabled={isExporting} onClick={handleExport}>{isExporting ? "Exporting…" : "Export"}</SubToolboxButton>
            <SubToolboxButton tone="success" disabled={isSyncing} onClick={handleSyncToDrive}>{isSyncing ? "Syncing…" : "Vault"}</SubToolboxButton>
            <SubToolboxButton tone="warning" onClick={handleDownloadZip}>ZIP</SubToolboxButton>
          </SubToolboxActions>
          <SubToolbox title="Generated Assets" icon={<Sparkles size={20} strokeWidth={3} />} paletteIndex={basePalette + 4} collapsible isOpenInitial>
           <SubToolboxStack density="comfortable">
            <ConsolidatedCopyBox label="Title Options" items={result.titleSets.map((title) => title.title)} icon={<Type size={20} />} />
            <CopyBox label="Description" content={result.description} multiline icon={<FileText size={20} />} />
            <CopyBox label="Tags" content={result.tags} multiline icon={<BarChart3 size={20} />} />
            {exportUrl ? <SubToolboxLinkButton href={exportUrl} target="_blank" rel="noreferrer">Open exported sheet</SubToolboxLinkButton> : null}
           </SubToolboxStack>
          </SubToolbox>
          <PostActionReflection toolId="VIDEO_PUBLISHER" />
        </SubToolboxStack>
      )}
    </ToolboxScaffold>
  )
}

export default VideoPublisher
