import { beforeEach, describe, expect, it, vi } from "vitest"
import { readDiagnostics, reportDiagnostic, sanitizeDiagnosticData } from "./diagnostics"

describe("ViewTube diagnostics", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("redacts secret-shaped fields and bearer tokens", () => {
    expect(sanitizeDiagnosticData({
      accessToken: "private-token",
      nested: { authorization: "Bearer abc.def.ghi", route: "/analytics" },
    })).toEqual({
      accessToken: "[REDACTED]",
      nested: { authorization: "[REDACTED]", route: "/analytics" },
    })
  })

  it("records a compact on-screen entry and emits structured console context", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined)
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
    expect(warn).toHaveBeenCalledWith(
      "[ViewTube:account] snapshot_fallback",
      expect.objectContaining({ DEBUG_DATA: { cookie: "[REDACTED]", status: 503 } }),
    )
  })
})
