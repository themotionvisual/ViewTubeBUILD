import React, { useState, useEffect } from "react"
import {
 generateInterestSeeding,
 generateFunnelTeaser,
} from "../services/gemini"
import type { AlgorithmDiagnosis, PollBlueprint, ShortsConcept } from "../types"
import { Rocket, Zap, Sparkles, Copy, Check, MessageSquare } from "lucide-react"
import { ToolboxScaffold, SubToolbox } from "./Toolbox"
import { PostActionReflection } from "./PostActionReflection"
import {
 SubToolboxButton,
 SubToolboxFieldLabel,
 SubToolboxInput,
 SubToolboxSelectableListRow,
} from "./subtoolbox/SubToolboxPrimitives"

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

   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
    <SubToolboxSelectableListRow
     level="l0"
     title="Community Poll"
     detail="Seeds algorithm with topic interest"
     selected={activeAction === "seeding"}
     onClick={() => handleSwitchAction("seeding")}
    />
    <SubToolboxSelectableListRow
     level="l0"
     title="Shorts Script"
     detail="Creates viral teaser to drive views"
     selected={activeAction === "teaser"}
     onClick={() => handleSwitchAction("teaser")}
    />
   </div>

   {activeAction !== "none" && (
    <SubToolbox
      title={activeAction === "seeding" ? "POLL GENERATOR ACTIVE" : "SHORTS TEASER ACTIVE"}
      icon={<Zap size={24} />}
      headerColor={activeAction === "seeding" ? "bg-[#FF7497]" : "bg-[#00CCFF]"}
      collapsible
      isOpenInitial={true}
      shellClassName="mt-8"
     >
     <div className="p-8 space-y-6">
      {!pollResult && !teaserResult ? (
       <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="space-y-2">
          <SubToolboxFieldLabel level="l1" className="ml-1">
           Video Topic
          </SubToolboxFieldLabel>
          <SubToolboxInput level="l1"
           type="text"
           value={inputData.topic}
           onChange={(e) =>
            setInputData({ ...inputData, topic: e.target.value })
           }
           placeholder="E.G. HOW TO PLAN A WEEKLY CONTENT SYSTEM"
           className="font-black uppercase text-sm"
          />
         </div>
         <div className="space-y-2">
          <SubToolboxFieldLabel level="l1" className="ml-1">
           Niche / Category
          </SubToolboxFieldLabel>
          <SubToolboxInput level="l1"
           type="text"
           value={inputData.niche}
           onChange={(e) =>
            setInputData({ ...inputData, niche: e.target.value })
           }
           placeholder="E.G. CREATOR EDUCATION"
           className="font-black uppercase text-sm"
          />
         </div>
        </div>
        {activeAction === "seeding" ? (
         <div className="space-y-2">
          <SubToolboxFieldLabel level="l1" className="ml-1">
           Target Audience
          </SubToolboxFieldLabel>
          <SubToolboxInput level="l1"
           type="text"
           value={inputData.audience}
           onChange={(e) =>
            setInputData({ ...inputData, audience: e.target.value })
           }
           placeholder="E.G. HISTORY BUFFS"
           className="font-black uppercase text-sm"
          />
         </div>
        ) : (
         <div className="space-y-2">
          <SubToolboxFieldLabel level="l1" className="ml-1">
           Your Long-Form Title
          </SubToolboxFieldLabel>
          <SubToolboxInput level="l1"
           type="text"
           value={inputData.longFormTitle}
           onChange={(e) =>
            setInputData({ ...inputData, longFormTitle: e.target.value })
           }
           placeholder="E.G. THE BATTLE OF WATERLOO"
           className="font-black uppercase text-sm"
          />
         </div>
        )}
        <SubToolboxButton level="l0" size="action" tone="success"
         onClick={handleActionGenerate}
         disabled={actionLoading || !inputData.topic || !inputData.niche}
         className="w-full mt-4">
         {actionLoading ? "TRANSMITTING..." : "INITIALIZE SEQUENCE"}
        </SubToolboxButton>
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
         <SubToolboxButton level="l1" size="standard" tone="neutral"
          onClick={resetAction}
          className="w-full">
          Reset & Generate Another
         </SubToolboxButton>

         {/* Brain Reflection UI */}
         <div className="mt-8 animate-in slide-in-from-bottom-4 duration-700">
           <PostActionReflection toolId="PRE_LAUNCH_PRIMING" />
         </div>
        </div>
       )}
      </div>
    </SubToolbox>
   )}
  </ToolboxScaffold>
 )
}

export default PreLaunchPriming
