// TEST-ONLY — synthetic channel data for the Brain answer-quality gate.
// Nothing under this directory may be imported by shipped application code; an
// enforcement test in __tests__/goldenFixtures.test.ts fails the build if it is.
// These are crash-test dummies for measuring answer quality, never templates the
// runtime Brain matches real creators against.

import type { AIBrainContextSnapshot } from "../../aiBrainCommandInterface"
import type { CreatorGrowthContext } from "../../../types"

/** One synthetic video. Metrics are optional so a fixture can model incomplete data. */
export interface GoldenVideoSpec {
 id: string
 title: string
 tags: string[]
 format: "long" | "short"
 publishedAt: string
 views?: number | null
 watchTime?: number | null
 ctr?: number | null
 retention?: number | null
 subscribersGained?: number | null
 revenue?: number | null
}

/**
 * A made-up channel described as plain data. Deterministic and side-effect-free at
 * import: the snapshot is materialized only when `buildGoldenChannelFixture` runs.
 */
export interface GoldenChannelSpec {
 id: string
 label: string
 channelName: string
 channelDescription: string
 videos: GoldenVideoSpec[]
 searchTerms?: string[]
 /** Becomes the creator's current goal (futureStateMap). */
 goal?: string
 /** A journal-confirmed content preference (contentDNA). */
 contentPreference?: string
 subscriberCount?: number | null
 totalViews?: number | null
 /** Extra tokens the Brain should be able to ground an answer in for this channel. */
 expectedEvidenceTokens?: string[]
 /** Tokens that must never appear in this channel's evidence (usually other niches'). */
 forbiddenEvidenceTokens?: string[]
 /** Evidence the Brain should openly acknowledge is missing. */
 missingEvidence?: string[]
}

/** A materialized fixture: real snapshot + the expectations checks assert against. */
export interface BrainGoldenChannelFixture {
 id: string
 label: string
 snapshot: AIBrainContextSnapshot
 growthContext: CreatorGrowthContext
 expectedEvidenceTokens: string[]
 forbiddenEvidenceTokens: string[]
 missingEvidence: string[]
}
