# ViewTube Work Objects

**Production Date:** 2026-09-26  
**Last Edited:** 2026-09-26  
**Class:** SPECIFICATION  
**Status:** ACTIVE  
**Concern:** relationships between durable product, work, coordination, evidence, and conversation objects  
**Owner:** Documentation Governance + Task Authority  
**Registry ID:** DOC-GOV-WORK-OBJECTS  
**Last Audited Main SHA:** ee02fdbd1af2be30e81de7955dad188999a03ac4  
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

## Relationship rules

Capability != Task. Task changes or verifies a capability.
Task != Mission. A mission may involve many tasks; a task may span missions.
Mission != PR. A mission may use multiple branches/PRs; a PR may satisfy only part of a mission.
Conversation != authority. Conversations emit candidates, decisions, opportunities, risks, receipts, and work orders into governed stores.
Artifact != production. A prototype/reference becomes production only through implementation and verification.
Receipt != DONE. Task Authority evaluates receipts against acceptance and verification gates.

## Anti-duplication rule

Agents must reconcile new requests against systems, capabilities, tasks, active missions, current main, domain authorities, and donor artifacts before allocating a new canonical object.
