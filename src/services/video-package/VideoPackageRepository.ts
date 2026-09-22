import type { ViewTubeVideoPackage } from "./contracts"
import { validateVideoPackage } from "./packageValidation"
import { syncVideoPackageToContentBuild } from "../asset-engine/VideoPackageContentBuildBridge"

export const VIDEO_PACKAGE_STORAGE_KEY = "viewtube_video_packages_v1"

let memoryPackages: ViewTubeVideoPackage[] = []

const canUseStorage = () => {
  try {
    return typeof localStorage !== "undefined"
  } catch {
    return false
  }
}

const readStored = (): ViewTubeVideoPackage[] => {
  if (!canUseStorage()) return memoryPackages
  try {
    const raw = localStorage.getItem(VIDEO_PACKAGE_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
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
