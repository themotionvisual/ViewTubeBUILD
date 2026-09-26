# ViewTube AI Systems — Living Master Resource

**Status:** CANONICAL AI SYSTEMS MANAGEMENT / AGENT ORIENTATION AUTHORITY  
**Scope:** Agent-facing management, documentation, coordination, status, provenance, planning, audit and integration map for ViewTube AI/Brain systems.  
**Canonical owner / concern:** AI systems management and cross-authority coordination.  
**Created:** 2026-09-24  
**Last audited main:** `fbc7d25c71fa89c312da32280d9f77182065b42a`  
**Does not replace:** `UNIFIED_AI_SYSTEM_CANONICAL_CONSOLIDATION_CONTRACT_2026-09-17.md`, Prompt System Authority, Projects/ContentBuild, Asset Engine, Analytics/VT-SYNC, Herald, Editor, Toolbox/UI, auth, deployment, or other bounded authorities.  
**Supersedes for AI-system-management orientation:** historical broad AI audits, phase inventories, and duplicated AI status/planning documents listed in `ai-systems/DOCUMENT_CONSOLIDATION_REGISTER_2026-09-24.md`.

## 1. Purpose

This is the single orientation and management entry point for every agent working on ViewTube AI.

It answers:

- What AI systems exist?
- Who owns each concern?
- What is canonical versus historical?
- What is on current `main`, branch-only, partial, planned, blocked, superseded, or retired?
- What evidence, prompt, model, context, Project, ContentBuild, asset, outcome and learning systems are involved?
- What work is currently claimed?
- What work was completed and with what proof?
- What should an agent read before changing a subsystem?
- Where should new plans, receipts, decisions and audits be recorded?
- Which historical branches/documents are donors only?
- What must never be duplicated?

This document is a **control-plane authority**, not another AI runtime or persistence owner.

## 2. Core rule: authority of authorities, not another Brain

The canonical product architecture remains:

```
VT-SYNC / analytics-canon
        ↓
evidence / statistics / intelligence
        ↓
Channel Profile + Channel Knowledge + Project / ContentBuild
        ↓
Context Resolver / BrainContextBroker
        ↓
BrainRuntime / specialist intelligence / Asset generation
        ↓
ActionPacket / ToolReceipt / Vault / Publishing
        ↓
creator decision + measured outcome
        ↓
evaluation
        ↓
learning candidate
        ↓
governed promotion
        ↓
Channel Knowledge
```

This resource manages the map. It does not become the map's runtime owner.

## 3. Mandatory agent orientation protocol

Before planning or modifying an AI system:

1. Read this file.
2. Pin the current `main` SHA used for the audit.
3. Identify the canonical owner for the concern.
4. Read the bounded authority documents for that owner.
5. Search current code and tests.
6. Search active plans/tasks.
7. Search prior PRs/branches and donor records.
8. Classify claims as **PROVEN / CLAIMED / UNKNOWN**.
9. Claim the work before editing shared AI architecture.
10. Record material progress and completion with receipts.
11. Update this resource and relevant registries if ownership/status changes.
12. Never mark a stacked/feature-branch implementation as current `main` without ancestry/code verification.

## 4. Canonical ownership map

| Concern | Canonical owner | Management rule |
| --- | --- | --- |
| Creator-facing reasoning/orchestration | BrainRuntime | Never create another general Brain. |
| Model/provider invocation | BrainModelGateway / provider layer | UI must not own provider calls for creator reasoning. |
| Context selection | BrainContextBroker / Context Resolver | Task-specific, bounded, evidence-aware context. |
| Analytics truth | VT-SYNC + analytics-canon | No feature-local analytics truth or raw bypass. |
| Deterministic analytics | Statistics Intelligence / analytics-canon helpers | Models interpret calculations; they do not invent them. |
| Durable creator/channel knowledge | Channel Profile / Channel Knowledge | Models cannot directly write validated learning. |
| Project intent/work identity | Projects / ContentBuild | Preserve project/contentBuild identity through tools. |
| Artifacts/provenance | Vault / Asset Engine | No parallel permanent asset universe. |
| Generation provenance | Generation Store + BrainTrace + ToolReceipt | Stable output IDs and evidence/model/prompt lineage. |
| Internal handoff | ActionPacket / handoff system | Handoff never grants permission to mutate externally. |
| Publishing | Publishing Package / PublishTransaction | AI management never bypasses publishing approval. |
| Creator outcomes | BrainOutcomeLedger / domain outcome owners | Creator preference is separate from measured performance. |
| Evaluation | Algorithm/Brain evaluation owners | Preserve scope, metric comparability and insufficient-data states. |
| Learning promotion | Learning governance | Repetition/evidence/creator confirmation gates remain binding. |
| Repository-agent work governance | Herald | AI Systems management consumes Herald; it does not create another repo-agent ledger. |
| Prompt authority | Prompt System Authority + registry | Version prompt behavior; do not silently rewrite important prompts. |

## 5. System state vocabulary

Use these states consistently:

- `planned`
- `claimed`
- `in_progress`
- `blocked`
- `partial`
- `implemented_branch`
- `merged_non_main`
- `landed_main_unverified`
- `landed_main_tested`
- `certified`
- `historical`
- `superseded`
- `retired`

A PR marked “merged” is not enough. Always record the base branch and verify current-main presence.

## 6. Evidence and epistemic rules

Promoted from the strongest historical AI audits and current evidence work:

- Missing evidence is never numeric zero.
- `KNOWN`, `OBSERVED`, `CALCULATED`, `USER_PROVIDED`, `INFERRED`, `HYPOTHESIS`, `ESTIMATE`, `STALE`, `MISSING`, and `CONFLICTING` are materially different.
- Current measured evidence outranks stale learning.
- Creator-confirmed preference outranks model-inferred preference.
- Correlation is not causal proof.
- Unsupported fabricated numbers are blockers; legitimate but unverified derived rates are review/warning states.
- Scope mismatches fail closed.
- Channel/project/video/content-type/time-window scope must remain visible.
- Evidence UI may not imply confidence that the underlying evidence contract does not support.

## 7. Context rules

Historical Brain audits correctly identified the architectural direction that remains binding:

```
question
→ task profile
→ required evidence classes
→ candidate context
→ relevance / authority / freshness / scope / contradiction scoring
→ bounded context budget
→ reasoning
```

Avoid giant profile dumps and fixed clipping when task-specific retrieval is available.

Context should select from:

- creator instruction;
- creator controls;
- Channel Profile;
- Channel Knowledge;
- active Project / ContentBuild;
- canonical analytics/statistics;
- Audience / Channel / Algorithm / Opportunity / Anomaly intelligence;
- research when explicitly required;
- relevant generated assets/outcomes;
- conversation history only when useful.

## 8. Prompt and generation rules

Current prompt authority:

- `VIEWTUBE_PROMPT_SYSTEM_AUTHORITY_2026-09-24.md`
- `VIEWTUBE_PROMPT_IMPROVEMENT_PROGRAM_2026-09-24.md`
- `VIEWTUBE_PROMPT_REGISTRY_2026-09-24.json`

Target composition:

```
Prompt Constitution
+ prompt family
+ Context Resolver recipe
+ creator/channel/project personalization
+ current evidence
+ output schema
+ deterministic validators
+ bounded critique/repair where justified
```

Do not revive historical mega-prompt behavior such as fabricated search volume, CPC, demographics, fake “algorithm health” formulas, guaranteed future views, or unsupported causal claims.

## 9. Handoff and action lifecycle

Historical Phase 1–4 work contributed several durable rules now promoted here:

1. Brain does not duplicate domain logic.
2. ActionPacket/handoff carries typed context/evidence to the destination owner.
3. Loading a handoff may prefill a destination tool; it does not publish or mutate externally by itself.
4. The destination tool owns its local mapping and final action.
5. External/publishing/community/comment mutations remain behind current approval controls.
6. Accepted, rejected and skipped-above workflow choices can become workflow preference evidence.
7. A learning signal is not automatically a durable rule.
8. Actions should expose side effects, preconditions, verification and reversibility.

## 10. Agent work claim protocol

A work claim should be small, explicit and collision-resistant.

### Start-work claim

```yaml
taskId: VT-AI-###
status: claimed
agent: <agent/session>
intent: <bounded goal>
canonicalOwner: <owner>
observedMainSha: <sha>
branch: <branch or null>
filesExpected:
  - <path>
dependencies:
  - <task/system>
risk: low|medium|high
startedAt: <ISO time>
nextCheckpoint: <specific verification point>
```

Rules:

- one agent may actively claim one high-conflict architecture seam at a time;
- claims expire when explicitly released, completed, or superseded;
- overlapping claims require coordination before edits;
- claims do not prove implementation.

## 11. Finished-work receipt

```yaml
taskId: VT-AI-###
status: completed
agent: <agent/session>
observedMainSha: <sha audited>
branch: <branch>
headSha: <sha>
prs:
  - <number>
filesChanged:
  - <path>
systemsChanged:
  - <system id>
tests:
  - command: <command>
    result: passed|failed|baseline_failure
runtimeEvidence:
  - <reference>
decisions:
  - <ADR/decision ref>
newDebt:
  - <item>
followUps:
  - <item>
mainIntegrationState: absent|partial|present|equivalent|unknown
completedAt: <ISO time>
```

A receipt must separate “implemented on branch” from “present on current main”.

## 12. Activity and reporting model

Do not create one giant append-only Markdown log.

Use:

- Herald threads/JSONL for repository-agent execution continuity;
- this master resource for concise Current Work and important decisions;
- machine-readable registries for system/owner/status data;
- domain outcome/trace/event stores for runtime activity;
- task/plan files for execution queues.

Material agent events:

- work claimed;
- work started;
- work blocked;
- material checkpoint;
- artifact produced;
- test/evidence recorded;
- decision recorded;
- work completed;
- rollback;
- authority updated;
- work superseded/released.

## 13. Current work

| Work | State | Authority / plan | Notes |
| --- | --- | --- | --- |
| Evidence Quality | landed/ongoing | `tasks/ai-brain-quality/` | Continue evidence-health and scope discipline. |
| Channel Knowledge | landed/ongoing | `tasks/ai-brain-quality/` | Typed projection/retrieval exists; continued governance/decay work remains. |
| Context Resolver | partial / stacked-history risk | Brain-quality plan | Verify exact current-main adoption before claiming universal coverage. |
| Prompt modernization | active-plan | Prompt System Authority + Finish Program | Legacy `prompts.ts`/`gemini.ts` strangler remains. |
| Outcome/evaluation/learning | partial | Brain-quality + Finish Program | Broader domain writer/evaluation coverage remains open. |
| Assistant continuity | open | Brain-quality plan | Sidebar/Brain Hub/workspace must share canonical context envelope. |
| Agent work claims / receipts | implemented_branch | Herald + AI Systems governance | Read-only Herald projection exists; does not create a second work ledger or imply main integration. |
| AI source-of-truth / systems registry | implemented_branch | this resource + `governance/ai-systems/` | Systems/plans/donors/integrations registries, schemas, health validator, and Herald read projection are forward-ported on the current branch; main merge still required. |
| AI generation observability/evals | active-plan | Finish Program | BrainTrace/ToolReceipt foundations exist; complete coverage does not. |
| Project-grounded retrieval | planned | Finish Program | Must use canonical Context Resolver, not parallel RAG ownership. |

## 14. Current finish-program priorities

Cross-system open work is owned by:

- `tasks/viewtube-finish-program/BACKLOG-REGISTRY.md`
- `tasks/viewtube-finish-program/plan.md`
- `tasks/viewtube-finish-program/todo.md`

AI-system management must project those tasks; it must not duplicate them into a second checklist.

## 15. Reachability / operational health

Use the current AI Governor health reference and:

```bash
npm run audit:reach
```

Health checks should detect:

- orphan systems;
- ledgers/stores with no production writer;
- inert registries;
- direct provider bypass;
- analytics-canon bypass;
- ungoverned creator generation;
- stale canonical docs;
- unresolved duplicate owners;
- unclosed work claims;
- missing prompt/model/evidence provenance;
- polished UI over ungrounded output.

## 16. Agent Ready / public discoverability

Public agent discoverability is related but not equivalent to internal AI-system governance.

Current scan reference:

- `ai-systems/AGENT_READY_REPORT_2026-09-24.md`

Internal implementation details, authenticated data, prompts, private evidence and operational secrets must not be exposed merely to improve public agent readability.

## 17. What must not be centralized here

Do **not** copy full payloads from:

- BrainTrace;
- analytics evidence;
- Channel Knowledge;
- Generation Store;
- ToolReceipt;
- Outcome Ledger;
- Vault assets;
- ContentBuild history;
- Prompt Registry;
- Herald ledger.

Reference stable IDs and current owners instead.

## 18. Historical AI document migration

The consolidation register is:

- `ai-systems/DOCUMENT_CONSOLIDATION_REGISTER_2026-09-24.md`

Historical AI audits/phase documents are moved to:

- `docs/migration/reference/brain-ai-history/`

They remain provenance, never current status authority.

## 19. Mandatory update contract

Any AI-system change that materially alters ownership, reachability, prompt families, evidence/context flow, persistence, action permissions, traceability, evaluation or learning must update:

1. its bounded canonical authority;
2. this resource if cross-system state changed;
3. the documentation registry if authority/lifecycle changed;
4. relevant machine registry once implemented;
5. current-work/receipt record;
6. supersession/deprecation references where applicable.

## 20. Update log

| Date | Agent / workstream | Change | Audited main |
| --- | --- | --- | --- |
| 2026-09-24 | AI Systems Management consolidation | Created living AI systems management authority; harvested unique rules from legacy AI audits/phase docs; linked Finish Program, Prompt Authority, Herald and Agent Ready work. | `c494d96aad9cbcf073e7d157685cb8b0269f123d` |
| 2026-09-26 | AI Systems governance mainline forward-port | Re-audited after stacked-PR merge mismatch; forward-ported governance schemas, validator, Herald projection and system/plan/donor/integration registries onto current mainline branch; corrected Herald sync-script contradiction. | `fbc7d25c71fa89c312da32280d9f77182065b42a` |
