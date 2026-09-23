/**
 * Provider adapter for governed creator assets.
 *
 * AssetGenerator owns contracts, grading, repair, evidence and trace behavior.
 * This module alone crosses into the existing Gemini provider service.
 */
import {
 cleanJsonString,
 executeWithRetry,
 getActiveModel,
 getAiClient,
} from "../gemini"
import type {
 AssetModelCall,
 AssetModelResponse,
 AssetModelRunner,
} from "./AssetGenerator"
import type { ModelResolution } from "./modelRouting"

const DEFAULT_MODEL_PREFERENCE = "gemini-3.1-flash"

const readRequestedModelPreference = (): string => {
 if (typeof localStorage === "undefined") return DEFAULT_MODEL_PREFERENCE
 return localStorage.getItem("vt_ai_model") || DEFAULT_MODEL_PREFERENCE
}

/**
 * Preserve both sides of model selection for traces and later outcome attribution.
 * Current gemini.ts remains the authority for which model is actually served.
 */
export const resolveAssetModelResolution = (): ModelResolution => {
 const requested = readRequestedModelPreference()
 const served = getActiveModel("text")
 return {
  capability: "text",
  requested,
  served,
  substituted: requested !== served,
  reason: requested === served ? "honoured" : "capability_policy_override",
 }
}

export const geminiAssetModelRunner: AssetModelRunner = async <TOutput>(
 call: AssetModelCall,
): Promise<AssetModelResponse<TOutput>> => {
 const model = resolveAssetModelResolution()

 const response = await executeWithRetry(() =>
  getAiClient().models.generateContent({
   model: model.served,
   contents: [{ role: "user", parts: [{ text: call.userText }] }],
   config: {
    systemInstruction: {
     role: "system",
     parts: [{ text: call.systemInstruction }],
    },
    responseMimeType: "application/json",
    responseSchema: call.schema,
   },
  }),
 )

 const raw = response.text || ""
 if (!raw.trim()) throw new Error("Model returned an empty response.")

 return {
  output: JSON.parse(cleanJsonString(raw)) as TOutput,
  model,
 }
}
