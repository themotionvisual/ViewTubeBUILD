import type { AssetEvidence, AssetModelRunner, AssetRecord } from "./AssetGenerator"
import { generateAsset } from "./AssetGenerator"
import { geminiAssetModelRunner } from "./assetModelRunner"
import {
 thumbnailAnalysisStrategy,
 type GovernedThumbnailAnalysisOutput,
} from "./assetStrategies/thumbnailAnalysis"

export interface GovernedLongformThumbnailAnalysis {
 status: "ready"
 concept: string
 subjects: string[]
 style: string
 composition: string
 text: string
 visualHierarchy: string
 emotionalTone: string
 promiseAlignment: string
 notes: string
 evidenceId: string
}

export interface LongformThumbnailAnalysisResult {
 analysis: GovernedLongformThumbnailAnalysis
 record: AssetRecord<GovernedThumbnailAnalysisOutput>
}

const imageDataUrl = (value: string) => /^data:image\/[\w.+-]+;base64,/.test(value)

const bytesToBase64 = (bytes: Uint8Array) => {
 let binary = ""
 const chunkSize = 0x8000
 for (let offset = 0; offset < bytes.length; offset += chunkSize) {
  const chunk = bytes.subarray(offset, Math.min(bytes.length, offset + chunkSize))
  binary += String.fromCharCode(...Array.from(chunk))
 }
 if (typeof btoa !== "function") throw new Error("Base64 encoding is unavailable in this runtime.")
 return btoa(binary)
}

export const resolveThumbnailMediaDataUrl = async (
 thumbnailUrl: string,
 fetchImpl: typeof fetch = fetch,
): Promise<string> => {
 const normalized = thumbnailUrl.trim()
 if (!normalized) throw new Error("The selected video does not have a thumbnail URL.")
 if (imageDataUrl(normalized)) return normalized

 const response = await fetchImpl(normalized, { mode: "cors", credentials: "omit" })
 if (!response.ok) throw new Error(`Thumbnail fetch failed with HTTP ${response.status}.`)
 const blob = await response.blob()
 const mimeType = blob.type || "image/jpeg"
 if (!mimeType.startsWith("image/")) throw new Error("The thumbnail response was not an image.")
 const bytes = new Uint8Array(await blob.arrayBuffer())
 if (!bytes.length) throw new Error("The thumbnail image was empty.")
 return `data:${mimeType};base64,${bytesToBase64(bytes)}`
}

const buildEvidence = (input: {
 videoId: string
 title: string
 description?: string | null
 tags?: string[]
}): AssetEvidence => ({
 requested: ["video_metadata"],
 refs: [`video-metadata:${input.videoId}`],
 missing: [],
 payload: {
  videoId: input.videoId,
  title: input.title,
  description: input.description || "",
  tags: input.tags || [],
 },
 summary: [
  `Video ID: ${input.videoId}`,
  `Current title: ${input.title}`,
  input.description?.trim() ? `Current description: ${input.description}` : "",
  input.tags?.length ? `Current tags: ${input.tags.join(", ")}` : "",
 ].filter(Boolean).join("\n"),
})

export const analyzeLongformThumbnail = async (input: {
 channelId: string
 projectId?: string | null
 videoId: string
 title: string
 description?: string | null
 tags?: string[]
 thumbnailUrl: string
 runner?: AssetModelRunner
 fetchImpl?: typeof fetch
}): Promise<LongformThumbnailAnalysisResult> => {
 const media = await resolveThumbnailMediaDataUrl(input.thumbnailUrl, input.fetchImpl || fetch)
 const result = await generateAsset<GovernedThumbnailAnalysisOutput>({
  request: {
   channelId: input.channelId,
   assetType: "thumbnail_analysis",
   instruction: "Analyze the current thumbnail as visual evidence for a published longform-video optimization decision.",
   ...(input.projectId ? { projectId: input.projectId } : {}),
   inputs: {
    videoId: input.videoId,
    title: input.title,
    description: input.description || "",
    tags: input.tags || [],
   },
  },
  strategy: thumbnailAnalysisStrategy,
  evidence: buildEvidence(input),
  runner: input.runner || geminiAssetModelRunner,
  mediaAttachments: [media],
  styleProfile: null,
 })

 const output = result.record.output
 if (result.record.status === "failed" || !output) {
  throw new Error("Thumbnail vision did not return a usable analysis.")
 }

 return {
  record: result.record,
  analysis: {
   status: "ready",
   concept: output.concept,
   subjects: [...(output.subjects || [])],
   style: output.style,
   composition: output.composition,
   text: output.visibleText,
   visualHierarchy: output.visualHierarchy,
   emotionalTone: output.emotionalTone,
   promiseAlignment: output.promiseAlignment,
   notes: (output.notes || []).join(" "),
   evidenceId: result.record.id,
  },
 }
}
