export type CrownReleaseState = "planned" | "merged" | "preview_unavailable" | "deployed" | "live_verified" | "blocked"

export const CROWN_CODE_SNAPSHOT = {
  repository: "themotionvisual/ViewTubeBUILD",
  branch: "main",
  headSha: "4a89d7dca076d778fedf3fdc97afbeea0a9eef77",
  source: "GitHub repository snapshot captured for Crown Control Room",
  capturedAt: "2026-09-12T06:20:00Z",
  recentMerges: [
    { pr: 125, title: "Add canonical widget-color upload frame primitive", state: "merged" },
    { pr: 124, title: "feat(brain): establish unified BrainRuntime phase-one foundation", state: "merged" },
    { pr: 123, title: "Editor: unify dual UI hosts and bridge mobile/desktop project state", state: "merged" },
  ],
  truthRule: "Repository snapshot is evidence of committed code state, not proof that production has deployed or been live-verified.",
} as const

export const CROWN_RELEASE_SNAPSHOT = {
  commit: { sha: CROWN_CODE_SNAPSHOT.headSha, state: "merged" as CrownReleaseState },
  pullRequest: { label: "main contains merged work", state: "merged" as CrownReleaseState },
  preview: { label: "Vercel preview", state: "preview_unavailable" as CrownReleaseState, detail: "Current Vercel checks report account build-rate limiting." },
  production: { label: "Production deployment", state: "blocked" as CrownReleaseState, detail: "Do not infer deployment success while the production deployment check is pending or rate-limited." },
  live: { label: "Live verification", state: "planned" as CrownReleaseState, detail: "Requires an independently verified production runtime receipt." },
  evidenceChain: ["commit", "pull request", "preview", "production", "live verification"],
} as const
