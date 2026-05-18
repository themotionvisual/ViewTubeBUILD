<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->

- [Goal](#goal)
- [What Was Executed Immediately](#what-was-executed-immediately)
- [Phase 1 (1-2 days): Stabilize the Foundation](#phase-1-1-2-days-stabilize-the-foundation)
- [Phase 2 (2-4 days): Component Normalization](#phase-2-2-4-days-component-normalization)
- [Phase 3 (3-5 days): Data Table + Chart Cohesion](#phase-3-3-5-days-data-table--chart-cohesion)
- [Phase 4 (1 week): AI-Assisted Curation Pipeline](#phase-4-1-week-ai-assisted-curation-pipeline)
- [Phase 5 (1-2 weeks): YouTube Tamagotchi Prototype](#phase-5-1-2-weeks-youtube-tamagotchi-prototype)
- [Risks + Mitigations](#risks--mitigations)
- [Ownership Model](#ownership-model)
- [Definition of Done (Program Level)](#definition-of-done-program-level)

<!-- /code_chunk_output -->


KV

## Goal

Increase UI quality/style cohesion while preserving the current IA/layout bones and avoiding destabilizing rewrites.

- [ ] Implement new database schema
- [x] Configure Neobrutalist MPE UI Engine

## What Was Executed Immediately

1. Imported attached style pack into public reference library path.
2. Added imported pack metadata + curated best-of board + baseline coverage4
3. Added governance docs (`REFERENCE_STUDIO_RULES.md`, `IDEAS_VAULT.md`).
4. Patched Dashboard KPI cards to use cache-backed fallbacks (not just channel overview response).
5. Replaced dark mode inversion approach with intentional dark glow brutalist treatment.

## Phase 1 (1-2 days): Stabilize the Foundation

1. Validate curated top picks in live UI and mark accepted defaults.
2. Add visual regression snapshots for dashboard, reference studio, studio hub, performance hub.
3. Add a compact token file for border/shadow/color conventions.

Exit criteria:

- No obvious contrast/readability defects in dark mode.
- Dashboard cards populate with real values whenever cache exists.

## Phase 2 (2-4 days): Component Normalization

1. Build a reusable `ToolContainer` contract implementation.
2. Standardize header shell and tool chrome across major tools.
3. Migrate one representative module per top-level tool to normalized contract.

Exit criteria:

- One canonical container pattern used in all major views.
- No breakage in existing tool functionality.

## Phase 3 (3-5 days): Data Table + Chart Cohesion

1. Build shared metric formatter/registry module.
2. Unify table styles between Channelytics and Research Lab.
3. Start Google Charts replacement path for high-value charts first.

Exit criteria:

- Same metric labels and formatting across dashboard/performance/research.
- At least 2-3 high-impact charts rendered via native styled chart pipeline.

## Phase 4 (1 week): AI-Assisted Curation Pipeline

1. Build component inventory scanner script.
2. Add scoring rubric (contrast, spacing rhythm, state clarity, mobile behavior, brand fit).
3. Generate shortlist + manual accept/reject workflow.

Exit criteria:

- Automatic shortlist exists and is human-reviewed.
- Curation decisions stored in reference manifest.

## Phase 5 (1-2 weeks): YouTube Tamagotchi Prototype

1. Define state model (pet health, streaks, growth XP, recommendation quests).
2. Map analytics + creator actions to pet state transitions.
3. Build dashboard mini-widget prototype and daily quest panel.

Exit criteria:

- Interactive MVP running with mock + live analytics hooks.
- Daily loop is testable and understandable in under 60 seconds.

## Risks + Mitigations

- Risk: Style drift.
  Mitigation: enforce rules doc + token source-of-truth + curated manifest.
- Risk: Feature regressions from broad refactor.
  Mitigation: phase by phase, no destructive replacement, preserve old modules until validated.
- Risk: Data inconsistency across tools.
  Mitigation: central metric registry + cache normalization.

## Ownership Model

- Design system owner: UI rules + tokens + curation acceptance.
- Data owner: metrics registry + dashboard/performance consistency.
- Integration owner: tool container migration + routing/compatibility.

## Definition of Done (Program Level)

- Reference Studio becomes a real decision hub (not just examples).
- Every top-level tool has at least one approved baseline component integrated.
- Dark mode is intentional and premium, not inverted.
- Dashboard is reliable for real creator status at a glance.
