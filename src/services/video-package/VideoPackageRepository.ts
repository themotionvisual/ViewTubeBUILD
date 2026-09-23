import type { ViewTubeVideoPackage } from "./contracts"
import { validateVideoPackage } from "./packageValidation"
import {
  projectContentBuildSelectionsToVideoPackage,
  syncVideoPackageToContentBuild,
} from "../asset-engine/VideoPackageContentBuildBridge"

export const VIDEO_PACKAGE_STORAGE_KEY = "viewtube_video_packages_v1"
export const VIDEO_PACKAGE_RECOVERY_KEY = "viewtube_video_packages_recovery_v1"
export const VIDEO_PACKAGE_STORE_VERSION = 1 as const

type VideoPackageStoreEnvelope = {
  storeVersion: typeof VIDEO_PACKAGE_STORE_VERSION
  updatedAt: string
  packages: ViewTubeVideoPackage[]
}

type LegacyVideoPackageStoreEnvelope = {
  storeVersion?: number
  updatedAt?: string
  items?: unknown
  packages?: unknown
}

type NormalizedVideoPackageStore = {
  packages: ViewTubeVideoPackage[]
  migrated: boolean
  repaired: boolean
}

let memoryPackages: ViewTubeVideoPackage[] = []

const nowIso = () => new Date().toISOString()

const createStoreEnvelope = (
  packages: ViewTubeVideoPackage[],
  updatedAt = nowIso(),
): VideoPackageStoreEnvelope => ({
  storeVersion: VIDEO_PACKAGE_STORE_VERSION,
  updatedAt,
  packages,
})

const canUseStorage = () => {
  try {
    return typeof localStorage !== "undefined"
  } catch {
    return false
  }
}

const recoverValidPackages = (value: unknown): ViewTubeVideoPackage[] => {
  if (!Array.isArray(value)) return []
  return value.filter((candidate): candidate is ViewTubeVideoPackage => {
    if (!candidate || typeof candidate !== "object") return false
    try {
      return validateVideoPackage(candidate as ViewTubeVideoPackage).valid
    } catch {
      return false
    }
  })
}

const normalizeStoredValue = (value: unknown): NormalizedVideoPackageStore => {
  if (Array.isArray(value)) {
    const packages = recoverValidPackages(value)
    return {
      packages,
      migrated: true,
      repaired: packages.length !== value.length,
    }
  }

  if (!value || typeof value !== "object") {
    throw new Error("Stored Video Package data must be an array or versioned envelope.")
  }

  const candidate = value as LegacyVideoPackageStoreEnvelope

  if (candidate.storeVersion === VIDEO_PACKAGE_STORE_VERSION && Array.isArray(candidate.packages)) {
    const packages = recoverValidPackages(candidate.packages)
    return {
      packages,
      migrated: false,
      repaired: packages.length !== candidate.packages.length,
    }
  }

  if (
    (candidate.storeVersion === 0 || candidate.storeVersion === undefined) &&
    (Array.isArray(candidate.items) || Array.isArray(candidate.packages))
  ) {
    const source = Array.isArray(candidate.items) ? candidate.items : candidate.packages as unknown[]
    const packages = recoverValidPackages(source)
    return {
      packages,
      migrated: true,
      repaired: packages.length !== source.length,
    }
  }

  throw new Error(`Unsupported Video Package store version: ${String(candidate.storeVersion)}`)
}

const readStored = (): ViewTubeVideoPackage[] => {
  if (!canUseStorage()) return memoryPackages
  const raw = localStorage.getItem(VIDEO_PACKAGE_STORAGE_KEY)
  if (!raw) return []

  try {
    const normalized = normalizeStoredValue(JSON.parse(raw))
    if (normalized.migrated || normalized.repaired) {
      localStorage.setItem(VIDEO_PACKAGE_RECOVERY_KEY, raw)
      localStorage.setItem(
        VIDEO_PACKAGE_STORAGE_KEY,
        JSON.stringify(createStoreEnvelope(normalized.packages)),
      )
    }
    return normalized.packages
  } catch {
    try {
      localStorage.setItem(VIDEO_PACKAGE_RECOVERY_KEY, raw)
      localStorage.removeItem(VIDEO_PACKAGE_STORAGE_KEY)
    } catch {
      // Preserve the in-memory fallback if browser storage cannot be repaired.
    }
    return []
  }
}

const writeStored = (packages: ViewTubeVideoPackage[]) => {
  if (!canUseStorage()) {
    memoryPackages = packages
    return
  }
  try {
    localStorage.setItem(
      VIDEO_PACKAGE_STORAGE_KEY,
      JSON.stringify(createStoreEnvelope(packages)),
    )
  } catch {
    memoryPackages = packages
  }
}

export const listVideoPackages = (): ViewTubeVideoPackage[] =>
  readStored()
    .map(projectContentBuildSelectionsToVideoPackage)
    .slice()
    .sort((a, b) => b.identity.updatedAt.localeCompare(a.identity.updatedAt))

export const getVideoPackage = (packageId: string): ViewTubeVideoPackage | null => {
  const videoPackage = readStored().find((candidate) => candidate.id === packageId)
  return videoPackage ? projectContentBuildSelectionsToVideoPackage(videoPackage) : null
}

export const getVideoPackageRecoverySnapshot = (): string | null => {
  if (!canUseStorage()) return null
  try {
    return localStorage.getItem(VIDEO_PACKAGE_RECOVERY_KEY)
  } catch {
    return null
  }
}

export const findVideoPackageByProject = (
  projectId: string,
  contentBuildId?: string | null,
): ViewTubeVideoPackage | null =>
  (() => {
    const videoPackage = readStored().find((candidate) =>
      candidate.projectId === projectId &&
      (!contentBuildId || candidate.contentBuildId === contentBuildId)
    )
    return videoPackage ? projectContentBuildSelectionsToVideoPackage(videoPackage) : null
  })()

export const saveVideoPackage = (videoPackage: ViewTubeVideoPackage): ViewTubeVideoPackage => {
  if (!videoPackage.contentBuildId?.trim()) {
    throw new Error(`Video Package ${videoPackage.id} cannot be saved without a canonical contentBuildId.`)
  }

  const validation = validateVideoPackage(videoPackage)
  if (!validation.valid) {
    throw new Error(validation.issues.map((issue) => `${issue.path}: ${issue.message}`).join("; "))
  }

  const packages = readStored()
  const conflictingProjectPackage = packages.find((candidate) =>
    candidate.id !== videoPackage.id &&
    candidate.projectId === videoPackage.projectId &&
    candidate.contentBuildId !== videoPackage.contentBuildId
  )
  if (conflictingProjectPackage) {
    throw new Error(
      `Project ${videoPackage.projectId} already has a Video Package scoped to a different ContentBuild (${conflictingProjectPackage.contentBuildId || "missing"}).`,
    )
  }
  const index = packages.findIndex((candidate) => candidate.id === videoPackage.id)
  const next = index < 0
    ? [...packages, videoPackage]
    : packages.map((candidate, candidateIndex) => candidateIndex === index ? videoPackage : candidate)
  writeStored(next)
  syncVideoPackageToContentBuild(videoPackage, { mode: "strict" })
  return videoPackage
}

export const resetVideoPackageRepositoryForTests = () => {
  memoryPackages = []
  if (!canUseStorage()) return
  try {
    localStorage.removeItem(VIDEO_PACKAGE_STORAGE_KEY)
    localStorage.removeItem(VIDEO_PACKAGE_RECOVERY_KEY)
  } catch {
    // Best-effort compatibility cleanup.
  }
}
