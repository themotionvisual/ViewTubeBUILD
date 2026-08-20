import fs from "node:fs"
import path from "node:path"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
 ANTI_BIAS_NOVEL_SPEC,
 GOLDEN_CHANNEL_SPECS,
 buildGoldenChannelFixture,
 emptyChannelSpec,
 militaryHistoryRichSpec,
 restorationRichSpec,
} from ".."

const createStorage = () => {
 const store = new Map<string, string>()
 return {
  getItem: vi.fn((key: string) => store.get(key) || null),
  setItem: vi.fn((key: string, value: string) => {
   store.set(key, value)
  }),
  removeItem: vi.fn((key: string) => {
   store.delete(key)
  }),
  clear: vi.fn(() => {
   store.clear()
  }),
 }
}

const evidenceText = (fixture: ReturnType<typeof buildGoldenChannelFixture>): string =>
 [
  fixture.snapshot.inferredProfile.summary,
  fixture.snapshot.inferredProfile.niche || "",
  ...fixture.snapshot.inferredProfile.topicClusters,
  ...fixture.snapshot.evidencePack.topVideos.map((video) => video.title),
  ...fixture.snapshot.evidencePack.searchTerms.map((term) => term.value),
 ]
  .join(" ")
  .toLowerCase()

describe("golden channel fixtures", () => {
 let storage: ReturnType<typeof createStorage>

 beforeEach(() => {
  storage = createStorage()
  vi.stubGlobal("localStorage", storage)
 })

 afterEach(() => {
  vi.unstubAllGlobals()
 })

 it("exposes exactly the four canonical fixtures", () => {
  expect(GOLDEN_CHANNEL_SPECS.map((spec) => spec.id)).toEqual([
   "restoration-rich",
   "military-history-rich",
   "gaming-sparse",
   "empty-channel",
  ])
 })

 it("materializes each fixture into a real snapshot with grounded evidence tokens", () => {
  for (const spec of GOLDEN_CHANNEL_SPECS) {
   const fixture = buildGoldenChannelFixture(spec)
   expect(fixture.snapshot.route).toBe("/ai-brain")

   if (spec.videos.length > 0) {
    const text = evidenceText(fixture)
    const grounded = fixture.expectedEvidenceTokens.some((token) => text.includes(token.toLowerCase()))
    expect(grounded, `${spec.id} should ground in its own evidence`).toBe(true)
    // A channel's evidence must never carry another niche's distinctive words.
    for (const forbidden of fixture.forbiddenEvidenceTokens) {
     expect(text, `${spec.id} leaked "${forbidden}"`).not.toContain(forbidden.toLowerCase())
    }
   }
  }
 })

 it("keeps the empty channel free of fabricated facts and names what is missing", () => {
  const fixture = buildGoldenChannelFixture(emptyChannelSpec)
  expect(fixture.snapshot.evidencePack.dataStatus).toBe("missing")
  expect(fixture.snapshot.evidencePack.topVideos).toHaveLength(0)
  expect(fixture.snapshot.inferredProfile.status).toBe("missing")
  expect(fixture.missingEvidence.length).toBeGreaterThan(0)
 })

 it("gives two rich channels genuinely disjoint evidence (no shared answer)", () => {
  const restoration = buildGoldenChannelFixture(restorationRichSpec)
  const military = buildGoldenChannelFixture(militaryHistoryRichSpec)
  const restorationText = evidenceText(restoration)
  const militaryText = evidenceText(military)

  expect(restorationText).toContain("restoration")
  expect(militaryText).toContain("napoleon")
  expect(restorationText).not.toContain("napoleon")
  expect(militaryText).not.toContain("restoration")
 })

 it("grounds a niche it has never seen, proving the checks are topic-neutral", () => {
  // If the checks privileged the four seed niches, a novel niche would fail here.
  const fixture = buildGoldenChannelFixture(ANTI_BIAS_NOVEL_SPEC)
  const text = evidenceText(fixture)
  expect(text).toContain("beekeeping")
 })
})

describe("fixture safety boundary", () => {
 const SRC_ROOT = path.resolve(__dirname, "../../../..") // .../src
 const FIXTURE_DIR = path.resolve(__dirname, "..")

 const collectSourceFiles = (dir: string, acc: string[] = []): string[] => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
   const full = path.join(dir, entry.name)
   if (entry.isDirectory()) {
    if (["node_modules", "__tests__", ".worktrees", "_quarantine"].includes(entry.name)) continue
    if (full === FIXTURE_DIR) continue // the fixtures dir itself is allowed to self-reference
    collectSourceFiles(full, acc)
   } else if (/\.(ts|tsx)$/.test(entry.name) && !/\.test\.(ts|tsx)$/.test(entry.name)) {
    acc.push(full)
   }
  }
  return acc
 }

 it("is never imported by shipped application code", () => {
  const offenders = collectSourceFiles(SRC_ROOT)
   .filter((file) => {
    const contents = fs.readFileSync(file, "utf8")
    // Any import that reaches into the brain fixtures directory.
    return /from\s+["'][^"']*brain\/fixtures/.test(contents) || /["'][^"']*\.fixture["']/.test(contents)
   })
   // The builder lives inside the fixtures dir and legitimately references siblings.
   .filter((file) => !file.startsWith(FIXTURE_DIR))

  expect(offenders, `production code must not import test fixtures: ${offenders.join(", ")}`).toEqual([])
 })
})
