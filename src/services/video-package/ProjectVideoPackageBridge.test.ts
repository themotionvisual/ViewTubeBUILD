import { beforeEach, describe, expect, it } from "vitest"
import type { Project, VaultAsset } from "../../types"
import {
  createContentBuild,
  getContentBuild,
  resetContentBuildRepositoryForTests,
} from "../asset-engine/ContentBuildRepository"
import {
  clearProjectVideoPackageThumbnail,
  ensureVideoPackageForProject,
  selectProjectVideoPackageThumbnail,
} from "./ProjectVideoPackageBridge"
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

const thumbnailAsset = (): VaultAsset => ({
  id: "vault-thumb-a",
  name: "Thumbnail A",
  kind: "image",
  source: "generated",
  createdAt: 1,
  updatedAt: 1,
  projectId: "project-a",
  projectName: "Project A",
  tags: ["thumbnail"],
  url: "https://example.com/thumb.jpg",
  previewUrl: "https://example.com/thumb-preview.jpg",
})

describe("Project Video Package bridge", () => {
  beforeEach(() => {
    resetVideoPackageRepositoryForTests()
    resetContentBuildRepositoryForTests()
    createContentBuild({ id: "cb-a", legacyProjectId: "project-a", legacyProjectName: "Project A" })
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

  it("selects a Vault thumbnail into ContentBuild and Video Package without forking identity", () => {
    const updated = selectProjectVideoPackageThumbnail(project(), thumbnailAsset(), {
      channelId: "channel-a",
      sourceToolId: "project-builder",
      now: "2026-09-22T20:20:00.000Z",
    })

    expect(getContentBuild("cb-a")?.selections.thumbnail).toBe("vault-thumb-a")
    expect(updated?.contentBuildId).toBe("cb-a")
    expect(updated?.packaging.selectedThumbnailId).toBe("thumbnail:vault-thumb-a")
    expect(updated?.packaging.thumbnailVariants).toContainEqual(expect.objectContaining({
      id: "thumbnail:vault-thumb-a",
      vaultAssetId: "vault-thumb-a",
      kind: "thumbnail",
    }))
    expect(listVideoPackages()).toHaveLength(1)
  })

  it("still selects the canonical ContentBuild thumbnail when channel package scope is unavailable", () => {
    const updated = selectProjectVideoPackageThumbnail(project(), thumbnailAsset(), {
      channelId: null,
      sourceToolId: "project-builder",
    })

    expect(updated).toBeNull()
    expect(getContentBuild("cb-a")?.selections.thumbnail).toBe("vault-thumb-a")
    expect(listVideoPackages()).toHaveLength(0)
  })

  it("clears package selection and canonical ContentBuild selection without deleting the candidate variant", () => {
    selectProjectVideoPackageThumbnail(project(), thumbnailAsset(), { channelId: "channel-a" })

    const cleared = clearProjectVideoPackageThumbnail(project(), {
      sourceToolId: "project-builder",
      now: "2026-09-22T20:22:00.000Z",
    })

    expect(getContentBuild("cb-a")?.selections.thumbnail).toBeNull()
    expect(cleared?.packaging.selectedThumbnailId).toBeNull()
    expect(cleared?.packaging.thumbnailVariants).toContainEqual(expect.objectContaining({
      id: "thumbnail:vault-thumb-a",
      vaultAssetId: "vault-thumb-a",
    }))
  })
})
