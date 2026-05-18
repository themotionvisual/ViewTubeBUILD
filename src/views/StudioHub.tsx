import React, { useState } from "react"
import { ToolboxScaffold } from "../components/Toolbox"
import { CustomIcon } from "../components/CustomIcon"
import VideoPublisher from "./VideoPublisher"
import ThumbnailStudio from "./ThumbnailStudio"
import MediaAnalyzer from "./MediaAnalyzer"
import HookGenerator from "./HookGenerator"
import ActionableTactics from "./ActionableTactics"
import PreLaunchPriming from "../components/PreLaunchPriming"
import VideoManager from "./VideoManager"
import { CommunityPostGenerator } from "../components/CommunityPostGenerator"
import { CommentResponder } from "../components/CommentResponder"

const StudioHub: React.FC = () => {
 const [states, setStates] = useState({
  posts: false,
  comments: false,
 })
 const toggle = (id: string) =>
  setStates((prev) => ({ ...prev, [id]: !(prev as any)[id] }))

 return (
  <div className="flex flex-col space-y-6 max-w-[1500px] mx-auto pb-24">
   {/* Page Header */}
   <div className="mb-10 px-2 mt-4 text-center">
    <h2 className="text-7xl font-[1000] uppercase tracking-[calc(-0.06em)] leading-none text-black">
     STUDIO <span className="text-[#00CCFF]">HUB</span>
    </h2>
    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20 mt-4">
     Production & Optimization Suite
    </p>
   </div>

   {/* Accordion Modules */}
   <div className="space-y-6">
    {/* Natively Supported Tools */}
    <VideoManager collapsible isOpenInitial={true} paletteIndex={0} />
    <VideoPublisher collapsible isOpenInitial={false} paletteIndex={1} />
    <MediaAnalyzer collapsible isOpenInitial={false} paletteIndex={2} />
    <ThumbnailStudio collapsible isOpenInitial={false} paletteIndex={3} />

    {/* Community + comment modules use dashboard-grade widget feature set */}
    <ToolboxScaffold
     title="Community Posts"
     subtitle="Create polls + community updates to keep viewers engaged between uploads"
     headerColor="bg-[#CCFF00]"
     icon={<CustomIcon name="!!!TEXT" size={40} />}
     iconBoxColor="bg-[#00CCFF]"
     paletteIndex={4}
     collapsible={true}
     isOpen={states.posts}
     onToggle={() => toggle("posts")}
     helpText="Generate community tab posts to promote your video and keep engagement active.">
     <div className="bg-white rounded-2xl">
      <CommunityPostGenerator />
     </div>
    </ToolboxScaffold>

    <ToolboxScaffold
     title="Comment Responder"
     subtitle="Draft on-brand replies + pinned comments to boost engagement + watch time"
     headerColor="bg-[#FFDD00]"
     icon={<CustomIcon name="!!!IDEA" size={40} />}
     iconBoxColor="bg-[#CCFF00]"
     paletteIndex={5}
     collapsible={true}
     isOpen={states.comments}
     onToggle={() => toggle("comments")}
     helpText="Draft fast, on-brand replies to comments and plan a strong pinned comment.">
     <div className="bg-white rounded-2xl">
      <CommentResponder />
     </div>
    </ToolboxScaffold>

    <PreLaunchPriming collapsible isOpenInitial={false} paletteIndex={6} />
    <HookGenerator collapsible isOpenInitial={false} paletteIndex={7} />
    <ActionableTactics collapsible isOpenInitial={false} paletteIndex={8} />
   </div>
  </div>
 )
}

export default StudioHub
