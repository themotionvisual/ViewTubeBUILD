# Evidence Record & Derived Signal Contract

**Status:** DRAFT CONVERGENCE CONTRACT  
**Date:** 2026-09-27  
**Parent:** `docs/architecture/VIEWTUBE_SYSTEM_CONVERGENCE_AND_CONSOLIDATION.md`  
**Runtime facade:** `src/services/brain/EvidenceIntelligenceResolver.ts`

## 1. Why this contract exists

ViewTube currently has several legitimate evidence sources and several legitimate intelligence specialists, but they do not all express provenance, scope, freshness and comparability in the same way.

The goal is not to force all evidence into one physical database. The goal is a common **read/projection contract** that lets BrainRuntime, specialists, widgets and operations reason about evidence consistently while preserving the source owner.

## 2. Ownership rule

An EvidenceRecord is a projection/reference, not a new source of truth.

Examples:

- analytics evidence remains owned by `analytics-canon`;
- comments/transcripts remain owned by their acquisition/storage systems;
- creator-confirmed preferences remain Creator Context/Knowledge, not analytics evidence;
- external research retains source/citation ownership;
- experiment and outcome evidence remains owned by the outcome/evaluation domain.

## 3. EvidenceRecord v1

Proposed logical contract:

```ts
type EvidenceOwner =
  | "analytics-canon"
  | "youtube-read"
  | "comments"
  | "transcript"
  | "vault"
  | "project"
  | "publishing"
  | "outcomes"
  | "experiment"
  | "research"
  | "creator-confirmed"

type EvidenceEpistemicState =
  | "observed"
  | "derived"
  | "creator_confirmed"
  | "stale"
  | "missing"

interface EvidenceRecord {
  id: string

  owner: EvidenceOwner
  sourceRef: string
  sourceSnapshotId?: string | null

  channelId?: string | null
  projectId?: string | null
  contentBuildId?: string | null
  videoId?: string | null
  assetId?: string | null

  datasetId?: string | null
  entityType?: string | null
  entityId?: string | null

  metric?: string | null
  value?: number | string | boolean | null
  unit?: string | null

  population?: string | null
  format?: string | null
  geography?: string | null

  window?: {
    kind: string
    start?: string | null
    end?: string | null
  } | null

  observedAt?: string | null
  updatedAt?: string | null
  freshness: "fresh" | "stale" | "unknown"

  epistemicState: EvidenceEpistemicState
  confidence?: number | null

  missingness?: string[]
  limitations?: string[]

  provenance: {
    evidenceIds: string[]
    sourceRoute?: string | null
    sourceVersion?: string | null
  }
}
```

## 4. DerivedSignal v1

Derived signals are deterministic or bounded interpretations over EvidenceRecords.

They are **not** source evidence and must retain all relevant evidence references.

```ts
type DerivedSignalKind =
  | "trend"
  | "comparison"
  | "anomaly"
  | "opportunity"
  | "cohort"
  | "audience"
  | "search"
  | "packaging"
  | "retention"
  | "revenue"
  | "format"
  | "relationship"

interface DerivedSignal {
  id: string
  kind: DerivedSignalKind

  channelId?: string | null
  projectId?: string | null
  contentBuildId?: string | null
  videoId?: string | null

  label: string
  metric?: string | null
  currentValue?: number | null
  baselineValue?: number | null
  delta?: number | null
  relativeDelta?: number | null

  confidence: number
  impact?: number | null

  evidenceIds: string[]
  derivation: {
    method: string
    version: string
    deterministic: boolean
  }

  limitations?: string[]
}
```

## 5. Evidence is not intelligence

The system should keep three explicit layers:

```text
EvidenceRecord
  observed/confirmed source facts
        ↓
DerivedSignal
  deterministic comparison/trend/anomaly/opportunity
        ↓
Specialist Intelligence
  Statistics / Audience / Channel / Opportunity / Algorithm / Packaging
        ↓
BrainRuntime
  task-specific reasoning and creator-facing explanation
```

This separation prevents model prose from becoming analytics truth.

## 6. Comparability guard

Before comparing two numeric EvidenceRecords, a shared guard must answer whether the comparison is valid.

Minimum compatibility dimensions:

- same metric definition;
- same unit;
- compatible population;
- compatible content format when format materially affects the metric;
- compatible time-window semantics;
- compatible geography where relevant;
- same channel unless explicitly performing a cross-channel comparison;
- sufficient freshness;
- no missing denominator required by the metric;
- compatible attribution/source semantics.

Suggested contract:

```ts
interface EvidenceComparabilityResult {
  comparable: boolean
  level: "exact" | "normalized" | "directional" | "invalid"
  reasons: string[]
  normalization?: string | null
}
```

Rules:

- **exact** — directly comparable without transformation;
- **normalized** — valid only after deterministic normalization;
- **directional** — useful as qualitative direction, not numeric magnitude;
- **invalid** — must not be combined or ranked.

Brain/model prompts must receive the result, not decide comparability themselves.

## 7. Mapping current systems

### analytics-canon
Projects dataset manifests/metrics into EvidenceRecord without changing ownership.

### BrainEvidenceQuality
Provides freshness/missingness/scope metadata that enriches EvidenceRecord bundles and runtime quality summaries.

### StatisticsIntelligence
Consumes comparable analytics EvidenceRecords and produces deterministic summaries.

### AudienceIntelligence
Consumes aggregate audience EvidenceRecords + Statistics Intelligence.

### AudienceEvidenceCollector
Produces/acquires raw audience-source evidence. It should eventually emit EvidenceRecord projections for comments/activity/video targets while retaining its acquisition packet.

### AnomalySignalBridge
Target: emit/translate `DerivedSignal(kind="anomaly")`.

### OpportunityEvidenceAdapter
Target: emit/translate `DerivedSignal(kind="opportunity")` or map the shared signal into OpportunityEvidence while compatibility remains.

### BrainAnalyticsEvidence
Donor value: human-readable evidence explanation and source-route semantics. Those ideas should move into EvidenceRecord presentation/projection before quarantine.

## 8. What does NOT belong in EvidenceRecord

Do not store these as evidence simply because the Brain uses them:

- creator goals;
- style preferences;
- project intent;
- prompt instructions;
- model recommendations;
- speculative personas;
- unsupported inferred motivations;
- arbitrary model confidence.

Those belong in Creator Context, Operations, or Specialist Intelligence.

## 9. Migration sequence

1. Add shared TypeScript contracts without changing owners.
2. Project analytics-canon manifests/metrics into EvidenceRecord.
3. Add comparability guard.
4. Adapt Anomaly and Opportunity signals to DerivedSignal.
5. Add audience/comment/transcript evidence projections.
6. Update specialist inputs incrementally.
7. Update widgets/Brain Hub to display shared provenance.
8. Zero-caller audit old evidence explanation/bridge adapters.
9. Quarantine only after parity and donor harvest.

## 10. Acceptance criteria

- every evidence record names its owner;
- every derived signal references evidence IDs;
- comparisons have an explicit comparability decision;
- specialists never need to infer missing scope from prose;
- no new duplicate analytics store;
- no model output is promoted to observed evidence;
- widgets can trace a recommendation back to evidence;
- stale/missing evidence stays explicit rather than becoming zero;
- channel/project/content scope mismatches fail closed.
