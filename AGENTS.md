# AGENTS.md — ViewTube cross-agent entry point

This file is the repository-wide agent pointer. The canonical response/evidence contract remains:

- agent/contracts/herald-out.md

The planned generator scripts/herald-sync.mjs is not yet implemented, so this file is maintained manually until the distributor exists.

## Documentation + product-system workflow

For any work that creates, edits, consolidates, renames, archives, audits, or materially relies on ViewTube documentation, plans, reports, standalone HTML/prototypes, skills/workflows, product capabilities, system integrations, or main architecture/program documents:

1. Read `docs/governance/DOCUMENTATION.md` and `docs/registry.json`.
2. Use `.claude/skills/viewtube-document-system/SKILL.md` or the host-equivalent entry; Codex has `.codex/skills/viewtube-document-system/SKILL.md`.
3. Read `docs/architecture/PRODUCT_COMPLETION_CONSTITUTION.md`, `docs/architecture/PRODUCT_ARCHITECTURE.md`, and `docs/programs/INTEGRATED_APPLICATION.md` when relevant.
4. Reconcile prior art before creating a new document/system/skill/prototype.
5. Living documents use brief names without dates and carry Production Date + Last Edited metadata.
6. Preserve superseded sources through lossless consolidation and `archive/removed/`; never discard unique content.
7. For code changes, follow `docs/governance/VERIFICATION.md`: tests/build are not enough when runtime/interaction/visual proof is relevant. Visible UI work requires screenshot capture and analysis, correction, and reverification.
8. Exact work status belongs in the Task Index; conversations/PRs/skills/docs do not create competing status ledgers.

Herald remains the current response-format contract until the Conversation OS migration phase replaces it; it does not override the documentation authority graph.

## Mandatory editor rule

For any work touching the desktop or mobile video editor, timeline, preview, editor project state, effects, transitions, captions, templates/design library, Remotion, Video Director integration, editor AI/generation, export, or editor-related widgets:

1. Load the editor skill: .claude/skills/viewtube-youtube-editor-system/SKILL.md (or the equivalent skill mirror supported by the current agent host).
2. Read docs/editor/VIEWTUBE_YOUTUBE_EDITOR_SYSTEM_MASTER_RESOURCE.md before planning or implementation.
3. Preserve one shared desktop/mobile project model and stable capability IDs.
4. Route creator AI through BrainRuntime, media-generation jobs through Video Director, generated assets through Asset Engine/Vault, and deterministic final output through Remotion.
5. Before ending the turn, update Current Work and append the Update Log in the master resource, including branch/PR/commit, paths, verification, references and next action.
6. Register new editor plans, skills, standalone HTML/prototypes, branch donors and important external sources in the master resource.

If the master resource was not updated, editor work is not fully handed off.

## Repository workflow

Follow CLAUDE.md:
- never develop directly on main;
- use a short-lived feature branch;
- open a PR to main;
- merge deliberately because main is production;
- distinguish planned, implemented, preview-verified and production-verified states.

## Documentation authority

Follow docs/governance/DOCUMENTATION.md and docs/registry.json. The legacy governance/registry files are preserved migration sources. A prototype, screenshot, old plan or branch is evidence/prior art, not runtime authority.
