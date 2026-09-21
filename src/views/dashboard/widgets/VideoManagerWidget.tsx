import React, { useEffect, useMemo, useRef, useState } from "react"
import {
  BookOpen,
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  ShieldCheck,
} from "lucide-react"
import {
  fetchUserPlaylists,
  fetchVideoCategories,
  fetchVideoSnippetDetails,
  updateVideo,
  updateVideoThumbnail,
} from "../../../services/youtubeService"
import { generateEducationalTimestampQuestions } from "../../../services/gemini"
import { useUnifiedAccount } from "../../../context/UnifiedAccountContext"
import type { DashboardData } from "../useDashboardData"
import type { CommonWidgetProps } from "../types"
import {
  WidgetBadge,
  WidgetChoice as Choice,
  WidgetDisclosure as Module,
  WidgetField as Field,
  WidgetFooter,
  WidgetIconButton,
  WidgetMediaUploadFrame,
  WidgetSizedButton,
  WidgetSizedSelect,
  WidgetSplitButton,
  WidgetTag,
  WidgetVideoSelect,
  WidgetWorkflowMain,
  type WidgetSelectOption as SelectOption,
  type WidgetVideoSelectOption,
} from "../WidgetPrimitives"
import { WidgetShell } from "../WidgetShell"
import "./videoManagerWidget.css"

const STORAGE_KEY = "vt_data_edit_state"
const TAG_CHARACTER_LIMIT = 500
const YT_STANDARD_CATEGORY_IDS = new Set([
  "1", "2", "10", "15", "17", "19", "20", "22", "23", "24", "25", "26", "27", "28", "29",
])

const FALLBACK_CATEGORIES = [
  ["2", "Autos & Vehicles"], ["23", "Comedy"], ["27", "Education"], ["24", "Entertainment"],
  ["1", "Film & Animation"], ["20", "Gaming"], ["26", "Howto & Style"], ["10", "Music"],
  ["25", "News & Politics"], ["29", "Nonprofits & Activism"], ["22", "People & Blogs"],
  ["15", "Pets & Animals"], ["28", "Science & Technology"], ["17", "Sports"], ["19", "Travel & Events"],
] as const

const AD_CATEGORIES = [
  "Inappropriate language",
  "Adult content",
  "Violence",
  "Shocking content",
  "Harmful acts and unreliable claims",
  "Recreational drugs content",
  "Enabling dishonest behaviour",
  "Hateful and derogatory content",
  "Firearms-related content",
  "Sensitive events",
  "Controversial issues",
] as const

type WorkspacePage = "details" | "options" | "ads" | "timestamps"
type WidgetProps = CommonWidgetProps & { data: DashboardData }

interface OriginalMetadata {
  title: string
  description: string
  tags: string[]
  categoryId: string
  privacyStatus: string
}

const formatDuration = (seconds?: number | null) => {
  if (!seconds || seconds <= 0) return ""
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
    : `${minutes}:${String(secs).padStart(2, "0")}`
}

const equalTags = (left: string[], right: string[]) =>
  left.length === right.length && left.every((tag, index) => tag === right[index])

export const VideoManagerWidget = ({ data, ...common }: WidgetProps) => {
  const account = useUnifiedAccount()
  const videos = data.videoAssets
  const [page, setPage] = useState<WorkspacePage>("details")
  const [selectedVideoId, setSelectedVideoId] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [privacyStatus, setPrivacyStatus] = useState("public")
  const [playlistId, setPlaylistId] = useState("")
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [madeForKids, setMadeForKids] = useState("no")
  const [paidPromotion, setPaidPromotion] = useState(false)
  const [alteredContent, setAlteredContent] = useState("no")
  const [autoChapters, setAutoChapters] = useState(true)
  const [language, setLanguage] = useState("en")
  const [captionCert, setCaptionCert] = useState("none")
  const [recordingDate, setRecordingDate] = useState("")
  const [location, setLocation] = useState("")
  const [license, setLicense] = useState("youtube")
  const [allowEmbedding, setAllowEmbedding] = useState(true)
  const [notifySubscribers, setNotifySubscribers] = useState(true)
  const [adSuitability, setAdSuitability] = useState<Record<string, string>>({})
  const [noneOfTheAbove, setNoneOfTheAbove] = useState(false)
  const [categories, setCategories] = useState<SelectOption[]>(() =>
    FALLBACK_CATEGORIES.map(([value, label]) => ({ value, label })),
  )
  const [playlists, setPlaylists] = useState<SelectOption[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loadingSelection, setLoadingSelection] = useState(false)
  const [error, setError] = useState("")
  const [timestampQuestions, setTimestampQuestions] = useState<string[]>([])
  const [timestampsLoading, setTimestampsLoading] = useState(false)
  const [originalData, setOriginalData] = useState<OriginalMetadata>({
    title: "",
    description: "",
    tags: [],
    categoryId: "",
    privacyStatus: "public",
  })

  const thumbnailInputRef = useRef<HTMLInputElement>(null)

  const selectedAsset = useMemo(
    () => videos.find((video) => video.videoId === selectedVideoId) || null,
    [selectedVideoId, videos],
  )

  const videoOptions = useMemo<WidgetVideoSelectOption[]>(() =>
    videos.map((video) => ({
      value: video.videoId,
      label: video.title || video.videoId,
      thumbnail: video.thumbnailUrl || `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`,
      duration: formatDuration(video.durationSeconds),
      meta: video.format ? video.format.toUpperCase() : undefined,
    })),
  [videos])

  useEffect(() => {
    if (!data.authState.isAuthenticated) return
    Promise.allSettled([fetchVideoCategories(), fetchUserPlaylists()]).then(([categoryResult, playlistResult]) => {
      if (categoryResult.status === "fulfilled") {
        setCategories(categoryResult.value
          .filter((category: { id: string }) => YT_STANDARD_CATEGORY_IDS.has(String(category.id)))
          .map((category: { id: string; title: string }) => ({ value: String(category.id), label: category.title })))
      }
      if (playlistResult.status === "fulfilled") {
        setPlaylists(playlistResult.value.map((playlist: { id: string; title: string }) => ({
          value: playlist.id,
          label: playlist.title,
        })))
      }
    })
  }, [data.authState.isAuthenticated])

  useEffect(() => {
    if (!selectedVideoId) return
    const asset = videos.find((video) => video.videoId === selectedVideoId)
    const cached = JSON.parse(localStorage.getItem(`${STORAGE_KEY}_${selectedVideoId}`) || "{}")
    const base: OriginalMetadata = {
      title: asset?.title || "",
      description: "",
      tags: [],
      categoryId: cached.categoryId || "",
      privacyStatus: cached.privacyStatus || "public",
    }

    setTitle(base.title)
    setDescription("")
    setTags([])
    setCategoryId(base.categoryId)
    setPrivacyStatus(base.privacyStatus)
    setPlaylistId(cached.playlistId || "")
    setAdSuitability(cached.adSuitability || {})
    setNoneOfTheAbove(Boolean(cached.noneOfTheAbove))
    setThumbnailFile(null)
    setThumbnailPreview(asset?.thumbnailUrl || `https://img.youtube.com/vi/${selectedVideoId}/hqdefault.jpg`)
    setOriginalData(base)
    setPage("details")
    setError("")
    setSaved(false)
    setLoadingSelection(true)

    fetchVideoSnippetDetails([selectedVideoId]).then((details) => {
      const detail = details[selectedVideoId]
      if (!detail) return
      const next: OriginalMetadata = {
        title: asset?.title || "",
        description: detail.description || "",
        tags: detail.tags || [],
        categoryId: detail.categoryId || cached.categoryId || "",
        privacyStatus: cached.privacyStatus || "public",
      }
      setDescription(next.description)
      setTags(next.tags)
      setCategoryId(next.categoryId)
      setOriginalData(next)
    }).catch(() => {
      setError("Some published metadata could not be loaded. Available video identity is still shown.")
    }).finally(() => {
      setLoadingSelection(false)
    })
  }, [selectedVideoId, videos])

  useEffect(() => {
    if (categoryId !== "27" && page === "timestamps") setPage("details")
  }, [categoryId, page])

  const readThumbnail = (file?: File) => {
    if (!file || !file.type.startsWith("image/")) return
    setThumbnailFile(file)
    const reader = new FileReader()
    reader.onload = () => setThumbnailPreview(String(reader.result || ""))
    reader.readAsDataURL(file)
  }

  const addTag = () => {
    const next = newTag.trim()
    if (!next || tags.includes(next)) return
    if ([...tags, next].join(", ").length > TAG_CHARACTER_LIMIT) {
      setError(`Tags are limited to ${TAG_CHARACTER_LIMIT} characters.`)
      return
    }
    setTags((current) => [...current, next])
    setNewTag("")
  }

  const generateTimestampQuestions = async () => {
    setTimestampsLoading(true)
    setError("")
    try {
      setTimestampQuestions(await generateEducationalTimestampQuestions({ title, description, tags }, data.brain))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to generate timestamp questions.")
    } finally {
      setTimestampsLoading(false)
    }
  }

  const reset = () => {
    setTitle(originalData.title)
    setDescription(originalData.description)
    setTags(originalData.tags)
    setCategoryId(originalData.categoryId)
    setPrivacyStatus(originalData.privacyStatus)
    setThumbnailFile(null)
    setThumbnailPreview(selectedAsset?.thumbnailUrl || (selectedVideoId ? `https://img.youtube.com/vi/${selectedVideoId}/hqdefault.jpg` : null))
    setError("")
    setSaved(false)
  }

  const save = async () => {
    if (!selectedVideoId) return setError("Select a published video first.")
    if (!title.trim()) return setError("Add a video title before continuing.")
    if (account.serverEnabled && !account.snapshot.grantedCapabilities.includes("youtube_comments")) {
      setError("Reconnect Channel to grant YouTube management permission.")
      void account.start("reconnect_channel", window.location.pathname)
      return
    }

    setSaving(true)
    setError("")
    try {
      await updateVideo(selectedVideoId, {
        title: title.trim(),
        description,
        tags,
        categoryId,
        privacyStatus,
        madeForKids: madeForKids === "yes",
        recordingDate,
        locationDescription: location,
        license,
        embeddable: allowEmbedding,
        notifySubscribers,
      })
      if (thumbnailFile) await updateVideoThumbnail(selectedVideoId, thumbnailFile)
      localStorage.setItem(`${STORAGE_KEY}_${selectedVideoId}`, JSON.stringify({
        categoryId,
        privacyStatus,
        playlistId,
        adSuitability,
        noneOfTheAbove,
      }))
      setOriginalData({ title: title.trim(), description, tags, categoryId, privacyStatus })
      setThumbnailFile(null)
      setSaved(true)
      window.setTimeout(() => setSaved(false), 3000)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The video could not be saved. Try again.")
    } finally {
      setSaving(false)
    }
  }

  const dirtyFields = useMemo(() => {
    if (!selectedVideoId) return []
    const dirty: string[] = []
    if (title !== originalData.title) dirty.push("Title")
    if (description !== originalData.description) dirty.push("Description")
    if (!equalTags(tags, originalData.tags)) dirty.push("Tags")
    if (categoryId !== originalData.categoryId) dirty.push("Category")
    if (privacyStatus !== originalData.privacyStatus) dirty.push("Visibility")
    if (thumbnailFile) dirty.push("Thumbnail")
    return dirty
  }, [categoryId, description, originalData, privacyStatus, selectedVideoId, tags, thumbnailFile, title])

  const tabs: { id: WorkspacePage; label: string }[] = [
    { id: "details", label: "Details" },
    { id: "options", label: "Options" },
    { id: "ads", label: "Ad suitability" },
    ...(categoryId === "27" ? [{ id: "timestamps" as const, label: "Timestamps" }] : []),
  ]

  return (
    <WidgetShell {...common} icon={<Pencil size={22} />}>
      <div className="video-manager-widget">
        <input ref={thumbnailInputRef} hidden type="file" accept="image/*" onChange={(event) => readThumbnail(event.target.files?.[0])} />

        <section className="video-manager-selector" aria-label="Published video selection">
          <WidgetVideoSelect
            value={selectedVideoId}
            onChange={(value) => {
              setSelectedVideoId(value)
              setPage("details")
              setError("")
            }}
            options={videoOptions}
            label="Published video"
            placeholder="Select a published video…"
            height={38}
            tone="default"
            searchable
          />
        </section>

        <WidgetWorkflowMain className="video-manager-main">
          {!selectedAsset ? (
            <section className="video-manager-package-desk is-empty" aria-label="Video package desk">
              <div className="video-manager-desk-placeholder">
                <Pencil aria-hidden="true" />
                <strong>Select a published video</strong>
                <span>The package desk will keep its thumbnail, metadata and change state together.</span>
              </div>
            </section>
          ) : (
            <>
              <section className="video-manager-package-desk" aria-label="Video package desk">
                <div className="video-manager-package-identity">
                  <img src={thumbnailPreview || selectedAsset.thumbnailUrl} alt={`Thumbnail for ${selectedAsset.title}`} />
                  <div>
                    <span>Editing published video</span>
                    <strong>{selectedAsset.title}</strong>
                    <small>{selectedAsset.videoId}</small>
                  </div>
                </div>
                <div className="video-manager-package-status" aria-label="Package change state">
                  <WidgetBadge height={24} status={loadingSelection ? "warning" : "positive"}>
                    {loadingSelection ? "LOADING METADATA" : "PACKAGE LOADED"}
                  </WidgetBadge>
                  <WidgetBadge height={24} status={dirtyFields.length ? "warning" : "neutral"}>
                    {dirtyFields.length ? `${dirtyFields.length} UNSAVED` : "NO UNSAVED CHANGES"}
                  </WidgetBadge>
                  {dirtyFields.slice(0, 3).map((field) => <WidgetBadge key={field} height={18}>{field}</WidgetBadge>)}
                </div>
              </section>

              {page === "details" ? (
                <div className="video-manager-details">
                  <section className="video-manager-thumbnail-panel">
                    <WidgetMediaUploadFrame
                      className="video-manager-thumbnail-frame"
                      icon={<ImagePlus />}
                      title="Thumbnail"
                      detail="Choose a replacement image"
                      actionLabel={thumbnailFile ? "Replacement selected" : "Replace thumbnail"}
                      hasValue={Boolean(thumbnailPreview)}
                      preview={thumbnailPreview ? <img src={thumbnailPreview} alt={`Current thumbnail for ${selectedAsset.title}`} /> : undefined}
                      onBrowse={() => thumbnailInputRef.current?.click()}
                      onDropFile={readThumbnail}
                    />
                  </section>

                  <section className="video-manager-metadata-panel">
                    <Field label="Video title">
                      <input className="vt-input" aria-label="Video title" value={title} maxLength={100} onChange={(event) => setTitle(event.target.value)} />
                      <small className="widget-character-count">{title.length}/100</small>
                    </Field>
                    <Field label="Description">
                      <textarea className="vt-textarea video-manager-description" aria-label="Description" value={description} maxLength={5000} onChange={(event) => setDescription(event.target.value)} rows={4} />
                      <small className="widget-character-count">{description.length}/5000</small>
                    </Field>
                    <div className="video-manager-tags">
                      <div className="widget-tag-list">
                        {tags.map((tag) => (
                          <WidgetTag key={tag} onRemove={() => setTags((current) => current.filter((item) => item !== tag))}>{tag}</WidgetTag>
                        ))}
                      </div>
                      <div className="video-manager-tag-entry">
                        <input
                          className="vt-input"
                          aria-label="Add tag"
                          value={newTag}
                          onChange={(event) => setNewTag(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault()
                              addTag()
                            }
                          }}
                          placeholder="Add tag…"
                        />
                        <WidgetIconButton icon={<Plus />} label="Add tag" height={32} tone="primary" onClick={addTag} />
                      </div>
                    </div>
                    <div className="video-manager-selects">
                      <WidgetSizedSelect height={32} value={privacyStatus} onChange={setPrivacyStatus} label="Visibility" options={[{ value: "public", label: "Public" }, { value: "unlisted", label: "Unlisted" }, { value: "private", label: "Private" }]} placeholder="Visibility" />
                      <WidgetSizedSelect height={32} value={categoryId} onChange={setCategoryId} label="Category" options={categories} placeholder="Category" />
                      <WidgetSizedSelect height={32} value={playlistId} onChange={setPlaylistId} label="Playlist" options={playlists} placeholder="Playlist" />
                    </div>
                  </section>
                </div>
              ) : null}

              {page === "options" ? (
                <div className="video-manager-disclosures">
                  <Module title="Audience and restrictions">
                    <Choice type="radio" name="manage-kids" value="yes" label="Yes, this video is made for kids" checked={madeForKids === "yes"} onChange={() => setMadeForKids("yes")} />
                    <Choice type="radio" name="manage-kids" value="no" label="No, this video is not made for kids" checked={madeForKids === "no"} onChange={() => setMadeForKids("no")} />
                  </Module>
                  <Module title="Disclosures and altered content">
                    <Choice label="Contains paid promotion" checked={paidPromotion} onChange={() => setPaidPromotion((value) => !value)} />
                    <Choice type="radio" name="manage-altered" value="yes" label="Contains realistic altered or synthetic content" checked={alteredContent === "yes"} onChange={() => setAlteredContent("yes")} />
                    <Choice type="radio" name="manage-altered" value="no" label="Does not contain realistic altered content" checked={alteredContent === "no"} onChange={() => setAlteredContent("no")} />
                  </Module>
                  <Module title="Automatic concepts and chapters">
                    <Choice label="Allow automatic chapters and key moments" checked={autoChapters} onChange={() => setAutoChapters((value) => !value)} />
                  </Module>
                  <Module title="Language and captions certification">
                    <div className="video-manager-control-grid">
                      <Field label="Video language"><WidgetSizedSelect height={32} value={language} onChange={setLanguage} label="Video language" options={[{ value: "en", label: "English" }, { value: "es", label: "Spanish" }, { value: "fr", label: "French" }, { value: "de", label: "German" }, { value: "none", label: "Not applicable" }]} /></Field>
                      <Field label="Caption certification"><WidgetSizedSelect height={32} value={captionCert} onChange={setCaptionCert} label="Caption certification" options={[{ value: "none", label: "None" }, { value: "neverAired", label: "Never aired on U.S. television" }, { value: "grantedExemption", label: "FCC exemption granted" }]} /></Field>
                    </div>
                  </Module>
                  <Module title="Recording date and location">
                    <div className="video-manager-control-grid">
                      <Field label="Recording date"><input className="vt-input" type="date" value={recordingDate} onChange={(event) => setRecordingDate(event.target.value)} /></Field>
                      <Field label="Video location"><input className="vt-input" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="None" /></Field>
                    </div>
                  </Module>
                  <Module title="License and distribution">
                    <Field label="License"><WidgetSizedSelect height={32} value={license} onChange={setLicense} label="License" options={[{ value: "youtube", label: "Standard YouTube license" }, { value: "creativeCommon", label: "Creative Commons - Attribution" }]} /></Field>
                    <Choice label="Allow embedding" checked={allowEmbedding} onChange={() => setAllowEmbedding((value) => !value)} />
                    <Choice label="Notify subscribers" checked={notifySubscribers} onChange={() => setNotifySubscribers((value) => !value)} />
                  </Module>
                </div>
              ) : null}

              {page === "ads" ? (
                <section className="video-manager-clearance">
                  <header><ShieldCheck /><div><strong>Ad suitability</strong><span>Review declarations for this published package.</span></div></header>
                  <div className="video-manager-ad-grid">
                    {AD_CATEGORIES.map((category) => (
                      <Module title={category} key={category}>
                        <Choice type="radio" name={`manage-${category}`} value="none" label="None" checked={(adSuitability[category] || "none") === "none"} onChange={() => setAdSuitability((current) => ({ ...current, [category]: "none" }))} />
                        <Choice type="radio" name={`manage-${category}`} value="limited" label="Limited or contextual" checked={adSuitability[category] === "limited"} onChange={() => setAdSuitability((current) => ({ ...current, [category]: "limited" }))} />
                        <Choice type="radio" name={`manage-${category}`} value="strong" label="Strong or repeated" checked={adSuitability[category] === "strong"} onChange={() => setAdSuitability((current) => ({ ...current, [category]: "strong" }))} />
                      </Module>
                    ))}
                  </div>
                  <Choice label="None of the above applies" checked={noneOfTheAbove} onChange={() => setNoneOfTheAbove((value) => !value)} />
                </section>
              ) : null}

              {page === "timestamps" ? (
                <section className="video-manager-timestamps">
                  <header><BookOpen /><div><strong>Educational timestamps</strong><span>Generate teaching questions from the current package metadata.</span></div></header>
                  {timestampQuestions.length ? (
                    <ol>{timestampQuestions.map((question, index) => <li key={`${question}-${index}`}>{question}</li>)}</ol>
                  ) : <p className="widget-empty-copy">No timestamp questions generated yet.</p>}
                  <WidgetSizedButton height={32} tone="primary" disabled={timestampsLoading} onClick={() => void generateTimestampQuestions()}>
                    {timestampsLoading ? <><Loader2 className="is-spinning" /> Generating…</> : "Generate timestamp questions"}
                  </WidgetSizedButton>
                </section>
              ) : null}
            </>
          )}
        </WidgetWorkflowMain>

        {error ? <div className="widget-inline-error" role="alert">{error}</div> : null}

        <WidgetFooter className="video-manager-footer">
          <nav className="video-manager-pages" aria-label="Video manager sections">
            {tabs.map((tab) => (
              <WidgetSizedButton
                key={tab.id}
                height={24}
                textFit="adaptive"
                tone={page === tab.id ? "primary" : "default"}
                aria-pressed={page === tab.id}
                disabled={!selectedAsset}
                onClick={() => setPage(tab.id)}
              >
                {tab.label}
              </WidgetSizedButton>
            ))}
          </nav>
          <WidgetSplitButton type="button" tone="primary" width="full" icon={<Save />} disabled={saving || !selectedAsset || dirtyFields.length === 0} onClick={() => void save()}>
            {saving ? "Saving…" : saved ? "Saved" : dirtyFields.length ? `Save ${dirtyFields.length} change${dirtyFields.length === 1 ? "" : "s"}` : "No changes"}
          </WidgetSplitButton>
          <WidgetIconButton icon={<RotateCcw />} label="Revert changes" height={32} tone="secondary" disabled={!selectedAsset || dirtyFields.length === 0} onClick={reset} />
        </WidgetFooter>
      </div>
    </WidgetShell>
  )
}
