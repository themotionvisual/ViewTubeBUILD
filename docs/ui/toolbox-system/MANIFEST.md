# ViewTube Toolbox UI Companion Artifact Manifest

**Status:** HISTORICAL / OPTIONAL IMPORT MANIFEST — not production authority  
**Current master:** `../../architecture/VIEWTUBE_TOOLBOX_UI_MASTER_RESOURCE.md`  
**Wave 3 note (2026-09-24):** several listed standalone DOCX/HTML/PNG destinations were planned import targets rather than current repository authority. Do not create/import them merely to satisfy this manifest; only import a source artifact when it is still useful and can be reconciled against current code.

This manifest prevents standalone references from becoming competing production authorities.

| Artifact | Intended repository path | Type | Status | Canonical? | Production relationship |
|---|---|---|---|---|---|
| Consolidated Toolbox UI Master Resource | `master/ViewTube_Toolbox_UI_Master_Resource_Reference_CONSOLIDATED.docx` | DOCX | READY FOR BINARY IMPORT | Documentation authority | Living rule/status/migration reference; production code remains executable authority |
| Complete UI System Library V6 | `libraries/complete/ViewTube_Toolbox_Subtoolbox_Complete_UI_System_Library_V6.html` | HTML | READY FOR IMPORT | No — primary prototype | Newest attached complete standalone library; reconcile every canonical claim with production code |
| Full Component Library | `libraries/components/ViewTube_Toolbox_Subtoolbox_Full_Component_Library.html` | HTML | READY FOR IMPORT | No — specialized reference | Component anatomy/palette/reference library |
| Instruction Guide Subtoolbox — 10 Concepts | `libraries/guides/ViewTube_Instruction_Guide_Subtoolbox_10_Concepts.html` | HTML | READY FOR IMPORT | No — specialized reference | Guide/instruction recipe concepts |
| ViewTube UI System Infographic | `infographics/ViewTube_UI_System_Infographic.png` | PNG | READY FOR BINARY IMPORT | No — visual reference | Compact hierarchy/palette/grid/radius/stroke communication surface; level naming must be reconciled with code |
| Complete UI System Library V4 | `legacy/ViewTube_Toolbox_Subtoolbox_Complete_UI_System_Library_V4.html` | HTML | LEGACY IMPORT | No | Historical evidence only |
| Complete UI System Library V3 | `legacy/ViewTube_Toolbox_Subtoolbox_Complete_UI_System_Library_V3.html` | HTML | LEGACY IMPORT | No | Historical evidence only |
| Complete UI System Library V2 | `legacy/ViewTube_Toolbox_Subtoolbox_Complete_UI_System_Library_V2.html` | HTML | LEGACY IMPORT | No | Historical evidence only |
| Complete UI System Library unversioned | `legacy/ViewTube_Toolbox_Subtoolbox_Complete_UI_System_Library.html` | HTML | LEGACY IMPORT | No | Pre-version historical baseline |

## Status vocabulary

- `CANONICAL` — production primitive and certified visual reference; preferred for new work.
- `MIGRATE` — supported implementation still moving to canonical primitives.
- `LEGACY COMPATIBILITY` — retained temporarily; no new consumers.
- `EXCEPTION` — named purpose-specific behavior with documented reason.
- `PROPOSED` / `DESIGNED` — reference concept not yet productionized.
- `SUPERSEDED` — replacement exists; remaining consumers must migrate.
- `REMOVE` — no supported consumers remain; delete after verification.
- `READY FOR IMPORT` — source artifact exists outside the repository and has a defined destination/classification.

## Import procedure

1. Use the exact destination path above; do not invent another `FINAL` filename.
2. For the canonical DOCX and PNG infographic, use a binary-capable Git workflow. Do not pass binary bytes through a UTF-8 contents API or create placeholder files.
3. Import V6 as the active complete prototype. Move older complete-library versions only into `legacy/`.
4. Preserve the Full Component Library and Guide Subtoolbox library as specialized references, not production authority.
5. After importing each artifact, change its manifest status from `READY FOR IMPORT` / `LEGACY IMPORT` to `IMPORTED` and record the verifying commit SHA.
6. If an imported artifact claims a new canonical geometry/state, reconcile it against production tokens and the UI Reference Library before changing its status to certified.

## Verification fields for future rows

Every future artifact row should track, directly or in an adjacent audit record: Artifact ID, title, path, type, status, canonical flag, supersedes, superseded-by, related production code, UI Reference Library section, mobile coverage, state coverage, accessibility notes, last verified date, verified commit SHA and notes.