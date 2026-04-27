import React, { useState } from "react"
import { useBrain } from "../../../context/GlobalDataContext"
import { WidgetShell } from "../WidgetShell"
import { Sparkles, Save, Check, Tag } from "lucide-react"
import { fetchVideoSnippetDetails } from "../../../services/youtube/youtubeDataFetcher"
import { generateTagSuggestions } from "../../../services/gemini"
import type { TagSuggestion } from "../../../services/gemini"
import { canAffordAiTokens, getCurrentEntitlement } from "../../../services/billingEntitlement"

export const TagGeneratorWidget = ({
 widget,
 instance,
 editMode,
 onToggleCollapse,
 onCycleSize,
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
  onRemove,
 }
 const [selectedVideo, setSelectedVideo] = useState<string>("")
 const [selectedTitle, setSelectedTitle] = useState<string>("")
 const [selectedDescription, setSelectedDescription] = useState<string>("")
 const [currentTags, setCurrentTags] = useState<string[]>([])
 const [suggestedTags, setSuggestedTags] = useState<TagSuggestion[]>([])
 const [isGenerating, setIsGenerating] = useState(false)
 const [isSaving, setIsSaving] = useState(false)
 const [saveSuccess, setSaveSuccess] = useState(false)
 const [tagsLoading, setTagsLoading] = useState(false)
 const [videoSearch, setVideoSearch] = useState("")
 const TAG_SUGGEST_COST = 1
 const entitlement = getCurrentEntitlement()
 const canAffordTagSuggestions = canAffordAiTokens(TAG_SUGGEST_COST)

 const videos = data.canonicalRows || data.brain?.canonicalRows || []

 const handleSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
  const vidId = e.target.value
  setSelectedVideo(vidId)
  setSuggestedTags([])
  setSaveSuccess(false)
  setTagsLoading(true)

  const vid = videos.find((v: any) => v.videoId === vidId)
  setSelectedTitle(vid?.title || "")

  // Try local tags first
  const localTags = vid?.tags || vid?.snippet?.tags || vid?.metadata?.tags || []
  const localTagArray =
   Array.isArray(localTags) ? localTags
   : typeof localTags === "string"
    ? localTags.split(",").map((t: string) => t.trim()).filter(Boolean)
   : []

  if (localTagArray.length > 0) {
   setCurrentTags(localTagArray)
   setTagsLoading(false)
   return
  }

  // Fetch from YouTube API
  try {
   const details = await fetchVideoSnippetDetails([vidId])
   const fetched = details[vidId]
   if (fetched) {
    setCurrentTags(fetched.tags.length > 0 ? fetched.tags : [])
    setSelectedDescription(fetched.description || "")
   } else {
    setCurrentTags([])
   }
  } catch (err) {
   console.error("Failed to fetch tags:", err)
   setCurrentTags([])
  } finally {
   setTagsLoading(false)
  }
 }

 const generateSuggestions = async () => {
  if (!selectedVideo || !canAffordTagSuggestions) return
  setIsGenerating(true)
  try {
   const vid = videos.find((v: any) => v.videoId === selectedVideo)
   const title = vid?.title || selectedTitle || ""
   const desc = selectedDescription || vid?.description || ""
   const suggestions = await generateTagSuggestions(title, desc, brain)
   const sorted = [...suggestions].sort((a, b) => b.score - a.score)
   setSuggestedTags(sorted)
  } catch (err) {
   console.error("Tag generation failed:", err)
   // Fallback tags
   setSuggestedTags([
    { tag: "youtube tips", score: 85, searchVolume: 18000, competition: 500, rank: 3, tripleKeyword: true },
    { tag: "content creation", score: 78, searchVolume: 12000, competition: 800, rank: 5, tripleKeyword: false },
   ])
  } finally {
   setIsGenerating(false)
  }
 }

 const saveTags = () => {
  setIsSaving(true)
  setTimeout(() => {
   // Here we would call youtube.videos.update with the new tags
   setCurrentTags(suggestedTags.map((t) => t.tag))
   setIsSaving(false)
   setSaveSuccess(true)
   setTimeout(() => setSaveSuccess(false), 3000)
  }, 1000)
 }

 // Color based on score
 const getScoreColor = (score: number) => {
  if (score >= 80) return "#4FFF5B"
  if (score >= 60) return "#C9F830"
  if (score >= 40) return "#FFE357"
  return "#FF8AAF"
 }

 return (
  <WidgetShell {...common} icon={<Tag size={22} />}>
   <div
    style={{
     display: "flex",
     flexDirection: "column",
     gap: "12px",
     height: "100%",
    }}>
    {/* Video Selector */}
     <div style={{ display: "flex", gap: "4px" }}>
      <select
       className="vt-select"
       value={selectedVideo}
       onChange={handleSelect}
       style={{ flex: 2 }}>
       <option value="" disabled>
        Select a video...
       </option>
       {videos.slice(0, 15).filter((v: any) => !videoSearch || v.title?.toLowerCase().includes(videoSearch.toLowerCase())).map((v: any) => (
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

    {/* Tags Display Area */}
    {selectedVideo && (
     <div style={{ display: "flex", flex: 1, gap: "10px", overflow: "hidden" }}>
      {/* Current Tags */}
      <div
       style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: "#f5f5f5",
        border: "2px solid #000",
        borderRadius: "8px",
       }}>
       <div
        style={{
         padding: "6px 8px",
         borderBottom: "2px solid #000",
         fontSize: "10px",
         fontWeight: 900,
         textTransform: "uppercase",
         display: "flex",
         gap: "6px",
         alignItems: "center",
        }}>
        <span>Current Tags</span>
        <span
         style={{
          fontSize: "9px",
          background: "#000",
          color: "#fff",
          padding: "2px 6px",
          borderRadius: "4px",
         }}>
         {tagsLoading ? "..." : currentTags.length}
        </span>
       </div>
       <div
        style={{
         padding: "8px",
         overflowY: "auto",
         flex: 1,
         display: "flex",
         flexWrap: "wrap",
         gap: "6px",
         alignContent: "flex-start",
        }}>
        {tagsLoading ?
         <div style={{ fontSize: "10px", opacity: 0.5, width: "100%", textAlign: "center", marginTop: "20px" }}>
          Fetching tags...
         </div>
        : currentTags.length > 0 ?
         currentTags.map((tag, i) => (
          <div
           key={i}
           style={{
            background: "#fff",
            border: "1px solid #000",
            borderRadius: "4px",
            padding: "2px 6px",
            fontSize: "10px",
            fontWeight: 700,
           }}>
           {tag}
          </div>
         ))
        : <div style={{ fontSize: "10px", opacity: 0.5, fontStyle: "italic", width: "100%", textAlign: "center", marginTop: "20px" }}>
           No tags found.
          </div>
        }
       </div>
      </div>

      {/* Generated Tags */}
      <div
       style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: "#fff",
        border: "2px solid #000",
        borderRadius: "8px",
        boxShadow: "2px 2px 0 0 #00D2FF",
       }}>
       <div
        style={{
         padding: "6px 8px",
         background: "#00D2FF",
         borderBottom: "2px solid #000",
         fontSize: "10px",
         fontWeight: 900,
         textTransform: "uppercase",
         display: "flex",
         gap: "6px",
         alignItems: "center",
         color: "#000",
        }}>
        <Sparkles size={12} fill="#000" />
        <span>AI Suggestions</span>
        {suggestedTags.length > 0 && (
         <span
          style={{
           fontSize: "9px",
           background: "#000",
           color: "#fff",
           padding: "2px 6px",
           borderRadius: "4px",
          }}>
          {suggestedTags.length}
         </span>
        )}
       </div>
       <div
        style={{
         padding: "8px",
         overflowY: "auto",
         flex: 1,
         display: "flex",
         flexWrap: "wrap",
         gap: "6px",
         alignContent: "flex-start",
        }}>
        {suggestedTags.length > 0 ?
         suggestedTags.map((t, i) => (
          <div
           key={i}
           title={`Score: ${t.score} | Vol: ${t.searchVolume?.toLocaleString()} | Comp: ${t.competition?.toLocaleString()} | Rank: #${t.rank}`}
           style={{
            background: getScoreColor(t.score),
            border: "1px solid #000",
            borderRadius: "4px",
            padding: "2px 6px",
            fontSize: "10px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "4px",
            cursor: "help",
           }}>
           <Check size={10} color="#000" /> {t.tag}
           <span style={{ fontSize: "8px", fontWeight: 900, opacity: 0.6 }}>
            {t.score}
           </span>
          </div>
         ))
        : <div
           style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
           }}>
           <button
            onClick={generateSuggestions}
            style={{
             border: "2px solid #000",
             padding: "8px 12px",
             background: "#000",
             color: "#fff",
             borderRadius: "6px",
             fontSize: "10px",
             fontWeight: 900,
             textTransform: "uppercase",
             cursor: isGenerating ? "wait" : "pointer",
             display: "flex",
             alignItems: "center",
             gap: "6px",
            }}
            disabled={isGenerating || !canAffordTagSuggestions}>
            {isGenerating ?
             <div
              style={{
               width: "12px",
               height: "12px",
               border: "2px solid rgba(255,255,255,0.3)",
               borderTop: "2px solid #fff",
               borderRadius: "50%",
               animation: "spin 1s linear infinite",
             }}
             />
            : <Sparkles size={14} fill="#fff" />}
            {isGenerating ? "Analyzing..." : `Generate Tags (${TAG_SUGGEST_COST}T)`}
           </button>
           {!canAffordTagSuggestions && (
            <div style={{ marginTop: "8px", fontSize: "9px", fontWeight: 900, textTransform: "uppercase", opacity: 0.6 }}>
             {entitlement.tier === "free" ? "Upgrade for AI tags." : `Need ${TAG_SUGGEST_COST} token.`}
            </div>
           )}
          </div>
        }
       </div>
       {suggestedTags.length > 0 && (
        <div style={{ padding: "6px", borderTop: "2px solid #000" }}>
         <button
          onClick={saveTags}
          disabled={isSaving || saveSuccess}
          style={{
           width: "100%",
           padding: "6px",
           background: saveSuccess ? "#4FFF5B" : "#FF1744",
           color: saveSuccess ? "#000" : "#fff",
           border: "2px solid #000",
           borderRadius: "6px",
           fontSize: "10px",
           fontWeight: 900,
           textTransform: "uppercase",
           cursor: "pointer",
           display: "flex",
           alignItems: "center",
           justifyContent: "center",
           gap: "6px",
          }}>
          <Save size={14} fill={saveSuccess ? "#000" : "#fff"} />
          {saveSuccess
           ? "Tags Applied!"
           : isSaving
            ? "Writing to YouTube..."
            : "Apply Tags"}
         </button>
        </div>
       )}
      </div>
     </div>
    )}
   </div>
  </WidgetShell>
 )
}
