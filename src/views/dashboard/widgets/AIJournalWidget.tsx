import React, { useState, useEffect } from "react"
import { WidgetShell } from "../WidgetShell"
import { BookOpen, Send, Sparkles, Zap, Check, X, MessageSquare, Plus } from "lucide-react"
import { useBrain } from "../../../context/useBrain"
import { generateJournalFollowUps, generateInfiniteMicroPolls } from "../../../services/gemini"

const CATEGORIES = [
  { id: "site", label: "Site", color: "#4FFF5B" },
  { id: "self", label: "Self", color: "#FF83EA" },
  { id: "content", label: "Content", color: "#00D2FF" },
  { id: "style", label: "Style", color: "#FFE357" },
  { id: "goals", label: "Goals", color: "#FF3399" },
  { id: "community", label: "Community", color: "#FFB570" },
  { id: "plans", label: "Plans", color: "#B191FF" },
  { id: "projects", label: "Projects", color: "#70FFCB" },
]

export const AIJournalWidget: React.FC<any> = ({widget, instance, editMode, onToggleCollapse, onCycleSize, onRemove, onDecSize, onCycleHeight, onDecHeight}) => {
  const { brain, addJournalEntry, addFollowUp, answerFollowUp, answerMicroPoll, setMicroPolls } = useBrain()
  const [content, setContent] = useState("")
  const [category, setCategory] = useState<any>("content")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGeneratingPulse, setIsGeneratingPulse] = useState(false)

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

  // Generate initial micro-polls if empty
  useEffect(() => {
    if (brain.microPolls.length === 0 && !isGeneratingPulse) {
      refreshPulse()
    }
  }, [brain.microPolls.length])

  const refreshPulse = async () => {
    setIsGeneratingPulse(true)
    try {
      const polls = await generateInfiniteMicroPolls(brain)
      setMicroPolls(polls)
    } finally {
      setIsGeneratingPulse(false)
    }
  }

  const handleSubmit = async () => {
    if (!content.trim()) return
    setIsSubmitting(true)
    try {
      const entry = addJournalEntry(content, category)
      setContent("")
      
      // Generate follow-ups
      const questions = await generateJournalFollowUps(content, brain)
      questions.forEach(q => addFollowUp(entry.id, q))
      
      // Refresh pulse while we're at it to stay fresh
      refreshPulse()
    } finally {
      setIsSubmitting(false)
    }
  }

  const pendingFollowUps = (brain.journalFollowUps || []).filter(f => !f.answer).slice(0, 3)
  const pendingPolls = (brain.microPolls || []).filter(p => !p.answer).slice(0, 5)

  return (
    <WidgetShell {...common} icon={<BookOpen size={20} />}>
      <div className="flex flex-col gap-4" style={{ height: "100%", overflowY: "auto" }}>
        {/* ENTRY SECTION */}
        <div className="flex flex-col gap-2">
          <div className="vt-tab-group" style={{ flexWrap: "wrap", padding: 0 }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`vt-tab-btn ${category === cat.id ? 'active' : ''}`}
                style={{ 
                  backgroundColor: category === cat.id ? cat.color : undefined,
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
          
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind? Visions, goals, style updates..."
              className="vt-input"
              style={{ width: "100%", height: "96px", resize: "none", padding: "12px", paddingBottom: "40px" }}
            />
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !content.trim()}
              className="vt-button primary absolute bottom-2 right-2"
              style={{ width: "32px", height: "32px", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <Send size={14} />
            </button>
          </div>
        </div>

        {/* REFLECTIONS (FOLLOW-UPS) */}
        {pendingFollowUps.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-[#B191FF]" />
              <span className="text-[10px] font-black uppercase tracking-wider text-[#B191FF]">Reflections</span>
            </div>
            <div className="flex flex-col gap-2">
              {pendingFollowUps.map(f => (
                <div key={f.id} className="bg-[#B191FF15] border-2 border-[#B191FF] border-dashed rounded-xl p-3 flex flex-col gap-2">
                  <div className="text-[11px] font-extrabold leading-tight">{f.question}</div>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      className="vt-input flex-1"
                      style={{ padding: "4px 8px", fontSize: "10px", minHeight: "28px" }}
                      placeholder="Optional reply..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          answerFollowUp(f.id, (e.target as HTMLInputElement).value)
                        }
                      }}
                    />
                    <button 
                      onClick={(e) => {
                        const input = (e.currentTarget.previousSibling as HTMLInputElement)
                        answerFollowUp(f.id, input.value || "Acknowledged")
                      }}
                      className="vt-button primary flex-shrink-0"
                      style={{ width: "28px", height: "28px", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* THE PULSE (MICRO-POLLS) */}
        <div className="flex flex-col gap-2 mt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-[#FFB570]" />
              <span className="text-[10px] font-black uppercase tracking-wider text-[#FFB570]">The Pulse</span>
            </div>
            {isGeneratingPulse && <div className="text-[8px] font-black animate-pulse uppercase">Syncing...</div>}
          </div>
          
          <div className="flex flex-col gap-1.5">
            {pendingPolls.map(p => (
              <div key={p.id} className="group bg-white border-2 border-black rounded-xl p-2 flex items-center justify-between hover:shadow-[2px_2px_0px_0px_#000] transition-all">
                <div className="text-[10px] font-black leading-tight flex-1 pr-2">{p.question}</div>
                <div className="flex gap-1">
                  {p.type === 'binary' ? (
                    <>
                      <button 
                        onClick={() => answerMicroPoll(p.id, "Yes")}
                        className="h-6 px-2 bg-[#4FFF5B] border-2 border-black rounded-md text-[9px] font-black shadow-[1px_1px_0px_0px_#000] hover:translate-y-[0.5px] hover:shadow-none"
                      >
                        YES
                      </button>
                      <button 
                        onClick={() => answerMicroPoll(p.id, "No")}
                        className="h-6 px-2 bg-[#FF3399] border-2 border-black rounded-md text-[9px] font-black shadow-[1px_1px_0px_0px_#000] hover:translate-y-[0.5px] hover:shadow-none"
                      >
                        NO
                      </button>
                    </>
                  ) : (
                    <div className="flex gap-1 items-center">
                      <input 
                        type="text" 
                        placeholder="..."
                        className="w-16 h-6 border-2 border-black rounded-md px-1 text-[9px] font-bold outline-none"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') answerMicroPoll(p.id, (e.target as HTMLInputElement).value)
                        }}
                      />
                      <button 
                         onClick={() => answerMicroPoll(p.id, "Answered")}
                         className="h-6 w-6 bg-black text-white rounded-md flex items-center justify-center"
                      >
                        <Check size={10} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {pendingPolls.length === 0 && !isGeneratingPulse && (
              <button 
                onClick={refreshPulse}
                className="w-full py-2 border-2 border-black border-dashed rounded-xl text-[9px] font-black uppercase opacity-40 hover:opacity-100 transition-all"
              >
                Refill the Pulse
              </button>
            )}
          </div>
        </div>
      </div>
    </WidgetShell>
  )
}
