import React, { useMemo } from "react"
import SendToMenu from "./SendToMenu"
import { createViewTubeActionPacket } from "../services/viewTubeToolChains"

type Props = {
 imageUrl: string
 prompt: string
 hookText?: string
 channelId?: string | null
 videoId?: string | null
}

export const ThumbnailHandoffBar: React.FC<Props> = ({ imageUrl, prompt, hookText, channelId, videoId }) => {
 const packet = useMemo(() => createViewTubeActionPacket({
  sourceToolId: "thumbnail-studio",
  sourceKind: "studio-tool",
  payloadKind: "thumbnail",
  title: "Approved thumbnail",
  summary: prompt || "Thumbnail created in Thumbnail Studio",
  payload: { imageUrl, prompt, hookText: hookText || null },
  channelId: channelId || null,
  videoId: videoId || null,
  evidence: [],
  provenance: ["thumbnail-studio", `generated:${Date.now()}`],
  suggestedTargets: ["video-publisher", "video-manager", "pre-launch-priming", "vault", "video-editor"],
 }), [imageUrl, prompt, hookText, channelId, videoId])

 return (
  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border-[3px] border-black bg-[#FFE357] p-3 shadow-[4px_4px_0_#000]">
   <div>
    <div className="text-[9px] font-black uppercase tracking-[.18em] opacity-50">Reusable ViewTube asset</div>
    <div className="text-sm font-[1000] uppercase">Thumbnail ready for the next tool</div>
   </div>
   <SendToMenu packet={packet} compact />
  </div>
 )
}

export default ThumbnailHandoffBar
