# Widget development management, editing workflow, testing, and certification

This reference governs how agents plan, edit, verify, migrate, and maintain the widget system without losing working behavior.

## 1. Start with RECON, not editing

Before changing a widget or primitive:

1. read this skill;
2. identify the stable widget ID;
3. inspect registry min/default/max size and height;
4. locate the actual renderer;
5. locate widget-specific CSS;
6. locate primitive imports;
7. locate data/action adapters;
8. locate tests;
9. inspect current production/reference screenshots if available;
10. search relevant historical/prototype sources only after current ownership is understood.

Do not restore whole historical files to recover one idea.

## 2. Write the Widget Identity Brief

Required fields:

- ID/title;
- creator job;
- main input/output/action;
- signature component;
- signature interaction;
- data/action sources;
- minimum/default/maximum width;
- minimum/default/maximum height;
- invariant composition relationships;
- contraction behavior;
- expansion behavior;
- data states;
- integrations/handoffs;
- accessibility;
- certification targets.

For existing widgets, reconstruct this brief from current code before redesigning.

## 3. Write geometry equations before complex layout changes

Any multi-region composition should document linked dimensions.

Examples:

- `previewH = fieldA + gap + fieldB`
- `leftPanelH = 3*rowH + 2*gap`
- `iconBayW = controlH`
- `contentW = totalW - railW - gap`

Use shared CSS variables or grid math to implement the relationship.

## 4. Separate system changes from widget-specific changes

A bug affecting every widget primitive belongs in the primitive/token layer.

A behavior unique to one widget belongs in that widget.

Do not solve a local layout issue by changing global primitive geometry unless the defect is systemic.

Conversely, do not duplicate a global fix in ten widgets.

## 5. Primitive editing workflow

Before changing a primitive:

1. search all consumers;
2. inspect UI Reference Library representation;
3. inspect size/tone/state CSS;
4. inspect mobile/container rules;
5. inspect tests;
6. determine whether the change is additive, behavioral, or breaking;
7. preserve compatibility when possible;
8. update the UI Reference Library to consume the production implementation;
9. verify representative consumer widgets.

Primitive changes have a larger blast radius than widget changes.

## 6. CSS editing workflow

Use ownership order:

`tokens -> shell/grid -> primitives -> compound components -> widget-specific -> accessibility`

When a visual defect appears:

1. identify which layer should own the property;
2. find competing declarations;
3. fix the correct owner;
4. remove/avoid duplicate local overrides;
5. do not add more `!important` unless preserving an existing temporary compatibility contract that cannot yet be removed safely.

Record why a compatibility override still exists.

## 7. Registry editing workflow

Registry metadata is persisted behavior.

When changing min/default/max sizes or heights:

- verify every newly supported dimension;
- verify removed dimensions are not persisted without migration;
- keep stable IDs;
- update default dashboard rows only intentionally;
- update guide/help descriptions;
- update certification fixtures/tests.

Do not use registry category to drive a generic visual archetype.

## 8. Renderer editing workflow

Prefer one clear renderer owner per stable widget ID.

Heavy widgets should be lazy-loaded.

Inline legacy renderers can be extracted incrementally.

Do not duplicate renderer keys across base/new registries.

## 9. New widget build sequence

1. creator job;
2. identity brief;
3. current-owner overlap audit;
4. signature functional component design;
5. width/height state matrix;
6. composition equations;
7. primitive inventory;
8. data/action adapter;
9. states;
10. cross-tool handoffs;
11. accessibility;
12. implementation;
13. tests;
14. UI/mobile visual evidence;
15. certification;
16. documentation/help metadata.

## 10. Existing-widget redesign sequence

1. capture current behavior/visual baseline;
2. inventory working actions;
3. identify signature component;
4. identify private primitive drift;
5. identify layout equations;
6. migrate shared controls;
7. preserve domain behavior;
8. fix width/height adaptability;
9. verify data states;
10. remove obsolete CSS only after consumers are safe.

Never use “uniformity” as justification for deleting useful custom functionality.

## 11. Width × height test matrix

Every declared supported dimension is a public state.

At minimum verify:

- minimum width + minimum height;
- minimum width + default height;
- default width + minimum height;
- default/default;
- default width + maximum height;
- maximum width + default height;
- maximum/max;
- representative asymmetric states.

For wide ranges, automate fixtures or sample every bucket boundary plus known risk combinations.

## 12. Phone verification

Verify representative portrait widths:

- 320px;
- 375px;
- 390px;
- 430px;
- 767px boundary where relevant.

Also verify at least one phone landscape composition.

Check:

- full available outer width;
- no page-level horizontal overflow;
- deterministic selected height;
- title full-size/two-line behavior;
- header toggle visibility;
- complete button labels;
- touch interaction;
- internal scrolling;
- signature component recognition.

## 13. Visual alignment verification

Explicitly inspect:

- top/bottom matched-column edges;
- left/right matched-row edges;
- gap consistency;
- divider continuity;
- split-bay squares;
- border thickness;
- accidental double strokes;
- accidental double gaps;
- grid termination;
- title alignment;
- signature component alignment.

“Looks close” is not sufficient.

## 14. Functional verification

For every visible control:

- click/tap works;
- keyboard works where appropriate;
- state visibly changes;
- disabled behavior is clear;
- action produces intended result;
- loading/progress appears when necessary;
- error/recovery works;
- external/destructive action is confirmed when necessary.

## 15. Data-state verification

Exercise:

- loading;
- populated/ready;
- empty;
- disconnected;
- stale/imported;
- partial;
- error.

Do not certify using only happy-path mock data.

## 16. Accessibility verification

Check:

- semantic labels;
- keyboard navigation;
- focus visibility;
- `aria-pressed`, `aria-checked`, labels as applicable;
- contrast;
- touch target usability;
- reduced-motion compatibility;
- non-color encoding for meaning.

## 17. Performance verification

Watch for:

- eager heavy imports;
- excessive polling;
- observers while hidden/collapsed;
- large DOM lists;
- unnecessary animation;
- repeated expensive transforms;
- media loading when not visible.

A dashboard with many widgets multiplies per-widget overhead.

## 18. Contract tests

Use focused contract tests to prevent regression in:

- primitive size/type mapping;
- stable IDs;
- renderer coverage;
- min/default/max ordering;
- default dashboard references;
- mobile full-width rules;
- title/no-ellipsis rules;
- header toggle visibility;
- adaptive 24px behavior;
- split geometry;
- radio/checkbox state visuals;
- media aspect/upload contracts.

Prefer testing the invariant rather than a brittle implementation detail.

## 19. UI Reference Library verification

When a primitive changes:

- verify every size;
- verify tones;
- verify selected/active/disabled/focus;
- verify compound geometry;
- verify mobile;
- verify icons scale;
- verify no local reference-only CSS is masking a production defect.

## 20. Herald evidence

Visible changes require visual evidence.

Use the project’s Herald workflow and output contract.

At minimum record:

- before/after route;
- viewport;
- branch/SHA;
- changed files;
- test/build status;
- known limitations;
- preview/deployment URL when available.

A standalone HTML screenshot is reference evidence, not production proof.

## 21. Certification gates

A widget progresses through:

- IMPLEMENTED;
- DATA_CONNECTED;
- FUNCTIONAL;
- DATA_STATES;
- RESPONSIVE;
- MOBILE_VERIFIED;
- VISUALLY_CERTIFIED;
- ACCESSIBLE;
- PRODUCTION_VERIFIED;
- CANONICAL.

Registry `ready` is not equivalent to CANONICAL.

## 22. PR scope

Prefer small, coherent PRs.

Examples:

- primitive correction;
- one migration batch;
- one widget redesign;
- one mobile contract;
- one certification batch.

Do not combine unrelated data, auth, editor, and widget redesign work unless there is a documented dependency.

## 23. Main-branch safety

Do not overwrite main.

Before merge:

- compare branch to current main;
- if branch is substantially behind, rebuild/port onto a fresh current-main branch;
- resolve only intentional conflicts;
- rerun relevant verification;
- preserve newer main work.

## 24. Recovery and rollback

For significant redesigns preserve:

- stable ID;
- prior screenshots;
- previous commit/PR;
- migration notes;
- rollback path.

Do not delete old implementation/reference material until consumers and unique behavior have been reconciled.

## 25. Documentation update

When a widget materially changes:

- update registry/help descriptions if needed;
- update this skill if a new reusable rule was learned;
- update the UI Reference Library for reusable primitives;
- update current-widget inventory if IDs/titles/purposes/sizing changed;
- add new prototype/reference source to the atlas if it becomes important.

## 26. Completion checklist

Before saying “done”:

- [ ] creator job still clear;
- [ ] signature component present and functional;
- [ ] min/default/max states useful;
- [ ] width and height both adapt;
- [ ] composition equations hold;
- [ ] canonical primitives used;
- [ ] no new private global styles;
- [ ] titles never ellipsize;
- [ ] header toggles reachable;
- [ ] complete labels;
- [ ] mobile portrait/landscape checked;
- [ ] data states checked;
- [ ] actions checked;
- [ ] accessibility checked;
- [ ] focused tests pass;
- [ ] production build/status understood;
- [ ] visible evidence captured;
- [ ] docs/references updated;
- [ ] branch current enough to merge safely.
