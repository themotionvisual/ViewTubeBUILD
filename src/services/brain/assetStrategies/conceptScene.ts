import { Type, type Schema } from "@google/genai"
import type { AssetGeneratorStrategy, AssetRequest, RubricFinding } from "../AssetGenerator"

export interface GovernedConceptDirection {
 id: string
 label: string
 angle: string
 hook: string
 viewerPromise: string
 visualLanguage: string
 narrativeShape: string
 proofPlan: string
 risk: string
 readiness: number
}

export interface ConceptForgeOutput {
 concepts: GovernedConceptDirection[]
 notes: string[]
}

export interface GovernedScenePlanItem {
 id: string
 role: string
 title: string
 purpose: string
 narration: string
 visualDirection: string
 shot: string
 camera: string
 visualPrompt: string
 assetNeeds: string[]
 motionBrief: string
 durationSeconds: number
 transition: string
 continuity: string
}

export interface ScenePlanOutput {
 scenes: GovernedScenePlanItem[]
 notes: string[]
}

const conceptSchema: Schema = {
 type: Type.OBJECT,
 properties: {
  concepts: {
   type: Type.ARRAY,
   items: {
    type: Type.OBJECT,
    properties: {
     id: { type: Type.STRING },
     label: { type: Type.STRING },
     angle: { type: Type.STRING },
     hook: { type: Type.STRING },
     viewerPromise: { type: Type.STRING },
     visualLanguage: { type: Type.STRING },
     narrativeShape: { type: Type.STRING },
     proofPlan: { type: Type.STRING },
     risk: { type: Type.STRING },
     readiness: { type: Type.NUMBER },
    },
    required: ["id","label","angle","hook","viewerPromise","visualLanguage","narrativeShape","proofPlan","risk","readiness"],
   },
  },
  notes: { type: Type.ARRAY, items: { type: Type.STRING } },
 },
 required: ["concepts","notes"],
}

const sceneSchema: Schema = {
 type: Type.OBJECT,
 properties: {
  scenes: {
   type: Type.ARRAY,
   items: {
    type: Type.OBJECT,
    properties: {
     id: { type: Type.STRING },
     role: { type: Type.STRING },
     title: { type: Type.STRING },
     purpose: { type: Type.STRING },
     narration: { type: Type.STRING },
     visualDirection: { type: Type.STRING },
     shot: { type: Type.STRING },
     camera: { type: Type.STRING },
     visualPrompt: { type: Type.STRING },
     assetNeeds: { type: Type.ARRAY, items: { type: Type.STRING } },
     motionBrief: { type: Type.STRING },
     durationSeconds: { type: Type.NUMBER },
     transition: { type: Type.STRING },
     continuity: { type: Type.STRING },
    },
    required: ["id","role","title","purpose","narration","visualDirection","shot","camera","visualPrompt","assetNeeds","motionBrief","durationSeconds","transition","continuity"],
   },
  },
  notes: { type: Type.ARRAY, items: { type: Type.STRING } },
 },
 required: ["scenes","notes"],
}

const textInput = (request: AssetRequest, key: string) => {
 const value = request.inputs?.[key]
 return value == null ? "" : typeof value === "string" ? value : JSON.stringify(value, null, 2)
}

export const conceptDirectionStrategy: AssetGeneratorStrategy<ConceptForgeOutput> = {
 assetType: "concept_direction",
 promptVersion: "concept-direction-v1",
 evidenceClasses: ["channel_profile", "top_videos"],
 schema: conceptSchema,
 buildTaskInstruction: (request, evidence) => [
  "Forge exactly three genuinely different creative directions for one YouTube video.",
  "Do not return three phrasings of the same angle. Each direction needs a different storytelling mechanism.",
  "For each direction provide a short production label, angle, opening hook, viewer promise, visual language, narrative shape, proof plan, principal creative risk, and readiness from 0 to 100.",
  "The proof plan must respect the supplied evidence and creator constraints. Never invent a source, quote, statistic, or historical detail.",
  "Brief:",
  textInput(request, "brief"),
  evidence.missing.length ? "Evidence gaps must be acknowledged in notes rather than filled with plausible facts." : "",
 ].filter(Boolean).join("\n"),
 toGradeableText: output => (output.concepts || []).map(concept => [
  concept.angle, concept.hook, concept.viewerPromise, concept.visualLanguage,
  concept.narrativeShape, concept.proofPlan, concept.risk,
 ].join("\n")).join("\n\n"),
 rubric: output => {
  const findings: RubricFinding[] = []
  const concepts = output.concepts || []
  if (concepts.length !== 3) findings.push({ rule:"concept_count", detail:"Return exactly three concept directions.", severity:"blocking" })
  const normalizedAngles = concepts.map(concept => concept.angle?.trim().toLowerCase()).filter(Boolean)
  if (new Set(normalizedAngles).size !== normalizedAngles.length) findings.push({ rule:"distinct_angles", detail:"Every concept needs a genuinely distinct angle.", severity:"blocking" })
  for (const [index, concept] of concepts.entries()) {
   const required = [concept.label,concept.angle,concept.hook,concept.viewerPromise,concept.visualLanguage,concept.narrativeShape,concept.proofPlan,concept.risk]
   if (required.some(value => !value?.trim())) findings.push({ rule:"concept_completeness", detail:`Concept ${index + 1} is missing production fields.`, severity:"blocking" })
   if (!Number.isFinite(concept.readiness) || concept.readiness < 0 || concept.readiness > 100) findings.push({ rule:"readiness_range", detail:`Concept ${index + 1} readiness must be 0–100.`, severity:"blocking" })
  }
  return findings
 },
}

const requestedSceneCount = (request: AssetRequest) => {
 const value = Number(request.inputs?.sceneCount)
 return Number.isFinite(value) ? Math.max(3, Math.min(12, Math.round(value))) : 6
}

export const scenePlanStrategy: AssetGeneratorStrategy<ScenePlanOutput> = {
 assetType: "scene_plan",
 promptVersion: "scene-plan-v1",
 evidenceClasses: ["channel_profile", "top_videos"],
 schema: sceneSchema,
 buildTaskInstruction: (request, evidence) => {
  const count = requestedSceneCount(request)
  return [
   `Turn the selected concept into exactly ${count} production scenes.`,
   "Scene 1 must function as HOOK. The final scene must function as PAYOFF.",
   "Every scene must state purpose, narration, visual direction, shot, camera, a usable visual-generation prompt, required assets, a motion brief, duration in seconds, transition, and continuity rule.",
   "Use supplied script beats as structural source material when present. Preserve their order unless a different order is explicitly justified in notes.",
   "Asset needs must name concrete production inputs. Motion briefs must describe movement/animation rather than repeat the camera field.",
   "Brief:",
   textInput(request, "brief"),
   "Selected concept:",
   textInput(request, "selectedConcept"),
   "Script beats:",
   textInput(request, "scriptBeats") || "No script beats supplied.",
   evidence.missing.length ? "Do not invent missing channel evidence." : "",
  ].filter(Boolean).join("\n")
 },
 toGradeableText: output => (output.scenes || []).map(scene => [scene.narration,scene.visualDirection,scene.visualPrompt,scene.motionBrief].join("\n")).join("\n\n"),
 rubric: (output, request) => {
  const findings: RubricFinding[] = []
  const scenes = output.scenes || []
  const count = requestedSceneCount(request)
  if (scenes.length !== count) findings.push({ rule:"scene_count", detail:`Return exactly ${count} scenes.`, severity:"blocking" })
  if (scenes.length && scenes[0].role !== "HOOK") findings.push({ rule:"opening_role", detail:"The first scene must be the HOOK.", severity:"blocking" })
  if (scenes.length && scenes[scenes.length - 1].role !== "PAYOFF") findings.push({ rule:"closing_role", detail:"The final scene must be the PAYOFF.", severity:"blocking" })
  for (const [index, scene] of scenes.entries()) {
   const required = [scene.title,scene.purpose,scene.narration,scene.visualDirection,scene.shot,scene.camera,scene.visualPrompt,scene.motionBrief,scene.transition,scene.continuity]
   if (required.some(value => !value?.trim()) || !(scene.assetNeeds || []).length) findings.push({ rule:"scene_completeness", detail:`Scene ${index + 1} is missing production fields or asset needs.`, severity:"blocking" })
   if (!Number.isFinite(scene.durationSeconds) || scene.durationSeconds <= 0) findings.push({ rule:"scene_duration", detail:`Scene ${index + 1} needs a positive duration.`, severity:"blocking" })
  }
  return findings
 },
}
