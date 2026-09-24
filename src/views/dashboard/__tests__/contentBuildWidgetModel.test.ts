import { describe, expect, it } from "vitest"
import { scopeAssetsToContentBuild, summarizeContentBuildReadiness } from "../widgets/contentBuildWidgetModel"

describe("ContentBuild widget model", () => {
  it("scopes Vault assets to the active ContentBuild membership", () => {
    const assets = [
      { id: "a1", name: "Project A thumbnail" },
      { id: "a2", name: "Project B thumbnail" },
      { id: "a3", name: "Project A script" },
    ] as any[]

    expect(scopeAssetsToContentBuild(assets, {
      id: "cb-a",
      assetIds: ["a1", "a3"],
      selections: {},
      variantGroups: [],
      workflow: { blockerIds: [] },
    } as any).map((asset) => asset.id)).toEqual(["a1", "a3"])
  })

  it("summarizes selected, final, variant, and blocker state", () => {
    const summary = summarizeContentBuildReadiness({
      id: "cb-a",
      assetIds: ["a1", "a2"],
      selections: { thumbnail: "a1", title: "a2" },
      variantGroups: [
        { id: "g1", finalAssetId: "a1", members: [{ assetId: "a1" }, { assetId: "a3" }] },
      ],
      workflow: { blockerIds: ["block-1"] },
    } as any)

    expect(summary).toEqual({
      assetCount: 2,
      selectedCount: 2,
      finalCount: 1,
      variantCount: 2,
      blockerCount: 1,
    })
  })
})
