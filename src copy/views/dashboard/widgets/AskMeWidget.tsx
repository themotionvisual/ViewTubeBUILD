import React, { useState, useRef, useEffect } from "react"
import { WidgetShell } from "../WidgetShell"
import { useEntitlement } from "../../../app/AppShell"
import {
 MessageSquare,
 Send,
 Sparkles,
 Trash2,
 TrendingDown,
 Clapperboard,
 BarChart3,
 Lightbulb,
 Image,
 CalendarClock,
 MessagesSquare,
 HandCoins,
} from "lucide-react"
import { canAffordAiTokensFromState } from "../../../services/billingEntitlement"
import { getAiTokenCost } from "../../../services/aiTokenCosts"

interface Message {
 role: "user" | "ai"
 text: string
 timestamp: number
}

const STORAGE_KEY = "vt_askme_history"

const FormattedMessage = ({ text }: { text: string }) => {
 const lines = text.split('\n');
 const colors = ["#FF3399", "#00D2FF", "#C9F830", "#FFB570", "#4FFF5B", "#B191FF", "#70FFCB"];
 let catIndex = 0;

 return (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
   {lines.map((line, i) => {
    let cleanLine = line.trim();
    if (!cleanLine) return null;

    const mainCatMatch = cleanLine.match(/^\*\*(.+)\*\*$/);
    if (mainCatMatch) {
     const color = colors[catIndex % colors.length];
     catIndex++;
     const title = mainCatMatch[1].replace(/^\d+\.\s*/, '');
     return (
      <div key={i} style={{
       display: 'inline-flex',
       alignSelf: 'flex-start',
       alignItems: 'center',
       background: color,
       border: '2px solid #000',
       borderRadius: '8px',
       padding: '4px 8px',
       fontSize: '11px',
       fontWeight: 900,
       textTransform: 'uppercase',
       color: '#000',
       marginTop: i > 0 ? '6px' : '0',
       boxShadow: '2px 2px 0 0 rgba(0,0,0,0.25)'
      }}>
       {title}
      </div>
     );
    }

    cleanLine = cleanLine.replace(/^[\*\-]\s*/, '');

    const subCatMatch = cleanLine.match(/^\*\*(.+?):\*\*\s*(.*)$/);
    if (subCatMatch) {
     const [, subTitle, content] = subCatMatch;
     const cleanContent = content.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
     return (
      <div key={i} style={{ fontSize: '11px', lineHeight: 1.4, paddingLeft: '4px' }}>
       <span style={{ fontWeight: 900, color: 'var(--widget-color, #40C6E9)' }}>{subTitle}: </span>
       <span style={{ fontWeight: 700, opacity: 0.85 }}>{cleanContent}</span>
      </div>
     );
    }

    const regularClean = cleanLine.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
    return (
     <div key={i} style={{ fontSize: '11px', fontWeight: 700, opacity: 0.85, lineHeight: 1.4 }}>
      {regularClean}
     </div>
    );
   })}
  </div>
 )
}

const QUICK_TOPICS = [
 {
  label: "View Drop-Off",
  q: "Why are my views dropping? Analyze my recent video performance.",
  Icon: TrendingDown,
  color: "#4FFF5B",
  shadow: "rgba(79,255,91,0.55)",
 },
 {
  label: "Hook Audit",
  q: "Audit the hooks on my top 5 videos. Which ones work and which don't?",
  Icon: Clapperboard,
  color: "#00D2FF",
  shadow: "rgba(0,210,255,0.55)",
 },
 {
  label: "Growth Plan",
  q: "What are my biggest growth opportunities right now based on my analytics?",
  Icon: BarChart3,
  color: "#579AFF",
  shadow: "rgba(87,154,255,0.55)",
 },
 {
  label: "Video Ideas",
  q: "Give me 10 high-potential video ideas based on my recent performance.",
  Icon: Lightbulb,
  color: "#D074FF",
  shadow: "rgba(208,116,255,0.55)",
 },
 {
  label: "Thumbnail Test",
  q: "What thumbnail concepts should I A/B test next and why?",
  Icon: Image,
  color: "#FF83EA",
  shadow: "rgba(255,131,234,0.55)",
 },
 {
  label: "Weekly Plan",
  q: "Build a simple 7-day action plan to increase views and subscribers this week.",
  Icon: CalendarClock,
  color: "#FFB570",
  shadow: "rgba(255,181,112,0.55)",
 },
 {
  label: "Community Boost",
  q: "What community posts should I publish this week to improve engagement?",
  Icon: MessagesSquare,
  color: "#FFE35C",
  shadow: "rgba(255,227,92,0.55)",
 },
 {
  label: "Revenue Levers",
  q: "What are my fastest practical revenue improvements over the next 30 days?",
  Icon: HandCoins,
  color: "#C9F830",
  shadow: "rgba(201,248,48,0.55)",
 },
]

export const AskMeWidget = ({ widget, instance, editMode, onToggleCollapse, onCycleSize, onDecSize, onCycleHeight, onDecHeight, onRemove, data }: any) => {
 const common = {
  widget,
  instance,
  editMode,
  canEdit: true,
  onToggleCollapse,
  onCycleSize,
  onRemove,
  onDecSize,
  onCycleHeight,
  onDecHeight,
 }
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
  scrollRef.current?.scrollTo({top: scrollRef.current.scrollHeight, behavior: "smooth", onDecSize, onCycleHeight, onDecHeight})
 }, [messages])

 useEffect(() => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-50)))
 }, [messages])

 const buildContext = () => {
  const stats = data.statBlocks28d?.map((s: any) => `${s.label}: ${s.value}`).join(", ") || "No stats"
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
     <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <span style={{ fontSize: "9px", fontWeight: 900, textTransform: "uppercase", opacity: 0.4 }}>Quick Topics</span>
      <div
       style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "6px",
       }}>
       {QUICK_TOPICS.map((t, i) => (
        <button
         key={i}
         onClick={() => handleSend(t.q)}
         disabled={!canAffordAsk}
         className="vt-button"
         style={{
          padding: "7px 8px",
          fontSize: "10px",
          fontWeight: 900,
          textAlign: "left",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: t.color,
          color: "#3f3f3f",
          border: "none",
          boxShadow: `2px 2px 0 0 ${t.shadow}`,
         }}>
         <t.Icon size={13} />
         <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.label}</span>
        </button>
       ))}
      </div>
      {!canAffordAsk && (
       <div style={{ fontSize: "9px", fontWeight: 900, textTransform: "uppercase", opacity: 0.6 }}>
        {entitlement.tier === "free" ? "Upgrade for AskMe AI." : `Need ${ASK_COST} credits.`}
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
      }}>
       {msg.role === "user" ? (
         <div style={{ whiteSpace: "pre-wrap" }}>{msg.text}</div>
       ) : (
         <FormattedMessage text={msg.text} />
       )}
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
    <div style={{ display: "flex", gap: "6px", paddingTop: "8px" }}>
     {messages.length > 0 && (
      <button onClick={clearHistory} title="Clear history" className="vt-button" style={{ width: "36px", height: "36px", padding: 0, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
       <Trash2 size={14} opacity={0.5} />
      </button>
     )}
     <textarea
      className="vt-textarea"
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() } }}
      placeholder="Ask anything about your channel..."
      rows={3}
      style={{ flex: 1, minHeight: "88px", padding: "10px 12px", resize: "none" }}
     />
     <button
      onClick={() => handleSend()}
      disabled={isThinking || !input.trim() || !canAffordAsk}
      title={!canAffordAsk ? (entitlement.tier === "free" ? "Upgrade required for AI." : `Need ${ASK_COST} credits.`) : `Ask AI (${ASK_COST}C)`}
      className="vt-button primary"
      style={{
       width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center",
       cursor: isThinking ? "wait" : "pointer", flexShrink: 0, padding: 0,
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
 const stats = data.statBlocks28d || []
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
