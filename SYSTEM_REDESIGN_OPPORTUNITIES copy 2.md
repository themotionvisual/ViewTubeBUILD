# SYSTEM_REDESIGN_OPPORTUNITIES

Comprehensive redesign and optimization backlog across ViewTube.

## 1) Canonical Analytics Store + Selector Facade
- Action: consolidate all analytics derivations behind one selector facade (`getMasterRows`, `getMetricSummary`, typed chart adapters).
- Benefit: removes metric drift across Dashboard/Performance/Analytics/Reference pages.
- Implication: legacy local metric transforms become archive candidates.
- How: create typed adapter helpers in one file and migrate each consumer incrementally.
- Why mention: highest ROI for trust and monetization decisions.

## 2) Universal Toolbox Primitive Contract
- Action: enforce one shell/radius/stroke/motion/icon-rail contract for all subtoolbox-sized controls.
- Benefit: visual consistency, faster component assembly, fewer CSS regressions.
- Implication: one-off control overrides need deletion or tokenization.
- How: central token object + shared primitives + lint rule/comments.

## 3) Reference Studio as a Source-of-Truth Workbench
- Action: make Reference Studio the authoritative UI/component/charts catalog with deep links.
- Benefit: faster onboarding and safer UI iteration.
- Implication: old ad-hoc demos are archived once mapped.
- How: maintain `SOURCE_COMPONENT_MAP.md` and tab-level ownership.

## 4) Archive-First Cleanup Governance
- Action: formalize unused-file workflow (`UNUSED_INVENTORY`, restore paths, scheduled reviews).
- Benefit: safer cleanup, no accidental loss, lower repo confusion.
- Implication: temporary archive volume increases before hard-delete pass.
- How: every move logged in `ACTION_LOG` + proof lines.

## 5) Node Modules Rationalization (Package-Level)
- Action: remove unused dependencies by lockfile/package analysis and clean reinstall.
- Benefit: faster install/build, smaller attack surface.
- Implication: potential runtime misses if dependency graph assumptions are wrong.
- How: run static import scan + verify build + canary routes.

## 6) UX Clarity for Data Freshness
- Action: add visible “last sync / source mode / row count” status chips across data-heavy pages.
- Benefit: users trust numbers and understand when to re-sync.
- Implication: minor UI footprint increase.
- How: shared status component wired to cache metadata.

## 7) Monetization Instrumentation Layer
- Action: introduce conversion-focused KPI overlays (CTR ladders, RPM tiers, title tests).
- Benefit: clearer creator actions tied to revenue lift.
- Implication: requires careful copy and defaults.
- How: progressive disclosure cards with benchmark references.

## 8) Component Variants Registry
- Action: tag each component by role (`input`, `control`, `feedback`, `layout`) + tone compatibility.
- Benefit: easier reuse and style-safe assembly.
- Implication: one-time metadata annotation effort.
- How: registry JSON + linted usage helpers.

## 9) Chart Adapter Library
- Action: map canonical row schema to reusable chart-ready datasets by category.
- Benefit: avoids random/synthetic chart fallbacks.
- Implication: charts with sparse metrics need graceful “insufficient data” handling.
- How: adapter functions with null-safe defaults and empty-state spec.

## 10) Performance & Render Budgeting
- Action: lazy mount heavy toolboxes/charts and memoize dataset transforms.
- Benefit: smoother interaction and lower CPU usage.
- Implication: requires clear loading placeholders.
- How: `React.lazy`, suspense boundaries, and per-tab memoization.

## 11) Explainability Layer
- Action: each analytics card/chart includes “how computed” and source lineage tooltip.
- Benefit: user confidence and easier debugging.
- Implication: additional metadata wiring.
- How: embed metric-cell source/status from canonical contract.

## 12) Simplify Navigation + Intent Paths
- Action: regroup top-level nav by outcomes: Create, Analyze, Optimize, System.
- Benefit: lower cognitive load and faster task completion.
- Implication: route aliases/redirects for backwards compatibility.
- How: phased nav refactor with telemetry on click paths.

## 13) Accessibility and Interaction Consistency
- Action: enforce keyboard navigation, focus states, and consistent hit areas.
- Benefit: broader usability and fewer UI regressions.
- Implication: component-level audits required.
- How: accessibility checklist integrated into PR workflow.

## 14) Visual Hierarchy Modernization (while preserving brand)
- Action: keep neo-brutalist identity but improve spacing rhythm and data density control.
- Benefit: cleaner readability at scale without style loss.
- Implication: small component token updates.
- How: introduce spacing scale/tokens and migrate gradually.

## 15) In-App “What Changed” Feed
- Action: surface migration/release notes inside app for users.
- Benefit: transparency, faster support, better trust.
- Implication: needs lightweight changelog renderer.
- How: generate from `ACTION_LOG` summaries per release.
