# Projects native embedded migration boundary

Status: handoff after PR #212 merge

PR #212 was merged while the follow-on hierarchy work was being prepared. Do not continue new structural work on its old head branch as though it were unmerged.

## Current accepted composition

- Projects page owns one T0 `ProjectsToolboxModule` per major creator tool.
- Project Board, Publishing Schedule, Project Studio and Storyboard Studio remain independent top-level tools.
- Storyboard Studio already exposes an explicit `embedded` contract.
- Project Board, Publishing Schedule and Project Studio currently rely on transitional embedded adapters introduced by PR #212.
- Those adapters are compatibility boundaries, not canonical primitives.

## Next implementation

Create a fresh branch from current `main` and migrate in small commits:

1. `ProjectKanbanWorkspace`: add native `embedded?: boolean`; embedded rendering must omit the legacy T0 frame/title while preserving DnD, search, filters, archive/create flows, dialogs and inspector.
2. `PublishingScheduleArchitect`: add native `embedded?: boolean`; embedded rendering must omit the legacy T0 frame/title and make mobile Agenda the semantic default without changing desktop Month/Week/Agenda behavior.
3. `ProjectStudio`: add native `embedded?: boolean`; embedded rendering must omit `ToolboxScaffold` while preserving planning/calendar/project behavior and existing internal `SubToolbox` modules.
4. Replace the three adapter imports in `ProjectCalendarPage` with direct native embedded consumers.
5. Delete `EmbeddedProjectKanbanWorkspace.tsx`, `EmbeddedPublishingSchedule.tsx`, and `EmbeddedProjectStudio.tsx` only after direct consumers compile.
6. Migrate Board and Scheduler controls to canonical `SubToolboxInput`, `SubToolboxSelect`, and `SubToolboxButton` primitives as a separate commit from shell removal.
7. Run type/build/governance and browser/mobile verification before merge.

## Safety rule

Do not rebase or force-update the merged PR #212 branch. Current `main` has advanced beyond that merge. Start the native-contract phase from the latest main SHA and preserve all intervening work.