# Widget design doctrine and utility

This reference governs how to invent and improve ViewTube widgets as tools.

## Core doctrine

A widget is a purpose-built creator instrument. Shared ViewTube primitives make the system coherent; they do not make every widget identical.

Never begin by forcing a widget into a predefined archetype. Registry categories and old archetype labels are metadata/pattern references only.

Every widget must answer:

1. What creator job does it perform?
2. What is its primary input?
3. What is its primary output?
4. What is the main action?
5. What makes the widget immediately recognizable?
6. How does its composition visually explain the job?
7. What can the user do directly without leaving the widget?
8. What additional value appears when the widget is enlarged?
9. What remains useful when it is contracted?
10. What should hand off to/from other ViewTube systems?

## Signature component requirement

Every widget requires at least one signature functional element.

A signature element may be:

- a purpose-built compound control;
- a visual data instrument;
- an interactive field;
- a queue;
- a timeline;
- a matrix;
- a progress/trajectory system;
- a node/network system;
- a ranked video stack;
- a comparison field;
- a generation/preview system;
- a synchronization controller;
- a scheduling lane;
- an asset composition;
- a radar, map, heat field, funnel, fingerprint, or other domain-specific visual;
- a custom editor/manipulator.

It must:

- be specific to the widget's creator job;
- visually communicate function;
- directly help complete the task;
- remain conceptually recognizable across supported sizes;
- be functional, not a decorative diagram.

A user should be able to infer the widget's purpose from the interior before opening help.

## Shared shell, unique interior

Use the rule:

> Uniform shell + uniform primitives + unique functional interior.

Do not redesign specialized widgets into generic cards for visual consistency.

Do not use generic cards as a substitute for tool design.

Do not put explanatory diagrams in the main layout unless they are themselves functional. Explanations belong behind the `?` help control.

## Utility-first feature design

Build from the creator's decision/action backward.

Every visible element should help the user:

- understand something;
- compare something;
- decide something;
- manipulate something;
- create something;
- fix something;
- send/save/export something;
- monitor something important.

If an element has no clear contribution, remove or demote it.

## Primary-action hierarchy

Each widget should expose one obvious primary action or primary interaction.

Supporting actions should be visually subordinate.

Avoid six equal-looking buttons competing for attention.

Prefer a workflow such as:

`input -> configure -> inspect -> execute/generate -> review -> revise -> send/save/export`

The layout should make that sequence understandable.

## Defaults and continuity

A useful widget should not require setup every time.

Where appropriate preserve:

- filters;
- sort;
- time window;
- selected video;
- selected asset;
- prompt settings;
- panel state;
- draft content;
- comparison target;
- current page/mode.

Use sensible defaults so the widget is useful before customization.

## Progressive complexity

The smallest/default view should expose the primary workflow.

Advanced capability can appear through:

- larger widget dimensions;
- disclosures;
- page/mode toggles;
- contextual actions;
- expanded detail;
- larger signature component;
- additional visible rows/data/history.

Do not make the default state unnecessarily complex.

## Direct manipulation

Prefer direct manipulation when it makes the creator's intention clearer.

Examples:

- drag a timeline marker;
- resize a crop;
- reorder assets;
- scrub a preview;
- select a region;
- move a threshold;
- adjust a dial;
- manipulate a node;
- drag schedule items.

Use ordinary fields only when they are more efficient.

## Immediate feedback

Controls should visibly affect the related state/preview/data as directly as practical.

A user should be able to answer:

- What is selected?
- What period/data am I seeing?
- What is active?
- What changed?
- Is the data live, imported, stale, partial, or unavailable?
- What happens if I press the main action?

## Comparison as a capability

Consider comparison whenever it improves a creator decision:

- current vs previous;
- video vs channel;
- video A vs video B;
- thumbnail A vs B;
- actual vs target;
- before vs after;
- format vs format;
- segment vs segment;
- published vs draft.

Do not add comparison merely for decoration.

## Analytics should lead to action

Where appropriate connect insight to an action.

Examples:

- weak thumbnail -> open thumbnail workflow;
- retention drop -> open video diagnosis/editor;
- audience request -> send to project pipeline;
- traffic source opportunity -> generate packaging or content idea;
- anomaly -> explain/evidence/next action;
- comment pattern -> draft response or video recommendation.

Do not stop at a passive metric when a useful follow-up is obvious.

## Cross-tool handoff

Widgets should participate in the larger ViewTube workflow.

Possible destinations/sources include:

- Studio Hub;
- Projects;
- Creator Canvas;
- Vault;
- Video Editor;
- Publisher;
- Brain;
- Analytics;
- Packaging/Asset Engine;
- Community tools;
- Video Manager;
- scheduling/calendar.

Use typed/contextual handoffs where current architecture supports them.

## AI inside widgets

AI should be embedded into the widget's actual job.

Give it relevant:

- widget state;
- selected video/asset/project;
- canonical analytics evidence;
- channel profile;
- user intent;
- current workflow step.

Good AI widget actions include:

- explain anomaly;
- rank candidates;
- generate alternatives;
- rewrite packaging;
- suggest next action;
- summarize evidence;
- generate a specific artifact.

Avoid adding a generic chat box when a domain-specific action is more useful.

## Safe experimentation

Consequential tools should provide appropriate:

- undo;
- reset;
- restore defaults;
- draft preservation;
- replace/remove;
- confirmation for destructive/external actions;
- clear recovery on error.

Make experimentation safe.

## Empty/disconnected/error states are still tools

Do not erase the widget and replace it with a blank error card.

Preserve the recognizable composition where possible and explain:

- what is missing;
- what still works;
- what connection/data is needed;
- the best next action.

## Bidirectional usefulness

When space expands, increase useful capability rather than whitespace:

- larger primitives;
- larger preview/canvas;
- more history/data points;
- richer labels;
- more comparison;
- more visible assets;
- secondary controls;
- additional context/evidence.

When space contracts, remove/detail-reduce in this order:

1. decorative detail;
2. tertiary metadata;
3. supporting copy;
4. low-priority statistics;
5. tertiary actions;
6. secondary actions;
7. signature-component detail.

Do not remove the signature component or primary action until the widget reaches its documented unsupported minimum.

## 25 optimization prompts

Before finishing a widget, ask:

1. Can the primary task be completed with fewer steps?
2. Can a sensible default remove a configuration step?
3. Can the widget remember a useful prior choice?
4. Can one action operate on multiple selected items?
5. Can batch operation reduce repetition?
6. Can a preview make the result safer to execute?
7. Can the widget show cause/effect sooner?
8. Can a direct manipulation replace a field?
9. Can comparison improve the decision?
10. Can history or trend context improve confidence?
11. Can evidence/provenance explain an AI suggestion?
12. Can the widget surface a useful anomaly automatically?
13. Can an alert be actionable instead of informational?
14. Can the output hand off to another ViewTube tool?
15. Can the widget accept context from another tool?
16. Can repetitive settings become presets?
17. Can advanced controls stay hidden until needed?
18. Can a destructive action be safely reversible?
19. Can disconnected mode still provide partial utility?
20. Can imported data keep the tool useful offline?
21. Can keyboard/touch interaction be faster?
22. Can the signature component explain the workflow more clearly?
23. Can larger sizes expose genuinely more value?
24. Can smaller sizes preserve the same mental model?
25. What would make this tool 10× more useful without making it 10× more complicated?

## Failure conditions

A widget is not finished if:

- it looks like a generic template with different text;
- the signature component is merely decorative;
- it is useful only at one size;
- expansion only adds whitespace;
- contraction removes the main function too early;
- the user cannot tell what state/data is active;
- it displays insight without any reasonable follow-up when one exists;
- its primary action is visually indistinguishable from tertiary actions;
- it duplicates another widget's creator job without a clear reason.


## Local fix containment

A widget-specific problem should remain widget-specific unless the proposed shared change is independently correct for the whole dashboard system.

Before changing shared shell/primitive CSS during one-widget work, perform a blast-radius review:

- other widget consumers;
- title/header behavior;
- primitive size/type behavior;
- mobile/portrait rules;
- focus/state behavior;
- touch/coarse-pointer behavior;
- test coverage.

Do not weaken a system invariant merely to make one complex widget fit.

## Density versus fitting

Do not confuse these:

- **Density** changes the scale/detail of an entire region.
- **Adaptive text fit** preserves one control's geometry while fitting a complete label.

A complex widget may simultaneously use compact navigation, standard inputs, and an expanded signature component.

Do not apply widget-wide compact density because a few long buttons are crowded.

## Duplicate navigation and action audit

Constrained layouts should not carry every desktop accelerator.

Before shrinking essential controls, identify duplicates:

- repeated generic actions in header/body/footer;
- full selector plus full quick-switch strip;
- multiple links to the same destination;
- redundant summary/control surfaces.

Keep one persistent primary control and retain contextual duplicates only when they perform a distinct job.

Remove redundant accelerators before shrinking or reflowing the main workflow.
