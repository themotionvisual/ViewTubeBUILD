import React, { useState } from "react"
import { ToolboxScaffold } from "../components/Toolbox"
import { CustomIcon } from "../components/CustomIcon"
import SeoGenerator from "./SeoGenerator"
import ThumbnailStudio from "./ThumbnailStudio"
import MediaAnalyzer from "./MediaAnalyzer"
import HookGenerator from "./HookGenerator"
import PreLaunchPriming from "../components/PreLaunchPriming"
import { CommunityPostGenerator } from "../components/CommunityPostGenerator"
import { CommentResponder } from "../components/CommentResponder"
import { EndScreenTool } from "../components/EndScreenTool"
import VideoManager from "./VideoManager"

const StudioHub: React.FC = () => {
 const [states, setStates] = useState({
  posts: false,
  comments: false,
  endscreen: false,
 })
 const toggle = (id: string) =>
  setStates((prev) => ({ ...prev, [id]: !(prev as any)[id] }))

 return (
  <div className="flex flex-col space-y-2 max-w-7xl mx-auto pb-24">
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
    <SeoGenerator collapsible isOpenInitial={false} paletteIndex={1} />
    <ThumbnailStudio collapsible isOpenInitial={false} paletteIndex={2} />
    <MediaAnalyzer collapsible isOpenInitial={false} paletteIndex={3} />
    <HookGenerator collapsible isOpenInitial={false} paletteIndex={4} />
    <PreLaunchPriming collapsible isOpenInitial={false} paletteIndex={5} />

    {/* ToolboxScaffold Wrappers for Un-migrated Sub-Tools */}

    <ToolboxScaffold
     title="Community Posts"
     subtitle="Create polls + community updates to keep viewers engaged between uploads"
     headerColor="bg-[#CCFF00]"
     icon={<CustomIcon name="!!!TEXT" size={40} />}
     iconBoxColor="bg-[#00CCFF]"
     paletteIndex={6}
     collapsible={true}
     isOpen={states.posts}
     onToggle={() => toggle("posts")}
     helpText="Generate community tab posts to promote your video and keep engagement active.">
     <CommunityPostGenerator />
    </ToolboxScaffold>

    <ToolboxScaffold
     title="Comment Responder"
     subtitle="Draft on-brand replies + pinned comments to boost engagement + watch time"
     headerColor="bg-[#FFDD00]"
     icon={<CustomIcon name="!!!IDEA" size={40} />}
     iconBoxColor="bg-[#CCFF00]"
     paletteIndex={7}
     collapsible={true}
     isOpen={states.comments}
     onToggle={() => toggle("comments")}
     helpText="Draft fast, on-brand replies to comments and plan a strong pinned comment.">
     <CommentResponder />
    </ToolboxScaffold>

    <ToolboxScaffold
     title="End-Screen Architect"
     subtitle="Design end-screen layouts + outro scripts to push viewers to the next video"
     headerColor="bg-[#FFB158]"
     icon={<CustomIcon name="!!!POST-VIDEO" size={40} />}
     iconBoxColor="bg-[#FFDD00]"
     paletteIndex={8}
     collapsible={true}
     isOpen={states.endscreen}
     onToggle={() => toggle("endscreen")}
     helpText="Design your end screen flow and write an outro that pushes viewers to the next video.">
     <EndScreenTool />
    </ToolboxScaffold>
   </div>
  </div>
 )
}

export default StudioHub
