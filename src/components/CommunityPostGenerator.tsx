import React, { useRef } from "react"
import { Archive, CheckSquare, ExternalLink, FileText, Image, MessageSquare, Sparkles, Trash2, Upload, Video } from "lucide-react"
import { StandardInput, StandardTextArea, SubToolbox, SubToolboxDropdownControl, SubToolboxGridActionButton, SubToolboxInnerActionButton } from "./Toolbox"
import { useCommunityPostController, useCreatorEngagementContext, type CommunityPostType } from "../features/creator-engagement"

const POST_TYPES: Array<{ id: CommunityPostType; label: string; icon: React.ComponentType<{ size?: number }> }> = [
 { id: "text", label: "Text", icon: FileText }, { id: "image", label: "Image", icon: Image },
 { id: "poll", label: "Poll", icon: CheckSquare }, { id: "image-poll", label: "Image Poll", icon: MessageSquare },
 { id: "video", label: "Video", icon: Video },
]

export const CommunityPostGenerator: React.FC = () => {
 const context = useCreatorEngagementContext()
 const post = useCommunityPostController(context)
 const imageInput = useRef<HTMLInputElement>(null)
 const pollInputs = useRef<Array<HTMLInputElement | null>>([])

 return <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start w-full p-4 sm:p-6 lg:p-8 bg-white">
  <div className="flex flex-col gap-6 min-w-0">
   <SubToolbox title="Post Workspace" icon={<MessageSquare />} collapsible isOpenInitial>
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2" aria-label="Post type">
     {POST_TYPES.map(({ id, label, icon: Icon }) => <button key={id} type="button" aria-pressed={post.postType === id} onClick={() => post.setPostType(id)} className={`min-h-12 border-[3px] border-black rounded-xl px-2 py-2 font-black uppercase text-[10px] flex items-center justify-center gap-2 shadow-[3px_3px_0_0_black] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-[transform,box-shadow,background-color] ${post.postType === id ? "bg-[#FFE357]" : "bg-white"}`}><Icon size={15} aria-hidden="true" />{label}</button>)}
    </div>
    <div className="grid grid-cols-2 gap-2 mt-4" aria-label="Community post mode">
     <SubToolboxInnerActionButton label="Write" iconName="edit" tone={post.mode === "write" ? "pink" : "cyan"} onClick={() => post.setMode("write")} />
     <SubToolboxInnerActionButton label="Create" iconName="sparkles" tone={post.mode === "create" ? "pink" : "cyan"} onClick={() => post.setMode("create")} />
    </div>
   </SubToolbox>

   <SubToolbox title={post.mode === "write" ? "Write Post" : "AI Creator"} icon={<Sparkles />} collapsible isOpenInitial>
    <label htmlFor="community-post-copy" className="text-[10px] font-black uppercase tracking-wider">{post.mode === "write" ? "Post Copy" : "Creation Prompt"}</label>
    <StandardTextArea id="community-post-copy" name="communityPostCopy" value={post.mode === "write" ? post.content : post.prompt} onChange={(event) => post.mode === "write" ? post.setContent(event.target.value) : post.setPrompt(event.target.value)} placeholder={post.mode === "write" ? "Write your community post…" : "Describe the community post you want to create…"} minHeight="180px" className="mt-2" />
    {post.mode === "create" && <div className="mt-4"><SubToolboxDropdownControl label="Writing Style" value={post.style} options={["Educational", "Conversational", "Hype", "Question", "Announcement"]} onChange={post.setStyle} tone="yellow" /></div>}
    <div className="mt-4"><SubToolboxGridActionButton label={post.isGenerating ? "Working…" : post.mode === "write" ? "Refine Post" : "Generate Post"} iconName="sparkles" tone="pink" disabled={post.isGenerating || !(post.mode === "write" ? post.content.trim() : post.prompt.trim())} onClick={post.mode === "write" ? post.refine : post.generate} /></div>
   </SubToolbox>

   {post.postType.includes("poll") && <SubToolbox title="Poll Options" icon={<CheckSquare />} collapsible isOpenInitial>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{post.pollOptions.map((option, index) => <div key={index} className="min-w-0">
     <label htmlFor={`community-poll-${index}`} className="text-[9px] font-black uppercase">Option {index + 1}</label>
     <StandardInput id={`community-poll-${index}`} name={`communityPollOption${index + 1}`} value={option} onChange={(event) => post.setPollOption(index, event.target.value)} placeholder={`Option ${index + 1}…`} />
     {post.postType === "image-poll" && <><input ref={(node) => { pollInputs.current[index] = node }} className="hidden" type="file" accept="image/*" onChange={(event) => post.applyImageFile(event.target.files?.[0], index)} /><button type="button" className="mt-2 w-full min-h-11 border-[3px] border-black rounded-xl bg-[#73DEFF] font-black uppercase text-[9px] flex items-center justify-center gap-2" onClick={() => pollInputs.current[index]?.click()}><Upload size={14} aria-hidden="true" />{post.imagePollUrls[index] ? "Replace Image" : "Add Image"}</button></>}
    </div>)}</div>
   </SubToolbox>}
  </div>

  <div className="flex flex-col gap-6 min-w-0">
   {(post.postType === "image" || post.postType === "image-poll") && <SubToolbox title="Post Media" icon={<Image />} collapsible isOpenInitial>
    <input ref={imageInput} className="hidden" type="file" accept="image/*" onChange={(event) => post.applyImageFile(event.target.files?.[0])} />
    <label htmlFor="community-image-url" className="text-[10px] font-black uppercase">Image URL</label>
    <StandardInput id="community-image-url" name="communityImageUrl" type="url" value={post.imageUrl} onChange={(event) => post.setImageUrl(event.target.value)} placeholder="https://example.com/image.jpg…" />
    <button type="button" onClick={() => imageInput.current?.click()} className="mt-3 w-full min-h-12 border-[3px] border-black rounded-xl bg-[#73DEFF] font-black uppercase flex items-center justify-center gap-2 shadow-[3px_3px_0_0_black] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"><Upload size={17} aria-hidden="true" />Browse Files</button>
    {post.imageUrl && <img src={post.imageUrl} alt="Community post preview" width={640} height={360} className="mt-4 w-full aspect-video object-cover border-[3px] border-black rounded-xl" />}
   </SubToolbox>}

   {post.postType === "video" && <SubToolbox title="Linked Video" icon={<Video />} collapsible isOpenInitial>
    <label htmlFor="community-video-search" className="text-[10px] font-black uppercase">Search Videos</label>
    <StandardInput id="community-video-search" name="communityVideoSearch" type="search" autoComplete="off" value={post.videoSearch} onChange={(event) => post.setVideoSearch(event.target.value)} placeholder="Search titles or video IDs…" />
    <div className="mt-3 max-h-56 overflow-y-auto border-[3px] border-black rounded-xl p-2 space-y-2" style={{ contentVisibility: "auto" }}>{post.filteredVideos.map((video) => <button type="button" key={video.videoId} aria-pressed={post.selectedVideoId === video.videoId} onClick={() => post.setSelectedVideoId(video.videoId)} className={`w-full text-left border-[2px] border-black rounded-lg p-2 text-[10px] font-black ${post.selectedVideoId === video.videoId ? "bg-[#FFE357]" : "bg-white"}`}>{video.title || video.videoId}</button>)}{!post.filteredVideos.length && <p className="p-4 text-center text-[10px] font-black uppercase opacity-50">No videos found.</p>}</div>
   </SubToolbox>}

   <SubToolbox title="Post Preview" icon={<FileText />} collapsible isOpenInitial>
    <div className="min-h-48 border-[3px] border-black rounded-xl bg-[#FFF9E8] p-5 whitespace-pre-wrap break-words text-sm font-bold">{post.content || <span className="opacity-35 uppercase">Your post preview will appear here.</span>}</div>
    <div role="status" aria-live="polite" className="min-h-5 mt-2 text-[10px] font-black uppercase">{post.clipboardStatus === "copied" ? "Post copied." : post.clipboardStatus === "error" ? "Copy failed." : ""}</div>
    {post.error && <div role="alert" className="border-[3px] border-black bg-[#FFB158] p-3 rounded-xl text-xs font-black">{post.error}</div>}
   </SubToolbox>

   <SubToolbox title={`Draft Vault · ${post.vault.length}`} icon={<Archive />} collapsible isOpenInitial={false}>
    <div className="max-h-64 overflow-y-auto space-y-2" style={{ contentVisibility: "auto" }}>{post.vault.map((draft) => <div key={draft.id} className="grid grid-cols-[1fr_auto] gap-2 border-[2px] border-black rounded-lg p-2"><button type="button" className="text-left min-w-0" onClick={() => post.loadFromVault(draft.id)}><span className="block text-[9px] font-black uppercase opacity-50">{draft.type}</span><span className="block truncate text-xs font-black">{draft.content || "Untitled draft"}</span></button><button type="button" aria-label="Delete draft" onClick={() => post.removeFromVault(draft.id)} className="size-10 border-[2px] border-black rounded-lg grid place-items-center bg-[#FF77D6]"><Trash2 size={15} aria-hidden="true" /></button></div>)}{!post.vault.length && <p className="p-4 text-center text-[10px] font-black uppercase opacity-50">No saved drafts.</p>}</div>
   </SubToolbox>

   <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
    <SubToolboxGridActionButton label="Save Draft" iconName="archive" tone="yellow" disabled={!post.content.trim()} onClick={post.saveToVault} />
    <SubToolboxGridActionButton label={post.clipboardStatus === "copied" ? "Copied" : "Copy Post"} iconName={post.clipboardStatus === "copied" ? "check" : "copy"} tone="green" disabled={!post.content.trim()} onClick={post.copyPost} />
    {post.channelCommunityUrl ? <a href={post.channelCommunityUrl} target="_blank" rel="noreferrer" className="min-h-14 border-[4px] border-black rounded-[16px] bg-[#86B5FF] shadow-[5px_5px_0_0_#3979DB] font-black uppercase text-lg flex items-center justify-center gap-2 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"><ExternalLink size={19} aria-hidden="true" />Go to Channel</a> : <SubToolboxGridActionButton label="Connect Channel" iconName="link" tone="blue" onClick={context.reconnect} />}
   </div>
  </div>
 </div>
}
