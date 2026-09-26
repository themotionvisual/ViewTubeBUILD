# ViewTube Document System Workflow

**Production Date:** 2026-09-26  
**Last Edited:** 2026-09-26  
**Class:** SPECIFICATION  
**Status:** ACTIVE  
**Concern:** cross-agent document-system operating workflow  
**Owner:** Documentation Governance  
**Registry ID:** DOC-GOV-DOCUMENT-WORKFLOW  
**Last Audited Main SHA:** ee02fdbd1af2be30e81de7955dad188999a03ac4

## Purpose

This workflow is the cross-agent operating contract for creating, editing, consolidating, extending, auditing and retiring ViewTube documentation, plans, reports, standalone HTML artifacts, skills and workflow resources.

## Mandatory loop

ORIENT → RECONCILE → CLASSIFY → DESIGN → AUTHOR → LINK → VERIFY → RECORD

### ORIENT
Read:
1. docs/governance/DOCUMENTATION.md
2. docs/registry.json
3. docs/architecture/PRODUCT_COMPLETION_CONSTITUTION.md
4. docs/architecture/PRODUCT_ARCHITECTURE.md
5. docs/programs/INTEGRATED_APPLICATION.md when cross-system work is involved
6. the owning Domain Authority / Specification
7. relevant Task Index / Mission / Receipt context.

### RECONCILE
Before creating anything, search for:
- current authority;
- same concern under another name;
- older plans/audits/reports;
- existing skill/workflow;
- standalone HTML/prototype families;
- open task/mission/PR;
- current implementation and tests when code claims are involved.

Classify the request as UPDATE, EXTEND, CONSOLIDATE, CREATE, ARCHIVE, or NO-CHANGE.

### CLASSIFY
Choose a document class from Documentation Governance. Never create a new "master" merely because the work is important.

### DESIGN
Define:
- exact concern and non-overlap;
- target document(s);
- structured registries affected;
- capability/task/domain relationships;
- source family and lineage;
- acceptance and verification requirements;
- whether a sub-skill or workflow is justified.

### AUTHOR
Use brief descriptive filenames without dates for living documents. Preserve Production Date and Last Edited metadata. Do not copy task status into architecture when a generated/task reference is sufficient.

### LINK
Update registry entries and relationship references in the same change. New capabilities update capabilities.json. New sub-skills declare the authority they implement and must not redefine it.

### VERIFY
Validate metadata/schema, links, supersession, no competing concern authority, no-loss consolidation manifests, current-main claims, and any rendered/code behavior governed by docs/governance/VERIFICATION.md.

### RECORD
Leave a compact receipt containing changed documents, registry/capability changes, source families, verification performed, unresolved conflicts, archive actions, and next action.

## Creation advisor

During any substantial ViewTube conversation, the agent should consider whether the work warrants:
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

Recommend creation only after prior-art reconciliation.

## Sub-skill rule

Sub-skills are procedural specializations, not new authorities. They must cite the governing ViewTube authority, define a narrow trigger and scope, reuse shared references/templates, and remain replaceable without changing canonical product truth.
