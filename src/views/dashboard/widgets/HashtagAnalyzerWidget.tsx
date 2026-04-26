import React, { useState } from "react"
import { WidgetShell } from "../WidgetShell"
import { Hash, Sparkles, Copy, Check, TrendingUp, TrendingDown, Minus } from "lucide-react"

interface HashtagResult {
 tag: string
 reach: number  // estimated impressions
 competition: "low" | "medium" | "high"
 trending: "rising" | "falling" | "stable"
}

export const HashtagAnalyzerWidget = ({
 widget, instance, editMode, onToggleCollapse, onCycleSize, onRemove, data,
}: any) => {
 const common = { widget, instance, editMode, canEdit: true, onToggleCollapse, onCycleSize, onRemove }
 const [input, setInput] = useState("")
 const [results, setResults] = useState<HashtagResult[]>([])
 const [analyzing, setAnalyzing] = useState(false)
 const [copied, setCopied] = useState(false)

 const analyze = async () => {
  const tags = input.split(/[,\s#]+/).filter(Boolean).map(t => t.replace(/^#/, ""))
  if (tags.length === 0) return
  setAnalyzing(true)
  // Simulate analysis (replace with real API)
  await new Promise(r => setTimeout(r, 1000))
  setResults(tags.map(tag => ({
   tag: `#${tag}`,
   reach: Math.round(1000 + Math.random() * 500000),
   competition: ["low", "medium", "high"][Math.floor(Math.random() * 3)] as any,
   trending: ["rising", "falling", "stable"][Math.floor(Math.random() * 3)] as any,
  })))
  setAnalyzing(false)
 }

 const getOptimal3 = () => results
  .filter(r => r.trending !== "falling")
  .sort((a, b) => {
   const compScore = { low: 3, medium: 2, high: 1 }
   return (compScore[b.competition] * b.reach) - (compScore[a.competition] * a.reach)
  })
  .slice(0, 3)

 const copyAll = () => {
  const optimal = getOptimal3()
  navigator.clipboard.writeText(optimal.map(r => r.tag).join(" "))
  setCopied(true)
  setTimeout(() => setCopied(false), 2000)
 }

 const formatReach = (n: number) => n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(0)}K` : n.toString()

 const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === "rising") return <TrendingUp size={10} color="#4FFF5B" />
  if (trend === "falling") return <TrendingDown size={10} color="#FF1744" />
  return <Minus size={10} color="#999" />
 }

 const compColor = (c: string) => c === "low" ? "#4FFF5B" : c === "medium" ? "#FFE357" : "#FF8AAF"

 return (
  <WidgetShell {...common} icon={<Hash size={22} />}>
   <div style={{ display: "flex", flexDirection: "column", gap: "8px", height: "100%" }}>
    <div style={{ display: "flex", gap: "6px" }}>
     <input className="vt-input" value={input} onChange={(e) => setInput(e.target.value)}
      onKeyDown={(e) => { if (e.key === "Enter") analyze() }}
      placeholder="#hashtag1, #hashtag2, #hashtag3..."
      style={{ flex: 1 }}
     />
     <button onClick={analyze} disabled={analyzing} style={{
      padding: "0 12px", border: "2px solid #000", borderRadius: "8px", background: "#CC00FF",
      color: "#fff", fontSize: "9px", fontWeight: 1000, textTransform: "uppercase",
      cursor: analyzing ? "wait" : "pointer", boxShadow: "2px 2px 0 0 #000",
     }}>
      {analyzing ? "..." : <Sparkles size={14} />}
     </button>
    </div>

    {results.length > 0 && (
     <>
      {/* Results Table */}
      <div style={{ flex: 1, border: "2px solid #000", borderRadius: "8px", overflow: "hidden" }}>
       <div style={{ display: "grid", gridTemplateColumns: "1fr 60px 60px 30px", padding: "4px 8px", background: "#000", color: "#fff", fontSize: "7px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em" }}>
        <span>Tag</span><span>Reach</span><span>Comp.</span><span>📈</span>
       </div>
       <div style={{ maxHeight: "140px", overflowY: "auto" }}>
        {results.map((r, i) => (
         <div key={i} style={{
          display: "grid", gridTemplateColumns: "1fr 60px 60px 30px", padding: "4px 8px",
          borderBottom: "1px solid #eee", fontSize: "10px", fontWeight: 700, alignItems: "center",
         }}>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.tag}</span>
          <span>{formatReach(r.reach)}</span>
          <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
           <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: compColor(r.competition) }} />
           <span style={{ fontSize: "8px", textTransform: "uppercase" }}>{r.competition}</span>
          </span>
          <TrendIcon trend={r.trending} />
         </div>
        ))}
       </div>
      </div>

      {/* Optimal Combo */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 8px", border: "2px solid #000", borderRadius: "8px", background: "rgba(204,0,255,0.05)" }}>
       <Sparkles size={12} color="#CC00FF" />
       <span style={{ flex: 1, fontSize: "10px", fontWeight: 900 }}>
        Optimal: {getOptimal3().map(r => r.tag).join(" ")}
       </span>
       <button onClick={copyAll} style={{
        padding: "2px 8px", border: "1px solid #000", borderRadius: "4px",
        background: copied ? "#4FFF5B" : "#fff", fontSize: "8px", fontWeight: 900,
        cursor: "pointer", textTransform: "uppercase",
       }}>
        {copied ? <Check size={10} /> : <Copy size={10} />}
       </button>
      </div>
     </>
    )}
   </div>
  </WidgetShell>
 )
}
