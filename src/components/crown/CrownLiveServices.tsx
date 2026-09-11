import React from "react"
import { CheckCircle2, CircleAlert, CircleDot, Database, ShieldCheck, Youtube } from "lucide-react"
import { useUnifiedAccount } from "../../context/UnifiedAccountContext"
import { useBrain } from "../../context/useBrain"

const cardClass = "rounded-[18px] border-[4px] border-black bg-white shadow-[8px_8px_0_0_#000]"

const StateCard: React.FC<{ label: string; value: string; detail: string; healthy?: boolean }> = ({ label, value, detail, healthy }) => (
  <article className={`${cardClass} p-4`}>
    <div className="flex items-start justify-between gap-3">
      <div><div className="text-[9px] font-black uppercase tracking-[.14em] text-black/50">{label}</div><div className="mt-1 text-lg font-black uppercase">{value}</div></div>
      {healthy === true ? <CheckCircle2 size={18} /> : healthy === false ? <CircleAlert size={18} /> : <CircleDot size={18} />}
    </div>
    <p className="mt-3 text-xs font-bold leading-5 text-black/65">{detail}</p>
  </article>
)

export const CrownLiveServices: React.FC = () => {
  const account = useUnifiedAccount()
  const { channelConnection, channelIdentity, syncStatus, isSyncing, lastSyncComplete } = useBrain()
  const snapshot = account.snapshot
  const authenticated = snapshot.authentication.status === "authenticated"
  const googleConnected = snapshot.google.status === "connected"
  const channelReady = channelConnection.state === "connected_verified" || channelIdentity.isVerified
  const syncPhase = isSyncing ? "syncing" : syncStatus.phase || "idle"

  return (
    <section className="mt-4 grid gap-4 lg:grid-cols-[.72fr_1.28fr]">
      <div className={`${cardClass} p-5`}>
        <div className="flex items-center gap-2"><ShieldCheck size={20} /><h2 className="text-2xl font-black uppercase">Services</h2></div>
        <p className="mt-3 text-sm font-bold leading-5">Live read-only state from the current account, channel connection and synchronization owners.</p>
        <div className="mt-4 rounded-xl border-[2px] border-black bg-[#fa618a] p-3 text-xs font-black uppercase">Live runtime owner state · read only</div>
        <div className="mt-5 space-y-2 text-xs font-bold"><div className="flex gap-2"><Youtube size={15} /> Account + channel connection state</div><div className="flex gap-2"><Database size={15} /> Current synchronization state</div></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <StateCard label="Authentication" value={snapshot.authentication.status} healthy={authenticated} detail={authenticated ? "A ViewTube session is currently present." : "No authenticated session is currently visible to this page."} />
        <StateCard label="Google / YouTube" value={snapshot.google.status} healthy={googleConnected} detail={googleConnected ? "The unified account snapshot reports a connected Google account." : "The Google/YouTube connection is not currently reported as connected."} />
        <StateCard label="Channel verification" value={channelReady ? "verified" : channelConnection.state} healthy={channelReady} detail={snapshot.google.channelTitle || channelIdentity.name || "No verified channel title is currently available."} />
        <StateCard label="Capabilities" value={`${snapshot.grantedCapabilities.length} granted`} healthy={snapshot.grantedCapabilities.length > 0} detail={snapshot.grantedCapabilities.length ? snapshot.grantedCapabilities.join(" · ") : "No YouTube capabilities are currently listed."} />
        <StateCard label="Sync" value={syncPhase} healthy={syncStatus.phase === "complete" || Boolean(lastSyncComplete)} detail={lastSyncComplete ? `Last completion: ${lastSyncComplete}` : syncStatus.lastError ? `Last error: ${syncStatus.lastError}` : "No completed sync timestamp is currently available."} />
        <StateCard label="Billing" value={snapshot.billing.status} detail={`Plan: ${snapshot.billing.planId || "basic"}. Credits available: ${Math.max(0, Number(snapshot.ai.availableCredits || 0)).toLocaleString()}.`} />
      </div>
    </section>
  )
}

export default CrownLiveServices
