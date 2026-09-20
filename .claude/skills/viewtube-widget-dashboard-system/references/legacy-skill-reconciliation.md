# Legacy widget/dashboard skill reconciliation matrix

Status: active migration plan. No destructive deletion in this phase.

| Source | Verdict | Unique value to retain | Action |
|---|---|---|---|
| .claude/skills/viewtube-widget-dashboard | MERGE/SUPERSEDE | registry, renderer, shell, performance, data states, grid, optimization workflow | absorbed into canonical system; retain temporarily for consumers |
| .codex/skills/viewtube-widget-dashboard | MERGE/SUPERSEDE | Codex routing/agent metadata | migrate consumer routing after parity review |
| .claude/skills/viewtube-mobile-widget-system | MERGE/SUPERSEDE | phone full-width, deterministic heights, FIT/ADAPT/SCROLL, acceptance widths | absorbed; keep temporarily until all callers migrate |
| .codex/skills/viewtube-mobile-widget-system | MERGE/SUPERSEDE | Codex mobile routing | migrate after parity review |
| docs/architecture/WIDGET_SYSTEM_CERTIFICATION_MASTER_2026-09-14.md | KEEP/RECONCILE | certification chain, tokens, data/CSS/mobile contracts; historical archetype taxonomy | retain as reference, but archetype-first design is superseded by unique-widget doctrine |
| docs/architecture/VIEWTUBE_WIDGET_DASHBOARD_OPTIMIZATION_PLAN.md | KEEP/UPDATE BY MEASUREMENT | measured CSS/perf baseline, target architecture, phased consolidation | remeasure before numeric acceptance |
| governance/widget-library/* | KEEP AS EVIDENCE | historical/reference visual library | production primitives remain authority |
| public/widget-primitives.html | REVIEW | standalone primitive representation | ensure generated/rendered from production authority where feasible |
| src/views/dashboard/WidgetPrimitives.tsx + extensions | KEEP AUTHORITY | production component implementation | primary primitive owner |
| src/views/dashboard/tokens.ts + primitive CSS | KEEP AUTHORITY | current runtime tokens/styles | current code outranks stale prose |
| src/views/dashboard/widgets/UIReferenceLibraryWidget.tsx | CONVERT TO CONSUMER | visual catalog | must render production primitives, not private copies |
| older black-stroke rule | CONTRADICTION/OBSOLETE | none under current widget color contract | replace with ViewTube Ink/current palette rule |

## Deletion gate

Before deleting any predecessor skill:
1. compare complete content, not filenames;
2. migrate every unique valid rule/reference/example;
3. search skill registries, Oracle, Crown/Herald, docs, scripts and agent configs for consumers;
4. update consumers to the new canonical owner;
5. verify Claude and Codex paths still resolve;
6. run relevant tests/build;
7. record Herald evidence;
8. obtain creator approval for the final destructive deletion set.

Until all eight pass, predecessor skills are superseded candidates, not deletion targets.

## Additional reconciliation decisions

- Any **archetype-first design requirement** is superseded. Archetypes may remain descriptive/historical pattern vocabulary only.
- Generic template uniformity is superseded by **uniform shell + uniform primitives + unique functional interior**.
- Portrait header toggles must remain visible; widget titles keep canonical size and may wrap to two lines without ellipsis.
- Bidirectional width × height resizing and composition mathematics supersede mobile-only stack-first guidance.
