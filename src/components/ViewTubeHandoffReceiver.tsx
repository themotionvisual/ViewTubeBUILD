import React, { useEffect, useState } from "react"
import { getViewTubeToolCapability, loadViewTubeActionPacket, type ViewTubeActionPacket } from "../services/viewTubeToolChains"

type Props = { targetToolId: string; onPacket?: (packet: ViewTubeActionPacket) => void }

export const getHandoffPacketIdFromLocation = () => {
 if (typeof window === "undefined") return null
 return new URLSearchParams(window.location.search).get("handoff")
}

export const ViewTubeHandoffReceiver: React.FC<Props> = ({ targetToolId, onPacket }) => {
 const [packet, setPacket] = useState<ViewTubeActionPacket | null>(null)
 useEffect(() => {
  const id = getHandoffPacketIdFromLocation()
  if (!id) return
  const loaded = loadViewTubeActionPacket(id)
  if (!loaded) return
  setPacket(loaded)
  onPacket?.(loaded)
 }, [onPacket])
 if (!packet) return null
 const source = getViewTubeToolCapability(packet.sourceToolId)
 return <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border-[3px] border-black bg-[#B7F52A] p-3 shadow-[4px_4px_0_#000]">
  <div><div className="text-[9px] font-black uppercase tracking-[.16em] opacity-50">Incoming ViewTube handoff → {targetToolId}</div><div className="text-sm font-[1000] uppercase">{packet.title}</div><div className="text-[10px] font-bold opacity-60">From {source?.label || packet.sourceToolId} · {packet.payloadKind} · context + provenance preserved</div></div>
  <button type="button" onClick={() => setPacket(null)} className="rounded-lg border-2 border-black bg-white px-3 py-2 text-[9px] font-black uppercase">Dismiss</button>
 </div>
}

export default ViewTubeHandoffReceiver
