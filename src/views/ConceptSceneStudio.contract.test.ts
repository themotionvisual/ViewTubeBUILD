import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const source = readFileSync(new URL("./ConceptSceneStudio.tsx", import.meta.url), "utf8")
const hub = readFileSync(new URL("./StudioHub.tsx", import.meta.url), "utf8")

describe("Concept + Scene Studio production surface", () => {
 it("uses the canonical Toolbox hierarchy for the complete creative workflow", () => {
  expect(source).toContain("ToolboxScaffold")
  expect(source).toContain("CONCEPT + SCENE STUDIO")
  expect(source).toContain("CONCEPT FORGE")
  expect(source).toContain("DIRECTION DECK")
  expect(source).toContain("SCENE DESIGN STUDIO")
  expect(source).toContain("PRODUCTION HANDOFF")
  expect(source).toContain("SubToolboxDropdownControl")
  expect(source).toContain("StandardTextArea")
  expect(source).not.toContain("<select")
 })

 it("preserves one Project/ContentBuild-aware handoff instead of inventing a parallel store", () => {
  expect(source).toContain("resolveWorkspaceContentBuildToolContext")
  expect(source).toContain("createSuperToolActionPacket")
  expect(source).toContain("storyboard-studio")
  expect(source).toContain("video-director")
  expect(source).toContain("video-asset-engine")
  expect(source).toContain("video-editor")
 })

 it("is mounted in Studio Hub as a real creator tool", () => {
  expect(hub).toContain('import ConceptSceneStudio from "./ConceptSceneStudio"')
  expect(hub).toContain("<ConceptSceneStudio")
 })
})
