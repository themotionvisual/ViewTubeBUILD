import React from "react"
import {
 createViewTubeActionPacket,
 getCompatibleHandoffTargets,
 getSuggestedChainsForTool,
 getViewTubeToolCapability,
 persistViewTubeActionPacket,
 type ViewTubePayloadKind,
 type ViewTubeToolKind,
} from "../services/viewTubeToolChains"

type Props = {
 sourceToolId: string
 sourceKind: ViewTubeToolKind
 payloadKind: ViewTubePayloadKind
 title: string
 summary: string
 payload: unknown
 projectId?: string | null
 channelId?: string | null
 videoId?: string | null
 evidence?: string[]
 provenance?: string[]
 className?: string
}

const destinationUrl = (route: string, packetId: string) => {
 const [pathAndQuery, hash = ""] = route.split("#")
 const separator = pathAndQuery.includes("?") ? "&" : "?"
 return `${pathAndQuery}${separator}handoff=${encodeURIComponent(packetId)}${hash ? `#${hash}` : ""}`
}

export const ViewTubeHandoffActions: React.FC<Props> = (props) => {
 const packet = createViewTubeActionPacket({
  sourceToolId: props.sourceToolId,
  sourceKind: props.sourceKind,
  payloadKind: props.payloadKind,
  title: props.title,
  summary: props.summary,
  payload: props.payload,
  projectId: props.projectId,
  channelId: props.channelId,
  videoId: props.videoId,
  evidence: props.evidence || [],
  provenance: props.provenance || [],
 })
 const targets = getCompatibleHandoffTargets(packet)
 const chains = getSuggestedChainsForTool(props.sourceToolId)

 const send = (targetId: string) => {
  const target = getViewTubeToolCapability(targetId)
  if (!target) return
  persistViewTubeActionPacket(packet)
  window.location.assign(destinationUrl(target.route, packet.id))
 }

 if (!targets.length) return null
 return (
  <div className={props.className || "mt-4 rounded-xl border-[3px] border-black bg-white p-3 shadow-[4px_4px_0_#000]"}>
   <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
    <div>
     <div className="text-[9px] font-black uppercase tracking-[.16em] opacity-40">Continue in ViewTube</div>
     <div className="text-sm font-[1000] uppercase">Send this {props.payloadKind} to another tool</div>
    </div>
    {chains[0] && <div className="max-w-[280px] text-right text-[9px] font-bold uppercase opacity-45">Suggested chain: {chains[0].title}</div>}
   </div>
   <div className="flex flex-wrap gap-2">
    {targets.map((target) => (
     <button key={target.id} type="button" onClick={() => send(target.id)} className="rounded-lg border-2 border-black bg-[#B7F52A] px-3 py-2 text-[9px] font-black uppercase shadow-[2px_2px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
      Send to {target.label}
     </button>
    ))}
   </div>
  </div>
 )
}

export default ViewTubeHandoffActions
