# Vault-Tool Donor Feature Map

**Donor:** themotionvisual/Vault-Tool  
**Target:** themotionvisual/ViewTubeBUILD  
**Policy:** inspiration/reference donor. Rebuild through current ViewTube architecture and UI. Do not wholesale-copy state ownership, CSS or page composition.

## Highest-value donor sources

| Donor source | Valuable ideas | Target owner | Decision |
|---|---|---|---|
| components/VaultOS.tsx | Asset cards, Spectrum-like tags, smart search/filter, batch processor, tools catalog, versions, view modes, Project Bundler, Intake Desk launcher | Vault | REBUILD |
| components/IntakeDesk.tsx | pending ingest queue, per-item staging config, tag assignment, scanners, proxy status, accept/reject | Vault Import Station | REBUILD |
| components/RichScriptEditor.tsx | document editor, templates, AI refine, version-safe save/export concepts | Vault document tools / Script handoff | REBUILD |
| components/MediaClipper.tsx | trim/crop/adjust/meta/batch interaction patterns, proxy toggle, save-new vs overwrite | Vault quick tools + Editor handoff | ADAPT AS UX; processing mostly HANDOFF |
| components/ProjectKanban.tsx | 9-stage creator pipeline, priorities, dates, progress, notes, scripts, storyboard, title drafts, checklists, linked assets, stats | Project Builder / Board | REBUILD INTO CANONICAL PROJECTS |
| views/Projects.tsx | calendar/task/project metadata ideas | Projects | SELECTIVE ADAPT |
| components/BrainBankManager.tsx | searchable chronological resource log, source/type filters, import/export UX | Vault history/usage UI only | UX DONOR ONLY |
| services/brainBank.ts | local persistence techniques | none as authority | DO NOT PORT ARCHITECTURE |
| src/data/vaultIdeas.ts | 100 Vault product ideas | Vault backlog/reference | RETAIN AS DONOR CATALOG |
| src/data/master40Ideas.ts | Brand Kit, command palette, multi-channel workspace, recent Vault activity concepts | matching ViewTube owners | SELECTIVE ADAPT |

## Explicit donor features accepted into Vault plan

### Core
- Batch Import Station
- pending-ingest Inbox
- search + smart metadata filtering
- canonical Spectrum Tags
- batch tagging / renaming / organization
- detailed list and mixed-media views
- Favorites / Archive / Trash
- Smart Collections
- Quick Look
- context actions
- recent workspace state
- custom metadata/schema fields
- versions and lineage
- duplicate detection
- visual similarity
- usage analytics
- protected/golden assets
- metadata/EXIF/OCR
- download bundles and metadata export

### Mini-tools / tool launcher
- metadata inspector/editor
- document/text editor
- quick note
- format conversion handoff
- image crop/derivative
- frame extraction
- color palette extraction
- transcription/caption handoff
- proxy status/generation
- compare/before-after
- similar asset search
- project bundle projection
- secure share as future capability

### Deferred / specialist-owned
- full chroma keyer
- full audio ducking
- full LUT editor
- silence removal engine
- background removal engine
- upscaler
- voice cloning
- translation engine
- publishing actions
- storyboard generation
- full video editor

Vault may launch these capabilities and receive derivative assets back, but should not own duplicate engines.

## Accepted Project/Kanban donor improvements

Map into current Projects/ContentBuild:
- stages: Idea Inbox, Research, Script, Storyboard, Production, Editing, Packaging, Scheduled, Published
- card priority
- due/publish target
- production-phase progress meters
- hook/core promise
- target audience
- runtime
- notes
- script
- storyboard shot list
- title drafts
- pre/prod/post checklists
- linked Vault assets
- thumbnail
- published stats projection
- board search/filter
- canonical drag/drop transitions
- card detail tabs

## Rejected donor ownership

Do not port:
- donor Project arrays as source of truth
- donor Vault arrays as source of truth
- BrainBank localStorage authority
- donor tag palette as a competing tag system
- hard-coded black-border visual system
- mock timer/scanner behavior as production processing
- browser-only auth/storage patterns
- duplicate AI service calls bypassing BrainRuntime

## Migration principle

For each accepted donor feature:
1. identify current ViewTube canonical owner;
2. identify current types/services/primitives;
3. extract user job and interaction idea;
4. redesign with current Toolbox/SubToolbox system;
5. connect to canonical identities;
6. add tests and rendered certification;
7. document donor provenance without retaining stale ownership.
