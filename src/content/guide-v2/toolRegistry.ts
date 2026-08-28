import { SUPER_TOOLS } from "../../services/superToolRegistry"

export interface GuideToolDefinition {
 id: string
 title: string
 category: string
 summary: string
 routes: readonly string[]
 status: string
 visibility: string
 sourceOfTruth: string
}

export const GUIDE_TOOLS: readonly GuideToolDefinition[] = Object.freeze(
 SUPER_TOOLS.map((tool) => ({
  id: tool.id,
  title: tool.title,
  category: tool.category,
  summary: tool.summary,
  routes: tool.routes,
  status: tool.status,
  visibility: tool.visibility,
  sourceOfTruth: tool.sourceOfTruth,
 })),
)

export const guideToolById = (id: string) => GUIDE_TOOLS.find((tool) => tool.id === id) ?? null
