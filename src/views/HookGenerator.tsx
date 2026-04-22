import React, { useState, useRef, useEffect } from "react"
import {
 generateHook,
 generateVisualImage,
 generateVisualVideo,
} from "../services/gemini"
import type { HookResult } from "../types"
import { Magnet } from "lucide-react"
import { ToolboxScaffold } from "../components/Toolbox"
import { useBrain } from "../context/GlobalDataContext"

interface HookGeneratorProps {
 globalScript?: string
 embedded?: boolean
 collapsible?: boolean
 isOpenInitial?: boolean
 paletteIndex?: number
}

const HookGenerator: React.FC<HookGeneratorProps> = ({
 globalScript,
 embedded = false,
 collapsible = false,
 isOpenInitial = true,
 paletteIndex,
}) => {
 const [results, setResults] = useState<HookResult[] | null>(null)
 const [loading, setLoading] = useState(false)
 const [localScript, setLocalScript] = useState(globalScript || "")

 useEffect(() => {
  if (globalScript && !localScript) {
   setLocalScript(globalScript)
  }
 }, [globalScript])

 const [selectedVisuals, setSelectedVisuals] = useState<
  Record<string, boolean>
 >({})
 const [visualDetails, setVisualDetails] = useState<Record<string, string>>({})
 const [generatedImages, setGeneratedImages] = useState<Record<string, string>>(
  {},
 )
 const [generatedVideos, setGeneratedVideos] = useState<Record<string, string>>(
  {},
 )
 const [generatingMedia, setGeneratingMedia] = useState<
  Record<string, "image" | "video">
 >({})
 const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})
 const [isOpen, setIsOpen] = useState(isOpenInitial)
 const { brain } = useBrain()

 const handleGenerate = async () => {
  if (!localScript.trim()) {
   alert("Please enter a script intro first.")
   return
  }
  setLoading(true)
  try {
   const hookResults = await generateHook(localScript, "script", brain)
   setResults(hookResults)
   setSelectedVisuals({})
   setVisualDetails({})
   setGeneratedImages({})
   setGeneratedVideos({})
   setGeneratingMedia({})
  } catch (e) {
   alert("Failed to generate hooks. Please try again.")
  } finally {
   setLoading(false)
  }
 }

 const toggleVisualSelection = (hookIndex: number, timelineIndex: number) => {
  const key = `${hookIndex}-${timelineIndex}`
  setSelectedVisuals((prev) => ({ ...prev, [key]: !prev[key] }))
 }

 const handleVisualDetailChange = (
  hookIndex: number,
  timelineIndex: number,
  value: string,
 ) => {
  const key = `${hookIndex}-${timelineIndex}`
  setVisualDetails((prev) => ({ ...prev, [key]: value }))
 }

 const handleGenerateImage = async (
  hookIndex: number,
  timelineIndex: number,
  visualSuggestion: string,
 ) => {
  const key = `${hookIndex}-${timelineIndex}`
  const extraDetails = visualDetails[key] || ""
  const fullPrompt = `${visualSuggestion}. ${extraDetails}`.trim()

  setGeneratingMedia((prev) => ({ ...prev, [key]: "image" }))
  try {
   const imageUrl = await generateVisualImage(fullPrompt)
   setGeneratedImages((prev) => ({ ...prev, [key]: imageUrl }))
  } catch (e) {
   alert("Failed to generate image.")
  } finally {
   setGeneratingMedia((prev) => {
    const newState = { ...prev }
    delete newState[key]
    return newState
   })
  }
 }

 const handleGenerateVideo = async (
  hookIndex: number,
  timelineIndex: number,
  visualSuggestion: string,
 ) => {
  const key = `${hookIndex}-${timelineIndex}`
  const extraDetails = visualDetails[key] || ""
  const fullPrompt = `${visualSuggestion}. ${extraDetails}`.trim()
  const imageBytes = generatedImages[key]

  setGeneratingMedia((prev) => ({ ...prev, [key]: "video" }))
  try {
   const videoUrl = await generateVisualVideo(fullPrompt, imageBytes)
   setGeneratedVideos((prev) => ({ ...prev, [key]: videoUrl }))
  } catch (e) {
   alert("Failed to generate video.")
  } finally {
   setGeneratingMedia((prev) => {
    const newState = { ...prev }
    delete newState[key]
    return newState
   })
  }
 }

 return (
 <ToolboxScaffold
  title="HOOK GENERATOR"
  subtitle="Generate high-retention hooks + intros to capture attention in the first 10 seconds"
 icon={<Magnet size={40} strokeWidth={3} className="text-black" />}
 headerColor="bg-[#FF7497]"
 iconBoxColor="bg-[#00CCFF]"
 paletteIndex={paletteIndex}
  collapsible={collapsible}
  isOpen={isOpen}
  onToggle={() => setIsOpen(!isOpen)}
  embedded={embedded}
  helpText="Generate multiple hook options from your idea or script intro. Use this to make your first 10 seconds stronger."
  shellClassName="animate-fade-in"
   contentClassName={embedded ? "p-0" : "p-8"}>
   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <div className="lg:col-span-1 space-y-6 flex flex-col h-full">
     <div className="bg-white border-[4px] border-black rounded-[24px] shadow-[8px_8px_0px_0px_black] sticky top-4 overflow-hidden">
      <div className="bg-[#00CCFF] p-4 border-b-[4px] border-black font-black uppercase text-black text-xl tracking-tighter">
       Input Data
      </div>
      <div className="p-6 space-y-6">
       <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-black/50 ml-1">
         Script Intro / Concept
        </label>
        <textarea
         value={localScript}
         onChange={(e) => setLocalScript(e.target.value)}
         placeholder="PASTE YOUR SCRIPT INTRO HERE..."
         className="w-full h-40 p-4 border-[4px] border-black rounded-xl font-bold text-sm uppercase resize-none outline-none focus:bg-[#FF7497]/10 transition-colors"
        />
       </div>
       <button
        onClick={handleGenerate}
        disabled={loading || !localScript.trim()}
        className="w-full bg-[#FF7497] border-[4px] border-black p-4 font-black uppercase text-xl rounded-xl shadow-[6px_6px_0px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50">
        {loading ? "TUNING HOOKS..." : "GENERATE HOOKS"}
       </button>
      </div>
     </div>
    </div>

    <div className="lg:col-span-1 space-y-6 flex flex-col h-full">
     {loading ? (
      <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-[4px] border-dashed border-black/20 rounded-[32px] bg-gray-50">
       <div className="w-20 h-20 bg-[#FF7497] border-[4px] border-black rounded-full animate-ping mb-8 shadow-[6px_6px_0px_0px_black]"></div>
       <p className="font-black text-2xl text-black/40 uppercase tracking-widest animate-pulse">
        Analyzing Retention Patterns...
       </p>
      </div>
     ) : results && results.length > 0 ? (
      <div className="space-y-8">
       {results.map((hook, hookIndex) => (
        <div
         key={hookIndex}
         className="bg-white border-[4px] border-black rounded-[24px] shadow-[8px_8px_0px_0px_black] overflow-hidden">
         <div className="bg-[#FF7497] p-6 border-b-[4px] border-black flex justify-between items-center">
          <div>
           <h2 className="text-3xl font-[1000] uppercase tracking-tighter text-black leading-none">
            {hook.styleName}
           </h2>
           <p className="text-sm font-black text-black/60 mt-1 uppercase tracking-widest">
            {hook.explanation}
           </p>
          </div>
          <div className="text-5xl font-black text-black/20">
           #{hookIndex + 1}
          </div>
         </div>

         <div className="p-8 space-y-8">
          <div className="bg-gray-50 p-6 rounded-xl border-[4px] border-black">
           <h3 className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em] mb-3">
            The Script
           </h3>
           <p className="text-xl font-bold text-black uppercase leading-relaxed">{`"${hook.script}"`}</p>
          </div>

          <div className="bg-[#FFDD00]/20 p-6 rounded-xl border-[4px] border-[#FFDD00]">
           <h3 className="text-[10px] font-black text-black/60 uppercase tracking-[0.2em] mb-2">
            Assembly Instructions
           </h3>
           <p className="text-sm font-black text-black uppercase">
            {hook.assemblyInstructions}
           </p>
          </div>
         </div>
        </div>
       ))}
      </div>
     ) : (
      <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-[4px] border-dashed border-black/20 rounded-[32px] bg-gray-50 p-8 text-center">
       <Magnet size={80} className="text-black/20 mb-6" />
       <h3 className="text-3xl font-[1000] text-black/40 uppercase tracking-tighter mb-2">
        Ready to Tune
       </h3>
       <p className="text-black/30 font-bold max-w-md uppercase">
        Paste your boring intro on the left, and we'll transform it into 6
        high-retention hooks designed to stop the scroll.
       </p>
      </div>
     )}
    </div>
   </div>
  </ToolboxScaffold>
 )
}

export default HookGenerator
