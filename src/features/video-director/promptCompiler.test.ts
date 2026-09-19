import { describe, expect, it } from "vitest"
import {
  buildSemanticDirectorPlan,
  compileProviderAgnosticDirectorPrompt,
  compileSemanticDirectorPacket,
} from "./promptCompiler"
import { createEmptyVideoDirectorProject } from "./projectSchema"

describe("Video Director semantic prompt compiler", () => {
  it("compiles Video DNA into a stable provider-agnostic plan", () => {
    const project = createEmptyVideoDirectorProject("Austerlitz")
    project.categories["concept-direction"].payload.brief = "Napoleon watches the Pratzen Heights assault at dawn."
    project.categories["camera-lens"].payload.focalLengthMm = 50
    project.categories["generation-output"].payload.aspectRatio = "9:16"

    const plan = buildSemanticDirectorPlan(project)
    expect(plan.name).toBe("Austerlitz")
    expect(plan.brief).toContain("Pratzen Heights")
    expect(plan.camera.focalLengthMm).toBe(50)
    expect(plan.output.aspectRatio).toBe("9:16")
  })

  it("produces deterministic text from the same normalized plan", () => {
    const project = createEmptyVideoDirectorProject()
    project.categories["concept-direction"].payload.brief = "A cavalry charge through winter fog."
    const plan = buildSemanticDirectorPlan(project)

    expect(compileProviderAgnosticDirectorPrompt(plan)).toBe(
      compileProviderAgnosticDirectorPrompt(plan),
    )
  })

  it("keeps negative constraints and output intent visible to provider adapters", () => {
    const project = createEmptyVideoDirectorProject()
    project.categories["negative-constraints"].payload.tags = ["modern objects", "fantasy armor"]
    project.categories["generation-output"].payload.resolution = "1080p"

    const packet = compileSemanticDirectorPacket(project)
    expect(packet.prompt).toContain("modern objects")
    expect(packet.prompt).toContain("fantasy armor")
    expect(packet.prompt).toContain("1080p")
    expect(JSON.parse(packet.json).schemaVersion).toBe(1)
  })
})
