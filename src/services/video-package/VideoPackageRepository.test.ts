import { beforeEach, describe, expect, it } from "vitest"
import { getContentBuild, resetContentBuildRepositoryForTests } from "../asset-engine/ContentBuildRepository"
import { createVideoPackage } from "./packageValidation"
import {
  getVideoPackageRecoverySnapshot,
  listVideoPackages,
  resetVideoPackageRepositoryForTests,
  saveVideoPackage,
  VIDEO_PACKAGE_STORAGE_KEY,
  VIDEO_PACKAGE_STORE_VERSION,
} from "./VideoPackageRepository"

describe("VideoPackageRepository consolidation", () => {
  beforeEach(() => {
    resetVideoPackageRepositoryForTests()
    resetContentBuildRepositoryForTests()
  })

  it("synchronizes a saved package to the same ContentBuild identity", () => {
    const videoPackage = createVideoPackage({
      id: "vp-a",
      contentBuildId: "cb-a",
      channelId: "channel-a",
      projectId: "project-a",
      workingTitle: "Austerlitz",
      format: "long",
    })

    saveVideoPackage(videoPackage)

    const build = getContentBuild("cb-a")
    expect(build).not.toBeNull()
    expect(build?.legacyProjectId).toBe("project-a")
    expect(build?.channelId).toBe("channel-a")
  })

  it("rejects packages that do not carry the canonical ContentBuild identity", () => {
    const base = createVideoPackage({
      id: "vp-missing-build",
      contentBuildId: "cb-placeholder",
      channelId: "channel-a",
      projectId: "project-a",
      workingTitle: "Missing build",
      format: "long",
    })
    const missingBuild = { ...base, contentBuildId: undefined }

    expect(() => saveVideoPackage(missingBuild)).toThrow("canonical contentBuildId")
    expect(listVideoPackages()).toEqual([])
  })

  it("rejects a second package for the same Project when it points at a different ContentBuild", () => {
    const first = createVideoPackage({
      id: "vp-first",
      contentBuildId: "cb-first",
      channelId: "channel-a",
      projectId: "project-a",
      workingTitle: "First",
      format: "long",
    })
    const conflicting = createVideoPackage({
      id: "vp-conflicting",
      contentBuildId: "cb-second",
      channelId: "channel-a",
      projectId: "project-a",
      workingTitle: "Second",
      format: "long",
    })

    saveVideoPackage(first)
    expect(() => saveVideoPackage(conflicting)).toThrow("different ContentBuild")
    expect(listVideoPackages()).toHaveLength(1)
  })

  it("writes packages inside the canonical versioned store envelope", () => {
    if (typeof localStorage === "undefined") return
    const videoPackage = createVideoPackage({
      id: "vp-envelope",
      contentBuildId: "cb-envelope",
      channelId: "channel-a",
      projectId: "project-envelope",
      workingTitle: "Envelope",
      format: "long",
    })

    saveVideoPackage(videoPackage)

    const stored = JSON.parse(localStorage.getItem(VIDEO_PACKAGE_STORAGE_KEY) || "{}")
    expect(stored.storeVersion).toBe(VIDEO_PACKAGE_STORE_VERSION)
    expect(stored.packages).toHaveLength(1)
    expect(stored.packages[0].id).toBe("vp-envelope")
    expect(typeof stored.updatedAt).toBe("string")
  })

  it("migrates the legacy raw-array store in place and preserves the original payload", () => {
    if (typeof localStorage === "undefined") return
    const videoPackage = createVideoPackage({
      id: "vp-legacy-array",
      contentBuildId: "cb-legacy-array",
      channelId: "channel-a",
      projectId: "project-legacy-array",
      workingTitle: "Legacy array",
      format: "long",
    })
    const legacyRaw = JSON.stringify([videoPackage])
    localStorage.setItem(VIDEO_PACKAGE_STORAGE_KEY, legacyRaw)

    expect(listVideoPackages().map(item => item.id)).toEqual(["vp-legacy-array"])

    const migrated = JSON.parse(localStorage.getItem(VIDEO_PACKAGE_STORAGE_KEY) || "{}")
    expect(migrated.storeVersion).toBe(VIDEO_PACKAGE_STORE_VERSION)
    expect(migrated.packages.map((item: { id: string }) => item.id)).toEqual(["vp-legacy-array"])
    expect(getVideoPackageRecoverySnapshot()).toBe(legacyRaw)
  })

  it("preserves malformed browser data in a recovery snapshot instead of creating a second package store", () => {
    if (typeof localStorage === "undefined") return
    localStorage.setItem(VIDEO_PACKAGE_STORAGE_KEY, "{broken-json")
    expect(getVideoPackageRecoverySnapshot()).toBeNull()

    // Reading triggers repair while preserving the exact corrupt payload for diagnosis/recovery.
    expect(listVideoPackages()).toEqual([])
    expect(getVideoPackageRecoverySnapshot()).toBe("{broken-json")

    resetVideoPackageRepositoryForTests()
    expect(getVideoPackageRecoverySnapshot()).toBeNull()
  })
})
