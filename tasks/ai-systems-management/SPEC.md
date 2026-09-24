# Specification — ViewTube AI Systems Management Skill and Living Resource

## Problem

AI/Brain work spans many canonical systems, plans, prompts, branches, PRs, runtime traces, historical donor documents and agent sessions. The information exists, but future agents can still:

- start from stale audits;
- confuse “PR merged” with “on current main”;
- create parallel owners;
- repeat donor audits;
- work on the same architecture seam simultaneously;
- fail to report what changed;
- lose work context between sessions;
- treat self-reported completion as proof;
- overlook prompt/model/evidence provenance.

## Product responsibility

The existing `viewtube-ai-system-governor` becomes the operational skill entrypoint for AI systems management.

It must answer, for a blind agent:

1. What should I read?
2. What owns this concern?
3. What is current vs historical?
4. Is somebody already working on it?
5. What code/docs/prompts/tests are relevant?
6. What branch/PR/donor work already exists?
7. What evidence proves the current state?
8. How do I claim work?
9. How do I report completion?
10. What must I update before handoff?

It must not become a new AI runtime, data store or generic outcome ledger.

## Information architecture

### SKILL.md
Keep under 500 lines. It is a Map of Content, not the knowledge database.

It should contain:

- trigger boundaries;
- responsibility boundary;
- mandatory orientation sequence;
- authority-resolution rule;
- work-claim rule;
- evidence/status vocabulary;
- update/handoff rule;
- dangerous-seam checklists;
- pointers to references.

### Reference modules
Recommended:

- `references/ai-systems-management.md`
- `references/work-claims-and-receipts.md`
- `references/authority-and-freshness.md`
- `references/operational-health-check.md` (already exists)
- `references/prompt-and-model-governance.md`
- `references/donor-migration.md`

### Human authority
- `docs/brain/VIEWTUBE_AI_SYSTEMS_MASTER_RESOURCE.md`

### Supporting references
- `docs/brain/ai-systems/AGENT_READY_REPORT_2026-09-24.md`
- `docs/brain/ai-systems/DOCUMENT_CONSOLIDATION_REGISTER_2026-09-24.md`
- existing Prompt Authority/Registry
- Finish Program
- Brain-quality tasks
- bounded domain masters

## Planned machine registries

Target folder:

`governance/ai-systems/`

Planned files:

- `registry/systems.json`
- `registry/capabilities.json`
- `registry/integrations.json`
- `registry/plans.json`
- `registry/donors.json`
- `registry/agents.json`
- `schemas/authority-record.schema.json`
- `schemas/agent-report.schema.json`
- `schemas/evidence-reference.schema.json`
- `schemas/prompt-reference.schema.json`
- `schemas/managed-action.schema.json`

Do not relocate existing Prompt Registry or active task files in the first wave; reference them.

## Authority record minimum

Every current machine authority record should contain:

- stable ID;
- kind;
- title/summary;
- lifecycle/status;
- canonical owner and bounded concern;
- code/doc/test/PR/commit refs;
- dependencies and overlap/supersession;
- created/updated/last-audited time;
- last-audited main SHA;
- schema version;
- record version;
- evidence refs;
- plan/task refs;
- integration state.

## Main-integration state

Never collapse branch state into a boolean.

Use:

- absent;
- partial;
- equivalent;
- present;
- superseded;
- unknown.

Also record:

- PR number;
- PR base;
- PR merge state;
- merge commit;
- verified main SHA;
- verification refs.

## Claim model

A claim is coordination state, not proof of implementation.

Required fields:

- taskId;
- agent/session;
- intent;
- owner;
- observed main SHA;
- branch;
- expected files/systems;
- dependencies;
- risk;
- startedAt;
- next checkpoint.

A high-conflict architecture seam can have only one active claim unless agents explicitly coordinate.

## Completion receipt

A completion receipt includes:

- task ID;
- agent/session;
- branch/head SHA;
- PRs;
- changed files/systems;
- tests/CI;
- runtime or visual evidence;
- decisions/ADRs;
- debt/follow-ups;
- main integration state;
- completion time.

Self-report is never enough for PROVEN status.

## Freshness and supersession

Canonical docs/records must expose:

- last audited timestamp;
- last audited main SHA;
- supersedes/supersededBy;
- related bounded authorities.

Historical docs are retained when they provide provenance or donor value, but current-state language must be clearly marked historical.

## Automation / CI target

Validate:

- registry JSON schemas;
- broken doc pointers;
- missing authority metadata;
- duplicate canonical owner claims;
- canonical records whose paths no longer exist;
- historical docs presented as current authority;
- orphan AI services/capabilities;
- ledgers with readers but no production writer;
- direct provider-generation bypasses;
- analytics-canon bypasses;
- prompt records with missing version/provenance;
- active claims beyond allowed age;
- completed tasks without receipts.

Generated summaries are projections, not canonical truth. A generator may propose/update a materialized view only from canonical source refs.

## Public Agent Ready boundary

Internal AI Systems management and public agent discoverability are related but distinct.

Public-safe projection may support:

- AGENTS.md;
- llms.txt / llms-full.txt;
- sitemap/metadata/JSON-LD;
- public Markdown docs.

Never project private prompts, authenticated endpoints, user evidence, Herald logs, Channel Profile data, credentials or unsafe operational action contracts to the public site.

## Definition of done

The program is complete when:

- blind agents can orient without prior chat history;
- every AI bounded concern has one visible owner;
- current/historical status is unambiguous;
- parallel work collisions are detectable;
- claims/receipts/handoffs are standard;
- Prompt/Model/Evidence/Project/Trace/Outcome references join through stable IDs;
- PR/branch/main state cannot be confused;
- stale/duplicate docs are detected;
- AI health checks are automated;
- the Brain Hub can render a read-only management view from projections;
- future AI work updates this resource as part of Definition of Done.
