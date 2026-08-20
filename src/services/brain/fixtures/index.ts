// TEST-ONLY — see ./types.ts. Not importable by shipped application code.

import type { GoldenChannelSpec } from "./types"
import { restorationRichSpec } from "./restoration-rich.fixture"
import { militaryHistoryRichSpec } from "./military-history-rich.fixture"
import { gamingSparseSpec } from "./gaming-sparse.fixture"
import { emptyChannelSpec } from "./empty-channel.fixture"

export * from "./types"
export { buildGoldenChannelFixture } from "./buildGoldenChannelFixture"
export { restorationRichSpec, militaryHistoryRichSpec, gamingSparseSpec, emptyChannelSpec }
export {
 CREATOR_QUESTION_SUITE,
 QUESTION_FAMILIES,
 type BrainGoldenScenario,
 type BrainScenarioEvidenceType,
} from "./creatorQuestionSuite"

/** Look up a canonical fixture spec by id. Returns undefined for unknown ids. */
export const goldenSpecById = (id: string): GoldenChannelSpec | undefined =>
 GOLDEN_CHANNEL_SPECS.find((spec) => spec.id === id)

/** The four canonical fixtures the quality gate runs against. */
export const GOLDEN_CHANNEL_SPECS: GoldenChannelSpec[] = [
 restorationRichSpec,
 militaryHistoryRichSpec,
 gamingSparseSpec,
 emptyChannelSpec,
]

/**
 * An intentionally off-list niche (small-scale beekeeping). It is NOT part of the
 * canonical gate; it exists only so the anti-bias test can prove the quality checks
 * work identically for a niche the evaluator has never seen, catching any accidental
 * hard-coding toward the four seed niches.
 */
export const ANTI_BIAS_NOVEL_SPEC: GoldenChannelSpec = {
 id: "beekeeping-novel",
 label: "Beekeeping (anti-bias)",
 channelName: "Ten Frames",
 channelDescription: "Backyard beekeeping through the seasons: hive inspections, honey harvests, and swarm management.",
 goal: "Publish consistently every week through the season.",
 subscriberCount: 22000,
 totalViews: 1400000,
 searchTerms: ["how to inspect a beehive", "first honey harvest"],
 videos: [
  { id: "b1", title: "My First Honey Harvest of the Year", tags: ["beekeeping", "honey", "harvest"], format: "long", publishedAt: "2026-06-22", views: 210000, watchTime: 640000, ctr: 6.1, retention: 52, subscribersGained: 1700, revenue: 900 },
  { id: "b2", title: "Reading a Frame: What Healthy Brood Looks Like", tags: ["beekeeping", "inspection", "brood"], format: "long", publishedAt: "2026-05-30", views: 88000, watchTime: 240000, ctr: 5.2, retention: 49, subscribersGained: 600, revenue: 320 },
  { id: "b3", title: "Catching a Swarm With a Cardboard Box", tags: ["beekeeping", "swarm"], format: "long", publishedAt: "2026-05-06", views: 154000, watchTime: 410000, ctr: 5.8, retention: 50, subscribersGained: 1100, revenue: 560 },
  { id: "b4", title: "Requeening a Hive, Step by Step", tags: ["beekeeping", "queen"], format: "long", publishedAt: "2026-04-12", views: 62000, watchTime: 170000, ctr: 4.9, retention: 47, subscribersGained: 420, revenue: 210 },
  { id: "b5", title: "One-Minute Hive Check", tags: ["beekeeping", "shorts"], format: "short", publishedAt: "2026-06-01", views: 300000, watchTime: 90000, ctr: null, retention: 80, subscribersGained: 500 },
 ],
 expectedEvidenceTokens: ["beekeeping"],
 forbiddenEvidenceTokens: ["napoleon", "restoration"],
}
