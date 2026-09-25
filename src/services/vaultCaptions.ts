import type { VaultAsset } from "../types"
import { addVaultAsset } from "./vaultAdapter"

export type VaultCaptionLine = {
 id: string
 startMs: number
 endMs: number
 text: string
}

const pad = (value: number, width = 2) => String(value).padStart(width, "0")

const formatTimestamp = (ms: number, separator: "," | ".") => {
 const safe = Math.max(0, Math.round(ms))
 const hours = Math.floor(safe / 3600000)
 const minutes = Math.floor((safe % 3600000) / 60000)
 const seconds = Math.floor((safe % 60000) / 1000)
 const millis = safe % 1000
 return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}${separator}${pad(millis, 3)}`
}

export const captionLinesToSrt = (lines: VaultCaptionLine[]): string =>
 lines.map((line, index) => [
  String(index + 1),
  `${formatTimestamp(line.startMs, ",")} --> ${formatTimestamp(line.endMs, ",")}`,
  line.text.trim(),
 ].join("\n")).join("\n\n")

export const captionLinesToVtt = (lines: VaultCaptionLine[]): string =>
 `WEBVTT\n\n${lines.map((line) => [
  `${formatTimestamp(line.startMs, ".")} --> ${formatTimestamp(line.endMs, ".")}`,
  line.text.trim(),
 ].join("\n")).join("\n\n")}`

export const createCaptionAsset = (
 source: VaultAsset,
 lines: VaultCaptionLine[],
): VaultAsset => addVaultAsset({
 name: `${source.name} · Captions`,
 kind: "document",
 source: source.source,
 projectId: source.projectId || null,
 projectName: source.projectName || null,
 toolId: "creator-vault-os",
 generationId: source.generationId || null,
 driveFileId: null,
 folderId: source.folderId || null,
 url: null,
 previewUrl: null,
 mimeType: "text/vtt",
 tags: Array.from(new Set([...(source.tags || []), "captions", "transcript"])),
 metadata: {
  parentAssetIds: [source.id],
  captionFormat: "timed-lines",
  captionLines: lines.map((line) => ({ ...line })),
  transcriptText: lines.map((line) => line.text.trim()).filter(Boolean).join("\n"),
  createdFromAssetId: source.id,
 },
})

export const transcriptToScriptAsset = (
 source: VaultAsset,
 lines: VaultCaptionLine[],
): VaultAsset => addVaultAsset({
 name: `${source.name.replace(/\s·\sCaptions$/i, "")} · Script`,
 kind: "document",
 source: source.source,
 projectId: source.projectId || null,
 projectName: source.projectName || null,
 toolId: "creator-vault-os",
 generationId: source.generationId || null,
 driveFileId: null,
 folderId: source.folderId || null,
 url: null,
 previewUrl: null,
 mimeType: "text/markdown",
 tags: Array.from(new Set([...(source.tags || []), "script", "transcript-derivative"])),
 metadata: {
  parentAssetIds: [source.id],
  derivativeKind: "transcript-to-script",
  scriptText: lines.map((line) => line.text.trim()).filter(Boolean).join("\n"),
  createdFromAssetId: source.id,
 },
})
