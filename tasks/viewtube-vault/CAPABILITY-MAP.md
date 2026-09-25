# Capability Map — ViewTube Creator Vault Program

**Status:** implementation-ready planning authority  
**Date:** 2026-09-24  
**Base:** main @ 9f9361272ccc670eeaf975225929076405a4ba8a  
**Donor:** themotionvisual/Vault-Tool (reference/inspiration only; no wholesale code transplant)

## Canonical boundaries

- Vault owns durable creator-artifact identity, metadata, storage references, lifecycle, collections and provenance presentation.
- Asset Engine owns creator-work meaning, ContentBuild asset relations, versions/variants/selections/finalization and handoff orchestration.
- Projects / ContentBuild own project/work identity and lifecycle.
- Generation Store owns generation-run/candidate provenance.
- BrainRuntime owns reasoning/retrieval/orchestration, not asset storage.
- ActionPacket/Handoff owns cross-tool transport.
- Editor, Studio, Publisher and specialist tools consume canonical Vault/ContentBuild identities.

## Modules

| Module ID | Responsibility | Depends on |
|---|---|---|
| vault-core | Versioned Vault asset contract, compatibility/migration, lifecycle and persistence facade | existing Vault + Asset Engine |
| vault-library | Asset Matrix, grid/list/masonry/filmstrip views, selection, sorting | vault-core |
| vault-search | Unified text, metadata, Spectrum Tag, project, lifecycle and smart-filter query model | vault-core |
| vault-import-station | Batch upload/intake staging, metadata extraction, tag assignment, duplicate detection, progress and accept/reject | vault-core, vault-search |
| vault-inspector | Details, metadata, tags, notes, project refs, rights and usage | vault-core |
| vault-collections | Manual collections, Smart Collections, Favorites, Inbox, Archive and Trash | vault-search |
| vault-batch | Multi-select batch rename/tag/project/collection/lifecycle/export/send-to workflows | vault-library, vault-search |
| vault-doc-tools | Canonical document/text asset editor and text-specific mini-tools | vault-core, vault-inspector |
| vault-media-tools | Quick Look, compare, frame extract, crop/derivative and media handoffs | vault-core, vault-inspector |
| vault-lineage | Versions, derivatives, parents, generation refs, usage and relationship graph | vault-core, Asset Engine |
| vault-handoffs | Send To Projects/Editor/Studio/Brain/Publisher using ActionPacket refs | vault-core, Asset Engine |
| vault-memory-index | Recent actions, saved searches, user organization preferences and retrieval projection; never a second Brain memory store | vault-search |
| projects-donor-upgrades | Merge donor planning/Kanban improvements into canonical Project Builder/Board | Projects/ContentBuild |
| vault-responsive-ui | Toolbox/SubToolbox implementation, portrait/landscape/desktop geometry and accessibility | all user-facing modules |
| vault-storage-evolution | Durable server/blob/Drive provider layer behind Vault facade | vault-core |

## Build order

vault-core
→ vault-library + vault-search
→ vault-import-station + vault-inspector
→ vault-collections + vault-batch
→ vault-lineage + vault-handoffs
→ vault-doc-tools + vault-media-tools
→ projects-donor-upgrades
→ vault-memory-index
→ vault-storage-evolution
→ certification

## Cross-domain rule

Project/Kanban donor features are implemented in Project Builder / Project Board and consume Vault asset references. They are not duplicated as a Vault-owned project-management state machine.
