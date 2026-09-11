# ViewTube Crown Runtime Control Room — Phase 4 Plan

## Goal
Turn the repository-level Crown protocols into a visible, read-only ViewTube application surface without giving the UI authority to mutate Task Index state, repository files, billing, OAuth, publishing or deployment.

## Runtime boundary
The first runtime Control Room is a presentation layer over a generated snapshot of Crown mission records already committed to the repository. It is not a new source of truth. Canonical authority remains split across the Task Index, repository/runtime, VT-SYNC, Brain owners and external services.

## Initial surface
Route: `/crown`

Sections:
- Today
- Missions
- Tasks
- Artifacts
- Decisions
- Execution
- Verification
- Code
- Services
- Brain
- Release

## First implementation
1. Add a generated TypeScript snapshot for the five representative domain missions plus the original dashboard fixture.
2. Build a responsive Neo-Brutalist `CrownControlRoom` page with mission filters, status summaries, lifecycle strip and evidence panels.
3. Register `/crown` in `AppRoutes` and the central page registry.
4. Expose the Control Room in the application drawer/search under Account & App/System operations rather than expanding the primary six-item top navigation.
5. Add route prefetching.
6. Preserve explicit read-only labels and distinguish protocol fixtures from verified runtime work.

## Next phase
Replace the committed snapshot with an automatically generated Crown snapshot during the build or release workflow. The generator should read `.viewtube/exchange/**`, emit a deterministic runtime-safe data module, and fail if schema validation fails.
