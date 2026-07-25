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

 it("opens popup auth and resolves on opener message", async () => {
  const listeners = new Map<string, Set<(event: MessageEvent) => void>>()
  const popup = {
   closed: false,
   close: vi.fn(() => {
    popup.closed = true
   }),
   location: { href: "about:blank" },
  } as unknown as Window & { location: { href: string } }
  const open = vi.fn(() => popup)
  const addEventListener = vi.fn((type: string, listener: (event: MessageEvent) => void) => {
   const set = listeners.get(type) || new Set()
   set.add(listener)
   listeners.set(type, set)
  })
  const removeEventListener = vi.fn((type: string, listener: (event: MessageEvent) => void) => {
   listeners.get(type)?.delete(listener)
  })
  const dispatchMessage = (data: unknown) => {
   for (const listener of listeners.get("message") || []) {
    listener({ origin: "https://viewtube.live", data } as MessageEvent)
   }
  }

  vi.stubGlobal("window", {
   location: {
    origin: "https://viewtube.live",
    hostname: "viewtube.live",
    pathname: "/",
    search: "",
    hash: "",
   },
   open,
   addEventListener,
   removeEventListener,
   setInterval: globalThis.setInterval.bind(globalThis),
   clearInterval: globalThis.clearInterval.bind(globalThis),
   dispatchEvent: vi.fn(),
  } as unknown as Window)

  const fetchMock = vi.fn(async () => ({
   ok: true,
   status: 200,
   json: async () => ({ authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth?test=1" }),
  }))
  vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch)

  const { beginAccountIntent } = await import("./accountCoordinator")
  const promise = beginAccountIntent("sign_up", "/account")
  await new Promise((resolve) => setTimeout(resolve, 0))
  expect(open).toHaveBeenCalled()
  expect(fetchMock).toHaveBeenCalled()

  dispatchMessage({ type: "VT_UNIFIED_ACCOUNT_AUTH_SUCCESS", returnTo: "https://viewtube.live/account" })

  await expect(promise).resolves.toBeUndefined()
  expect(popup.close).toHaveBeenCalled()
  expect(addEventListener).toHaveBeenCalledWith("message", expect.any(Function))
  expect(removeEventListener).toHaveBeenCalledWith("message", expect.any(Function))
 })
})
