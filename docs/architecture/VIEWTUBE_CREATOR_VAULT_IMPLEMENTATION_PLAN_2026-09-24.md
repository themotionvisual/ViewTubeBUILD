# ViewTube Creator Vault — Product & Implementation Plan

**Status:** active-plan  
**Date:** 2026-09-24  
**Base main:** 9f9361272ccc670eeaf975225929076405a4ba8a  
**Canonical dependencies:** VIEWTUBE_ASSET_ENGINE_MASTER_RESOURCE.md; VIEWTUBE_PROJECTS_CONTENTBUILD_WORKFLOW_MASTER_RESOURCE.md; VIEWTUBE_TOOLBOX_UI_MASTER_RESOURCE.md  
**Donor reference:** themotionvisual/Vault-Tool

## Product statement

ViewTube Vault is the first-class creator asset workspace for durable artifacts. It combines professional asset-library organization with ViewTube-native project identity, provenance, versions, batch workflows, search, Spectrum Tags, lightweight editing and cross-tool handoffs.

The donor Vault-Tool app is prior art and inspiration. Its code, state stores and CSS are not production authority.

## Required systems

### Vault Library
Asset Matrix with GRID / MASONRY / LIST / FILMSTRIP / LINEAGE modes; Inspector; Quick Look; Favorites; Inbox; Archive; Trash; manual and Smart Collections.

### Import Station
A full SubToolbox staging workflow for single/batch ingestion:
queue → inspect → classify → Spectrum Tag → project/collection assignment → duplicate/hash preflight → metadata extraction → optional AI/OCR/transcript suggestions → proxy/preview work → accept/reject → canonical Vault creation.

### Search, tags and smart filtering
Search names, tags, custom fields, projects, source tools, lifecycle, dimensions, duration, file size, dates, storage, usage, OCR/transcript text. Filters may be saved as Smart Collections.

All tag presentation uses the canonical ViewTube Spectrum Tag system.

### Vault memory
Remember recent assets, searches, saved filters, collections/projects, view modes and UI preferences. This is creator workspace continuity only and does not replace Brain memory/Channel Profile.

### Batch Processor
Operate on selection using canonical controls:
mass tag, rename pattern, project/collection assignment, lifecycle/favorite/archive/trash, metadata/custom fields, JSON/CSV export, ZIP bundle and Send To.

Specialist media processing is invoked through the owning system when appropriate.

### Text/document workbench
A Toolbox/SubToolbox document editor inspired by donor RichScriptEditor:
edit, template/snippet assistance, metadata, BrainRuntime refine, version-safe save, lightweight export, project attach and specialist handoff.

It is not a second Script Architect.

### Versions / lineage / usage
Explicitly distinguish version, derivative and duplicate. Show version stack, asset lineage, source generation, ContentBuild relations, project/tool/published usage and rights.

### Mini-tools
Quick Look; Compare; Before/After; Metadata Inspector; OCR; suggested auto-tagging; frame extraction; smart crop/aspect derivative; palette extraction; duplicate detector; Find Similar; Rights Inspector; Usage Inspector; Bundle projection; Send To.

## Projects / Kanban donor integration

Do not mount donor ProjectKanban as a second Vault project system.

Harvest its best creator-planning behavior into current Project Builder / Project Board:

- Idea Inbox → Research → Script → Storyboard → Production → Editing → Packaging → Scheduled → Published
- priority and due/publish target
- phase progress for research/script/shoot/edit/package
- hook/core promise
- audience/runtime target
- notes and script
- storyboard shots
- title drafts
- pre/production/post checklists
- linked canonical Vault assets
- thumbnail/package context
- post-publish statistics projection
- board search/filter
- canonical drag/drop stage transitions
- card detail workspace tabs: OVERVIEW / NOTES / SCRIPT / STORYBOARD / ASSETS / PACKAGING / CHECKLIST

All transitions must map into existing Project/ContentBuild contracts.

## UI authority

The Vault page must consume the production Toolbox/SubToolbox CSS and primitives. Donor visual patterns are inspiration only.

Primary structure:
Navigator | Asset Workspace | Inspector

Primary modes:
LIBRARY · PROJECTS · COLLECTIONS · INBOX · RECENT · GENERATED · FAVORITES · ARCHIVE · TRASH

Mobile portrait becomes Workspace-first with Navigator/Inspector as dedicated modes or drawers. Mobile landscape may use Workspace + Inspector.

## Ownership

- Vault: durable asset identity/storage metadata and creator-facing organization.
- Asset Engine: production semantics, ContentBuild relations, variants/versions/finalization.
- Projects/ContentBuild: project/work identity.
- Generation Store: generation-run provenance.
- BrainRuntime: reasoning/retrieval/orchestration.
- ActionPacket: cross-tool transport.
- Editor/Studio/Publisher: specialist consumption/actions.

## Build workspace

Implementation-ready planning artifacts:
- tasks/viewtube-vault/CAPABILITY-MAP.md
- tasks/viewtube-vault/SPEC-vault.md
- tasks/viewtube-vault/plan.md
- tasks/viewtube-vault/todo.md
- docs/migration/reference/VAULT_TOOL_DONOR_FEATURE_MAP_2026-09-24.md

## First build milestone

The first production milestone should deliver a real /vault route, canonical Toolbox shell, Asset Matrix, Inspector, canonical search/Spectrum Tags, and batch Import Station while preserving current Vault records.

The second milestone adds organization/memory/batch processing.

The third adds versions/lineage/document tools/Quick Look and project-board donor upgrades.

Durable provider/storage evolution follows after the compatibility and creator workflows are proven.
