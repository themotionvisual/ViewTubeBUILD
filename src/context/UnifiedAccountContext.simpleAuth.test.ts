import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const source = readFileSync(new URL("./UnifiedAccountContext.tsx", import.meta.url), "utf8")

describe("UnifiedAccountContext auth ownership", () => {
 it("is only a compatibility projection of SimpleAuthProvider", () => {
  expect(source).toContain('from "../auth/AuthProvider"')
  expect(source).toContain("useSimpleAuth")
  expect(source).not.toContain('from "../services/auth/authSession"')
  expect(source).not.toContain("beginAccountIntent")
  expect(source).not.toContain("vt_auth_changed")
  expect(source).not.toContain("isUnifiedAccountServerEnabled")
  expect(source).not.toContain("legacyLogin")
 })

 it("delegates login and logout to the simple session owner", () => {
  expect(source).toContain("auth.login(")
  expect(source).toContain("await auth.logout()")
 })
})
