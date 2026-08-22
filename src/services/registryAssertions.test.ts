import { describe, expect, it } from "vitest"
import { assertUniqueIds, findDuplicateIds } from "./registryAssertions"

describe("registry ID assertions", () => {
  it("reports duplicate IDs deterministically", () => {
    expect(findDuplicateIds([{ id: "b" }, { id: "a" }, { id: "b" }], (item) => item.id)).toEqual([
      { id: "b", count: 2 },
    ])
  })

  it("throws with the registry label and duplicate count", () => {
    expect(() => assertUniqueIds([{ id: "same" }, { id: "same" }], (item) => item.id, "Test registry"))
      .toThrow("Test registry contains duplicate IDs: same (2)")
  })
})
