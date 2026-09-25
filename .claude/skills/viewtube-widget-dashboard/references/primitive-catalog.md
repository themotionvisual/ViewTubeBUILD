# Widget Primitive Catalog

Read this before writing markup or CSS inside a widget. If a primitive here does the job,
use it — do not recreate it.

Canonical consumer imports live in `src/views/dashboard/WidgetPrimitives.tsx`. `WidgetPrimitiveExtensions.tsx` is a temporary compatibility/implementation module and must not be used by new widget consumers. Updated 2026-09-17.

## Structure

| Primitive | Use for |
| --- | --- |
| `WidgetShell` | every widget's frame: header, icon rail, collapse, edit affordances |
| `WidgetWorkflowMain` | the primary content region of a workflow widget |
| `WidgetSection` | a titled block inside the body |
| `WidgetDivider` | separation between sections |
| `WidgetFooter` | the pinned action row |
| `WidgetScrollArea` | the *only* place overflow belongs; headers and titles never scroll |

## Data and state

| Primitive | Use for |
| --- | --- |
| `WidgetStatePanel` | loading, empty, blocked, stale and error states. Takes `data` — pass `null` explicitly when there is none |
| `WidgetMetric` | a KPI value with label and optional delta |
| `WidgetProgressBar` | determinate progress |
| `WidgetBadge`, `WidgetTag` | status and classification |
| `WidgetLiveBadge` | a live/streaming indicator; pulses, already reduced-motion guarded |
| `WidgetSpectrumFillBadge` | borderless filled badge, white text, 12 spectrum colours |
| `WidgetIconBadge`, `WidgetLeftSplitBadge` | square icon badge; badge with a split colour icon cell |

## Controls

| Primitive | Use for |
| --- | --- |
| `WidgetSizedButton` | the standard button |
| `WidgetActionButton` | the widget's primary action |
| `WidgetHeaderAction` | a header-mounted action with a canonical icon + label treatment; do not fake one with a toggle |
| `WidgetSplitButton`, `WidgetLeftSplitButton` | button with a split icon or menu cell |
| `WidgetIconButton` | square icon-only button |
| `WidgetSelect`, `WidgetSizedSelect` | dropdowns |
| `WidgetVideoSelect` | the canonical video picker; do not build another |
| `WidgetTextInput`, `WidgetField` | text entry with label and validation slot |
| `WidgetSearchInput` | split-left search bar |
| `WidgetStepper`, `WidgetHeaderStepper` | numeric stepper; header-mounted variant |
| `WidgetPagination` | paged navigation |
| `WidgetToggleSwitch`, `WidgetSwitch`, `WidgetHeaderToggle` | boolean toggles |
| `WidgetRadio`, `WidgetCheckbox`, `WidgetChoice` | selection controls |
| `WidgetStepTabs` | multi-step navigation |
| `WidgetDisclosure` | collapsible detail |
| `WidgetTooltip` | supplementary text; never the only carrier of meaning |
| `WidgetDropzone`, `WidgetMediaUploadFrame`, `WidgetMediaUploadAction` | file and media intake |

## Sizing and tone

Controls share one lattice. Do not set heights by hand.

- Heights: `18 | 24 | 32 | 38`, applied via `widgetControlHeightClass()` →
  `.vt-sized-control.is-height-{n}`. The exact box heights are owned by
  `widgetPrimitiveExactHeights.css`; a primitive's own CSS describes only its interior.
- Tones: `default | primary | secondary` → `.is-tone-{name}`, resolving
  `--vt-tone-bg`, `--vt-tone-fill`, `--vt-tone-ink`, `--vt-tone-stroke`
  (`widgetPrimitiveTones.css`).
- The `18` tier is deliberately filled, borderless and shadowless. It is also below the
  44px coarse-pointer target, so never make it the only interactive affordance on touch.

Controls that must size to their contents (`stepper`, `pagination`, split badges, search
bar, live badge, spectrum badge) already declare `width: fit-content`. A grid parent
defaults its items to `justify-self: stretch`, so anything new that must not stretch needs
the same treatment.

## ViewTube UI contract

Non-negotiable:

- coloured header and left icon rail meet the outer edge; no third strip;
- black icon strokes; title, button and label text is heavy and legible;
- spacing tokens: 24px grid gap and padding, 12px internal gap, 8px dense gap;
- border hierarchy 4px shell / 3px module / 2px control; radii 16 / 12 / 8px
  (`DASHBOARD_TOKENS` in `tokens.ts`);
- shadow colour derives from the widget title colour at controlled opacity;
- inputs take focus indication from the icon-rail / title colour;
- media declares an explicit `aspect-ratio` (16/9, 9/16, or the asset's own);
- data visuals carry text labels or patterns — colour is never the sole carrier of meaning.

## Six data states

Every data widget must demonstrate all of them:

| State | Required behaviour |
| --- | --- |
| Loading | stable skeleton, reserved space, no layout jump |
| Ready | current values, provenance, primary action |
| Empty | what is missing and how to populate it |
| Blocked | which dependency or permission, and the recovery action |
| Stale | keep the useful data, show its age, offer refresh |
| Error | isolate the failure, preserve the dashboard, retry safely |

## Promotion rule

If a pattern appears in two or more widgets, promote it to a primitive or an archetype
recipe. If it is genuinely feature-specific, keep it beside the widget.
