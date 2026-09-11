import type { ViewTubeVideoPackage } from "./contracts"
import { validateVideoPackage } from "./packageValidation"

export const VIDEO_PACKAGE_STORE_VERSION = 1 as const
export const VIDEO_PACKAGE_STORE_PREFIX = "vt_video_packages"

export interface VideoPackageScope {
 channelId: string
 projectId: string
}

export interface VideoPackageStorage {
 getItem(key: string): string | null
 setItem(key: string, value: string): void
 removeItem(key: string): void
}

type VideoPackageStoreEnvelope = {
 storeVersion: typeof VIDEO_PACKAGE_STORE_VERSION
 updatedAt: string
 packages: ViewTubeVideoPackage[]
}

type LegacyVideoPackageStoreEnvelope = {
 storeVersion?: 0
 updatedAt?: string
 items?: ViewTubeVideoPackage[]
 packages?: ViewTubeVideoPackage[]
}

export type VideoPackageStoreRecovery = {
 key: string
 backupKey: string
 reason: string
 recoveredAt: string
}

export type VideoPackageStoreLoadResult = {
 packages: ViewTubeVideoPackage[]
 migrated: boolean
 recovery?: VideoPackageStoreRecovery
}

const cleanScopePart = (value: string, label: string) => {
 const cleaned = value.trim()
 if (!cleaned) throw new Error(`${label} is required.`)
 return encodeURIComponent(cleaned)
}

export const videoPackageStoreKey = ({ channelId, projectId }: VideoPackageScope): string =>
 `${VIDEO_PACKAGE_STORE_PREFIX}:v${VIDEO_PACKAGE_STORE_VERSION}:${cleanScopePart(channelId, "channelId")}:${cleanScopePart(projectId, "projectId")}`

const assertPackageScope = (videoPackage: ViewTubeVideoPackage, scope: VideoPackageScope) => {
 if (videoPackage.channelId !== scope.channelId.trim() || videoPackage.projectId !== scope.projectId.trim()) {
  throw new Error("Video package ownership does not match the requested channel/project scope.")
 }
 const validation = validateVideoPackage(videoPackage)
 if (!validation.valid) throw new Error(validation.issues.map((issue) => `${issue.path}: ${issue.message}`).join("; "))
}

const migrateEnvelope = (value: unknown, now: string): { envelope: VideoPackageStoreEnvelope; migrated: boolean } => {
 if (!value || typeof value !== "object") throw new Error("Stored video package data is not an object.")
 const candidate = value as LegacyVideoPackageStoreEnvelope & { storeVersion?: number }
 if (candidate.storeVersion === VIDEO_PACKAGE_STORE_VERSION && Array.isArray(candidate.packages)) {
  return { envelope: candidate as VideoPackageStoreEnvelope, migrated: false }
 }
 if ((candidate.storeVersion === 0 || candidate.storeVersion === undefined) && (Array.isArray(candidate.items) || Array.isArray(candidate.packages))) {
  return {
   envelope: {
    storeVersion: VIDEO_PACKAGE_STORE_VERSION,
    updatedAt: candidate.updatedAt || now,
    packages: candidate.items || candidate.packages || [],
   },
   migrated: true,
  }
 }
 throw new Error(`Unsupported video package store version: ${String(candidate.storeVersion)}`)
}

export const createVideoPackageStore = (
 storage: VideoPackageStorage | undefined = typeof localStorage === "undefined" ? undefined : localStorage,
 now: () => string = () => new Date().toISOString(),
) => {
 const requireStorage = () => {
  if (!storage) throw new Error("Video package storage is unavailable in this environment.")
  return storage
 }

 const saveAll = (scope: VideoPackageScope, packages: ViewTubeVideoPackage[]) => {
  const target = requireStorage()
  packages.forEach((videoPackage) => assertPackageScope(videoPackage, scope))
  const envelope: VideoPackageStoreEnvelope = { storeVersion: VIDEO_PACKAGE_STORE_VERSION, updatedAt: now(), packages }
  target.setItem(videoPackageStoreKey(scope), JSON.stringify(envelope))
  return packages
 }

 const load = (scope: VideoPackageScope): VideoPackageStoreLoadResult => {
  const target = requireStorage()
  const key = videoPackageStoreKey(scope)
  const raw = target.getItem(key)
  if (!raw) return { packages: [], migrated: false }
  try {
   const result = migrateEnvelope(JSON.parse(raw), now())
   result.envelope.packages.forEach((videoPackage) => assertPackageScope(videoPackage, scope))
   if (result.migrated) saveAll(scope, result.envelope.packages)
   return { packages: result.envelope.packages, migrated: result.migrated }
  } catch (error) {
   const recoveredAt = now()
   const backupKey = `${key}:recovery:${recoveredAt}`
   target.setItem(backupKey, raw)
   target.removeItem(key)
   return {
    packages: [],
    migrated: false,
    recovery: { key, backupKey, reason: error instanceof Error ? error.message : String(error), recoveredAt },
   }
  }
 }

 const upsert = (scope: VideoPackageScope, videoPackage: ViewTubeVideoPackage) => {
  assertPackageScope(videoPackage, scope)
  const current = load(scope).packages
  return saveAll(scope, [videoPackage, ...current.filter((item) => item.id !== videoPackage.id)])
 }

 const get = (scope: VideoPackageScope, packageId: string) => load(scope).packages.find((item) => item.id === packageId)

 const remove = (scope: VideoPackageScope, packageId: string) => {
  const current = load(scope).packages
  const next = current.filter((item) => item.id !== packageId)
  if (next.length !== current.length) saveAll(scope, next)
  return next.length !== current.length
 }

 return { load, saveAll, upsert, get, remove }
}

export const createVideoPackageAutosave = (
 save: (videoPackage: ViewTubeVideoPackage) => void,
 delayMs = 500,
) => {
 let timer: ReturnType<typeof setTimeout> | undefined
 let pending: ViewTubeVideoPackage | undefined

 const flush = () => {
  if (timer) clearTimeout(timer)
  timer = undefined
  const next = pending
  pending = undefined
  if (next) save(next)
 }

 const schedule = (videoPackage: ViewTubeVideoPackage) => {
  pending = videoPackage
  if (timer) clearTimeout(timer)
  timer = setTimeout(flush, delayMs)
 }

 const cancel = () => {
  if (timer) clearTimeout(timer)
  timer = undefined
  pending = undefined
 }

 return { schedule, flush, cancel, hasPending: () => Boolean(pending) }
}
