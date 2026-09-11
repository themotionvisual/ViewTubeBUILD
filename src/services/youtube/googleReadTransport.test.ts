import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
 unified: false,
 token: "legacy-token" as string | null,
}))

vi.mock("../account/accountCoordinator", () => ({
 accountUrl: (path: string) => `https://account.test${path}`,
 isUnifiedAccountServerEnabled: () => mocks.unified,
 isAccountServerUnavailableError: () => false,
 markUnifiedAccountServerUnavailable: vi.fn(),
}))

vi.mock("../auth/authSession", () => ({
 getValidAccessToken: async () => mocks.token,
}))

import type { Mock } from "vitest"

// googleReadTransport keeps its circuit breaker in module scope
// (accountProxyDisabledForSession). A static import would share that flag
// across every test in this file, so the first test that trips the breaker
// would silently send the rest straight down the direct path — which is what
// made the scope-failure test below pass alone and fail in sequence. Reset the
// module registry and re-import per test so each one starts with the breaker
// closed.
let authorizedGoogleRead: typeof import("./googleReadTransport").authorizedGoogleRead
let markUnifiedAccountServerUnavailable: Mock

describe("authorizedGoogleRead", () => {
 beforeEach(async () => {
  mocks.unified = false
  mocks.token = "legacy-token"
  vi.restoreAllMocks()
  vi.resetModules()
  const coordinator = await import("../account/accountCoordinator")
  markUnifiedAccountServerUnavailable = coordinator.markUnifiedAccountServerUnavailable as Mock
  ;({ authorizedGoogleRead } = await import("./googleReadTransport"))
 })

 it("uses the HttpOnly account proxy without exposing a browser token", async () => {
  mocks.unified = true
  const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}", { status: 200 }))

  await authorizedGoogleRead("https://www.googleapis.com/youtube/v3/videos?id=one")

  expect(fetchMock).toHaveBeenCalledWith(
   "https://account.test/api/account/google-proxy",
   expect.objectContaining({
    method: "POST",
    credentials: "include",
    body: JSON.stringify({ url: "https://www.googleapis.com/youtube/v3/videos?id=one" }),
   }),
  )
  expect(JSON.stringify(fetchMock.mock.calls[0])).not.toContain("legacy-token")
 })

 it("falls back to the legacy bearer path when the server proxy is missing", async () => {
  mocks.unified = true
  const fetchMock = vi
   .spyOn(globalThis, "fetch")
   .mockResolvedValueOnce(new Response("not found", { status: 404 }))
   .mockResolvedValueOnce(new Response("{}", { status: 200 }))

  const response = await authorizedGoogleRead("https://www.googleapis.com/youtube/v3/videos?id=one")

  expect(response.status).toBe(200)
  expect(fetchMock).toHaveBeenNthCalledWith(
   2,
   "https://www.googleapis.com/youtube/v3/videos?id=one",
   expect.objectContaining({
    method: "GET",
    headers: expect.objectContaining({ Authorization: "Bearer legacy-token" }),
   }),
  )
  // The proxy breaker is deliberately local to this transport. Flipping the
  // global unified-account flag here would change auth mode for the whole app,
  // which can turn a fallback Google 401 into a full ViewTube logout.
  expect(markUnifiedAccountServerUnavailable).not.toHaveBeenCalled()
 })

 it("recovers from proxy origin rejection through the shared direct transport", async () => {
  mocks.unified = true
  const fetchMock = vi
   .spyOn(globalThis, "fetch")
   .mockResolvedValueOnce(
    new Response(JSON.stringify({ error: "Request origin is not allowed." }), {
     status: 403,
     headers: { "Content-Type": "application/json" },
    }),
   )
   .mockResolvedValueOnce(new Response("{}", { status: 200 }))

  const response = await authorizedGoogleRead("https://www.googleapis.com/youtube/v3/videos?id=one")

  expect(response.status).toBe(200)
  expect(fetchMock).toHaveBeenCalledTimes(2)
  expect(fetchMock).toHaveBeenNthCalledWith(
   2,
   "https://www.googleapis.com/youtube/v3/videos?id=one",
   expect.objectContaining({
    method: "GET",
    headers: expect.objectContaining({ Authorization: "Bearer legacy-token" }),
   }),
  )
  // Same as above: fall back locally, leave global auth mode alone.
  expect(markUnifiedAccountServerUnavailable).not.toHaveBeenCalled()
 })

 it("does not bypass the server for a genuine Google scope failure", async () => {
  mocks.unified = true
  const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
   new Response(JSON.stringify({
    error: {
     code: "GOOGLE_SCOPE_REQUIRED",
     message: "Reconnect Google to grant the required capability.",
     retryable: false,
     reconnectRequired: false,
    },
   }), { status: 403, headers: { "Content-Type": "application/json" } }),
  )

  const response = await authorizedGoogleRead("https://www.googleapis.com/youtube/v3/videos?id=one")

  expect(response.status).toBe(403)
  expect(fetchMock).toHaveBeenCalledTimes(1)
  expect(JSON.stringify(fetchMock.mock.calls)).not.toContain("legacy-token")
 })

 it("retains the legacy bearer path when unified accounts are disabled", async () => {
  const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}", { status: 200 }))

  await authorizedGoogleRead("https://www.googleapis.com/youtube/v3/videos?id=one")

  expect(fetchMock).toHaveBeenCalledWith(
   "https://www.googleapis.com/youtube/v3/videos?id=one",
   expect.objectContaining({
    method: "GET",
    headers: expect.objectContaining({ Authorization: "Bearer legacy-token" }),
   }),
  )
 })

 it("returns a structured reconnect failure instead of treating a missing token as an empty channel", async () => {
  mocks.token = null
  const fetchMock = vi.spyOn(globalThis, "fetch")
  await expect(authorizedGoogleRead("https://www.googleapis.com/youtube/v3/videos?id=one"))
   .rejects.toMatchObject({ details: { code: "AUTH_REQUIRED", reconnectRequired: true, retryable: false } })
  expect(fetchMock).not.toHaveBeenCalled()
 })
})
