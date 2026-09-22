import type { ViewTubeVideoPackage } from "./contracts"
import { validateVideoPackage } from "./packageValidation"
import { syncVideoPackageToContentBuild } from "../asset-engine/VideoPackageContentBuildBridge"

export const VIDEO_PACKAGE_STORAGE_KEY = "viewtube_video_packages_v1"
export const VIDEO_PACKAGE_RECOVERY_KEY = "viewtube_video_packages_recovery_v1"

let memoryPackages: ViewTubeVideoPackage[] = []

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

const readStored = (): ViewTubeVideoPackage[] => {
  if (!canUseStorage()) return memoryPackages
  const raw = localStorage.getItem(VIDEO_PACKAGE_STORAGE_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    const recovered = recoverValidPackages(parsed)
    if (recovered.length !== (Array.isArray(parsed) ? parsed.length : 0)) {
      localStorage.setItem(VIDEO_PACKAGE_RECOVERY_KEY, raw)
      localStorage.setItem(VIDEO_PACKAGE_STORAGE_KEY, JSON.stringify(recovered))
    }
    return recovered
  } catch {
    try {
      localStorage.setItem(VIDEO_PACKAGE_RECOVERY_KEY, raw)
      localStorage.removeItem(VIDEO_PACKAGE_STORAGE_KEY)
    localStorage.removeItem(VIDEO_PACKAGE_RECOVERY_KEY)
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
    localStorage.setItem(VIDEO_PACKAGE_STORAGE_KEY, JSON.stringify(packages))
  } catch {
    memoryPackages = packages
  }
}

export const listVideoPackages = (): ViewTubeVideoPackage[] =>
  readStored().slice().sort((a, b) => b.identity.updatedAt.localeCompare(a.identity.updatedAt))

export const getVideoPackage = (packageId: string): ViewTubeVideoPackage | null =>
  readStored().find((videoPackage) => videoPackage.id === packageId) || null

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
  readStored().find((videoPackage) =>
    videoPackage.projectId === projectId &&
    (!contentBuildId || videoPackage.contentBuildId === contentBuildId)
  ) || null

export const saveVideoPackage = (videoPackage: ViewTubeVideoPackage): ViewTubeVideoPackage => {
  const validation = validateVideoPackage(videoPackage)
  if (!validation.valid) {
    throw new Error(validation.issues.map((issue) => `${issue.path}: ${issue.message}`).join("; "))
  }

  const packages = readStored()
  const index = packages.findIndex((candidate) => candidate.id === videoPackage.id)
  const next = index < 0
    ? [...packages, videoPackage]
    : packages.map((candidate, candidateIndex) => candidateIndex === index ? videoPackage : candidate)
  writeStored(next)
  syncVideoPackageToContentBuild(videoPackage)
  return videoPackage
}

export const resetVideoPackageRepositoryForTests = () => {
  memoryPackages = []
  if (!canUseStorage()) return
  try {
    localStorage.removeItem(VIDEO_PACKAGE_STORAGE_KEY)
  } catch {
    // Best-effort compatibility cleanup.
  }
}
