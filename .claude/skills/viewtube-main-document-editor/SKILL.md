---
name: viewtube-main-document-editor
description: Safely edit ViewTube's Product Completion Constitution, Product Architecture, Integrated Application Program, Documentation/Verification governance, capability registry, and bounded Domain Authorities without duplicating authority or task state.
---

# ViewTube Main Document Editor

Parent skill: .claude/skills/viewtube-document-system/SKILL.md

## Use when
A feature, system, integration, design, architectural decision, product boundary, completion rule, or cross-system workstream requires a durable update to a main ViewTube document.

## Mandatory reads
- docs/governance/DOCUMENTATION.md
- docs/registry.json
- docs/architecture/PRODUCT_COMPLETION_CONSTITUTION.md
- docs/architecture/PRODUCT_ARCHITECTURE.md
- docs/programs/INTEGRATED_APPLICATION.md
- owning Domain Authority / Specification
- docs/governance/VERIFICATION.md

## Procedure
1. RECONCILE the proposed change against existing capabilities, authorities, tasks, missions and current main.
2. CLASSIFY the change:
   - global completion invariant → Product Completion Constitution;
   - accepted product capability/owner/tool topology → Product Architecture + capabilities.json;
   - cross-system seam/dependency/migration → Integrated Application Program;
   - bounded behavior → Domain Authority;
   - detailed contract/design/schema → Specification;
   - durable tradeoff → Decision;
   - exact work → Task Index candidate/update.
3. EDIT the smallest owning artifact. Do not mirror the same rule into multiple authorities.
4. UPDATE Production Date only for a new document; update Last Edited for substantive edits; update Last Audited Main SHA only after an actual audit.
5. LINK registry, capability and related-authority metadata.
6. VERIFY current-main claims and document consistency.
7. RECORD a receipt and any remaining migration/task work.

## Adding new features/systems/integrations/designs
Never equate a new surface with a new capability. First ask whether an existing capability can serve it. New accepted capabilities require one canonical owner and a CAP record. New systems require an explicit ownership gap that cannot be solved by extension, projection, adapter, or consolidation.

## Stop conditions
Escalate when two authorities claim the same concern, an existing capability owner would be replaced, a proposed change is irreversible/consequential, or source evidence conflicts materially.
