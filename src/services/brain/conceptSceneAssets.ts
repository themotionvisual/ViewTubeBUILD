import {
 buildChannelAssetEvidence,
 type CreatorChannelContext,
} from "./creatorAssets"
import {
 generateAsset,
 type AssetGenerationResult,
} from "./AssetGenerator"
import { geminiAssetModelRunner } from "./assetModelRunner"
import {
 conceptDirectionStrategy,
 scenePlanStrategy,
 type ConceptForgeOutput,
 type ScenePlanOutput,
} from "./assetStrategies/conceptScene"

export const generateConceptDirections = async (input: {
 context: CreatorChannelContext
 brief: Record<string, unknown>
 projectId?: string
}): Promise<AssetGenerationResult<ConceptForgeOutput>> => {
 const evidence = buildChannelAssetEvidence(input.context, conceptDirectionStrategy.evidenceClasses)
 return generateAsset<ConceptForgeOutput>({
  request: {
   channelId: input.context.channelId,
   assetType: "concept_direction",
   instruction: "Forge three distinct production-ready creative directions from this brief.",
   ...(input.projectId ? { projectId: input.projectId } : {}),
   inputs: { brief: input.brief },
  },
  strategy: conceptDirectionStrategy,
  evidence,
  runner: geminiAssetModelRunner,
 })
}

export const generateScenePlan = async (input: {
 context: CreatorChannelContext
 brief: Record<string, unknown>
 selectedConcept: Record<string, unknown>
 sceneCount: number
 scriptBeats?: string[]
 projectId?: string
}): Promise<AssetGenerationResult<ScenePlanOutput>> => {
 const evidence = buildChannelAssetEvidence(input.context, scenePlanStrategy.evidenceClasses)
 return generateAsset<ScenePlanOutput>({
  request: {
   channelId: input.context.channelId,
   assetType: "scene_plan",
   instruction: "Convert the selected creative direction into an editable production scene blueprint.",
   ...(input.projectId ? { projectId: input.projectId } : {}),
   inputs: {
    brief: input.brief,
    selectedConcept: input.selectedConcept,
    sceneCount: input.sceneCount,
    scriptBeats: input.scriptBeats || [],
   },
  },
  strategy: scenePlanStrategy,
  evidence,
  runner: geminiAssetModelRunner,
 })
}
