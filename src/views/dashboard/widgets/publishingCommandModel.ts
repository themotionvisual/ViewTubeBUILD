import type { PublishingPackageProjection } from "../../../services/asset-engine/PublishingPackageProjection"
import type { ContentBuildPublishTransaction } from "../../../services/asset-engine/PublishTransaction"

type LaunchStageStatus = "pending" | "active" | "complete" | "blocked"

export const buildPublishingCommandModel = (input: {
  projection: PublishingPackageProjection | null
  transaction: ContentBuildPublishTransaction | null
}) => {
  const projection = input.projection
  const transaction = input.transaction

  if (!projection) {
    return {
      source: "fallback" as const,
      blockers: [] as string[],
      ready: false,
      scheduled: false,
      published: false,
      transactionStatus: null as string | null,
      stages: [] as Array<{ id: "PACKAGE" | "CHECK" | "SCHEDULE" | "READY" | "LIVE"; status: LaunchStageStatus }>,
    }
  }

  const packageComplete = Boolean(
    projection.titleAssetId
    && projection.thumbnailAssetId
    && projection.finalRenderAssetId
    && projection.descriptionAssetId,
  )
  const checksComplete = !projection.missing.includes("approval")
    && !projection.missing.includes("checks")
    && !projection.missing.includes("blockers")
  const scheduled = Boolean(projection.scheduledAt)
  const published = Boolean(projection.publishedVideoId) || transaction?.status === "completed"
  const transactionActive = Boolean(
    transaction
    && transaction.status !== "completed"
    && transaction.status !== "failed",
  )

  const stages: Array<{ id: "PACKAGE" | "CHECK" | "SCHEDULE" | "READY" | "LIVE"; status: LaunchStageStatus }> = [
    { id: "PACKAGE", status: packageComplete ? "complete" : "blocked" },
    { id: "CHECK", status: checksComplete ? "complete" : "blocked" },
    { id: "SCHEDULE", status: scheduled ? "complete" : projection.ready ? "active" : "pending" },
    { id: "READY", status: projection.ready ? "complete" : "blocked" },
    {
      id: "LIVE",
      status: published
        ? "complete"
        : transactionActive
          ? "active"
          : projection.ready
            ? "pending"
            : "blocked",
    },
  ]

  return {
    source: "canonical" as const,
    blockers: [...projection.missing],
    ready: projection.ready,
    scheduled,
    published,
    transactionStatus: transaction?.status || null,
    stages,
  }
}
