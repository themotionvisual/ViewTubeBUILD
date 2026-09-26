# ViewTube Conversation & Improvement OS

**Production Date:** 2026-09-26  
**Last Edited:** 2026-09-26  
**Class:** CONSTITUTION  
**Status:** ACTIVE  
**Concern:** cross-agent conversation continuity, prior-art reconciliation, proactive improvement, recommendation and governed handoff  
**Owner:** Conversation & Improvement OS  
**Registry ID:** DOC-GOV-CONVERSATION-OS  
**Last Audited Main SHA:** e657cefe83f3f66d5a8316543814d9d18197b338  
**Supersedes:** agent/contracts/herald-in.md; agent/contracts/herald-out.md; agent/contracts/herald-workflow.md after migration certification  
**Related Authorities:** docs/governance/CROWN.md; docs/governance/TASK_AUTHORITY.md; docs/governance/DOCUMENTATION.md; docs/governance/VERIFICATION.md; docs/references/DEEP_RESEARCH_CONSTRUCTION_SOURCE.md

## Purpose

The Conversation & Improvement OS lets ChatGPT, Codex, Claude and future agents understand ViewTube, resume prior work, avoid duplication, recommend better approaches, perform work, verify it, and leave a durable handoff without turning conversation transcripts into a new truth store.

Its responsibilities are:

UNDERSTAND · CONTINUE · RECONCILE · INSPECT · ADVISE · DISCOVER · SIMPLIFY · OPTIMIZE · WARN · RESEARCH · IMPLEMENT · VERIFY · RECORD · HAND OFF

## Internal loop

ORIENT → RESOLVE → RECONCILE → INSPECT → IMPROVE → PLAN → ACT → VERIFY → RECORD → RECOMMEND

This loop is normally invisible to the user.

### ORIENT
Resolve the smallest useful context set:
1. current main / branch / PR state;
2. Documentation Governance;
3. Product Completion Constitution;
4. Product Architecture + Capability Registry;
5. Integrated Application Program when cross-system;
6. matching Task Index item(s) or candidate;
7. owning Domain Authority / Specification;
8. active Crown mission/work order and recent receipts;
9. relevant failure→fix/history/donor evidence;
10. required skills;
11. applicable MASTER_SOURCE references.

Do not load the entire repository or months of conversations when a task dossier is enough.

### RESOLVE
Clarify only when materially different interpretations would produce different work or unsafe consequences. Otherwise state the assumption internally and proceed.

### RECONCILE
Before creating work, classify it:
- NEW
- CONTINUATION
- DUPLICATE
- SUPERSEDES
- EXPANDS
- BUG_IN_EXISTING
- VERIFICATION_ONLY
- HISTORICAL_DONOR

Search existing capabilities, tasks, current main, Domain Authorities, active missions/PRs, skills, tools, prototypes, Master Sources and Removed Archive only when recovery is relevant.

### INSPECT
Look beyond the immediate request for:
- bugs;
- conflicting ownership;
- duplicate systems/state;
- dead-code candidates;
- fragile architecture;
- missing tests/verification;
- performance waste;
- confusing UX;
- mobile/responsive failures;
- accessibility problems;
- stale/contradictory documents;
- obsolete dependencies;
- unnecessary workflow steps.

### IMPROVE
Prefer a simpler correct canonical system over a more sophisticated duplicated system.

Ask:
- Can this be removed?
- Can these paths be merged?
- Can ownership become clearer?
- Can this reuse an existing capability?
- Can the workflow lose a step?
- Can the user understand it without documentation?
- Can a deterministic tool replace repeated model reasoning?

### PLAN / ACT / VERIFY
Use current owners and the smallest skill set. Significant work may become a Crown Mission. Code/UI work follows docs/governance/VERIFICATION.md.

### RECORD
Durable results go to governed records:
- task mutation proposal;
- Mission / Work Order / Receipt;
- Decision;
- Authority or Specification update;
- Opportunity / Risk;
- artifact/reference record;
- skill/workflow/tool/test-harness update.

The conversation itself owns none of those truths.

### RECOMMEND
Recommend useful next improvements after completing the current goal when evidence supports them. Do not turn every observation into a task.

## Proactive Improvement Advisor

The OS should proactively evaluate and, when useful, recommend:

- ARCHITECTURE simplification/consolidation;
- RELIABILITY and recovery;
- BUG fixes;
- DEAD_CODE candidates;
- PERFORMANCE;
- UX and information architecture;
- MOBILE / responsive behavior;
- ACCESSIBILITY;
- AI / agent / prompt / memory / context architecture;
- VIDEO_GENERATION providers and workflows;
- REMOTION architecture and render practices;
- DESIGN_SYSTEM / primitive reuse;
- SECURITY;
- DEVELOPER_EXPERIENCE;
- DOCUMENTATION;
- DEPENDENCY upgrades/retirement;
- EXTERNAL_TOOL / REPOSITORY / MCP / plugin / skill;
- AUTOMATION / CI;
- COST / quota / infrastructure improvements.

Distinguish:
- OBSERVED
- STRONGLY_INFERRED
- POSSIBLE
- EXPERIMENTAL

Do not create committed work from speculative best practices.

## External research rule

When recommending a current repository, package, AI model/provider, video-generation service, Remotion practice, UI framework, testing system, MCP server or external workflow:
1. verify it currently exists;
2. verify the relevant capability/version/status;
3. reconcile it with the existing ViewTube owner;
4. evaluate whether adoption simplifies or duplicates;
5. record integration cost, migration risk and important license/security/provider caveats;
6. classify fit: ADOPT_NOW, EVALUATE, DEFER or REJECT.

Do not recommend named current technologies from stale memory alone.

## Knowledge-Creation Advisor

During substantial work, ask whether the durable output should be:
- PLAN
- AUDIT
- REPORT
- AUTHORITY_UPDATE
- CONSOLIDATION
- DECISION_RECORD
- SKILL / SKILL_UPDATE
- WORKFLOW
- PROTOTYPE
- STANDALONE_HTML
- TOOL
- REFERENCE
- TEST_HARNESS
- MIGRATION
- TASK_CANDIDATE

Before CREATE, prefer UPDATE, EXTEND or CONSOLIDATE when appropriate.

## Master Sources

MASTER_SOURCE references are privileged prior art within their scope. The Deep Research & Construction Source should be consulted for broad product/tool/AI/analytics/integration/workstation ideation. Master Sources challenge and enrich the architecture; they do not override current authorities or verified implementation truth.

## Opportunity and Risk records

An improvement may first become an Opportunity or Risk rather than a Task.

Opportunity fields should include:
- id;
- title;
- category;
- source conversation/mission;
- evidence;
- confidence;
- expected impact;
- related capabilities/domains/tasks;
- disposition.

Risk fields should include:
- id;
- title;
- category;
- evidence;
- likelihood/impact;
- affected owners/capabilities;
- mitigation candidate;
- disposition.

Accepted concrete work is promoted through Task Authority; rejected/deferred observations remain traceable without bloating the Task Index.

## Conversation envelope

A substantial thread may carry:

```yaml
conversationId: VT-CONV-...
missionId: VT-MISSION-...
taskIds: [vt-...]
programs: [...]
domains: [...]
capabilities: [CAP-...]
authoritiesRead: [...]
decisions: [...]
opportunities: [...]
risks: [...]
receipts: [...]
nextAction: ...
```

The envelope is a resumability pointer, not a truth store.

## Context layers

A — universal tiny context:
- governance;
- Product Completion Constitution;
- Product Architecture summary;
- Integrated Application Program summary;
- Task Authority rules;
- current main SHA.

B — mission/task dossier:
- current task/candidate;
- mission/work order;
- recent decisions/receipts;
- next action.

C — bounded domain context:
- Domain Authority;
- specifications;
- relevant Master Source sections;
- known failure/fix evidence.

D — exact implementation:
- current files/functions/tests/logs required for the work.

Load deeper layers only when needed.

## Resumption rule

Resume from the task dossier + recent decisions + receipts + current code + owning authorities. Do not replay full transcripts unless a missing detail cannot be recovered elsewhere.

## User-facing response rule

Normal replies should be natural and compact. Surface:
- what matters;
- what was found/done;
- important evidence or blockers;
- useful recommendation/next action.

Do not force READBACK/PRIOR-ART/OWNER/LEDGER headings, T0/T1/T2 labels, or twelve protocol blocks into ordinary user messages.

Detailed dossiers remain available when useful.

## Human-decision boundary

Escalate to the creator for:
- materially changing accepted product behavior;
- deleting accepted capabilities;
- conflicting product goals;
- destructive migration with meaningful risk;
- billing/permission/publishing implications;
- replacing a canonical owner;
- irreversible actions.

Routine engineering and reversible implementation choices should not create unnecessary approval bottlenecks.

## Constitutional rule

No agent gets its own version of ViewTube work state.

Agents receive projections of the same governed state and return proposals, decisions, evidence and receipts to the same governed systems.
