import React, { useEffect, useState } from "react"
import { clearViewTubeLearningData, getViewTubeAuditEvents, getViewTubeUserControls, patchViewTubeUserControls, type ViewTubeUserControls } from "../services/viewTubeUserControls"

const Toggle = ({ label, value, onChange, detail }: { label: string; value: boolean; onChange: (value: boolean) => void; detail: string }) => <label className="flex items-center justify-between gap-4 border-b-2 border-black/10 py-3"><span><span className="block text-xs font-[1000] uppercase">{label}</span><span className="block text-[10px] font-bold opacity-50">{detail}</span></span><button type="button" onClick={() => onChange(!value)} className={`min-w-[74px] rounded-lg border-[3px] border-black px-3 py-2 text-[10px] font-[1000] uppercase shadow-[3px_3px_0_#000] ${value ? "bg-[#B7F52A]" : "bg-white"}`}>{value ? "ON" : "OFF"}</button></label>

export const ViewTubeUserControlPanel: React.FC = () => {
 const [controls, setControls] = useState<ViewTubeUserControls>(() => getViewTubeUserControls())
 const [auditCount, setAuditCount] = useState(0)
 useEffect(() => setAuditCount(getViewTubeAuditEvents().length), [])
 const patch = (value: Partial<ViewTubeUserControls>) => setControls(patchViewTubeUserControls(value))
 return <section className="overflow-hidden rounded-2xl border-[4px] border-black bg-white shadow-[8px_8px_0_#000]">
  <header className="border-b-[4px] border-black bg-[#5CE1E6] px-5 py-4"><div className="text-[10px] font-black uppercase tracking-[.2em]">AI Brain / Creator Authority</div><h3 className="text-2xl font-[1000] uppercase tracking-tight">User Controls</h3><p className="mt-1 text-xs font-bold">You decide what ViewTube can learn from, personalize with, share, or act on.</p></header>
  <div className="p-5">
   <Toggle label="Personalization" value={controls.personalization} onChange={(v) => patch({ personalization: v })} detail="Use your channel and project context to tailor recommendations." />
   <Toggle label="Creator learning" value={controls.creatorLearning} onChange={(v) => patch({ creatorLearning: v })} detail="Learn which tool chains and recommendations you actually prefer." />
   <Toggle label="Analytics evidence" value={controls.analyticsData} onChange={(v) => patch({ analyticsData: v })} detail="Allow AI reasoning to use your canonical analytics datasets." />
   <Toggle label="Channel Profile" value={controls.channelProfile} onChange={(v) => patch({ channelProfile: v })} detail="Allow tools and Brain to use the active channel profile." />
   <Toggle label="Research sharing" value={controls.researchSharing} onChange={(v) => patch({ researchSharing: v })} detail="Explicit opt-in only. Off by default." />
   <Toggle label="Demo / tester mode" value={controls.demoMode} onChange={(v) => patch({ demoMode: v })} detail="Locks external mutations while keeping analysis and workflows usable." />
   <div className="mt-5 grid gap-3 md:grid-cols-3">
    {([['publishing','Publishing'],['comments','Comments'],['communityPosts','Community posts']] as const).map(([key,label]) => <label key={key} className="rounded-xl border-[3px] border-black bg-[#F5F5F5] p-3"><span className="mb-2 block text-[10px] font-[1000] uppercase">{label}</span><select value={controls[key]} onChange={(e) => patch({ [key]: e.target.value } as Partial<ViewTubeUserControls>)} className="w-full rounded-lg border-[3px] border-black bg-white p-2 text-[10px] font-black uppercase"><option value="confirm">Confirm first</option>{key === 'publishing' && <option value="dry-run">Dry run only</option>}<option value="blocked">Blocked</option></select></label>)}
   </div>
   <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t-[3px] border-black pt-4"><span className="text-[10px] font-black uppercase opacity-50">{auditCount} audited decisions stored locally</span><button type="button" onClick={() => { clearViewTubeLearningData(); setAuditCount(getViewTubeAuditEvents().length) }} className="rounded-lg border-[3px] border-black bg-[#FA618A] px-4 py-2 text-[10px] font-[1000] uppercase shadow-[3px_3px_0_#000]">Delete learned workflow data</button></div>
  </div>
 </section>
}

export default ViewTubeUserControlPanel
