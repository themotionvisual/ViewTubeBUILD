# ViewTube Creator Vault — Implementation Plan

## Planning state

Requirements are frozen enough to begin implementation after this planning branch is reviewed/merged.

This plan intentionally uses a dedicated task workspace because root tasks/plan.md and tasks/todo.md are occupied by the active Settings redesign.

## Architectural decisions

1. Vault-Tool is a reference donor, not a source-code transplant.
2. Vault is the user-facing durable asset workspace; Asset Engine remains the production-semantics layer.
3. All new Vault UI uses current Toolbox/SubToolbox primitives and CSS.
4. Spectrum Tags use the current ViewTube tag system, not donor-private color utilities.
5. Project/Kanban donor features land in current Project Builder/Board.
6. Import Station is a staged ingestion workflow, not a direct blind upload.
7. Batch Processor mutates metadata/organization locally and hands specialist processing to owning tools.
8. Vault memory is workspace continuity and retrieval state, not a competing Brain memory system.
9. Version, derivative and duplicate are distinct relationships.
10. Physical storage provider is separated from logical Vault organization.

## Vertical slices

### Wave 0 — Contract reconciliation
- audit VaultAsset, Asset Engine contracts, ContentBuild relations, Generation Store, video package and current Project models
- write compatibility/migration shape
- define stable UI view models
- register donor reference

Checkpoint: no duplicate ownership introduced.

### Wave 1 — Production route + Library shell
- mount real /vault page
- Toolbox page shell
- Asset Matrix
- grid/list views
- Inspector shell
- existing record compatibility

Checkpoint: creator can open Vault and browse real current assets.

### Wave 2 — Search, Spectrum Tags, smart filters
- canonical query model
- name/tag/project/type/metadata filters
- Spectrum Tag controls
- saved filters
- Smart Collections groundwork

Checkpoint: creator can find/filter assets without folder dependence.

### Wave 3 — Import Station
- batch file intake
- pending queue
- per-item metadata/tag/project destination
- duplicate/hash preflight
- metadata extraction
- processing progress contract
- accept/reject / ingest all

Checkpoint: batch import creates canonical Vault identities and preserves failures/retries.

### Wave 4 — Organization + memory
- Collections
- Smart Collections
- Inbox
- Favorites
- Archive
- Trash/recovery
- recent assets/searches/view preferences
- custom metadata fields

Checkpoint: reopening Vault restores useful workspace context without creating Brain memory.

### Wave 5 — Selection + Batch Processor
- shift/cmd multi-select
- selection Action Rail
- batch tags/rename/project/collection/lifecycle
- export metadata
- ZIP bundle
- Send To
- background job/progress surface

Checkpoint: large asset sets can be organized efficiently.

### Wave 6 — Inspector, versions, lineage, usage
- details/rights/notes
- versions
- derivatives
- duplicate relation
- lineage graph
- usage references
- protected/golden assets

Checkpoint: creator can trace where an asset came from and where it is used.

### Wave 7 — Text/doc workbench + Quick Look
- document editor
- version-safe save
- BrainRuntime refine handoff
- templates/snippets where appropriate
- image/video/audio/document Quick Look
- compare/before-after

Checkpoint: lightweight asset work no longer requires leaving Vault unnecessarily.

### Wave 8 — Media mini-tools/handoffs
- frame extractor
- smart crop/aspect derivative
- OCR
- auto-tag suggestions
- metadata inspector
- palette extraction
- similar asset search
- specialist tool handoffs

Checkpoint: every processing action either safely creates a derivative or routes to canonical owner.

### Wave 9 — Project Builder / Board donor upgrades
- reconcile current board lanes with donor stage model
- add missing priority/date/progress/card metadata
- detail tabs
- script/notes/storyboard/title drafts/checklists
- linked Vault assets
- post-publish metrics projection
- ensure all movement writes canonical Project/ContentBuild state

Checkpoint: no embedded donor Kanban state remains in Vault.

### Wave 10 — durable storage evolution
- server metadata persistence
- storage provider abstraction
- Drive integration via current auth
- blobs/proxies/thumbnails
- migration from browser-only metadata where appropriate

Checkpoint: multi-device persistence without invalidating existing identities.

### Wave 11 — certification
- typecheck
- targeted tests
- route/governance tests
- build
- desktop
- narrow desktop
- mobile portrait
- mobile landscape
- keyboard/touch
- accessibility
- performance with large libraries

## Risks and mitigations

### Risk: duplicating Asset Engine/ContentBuild fields
Mitigation: every proposed Vault field is checked against canonical owners before schema changes.

### Risk: Vault becomes an editor clone
Mitigation: metadata/lightweight derivative tools live in Vault; specialist processing remains in Editor/Studio services.

### Risk: huge page/component
Mitigation: modular feature folders and one canonical asset-query/view-model layer.

### Risk: browser localStorage ceiling
Mitigation: compatibility adapter first, durable repository/provider evolution later.

### Risk: large-library rendering
Mitigation: virtualization, lazy preview loading, stable selectors, bounded Inspector state.

### Risk: donor UI conflicts with current ViewTube
Mitigation: donor layout is prior art only; rebuild with current Toolbox/SubToolbox authority.

## Parallelizable work

After Wave 0:
- Library UI and query model can proceed in parallel.
- Import Station UI can proceed against frozen ingest contract.
- Project donor audit can proceed independently but merges only after canonical mapping.
- Lineage UI can be developed against Asset Engine relation selectors.

## Definition of done

Vault is a production route, not a redirect; its storage/metadata operations preserve canonical identity; Import Station and Batch Processor work; smart search/Spectrum Tags/collections are usable; document tools and previews exist; versions/lineage/usage are visible; cross-tool handoffs preserve IDs; donor planning improvements exist in Projects; and desktop/mobile certifications pass.
