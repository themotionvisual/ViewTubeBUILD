# ViewTube Creator Vault — Implementation Tasks

## Wave 0 — contracts
- [ ] VTV-001 Audit current VaultAsset/Asset Engine/ContentBuild/Generation/Package contracts.
- [ ] VTV-002 Define backward-compatible Vault asset schema/version migration.
- [ ] VTV-003 Define Vault query/view-model contract.
- [ ] VTV-004 Define Import Station ingest job/result contract.
- [ ] VTV-005 Define Project donor-field mapping to existing Project/ContentBuild types.

## Wave 1 — route/library
- [ ] VTV-010 Replace /vault redirect with production Vault page mount.
- [ ] VTV-011 Build canonical Toolbox Vault shell and page modes.
- [ ] VTV-012 Build Asset Matrix grid/list owner.
- [ ] VTV-013 Build Asset Inspector shell.
- [ ] VTV-014 Add existing-record compatibility tests.

## Wave 2 — search/tags
- [ ] VTV-020 Implement canonical Vault search/filter selector.
- [ ] VTV-021 Integrate Spectrum Tags.
- [ ] VTV-022 Add metadata/project/type/lifecycle filter controls.
- [ ] VTV-023 Add saved filter and Smart Collection query persistence.

## Wave 3 — Import Station
- [ ] VTV-030 Build batch intake queue.
- [ ] VTV-031 Add per-item metadata/tag/project configuration.
- [ ] VTV-032 Add content hash / duplicate preflight.
- [ ] VTV-033 Add metadata extraction and background progress states.
- [ ] VTV-034 Add accept/reject/accept-all canonical ingestion.

## Wave 4 — organization/memory
- [ ] VTV-040 Add manual Collections.
- [ ] VTV-041 Add Smart Collections.
- [ ] VTV-042 Add Inbox/Favorites/Archive/Trash.
- [ ] VTV-043 Add custom metadata fields.
- [ ] VTV-044 Add recent assets/search/view preference workspace memory.

## Wave 5 — batch
- [ ] VTV-050 Add range/multi-select behavior.
- [ ] VTV-051 Build selection Action Rail.
- [ ] VTV-052 Build Mass Tagging/Batch Processor.
- [ ] VTV-053 Add batch rename/project/collection/lifecycle operations.
- [ ] VTV-054 Add JSON/CSV export and ZIP bundle.
- [ ] VTV-055 Add background task center/progress.

## Wave 6 — lineage
- [ ] VTV-060 Add version/derivative/duplicate selectors.
- [ ] VTV-061 Build Version Stack.
- [ ] VTV-062 Build Asset Lineage Map.
- [ ] VTV-063 Build Usage and Rights inspector tabs.
- [ ] VTV-064 Add golden/protected lifecycle guard.

## Wave 7 — text/preview
- [ ] VTV-070 Build SubToolbox document/text editor.
- [ ] VTV-071 Add version-safe document saves.
- [ ] VTV-072 Connect AI refine to BrainRuntime.
- [ ] VTV-073 Build Quick Look media preview.
- [ ] VTV-074 Build compare / before-after mode.

## Wave 8 — mini-tools
- [ ] VTV-080 Add metadata inspector.
- [ ] VTV-081 Add OCR and auto-tag suggestion pipeline.
- [ ] VTV-082 Add frame extraction.
- [ ] VTV-083 Add smart crop/aspect derivative.
- [ ] VTV-084 Add color palette extraction.
- [ ] VTV-085 Add find-similar projection.
- [ ] VTV-086 Wire specialist processing handoffs.

## Wave 9 — Projects donor upgrades
- [ ] VTV-090 Reconcile donor 9-stage pipeline with current Project/ContentBuild statuses.
- [ ] VTV-091 Add missing priority/due/progress metadata to Project Board presentation.
- [ ] VTV-092 Add Project detail tabs for overview/notes/script/storyboard/assets/packaging/checklist.
- [ ] VTV-093 Add title drafts, storyboard shots and phased checklists through canonical project models.
- [ ] VTV-094 Add linked Vault asset selection through canonical IDs.
- [ ] VTV-095 Add published stats projection without storing duplicate analytics truth.

## Wave 10 — storage
- [ ] VTV-100 Define durable Vault repository/provider boundary.
- [ ] VTV-101 Add managed metadata persistence.
- [ ] VTV-102 Integrate Google Drive provider through current auth.
- [ ] VTV-103 Add proxy/thumbnail/blob storage strategy.
- [ ] VTV-104 Migrate browser-local Vault data safely.

## Wave 11 — certification
- [ ] VTV-110 Typecheck and targeted tests.
- [ ] VTV-111 Route/governance regression tests.
- [ ] VTV-112 Production build.
- [ ] VTV-113 Desktop/narrow visual certification.
- [ ] VTV-114 Mobile portrait certification.
- [ ] VTV-115 Mobile landscape certification.
- [ ] VTV-116 Keyboard/touch/accessibility verification.
- [ ] VTV-117 Large-library performance verification.
