import { describe, expect, it } from "vitest"
import { createVideoPackage, transitionVideoPackage, validateVideoPackage } from "./packageValidation"

const create = () => createVideoPackage({
 id: "package-a",
 channelId: "channel-a",
 projectId: "project-a",
 workingTitle: "Working title",
 format: "long",
 now: "2026-09-11T00:00:00.000Z",
})

describe("canonical video package contract", () => {
 it("creates a channel- and project-scoped package with provenance", () => {
  const result = create()
  expect(validateVideoPackage(result)).toEqual({ valid: true, issues: [] })
  expect(result).toMatchObject({ schemaVersion: 1, contentBuildId: "package-a", version: 1, channelId: "channel-a", projectId: "project-a", identity: { status: "idea" } })
  expect(result.provenance[0]).toMatchObject({ action: "package_created", sourceToolId: "creator-canvas-os" })
 })

 it("rejects missing ownership scope", () => {
  const result = validateVideoPackage({ ...create(), channelId: "", projectId: "" })
  expect(result.valid).toBe(false)
  if (!result.valid) expect(result.issues.map((issue) => issue.path)).toEqual(expect.arrayContaining(["channelId", "projectId"]))
 })

 it("allows adjacent lifecycle transitions and rejects skipped stages", () => {
  const developing = transitionVideoPackage(create(), "developing", "2026-09-11T01:00:00.000Z")
  expect(developing).toMatchObject({ version: 2, identity: { status: "developing" } })
  expect(() => transitionVideoPackage(developing, "packaging")).toThrow("developing -> packaging")
 })

 it("rejects selected packaging artifacts that are not in the package", () => {
  const result = validateVideoPackage({ ...create(), packaging: { ...create().packaging, selectedTitleId: "missing-title" } })
  expect(result.valid).toBe(false)
  if (!result.valid) expect(result.issues).toContainEqual(expect.objectContaining({ path: "packaging.selectedTitleId", code: "reference" }))
 })

 it("blocks scheduling without approved title, thumbnail, approval, and resolved blockers", () => {
  const base = create()
  const scheduled = { ...base, identity: { ...base.identity, status: "scheduled" as const } }
  const result = validateVideoPackage(scheduled)
  expect(result.valid).toBe(false)
  if (!result.valid) expect(result.issues.map((issue) => issue.path)).toEqual(expect.arrayContaining([
   "packaging.selectedTitleId", "packaging.selectedThumbnailId", "publishing.approval",
  ]))
 })
})
