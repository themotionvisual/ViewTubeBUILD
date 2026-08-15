import React, { useState } from "react"
import { MessageCircle, Sparkles, Loader2, ExternalLink, ThumbsUp } from "lucide-react"
import { PostActionReflection } from "./PostActionReflection"
import { generateCommentResponses } from "../services/gemini"
import { fetchAllCommentThreads } from "../services/youtubeService"
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

 const selectComment = (text: string) => {
  setComments(text)
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
              onClick={() => selectComment(text)}
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
     <button
      onClick={handleGenerate}
      disabled={loading || !comments}
      className="w-full mt-6 bg-[#FFB158] text-black border-[2px] border-black p-4 font-black uppercase text-xl rounded-xl shadow-[6px_6px_0px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-3">
      {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
      Generate Replies
     </button>
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
