import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const integrationFiles = [
 "src/services/brain/BrainTaskProfileRegistry.ts",
 "src/services/brain/BrainCapabilityRegistry.ts",
 "src/services/brain/BrainContextBroker.ts",
 "src/services/brain/BrainOrchestrator.ts",
 "src/services/aiBrainCommandInterface.ts",
 "src/views/AIBrainCommandInterface.tsx",
]

describe("Brain discussion architecture guard", () => {
 it("does not couple discussion quality to consent, owner grants, privacy, or account model availability", () => {
  const imports = integrationFiles.flatMap((file) =>
   readFileSync(resolve(process.cwd(), file), "utf8")
    .split("\n")
    .filter((line) => /^import\b/.test(line.trim())),
  )

  expect(imports.join("\n")).not.toMatch(
   /consent|owner.?grant|brainDataPrivacy|BrainModelAvailability|services\/account/i,
  )
 })
})
