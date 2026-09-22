import { beforeEach, describe, expect, it } from "vitest"
import type { Project } from "../../types"
import { ensureVideoPackageForProject } from "./ProjectVideoPackageBridge"
import {
  findVideoPackageByProject,
  listVideoPackages,
  resetVideoPackageRepositoryForTests,
} from "./VideoPackageRepository"

const project = (contentBuildId = "cb-a"): Project => ({
  id: "project-a",
  contentBuildId,
  name: "Project A",
  videoTitle: "Project A working title",
  status: "ideation",
  plan: { concept: "A test concept", niche: "History", format: "long" },
})

describe("Project Video Package bridge", () => {
  beforeEach(() => {
    resetVideoPackageRepositoryForTests()
  })

  it("creates one package on the Project ContentBuild identity", () => {
    const first = ensureVideoPackageForProject(project(), {
      channelId: "channel-a",
      sourceToolId: "project-builder",
    })
    const second = ensureVideoPackageForProject(project(), {
      channelId: "channel-a",
      sourceToolId: "project-builder",
    })

    expect(first).not.toBeNull()
    expect(second?.id).toBe(first?.id)
    expect(first).toMatchObject({
      id: "vp:project-a:cb-a",
      projectId: "project-a",
      contentBuildId: "cb-a",
      channelId: "channel-a",
    })
    expect(listVideoPackages()).toHaveLength(1)
    expect(findVideoPackageByProject("project-a", "cb-a")?.id).toBe(first?.id)
  })

  it("refuses to silently fork a Project onto a different ContentBuild", () => {
    ensureVideoPackageForProject(project("cb-a"), { channelId: "channel-a" })
    expect(() => ensureVideoPackageForProject(project("cb-b"), { channelId: "channel-a" }))
      .toThrow(/different ContentBuild/)
    expect(listVideoPackages()).toHaveLength(1)
  })

  it("defers package creation until a channel scope exists", () => {
    expect(ensureVideoPackageForProject(project(), { channelId: null })).toBeNull()
    expect(listVideoPackages()).toHaveLength(0)
  })
})
