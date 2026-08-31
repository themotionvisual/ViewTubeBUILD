import React from "react"
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ExternalLink, Link2, Loader2, MessageCircle, MessagesSquare, RefreshCw, Sparkles, ThumbsUp } from "lucide-react"
import { buildYouTubeCommentUrl } from "../services/youtube/commentHandoff"
import { StandardTextArea, SubToolbox, SubToolboxGridActionButton, SubToolboxInnerActionButton } from "./Toolbox"
import { useCommentResponderController, useCreatorEngagementContext } from "../features/creator-engagement"

const plainText = (value: string) => {
 if (typeof document === "undefined") return value
 return new DOMParser().parseFromString(value, "text/html").documentElement.textContent || value
}

export const CommentResponder: React.FC = () => {
 const context = useCreatorEngagementContext()
 const comments = useCommentResponderController(context)
 const thread = comments.currentThread
 const snippet = thread?.snippet?.topLevelComment?.snippet
 const videoId = String(thread?.snippet?.videoId || "")
 const canonicalVideo = context.videoAssets.find((video) => video.videoId === videoId)
 const fetchedVideo = comments.fetchedVideoData[videoId]
 const videoTitle = fetchedVideo?.title || canonicalVideo?.title || videoId || "Unknown video"
 const thumbnail = fetchedVideo?.thumbnails?.maxres?.url || canonicalVideo?.thumbnailUrl || (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "")
 const replies = thread?.replies?.comments || []
 const commentUrl = thread ? buildYouTubeCommentUrl(videoId, thread.snippet?.topLevelComment?.id || thread.id) : null

 return <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start w-full p-4 sm:p-6 lg:p-8 bg-white">
  <div className="flex flex-col gap-6 min-w-0">
   <SubToolbox title="Comment Queue" icon={<MessagesSquare />} collapsible isOpenInitial>
    <div className="grid grid-cols-2 gap-2" aria-label="Comment queue view">
     <SubToolboxInnerActionButton label={`New · ${comments.tab === "unreplied" ? comments.displayThreads.length : ""}`} iconName="message" tone={comments.tab === "unreplied" ? "pink" : "cyan"} onClick={() => comments.setTab("unreplied")} />
     <SubToolboxInnerActionButton label={`History · ${comments.tab === "history" ? comments.displayThreads.length : ""}`} iconName="history" tone={comments.tab === "history" ? "pink" : "cyan"} onClick={() => comments.setTab("history")} />
    </div>
    <div className="grid grid-cols-[1fr_auto] gap-2 mt-4">
     <div className="grid grid-cols-2 gap-2">
      <button type="button" aria-label="Previous comment" disabled={comments.currentIndex === 0} onClick={() => comments.setCurrentIndex(Math.max(0, comments.currentIndex - 1))} className="min-h-11 border-[3px] border-black rounded-xl bg-white font-black disabled:opacity-40">Previous</button>
      <button type="button" aria-label="Next comment" disabled={comments.currentIndex >= comments.displayThreads.length - 1} onClick={() => comments.setCurrentIndex(Math.min(comments.displayThreads.length - 1, comments.currentIndex + 1))} className="min-h-11 border-[3px] border-black rounded-xl bg-white font-black disabled:opacity-40">Next</button>
     </div>
     <button type="button" aria-label="Refresh comments" onClick={comments.refresh} disabled={comments.loading} className="size-11 border-[3px] border-black rounded-xl bg-[#73DEFF] grid place-items-center"><RefreshCw size={17} className={comments.loading ? "animate-spin" : ""} aria-hidden="true" /></button>
    </div>
    <div role="status" aria-live="polite" className="mt-3 min-h-5 text-[10px] font-black uppercase">{comments.loading ? "Syncing comments…" : comments.displayThreads.length ? `${comments.currentIndex + 1} of ${comments.displayThreads.length}` : "No comments found."}</div>
   </SubToolbox>

   <SubToolbox title="Video Context" icon={<MessageCircle />} collapsible isOpenInitial>
    {thread ? <div className="grid grid-cols-[120px_1fr] gap-4 min-w-0">
     <div className="aspect-video border-[3px] border-black rounded-xl overflow-hidden bg-gray-100">{thumbnail ? <img src={thumbnail} width={320} height={180} alt={`Thumbnail for ${videoTitle}`} className="w-full h-full object-cover" /> : <div className="w-full h-full grid place-items-center"><Loader2 className="animate-spin" /></div>}</div>
     <div className="min-w-0"><p className="text-[9px] font-black uppercase opacity-45">Commented On</p><h3 className="font-black text-base leading-tight break-words">{videoTitle}</h3>{commentUrl && <a href={commentUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-[10px] font-black uppercase underline"><ExternalLink size={13} aria-hidden="true" />Go to Comment</a>}</div>
    </div> : <p className="p-6 text-center font-black uppercase opacity-35">Select a comment to see its video.</p>}
   </SubToolbox>

   {comments.inboundImageUrl && <SubToolbox title="Received Image" icon={<Link2 />} collapsible isOpenInitial={false}><div className="flex items-center gap-3"><StandardTextArea readOnly value={comments.inboundImageUrl} aria-label="Received image URL" minHeight="72px" /><button type="button" onClick={() => navigator.clipboard.writeText(comments.inboundImageUrl || "")} className="min-h-12 border-[3px] border-black rounded-xl px-4 bg-[#FFE357] font-black uppercase">Copy URL</button></div></SubToolbox>}
  </div>

  <div className="flex flex-col gap-6 min-w-0">
   <SubToolbox title="Current Comment" icon={<MessageCircle />} collapsible isOpenInitial>
    {snippet ? <div className="border-[3px] border-black rounded-2xl bg-[#FFF9E8] p-5">
     <div className="flex items-center justify-between gap-3"><strong className="min-w-0 truncate text-sm">{plainText(snippet.authorDisplayName || "Viewer")}</strong><span className="shrink-0 text-[9px] font-black uppercase opacity-45">{Number(snippet.likeCount || 0).toLocaleString()} Likes</span></div>
     <p className="mt-4 whitespace-pre-wrap break-words text-base font-bold leading-snug">{plainText(snippet.textDisplay || snippet.textOriginal || "")}</p>
    </div> : <div className="min-h-44 grid place-items-center border-[3px] border-dashed border-black rounded-2xl opacity-35 font-black uppercase text-center p-6">{context.connected ? "No comment selected." : "Connect your channel to load comments."}</div>}
    {comments.error && <div role="alert" className="mt-4 border-[3px] border-black bg-[#FFB158] p-3 rounded-xl text-xs font-black">{comments.error}</div>}
   </SubToolbox>

   {replies.length > 0 && <SubToolbox title={`Reply History · ${replies.length}`} icon={<MessagesSquare />} collapsible isOpenInitial={comments.tab === "history"}>
    <div className="max-h-64 overflow-y-auto space-y-2" style={{ contentVisibility: "auto" }}>{replies.map((reply: any, index: number) => {
     const isOwnedReply = reply.snippet?.authorChannelId?.value === context.channelId
     const isEditing = comments.editingReplyId === reply.id
     return <div key={reply.id || index} className="border-[2px] border-black rounded-xl p-3 bg-white"><div className="flex items-center justify-between gap-3"><div className="text-[9px] font-black uppercase opacity-45">{plainText(reply.snippet?.authorDisplayName || "Reply")}</div>{isOwnedReply && !isEditing ? <button type="button" onClick={() => comments.startEditingReply(reply)} disabled={comments.loading} className="border-2 border-black rounded-lg bg-[#73DEFF] px-2 py-1 text-[9px] font-black uppercase disabled:opacity-40">Edit reply</button> : null}</div>{isEditing ? <><StandardTextArea aria-label="Edit reply" value={comments.editingReplyText} onChange={(event) => comments.setEditingReplyText(event.target.value)} minHeight="96px" className="mt-2" /><div className="mt-2 flex gap-2"><button type="button" onClick={comments.saveEditedReply} disabled={comments.loading || !comments.editingReplyText.trim()} className="border-2 border-black rounded-lg bg-[#CCFF00] px-3 py-2 text-[9px] font-black uppercase disabled:opacity-40">Save edit</button><button type="button" onClick={comments.cancelEditingReply} disabled={comments.loading} className="border-2 border-black rounded-lg bg-white px-3 py-2 text-[9px] font-black uppercase disabled:opacity-40">Cancel</button></div></> : <p className="mt-1 text-xs font-bold whitespace-pre-wrap break-words">{plainText(reply.snippet?.textDisplay || "")}</p>}</div>
    })}</div>
   </SubToolbox>}

   <SubToolbox title={comments.tab === "history" ? "Follow-Up Reply" : "Reply Composer"} icon={<Sparkles />} collapsible isOpenInitial>
    <label htmlFor="comment-reply-copy" className="text-[10px] font-black uppercase">Reply</label>
    <StandardTextArea id="comment-reply-copy" name="commentReply" value={comments.replyText} onChange={(event) => comments.setReplyText(event.target.value)} placeholder={comments.tab === "history" ? "Add a follow-up reply…" : "Write or generate a reply…"} minHeight="150px" className="mt-2" />
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
     <SubToolboxInnerActionButton label={comments.generating ? "Working…" : comments.replyText.trim() ? "Refine" : "Draft"} iconName="sparkles" tone="yellow" disabled={!thread || comments.generating} onClick={comments.draftReply} />
     <SubToolboxInnerActionButton label="Suggest Video" iconName="link" tone="cyan" disabled={!thread || comments.generating} onClick={comments.suggestVideo} />
    </div>
   </SubToolbox>

   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    {commentUrl ? <a href={commentUrl} target="_blank" rel="noreferrer" className="min-h-14 border-[4px] border-black rounded-[16px] bg-[#FFC587] shadow-[5px_5px_0_0_#F59E46] font-black uppercase text-lg flex items-center justify-center gap-2 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"><ThumbsUp size={18} aria-hidden="true" />Open on YouTube</a> : <SubToolboxGridActionButton label="Open Comment" iconName="external-link" tone="orange" disabled onClick={() => {}} />}
    <SubToolboxGridActionButton label={comments.canPostReply ? "Post Reply" : "Reconnect Channel"} iconName={comments.canPostReply ? "send" : "link"} tone="green" disabled={comments.canPostReply && (!thread || !comments.replyText.trim() || comments.loading)} onClick={comments.canPostReply ? comments.postReply : comments.reconnect} />
   </div>
  </div>
 </div>
}
