import type { SuperToolId, VaultAssetKind } from "@/types"

export const VIDEO_PACKAGE_SCHEMA_VERSION = 1 as const

export type VideoPackageFormat = "short" | "long" | "live"
export type VideoPackageStatus =
 | "idea"
 | "developing"
 | "scripted"
 | "storyboarded"
 | "producing"
 | "packaging"
 | "review"
 | "scheduled"
 | "published"
 | "measuring"
 | "archived"

export type PackageArtifactKind =
 | "idea"
 | "angle"
 | "audience"
 | "hook"
 | "script"
 | "storyboard"
 | "scene"
 | "title"
 | "thumbnail"
 | "description"
 | "tags"
 | "end-screen"
 | "outro"
 | "pinned-comment"
 | "community-asset"
 | "render"
 | "metadata"

export interface PackageArtifactRef {
 id: string
 kind: PackageArtifactKind
 version: number
 label: string
 sourceToolId: SuperToolId | string
 vaultAssetId?: string | null
 createdAt: string
 approvedAt?: string | null
 metadata?: Record<string, unknown>
}

export interface PackageEvidenceRef {
 id: string
 source: "vt-sync" | "analytics-canon" | "csv" | "brain" | "manual" | "derived"
 label?: string
 snapshotId?: string | null
 createdAt: string
}

export interface PackageProvenanceEntry {
 id: string
 action: string
 sourceToolId: SuperToolId | string
 artifactIds: string[]
 evidenceIds: string[]
 createdAt: string
 note?: string
}

export interface PackageHandoff {
 id: string
 sourceToolId: SuperToolId | string
 targetToolId: SuperToolId | string
 artifactIds: string[]
 evidenceIds: string[]
 status: "pending" | "accepted" | "rejected" | "failed"
 createdAt: string
 resolvedAt?: string | null
}

export interface PackageBlocker {
 id: string
 label: string
 severity: "warning" | "blocking"
 resolved: boolean
 createdAt: string
 resolvedAt?: string | null
}

export interface PackageCheck {
 id: string
 label: string
 required: boolean
 passed: boolean
 checkedAt?: string | null
}

export interface PackageApprovalState {
 status: "draft" | "ready" | "approved" | "rejected"
 approvedBy?: string | null
 approvedAt?: string | null
 notes?: string
}

export interface ViewTubeVideoPackage {
 schemaVersion: typeof VIDEO_PACKAGE_SCHEMA_VERSION
 id: string
 contentBuildId?: string
 version: number
 channelId: string
 projectId: string
 videoId?: string | null
 identity: {
  workingTitle: string
  format: VideoPackageFormat
  status: VideoPackageStatus
  createdAt: string
  updatedAt: string
 }
 strategy: {
  idea?: PackageArtifactRef
  angle?: PackageArtifactRef
  audience?: PackageArtifactRef
  evidence: PackageEvidenceRef[]
  opportunityIds: string[]
 }
 creative: {
  hooks: PackageArtifactRef[]
  script?: PackageArtifactRef
  storyboard?: PackageArtifactRef
  scenes: PackageArtifactRef[]
 }
 packaging: {
  titleVariants: PackageArtifactRef[]
  thumbnailVariants: PackageArtifactRef[]
  selectedTitleId?: string | null
  selectedThumbnailId?: string | null
  description?: PackageArtifactRef
  tags?: PackageArtifactRef
  endScreen?: PackageArtifactRef
  outro?: PackageArtifactRef
  pinnedComment?: PackageArtifactRef
  communityAssets: PackageArtifactRef[]
 }
 production: {
  vaultAssetIds: string[]
  timelineId?: string | null
  editorHandoff?: PackageHandoff
  renderIds: string[]
 }
 publishing: {
  scheduledAt?: string | null
  checks: PackageCheck[]
  approval: PackageApprovalState
  publishedVideoId?: string | null
 }
 workflow: {
  chainId?: string | null
  currentStepId?: string | null
  blockers: PackageBlocker[]
  handoffs: PackageHandoff[]
 }
 provenance: PackageProvenanceEntry[]
}

export type CreateVideoPackageInput = {
 channelId: string
 projectId: string
 workingTitle: string
 format: VideoPackageFormat
 contentBuildId?: string
 sourceToolId?: SuperToolId | string
 now?: string
 id?: string
}

export type VideoPackageValidationIssue = {
 path: string
 code: "required" | "invalid" | "scope" | "reference" | "transition"
 message: string
}

export type VideoPackageValidationResult =
 | { valid: true; issues: [] }
 | { valid: false; issues: VideoPackageValidationIssue[] }

export type PackageAssetDescriptor = {
 id: string
 kind: VaultAssetKind
 projectId?: string | null
}
