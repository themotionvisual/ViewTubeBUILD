import type { PublishingPackageProjection } from "./PublishingPackageProjection"

export const APPROVED_PUBLISH_SNAPSHOT_VERSION = 1 as const

export interface ApprovedPublishSnapshotAssets {
 titleAssetId: string
 thumbnailAssetId: string
 finalRenderAssetId: string
 descriptionAssetId: string
 tagsAssetId: string | null
 endScreenAssetId: string | null
 outroAssetId: string | null
}

export interface ApprovedPublishSnapshot {
 schemaVersion: typeof APPROVED_PUBLISH_SNAPSHOT_VERSION
 id: string
 hash: string
 contentBuildId: string
 contentBuildRevision: number
 projectId: string
 videoPackageId: string
 assets: ApprovedPublishSnapshotAssets
 scheduledAt: string | null
 approval: {
  approvedBy: string | null
  approvedAt: string | null
 }
}

type SnapshotPayload = Omit<ApprovedPublishSnapshot, "id" | "hash">

const stableStringify = (value: unknown): string => {
 if (value === null || typeof value !== "object") return JSON.stringify(value)
 if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`
 const entries = Object.entries(value as Record<string, unknown>)
  .sort(([left], [right]) => left.localeCompare(right))
  .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`)
 return `{${entries.join(",")}}`
}

// FNV-1a 64-bit gives a deterministic local identity without introducing a
// provider or persistence dependency. This is an integrity/idempotency hash,
// not a security signature.
const stableHash = (value: string): string => {
 let hash = 0xcbf29ce484222325n
 const prime = 0x100000001b3n
 for (let index = 0; index < value.length; index += 1) {
  hash ^= BigInt(value.charCodeAt(index))
  hash = BigInt.asUintN(64, hash * prime)
 }
 return hash.toString(16).padStart(16, "0")
}

const payloadFromProjection = (
 projection: PublishingPackageProjection,
): SnapshotPayload => {
 if (
  !projection.ready ||
  projection.approval.status !== "approved" ||
  !projection.titleAssetId ||
  !projection.thumbnailAssetId ||
  !projection.finalRenderAssetId ||
  !projection.descriptionAssetId
 ) {
  throw new Error("Publishing Package must be ready and creator-approved before snapshot creation.")
 }

 return {
  schemaVersion: APPROVED_PUBLISH_SNAPSHOT_VERSION,
  contentBuildId: projection.contentBuildId,
  contentBuildRevision: projection.revision,
  projectId: projection.projectId,
  videoPackageId: projection.videoPackageId,
  assets: {
   titleAssetId: projection.titleAssetId,
   thumbnailAssetId: projection.thumbnailAssetId,
   finalRenderAssetId: projection.finalRenderAssetId,
   descriptionAssetId: projection.descriptionAssetId,
   tagsAssetId: projection.tagsAssetId,
   endScreenAssetId: projection.endScreenAssetId,
   outroAssetId: projection.outroAssetId,
  },
  scheduledAt: projection.scheduledAt,
  approval: {
   approvedBy: projection.approval.approvedBy || null,
   approvedAt: projection.approval.approvedAt || null,
  },
 }
}

export const createApprovedPublishSnapshot = (
 projection: PublishingPackageProjection,
): ApprovedPublishSnapshot => {
 const payload = payloadFromProjection(projection)
 const hash = stableHash(stableStringify(payload))
 return {
  ...payload,
  id: `approved-publish:${payload.contentBuildId}:${hash}`,
  hash,
 }
}

export const verifyApprovedPublishSnapshot = (
 snapshot: ApprovedPublishSnapshot,
): boolean => {
 const { id, hash, ...payload } = snapshot
 const expectedHash = stableHash(stableStringify(payload))
 return hash === expectedHash && id === `approved-publish:${payload.contentBuildId}:${expectedHash}`
}
