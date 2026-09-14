import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const ROOT = path.resolve(process.cwd(), "src")

const collect = (directory: string): string[] => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
 const absolute = path.join(directory, entry.name)
 if (entry.isDirectory()) return collect(absolute)
 return /\.(ts|tsx)$/.test(entry.name) ? [absolute] : []
})

const normalize = (absolute: string) => path.relative(process.cwd(), absolute).replace(/\\/g, "/")

/**
 * Existing exceptions are explicit migration debt, not endorsed architecture.
 * Keep this list shrinking. New UI/provider call sites should fail the guard.
 */
const ALLOWED_DIRECT_PROVIDER_CALLS = new Set([
 "src/context/GeminiKeyContext.tsx", // credential validation, not creator reasoning
 "src/services/CollabEngine.ts", // migrate after task contract is explicit
 "src/services/brain/Core.ts", // reflection/compression migration target
 "src/services/gemini.ts", // current provider service owner
 "src/views/dashboard/widgets/VideoCommentOperatorWidget.tsx", // CreatorAssetEngine migration target
])

const containsDirectProviderInvocation = (source: string) =>
 source.includes("models.generateContent")
 || source.includes("new GoogleGenAI(")

// Lock the current provider surface while BrainRuntime consolidation proceeds.
describe("Brain provider architecture guard", () => {
 it("does not allow new direct provider calls outside the explicit migration allowlist", () => {
  const violations = collect(ROOT)
   .filter((absolute) => containsDirectProviderInvocation(fs.readFileSync(absolute, "utf8")))
   .map(normalize)
   .filter((file) => !file.includes("/__tests__/") && !ALLOWED_DIRECT_PROVIDER_CALLS.has(file))

  expect(violations).toEqual([])
 })

 it("keeps UI-level direct generation debt isolated to the known migration target", () => {
  const uiViolations = collect(path.join(ROOT, "views"))
   .filter((absolute) => containsDirectProviderInvocation(fs.readFileSync(absolute, "utf8")))
   .map(normalize)

  expect(uiViolations).toEqual([
   "src/views/dashboard/widgets/VideoCommentOperatorWidget.tsx",
  ])
 })
})
