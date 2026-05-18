import React, { useState } from "react"
import { MessageCircle, Sparkles, Loader2, Copy, Check } from "lucide-react"
import { PostActionReflection } from "./PostActionReflection"
import { generateCommentResponses } from "../services/gemini"
import { youtubeApiClient } from "../services/youtube/youtubeApiClient"
import Markdown from "react-markdown"
import { SubToolbox } from "./Toolbox"

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
   const response = await youtubeApiClient.fetchCommentThreads({ allThreads: true })
   setFetchedThreads(response.items || [])
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
        <div className="max-h-48 overflow-y-auto border-[4px] border-black rounded-xl p-2 space-y-2 bg-gray-50 custom-scrollbar">
         {fetchedThreads.map((thread) => {
          const text = thread.snippet.topLevelComment.snippet.textDisplay
          const author = thread.snippet.topLevelComment.snippet.authorDisplayName
          return (
           <button
            key={thread.id}
            onClick={() => selectComment(text)}
            className="w-full text-left p-2 hover:bg-[#FF3399]/10 rounded-lg transition-colors border-2 border-transparent hover:border-black/10"
           >
            <div className="text-[9px] font-black uppercase opacity-50">{author}</div>
            <div className="text-xs font-bold line-clamp-2">{text}</div>
           </button>
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
      className="w-full mt-6 bg-[#FFB158] text-black border-[4px] border-black p-4 font-black uppercase text-xl rounded-xl shadow-[6px_6px_0px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-3">
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
     <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-[4px] border-dashed border-black/20 rounded-[32px] bg-gray-50 p-8 text-center">
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
