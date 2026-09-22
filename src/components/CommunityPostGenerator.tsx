import React, { useRef } from "react"
import { Archive, CheckSquare, ExternalLink, FileText, Image, MessageSquare, Sparkles, Trash2, Upload, Video } from "lucide-react"
import { SubToolbox, SubToolboxDropdownControl, SubToolboxGridActionButton, SubToolboxInnerActionButton } from "./Toolbox"
import { SubToolboxActions, SubToolboxGrid, SubToolboxSection, SubToolboxStack } from "./subtoolbox/SubToolboxLayouts"
import {
 SubToolboxFieldLabel,
 SubToolboxLinkButton,
 SubToolboxStatePanel,
 SubToolboxSurface,
} from "./subtoolbox/SubToolboxPrimitives"
import { StudioButton, StudioInput, StudioSearchInput, StudioSplitLeftButton, StudioTextArea } from "../studio-ui"
import { useCommunityPostController, useCreatorEngagementContext, type CommunityPostType } from "../features/creator-engagement"

const POST_WORKSPACE_PALETTE_INDEX = 4
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

 return <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start w-full px-0 py-4 sm:py-6 lg:py-8 bg-white">
  <div className="flex flex-col gap-6 min-w-0">
   <SubToolbox title="Post Workspace" icon={<MessageSquare />} paletteIndex={POST_WORKSPACE_PALETTE_INDEX} collapsible isOpenInitial>
    <SubToolboxStack>
    <SubToolboxGrid minItemWidth="compact" density="dense" aria-label="Post type">
     {POST_TYPES.map(({ id, label, icon: Icon }) => {
      const active = post.postType === id
      return <StudioSplitLeftButton
       key={id}
       sizeVariant="standard"
       selected={active}
       aria-pressed={active}
       icon={<Icon size={18} aria-hidden="true" />}
       onClick={() => post.setPostType(id)}
      >{label}</StudioSplitLeftButton>
     })}
    </SubToolboxGrid>
    <SubToolboxActions columns={2} aria-label="Community post mode">
     <SubToolboxInnerActionButton label="Write" iconName="edit" tone={post.mode === "write" ? "pink" : "cyan"} onClick={() => post.setMode("write")} />
     <SubToolboxInnerActionButton label="Create" iconName="sparkles" tone={post.mode === "create" ? "pink" : "cyan"} onClick={() => post.setMode("create")} />
    </SubToolboxActions>
    </SubToolboxStack>
   </SubToolbox>

   <SubToolbox title={post.mode === "write" ? "Write Post" : "AI Creator"} icon={<Sparkles />} collapsible isOpenInitial>
    <SubToolboxStack>
    <SubToolboxFieldLabel htmlFor="community-post-copy">{post.mode === "write" ? "Post Copy" : "Creation Prompt"}</SubToolboxFieldLabel>
    <StudioTextArea id="community-post-copy" name="communityPostCopy" value={post.mode === "write" ? post.content : post.prompt} onChange={(event) => post.mode === "write" ? post.setContent(event.target.value) : post.setPrompt(event.target.value)} placeholder={post.mode === "write" ? "Write your community post…" : "Describe the community post you want to create…"} />
    {post.mode === "create" && <SubToolboxDropdownControl label="Writing Style" value={post.style} options={["Educational", "Conversational", "Hype", "Question", "Announcement"]} onChange={post.setStyle} tone="yellow" />}
    <SubToolboxGridActionButton label={post.isGenerating ? "Working…" : post.mode === "write" ? "Refine Post" : "Generate Post"} iconName="sparkles" tone="pink" disabled={post.isGenerating || !(post.mode === "write" ? post.content.trim() : post.prompt.trim())} onClick={post.mode === "write" ? post.refine : post.generate} />
    </SubToolboxStack>
   </SubToolbox>

   {post.postType.includes("poll") && <SubToolbox title="Poll Options" icon={<CheckSquare />} collapsible isOpenInitial>
    <SubToolboxGrid minItemWidth="wide">{post.pollOptions.map((option, index) => <SubToolboxSection key={index} label={<SubToolboxFieldLabel htmlFor={`community-poll-${index}`}>Option {index + 1}</SubToolboxFieldLabel>}>
     <StudioInput id={`community-poll-${index}`} name={`communityPollOption${index + 1}`} value={option} onChange={(event) => post.setPollOption(index, event.target.value)} placeholder={`Option ${index + 1}…`} />
     {post.postType === "image-poll" && <><input ref={(node) => { pollInputs.current[index] = node }} className="hidden" type="file" accept="image/*" onChange={(event) => post.applyImageFile(event.target.files?.[0], index)} /><StudioButton sizeVariant="compact" onClick={() => pollInputs.current[index]?.click()}><Upload size={14} aria-hidden="true" />{post.imagePollUrls[index] ? "Replace Image" : "Add Image"}</StudioButton></>}
    </SubToolboxSection>)}</SubToolboxGrid>
   </SubToolbox>}
  </div>

  <div className="flex flex-col gap-6 min-w-0">
   {(post.postType === "image" || post.postType === "image-poll") && <SubToolbox title="Post Media" icon={<Image />} collapsible isOpenInitial>
    <SubToolboxStack>
    <input ref={imageInput} className="hidden" type="file" accept="image/*" onChange={(event) => post.applyImageFile(event.target.files?.[0])} />
    <SubToolboxFieldLabel htmlFor="community-image-url">Image URL</SubToolboxFieldLabel>
    <StudioInput id="community-image-url" name="communityImageUrl" type="url" value={post.imageUrl} onChange={(event) => post.setImageUrl(event.target.value)} placeholder="https://example.com/image.jpg…" />
    <StudioButton onClick={() => imageInput.current?.click()}><Upload size={17} aria-hidden="true" />Browse Files</StudioButton>
    {post.imageUrl && <img src={post.imageUrl} alt="Community post preview" width={640} height={360} className="mt-4 w-full aspect-video object-cover border-[3px] border-black rounded-[8px]" />}
    </SubToolboxStack>
   </SubToolbox>}

   {post.postType === "video" && <SubToolbox title="Linked Video" icon={<Video />} collapsible isOpenInitial>
    <SubToolboxStack>
    <SubToolboxFieldLabel htmlFor="community-video-search">Search Videos</SubToolboxFieldLabel>
    <StudioSearchInput id="community-video-search" name="communityVideoSearch" autoComplete="off" value={post.videoSearch} onChange={(event) => post.setVideoSearch(event.target.value)} placeholder="Search titles or video IDs…" />
    <SubToolboxSurface scroll><SubToolboxSection>{post.filteredVideos.map((video) => <StudioButton type="button" key={video.videoId} sizeVariant="compact" tone="neutral" aria-pressed={post.selectedVideoId === video.videoId} onClick={() => post.setSelectedVideoId(video.videoId)}>{video.title || video.videoId}</StudioButton>)}{!post.filteredVideos.length && <SubToolboxStatePanel state="empty" message="No videos found." />}</SubToolboxSection></SubToolboxSurface>
    </SubToolboxStack>
   </SubToolbox>}

   <SubToolbox title="Post Preview" icon={<FileText />} collapsible isOpenInitial>
    <SubToolboxStack>
    <SubToolboxSurface tone="subtle" className="min-h-48 whitespace-pre-wrap break-words text-sm font-bold">{post.content || <span className="opacity-35 uppercase">Your post preview will appear here.</span>}</SubToolboxSurface>
    <div role="status" aria-live="polite" className="min-h-5 mt-2 text-[10px] font-black uppercase">{post.clipboardStatus === "copied" ? "Post copied." : post.clipboardStatus === "error" ? "Copy failed." : ""}</div>
    {post.error && <SubToolboxStatePanel state="error" message={post.error} />}
    </SubToolboxStack>
   </SubToolbox>

   <SubToolbox title={`Draft Vault · ${post.vault.length}`} icon={<Archive />} collapsible isOpenInitial={false}>
    <div className="max-h-64 overflow-y-auto space-y-2" style={{ contentVisibility: "auto" }}>{post.vault.map((draft) => <div key={draft.id} className="grid grid-cols-[1fr_auto] gap-2 border-[2px] border-black rounded-lg p-2"><button type="button" className="text-left min-w-0" onClick={() => post.loadFromVault(draft.id)}><span className="block text-[9px] font-black uppercase opacity-50">{draft.type}</span><span className="block truncate text-xs font-black">{draft.content || "Untitled draft"}</span></button><button type="button" aria-label="Delete draft" onClick={() => post.removeFromVault(draft.id)} className="size-10 border-[2px] border-black rounded-lg grid place-items-center bg-[#FF77D6]"><Trash2 size={15} aria-hidden="true" /></button></div>)}{!post.vault.length && <p className="p-4 text-center text-[10px] font-black uppercase opacity-50">No saved drafts.</p>}</div>
   </SubToolbox>

   <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
    <SubToolboxGridActionButton label="Save Draft" iconName="archive" tone="yellow" disabled={!post.content.trim()} onClick={post.saveToVault} />
    <SubToolboxGridActionButton label={post.clipboardStatus === "copied" ? "Copied" : "Copy Post"} iconName={post.clipboardStatus === "copied" ? "check" : "copy"} tone="green" disabled={!post.content.trim()} onClick={post.copyPost} />
    {post.channelCommunityUrl ? <SubToolboxLinkButton href={post.channelCommunityUrl} target="_blank" rel="noreferrer" icon={<ExternalLink size={19} />}>Go to Channel</SubToolboxLinkButton> : <SubToolboxGridActionButton label="Connect Channel" iconName="link" tone="blue" onClick={context.reconnect} />}
   </div>
  </div>
 </div>
}