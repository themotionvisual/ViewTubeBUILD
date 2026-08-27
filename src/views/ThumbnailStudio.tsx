import React, { useState, useRef } from "react"
import {
 generateThumbnail,
 rateThumbnail,
 generateThumbnailConcept,
 hasGeminiKey,
} from "../services/gemini"
import type { ThumbnailConceptResult } from "../services/gemini"
import {
 AspectRatio,
 ImageSize,
 type SeoResult,
 type ThumbnailHistoryItem,
} from "../types"
import { useBrain } from "../context/useBrain"
import { CustomIcon } from "../components/CustomIcon"
import {
 ToolboxScaffold,
 SubToolbox,
 StandardInput,
 StandardUploadBox,
 StandardTextArea,
 SubToolboxActionButton,
 SubToolboxGridActionButton,
 SubToolboxDropdownControl,
} from "../components/Toolbox"
import { StandardButton } from "../components/StandardButton"
import { PostActionReflection } from "../components/PostActionReflection"

interface ReferenceImage {
 id: string
 file: File
 previewUrl: string
 usageType: string
}

interface ThumbnailStudioProps {
 embedded?: boolean
 collapsible?: boolean
 isOpenInitial?: boolean
 paletteIndex?: number
}

const ThumbnailStudio: React.FC<ThumbnailStudioProps> = ({
 embedded = false,
 collapsible = false,
 isOpenInitial = true,
 paletteIndex,
}) => {
 const { brain } = useBrain()
 const [activeTab, setActiveTab] = useState<"generate" | "analyze">("generate")
 const [isOpen, setIsOpen] = useState(isOpenInitial)
 const [genLoading, setGenLoading] = useState(false)
 const [conceptLoading, setConceptLoading] = useState(false)
 const [analyzeLoading, setAnalyzeLoading] = useState(false)
 const [prompt, setPrompt] = useState("")
 const [hookText, setHookText] = useState("")
 const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.LANDSCAPE_16_9)
 const [imageSize, setImageSize] = useState<ImageSize>(ImageSize.SIZE_1K)
 const [generatedImage, setGeneratedImage] = useState<string | null>(null)
 const [history, setHistory] = useState<ThumbnailHistoryItem[]>([])
 const [surfaceMode, setSurfaceMode] = useState<"mobile" | "ctv">("mobile")
 const [expression, setExpression] = useState<string>("none")
 const [aiHookText, setAiHookText] = useState("")
 const [aiExpression, setAiExpression] = useState("")
 const [aiColorStrategy, setAiColorStrategy] = useState("")
 const [showSquintTest, setShowSquintTest] = useState(false)
 const [useReferenceImages, setUseReferenceImages] = useState<boolean>(true)
 const [usePalette, setUsePalette] = useState<boolean>(false)
 const [useStyles, setUseStyles] = useState<boolean>(true)
 const [selectedStyles, setSelectedStyles] = useState<string[]>([])
 const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([])
 const [palette, setPalette] = useState<string[]>(["#CCFF00", "#FF3399", "", "", ""])
 const [analysisFile, setAnalysisFile] = useState<File | null>(null)
 const [analysisPreview, setAnalysisPreview] = useState<string | null>(null)
 const [analysisResult, setAnalysisResult] = useState<string>("")
 const fileInputRef = useRef<HTMLInputElement>(null)
 const THUMBNAIL_STYLES = ["Authentic/Candid","Lo-Fi","Uncanny/Liminal","Proof of Human","Cinematic","Documentary","Minimalist","Dark & Moody","High Contrast","Educational","Graphic","Mysterious","Vibrant","Retro/Vintage","Futuristic","3D Rendered","Photorealistic","Surreal","Neon/Cyberpunk","Watercolor"]
 const EXPRESSIONS = [{ id:"surprise",label:"Surprise",emoji:"😲",stat:"+35% CTR",niche:"Entertainment"},{id:"concern",label:"Concern",emoji:"😟",stat:"2.3M avg views",niche:"Documentary"},{id:"focus",label:"Focus",emoji:"🧐",stat:"+12% CTR",niche:"Tech/Gaming"},{id:"smile",label:"Smile",emoji:"😊",stat:"+23% CTR",niche:"Tutorials"}]
 const currentSeoResult = brain.seoState?.results?.[0] || null
 const handleManualConceptGen=async()=>{if(!currentSeoResult&&!prompt)return;setConceptLoading(true);try{const concept:ThumbnailConceptResult=await generateThumbnailConcept(currentSeoResult||undefined,prompt,brain,expression!=="none"?expression:undefined,surfaceMode);setPrompt(concept.prompt);setAspectRatio(concept.aspectRatio);setAiHookText(concept.hookText);setAiExpression(concept.expression);setAiColorStrategy(concept.colorStrategy);if(concept.hookText&&!hookText)setHookText(concept.hookText)}catch{alert("Failed to generate concept.")}finally{setConceptLoading(false)}}
 const handleStyleToggle=(style:string)=>setSelectedStyles(prev=>prev.includes(style)?prev.filter(s=>s!==style):prev.length>=4?prev:[...prev,style])
 const handleGenerate=async()=>{if(!prompt)return;setGenLoading(true);try{const activeColors=palette.filter(c=>c.trim()!=="");const weights=["60%","30%","10%"];
 const paletteContext=usePalette&&activeColors.length?`\n\nCRITICAL COLOR PALETTE: Strictly follow the 60-30-10 distribution: ${activeColors.map((c,i)=>`${c} (${weights[i]||"accent"})`).join(", ")}.`:"";const styleContext=useStyles&&selectedStyles.length?`\n\nCRITICAL STYLE REQUIREMENTS: The thumbnail MUST be generated using a combination of the following styles: ${selectedStyles.join(", ")}.`:"";const img=await generateThumbnail(prompt+styleContext+paletteContext,aspectRatio,imageSize,hookText||undefined,surfaceMode);setGeneratedImage(img);setHistory([{id:crypto.randomUUID(),url:img,prompt,timestamp:Date.now()},...history])}catch(e){console.error(e);alert("Generation Failed.")}finally{setGenLoading(false)}}
 const handleAnalyze=async()=>{if(!analysisFile)return;setAnalyzeLoading(true);try{const reader=new FileReader();reader.onloadend=async()=>{const base64=(reader.result as string).split(",")[1];const result=await rateThumbnail(base64,analysisFile.type,{concept:brain.coreConcept,niche:brain.targetNiche});setAnalysisResult(result);setAnalyzeLoading(false)};reader.readAsDataURL(analysisFile)}catch{setAnalyzeLoading(false);alert("Analysis failed.")}}
 return <ToolboxScaffold title="THUMBNAIL STUDIO" subtitle="Generate Thumbnails for all your videos. + Images for Endscreens, Posts, Polls + More" icon={<CustomIcon name="image" size={40} className="text-black"/>} headerColor="bg-[#FFE357]" iconBoxColor="bg-[#CCFF00]" paletteIndex={paletteIndex} collapsible={collapsible} isOpen={isOpen} onToggle={()=>setIsOpen(!isOpen)} embedded={embedded} helpText="Build strong thumbnail ideas fast. Get overlay text, visual direction, and composition prompts in one place." shellClassName="animate-fade-in" contentClassName={embedded?"p-0":"p-8 min-h-[600px] relative bg-white"} headerActions={<div className="flex bg-white border-[4px] border-black p-1 rounded-xl shadow-[3px_3px_0px_0px_black] mr-2 h-12 my-auto"><button onClick={e=>{e.stopPropagation();setActiveTab("generate")}} className={`px-5 text-[11px] font-[1000] uppercase rounded-lg ${activeTab==="generate"?"bg-black text-white":"text-black/30"}`}>Studio</button><button onClick={e=>{e.stopPropagation();setActiveTab("analyze")}} className={`px-5 text-[11px] font-[1000] uppercase rounded-lg ${activeTab==="analyze"?"bg-black text-white":"text-black/30"}`}>Analyzer</button></div>}>
 {activeTab==="generate"&&history.length>0&&<div className="w-full mb-8 flex gap-6 overflow-x-auto pb-4 custom-scrollbar">{history.map(item=><div key={item.id} onClick={()=>{setGeneratedImage(item.url);setPrompt(item.prompt)}} className="flex-shrink-0 w-44 h-28 border-[4px] border-black rounded-[20px] cursor-pointer bg-white overflow-hidden shadow-[6px_6px_0px_0px_black]"><img src={item.url} className="w-full h-full object-cover" alt="History"/></div>)}</div>}
 {activeTab==="generate"&&<div className="grid grid-cols-1 lg:grid-cols-2 gap-8"><div className="flex flex-col gap-6"><SubToolbox collapsible title="Concept" icon={<CustomIcon name="!!!IDEA" size={20}/>} isOpenInitial><div className="space-y-4"><StandardTextArea value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Describe the image concept..." minHeight="112px" hasBorder={false}/>{aiColorStrategy&&<div className="bg-gray-50 border-[2px] border-black rounded-lg p-3"><p className="text-[9px] font-[1000]">AI INTELLIGENCE</p>{aiHookText&&<p className="text-xs font-black">Hook: {aiHookText}</p>}{aiExpression&&<p className="text-xs font-black">Expression: {aiExpression}</p>}<p className="text-xs font-black">Color: {aiColorStrategy}</p></div>}<SubToolboxActionButton label={conceptLoading?"Refreshing...":"Auto-Refine"} iconName="sparkles" tone="yellow" onClick={handleManualConceptGen} disabled={conceptLoading}/></div></SubToolbox>
 <SubToolbox collapsible title="Styles" icon={<CustomIcon name="!!!COLLECTION" size={20}/>} isOpenInitial={false}><div className="grid grid-cols-3 gap-2">{THUMBNAIL_STYLES.map(style=><button key={style} onClick={()=>handleStyleToggle(style)} className={`px-2 py-2 border-[2px] border-black rounded-lg font-black uppercase text-[9px] ${selectedStyles.includes(style)?"bg-[#FFE357]":"bg-white"}`}>{style}</button>)}</div></SubToolbox>
 <SubToolbox collapsible title="Expression" icon={<CustomIcon name="user" size={20}/>} isOpenInitial={false}><div className="grid grid-cols-2 gap-2">{EXPRESSIONS.map(expr=><button key={expr.id} onClick={()=>setExpression(expression===expr.id?"none":expr.id)} className={`p-3 border-[2px] border-black rounded-lg text-left ${expression===expr.id?"bg-[#FFE357]":"bg-white"}`}><span className="font-[1000] uppercase text-[10px]">{expr.label}</span><p className="text-[8px] font-black text-black/40 uppercase">{expr.stat} · {expr.niche}</p></button>)}</div></SubToolbox>
 <SubToolbox collapsible title="Hook Text" icon={<CustomIcon name="!!!TEXT" size={20}/>} isOpenInitial={false}><StandardInput value={hookText} onChange={e=>setHookText(e.target.value)} placeholder="HOOK (MAX 3 WORDS)"/></SubToolbox>
 </div><div className="flex flex-col gap-6"><div className="min-h-[420px] border-[4px] border-black bg-[#f1f5f9] rounded-[48px] shadow-[12px_12px_0px_0px_black] flex items-center justify-center p-8">{generatedImage?<img src={generatedImage} alt="Gen" className="max-w-full max-h-full object-contain border-[4px] border-black rounded-3xl"/>:<div className="text-center font-[1000] uppercase">Canvas Standby</div>}</div><div className="grid grid-cols-2 gap-4"><SubToolboxDropdownControl label="Ratio" value={aspectRatio} options={Object.values(AspectRatio)} onChange={value=>setAspectRatio(value as AspectRatio)} tone="green"/><SubToolboxDropdownControl label="Size" value={imageSize} options={Object.values(ImageSize)} onChange={value=>setImageSize(value as ImageSize)} tone="green"/></div>{!hasGeminiKey()?<button onClick={()=>window.location.href="/settings"} className="w-full h-14 bg-black text-[#FFDD00] font-[1000] uppercase">Missing API Key: Settings</button>:<SubToolboxGridActionButton label={genLoading?"Creating...":"Generate Art"} iconName="zap" tone="yellow" onClick={handleGenerate} disabled={genLoading||!prompt}/>} {generatedImage&&<PostActionReflection toolId="THUMBNAIL_STUDIO"/>}</div></div>}
 {activeTab==="analyze"&&<div className="flex flex-col lg:flex-row gap-10"><div className="w-full lg:w-1/2"><input type="file" ref={fileInputRef} accept="image/*" onChange={e=>{if(e.target.files?.[0]){setAnalysisFile(e.target.files[0]);const r=new FileReader();r.onloadend=()=>setAnalysisPreview(r.result as string);r.readAsDataURL(e.target.files[0])}}}/>{analysisPreview&&<img src={analysisPreview} alt="Preview" className="max-h-[300px] object-contain"/>}<button onClick={handleAnalyze} disabled={!analysisFile||analyzeLoading} className="w-full h-20 border-[6px] border-black bg-[#FFDD00] font-[1000] uppercase">{analyzeLoading?"SCANNING...":"SCAN POTENTIAL"}</button></div><div className="flex-1 bg-gray-50 rounded-2xl border-[4px] border-black p-6"><h4 className="text-xl font-black uppercase">Analysis Result</h4><div className="text-sm font-bold">{analyzeLoading?"Running Neural Analysis...":analysisResult||"Upload a thumbnail to see scores."}</div>{analysisResult&&<PostActionReflection toolId="THUMBNAIL_ANALYZER"/>}</div></div>}
 </ToolboxScaffold>
}
export default ThumbnailStudio
