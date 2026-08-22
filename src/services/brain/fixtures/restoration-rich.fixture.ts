// TEST-ONLY — see ./types.ts. Not importable by shipped application code.

import type { GoldenChannelSpec } from "./types"

/**
 * A well-established restoration / maker channel: clear niche, distinct top
 * performers, complete metrics, a stated goal, and one confirmed content preference.
 */
export const restorationRichSpec: GoldenChannelSpec = {
 id: "restoration-rich",
 label: "Restoration (rich)",
 channelName: "Second Life Restorations",
 channelDescription:
  "Rescuing rusted tools and broken machines and restoring them to working condition, with quiet, narration-free process videos.",
 goal: "Reach 100k subscribers by growing long-form watch time.",
 contentPreference: "Calm, no-talking restoration process with satisfying before-and-after reveals.",
 subscriberCount: 61000,
 totalViews: 4200000,
 searchTerms: ["how to restore a rusty tool", "electrolysis rust removal", "antique plane restoration"],
 videos: [
  { id: "r1", title: "Restoring a Rusted 1940s Hand Plane", tags: ["restoration", "woodworking", "hand tools"], format: "long", publishedAt: "2026-06-20", views: 512000, watchTime: 1_540_000, ctr: 6.8, retention: 54, subscribersGained: 4200, revenue: 1900 },
  { id: "r2", title: "Rescuing a Seized Bench Vise From Scrap", tags: ["restoration", "metalwork", "vise"], format: "long", publishedAt: "2026-05-28", views: 268000, watchTime: 720000, ctr: 5.9, retention: 49, subscribersGained: 1800, revenue: 940 },
  { id: "r3", title: "Electrolysis Rust Removal, Explained Simply", tags: ["restoration", "rust removal", "electrolysis"], format: "long", publishedAt: "2026-05-02", views: 190000, watchTime: 430000, ctr: 5.2, retention: 46, subscribersGained: 1100, revenue: 610 },
  { id: "r4", title: "Restoring an Old Oil Can Nobody Wanted", tags: ["restoration", "antique", "patina"], format: "long", publishedAt: "2026-04-11", views: 88000, watchTime: 210000, ctr: 4.8, retention: 44, subscribersGained: 520, revenue: 250 },
  { id: "r5", title: "A Rusty Padlock Comes Back To Life", tags: ["restoration", "lock", "brass"], format: "long", publishedAt: "2026-03-19", views: 141000, watchTime: 300000, ctr: 5.5, retention: 47, subscribersGained: 900, revenue: 470 },
  { id: "r6", title: "Restoring a Broken Cast Iron Skillet", tags: ["restoration", "cast iron", "seasoning"], format: "long", publishedAt: "2026-02-24", views: 205000, watchTime: 560000, ctr: 5.7, retention: 51, subscribersGained: 1400, revenue: 780 },
  { id: "r7", title: "The Worst Rust I Have Ever Restored", tags: ["restoration", "extreme", "rust"], format: "long", publishedAt: "2026-01-30", views: 402000, watchTime: 1_180_000, ctr: 6.4, retention: 52, subscribersGained: 3100, revenue: 1560 },
  { id: "r8", title: "Quick Rust Removal Trick", tags: ["restoration", "tips", "rust"], format: "short", publishedAt: "2026-06-05", views: 620000, watchTime: 210000, ctr: null, retention: 88, subscribersGained: 900 },
  { id: "r9", title: "Before And After: 80-Year-Old Wrench", tags: ["restoration", "shorts", "wrench"], format: "short", publishedAt: "2026-05-15", views: 340000, watchTime: 120000, ctr: null, retention: 76, subscribersGained: 500 },
  { id: "r10", title: "Restoring a Vintage Hand Drill", tags: ["restoration", "hand tools", "vintage"], format: "long", publishedAt: "2025-12-12", views: 168000, watchTime: 380000, ctr: 5.1, retention: 45, subscribersGained: 950, revenue: 520 },
  { id: "r11", title: "Saving a Rust-Welded Monkey Wrench", tags: ["restoration", "penetrating oil", "wrench"], format: "long", publishedAt: "2025-11-08", views: 122000, watchTime: 270000, ctr: 4.9, retention: 43, subscribersGained: 700, revenue: 360 },
  { id: "r12", title: "Restoring the Cheapest Chisel I Could Find", tags: ["restoration", "chisel", "sharpening"], format: "long", publishedAt: "2025-10-14", views: 96000, watchTime: 200000, ctr: 4.6, retention: 42, subscribersGained: 480, revenue: 240 },
 ],
 expectedEvidenceTokens: ["restoration", "rust"],
 // Distinctive vocabulary from the other rich fixture's niche: must never appear here.
 forbiddenEvidenceTokens: ["alder", "cavalry", "battle", "empire", "military"],
}
