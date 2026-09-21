# AI Cross-Branch Harvest — Pass 1

**Date:** 2026-09-18  
**Herald verb:** BUILD / CONSOLIDATE  
**Canonical destination:** BrainRuntime architecture  
**Merge policy:** harvest capabilities; never wholesale-merge stale/diverged AI branches.

## Readback

Goal: create the strongest single ViewTube Brain and user assistant from current main plus unique work on historical/diverged branches, without replacing main wholesale or reviving parallel authorities.

## Branch reconnaissance

| Branch | Relation to main | Initial disposition | Valuable unique work / note |
|---|---:|---|---|
| feat/ai-intelligence-engine-phase0-2026-09-17 | active consolidation branch | KEEP / INTEGRATE | unified contract; Statistics Intelligence; Audience Intelligence; Brain evidence bridges |
| feat/brain-phase-six-durable-intelligence-persistence | diverged: +84 / -993 | HARVEST SELECTIVELY | server persistence, evaluation inbox/loop, attribution, lifecycle cohorts, monitoring, calibration, learning governance, intelligence persistence |
| feat/brain-phase-six-evaluation-attribution-followup | diverged: +80 / -993 | HARVEST SELECTIVELY | overlapping Phase 6 evaluation/attribution implementation; compare against durable-persistence branch before porting |
| feature/channel-intelligence-algorithm-workflows | diverged: +18 / -988 | MOSTLY SUPERSEDED / VERIFY UNIQUE | Algorithm Intelligence, Priming, Opportunity, controls, anomaly bridge. Much of this is already present in current main; inspect deltas only |
| codex/asset-engine-brain-backbone | behind: +0 / -521 | DO NOT MERGE | branch itself has no commits ahead of main; current main nevertheless contains asset-engine prior art that must be audited as canonical current code |
| feature/anomaly-intelligence-foundation | behind: +0 / -1004 | DO NOT MERGE | historical work appears incorporated/superseded; current anomaly implementation is the audit target |
| codex/feat/intelligence-hub-evidence-generation-v1 | behind: +0 / -1004 | DO NOT MERGE | no unique commits vs main; use current Intelligence Hub code |
| feature/intelligence-hub-evidence-scope | behind: +0 / -867 | DO NOT MERGE | no unique commits vs main |
| feature/wire-packaging-lab-pro | behind: +0 / -875 | DO NOT MERGE | no unique commits vs main; Packaging Lab current main is the relevant surface |
| feat/brain-shared-conversation-controller-2026-09-12 | behind: +0 / -613 | DO NOT MERGE | shared conversation work appears already incorporated/superseded |

## Highest-value harvest discovered

The Phase 6 branches contain the clearest unmerged AI value. Candidate modules include:

- BrainEvaluationInbox
- BrainEvaluationLoop
- BrainIntelligencePersistence
- AlgorithmAttributionDetail
- AlgorithmEvaluationEngine
- AlgorithmFinalEvaluationResolver
- AlgorithmIntelligenceEventLedger
- AlgorithmIntelligenceLedgerRetention
- AlgorithmLearningCandidates
- AlgorithmLearningGovernance
- AlgorithmLearningProfilePromotion
- AlgorithmLifecycleBaseline
- AlgorithmLifecycleCohorts
- AlgorithmLifecycleObservationStore
- AlgorithmMonitoringResolver
- AlgorithmMonitoringSchedule
- AlgorithmRecommendationCalibration
- CanonicalAlgorithmEvaluation
- server Brain intelligence persistence API/store/schema
- attribution/evaluation UI panels

These are **harvest candidates, not approved merges**. Their branch is nearly 1,000 commits behind current main, so merging it directly is unsafe.

## Safe integration order

1. Compare each Phase 6 candidate file against current-main equivalents.
2. Classify candidate as:
   - already incorporated;
   - current main is stronger;
   - unique and portable;
   - stale contract;
   - conflicts with canonical owner;
   - useful concept only.
3. Port only unique coherent units onto the consolidation branch.
4. Adapt imports/types to current main rather than importing stale branch dependencies.
5. Add focused tests.
6. Run typecheck/build before any PR to main.
7. Merge foundations before consumers.
8. Keep each main PR independently reversible.

## Merge train

### AI-01 — authority and architecture
Docs/contracts/manifests only.

### AI-02 — Statistics Intelligence
Deterministic analytics derivation + tests.

### AI-03 — Statistics Brain integration
Context/evidence bridge and orchestration.

### AI-04 — Audience Intelligence
Aggregate evidence model + tests.

### AI-05 — Audience Brain integration
Context/orchestration.

### AI-06 — evaluation/outcome foundations
Harvest only compatible Phase 6 evaluation, attribution and lifecycle primitives.

### AI-07 — Packaging Intelligence
Unify historical packaging evidence and audience promise.

### AI-08 — Creator Asset Engine
Use current assetEngine prior art; do not create a competing owner.

### AI-09 onward — strangler migrations
SEO/metadata → hooks → thumbnail/package → scripts/storyboards → community/audience → remaining creator generation.

## Main protection rules

- Never merge a stale AI branch wholesale.
- Never overwrite BrainRuntime, analytics-canon, Channel Profile, Projects, Vault, Generation Store or Outcome Ledger with an older branch version.
- No deletion based only on branch age.
- No direct creator UI → provider calls may be added.
- Existing direct-provider migration debt may only shrink.
- Every port must preserve evidence/provenance and current privacy controls.
- Main merge requires tests + typecheck + build; UI changes additionally require runtime/visual verification.

## Next recon pass

Deep-diff the Phase 6 durable-persistence branch against current main, beginning with evaluation/outcome/persistence modules. Separately audit current `src/services/assetEngine.ts` before designing Creator Asset Engine work.
