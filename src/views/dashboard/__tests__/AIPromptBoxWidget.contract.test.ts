import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const root = process.cwd()
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8")

describe("AI Prompt Box widget contract", () => {
  it("is extracted from WidgetRendererBase into one independently editable owner", () => {
    const renderer = read("src/views/dashboard/WidgetRendererBase.tsx")
    expect(renderer).toContain('"ai-prompt-box": React.lazy')
    expect(renderer).not.toContain('if (widget.id === "ai-prompt-box")')
    expect(renderer).not.toContain('"ai-prompt-box",\n')
  })

  it("uses canonical widget primitives and BrainRuntime", () => {
    const source = read("src/views/dashboard/widgets/AIPromptBoxWidget.tsx")
    for (const item of [
      "WidgetShell",
      "WidgetTextInput",
      "WidgetSizedButton",
      "WidgetBadge",
      "WidgetScrollArea",
      "runBrainTask",
      "buildAIBrainContextSnapshot",
      "buildAIBrainSystemPrompt",
    ]) expect(source).toContain(item)
  })

  it("keeps all widget-specific CSS namespaced", () => {
    const css = read("src/views/dashboard/widgets/AIPromptBoxWidget.css")
    expect(css).toContain(".ai-prompt-box-widget")
    expect(css).not.toMatch(/(^|\n)\.vt-widget\s*\{/)
    expect(css).not.toMatch(/(^|\n)(button|input|select|textarea)\s*\{/)
    expect(css).not.toContain("border-black")
  })
})
