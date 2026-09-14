import { describe, expect, it } from "vitest"
import { CROWN_CODE_SNAPSHOT, CROWN_RELEASE_SNAPSHOT } from "./crownCodeReleaseSnapshot"

describe("Crown code and release snapshot", () => {
  it("keeps repository truth separate from deployment truth", () => {
    expect(CROWN_CODE_SNAPSHOT.branch).toBe("main")
    expect(CROWN_CODE_SNAPSHOT.headSha).toMatch(/^[a-f0-9]{40}$/)
    expect(CROWN_CODE_SNAPSHOT.truthRule).toContain("not proof")
  })

  it("does not promote rate-limited deployment checks to success", () => {
    expect(CROWN_RELEASE_SNAPSHOT.preview.state).toBe("preview_unavailable")
    expect(CROWN_RELEASE_SNAPSHOT.production.state).toBe("blocked")
    expect(CROWN_RELEASE_SNAPSHOT.live.state).toBe("planned")
  })

  it("preserves the complete release evidence chain", () => {
    expect(CROWN_RELEASE_SNAPSHOT.evidenceChain).toEqual([
      "commit",
      "pull request",
      "preview",
      "production",
      "live verification",
    ])
  })
})
