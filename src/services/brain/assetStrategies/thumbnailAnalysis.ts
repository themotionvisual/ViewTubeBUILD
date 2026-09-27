import { Type, type Schema } from "@google/genai"
import type { AssetGeneratorStrategy, AssetRequest, RubricFinding } from "../AssetGenerator"

export interface GovernedThumbnailAnalysisOutput {
 concept: string
 subjects: string[]
 style: string
 composition: string
 visibleText: string
 visualHierarchy: string
 emotionalTone: string
 promiseAlignment: string
 notes: string[]
}

const schema: Schema = {
 type: Type.OBJECT,
 properties: {
  concept: { type: Type.STRING, description: "The central visual idea communicated by the thumbnail." },
  subjects: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Only subjects visibly present in the thumbnail." },
  style: { type: Type.STRING, description: "Visible visual style, treatment, lighting, color and rendering language." },
  composition: { type: Type.STRING, description: "Focal point, layout, depth, crop and spatial relationships." },
  visibleText: { type: Type.STRING, description: "Exact or best-readable visible overlay text. Empty when none is visible." },
  visualHierarchy: { type: Type.STRING, description: "What the eye sees first, second and third." },
  emotionalTone: { type: Type.STRING, description: "The emotional tone communicated by the visible image." },
  promiseAlignment: { type: Type.STRING, description: "How the visible thumbnail promise aligns with the supplied current title and video concept." },
  notes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Important visual observations or uncertainty boundaries." },
 },
 required: [
  "concept",
  "subjects",
  "style",
  "composition",
  "visibleText",
  "visualHierarchy",
  "emotionalTone",
  "promiseAlignment",
  "notes",
 ],
}

const textInput = (request: AssetRequest, key: string) => {
 const value = request.inputs?.[key]
 return value == null ? "" : typeof value === "string" ? value : JSON.stringify(value, null, 2)
}

export const thumbnailAnalysisStrategy: AssetGeneratorStrategy<GovernedThumbnailAnalysisOutput> = {
 assetType: "thumbnail_analysis",
 promptVersion: "thumbnail-analysis-v1",
 evidenceClasses: ["video_metadata"],
 schema,
 buildTaskInstruction: (request) => [
  "Inspect the attached current YouTube thumbnail as visual evidence.",
  "Describe only what is actually visible. Never invent a person, object, setting, text, emotion, historical detail, or design element that cannot be seen.",
  "Return the thumbnail's central concept, visible subjects, visual style, composition, readable overlay text, visual hierarchy and emotional tone.",
  "Compare the visible promise against the supplied current video metadata only for promise alignment; metadata is context, not permission to hallucinate visual details.",
  "If text is unreadable, say so in notes and leave visibleText empty rather than guessing.",
  "Current video title:",
  textInput(request, "title"),
  "Current description:",
  textInput(request, "description"),
  "Current tags:",
  textInput(request, "tags"),
 ].filter(Boolean).join("\n"),
 toGradeableText: output => [
  output.concept,
  ...(output.subjects || []),
  output.style,
  output.composition,
  output.visibleText,
  output.visualHierarchy,
  output.emotionalTone,
  output.promiseAlignment,
  ...(output.notes || []),
 ].filter(Boolean).join("\n"),
 rubric: output => {
  const findings: RubricFinding[] = []
  if (!output.concept?.trim()) findings.push({ rule: "concept", detail: "Identify the visible thumbnail concept.", severity: "blocking" })
  if (!output.style?.trim()) findings.push({ rule: "style", detail: "Describe the visible thumbnail style.", severity: "blocking" })
  if (!output.composition?.trim()) findings.push({ rule: "composition", detail: "Describe the visible thumbnail composition.", severity: "blocking" })
  if (!output.promiseAlignment?.trim()) findings.push({ rule: "promise_alignment", detail: "Compare the visible promise with the current metadata.", severity: "blocking" })
  return findings
 },
}
