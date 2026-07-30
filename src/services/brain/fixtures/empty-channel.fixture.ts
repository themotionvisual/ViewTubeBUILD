// TEST-ONLY — see ./types.ts. Not importable by shipped application code.

import type { GoldenChannelSpec } from "./types"

/**
 * A brand-new account with no videos and no analytics. The Brain must name what it
 * needs and must never fabricate channel facts or zero-valued metrics.
 */
export const emptyChannelSpec: GoldenChannelSpec = {
 id: "empty-channel",
 label: "Empty channel",
 channelName: "New Creator",
 channelDescription: "",
 videos: [],
 expectedEvidenceTokens: [],
 forbiddenEvidenceTokens: [],
 missingEvidence: ["synced video inventory"],
}
