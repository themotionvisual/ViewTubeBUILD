import React, { useMemo, useState } from "react"
import {
 getCompatibleHandoffTargets,
 getSuggestedChainsForTool,
 getViewTubeToolCapability,
 persistViewTubeActionPacket,
 type ViewTubeActionPacket,
} from "../services/viewTubeToolChains"
import { appendViewTubeAuditEvent } from "../services/viewTubeUserControls"
import { rankWorkflowTargets, recordWorkflowPreferenceSignal } from "../services/viewTubeWorkflowLearning"

type Props = {
 packet: ViewTubeActionPacket
 compact?: boolean
 onSend?: (targetId: string, packet: ViewTubeActionPacket) => void
}

const routeWithPacket = (route: string, packetId: string, sourceToolId: string) => {
 const separator = route.includes("?") ? "&" : "?"
 return `${route}${separator}handoff=${encodeURIComponent(packetId)}&handoffSource=${encodeURIComponent(sourceToolId)}`
}

export const SendToMenu: React.FC<Props> = ({ packet, compact = false, onSend }) => {
 const [open, setOpen] = useState(false)
 const [sentTo, setSentTo] = useState<string | null>(null)
 const compatible = useMemo(() => getCompatibleHandoffTargets(packet), [packet])
 const chains = useMemo(() => getSuggestedChainsForTool(packet.sourceToolId), [packet.sourceToolId])
 const ranked = useMemo(() => {
  const preferredIds = packet.suggestedTargets.filter((id) => compatible.some((tool) => tool.id === id))
  const remainingIds = compatible.map((tool) => tool.id).filter((id) => !preferredIds.includes(id))
  const learnedIds = rankWorkflowTargets(packet.sourceToolId, packet.payloadKind, [...preferredIds, ...remainingIds], packet.channelId)
  return learnedIds.map((id) => getViewTubeToolCapability(id)).filter((tool): tool is NonNullable<typeof tool> => Boolean(tool))
 }, [compatible, packet])

 const send = (targetId: string) => {
  const target = getViewTubeToolCapability(targetId)
  if (!target) return
  persistViewTubeActionPacket({ ...packet, suggestedTargets: [targetId, ...packet.suggestedTargets.filter((id) => id !== targetId)] })
  recordWorkflowPreferenceSignal({ sourceToolId: packet.sourceToolId, payloadKind: packet.payloadKind, targetToolId: targetId, accepted: true, channelId: packet.channelId, projectId: packet.projectId })
  appendViewTubeAuditEvent({ action: "internal-tool-handoff", allowed: true, reason: `${packet.sourceToolId} → ${targetId}`, metadata: { packetId: packet.id, payloadKind: packet.payloadKind } })
  setSentTo(target.label)
  onSend?.(targetId, packet)
  if (typeof window !== "undefined") window.location.assign(routeWithPacket(target.route, packet.id, packet.sourceToolId))
 }

 return (
  <div className="relative inline-flex flex-col items-end font-black uppercase">
   <button type="button" onClick={() => setOpen((value) => !value)} className={`border-[3px] border-black bg-[#B7F52A] text-black shadow-[4px_4px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#000] ${compact ? "rounded-lg px-3 py-1.5 text-[10px]" : "rounded-xl px-4 py-2 text-xs"}`} aria-expanded={open}>
    {sentTo ? `SENT → ${sentTo}` : "SEND TO / NEXT →"}
   </button>
   {open && (
    <div className="absolute right-0 top-[calc(100%+10px)] z-[80] w-[min(360px,88vw)] overflow-hidden rounded-2xl border-[3px] border-black bg-white shadow-[7px_7px_0_#000]">
     <div className="border-b-[3px] border-black bg-[#FA618A] px-4 py-3">
      <div className="text-[10px] tracking-[.18em]">Recommended handoff</div>
      <div className="mt-1 text-sm normal-case leading-tight">Keep this {packet.payloadKind.replace("-", " ")} moving without losing its context or evidence.</div>
     </div>
     <div className="max-h-[330px] overflow-y-auto p-2">
      {ranked.map((tool, index) => (
       <button type="button" key={tool.id} onClick={() => send(tool.id)} className="mb-2 flex w-full items-center justify-between gap-3 rounded-xl border-2 border-black bg-white px-3 py-3 text-left hover:bg-[#F5F5F5]">
        <span><span className="block text-[9px] tracking-[.15em] opacity-50">{index === 0 ? "BEST NEXT" : tool.kind}</span><span className="block text-sm">{tool.label}</span><span className="mt-0.5 block text-[10px] font-bold normal-case leading-tight opacity-60">{tool.description}</span></span>
        <span className="text-xl">→</span>
       </button>
      ))}
      {chains.length > 0 && <div className="mt-3 border-t-2 border-black pt-3"><div className="px-1 pb-2 text-[9px] tracking-[.18em] opacity-50">Suggested chains</div>{chains.slice(0, 3).map((chain) => <div key={chain.id} className="mb-2 rounded-lg bg-[#F1F1F1] px-3 py-2"><div className="text-[10px]">{chain.title}</div><div className="mt-1 text-[9px] font-bold normal-case opacity-60">{chain.steps.map((step) => getViewTubeToolCapability(step.toolId)?.label || step.toolId).join(" → ")}</div></div>)}</div>}
     </div>
    </div>
   )}
  </div>
 )
}

export default SendToMenu
