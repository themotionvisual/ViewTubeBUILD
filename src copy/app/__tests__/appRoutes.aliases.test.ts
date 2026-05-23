import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const appRoutesPath = path.resolve(process.cwd(), "src/app/AppRoutes.tsx")
const appRoutesSource = fs.readFileSync(appRoutesPath, "utf8")

const redirectPairs: Array<{ from: string; to: string }> = [
 { from: "/stuff", to: "/reference-studio/stuff" },
 { from: "/stuff/:tabId", to: "/reference-studio/stuff" },
 { from: "/sources-lab", to: "/reference-studio/stuff" },
 { from: "/component-catalog", to: "/reference-studio/component-catalog" },
 { from: "/component-grid", to: "/reference-studio/component-grid" },
 { from: "/charts-gallery", to: "/reference-studio/charts-gallery" },
 { from: "/charts-gallery/master-graphs", to: "/reference-studio/charts-master" },
 {
  from: "/charts-gallery/toolbox-preview",
  to: "/reference-studio/charts-toolbox-preview",
 },
 { from: "/thumbnail-studio", to: "/reference-studio/thumbnail-studio" },
 { from: "/reference-studio-v2", to: "/reference-studio/charts-gallery" },
]

describe("AppRoutes experimental aliases", () => {
 it("keeps experimental legacy paths as redirects to canonical reference-studio tabs", () => {
  for (const pair of redirectPairs) {
   expect(appRoutesSource).toContain(`path="${pair.from}"`)
   expect(appRoutesSource).toContain(`to="${pair.to}"`)
  }
 })

 it("avoids redirect loops in alias map", () => {
  for (const pair of redirectPairs) {
   expect(pair.from).not.toBe(pair.to)
  }
 })

 it("keeps canonical reference studio tab route mounted", () => {
  expect(appRoutesSource).toContain(`path="/reference-studio/:tabId"`)
  expect(appRoutesSource).toContain(`element={<ReferenceStudio />}`)
 })
})
