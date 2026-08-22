import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const root = process.cwd()
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), "utf8")

describe("unified account surface governance", () => {
  it("uses popup-first copy in active application code", () => {
    const activeFiles = [
      "src/components/navigation/ApplicationAccountMenu.tsx",
      "src/views/Settings.tsx",
      "src/views/Subscribe.tsx",
      "src/views/VideoManager.tsx",
      "src/views/dashboard/DashboardHeader.tsx",
      "src/features/vt-sync-local/shell/VtSyncLocalAnalyticsPage.tsx",
    ]
    const source = activeFiles.map(read).join("\n")
    expect(source).not.toContain("Continue with Google")
    expect(source).toContain("account.start")
    expect(read("src/services/account/accountContracts.ts")).toContain('"Sign in"')
    expect(read("src/services/account/accountContracts.ts")).toContain('"Sign up"')
  })

  it("routes primary account CTAs through the shared popup launcher", () => {
    for (const relativePath of [
      "src/views/Settings.tsx",
      "src/views/Subscribe.tsx",
      "src/views/VideoManager.tsx",
      "src/views/dashboard/DashboardHeader.tsx",
      "src/features/vt-sync-local/shell/VtSyncLocalAnalyticsPage.tsx",
    ]) {
      const source = read(relativePath)
      expect(source, relativePath).toContain("account.start")
      expect(source, relativePath).not.toContain("navigate(buildAccountRoute")
    }
    for (const relativePath of [
      "src/components/account/AccountActionButton.tsx",
      "src/components/navigation/ApplicationAccountMenu.tsx",
      "src/views/settings/UnifiedAccountSettingsSection.tsx",
    ]) {
      const source = read(relativePath)
      expect(source, relativePath).toContain("AccountActionButton")
      expect(source, relativePath).not.toContain("navigate(buildAccountRoute")
    }
  })

  it("owns persistent account actions through the shared control", () => {
    expect(read("src/components/navigation/ApplicationAccountMenu.tsx")).toContain("AccountActionButton")
    expect(read("src/views/settings/UnifiedAccountSettingsSection.tsx")).toContain("AccountActionButton")
    expect(read("src/app/AppRoutes.tsx")).toContain('path="/account/connect"')
  })

  it("keeps direct legacy login imports out of components and Google API clients", () => {
    for (const relativePath of [
      "src/components/navigation/AdaptiveNavigationShell.tsx",
      "src/views/Settings.tsx",
      "src/features/vt-sync-local/shell/VtSyncLocalAnalyticsPage.tsx",
      "src/services/youtubeApiClient.ts",
      "src/services/youtube/youtubeApiClient.ts",
    ]) {
      expect(read(relativePath), relativePath).not.toContain("services/auth/authSession")
      expect(read(relativePath), relativePath).not.toContain("loginWithPkcePopup")
    }
  })

  it("does not use placeholder billing identity in the active server", () => {
    expect(read("server/billing-server.mjs")).not.toContain("local-user")
  })
})
