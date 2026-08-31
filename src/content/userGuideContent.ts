export type GuideToolEntry = {
  toolId: string
  toolName: string
  routeRef: string
  whatItDoes: string
  howToSteps: string[]
  troubleshooting: string[]
  qaChecks: string[]
}

export type GuideSection = {
  id: string
  title: string
  audience: string
  routeRefs: string[]
  tools: GuideToolEntry[]
}

export const GUIDE_PROTOCOL_VERSION = "v2.4"
export const GUIDE_LAST_UPDATED = "2026-08-28"

export const userGuideSections: GuideSection[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    audience: "Everyone — the home surface after signing in.",
    routeRefs: ["/"],
    tools: [
      {
        toolId: "DASHBOARD_WIDGETS",
        toolName: "Widget Dashboard",
        routeRef: "/",
        whatItDoes:
          "A grid of independent widgets — Channel Overview, Community Post, Comment Responder, Upload Cadence, Realtime, Goals Tracker, Keyword Engine, Daily Oracle, Ask Me, AI Journal, and more — each pulling from your synced channel data. You can rearrange, resize, hide, and re-add widgets to match how you actually work.",
        howToSteps: [
          "Connect your channel and run a sync so widgets have real data instead of placeholders.",
          "Open Widget Options from the account menu to toggle which widgets are visible.",
          "Enable Rearrange Widgets to drag widgets into a new order or resize them, then lock the layout when you're happy with it.",
        ],
        troubleshooting: [
          "If a widget shows zeros or an empty state, you haven't synced yet, or that widget's data category isn't selected in Analytics.",
          "If the layout looks wrong after an update, use Reset Layout from Widget Options to restore the default arrangement.",
        ],
        qaChecks: [
          "Channel Overview shows your real avatar, channel name, and stats once synced.",
          "Dragging a widget in edit mode persists its new position after a refresh.",
        ],
      },
    ],
  },
  {
    id: "projects",
    title: "Projects",
    audience: "Creators planning uploads and tracking channel-wide to-dos.",
    routeRefs: ["/projects"],
    tools: [
      {
        toolId: "PROJECT_STUDIO",
        toolName: "Project Calendar",
        routeRef: "/projects",
        whatItDoes:
          "A weekly calendar for scheduling video projects, plus a channel-wide to-do list and goals list that live outside any single project.",
        howToSteps: [
          "Switch between the Channel view (to-dos and goals) and the Projects view (calendar) at the top of the page.",
          "Create a project with a name, target date, and color, then add its own to-dos.",
          "Use the week navigation to move forward/back and plan upload cadence over time.",
        ],
        troubleshooting: [
          "If a project doesn't appear on the date you expect, confirm the calendar's week offset — you may be viewing a different week.",
          "If AI suggestions don't generate, confirm your API key and credit balance in Settings.",
        ],
        qaChecks: [
          "New projects appear on their assigned date with the chosen color.",
          "Channel to-dos and goals persist independently of any single project.",
        ],
      },
      {
        toolId: "STORYBOARD_STUDIO_PROJECTS",
        toolName: "Storyboard Studio (collapsed panel)",
        routeRef: "/projects",
        whatItDoes: "The same storyboard/scene-planning tool from Studio, embedded here collapsed by default so it's available without leaving the planning view.",
        howToSteps: [
          "Expand the Storyboard Studio panel at the bottom of the Projects page.",
          "Set objective and format, then generate a scene sequence for the project you're planning.",
        ],
        troubleshooting: [
          "If it stays collapsed after generating, click its header to expand and view the result.",
        ],
        qaChecks: [
          "Panel expands/collapses without losing generated content.",
        ],
      },
    ],
  },
  {
    id: "ai-brain",
    title: "AI Brain",
    audience: "Creators who want one conversation instead of a menu of separate AI tools.",
    routeRefs: ["/ai-brain"],
    tools: [
      {
        toolId: "AI_BRAIN_INTERFACE",
        toolName: "AI Brain",
        routeRef: "/ai-brain",
        whatItDoes:
          "The flagship surface: one ongoing conversation, not a mode picker. You ask a question in plain language and the Brain decides what to pull from your channel's real data to answer it — every claim is grounded in your actual videos, search terms, and goals, or it names what's missing. A context rail alongside the conversation shows the channel state it's reasoning from.",
        howToSteps: [
          "Open AI Brain from the nav.",
          "Ask a direct question (\"why did views drop last week\", \"what should I upload next\", \"write titles for this video\") — no need to pick a tool or mode first.",
          "Check the context rail to see what channel data the answer is grounded in, and open the diagnostics disclosure if you want to see exactly what was used.",
        ],
        troubleshooting: [
          "If answers feel generic or unmoored from your channel, make sure you've connected your channel and run a sync — the Brain needs real data to reason from.",
          "If a claim seems wrong, open the diagnostics disclosure rather than guessing — it shows the underlying data the answer used.",
        ],
        qaChecks: [
          "Answers reference specific videos, numbers, or dates from your own channel, not generic advice.",
          "The Brain explicitly names missing data instead of fabricating an answer.",
        ],
      },
    ],
  },
  {
    id: "vt-sync",
    title: "Analytics",
    audience: "Creators who want direct access to every synced YouTube dataset and table.",
    routeRefs: ["/local-analytics"],
    tools: [
      {
        toolId: "VT_SYNC_TOOLS_PAGE",
        toolName: "Analytics Tools Page",
        routeRef: "/local-analytics",
        whatItDoes:
          "Runs the sync that pulls your channel's data from the YouTube Data and Analytics APIs into local tables — videos, traffic sources, demographics, geography, devices and operating systems, revenue, and more — plus a full data-table browser for inspecting every dataset directly.",
        howToSteps: [
          "Connect your channel if you haven't, then choose which datasets to sync (Core Only, Recommended, or pick individual categories).",
          "Run the sync and watch each phase's status (never synced, syncing, synced, partial, or failed) in the progress panel.",
          "Open the data table browser below and pick a category tab (e.g. Devices & OS, Demographics, Traffic) to inspect the raw synced rows.",
        ],
        troubleshooting: [
          "If a category stays 'Never Synced', confirm it's selected before starting the sync — unselected categories are skipped.",
          "If a phase shows 'Partial', ViewTube saved whatever YouTube returned; re-run the sync for that category to retry the rest.",
          "If a phase shows 'Failed', check the message on that row — quota limits and expired auth are the most common causes.",
        ],
        qaChecks: [
          "Selected categories move from 'Never Synced' to 'Synced' after a successful run.",
          "Data tables show the row counts that match what the progress panel reported.",
        ],
      },
      {
        toolId: "VT_SYNC_DEVICE_OS_TABLE",
        toolName: "Device × OS Table",
        routeRef: "/local-analytics",
        whatItDoes:
          "Shows device and operating system traffic three ways at once: an Operating Systems list, a Devices list, and a combined Device × OS breakdown where each OS row expands to show the views, watch time, average duration, and average percentage viewed for every device on that OS.",
        howToSteps: [
          "Open the Devices & OS category, then the 'Device x OS' tab.",
          "Click any operating system row to expand it and see its per-device breakdown.",
          "Click a column header to sort the OS rows (and the devices within them) by that metric.",
        ],
        troubleshooting: [
          "If the table is empty, sync the 'Device x OS' category (under Devices & OS) first.",
        ],
        qaChecks: [
          "Expanding an OS row reveals up to four device rows with their own metric values.",
          "Sorting by a metric column reorders both the OS rows and the devices inside each expanded row.",
        ],
      },
    ],
  },
  {
    id: "performance",
    title: "Performance Hub",
    audience: "Creators validating analytics and making strategy decisions.",
    routeRefs: ["/performance", "/studio/internal-analytics"],
    tools: [
      {
        toolId: "PERFORMANCE_HUB",
        toolName: "Performance Hub",
        routeRef: "/performance",
        whatItDoes:
          "Central analytics surface for channel strategy, chart packs, and master table verification.",
        howToSteps: [
          "Open Analytics from the sidebar.",
          "Confirm the master table is populated before interpreting charts.",
          "Use chart sections to inspect CTR, views, retention, revenue, and traffic patterns.",
        ],
        troubleshooting: [
          "If charts show missing data, confirm ingest mode and run sync from Settings.",
          "If values look stale, clear cache in Settings and re-sync.",
          "If paid analysis fails, verify billing tier and credit balance in Settings > Billing.",
        ],
        qaChecks: [
          "Master table loads without empty shell artifacts.",
          "Chart cards render with no zero-size container warnings.",
          "Metrics displayed in charts match table values for sampled rows.",
        ],
      },
      {
        toolId: "INTERNAL_ANALYTICS",
        toolName: "Internal Analytics Panel",
        routeRef: "/studio/internal-analytics",
        whatItDoes:
          "Internal KPI-focused analytics view for compact metric checks and trend inspection.",
        howToSteps: [
          "Navigate to /studio/internal-analytics directly.",
          "Compare KPI values against Performance Hub totals for consistency.",
        ],
        troubleshooting: [
          "If route is blank, reload app and verify route registration in latest build.",
          "If values diverge from Performance Hub, re-run sync and verify ingest mode.",
        ],
        qaChecks: [
          "Panel route resolves correctly from URL.",
          "KPIs stay in sync with canonical analytics state.",
        ],
      },
    ],
  },
  {
    id: "studio",
    title: "Studio Hub Tools",
    audience: "Creators generating uploads, hooks, thumbnails, and storyboards.",
    routeRefs: [
      "/studio",
      "/video-manager",
      "/strategy",
      "/seo-generator",
      "/media-analyzer",
      "/hook-generator",
      "/thumbnail-studio",
      "/storyboard-studio",
    ],
    tools: [
      {
        toolId: "VIDEO_MANAGER",
        toolName: "Video Manager",
        routeRef: "/studio",
        whatItDoes:
          "Central command module for loading, reviewing, and managing channel video assets and metadata context.",
        howToSteps: [
          "Open Studio Hub and expand Video Manager.",
          "Load channel assets and review status/messages at top.",
          "Select target video items before running optimization tools.",
        ],
        troubleshooting: [
          "If assets do not load, reconnect channel in Settings and retry.",
          "If YouTube session expired appears, reconnect channel and reload.",
          "If panel is empty, confirm ingest mode and sync state first.",
        ],
        qaChecks: [
          "Video list renders with no blank shell on first open.",
          "Error/retry messaging is user-readable and actionable.",
          "Selection and downstream handoff to other tools works.",
        ],
      },
      {
        toolId: "TACTICS_ENGINE",
        toolName: "Tactics Engine",
        routeRef: "/strategy",
        whatItDoes:
          "Turns creator constraints into tactical recommendations for next-video execution.",
        howToSteps: [
          "Open Tactics Engine from Studio Hub.",
          "Fill niche/topic/audience inputs and run strategy generation.",
          "Apply recommended tactics to title, hook, and packaging flows.",
        ],
        troubleshooting: [
          "If output is generic, add clearer constraints and rerun.",
          "If generation fails, verify key and billing/credit availability in Settings.",
        ],
        qaChecks: [
          "Generated strategy appears in the result region consistently.",
          "Input changes affect output deterministically.",
        ],
      },
      {
        toolId: "SEO_GENERATOR",
        toolName: "SEO Generator",
        routeRef: "/seo-generator",
        whatItDoes:
          "Builds discoverability assets (keywords, metadata variants, and packaging-oriented SEO copy).",
        howToSteps: [
          "Open SEO Generator.",
          "Choose mode and content context.",
          "Generate and compare output blocks, then apply best variant.",
        ],
        troubleshooting: [
          "If generated copy is weak, increase prompt specificity and rerun.",
          "If requests fail, confirm API key and plan status in Settings.",
        ],
        qaChecks: [
          "Mode switches update generated outputs correctly.",
          "Copy/export controls remain stable across repeated runs.",
        ],
      },
      {
        toolId: "VIDEO_PUBLISHER",
        toolName: "Video Publisher",
        routeRef: "/video-publisher",
        whatItDoes: "Creates publishing metadata and packaging outputs for upload workflows.",
        howToSteps: [
          "Open Video Publisher from direct route or Studio flow.",
          "Fill core inputs and generate title/description blocks.",
          "Review output and copy into publishing pipeline.",
        ],
        troubleshooting: [
          "If generation fails, confirm API key in Settings.",
          "If output quality is low, switch Gemini preference between Flash and Pro.",
        ],
        qaChecks: [
          "Generate button produces content without layout shifts.",
          "Post-action reflection control logs feedback correctly.",
        ],
      },
      {
        toolId: "HOOK_GENERATOR",
        toolName: "Hook Generator",
        routeRef: "/hook-generator",
        whatItDoes: "Builds opening hook variants optimized for retention and click intent.",
        howToSteps: [
          "Open Hook Generator.",
          "Provide niche/topic context and run generation.",
          "Compare candidate hooks and select strongest angle.",
        ],
        troubleshooting: [
          "If requests fail, verify API key and plan entitlements.",
          "If results are generic, add more constraints in prompt fields.",
        ],
        qaChecks: [
          "Hook results render in expected output panels.",
          "No console errors during repeated generations.",
        ],
      },
      {
        toolId: "THUMBNAIL_STUDIO",
        toolName: "Thumbnail Studio",
        routeRef: "/thumbnail-studio",
        whatItDoes: "Supports thumbnail ideation and packaging consistency.",
        howToSteps: [
          "Open Thumbnail Studio.",
          "Generate concepts and compare options.",
          "Apply selected direction to downstream packaging workflow.",
        ],
        troubleshooting: [
          "If loading fails, verify connected channel and key state in Settings.",
          "If visual modules misalign, refresh and ensure latest style shell is loaded.",
        ],
        qaChecks: [
          "Studio modules render with consistent shell tokens.",
          "Generated outputs remain selectable and stable across refresh.",
        ],
      },
      {
        toolId: "CONTENT_ANALYSIS",
        toolName: "Content Analysis",
        routeRef: "/media-analyzer",
        whatItDoes:
          "Analyzes media/content packaging quality to surface optimization opportunities.",
        howToSteps: [
          "Open Content Analysis.",
          "Load target content inputs.",
          "Review analysis output and action recommendations.",
        ],
        troubleshooting: [
          "If analysis is empty, verify input/source data is loaded first.",
          "If route fails, reload and confirm latest app state.",
        ],
        qaChecks: [
          "Analysis cards render and update from new inputs.",
          "No runtime warnings during repeated evaluations.",
        ],
      },
      {
        toolId: "STORYBOARD_STUDIO",
        toolName: "Storyboard Studio",
        routeRef: "/storyboard-studio",
        whatItDoes: "Generates structured scene plans and sequencing drafts.",
        howToSteps: [
          "Open Storyboard Studio.",
          "Set objective and format constraints.",
          "Generate and iterate scene sequence suggestions.",
        ],
        troubleshooting: [
          "If sections are empty, re-run with clearer scope and validate API connectivity.",
          "If tool stalls, reload page and retry with smaller prompt payload.",
        ],
        qaChecks: [
          "Scene blocks render in order.",
          "Export/copy flows remain functional after generation.",
        ],
      },
      {
        toolId: "PRE_LAUNCH_PRIMING",
        toolName: "Pre-Launch Priming",
        routeRef: "/studio",
        whatItDoes:
          "Runs final readiness prompts/checks before publishing to reduce avoidable launch mistakes.",
        howToSteps: [
          "Open Pre-Launch Priming in Studio Hub.",
          "Run checklist generation against current video package.",
          "Apply flagged fixes before publish.",
        ],
        troubleshooting: [
          "If generation fails, check API key and network state.",
          "If advice seems stale, refresh data source and rerun.",
        ],
        qaChecks: [
          "Checklist items render with clear pass/fix guidance.",
          "Post-action reflection capture remains available.",
        ],
      },
      {
        toolId: "COMMUNITY_POSTS",
        toolName: "Community Posts",
        routeRef: "/studio",
        whatItDoes:
          "Creates post, poll, and community update drafts to maintain audience activity between uploads.",
        howToSteps: [
          "Open Community Posts module.",
          "Select post type and provide context.",
          "Generate, edit, and publish-ready copy.",
        ],
        troubleshooting: [
          "If outputs are repetitive, vary tone/topic constraints.",
          "If module appears collapsed unexpectedly, expand and rerun action.",
        ],
        qaChecks: [
          "Post type controls switch templates correctly.",
          "Output is copyable and stays stable across retries.",
        ],
      },
      {
        toolId: "COMMENT_RESPONDER",
        toolName: "Comment Responder",
        routeRef: "/studio",
        whatItDoes:
          "Drafts on-brand comment replies and pinned-comment options for engagement support.",
        howToSteps: [
          "Open Comment Responder.",
          "Paste comments or context and generate replies.",
          "Select preferred reply style and finalize.",
        ],
        troubleshooting: [
          "If responses are off-tone, add brand voice constraints.",
          "If generation errors appear, verify key and credit state.",
        ],
        qaChecks: [
          "Reply variants generate across selected modes.",
          "Pinned comment suggestions appear when requested.",
        ],
      },
      {
        toolId: "END_SCREEN_ARCHITECT",
        toolName: "End-Screen Architect",
        routeRef: "/studio",
        whatItDoes:
          "Designs outro flow and end-screen CTA structure to push viewers to next-view actions.",
        howToSteps: [
          "Open End-Screen Architect.",
          "Choose objective (next video, playlist, subscribe).",
          "Generate layout/script guidance and apply to outro.",
        ],
        troubleshooting: [
          "If recommendation quality is low, provide specific video objective and audience intent.",
          "If module state resets, re-open accordion and re-run generation.",
        ],
        qaChecks: [
          "Objective changes produce different output guidance.",
          "Outro script and end-screen suggestions render together.",
        ],
      },
    ],
  },
  {
    id: "graphs",
    title: "Graphs and Chart Pages",
    audience: "Users exploring chart modules and specialized graph diagnostics.",
    routeRefs: ["/graphs", "/graphs/shorts-retention"],
    tools: [
      {
        toolId: "GRAPHS_PAGE",
        toolName: "Graphs Page",
        routeRef: "/graphs",
        whatItDoes: "Hosts chart modules and graph-specific visual analysis surfaces.",
        howToSteps: [
          "Open /graphs.",
          "Select target graph module.",
          "Use chart controls to compare modes and behavior.",
        ],
        troubleshooting: [
          "If charts do not populate, check ingest mode and run sync.",
          "If rendering looks broken, refresh and verify data readiness in Performance Hub.",
        ],
        qaChecks: [
          "Graph cards mount without runtime warnings.",
          "Chart controls respond and update visual state.",
        ],
      },
      {
        toolId: "SHORTS_RETENTION_GRAPH",
        toolName: "Shorts Retention (Widget Module)",
        routeRef: "/graphs/shorts-retention",
        whatItDoes:
          "Displays retention-vs-duration bubble analysis with subtitle rail details and mode selector.",
        howToSteps: [
          "Open /graphs/shorts-retention.",
          "Use the top dropdown to switch between top-performing and most-recent behavior.",
          "Hover points to inspect crosshair positioning and subtitle-driven metric context.",
        ],
        troubleshooting: [
          "If subtitle stats do not update, verify data rows include required views/AVD fields.",
          "If bubble sizes feel incorrect, confirm row cap and normalization inputs.",
        ],
        qaChecks: [
          "Dropdown mode changes reorder/render as expected.",
          "Subtitle updates reflect active hovered/selected data point.",
          "Bubble sizing and color scaling stay within configured bounds.",
        ],
      },
    ],
  },
  {
    id: "billing",
    title: "Billing and Subscriptions",
    audience: "Users managing plans, checkout, and usage limits.",
    routeRefs: ["/settings?panel=billing", "/subscribe"],
    tools: [
      {
        toolId: "BILLING_SETTINGS",
        toolName: "Billing Panel",
        routeRef: "/settings?panel=billing",
        whatItDoes:
          "Shows your Basic, Beta, Creator, Creator Plus, Creator Pro, or Executive plan, checkout handoff, shared AI credits, and entitlement state.",
        howToSteps: [
          "Go to Settings and open Billing & Subscription.",
          "Review current tier and credit balance.",
          "Choose a plan and complete checkout if prompted.",
        ],
        troubleshooting: [
          "If checkout fails, verify billing server environment keys and connectivity.",
          "If tier does not update, re-open Settings and trigger entitlement sync.",
          "If a tool remains unavailable, open Feature Access to see whether it needs a plan, channel permission, synced data, credits, rollout access, or approval.",
        ],
        qaChecks: [
          "Plan selection button states update correctly.",
          "Billing status messages reflect success/failure clearly.",
          "Entitlement values persist after page refresh.",
        ],
      },
    ],
  },
  {
    id: "feature-access",
    title: "Feature Access and AI Usage",
    audience: "Users who need to understand why a tool is available, limited, or asking for an action.",
    routeRefs: ["/settings?panel=access", "/settings?panel=ai"],
    tools: [
      {
        toolId: "FEATURE_ACCESS_SETTINGS",
        toolName: "Feature Access",
        routeRef: "/settings?panel=access",
        whatItDoes: "Explains the current advisory access policy for tools: account sign-in, plan, Google permissions, synced data, AI credits, rollout availability, and approval for external actions.",
        howToSteps: [
          "Open Settings and select Feature Access.",
          "Read the action label: Upgrade, Connect/Reconnect channel, Review credits, or preview/dry run.",
          "Complete the named action, then retry the tool without clearing data or changing unrelated settings.",
        ],
        troubleshooting: [
          "A paid plan does not replace missing Google authorization; reconnect when a channel permission is required.",
          "A connected channel does not replace a plan, credits, or real synced data.",
          "Feature Access is advisory during this rollout, so it explains current requirements without removing existing tool entry.",
        ],
        qaChecks: [
          "Each unavailable feature names a specific recovery action instead of showing a generic lock.",
          "Feature Access never changes analytics rows, source provenance, or connection state by itself.",
        ],
      },
      {
        toolId: "AI_USAGE_METERS",
        toolName: "AI Usage by Work Type",
        routeRef: "/settings?panel=ai",
        whatItDoes: "Shows current UTC-month recorded server credit debits for analysis and asset generation. The bars show usage categories over one shared AI credit balance, not separate quotas.",
        howToSteps: [
          "Open Settings and select AI Runtime.",
          "Review Analysis and Asset generation usage, then open Billing to review the shared balance and plan.",
          "Use a custom provider key only when the tool specifically supports it; its usage is not included in ViewTube's server credit meter.",
        ],
        troubleshooting: [
          "Usage unavailable means ViewTube has no verified server ledger summary for this account yet.",
          "BYOK, streaming, and older uncategorized activity are excluded or grouped as Other; the bars are not provider-wide billing statements.",
        ],
        qaChecks: [
          "Both bars remain visible at narrow widths and have progress-bar labels.",
          "The text says credits are shared and does not imply separate category limits.",
        ],
      },
    ],
  },
  {
    id: "sync",
    title: "Sync, Keys, and Data Controls",
    audience: "Users connecting channels, resolving public handles, and managing local data.",
    routeRefs: ["/settings", "/data-transparency"],
    tools: [
      {
        toolId: "SETTINGS_SYNC_AND_KEYS",
        toolName: "Settings Core Controls",
        routeRef: "/settings",
        whatItDoes:
          "Manages API key vault, ingest mode, channel auth/public-handle resolution, export, and reset actions.",
        howToSteps: [
          "Set Gemini API key and choose model preference.",
          "Connect channel or resolve a public handle.",
          "Select ingest mode, then export or refresh data as needed.",
        ],
        troubleshooting: [
          "If generation fails, verify API key is saved and visible in vault snapshot.",
          "If channel data is missing, reconnect channel and re-sync.",
          "If data corruption is suspected, clear cache or factory reset from Settings.",
        ],
        qaChecks: [
          "Save settings action persists key/model state.",
          "Ingest mode switch updates stored mode and behavior.",
          "Export action completes and reports status cleanly.",
        ],
      },
    ],
  },
  {
    id: "editor",
    title: "Editor and Creative Runtime",
    audience: "Users working on timeline/video-editing surfaces.",
    routeRefs: ["/editor"],
    tools: [
      {
        toolId: "EDITOR_V1",
        toolName: "Editor V1",
        routeRef: "/editor",
        whatItDoes: "Primary editing surface for clip sequencing and composition workflows.",
        howToSteps: [
          "Open Editor from sidebar.",
          "Load project/scene context.",
          "Adjust timeline and inspect changes before export.",
        ],
        troubleshooting: [
          "If editor appears blank, reload and verify route assets have loaded.",
          "If playback controls are unresponsive, refresh app state and retry.",
        ],
        qaChecks: [
          "Editor route resolves without runtime crash.",
          "Core timeline interactions respond correctly.",
        ],
      },
    ],
  },
  {
    id: "troubleshooting",
    title: "Global Troubleshooting Playbook",
    audience: "Any user diagnosing failures quickly.",
    routeRefs: ["/settings", "/performance", "/graphs"],
    tools: [
      {
        toolId: "GLOBAL_TROUBLESHOOTING",
        toolName: "Sitewide Recovery Checklist",
        routeRef: "/settings",
        whatItDoes:
          "Provides a deterministic order for recovering from sync, billing, chart, and generation failures.",
        howToSteps: [
          "Check active plan and credits in Billing.",
          "Verify key and ingest mode in Settings.",
          "Run sync and validate master table in Performance Hub.",
          "Re-open target tool and retry action.",
        ],
        troubleshooting: [
          "If issue persists, clear cache (soft) and repeat validation sequence.",
          "Escalate only after route, entitlement, and data-state checks are complete.",
        ],
        qaChecks: [
          "Recovery sequence resolves at least five high-friction flows end-to-end.",
          "No unresolved critical user-facing errors remain without documented fix path.",
        ],
      },
    ],
  },
]
