import { describe, expect, it } from "vitest"
import { auditNumericClaims, collectKnownNumbers, parseNumericToken } from "../numericClaims"

const evidence = {
 channel: { label: "Restoration Works", subscribers: 48200 },
 profile: { videoCount: 63 },
 topVideos: [
  { title: "Rebuilding a 1954 Fordson", views: 1284730, id: "aZ4x9Qb7" },
  { title: "Barn find teardown", views: 480312 },
 ],
}

describe("parseNumericToken", () => {
 it("derives tolerance from how precisely the claim was written", () => {
  expect(parseNumericToken("1.28M")).toMatchObject({ value: 1_280_000, tolerance: 5_000 })
  expect(parseNumericToken("480K")).toMatchObject({ value: 480_000, tolerance: 500 })
  expect(parseNumericToken("1,284,730")).toMatchObject({ value: 1_284_730, tolerance: 0.5 })
  expect(parseNumericToken("34%")).toMatchObject({ value: 34, isPercent: true, tolerance: 0.5 })
 })

 it("rejects non-numeric tokens", () => {
  expect(parseNumericToken("aZ4x9Qb7")).toBeNull()
  expect(parseNumericToken("")).toBeNull()
 })
})

describe("collectKnownNumbers", () => {
 it("collects numbers from nested objects and from inside strings", () => {
  const known = collectKnownNumbers(evidence)
  expect(known.has(48_200)).toBe(true)
  expect(known.has(1_284_730)).toBe(true)
  // "1954" appears only inside a title string.
  expect(known.has(1954)).toBe(true)
 })

 it("terminates on deeply nested and circular-ish shapes", () => {
  let nested: unknown = { value: 5 }
  for (let index = 0; index < 40; index += 1) nested = { nested }
  expect(() => collectKnownNumbers(nested)).not.toThrow()
 })
})

describe("auditNumericClaims", () => {
 it("catches an invented percentage that the old substring guard admitted", () => {
  // "47" appears nowhere in evidence, but the old guard tested substring containment
  // against a serialised blob, and "47" is a substring of "1284730".
  const audit = auditNumericClaims({ text: "Browse CTR is sitting at 47%.", evidence })
  expect(audit.unverifiedDerived.map((claim) => claim.token)).toContain("47%")
 })

 it("catches an invented magnitude", () => {
  const audit = auditNumericClaims({ text: "That video pulled 2.4M views.", evidence })
  expect(audit.fabricated.map((claim) => claim.token)).toContain("2.4M")
 })

 it("accepts a correctly rounded restatement of a known figure", () => {
  const audit = auditNumericClaims({ text: "Your best video is at 1.28M views.", evidence })
  expect(audit.fabricated).toHaveLength(0)
  expect(audit.unverifiedDerived).toHaveLength(0)
 })

 it("accepts an exact known figure and a known formatted figure", () => {
  const audit = auditNumericClaims({
   text: "1,284,730 views on the Fordson build and 480K on the barn find.",
   evidence,
  })
  expect(audit.fabricated).toHaveLength(0)
 })

 it("rejects a magnitude that is close but outside the precision claimed", () => {
  // 1,284,730 rounds to 1.28M, not 1.29M.
  const audit = auditNumericClaims({ text: "About 1.29M views.", evidence })
  expect(audit.fabricated.map((claim) => claim.token)).toContain("1.29M")
 })

 it("exempts bare prose integers and common day windows", () => {
  const audit = auditNumericClaims({
   text: "Try 3 formats over the next 28 days, then review 2 of them.",
   evidence,
  })
  expect(audit.fabricated).toHaveLength(0)
  expect(audit.unverifiedDerived).toHaveLength(0)
 })

 it("never exempts a small number carrying a percent sign or a magnitude suffix", () => {
  const audit = auditNumericClaims({ text: "Retention held at 3% and 7K views.", evidence })
  expect(audit.unverifiedDerived.map((claim) => claim.token)).toContain("3%")
  expect(audit.fabricated.map((claim) => claim.token)).toContain("7K")
 })

 it("separates unverified percentages from fabricated counts", () => {
  const audit = auditNumericClaims({
   text: "Views fell 34% to 900,000 last week.",
   evidence,
  })
  expect(audit.unverifiedDerived.map((claim) => claim.token)).toEqual(["34%"])
  expect(audit.fabricated.map((claim) => claim.token)).toEqual(["900,000"])
 })

 it("reports each distinct token once", () => {
  const audit = auditNumericClaims({ text: "2.4M, then 2.4M again.", evidence })
  expect(audit.fabricated).toHaveLength(1)
 })

 it("treats empty evidence as supporting nothing", () => {
  const audit = auditNumericClaims({ text: "You have 12,000 subscribers.", evidence: {} })
  expect(audit.fabricated.map((claim) => claim.token)).toContain("12,000")
 })
})
