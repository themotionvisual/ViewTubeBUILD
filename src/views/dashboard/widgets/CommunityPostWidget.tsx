import React, { useState, useEffect, useRef } from "react"
import { WidgetShell } from "../WidgetShell"
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
  Link,
  Plus,
  ArrowRight,
  Clock,
  Trash2,
  Edit2,
  ExternalLink,
  Loader2,
  Check,
  X,
  AlertTriangle
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { refineCommunityPost, generateInterestSeeding, generateCommunityPostSchedule } from "../../../services/gemini"
import { 
  postCommunityPost, 
  scheduleCommunityPost, 
  getScheduledPosts, 
  deleteScheduledPost,
  cancelScheduledPost,
  processScheduledPosts,
  type ScheduledCommunityPost,
  type CommunityPostContent
} from "../../../services/youtubeService"
import { useBrain } from "../../../context/useBrain"

type PostType = "text" | "image" | "poll" | "image-poll" | "video"
type ViewMode = "write" | "create" | "schedule"

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
  const { brain } = useBrain()
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
  const [viewMode, setViewMode] = useState<ViewMode>("write")
  const [postType, setPostType] = useState<PostType>("text")
  const [content, setContent] = useState("")
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""])
  const [imageUrl, setImageUrl] = useState("")
  const [videoSearch, setVideoSearch] = useState("")
  const [selectedVideo, setSelectedVideo] = useState("")
  
  // --- AI States ---
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  
  // --- Scheduling States ---
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledCommunityPost[]>([])
  const [scheduleDate, setScheduleDate] = useState("")
  const [scheduleTime, setScheduleTime] = useState("")
  const [isPosting, setIsPosting] = useState(false)
  const [postResult, setPostResult] = useState<{ success: boolean; message: string } | null>(null)
  
  // --- Utility States ---
  const [vault, setVault] = useState<any[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const videos = data.canonicalRows || data.brain?.canonicalRows || []

  // --- Load scheduled posts ---
  useEffect(() => {
    setScheduledPosts(getScheduledPosts().filter(p => p.status === "scheduled"))
  }, [viewMode])

  // --- Effects ---
  useEffect(() => {
    const savedVault = localStorage.getItem("viewtube_post_vault")
    if (savedVault) {
      try {
        setVault(JSON.parse(savedVault))
      } catch (e) {
        console.error("Failed to load vault", e)
      }
    }
  }, [])

  useEffect(() => {
    const applyImage = (payload: any) => {
      if (!payload?.imageUrl) return
      setViewMode("write")
      setPostType("image")
      setImageUrl(payload.imageUrl)
      if (payload.prompt && !content.trim()) setContent(`Generated concept: ${payload.prompt}`)
    }

    const onBridge = (event: Event) => {
      const detail = (event as CustomEvent<any>).detail
      if (!detail || detail.targetWidget !== "community-post") return
      applyImage(detail)
    }

    window.addEventListener("vt_dashboard_generated_image", onBridge as EventListener)
    try {
      const cached = localStorage.getItem("vt_bridge_image_community-post")
      if (cached) applyImage(JSON.parse(cached))
    } catch {}
    return () => window.removeEventListener("vt_dashboard_generated_image", onBridge as EventListener)
  }, [content])

  // --- Check for due scheduled posts periodically ---
  useEffect(() => {
    const interval = setInterval(() => {
      const due = scheduledPosts.filter(p => {
        const scheduledTime = new Date(p.scheduledAt)
        return scheduledTime <= new Date() && p.status === "scheduled"
      })
      if (due.length > 0) {
        processScheduledPosts().then(({ processed }) => {
          if (processed.length > 0) {
            setScheduledPosts(getScheduledPosts().filter(p => p.status === "scheduled"))
            setPostResult({ success: true, message: `${processed.length} post(s) published!` })
          }
        })
      }
    }, 60000) // Check every minute
    
    return () => clearInterval(interval)
  }, [scheduledPosts])

  // --- Build post content object ---
  const buildPostContent = (): CommunityPostContent => ({
    type: postType === "image-poll" ? "poll" : postType,
    text: content,
    pollOptions: postType.includes("poll") ? pollOptions.filter(o => o.trim()) : undefined,
    imageUrl: (postType === "image" || postType === "image-poll") ? imageUrl : undefined,
    videoId: postType === "video" ? selectedVideo : undefined,
  })

  // --- Handlers ---
  const saveToVault = () => {
    if (!content.trim()) return
    const newPost = {
      id: Date.now(),
      type: postType,
      content,
      pollOptions: postType.includes("poll") ? pollOptions : undefined,
      imageUrl: postType === "image" || postType === "image-poll" ? imageUrl : undefined,
      timestamp: new Date().toISOString(),
    }
    const updatedVault = [newPost, ...vault]
    setVault(updatedVault)
    localStorage.setItem("viewtube_post_vault", JSON.stringify(updatedVault))
  }

  const handleRefine = async () => {
    if (!content.trim()) return
    setIsGenerating(true)
    try {
      const niche = data.brain?.channelProfile?.name || "Content Creation"
      const recentTitles = videos.slice(0, 5).map((v: any) => v.title)
      const refined = await refineCommunityPost(content, niche, recentTitles, brain)
      setContent(refined)
      setViewMode("write")
    } catch (e) {
      console.error("AI Refinement failed:", e)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateFromPrompt = async () => {
    if (!prompt.trim()) return
    setIsGenerating(true)
    try {
      const niche = data.brain?.channelProfile?.name || "Content Creation"
      const recentTitles = videos.slice(0, 5).map((v: any) => v.title)
      const generated = await refineCommunityPost(prompt, niche, recentTitles, brain)
      setContent(generated)
      setPrompt("")
      setViewMode("write")
    } catch (e) {
      console.error("AI Generation failed:", e)
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePostNow = async () => {
    if (!content.trim()) return
    setIsPosting(true)
    setPostResult(null)
    
    try {
      const postContent = buildPostContent()
      const result = await postCommunityPost(postContent)
      
      if (result.success) {
        if (result.method === "redirect" && result.url) {
          // Open YouTube Studio
          window.open(result.url, "_blank")
          setPostResult({ 
            success: true, 
            message: "Content copied! YouTube Studio opened - paste your post there." 
          })
        } else {
          setPostResult({ success: true, message: "Post published successfully!" })
          setContent("")
        }
      } else {
        setPostResult({ success: false, message: result.error || "Failed to post" })
      }
    } catch (e: any) {
      setPostResult({ success: false, message: e.message || "Failed to post" })
    } finally {
      setIsPosting(false)
    }
  }

  const handleSchedulePost = () => {
    if (!content.trim() || !scheduleDate || !scheduleTime) return
    
    const scheduledAt = new Date(`${scheduleDate}T${scheduleTime}`).toISOString()
    const postContent = buildPostContent()
    
    const scheduled = scheduleCommunityPost(postContent, scheduledAt)
    setScheduledPosts(prev => [...prev, scheduled])
    
    // Clear form
    setContent("")
    setScheduleDate("")
    setScheduleTime("")
    setPostResult({ success: true, message: "Post scheduled!" })
  }

  const handleCancelScheduled = (postId: string) => {
    cancelScheduledPost(postId)
    setScheduledPosts(prev => prev.filter(p => p.id !== postId))
  }

  const handleDeleteScheduled = (postId: string) => {
    deleteScheduledPost(postId)
    setScheduledPosts(prev => prev.filter(p => p.id !== postId))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (prev) => setImageUrl(prev.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (prev) => setImageUrl(prev.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  // --- Sub-Components ---
  const MediaModule = () => (
    <div className="mt-2 space-y-2">
      <div 
        className={`relative border-2 border-dashed border-black rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition-colors ${isDragging ? 'bg-yellow-100' : 'bg-gray-50'}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {imageUrl ? (
          <div className="relative group w-full aspect-video rounded-md overflow-hidden border-2 border-black">
            <img src={imageUrl} alt="Upload" className="w-full h-full object-cover" />
            <button 
              onClick={() => setImageUrl("")}
              className="absolute top-2 right-2 p-1 bg-white border-2 border-black rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <>
            <div className="p-3 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Upload size={24} />
            </div>
            <p className="text-[10px] font-black uppercase text-center">Drag Image or Click to Upload</p>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="vt-button text-[9px] h-6 px-3"
            >
              BROWSE FILES
            </button>
          </>
        )}
      </div>
      <div className="flex gap-2 items-center">
        <div className="flex-1 relative">
          <Link className="absolute left-2 top-1/2 -translate-y-1/2 opacity-40" size={14} />
          <input 
            className="vt-input pl-8 text-[11px] h-8"
            placeholder="Paste image URL..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </div>
      </div>
    </div>
  )

  const headerContent = (
    <div className="vt-tab-group" style={{ width: "160px", padding: "2px" }}>
      <button
        onClick={() => setViewMode("write")}
        className={`vt-tab-btn ${viewMode === "write" ? 'active' : ''}`}
        style={{ padding: "4px", fontSize: "9px" }}
      >
        WRITE
      </button>
      <button
        onClick={() => setViewMode("create")}
        className={`vt-tab-btn ${viewMode === "create" ? 'active' : ''}`}
        style={{ padding: "4px", fontSize: "9px" }}
      >
        AI
      </button>
      <button
        onClick={() => setViewMode("schedule")}
        className={`vt-tab-btn ${viewMode === "schedule" ? 'active' : ''}`}
        style={{ padding: "4px", fontSize: "9px" }}
      >
        <Clock size={10} />
      </button>
    </div>
  )

  return (
    <WidgetShell {...common} headerContent={headerContent} icon={<Users size={22} />}>
      <motion.div 
        layout
        className="flex flex-col h-full gap-3 overflow-hidden"
      >
        {/* Result Banner */}
        {postResult && (
          <div style={{
            padding: "8px 12px",
            background: postResult.success ? "#C9F830" : "#FF8AAF",
            border: "2px solid #000",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "10px",
            fontWeight: 900
          }}>
            {postResult.success ? <Check size={14} /> : <AlertTriangle size={14} />}
            {postResult.message}
            <button 
              onClick={() => setPostResult(null)}
              style={{ marginLeft: "auto", opacity: 0.6 }}
            >
              <X size={12} />
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {viewMode === "write" ? (
            <motion.div 
              key="write"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex-1 flex flex-col gap-2 overflow-y-auto pr-1"
            >
              {/* Type Selector */}
              <div className="vt-tab-group min-h-[36px]">
                {[
                  { id: "text", icon: FileText, label: "Text" },
                  { id: "image", icon: ImageIcon, label: "Image" },
                  { id: "poll", icon: CheckSquare, label: "Poll" },
                  { id: "image-poll", icon: MessageSquare, label: "Img Poll" },
                  { id: "video", icon: Video, label: "Video" },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setPostType(type.id as PostType)}
                    className={`vt-tab-btn ${postType === type.id ? 'active' : ''}`}
                    style={{ flex: 1, height: "100%", padding: "0 4px" }}
                  >
                    <type.icon size={14} className="flex-shrink-0" />
                    <span className="text-[9px] font-black uppercase truncate">{type.label}</span>
                  </button>
                ))}
              </div>

              {/* Main Textarea */}
              <textarea
                className="vt-textarea flex-1 min-h-[80px] text-[12px] leading-tight"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`What's on your mind? Draft your ${postType} post...`}
              />

              {/* Dynamic Modules */}
              {postType === "image" && <MediaModule />}
              
              {postType.includes("poll") && (
                <div className="space-y-2 p-2 bg-gray-50 border-2 border-black rounded-lg">
                  {pollOptions.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full border-2 border-black flex-shrink-0 ${opt.trim() ? 'bg-black' : 'bg-white'}`} />
                      <input
                        className="vt-input text-[11px] h-7 px-2 flex-1"
                        value={opt}
                        onChange={(e) => {
                          const n = [...pollOptions]; n[i] = e.target.value; setPollOptions(n);
                        }}
                        placeholder={`Option ${i + 1}`}
                      />
                    </div>
                  ))}
                  {pollOptions.length < 4 && (
                    <button 
                      onClick={() => setPollOptions([...pollOptions, ""])}
                      className="w-full h-6 text-[9px] font-black uppercase border-2 border-black rounded bg-white hover:bg-gray-100"
                    >
                      + ADD OPTION
                    </button>
                  )}
                  {postType === "image-poll" && <MediaModule />}
                </div>
              )}

              {postType === "video" && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <select
                      className="vt-select flex-1 h-8 text-[11px]"
                      value={selectedVideo}
                      onChange={(e) => setSelectedVideo(e.target.value)}
                    >
                      <option value="" disabled>Link a video...</option>
                      {videos.slice(0, 10).map((v: any) => (
                        <option key={v.videoId} value={v.videoId}>{v.title}</option>
                      ))}
                    </select>
                    <input 
                      className="vt-input w-24 h-8 text-[11px]"
                      placeholder="Search..."
                      value={videoSearch}
                      onChange={(e) => setVideoSearch(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Schedule Section */}
              <div className="p-2 bg-gray-50 border-2 border-black rounded-lg">
                <div className="text-[9px] font-black uppercase opacity-60 mb-2">Schedule for Later</div>
                <div className="flex gap-2">
                  <input
                    type="date"
                    className="vt-input flex-1 h-7 text-[10px]"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                  <input
                    type="time"
                    className="vt-input w-20 h-7 text-[10px]"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                  />
                  <button
                    onClick={handleSchedulePost}
                    disabled={!content.trim() || !scheduleDate || !scheduleTime}
                    className="vt-button h-7 text-[9px] px-2"
                  >
                    <Clock size={12} />
                  </button>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex gap-2 mt-auto pt-2 border-t border-black/10">
                <button 
                  onClick={saveToVault}
                  className="p-2 border-2 border-black rounded-lg hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                  title="Save to Vault"
                >
                  <Archive size={16} />
                </button>
                <button 
                  onClick={handlePostNow}
                  disabled={!content.trim() || isPosting}
                  className="vt-button primary flex-1 h-9 gap-2 text-[11px]"
                >
                  {isPosting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                  POST NOW
                </button>
              </div>
            </motion.div>
          ) : viewMode === "create" ? (
            <motion.div 
              key="create"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex-1 flex flex-col gap-3"
            >
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase opacity-60">AI Generation Prompt</label>
                <textarea
                  className="vt-textarea flex-1 min-h-[120px] text-[13px] border-[#FF83EA] focus:border-[#FF83EA] placeholder:opacity-30"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the post you want to create..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleRefine}
                  disabled={isGenerating || !content.trim()}
                  className="vt-button secondary flex-1 flex-col gap-1 text-[10px]"
                >
                  <Sparkles size={16} />
                  REFINE DRAFT
                </button>
                <button
                  onClick={handleGenerateFromPrompt}
                  disabled={isGenerating || !prompt.trim()}
                  className="vt-button primary flex-1 flex-col gap-1 text-[10px]"
                >
                  {isGenerating ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Plus size={16} />
                  )}
                  GENERATE NEW
                </button>
              </div>

              <div className="p-3 bg-black/5 rounded-xl border border-black/10">
                <h4 className="text-[9px] font-black uppercase mb-1 flex items-center gap-1">
                  <Sparkles size={10} /> Pro Tip
                </h4>
                <p className="text-[10px] leading-tight opacity-70">
                  Write a basic idea in <span className="font-bold">WRITE</span> mode, then come here and click <span className="font-bold">REFINE</span> to polish it with your channel&apos;s unique voice.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="schedule"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex-1 flex flex-col gap-3 overflow-y-auto"
            >
              <div className="text-[10px] font-black uppercase opacity-60">
                Scheduled Posts ({scheduledPosts.length})
              </div>
              
              {scheduledPosts.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-2 opacity-40">
                  <Clock size={32} />
                  <span className="text-[10px] font-black uppercase">No scheduled posts</span>
                  <span className="text-[9px] font-bold">Use the schedule feature in Write mode</span>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {scheduledPosts.map((post) => (
                    <div
                      key={post.id}
                      className="p-3 border-2 border-black rounded-lg bg-white"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] font-bold line-clamp-2">
                            {post.content.text}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-[#00D2FF] border border-black rounded">
                              {post.content.type}
                            </span>
                            <span className="text-[9px] font-bold opacity-60">
                              {new Date(post.scheduledAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleCancelScheduled(post.id)}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Cancel"
                          >
                            <X size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteScheduled(post.id)}
                            className="p-1 hover:bg-red-100 rounded text-red-500"
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="p-3 bg-[#FFE357]/30 border-2 border-[#FFE357] rounded-lg mt-auto">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                  <div className="text-[9px] font-bold">
                    <strong>Note:</strong> YouTube&apos;s API has limited support for community posts. 
                    When a scheduled post is due, we&apos;ll open YouTube Studio with your content copied to clipboard.
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </WidgetShell>
  )
}
