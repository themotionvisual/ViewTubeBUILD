---
name: vt-e1-complete-operator-skill
description: Complete operating skill for planning, documenting, refining, and extending the VT_E1 standalone video editor runtime.
---

# VT_E1 Complete Operator Skill

Use this skill when:

- the task touches `public/editors/VT_E1.html`
- the task affects timeline behavior, navigation, effects, templates, export, history, or diagnostics
- a change should improve usability, modularity, parity, or performance
- you need one unified contract for how future VT_E1 work should be done

Primary references:

- `/Users/cwb/Downloads/viewtube/viewtubeX/public/editors/VT_E1.html`
- `/Users/cwb/Downloads/viewtube/viewtubeX/docs/Video Editor/VT_E1_COMPLETE_USER_GUIDE_AND_EDITOR_SKILL.md`
- `/Users/cwb/Downloads/viewtube/REMOTION_EDITOR_MASTER_SPEC.md`
- `/Users/cwb/Downloads/viewtube/docs/VIDEO_EDITOR/Editor Research/VIEWTUBE_VIDEO_EDITOR_UNIFIED_INTENT.md`
- `/Users/cwb/Downloads/viewtube/docs/VIDEO_EDITOR/Editor Research/VT_E1_MASTERPLAN_100_PLUS.md`

## Mission

Evolve VT_E1 into a simpler, more intuitive, more modular, more deterministic, and faster editor without creating a second competing runtime.

## Non-Negotiable Rules

1. Clip-first editing remains the main workflow.
2. No hidden AI timeline mutation.
3. Preview/export parity must stay diagnosable.
4. Major editing actions must participate in history.
5. UI behavior must map to explicit state, not hidden side effects.
6. VT_E1 stays the canonical runtime unless a deliberate migration replaces it.

## Priorities

1. Trust before novelty.
2. History, parity, and drag clarity before new feature sprawl.
3. Remove visible complexity before adding more controls.
4. Shared mutation helpers before more direct `setProject` branches.
5. Modular internals without breaking the working standalone surface.

## Work Sequence

1. Confirm the affected page or subsystem:
   - Projects
   - Clips
   - Text/Caps
   - Trans/FX
   - Templates
   - Code
   - AI
   - Vault
2. Find the current state model and shared helpers first.
3. Decide whether the change belongs to:
   - timeline
   - text/captions
   - transitions
   - clip FX
   - Unified FX Studio
   - export/parity
   - shell/navigation
4. Implement through shared contracts where possible.
5. Verify:
   - undo/redo
   - diagnostics
   - runtime smoke
   - page-level UX coherence

## UX Rules

1. Each page must have clear ownership.
2. Avoid duplicate controls for the same job.
3. Active controls should appear where the user expects them.
4. Status chrome should be hidden or removed unless it directly helps the workflow.
5. Advanced tools should remain available, but not in the way of the main path.

## Architecture Rules

1. Prefer helper extraction by subsystem:
   - timeline mutations
   - history and diagnostics
   - effects
   - transitions
   - templates
   - export/parity
2. Keep schema validation and patch diffing on JSON apply paths.
3. Keep shell cleanup structural, not just cosmetic, when safe.
4. Maintain explicit labels for history-bearing actions.

## Performance Rules

1. Memoize expensive derived editor views where appropriate.
2. Avoid repeated heavy work directly in large JSX render blocks.
3. Keep diagnostics local to the pages that use them.
4. Favor predictable local checks over hidden background work.

## Verification Rules

Every meaningful change should answer:

1. Does it undo and redo correctly?
2. Does it preserve preview/export contract expectations?
3. Does runtime smoke still pass?
4. Is the UI simpler or clearer than before?
5. Did this reduce duplication rather than add another parallel path?

## Success Definition

The editor becomes:

- easier to understand
- easier to navigate
- less visually noisy
- more deterministic
- more modular internally
- faster to maintain and safer to extend
