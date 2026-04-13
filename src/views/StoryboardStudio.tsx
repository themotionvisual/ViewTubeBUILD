import React, { useState, useEffect, useMemo } from "react"
import {
 Plus,
 Trash2,
 Image as ImageIcon,
 Sparkles,
 AlertTriangle,
 Activity,
 Video,
 Type,
 Settings2,
 Eye,
 Cloud,
} from "lucide-react"
import { ResponsiveContainer, AreaChart, Area, Tooltip } from "recharts"
import { useBrain } from "../context/GlobalDataContext"
import { CustomIcon } from "../components/CustomIcon"
import { SprocketHoles } from "../components/SprocketHoles"
import { ToolboxScaffold } from "../components/Toolbox"
import {
 synthesizeSpeech,
 enhanceSpeech,
 pollEnhancedSpeech,
 getAudioProviderStatus,
} from "../services/audioProviderAdapter"
import { nexusSyncService } from "../services/nexusSyncService"
import type { Scene } from "../types"

const calculateDuration = (text: string) => {
 const words = text
  .trim()
  .split(/\s+/)
  .filter((w) => w.length > 0).length
 return Math.max(1, Math.round(words / 2.5))
}

const calculateEmotion = (text: string) => {
 if (!text) return 10
 const exclamations = (text.match(/!/g) || []).length * 15
 const questions = (text.match(/\?/g) || []).length * 10
 const words = text
  .trim()
  .split(/\s+/)
  .filter((w) => w.length > 0)
 const avgWordLength = words.length ? words.join("").length / words.length : 5
 const speedBonus = Math.max(0, (6 - avgWordLength) * 5)
 let score = 20 + exclamations + questions + speedBonus
 return Math.min(100, Math.max(5, score))
}

interface StoryboardStudioProps {
 embedded?: boolean
 collapsible?: boolean
 isOpenInitial?: boolean
}

const StoryboardStudio: React.FC<StoryboardStudioProps> = ({
 embedded = false,
 collapsible = false,
 isOpenInitial = true,
}) => {
 const audioStatus = getAudioProviderStatus()
 const { brain, registerProvider, unregisterProvider, setStoryboardState } =
  useBrain()

 useEffect(() => {
  registerProvider("STORYBOARD_STUDIO")
  return () => unregisterProvider("STORYBOARD_STUDIO")
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [])

 const [scenes, setScenes] = useState<Scene[]>([
  {
   id: "1",
   name: "The Hook",
   text:
    "Imagine a world where your creative output is synchronized with the algorithmic pulse. Today, we bridge that gap.",
   broll: "High-energy motion graphics transitions, 3D typography spinning.",
   imageUrl: null,
   emotionScore: 85,
   durationEstimate: 8,
  },
  {
   id: "2",
   name: "The Problem",
   text:
    "Most creators struggle with fragmentation. Tools are scattered, data is siloed, and the vision gets lost in the noise.",
   broll:
    "Slow pan across a cluttered digital workspace, transitioning to clear, vibrant UI overlays.",
   imageUrl: null,
   emotionScore: 40,
   durationEstimate: 12,
  },
 ])

 const totalDuration = scenes.reduce((acc, s) => acc + s.durationEstimate, 0)

 const warnings = useMemo(() => {
  const w: string[] = []
  scenes.forEach((s, idx) => {
   if (s.durationEstimate > 20 && s.broll.length < 10) {
    w.push(
     `${s.name || "Scene " + (idx + 1)} is ${s.durationEstimate}s long with almost no visual changes planned. Add B-roll!`,
    )
   }
   if (s.durationEstimate < 2) {
    w.push(
     `${s.name || "Scene " + (idx + 1)} is too short (under 2s). Hard to pace visually.`,
    )
   }
  })
  return w
 }, [scenes])

 useEffect(() => {
  setStoryboardState({
   scenes,
   estimatedDuration: totalDuration,
   pacingHealth:
    warnings.length > 2
     ? "Critical"
     : warnings.length > 0
       ? "Warning"
       : "Excellent",
  })
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [scenes, totalDuration, warnings.length])

 const [generatingVoiceId, setGeneratingVoiceId] = useState<string | null>(null)
 const [isEnhancingId, setIsEnhancingId] = useState<string | null>(null)
 const [isSyncing, setIsSyncing] = useState(false)
 const [isOpen, setIsOpen] = useState(isOpenInitial)

 const generateVoiceover = async (sceneId: string, text: string) => {
  if (!text) return
  if (!audioStatus.elevenLabsReady && !audioStatus.geminiReady) {
   alert("No speech provider key found. Add ElevenLabs or Gemini key in Settings.")
   return
  }
  setGeneratingVoiceId(sceneId)
  try {
   const provider = audioStatus.elevenLabsReady ? "elevenlabs" : "gemini"
   const audioUrl = await synthesizeSpeech({ text, provider })
   updateScene(sceneId, "voiceoverUrl", audioUrl)
  } catch (e: any) {
   console.error(e)
   alert(e.message)
  } finally {
   setGeneratingVoiceId(null)
  }
 }

 const handleSyncToDrive = async () => {
  const projectName = brain.coreConcept || "General"
  setIsSyncing(true)
  try {
   await nexusSyncService.syncStoryboardToDrive(projectName, scenes)
   alert("Storyboard synced to Cloud Vault!")
  } catch (e: any) {
   console.error(e)
   alert(`Cloud Sync failed: ${e.message}`)
  } finally {
   setIsSyncing(false)
  }
 }

 const handleEnhance = async (
  sceneId: string,
  audioUrl: string,
  title: string,
 ) => {
  if (!audioStatus.auphonicReady) {
   alert("Auphonic key missing in Settings.")
   return
  }
  setIsEnhancingId(sceneId)
  try {
   const response = await enhanceSpeech(audioUrl, title)
   const uuid = response.data?.uuid
   if (!uuid) throw new Error("No production UUID returned")

   let status = "started"
   let attempts = 0
   while (status !== "done" && status !== "error" && attempts < 10) {
    const poll = await pollEnhancedSpeech(uuid)
    status = poll.data?.status_string || "error"
    if (status === "done") {
     updateScene(
      sceneId,
      "voiceoverUrl",
      poll.data.output_files?.[0]?.download_url,
     )
    }
    await new Promise((r) => setTimeout(r, 4000))
    attempts++
   }
  } catch (e: any) {
   console.error(e)
   alert("Auphonic Enhancement failed. Check your API key.")
  } finally {
   setIsEnhancingId(null)
  }
 }

 const addScene = () => {
  const newId = Date.now().toString()
  setScenes([
   ...scenes,
   {
    id: newId,
    name: `Scene ${scenes.length + 1}`,
    text: "",
    broll: "",
    imageUrl: null,
    emotionScore: 10,
    durationEstimate: 0,
   },
  ])
 }

 const updateScene = (id: string, field: keyof Scene, value: any) => {
  setScenes(
   scenes.map((s) => {
    if (s.id === id) {
     const updated = { ...s, [field]: value }
     if (field === "text") {
      updated.durationEstimate = calculateDuration(value as string)
      updated.emotionScore = calculateEmotion(value as string)
     }
     return updated
    }
    return s
   }),
  )
 }

 const deleteScene = (id: string) => {
  setScenes(scenes.filter((s) => s.id !== id))
 }

 const chartData = useMemo(
  () =>
   scenes.map((s, i) => ({
    name: s.name || `S${i + 1}`,
    passion: s.emotionScore,
    duration: s.durationEstimate,
   })),
  [scenes],
 )

 const formatTime = (secs: number) => {
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
 }

 return (
  <ToolboxScaffold
   title="STORYBOARD STUDIO"
   icon={<Video size={40} strokeWidth={3} className="text-black" />}
   headerColor="bg-[#FFB158]"
   iconBoxColor="bg-[#FF6666]"
   collapsible={collapsible}
   isOpen={isOpen}
   onToggle={() => setIsOpen(!isOpen)}
   embedded={embedded}
   shellClassName="animate-fade-in"
   contentClassName={embedded ? "p-0" : "p-8"}>
   {/* Cross-Tool Omni Sync Warning/Data Display */}
   {brain.seoState.winningTitle && (
    <div className="mb-4 bg-white border-[3px] border-black rounded-lg p-3 shadow-[4px_4px_0px_0px_black] flex items-center justify-between">
     <div className="flex items-center gap-3">
      <span className="bg-[#00d2ff] text-black px-2 py-1 text-xs font-black uppercase rounded border-2 border-black">
       Target Topic
      </span>
      <span className="font-bold text-xl">"{brain.seoState.winningTitle}"</span>
     </div>
    </div>
   )}

   <div className="flex flex-row flex-1 gap-4 overflow-hidden">
    {/* PANEL 1: BLUEPRINT */}
    <div className="w-[30%] bg-white border-[3px] border-black rounded-xl shadow-[6px_6px_0px_0px_black] flex flex-col overflow-hidden">
     <div className="bg-black text-white p-3 flex justify-between items-center z-10">
      <h2 className="font-bold flex items-center gap-2">
       <Type size={16} /> THE BLUEPRINT
      </h2>
      <div className="flex items-center gap-4">
       <button
        onClick={handleSyncToDrive}
        disabled={isSyncing}
        className="bg-[#00d2ff] text-black px-2 py-1 text-xs font-bold rounded border-2 border-transparent hover:border-black transition-all flex items-center gap-1">
        {isSyncing ? (
         <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
        ) : (
         <Cloud size={14} />
        )}
        Sync
       </button>
       <span className="text-[#00ff99] text-sm font-mono font-bold">
        Total: {formatTime(totalDuration)}
       </span>
       <button
        onClick={addScene}
        className="bg-[#ccff00] text-black px-2 py-1 text-xs font-bold rounded border-2 border-transparent hover:border-black transition-all">
        <Plus size={14} />
       </button>
      </div>
     </div>
     <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
      {scenes.map((scene) => (
       <div
        key={scene.id}
        className="border-[3px] border-black p-3 bg-white rounded-lg relative group shadow-sm hover:shadow-[4px_4px_0px_0px_#e5e7eb] transition-all">
        <input
         type="text"
         className="w-full font-black text-lg bg-transparent border-b-2 border-transparent focus:border-black outline-none mb-2 text-[#ff3399]"
         value={scene.name}
         onChange={(e) => updateScene(scene.id, "name", e.target.value)}
         placeholder="Scene Name"
        />
        <textarea
         className="w-full h-24 p-2 text-sm border-2 border-gray-200 rounded resize-none outline-none focus:border-black font-medium leading-relaxed"
         placeholder="Write script here..."
         value={scene.text}
         onChange={(e) => updateScene(scene.id, "text", e.target.value)}
        />
        <div className="mt-2 flex justify-between items-center text-xs font-bold text-gray-500 bg-gray-100 p-1.5 rounded">
         <span className="font-mono text-black">
          {formatTime(scene.durationEstimate)}
         </span>
         <button
          onClick={() => deleteScene(scene.id)}
          className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110">
          <Trash2 size={14} strokeWidth={3} />
         </button>
        </div>
       </div>
      ))}
     </div>
    </div>

    {/* PANEL 2: VISUAL CANVAS */}
    <div className="flex-1 bg-white border-[3px] border-black rounded-xl shadow-[6px_6px_0px_0px_black] flex flex-col overflow-hidden">
     <div className="bg-black text-[#ccff00] p-3 border-b-[3px] border-black flex items-center justify-between z-10">
      <div className="flex items-center gap-2">
       <Eye size={16} />{" "}
       <h2 className="font-bold uppercase tracking-tight">Visual Canvas</h2>
      </div>
      <button className="text-xs bg-white text-black px-3 py-1 font-bold rounded border-2 border-black flex items-center gap-1 hover:bg-[#ccff00] transition-colors">
       <Sparkles size={12} /> Auto-B-Roll
      </button>
     </div>
     <div className="flex-1 overflow-y-auto p-6 bg-[#f3f4f6]">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
       {scenes.map((scene) => (
        <div
         key={scene.id}
         className="bg-white border-[3px] border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden transform hover:-translate-y-1 transition-transform">
         <div className="bg-gradient-to-r from-black to-gray-800 text-white px-3 py-1.5 flex justify-between items-center border-b-[3px] border-black">
          <span className="font-bold text-sm truncate">{scene.name}</span>
          <span className="text-[#00d2ff] text-xs font-mono font-bold">
           {formatTime(scene.durationEstimate)}
          </span>
         </div>

         {/* Film Frame with Sprockets */}
         <div className="bg-black p-0 group cursor-pointer overflow-hidden border-b-[3px] border-black relative">
          {/* Top Sprockets */}
          <div className="h-4 w-full opacity-60">
           <SprocketHoles count={20} color="white" className="h-full w-full" />
          </div>

          {/* Visual Container */}
          <div className="aspect-video bg-gray-900 border-y-2 border-white/10 flex items-center justify-center relative overflow-hidden group-hover:bg-gray-800 transition-colors">
           {scene.imageUrl ? (
            <img
             src={scene.imageUrl}
             alt="Scene Visual"
             className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            />
           ) : (
            <div className="flex flex-col items-center text-white/20 group-hover:text-white transition-colors">
             <ImageIcon size={32} />
             <span className="text-[10px] font-black mt-2 uppercase tracking-[0.2em]">
              Frame Ready
             </span>
            </div>
           )}

           {/* Hover Overlay */}
           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
            <button className="bg-[#ccff00] text-black px-5 py-2.5 rounded-xl font-black border-[3px] border-black flex items-center gap-2 transform hover:scale-105 active:scale-95 transition-all shadow-[6px_6px_0px_0px_black]">
             <Sparkles size={16} /> GENERATE FRAME
            </button>
           </div>
          </div>

          {/* Bottom Sprockets */}
          <div className="h-4 w-full opacity-60">
           <SprocketHoles count={20} color="white" className="h-full w-full" />
          </div>
         </div>

         {/* B-Roll Editor */}
         <div className="p-3 bg-white flex-1 relative">
          <div className="flex items-center justify-between mb-2">
           <div className="flex items-center gap-1 text-[10px] font-black tracking-widest text-[#ff3399] uppercase">
            <Video size={12} strokeWidth={3} /> B-ROLL DIRECTIVE
           </div>
          </div>
          <textarea
           className="w-full h-16 text-sm bg-gray-50 border-2 border-transparent focus:border-black rounded p-2 outline-none resize-none font-medium leading-tight"
           placeholder="Describe pacing, shots, or SFX..."
           value={scene.broll}
           onChange={(e) => updateScene(scene.id, "broll", e.target.value)}
          />
         </div>

         {/* Universal API Bridge: ElevenLabs & Auphonic */}
         <div className="p-3 bg-black/5 border-t-[3px] border-black flex items-center justify-between gap-4">
          {scene.voiceoverUrl ? (
           <div className="flex-1 flex flex-col gap-2">
            <div className="flex items-center gap-3">
             <audio
              src={scene.voiceoverUrl}
              hide-chrome-interface-labels="true"
              controls
              className="h-8 flex-1 scale-90 origin-left"
             />
             <div className="bg-[#ccff00] text-black p-2 rounded-lg border-2 border-black">
              <CustomIcon name="headset" size={14} />
             </div>
            </div>
            <button
             onClick={() =>
              handleEnhance(scene.id, scene.voiceoverUrl!, scene.name)
             }
             disabled={isEnhancingId === scene.id}
             className="w-full bg-[#00d2ff] text-black text-[10px] font-black uppercase py-1 rounded border-2 border-black shadow-[3px_3px_0px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-2">
             {isEnhancingId === scene.id ? (
              <>
               <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
               ENHANCING EQ...
              </>
             ) : (
              <>PRO-POLISH (AUPHONIC)</>
             )}
            </button>
           </div>
          ) : (
           <>
            <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-black/50 uppercase">
             <CustomIcon name="mic" size={12} className="opacity-50" />{" "}
             Voiceover Nexus
            </div>
            <button
             onClick={() => generateVoiceover(scene.id, scene.text)}
             disabled={generatingVoiceId === scene.id || !scene.text}
             className="bg-black text-[#ccff00] px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
             {generatingVoiceId === scene.id ? (
              <>
               <div className="w-3 h-3 border-2 border-[#ccff00] border-t-transparent rounded-full animate-spin" />
               Synthesizing...
              </>
             ) : (
              <>
               <CustomIcon name="volume" size={14} /> Generate TTS
              </>
             )}
            </button>
           </>
          )}
         </div>
        </div>
       ))}
      </div>
     </div>
    </div>

    {/* PANEL 3: ORACLE (Diagnostics) */}
    <div className="w-[25%] bg-white border-[3px] border-black rounded-xl shadow-[6px_6px_0px_0px_black] flex flex-col overflow-hidden">
     <div className="bg-[#00d2ff] text-black border-b-[3px] border-black p-3 flex items-center justify-between z-10">
      <div className="flex items-center gap-2">
       <Settings2 size={16} />
       <h2 className="font-black uppercase tracking-tight">The Oracle</h2>
      </div>
      {warnings.length === 0 ? (
       <div className="bg-black text-[#00ff99] px-2 py-0.5 rounded textxs font-bold font-mono text-[10px]">
        ALL CLEAR
       </div>
      ) : (
       <div className="bg-black text-[#ff3399] px-2 py-0.5 rounded textxs font-bold font-mono text-[10px] animate-pulse">
        {warnings.length} WARNINGS
       </div>
      )}
     </div>

     <div className="flex-1 overflow-y-auto flex flex-col bg-gray-50">
      {/* Emotion Arc */}
      <div className="p-4 border-b-[3px] border-black bg-white">
       <h3 className="font-black mb-3 flex items-center gap-2 uppercase text-sm">
        <Activity size={16} className="text-[#ff3399]" /> Emotion Arc
       </h3>
       <div className="h-40 w-full bg-black rounded-xl p-3 relative border-[3px] border-black shadow-[4px_4px_0px_0px_#ccff00]">
        <ResponsiveContainer
         width="100%"
         height="100%"
         minWidth={1}
         minHeight={1}>
         <AreaChart data={chartData}>
          <defs>
           <linearGradient id="colorPassion" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00d2ff" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#00d2ff" stopOpacity={0} />
           </linearGradient>
          </defs>
          <Tooltip
           contentStyle={{
            backgroundColor: "#000",
            color: "#fff",
            border: "3px solid #00d2ff",
            borderRadius: "8px",
            fontWeight: "bold",
           }}
           itemStyle={{ color: "#00ff99", fontWeight: "black" }}
          />
          <Area
           type="monotone"
           dataKey="passion"
           stroke="#00d2ff"
           strokeWidth={4}
           fillOpacity={1}
           fill="url(#colorPassion)"
          />
         </AreaChart>
        </ResponsiveContainer>
       </div>
       <p className="text-[10px] text-gray-500 mt-3 font-bold uppercase tracking-tight leading-tight">
        Visualizes script intensity to prevent "flatlining". Values above 50
        indicate high excitement/pacing.
       </p>
      </div>

      {/* Retention Warnings */}
      <div className="p-4 flex-1">
       <h3 className="font-black text-black mb-3 flex items-center gap-2 text-sm uppercase">
        <AlertTriangle
         size={16}
         className={warnings.length > 0 ? "text-red-500" : "text-black"}
        />{" "}
        Retentions Flags
       </h3>
       {warnings.length === 0 ? (
        <div className="bg-[#00ff99]/20 border-[2px] border-[#00ff99] p-3 rounded-lg text-sm font-bold text-green-800 flex items-start gap-2">
         <Sparkles size={16} className="text-[#00ff99] shrink-0 mt-0.5" />
         Visual pacing looks excellent. Ready for production.
        </div>
       ) : (
        <div className="space-y-3">
         {warnings.map((w, i) => (
          <div
           key={i}
           className="bg-white border-[3px] border-black p-3 rounded-lg shadow-[3px_3px_0px_0px_#ff3399] text-xs font-bold flex items-start gap-2">
           <span className="shrink-0 text-[#ff3399] leading-none mt-0.5">
            ●
           </span>
           <span className="leading-tight">{w}</span>
          </div>
         ))}
        </div>
       )}
      </div>
     </div>
    </div>
   </div>
  </ToolboxScaffold>
 )
}

export default StoryboardStudio
