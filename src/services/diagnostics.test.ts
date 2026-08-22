import { describe, expect, it } from "vitest"
import { formatDiagnostics, readDiagnostics, recordDiagnostic, sanitizeDiagnosticData } from "./diagnostics"

describe("ViewTube developer diagnostics", () => {
 it("redacts credential-shaped keys and bearer/query tokens", () => {
  expect(sanitizeDiagnosticData({
   authorization: "Bearer abc.def",
   nested: { apiKey: "secret", url: "https://example.test/?access_token=visible" },
  })).toEqual({
   authorization: "[REDACTED]",
   nested: { apiKey: "[REDACTED]", url: "https://example.test/?access_token=[REDACTED]" },
  })
 })

 it("deduplicates repeated failures with occurrence counts", () => {
  recordDiagnostic("warn", "proxy", "409 reconnect")
  recordDiagnostic("warn", "proxy", "409 reconnect")
  const entry = readDiagnostics().find((candidate) => candidate.tag === "proxy" && candidate.message === "409 reconnect")
  expect(entry?.count).toBe(2)
  expect(formatDiagnostics(entry ? [entry] : [])).toContain("(x2)")
 })
})
