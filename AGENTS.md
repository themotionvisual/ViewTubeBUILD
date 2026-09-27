# AGENTS.md — ViewTube cross-agent entry point

This file is the repository-wide agent pointer.

Canonical substantial-work conversation and evidence contracts:
- docs/governance/CONVERSATION_OS.md
- agent/contracts/conversation-os.md
- docs/governance/CROWN.md
- docs/governance/TASK_AUTHORITY.md
- docs/governance/VERIFICATION.md

Herald is superseded donor material. Preserve its useful prior-art/evidence ideas through the Conversation OS; do not force Herald tiers or twelve response blocks into normal user-facing replies.

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

For substantial work, use the Conversation & Improvement OS. Create a Crown Mission when the work crosses the mission threshold. Propose canonical task changes to Task Authority; never maintain a private status ledger.

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


## Long-conversation handoff

When a ViewTube conversation becomes too long for safe context retention, changes owner/phase, or contains substantial unfinished work:

1. use `.claude/skills/viewtube-conversation-handoff/SKILL.md`;
2. write `tasks/conversation-intake/<conversation-id>/handoff.md` + `worklog.json`;
3. continue from the handoff rather than relying on host memory;
4. use `.claude/skills/viewtube-conversation-work-reconciliation/SKILL.md` to audit every planned/completed/uncompleted item and route it to Task Index, Integrated Application Program, an owning authority/specification, a merged plan, decision, opportunity/risk, receipt/evidence or archive/no-action.

Conversation intake is not a second task ledger.


## Convergence-first routing

For substantial new plans, features, tools, systems, workflows, pages, stores or code owners:

1. read `docs/governance/CONVERGENCE.md`;
2. resolve `CAP-*` IDs and capability home(s);
3. check `governance/convergence/plan-families.json`;
4. check `ideas/registry.json`, Task Authority, current code and active PRs;
5. record Existing Work Checked;
6. choose `EXTEND → COMBINE → MERGE → GENERALIZE → ADAPT → CREATE_REVIEW`.

Use `.claude/skills/viewtube-convergence-governance/SKILL.md`.

Do not create parallel systems merely because a new conversation uses a new name.
