import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const assetGenerator = readFileSync(new URL("../AssetGenerator.ts", import.meta.url), "utf8")
const entry = readFileSync(new URL("../conceptSceneAssets.ts", import.meta.url), "utf8")
const studio = readFileSync(new URL("../../../views/ConceptSceneStudio.tsx", import.meta.url), "utf8")

describe("Concept + Scene governed generation integration", () => {
 it("registers concept and scene plans as governed creator asset types", () => {
  expect(assetGenerator).toContain('"concept_direction"')
  expect(assetGenerator).toContain('"scene_plan"')
 })

 it("routes both operations through AssetGenerator and the provider runner", () => {
  expect(entry).toContain("generateAsset")
  expect(entry).toContain("geminiAssetModelRunner")
  expect(entry).toContain("conceptDirectionStrategy")
  expect(entry).toContain("scenePlanStrategy")
 })

 it("binds generation to GenerationRequest, ContentBuild assets and ToolReceipt lineage", () => {
  expect(studio).toContain("prepareGenerationRequest")
  expect(studio).toContain("recordToolReceipt")
  expect(studio).toContain("createVersionedAsset")
  expect(studio).toContain("createAssetVariantGroup")
  expect(studio).toContain("generateConceptDirections")
  expect(studio).toContain("generateScenePlan")
  expect(studio).toContain("SCRIPT BEATS")
  expect(studio).toContain("MOTION BRIEF")
  expect(studio).toContain("READINESS REVIEW")
 })
})
