import React from "react"
import { ArrowRight } from "lucide-react"
import type {
 BrainQuickAction,
 CreatorBrainLearningQuestion,
 CreatorGrowthContext,
 CreatorInitialInsight,
} from "../../types"
import type { AIBrainContextSnapshot } from "../../services/aiBrainCommandInterface"
import { sanitizeCreatorFacingBrainCopy } from "../../services/aiBrainConversationStore"
import { BrainQuestionPrompt } from "./BrainQuestionPrompt"
import { BrainQuickActionCard } from "./BrainAnswerModules"

const Panel: React.FC<{ title: string; tone: string; children: React.ReactNode }> = ({
 title,
 tone,
 children,
}) => (
 <section className="overflow-hidden rounded-[10px] border-[2px] border-black bg-white">
  <h3
   className="border-b-[2px] border-black px-3 py-1.5 text-[10px] font-[1000] uppercase leading-4 tracking-[0.1em]"
   style={{ backgroundColor: tone }}
  >
   {title}
  </h3>
  <div className="grid gap-2 p-2.5">{children}</div>
 </section>
)

/**
 * The ambient context rail.
 *
 * Never selected and never tabbed: it reflects whatever the Brain currently knows,
 * from the same snapshot the conversation uses. It deliberately holds no narrative
 * prose, because the conversation already owns that; duplicating the channel read in
 * both places is what previously made this surface feel repetitive and endless.
 */
export const BrainContextRail: React.FC<{
 snapshot: AIBrainContextSnapshot
 growthContext: CreatorGrowthContext
 insights: CreatorInitialInsight[]
 questions: CreatorBrainLearningQuestion[]
 quickActions: BrainQuickAction[]
 onAskInsight: (insight: CreatorInitialInsight) => void
 onAcceptQuickAction: (action: BrainQuickAction) => void
 onAnswerQuestion: (question: CreatorBrainLearningQuestion, answer: string) => void
}> = ({
 snapshot,
 growthContext,
 insights,
 questions,
 quickActions,
 onAskInsight,
 onAcceptQuickAction,
 onAnswerQuestion,
}) => {
 const goal = sanitizeCreatorFacingBrainCopy(growthContext.currentGoal)
 const clusters = snapshot.inferredProfile.topicClusters.slice(0, 5)
 const topQuestion = questions[0]
 const laneOptions = snapshot.inferredProfile.topicClusters.slice(0, 4)

 return (
  <aside className="grid content-start gap-2.5" aria-label="What the Brain currently knows">
   <Panel title="Your channel" tone="#3FEE56">
    {clusters.length ? (
     <ul className="flex flex-wrap gap-1">
      {clusters.map((cluster) => (
       <li
        key={cluster}
        className="rounded-[7px] border-[2px] border-black bg-[#36E0F6] px-1.5 py-0.5 text-[9px] font-black uppercase"
       >
        {cluster}
       </li>
      ))}
     </ul>
    ) : (
     <p className="text-[11px] font-bold leading-4 text-black/60">
      No channel evidence yet. Ask me anything and I'll work from what you tell me.
     </p>
    )}
    <p className="border-t-[2px] border-black/10 pt-2 text-[11px] font-bold leading-4 text-black/70">
     <span className="font-black uppercase tracking-[0.08em] text-black/45">Goal · </span>
     {goal || "Not set. Tell me what matters most this month."}
    </p>
   </Panel>

   {quickActions.length ? (
    <Panel title="Do this next" tone="#C0F240">
     {quickActions.slice(0, 1).map((action) => (
      <BrainQuickActionCard
       key={action.id}
       action={action}
       onAccept={onAcceptQuickAction}
       compact
      />
     ))}
    </Panel>
   ) : null}

   {!topQuestion && insights.length ? (
    <Panel title="Worth a look" tone="#FF7AC8">
     {insights.slice(0, 1).map((insight) => (
      <button
       key={insight.id}
       type="button"
       onClick={() => onAskInsight(insight)}
       className="group flex items-start justify-between gap-2 rounded-[8px] border-[2px] border-black bg-white px-2.5 py-2 text-left transition hover:bg-[#FFDA47]"
      >
       <span className="min-w-0">
        <span className="block text-[10px] font-[1000] uppercase leading-4">{insight.title}</span>
        <span className="mt-0.5 line-clamp-2 block text-[11px] font-bold leading-4 text-black/60">
         {sanitizeCreatorFacingBrainCopy(insight.modules[0]?.body || insight.reason)}
        </span>
       </span>
       <ArrowRight size={13} className="mt-0.5 shrink-0 transition group-hover:translate-x-0.5" />
      </button>
     ))}
    </Panel>
   ) : null}

   {topQuestion ? (
    <BrainQuestionPrompt
     question={topQuestion}
     dynamicOptions={topQuestion.category === "channel_fact" ? laneOptions : []}
     onAnswer={onAnswerQuestion}
     compact
    />
   ) : null}
  </aside>
 )
}

export default BrainContextRail
