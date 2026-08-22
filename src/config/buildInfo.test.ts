import { describe, expect, it, vi } from "vitest"
import { BUILD_INFO, logBuildInfo } from "./buildInfo"

describe("build identity", () => {
  it("exposes every build field", () => {
    expect(BUILD_INFO).toEqual({
      branch: expect.any(String),
      commit: expect.any(String),
      builtAt: expect.any(String),
      version: expect.any(String),
    })
  })

  it("logs build identity at most once", () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined)
    logBuildInfo()
    logBuildInfo()
    expect(info).toHaveBeenCalledTimes(1)
  })
})
