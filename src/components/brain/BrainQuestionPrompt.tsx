import React, { useState } from "react"
import { ArrowRight } from "lucide-react"
import type { CreatorBrainLearningQuestion } from "../../types"
import { sanitizeCreatorFacingBrainCopy } from "../../services/aiBrainConversationStore"

/**
 * Default one-tap options per question category. A tappable chip gets answered far
 * more often than an empty textarea, and every answer feeds Brain memory.
 */
const CATEGORY_OPTIONS: Partial<Record<CreatorBrainLearningQuestion["category"], string[]>> = {
 creator_goal: ["Views", "Subscribers", "Revenue", "Watch time", "Consistency", "Better workflow"],
 content_style: ["Practical", "Cinematic", "Funny", "Premium", "Fast", "Calm"],
 audience_insight: ["Beginners", "Enthusiasts", "Professionals", "Mixed"],
}

export const optionsForQuestion = (
 question: CreatorBrainLearningQuestion,
 dynamicOptions: string[] = [],
): string[] => {
 if (dynamicOptions.length) return dynamicOptions.slice(0, 6)
 return CATEGORY_OPTIONS[question.category] || []
}

const labelForQuestion = (question: CreatorBrainLearningQuestion): string => {
 if (question.category === "creator_goal") return "Goal check"
 if (question.category === "content_style") return "Content style"
 if (question.category === "audience_insight") return "Audience fit"
 if (question.category === "analytics_insight") return "Growth signal"
 return "Confirm direction"
}

export const BrainQuestionPrompt: React.FC<{
 question: CreatorBrainLearningQuestion
 dynamicOptions?: string[]
 onAnswer: (question: CreatorBrainLearningQuestion, answer: string) => void
 compact?: boolean
}> = ({ question, dynamicOptions = [], onAnswer, compact = false }) => {
 const [freeText, setFreeText] = useState("")
 const options = optionsForQuestion(question, dynamicOptions)
 const displayQuestion = question.category === "creator_goal"
  ? "What result matters most this month?"
  : sanitizeCreatorFacingBrainCopy(question.question)

 return (
  <section className="overflow-hidden rounded-[10px] border-[2px] border-black bg-white">
   <div className={`border-b-[2px] border-black bg-[#FFDA47] px-3 ${compact ? "py-1" : "py-2"}`}>
    <h4 className="text-[11px] font-[1000] uppercase leading-4 tracking-[0.04em]">{labelForQuestion(question)}</h4>
   </div>
   <div className={`grid ${compact ? "gap-1.5 p-2" : "gap-2.5 p-3"}`}>
    <p className={`font-black leading-5 ${compact ? "text-xs" : "text-sm"}`}>
     {displayQuestion}
    </p>

    {options.length ? (
     <div className="flex flex-wrap gap-1.5">
      {options.map((option) => (
       <button
        key={option}
        type="button"
        onClick={() => onAnswer(question, option)}
        className={`rounded-[8px] border-[2px] border-black bg-white text-[10px] font-black uppercase tracking-[0.06em] hover:bg-[#3FEE56] ${compact ? "px-2 py-0.5" : "px-2.5 py-1"}`}
       >
        {option}
       </button>
      ))}
     </div>
    ) : null}

    <div className="flex gap-2">
     <input
      type="text"
      value={freeText}
      onChange={(event) => setFreeText(event.target.value)}
      onKeyDown={(event) => {
       if (event.key === "Enter" && freeText.trim()) {
        onAnswer(question, freeText.trim())
        setFreeText("")
       }
      }}
      placeholder={options.length ? "Or say it your way..." : "Type your answer..."}
      aria-label={sanitizeCreatorFacingBrainCopy(question.question)}
      className={`min-w-0 flex-1 rounded-[8px] border-[2px] border-black bg-white px-2.5 text-xs font-bold outline-none focus:bg-[#FFDA47]/25 ${compact ? "py-1" : "py-1.5"}`}
     />
     <button
      type="button"
      disabled={!freeText.trim()}
      onClick={() => {
       if (!freeText.trim()) return
       onAnswer(question, freeText.trim())
       setFreeText("")
      }}
      className={`inline-flex shrink-0 items-center gap-1 rounded-[8px] border-[2px] border-black bg-[#3FEE56] px-2.5 text-[10px] font-black uppercase disabled:opacity-40 ${compact ? "py-1" : "py-1.5"}`}
     >
      Save
      <ArrowRight size={12} />
     </button>
    </div>
   </div>
  </section>
 )
}

export default BrainQuestionPrompt
