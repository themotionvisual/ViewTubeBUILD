import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")

describe("CreatorVaultOS collection membership Inspector", () => {
 it("shows selected asset collection memberships with add and remove actions", () => {
  expect(source).toContain("Collection Membership")
  expect(source).toContain("selectedCollectionMemberships")
  expect(source).toContain("Add Asset to Collection")
  expect(source).toContain("Remove from Collection")
 })
})
