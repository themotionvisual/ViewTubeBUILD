import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import { APPLICATION_MENU_DESTINATIONS } from "./applicationMenuContract"

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8")

describe("application menu governance", () => {
  it("keeps dashboard layout actions out of the account dropdown", () => {
    const shell = read("src/components/navigation/AdaptiveNavigationShell.tsx")
    expect(shell).toContain("<ApplicationAccountMenu")
    expect(shell).not.toContain("runDashboardMenuAction")
    expect(shell).not.toContain("Dashboard Layout")
  })

  it("keeps the dashboard controls toggle in the dedicated Settings widget", () => {
    const renderer = read("src/views/dashboard/WidgetRendererBase.tsx")
    const settings = read("src/views/dashboard/widgets/SettingsWidget.tsx")
    expect(renderer).toContain('"system-micro-stack": React.lazy(() => import("./widgets/SettingsWidget")')
    expect(renderer).not.toContain('widget.id === "system-micro-stack"')
    expect(settings).toContain("DASHBOARD CONTROLS")
    expect(settings).toContain("SHOW ALL WIDGETS")
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
