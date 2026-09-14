# VT_E1 Desktop Project Bridge Hook Handoff

Branch: `feat/editor-desktop-project-bridge-hook-2026-09-12`

## Goal
Complete desktop ↔ mobile project continuity without creating a second editor state store or duplicating the 1 MB `VT_E1.jsx` implementation.

## Completed architecture

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
- `VT_E1.jsx`
  - imports `useDesktopProjectBridge`
  - attaches it directly to the existing canonical `project / setProject` state boundary
  - continues to own timeline state, history, autosave, rendering, transitions, templates, and project mutation
- `EditorV1Page.tsx`
  - owns the dual frontend preference and Editor UI switcher
  - Current Main uses the responsive host
  - Linked Branch forces the classic/direct VT_E1 desktop host
  - mobile project state publishes through the same bridge
- `EditorV1Page.dualFrontend.test.tsx`
  - verifies Current Main → Linked Branch switching
  - verifies Linked Branch forces the desktop/classic host
  - verifies the preference survives remounts
  - verifies direct `?editorStyle=current` QA override does not destroy the saved preference

## Canonical VT_E1 wiring

The active state boundary is now:

```jsx
import { useDesktopProjectBridge } from './useDesktopProjectBridge';

const App = () => {
  const [project, setProject] = useState(() => normalizeProject(defaultProject()));
  useDesktopProjectBridge({ project, setProject, normalizeProject });
```

No alternate desktop project store, duplicate timeline, or second VT_E1 implementation is used.

## Round-trip behavior

1. Desktop edits publish a `source: 'desktop'` snapshot.
2. Switching to the responsive mobile editor seeds it from the latest compatible snapshot.
3. Mobile edits publish `source: 'mobile'`.
4. Returning to desktop applies only a newer mobile snapshot.
5. Layers, seam links, track vocabulary, project metadata, and desktop-only fields survive the adapter round trip.
6. Fingerprints and timestamps suppress equivalent/stale synchronization loops.
7. Existing VT_E1 undo/redo, autosave, render, template, transition, and timeline systems remain owned by VT_E1.

## Verification status

The final integration release gates confirm:

- full Vitest suite: passing
- focused contracts: passing
- production build: passing
- source governance: passing
- local Playwright smoke: passing
- dual frontend menu regression tests: passing as part of the full suite

The repository-wide static-quality job still reports three pre-existing Crown nullability errors in `src/components/crown/CrownLiveBrain.tsx`. The editor bridge fixture type error discovered during this work was corrected and no editor type error remains.

Vercel attempted a branch preview but returned `BUILD_FAILED: Resource provisioning failed` before a usable preview was produced. This is a deployment-resource failure rather than a Vite/application build failure; GitHub's production build gate passes.

## Safety

The functional VT_E1 integration is intentionally two added lines in the canonical editor file. The temporary one-time workflow used to make that surgical edit removed itself after completing the patch. Main should only receive the follow-up PR after the branch remains conflict-free and the requested visual/deployment verification is available or explicitly waived.
