import React, { useState } from "react"
import { CheckSquare, Plus, Sparkles, Target } from "lucide-react"
import { SubToolbox } from "../Toolbox"
import { SubToolboxGrid, SubToolboxSection, SubToolboxStack } from "../subtoolbox/SubToolboxLayouts"
import {
  SubToolboxBadge,
  SubToolboxButton,
  SubToolboxInput,
  SubToolboxStatePanel,
  SubToolboxSurface,
} from "../subtoolbox/SubToolboxPrimitives"
import { useBrain } from "../../context/useBrain"
import {
  generateChannelPlanningSuggestions,
  type ChannelPlanningKind,
  type ChannelPlanningSuggestion,
} from "../../services/channelPlanningIntelligence"

type ChannelItem = { id: string; text: string; completed?: boolean; category?: string }

const ChannelPlanningList: React.FC<{ kind: ChannelPlanningKind }> = ({ kind }) => {
  const { brain, setChannelHub } = useBrain()
  const isTodo = kind === "todo"
  const items: ChannelItem[] = Array.isArray(isTodo ? brain.channelHub?.toDos : brain.channelHub?.goals)
    ? (isTodo ? brain.channelHub?.toDos : brain.channelHub?.goals)
    : []
  const [draft, setDraft] = useState("")
  const [suggestions, setSuggestions] = useState<ChannelPlanningSuggestion[]>([])
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState("")

  const saveItems = (next: ChannelItem[]) => setChannelHub(isTodo ? { toDos: next } : { goals: next })
  const addText = (text: string, category = "Growth") => {
    const value = text.trim()
    if (!value) return
    saveItems([...items, { id: `${isTodo ? "ct" : "cg"}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, text: value, completed: false, ...(isTodo ? {} : { category }) }])
    setDraft("")
  }
  const toggle = (id: string) => saveItems(items.map((item) => item.id === id ? { ...item, completed: !item.completed } : item))

  const generate = async () => {
    setGenerating(true)
    setError("")
    try {
      setSuggestions(await generateChannelPlanningSuggestions(kind, brain))
    } catch (cause) {
      console.error(`Failed to generate channel ${kind} suggestions`, cause)
      setError("AI Brain planning could not complete. Check the AI connection and try again.")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <SubToolbox
      title={isTodo ? "CHANNEL TO-DO LIST" : "CHANNEL GOALS"}
      subtitle={isTodo ? "Actionable next steps grounded in your channel profile and AI Brain" : "Measurable channel outcomes grounded in your channel profile and AI Brain"}
      icon={isTodo ? <CheckSquare /> : <Target />}
      paletteIndex={isTodo ? 0 : 4}
      collapsible
      isOpenInitial
      openUnits={4}
    >
      <SubToolboxStack density="comfortable">
        <SubToolboxSection label={isTodo ? "Add channel task" : "Add channel goal"}>
          <SubToolboxGrid minItemWidth="wide" density="dense">
            <SubToolboxInput
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => { if (event.key === "Enter") addText(draft) }}
              placeholder={isTodo ? "Add a channel task…" : "Add a measurable channel goal…"}
              aria-label={isTodo ? "New channel task" : "New channel goal"}
            />
            <SubToolboxButton tone="ink" icon={<Plus size={16} />} onClick={() => addText(draft)}>Add</SubToolboxButton>
          </SubToolboxGrid>
        </SubToolboxSection>

        <SubToolboxSection label={isTodo ? "Current tasks" : "Current goals"}>
          {items.length ? (
            <SubToolboxStack density="dense">
              {items.map((item) => (
                <SubToolboxSurface key={item.id} tone="subtle">
                  <button type="button" onClick={() => toggle(item.id)} className="flex w-full items-center justify-between gap-3 text-left">
                    <span className={`text-[12px] font-black uppercase ${item.completed ? "line-through opacity-40" : ""}`}>{item.text}</span>
                    <span className="flex shrink-0 items-center gap-2">
                      {!isTodo && item.category ? <SubToolboxBadge>{item.category}</SubToolboxBadge> : null}
                      <span aria-hidden="true">{item.completed ? "✓" : "○"}</span>
                    </span>
                  </button>
                </SubToolboxSurface>
              ))}
            </SubToolboxStack>
          ) : <SubToolboxStatePanel state="empty" title={isTodo ? "No channel tasks" : "No channel goals"} description={isTodo ? "Add one manually or generate channel-specific actions from the AI Brain." : "Add one manually or generate measurable goals from the AI Brain."} />}
        </SubToolboxSection>

        <SubToolboxSection label="AI Brain suggestions">
          <SubToolboxStack density="dense">
            <SubToolboxButton tone="accent" icon={<Sparkles size={16} />} loading={generating} disabled={generating} onClick={generate}>
              {generating ? "Consulting AI Brain" : isTodo ? "Generate channel tasks" : "Generate channel goals"}
            </SubToolboxButton>
            {error ? <SubToolboxStatePanel state="error" title="Generation unavailable" description={error} /> : null}
            {suggestions.map((suggestion, index) => (
              <SubToolboxSurface key={`${suggestion.text}-${index}`} tone="accent">
                <SubToolboxStack density="dense">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <strong className="text-[12px] font-black uppercase">{suggestion.text}</strong>
                    <SubToolboxBadge>{suggestion.category}</SubToolboxBadge>
                  </div>
                  <p className="text-[10px] font-bold leading-snug">{suggestion.rationale}</p>
                  <p className="text-[9px] font-black uppercase opacity-50">Evidence: {suggestion.evidence}</p>
                  <SubToolboxButton size="compact" tone="neutral" icon={<Plus size={14} />} onClick={() => {
                    addText(suggestion.text, suggestion.category)
                    setSuggestions((current) => current.filter((_, itemIndex) => itemIndex !== index))
                  }}>Add suggestion</SubToolboxButton>
                </SubToolboxStack>
              </SubToolboxSurface>
            ))}
          </SubToolboxStack>
        </SubToolboxSection>
      </SubToolboxStack>
    </SubToolbox>
  )
}

export const ChannelPlanningSubtoolboxes: React.FC = () => (
  <SubToolboxGrid minItemWidth="wide" density="comfortable">
    <ChannelPlanningList kind="todo" />
    <ChannelPlanningList kind="goal" />
  </SubToolboxGrid>
)

export default ChannelPlanningSubtoolboxes
