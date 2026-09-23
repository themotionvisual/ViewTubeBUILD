import type {
 CreateVideoPackageInput,
 PackageArtifactRef,
 VideoPackageStatus,
 VideoPackageValidationIssue,
 VideoPackageValidationResult,
 ViewTubeVideoPackage,
} from "./contracts"
import { VIDEO_PACKAGE_SCHEMA_VERSION } from "./contracts"

export const VIDEO_PACKAGE_TRANSITIONS: Readonly<Record<VideoPackageStatus, readonly VideoPackageStatus[]>> = {
 idea: ["developing", "archived"],
 developing: ["idea", "scripted", "archived"],
 scripted: ["developing", "storyboarded", "archived"],
 storyboarded: ["scripted", "producing", "archived"],
 producing: ["storyboarded", "packaging", "archived"],
 packaging: ["producing", "review", "archived"],
 review: ["packaging", "scheduled", "archived"],
 scheduled: ["review", "published", "archived"],
 published: ["measuring", "archived"],
 measuring: ["archived"],
 archived: ["idea", "developing", "scripted", "storyboarded", "producing", "packaging", "review", "scheduled", "published", "measuring"],
}

const nonEmpty = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0

const allArtifacts = (videoPackage: ViewTubeVideoPackage): PackageArtifactRef[] => [
 videoPackage.strategy.idea,
 videoPackage.strategy.angle,
 videoPackage.strategy.audience,
 ...videoPackage.creative.hooks,
 videoPackage.creative.script,
 videoPackage.creative.storyboard,
 ...videoPackage.creative.scenes,
 ...videoPackage.packaging.titleVariants,
 ...videoPackage.packaging.thumbnailVariants,
 videoPackage.packaging.description,
 videoPackage.packaging.tags,
 videoPackage.packaging.endScreen,
 videoPackage.packaging.outro,
 videoPackage.packaging.pinnedComment,
 ...videoPackage.packaging.communityAssets,
].filter((artifact): artifact is PackageArtifactRef => Boolean(artifact))

export const canTransitionVideoPackage = (from: VideoPackageStatus, to: VideoPackageStatus): boolean =>
 from === to || VIDEO_PACKAGE_TRANSITIONS[from].includes(to)

export const validateVideoPackage = (videoPackage: ViewTubeVideoPackage): VideoPackageValidationResult => {
 const issues: VideoPackageValidationIssue[] = []
 if (videoPackage.schemaVersion !== VIDEO_PACKAGE_SCHEMA_VERSION) issues.push({ path: "schemaVersion", code: "invalid", message: "Unsupported video package schema version." })
 if (!nonEmpty(videoPackage.id)) issues.push({ path: "id", code: "required", message: "Package ID is required." })
 if (!nonEmpty(videoPackage.channelId)) issues.push({ path: "channelId", code: "scope", message: "Channel ownership is required." })
 if (!nonEmpty(videoPackage.projectId)) issues.push({ path: "projectId", code: "scope", message: "Project ownership is required." })
 if (!Number.isInteger(videoPackage.version) || videoPackage.version < 1) issues.push({ path: "version", code: "invalid", message: "Package version must be a positive integer." })
 if (
  videoPackage.contentBuildRevision !== undefined &&
  (!Number.isInteger(videoPackage.contentBuildRevision) || videoPackage.contentBuildRevision < 1)
 ) {
  issues.push({ path: "contentBuildRevision", code: "invalid", message: "Observed ContentBuild revision must be a positive integer." })
 }
 if (!nonEmpty(videoPackage.identity.workingTitle)) issues.push({ path: "identity.workingTitle", code: "required", message: "A working title is required." })

 const artifacts = allArtifacts(videoPackage)
 const artifactIds = new Set(artifacts.map((artifact) => artifact.id))
 if (artifactIds.size !== artifacts.length) issues.push({ path: "artifacts", code: "reference", message: "Artifact IDs must be unique within a package." })
 if (videoPackage.packaging.selectedTitleId && !videoPackage.packaging.titleVariants.some((artifact) => artifact.id === videoPackage.packaging.selectedTitleId)) {
  issues.push({ path: "packaging.selectedTitleId", code: "reference", message: "Selected title must reference a package title variant." })
 }
 if (videoPackage.packaging.selectedThumbnailId && !videoPackage.packaging.thumbnailVariants.some((artifact) => artifact.id === videoPackage.packaging.selectedThumbnailId)) {
  issues.push({ path: "packaging.selectedThumbnailId", code: "reference", message: "Selected thumbnail must reference a package thumbnail variant." })
 }
 if (videoPackage.identity.status === "scheduled") {
  if (!videoPackage.packaging.selectedTitleId) issues.push({ path: "packaging.selectedTitleId", code: "required", message: "Scheduling requires an approved title." })
  if (!videoPackage.packaging.selectedThumbnailId) issues.push({ path: "packaging.selectedThumbnailId", code: "required", message: "Scheduling requires an approved thumbnail." })
  if (videoPackage.publishing.approval.status !== "approved") issues.push({ path: "publishing.approval", code: "required", message: "Scheduling requires explicit package approval." })
  if (videoPackage.workflow.blockers.some((blocker) => blocker.severity === "blocking" && !blocker.resolved)) issues.push({ path: "workflow.blockers", code: "invalid", message: "Resolve blocking issues before scheduling." })
 }
 return issues.length ? { valid: false, issues } : { valid: true, issues: [] }
}

export const createVideoPackage = (input: CreateVideoPackageInput): ViewTubeVideoPackage => {
 const now = input.now || new Date().toISOString()
 const id = input.id || crypto.randomUUID()
 return {
  schemaVersion: VIDEO_PACKAGE_SCHEMA_VERSION,
  id,
  contentBuildId: input.contentBuildId?.trim() || id,
  version: 1,
  channelId: input.channelId.trim(),
  projectId: input.projectId.trim(),
  identity: { workingTitle: input.workingTitle.trim(), format: input.format, status: "idea", createdAt: now, updatedAt: now },
  strategy: { evidence: [], opportunityIds: [] },
  creative: { hooks: [], scenes: [] },
  packaging: { titleVariants: [], thumbnailVariants: [], communityAssets: [] },
  production: { vaultAssetIds: [], renderIds: [] },
  publishing: { checks: [], approval: { status: "draft" } },
  workflow: { blockers: [], handoffs: [] },
  provenance: [{ id: id + ":created", action: "package_created", sourceToolId: input.sourceToolId || "creator-canvas-os", artifactIds: [], evidenceIds: [], createdAt: now }],
 }
}

export const transitionVideoPackage = (
 videoPackage: ViewTubeVideoPackage,
 status: VideoPackageStatus,
 now = new Date().toISOString(),
): ViewTubeVideoPackage => {
 if (!canTransitionVideoPackage(videoPackage.identity.status, status)) {
  throw new Error("Invalid video package transition: " + videoPackage.identity.status + " -> " + status)
 }
 const next = {
  ...videoPackage,
  version: videoPackage.version + (status === videoPackage.identity.status ? 0 : 1),
  identity: { ...videoPackage.identity, status, updatedAt: now },
 }
 const validation = validateVideoPackage(next)
 if (!validation.valid) throw new Error(validation.issues.map((issue) => issue.path + ": " + issue.message).join("; "))
 return next
}
