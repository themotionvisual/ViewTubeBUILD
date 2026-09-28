import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const root = process.cwd()
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8")

describe("Superfan Card production contract", () => {
  it("uses evidence-backed advocate intelligence and canonical primitives", () => {
    const source = read("src/views/dashboard/widgets/SuperfanCardWidget.tsx")
    for (const required of [
      "rankCommunityAdvocates",
      "WidgetShell",
      "WidgetBadge",
      "WidgetScrollArea",
      "WidgetModuleFrame",
      "WidgetPreviewState",
      "WidgetSizedButton",
      "createViewTubeActionPacket",
      "persistViewTubeActionPacket",
    ]) expect(source).toContain(required)
  })

  it("does not fabricate fan identities or unsupported loyalty claims", () => {
    const source = read("src/views/dashboard/widgets/SuperfanCardWidget.tsx")
    for (const forbidden of [
      "Top 1% Engagement",
      "Sub Shared 5+ Videos",
      "Frequent Commenter",
      "Early Supporter",
      "SUPERFAN",
      "LOYALTY",
      "VIBE",
      "LEGEND",
    ]) expect(source).not.toContain(forbidden)
  })

  it("keeps widget-specific CSS namespaced and does not redefine shared primitives", () => {
    const css = read("src/views/dashboard/widgets/SuperfanCardWidget.css")
    expect(css).toContain(".superfan-card-widget")
    expect(css).not.toMatch(/(^|\n)\.vt-widget\s*\{/)
    expect(css).not.toMatch(/(^|\n)\.widget-module-frame\s*\{/)
    expect(css).not.toMatch(/(^|\n)(button|input|select|textarea)\s*\{/)
    expect(css).not.toContain("#000")
  })
})
