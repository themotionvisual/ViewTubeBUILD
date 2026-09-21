import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const capabilitySource = readFileSync(new URL("../BrainCapabilityRegistry.ts", import.meta.url), "utf8")
const contextSource = readFileSync(new URL("../BrainContextBroker.ts", import.meta.url), "utf8")
const orchestratorSource = readFileSync(new URL("../BrainOrchestrator.ts", import.meta.url), "utf8")

describe("Brain channel-scope contract", () => {
 it("reads capability policy for the active channel", () => {
  expect(capabilitySource).toContain("channelId?: string | null")
  expect(capabilitySource).toContain("readBrainUserControls(input.channelId)")
 })

 it("passes channel scope into capability selection", () => {
  expect(orchestratorSource).toContain(
   "selectBrainCapabilities({ userText: input.userText, snapshot: input.snapshot, channelId: input.channelId })",
  )
 })

 it("passes channel scope into both context-pack builds", () => {
  const matches = orchestratorSource.match(/buildBrainContextPack\(\{\n\s+channelId: input\.channelId,/g) || []
  expect(matches.length).toBe(2)
 })

 it("keeps context policy itself channel-scoped", () => {
  expect(contextSource).toContain("channelId?: string | null")
  expect(contextSource).toContain("readBrainUserControls(input.channelId)")
 })
})
