/**
 * Provider adapter for governed creator assets.
 *
 * AssetGenerator owns contracts, grading, repair, evidence and trace behavior.
 * This module only delegates to the canonical provider service.
 */
import { generateSchemaJsonObject } from "../gemini"
import type {
 AssetModelCall,
 AssetModelResponse,
 AssetModelRunner,
} from "./AssetGenerator"
import type { ModelResolution } from "./modelRouting"

/** Build the traceable model-resolution record from provider-owned routing output. */
export const resolveAssetModelResolution = (
 requested: string,
 served: string,
): ModelResolution => ({
 capability: "text",
 requested,
 served,
 substituted: requested !== served,
 reason: requested === served ? "honoured" : "capability_policy_override",
})

export const geminiAssetModelRunner: AssetModelRunner = async <TOutput>(
 call: AssetModelCall,
): Promise<AssetModelResponse<TOutput>> => {
 const result = await generateSchemaJsonObject<TOutput>({
  systemInstruction: call.systemInstruction,
  userText: call.userText,
  responseSchema: call.schema,
  capability: "text",
  ...(call.mediaAttachments?.length
   ? { mediaAttachments: call.mediaAttachments }
   : {}),
 })

 return {
  output: result.output,
  model: resolveAssetModelResolution(
   result.requestedModel,
   result.servedModel,
  ),
 }
}
