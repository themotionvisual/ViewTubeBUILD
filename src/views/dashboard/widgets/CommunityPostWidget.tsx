import React, { useState, useRef } from "react"
import { WidgetShell } from "../WidgetShell"
import { WidgetFooter, WidgetHeaderToggle, WidgetSelect, WidgetTooltip, WidgetWorkflowMain } from "../WidgetPrimitives"
import {
  Users,
  FileText,
  Image as ImageIcon,
  CheckSquare,
  MessageSquare,
  Video,
  Sparkles,
  Send,
  Calendar,
  Archive,
  Upload,
  Plus,
  X,
  ExternalLink,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useCommunityPostController, useCreatorEngagementContext } from "../../../features/creator-engagement"

type PostType = "text" | "image" | "poll" | "image-poll" | "video"
type ViewMode = "write" | "create"

export const CommunityPostWidget = ({
  widget,
  instance,
  editMode,
  onToggleCollapse,
  onCycleSize,
  onDecSize,
  onCycleHeight,
  onDecHeight,
  onRemove,
  data,
}: any) => {
  const engagement = useCreatorEngagementContext()
  const community = useCommunityPostController(engagement)
  const common = {
    widget,
    instance,
    editMode,
    canEdit: true,
    onToggleCollapse,
    onCycleSize,
    onDecSize,
    onCycleHeight,
    onDecHeight,
    onRemove,
  }

  // --- Core States ---
  const viewMode = community.mode
  const setViewMode = community.setMode
  const postType = community.postType
  const setPostType = community.setPostType
  const content = community.content
  const setContent = community.setContent
  const pollOptions = community.pollOptions
  const setPollOptions = (next: string[] | ((current: string[]) => string[])) => {
    const resolved = typeof next === "function" ? next(pollOptions) : next
    resolved.forEach((value, index) => community.setPollOption(index, value))
  }
  const imageUrl = community.imageUrl
  const setImageUrl = community.setImageUrl
  const imagePollUrls = community.imagePollUrls
  const setImagePollUrls = (next: string[] | ((current: string[]) => string[])) => {
    const resolved = typeof next === "function" ? next(imagePollUrls) : next
    resolved.forEach((value, index) => community.setImagePollUrl(index, value))
  }
  const [draggingImageTarget, setDraggingImageTarget] = useState<string | null>(null)
  const videoSearch = community.videoSearch
  const setVideoSearch = community.setVideoSearch
  const selectedVideo = community.selectedVideoId
  const setSelectedVideo = community.setSelectedVideoId
  
  // --- AI States ---
  const prompt = community.prompt
  const setPrompt = community.setPrompt
  const postStyle = community.style
  const setPostStyle = community.setStyle
  const isGenerating = community.isGenerating
  
  // --- Utility States ---
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imagePollInputRefs = useRef<(HTMLInputElement | null)[]>([])

  const videos = engagement.videoAssets

  // --- Handlers ---
  const saveToVault = community.saveToVault
  const handleRefine = community.refine
  const handleGenerateFromPrompt = community.generate

  const applyImageFile = community.applyImageFile
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, optionIndex?: number) => applyImageFile(e.target.files?.[0], optionIndex)

  // --- Sub-Components ---
  const ImageFrame = ({ src, onBrowse, onClear, onFile, label = "Image", dragTarget = "image" }: { src: string; onBrowse: () => void; onClear?: () => void; onFile?: (file?: File) => void; label?: string; dragTarget?: string }) => (
    <div className="community-image-column">
      <button type="button" className="vt-button community-image-browse" onClick={onBrowse}><Upload size={15} />Browse files</button>
      <div
        className={`widget-upload-frame ${draggingImageTarget === dragTarget ? "is-dragging" : ""}`.trim()}
        onDragOver={(event) => { event.preventDefault(); setDraggingImageTarget(dragTarget) }}
        onDragLeave={() => setDraggingImageTarget(null)}
        onDrop={(event) => { event.preventDefault(); setDraggingImageTarget(null); onFile?.(event.dataTransfer.files?.[0]) }}
      >
        {src ? <img src={src} alt={`${label} preview`} /> : <div className="community-image-placeholder"><ImageIcon size={22} /><span>{label}</span></div>}
        {src && onClear ? <button type="button" className="vt-button is-icon-only community-image-clear" aria-label={`Remove ${label}`} onClick={onClear}><X size={14} /></button> : null}
      </div>
    </div>
  )

  const PollOptionMedia = ({ index }: { index: number }) => {
    const src = imagePollUrls[index]
    return (
      <>
        <input ref={(node) => { imagePollInputRefs.current[index] = node }} type="file" className="hidden" accept="image/*" onChange={(event) => handleFileChange(event, index)} />
        <button
          type="button"
          className={`community-poll-media ${src ? "has-image" : ""} ${draggingImageTarget === `poll-${index}` ? "is-dragging" : ""}`.trim()}
          aria-label={src ? `Replace image for option ${index + 1}` : `Upload image for option ${index + 1}`}
          onClick={() => imagePollInputRefs.current[index]?.click()}
          onDragOver={(event) => { event.preventDefault(); setDraggingImageTarget(`poll-${index}`) }}
          onDragLeave={() => setDraggingImageTarget(null)}
          onDrop={(event) => { event.preventDefault(); setDraggingImageTarget(null); applyImageFile(event.dataTransfer.files?.[0], index) }}
        >
          {src ? <img src={src} alt={`Option ${index + 1} preview`} /> : <><Upload size={14} aria-hidden="true" /><span>Upload image</span></>}
        </button>
      </>
    )
  }

  const ImageMediaModule = () => (
    <div className="community-image-workspace">
      <div className="community-image-copy">
        <textarea className="vt-textarea" value={content} onChange={(e) => setContent(e.target.value)} placeholder="What's on your mind? Draft your image post…" />
        <input className="vt-input" placeholder="Paste image URL…" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
      </div>
      <div>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
        <ImageFrame src={imageUrl} label="Image" onBrowse={() => fileInputRef.current?.click()} onFile={applyImageFile} onClear={() => setImageUrl("")} />
      </div>
    </div>
  )

  const CreatePostFields = () => (
    <>
      {postType === "image" ? (
        <div className="community-image-workspace">
          <div className="community-image-copy">
            <textarea className="vt-textarea" value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Describe the image post you want to create…" />
            <input className="vt-input" placeholder="Optional image URL…" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} />
          </div>
          <div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            <ImageFrame src={imageUrl} label="Image" onBrowse={() => fileInputRef.current?.click()} onFile={applyImageFile} onClear={() => setImageUrl("")} dragTarget="create-image" />
          </div>
        </div>
      ) : postType === "video" ? (
        <div className="community-video-workspace">
          <textarea className="vt-textarea" value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Describe the video post you want to create…" />
          <div className="community-video-panel">
            <input className="vt-input" placeholder="Search videos…" value={videoSearch} onChange={(event) => setVideoSearch(event.target.value)} />
            <WidgetSelect
              value={selectedVideo}
              onChange={setSelectedVideo}
              label="Link a video"
              placeholder="Link a video…"
              className="flex-1"
              options={videos
                .filter((video: any) => !videoSearch || video.title?.toLowerCase().includes(videoSearch.toLowerCase()) || video.videoId?.toLowerCase().includes(videoSearch.toLowerCase()))
                .slice(0, 50)
                .map((video: any) => ({ value: video.videoId, label: video.title || video.videoId }))}
            />
          </div>
        </div>
      ) : (
        <textarea
          className={`vt-textarea community-post-copy-input${postType.includes("poll") ? " is-compact" : ""}`}
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder={`Describe the ${postType === "image-poll" ? "image poll" : postType} post you want to create…`}
        />
      )}

      {postType.includes("poll") ? (
        <div className={`community-poll-grid ${postType === "image-poll" ? "is-image-poll" : ""}`}>
          {pollOptions.map((option, index) => (
            <div key={index} className="community-poll-option">
              <input
                className="vt-input"
                value={option}
                onChange={(event) => setPollOptions((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item))}
                placeholder={`Option ${index + 1}`}
              />
              {postType === "image-poll" ? <PollOptionMedia index={index} /> : null}
            </div>
          ))}
        </div>
      ) : null}
    </>
  )

  const PostTypeSelector = () => (
    <div className="community-post-type-grid" aria-label="Post type">
      {[
        { id: "text", icon: FileText, label: "Text" },
        { id: "image", icon: ImageIcon, label: "Image" },
        { id: "poll", icon: CheckSquare, label: "Poll" },
        { id: "image-poll", icon: MessageSquare, label: "Img Poll" },
        { id: "video", icon: Video, label: "Video" },
      ].map((type) => (
        <button
          key={type.id}
          type="button"
          onClick={() => setPostType(type.id as PostType)}
          className={`widget-split-button is-small is-full ${postType === type.id ? "is-primary" : "is-soft"}`}
          aria-pressed={postType === type.id}
        >
          <span className="widget-split-button-icon"><type.icon size={14} /></span>
          <span className="widget-split-button-label">{type.label}</span>
        </button>
      ))}
    </div>
  )

  const headerContent = (
    <WidgetHeaderToggle
      label="Community post mode"
      value={viewMode}
      onChange={setViewMode}
      items={[{ id: "write", label: "Write" }, { id: "create", label: "Create" }]}
    />
  )

  return (
    <WidgetShell {...common} headerContent={headerContent} icon={<Users size={22} />}>
      <motion.div
        layout
        className="widget-workspace community-post-workspace"
      >

        <WidgetWorkflowMain className="community-post-main">
        <AnimatePresence mode="wait">
          {viewMode === "write" ? (
            <motion.div
              key="write"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex-1 flex flex-col gap-2 min-h-0"
            >
              {/* Type Selector */}
              <PostTypeSelector />

              {/* Dynamic Modules */}
              {postType === "image" ? <ImageMediaModule /> : postType === "video" ? null : (
                <textarea
                className={`vt-textarea community-post-copy-input${postType.includes("poll") ? " is-compact" : ""}`}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={`What's on your mind? Draft your ${postType} post...`}
                />
              )}
              
              {postType.includes("poll") && (
                <div className={`community-poll-grid ${postType === "image-poll" ? "is-image-poll" : ""}`}>
                  {pollOptions.map((opt, i) => (
                    <div key={i} className="community-poll-option">
                      <input
                        className="vt-input"
                        value={opt}
                        onChange={(e) => {
                          const n = [...pollOptions]; n[i] = e.target.value; setPollOptions(n);
                        }}
                        placeholder={`Option ${i + 1}`}
                      />
                      {postType === "image-poll" ? <PollOptionMedia index={i} /> : null}
                    </div>
                  ))}
                </div>
              )}

              {postType === "video" && (
                <div className="community-video-workspace">
                  <textarea className="vt-textarea" value={content} onChange={(e) => setContent(e.target.value)} placeholder="What's on your mind? Draft your video post…" />
                  <div className="community-video-panel">
                    <input className="vt-input" placeholder="Search videos…" value={videoSearch} onChange={(e) => setVideoSearch(e.target.value)} />
                    <WidgetSelect
                      value={selectedVideo}
                      onChange={setSelectedVideo}
                      label="Link a video"
                      placeholder="Link a video…"
                      className="flex-1"
                      options={videos
                        .filter((v: any) => !videoSearch || v.title?.toLowerCase().includes(videoSearch.toLowerCase()) || v.videoId?.toLowerCase().includes(videoSearch.toLowerCase()))
                        .slice(0, 50)
                        .map((v: any) => ({ value: v.videoId, label: v.title || v.videoId }))}
                    />
                  </div>
                </div>
              )}

            </motion.div>
          ) : (
            <motion.div 
              key="create"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex-1 flex flex-col gap-2 min-h-0"
            >
              <PostTypeSelector />
              <CreatePostFields />
              <div className="community-create-styles" aria-label="Writing style">
                {["Educational", "Conversational", "Hype", "Question", "Announcement"].map((style) => (
                  <button key={style} type="button" aria-pressed={postStyle === style} onClick={() => setPostStyle(style)} className={`vt-button ${postStyle === style ? "primary" : ""}`.trim()}>{style}</button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </WidgetWorkflowMain>
        <WidgetFooter divider={false} className="community-post-footer">
          {viewMode === "write" ? (
            <>
              <WidgetTooltip content="Save draft to the post vault"><button onClick={saveToVault} className="vt-button is-icon-only" aria-label="Save draft"><Archive size={16} /></button></WidgetTooltip>
              <WidgetTooltip content="Schedule this post"><button className="vt-button is-icon-only" aria-label="Schedule post"><Calendar size={16} /></button></WidgetTooltip>
              <button onClick={handleRefine} disabled={isGenerating || !content.trim()} className="vt-button secondary"><Sparkles size={14} />{isGenerating ? "Refining…" : "Refine"}</button>
              <button onClick={community.copyPost} disabled={!content.trim()} className="vt-button primary flex-1"><Send size={14} />{community.clipboardStatus === "copied" ? "Copied" : "Copy Post"}</button>
              {community.channelCommunityUrl ? <a href={community.channelCommunityUrl} target="_blank" rel="noreferrer" className="vt-button secondary flex-1"><ExternalLink size={14} />Go to Channel</a> : <button onClick={engagement.reconnect} className="vt-button secondary flex-1"><ExternalLink size={14} />Connect Channel</button>}
            </>
          ) : (
            <>
              <button onClick={handleRefine} disabled={isGenerating || !content.trim()} className="vt-button secondary flex-1"><Sparkles size={14} />Refine draft</button>
              <button onClick={handleGenerateFromPrompt} disabled={isGenerating || !prompt.trim()} className="vt-button primary flex-1"><Plus size={14} />{isGenerating ? "Generating…" : "Generate post"}</button>
            </>
          )}
        </WidgetFooter>
      </motion.div>
    </WidgetShell>
  )
}
