# Archived Library extract: ViewTube_Widget_Master_Resource_Guide_2026-09-11.docx

> Imported 2026-09-25 for widget/dashboard handoff continuity. This is an extracted-text archival reference; current runtime code and the canonical master resource remain authoritative.

<PARSED TEXT FOR PAGE: 1 / 10>
ViewTube Widget Master Resource Guide • 2026-09-11
VIEWTUBE
WIDGET MASTER RESOURCE GUIDE
Registry, layout system, component architecture, build standards, artifacts, files, skills, and delivery roadmap
Edition 1.0 | 11 September 2026 | Canonical branch reviewed: main
59
REGISTERED
30
SUPPORTED
29
PREVIEW
1. Purpose and operating rule
This guide is the source of truth for ViewTube widgets: what exists, what ships by default, what is preview-only, what still needs 
backend or product work, how widgets should be laid out and built, and where their code and reference artifacts live. Update the 
registry first, then this guide. A source file proves implementation exists; it does not by itself prove production readiness.
Status vocabulary
Label Meaning Exit requirement
Supported In the default dashboard contract and 
certification matrix
All states, dimensions, keyboard path and 
primary action verified
Preview Registered and selectable, but not in the 
default supported dashboard
Complete QA, responsive, data and release 
decision
Ready Registry says implementation is ready Still verify live data, empty/error states and 
production route
Prototype Interaction/design exists but is intentionally 
experimental
Product decision, contracts, tests and release
tier
Needs backend UI depends on missing server/API capability Backend contract, permissions, errors and 
integration tests
Planned Documented concept without canonical 
registry entry
Owner, data contract, component, tests and 
registration
Legacy/quarantined Historical implementation retained for 
recovery/reference Audit before porting; never copy wholesale
2. Executive widget map
Family Registered Supported Prototype Widgets
Ai 5 5 1
AI Prompt Box, Ask Me, Daily 
Oracle, AI Journal, Brain Hub
Analytics 26 10 0
Recent Uploads, Top 
Performer, Revenue 
Momentum, Upload Cadence,
Revenue Tracker, Realtime, 
Keyword Engine, Keyword 
Overlap, Published 
Momentum, Traffic Sources, 
Retention Dip, Long vs Short, 
Reach Funnel, Algo 
Benchmark, The Ad Stack, 
Bridge Efficiency, Retention 
Simulator, Hashtag Analyzer, 
Video Autopsy, Algorithm 
Benchmark, CPM by 
Geography, Device Matrix, 
Guest Ratio, Playback 
<PARSED TEXT FOR PAGE: 2 / 10>
ViewTube Widget Master Resource Guide • 2026-09-11
Family Registered Supported Prototype Widgets
Origins, Premium Pulse, 
Sharing DNA
Community 5 2 1
Superfan Card, Comment 
Responder, Audience Matrix, 
Collab Matchmaker, Video 
Comment Operator
Core 6 3 0
Channel Overview, Social 
Channels, Mini Calendar, 
Task Stack, Quick Actions, 
Goals Tracker
Creation 11 8 0
Tag Generator, Community 
Post, Thumb AI, Description 
Editor, Upload Flight Check, 
Image Generator, Video 
Uploader, Video Manager, 
Title Rewriter, Upload 
Scheduler, A/B Thumbnail 
Test
System 6 2 0
About VIEWTUBE, Alerts 
Feed, Settings, News Ticker, 
Burnout Monitor, UI 
Reference Library
3. Complete canonical widget registry
Release tier is derived from DEFAULT_DASHBOARD_ROWS: supported widgets are in the default contract; all other registered 
widgets are preview-tier. “Ready” and “supported” are separate axes.
Widget ID Family Build Tier Default Dependency
About VIEWTUBE app-verification￾explainer system ready Supported full / medium none
Channel Overview kpi-cluster core ready Supported half / tall youtube_analytics_v2
Social Channels channel-overview core ready Preview quarter / medium youtube_data_v3
Mini Calendar mini-calendar core ready Preview half / medium none
Task Stack task-stack core ready Preview quarter / medium none
Quick Actions quick-actions core ready Supported full / medium none
Recent Uploads recent-uploads analytics ready Preview third / medium youtube_data_v3, 
youtube_analytics_v2
Top Performer top-performer analytics ready Preview third / medium youtube_analytics_v2
Alerts Feed alerts-feed system ready Preview half / medium none
AI Prompt Box ai-prompt-box ai prototype Supported third / medium none
Revenue Momentum revenue-momentum analytics ready Supported third / medium youtube_analytics_v2
Superfan Card superfan-card community prototype Preview half / medium none
Settings system-micro-stack system ready Supported quarter / medium none
Upload Cadence consistency-heatmap analytics ready Supported quarter / medium youtube_data_v3
Goals Tracker goals-tracker core ready Supported quarter / medium none
News Ticker alerts-ticker system ready Preview full / medium none
Tag Generator tag-generator creation ready Preview half / medium youtube_data_v3, 
gemini_api
Revenue Tracker revenue-chart analytics ready Preview half / medium youtube_analytics_v2
Community Post community-post creation ready Supported third / tall youtube_data_v3, 
gemini_api
Thumb AI thumb-ai creation ready Supported half / medium gemini_api
Description Editor description-editor creation ready Supported half / medium none
Realtime realtime-performance analytics ready Supported quarter / medium none
Keyword Engine keyword-engine analytics ready Supported quarter / medium none
<PARSED TEXT FOR PAGE: 3 / 10>
ViewTube Widget Master Resource Guide • 2026-09-11
Widget ID Family Build Tier Default Dependency
Keyword Overlap keyword-overlap￾intelligence analytics ready Supported half / tall none
Published Momentum publish-momentum analytics ready Supported half / medium none
Traffic Sources traffic-sources analytics ready Supported half / medium none
Retention Dip audience-retention analytics ready Preview half / medium none
Long vs Short shorts-vs-long analytics ready Supported quarter / medium none
Comment Responder comment-replier community ready Supported third / tall youtube_data_v3, 
gemini_api
Reach Funnel reach-funnel analytics ready Preview half / medium youtube_analytics_v2
Algo Benchmark relative-retention￾benchmark analytics ready Preview half / medium youtube_analytics_v2
The Ad Stack ad-stack-intelligence analytics ready Preview half / medium youtube_analytics_v2
Audience Matrix audience-matrix community ready Supported full / medium youtube_analytics_v2
Bridge Efficiency bridge-efficiency analytics ready Preview half / medium youtube_analytics_v2
Ask Me ask-me ai ready Supported third / xtall none
Daily Oracle daily-oracle ai ready Supported third / xtall none
Upload Flight Check flight-check creation ready Preview half / medium none
Image Generator image-generator creation ready Supported half / xtall gemini_api
Video Uploader video-uploader creation ready Supported half / xtall youtube_data_v3
Video Manager data-edit creation ready Supported half / xtall none
Title Rewriter title-rewriter creation ready Supported third / medium none
Retention Simulator retention-sim analytics ready Supported third / medium none
Upload Scheduler upload-scheduler creation ready Supported third / medium none
Hashtag Analyzer hashtag-analyzer analytics ready Supported third / medium none
Burnout Monitor burnout-monitor system ready Preview half / medium none
Collab Matchmaker collab-matchmaker community ready Preview half / medium gemini_api, 
youtube_data_v3
AI Journal ai-journal ai ready Supported third / xtall gemini_api
Brain Hub brain-hub ai ready Supported half / xtall none
UI Reference Library ui-reference-library system ready Preview half / xtall none
Video Autopsy video-autopsy analytics ready Preview half / xtall youtube_analytics_v2,
gemini_api
A/B Thumbnail Test ab-thumbnail creation ready Preview half / medium youtube_data_v3, 
gemini_api
Algorithm Benchmark algo-benchmark analytics ready Preview quarter / medium youtube_analytics_v2
CPM by Geography cpm-geo analytics ready Preview quarter / short youtube_analytics_v2
Device Matrix device-matrix analytics ready Preview quarter / medium youtube_analytics_v2
Guest Ratio guest-ratio analytics ready Preview quarter / short youtube_analytics_v2
Playback Origins playback-origins analytics ready Preview half / medium youtube_analytics_v2
Premium Pulse premium-pulse analytics ready Preview quarter / medium youtube_analytics_v2
Sharing DNA sharing-dna analytics ready Preview quarter / medium youtube_analytics_v2
Video Comment 
Operator
video-comment￾operator community ready Preview half / tall youtube_data_v3
4. Supported dashboard layout plan
The canonical default uses twelve rows. Preserve semantic grouping, but let users resize, reorder, collapse and hide widgets. 
The Settings widget must expose a “show all widgets” action and visibility controls without changing the release tier.
<PARSED TEXT FOR PAGE: 4 / 10>
ViewTube Widget Master Resource Guide • 2026-09-11
Row Widgets Geometry Purpose
1 Channel Overview (1/2 × medium) About VIEWTUBE (1/2 × medium) Trust + health
2 Community Post (1/2 × tall) Comment Responder (1/2 × tall) Community operations
3
Upload Cadence; Realtime; Goals; 
Keyword Engine Four quarters × medium Daily pulse
4 Daily Oracle; Ask Me; AI Journal Three thirds × extra tall AI thinking space
5 Image Generator; Video Uploader Two halves × extra tall Creation
6 Video Manager; Traffic Sources Two halves × extra tall Manage + understand
7
Long vs Short; Published 
Momentum; Audience Matrix Three thirds × medium Format and audience
8
Settings (1/4); Keyword Overlap 
(1/2); Retention Simulator (1/4) Mixed × tall Control + modeling
9 Upload Scheduler; Brain Hub Two halves × extra tall Planning + intelligence
10 Thumb AI (1/2); Quick Actions (1/4);
AI Prompt Box (1/4) Mixed × medium Fast tools
11 Revenue Momentum; Title 
Rewriter; Description Editor Three thirds × medium Monetization + metadata
12 Hashtag Analyzer Full × medium SEO review
5. Responsive grid and dimension system
Width buckets: full, three-quarters, two-thirds, half, between, third, companion and quarter. Height buckets: short, medium, tall, 
extra tall and massive. Every widget definition declares minimum, maximum, default, and generated supported dimensions. New 
work should use container-responsive behavior; legacy viewport-only behavior is migration debt.
Breakpoint / context Rule
Wide desktop Use the 24-column dense grid; retain 24px page padding and 24px 
gaps unless the page contract overrides it.
Standard desktop Preserve requested fraction; prevent canvas overflow; controls stay in
the header/control rail.
Tablet Collapse quarter/third layouts as required by container width; charts 
reduce labels before shrinking type below legibility.
Mobile Single-column reading order; title, subtitle and core action remain 
visible; secondary controls may enter a menu.
Embedded / narrow container Use compact component variant; never depend only on viewport 
media queries.
Promo/export canvas Use exact 16:9 or 9:16 ratios; simplify data density without changing 
the visual identity.
6. Canonical widget anatomy
Shell
One outer border, radius and color-matched shadow; top-left colored square meets the edge; no third color strip.
Header
Bold/black title, subtitle directly below when useful, right-aligned controls, black icon stroke, 12-color palette pairing.
Content canvas
Visible and purposeful at every size. Charts must have explicit scale, legend, tooltip and no-data strategy.
<PARSED TEXT FOR PAGE: 5 / 10>
ViewTube Widget Master Resource Guide • 2026-09-11
Control rail
Collapse, width, height, reorder/remove and widget-specific controls. Controls must remain keyboard reachable.
Data contract
Typed ready/loading/empty/blocked/stale/error states, provenance and updated-at information.
Footer/stat strip
Use only when it adds context, comparison or provenance. Do not reserve empty space.
Interaction
Inputs use the widget accent color for focus. Drag, hover and animation must respect reduced motion and touch.
Typography
Titles/buttons/labels use the extra-black visual language; body copy stays compact and readable.
7. Build guide: definition to production
Stage Required output
1. Define intent Write one information priority and one primary action. Choose page, 
family, owner and release tier.
2. Define data Name dataset, grain, time window, metrics, dimensions, provenance 
and API/CSV/derived precedence.
3. Register Add a unique ID, title, subtitle, category, sizes, heights, palette, 
dependencies and status to WidgetRegistry.ts.
4. Implement Build or reuse a renderer under dashboard/widgets; compose existing
primitives instead of inventing a second shell.
5. Wire states Support loading, ready, empty, blocked, stale and error. Include an 
actionable recovery message.
6. Make responsive Test compact, standard and wide variants across supported 
width/height combinations.
7. Make accessible Label controls, preserve focus, test keyboard path, contrast, touch 
targets and reduced motion.
8. Test Unit-test transforms and interactions; add renderer/contract tests and 
a visual gut-check.
9. Certify Add information priority, primary action, dimensions, data states, 
keyboard path and performance cost.
10. Release Move preview to supported only after production data, responsive 
behavior and failure states pass.
8. Widget completion checklist
☐ Unique registry ID and renderer key
☐ Correct category, palette pair and icon
☐ Data source/provenance documented
☐ All six data states implemented
☐ Supported dimensions render without clipping
☐ Mobile and touch verified
☐ Keyboard path and visible focus verified
☐ Loading avoids layout shift
☐ Empty state distinguishes no data from connection failure
<PARSED TEXT FOR PAGE: 6 / 10>
ViewTube Widget Master Resource Guide • 2026-09-11
☐ Error state includes recovery action
☐ Charts have scale/legend/tooltip rules
☐ No duplicate shell or double outline
☐ Unit and interaction tests pass
☐ Production route and permissions verified
☐ Guide description and screenshot updated
9. Page-by-page widget plan
Page Recommended widgets Integration rule
Home / Dashboard Channel Overview, Realtime, Upload Cadence, 
Goals, Oracle, Quick Actions, Settings Personal command center; allow show/hide/reorder.
Analytics Overview KPI cluster, revenue momentum, recent uploads, 
top performer, alerts Fast health scan with time-window synchronization.
Videos / Video Manager Recent Uploads, Video Autopsy, Reach Funnel, 
Retention Dip, Flight Check
Video selection must propagate to every linked 
widget.
Retention Retention Dip, Retention Simulator, relative 
retention benchmark, Long vs Short Overlay multiple videos and expose first 72 hours.
Traffic / Search Traffic Sources, Playback Origins, Keyword Engine, 
Keyword Overlap, Hashtag Analyzer
Separate source overview, search terms and 
external URLs.
Revenue Revenue Tracker, Revenue Momentum, Ad Stack, 
CPM by Geography, Premium Pulse
Currency/time-window consistency and eligibility 
states.
Audience Audience Matrix, Guest Ratio, Device Matrix, 
Sharing DNA, Superfan Card Privacy thresholds and missing demographic data.
Creation / Studio Hub Title Rewriter, Description Editor, Tag Generator, 
Thumb AI, Image Generator, Community Post Save outputs into project/video package workflow.
Publishing / Projects Upload Scheduler, Video Uploader, Flight Check, 
Published Momentum
Connect assets, metadata, checks, schedule and 
publish state.
Intelligence Hub Ask Me, Daily Oracle, AI Journal, Brain Hub, AI 
Prompt Box
Evidence-linked answers, memory controls and 
report generation.
Settings / System Settings, About VIEWTUBE, Alerts Feed, UI 
Reference Library
Visibility, sync diagnostics, account state and 
system references.
10. Planned and ready-to-complete backlog
Priority System Page Definition of done
P0 Show All Widgets control Settings
Expose one action that clears 
hidden state while preserving saved
order and size.
P0 Diagnostics Log widget System / Account Restore top-bar access and 
production auth/API event visibility.
P0 Canonical data-state pass All supported widgets
Remove mock ambiguity; show 
provenance, stale, blocked and 
recovery behavior.
P1 CSV / Google Sheets Merge Analytics
Match Studio exports to synced 
rows by video ID for CTR, 
impressions, stayed-to-watch, end 
screens and viewer cohorts.
P1 Intelligence Report Generator Intelligence Hub
Evidence connections, source 
cards, report package and reusable
outputs.
P1 Video Package widget set Projects / Studio
Connect research, script, assets, 
metadata, editor and publishing 
workflow.
P1 Deep Video Metrics Videos First 72h, daily lifetime, traffic, 
demographics, devices, playback 
<PARSED TEXT FOR PAGE: 7 / 10>
ViewTube Widget Master Resource Guide • 2026-09-11
Priority System Page Definition of done
and KPI cards.
P1 Shorts Retention Bubble Retention AVP × duration with income color, 
ranking, format and top-N controls.
P2 Geography Explorer Analytics
Country, state/province, city and 
DMA with supported query 
boundaries.
P2 Mega Dashboard mini-module set Analytics
25–30 compact KPIs, maps, 
retention overlays, devices, traffic, 
revenue and subscribers.
P2 Promo visual exports Reference Studio
Exact 16:9/9:16 standalone 
canvases derived from canonical 
widgets.
P2 Controller library widgets Reference Studio
Large/compact/square controller 
variants with snap/stay and tested 
touch behavior.
11. Code and artifact index
Area Canonical files / artifacts
Registry and contracts src/views/dashboard/WidgetRegistry.ts; types.ts; widgetCertification.ts
Rendering src/views/dashboard/WidgetRenderer.tsx; WidgetShell.tsx; 
DashboardCanvas.tsx; DashboardRebuild.tsx
Picker and persistence WidgetPickerPanel.tsx; storage.ts; DashboardContext.tsx
Primitives and styling WidgetPrimitives.tsx; WidgetPrimitiveExtensions.tsx; toolboxWidgetSystem.css; 
widgetPrimitive*.css; widgetScrollbar.css; tokens.ts; spectrum.ts
Data useDashboardData.ts; visualMetricSources.ts; useCanonicalAnalytics.ts; VT￾SYNC adapters and data source context
Widget implementations src/views/dashboard/widgets/*.tsx (59 registry entries map through renderer 
keys; 40+ dedicated widget files plus shared render paths)
Widget tests src/views/dashboard/__tests__; src/views/dashboard/widgets/__tests__; 
component visual/controller tests
Reference Studio
WidgetLab.tsx; WidgetLabV2.tsx; MiniToolboxLab.tsx; ChartCatalog*.tsx; 
ChartSpecImplementation*.tsx; sourceModules.tsx; chartSystem.tsx; 
widgetContracts.ts
Guide registries src/content/guide-v2/widgetRegistry.ts; widgetTeachingRegistry.ts; 
analyticsVisualRegistry.ts; analyticsVisualEncodingRegistry.ts
Guide explorers src/components/guide/GuideWidgetExplorer.tsx; 
GuideAnalyticsVisualExplorer.tsx; GuideVisualLanguage.tsx
Chart system
ChartEngine.tsx; UnifiedChartModule.tsx; UnifiedAnalyticsVisualModule.tsx; 
AnalyticsVisualShell.tsx; GraphsPageCharts.tsx; 
chartSystem/unifiedChartSpec.ts
Data visual modules
src/components/DataVisuals/modules2: Big Bang Timeline, Revenue Mosaic, 
Trajectory Forecaster, Search Term Gravity, Weekly Sparklines, Multi-Metric 
Timeline, Video Fingerprint
HTML references src/assets/reference/viewtube-full-component-library.html; viewtube-mini￾toolbox-bundle.html
Historical conversation artifacts
viewtube-module-system-20-variants.html; ViewTube-Master-1.html.html; 
viewtube-toolbox-fidelity-set-4.html; 
ViewTube_Simplified_Visual_Canvases_v1(1).html; 
ViewTube_Editor_Glass_Component_Library_V2_10x.html
Governance locks governance/animation-lock-2026-08-21/*Visual*.tsx and GraphsPageCharts.tsx
Migration/reference docs docs/migration/reference/* including VT-SYNC architecture, system integration 
and development status references
Legacy recovery _quarantine/performance-workflow/*; _quarantine/brain-legacy/* — reference 
only, audit before porting
<PARSED TEXT FOR PAGE: 8 / 10>
ViewTube Widget Master Resource Guide • 2026-09-11
12. Skills and agent references
Skill / system Location or status Widget relevance
YouTube API Expert .claude/skills/youtube-api-expert/SKILL.md Analytics, Data and Reporting API constraints, 
quotas and workflows.
ViewTube YouTube Auth/API Stabilization skills/viewtube-youtube-auth-api-stabilization/
SKILL.md
Simplify, debug and merge auth/API systems 
safely.
Widget Builder skill — recommended Planned Encode registry-first build, state contract, 
responsive QA and certification.
Visual Module Fidelity skill — recommended Planned Protect exact ViewTube composition, SVG, chart
and typography rules.
Widget Auditor skill — recommended Planned Generate registry/file/renderer/test/status diffs 
and flag orphans.
KING / Republic integration External artifact set
Use as orchestration/governance layer; bind 
tasks to canonical code owners and evidence 
outputs.
13. Governance and maintenance
Rule Standard
Canonical ownership
WidgetRegistry.ts owns inventory and metadata. WidgetRenderer.tsx 
owns renderer mapping. widgetCertification.ts owns support 
requirements.
No silent duplication Before building, search ID, title, renderer, prototype and quarantine. 
Prefer consolidation or explicit variant naming.
Branch safety Do not overwrite main to recover a widget. Port selectively through a 
branch and verify default layout, state storage and production data.
Evidence Every status change should cite the file, test, route and 
screenshot/build result that proves it.
Guide synchronization Generate user-guide widget entries from the registry; never maintain a
separate manually drifting list.
Quarterly audit Compare registry IDs, renderer keys, dedicated files, tests, default 
rows, picker visibility, guide entries and deployed routes.
14. Immediate implementation sequence
1. Finish the Settings “Show All Widgets” control and persistence test.
2. Run the registry-to-renderer audit for all 59 widgets and label actual production readiness.
3. Complete all six data states for the 30 supported widgets.
4. Promote preview widgets in small page-based batches, not all at once.
5. Build the CSV/Sheets Merge and Intelligence Report Generator as governed widget families.
6. Generate reference screenshots and update the user guide from the same registry.
7. Create the Widget Builder and Widget Auditor skills so the system stays synchronized.
Appendix A. Dedicated dashboard widget implementation files
src/views/dashboard/widgets/ABThumbnailWidget.tsx
src/views/dashboard/widgets/AIJournalWidget.tsx
src/views/dashboard/widgets/AdStackWidget.tsx
src/views/dashboard/widgets/AlgoBenchmarkWidget.tsx
src/views/dashboard/widgets/AskMeWidget.tsx
<PARSED TEXT FOR PAGE: 9 / 10>
ViewTube Widget Master Resource Guide • 2026-09-11
src/views/dashboard/widgets/AudienceMatrixWidget.tsx
src/views/dashboard/widgets/AudienceRetentionWidget.tsx
src/views/dashboard/widgets/BrainHubWidget.tsx
src/views/dashboard/widgets/BridgeEfficiencyWidget.tsx
src/views/dashboard/widgets/BurnoutMonitorWidget.tsx
src/views/dashboard/widgets/CollabMatchmakerWidget.tsx
src/views/dashboard/widgets/CommentReplyWidget.tsx
src/views/dashboard/widgets/CommunityPostWidget.tsx
src/views/dashboard/widgets/CpmGeoWidget.tsx
src/views/dashboard/widgets/DailyOracleWidget.tsx
src/views/dashboard/widgets/DataEditWidget.tsx
src/views/dashboard/widgets/DescriptionEditorWidget.tsx
src/views/dashboard/widgets/DeviceMatrixWidget.tsx
src/views/dashboard/widgets/FlightCheckWidget.tsx
src/views/dashboard/widgets/FormatClashWidget.tsx
src/views/dashboard/widgets/GoalsTrackerWidget.tsx
src/views/dashboard/widgets/GuestRatioWidget.tsx
src/views/dashboard/widgets/HashtagAnalyzerWidget.tsx
src/views/dashboard/widgets/ImageGeneratorWidget.tsx
src/views/dashboard/widgets/KeywordEngineWidget.tsx
src/views/dashboard/widgets/KeywordOverlapWidget.tsx
src/views/dashboard/widgets/PlaybackOriginsWidget.tsx
src/views/dashboard/widgets/PremiumPulseWidget.tsx
src/views/dashboard/widgets/PublishMomentumWidget.tsx
src/views/dashboard/widgets/ReachFunnelWidget.tsx
src/views/dashboard/widgets/RealtimePerformanceWidget.tsx
src/views/dashboard/widgets/RetentionSimWidget.tsx
src/views/dashboard/widgets/RevenueChartWidget.tsx
src/views/dashboard/widgets/SharingDnaWidget.tsx
src/views/dashboard/widgets/TagGeneratorWidget.tsx
src/views/dashboard/widgets/ThumbAIWidget.tsx
src/views/dashboard/widgets/ThumbnailLabWidget.tsx
src/views/dashboard/widgets/TitleRewriterWidget.tsx
src/views/dashboard/widgets/TrafficSourcesWidget.tsx
src/views/dashboard/widgets/UIReferenceLibraryWidget.tsx
src/views/dashboard/widgets/UploadSchedulerWidget.tsx
src/views/dashboard/widgets/VideoAssetSelect.tsx
src/views/dashboard/widgets/VideoAutopsyWidget.tsx
src/views/dashboard/widgets/VideoCommentOperatorWidget.tsx
Appendix B. Audit queries
rg --files src/views/dashboard src/components | rg -i "widget|visual|chart|toolbox"
rg -n "status:|releaseTier:|rendererKey:|defaultVisible:" src/views/dashboard
npm test -- src/views/dashboard
<PARSED TEXT FOR PAGE: 10 / 10>
ViewTube Widget Master Resource Guide • 2026-09-11
npm run build
node scripts/generate-chart-inventory.mjs
