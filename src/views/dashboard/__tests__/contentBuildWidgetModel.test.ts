import { describe, expect, it } from "vitest"
import { buildContentLifecycleSummary, scopeAssetsToContentBuild } from "../widgets/contentBuildWidgetModel"

describe("ContentBuild dashboard model", () => {
  it("scopes Vault assets to the active ContentBuild asset membership", () => {
    const assets = [
      { id: "a1", name: "Project A thumbnail" },
      { id: "a2", name: "Project B thumbnail" },
      { id: "a3", name: "Project A script" },
    ] as any[]

    expect(scopeAssetsToContentBuild(assets, {
      id: "cb-a",
      assetIds: ["a1", "a3"],
    } as any).map((asset) => asset.id)).toEqual(["a1", "a3"])
  })

  it("summarizes canonical ContentBuild stages into production lifecycle buckets", () => {
    const summary = buildContentLifecycleSummary([
      { id: "1", stage: "idea" },
      { id: "2", stage: "script" },
      { id: "3", stage: "edit" },
      { id: "4", stage: "scheduled" },
      { id: "5", stage: "published" },
      { id: "6", stage: "evaluation" },
    ] as any[])

    expect(summary.map((item) => [item.id, item.count])).toEqual([
      ["IDEA", 1],
      ["BUILD", 2],
      ["PACKAGE", 1],
      ["LIVE", 1],
      ["LEARN", 1],
    ])
  })
})
