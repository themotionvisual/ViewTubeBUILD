import { createBrainSuperToolHandoff } from "./BrainSuperToolBridge"

export const BRAIN_WORKFLOW_RECIPES = {
 audienceSignalToIdea: (input: {
  channelId?: string | null
  projectId?: string | null
  audienceSignal: string
  evidenceIds?: string[]
 }) => createBrainSuperToolHandoff({
  channelId: input.channelId,
  projectId: input.projectId,
  sourceToolId: "audience-loop-studio",
  destinationToolId: "creator-canvas-os",
  objective: "Turn repeated audience demand into a channel-specific video concept.",
  payload: { audienceSignal: input.audienceSignal },
  evidenceIds: input.evidenceIds,
  confidence: "medium",
 }),

 ideaToPackaging: (input: {
  channelId?: string | null
  projectId?: string | null
  concept: string
  hook?: string
  evidenceIds?: string[]
 }) => createBrainSuperToolHandoff({
  channelId: input.channelId,
  projectId: input.projectId,
  sourceToolId: "creator-canvas-os",
  destinationToolId: "packaging-lab-pro",
  objective: "Create title and thumbnail directions that match the concept and the channel's proven packaging patterns.",
  payload: { concept: input.concept, hook: input.hook || "" },
  evidenceIds: input.evidenceIds,
  confidence: "medium",
 }),

 retentionToProjectRevision: (input: {
  channelId?: string | null
  projectId?: string | null
  diagnosis: string
  recommendedChanges: string[]
  evidenceIds?: string[]
 }) => createBrainSuperToolHandoff({
  channelId: input.channelId,
  projectId: input.projectId,
  sourceToolId: "retention-autopsy-experiment-engine",
  destinationToolId: "project-command-kanban",
  objective: "Turn a measured retention diagnosis into explicit revision tasks and a follow-up experiment.",
  payload: {
   diagnosis: input.diagnosis,
   recommendedChanges: input.recommendedChanges,
  },
  evidenceIds: input.evidenceIds,
  confidence: "high",
 }),

 vaultToEditor: (input: {
  channelId?: string | null
  projectId?: string | null
  assetIds: string[]
  sceneIntent: string
  evidenceIds?: string[]
 }) => createBrainSuperToolHandoff({
  channelId: input.channelId,
  projectId: input.projectId,
  sourceToolId: "creator-vault-os",
  destinationToolId: "timeline-asset-vault-dock",
  objective: "Carry selected creator-owned assets into the editor workflow with project provenance preserved.",
  payload: { assetIds: input.assetIds, sceneIntent: input.sceneIntent },
  evidenceIds: input.evidenceIds,
  confidence: "high",
 }),

 shortsToEditor: (input: {
  channelId?: string | null
  projectId?: string | null
  clipIds: string[]
  editBrief: string
  evidenceIds?: string[]
 }) => createBrainSuperToolHandoff({
  channelId: input.channelId,
  projectId: input.projectId,
  sourceToolId: "shorts-extraction-studio",
  destinationToolId: "motion-scene-builder",
  objective: "Move selected short-form clips into an editable VT_E1 scene workflow.",
  payload: { clipIds: input.clipIds, editBrief: input.editBrief },
  evidenceIds: input.evidenceIds,
  confidence: "medium",
 }),
}

export type BrainWorkflowRecipeId = keyof typeof BRAIN_WORKFLOW_RECIPES
