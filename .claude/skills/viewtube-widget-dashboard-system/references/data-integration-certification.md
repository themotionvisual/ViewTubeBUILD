# Data, integration, and certification

## Data flow

Preferred path:

`SOURCE -> CANONICAL DATASET -> SELECTOR/ADAPTER -> WIDGET VIEW MODEL -> VISUAL/CONTROL`

Compatible imported data must not be ignored merely because the preferred network source is unavailable.

Preserve provenance and freshness.

## Deliberate states

Implement as applicable:

- loading;
- ready;
- empty;
- disconnected/blocked;
- stale;
- partial/imported;
- error.

Disconnected does not equal empty.

A disconnected account should usually preserve the recognizable tool interface and explain what data/action requires connection.

## Actions and handoffs

A widget should be useful as a tool, not only a report.

When appropriate, connect data/insight to:

- edit;
- generate;
- compare;
- schedule;
- publish;
- open in Analytics;
- open in Studio;
- create/update Project;
- send asset to Vault/Editor;
- invoke Brain;
- hand off to another widget/tool.

Use current typed/contextual handoff systems where available.

## Runtime ownership

One stable registry definition and renderer owner per widget ID.

Keep heavy libraries/network work inside lazy boundaries.

Hidden/collapsed widgets should avoid unnecessary:

- polling;
- observers;
- media;
- animation;
- AI calls;
- heavy transforms.

## Certification gates

- IMPLEMENTED
- DATA_CONNECTED
- FUNCTIONAL
- DATA_STATES
- RESPONSIVE
- MOBILE_VERIFIED
- VISUALLY_CERTIFIED
- ACCESSIBLE
- PRODUCTION_VERIFIED
- CANONICAL

Registry lifecycle/status is not certification.

## Responsive certification

Verify the supported width × height state space, not only one default screenshot.

A widget fails RESPONSIVE if a declared dimension produces:

- clipped labels;
- hidden primary controls;
- broken signature component;
- accidental outer growth;
- unintentional horizontal overflow;
- misaligned linked geometry;
- unusable touch targets.

## Visual certification

Verify:

- canonical primitives;
- monochromatic palette contract;
- semantic secondary colors only;
- exact gap/stroke alignment;
- complete labels;
- title no-ellipsis/full-size behavior;
- portrait header-toggle visibility;
- signature component recognizable at all supported sizes;
- media/upload geometry;
- radio/toggle/checkbox visible states.

## Accessibility

Includes:

- keyboard interaction;
- visible palette-derived focus;
- labels/semantics;
- contrast;
- reduced motion;
- touch behavior;
- non-color encodings;
- correct pressed/checked/selected semantics.

## Production certification

A local build or successful preview is not by itself PRODUCTION_VERIFIED.

Production verification includes real runtime dependencies relevant to the widget:

- auth/account state;
- live/imported data;
- API behavior;
- external actions;
- persistence;
- route/handoff behavior.

Record limitations explicitly.
