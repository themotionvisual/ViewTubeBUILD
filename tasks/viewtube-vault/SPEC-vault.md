# Spec — ViewTube Creator Vault

## Objective

Create the production ViewTube Vault as a first-class creator asset operating system and replace the current /vault redirect with a real production workspace.

The page must let creators ingest, search, organize, inspect, edit metadata/text assets, batch-process, version, relate, preview, reuse and route creator assets across ViewTube while preserving canonical artifact and project identity.

The legacy Vault-Tool repository is a feature/layout/workflow inspiration donor only. Production code must be rebuilt through current ViewTube contracts, Toolbox/SubToolbox primitives and CSS.

## Primary user jobs

1. Bring one or many assets into ViewTube safely.
2. Find any asset quickly by text, tag, metadata, project, type, usage or smart rule.
3. Organize without forcing physical-folder duplication.
4. Inspect provenance, versions, relationships, usage and rights.
5. Modify metadata or create safe derivatives without destroying lineage.
6. Apply batch actions to large selections.
7. Attach assets to projects and send them to compatible tools.
8. Recover recent work, saved filters and organization context.
9. Manage project production work through Projects/Board, not through a duplicate Vault Kanban store.

## UI contract

All visible Vault production UI uses current Toolbox / SubToolbox / primitive / compound-component systems and current Toolbox CSS authority.

The donor visual system is reference only.

Required page modes:
- LIBRARY
- PROJECTS
- COLLECTIONS
- INBOX
- RECENT
- GENERATED
- FAVORITES
- ARCHIVE
- TRASH

Required view modes:
- GRID
- MASONRY
- LIST
- FILMSTRIP
- LINEAGE

Desktop composition:
- Navigator | Asset Workspace | Inspector

Mobile portrait:
- Asset Workspace primary
- Navigator and Inspector become page/drawer modes
- no crushed three-column layout

Mobile landscape:
- Workspace + Inspector where space permits
- navigation collapses into header controls

## Signature systems

### Asset Matrix
Canonical central workspace for cards/rows, selection, view modes, quick actions and responsive density.

### Import Station
Batch intake staging queue inspired by Vault-Tool IntakeDesk:
- drag/drop and picker batch upload
- per-item preview/type/name
- project/collection destination
- Spectrum Tags before ingest
- metadata extraction
- exact duplicate/hash scan
- optional OCR/transcript/vision suggestions
- proxy/thumbnail background tasks where supported
- accept/reject per item and accept-all
- resumable progress state

### Spectrum Tags
Use ViewTube canonical Spectrum Tag system. Donor deterministic-spectrum logic is inspiration only.
Support:
- existing tag search
- multi-tag AND/OR filtering
- batch tagging
- suggested tags requiring user acceptance
- tag counts
- saved tag combinations
- optional quick-tag shortcuts

### Smart Search + Filters
Search across:
- name/title
- tags
- custom fields
- project/ContentBuild
- source tool
- type/role/lifecycle
- dimensions/resolution
- duration
- file size
- dates
- storage provider
- usage status
- OCR/transcript text where available

Filters can be saved as Smart Collections.

### Memory / Recent Context
Vault memory means user-facing workspace continuity, not a new Brain memory database.
Persist/recover:
- recent assets
- recent searches
- saved filters
- recent collections/projects
- view mode/density
- inspector tab
- selection-independent workspace preferences

Brain retrieval continues through BrainVaultAdapter / canonical Vault search.

### Inspector
Tabs:
- DETAILS
- TAGS
- PROJECTS
- VERSIONS
- LINEAGE
- USAGE
- RIGHTS
- NOTES

### Batch Processor
For current selection:
- tag / untag
- rename pattern
- project assignment
- collection assignment
- lifecycle change
- favorite
- archive / restore / trash
- export metadata
- download bundle
- create derivative request
- send to compatible tool
- selected metadata/custom-field edits

Processing actions that belong to specialist systems are handed off rather than reimplemented locally.

### Text / Document Editor
Rebuild donor RichScriptEditor ideas using canonical SubToolbox UI:
- edit text/document assets
- rename
- notes/metadata
- templates/snippets where appropriate
- AI refine through BrainRuntime
- save as new version / derivative
- export TXT/Markdown; richer formats only when real export support exists
- attach to project
- Send To Script/Storyboard/Brain/Editor

Do not create a second Script Architect.

### Quick Look
Spacebar/tap action opens media-aware preview:
- image zoom
- video playback/scrub
- audio waveform/playback
- document/text preview
- metadata summary
- next/previous selection navigation

### Versions and lineage
Distinguish:
- Version = same conceptual asset evolved
- Derivative = new asset produced from another
- Duplicate = another copy of equivalent content

Expose lineage graph across generation, edits, packages, projects and published usage.

## Organization model

Physical storage and logical organization are separate.

Assets may belong to multiple:
- Projects
- Collections
- Smart Collections
- Tags
- Creative roles
- Lifecycle/workflow stages

Add typed custom metadata fields for creator-specific organization.

## Lifecycle model

At minimum:
DRAFT
CANDIDATE
APPROVED
FINAL
GOLDEN
SUPERSEDED
ARCHIVED
TRASHED

Golden/protected assets require explicit unlock before destructive actions.

## Donor Project/Kanban upgrades

Apply to current Project Builder / Project Board where they improve current behavior.

Candidate creator-facing stages:
- Idea Inbox
- Research
- Script Writing
- Storyboard
- Production
- Editing
- Packaging
- Scheduled
- Published

These must map to canonical Project/ContentBuild stages, not create a second lifecycle store.

Project cards/details should support, where current canonical models permit:
- priority
- due date / publish target
- progress by research/script/shoot/edit/package
- hook/core promise
- audience
- runtime target
- notes
- script
- storyboard shots
- title drafts
- pre/production/post checklists
- linked canonical Vault asset IDs
- thumbnail
- post-publish stats projection
- search/filter
- drag/drop stage movement through canonical commands

Use a detail workspace with tabs such as:
OVERVIEW / NOTES / SCRIPT / STORYBOARD / ASSETS / PACKAGING / CHECKLIST

Do not move project ownership into Vault.

## Donor mini-tool policy

REBUILD/ADAPT where useful:
- Quick Look
- Find Similar
- Duplicate Detector
- Compare
- Before/After
- Auto Tag suggestions
- OCR
- Metadata Inspector
- Frame Extractor
- Smart Crop / aspect derivatives
- ZIP bundle export
- JSON/CSV metadata export
- Version Manager
- Lineage Map
- Rights Inspector
- Usage Inspector
- Smart Collection builder
- Project/Asset Bundle projection
- Send To
- color-palette extraction
- proxy generation status
- transcription/captions handoff
- compression/optimization handoff

Do not embed full replacement editors or duplicate specialist processing engines in Vault.

## Data contract direction

Evolve current VaultAsset compatibly rather than replace it blindly.

Candidate fields:
- schemaVersion
- description
- creativeRole
- lifecycleState
- workflowStage
- favorite
- archivedAt / trashedAt
- contentHash
- fileSize
- media metadata
- storageProvider / storageLocator
- versionGroupId / versionNumber
- parentAssetIds / derivativeOf
- collectionIds
- customFields
- usageRefs
- rights/license metadata
- source capability/provenance events

Before adding a field, check whether Asset Engine / ContentBuild already owns the concept and store only the canonical reference.

## Commands

Use repository-current commands at implementation time. Known required verification from current ViewTube toolbox guidance:
- npx tsc -b
- npx vitest run src/app/__tests__
- npm run build
- targeted lint for changed files
- rendered browser verification on desktop, mobile portrait and mobile landscape

## Boundaries

Always:
- preserve stable asset/project/contentBuild identities
- use current Toolbox/SubToolbox primitives
- use canonical Spectrum Tags
- preserve provenance
- use ActionPacket/handoff boundaries
- provide loading/empty/error/partial states

Ask first:
- destructive migration of existing Vault data
- new external storage provider dependencies
- database/storage schema migrations that cannot be backward compatible

Never:
- create another Brain memory store
- create another Project store
- create another asset authority
- copy donor CSS/layout wholesale
- use donor localStorage state as production truth
- silently overwrite final/golden assets
- pass anonymous blobs across ViewTube tool boundaries when a canonical asset identity exists

## Success criteria

- /vault mounts a real production Vault workspace rather than redirecting to Reference Studio.
- Existing compatible Vault records remain readable.
- User can batch import assets, tag/search/filter them, inspect them and perform batch organization.
- Project links use canonical Project/ContentBuild identities.
- Project Board donor improvements land in Projects, not duplicated Vault state.
- Text/document assets have a canonical lightweight editor with version-safe saves.
- Smart Collections can be created from filters.
- Spectrum Tags are used consistently.
- Send To preserves asset identity and provenance.
- desktop/mobile portrait/mobile landscape pass visual and interaction certification.
