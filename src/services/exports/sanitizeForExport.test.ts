import { describe, expect, it } from "vitest"
import { sanitizeForExport, stringifyForExport } from "./sanitizeForExport"

describe("sanitizeForExport", () => {
 it("returns primitives unchanged", () => {
  expect(sanitizeForExport("hello")).toBe("hello")
  expect(sanitizeForExport(42)).toBe(42)
  expect(sanitizeForExport(true)).toBe(true)
  expect(sanitizeForExport(null)).toBeNull()
  expect(sanitizeForExport(undefined)).toBeUndefined()
 })

 it("strips top-level secret keys", () => {
  const result = sanitizeForExport({
   channelId: "abc",
   accessToken: "SECRET",
   refresh_token: "SECRET",
   authorization: "Bearer SECRET",
   apiKey: "SECRET",
   password: "SECRET",
   cookie: "sessionid=abc",
   client_secret: "SECRET",
   session: "SESSION_ID",
  })

  expect(result).toEqual({ channelId: "abc" })
 })

 it("strips nested secret keys recursively", () => {
  const result = sanitizeForExport({
   channelId: "abc",
   nested: {
    apiKey: "SECRET",
    views: 100,
    deeply: {
     bearer: "SECRET",
     nested_ok: "keep",
    },
   },
  })

  expect(result).toEqual({
   channelId: "abc",
   nested: {
    views: 100,
    deeply: {
     nested_ok: "keep",
    },
   },
  })
 })

 it("strips secret keys inside arrays of objects", () => {
  const result = sanitizeForExport({
   requests: [
    { url: "/foo", authorization: "Bearer A" },
    { url: "/bar", accessToken: "TOK" },
   ],
  })

  expect(result).toEqual({
   requests: [
    { url: "/foo" },
    { url: "/bar" },
   ],
  })
 })

 it("preserves values whose contents look secret but whose keys don't", () => {
  // Intentional: matching values is a source of false positives; we scrub
  // by key name only. A field named `note` containing the word "token" is
  // legitimate user content and must survive.
  const result = sanitizeForExport({ note: "my API token is safe" })
  expect(result).toEqual({ note: "my API token is safe" })
 })

 it("matches case-insensitively across common casing conventions", () => {
  const result = sanitizeForExport({
   AccessToken: "S",
   REFRESH_TOKEN: "S",
   "api-key": "S",
   Authorization: "S",
   sessionCookie: "S",
   keep: "keep",
  })
  expect(result).toEqual({ keep: "keep" })
 })

 it("preserves Dates, RegExps, Maps, Sets untouched", () => {
  const date = new Date("2024-01-01")
  const regex = /foo/g
  const map = new Map([["a", 1]])
  const set = new Set([1, 2, 3])
  const result = sanitizeForExport({ date, regex, map, set })
  expect(result).toEqual({ date, regex, map, set })
 })

 it("stringifyForExport produces valid JSON with scrubbed payload", () => {
  const json = stringifyForExport({
   channelId: "abc",
   authorization: "Bearer SECRET",
   nested: { access_token: "SECRET", views: 100 },
  })
  const parsed = JSON.parse(json)
  expect(parsed).toEqual({ channelId: "abc", nested: { views: 100 } })
 })
})
