---
name: viewtube-one-goal-completion
description: Canonical workflow for all AI agents completing ViewTube. Use before auditing, planning, implementing, reviewing, merging, or documenting ViewTube completion work. Forces current-main evidence, canonical ownership, bounded tasks, TDD, production reachability, status receipts, and one shared completion goal.
---

# ViewTube One-Goal Completion Skill

## Mission

Finish ViewTube as one coherent production creator system. Optimize and connect existing stable systems before inventing anything new.

## Mandatory first reads

1. `CLAUDE.md`
2. `docs/architecture/VIEWTUBE_ONE_GOAL_COMPLETION_OPERATING_SYSTEM.md`
3. `tasks/viewtube-one-goal-status.md`
4. the owning domain master named by the One-Goal artifact
5. current source + tests for the exact task

## Evidence order

Use the cheapest authoritative evidence first:
1. current task row/receipt;
2. exact current-main source/tests;
3. owning canonical domain document;
4. recent merged PR/commit for that path;
5. targeted branch/donor comparison;
6. historical docs/conversations only for unique intent/provenance.

Never declare a task unfinished solely because an old plan says so.

## Canonical-owner rule

Do not create a new store/runtime/provider/state owner when a canonical owner already exists. Add the smallest adapter, caller, projection, event or policy required.

If ownership is unclear, mark the task BLOCKED and resolve architecture before implementation.

## Implementation loop

For each task:
1. select one READY task (S/M scope);
2. re-audit current main;
3. state the behavior contract;
4. write/adjust a failing behavior test when logic changes;
5. implement the smallest vertical slice;
6. run focused tests;
7. run build/type/relevant architecture guards;
8. runtime-certify user-facing behavior;
9. review correctness/readability/architecture/security/performance;
10. inspect dead/unreachable code but do not delete uncertain unique behavior silently;
11. update task status/evidence;
12. leave Herald/Create State handoff.

## Completion tests

A feature is not DONE unless:
- a production caller exists;
- canonical identity/provenance is preserved;
- permissions/creator controls are respected;
- retry/idempotency is handled when relevant;
- errors are visible/recoverable;
- tests prove behavior;
- runtime verification exists for UI/external integrations;
- living status is updated.

## AI-specific gates

- BrainRuntime owns creator reasoning.
- BrainModelGateway owns creator text/reasoning model access.
- evidence confidence comes from evidence quality, not model confidence.
- missing evidence is explicit.
- durable learning requires governed promotion.
- prompt/model/intelligence changes require regression evaluation.

## Analytics-specific gates

- analytics-canon is consumer boundary.
- compare metrics only through canonical comparability policy once available.
- expose freshness/missingness/coverage honestly.
- never make fallback data look exact.

## Project/Asset/Publisher gates

- preserve Project/ContentBuild identity.
- generated/rendered/published assets keep exact version IDs.
- external publish requires immutable approved intent once snapshot contract lands.
- retries must be replay-safe.

## UI gates

Certify changed surfaces in:
- desktop;
- narrow desktop;
- mobile portrait;
- mobile landscape;
- loading;
- empty;
- error;
- disconnected/permission;
- keyboard/touch where relevant.

Fix canonical primitives before local overrides.

## PR discipline

- short-lived branch from current main;
- target ~100–300 changed lines per logical change when practical;
- separate refactor from behavior changes;
- preview before production merge for UI/runtime changes;
- no direct main commits;
- no giant integration branch.

## Required receipt

Every completed or paused task records:
`task_id, status, main_sha_checked, branch, PR, canonical_owner, files_changed, tests, runtime_verification, evidence_refs, decisions, blockers, remaining, next_action, updated_at`.

## Stop conditions

Stop and surface rather than guess when:
- canonical owners conflict;
- a migration would destroy unique behavior;
- current-main behavior contradicts the task;
- tests reveal a wider contract change;
- external side effects cannot be made idempotent;
- a task grows beyond M scope.

## One goal

Every change should reduce the distance to:

`YouTube → Analytics → Intelligence → Project → Assets → Package → Editor → Approved Publish → Audience → Outcome → Evaluation → Governed Learning`.
