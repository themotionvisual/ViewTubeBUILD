// TEST-ONLY — see ./types.ts. Not importable by shipped application code.

import type { GoldenChannelSpec } from "./types"

/**
 * A young gaming channel with thin, incomplete data: a handful of videos, only view
 * counts on some, no revenue, and a still-forming niche. The Brain must stay useful
 * without pretending the missing metrics are zero.
 */
export const gamingSparseSpec: GoldenChannelSpec = {
 id: "gaming-sparse",
 label: "Gaming (sparse)",
 channelName: "Respawn Notes",
 channelDescription: "Cozy indie game playthroughs and short tips, still finding its footing.",
 // No goal set yet: the Brain should ask, not assume.
 subscriberCount: 340,
 totalViews: 21000,
 videos: [
  { id: "g1", title: "First Look: A Tiny Cozy Farming Game", tags: ["indie", "cozy", "gameplay"], format: "long", publishedAt: "2026-06-26", views: 5400, watchTime: 9000 },
  { id: "g2", title: "3 Beginner Tips for Stardew-Likes", tags: ["indie", "tips"], format: "long", publishedAt: "2026-06-10", views: 3100 },
  { id: "g3", title: "Why I Love Small Games", tags: ["indie", "commentary"], format: "long", publishedAt: "2026-05-20", views: 1800 },
  { id: "g4", title: "Trying a Roguelike for the First Time", tags: ["roguelike", "gameplay"], format: "short", publishedAt: "2026-05-04", views: 9200, retention: 58 },
 ],
 expectedEvidenceTokens: ["indie"],
 forbiddenEvidenceTokens: ["napoleon", "restoration", "rust"],
 missingEvidence: ["a stated one-month goal"],
}
