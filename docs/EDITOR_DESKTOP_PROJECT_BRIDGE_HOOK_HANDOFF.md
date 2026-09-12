# VT_E1 Desktop Project Bridge Hook Handoff

Branch: `feat/editor-desktop-project-bridge-hook-2026-09-12`

## Goal
Complete desktop ↔ mobile project continuity without creating a second editor state store or duplicating the 1 MB `VT_E1.jsx` implementation.

## What is implemented

- `useDesktopProjectBridge.ts`
  - canonical desktop state-boundary hook
  - publishes desktop VT_E1 project changes through the existing versioned `editorProjectBridge`
  - applies only newer `mobile` snapshots back into desktop state
  - restores through `editorDesktopBridgeRuntime` / `editorDesktopProjectAdapter`, preserving desktop-only fields
  - suppresses stale/equivalent updates through project fingerprints
  - delays publishing slightly so a just-mounted desktop editor cannot overwrite a pending mobile snapshot before restore
- `useDesktopProjectBridge.test.tsx`
  - verifies mobile snapshot restore into the desktop project shape
  - verifies desktop edits publish back through the versioned bridge

## Final VT_E1 wiring

The canonical `VT_E1.jsx` state boundary is currently:

```jsx
const App = () => {
  const [project, setProject] = useState(() => normalizeProject(defaultProject()));
```

The intended integration is deliberately tiny:

```jsx
import { useDesktopProjectBridge } from './useDesktopProjectBridge';
```

and directly after the `project` state is created:

```jsx
useDesktopProjectBridge({
  project,
  setProject,
  normalizeProject,
  onBeforeApply: () => markHistoryAction('Restore Mobile Project'),
});
```

If `markHistoryAction` is declared later in the component, wire the hook after that callback exists, or omit `onBeforeApply` in the first pass and add history labeling in a follow-up. Do not create a second project store.

## Acceptance

1. Desktop edits publish a `source: 'desktop'` snapshot.
2. Switching to mobile seeds from that snapshot.
3. Mobile edits publish `source: 'mobile'`.
4. Returning to desktop applies the newer mobile snapshot.
5. Layers, seam links, track vocabulary, project metadata, and desktop-only fields survive the round trip.
6. No synchronization loop occurs.
7. Existing VT_E1 undo/redo, autosave, render, template, transition, and timeline systems remain owned by VT_E1.

## Safety

This branch was cut from the post-PR-123 `main` head rather than continuing development on the stale PR-123 branch. Only the hook, its tests, and this handoff document are introduced here. `main` is not edited directly.
