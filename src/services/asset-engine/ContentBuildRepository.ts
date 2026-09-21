import {
 CONTENT_BUILD_SCHEMA_VERSION,
 type BindYouTubeVideoInput,
 type ContentBuildAssetRelation,
 type ContentBuildEvent,
 type ContentBuildEventType,
 type ContentBuildProfile,
 type ContentBuildRelationType,
 type ContentBuildSnapshot,
 type ContentBuildStage,
 type CreateContentBuildInput,
} from "./contracts"

const BUILDS_KEY = "viewtube_content_builds_v1"
const EVENTS_KEY = "viewtube_content_build_events_v1"

let memoryBuilds: ContentBuildSnapshot[] = []
let memoryEvents: ContentBuildEvent[] = []

const uuid = () =>
 typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
  ? crypto.randomUUID()
  : "vt-" + Date.now() + "-" + Math.random().toString(36).slice(2)

const nowIso = () => new Date().toISOString()

const canUseStorage = () => {
 try {
  return typeof localStorage !== "undefined"
 } catch {
  return false
 }
}

const readJson = <T,>(key: string, fallback: T): T => {
 if (!canUseStorage()) return fallback
 try {
  const raw = localStorage.getItem(key)
  return raw ? JSON.parse(raw) as T : fallback
 } catch {
  return fallback
 }
}

const writeJson = (key: string, value: unknown) => {
 if (!canUseStorage()) return
 try {
  localStorage.setItem(key, JSON.stringify(value))
 } catch {
  // Browser compatibility bridge only. A server repository can replace this adapter.
 }
}

const readBuilds = (): ContentBuildSnapshot[] =>
 canUseStorage() ? readJson<ContentBuildSnapshot[]>(BUILDS_KEY, []) : memoryBuilds

const writeBuilds = (builds: ContentBuildSnapshot[]) => {
 if (canUseStorage()) writeJson(BUILDS_KEY, builds)
 else memoryBuilds = builds
}

const readEvents = (): ContentBuildEvent[] =>
 canUseStorage() ? readJson<ContentBuildEvent[]>(EVENTS_KEY, []) : memoryEvents

const writeEvents = (events: ContentBuildEvent[]) => {
 if (canUseStorage()) writeJson(EVENTS_KEY, events)
 else memoryEvents = events
}

export const appendContentBuildEvent = <T = Record<string, unknown>>(input: {
 contentBuildId: string
 eventType: ContentBuildEventType
 entityType?: string | null
 entityId?: string | null
 actorType?: ContentBuildEvent["actorType"]
 actorId?: string | null
 toolId?: string | null
 previousState?: unknown
 resultingState?: unknown
 inputAssetIds?: string[]
 outputAssetIds?: string[]
 evidenceIds?: string[]
 generationRecordId?: string | null
 actionPacketId?: string | null
 traceId?: string | null
 metadata?: T
 timestamp?: string
}): ContentBuildEvent<T> => {
 const event: ContentBuildEvent<T> = {
  id: uuid(),
  contentBuildId: input.contentBuildId,
  timestamp: input.timestamp || nowIso(),
  eventType: input.eventType,
  entityType: input.entityType || null,
  entityId: input.entityId || null,
  actorType: input.actorType || "system",
  actorId: input.actorId || null,
  toolId: input.toolId || null,
  previousState: input.previousState,
  resultingState: input.resultingState,
  inputAssetIds: input.inputAssetIds || [],
  outputAssetIds: input.outputAssetIds || [],
  evidenceIds: input.evidenceIds || [],
  generationRecordId: input.generationRecordId || null,
  actionPacketId: input.actionPacketId || null,
  traceId: input.traceId || null,
  metadata: input.metadata,
 }
 const events = readEvents()
 events.push(event as ContentBuildEvent)
 writeEvents(events)
 return event
}

export const getContentBuild = (contentBuildId: string): ContentBuildSnapshot | null =>
 readBuilds().find(build => build.id === contentBuildId) || null

export const listContentBuilds = (): ContentBuildSnapshot[] =>
 readBuilds().slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

export const listContentBuildEvents = (contentBuildId: string): ContentBuildEvent[] =>
 readEvents()
  .filter(event => event.contentBuildId === contentBuildId)
  .sort((a, b) => a.timestamp.localeCompare(b.timestamp))

export const createContentBuild = (input: CreateContentBuildInput = {}): ContentBuildSnapshot => {
 const createdAt = input.createdAt || nowIso()
 const id = input.id || uuid()
 const existing = getContentBuild(id)
 if (existing) return existing
 const build: ContentBuildSnapshot = {
  schemaVersion: CONTENT_BUILD_SCHEMA_VERSION,
  id,
  revision: 1,
  channelId: input.channelId || null,
  legacyProjectId: input.legacyProjectId || null,
  legacyProjectName: input.legacyProjectName || null,
  profile: input.profile || {},
  stage: input.stage || "idea",
  assetIds: [],
  selections: {},
  relations: [],
  workflow: { completedStepIds: [], blockerIds: [] },
  youtube: null,
  createdAt,
  updatedAt: createdAt,
 }
 writeBuilds([...readBuilds(), build])
 appendContentBuildEvent({
  contentBuildId: id,
  eventType: "build.created",
  entityType: "content-build",
  entityId: id,
  actorType: input.actorType || "system",
  actorId: input.actorId || null,
  toolId: input.toolId || null,
  resultingState: build,
  timestamp: createdAt,
 })
 return build
}

export const updateContentBuild = (
 contentBuildId: string,
 updater: (current: ContentBuildSnapshot) => ContentBuildSnapshot,
): ContentBuildSnapshot => {
 const builds = readBuilds()
 const index = builds.findIndex(build => build.id === contentBuildId)
 if (index < 0) throw new Error("Unknown ContentBuild: " + contentBuildId)
 const current = builds[index]
 const next = {
  ...updater(current),
  id: current.id,
  schemaVersion: CONTENT_BUILD_SCHEMA_VERSION,
  revision: current.revision + 1,
  updatedAt: nowIso(),
 }
 builds[index] = next
 writeBuilds(builds)
 return next
}

export const patchContentBuildProfile = (
 contentBuildId: string,
 patch: Partial<ContentBuildProfile>,
 input: { actorType?: ContentBuildEvent["actorType"]; actorId?: string | null; toolId?: string | null } = {},
) => {
 const current = getContentBuild(contentBuildId)
 if (!current) throw new Error("Unknown ContentBuild: " + contentBuildId)
 const previous = current.profile
 const next = updateContentBuild(contentBuildId, build => ({
  ...build,
  profile: { ...build.profile, ...patch },
 }))
 appendContentBuildEvent({
  contentBuildId,
  eventType: "profile.updated",
  entityType: "content-build-profile",
  entityId: contentBuildId,
  actorType: input.actorType || "creator",
  actorId: input.actorId || null,
  toolId: input.toolId || null,
  previousState: previous,
  resultingState: next.profile,
 })
 return next
}

export const setContentBuildStage = (
 contentBuildId: string,
 stage: ContentBuildStage,
 input: { actorType?: ContentBuildEvent["actorType"]; actorId?: string | null; toolId?: string | null } = {},
) => {
 const current = getContentBuild(contentBuildId)
 if (!current) throw new Error("Unknown ContentBuild: " + contentBuildId)
 const next = updateContentBuild(contentBuildId, build => ({ ...build, stage }))
 if (current.stage !== stage) {
  appendContentBuildEvent({
   contentBuildId,
   eventType: "stage.changed",
   entityType: "content-build",
   entityId: contentBuildId,
   actorType: input.actorType || "tool",
   actorId: input.actorId || null,
   toolId: input.toolId || null,
   previousState: current.stage,
   resultingState: stage,
  })
 }
 return next
}

export const attachAssetToContentBuild = (
 contentBuildId: string,
 assetId: string,
 input: {
  toolId?: string | null
  evidenceIds?: string[]
  generationRecordId?: string | null
  traceId?: string | null
  metadata?: Record<string, unknown>
 } = {},
) => {
 const current = getContentBuild(contentBuildId)
 if (!current) throw new Error("Unknown ContentBuild: " + contentBuildId)
 const existed = current.assetIds.includes(assetId)
 const next = existed
  ? current
  : updateContentBuild(contentBuildId, build => ({ ...build, assetIds: [...build.assetIds, assetId] }))
 if (!existed) {
  appendContentBuildEvent({
   contentBuildId,
   eventType: "asset.attached",
   entityType: "asset",
   entityId: assetId,
   actorType: "tool",
   toolId: input.toolId || null,
   outputAssetIds: [assetId],
   evidenceIds: input.evidenceIds || [],
   generationRecordId: input.generationRecordId || null,
   traceId: input.traceId || null,
   metadata: input.metadata,
  })
 }
 return next
}

export const setContentBuildSelection = (
 contentBuildId: string,
 slot: string,
 assetId: string | null,
 input: { toolId?: string | null; actorType?: ContentBuildEvent["actorType"]; final?: boolean } = {},
) => {
 const current = getContentBuild(contentBuildId)
 if (!current) throw new Error("Unknown ContentBuild: " + contentBuildId)
 if (assetId && !current.assetIds.includes(assetId)) {
  attachAssetToContentBuild(contentBuildId, assetId, { toolId: input.toolId })
 }
 const refreshed = getContentBuild(contentBuildId)!
 const previous = refreshed.selections[slot] || null
 const next = updateContentBuild(contentBuildId, build => ({
  ...build,
  selections: { ...build.selections, [slot]: assetId },
 }))
 appendContentBuildEvent({
  contentBuildId,
  eventType: input.final ? "asset.finalized" : "asset.selected",
  entityType: "asset-selection",
  entityId: slot,
  actorType: input.actorType || "creator",
  toolId: input.toolId || null,
  previousState: previous,
  resultingState: assetId,
  inputAssetIds: previous ? [previous] : [],
  outputAssetIds: assetId ? [assetId] : [],
  metadata: { slot },
 })
 return next
}

export const addContentBuildAssetRelation = (input: {
 contentBuildId: string
 fromAssetId: string
 toAssetId: string
 relation: ContentBuildRelationType
 sourceToolId?: string | null
 metadata?: Record<string, unknown>
}): ContentBuildAssetRelation => {
 const build = getContentBuild(input.contentBuildId)
 if (!build) throw new Error("Unknown ContentBuild: " + input.contentBuildId)
 const existing = build.relations.find(relation =>
  relation.fromAssetId === input.fromAssetId &&
  relation.toAssetId === input.toAssetId &&
  relation.relation === input.relation
 )
 if (existing) return existing
 const relation: ContentBuildAssetRelation = {
  id: uuid(),
  contentBuildId: input.contentBuildId,
  fromAssetId: input.fromAssetId,
  toAssetId: input.toAssetId,
  relation: input.relation,
  createdAt: nowIso(),
  sourceToolId: input.sourceToolId || null,
  metadata: input.metadata,
 }
 updateContentBuild(input.contentBuildId, current => ({
  ...current,
  relations: [...current.relations, relation],
 }))
 appendContentBuildEvent({
  contentBuildId: input.contentBuildId,
  eventType: "asset.relation.created",
  entityType: "asset-relation",
  entityId: relation.id,
  actorType: "tool",
  toolId: input.sourceToolId || null,
  inputAssetIds: [input.fromAssetId],
  outputAssetIds: [input.toAssetId],
  metadata: { relation: input.relation, ...(input.metadata || {}) },
 })
 return relation
}

export const bindYouTubeVideo = (input: BindYouTubeVideoInput): ContentBuildSnapshot => {
 const build = getContentBuild(input.contentBuildId)
 if (!build) throw new Error("Unknown ContentBuild: " + input.contentBuildId)
 const previous = build.youtube || null
 const binding = {
  channelId: input.channelId || build.channelId || null,
  videoId: input.videoId,
  canonicalUrl: input.canonicalUrl || "https://www.youtube.com/watch?v=" + input.videoId,
  status: input.status || "uploaded" as const,
  uploadStartedAt: input.uploadStartedAt || null,
  uploadCompletedAt: input.uploadCompletedAt || null,
  scheduledAt: input.scheduledAt || null,
  premiereAt: input.premiereAt || null,
  publishedAt: input.publishedAt || null,
  initialTitleAssetId: input.initialTitleAssetId || null,
  initialThumbnailAssetId: input.initialThumbnailAssetId || null,
  finalRenderAssetId: input.finalRenderAssetId || null,
  lastVerifiedAt: input.lastVerifiedAt || null,
 }
 const next = updateContentBuild(input.contentBuildId, current => ({ ...current, youtube: binding }))
 appendContentBuildEvent({
  contentBuildId: input.contentBuildId,
  eventType: previous ? "youtube.state.changed" : "youtube.bound",
  entityType: "youtube-video",
  entityId: input.videoId,
  actorType: "youtube",
  toolId: input.toolId || null,
  previousState: previous,
  resultingState: binding,
  inputAssetIds: [input.finalRenderAssetId, input.initialTitleAssetId, input.initialThumbnailAssetId].filter((id): id is string => Boolean(id)),
 })
 return next
}

const legacyIdPart = (value: string) => encodeURIComponent(value.trim())

export const deriveLegacyContentBuildId = (input: {
 projectId?: string | null
 videoId?: string | null
}): string | null => {
 if (input.projectId) return "cb:project:" + legacyIdPart(input.projectId)
 if (input.videoId) return "cb:video:" + legacyIdPart(input.videoId)
 return null
}

export const ensureContentBuild = (input: CreateContentBuildInput & { videoId?: string | null } = {}): ContentBuildSnapshot | null => {
 const id = input.id || deriveLegacyContentBuildId({ projectId: input.legacyProjectId, videoId: input.videoId })
 if (!id) return null
 const existing = getContentBuild(id)
 if (existing) return existing
 const build = createContentBuild({ ...input, id })
 if (input.videoId) {
  return bindYouTubeVideo({
   contentBuildId: build.id,
   videoId: input.videoId,
   channelId: input.channelId || null,
   toolId: input.toolId || null,
  })
 }
 return build
}

export const resetContentBuildRepositoryForTests = () => {
 memoryBuilds = []
 memoryEvents = []
 if (canUseStorage()) {
  localStorage.removeItem(BUILDS_KEY)
  localStorage.removeItem(EVENTS_KEY)
 }
}
