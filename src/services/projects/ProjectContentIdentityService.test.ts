import { beforeEach, describe, expect, it } from "vitest"
import type { Project } from "../../types"
import {
  listContentBuilds,
  resetContentBuildRepositoryForTests,
} from "../asset-engine/ContentBuildRepository"
import {
  listVideoPackages,
  resetVideoPackageRepositoryForTests,
} from "../video-package/VideoPackageRepository"
import { initializeProjectContentIdentity } from "./ProjectContentIdentityService"

const seedProject = (contentBuildId?: string): Project => ({
  id: "project-a",
  ...(contentBuildId ? { contentBuildId } : {}),
  name: "Project A",
  videoTitle: "Project A",
  status: "ideation",
  concept: "Test concept",
  plan: { concept: "Test concept", niche: "History", format: "long" },
})

describe("Project Content identity transaction", () => {
  beforeEach(() => {
    resetContentBuildRepositoryForTests()
    resetVideoPackageRepositoryForTests()
  })

  it("creates one ContentBuild and one Video Package on the same identity", () => {
    const result = initializeProjectContentIdentity(seedProject(), {
      channelId: "channel-a",
      sourceToolId: "project-builder",
    })

    expect(result.contentBuildId).toBe("cb:project:project-a")
    expect(result.project.contentBuildId).toBe(result.contentBuildId)
    expect(result.videoPackageId).toBe("vp:project-a:cb:project:project-a")
    expect(listContentBuilds()).toHaveLength(1)
    expect(listVideoPackages()).toHaveLength(1)
    expect(listVideoPackages()[0].contentBuildId).toBe(result.contentBuildId)
  })

  it("is idempotent when the same Project is resolved repeatedly", () => {
    const first = initializeProjectContentIdentity(seedProject(), { channelId: "channel-a" })
    const second = initializeProjectContentIdentity(first.project, { channelId: "channel-a" })

    expect(second.contentBuildId).toBe(first.contentBuildId)
    expect(second.videoPackageId).toBe(first.videoPackageId)
    expect(listContentBuilds()).toHaveLength(1)
    expect(listVideoPackages()).toHaveLength(1)
  })

  it("preserves an explicit existing ContentBuild identity", () => {
    const result = initializeProjectContentIdentity(seedProject("cb-existing"), {
      channelId: "channel-a",
    })

    expect(result.contentBuildId).toBe("cb-existing")
    expect(result.project.contentBuildId).toBe("cb-existing")
    expect(listVideoPackages()[0].contentBuildId).toBe("cb-existing")
  })

  it("creates the canonical ContentBuild even while Video Package channel scope is unavailable", () => {
    const result = initializeProjectContentIdentity(seedProject(), { channelId: null })

    expect(result.project.contentBuildId).toBe("cb:project:project-a")
    expect(result.videoPackageId).toBeNull()
    expect(listContentBuilds()).toHaveLength(1)
    expect(listVideoPackages()).toHaveLength(0)
  })
})
