import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import { APPLICATION_MENU_DESTINATIONS } from "./applicationMenuContract"

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8")

describe("application menu governance", () => {
  it("keeps dashboard layout actions out of the account dropdown", () => {
    const shell = read("src/components/navigation/AdaptiveNavigationShell.tsx")
    expect(shell.includes("<ApplicationAccountMenu") || shell.includes("vt-adaptive-account-menu")).toBe(true)
    expect(shell).not.toContain("runDashboardMenuAction")
    expect(shell).not.toContain("Dashboard Layout")
  })

  it("keeps the dashboard controls toggle in the Settings widget", () => {
    const renderer = read("src/views/dashboard/WidgetRenderer.tsx")
    expect(renderer).toContain('widget.id === "system-micro-stack"')
    expect(renderer).toContain("SHOW DASHBOARD CONTROLS")
    expect(renderer).toContain("HIDE DASHBOARD CONTROLS")
  })

  it("maps every routed dropdown destination to a current application route", () => {
    const routes = read("src/app/AppRoutes.tsx")
    for (const destination of APPLICATION_MENU_DESTINATIONS) {
      if (!destination.path) continue
      const path = destination.path.split(/[?#]/)[0]
      expect(routes, `${destination.label} must resolve to ${path}`).toContain(`path="${path}"`)
    }
  })
})
