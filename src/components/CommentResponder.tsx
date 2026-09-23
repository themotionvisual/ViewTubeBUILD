import React from "react"
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ExternalLink, Link2, Loader2, MessageCircle, MessagesSquare, RefreshCw, Sparkles, ThumbsUp } from "lucide-react"
import { buildYouTubeCommentUrl } from "../services/youtube/commentHandoff"
import { SubToolbox, SubToolboxGridActionButton, SubToolboxInnerActionButton } from "./Toolbox"
import { StudioButton, StudioIconButton, StudioTextArea } from "../studio-ui"
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
 const dataState = !context.connected ? "disconnected" : comments.loading ? "loading" : comments.error ? "error" : comments.displayThreads.length ? "ready" : "empty"
 const queueStatus = dataState === "disconnected"
  ? "Connect your YouTube channel to load comments."
  : dataState === "loading"
   ? "Syncing comments…"
   : dataState === "error"
    ? "Comments could not be loaded."
    : dataState === "empty"
     ? comments.tab === "history" ? "No reply history yet." : "No unreplied comments found."
     : `${comments.currentIndex + 1} of ${comments.displayThreads.length}`

 return <div data-vt-comment-responder data-state={dataState} className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-4 lg:gap-8 items-start w-full p-1 sm:p-3 lg:p-8 bg-white">
  <div className="flex flex-col gap-2 sm:gap-4 lg:gap-6 min-w-0">
   <SubToolbox title="Comment Queue" icon={<MessagesSquare />} collapsible isOpenInitial>
    <div className="grid grid-cols-2 gap-2" aria-label="Comment queue view">
     <SubToolboxInnerActionButton label={`New · ${comments.tab === "unreplied" ? comments.displayThreads.length : ""}`} iconName="message" tone={comments.tab === "unreplied" ? "pink" : "cyan"} onClick={() => comments.setTab("unreplied")} />
     <SubToolboxInnerActionButton label={`History · ${comments.tab === "history" ? comments.displayThreads.length : ""}`} iconName="history" tone={comments.tab === "history" ? "pink" : "cyan"} onClick={() => comments.setTab("history")} />
    </div>
    <div className="grid grid-cols-[1fr_auto] gap-2 mt-2 sm:mt-3 lg:mt-4">
     <div className="grid grid-cols-2 gap-2">
      <StudioButton type="button" aria-label="Previous comment" disabled={!context.connected || comments.currentIndex === 0} onClick={() => comments.setCurrentIndex(Math.max(0, comments.currentIndex - 1))} tone="neutral">Previous</StudioButton>
      <StudioButton type="button" aria-label="Next comment" disabled={!context.connected || comments.currentIndex >= comments.displayThreads.length - 1} onClick={() => comments.setCurrentIndex(Math.min(comments.displayThreads.length - 1, comments.currentIndex + 1))} tone="neutral">Next</StudioButton>
     </div>
     <StudioIconButton type="button" aria-label={context.connected ? "Refresh comments" : "Connect YouTube channel"} onClick={context.connected ? comments.refresh : comments.reconnect} disabled={context.connected && comments.loading} tone="accent">
      {context.connected ? <RefreshCw size={17} className={comments.loading ? "animate-spin" : ""} aria-hidden="true" /> : <Link2 size={17} aria-hidden="true" />}
     </StudioIconButton>
    </div>
    <div role="status" aria-live="polite" className="mt-2 sm:mt-3 min-h-5 text-[10px] font-black uppercase">{queueStatus}</div>
    {!context.connected && <StudioButton type="button" sizeVariant="action" className="mt-2 sm:mt-3 w-full" onClick={comments.reconnect}>Connect YouTube Channel</StudioButton>}
   </SubToolbox>

   <SubToolbox title="Video Context" icon={<MessageCircle />} collapsible isOpenInitial>
    {thread ? <div className="grid grid-cols-[120px_1fr] gap-4 min-w-0">
     <div className="aspect-video border-[3px] border-black rounded-xl overflow-hidden bg-gray-100">{thumbnail ? <img src={thumbnail} width={320} height={180} alt={`Thumbnail for ${videoTitle}`} className="w-full h-full object-cover" /> : <div className="w-full h-full grid place-items-center"><Loader2 className="animate-spin" /></div>}</div>
     <div className="min-w-0"><p className="text-[9px] font-black uppercase opacity-45">Commented On</p><h3 className="font-black text-base leading-tight break-words">{videoTitle}</h3>{commentUrl && <a href={commentUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-[10px] font-black uppercase underline"><ExternalLink size={13} aria-hidden="true" />Go to Comment</a>}</div>
    </div> : <p className="p-6 text-center font-black uppercase opacity-35">{context.connected ? "Select a comment to see its video." : "Video context will appear after you connect your channel."}</p>}
   </SubToolbox>

   {comments.inboundImageUrl && <SubToolbox title="Received Image" icon={<Link2 />} collapsible isOpenInitial={false}><div className="flex items-center gap-3"><StudioTextArea readOnly value={comments.inboundImageUrl} aria-label="Received image URL" className="min-h-[72px]" /><StudioButton type="button" onClick={() => navigator.clipboard.writeText(comments.inboundImageUrl || "")}>Copy URL</StudioButton></div></SubToolbox>}
  </div>

  <div className="flex flex-col gap-2 sm:gap-4 lg:gap-6 min-w-0">
   <SubToolbox title="Current Comment" icon={<MessageCircle />} collapsible isOpenInitial>
    {snippet ? <div className="border-[3px] border-black rounded-2xl bg-[#FFF9E8] p-5">
     <div className="flex items-center justify-between gap-3"><strong className="min-w-0 truncate text-sm">{plainText(snippet.authorDisplayName || "Viewer")}</strong><span className="shrink-0 text-[9px] font-black uppercase opacity-45">{Number(snippet.likeCount || 0).toLocaleString()} Likes</span></div>
     <p className="mt-4 whitespace-pre-wrap break-words text-base font-bold leading-snug">{plainText(snippet.textDisplay || snippet.textOriginal || "")}</p>
    </div> : <div className="min-h-24 sm:min-h-32 lg:min-h-44 grid place-items-center border-[3px] border-black rounded-xl sm:rounded-2xl bg-white/60 opacity-50 font-black uppercase text-center p-3 sm:p-4 lg:p-6">{dataState === "disconnected" ? "Connect your channel to load comments." : dataState === "loading" ? "Loading comments…" : dataState === "error" ? "Comments unavailable. Use refresh or reconnect and try again." : "No comment selected."}</div>}
    {comments.error && context.connected && <div role="alert" className="mt-4 border-[3px] border-black bg-[#FFB158] p-3 rounded-xl text-xs font-black">{comments.error}</div>}
   </SubToolbox>

   {replies.length > 0 && <SubToolbox title={`Reply History · ${replies.length}`} icon={<MessagesSquare />} collapsible isOpenInitial={comments.tab === "history"}>
    <div className="max-h-64 overflow-y-auto space-y-2" style={{ contentVisibility: "auto" }}>{replies.map((reply: any, index: number) => <div key={reply.id || index} className="border-[2px] border-black rounded-xl p-3 bg-white"><div className="text-[9px] font-black uppercase opacity-45">{plainText(reply.snippet?.authorDisplayName || "Reply")}</div><p className="mt-1 text-xs font-bold whitespace-pre-wrap break-words">{plainText(reply.snippet?.textDisplay || "")}</p></div>)}</div>
   </SubToolbox>}

   <SubToolbox title={comments.tab === "history" ? "Follow-Up Reply" : "Reply Composer"} icon={<Sparkles />} collapsible isOpenInitial>
    <label htmlFor="comment-reply-copy" className="text-[10px] font-black uppercase">Reply</label>
    <StudioTextArea id="comment-reply-copy" name="commentReply" value={comments.replyText} onChange={(event) => comments.setReplyText(event.target.value)} placeholder={!context.connected ? "Connect your YouTube channel to reply…" : comments.tab === "history" ? "Add a follow-up reply…" : "Write or generate a reply…"} className="mt-2 min-h-[110px] sm:min-h-[130px] lg:min-h-[150px]" disabled={!context.connected || !thread} />
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-2 sm:mt-4">
     <SubToolboxInnerActionButton label={comments.generating ? "Working…" : comments.replyText.trim() ? "Refine" : "Draft"} iconName="sparkles" tone="yellow" disabled={!context.connected || !thread || comments.generating} onClick={comments.draftReply} />
     <SubToolboxInnerActionButton label="Suggest Video" iconName="link" tone="cyan" disabled={!context.connected || !thread || comments.generating} onClick={comments.suggestVideo} />
    </div>
   </SubToolbox>

   <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
    {commentUrl ? <a href={commentUrl} target="_blank" rel="noreferrer" className="min-h-14 border-[4px] border-black rounded-[16px] bg-[#FFC587] shadow-[5px_5px_0_0_#F59E46] font-black uppercase text-lg flex items-center justify-center gap-2 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"><ThumbsUp size={18} aria-hidden="true" />Open on YouTube</a> : <SubToolboxGridActionButton label="Open Comment" iconName="external-link" tone="orange" disabled onClick={() => {}} />}
    <SubToolboxGridActionButton label={comments.canPostReply ? "Post Reply" : context.connected ? "Reconnect Channel" : "Connect Channel"} iconName={comments.canPostReply ? "send" : "link"} tone="green" disabled={comments.canPostReply && (!thread || !comments.replyText.trim() || comments.loading)} onClick={comments.canPostReply ? comments.postReply : comments.reconnect} />
   </div>
  </div>
 </div>
}
