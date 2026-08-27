import React, { useMemo, useState } from "react"
import { getPendingToolIntegrations, openToolIntegration, acceptToolIntegration, completeToolIntegration, dismissToolIntegration, extractToolPrefill } from "../../services/brainLiveToolIntegration"

type Props = { destinationToolId: string; channelId?: string | null; onPrefill?: (payload: Record<string, unknown>) => void }

export const BrainLiveToolInbox: React.FC<Props> = ({ destinationToolId, channelId, onPrefill }) => {
  const [revision, setRevision] = useState(0)
  const rows = useMemo(() => getPendingToolIntegrations(destinationToolId), [destinationToolId, revision])
  if (!rows.length) return null
  const refresh = () => setRevision(value => value + 1)
  return <section className="mb-4 rounded-2xl border-[4px] border-black bg-white shadow-[6px_6px_0_#000] overflow-hidden">
    <header className="flex items-center justify-between gap-3 border-b-[4px] border-black bg-[#B7F52A] px-4 py-3">
      <div><div className="text-[9px] font-black uppercase tracking-[.18em] opacity-60">ViewTube Brain</div><div className="text-sm font-[1000] uppercase">Incoming work · {rows.length}</div></div>
      <div className="rounded-full border-2 border-black bg-white px-3 py-1 text-[9px] font-black uppercase">{destinationToolId}</div>
    </header>
    <div className="grid gap-3 p-3">
      {rows.map(row => <article key={row.handoff.id} className="rounded-xl border-[3px] border-black bg-[#F6F4ED] p-3">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="text-[9px] font-black uppercase opacity-50">{row.packet.sourceToolId} → {destinationToolId}</div><div className="text-sm font-[1000] uppercase">{row.packet.title}</div><div className="mt-1 text-[10px] font-bold opacity-65">{row.packet.summary}</div></div><div className="rounded-lg border-2 border-black bg-white px-2 py-1 text-[9px] font-black uppercase">{row.payloadKind}</div></div>
        {!!row.packet.evidence.length && <details className="mt-3 rounded-lg border-2 border-black bg-white p-2"><summary className="cursor-pointer text-[9px] font-black uppercase">Evidence + provenance</summary><div className="mt-2 text-[10px] font-bold">{row.packet.evidence.join(" · ") || "No evidence supplied"}</div><div className="mt-1 text-[9px] font-bold opacity-50">{row.packet.provenance.join(" · ")}</div></details>}
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => { openToolIntegration(row.handoff.id); onPrefill?.(extractToolPrefill(row.packet)); acceptToolIntegration(row.handoff.id); refresh() }} className="rounded-lg border-2 border-black bg-[#4DE3F5] px-3 py-2 text-[9px] font-black uppercase">Load into tool</button>
          <button type="button" onClick={() => { completeToolIntegration(row.handoff.id, channelId); refresh() }} className="rounded-lg border-2 border-black bg-[#66ED62] px-3 py-2 text-[9px] font-black uppercase">Complete</button>
          <button type="button" onClick={() => { dismissToolIntegration(row.handoff.id, channelId); refresh() }} className="rounded-lg border-2 border-black bg-[#FF7497] px-3 py-2 text-[9px] font-black uppercase">Dismiss</button>
        </div>
      </article>)}
    </div>
  </section>
}

export default BrainLiveToolInbox
