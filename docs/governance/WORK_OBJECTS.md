# ViewTube Work Objects

**Production Date:** 2026-09-26  
**Last Edited:** 2026-09-27  
**Class:** SPECIFICATION  
**Status:** ACTIVE  
**Concern:** relationships between durable product, work, coordination, evidence, and conversation objects  
**Owner:** Documentation Governance + Task Authority  
**Registry ID:** DOC-GOV-WORK-OBJECTS  
**Last Audited Main SHA:** faa07ed085173f5764db72054f17583ce9a3cb38  
**Supersedes:** none  
**Related Authorities:** docs/governance/DOCUMENTATION.md; docs/architecture/PRODUCT_ARCHITECTURE.md

## Canonical object vocabulary

- SYSTEM — bounded canonical owner/runtime area.
- CAPABILITY — durable ability ViewTube possesses or intentionally supports.
- MASTER_TOOL — creator-facing product grouping of capabilities.
- DOMAIN — bounded documentation/ownership concern.
- TASK — exact governed unit of work with permanent VT identity.
- MISSION — Crown coordination envelope for substantial work.
- WORK_ORDER — executable plan for a mission.
- DECISION — durable resolved choice and rationale.
- ARTIFACT — produced file/prototype/output with provenance.
- RECEIPT — compact evidence of work performed and observed.
- CONVERSATION — interaction context that may propose work/decisions/evidence but owns no canonical truth.
- REFERENCE — supporting source/resource.
- OPPORTUNITY — noncommittal improvement candidate with evidence/confidence/impact.
- RISK — evidence-backed concern that may need mitigation but is not automatically a task.
- TASK_MUTATION_PROPOSAL — requested canonical task change submitted to Task Authority.
- CONVERSATION_HANDOFF — resumability/provenance package for transferring a long conversation without replaying the whole transcript.
- CONVERSATION_WORK_ITEM — conversation-local record of planned/completed/partial/blocked/discovered work pending reconciliation; not a canonical Task.
- RECONCILIATION_REVIEW — audit mapping conversation work items to their canonical destinations, merges, rejections or archive dispositions.

## Relationship rules

Capability != Task. Task changes or verifies a capability.
Task != Mission. A mission may involve many tasks; a task may span missions.
Mission != PR. A mission may use multiple branches/PRs; a PR may satisfy only part of a mission.
Conversation != authority. Conversations emit candidates, decisions, opportunities, risks, receipts, and work orders into governed stores.
Artifact != production. A prototype/reference becomes production only through implementation and verification.
Receipt != DONE. Task Authority evaluates receipts against acceptance and verification gates.

## Anti-duplication rule

Agents must reconcile new requests against systems, capabilities, tasks, active missions, current main, domain authorities, and donor artifacts before allocating a new canonical object.


## Improvement-object rules

Opportunity != Task. Risk != Task. They become committed work only after Task Authority reconciliation and acceptance.

Task Mutation Proposal != canonical mutation. It is an input to Task Authority.

Conversation Envelope != ledger. It points to governed objects for resumability.


## Conversation handoff rules

Conversation Handoff != authority. It packages context for continuation.

Conversation Work Item != Task. It may become a Task Candidate only after prior-art/current-main reconciliation.

Reconciliation Review != work ledger. It documents how intake material was valued, deduplicated, merged and routed.

A completed conversation work item may become evidence/receipt or prove an existing task needs verification; it does not automatically become Task Index DONE.
