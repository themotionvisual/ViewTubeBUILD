import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const source = readFileSync(new URL("./AIBrainCommandInterface.tsx", import.meta.url), "utf8")

describe("AI Brain runtime surface integration", () => {
 it("mounts the canonical backend runtime snapshot above the conversation workspace", () => {
  expect(source).toContain('from "../services/brain/BrainRuntimeSnapshot"')
  expect(source).toContain('from "../components/brain/BrainRuntimePanel"')
  expect(source).toContain("readBrainRuntimeSnapshot")
  expect(source).toContain("runtimeSnapshot")
  expect(source).toContain("<BrainRuntimePanel")
  expect(source).toContain("snapshot={runtimeSnapshot}")
 })
})
