import React, { useState } from "react"
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
 Copy,
 Check,
} from "lucide-react"
import { VTLottie } from "../../../components/VTLottie"
import { refineCommunityPost, generateInterestSeeding } from "../../../services/gemini"
import { useBrain } from "../../../context/useBrain"

type PostType = "text" | "image" | "poll" | "image-poll" | "video"

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

 const [postType, setPostType] = useState<PostType>("text")
 const [content, setContent] = useState("")
 const [pollOptions, setPollOptions] = useState<string[]>(["", ""])
 const [isGenerating, setIsGenerating] = useState(false)
 const [copied, setCopied] = useState(false)
 const [selectedVideo, setSelectedVideo] = useState<string>("")
 const [videoSearch, setVideoSearch] = useState("")

 const videos = data.canonicalRows || data.brain?.canonicalRows || []

  const handleGenerate = async () => {
  setIsGenerating(true)
  try {
   const hasInput = content.trim() || pollOptions.some((o) => o.trim())
   const niche = data.brain?.channelProfile?.name || "Content Creation"
   const recentTitles = videos.slice(0, 5).map((v: any) => v.title)
   
   let contextTopic = "some exciting new ideas"
   if (data.brain?.calendarState?.dayTasks) {
    for (let i = 1; i <= 7; i++) {
     const d = new Date()
     d.setDate(d.getDate() + i)
     const key = d.toISOString().split("T")[0]
     const tasks = data.brain.calendarState.dayTasks[key] || []
     if (tasks.length > 0) {
      contextTopic = tasks[0].text
      break
     }
    }
   }

   if (postType.includes("poll") && !hasInput) {
    // Use the Interest Seeding process from prompts
    const seeding = await generateInterestSeeding(
     contextTopic,
     niche,
     "Core loyal viewers and potential new subscribers interested in " + contextTopic,
     data.brain?.algorithmDiagnosis,
     brain
    )
    setContent(seeding.question)
    setPollOptions(seeding.options)
   } else {
    // Real AI refinement or generation via Gemini
    const refined = await refineCommunityPost(content || contextTopic, niche, recentTitles, brain)
    setContent(refined)
   }
  } catch (e) {
   console.error("AI Generation failed:", e)
  } finally {
   setIsGenerating(false)
  }
 }

 const handlePublish = async () => {
  let text = content
  if (postType.includes("poll")) {
   text +=
    "\n\nOptions:\n" +
    pollOptions
     .filter((o) => o.trim())
     .map((o) => `🔹 ${o}`)
     .join("\n")
  }
  
  try {
   await navigator.clipboard.writeText(text)
   console.log("Publishing to YouTube Community Tab:", text)
   setCopied(true)
   setTimeout(() => setCopied(false), 2000)
  } catch (err) {
   console.error("Clipboard copy failed:", err)
  }
 }

 const updatePollOption = (i: number, val: string) => {
  const newOptions = [...pollOptions]
  newOptions[i] = val
  setPollOptions(newOptions)
 }

 const addPollOption = () => {
  if (pollOptions.length < 4) setPollOptions([...pollOptions, ""])
 }

 return (
  <WidgetShell {...common} icon={<Users size={22} />}>
   <div
    style={{
     display: "flex",
     flexDirection: "column",
     height: "100%",
     gap: "8px",
     overflow: "hidden",
    }}>
    {/* Type Selector — Standardized vt-tab-group */}
    <div className="vt-tab-group" style={{ height: "36px" }}>
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
       style={{ padding: "0 4px", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", whiteSpace: "nowrap" }}
      >
       <type.icon size={14} color="#000" style={{ flexShrink: 0 }} />
       <span style={{ fontSize: "10px", fontWeight: 900, textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis" }}>{type.label}</span>
      </button>
     ))}
    </div>

    {/* Editor Area */}
    <div
     style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px", overflowY: "auto", minHeight: 0, paddingRight: "4px" }}>
     <textarea
      className="vt-textarea"
      value={content}
      onChange={(e) => setContent(e.target.value)}
      placeholder={`Write your ${postType} post...`}
      style={{
       flex: postType.includes("poll") ? "none" : 1,
       minHeight: postType.includes("poll") ? "60px" : "100px",
       resize: "none",
      }}
     />

     {postType.includes("poll") && (
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
       {pollOptions.map((opt, i) => (
        <div
         key={i}
         style={{ display: "flex", alignItems: "center", gap: "8px" }}>
         <div
          style={{
           width: "14px",
           height: "14px",
           borderRadius: "50%",
           border: "3px solid #000",
           flexShrink: 0,
           background: opt.trim() ? "#000" : "#fff"
          }}
         />
         <input
          className="vt-input"
          value={opt}
          onChange={(e) => updatePollOption(i, e.target.value)}
          placeholder={`Option ${i + 1}`}
          style={{ flex: 1, padding: "6px 10px", fontSize: "11px" }}
         />
        </div>
       ))}
        {pollOptions.length < 4 && (
         <button
          onClick={addPollOption}
          className="vt-button"
          style={{
           width: "100%",
           height: "32px",
           fontSize: "10px",
           fontWeight: 950,
          }}>
          + ADD OPTION
         </button>
        )}
      </div>
     )}

     {postType === "video" && (
      <div style={{ display: "flex", gap: "4px" }}>
       <select
        className="vt-select"
        value={selectedVideo}
        onChange={(e) => setSelectedVideo(e.target.value)}
        style={{ flex: 2 }}>
        <option value="" disabled>
         Select an existing video...
        </option>
        {videos
         .filter((v: any) => !videoSearch || v.title?.toLowerCase().includes(videoSearch.toLowerCase()))
         .slice(0, 15)
         .map((v: any) => (
          <option key={v.videoId} value={v.videoId}>
           {v.title || v.id}
          </option>
         ))}
       </select>
       <input
        className="vt-input"
        value={videoSearch}
        onChange={(e) => setVideoSearch(e.target.value)}
        placeholder="Search..."
        style={{ flex: 1, fontSize: "10px" }}
       />
      </div>
     )}

     {postType === "image" && (
      <div
       style={{
        height: "60px",
        background: "#f0f0f0",
        border: "2px dashed #000",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
       }}>
       <span
        style={{
         fontSize: "10px",
         fontWeight: 900,
         textTransform: "uppercase",
         opacity: 0.5,
        }}>
        Upload Image
       </span>
      </div>
     )}
    </div>

    {/* Actions — Standardized vt-button system */}
    <div
     className="community-post-options"
     style={{
      marginTop: "auto",
      display: "flex",
      gap: "8px"
     }}>
     <button
      className="vt-button secondary"
      onClick={handleGenerate}
      disabled={isGenerating}
      title="Generate a post based on brain info and current selection"
      style={{ flex: 1, height: "32px", fontSize: "10px", padding: "0 8px" }}>
      {isGenerating ? (
       <div
        style={{
         width: "12px",
         height: "12px",
         border: "2px solid rgba(0,0,0,0.2)",
         borderTop: "2px solid #000",
         borderRadius: "50%",
         animation: "spin 1s linear infinite",
        }}
       />
      ) : (
       <Sparkles size={14} />
      )}
      {isGenerating ? "GENERATING..." : "GENERATE POST"}
     </button>
     <button
      className="vt-button primary"
      onClick={handlePublish}
      title="Post the created content to your channel"
      style={{ flex: 1, height: "32px", fontSize: "10px", padding: "0 8px" }}>
      <Send size={14} /> POST TO CHANNEL
     </button>
    </div>
   </div>
  </WidgetShell>
 )
}
