import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const read = (relativePath: string) =>
 fs.readFileSync(path.resolve(process.cwd(), relativePath), "utf8")

describe("shared prompt constitution integration", () => {
 it("places the shared constitution in Brain context before evidence sections", () => {
  const broker = read("src/services/brain/BrainContextBroker.ts")
  expect(broker).toContain("buildBrainPromptConstitution")
  expect(broker).toContain("PROMPT CONSTITUTION")
  expect(broker.indexOf("PROMPT CONSTITUTION")).toBeLessThan(
   broker.indexOf("CHANNEL EVIDENCE"),
  )
 })

 it("records shared constitution and family versions in Brain turn provenance", () => {
  const orchestrator = read("src/services/brain/BrainOrchestrator.ts")
  expect(orchestrator).toContain("BRAIN_PROMPT_CONSTITUTION_VERSION")
  expect(orchestrator).toContain("promptConstitutionVersion")
  expect(orchestrator).toContain("promptFamilyVersion")
 })

 it("makes governed asset generation consume the same shared constitution", () => {
  const assets = read("src/services/brain/AssetGenerator.ts")
  expect(assets).toContain("SHARED_PROMPT_CONSTITUTION")
  expect(assets).toContain("BRAIN_PROMPT_CONSTITUTION_VERSION")
  expect(assets).toContain('recordPromptVersion("shared_constitution"')
 })
})
