# SOURCE_COMPONENT_MAP

Traceability matrix: source -> destination page -> toolbox/subtoolbox.

## Source A: `/Users/cwb/Downloads/4 sections.txt`
- Destination page: `section-sources-lab`
- Main toolboxes:
  - `Section C + E Intake`
  - `Toolbox Component Set 1 Intake`
  - `Shim Intake`
  - `UStube UI Kit Intake`

## Source B: `/Users/cwb/Downloads/viewtube/toolbox_component_set_1.html`
- Destination page: `section-sources-lab`
- Subtoolboxes (planned):
  - Display + Misc
  - Cards + Variance
  - Accordion + Menu
  - Stepper + Timeline
  - Navigation + Pagination
  - Feedback + Status
  - Toggles + Color Picker
  - Text Fields
  - Buttons + Actions

### Detailed Trace Rows (current pass)
| Source | Source Segment | Destination Page | Main Toolbox | Subtoolbox |
| --- | --- | --- | --- | --- |
| `4 sections.txt` | Section C + E intake list | `section-sources-lab` | `SECTION SOURCES LAB` | `Section C + E Intake` |
| `toolbox_component_set_1.html` | display/misc + feedback + toggles + text fields + buttons | `section-sources-lab` | `TOOLBOX_COMPONENT_SET_1 INGEST` | `Mapped Components` |
| `shim.html` | complex controls + hook retention + tactile + console dashboard | `section-sources-lab` | `SHIM INGEST` | `Mapped Components` |
| `ustube-ui-kit (3).html` | analytics + algorithm + keyword + strategy + input/task/dialog systems | `section-sources-lab` | `USTUBE UI KIT INGEST` | `Mapped Components` |
| `GRAPHS_AND_CHARTS_REPORT.html` | chart families | `chart-catalog` | grouped family toolboxes | per-family cards |
| `COMPLETE_CHART_SPECIFICATION.md` | complete class list | `chart-spec-implementation` | `SPEC CLASS GRID` | one card per class |

## Source C: `/Users/cwb/Downloads/viewtube/shim.html`
- Destination page: `section-sources-lab`
- Subtoolboxes (planned):
  - Data Visualization
  - Complex Controls
  - Hook Retention
  - Tactile Hardware
  - Console Dashboards

## Source D: `/Users/cwb/Downloads/ustube-ui-kit (3).html`
- Destination page: `section-sources-lab`
- Subtoolboxes (planned):
  - Analytics Toolbox
  - Algorithm Architect
  - Keyword Research
  - Strategy Chat
  - Input Fields + Sliders + Toggles
  - Button Systems + Tasks + Goals
  - Loading + Dialogs + Notifications

## Source E: `docs/GRAPHS_AND_CHARTS_REPORT.html`
- Destination page: `chart-catalog`
- Mapping rule: one working chart variant per chart family category.
- Implemented categories:
  - Annotation, Area, Bar, Bubble, Calendar, Candlestick, Column, Combo, Diff
  - Donut, Gantt, Gauge, GeoCharts, Histograms, Intervals, Line, Maps
  - Org, Pie, Sankey, Scatter, Stepped Area, Table, Timelines
  - Tree Map, Trendlines, VegaChart, Waterfall, Word Trees

## Source F: `docs/COMPLETE_CHART_SPECIFICATION.md`
- Destination page: `chart-spec-implementation`
- Mapping rule: canonical implementation per chart class bound to canonical analytics selectors.

## Consolidated Page Outputs
- `section-sources-lab`: 4 collapsed main toolboxes, each with mapped subtoolboxes + source preview iframe.
- `component-catalog`: grouped non-chart interactive component catalog.
- `chart-catalog`: grouped chart-family catalog wired to canonical selectors.
- `chart-spec-implementation`: one implementation card per chart class in specification list.
- `toolbox-recreation`: recreated high-level toolbox structures using unified toolbox primitives.

## 2026-04-08 Recovery Pass Addendum (append-only)

### Source-Scoped Module Runtime Layer
- New internal source module surface: `src/views/referenceStudio/sourceModules.tsx`
- Runtime consumers (no `NativeUIKit` dependency in these pages):
  - `src/views/referenceStudio/SectionSourcesLab.tsx`
  - `src/views/referenceStudio/ComponentCatalog.tsx`
  - `src/views/referenceStudio/ToolboxRecreation.tsx`

### Updated Destination Mapping (exact page-level)
| Source | Destination Page | Main Toolbox | Subtoolbox Buckets |
| --- | --- | --- | --- |
| `4 sections.txt` + Section C/E extraction directives | `section-sources-lab` | `SECTION C + E INTAKE` | Controls, Inputs, Navigation, Feedback/Status, Cards/Media, Dialogs/Popups, Trees/Structure, Source Preview |
| `toolbox_component_set_1.html` | `section-sources-lab` | `TOOLBOX_COMPONENT_SET_1 INGEST` | SET1 Controls, SET1 Inputs, SET1 Navigation, SET1 Feedback/Status, SET1 Cards/Media, SET1 Dialogs/Popups, SET1 Trees/Structure, Source Preview |
| `shim.html` | `section-sources-lab` | `SHIM INGEST` | SHIM Controls, SHIM Inputs, SHIM Navigation, SHIM Feedback/Status, SHIM Cards/Media, SHIM Dialogs/Popups, SHIM Trees/Structure, Source Preview |
| `ustube-ui-kit (3).html` | `section-sources-lab` | `USTUBE UI KIT INGEST` | USTUBE Controls, USTUBE Inputs, USTUBE Navigation, USTUBE Feedback/Status, USTUBE Cards/Media, USTUBE Dialogs/Popups, USTUBE Trees/Structure, Source Preview |

### Preview Target Correction
- Section Sources first source preview now targets `/reference-studio/library` for reference-library fidelity (not phone/app-shell reproduction route).

## 2026-04-08 Component-Level Traceability Ledger (append-only)
- Generated from runtime source contracts in `src/views/referenceStudio/sourceModules.tsx`.
- Coverage: 78/78 requested `SourceComponentId` items currently mapped.
| Source Item ID | Source Artifact | Destination Page | Main Toolbox | Subtoolbox | Title |
| --- | --- | --- | --- | --- | --- |
| `ce_analytics_protocol` | 4 sections.txt (Section C/E directives) | `section-sources-lab` | SECTION C + E INTAKE | SECTIONCE · Controls | Section C · Analytics Protocol |
| `ce_viral_passing` | 4 sections.txt (Section C/E directives) | `section-sources-lab` | SECTION C + E INTAKE | SECTIONCE · Controls | Section C · Viral Passing |
| `ce_audience_matrix` | 4 sections.txt (Section C/E directives) | `section-sources-lab` | SECTION C + E INTAKE | SECTIONCE · Feedback/Status | Section C · Audience Matrix |
| `ce_retention_pulse` | 4 sections.txt (Section C/E directives) | `section-sources-lab` | SECTION C + E INTAKE | SECTIONCE · Feedback/Status | Section C · Retention Pulse |
| `ce_thumbnail_studio` | 4 sections.txt (Section C/E directives) | `section-sources-lab` | SECTION C + E INTAKE | SECTIONCE · Inputs | Section C · Thumbnail Studio |
| `ce_storyboard_planner` | 4 sections.txt (Section C/E directives) | `section-sources-lab` | SECTION C + E INTAKE | SECTIONCE · Navigation | Section C · Storyboard Planner |
| `ce_asset_vault` | 4 sections.txt (Section C/E directives) | `section-sources-lab` | SECTION C + E INTAKE | SECTIONCE · Cards/Media | Section C · Asset Vault |
| `ce_media_analyzer` | 4 sections.txt (Section C/E directives) | `section-sources-lab` | SECTION C + E INTAKE | SECTIONCE · Cards/Media | Section C · Media Analyzer |
| `ce_user_feedback` | 4 sections.txt (Section C/E directives) | `section-sources-lab` | SECTION C + E INTAKE | SECTIONCE · Feedback/Status | Section C · User Feedback |
| `ce_hook_architect` | 4 sections.txt (Section C/E directives) | `section-sources-lab` | SECTION C + E INTAKE | SECTIONCE · Controls | Section C · Hook Architect |
| `ce_box02_graphic` | 4 sections.txt (Section C/E directives) | `section-sources-lab` | SECTION C + E INTAKE | SECTIONCE · Controls | Section E Box 02 · Graphic |
| `ce_box02_minimalist` | 4 sections.txt (Section C/E directives) | `section-sources-lab` | SECTION C + E INTAKE | SECTIONCE · Controls | Section E Box 02 · Minimalist |
| `ce_box02_cinematic` | 4 sections.txt (Section C/E directives) | `section-sources-lab` | SECTION C + E INTAKE | SECTIONCE · Controls | Section E Box 02 · Cinematic |
| `ce_box04_toggles` | 4 sections.txt (Section C/E directives) | `section-sources-lab` | SECTION C + E INTAKE | SECTIONCE · Controls | Section E Box 04 · Toggles |
| `ce_box04_checkboxes` | 4 sections.txt (Section C/E directives) | `section-sources-lab` | SECTION C + E INTAKE | SECTIONCE · Controls | Section E Box 04 · Checkboxes |
| `ce_box04_radios` | 4 sections.txt (Section C/E directives) | `section-sources-lab` | SECTION C + E INTAKE | SECTIONCE · Controls | Section E Box 04 · Radios |
| `ce_box05_channel_url` | 4 sections.txt (Section C/E directives) | `section-sources-lab` | SECTION C + E INTAKE | SECTIONCE · Inputs | Section E Box 05 · Channel URL |
| `ce_box05_category` | 4 sections.txt (Section C/E directives) | `section-sources-lab` | SECTION C + E INTAKE | SECTIONCE · Inputs | Section E Box 05 · Category Dropdown |
| `ce_box05_daily_stats` | 4 sections.txt (Section C/E directives) | `section-sources-lab` | SECTION C + E INTAKE | SECTIONCE · Inputs | Section E Box 05 · Daily Stats |
| `ce_box09_kpi_cards` | 4 sections.txt (Section C/E directives) | `section-sources-lab` | SECTION C + E INTAKE | SECTIONCE · Feedback/Status | Section E Box 09 · Six KPI Cards |
| `ce_box13_sidebar_nav` | 4 sections.txt (Section C/E directives) | `section-sources-lab` | SECTION C + E INTAKE | SECTIONCE · Navigation | Section E Box 13 · Sidebar Navigation |
| `ce_box14_collapsible_tree` | 4 sections.txt (Section C/E directives) | `section-sources-lab` | SECTION C + E INTAKE | SECTIONCE · Trees/Structure | Section E Box 14 · Collapsible Tree |
| `ce_box17_sync_tooltip` | 4 sections.txt (Section C/E directives) | `section-sources-lab` | SECTION C + E INTAKE | SECTIONCE · Dialogs/Popups | Section E Box 17 · Sync Tooltip |
| `ce_box18_modal_dialog` | 4 sections.txt (Section C/E directives) | `section-sources-lab` | SECTION C + E INTAKE | SECTIONCE · Dialogs/Popups | Section E Box 18 · Modal Dialog Button |
| `ce_box22_video_cards` | 4 sections.txt (Section C/E directives) | `section-sources-lab` | SECTION C + E INTAKE | SECTIONCE · Cards/Media | Section E Box 22 · First Two Video Cards |
| `ce_box22_status_pills` | 4 sections.txt (Section C/E directives) | `section-sources-lab` | SECTION C + E INTAKE | SECTIONCE · Cards/Media | Section E Box 22 · Live/Scheduled/Draft Pills |
| `ce_vault_module` | 4 sections.txt (Section C/E directives) | `section-sources-lab` | SECTION C + E INTAKE | SECTIONCE · Trees/Structure | Toolbox Baseline · Vault Module |
| `set1_checker_avatars_swatches` | toolbox_component_set_1.html | `section-sources-lab` | TOOLBOX_COMPONENT_SET_1 INGEST | TOOLBOXSET · Cards/Media | Display/Misc · Checker + Avatars + Swatches |
| `set1_tags_chips_separators` | toolbox_component_set_1.html | `section-sources-lab` | TOOLBOX_COMPONENT_SET_1 INGEST | TOOLBOXSET · Cards/Media | Display/Misc · Tags + Chips + Separators |
| `set1_jdmkrs_overlap` | toolbox_component_set_1.html | `section-sources-lab` | TOOLBOX_COMPONENT_SET_1 INGEST | TOOLBOXSET · Cards/Media | Cards/Variance · JDMKRS Overlap Circles |
| `set1_accordions` | toolbox_component_set_1.html | `section-sources-lab` | TOOLBOX_COMPONENT_SET_1 INGEST | TOOLBOXSET · Dialogs/Popups | Accordion/Menu · What is this + How does it work |
| `set1_dividers_marquee` | toolbox_component_set_1.html | `section-sources-lab` | TOOLBOX_COMPONENT_SET_1 INGEST | TOOLBOXSET · Dialogs/Popups | Accordion/Menu · Dividers + Marquee |
| `set1_horizontal_stepper` | toolbox_component_set_1.html | `section-sources-lab` | TOOLBOX_COMPONENT_SET_1 INGEST | TOOLBOXSET · Navigation | Stepper/Timeline · Horizontal Stepper |
| `set1_timeline` | toolbox_component_set_1.html | `section-sources-lab` | TOOLBOX_COMPONENT_SET_1 INGEST | TOOLBOXSET · Navigation | Stepper/Timeline · Timeline |
| `set1_pagination` | toolbox_component_set_1.html | `section-sources-lab` | TOOLBOX_COMPONENT_SET_1 INGEST | TOOLBOXSET · Navigation | Navigational Components · Pagination |
| `set1_download_upload_storage_meters` | toolbox_component_set_1.html | `section-sources-lab` | TOOLBOX_COMPONENT_SET_1 INGEST | TOOLBOXSET · Feedback/Status | Feedback/Status · Download/Upload/Storage Meters |
| `set1_low_mid_high_meters` | toolbox_component_set_1.html | `section-sources-lab` | TOOLBOX_COMPONENT_SET_1 INGEST | TOOLBOXSET · Feedback/Status | Feedback/Status · Low/Mid/High Meters |
| `set1_small_big_slider` | toolbox_component_set_1.html | `section-sources-lab` | TOOLBOX_COMPONENT_SET_1 INGEST | TOOLBOXSET · Feedback/Status | Feedback/Status · Small + Big Slider |
| `set1_loading_circles` | toolbox_component_set_1.html | `section-sources-lab` | TOOLBOX_COMPONENT_SET_1 INGEST | TOOLBOXSET · Feedback/Status | Feedback/Status · Loading Circles |
| `set1_progress_rings` | toolbox_component_set_1.html | `section-sources-lab` | TOOLBOX_COMPONENT_SET_1 INGEST | TOOLBOXSET · Feedback/Status | Feedback/Status · Progress Rings |
| `set1_top_toggle` | toolbox_component_set_1.html | `section-sources-lab` | TOOLBOX_COMPONENT_SET_1 INGEST | TOOLBOXSET · Controls | Toggles · Top Toggle |
| `set1_color_picker_stack` | toolbox_component_set_1.html | `section-sources-lab` | TOOLBOX_COMPONENT_SET_1 INGEST | TOOLBOXSET · Controls | Toggles · Color Picker Stack |
| `set1_multiline` | toolbox_component_set_1.html | `section-sources-lab` | TOOLBOX_COMPONENT_SET_1 INGEST | TOOLBOXSET · Inputs | Text Fields · Multiline |
| `set1_editable_text` | toolbox_component_set_1.html | `section-sources-lab` | TOOLBOX_COMPONENT_SET_1 INGEST | TOOLBOXSET · Inputs | Text Fields · Editable Text |
| `set1_single_buttons` | toolbox_component_set_1.html | `section-sources-lab` | TOOLBOX_COMPONENT_SET_1 INGEST | TOOLBOXSET · Controls | Buttons & Actions · Single Button Collection |
| `shim_pink_loading_bar` | shim.html | `section-sources-lab` | SHIM INGEST | SHIM · Feedback/Status | Data Visualization · Pink Loading Bar |
| `shim_live_status` | shim.html | `section-sources-lab` | SHIM INGEST | SHIM · Feedback/Status | Data Visualization · Live Status |
| `shim_system_operational` | shim.html | `section-sources-lab` | SHIM INGEST | SHIM · Feedback/Status | Data Visualization · System Operational |
| `shim_complex_controls` | shim.html | `section-sources-lab` | SHIM INGEST | SHIM · Controls | Complete Complex Controls Toolbox |
| `shim_hook_retention` | shim.html | `section-sources-lab` | SHIM INGEST | SHIM · Inputs | Hook Retention Box |
| `shim_hover_me` | shim.html | `section-sources-lab` | SHIM INGEST | SHIM · Dialogs/Popups | Hover Me Box |
| `shim_tactile_hardware` | shim.html | `section-sources-lab` | SHIM INGEST | SHIM · Trees/Structure | Tactile Hardware Toolbox |
| `shim_console_matrix` | shim.html | `section-sources-lab` | SHIM INGEST | SHIM · Cards/Media | Console Dashboards · 4-Unit Matrix |
| `shim_console_media_strip` | shim.html | `section-sources-lab` | SHIM INGEST | SHIM · Cards/Media | Console Dashboards · 2-Unit Media Strip |
| `ustube_analytics_toolbox` | ustube-ui-kit (3).html | `section-sources-lab` | USTUBE UI KIT INGEST | USTUBE · Controls | UStube Analytics Toolbox |
| `ustube_algorithm_architect` | ustube-ui-kit (3).html | `section-sources-lab` | USTUBE UI KIT INGEST | USTUBE · Controls | Algorithm Architect Toolbox |
| `ustube_keyword_research` | ustube-ui-kit (3).html | `section-sources-lab` | USTUBE UI KIT INGEST | USTUBE · Controls | Keyword Research Toolbox |
| `ustube_strategy_chat` | ustube-ui-kit (3).html | `section-sources-lab` | USTUBE UI KIT INGEST | USTUBE · Controls | Strategy Chat Toolbox |
| `ustube_impressions_trend` | ustube-ui-kit (3).html | `section-sources-lab` | USTUBE UI KIT INGEST | USTUBE · Cards/Media | Impressions Trend |
| `ustube_views_histogram` | ustube-ui-kit (3).html | `section-sources-lab` | USTUBE UI KIT INGEST | USTUBE · Cards/Media | Views Histogram |
| `ustube_revenue_distribution` | ustube-ui-kit (3).html | `section-sources-lab` | USTUBE UI KIT INGEST | USTUBE · Cards/Media | Revenue Distribution |
| `ustube_performance_bin` | ustube-ui-kit (3).html | `section-sources-lab` | USTUBE UI KIT INGEST | USTUBE · Cards/Media | Performance Bin |
| `ustube_ability_vectors` | ustube-ui-kit (3).html | `section-sources-lab` | USTUBE UI KIT INGEST | USTUBE · Cards/Media | Ability Vectors |
| `ustube_hook_effectiveness` | ustube-ui-kit (3).html | `section-sources-lab` | USTUBE UI KIT INGEST | USTUBE · Controls | Hook Effectiveness Box |
| `ustube_inputs_four` | ustube-ui-kit (3).html | `section-sources-lab` | USTUBE UI KIT INGEST | USTUBE · Inputs | Input Fields · Four Inputs |
| `ustube_resizable_description` | ustube-ui-kit (3).html | `section-sources-lab` | USTUBE UI KIT INGEST | USTUBE · Inputs | Input Fields · Resizable Description |
| `ustube_add_input_button` | ustube-ui-kit (3).html | `section-sources-lab` | USTUBE UI KIT INGEST | USTUBE · Inputs | Input Fields · Add Button |
| `ustube_sliders_three` | ustube-ui-kit (3).html | `section-sources-lab` | USTUBE UI KIT INGEST | USTUBE · Inputs | Sliders · Three |
| `ustube_toggles_two` | ustube-ui-kit (3).html | `section-sources-lab` | USTUBE UI KIT INGEST | USTUBE · Inputs | Toggles · Two |
| `ustube_button_small_cyan` | ustube-ui-kit (3).html | `section-sources-lab` | USTUBE UI KIT INGEST | USTUBE · Controls | Button System · Small Cyan |
| `ustube_button_small_lime` | ustube-ui-kit (3).html | `section-sources-lab` | USTUBE UI KIT INGEST | USTUBE · Controls | Button System · Small Lime |
| `ustube_hover_tip_button` | ustube-ui-kit (3).html | `section-sources-lab` | USTUBE UI KIT INGEST | USTUBE · Dialogs/Popups | Button System · Hover Tip |
| `ustube_tasks_with_strike` | ustube-ui-kit (3).html | `section-sources-lab` | USTUBE UI KIT INGEST | USTUBE · Trees/Structure | Tasks Box · Checkboxes with strike-through |
| `ustube_channel_goals_progress` | ustube-ui-kit (3).html | `section-sources-lab` | USTUBE UI KIT INGEST | USTUBE · Trees/Structure | Channel Goals · Progress Bars |
| `ustube_video_manager_box` | ustube-ui-kit (3).html | `section-sources-lab` | USTUBE UI KIT INGEST | USTUBE · Navigation | Video Manager Box |
| `ustube_content_calendar_box` | ustube-ui-kit (3).html | `section-sources-lab` | USTUBE UI KIT INGEST | USTUBE · Navigation | Content Calendar Box |
| `ustube_loading_states` | ustube-ui-kit (3).html | `section-sources-lab` | USTUBE UI KIT INGEST | USTUBE · Feedback/Status | Loading States · Bars/Circles/Dots |
| `ustube_dialog_notifications` | ustube-ui-kit (3).html | `section-sources-lab` | USTUBE UI KIT INGEST | USTUBE · Dialogs/Popups | Dialog + Notifications |

## 2026-04-10 Final Closeout Mapping Addendum (append-only)

### Updated strict-fidelity module upgrades (same IDs, richer source-aligned behavior)
- `ce_thumbnail_studio`: upgraded from static header stand-in to interactive input + palette block.
- `ce_media_analyzer`: upgraded to histogram + status signal composition.
- `ce_box04_radios`: now uses interactive radio/toggle block contract.
- `set1_low_mid_high_meters`: upgraded from pill-only display to meter module.
- `shim_live_status`, `shim_system_operational`: upgraded to explicit status signal cards.
- `shim_hook_retention`: upgraded to interactive retention slider/progress rig.
- `ustube_algorithm_architect`, `ustube_keyword_research`, `ustube_strategy_chat`: upgraded to richer algorithm/keyword/chat interaction modules.
- `ustube_views_histogram`, `ustube_revenue_distribution`, `ustube_performance_bin`, `ustube_ability_vectors`: upgraded to family-specific histogram/distribution/vector-style cards.
- `ustube_video_manager_box`: upgraded from shell stand-in to interactive video-manager-lite card stack.

### Status
- Mapping coverage remains 78/78 IDs.
- Destination pages unchanged (`section-sources-lab`, `component-catalog`, `toolbox-recreation`), but per-ID render fidelity improved.

## 2026-04-11 Widget + 4sections Authority Addendum (append-only)

- `4sections.txt` at repo root is now treated as authoritative extraction brief for unresolved section ingestion checks.
- Added Reference Studio destination tab mapping for widget R&D source promotion:
  - Source: `widget-preview.html`
  - Destination Tab: `widget-lab`
  - Stage Contract: Stage A (preview ingestion) -> Stage B (typed React module conversion) -> Stage C (feature-flag rollout to dashboard)
- Widget status contracts added for initial set (`milestone`, `engagement-grade`, `consistency-heatmap`, `audience-stack`, `settings-brutalist`, `reddit-strategist`, `audiophonic-engine`, `thumbnail-ab`, `copyright-risk`, `community-architect`).

## 2026-04-11 UI Scope Addendum (append-only)
- Destination mapping coverage unchanged in this patch.
- Shell/toggle behavior for mapped destinations was updated to canonical Reference Studio scoped primitives (4-arrow animated indicator + scoped shadow tokens) without changing per-component source IDs.
  - Evidence path: `/Users/cwb/Downloads/viewtube/src/views/referenceStudio/ReferenceStudioPrimitives.tsx`
