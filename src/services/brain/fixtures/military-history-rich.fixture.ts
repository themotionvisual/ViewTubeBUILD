// TEST-ONLY — see ./types.ts. Not importable by shipped application code.

import type { GoldenChannelSpec } from "./types"

/**
 * A well-established military-history channel: a deliberately different niche,
 * vocabulary, goal, audience promise, and performance pattern from the restoration
 * fixture. Two healthy channels must never receive the same answer.
 */
export const militaryHistoryRichSpec: GoldenChannelSpec = {
 id: "military-history-rich",
 label: "Military history (rich)",
 channelName: "Field & Column",
 channelDescription:
  "Deeply researched Napoleonic and early-modern military history, breaking down famous battles, tactics, and the units that fought them.",
 goal: "Grow ad and membership revenue from long-form documentaries.",
 contentPreference: "Cinematic, map-driven documentary narration with primary-source detail.",
 subscriberCount: 148000,
 totalViews: 12800000,
 searchTerms: ["napoleonic tactics explained", "battle of austerlitz breakdown", "why line infantry worked"],
 videos: [
  { id: "m1", title: "Napoleon's Cavalry: Every Type Explained", tags: ["napoleon", "cavalry", "military history"], format: "long", publishedAt: "2026-06-18", views: 980000, watchTime: 5_200_000, ctr: 7.2, retention: 55, subscribersGained: 9400, revenue: 8200 },
  { id: "m2", title: "Why the Battle of Austerlitz Was a Masterpiece", tags: ["austerlitz", "battle", "napoleon"], format: "long", publishedAt: "2026-05-22", views: 640000, watchTime: 3_100_000, ctr: 6.6, retention: 53, subscribersGained: 5200, revenue: 5100 },
  { id: "m3", title: "How Line Infantry Actually Fought", tags: ["infantry", "tactics", "military history"], format: "long", publishedAt: "2026-04-30", views: 421000, watchTime: 1_900_000, ctr: 6.1, retention: 51, subscribersGained: 3300, revenue: 3400 },
  { id: "m4", title: "The Empire's Best General Wasn't Napoleon", tags: ["empire", "generals", "napoleon"], format: "long", publishedAt: "2026-04-04", views: 356000, watchTime: 1_500_000, ctr: 5.8, retention: 49, subscribersGained: 2700, revenue: 2900 },
  { id: "m5", title: "Artillery That Changed European Warfare", tags: ["artillery", "warfare", "military history"], format: "long", publishedAt: "2026-03-11", views: 288000, watchTime: 1_180_000, ctr: 5.6, retention: 48, subscribersGained: 2100, revenue: 2300 },
  { id: "m6", title: "The Retreat From Moscow, Hour by Hour", tags: ["moscow", "campaign", "napoleon"], format: "long", publishedAt: "2026-02-16", views: 712000, watchTime: 3_600_000, ctr: 6.9, retention: 54, subscribersGained: 6100, revenue: 6000 },
  { id: "m7", title: "Could the Old Guard Have Won Waterloo?", tags: ["waterloo", "old guard", "battle"], format: "long", publishedAt: "2026-01-21", views: 534000, watchTime: 2_500_000, ctr: 6.4, retention: 52, subscribersGained: 4400, revenue: 4300 },
  { id: "m8", title: "One Map That Explains Napoleon's Empire", tags: ["empire", "map", "shorts"], format: "short", publishedAt: "2026-06-02", views: 880000, watchTime: 260000, ctr: null, retention: 71, subscribersGained: 1200 },
  { id: "m9", title: "The Cavalry Charge Myth", tags: ["cavalry", "myth", "shorts"], format: "short", publishedAt: "2026-05-09", views: 505000, watchTime: 150000, ctr: null, retention: 64, subscribersGained: 700 },
  { id: "m10", title: "How Muskets Really Worked", tags: ["muskets", "tactics", "military history"], format: "long", publishedAt: "2025-12-20", views: 246000, watchTime: 980000, ctr: 5.4, retention: 47, subscribersGained: 1800, revenue: 1900 },
  { id: "m11", title: "The Logistics Behind Every Napoleonic Campaign", tags: ["logistics", "campaign", "napoleon"], format: "long", publishedAt: "2025-11-18", views: 198000, watchTime: 820000, ctr: 5.1, retention: 46, subscribersGained: 1400, revenue: 1500 },
  { id: "m12", title: "Ranking Napoleon's Marshals", tags: ["marshals", "napoleon", "ranking"], format: "long", publishedAt: "2025-10-24", views: 468000, watchTime: 2_100_000, ctr: 6.2, retention: 50, subscribersGained: 3900, revenue: 3800 },
 ],
 expectedEvidenceTokens: ["napoleon", "cavalry", "battle"],
 // Distinctive vocabulary from the restoration fixture's niche: must never appear here.
 forbiddenEvidenceTokens: ["restoration", "rust", "cast iron", "chisel", "vise"],
}
