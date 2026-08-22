import { describe, expect, it } from "vitest"
import { formatDiagnostics, readDiagnostics, recordDiagnostic, reportDiagnostic, sanitizeDiagnosticData } from "./diagnostics"

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

 it("records structured subsystem diagnostics in the shared buffer", () => {
  reportDiagnostic({
   area: "account",
   event: "snapshot_fallback",
   level: "warn",
   whatHappened: "Snapshot failed",
   debugData: { cookie: "private", status: 503 },
  })

  expect(readDiagnostics().at(-1)).toMatchObject({
   level: "warn",
   tag: "account:snapshot_fallback",
   message: "Snapshot failed",
  })
 })
})
