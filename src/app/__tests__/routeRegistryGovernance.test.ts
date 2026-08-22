import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import { PRIMARY_NAV_ITEMS } from "../../components/navigation/navigationContract"
import { APPLICATION_MENU_DESTINATIONS } from "../../components/navigation/applicationMenuContract"
import { UNIFIED_CHART_SPECS } from "../../chartSystem/unifiedChartSpec"
import { SUPER_TOOLS } from "../../services/superToolRegistry"
import { DASHBOARD_WIDGET_REGISTRY } from "../../views/dashboard/WidgetRegistry"
import { assertUniqueIds } from "../../services/registryAssertions"

const appRoutesSource = readFileSync(resolve(process.cwd(), "src/app/AppRoutes.tsx"), "utf8")
const routePaths = new Set([...appRoutesSource.matchAll(/<Route\s+[\s\S]*?path="([^"]+)"/g)].map((match) => match[1]))

describe("route and registry governance", () => {
  it("keeps every visible destination backed by an application route", () => {
    const visiblePaths = [
      ...PRIMARY_NAV_ITEMS.map((item) => item.path),
      ...APPLICATION_MENU_DESTINATIONS.flatMap((item) => item.path ? [item.path.split(/[?#]/)[0]] : []),
    ]
    for (const path of visiblePaths) expect(routePaths, `Missing visible route ${path}`).toContain(path)
  })

  it("keeps primary runtime registries free of duplicate IDs", () => {
    expect(() => assertUniqueIds(PRIMARY_NAV_ITEMS, (item) => item.id, "Primary navigation")).not.toThrow()
    expect(() => assertUniqueIds(APPLICATION_MENU_DESTINATIONS, (item) => item.id, "Application menu")).not.toThrow()
    expect(() => assertUniqueIds(Object.values(UNIFIED_CHART_SPECS), (item) => item.id, "Unified charts")).not.toThrow()
    expect(() => assertUniqueIds(SUPER_TOOLS, (item) => item.id, "Super tools")).not.toThrow()
    expect(() => assertUniqueIds(DASHBOARD_WIDGET_REGISTRY, (item) => item.id, "Dashboard widgets")).not.toThrow()
  })
})
