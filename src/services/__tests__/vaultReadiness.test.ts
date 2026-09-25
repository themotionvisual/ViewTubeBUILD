import { beforeEach, describe, expect, it } from "vitest"
import {
 createContentBuild,
 resetContentBuildRepositoryForTests,
 setContentBuildSelection,
} from "../asset-engine/ContentBuildRepository"
import { getVaultProjectReadiness } from "../vaultReadiness"

describe("getVaultProjectReadiness", () => {
 beforeEach(() => resetContentBuildRepositoryForTests())

 it("projects canonical ContentBuild selections and factual storage size", () => {
  const build = createContentBuild({
   id: "cb-ready",
   legacyProjectId: "p-ready",
   legacyProjectName: "Austerlitz",
  })
  setContentBuildSelection(build.id, "script", "asset-script")
  setContentBuildSelection(build.id, "thumbnail", "asset-thumb")

  const result = getVaultProjectReadiness({
   project: {
    id: "p-ready",
    contentBuildId: build.id,
    name: "Austerlitz",
    videoTitle: "How Napoleon Won",
    description: "Description",
    tags: "napoleon,austerlitz",
    status: "active",
   },
   assets: [
    { id: "asset-script", metadata: { byteSize: 1200 } },
    { id: "asset-thumb", metadata: { byteSize: 3000 } },
    { id: "asset-unknown", metadata: {} },
   ],
  })

  expect(result.slots.find((slot) => slot.id === "script")?.state).toBe("selected")
  expect(result.slots.find((slot) => slot.id === "title")?.state).toBe("legacy")
  expect(result.packageReady).toBe(true)
  expect(result.publishReady).toBe(false)
  expect(result.storage).toEqual({
   knownBytes: 4200,
   knownAssetCount: 2,
   unknownSizeCount: 1,
  })
 })

 it("lists missing packaging dependencies without inventing readiness", () => {
  const result = getVaultProjectReadiness({
   project: { id: "p-empty", name: "Empty", status: "active" },
   assets: [],
  })

  expect(result.packageReady).toBe(false)
  expect(result.missingPackaging).toEqual(
   expect.arrayContaining(["script", "title", "thumbnail", "description", "tags"]),
  )
 })
})
