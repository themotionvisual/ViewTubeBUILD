import type { GuidePageDepth } from "./guidePageRegistry"

export interface GuideArticleBlock {
 heading: string
 body: string
 steps?: readonly string[]
 callout?: string
}

export interface GuideArticleDefinition {
 pageId: string
 quick: string
 learn: readonly GuideArticleBlock[]
 technical?: readonly GuideArticleBlock[]
}

export const GUIDE_ARTICLES: readonly GuideArticleDefinition[] = Object.freeze([
 {
  pageId: "start",
  quick: "ViewTube is organized around a creator loop: connect your channel, sync trustworthy data, understand what is happening, turn that understanding into creative decisions, produce the video, publish it, then learn from the outcome.",
  learn: [
   { heading: "Connect", body: "Start by connecting the Google account that owns or manages the YouTube channel you want ViewTube to understand." },
   { heading: "Sync", body: "Run the VT-SYNC datasets you need. Analytics, dashboards and AI systems become more useful as their canonical data coverage improves." },
   { heading: "Understand", body: "Use Analytics, Graphs, Intelligence Hub and AI Brain to identify patterns instead of staring at isolated numbers." },
   { heading: "Create and produce", body: "Move useful findings into Studio, Projects, Vault and the Editor so analysis turns into an actual video." },
   { heading: "Publish and learn", body: "Package and publish the video, then bring its performance back through Analytics to improve the next decision." },
  ],
 },
 {
  pageId: "app-map",
  quick: "Think of ViewTube as one connected creator system, not a pile of tools: Dashboard is the home surface, Analytics is the data layer, Studio and Brain turn evidence into decisions, Projects and Vault hold work in progress, Editor produces the video, and publishing tools complete the loop.",
  learn: [
   { heading: "Home", body: "Dashboard surfaces the creator's current state through configurable widgets, fast actions and status modules." },
   { heading: "Analyze", body: "Analytics, Graphs and Intelligence Hub inspect canonical VT-SYNC data and expose the evidence behind performance." },
   { heading: "Create", body: "Studio, Strategy, AI Brain, Hook Generator, Thumbnail Studio and Storyboard Studio help turn evidence into content decisions." },
   { heading: "Organize", body: "Projects and Vault keep planning state, assets and reusable creator material connected to the work." },
   { heading: "Produce and publish", body: "The Editor handles timeline composition; SEO Generator and Video Publisher complete packaging and upload preparation." },
  ],
 },
 {
  pageId: "data",
  quick: "ViewTube separates account connection, canonical analytics storage and user-facing interpretation. The normal user should be able to see what data exists, where it came from, whether it is fresh, and why a metric or dataset may be unavailable.",
  learn: [
   { heading: "Connection is not the dataset", body: "Google authorization establishes who ViewTube can read for. VT-SYNC then performs the actual dataset collection and normalization work." },
   { heading: "Canonical storage", body: "VT-SYNC stores normalized channel, video, time-series, traffic, audience, geography, device, revenue, playlist and retention data for the rest of ViewTube to consume." },
   { heading: "Provenance matters", body: "When possible, ViewTube should show the source, freshness and availability state instead of silently replacing missing upstream data with guesses." },
   { heading: "Privacy and transparency", body: "Use Data & Privacy to understand what ViewTube reads, why it is used, and how local/canonical data participates in the product." },
  ],
  technical: [
   { heading: "Source APIs", body: "Canonical dataset contracts distinguish YouTube Data API, YouTube Analytics API, derived data, local import and workspace sources." },
   { heading: "Compatibility paths", body: "Legacy caches and Performance Hub compatibility reads may still exist during migration, but new guide content should describe VT-SYNC and server-owned account state as the north-star architecture." },
  ],
 },
 {
  pageId: "connect",
  quick: "Connect Google once, confirm the YouTube channel ViewTube found, then run the analytics datasets you want. The normal user flow should not require copying tokens, managing browser credentials, or understanding OAuth internals.",
  learn: [
   { heading: "1. Connect Google", body: "Use the ViewTube account connection action. Google asks you to approve the YouTube and Analytics permissions ViewTube needs.", steps: ["Choose the Google account that owns or manages the channel.", "Approve the requested permissions.", "Return to ViewTube automatically."] },
   { heading: "2. Confirm the channel", body: "ViewTube resolves the YouTube channel attached to the authorized Google account and shows the channel identity it will use.", callout: "If the wrong channel appears, reconnect with the Google account that owns the intended channel." },
   { heading: "3. Run your first sync", body: "Open Analytics and select a sync preset or individual dataset families. ViewTube stores normalized results in VT-SYNC for the rest of the product to read." },
  ],
  technical: [
   { heading: "Browser auth truth", body: "The new Simple Auth V1 path uses an HttpOnly vt_session cookie plus /api/auth/session. Browser code should not need a Google access token." },
   { heading: "Migration state", body: "Legacy account/auth code still exists during cutover. Treat it as compatibility infrastructure, not the workflow users should be taught." },
  ],
 },
 {
  pageId: "analytics",
  quick: "Analytics is the canonical place to sync, inspect, filter and understand ViewTube's YouTube data. VT-SYNC is the data spine; visualizations and AI analysis should read from canonical datasets rather than separate caches.",
  learn: [
   { heading: "Sync", body: "Choose the dataset families you need and run VT-SYNC. Each sync unit reports whether it has never synced, is syncing, completed, partially completed, or failed." },
   { heading: "Inspect", body: "Use the data table browser to inspect the actual rows behind charts and AI analysis. Categories include videos, traffic, retention, geography, demographics, devices, revenue and playlists." },
   { heading: "Interpret", body: "Read charts together with their source dataset, time window and metric definitions. The guide's dataset encyclopedia is derived from the same visible table registry as Analytics." },
   { heading: "Act", body: "Move useful findings into Studio, Projects, AI Brain, packaging, or the Editor instead of treating analytics as a dead-end report." },
  ],
  technical: [
   { heading: "Canonical read path", body: "analytics-canon reads normalized VT-SYNC data. Legacy Selectors/DataStore paths remain only where migration is unfinished." },
   { heading: "Intelligence Hub", body: "The canonical Intelligence Hub lives inside Analytics and builds evidence from the active VT-SYNC dataset boundary before generating reports." },
  ],
 },
 {
  pageId: "create",
  quick: "Create turns channel context into usable production decisions: ideas, audience signals, hooks, packaging, projects, storyboards and AI-assisted planning.",
  learn: [
   { heading: "Start with intent", body: "Define what the next piece of content is trying to accomplish: reach, retention, conversion, audience service, series continuation, or experimentation." },
   { heading: "Use channel context", body: "Bring in analytics, audience requests, prior winners, comments and Brain context before generating ideas or packaging." },
   { heading: "Build the package", body: "Develop the concept, hook, title direction, thumbnail direction, script beats and storyboard as one connected package rather than isolated outputs." },
   { heading: "Hand off", body: "Send the approved plan into Projects, the Editor, Vault or publishing tools while preserving the context that produced it." },
  ],
 },
 {
  pageId: "editor",
  quick: "The ViewTube Editor is the timeline-based production surface. Clips occupy time, transitions connect clips, the playhead represents the current frame, and the preview shows the composed result.",
  learn: [
   { heading: "Timeline", body: "Arrange video, image, audio, text and generated elements along time. Zoom changes how much time you can inspect without changing the edit itself." },
   { heading: "Clips", body: "A clip's body represents its occupied duration. Trim edges change start/end timing; moving the body changes when it plays." },
   { heading: "Transitions", body: "Transitions are connection objects between adjacent clips. Their visual design should communicate both clip ownership and the overlap/transform happening between them." },
   { heading: "Preview and transport", body: "Use the preview to judge the composed frame and transport controls to play, pause and navigate the current sequence." },
   { heading: "Mobile", body: "The mobile editor has its own layout, gestures, panels, timeline strip and transport behavior rather than simply shrinking the desktop interface." },
  ],
  technical: [
   { heading: "Current implementation", body: "The production route is /editor. Older editor paths redirect there. Active editor-unification work adds shared store contracts, mobile components, transition presentation helpers, captions and renderer improvements." },
  ],
 },
 {
  pageId: "publish",
  quick: "Publish turns a finished video into its YouTube package: title, description, thumbnail direction, SEO metadata, timing and final upload preparation.",
  learn: [
   { heading: "Package the promise", body: "The title and thumbnail should communicate the same viewer promise from two complementary angles." },
   { heading: "Prepare metadata", body: "Use Video Publisher and SEO tools to generate and refine descriptions, keywords and supporting metadata from the actual video context." },
   { heading: "Final checks", body: "Verify the file, title, thumbnail, description, links, end-screen plan and publish timing before upload." },
   { heading: "Close the loop", body: "After publishing, feed performance outcomes back into Analytics and Brain so future recommendations learn from what happened." },
  ],
 },
 {
  pageId: "help",
  quick: "Diagnose ViewTube by layer: connection first, then sync/data, then the individual tool, then editor/render. Fixing the earliest broken layer usually fixes everything downstream.",
  learn: [
   { heading: "Connection", body: "Confirm ViewTube sees a ready account and the expected YouTube channel. Reconnect if authorization is expired or the wrong account was selected." },
   { heading: "Sync & data", body: "Confirm the required dataset actually synced and contains rows for the selected time window or dimension." },
   { heading: "Tool output", body: "If data is healthy but one tool fails, inspect that tool's inputs, entitlements, AI key/model state and error message." },
   { heading: "Editor & render", body: "For editor problems, separate UI/timeline state from render-worker/export problems. A playable timeline and a failed export are different layers." },
  ],
  technical: [
   { heading: "Do not debug from stale caches first", body: "Prefer canonical session state and VT-SYNC dataset status before inspecting legacy cache/auth paths." },
  ],
 },
])

export const guideArticleByPageId = (pageId: string): GuideArticleDefinition | null =>
 GUIDE_ARTICLES.find((article) => article.pageId === pageId) ?? null
