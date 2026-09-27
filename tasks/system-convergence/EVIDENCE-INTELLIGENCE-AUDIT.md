# Evidence & Intelligence Convergence Audit

**Status:** ACTIVE WORKING AUDIT  
**Date:** 2026-09-27  
**Audited main:** `e5bbb56fee503c26a1251c6e3643307af12c4632`  
**Program:** `docs/architecture/VIEWTUBE_SYSTEM_CONVERGENCE_AND_CONSOLIDATION.md`

## Purpose

Classify the current Brain evidence/intelligence stack by real runtime responsibility and caller reachability before consolidation. This audit distinguishes:

1. canonical evidence ownership;
2. evidence acquisition;
3. deterministic evidence projections;
4. specialist intelligence;
5. runtime orchestration adapters;
6. currently unreachable compatibility/donor code.

No deletion is authorized by this audit.

## Canonical ownership

### analytics-canon — KEEP

Role:
- canonical analytics truth and normalized intelligence evidence;
- exposes `getCurrentCanonicalIntelligenceEvidence()`;
- remains the only analytics source-of-truth owner for Brain runtime evidence.

Convergence rule:
- Brain may project, score and interpret analytics-canon evidence;
- Brain must not create a competing analytics store.

## Runtime projection/adapters

### BrainStatisticsBridge — ADAPTER → PROJECT / candidate quarantine after migration

Production reachability:
- `buildBrainEvidenceIntelligence()` is called by `BrainOrchestrator`.
- `buildBrainStatisticsIntelligence()` has no production caller found in the current caller audit.

Current value:
- guarantees one analytics-canon snapshot for quality + statistics;
- useful behavior should move into `EvidenceIntelligenceResolver`.

Target:
- `EvidenceIntelligenceResolver` becomes the Brain runtime evidence projection facade.
- Retain bridge temporarily for compatibility/reachability proof.

### BrainAudienceBridge — ADAPTER → PROJECT / candidate quarantine after migration

Production reachability:
- `buildBrainAudienceIntelligence()` is called by `BrainOrchestrator`.

Current value:
- obtains or accepts canonical evidence;
- derives statistics and passes both to `AudienceIntelligence`.

Target:
- remove Brain runtime orchestration responsibility;
- keep `AudienceIntelligence` as the specialist;
- compatibility bridge can later quarantine after zero-caller certification.

### OpportunityEvidenceAdapter — ADAPTER / deterministic derived-signal builder

Production reachability:
- `buildOpportunityEvidenceFromBrainPack()` is called by `BrainOrchestrator`.
- also has direct unit coverage.

Current value:
- deterministic conversion from bounded Brain evidence into channel-scoped opportunity evidence;
- preserves evidence IDs;
- does not create analytics persistence.

Target:
- runtime invocation moves behind `EvidenceIntelligenceResolver`;
- keep implementation as an internal derived-signal builder until a later derived-signal contract decides whether to merge it.

### BrainAnalyticsEvidence — UNREACHED ADAPTER / donor candidate

Caller audit:
- no production caller found for `buildAnalyticsEvidenceExplanation()`.

Current value:
- converts the older Brain evidence pack into Phase-One evidence explanation records;
- respects analytics permission boundary.

Target:
- do not delete yet;
- donor-harvest evidence explanation semantics and any UI provenance behavior;
- if no production/recovery caller appears in fresh reachability, move to quarantine after successor parity exists.

## Evidence acquisition

### AudienceEvidenceCollector — KEEP / PAIR

Production reachability:
- `buildBrainAudienceEvidencePacket()` is used by `OnboardingBootstrap`.
- `collectBrainAudienceEvidenceWithYouTube()` has no production caller found in this audit.

This is **not** the same responsibility as Audience Intelligence.

Role:
- audience evidence acquisition/normalization from videos/comments/activity;
- onboarding/profile evidence production.

Target:
- retain as an acquisition module;
- later normalize its outputs into the shared evidence-record contract rather than folding it into analytics-canon or AudienceIntelligence.

## Cross-cutting evidence quality

### BrainEvidenceQuality — KEEP

Production reachability:
- used by runtime evidence projection;
- direct unit coverage exists.

Role:
- scope match;
- freshness;
- missingness;
- coverage;
- evidence confidence;
- preserves analytics-canon provenance.

Target:
- remain a reusable cross-cutting evidence-quality specialist behind the unified facade.

## Specialist intelligence — KEEP

### StatisticsIntelligence
Deterministic metrics/summary specialist over canonical evidence. No model ownership, no analytics persistence.

### AudienceIntelligence
Aggregate audience-evidence specialist. Keeps explicit evidence boundaries and avoids invented personas/sensitive-trait inference.

### ChannelIntelligence
Channel-specific specialist used by Algorithm Intelligence orchestration.

### OpportunityIntelligence
Maps typed opportunity evidence into Algorithm signals.

### Algorithm Intelligence portfolio
Keep orchestration, strategy, priming and decision specialists distinct. Their evidence inputs should converge; their domain behavior should not be flattened into one generic intelligence function.

## Anomaly path

### AnomalySignalBridge — ADAPTER / REVIEW

Role:
- translates externally produced anomaly signals into AlgorithmSignal form.

Target:
- retain until the common DerivedSignal contract is designed.
- likely destination is the derived-signal layer inside Evidence & Intelligence, not deletion of anomaly semantics.

## First convergence target

Introduce `EvidenceIntelligenceResolver` as a read-only Brain runtime projection facade.

Version 1 owns no data. It coordinates:

```text
analytics-canon snapshot
        ↓
BrainEvidenceQuality
        ↓
StatisticsIntelligence
        ├── optional AudienceIntelligence
        └── Brain Context
Brain evidence pack
        ↓
optional OpportunityEvidenceAdapter
        ↓
Algorithm Intelligence
```

The facade must:

- read canonical analytics once per Brain runtime projection;
- preserve channel scope mismatch as a hard boundary for analytics-derived specialists;
- keep optional projections task-bounded;
- preserve specialist output types;
- preserve evidence IDs;
- create no new storage.

## Initial disposition matrix

| Module | Current role | Runtime caller status | Target |
| --- | --- | --- | --- |
| analytics-canon | analytics truth | active | KEEP |
| BrainEvidenceQuality | quality projection | active | KEEP |
| StatisticsIntelligence | specialist | active | KEEP |
| AudienceIntelligence | specialist | active | KEEP |
| ChannelIntelligence | specialist | active | KEEP |
| OpportunityIntelligence | specialist/signal mapper | active | KEEP |
| BrainStatisticsBridge | runtime adapter | active pre-migration | ADAPTER → PROJECT |
| BrainAudienceBridge | runtime adapter | active pre-migration | ADAPTER → PROJECT |
| OpportunityEvidenceAdapter | derived-signal adapter | active pre-migration | ADAPTER behind facade |
| BrainAnalyticsEvidence | evidence explanation adapter | no caller found | donor audit → possible QUARANTINE |
| AudienceEvidenceCollector | acquisition | onboarding active | KEEP / PAIR |
| collectBrainAudienceEvidenceWithYouTube | acquisition helper | no caller found | REVIEW; donor/reachability check |
| AnomalySignalBridge | signal adapter | specialist path | ADAPTER pending DerivedSignal contract |

## Exit criteria for this convergence slice

- `BrainOrchestrator` imports one Evidence Intelligence facade rather than three separate evidence bridges.
- one canonical analytics snapshot feeds quality/statistics/audience in a turn;
- channel scope mismatch suppresses analytics-derived specialist projections;
- opportunity evidence remains deterministic and channel-scoped;
- no new analytics persistence;
- existing specialist modules remain intact;
- old bridges remain until zero-caller certification;
- caller audit and classification registry are updated.
