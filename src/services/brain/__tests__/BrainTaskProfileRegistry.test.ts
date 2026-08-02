import { describe, expect, it } from "vitest"
import { resolveBrainTaskProfile } from "../BrainTaskProfileRegistry"

describe("BrainTaskProfileRegistry", () => {
 const routingTable = [
  ["Write three pinned comments for my top videos", "creator_asset_draft"],
  ["Give me 2 hooks about Waterloo", "creator_asset_draft"],
  ["I want to make a new video about Roman cavalry", "creator_asset_draft"],
  ["Run my Daily Oracle", "daily_oracle"],
  ["Build my first week plan", "first_week_plan"],
  ["Give me a best video autopsy", "best_video_autopsy"],
  ["Help me welcome back subscribers after a long break", "channel_revival"],
  ["Why did my views and retention fall?", "analytics"],
  ["Find an SEO keyword opportunity", "seo"],
  ["How should I monetize this channel?", "revenue"],
  ["Create a publishing schedule", "publishing"],
  ["Who is my core audience?", "audience"],
  ["What is my channel strategy?", "strategy"],
 ] as const

 it.each(routingTable)("routes %s to %s", (request, expected) => {
  expect(resolveBrainTaskProfile(request).id).toBe(expected)
 })

 it("lets an explicit creation task outrank incidental analytics and revenue words", () => {
  expect(resolveBrainTaskProfile("Draft 4 titles using my views and revenue evidence")).toMatchObject({
   id: "creator_asset_draft",
   answerMode: "creator_asset_draft",
   intent: "content_generation",
   assetKind: "title",
   requestedCount: 4,
  })
 })

 it("clamps requested creator-asset counts to one through ten", () => {
  expect(resolveBrainTaskProfile("Write 0 hooks about Waterloo").requestedCount).toBe(1)
  expect(resolveBrainTaskProfile("Write 99 hooks about Waterloo").requestedCount).toBe(10)
 })

 it("extracts an explicit subject without treating top-video targeting as a subject", () => {
  expect(resolveBrainTaskProfile("Write 3 hooks about Waterloo").explicitSubject).toBe("Waterloo")
  expect(resolveBrainTaskProfile("Write pinned comments for my top 3 videos").explicitSubject).toBeNull()
 })
})
