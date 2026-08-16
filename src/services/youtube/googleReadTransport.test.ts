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

import { authorizedGoogleRead } from "./googleReadTransport"

describe("authorizedGoogleRead", () => {
 beforeEach(() => {
  mocks.unified = false
  mocks.token = "legacy-token"
  vi.restoreAllMocks()
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

  await authorizedGoogleRead("https://www.googleapis.com/youtube/v3/videos?id=one")

  expect(fetchMock).toHaveBeenNthCalledWith(
   2,
   "https://www.googleapis.com/youtube/v3/videos?id=one",
   expect.objectContaining({
    method: "GET",
    headers: expect.objectContaining({ Authorization: "Bearer legacy-token" }),
   }),
  )
 })

 it("falls back to the legacy bearer path when the account proxy rejects the request origin", async () => {
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

  await authorizedGoogleRead("https://www.googleapis.com/youtube/v3/videos?id=one")

  expect(fetchMock).toHaveBeenNthCalledWith(
   2,
   "https://www.googleapis.com/youtube/v3/videos?id=one",
   expect.objectContaining({
    method: "GET",
    headers: expect.objectContaining({ Authorization: "Bearer legacy-token" }),
   }),
  )
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

 it("returns an auth response instead of treating a missing token as an empty channel", async () => {
  mocks.token = null
  const fetchMock = vi.spyOn(globalThis, "fetch")
  const response = await authorizedGoogleRead("https://www.googleapis.com/youtube/v3/videos?id=one")
  expect(response.status).toBe(401)
  expect(fetchMock).not.toHaveBeenCalled()
 })
})
