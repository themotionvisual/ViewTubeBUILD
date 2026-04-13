import React, { useState } from "react"
import { LayoutTemplate, Sparkles, Loader2, Copy, Check } from "lucide-react"
import { generateEndScreen } from "../services/gemini"
import Markdown from "react-markdown"
import { SubToolbox } from "./Toolbox"

export const EndScreenTool: React.FC = () => {
 const [topic, setTopic] = useState("")
 const [result, setResult] = useState("")
 const [loading, setLoading] = useState(false)
 const [copied, setCopied] = useState(false)

 const handleGenerate = async () => {
  if (!topic) return
  setLoading(true)
  try {
   const cache = JSON.parse(localStorage.getItem("yt_analytics_cache") || "{}")
   const context = cache.profile
    ? JSON.stringify(cache.profile)
    : "General YouTube Channel"
   const res = await generateEndScreen(topic, context)
   setResult(res)
  } catch (e) {
   console.error(e)
  } finally {
   setLoading(false)
  }
 }

 const handleCopy = () => {
  navigator.clipboard.writeText(result)
  setCopied(true)
  setTimeout(() => setCopied(false), 2000)
 }

 return (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full p-8 animate-fade-in bg-white">
   <div className="flex flex-col h-full space-y-6">
    <SubToolbox
     title="Topic Directive"
     headerColor="bg-[#FFB158]"
     textColor="text-black"
     paletteIndex={0}>
     <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-black/50 ml-1">
       Video Topic
      </label>
      <input
       type="text"
       value={topic}
       onChange={(e) => setTopic(e.target.value)}
       placeholder="E.G. THE HISTORY OF ROME..."
       className="w-full h-16 p-4 border-[5px] border-black rounded-xl font-bold text-sm uppercase outline-none focus:bg-[#FFB158]/10 transition-colors"
      />
     </div>
     <button
      onClick={handleGenerate}
      disabled={loading || !topic}
      className="w-full mt-6 bg-[#FF6666] text-black border-[5px] border-black p-4 font-black uppercase text-xl rounded-xl shadow-[6px_6px_0px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-3">
      {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
      Design End-Screen
     </button>
    </SubToolbox>
   </div>

   <div className="flex flex-col h-full space-y-6">
    {result ? (
     <SubToolbox
      title="Generated Layout"
      headerColor="bg-[#FF6666]"
      textColor="text-black"
      paletteIndex={1}
      actionButton={
       <button
        onClick={handleCopy}
        className="p-2 bg-black text-white rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_black] hover:translate-y-1 hover:shadow-none transition-all">
        {copied ? <Check size={16} /> : <Copy size={16} />}
       </button>
      }>
      <div className="prose prose-sm max-w-none font-bold text-black/80 prose-headings:font-black prose-headings:uppercase overflow-y-auto max-h-[400px] custom-scrollbar pr-4">
       <Markdown>{result}</Markdown>
      </div>
     </SubToolbox>
    ) : (
     <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-[4px] border-dashed border-black/20 rounded-[32px] bg-gray-50 p-8 text-center">
      <LayoutTemplate size={80} className="mb-6 text-black/20" />
      <h3 className="text-3xl font-[1000] text-black/40 uppercase tracking-tighter mb-2">
       Awaiting Directive
      </h3>
      <p className="text-black/30 font-bold max-w-sm uppercase">
       Enter your topic on the left to generate a high-converting end-screen
       architecture.
      </p>
     </div>
    )}
   </div>
  </div>
 )
}
