# AI Operational Health Check

**Owner:** `viewtube-ai-system-governor`  
**Origin:** harvested and updated from PR #241's `viewtube-ai-system-steward`.  
**Rule:** re-measure current code. Never reuse the donor's 2026-09-12 counts as current status.

## Six decay patterns

### 1. Orphan subsystem
Code exists and tests itself but has no reachable application consumer.

Gate: name and verify the entry-point/caller path. A module imported only by tests is not production-complete.

### 2. Ledger/store with no writer
Reads/UI exist but production never records outcomes/evaluations.

Gate: stores that matter to product learning need reachable write callers in the same completed capability.

### 3. Inert registry
A capability/tool is selected and logged but never changes execution.

Gate: tests must assert the handler/tool contributed, not merely that selection returned its ID.

### 4. Ungoverned generator
A creator-facing path builds a prompt, calls a provider directly and returns an untraceable blob.

Gate: governed generation uses canonical provider/runtime boundaries, structured output where practical, evidence/style/validation, BrainTrace and outcome identity.

### 5. Canonical data bypass
AI code reads raw VT-SYNC/upstream/private stores around analytics-canon or another canonical owner.

Gate: enforce the canonical owner unless a documented adapter is itself part of that owner.

### 6. Trust UI over ungrounded output
Evidence/confidence visuals appear even though the result has no real evidence/provenance.

Gate: confidence/evidence UI must reflect actual typed evidence and uncertainty.

## Current health pass

Run before AI-affecting releases and periodically:

```bash
# Reachability
node scripts/audit/reach.mjs

# Direct provider ownership (review every hit)
grep -rn "new GoogleGenAI" src --include='*.ts' --include='*.tsx'

# Raw VT-SYNC/upstream reads outside canonical analytics
grep -rn "vt-sync-local/upstream" src --include='*.ts' --include='*.tsx' \
  | grep -v "src/services/analytics-canon/"

# Brain outcome/evaluation writers
grep -rn "recordBrainOutcome\|recordAlgorithmIntelligenceEvent" src \
  --include='*.ts' --include='*.tsx'

# Direct creator-widget provider imports
grep -rl "services/gemini" src/views src/components src/features \
  --include='*.ts' --include='*.tsx' || true

# Browser-local ownership
grep -rl "localStorage\." src --include='*.ts' --include='*.tsx' \
  | grep -v "\.test\." | wc -l
```

The exact command set can evolve with the architecture. What matters is that every pass measures reachability, writers, provider bypasses, canonical-owner bypasses, local-state ownership and direct generator debt.

## Ratchet

Maintain a dated result table in an audit/receipt, not hardcoded forever in this skill.

Recommended metrics:

- total unreachable `src` modules;
- unreachable `src/services/brain` modules;
- canonical stores with no production writer;
- direct provider call sites;
- creator surfaces importing provider/gemini paths directly;
- analytics-canon bypasses;
- browser-local persistence owners;
- legacy creator generators not governed by AssetGenerator/BrainRuntime;
- AI operations emitting BrainTrace;
- outcome/evaluation producers with exact generation/action lineage.

A regression requires an explicit owner and reason.

## Add gates

For a new Brain capability:
- reachable executable handler;
- evidence/context contract;
- user-control behavior;
- trace contribution;
- representative eval.

For a new creator generator:
- governed asset/runtime path;
- typed/validated output;
- current style/evidence policy;
- trace + stable output ID;
- outcome hook;
- rich/sparse/empty fixture coverage.

For a new ledger/store:
- named writer(s);
- named reader(s);
- retention/ownership;
- trace/evidence identity;
- no duplicate canonical store.

## Removal gate

For each orphan or bypass: **wire, migrate, quarantine with explicit reason, or delete after parity**. Age is not proof of deadness.

## Verification

A health pass is complete when:
- reachability was measured;
- writer/read reachability was checked;
- direct-provider and canonical-bypass hits were classified;
- current metrics were recorded;
- new regressions have owners;
- applicable AI eval cases were run.
