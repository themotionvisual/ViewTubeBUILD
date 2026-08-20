import React, { useState } from "react"
import { MessageCircle, Sparkles, Loader2, ExternalLink, ThumbsUp, Film } from "lucide-react"
import { PostActionReflection } from "./PostActionReflection"
import { generateCommentResponses, recommendVideoForComment } from "../services/gemini"
import { fetchAllCommentThreads, getRecentVideos, fetchVideoDetails } from "../services/youtubeService"
import Markdown from "react-markdown"
import { SubToolbox } from "./Toolbox"
import { buildYouTubeCommentUrl } from "../services/youtube/commentHandoff"

export const CommentResponder: React.FC = () => {
 const [comments, setComments] = useState("")
 const [result, setResult] = useState("")
 const [loading, setLoading] = useState(false)
 const [fetching, setFetching] = useState(false)
 const [copied, setCopied] = useState(false)
 const [fetchedThreads, setFetchedThreads] = useState<any[]>([])
 // Recommend-video state — tracks which fetched thread produced the reply so
 // we can look up the source video the comment was actually left on.
 const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)
 const [recommending, setRecommending] = useState(false)
 const [recommendError, setRecommendError] = useState<string | null>(null)

 const handleGenerate = async () => {
  if (!comments) return
  setLoading(true)
  try {
   const cache = JSON.parse(localStorage.getItem("yt_analytics_cache") || "{}")
   const context = cache.profile
    ? JSON.stringify(cache.profile)
    : "General YouTube Channel"
   const res = await generateCommentResponses(comments, context)
   setResult(res)
  } catch (e) {
   console.error(e)
  } finally {
   setLoading(false)
  }
 }

 const handleFetchComments = async () => {
  setFetching(true)
  try {
   setFetchedThreads(await fetchAllCommentThreads(100))
  } catch (e) {
   console.error("Failed to fetch comments:", e)
  } finally {
   setFetching(false)
  }
 }

 const selectComment = (text: string, threadId?: string) => {
  setComments(text)
  setSelectedThreadId(threadId ?? null)
  setRecommendError(null)
 }

 // Analyze (a) the comment text and (b) the metadata of the video the comment
 // was left on — then ask Gemini to pick the best video from the creator's
 // catalog to recommend back to the viewer, and splice a bridge-phrase +
 // YouTube URL into the generated reply so the recommendation lands INSIDE
 // the comment the creator will post.
 const handleRecommendVideo = async () => {
  if (!comments) return
  setRecommending(true)
  setRecommendError(null)
  try {
   // Source video the comment was left on (best-effort — only if the user
   // selected a fetched thread; pasted comments won't have one).
   const sourceThread = selectedThreadId
    ? fetchedThreads.find((t) => t.id === selectedThreadId)
    : null
   const sourceVideoId: string | undefined =
    sourceThread?.snippet?.videoId ?? undefined

   let sourceVideoContext = ""
   if (sourceVideoId) {
    try {
     const details = await fetchVideoDetails(sourceVideoId)
     sourceVideoContext = `\n\n### CONTEXT: THIS COMMENT WAS LEFT ON\nTitle: ${details.title}\nDescription: ${(details.description || "").slice(0, 400)}`
    } catch {
     // Non-fatal — we can still recommend from comment text alone.
    }
   }

   // Creator's video catalog. Prefer the analytics cache (already-synced
   // channel videos); fall back to a fresh recent-videos fetch.
   const cache = JSON.parse(localStorage.getItem("yt_analytics_cache") || "{}")
   let catalog: Array<{ id: string; title: string; description?: string; tags?: string[] }> =
    Array.isArray(cache?.videos)
     ? cache.videos
        .map((v: any) => ({
         id: v.videoId || v.id,
         title: v.title || v.snippet?.title || "",
         description: v.description || v.snippet?.description || "",
         tags: v.tags || v.snippet?.tags || [],
        }))
        .filter((v: any) => v.id && v.title)
     : []
   if (catalog.length === 0) {
    const recent = await getRecentVideos(50)
    catalog = recent
     .map((item: any) => ({
      id: item.id?.videoId || item.id,
      title: item.snippet?.title || "",
      description: item.snippet?.description || "",
      tags: item.snippet?.tags || [],
     }))
     .filter((v: any) => v.id && v.title)
   }

   if (catalog.length === 0) {
    setRecommendError("No videos found in your catalog to recommend from.")
    return
   }

   const rec = await recommendVideoForComment(
    `${comments}${sourceVideoContext}`,
    catalog,
   )
   if (!rec.recommendedVideoId) {
    setRecommendError(rec.reason || "Gemini could not pick a matching video.")
    return
   }
   const picked = catalog.find((v) => v.id === rec.recommendedVideoId)
   const videoUrl = `https://youtu.be/${rec.recommendedVideoId}`
   const bridge = rec.bridgePhrase?.trim() || `You might also enjoy "${picked?.title || "this video"}":`
   const snippet = `\n\n**Recommended Video:** ${bridge} ${videoUrl}\n\n_Why this pick: ${rec.reason || `${rec.matchStrength}/100 match`}_`

   // Splice into the reply so the recommendation is IN the comment. If no
   // reply has been generated yet, seed the result with the recommendation.
   setResult((prev) => (prev ? `${prev}${snippet}` : `${bridge} ${videoUrl}`))
  } catch (e) {
   console.error("Failed to recommend video:", e)
   setRecommendError(e instanceof Error ? e.message : "Video recommendation failed.")
  } finally {
   setRecommending(false)
  }
 }

 const handleCopy = () => {
  navigator.clipboard.writeText(result)
  setCopied(true)
  setTimeout(() => setCopied(false), 2000)
 }

 return (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full p-8 animate-fade-in bg-white">
   <div className="flex flex-col h-full space-y-6">
    <SubToolbox
     title="Input Comments"
     icon={<MessageCircle size={24} />}
     headerColor="bg-[#FF3399]"
     collapsible
     isOpenInitial={true}>
      <div className="space-y-4">
       <div className="flex items-center justify-between">
        <label className="text-[10px] font-black uppercase tracking-widest text-black/50 ml-1">
         Paste Recent Comments
        </label>
        <button 
         onClick={handleFetchComments}
         disabled={fetching}
         className="text-[10px] font-black underline uppercase tracking-widest text-[#FF3399] hover:text-[#FF3399]/70 disabled:opacity-50"
        >
         {fetching ? "FETCHING..." : "FETCH REAL COMMENTS"}
        </button>
       </div>

       {fetchedThreads.length > 0 && (
        <div className="max-h-48 overflow-y-auto border-[2px] border-black rounded-xl p-2 space-y-2 bg-gray-50 custom-scrollbar">
         {fetchedThreads.map((thread) => {
          const topLevelComment = thread.snippet?.topLevelComment
          const text = topLevelComment?.snippet?.textDisplay || ""
          const author = topLevelComment?.snippet?.authorDisplayName || "Unknown viewer"
          const videoId = thread.snippet?.videoId
          const commentUrl = buildYouTubeCommentUrl(videoId, topLevelComment?.id || thread.id)
          const replies = thread.replies?.comments || []
          return (
           <div key={thread.id} className="p-2 rounded-lg border-2 border-transparent hover:border-black/10">
            <div className="flex items-start gap-2">
             <button
              onClick={() => selectComment(text, thread.id)}
              className="flex-1 min-w-0 text-left hover:bg-[#FF3399]/10 rounded-lg transition-colors"
             >
              <div className="text-[9px] font-black uppercase opacity-50">{author}</div>
              <div className="text-xs font-bold line-clamp-2">{text}</div>
             </button>
             {commentUrl && (
              <a
               href={commentUrl}
               target="_blank"
               rel="noreferrer"
               title="Open this comment in YouTube to like it"
               className="shrink-0 border-2 border-black bg-[#FFB158] p-1 text-black hover:bg-[#FF3399]"
              >
               <ThumbsUp size={13} aria-hidden="true" />
               <span className="ml-1 text-[8px] font-black uppercase">Like on YouTube</span>
              </a>
             )}
            </div>
            {replies.length > 0 && (
             <div className="mt-2 ml-2 space-y-1 border-l-2 border-black/20 pl-2">
              <div className="text-[8px] font-black uppercase opacity-50">Previous replies</div>
              {replies.map((reply: any) => {
               const replyUrl = buildYouTubeCommentUrl(videoId, reply.id)
               return (
                <div key={reply.id || reply.snippet?.publishedAt} className="flex items-start gap-2 text-[10px] font-bold">
                 <span className="flex-1 min-w-0 line-clamp-2">{reply.snippet?.textDisplay || ""}</span>
                 {replyUrl && <a href={replyUrl} target="_blank" rel="noreferrer" title="Open this reply in YouTube to like it" className="shrink-0 text-[8px] font-black uppercase text-black/60 hover:text-[#FF3399]"><ExternalLink size={12} aria-hidden="true" className="inline mr-1" />Like on YouTube</a>}
                </div>
               )
              })}
             </div>
            )}
           </div>
          )
         })}
        </div>
       )}

       <textarea
        value={comments}
        onChange={(e) => setComments(e.target.value)}
        placeholder="PASTE COMMENTS HERE OR FETCH REAL ONES..."
        className="vt-textarea-standard h-40"
       />
      </div>
     <div className="mt-6 flex flex-col gap-3 sm:flex-row">
      <button
       onClick={handleGenerate}
       disabled={loading || !comments}
       className="flex-1 bg-[#FFB158] text-black border-[2px] border-black p-4 font-black uppercase text-xl rounded-xl shadow-[6px_6px_0px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-3">
       {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
       Generate Replies
      </button>
      <button
       onClick={handleRecommendVideo}
       disabled={recommending || !comments}
       title={selectedThreadId
        ? "Analyze the source video + this comment, then recommend one of your videos in the reply"
        : "Recommend one of your videos in the reply (select a fetched comment first to also analyze the video it was left on)"}
       className="flex-1 bg-[#00E9C6] text-black border-[2px] border-black p-4 font-black uppercase text-xl rounded-xl shadow-[6px_6px_0px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-3">
       {recommending ? <Loader2 className="animate-spin" /> : <Film />}
       Recommend Video
      </button>
     </div>
     {recommendError ? (
      <p className="mt-2 text-[11px] font-black uppercase tracking-wide text-red-600">
       {recommendError}
      </p>
     ) : null}
    </SubToolbox>
   </div>

     <div className="flex flex-col h-full space-y-6">
     {result ? (
     <SubToolbox
      title="Generated Replies"
      icon={<Sparkles size={24} />}
      headerColor="bg-[#FFB158]"
      collapsible
      isOpenInitial={true}>
      <div className="prose prose-sm max-w-none font-bold text-black/80 prose-headings:font-black prose-headings:uppercase overflow-y-auto max-h-[400px] custom-scrollbar pr-4">
       <Markdown>{result}</Markdown>
      </div>
      <div className="mt-8 pt-6 border-t-[4px] border-black/10 animate-in slide-in-from-bottom-4 duration-700">
       <PostActionReflection toolId="COMMENT_RESPONDER" />
      </div>
     </SubToolbox>
     ) : (
     <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-[2px] border-dashed border-black/20 rounded-[32px] bg-gray-50 p-8 text-center">
      <MessageCircle size={80} className="mb-6 text-black/20" />
      <h3 className="text-3xl font-[1000] text-black/40 uppercase tracking-tighter mb-2">
       Awaiting Comments
      </h3>
      <p className="text-black/30 font-bold max-w-sm uppercase">
       Paste audience comments to generate branded, engaging responses.
      </p>
     </div>
    )}
   </div>
  </div>
 )
}
