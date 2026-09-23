// @vitest-environment jsdom
import { describe, expect, it } from "vitest"
import {
 generateAsset,
 type AssetModelCall,
 type AssetModelRunner,
} from "../AssetGenerator"
import {
 communitySinglePostStrategy,
 type CommunitySinglePost,
} from "../assetStrategies/communityPost"

describe("AssetGenerator media parity", () => {
 it("forwards attached media to the provider runner without putting it in prompt text", async () => {
  const calls: AssetModelCall[] = []
  const runner = (async (call: AssetModelCall) => {
   calls.push(call)
   return {
    output: {
     body: "Gearbox is back together.",
     intent: "series update",
    } satisfies CommunitySinglePost,
   }
  }) as AssetModelRunner

  await generateAsset<CommunitySinglePost>({
   request: {
    channelId: "channel-1",
    assetType: "community_post",
    instruction: "Refine this image post.",
    inputs: { postType: "image" },
   },
   strategy: communitySinglePostStrategy,
   runner,
   styleProfile: null,
   mediaAttachments: ["data:image/png;base64,ZmFrZQ=="],
  })

  expect(calls[0].mediaAttachments).toEqual(["data:image/png;base64,ZmFrZQ=="])
  expect(calls[0].userText).not.toContain("ZmFrZQ==")
 })
})
