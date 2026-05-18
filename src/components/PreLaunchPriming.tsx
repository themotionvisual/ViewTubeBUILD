import React, { useState, useEffect } from "react"
import {
 generateInterestSeeding,
 generateFunnelTeaser,
} from "../services/gemini"
import type { AlgorithmDiagnosis, PollBlueprint, ShortsConcept } from "../types"
import { Rocket, Zap, Sparkles, Copy, Check, MessageSquare } from "lucide-react"
import { ToolboxScaffold, Toolbox } from "./Toolbox"
import { PostActionReflection } from "./PostActionReflection"

interface PreLaunchPrimingProps {
 embedded?: boolean
 collapsible?: boolean
 isOpenInitial?: boolean
 paletteIndex?: number
}

const PreLaunchPriming: React.FC<PreLaunchPrimingProps> = ({
 embedded = false,
 collapsible = false,
 isOpenInitial = true,
 paletteIndex,
}) => {
 const [diagnosis, setDiagnosis] = useState<AlgorithmDiagnosis | null>(null)
 const [activeAction, setActiveAction] = useState<
  "none" | "seeding" | "teaser"
 >("seeding")
 const [actionLoading, setActionLoading] = useState(false)
 const [inputData, setInputData] = useState({
  topic: "",
  niche: "",
  audience: "",
  longFormTitle: "",
 })
 const [pollResult, setPollResult] = useState<PollBlueprint | null>(null)
 const [teaserResult, setTeaserResult] = useState<ShortsConcept | null>(null)
 const [isOpen, setIsOpen] = useState(isOpenInitial)

 useEffect(() => {
  const savedDiag = localStorage.getItem("yt_algo_diagnosis")
  if (savedDiag) {
   try {
    setDiagnosis(JSON.parse(savedDiag))
   } catch (e) {
    console.error("Failed to parse diagnosis", e)
   }
  }
 }, [])

 const handleActionGenerate = async () => {
  setActionLoading(true)
  try {
   if (activeAction === "seeding") {
    const res = await generateInterestSeeding(
     inputData.topic,
     inputData.niche,
     inputData.audience,
     diagnosis,
    )
    setPollResult(res)
   } else if (activeAction === "teaser") {
    const res = await generateFunnelTeaser(
     inputData.topic,
     inputData.niche,
     inputData.longFormTitle,
     diagnosis,
    )
    setTeaserResult(res)
   }
  } catch (error) {
   alert("Generation failed. Please check your API key in Settings.")
  } finally {
   setActionLoading(false)
  }
 }

 const resetAction = () => {
  setPollResult(null)
  setTeaserResult(null)
  setInputData({ topic: "", niche: "", audience: "", longFormTitle: "" })
 }

 const handleSwitchAction = (next: "seeding" | "teaser") => {
  setActiveAction(next)
  resetAction()
 }

 return (
 <ToolboxScaffold
  title="PRE-LAUNCH PRIMING"
  subtitle="Plan rollout steps + warm-up posts to prime the algorithm before publishing"
  icon={<Rocket size={40} strokeWidth={3} className="text-black" />}
 headerColor="bg-[#00CCFF]"
 iconBoxColor="bg-[#FFDD00]"
 paletteIndex={paletteIndex}
  collapsible={collapsible}
  isOpen={isOpen}
  onToggle={() => setIsOpen(!isOpen)}
  embedded={embedded}
  helpText="Plan your rollout before publishing. Create teasers and warm‑up posts to boost early momentum."
  shellClassName="animate-fade-in"
   contentClassName={embedded ? "p-0 space-y-8" : "p-8 space-y-8"}>
   <p className="text-sm font-black text-black/50 uppercase tracking-widest">
    Prime the recommendation engine in the 48 hours BEFORE you upload. Generate
    targeted content designed to warm up your audience and algorithm signals.
   </p>

   <div className="grid grid-cols-2 gap-6">
    <button
     onClick={() => handleSwitchAction("seeding")}
     className={`flex flex-col items-center justify-center gap-2 p-6 border-[4px] border-black rounded-[20px] text-center transition-all ${activeAction === "seeding" ? "bg-[#FF7497] shadow-none translate-y-1" : "bg-white shadow-[6px_6px_0px_0px_black] hover:bg-gray-50"}`}>
     <p className="font-[1000] text-2xl uppercase leading-none text-black tracking-tighter">
      Community Poll
     </p>
     <p className="text-[10px] font-black text-black/60 uppercase tracking-widest">
      Seeds algorithm with topic interest
     </p>
    </button>
    <button
     onClick={() => handleSwitchAction("teaser")}
     className={`flex flex-col items-center justify-center gap-2 p-6 border-[4px] border-black rounded-[20px] text-center transition-all ${activeAction === "teaser" ? "bg-[#00CCFF] shadow-none translate-y-1" : "bg-white shadow-[6px_6px_0px_0px_black] hover:bg-gray-50"}`}>
     <p className="font-[1000] text-2xl uppercase leading-none text-black tracking-tighter">
      Shorts Script
     </p>
     <p className="text-[10px] font-black text-black/60 uppercase tracking-widest">
      Creates viral teaser to drive views
     </p>
    </button>
   </div>

   {activeAction !== "none" && (
    <Toolbox
      variant="sub"
      title={activeAction === "seeding" ? "POLL GENERATOR ACTIVE" : "SHORTS TEASER ACTIVE"}
      icon={<Zap size={24} />}
      headerColor={activeAction === "seeding" ? "bg-[#FF7497]" : "bg-[#00CCFF]"}
      collapsible
      isOpenInitial={true}
      outerClassName="mt-8"
     >
     <div className="p-8 space-y-6">
      {!pollResult && !teaserResult ? (
       <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-black/50 tracking-widest ml-1">
           Video Topic
          </label>
          <input
           type="text"
           value={inputData.topic}
           onChange={(e) =>
            setInputData({ ...inputData, topic: e.target.value })
           }
           placeholder="E.G. HOW TO PLAN A WEEKLY CONTENT SYSTEM"
           className="vt-input-standard w-full p-4 font-black uppercase text-sm border-[4px] border-black"
          />
         </div>
         <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-black/50 tracking-widest ml-1">
           Niche / Category
          </label>
          <input
           type="text"
           value={inputData.niche}
           onChange={(e) =>
            setInputData({ ...inputData, niche: e.target.value })
           }
           placeholder="E.G. CREATOR EDUCATION"
           className="vt-input-standard w-full p-4 font-black uppercase text-sm border-[4px] border-black"
          />
         </div>
        </div>
        {activeAction === "seeding" ? (
         <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-black/50 tracking-widest ml-1">
           Target Audience
          </label>
          <input
           type="text"
           value={inputData.audience}
           onChange={(e) =>
            setInputData({ ...inputData, audience: e.target.value })
           }
           placeholder="E.G. HISTORY BUFFS"
           className="vt-input-standard w-full p-4 font-black uppercase text-sm border-[4px] border-black"
          />
         </div>
        ) : (
         <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-black/50 tracking-widest ml-1">
           Your Long-Form Title
          </label>
          <input
           type="text"
           value={inputData.longFormTitle}
           onChange={(e) =>
            setInputData({ ...inputData, longFormTitle: e.target.value })
           }
           placeholder="E.G. THE BATTLE OF WATERLOO"
           className="vt-input-standard w-full p-4 font-black uppercase text-sm border-[4px] border-black"
          />
         </div>
        )}
        <button
         onClick={handleActionGenerate}
         disabled={actionLoading || !inputData.topic || !inputData.niche}
         className="w-full bg-[#CCFF00] border-[4px] border-black rounded-xl p-5 font-[1000] uppercase text-2xl shadow-[6px_6px_0px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 mt-4">
         {actionLoading ? "TRANSMITTING..." : "INITIALIZE SEQUENCE"}
        </button>
       </>
      ) : (
       <div className="space-y-6 animate-fade-in">
        {pollResult && (
         <div className="space-y-4">
          <div className="p-6 bg-[#FF7497] border-[4px] border-black rounded-2xl shadow-[4px_4px_0px_0px_black]">
           <p className="text-[10px] font-black uppercase text-black/60 mb-2 tracking-widest">
            Community Poll Question
           </p>
           <p className="text-2xl font-[1000] text-black uppercase tracking-tighter">
            "{pollResult.question}"
           </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
           {pollResult.options.map((opt, i) => (
            <div
             key={i}
             className="p-4 bg-white border-[4px] border-black rounded-xl text-sm font-black uppercase shadow-[4px_4px_0px_0px_black]">
             {opt}
            </div>
           ))}
          </div>
         </div>
        )}
         <button
          onClick={resetAction}
          className="w-full py-4 font-black uppercase text-sm border-[4px] border-black rounded-xl hover:bg-black hover:text-white transition-colors">
          Reset & Generate Another
         </button>

         {/* Brain Reflection UI */}
         <div className="mt-8 animate-in slide-in-from-bottom-4 duration-700">
           <PostActionReflection toolId="PRE_LAUNCH_PRIMING" />
         </div>
        </div>
       )}
      </div>
    </Toolbox>
   )}
  </ToolboxScaffold>
 )
}

export default PreLaunchPriming
