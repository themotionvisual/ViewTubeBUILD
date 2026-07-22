import { beforeEach, describe, expect, it, vi } from "vitest"

describe("accountCoordinator runtime resolution", () => {
 beforeEach(() => {
  vi.resetModules()
  vi.stubGlobal("window", {
   location: {
    origin: "https://viewtube.live",
    hostname: "viewtube.live",
   },
  } as unknown as Window)
 })

 it("enables the account server on a deployed host even when the env flag is unset", async () => {
  const { isUnifiedAccountServerEnabled } = await import("./accountCoordinator")
  expect(isUnifiedAccountServerEnabled("viewtube.live")).toBe(true)
 })

 it("prefers the deployed origin over localhost account bases", async () => {
  const { accountUrl, resolveAccountApiBase } = await import("./accountCoordinator")
  expect(resolveAccountApiBase("viewtube.live", "https://viewtube.live")).toBe("https://viewtube.live")
  expect(accountUrl("/api/account/snapshot")).toBe("https://viewtube.live/api/account/snapshot")
 })
})
