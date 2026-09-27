# ViewTube UI certification checklist

Use this for any new or consolidated Toolbox, Subtoolbox, Studio Hub, dashboard widget, editor sidecar, settings panel, data visual, or table.

## Before coding

- Identify the canonical surface and owning registry.
- Read `VIEWTUBE_TOOLBOX_UI_MASTER_RESOURCE.md`, the widget/dashboard master resource, and the Studio Hub component source of truth as applicable.
- Locate existing primitives, shell geometry, tokens, recipes, icons, motion, responsive rules, and certification fixtures.
- Decide whether the change is a new primitive, a composed module, or a feature consumer. Do not create feature-local substitutes for system primitives.

## Required states

- connected/ready;
- disconnected/auth required;
- loading/progress/cancellable;
- empty/no data;
- partial/unsupported/not applicable;
- error/retry;
- permission blocked/quota limited;
- success with one clear next action;
- stale data/freshness and provenance where applicable.

Keep `DISCONNECTED`, `EMPTY`, `ERROR`, and `MISSING UI` semantically distinct.

## Composition requirements

- Use canonical Toolbox/Subtoolbox or widget shells.
- Use registry metadata rather than hard-coded feature inventories.
- Keep data loading and business logic outside presentational components where the repository pattern requires it.
- Keep the main path obvious; put technical evidence and advanced controls behind progressive disclosure.
- Make handoffs to Project, Brain, Editor, Publisher, Analytics, Vault, or Chat explicit.
- Include keyboard focus, labels, tooltips, reduced motion, touch targets, narrow widths, and mobile layout.
- Avoid `!important`, one-off global selectors, magic heights, duplicated CSS, and parallel spacing scales.

## Data visuals and tables

- State the metric, window, source, freshness, missingness, and scope.
- Show units and meaningful empty states.
- Preserve stable column/header geometry and responsive overflow behavior.
- Avoid charts that imply precision or continuity the data does not support.
- Link rows/cards back to canonical project, video, asset, or report identity.

## AI interaction requirements

- Explain what context the AI used.
- Show proposal/diff before mutation.
- Provide accept, edit, reject, undo, retry, cancel, and “why?” affordances appropriate to risk.
- Show job progress for long work and retain the receipt after completion.
- Never call a model provider directly from UI code.

## Verification

- Add focused component/contract tests.
- Update UI Reference Library examples if a system primitive changes.
- Capture desktop and mobile evidence where required.
- Test at narrow widget width and with long/translated content.
- Test connected, disconnected, empty, loading, error, partial, and success states.
- Run source-governance, CSS, build, smoke, and relevant certification commands.
- Update the living master resource, registry, certification ledger, and handoff log.
