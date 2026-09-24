# ViewTube Settings Frontend Blueprint

Date: 2026-09-24  
Status: Planning authority for the Settings frontend replacement.

This blueprint sits between the product spec and implementation tasks. It defines composition, density, hierarchy and primitive ownership. It does not change backend behavior.

## Structural thesis

Settings should behave like an operational control surface, not a marketing page.

The replacement removes:

- the large hero;
- repeated panel-intro cards;
- card-inside-card grouping;
- full-card boolean settings;
- simultaneous rendering of all billing plans;
- wide dashboard-widget cards.

The replacement uses one compact workspace shell and lets the control content dominate the viewport.

## Desktop topology

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ SETTINGS  [4/4 READY]  Next: Creator system ready          [search/quick]   │ 56-64
├───────────────┬──────────────────────────────────────────────────────────────┤
│ OVERVIEW      │ ACTIVE PANEL HEADER / STATUS / 1-2 DIRECT ACTIONS           │ 48-56
│ ACCOUNT       ├──────────────────────────┬───────────────────────────────────┤
│ AI RUNTIME    │ SUBTOOLBOX A             │ SUBTOOLBOX B                      │
│ DASHBOARD     │ dense control rows       │ dense control rows                │
│ EXPERIENCE    ├──────────────────────────┼───────────────────────────────────┤
│ PLAN+CREDITS  │ SUBTOOLBOX C             │ SUBTOOLBOX D                      │
│ DATA+PRIVACY  │                           │                                   │
│ HELP+LEGAL    │                           │                                   │
└───────────────┴──────────────────────────┴───────────────────────────────────┘
```

Desktop rules:

- settings rail target width: ~190-220px;
- rail rows use canonical L1 height, icon + title only;
- descriptions move to tooltip/help, not permanent rail copy;
- active panel canvas uses two columns at wide widths, one when content needs it;
- panel title is not repeated inside every first group;
- normal group gap uses canonical layout spacing, not 24px everywhere by habit.

## Narrow / tablet topology

```text
┌─────────────────────────────────────────────────────────────┐
│ SETTINGS [READINESS] [NEXT ACTION]                           │
├─────────────────────────────────────────────────────────────┤
│ [OVERVIEW][ACCOUNT][AI][DASHBOARD] ... horizontal/tabs     │
├─────────────────────────────────────────────────────────────┤
│ PANEL HEADER                                                 │
├─────────────────────────────────────────────────────────────┤
│ SUBTOOLBOX                                                   │
│ SUBTOOLBOX                                                   │
└─────────────────────────────────────────────────────────────┘
```

Use a canonical tab/split-dropdown solution depending on width. Do not keep a 200px side rail if it compresses the panel.

## Mobile portrait topology

```text
┌───────────────────────────────┐
│ SETTINGS   4/4 READY          │ 56 max
├───────────────────────────────┤
│ [ ACCOUNT              ▼ ]    │ 48 sticky selector
├───────────────────────────────┤
│ ACCOUNT STATUS                │
│ [connected] [@handle]         │ compact status strip
├───────────────────────────────┤
│ IDENTITY + CHANNEL        ±   │ SubToolbox
│  Channel                 ON   │ L1 row
│  Account             Manage   │ L1 row
│  Handle              @name    │ L1 row
├───────────────────────────────┤
│ ADVANCED ACCOUNT          +   │ collapsed by default
└───────────────────────────────┘
```

Mobile rules:

- top chrome before first actionable control <= 104px total;
- full-width top-level content with only standard page margin;
- no 2-column cards in portrait;
- no text truncation for section/group titles;
- explanatory copy defaults to one line or disclosure;
- repeated settings are single rows;
- advanced/destructive groups closed by default;
- sticky selector cannot overlap focused fields.

## Vertical budget

### Current pattern

Current Settings commonly spends vertical height on:

1. page hero;
2. hero readiness block;
3. hero next-action strip;
4. panel navigation;
5. panel card header;
6. card description;
7. padded card body;
8. nested action card.

The first useful control can appear well below the first viewport.

### Target pattern

Desktop:

- compact page strip: 56-64px;
- left rail: no vertical content penalty;
- active panel header/status: 48-56px;
- first control immediately follows.

Mobile portrait:

- compact page strip: <=56px;
- sticky selector: 48px;
- first panel control begins immediately after.

### Density defaults

- L0 / 56px: important group headers, high-value controls.
- L1 / 48px: default settings rows, selectors, standard actions.
- L2 / 32px: secondary metadata, badges, micro-actions.
- Avoid L0 for every row.
- Do not create arbitrary 72/88/104px repeated settings cards.

## Shared Settings composition components

These components own composition only; primitive geometry remains in the canonical primitive system.

### SettingsWorkspace

Responsibilities:

- application page shell;
- responsive nav placement;
- panel canvas;
- compact header/status;
- no business logic.

Must not:

- call auth, billing, AI or reset services;
- redefine button/input/switch geometry.

### SettingsPanelNav

Desktop:
- compact sticky left rail.

Narrow/mobile:
- tabs or split dropdown.

Data source:
- `settingsControlDeck` panel registry/aliases.

### SettingsPanelHeader

Contains only:

- panel title;
- one-line status/context;
- optional 1-2 high-frequency actions.

Do not put a second large hero inside a panel.

### SettingsGroup

Wrapper around `SubToolbox`.

Responsibilities:

- title/icon/palette;
- collapsed/open state;
- optional help disclosure.

### SettingsControlRow

Repeated single-setting composition.

Anatomy:

```text
[icon?]  LABEL
         short context/value                  [badge?] [control/action]
```

Default height: L1.

Use for:

- toggles;
- connect/disconnect state;
- notification preference;
- reset-history actions;
- simple links;
- current plan summary properties.

### SettingsStatusStrip

Use existing metric/badge/progress primitives.

Use for:

- readiness;
- credits;
- channel connection;
- current plan;
- current model.

## Panel blueprint

## 1. Overview

Default-open groups:

### Readiness strip

One compact strip:

- Account: Ready / Needs action
- YouTube: Connected / Not connected
- Billing: Active / Review
- Brain: Personalized / Needs context

Primitive candidates:
- `SubToolboxMetricStrip`
- `SubToolboxStatusBadge`
- `SubToolboxProgressValue`

### Next action

One L1 action row.

### System summaries

Two-column desktop / stack mobile:

- Creator identity
- Plan + credits
- Data source
- Workspace experience

Each summary is a compact row, not a card.

## 2. Account

### Identity + channel — open

Rows:

- ViewTube account status
- creator/channel identity
- YouTube connection
- handle
- reconnect/manage

### Public channel/source — conditional, open when relevant

Rows:

- ingest/source mode
- public handle input
- resolve action/status

### Advanced account — collapsed

Rows:

- disconnect
- account deletion entry point

Do not place deletion beside routine account controls.

## 3. AI Runtime

### Creator Brain — open

Rows:

- readiness/status
- open intake
- current context summary

### Model runtime — open

- `AIModelSelector` retained if it is still the canonical domain-specific control;
- wrap it in Settings group composition rather than redesigning the model logic.

### API key / BYOK — collapsed unless active/required

Rows:

- key input
- reveal/hide
- save
- status

## 4. Dashboard Widgets

### Toolbar — sticky inside panel when useful

One compact row or two-row mobile composition:

- search;
- category;
- show ready;
- show previews;
- hide all;
- reset.

### Widget rows

Each row:

```text
[color marker] TITLE  [READY/PREVIEW]                    [visibility switch]
               subtitle only when useful
```

Rules:

- row height L1/L0 depending on subtitle;
- one-column mobile;
- up to two columns desktop;
- no 3-column large cards;
- no widget preview rendering.

## 5. Experience

### Mobile navigation — open

Rows:
- compact top bar
- auto-hide
- edge swipe
- thumb-zone shortcuts

### Workspace continuity — open

Rows:
- orientation position
- page position
- sticky headers
- keyboard position
- toolbox state

### Desktop navigation — open

One segmented control / selectable list:
- Top
- Wide
- Thin
- Rail

Not four 118px cards.

### Quick Switcher — open

Rows:
- enable switcher
- recent destination history
- clear recent
- clear pins

## 6. Plan + Credits

### Current plan — open

Compact status + meter:
- plan;
- credits remaining;
- usage meter;
- manage billing.

### Change plan — collapsed by default

Selector:
- segmented/tab/dropdown depending width.

Selected plan detail:
- price;
- three concise benefits;
- one action.

Only one plan detail expanded at once.

### Top-ups — collapsed

Compact options + custom amount.

### Referral — collapsed

Referral status/input/action.

## 7. Data + Privacy

### Data source — open

- ingest mode;
- public handle if relevant;
- status.

### Export + backup — open

- export action;
- last status.

### Transparency — compact link row

### Recovery — collapsed

- soft clear;
- factory reset.

### Danger zone — collapsed and isolated

- delete account entry.

All destructive actions route through the existing typed-confirmation contract.

## 8. Help + Legal

Groups:

- Guides
- Policies
- Privacy
- Support
- Internal ops conditional link

Use compact list rows. If the number of destinations is high enough, add a single search field.

## Primitive selection rules

1. If a job exists in `TOOLBOX_COMPONENT_REGISTRY`, Settings must use that owner or an approved Studio wrapper.
2. Settings may create composition components, not primitive geometry.
3. `StandardButton` and `StandardInput` are not the target authority for the redesign.
4. Prefer:
   - `SubToolboxSettingsSwitch`
   - `SubToolboxSegmentedToggle`
   - `SubToolboxStatusBadge`
   - `SubToolboxProgressValue`
   - `SubToolboxMeter`
   - `SubToolboxSelectableListRow`
   - `SubToolboxTabs`
   - `SubToolboxDisclosure`
   - `SubToolboxDialog`
   - `SubToolboxStatePanel`
   - `SubToolboxSkeleton`
   - `SubToolboxTooltip`
   - `SubToolboxSplitDropdown`
   - current `StudioInput` / `StudioTextArea` / `StudioButton` wrappers where they are the established public application layer.
5. No Settings-specific control family should be added unless the registry demonstrably lacks the job.

## Color and emphasis

Settings uses the existing 12-color palette and panel/group palette assignment.

Color pop must communicate one of:

- active section;
- connected/ready;
- warning/attention;
- destructive;
- selected plan/layout;
- primary action.

Do not give each card a different accent merely to decorate the page.

## State matrix

Every migrated panel must cover relevant states:

- default;
- hover;
- focus;
- selected/on;
- disabled;
- loading/pending;
- success;
- error;
- disconnected;
- empty;
- destructive confirmation.

## Migration rule

Do not replace all panels in one PR.

Each migration PR should leave:

- route working;
- backend behavior working;
- old panel or new panel, never a partially duplicated hybrid;
- zero new primitive geometry;
- targeted screenshots for that panel.

## Acceptance snapshot matrix

At minimum:

| Surface | Desktop | Mobile portrait | Mobile landscape |
| --- | --- | --- | --- |
| Overview | yes | yes | yes |
| Account connected | yes | yes | yes |
| Account disconnected | yes | yes | optional |
| AI | yes | yes | yes |
| Dashboard Widgets | yes | yes | yes |
| Experience | yes | yes | yes |
| Billing | yes | yes | yes |
| Data + Privacy | yes | yes | yes |
| Help + Legal | yes | yes | optional |
| Danger confirmation | yes | yes | yes |

## Anti-goals

- no new Settings mini-design-system;
- no giant header;
- no nested module-inside-module chrome;
- no backend rewrite;
- no new pricing/business logic;
- no new persistence layer;
- no excessive animation;
- no text that only explains what a nearby control already says;
- no desktop-only composition that is later stacked mechanically on mobile.
