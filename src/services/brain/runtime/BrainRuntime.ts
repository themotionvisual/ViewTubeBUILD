import { runBrainTurn, type RunBrainTurnInput } from "../BrainOrchestrator"
import { defaultBrainModelGateway } from "./BrainModelGateway"
import type {
 BrainRuntimeMetadata,
 BrainRuntimeRequest,
 BrainRuntimeResult,
} from "./BrainRuntimeContracts"

export const BRAIN_RUNTIME_VERSION = "brain-runtime-v1"

const toLegacyInput = (input: BrainRuntimeRequest): RunBrainTurnInput => ({
 channelId: input.channelId,
 userText: input.userText,
 snapshot: input.snapshot,
 systemPrompt: input.systemPrompt,
 growthContext: input.growthContext,
 recentTurns: input.recentTurns,
 history: input.history,
 allowModel: input.allowModel,
 modelGenerator: input.modelGenerator || defaultBrainModelGateway.generateStructuredResponse,
 nicheResolver: input.nicheResolver,
 currentResearcher: input.currentResearcher,
 projectId: input.projectId,
 visibleContext: input.visibleContext,
 artifactRefs: input.artifactRefs,
})

export const buildBrainRuntimeMetadata = (
 input: BrainRuntimeRequest,
): BrainRuntimeMetadata => ({
 runtimeVersion: BRAIN_RUNTIME_VERSION,
 surface: input.surface || "unknown",
 projectId: input.projectId || null,
 contentBuildId: typeof input.visibleContext?.contentBuildId === "string" ? input.visibleContext.contentBuildId : null,
 artifactRefs: Array.from(new Set(input.artifactRefs || [])).slice(0, 50),
 hasVisibleContext: Boolean(input.visibleContext && Object.keys(input.visibleContext).length),
})

/**
 * Canonical additive entry point for creator-facing Brain tasks.
 *
 * Phase 1 deliberately delegates orchestration to the existing BrainOrchestrator
 * so creator behavior, validation, repair, fallbacks, learning, and persistence
 * remain unchanged. Structured generation is injected through BrainModelGateway,
 * establishing the provider-neutral seam without changing the current provider.
 */
export const runBrainTask = async (
 input: BrainRuntimeRequest,
): Promise<BrainRuntimeResult> => {
 const result = await runBrainTurn(toLegacyInput(input))
 return {
  ...result,
  runtime: buildBrainRuntimeMetadata(input),
 }
}
