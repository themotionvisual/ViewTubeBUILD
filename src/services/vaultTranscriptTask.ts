import type { VaultAsset } from "../types"
import { acquireYouTubeAssets } from "./youtubeAcquisition"
import { addVaultAsset } from "./vaultAdapter"
import {
 createVaultTask,
 getVaultTask,
 updateVaultTask,
 type VaultTask,
} from "./vaultTaskCenter"

type TranscriptAcquire = typeof acquireYouTubeAssets

export const runVaultTranscriptTask = async (input: {
 asset: VaultAsset
 videoId: string
 taskId?: string | null
 acquire?: TranscriptAcquire
}): Promise<{ task: VaultTask; asset: VaultAsset | null }> => {
 const acquire = input.acquire || acquireYouTubeAssets
 let task = input.taskId ? getVaultTask(input.taskId) : null
 if (!task) {
  task = createVaultTask({
   type: "transcript",
   label: `Transcript · ${input.asset.name}`,
   assetName: input.asset.name,
   targetAssetId: input.asset.id,
   detail: "Queued for YouTube transcript acquisition.",
  })
 }
 task = updateVaultTask(task.id, {
  status: "processing",
  progress: 25,
  detail: "Requesting transcript from the canonical YouTube acquisition service.",
 }) || task

 try {
  const response = await acquire({ videoId: input.videoId })
  const transcript = response.transcript
  if (!transcript || transcript.status !== "available" || !transcript.text?.trim()) {
   task = updateVaultTask(task.id, {
    status: "failed",
    progress: 100,
    detail: transcript?.warning || transcript?.error || "No transcript is available for this video.",
   }) || task
   return { task, asset: null }
  }

  const transcriptAsset = addVaultAsset({
   name: `${input.asset.name} · Transcript`,
   kind: "document",
   source: input.asset.source,
   projectId: input.asset.projectId || null,
   projectName: input.asset.projectName || null,
   toolId: "creator-vault-os",
   generationId: input.asset.generationId || null,
   driveFileId: null,
   folderId: input.asset.folderId || null,
   url: null,
   previewUrl: null,
   mimeType: "text/plain",
   tags: Array.from(new Set([...(input.asset.tags || []), "transcript"])),
   metadata: {
    parentAssetIds: [input.asset.id],
    transcriptText: transcript.text,
    transcriptSource: transcript.source,
    transcriptLanguageCode: transcript.languageCode || null,
    youtubeVideoId: input.videoId,
    createdFromAssetId: input.asset.id,
   },
  })

  task = updateVaultTask(task.id, {
   status: "completed",
   progress: 100,
   detail: `Transcript saved as Vault asset ${transcriptAsset.name}.`,
  }) || task
  return { task, asset: transcriptAsset }
 } catch (error) {
  task = updateVaultTask(task.id, {
   status: "failed",
   progress: 100,
   detail: error instanceof Error ? error.message : "Transcript acquisition failed.",
  }) || task
  return { task, asset: null }
 }
}
