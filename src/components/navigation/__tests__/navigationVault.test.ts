import { describe, expect, it } from "vitest"
import { PRIMARY_NAV_ITEMS } from "../navigationContract"

describe("primary navigation Vault entry", () => {
 it("includes the production Vault route in primary navigation", () => {
  expect(PRIMARY_NAV_ITEMS).toEqual(
   expect.arrayContaining([
    expect.objectContaining({
     id: "VAULT",
     path: "/vault",
     label: "Vault",
    }),
   ]),
  )
 })
})
