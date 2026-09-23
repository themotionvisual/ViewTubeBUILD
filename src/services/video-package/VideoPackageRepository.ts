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

let memoryPackages: ViewTubeVideoPackage[] = []

const createStoreEnvelope = (packages: ViewTubeVideoPackage[]): VideoPackageStoreEnvelope => ({
  storeVersion: VIDEO_PACKAGE_STORE_VERSION,
  updatedAt: new Date().toISOString(),
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

const writeEnvelope = (packages: ViewTubeVideoPackage[]) => {
  localStorage.setItem(VIDEO_PACKAGE_STORAGE_KEY, JSON.stringify(createStoreEnvelope(packages)))
}

const preserveRecoverySnapshot = (raw: string) => {
  localStorage.setItem(VIDEO_PACKAGE_RECOVERY_KEY, raw)
}

const readStored = (): ViewTubeVideoPackage[] => {
  if (!canUseStorage()) return memoryPackages
  const raw = localStorage.getItem(VIDEO_PACKAGE_STORAGE_KEY)
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)

    // Legacy v0 storage was a raw package array. Preserve it exactly once,
    // then normalize it into the canonical versioned envelope.
    if (Array.isArray(parsed)) {
      const recovered = recoverValidPackages(parsed)
      preserveRecoverySnapshot(raw)
      writeEnvelope(recovered)
      return recovered
    }

    if (!parsed || typeof parsed !== "object") {
      throw new Error("Stored video package data is not an object.")
    }

    const envelope = parsed as Partial<VideoPackageStoreEnvelope> & { storeVersion?: unknown }
    if (envelope.storeVersion !== VIDEO_PACKAGE_STORE_VERSION || !Array.isArray(envelope.packages)) {
      throw new Error(`Unsupported video package store version: ${String(envelope.storeVersion)}`)
    }

    const recovered = recoverValidPackages(envelope.packages)
    if (recovered.length !== envelope.packages.length) {
      preserveRecoverySnapshot(raw)
      writeEnvelope(recovered)
    }
    return recovered
  } catch {
    try {
      preserveRecoverySnapshot(raw)
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
    writeEnvelope(packages)
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
