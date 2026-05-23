import { describe, expect, it } from "vitest"

import { resolveCanonicalVideoFormat } from "../analytics/Selectors"

describe("resolveCanonicalVideoFormat", () => {
 it("classifies exact vertical under-180 videos as shorts", () => {
  expect(resolveCanonicalVideoFormat("", 120, false, false, "", "9:16")).toBe("shorts")
 })

 it("classifies portrait-ish under-180 videos as shorts", () => {
  expect(resolveCanonicalVideoFormat("", 120, false, false, "", "3:4")).toBe("shorts")
 })

 it("does not classify square under-180 videos as shorts by aspect alone", () => {
  expect(resolveCanonicalVideoFormat("", 120, false, false, "", "1:1")).toBe("long")
 })

 it("does not classify landscape under-180 videos as shorts without another shorts signal", () => {
  expect(resolveCanonicalVideoFormat("", 120, false, false, "", "16:9")).toBe("long")
 })

 it("keeps over-180 videos long even with shorts metadata", () => {
  expect(resolveCanonicalVideoFormat("", 240, false, true, "shorts", "9:16")).toBe("long")
 })

 it("lets shorts playlist evidence override generic video content type", () => {
  expect(resolveCanonicalVideoFormat("video", 120, true, false, "", "16:9")).toBe("shorts")
 })
})
