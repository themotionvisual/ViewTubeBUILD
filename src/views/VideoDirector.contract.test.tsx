import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import {
  VIDEO_DIRECTOR_CATEGORY_REGISTRY,
  VIDEO_DIRECTOR_CATEGORY_GROUPS,
} from "../features/video-director"

describe("Video Director Studio Hub contract", () => {
  it("is lazy-mounted as one canonical Studio Hub toolbox", () => {
    const studioHub = readFileSync(resolve(process.cwd(), "src/views/StudioHub.tsx"), "utf8")

    expect(studioHub).toContain('React.lazy(() => import("./VideoDirector"))')
    expect(studioHub).toContain(
      '<VideoDirector collapsible isOpenInitial={false} paletteIndex={11} />',
    )
  })

  it("uses canonical Toolbox/SubToolbox and Studio control surfaces", () => {
    const source = readFileSync(resolve(process.cwd(), "src/views/VideoDirector.tsx"), "utf8")

    expect(source).toContain("ToolboxScaffold")
    expect(source).toContain("SubToolbox")
    expect(source).toContain("SubToolboxDropdownControl")
    expect(source).toContain("StudioSplitLeftButton")
    expect(source).toContain("SubToolboxFileTarget")
    expect(source).not.toContain("border-dashed")
  })

  it("keeps the interchangeable settings surface aligned with all 28 categories", () => {
    expect(VIDEO_DIRECTOR_CATEGORY_REGISTRY).toHaveLength(28)
    expect(VIDEO_DIRECTOR_CATEGORY_GROUPS).toEqual([
      "creative",
      "camera",
      "image",
      "motion",
      "audio",
      "graphics",
      "generation",
    ])

    const source = readFileSync(resolve(process.cwd(), "src/views/VideoDirector.tsx"), "utf8")
    for (const definition of VIDEO_DIRECTOR_CATEGORY_REGISTRY) {
      expect(source).toContain(`case "${definition.id}"`)
    }
  })

  it("keeps provider execution disabled until the persistent provider layer is wired", () => {
    const source = readFileSync(resolve(process.cwd(), "src/views/VideoDirector.tsx"), "utf8")

    expect(source).toContain("Generate — Provider Layer Next")
    expect(source).toContain('disabled title="Provider adapters, cost reservation and persistent generation queue are the next execution layer."')
  })
})
