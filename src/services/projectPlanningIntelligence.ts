import { getComplexAdvice } from "./gemini"
import type { Project, WorkspaceBrain } from "../types"

export type ProjectPlanningKind = "todo" | "goal"
export interface ProjectPlanningSuggestion { text: string; category: string; rationale: string; evidence: string }

const parse = (raw: string): ProjectPlanningSuggestion[] => {
 const match = raw.match(/\[[\s\S]*\]/)
 if (!match) return []
 try {
  const parsed = JSON.parse(match[0])
  return Array.isArray(parsed) ? parsed.filter(item => item?.text).slice(0, 8).map(item => ({ text:String(item.text), category:String(item.category||"Production"), rationale:String(item.rationale||"Project context"), evidence:String(item.evidence||"Project plan") })) : []
 } catch { return [] }
}

export const generateProjectPlanningSuggestions = async (kind: ProjectPlanningKind, project: Project, brain: WorkspaceBrain) => {
 const prompt = `Generate 5 ${kind === "todo" ? "actionable production tasks" : "measurable project goals"} for this specific ViewTube project.\nPROJECT: ${JSON.stringify({name:project.name,status:project.status,publishDate:project.publishDate,concept:project.concept,niche:project.niche,description:project.description,script:project.script,plan:project.plan,tasks:project.tasks,goals:project.plan?.projectGoals||[]})}\nCHANNEL CONTEXT: ${JSON.stringify({targetNiche:brain.targetNiche,channelProfile:brain.channelProfile})}\nReturn ONLY JSON array objects with text, category, rationale, evidence.`
 const raw = await getComplexAdvice(prompt, "Use the supplied project and channel context as authoritative. Keep every suggestion specific to this project. Return only JSON.")
 return parse(raw)
}
