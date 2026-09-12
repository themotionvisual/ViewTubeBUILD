/**
 * The provider adapter for AssetGenerator.
 *
 * Kept apart from `AssetGenerator` deliberately. The generator holds the contracts and the
 * gates and stays free of the 4,885-line `gemini.ts` import, so every path through it is
 * testable without a provider. This file is the only place that knows a provider exists.
 *
 * That boundary is also the Phase 1 seam: the server-side AI gateway replaces this one
 * module with a `fetch` to `/api/ai/*` and nothing above it changes.
 */

import { getAiClient, resolveActiveModel } from "../gemini"
import type { AssetModelCall, AssetModelResponse, AssetModelRunner } from "./AssetGenerator"

/**
 * Models occasionally wrap JSON in prose or a fenced block despite a response schema.
 * Recovering the object is cheaper and more reliable than failing the generation.
 */
const parseJsonObject = <TOutput>(raw: string): TOutput => {
 const text = (raw || "").trim()
 if (!text) throw new Error("Model returned an empty response.")
 try {
  return JSON.parse(text) as TOutput
 } catch {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  const candidate = fenced?.[1]?.trim() || text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1)
  if (!candidate) throw new Error("Model response was not JSON.")
  return JSON.parse(candidate) as TOutput
 }
}

export const geminiAssetModelRunner: AssetModelRunner = async <TOutput>(
 call: AssetModelCall,
): Promise<AssetModelResponse<TOutput>> => {
 const ai = getAiClient()
 // Resolved rather than fetched as a bare string so the trace records which model actually
 // served the generation, and whether that differed from the creator's preference.
 const model = resolveActiveModel("text")

 const response = await ai.models.generateContent({
  model: model.served,
  contents: [{ role: "user", parts: [{ text: call.userText }] }],
  config: {
   systemInstruction: { role: "system", parts: [{ text: call.systemInstruction }] },
   responseMimeType: "application/json",
   responseSchema: call.schema,
  },
 })

 return { output: parseJsonObject<TOutput>(response.text || ""), model }
}
