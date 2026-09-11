# ViewTube Crown integration — current main audit

Baseline reviewed: `main` at `4a103111b67ea8a5f4614925cbb391c662b31084` on 2026-09-11.

## Findings that change the Crown design

1. **Main is production.** `viewtubebuild` owns `viewtube.live`; merging to main auto-deploys. Crown execution must therefore use short-lived branches + PR preview and treat merge as the production release gate.
2. **The repo already has canonical specialist skills.** `.claude/skills/viewtube-widget-dashboard` and `.claude/skills/youtube-api-expert` exist. Crown must route to these instead of duplicating their domain rules.
3. **Analytics ownership has matured.** VT-SYNC is raw/canonical analytics data authority and `analytics-canon` is the consumer-facing contract described by the current migration references. Crown records must preserve channel/window/grain/provenance and never invent substitute values.
4. **Brain is now a real subsystem.** Current main includes a Brain capability registry, user control panel, evidence-aware report generation, and recent Brain Hub/controls work. Crown should govern mission/context exchange, not introduce a second AI state store.
5. **Dashboard has just changed materially.** Main now has 59/59 default-visible registered widgets, layout schema v10, Settings visibility management, new matrix primitives, and a measured widget optimization plan. Crown UI work must reuse these current contracts.
6. **Video package is now canonicalized.** PR #90 landed the video package contract. Creator/editor/publisher Crown missions should use that contract rather than inventing a competing package format.
7. **Auth/service work remains boundary-sensitive.** Current migration references explicitly require parity across fresh login, return session, reconnect, proxy failure, scope failure, cached analytics and tool-population journeys. Crown must keep server authority distinct from client UI state.
8. **Repository cleanup needs explicit governance.** Main still contains historical repair helpers such as `src/fix_imports.py` and `src/fix_multiline_imports.py`. They are candidates for Code Gardener review, not automatic removal by the Crown integration PR.

## Necessary adjustments to the original Crown proposal

- Do not create another long-lived integration branch model; follow `CLAUDE.md`: feature branch -> PR -> preview -> deliberate merge.
- Keep Crown as an orchestration/documentation layer first. Do not wire it directly into application runtime until protocol contracts are proven in docs/demo.
- Reuse existing `viewtube-widget-dashboard` and `youtube-api-expert` skills as specialist Knights.
- Treat the Grand Artifact Compiler as a shared bridge service, but do not give it authority to change production code or Task Index status by itself.
- Make `VT_RECEIPT` explicitly distinguish test/build/preview/production evidence.
- Make every executable mission carry `checkout`, `baseSha`, `headSha`, exact writer paths, and rollback.
- Preserve the existing Task Index as task authority; Crown mission state is not a replacement for Task Index status.

## Safe scope for this PR

Add Crown orchestration skills, protocol docs/schema, and an offline control-room demo only. No runtime imports, auth changes, billing changes, VT-SYNC changes, dashboard registry changes, editor changes, Task Index status changes, or production deployment behavior changes are included.
