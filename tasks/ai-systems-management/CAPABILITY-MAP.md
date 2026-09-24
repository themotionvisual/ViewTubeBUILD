# ViewTube AI Systems Management — Capability Map

**Date:** 2026-09-24  
**Status:** planning authority for the AI Systems Management skill/resource program.  
**Primary orientation resource:** `docs/brain/VIEWTUBE_AI_SYSTEMS_MASTER_RESOURCE.md`  
**Operational skill:** extend `.claude/skills/viewtube-ai-system-governor/`; do not create another competing AI governor or Brain.

## Destination

Create one living, agent-facing control plane for all work on ViewTube AI that:

- orients a blind agent quickly;
- maps canonical systems/owners/dependencies;
- records current status and freshness;
- links plans, prompts, models, evidence, traces, tests, PRs and decisions;
- lets agents claim/release work and report completion;
- preserves historical/donor knowledge without letting it override current truth;
- detects stale docs, duplicate owners, orphan systems and unclosed work;
- projects existing runtime/Herald facts instead of duplicating them;
- eventually powers a read-only Brain Hub AI Systems management workspace.

## Capability modules

### M1 — Living Authority
Human-readable AI Systems Living Master Resource with current owner map, status vocabulary, update contract, current work and references.

### M2 — Machine Authority Registry
Versioned system/capability/integration/plan/donor/agent records with stable IDs, schema version, record version and audited-main SHA.

### M3 — Document Authority & Freshness
Registry lifecycle, supersession graph, archive paths, last-audited SHA/time, broken-pointer detection and stale-current warnings.

### M4 — Agent Claims & Coordination
Collision-resistant work claims, releases, blockers and handoffs. Repository work continues to use Herald as execution ledger.

### M5 — Work Receipts & Provenance
Finished-work receipts linking branches, commits, PRs, files, tests, CI, decisions, runtime evidence and main-integration state.

### M6 — Prompt / Model / Generation Map
References existing Prompt Registry, requested/served model, prompt versions, context resolver versions, generation IDs and eval results.

### M7 — Evidence / Context / Knowledge Map
References canonical evidence owners, Channel Knowledge/Profile, project scope, freshness, confidence, contradictions and missingness.

### M8 — Runtime Trace & Outcome Projection
Read-only correlation across BrainTrace, GenerationRequest, ToolReceipt, ActionPacket, ContentBuild, Vault, PublishTransaction, outcomes, evaluation and learning.

### M9 — Donor / Migration / Deprecation Registry
Records whether historical PRs/docs/code are absorbed, superseded, portable, donor-only, archived or retired, with current owner and proof.

### M10 — Health / Reachability / Certification
Detects orphan systems, writer-less stores, inert registries, direct-provider bypasses, analytics-canon bypasses, stale canonical docs, duplicate owners, missing evals and open claims.

### M11 — Brain Hub Management Projection
Read-only product UI for Systems, Agents/Runs, Prompts, Plans, Evidence/Traces, Knowledge/Learning, Audit and Health.

### M12 — Managed Actions
Future gated DO/UNDO operations only after semantic action contracts, permissions, preconditions, side-effects and rollback are certified. Not first-wave scope.

## Dependency order

`M1 → M2/M3 → M4/M5/M9 → M6/M7 → M8/M10 → M11 → M12`

## Non-negotiable boundaries

- BrainRuntime stays creator-facing reasoning/orchestration owner.
- Herald stays repository-agent execution governance owner.
- analytics-canon stays normalized analytics owner.
- Channel Profile/Knowledge stays durable creator/channel knowledge owner.
- Projects/ContentBuild stays project/work identity owner.
- Vault/Asset Engine stays artifact/provenance owner.
- Prompt Registry stays prompt inventory authority.
- BrainTrace/ToolReceipt/Outcome systems stay runtime evidence owners.
- The management system stores references and projections, not duplicate payload universes.
