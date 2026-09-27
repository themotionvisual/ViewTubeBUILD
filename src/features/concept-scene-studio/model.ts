export type ConceptFormat = "Longform" | "Short" | "Series" | "Explainer" | "Documentary"
export type ConceptTone = "Tense / cinematic" | "Investigative" | "Intimate" | "Energetic" | "Reflective"

export interface ConceptBrief {
 idea: string
 audience: string
 promise: string
 objective: string
 format: string
 runtimeMinutes: number
 tone: string
 evidenceNotes: string
}

export interface ConceptDirection {
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

export type SceneRole = "HOOK" | "SETUP" | "PROOF" | "ESCALATION" | "PIVOT" | "PAYOFF"

export interface ProductionScene {
 id: string
 order: number
 role: SceneRole
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

const clean = (value: string, fallback: string) => value.trim() || fallback
const sentence = (value: string) => /[.!?]$/.test(value.trim()) ? value.trim() : `${value.trim()}.`

const directionTemplates = [
 {
  id: "reveal",
  label: "THE REVEAL",
  angle: (idea: string) => `Reveal the hidden mechanism inside ${idea}`,
  hook: (idea: string) => `Start with the outcome that should not have happened, then expose the decision that made ${idea} possible.`,
  visual: "Begin with a striking consequence, then move through evidence-rich close details, maps, documents, faces, and controlled cinematic reconstruction.",
  shape: "Cold open → apparent contradiction → evidence trail → decisive pivot → reconstructed payoff",
  proof: "Lead with the surprising result, establish what the viewer assumes, then reveal evidence in the order needed to overturn that assumption.",
  risk: "Do not reveal the core mechanism too early; every escalation beat must add new evidence.",
  readiness: 92,
 },
 {
  id: "eyewitness",
  label: "INSIDE THE MOMENT",
  angle: (idea: string) => `Experience ${idea} through the people forced to react in real time`,
  hook: (idea: string) => `Put the viewer inside the moment when ${idea} stops being an abstract plan and becomes an immediate human problem.`,
  visual: "Favor human-scale geography, point-of-view staging, period texture, tactile inserts, restrained camera movement, and spatial orientation before spectacle.",
  shape: "Human entry point → situational orientation → pressure rises → irreversible decision → aftermath",
  proof: "Use sourced eyewitness or primary-context evidence as anchors and clearly separate documented fact from visual reconstruction.",
  risk: "Atmosphere cannot outrun evidence; reconstructed moments must remain visibly grounded.",
  readiness: 89,
 },
 {
  id: "strategy",
  label: "THE DECISION MAP",
  angle: (idea: string) => `Break ${idea} into the sequence of choices, constraints, and consequences that actually drove it`,
  hook: (idea: string) => `Show the viewer the single decision point where ${idea} could still have gone another way—and why it did not.`,
  visual: "Alternate clean tactical diagrams, annotated geography, decision-tree graphics, archival references, and concise cinematic inserts that visualize consequences.",
  shape: "Question → constraints → option set → choice → chain reaction → lesson",
  proof: "Tie each major claim to a decision, constraint, source, or observable consequence so the explanation never becomes generic narration.",
  risk: "Avoid turning the piece into a lecture; each analytical beat needs a visible consequence.",
  readiness: 94,
 },
] as const

export const createConceptCandidates = (brief: ConceptBrief): ConceptDirection[] => {
 const idea = clean(brief.idea, "the creator's core idea")
 const promise = clean(brief.promise, `understand why ${idea} matters`)
 const viewerPromise = /understand/i.test(promise) ? sentence(promise) : `Understand ${sentence(promise).replace(/^./, c => c.toLowerCase())}`

 return directionTemplates.map(template => ({
  id: `concept-${template.id}`,
  label: template.label,
  angle: template.angle(idea),
  hook: template.hook(idea),
  viewerPromise,
  visualLanguage: template.visual,
  narrativeShape: template.shape,
  proofPlan: template.proof,
  risk: template.risk,
  readiness: template.readiness,
 }))
}

const rolesForCount = (count: number): SceneRole[] =>
 Array.from({ length: count }, (_, index) => {
  if (index === 0) return "HOOK"
  if (index === count - 1) return "PAYOFF"
  const progress = index / Math.max(1, count - 1)
  if (progress < 0.28) return "SETUP"
  if (progress < 0.52) return "PROOF"
  if (progress < 0.76) return "ESCALATION"
  return "PIVOT"
 })

const rolePurpose: Record<SceneRole, string> = {
 HOOK: "Create an immediate open loop and establish the click promise.",
 SETUP: "Orient the viewer without spending the tension created by the hook.",
 PROOF: "Introduce concrete evidence that advances the central claim.",
 ESCALATION: "Increase stakes, consequence, or contradiction with new information.",
 PIVOT: "Reframe what the viewer thinks is happening and point toward the resolution.",
 PAYOFF: "Resolve the promise and leave the viewer with the clearest durable insight.",
}

const roleCamera: Record<SceneRole, string> = {
 HOOK: "Fast push-in or decisive locked composition; one unmistakable focal subject.",
 SETUP: "Measured wide-to-medium geography with stable orientation.",
 PROOF: "Controlled inserts, macro details, document/map moves, restrained parallax.",
 ESCALATION: "Progressively tighter framing with motivated lateral or forward movement.",
 PIVOT: "Brief visual reset, wider reveal, then deliberate move toward the decisive detail.",
 PAYOFF: "Confident composed hero frame with a slower final move or hold.",
}

export const createScenesFromConcept = (
 concept: ConceptDirection,
 brief: ConceptBrief,
 requestedCount = 6,
): ProductionScene[] => {
 const count = Math.max(3, Math.min(12, Math.round(requestedCount)))
 const roles = rolesForCount(count)
 const totalSeconds = Math.max(45, Math.round(Math.max(1, brief.runtimeMinutes) * 60))
 const baseDuration = Math.max(8, Math.round(totalSeconds / count))

 return roles.map((role, index) => {
  const sceneNumber = index + 1
  const purpose = rolePurpose[role]
  const camera = roleCamera[role]
  const durationSeconds = index === 0 ? Math.min(baseDuration, 18) : baseDuration
  const assetNeeds = role === "PROOF"
   ? ["primary evidence reference", "supporting visual", "source citation"]
   : role === "SETUP"
     ? ["location / context visual", "orientation graphic"]
     : role === "PAYOFF"
       ? ["resolution visual", "callback asset"]
       : ["hero visual", "supporting cutaway"]

  return {
   id: `${concept.id}-scene-${sceneNumber}`,
   order: sceneNumber,
   role,
   title: `${role} · ${sceneNumber}`,
   purpose,
   narration: index === 0
    ? concept.hook
    : index === count - 1
      ? `${concept.viewerPromise} Close by showing how the evidence changes the viewer's understanding of ${clean(brief.idea, "the subject")}.`
      : `${purpose} Advance the ${concept.label.toLowerCase()} direction using the next strongest piece of evidence or consequence.`,
   visualDirection: `${concept.visualLanguage} Scene ${sceneNumber} should visually serve: ${purpose}`,
   shot: role === "PROOF" ? "Evidence insert → contextual medium → consequence cutaway" : `${role.toLowerCase()} composition with one primary visual beat`,
   camera,
   visualPrompt: `Create scene ${sceneNumber} for “${concept.angle}”. ${concept.visualLanguage} ${camera} Tone: ${clean(brief.tone, "cinematic")}. Preserve factual clarity and continuity with adjacent scenes.`,
   assetNeeds,
   motionBrief: `Animate only what clarifies ${purpose.toLowerCase()} Use restrained parallax, motivated graphic reveals, and movement consistent with ${camera.toLowerCase()}`,
   durationSeconds,
   transition: index === count - 1 ? "End hold / resolve" : role === "PIVOT" ? "Motivated reveal cut" : "Evidence-matched cut",
   continuity: `Maintain the selected ${concept.label.toLowerCase()} visual language, palette, subject identity, geography, and evidence boundaries.`,
  }
 })
}

export const moveScene = (scenes: ProductionScene[], fromIndex: number, toIndex: number): ProductionScene[] => {
 if (fromIndex < 0 || toIndex < 0 || fromIndex >= scenes.length || toIndex >= scenes.length || fromIndex === toIndex) {
  return scenes.map((scene, index) => ({ ...scene, order: index + 1 }))
 }
 const next = scenes.map(scene => ({ ...scene }))
 const [moved] = next.splice(fromIndex, 1)
 next.splice(toIndex, 0, moved)
 return next.map((scene, index) => ({ ...scene, order: index + 1 }))
}

export const buildProductionHandoff = (
 brief: ConceptBrief,
 concept: ConceptDirection,
 scenes: ProductionScene[],
) => {
 const assetNeeds = [...new Set(scenes.flatMap(scene => scene.assetNeeds))]
 return {
  schemaVersion: 1,
  brief,
  selectedConceptId: concept.id,
  selectedConcept: concept,
  scenes,
  assetNeeds,
  storyboard: {
   scenes: scenes.map(scene => ({
    id: scene.id,
    name: scene.title,
    text: scene.narration,
    broll: scene.visualDirection,
    durationEstimate: scene.durationSeconds,
    visualPrompt: scene.visualPrompt,
    camera: scene.camera,
    transition: scene.transition,
    motionBrief: scene.motionBrief,
   })),
  },
  videoDirector: {
   concept: concept.angle,
   treatment: concept.visualLanguage,
   tone: brief.tone,
   narrativeShape: concept.narrativeShape,
   continuity: scenes.map(scene => scene.continuity),
   shots: scenes.map(scene => ({
    id: scene.id,
    shot: scene.shot,
    camera: scene.camera,
    prompt: scene.visualPrompt,
    motionBrief: scene.motionBrief,
    assetNeeds: scene.assetNeeds,
    durationSeconds: scene.durationSeconds,
   })),
  },
 }
}
