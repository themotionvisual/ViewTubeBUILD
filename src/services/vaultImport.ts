import type { VaultAssetKind } from "../types"

export type PendingVaultImport = {
 id: string
 name: string
 kind: VaultAssetKind
 mimeType: string | null
 size: number
 tags: string[]
 metadata: Record<string, unknown>
 previewUrl: string | null
}

export const inferVaultAssetKind = (file: File): VaultAssetKind => {
 if (file.type.startsWith("image/")) return "image"
 if (file.type.startsWith("video/")) return "video"
 if (file.type.startsWith("audio/")) return "audio"
 if (file.type.startsWith("font/")) return "font"
 if (file.type.includes("json")) return "json"
 if (file.type.startsWith("text/") || file.type.includes("pdf")) return "document"
 return "other"
}

export const createPendingVaultImport = (
 file: File,
 tags: string[],
 id = crypto.randomUUID(),
 metadata: Record<string, unknown> = {},
 previewUrl: string | null = null,
): PendingVaultImport => ({
 id,
 name: file.name,
 kind: inferVaultAssetKind(file),
 mimeType: file.type || null,
 size: file.size,
 tags: [...tags],
 metadata: { ...metadata },
 previewUrl,
})


export const updatePendingVaultImport = (
 item: PendingVaultImport,
 patch: Partial<Omit<PendingVaultImport, "id">>,
): PendingVaultImport => ({
 ...item,
 ...patch,
 id: item.id,
 tags: patch.tags ? [...patch.tags] : item.tags,
 metadata: patch.metadata ? { ...item.metadata, ...patch.metadata } : item.metadata,
})
