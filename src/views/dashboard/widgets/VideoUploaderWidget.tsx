import React, { useEffect, useRef, useState } from "react"
import {
  BookOpen,
  FileVideo2,
  ImagePlus,
  Loader2,
  Plus,
  RotateCcw,
  Save,
  ShieldCheck,
  UploadCloud,
} from "lucide-react"
import {
  fetchChannelPublishingDefaults,
  fetchUserPlaylists,
  fetchVideoCategories,
  updateVideoThumbnail,
  uploadVideo,
} from "../../../services/youtubeService"
import { generateEducationalTimestampQuestions } from "../../../services/gemini"
import { useUnifiedAccount } from "../../../context/UnifiedAccountContext"
import type { DashboardData } from "../useDashboardData"
import type { CommonWidgetProps } from "../types"
import {
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
  WidgetWorkflowMain,
  type WidgetSelectOption as SelectOption,
} from "../WidgetPrimitives"
import { WidgetShell } from "../WidgetShell"
import { InstrumentExplanation, InstrumentStages, WidgetInstrument } from "../instruments/WidgetInstrument"
import "./videoUploaderWidget.css"

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

const limitTagsToCharacterBudget = (values: string[]) => values.reduce<string[]>((accepted, value) => {
  const tag = value.trim()
  if (!tag || accepted.includes(tag)) return accepted
  return [...accepted, tag].join(", ").length <= TAG_CHARACTER_LIMIT ? [...accepted, tag] : accepted
}, [])

const describeFileSize = (size: number) => {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`
  return `${(size / (1024 * 1024)).toFixed(size >= 10 * 1024 * 1024 ? 0 : 1)} MB`
}

export const VideoUploaderWidget = ({ data, ...common }: WidgetProps) => {
  const account = useUnifiedAccount()
  const [page, setPage] = useState<WorkspacePage>("details")
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [privacyStatus, setPrivacyStatus] = useState("public")
  const [playlistId, setPlaylistId] = useState("")
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
  const [error, setError] = useState("")
  const [defaultsLoading, setDefaultsLoading] = useState<"description" | "tags" | null>(null)
  const [timestampQuestions, setTimestampQuestions] = useState<string[]>([])
  const [timestampsLoading, setTimestampsLoading] = useState(false)

  const videoInputRef = useRef<HTMLInputElement>(null)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)
  const tagInputRef = useRef<HTMLInputElement>(null)

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
    try {
      const cached = JSON.parse(localStorage.getItem("vt_bridge_image_video-uploader") || "null")
      if (cached?.imageUrl) setThumbnailPreview(cached.imageUrl)
    } catch {
      // Optional bridge data must never prevent the uploader from rendering.
    }

    const onNavigate = (event: Event) => {
      const detail = (event as CustomEvent<{ targetWidget?: string; videoTitle?: string }>).detail
      if (detail?.targetWidget !== "video-uploader") return
      setPage("details")
      if (detail.videoTitle) setTitle(detail.videoTitle)
    }
    const onImage = (event: Event) => {
      const detail = (event as CustomEvent<{ targetWidget?: string; imageUrl?: string }>).detail
      if (!detail?.imageUrl || (detail.targetWidget && detail.targetWidget !== "video-uploader")) return
      setThumbnailPreview(detail.imageUrl)
    }

    window.addEventListener("vt_navigate_widget", onNavigate)
    window.addEventListener("vt_dashboard_generated_image", onImage)
    return () => {
      window.removeEventListener("vt_navigate_widget", onNavigate)
      window.removeEventListener("vt_dashboard_generated_image", onImage)
    }
  }, [])

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

  const applyChannelDefaults = async (target: "description" | "tags") => {
    setDefaultsLoading(target)
    setError("")
    try {
      const defaults = await fetchChannelPublishingDefaults()
      if (target === "description") {
        setDescription(defaults.description)
        if (!defaults.description) setError("Your channel has no default description in YouTube branding settings.")
      } else {
        setTags(limitTagsToCharacterBudget(defaults.tags))
        if (!defaults.tags.length) setError("Your channel has no default keywords in YouTube branding settings.")
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load channel defaults.")
    } finally {
      setDefaultsLoading(null)
    }
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
    setVideoFile(null)
    setThumbnailFile(null)
    setThumbnailPreview(null)
    setTitle("")
    setDescription("")
    setTags([])
    setNewTag("")
    setCategoryId("")
    setPrivacyStatus("public")
    setPlaylistId("")
    setError("")
    setSaved(false)
  }

  const publish = async () => {
    if (!videoFile) return setError("Choose a video file before publishing.")
    if (!title.trim()) return setError("Add a video title before continuing.")
    if (account.serverEnabled && !account.snapshot.grantedCapabilities.includes("youtube_upload")) {
      setError("Reconnect Channel to grant YouTube upload permission.")
      void account.start("reconnect_channel", window.location.pathname)
      return
    }

    setSaving(true)
    setError("")
    try {
      const uploaded = await uploadVideo(videoFile, {
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
      }) as { id?: string }
      if (uploaded.id && thumbnailFile) await updateVideoThumbnail(uploaded.id, thumbnailFile)
      setSaved(true)
      window.setTimeout(() => setSaved(false), 3000)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The video could not be published. Try again.")
    } finally {
      setSaving(false)
    }
  }

  const tagCharacterCount = tags.join(", ").length
  const remainingTagInputLength = Math.max(0, TAG_CHARACTER_LIMIT - tagCharacterCount - (tags.length ? 2 : 0))
  const tabs: { id: WorkspacePage; label: string }[] = [
    { id: "details", label: "Details" },
    { id: "options", label: "Options" },
    { id: "ads", label: "Ad suitability" },
    ...(categoryId === "27" ? [{ id: "timestamps" as const, label: "Timestamps" }] : []),
  ]

  const helpContent = (
    <WidgetInstrument archetype="launch" label="UPLOAD GANTRY" summary="PACKAGE, CLEAR AND LAUNCH" compact>
      <InstrumentStages stages={[
        { id: "source", label: "Source", detail: "Load the video" },
        { id: "package", label: "Package", detail: "Add metadata" },
        { id: "clearance", label: "Clearance", detail: "Review suitability" },
        { id: "launch", label: "Launch", detail: "Publish the video" },
      ]} />
      <InstrumentExplanation
        purpose="Keep the complete upload package visible while it moves toward launch."
        process="Load source media, assemble metadata and thumbnail, configure audience options, clear ad suitability, then publish."
        result="A YouTube upload with explicit media, metadata, visibility and safety decisions."
      />
    </WidgetInstrument>
  )

  return (
    <WidgetShell {...common} icon={<UploadCloud size={22} />} helpContent={helpContent}>
      <div className="video-uploader-widget">
        <input ref={videoInputRef} hidden type="file" accept="video/*" onChange={(event) => setVideoFile(event.target.files?.[0] || null)} />
        <input ref={thumbnailInputRef} hidden type="file" accept="image/*" onChange={(event) => readThumbnail(event.target.files?.[0])} />

        <WidgetWorkflowMain className="video-uploader-main">
          {page === "details" ? (
            <>
              <section className="video-uploader-gantry" aria-label="Upload gantry">
                <WidgetMediaUploadFrame
                  className="video-uploader-source-frame"
                  icon={<FileVideo2 />}
                  title="Source video"
                  detail="Choose or drop the video file to publish"
                  actionLabel={videoFile ? "Replace source video" : "Choose source video"}
                  hasValue={Boolean(videoFile)}
                  preview={videoFile ? (
                    <span className="video-uploader-source-file">
                      <FileVideo2 aria-hidden="true" />
                      <strong>{videoFile.name}</strong>
                      <small>{describeFileSize(videoFile.size)}</small>
                    </span>
                  ) : undefined}
                  onBrowse={() => videoInputRef.current?.click()}
                  onDropFile={(file) => {
                    if (file?.type.startsWith("video/")) setVideoFile(file)
                  }}
                />
                <WidgetMediaUploadFrame
                  className="video-uploader-thumbnail-frame"
                  icon={<ImagePlus />}
                  title="Thumbnail"
                  detail="Choose or drop a 16:9 image"
                  actionLabel={thumbnailPreview ? "Replace thumbnail" : "Choose thumbnail"}
                  hasValue={Boolean(thumbnailPreview)}
                  preview={thumbnailPreview ? <img src={thumbnailPreview} alt="Thumbnail preview" /> : undefined}
                  onBrowse={() => thumbnailInputRef.current?.click()}
                  onDropFile={readThumbnail}
                />
              </section>

              <section className="video-uploader-copy-grid" aria-label="Video metadata">
                <Field label="Video title">
                  <input className="vt-input" aria-label="Video title" placeholder="Video title" value={title} maxLength={100} onChange={(event) => setTitle(event.target.value)} />
                  <small className="widget-character-count">{title.length}/100</small>
                </Field>
                <Field label="Description">
                  <textarea className="vt-textarea video-uploader-description" aria-label="Description" placeholder="Description" value={description} maxLength={5000} onChange={(event) => setDescription(event.target.value)} rows={4} />
                  <small className="widget-character-count">{description.length}/5000</small>
                </Field>
              </section>

              <section className="video-uploader-package-row" aria-label="Publishing package">
                <div className="video-uploader-tags">
                  <div className="widget-tag-list">
                    {tags.map((tag) => (
                      <WidgetTag key={tag} onRemove={() => setTags((current) => current.filter((item) => item !== tag))}>{tag}</WidgetTag>
                    ))}
                  </div>
                  <div className="video-uploader-tag-entry">
                    <input
                      ref={tagInputRef}
                      className="vt-input"
                      aria-label="Add tag"
                      value={newTag}
                      maxLength={remainingTagInputLength}
                      onChange={(event) => setNewTag(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault()
                          addTag()
                        }
                      }}
                      placeholder={tags.length ? "Add tag…" : "Tags — add tag…"}
                    />
                    <WidgetIconButton icon={<Plus />} label="Add tag" height={32} tone="primary" onClick={addTag} />
                  </div>
                  <div className="video-uploader-default-actions">
                    <WidgetSizedButton height={24} tone="secondary" textFit="adaptive" disabled={defaultsLoading !== null} onClick={() => void applyChannelDefaults("description")}>
                      {defaultsLoading === "description" ? "Loading…" : "Use default description"}
                    </WidgetSizedButton>
                    <WidgetSizedButton height={24} tone="secondary" textFit="adaptive" disabled={defaultsLoading !== null} onClick={() => void applyChannelDefaults("tags")}>
                      {defaultsLoading === "tags" ? "Loading…" : "Use default tags"}
                    </WidgetSizedButton>
                  </div>
                </div>
                <div className="video-uploader-selects">
                  <WidgetSizedSelect height={32} value={privacyStatus} onChange={setPrivacyStatus} label="Visibility" options={[{ value: "public", label: "Public" }, { value: "unlisted", label: "Unlisted" }, { value: "private", label: "Private" }]} placeholder="Visibility" />
                  <WidgetSizedSelect height={32} value={categoryId} onChange={setCategoryId} label="Category" options={categories} placeholder="Category" />
                  <WidgetSizedSelect height={32} value={playlistId} onChange={setPlaylistId} label="Playlist" options={playlists} placeholder="Playlist" />
                </div>
              </section>
            </>
          ) : null}

          {page === "options" ? (
            <div className="video-uploader-disclosures">
              <Module title="Audience and restrictions">
                <Choice type="radio" name="upload-kids" value="yes" label="Yes, this video is made for kids" checked={madeForKids === "yes"} onChange={() => setMadeForKids("yes")} />
                <Choice type="radio" name="upload-kids" value="no" label="No, this video is not made for kids" checked={madeForKids === "no"} onChange={() => setMadeForKids("no")} />
              </Module>
              <Module title="Disclosures and altered content">
                <Choice label="Contains paid promotion" checked={paidPromotion} onChange={() => setPaidPromotion((value) => !value)} />
                <Choice type="radio" name="upload-altered" value="yes" label="Contains realistic altered or synthetic content" checked={alteredContent === "yes"} onChange={() => setAlteredContent("yes")} />
                <Choice type="radio" name="upload-altered" value="no" label="Does not contain realistic altered content" checked={alteredContent === "no"} onChange={() => setAlteredContent("no")} />
              </Module>
              <Module title="Automatic concepts and chapters">
                <Choice label="Allow automatic chapters and key moments" checked={autoChapters} onChange={() => setAutoChapters((value) => !value)} />
              </Module>
              <Module title="Language and captions certification">
                <div className="video-uploader-control-grid">
                  <Field label="Video language"><WidgetSizedSelect height={32} value={language} onChange={setLanguage} label="Video language" options={[{ value: "en", label: "English" }, { value: "es", label: "Spanish" }, { value: "fr", label: "French" }, { value: "de", label: "German" }, { value: "none", label: "Not applicable" }]} /></Field>
                  <Field label="Caption certification"><WidgetSizedSelect height={32} value={captionCert} onChange={setCaptionCert} label="Caption certification" options={[{ value: "none", label: "None" }, { value: "neverAired", label: "Never aired on U.S. television" }, { value: "grantedExemption", label: "FCC exemption granted" }]} /></Field>
                </div>
              </Module>
              <Module title="Recording date and location">
                <div className="video-uploader-control-grid">
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
            <section className="video-uploader-clearance">
              <header><ShieldCheck /><div><strong>Ad suitability</strong><span>Declare anything in the video, title, description, or keywords.</span></div></header>
              <div className="video-uploader-ad-grid">
                {AD_CATEGORIES.map((category) => (
                  <Module title={category} key={category}>
                    <Choice type="radio" name={`upload-${category}`} value="none" label="None" checked={(adSuitability[category] || "none") === "none"} onChange={() => setAdSuitability((current) => ({ ...current, [category]: "none" }))} />
                    <Choice type="radio" name={`upload-${category}`} value="limited" label="Limited or contextual" checked={adSuitability[category] === "limited"} onChange={() => setAdSuitability((current) => ({ ...current, [category]: "limited" }))} />
                    <Choice type="radio" name={`upload-${category}`} value="strong" label="Strong or repeated" checked={adSuitability[category] === "strong"} onChange={() => setAdSuitability((current) => ({ ...current, [category]: "strong" }))} />
                  </Module>
                ))}
              </div>
              <Choice label="None of the above applies" checked={noneOfTheAbove} onChange={() => setNoneOfTheAbove((value) => !value)} />
            </section>
          ) : null}

          {page === "timestamps" ? (
            <section className="video-uploader-timestamps">
              <header><BookOpen /><div><strong>Educational timestamps</strong><span>Generate five teaching questions from the upload metadata.</span></div></header>
              {timestampQuestions.length ? (
                <ol>{timestampQuestions.map((question, index) => <li key={`${question}-${index}`}>{question}</li>)}</ol>
              ) : <p className="widget-empty-copy">No timestamp questions generated yet.</p>}
              <WidgetSizedButton height={32} tone="primary" disabled={timestampsLoading} onClick={() => void generateTimestampQuestions()}>
                {timestampsLoading ? <><Loader2 className="is-spinning" /> Generating…</> : "Generate timestamp questions"}
              </WidgetSizedButton>
            </section>
          ) : null}
        </WidgetWorkflowMain>

        {error ? <div className="widget-inline-error" role="alert">{error}</div> : null}

        <WidgetFooter className="video-uploader-footer">
          <nav className="video-uploader-pages" aria-label="Upload sections">
            {tabs.map((tab) => (
              <WidgetSizedButton
                key={tab.id}
                height={24}
                textFit="adaptive"
                tone={page === tab.id ? "primary" : "default"}
                aria-pressed={page === tab.id}
                onClick={() => setPage(tab.id)}
              >
                {tab.label}
              </WidgetSizedButton>
            ))}
          </nav>
          <WidgetSplitButton type="button" tone="primary" width="full" icon={<Save />} disabled={saving} onClick={() => void publish()}>
            {saving ? "Publishing…" : saved ? "Published" : "Publish video"}
          </WidgetSplitButton>
          <WidgetIconButton icon={<RotateCcw />} label="Reset upload package" height={32} tone="secondary" onClick={reset} />
        </WidgetFooter>
      </div>
    </WidgetShell>
  )
}
