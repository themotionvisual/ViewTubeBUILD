# ViewTube system reference — consolidated refresh 2026-09-03

This refresh supersedes the branch's 2026-08-27 execution assumptions where current PRs and main have moved forward.

## Current documentation role

Keep `codex/docs/viewtube-system-reference-2026-08-27` documentation-only. It should serve as the consolidation/evidence branch for architecture, migration and branch decisions while runtime work remains in its subsystem branches.

## Current main

Current main anchor used by PRs #75, #77 and #78: `7490cd469531219d57817428f754d360a1aa182c`.

## Open branches that materially change the system map

| PR | Branch | System | Current role |
|---|---|---|---|
| #72 | `themotionvisual/feat/brain-phase-five-production-chains` | Brain production chains | richest Brain integration donor; separate review slices |
| #75 | `codex/docs/viewtube-system-reference-2026-08-27` | docs/reference | consolidated evidence/reference branch |
| #77 | `refactor/viewtubex-clean-consolidation` | broad consolidation | donor/consolidation branch; not wholesale replacement |
| #78 | `feature/anomaly-intelligence-foundation` | anomaly intelligence | new derived-intelligence subsystem |
| #66 | `feat/vt-e1-unification-2026-08-27` | editor | canonical editor unification line |
| #69 | `chore/auth-pr-consolidation-audit` | auth audit | historical/consolidation evidence |

## Important update: Brain work is no longer only conceptual

PR #72 includes concrete services and UI components for:

- Handoff Inbox
- Outcome Ledger
- Learning Ledger
- User Controls
- Brain Analytics Evidence
- Channel Profile adapter
- Brain Super Tool bridge
- Brain workflow recipes/execution/learning
- Vault Brain adapter
- live-tool inbox
- workflow run panel
- SendTo / Handoff receivers
- creator-engagement integration
- evaluation ledger
- tool-chain ranking

Therefore older reference documents that describe Brain 1/2/3 as merely undeployed concept stacks should now be read as historical snapshots.

## Important update: anomaly intelligence now has a production seam

PR #78 adds anomaly intelligence against `analytics-canon`, not a direct YouTube fetch path. That aligns with the desired ownership model:

`VT-SYNC → analytics-canon → derived anomaly events → Brain / Momentum / Evaluation`.

## Important update: ViewTubeX consolidation is now a formal PR

PR #77 is a 25-commit broad consolidation branch. It includes YouTube API skill references, analytics and Brain work, VT-SYNC work, dashboard widgets, feature gating and quarantined legacy material. It should be audited by subsystem against current main and the dedicated branches before merge.

## Consolidated decision

Use current main as the application base.

Harvest and normalize:

- Brain production chains from PR #72
- anomaly intelligence from PR #78
- editor unification from PR #66
- carefully selected ViewTubeX consolidation material from PR #77
- documentation/status/reference material into PR #75

Do not merge entire historical snapshots or dirty worktrees as application replacements.

## Canonical architecture

See:

- [VIEWTUBE_UNIFIED_SYSTEMS_ARCHITECTURE_2026-09-03.md](VIEWTUBE_UNIFIED_SYSTEMS_ARCHITECTURE_2026-09-03.md)
- [VIEWTUBE_DEVELOPMENT_STATUS_2026-09-03.md](VIEWTUBE_DEVELOPMENT_STATUS_2026-09-03.md)
- [README.md](README.md)
