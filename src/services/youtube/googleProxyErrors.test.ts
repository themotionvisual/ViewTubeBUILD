import { describe, expect, it, vi } from "vitest"
import {
 GoogleRequestError,
 readGoogleProxyError,
 requestGoogleWithRetry,
} from "./googleProxyErrors"

const failure = (
 status: number,
 error: Record<string, unknown> | string,
 headers: Record<string, string> = {},
) => new Response(JSON.stringify({ error }), {
 status,
 headers: { "Content-Type": "application/json", ...headers },
})

describe("Google proxy failure contract", () => {
 it("does not retry a generic legacy 500", async () => {
  const request = vi.fn(async () => failure(500, "legacy failure"))
  const response = await requestGoogleWithRetry(request)
  expect(response.status).toBe(500)
  expect(request).toHaveBeenCalledTimes(1)
 })

 it("retries only responses explicitly classified as retryable", async () => {
  const request = vi.fn()
   .mockResolvedValueOnce(failure(503, {
    code: "GOOGLE_UPSTREAM_UNAVAILABLE",
    message: "temporary",
    retryable: true,
    reconnectRequired: false,
   }, { "Retry-After": "0" }))
   .mockResolvedValueOnce(new Response(JSON.stringify({ items: [] }), { status: 200 }))

  const response = await requestGoogleWithRetry(request)
  expect(response.ok).toBe(true)
  expect(request).toHaveBeenCalledTimes(2)
 })

 it("throws immediately when Google must be reconnected", async () => {
  const request = vi.fn(async () => failure(409, {
   code: "GOOGLE_RECONNECT_REQUIRED",
   message: "Reconnect Google.",
   retryable: false,
   reconnectRequired: true,
   requestId: "request-1",
  }))

  await expect(requestGoogleWithRetry(request)).rejects.toBeInstanceOf(GoogleRequestError)
  expect(request).toHaveBeenCalledTimes(1)
 })

 it("preserves scope failures without retrying", async () => {
  const response = failure(403, {
   code: "GOOGLE_SCOPE_REQUIRED",
   message: "Reconnect for analytics.",
   retryable: false,
   reconnectRequired: false,
  })
  const details = await readGoogleProxyError(response)
  expect(details).toMatchObject({ code: "GOOGLE_SCOPE_REQUIRED", retryable: false })
 })
})
