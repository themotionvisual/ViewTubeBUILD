import { beforeEach, describe, expect, it } from "vitest"
import { getContentBuild, resetContentBuildRepositoryForTests } from "../asset-engine/ContentBuildRepository"
import { createVideoPackage } from "./packageValidation"
import {
  getVideoPackageRecoverySnapshot,
  listVideoPackages,
  resetVideoPackageRepositoryForTests,
  saveVideoPackage,
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

  it("preserves malformed browser data in a recovery snapshot instead of creating a second package store", () => {
    if (typeof localStorage === "undefined") return
    localStorage.setItem("viewtube_video_packages_v1", "{broken-json")
    expect(getVideoPackageRecoverySnapshot()).toBeNull()

    // Reading triggers repair while preserving the exact corrupt payload for diagnosis/recovery.
    expect(listVideoPackages()).toEqual([])
    expect(getVideoPackageRecoverySnapshot()).toBe("{broken-json")

    resetVideoPackageRepositoryForTests()
    expect(getVideoPackageRecoverySnapshot()).toBeNull()
  })
})
