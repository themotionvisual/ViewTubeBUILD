import { describe, expect, it } from "vitest"
import { buildCreatorBrainLocalFallback, formatCreatorBrainResponse } from "../../aiBrainCommandInterface"
import { buildGoldenChannelFixture, emptyChannelSpec, restorationRichSpec } from "../fixtures"

const answer = (request: string, empty = false) => {
 const snapshot = buildGoldenChannelFixture(empty ? emptyChannelSpec : restorationRichSpec).snapshot
 return formatCreatorBrainResponse(buildCreatorBrainLocalFallback(request, snapshot), snapshot, { requestText: request })
}

describe("creator asset drafts", () => {
 it("uses an explicit topic before channel top-video evidence and honors the requested count", () => {
  const response = answer("Write 4 hooks about restoring a seized hand plane")
  const items = response.modules?.find((module) => module.id === "creator-asset-drafts")?.data?.items

  expect(response.mode).toBe("creator_asset_draft")
  expect(items).toHaveLength(4)
  expect(items?.every((item) => item.title.includes("restoring a seized hand plane"))).toBe(true)
  expect(items?.every((item) => item.detail && !/you should|consider writing/i.test(item.detail))).toBe(true)
 })

 it("uses ranked channel videos when no explicit title or topic was supplied", () => {
  const response = answer("Write pinned comments for my top 2 videos")
  const items = response.modules?.find((module) => module.id === "creator-asset-drafts")?.data?.items

  expect(items).toHaveLength(2)
  expect(items?.[0]?.title).toMatch(/Restor/i)
  expect(items?.[0]?.detail).toMatch(/stood out|follow-up/i)
 })

 it("preserves the complete title, hook, description, and tag package for a new video", () => {
  const response = answer("I want to make a new video about restoring a seized hand plane")
  const items = response.modules?.find((module) => module.id === "creator-asset-drafts")?.data?.items || []

  expect(items.map((item) => item.title)).toEqual(["Title Angles", "Opening Hook", "Description", "Tags"])
  expect(items.find((item) => item.title === "Title Angles")?.detail).toMatch(/\|/)
  expect(items.find((item) => item.title === "Tags")?.detail?.split(",")).toHaveLength(10)
 })

 it.each([
  ["community posts", "Community Post"],
  ["replies", "Reply"],
  ["script directions", "Script Direction"],
  ["titles", "Title"],
  ["descriptions", "Description"],
  ["captions", "Caption"],
  ["outlines", "Outline"],
  ["CTAs", "CTA"],
 ])("builds paste-ready %s", (asset, label) => {
  const response = answer(`Draft 2 ${asset} about restoring a hand plane`)
  const module = response.modules?.find((item) => item.id === "creator-asset-drafts")
  expect(module?.title).toContain(label)
  expect(module?.data?.items).toHaveLength(2)
  expect(module?.data?.items?.every((item) => Boolean(item.detail?.trim()))).toBe(true)
 })

 it("asks one focused question when neither a topic nor channel evidence exists", () => {
  const response = answer("Write 3 hooks", true)
  const module = response.modules?.find((item) => item.id === "creator-asset-drafts")

  expect(module?.data?.items).toBeUndefined()
  expect(module?.data?.missingReason).toMatch(/topic|title/i)
  expect(response.questions).toHaveLength(1)
  expect(response.questions[0]?.question).toMatch(/topic|title/i)
 })
})
