import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(
  path.resolve(process.cwd(), "src/views/dashboard/widgets/BrainHubWidget.tsx"),
  "utf8",
)

describe("Brain Hub signature intelligence system", () => {
  it("uses a Brain Intelligence Nexus instead of KPI cards as the main intelligence interior", () => {
    expect(source).toContain("BrainIntelligenceNexus")
    expect(source).toContain("brain-hub-intelligence-nexus")
    expect(source).toContain("portfolio?.primaryRecommendation")
    expect(source).toContain("<WidgetBadge")
  })
})
