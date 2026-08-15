import React, { useState } from "react"
import { WidgetShell } from "../WidgetShell"
import { WidgetScrollArea, WidgetSection } from "../WidgetPrimitives"
import { BookOpen, Send, Sparkles, Zap, Check, Plus } from "lucide-react"
import { useBrain } from "../../../context/useBrain"
import {
  generateJournalFollowUps,
  generateInfiniteMicroPolls,
  isGeminiConfigured,
} from "../../../services/gemini"

const CATEGORIES = [
  { id: "site", label: "Site" },
  { id: "self", label: "Self" },
  { id: "content", label: "Content" },
  { id: "style", label: "Style" },
  { id: "goals", label: "Goals" },
  { id: "community", label: "Community" },
  { id: "plans", label: "Plans" },
  { id: "projects", label: "Projects" },
]

export const AIJournalWidget: React.FC<any> = ({widget, instance, editMode, onToggleCollapse, onCycleSize, onRemove, onDecSize, onCycleHeight, onDecHeight}) => {
  const { brain, addJournalEntry, addFollowUp, answerFollowUp, answerMicroPoll, setMicroPolls } = useBrain()
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("content")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGeneratingPulse, setIsGeneratingPulse] = useState(false)
  const geminiReady = isGeminiConfigured()

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

  const refreshPulse = async () => {
    if (!geminiReady) return
    setIsGeneratingPulse(true)
    try {
      const polls = await generateInfiniteMicroPolls(brain)
      setMicroPolls(polls)
    } catch (error) {
      console.warn("[AIJournalWidget] Pulse generation skipped:", error)
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
      const questions = geminiReady ? await generateJournalFollowUps(content, brain) : []
      questions.forEach(q => addFollowUp(entry.id, q))
      
      // Refresh pulse while we're at it to stay fresh
      if (geminiReady) refreshPulse()
    } finally {
      setIsSubmitting(false)
    }
  }

  const pendingFollowUps = (brain.journalFollowUps || []).filter(f => !f.answer).slice(0, 3)
  const pendingPolls = (brain.microPolls || []).filter(p => !p.answer).slice(0, 5)

  return (
    <WidgetShell {...common} icon={<BookOpen size={20} />}>
      <WidgetScrollArea ariaLabel="AI journal" contentClassName="flex min-h-full flex-col gap-4">
        {/* ENTRY SECTION */}
        <WidgetSection className="ai-journal-entry-section">
          <div className="ai-journal-category-grid" role="group" aria-label="Journal category">
            {CATEGORIES.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                className={`vt-button ${category === id ? "primary" : ""}`.trim()}
                aria-pressed={category === id}
                onClick={() => setCategory(id)}
              >
                {label}
              </button>
            ))}
          </div>
          
          <div className="ai-journal-composer">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind? Visions, goals, style updates..."
              className="vt-textarea ai-journal-textarea"
            />
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !content.trim()}
              className="vt-button primary ai-journal-submit"
            >
              <Send size={14} />
              Save entry
            </button>
          </div>
        </WidgetSection>

        {/* REFLECTIONS (FOLLOW-UPS) */}
        {!geminiReady && (
          <div className="widget-state-panel is-blocked ai-journal-state">
            Gemini key missing. Add it in Settings - Key Vault to enable AI journal generation.
          </div>
        )}
        {pendingFollowUps.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-[#B191FF]" />
              <span className="text-[10px] font-black uppercase tracking-wider text-[#B191FF]">Reflections</span>
            </div>
            <div className="flex flex-col gap-2">
              {pendingFollowUps.map(f => (
                <div key={f.id} className="ai-journal-card">
                  <div className="text-[11px] font-extrabold leading-tight">{f.question}</div>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      className="vt-input flex-1"
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
                      className="vt-button primary is-icon-only flex-shrink-0"
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
              <div key={p.id} className="ai-journal-card is-poll">
                <div className="text-[10px] font-black leading-tight flex-1 pr-2">{p.question}</div>
                <div className="flex gap-1">
                  {p.type === 'binary' ? (
                    <>
                      <button 
                        onClick={() => answerMicroPoll(p.id, "Yes")}
                        className="vt-button"
                      >
                        YES
                      </button>
                      <button 
                        onClick={() => answerMicroPoll(p.id, "No")}
                        className="vt-button"
                      >
                        NO
                      </button>
                    </>
                  ) : (
                    <div className="flex gap-1 items-center">
                      <input 
                        type="text" 
                        placeholder="..."
                        className="vt-input ai-journal-poll-input"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') answerMicroPoll(p.id, (e.target as HTMLInputElement).value)
                        }}
                      />
                      <button 
                         onClick={() => answerMicroPoll(p.id, "Answered")}
                         className="vt-button primary is-icon-only"
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
                className="vt-button ai-journal-refill"
              >
                Refill the Pulse
              </button>
            )}
          </div>
        </div>
      </WidgetScrollArea>
    </WidgetShell>
  )
}
