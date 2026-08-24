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

 it("keeps local account requests on the same origin so session cookies survive the proxy", async () => {
  vi.stubGlobal("window", {
   location: {
    origin: "http://localhost:5173",
    hostname: "localhost",
   },
  } as unknown as Window)

  const { resolveAccountApiBase, accountUrl } = await import("./accountCoordinator")
  expect(resolveAccountApiBase("localhost", "http://localhost:5173")).toBe("http://localhost:5173")
  expect(accountUrl("/api/account/snapshot")).toBe("http://localhost:5173/api/account/snapshot")
 })

 it("opens popup auth and resolves on opener message", async () => {
  const listeners = new Map<string, Set<(event: MessageEvent) => void>>()
  const popup = {
   closed: false,
   close: vi.fn(() => {
    popup.closed = true
   }),
   location: { href: "about:blank" },
  }
  const open = vi.fn(() => popup as unknown as Window)
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

 it("preserves an ordinary unauthenticated response without disabling the account server", async () => {
  const popup = {
   closed: false,
   close: vi.fn(() => {
    popup.closed = true
   }),
   location: { href: "about:blank" },
  }
  vi.stubGlobal("window", {
   location: {
    origin: "https://viewtube.live",
    hostname: "viewtube.live",
    pathname: "/",
    search: "",
    hash: "",
   },
   open: vi.fn(() => popup as unknown as Window),
   dispatchEvent: vi.fn(),
  } as unknown as Window)
  vi.stubGlobal("fetch", vi.fn(async () => ({
   ok: false,
   status: 401,
   json: async () => ({ error: "Sign in before connecting a YouTube channel." }),
  })) as unknown as typeof fetch)

  const { beginAccountIntent, isUnifiedAccountServerEnabled } = await import("./accountCoordinator")
  await expect(beginAccountIntent("connect_channel", "/")).rejects.toThrow(
   "Sign in before connecting a YouTube channel.",
  )
  expect(isUnifiedAccountServerEnabled("viewtube.live")).toBe(true)
  expect(popup.close).toHaveBeenCalled()
 })

 it("falls back to a valid snapshot instead of crashing when the server returns a malformed body", async () => {
  const store = new Map<string, string>()
  const localStorageStub = {
   getItem: (key: string) => store.get(key) ?? null,
   setItem: (key: string, value: string) => { store.set(key, value) },
   removeItem: (key: string) => { store.delete(key) },
  }
  vi.stubGlobal("localStorage", localStorageStub as unknown as Storage)
  vi.stubGlobal("window", {
   location: {
    origin: "https://viewtube.live",
    hostname: "viewtube.live",
    pathname: "/",
    search: "",
    hash: "",
   },
  } as unknown as Window)

  const fetchMock = vi.fn(async () => ({
   ok: true,
   status: 200,
   json: async () => null,
  }))
  vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch)

  const { fetchUnifiedAccountSnapshot } = await import("./accountCoordinator")
  const snapshot = await fetchUnifiedAccountSnapshot()

  expect(snapshot).toBeTruthy()
  expect(snapshot.authentication).toBeTruthy()
  expect(snapshot.authentication.status).toBe("anonymous")
  expect(store.get("vt_unified_account_snapshot_v1")).not.toBe("null")
 })
})

// Real-world mobile screenshot showed /api/account/auth/start hanging
// 22+ seconds on iOS 5G then failing with WebKit "Load failed". The
// error message didn't match ACCOUNT_SERVER_UNAVAILABLE_ERROR so the
// legacy-fallback branch never fired and the user stayed stuck in
// "CONNECTING...". These tests pin down the fix: network failures are
// normalized to ACCOUNT_SERVER_UNAVAILABLE_ERROR so the caller's
// existing fallback branch works.
describe("accountFetch failure normalization", () => {
 beforeEach(() => {
  vi.resetModules()
  vi.stubGlobal("window", {
   location: {
    origin: "https://viewtube.live",
    hostname: "viewtube.live",
   },
  } as unknown as Window)
  const store = new Map<string, string>()
  vi.stubGlobal("localStorage", {
   getItem: (k: string) => store.get(k) ?? null,
   setItem: (k: string, v: string) => void store.set(k, v),
   removeItem: (k: string) => void store.delete(k),
   clear: () => store.clear(),
  } as unknown as Storage)
 })

 it("fetchUnifiedAccountSnapshot treats WebKit 'Load failed' as server-unavailable and returns cached snapshot", async () => {
  vi.stubGlobal(
   "fetch",
   vi.fn(async () => {
    throw new TypeError("Load failed")
   }) as unknown as typeof fetch,
  )
  const { fetchUnifiedAccountSnapshot, isUnifiedAccountServerEnabled } =
   await import("./accountCoordinator")
  const snapshot = await fetchUnifiedAccountSnapshot()
  expect(snapshot).toBeTruthy()
  // After a network failure the server-unavailable flag flips so
  // subsequent calls skip the API entirely.
  expect(isUnifiedAccountServerEnabled("viewtube.live")).toBe(false)
 })

 it("fetchUnifiedAccountSnapshot treats Chromium 'Failed to fetch' the same way", async () => {
  vi.stubGlobal(
   "fetch",
   vi.fn(async () => {
    throw new TypeError("Failed to fetch")
   }) as unknown as typeof fetch,
  )
  const { fetchUnifiedAccountSnapshot } = await import("./accountCoordinator")
  const snapshot = await fetchUnifiedAccountSnapshot()
  expect(snapshot).toBeTruthy()
  expect(snapshot.authentication.status).toBe("anonymous")
 })

 // beginAccountIntent's full auth-start path also runs through accountFetch,
 // so it inherits the same normalization. Direct coverage of that call
 // path requires stubbing shouldPreferAccountRedirect + window.open —
 // out of scope for this file. The snapshot tests above prove the
 // helper does the right thing.
})
