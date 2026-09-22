import {
 generateStructuredBrainResponse,
 type StructuredBrainModelOutput,
} from "../../gemini"

export interface BrainStructuredGenerationInput {
 history: any[]
 userText: string
 systemInstruction: string
}

export interface BrainJsonGenerationInput {
 userText: string
 systemInstruction: string
 history?: any[]
}

export interface BrainModelGateway {
 generateStructuredResponse(input: BrainStructuredGenerationInput): Promise<StructuredBrainModelOutput>
 generateJsonObject?(input: BrainJsonGenerationInput): Promise<unknown>
}

/**
 * Phase 1 gateway adapter.
 *
 * This keeps current provider behavior unchanged while introducing the seam
 * that future Brain surfaces should depend on. Provider selection, retries,
 * model IDs, credentials, and billing continue to be owned by the existing
 * provider service until their migration is covered by parity/eval tests.
 */
export const defaultBrainModelGateway: BrainModelGateway = {
 generateStructuredResponse: (input) => generateStructuredBrainResponse(input),
 generateJsonObject: async (input) => {
  const { generateBrainJsonObject } = await import("../../gemini")
  return generateBrainJsonObject(input)
 },
}
