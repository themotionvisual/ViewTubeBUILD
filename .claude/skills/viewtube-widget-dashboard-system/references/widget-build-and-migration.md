# Widget build and migration

## New widget brief

Define:

- stable name/ID;
- creator job;
- purpose;
- primary input/output/action;
- supporting actions;
- data/dependencies;
- signature functional component;
- signature interaction;
- permitted canonical primitives;
- widget-specific compound systems;
- primary palette and justified semantic color pops;
- default/min/max width;
- default/min/max height;
- width × height behavior;
- geometry equations;
- pages/modes if needed;
- loading/ready/empty/disconnected/stale/error states;
- cross-tool handoffs;
- accessibility;
- screenshots/visual evidence;
- certification.

**Do not require an archetype selection.** Build the layout around the widget's specific job.

## Signature component

Every widget should contain a unique, purpose-built functional element that makes it recognizable and explains its operation.

Preserve specialized systems such as Comment Responder/Goals Tracker-style interiors.

Normalize shared:

- geometry;
- color tokens;
- primitive sizing;
- interaction states;
- accessibility.

Do not flatten the specialized tool.

## New widget sequence

`creator job -> overlap audit -> signature component -> width/height matrix -> composition equations -> primitives -> data/actions -> states -> integrations -> implementation -> tests -> visual verification -> certification`

## Existing widget migration

`inventory -> current screenshots -> behavior/action inventory -> signature component -> primitive map -> token/color migration -> geometry equations -> width/height scaling -> mobile -> data states -> integrations -> accessibility -> CSS cleanup -> visual comparison -> certification`

Do not rewrite a working widget merely for visual uniformity.

## Resize requirement

A widget must support intentional contraction and expansion in both dimensions across its declared supported range.

Prefer:

- larger/smaller canonical primitive sizes;
- gap/padding density changes;
- adaptive 24px text;
- icon/detail scaling;
- secondary information reveal/hide;
- signature-component reallocation;

before changing the composition.

## Composition math

Matched regions must align exactly.

Example:

`leftH = rightRow1 + gap + rightRow2 + gap + rightRow3`

Use shared CSS variables/grid math rather than matching magic numbers manually.

## Migration preservation rules

Preserve:

- stable widget ID;
- working actions;
- data sources;
- persisted settings;
- useful custom controls;
- mobile behavior that is already correct;
- handoffs to other tools.

Remove old CSS/markup only after all consumers are proven migrated.
