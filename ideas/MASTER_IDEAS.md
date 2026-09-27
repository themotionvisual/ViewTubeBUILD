# ViewTube Master Ideas

**Production Date:** 2026-09-27  
**Last Edited:** 2026-09-27  
**Role:** consolidated unique idea projection generated from `ideas/registry.json`.

The Master Ideas document groups unique ideas by category/subcategory and target. Source lists remain preserved under `ideas/lists/`.

## Agent Context & Workflows

### Context

- **Agent Context Builder** — Assemble the smallest correct task context package on demand.  
  `IDEA-GOV-044` · target `WORKFLOW:AGENT-CONTEXT` · status `UNREVIEWED` · capabilities `CAP-DOCUMENT-GOVERNANCE`

### Context Retrieval

- **Just-in-Time Documentation Retrieval** — Retrieve only relevant authority sections and references for the task.  
  `IDEA-GOV-045` · target `WORKFLOW:AGENT-CONTEXT` · status `UNREVIEWED` · capabilities `CAP-DOCUMENT-GOVERNANCE`

### Skill Routing

- **Skill-to-Workflow Mapping** — Map workflows to the skills used at each stage.  
  `IDEA-GOV-047` · target `GOVERNANCE:WORKFLOWS` · status `IMPLEMENTATION_WAVE` · capabilities `CAP-DOCUMENT-GOVERNANCE`

### Workflows

- **Reusable Workflow Registry** — Make repeatable development workflows first-class governed objects.  
  `IDEA-GOV-046` · target `GOVERNANCE:WORKFLOWS` · status `IMPLEMENTATION_WAVE` · capabilities `CAP-DOCUMENT-GOVERNANCE`

## Capability & Plan Convergence

### Build Gate

- **Unified Before Building Gate** — Before implementation begins, resolve capability owner, prior art, current code, existing tasks, active PRs and related prototypes.  
  `IDEA-GOV-013` · target `WORKFLOW:BEFORE-BUILD` · status `UNREVIEWED` · capabilities `CAP-DOCUMENT-GOVERNANCE`

### Capability Routing

- **Capability Home Pages** — Give every major capability one permanent routing home across tools/pages.  
  `IDEA-GOV-001` · target `CAPABILITY:CAP-DOCUMENT-GOVERNANCE` · status `IMPLEMENTATION_WAVE` · capabilities `CAP-DOCUMENT-GOVERNANCE`

### Code / Document Links

- **Bidirectional Code ↔ Document Links** — Documents point to code owners, and important code modules link back to their governing capability/specification.  
  `IDEA-GOV-011` · target `GOVERNANCE:CODE-DOC-LINKS` · status `UNREVIEWED` · capabilities `CAP-DOCUMENT-GOVERNANCE`

### Code Ownership

- **Code Ownership Map** — Map capabilities to source paths, tests, routes/services and confidence.  
  `IDEA-GOV-010` · target `GOVERNANCE:CODE-OWNERSHIP` · status `IMPLEMENTATION_WAVE` · capabilities `CAP-DOCUMENT-GOVERNANCE`

### Ideas

- **Feature Idea Registry** — Keep ideas separate from committed tasks while preserving provenance.  
  `IDEA-GOV-008` · target `GOVERNANCE:IDEAS` · status `IMPLEMENTATION_WAVE` · capabilities `CAP-DOCUMENT-GOVERNANCE`
- **Idea-to-Capability Routing** — Route each idea to an existing capability before considering a new one.  
  `IDEA-GOV-009` · target `GOVERNANCE:IDEAS` · status `IMPLEMENTATION_WAVE` · capabilities `CAP-DOCUMENT-GOVERNANCE`

### Identifiers

- **Capability IDs Everywhere** — Attach durable work records to CAP IDs for automatic clustering.  
  `IDEA-GOV-006` · target `GOVERNANCE:CAPABILITY-ROUTING` · status `IMPLEMENTATION_WAVE` · capabilities `CAP-DOCUMENT-GOVERNANCE`

### Impact Analysis

- **Change Impact Graph** — Given a changed file, identify affected capabilities, plans, tasks, docs, tests, UI surfaces and integrations.  
  `IDEA-GOV-012` · target `GOVERNANCE:CHANGE-IMPACT` · status `UNREVIEWED` · capabilities `CAP-DOCUMENT-GOVERNANCE`

### Plan Families

- **Plan Families** — Group related plans under stable family IDs with one survivor.  
  `IDEA-GOV-002` · target `GOVERNANCE:CONVERGENCE` · status `IMPLEMENTATION_WAVE` · capabilities `CAP-DOCUMENT-GOVERNANCE`

### Plan Merges

- **Plan Merge Records** — Record source plans, survivor and harvested material for every merge.  
  `IDEA-GOV-007` · target `GOVERNANCE:PLAN-MERGES` · status `IMPLEMENTATION_WAVE` · capabilities `CAP-DOCUMENT-GOVERNANCE`

### Prior Art

- **Mandatory Existing Work Checked Section** — Require prior-art search before new plans/systems are created.  
  `IDEA-GOV-004` · target `GOVERNANCE:CONVERGENCE` · status `IMPLEMENTATION_WAVE` · capabilities `CAP-DOCUMENT-GOVERNANCE`

### Similarity Detection

- **Automatic Similar-Plan Detection** — Detect likely overlapping plans before creating another one.  
  `IDEA-GOV-003` · target `GOVERNANCE:CONVERGENCE` · status `IMPLEMENTATION_WAVE` · capabilities `CAP-DOCUMENT-GOVERNANCE`

### Work Handoffs

- **Universal Work Packet** — Standardize agent/conversation/plan-to-code handoff payloads.  
  `IDEA-GOV-005` · target `WORKFLOW:VT-WORK-PACKET` · status `IMPLEMENTATION_WAVE` · capabilities `CAP-DOCUMENT-GOVERNANCE`

## Continuous Improvement

### Control Room

- **Unified Development Control Room** — Generate one projection of capabilities/plans/tasks/missions/risks/evidence/ideas/questions/verification debt.  
  `IDEA-GOV-049` · target `GOVERNANCE:CONTROL-ROOM` · status `IMPLEMENTATION_WAVE` · capabilities `CAP-DOCUMENT-GOVERNANCE`

### Convergence Rule

- **Convergence-First Governance Rule** — Require reuse/merge/generalize/adapt attempts before new parallel systems.  
  `IDEA-GOV-050` · target `GOVERNANCE:CONVERGENCE` · status `IMPLEMENTATION_WAVE` · capabilities `CAP-DOCUMENT-GOVERNANCE`

### Recommendations

- **Improvement Recommendation Log** — Persist deduped architecture/performance/UX/AI/tooling recommendations before task promotion.  
  `IDEA-GOV-048` · target `GOVERNANCE:IMPROVEMENTS` · status `IMPLEMENTATION_WAVE` · capabilities `CAP-DOCUMENT-GOVERNANCE`

## Conversation & Intake

### Backlinks

- **Task-to-Plan Backlinks** — Every task should know which plan/program/specification created or justifies it.  
  `IDEA-GOV-018` · target `GOVERNANCE:TASK-AUTHORITY` · status `UNREVIEWED` · capabilities `CAP-DOCUMENT-GOVERNANCE`

### Conversation Harvest

- **Conversation Work Harvester** — At the end of substantial conversations, extract completed work, incomplete work, decisions, bugs, opportunities, rejected directions and ideas into governed intake.  
  `IDEA-GOV-015` · target `WORKFLOW:CONVERSATION-INTAKE` · status `UNREVIEWED` · capabilities `CAP-DOCUMENT-GOVERNANCE`

### Intake

- **Convergence Inbox** — Route new ideas from conversations, audits, research, bugs, prototypes and agents into one review queue instead of immediately creating documents/tasks.  
  `IDEA-GOV-014` · target `GOVERNANCE:CONVERGENCE-INBOX` · status `UNREVIEWED` · capabilities `CAP-DOCUMENT-GOVERNANCE`

### Similarity

- **Cross-Conversation Similarity Review** — Compare new conversation work against prior conversation-intake packages to detect duplicate plans/tasks.  
  `IDEA-GOV-016` · target `GOVERNANCE:CONVERGENCE` · status `UNREVIEWED` · capabilities `CAP-DOCUMENT-GOVERNANCE`

### Task Promotion

- **Plan-to-Task Compiler** — Convert accepted plan sections into Task Authority mutation proposals while preserving plan/capability/acceptance/dependency links.  
  `IDEA-GOV-017` · target `WORKFLOW:TASK-AUTHORITY` · status `UNREVIEWED` · capabilities `CAP-DOCUMENT-GOVERNANCE`

## Debugging & Simplification

### Debug Families

- **Debugging Family Records** — Group related bugs under stable debug/root-cause families.  
  `IDEA-GOV-022` · target `GOVERNANCE:DEBUG-FAMILIES` · status `UNREVIEWED` · capabilities `CAP-DOCUMENT-GOVERNANCE`

### Duplicate Code

- **Duplicate-Code Detection Reports** — Find repeated stores/services/hooks/schemas/CSS/provider clients.  
  `IDEA-GOV-025` · target `GOVERNANCE:CODE-OWNERSHIP` · status `UNREVIEWED` · capabilities `CAP-DOCUMENT-GOVERNANCE`

### Implementation Families

- **Implementation Family Graphs** — Classify parallel implementations as canonical/adapter/compatibility/migration/donor/remove.  
  `IDEA-GOV-029` · target `GOVERNANCE:CODE-OWNERSHIP` · status `UNREVIEWED` · capabilities `CAP-DOCUMENT-GOVERNANCE`

### Quarantine

- **Quarantine Registry** — Track uncertain legacy code/docs/prototypes with removal gates.  
  `IDEA-GOV-028` · target `GOVERNANCE:DOCUMENTATION` · status `UNREVIEWED` · capabilities `CAP-DOCUMENT-GOVERNANCE`

### Removal

- **Removal Governance** — Require reachability/replacement/donor/rollback evidence before deletion.  
  `IDEA-GOV-027` · target `GOVERNANCE:DOCUMENTATION` · status `UNREVIEWED` · capabilities `CAP-DOCUMENT-GOVERNANCE`

### Root Cause

- **Root-Cause Promotion** — Promote shared root causes above repeated symptom fixes.  
  `IDEA-GOV-023` · target `GOVERNANCE:DEBUG-FAMILIES` · status `UNREVIEWED` · capabilities `CAP-DOCUMENT-GOVERNANCE`

### Shared Fixes

- **Fix Once / Prevent Everywhere Rule** — Prefer shared primitive/service/schema fixes over repeated local patches.  
  `IDEA-GOV-024` · target `GOVERNANCE:CONVERGENCE` · status `UNREVIEWED` · capabilities `CAP-DOCUMENT-GOVERNANCE`

### Simplification

- **Simplification Proposals** — Use a formal simplification work type for collapsing overlapping implementations.  
  `IDEA-GOV-026` · target `GOVERNANCE:CONVERGENCE` · status `UNREVIEWED` · capabilities `CAP-DOCUMENT-GOVERNANCE`

### Simplification Metrics

- **Architecture Simplification Scoreboard** — Track reductions in duplicate stores/routes/schemas/state owners/bridges.  
  `IDEA-GOV-030` · target `GOVERNANCE:CONTROL-ROOM` · status `UNREVIEWED` · capabilities `CAP-DOCUMENT-GOVERNANCE`

## Integration & Decisions

### Assumptions

- **Assumption Registry** — Track unverified assumptions separately from facts/decisions.  
  `IDEA-GOV-036` · target `GOVERNANCE:ASSUMPTIONS` · status `UNREVIEWED` · capabilities `CAP-DOCUMENT-GOVERNANCE`

### Decision Conflicts

- **Decision Conflict Detection** — Flag new plans that contradict existing decisions/authorities.  
  `IDEA-GOV-035` · target `GOVERNANCE:CONVERGENCE` · status `UNREVIEWED` · capabilities `CAP-DOCUMENT-GOVERNANCE`

### Decisions

- **Shared Decision Registry** — Assign stable IDs to durable product/architecture decisions.  
  `IDEA-GOV-034` · target `GOVERNANCE:DECISIONS` · status `UNREVIEWED` · capabilities `CAP-DOCUMENT-GOVERNANCE`

### Handoff Contracts

- **Handoff Contract Library** — Define reusable Project/Asset/Evidence/Generation/Publishing/Outcome handoffs.  
  `IDEA-GOV-032` · target `WORKFLOW:HANDOFF-CONTRACTS` · status `UNREVIEWED` · capabilities `CAP-DOCUMENT-GOVERNANCE`

### Integration Seams

- **Integration Seam Registry** — Record important system-to-system contracts and failure states.  
  `IDEA-GOV-031` · target `GOVERNANCE:INTEGRATION-SEAMS` · status `UNREVIEWED` · capabilities `CAP-DOCUMENT-GOVERNANCE`

### Open Questions

- **Open Questions Queue** — Track unresolved research/creator/architecture questions separately from tasks.  
  `IDEA-GOV-037` · target `GOVERNANCE:OPEN-QUESTIONS` · status `IMPLEMENTATION_WAVE` · capabilities `CAP-DOCUMENT-GOVERNANCE`

### Provenance

- **Universal Provenance Envelope** — Use shared provenance fields for AI/assets/actions/renders/publish/outcomes.  
  `IDEA-GOV-033` · target `GOVERNANCE:PROVENANCE` · status `UNREVIEWED` · capabilities `CAP-DOCUMENT-GOVERNANCE`

## Task & Plan State

### Maturity

- **Plan Maturity Model** — Track Architecture, Backend, Frontend, Integration, Tests, Runtime, Responsive, Documentation and Release maturity instead of vague almost-finished states.  
  `IDEA-GOV-020` · target `GOVERNANCE:PLAN-MATURITY` · status `UNREVIEWED` · capabilities `CAP-DOCUMENT-GOVERNANCE`

### Plan Consolidation

- **Feature Cluster Documents** — For systems with many related improvements, maintain one compact living feature-cluster document instead of many micro-plans.  
  `IDEA-GOV-021` · target `GOVERNANCE:PLAN-FAMILIES` · status `UNREVIEWED` · capabilities `CAP-DOCUMENT-GOVERNANCE`

### Progress Projection

- **Task Completion Feedback Into Plans** — When tasks become verified DONE, update owning plan maturity/progress projections instead of copying status prose.  
  `IDEA-GOV-019` · target `GOVERNANCE:TASK-AUTHORITY` · status `UNREVIEWED` · capabilities `CAP-DOCUMENT-GOVERNANCE`

## Verification & Health

### Capability Coverage

- **Capability Coverage Audit** — Show authority/code/tasks/tests/UI/Guide/verification coverage per capability.  
  `IDEA-GOV-043` · target `GOVERNANCE:CAPABILITY-COVERAGE` · status `IMPLEMENTATION_WAVE` · capabilities `CAP-DOCUMENT-GOVERNANCE`, `CAP-VERIFICATION`

### Document Health

- **Document Health Audit** — Detect stale SHA metadata, duplicate authorities, broken supersession and orphan docs.  
  `IDEA-GOV-041` · target `CAPABILITY:CAP-DOCUMENT-GOVERNANCE` · status `UNREVIEWED` · capabilities `CAP-DOCUMENT-GOVERNANCE`, `CAP-VERIFICATION`

### Evidence

- **Evidence Bundles** — Collect tests/screenshots/logs/runtime/PR/deployment evidence under receipt IDs.  
  `IDEA-GOV-039` · target `CAPABILITY:CAP-VERIFICATION` · status `UNREVIEWED` · capabilities `CAP-DOCUMENT-GOVERNANCE`, `CAP-VERIFICATION`

### Plan Health

- **Plan Health Audit** — Flag plans with no active tasks, no owner, no acceptance criteria, no code links, staleness or substantial overlap with another plan.  
  `IDEA-GOV-042` · target `GOVERNANCE:PLAN-FAMILIES` · status `UNREVIEWED` · capabilities `CAP-DOCUMENT-GOVERNANCE`, `CAP-VERIFICATION`

### Verification Debt

- **Verification Debt Registry** — Track implementation that lacks required runtime/visual/auth/deploy verification.  
  `IDEA-GOV-038` · target `CAPABILITY:CAP-VERIFICATION` · status `UNREVIEWED` · capabilities `CAP-DOCUMENT-GOVERNANCE`, `CAP-VERIFICATION`

### Visual Certification

- **Screenshot Certification Records** — Standardize desktop/mobile/orientation screenshot evidence records.  
  `IDEA-GOV-040` · target `CAPABILITY:CAP-VERIFICATION` · status `UNREVIEWED` · capabilities `CAP-DOCUMENT-GOVERNANCE`, `CAP-VERIFICATION`

