import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

describe("canonical account event ownership", () => {
 it("does not reinterpret server snapshots through the legacy auth event", () => {
  const source = readFileSync(new URL("./UnifiedAccountContext.tsx", import.meta.url), "utf8")
  const commitSnapshot = source.slice(source.indexOf("const commitSnapshot"), source.indexOf("const refresh"))
  const serverMode = source.slice(source.indexOf("if (isUnifiedAccountServerEnabled())"), source.indexOf("syncLegacy()\n    window.addEventListener"))

  expect(commitSnapshot).toContain("vt_account_snapshot_changed")
  expect(commitSnapshot).not.toContain("vt_auth_changed")
  expect(serverMode).not.toContain('addEventListener("vt_auth_changed"')
 })

 it("does not emit a legacy auth event after a server-owned connection completes", () => {
  const source = readFileSync(new URL("./GlobalDataContext.tsx", import.meta.url), "utf8")
  const connectChannel = source.slice(source.indexOf("const connectChannel"), source.indexOf("const disconnectChannel"))

  expect(connectChannel).toContain("vt_account_snapshot_changed")
  expect(connectChannel).not.toContain('dispatchEvent(new Event("vt_auth_changed"))')
 })
})
