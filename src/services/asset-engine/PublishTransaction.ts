import {
  appendContentBuildEvent,
  bindYouTubeVideo,
  getContentBuild,
  setContentBuildStage,
} from "./ContentBuildRepository"
import type { ContentBuildYouTubeBinding } from "./contracts"

export type PublishTransactionStep =
 | "validate-package"
 | "creator-approval"
 | "upload-video"
 | "bind-youtube"
 | "apply-metadata"
 | "apply-thumbnail"
 | "apply-captions"
 | "apply-routing"
 | "apply-schedule-privacy"
 | "verify-remote-state"

export type PublishTransactionStatus =
 | "awaiting-approval"
 | "approved"
 | "running"
 | "failed"
 | "completed"

export interface ContentBuildPublishTransaction {
 id: string
 contentBuildId: string
 idempotencyKey: string
 status: PublishTransactionStatus
 steps: Partial<Record<PublishTransactionStep, {
  status: "pending" | "running" | "completed" | "failed"
  completedAt?: string | null
  receipt?: Record<string, unknown>
  error?: string | null
 }>>
 youtubeVideoId?: string | null
 startedAt: string
 updatedAt: string
 completedAt?: string | null
}

const KEY = "viewtube_content_build_publish_transactions_v1"
let memory: ContentBuildPublishTransaction[] = []
const now = () => new Date().toISOString()
const uuid = () => globalThis.crypto?.randomUUID?.() || `publish-${Date.now()}-${Math.random().toString(36).slice(2)}`
const canStore = () => { try { return typeof localStorage !== "undefined" } catch { return false } }
const read = (): ContentBuildPublishTransaction[] => {
 if (!canStore()) return memory
 try { return JSON.parse(localStorage.getItem(KEY) || "[]") } catch { return [] }
}
const write = (value: ContentBuildPublishTransaction[]) => {
 if (!canStore()) { memory = value; return }
 try { localStorage.setItem(KEY, JSON.stringify(value)) } catch {}
}
const save = (transaction: ContentBuildPublishTransaction) => {
 const all = read()
 const index = all.findIndex(item => item.id === transaction.id)
 if (index >= 0) all[index] = transaction
 else all.push(transaction)
 write(all)
 return transaction
}

export const listPublishTransactions = (contentBuildId: string) =>
 read().filter(item => item.contentBuildId === contentBuildId).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt))

export const getPublishTransaction = (id: string) => read().find(item => item.id === id) || null

export const beginPublishTransaction = (input: {
 contentBuildId: string
 idempotencyKey?: string
 toolId?: string
}): ContentBuildPublishTransaction => {
 const build = getContentBuild(input.contentBuildId)
 if (!build) throw new Error("Unknown ContentBuild: " + input.contentBuildId)
 const key = input.idempotencyKey || `publish:${input.contentBuildId}:${build.selections["final-render"] || "no-render"}`
 const existing = read().find(item => item.contentBuildId === input.contentBuildId && item.idempotencyKey === key && item.status !== "failed")
 if (existing) return existing
 const timestamp = now()
 const transaction: ContentBuildPublishTransaction = {
  id: uuid(),
  contentBuildId: input.contentBuildId,
  idempotencyKey: key,
  status: "awaiting-approval",
  steps: {},
  youtubeVideoId: build.youtube?.videoId || null,
  startedAt: timestamp,
  updatedAt: timestamp,
 }
 save(transaction)
 appendContentBuildEvent({
  contentBuildId: input.contentBuildId,
  eventType: "publish.transaction.started",
  entityType: "publish-transaction",
  entityId: transaction.id,
  actorType: "tool",
  toolId: input.toolId || "video-publisher",
  inputAssetIds: Object.values(build.selections).filter((id): id is string => Boolean(id)),
  metadata: { idempotencyKey: key },
 })
 return transaction
}

export const approvePublishTransaction = (id: string, toolId = "video-publisher") => {
 const transaction = getPublishTransaction(id)
 if (!transaction) throw new Error("Unknown publish transaction: " + id)
 const next = save({ ...transaction, status: "approved", updatedAt: now() })
 appendContentBuildEvent({
  contentBuildId: next.contentBuildId,
  eventType: "publish.transaction.step.completed",
  entityType: "publish-transaction",
  entityId: next.id,
  actorType: "creator",
  toolId,
  metadata: { step: "creator-approval" },
 })
 return next
}

export const completePublishStep = (input: {
 transactionId: string
 step: PublishTransactionStep
 receipt?: Record<string, unknown>
 youtubeVideoId?: string | null
 youtubeBinding?: Partial<Omit<ContentBuildYouTubeBinding, "videoId" | "canonicalUrl" | "status">> & { status?: ContentBuildYouTubeBinding["status"] }
 toolId?: string
}) => {
 const transaction = getPublishTransaction(input.transactionId)
 if (!transaction) throw new Error("Unknown publish transaction: " + input.transactionId)
 const timestamp = now()
 const next = save({
  ...transaction,
  status: "running",
  youtubeVideoId: input.youtubeVideoId || transaction.youtubeVideoId || null,
  steps: {
   ...transaction.steps,
   [input.step]: { status: "completed", completedAt: timestamp, receipt: input.receipt },
  },
  updatedAt: timestamp,
 })
 if (input.youtubeVideoId) {
  const build = getContentBuild(next.contentBuildId)
  bindYouTubeVideo({
   contentBuildId: next.contentBuildId,
   videoId: input.youtubeVideoId,
   channelId: build?.channelId || null,
   status: input.youtubeBinding?.status || build?.youtube?.status || "uploaded",
   uploadStartedAt: input.youtubeBinding?.uploadStartedAt || build?.youtube?.uploadStartedAt || null,
   uploadCompletedAt: input.youtubeBinding?.uploadCompletedAt || build?.youtube?.uploadCompletedAt || null,
   scheduledAt: input.youtubeBinding?.scheduledAt || build?.youtube?.scheduledAt || null,
   premiereAt: input.youtubeBinding?.premiereAt || build?.youtube?.premiereAt || null,
   publishedAt: input.youtubeBinding?.publishedAt || build?.youtube?.publishedAt || null,
   initialTitleAssetId: build?.youtube?.initialTitleAssetId || build?.selections.title || null,
   initialThumbnailAssetId: build?.youtube?.initialThumbnailAssetId || build?.selections.thumbnail || null,
   finalRenderAssetId: build?.youtube?.finalRenderAssetId || build?.selections["final-render"] || null,
   lastVerifiedAt: input.youtubeBinding?.lastVerifiedAt || build?.youtube?.lastVerifiedAt || null,
   toolId: input.toolId || "video-publisher",
  })
 }
 appendContentBuildEvent({
  contentBuildId: next.contentBuildId,
  eventType: "publish.transaction.step.completed",
  entityType: "publish-transaction",
  entityId: next.id,
  actorType: input.step === "bind-youtube" ? "youtube" : "tool",
  toolId: input.toolId || "video-publisher",
  metadata: { step: input.step, receipt: input.receipt || null, youtubeVideoId: input.youtubeVideoId || null },
 })
 return next
}

export const failPublishTransaction = (id: string, step: PublishTransactionStep, error: unknown, toolId = "video-publisher") => {
 const transaction = getPublishTransaction(id)
 if (!transaction) throw new Error("Unknown publish transaction: " + id)
 const message = error instanceof Error ? error.message : String(error)
 const timestamp = now()
 const next = save({
  ...transaction,
  status: "failed",
  steps: { ...transaction.steps, [step]: { status: "failed", error: message } },
  updatedAt: timestamp,
 })
 appendContentBuildEvent({
  contentBuildId: next.contentBuildId,
  eventType: "publish.transaction.failed",
  entityType: "publish-transaction",
  entityId: next.id,
  actorType: "tool",
  toolId,
  metadata: { step, error: message },
 })
 return next
}

export const completePublishTransaction = (id: string, toolId = "video-publisher") => {
 const transaction = getPublishTransaction(id)
 if (!transaction) throw new Error("Unknown publish transaction: " + id)
 if (!transaction.youtubeVideoId) throw new Error("Cannot complete publishing without a bound YouTube video ID.")
 const timestamp = now()
 const next = save({ ...transaction, status: "completed", completedAt: timestamp, updatedAt: timestamp })
 const build = getContentBuild(next.contentBuildId)
 if (build?.youtube?.status === "published") setContentBuildStage(next.contentBuildId, "published", { actorType: "youtube", toolId })
 else if (build?.youtube?.status === "scheduled") setContentBuildStage(next.contentBuildId, "scheduled", { actorType: "youtube", toolId })
 appendContentBuildEvent({
  contentBuildId: next.contentBuildId,
  eventType: "publish.transaction.completed",
  entityType: "publish-transaction",
  entityId: next.id,
  actorType: "tool",
  toolId,
  metadata: { youtubeVideoId: next.youtubeVideoId },
 })
 return next
}
