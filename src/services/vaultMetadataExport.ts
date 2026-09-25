import type { VaultAsset } from "../types"

const csvCell = (value: unknown): string => {
 const text = value == null ? "" : String(value)
 if (!/[",\n\r]/.test(text)) return text
 return `"${text.replace(/"/g, '""')}"`
}

const numericMetadata = (asset: VaultAsset, key: string): number | "" => {
 const value = asset.metadata?.[key]
 return typeof value === "number" && Number.isFinite(value) ? value : ""
}

export const serializeVaultAssetsJson = (assets: VaultAsset[]): string =>
 JSON.stringify({
  schema: "viewtube-vault-metadata-export-v1",
  exportedAt: new Date().toISOString(),
  assetCount: assets.length,
  assets,
 }, null, 2)

export const serializeVaultAssetsCsv = (assets: VaultAsset[]): string => {
 const headers = [
  "id",
  "name",
  "kind",
  "project",
  "source",
  "mimeType",
  "tags",
  "width",
  "height",
  "durationSeconds",
  "byteSize",
  "lifecycle",
  "favorite",
  "createdAt",
  "updatedAt",
  "customFields",
 ]
 const rows = assets.map((asset) => {
  const metadata = asset.metadata || {}
  const duration = typeof metadata.durationSeconds === "number"
   ? metadata.durationSeconds
   : typeof metadata.durationSec === "number"
    ? metadata.durationSec
    : ""
  const customFields = metadata.customFields && typeof metadata.customFields === "object"
   ? JSON.stringify(metadata.customFields)
   : ""

  return [
   asset.id,
   asset.name,
   asset.kind,
   asset.projectName || "",
   asset.source,
   asset.mimeType || "",
   (asset.tags || []).join("; "),
   numericMetadata(asset, "width"),
   numericMetadata(asset, "height"),
   duration,
   numericMetadata(asset, "byteSize"),
   String(metadata.lifecycle || "DRAFT"),
   metadata.favorite === true ? "true" : "false",
   new Date(asset.createdAt).toISOString(),
   new Date(asset.updatedAt).toISOString(),
   customFields,
  ].map(csvCell).join(",")
 })

 return [headers.join(","), ...rows].join("\n")
}
