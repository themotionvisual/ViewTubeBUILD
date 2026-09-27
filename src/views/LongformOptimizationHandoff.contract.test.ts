import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), "utf8")

describe("Longform Optimizer Studio handoff consumers", () => {
  it("mounts the universal handoff receiver in Thumbnail Studio", () => {
    const source = read("src/views/ThumbnailStudio.tsx")
    expect(source).toContain("ViewTubeHandoffReceiver")
    expect(source).toContain('targetToolId="thumbnail-studio"')
    expect(source).toContain("longform-optimizer")
  })

  it("mounts the universal handoff receiver in Video Manager", () => {
    const source = read("src/views/VideoManager.tsx")
    expect(source).toContain("ViewTubeHandoffReceiver")
    expect(source).toContain('targetToolId="video-manager"')
    expect(source).toContain("longform-optimizer")
  })
})
