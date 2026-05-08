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
import { refineCommunityPost } from "../../../services/gemini"
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

 const videos = data.brain?.canonicalRows || []

 const handleGenerate = async () => {
  setIsGenerating(true)
  try {
   const hasInput = content.trim() || pollOptions.some((o) => o.trim())
   const niche = data.brain?.channelProfile?.name || "Content Creation"
   const recentTitles = videos.slice(0, 5).map((v: any) => v.title)

   if (!hasInput) {
    // Auto-draft from scratch
    let upcomingTopic = "some exciting new ideas"
    if (data.brain?.calendarState?.dayTasks) {
     for (let i = 1; i <= 7; i++) {
      const d = new Date()
      d.setDate(d.getDate() + i)
      const key = d.toISOString().split("T")[0]
      const tasks = data.brain.calendarState.dayTasks[key] || []
      if (tasks.length > 0) {
       upcomingTopic = tasks[0].text
       break
      }
     }
    }
    setContent(
     `Based on the intense reaction to my latest video "${videos[0]?.title || "my recent upload"}", I'm cooking up something special. My next upload is taking a deep dive into ${upcomingTopic}. Drop a comment if there's a specific question you want me to answer in it! 👇`,
    )
    if (postType.includes("poll")) {
     setPollOptions([
      "Yes, sounds awesome!",
      "I'd rather see something else",
      "Include a tutorial section",
      "Just upload it already",
     ])
    }
   } else {
    // Real AI refinement via Gemini
    const refined = await refineCommunityPost(content, niche, recentTitles, brain)
    setContent(refined)
   }
  } catch (e) {
   console.error("Refine failed:", e)
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
      <select
       className="vt-select"
       style={{ width: "100%" }}>
       <option value="" disabled selected>
        Select an existing video...
       </option>
       {videos.map((v: any) => (
        <option key={v.videoId} value={v.videoId}>
         {v.title || v.id}
        </option>
       ))}
      </select>
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
       <VTLottie 
        animationUrl="https://assets3.lottiefiles.com/packages/lf20_m6cu8sh9.json" 
        size={16} 
       />
      )}
      {isGenerating ? "REFINING..." : "REFINE"}
     </button>
     <button
      className="vt-button primary"
      onClick={handlePublish}
      style={{ flex: 1.5, height: "32px", fontSize: "10px", padding: "0 8px" }}>
      <Send size={14} /> PUBLISH
     </button>
    </div>
   </div>
  </WidgetShell>
 )
}
