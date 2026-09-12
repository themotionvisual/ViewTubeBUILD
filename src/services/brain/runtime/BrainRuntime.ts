import { runBrainTurn, type RunBrainTurnInput } from "../BrainOrchestrator"
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
 modelGenerator: input.modelGenerator,
 nicheResolver: input.nicheResolver,
 currentResearcher: input.currentResearcher,
})

export const buildBrainRuntimeMetadata = (
 input: BrainRuntimeRequest,
): BrainRuntimeMetadata => ({
 runtimeVersion: BRAIN_RUNTIME_VERSION,
 surface: input.surface || "unknown",
 projectId: input.projectId || null,
 artifactRefs: Array.from(new Set(input.artifactRefs || [])).slice(0, 50),
 hasVisibleContext: Boolean(input.visibleContext && Object.keys(input.visibleContext).length),
})

/**
 * Canonical additive entry point for creator-facing Brain tasks.
 *
 * Phase 1 deliberately delegates to the existing BrainOrchestrator so current
 * creator behavior, fallbacks, validation, learning, and persistence remain
 * unchanged while surfaces migrate to one shared runtime boundary.
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
