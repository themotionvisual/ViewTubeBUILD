import React, { useMemo, useState } from "react"
import { CalendarDays, CheckSquare, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { useBrain } from "../../context/useBrain"
import { SubToolbox } from "../Toolbox"
import { SubToolboxGrid, SubToolboxSection, SubToolboxStack } from "../subtoolbox/SubToolboxLayouts"
import { SubToolboxBadge, SubToolboxButton, SubToolboxCheckbox, SubToolboxInput, SubToolboxStatePanel, SubToolboxSurface } from "../subtoolbox/SubToolboxPrimitives"

const dateKey = (date: Date) => {
 const year = date.getFullYear()
 const month = String(date.getMonth() + 1).padStart(2, "0")
 const day = String(date.getDate()).padStart(2, "0")
 return `${year}-${month}-${day}`
}

const ProjectStudioDailyPlanner: React.FC = () => {
 const { brain, setCalendarState } = useBrain()
 const [selectedDate, setSelectedDate] = useState(() => new Date())
 const [draft, setDraft] = useState("")
 const key = dateKey(selectedDate)
 const dayTasks = brain.calendarState?.dayTasks || {}
 const tasks = dayTasks[key] || []
 const days = useMemo(() => Array.from({ length: 7 }, (_, index) => {
  const date = new Date(selectedDate)
  date.setDate(selectedDate.getDate() + index - 3)
  return date
 }), [selectedDate])
 const save = (next: typeof tasks) => setCalendarState({ dayTasks: { ...dayTasks, [key]: next } })
 const addTask = () => {
  const text = draft.trim()
  if (!text) return
  save([...tasks, { id: `day-${Date.now()}`, text, completed: false, dueDate: key }])
  setDraft("")
 }
 const moveDay = (amount: number) => setSelectedDate(current => { const next = new Date(current); next.setDate(next.getDate() + amount); return next })
 return <SubToolbox title="DAILY PLANNER" subtitle="Shared channel calendar tasks for production and publishing" icon={<CalendarDays />} paletteIndex={5} collapsible isOpenInitial openUnits={5}>
  <SubToolboxStack density="comfortable">
   <SubToolboxSection label="Calendar">
    <SubToolboxGrid minItemWidth="compact" density="dense">
     <SubToolboxButton tone="neutral" icon={<ChevronLeft size={14}/>} onClick={() => moveDay(-7)}>Previous</SubToolboxButton>
     <SubToolboxSurface tone="accent"><div className="flex items-center justify-between gap-2"><strong className="text-[12px] font-black uppercase">{selectedDate.toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"})}</strong><SubToolboxBadge>{tasks.length} tasks</SubToolboxBadge></div></SubToolboxSurface>
     <SubToolboxButton tone="neutral" icon={<ChevronRight size={14}/>} onClick={() => moveDay(7)}>Next</SubToolboxButton>
    </SubToolboxGrid>
    <SubToolboxGrid minItemWidth="compact" density="dense">{days.map(date => { const itemKey=dateKey(date); const count=(dayTasks[itemKey]||[]).length; return <SubToolboxButton key={itemKey} tone={itemKey===key?"accent":"neutral"} selected={itemKey===key} onClick={()=>setSelectedDate(date)}>{date.toLocaleDateString(undefined,{weekday:"short"})} {date.getDate()} · {count}</SubToolboxButton> })}</SubToolboxGrid>
   </SubToolboxSection>
   <SubToolboxSection label="Add daily task">
    <SubToolboxGrid minItemWidth="wide" density="dense"><SubToolboxInput value={draft} onChange={event=>setDraft(event.target.value)} onKeyDown={event=>{if(event.key==="Enter")addTask()}} placeholder="Add a task for this day…" aria-label="Daily task"/><SubToolboxButton tone="ink" icon={<Plus size={14}/>} onClick={addTask}>Add task</SubToolboxButton></SubToolboxGrid>
   </SubToolboxSection>
   <SubToolboxSection label="Tasks">
    {tasks.length?<SubToolboxStack density="dense">{tasks.map(task=><SubToolboxSurface key={task.id} tone="subtle"><SubToolboxCheckbox checked={task.completed} onChange={()=>save(tasks.map(item=>item.id===task.id?{...item,completed:!item.completed}:item))} label={<span className={task.completed?"line-through opacity-40":""}>{task.text}</span>}/></SubToolboxSurface>)}</SubToolboxStack>:<SubToolboxStatePanel state="empty" message="No tasks scheduled for this day."/>}
   </SubToolboxSection>
  </SubToolboxStack>
 </SubToolbox>
}
export default ProjectStudioDailyPlanner
