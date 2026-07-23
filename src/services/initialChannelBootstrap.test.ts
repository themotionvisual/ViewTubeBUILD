import { describe, expect, it } from "vitest"

import { isInitialInventoryFresh } from "./initialChannelBootstrap"

describe("initial channel bootstrap freshness", () => {
 it("treats a missing restored snapshot as stale instead of dereferencing it", () => {
  expect(isInitialInventoryFresh(null, false)).toBe(false)
 })
})
