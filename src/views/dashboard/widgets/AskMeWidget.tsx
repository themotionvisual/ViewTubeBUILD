import React, { useState, useRef, useEffect } from "react"
import { WidgetShell } from "../WidgetShell"
import { useEntitlement } from "../../../app/AppShell"
import { MessageSquare, Send, Sparkles, Bookmark, Trash2 } from "lucide-react"
import { canAffordAiTokensFromState } from "../../../services/billingEntitlement"
import { getAiTokenCost } from "../../../services/aiTokenCosts"

interface Message {
 role: "user" | "ai"
 text: string
 timestamp: number
}

const STORAGE_KEY = "vt_askme_history"

const QUICK_TOPICS = [
 { label: "📈 View Drop-off Analysis", q: "Why are my views dropping? Analyze my recent video performance." },
 { label: "🎬 Hook Strength Audit", q: "Audit the hooks on my top 5 videos. Which ones work and which don't?" },
 { label: "📊 Growth Opportunities", q: "What are my biggest growth opportunities right now based on my analytics?" },
]

export const AskMeWidget = ({
 widget, instance, editMode, onToggleCollapse, onCycleSize, onRemove, data,
}: any) => {
 const common = { widget, instance, editMode, canEdit: true, onToggleCollapse, onCycleSize, onRemove }
 const ASK_COST = getAiTokenCost("askMeQuestion")
 const entitlement = useEntitlement()
 const canAffordAsk = canAffordAiTokensFromState(entitlement, ASK_COST)
 const [messages, setMessages] = useState<Message[]>(() => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") } catch { return [] }
 })
 const [input, setInput] = useState("")
 const [isThinking, setIsThinking] = useState(false)
 const scrollRef = useRef<HTMLDivElement>(null)

 useEffect(() => {
  scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
 }, [messages])

 useEffect(() => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-50)))
 }, [messages])

 const buildContext = () => {
  const stats = data.statBlocks?.map((s: any) => `${s.label}: ${s.value}`).join(", ") || "No stats"
  const topVideos = (data.canonicalRows || []).slice(0, 5).map((v: any) => v.title).join(", ") || "No videos"
  const subs = data.brain?.recentMetrics?.currentSubscribers || 0
  return `Channel stats (28d): ${stats}. Subscribers: ${subs}. Recent videos: ${topVideos}.`
 }

 const handleSend = async (question?: string) => {
  const q = question || input.trim()
  if (!q || !canAffordAsk) return
  setInput("")
  const userMsg: Message = { role: "user", text: q, timestamp: Date.now() }
  setMessages(prev => [...prev, userMsg])
  setIsThinking(true)

  try {
   const context = buildContext()
   const { askChannelQuestion } = await import("../../../services/gemini")
   const answer = await askChannelQuestion(q, context, data.brain)
   setMessages(prev => [...prev, { role: "ai", text: answer, timestamp: Date.now() }])
  } catch (err) {
   // Fallback local response
   const fallback = generateLocalResponse(q, data)
   setMessages(prev => [...prev, { role: "ai", text: fallback, timestamp: Date.now() }])
  } finally {
   setIsThinking(false)
  }
 }

 const clearHistory = () => { setMessages([]); localStorage.removeItem(STORAGE_KEY) }

 return (
  <WidgetShell {...common} icon={<MessageSquare size={22} />}>
   <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: "8px" }}>
    {/* Quick Topics */}
   {messages.length === 0 && (
     <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <span style={{ fontSize: "9px", fontWeight: 900, textTransform: "uppercase", opacity: 0.4 }}>Quick Topics</span>
      {QUICK_TOPICS.map((t, i) => (
       <button
        key={i}
        onClick={() => handleSend(t.q)}
        disabled={!canAffordAsk}
        style={{
         padding: "8px 10px", background: "#fff", border: "2px solid #000", borderRadius: "8px",
         fontSize: "11px", fontWeight: 700, cursor: "pointer", textAlign: "left",
         boxShadow: "2px 2px 0 0 var(--widget-color, rgba(64,198,233,0.3))", transition: "all 0.1s",
       }}>
        {t.label}
       </button>
      ))}
      {!canAffordAsk && (
       <div style={{ fontSize: "9px", fontWeight: 900, textTransform: "uppercase", opacity: 0.6 }}>
        {entitlement.tier === "free" ? "Upgrade for AskMe AI." : `Need ${ASK_COST} token.`}
       </div>
      )}
     </div>
    )}

    {/* Chat History */}
    <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px", minHeight: "80px" }}>
     {messages.map((msg, i) => (
      <div key={i} style={{
       alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
       maxWidth: "85%", padding: "8px 10px",
       background: msg.role === "user" ? "var(--widget-color, #579AFF)" : "#fff",
       color: msg.role === "user" ? "#fff" : "#000",
       border: `2px solid ${msg.role === "user" ? "#000" : "#000"}`,
       borderRadius: "10px",
       fontSize: "11px", fontWeight: 700, lineHeight: 1.4,
       boxShadow: msg.role === "ai" ? "2px 2px 0 0 var(--widget-color, rgba(64,198,233,0.4))" : "2px 2px 0 0 #000",
       whiteSpace: "pre-wrap",
      }}>
       {msg.text}
      </div>
     ))}
     {isThinking && (
      <div style={{ alignSelf: "flex-start", padding: "8px 12px", background: "#f0f0f0", border: "2px solid #000", borderRadius: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
       <Sparkles size={12} style={{ animation: "spin 2s linear infinite" }} />
       <span style={{ fontSize: "10px", fontWeight: 900, textTransform: "uppercase", opacity: 0.6 }}>Analyzing...</span>
      </div>
     )}
    </div>

    {/* Input */}
    <div style={{ display: "flex", gap: "6px", borderTop: "2px solid #000", paddingTop: "8px" }}>
     {messages.length > 0 && (
      <button onClick={clearHistory} title="Clear history" style={{ width: "32px", height: "36px", border: "2px solid #000", borderRadius: "8px", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
       <Trash2 size={14} opacity={0.5} />
      </button>
     )}
     <textarea
      className="vt-textarea"
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() } }}
      placeholder="Ask anything about your channel..."
      rows={1}
      style={{ flex: 1, resize: "none", minHeight: "unset" }}
     />
     <button
      onClick={() => handleSend()}
      disabled={isThinking || !input.trim() || !canAffordAsk}
      title={!canAffordAsk ? (entitlement.tier === "free" ? "Upgrade required for AI." : `Need ${ASK_COST} token.`) : `Ask AI (${ASK_COST}T)`}
      style={{
       width: "36px", height: "36px", borderRadius: "10px", border: "3px solid #000",
       background: "var(--widget-color, #40C6E9)", display: "flex", alignItems: "center", justifyContent: "center",
       cursor: isThinking ? "wait" : "pointer", boxShadow: "2px 2px 0 0 #000", flexShrink: 0,
      }}>
      <Send size={16} />
     </button>
    </div>
   </div>
  </WidgetShell>
 )
}

/** Local fallback when Gemini unavailable */
function generateLocalResponse(question: string, data: any): string {
 const q = question.toLowerCase()
 const stats = data.statBlocks || []
 const views = stats.find((s: any) => s.label.toLowerCase().includes("views"))?.value || "0"
 const subs = stats.find((s: any) => s.label.toLowerCase().includes("subscribers"))?.value || "0"
 const revenue = stats.find((s: any) => s.label.toLowerCase().includes("revenue"))?.value || "$0"

 if (q.includes("views") || q.includes("drop")) {
  return `📊 **Views Analysis**\nYour 28-day views: ${views}\n\nPossible reasons for changes:\n• Upload consistency — gaps longer than 7 days reduce algorithmic reach\n• Title/thumbnail CTR — test more emotional or curiosity-driven hooks\n• Topic relevance — check if recent topics match what gained traction before\n\n**Action:** Upload within 48 hours and return to your highest-performing format.`
 }
 if (q.includes("revenue") || q.includes("money") || q.includes("earn")) {
  return `💰 **Revenue Snapshot**\n28-day revenue: ${revenue}\n\nTo increase:\n1. Focus on 10+ minute videos (mid-roll eligible)\n2. Target high-CPM topics in your niche\n3. Increase watch time — longer sessions = more ad impressions\n\n**Quick Win:** Add end screens to your top 5 videos to chain viewing sessions.`
 }
 if (q.includes("subscriber") || q.includes("growth") || q.includes("grow")) {
  return `👥 **Growth Report**\nCurrent subscribers: ${subs}\n\nGrowth levers:\n1. Strong CTAs — ask for subs at peak engagement, not just the end\n2. Community Tab activity — polls drive notifications\n3. Shorts funnel — short-form content feeds long-form discovery\n\n**Action:** Create 3 Shorts this week from your best long-form moments.`
 }
 return `🤖 **Analysis**\nHere's what I see:\n• Views (28d): ${views}\n• Subscribers: ${subs}\n• Revenue (28d): ${revenue}\n\nBased on your data, focus on upload consistency and thumbnail CTR optimization. Your highest-performing content format should guide your next 5 uploads.\n\nWant me to analyze something specific? Try asking about views, revenue, or growth.`
}
