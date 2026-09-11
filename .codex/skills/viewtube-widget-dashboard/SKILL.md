---
name: viewtube-widget-dashboard
description: Build, redesign, register, lay out, audit, and optimize ViewTube dashboard widgets using ViewTube's canonical shell, primitives, responsive grid, data states, and performance guardrails. Use for dashboard widget work; exclude unrelated page tools and generic React components.
---

# ViewTube Widget Dashboard

Use the repository's canonical dashboard skill and architecture plan instead of maintaining a second copy of those instructions.

## Required routing

1. Inspect the current branch and working tree. Preserve unrelated changes.
2. Read `../../../.claude/skills/viewtube-widget-dashboard/SKILL.md` completely and follow it as the canonical widget-dashboard contract.
3. Read only the canonical references that match the task:
   - architecture, migration, performance, consolidation, or deletion: `../../../.claude/skills/viewtube-widget-dashboard/references/architecture-baseline.md`;
   - building, redesigning, resizing, or certifying a widget: `../../../.claude/skills/viewtube-widget-dashboard/references/widget-build-contract.md`;
   - grid, layout, size buckets, container queries, or module registration: `../../../.claude/skills/viewtube-widget-dashboard/references/grid-layout-and-modules.md`;
   - widget markup, controls, badges, inputs, or CSS: `../../../.claude/skills/viewtube-widget-dashboard/references/primitive-catalog.md`.
4. For optimization sequencing and measured baselines, read `../../../docs/architecture/VIEWTUBE_WIDGET_DASHBOARD_OPTIMIZATION_PLAN.md`.
5. Re-measure repository facts before treating recorded counts, bundle sizes, or test totals as acceptance criteria.

## Delivery constraints

- Keep each pull request focused on one migration layer; do not combine data-source changes, CSS rewrites, widget-ID changes, and visual redesign.
- Preserve public widget IDs and persisted layouts unless the change includes normalization, schema migration, tests, and rollback guidance.
- Prefer the existing `WidgetShell`, registry, renderer map, primitives, tokens, and CSS layers over parallel abstractions.
- Verify with the narrowest relevant tests, the dashboard contract suite, baseline checks when performance changes, and a production build.
- Report changed files, measured impact, remaining risks, and any migration or rollback requirement.
