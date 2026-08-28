import type { GuideWidgetDefinition } from "./widgetRegistry"

export interface GuideWidgetTeaching {
 whatItShows: string
 howToRead: readonly string[]
 patterns: readonly string[]
 controls: readonly string[]
 relatedWidgetIds: readonly string[]
}

const CATEGORY_TEACHING: Record<string, Omit<GuideWidgetTeaching, "relatedWidgetIds">> = {
 analytics: {
  whatItShows: "A focused performance view derived from channel or video analytics. Read the dominant direction first, then use the supporting values to explain why it moved.",
  howToRead: [
   "Start with the largest or most visually dominant value, series, rank, or segment.",
   "Compare direction and magnitude before treating a single number as meaningful.",
   "Change the time window or comparison only after you understand the default view.",
  ],
  patterns: [
   "Sustained movement is usually more meaningful than a one-day spike.",
   "A strong top-line result with weak supporting engagement can signal fragile reach.",
   "Compare similar formats and time windows before calling one video or period better.",
  ],
  controls: ["Time-window and comparison controls when exposed", "Widget resize and height controls in Dashboard edit mode"],
 },
 core: {
  whatItShows: "A high-priority channel status view intended for fast orientation rather than deep diagnosis.",
  howToRead: ["Scan the headline state first.", "Use secondary values to decide which deeper Analytics surface deserves attention.", "Treat alerts or missing states as navigation cues, not performance conclusions."],
  patterns: ["Look for meaningful changes from the creator's normal baseline.", "Several core indicators moving together are stronger evidence than one isolated KPI."],
  controls: ["Widget resize and height controls in Dashboard edit mode"],
 },
 ai: {
  whatItShows: "An AI-assisted interpretation or generation surface that combines creator context with the data and inputs available to that tool.",
  howToRead: ["Read the evidence or input context before the recommendation.", "Treat generated output as a decision aid, not canonical analytics truth.", "Verify performance claims against Analytics or the linked dataset when available."],
  patterns: ["Repeated recommendations across independent evidence can indicate a stronger opportunity.", "Recommendations based on missing or stale inputs should be treated as lower confidence."],
  controls: ["Prompt/input controls exposed by the widget", "Regenerate or action controls when available", "Widget resize and height controls"],
 },
 community: {
  whatItShows: "Audience interaction, comment, or community information intended to help creators understand and respond to viewers.",
  howToRead: ["Separate individual comments from repeated audience themes.", "Look for requests or reactions that recur across videos.", "Use the source video context before turning a comment into a content decision."],
  patterns: ["Repeated questions can become video ideas or documentation gaps.", "High-frequency sentiment around a specific moment can reveal a hook, confusion point, or audience expectation."],
  controls: ["Reply/generation controls when available", "Widget resize and height controls"],
 },
 creation: {
  whatItShows: "A creator-production surface that turns channel evidence or an idea into an editable output.",
  howToRead: ["Identify the input/context block first.", "Review generated or editable output separately from source evidence.", "Use handoff actions to move useful work into the next ViewTube production stage."],
  patterns: ["Outputs tied to a specific audience need or proven topic are generally more actionable.", "Keep variants when they test genuinely different angles rather than minor wording changes."],
  controls: ["Creation/editing controls exposed by the widget", "Widget resize and height controls"],
 },
 system: {
  whatItShows: "A ViewTube system-state, workflow, or utility surface rather than a direct performance visualization.",
  howToRead: ["Read status and availability before taking action.", "Use recovery or navigation actions when the state is blocked.", "Do not interpret system state as channel performance."],
  patterns: ["Repeated blocked or stale states can indicate a connection, sync, or configuration problem."],
  controls: ["System actions exposed by the widget", "Widget resize and height controls"],
 },
}

const WIDGET_OVERRIDES: Record<string, Partial<GuideWidgetTeaching>> = {
 "audience-retention": {
  whatItShows: "Viewer retention through the video, designed to reveal where attention is held, lost, or recovered.",
  howToRead: ["Read left-to-right as progress through the video.", "Look for sharp drops, plateaus, and unusual recovery points.", "Compare the shape with the video's hook, pacing changes, chapters, and payoff moments."],
  patterns: ["A steep early decline usually points to a hook/expectation problem.", "A later spike can indicate rewatches, sharing to a moment, or a section viewers actively seek.", "Long flat stretches are often stronger than a high opening followed by rapid decay."],
  controls: ["Video/time selection when exposed", "Widget resize and height controls"],
 },
 "traffic-sources": {
  whatItShows: "The discovery surfaces responsible for sending viewers to the channel or selected content.",
  howToRead: ["Rank sources by contribution first.", "Separate recommendation surfaces such as Browse/Suggested from intent surfaces such as Search.", "Use source mix to interpret why a title, thumbnail, topic, or external promotion worked."],
  patterns: ["Search-heavy traffic can indicate durable query demand.", "Browse/Suggested growth often depends more heavily on packaging and viewer response.", "A sudden external spike should be interpreted separately from YouTube-native discovery."],
 },
 "shorts-vs-long": {
  whatItShows: "A format comparison between Shorts and long-form performance so growth, engagement, and monetization are not mixed into one average.",
  howToRead: ["Compare the same metric across formats.", "Keep scale differences in mind before comparing raw totals.", "Use format-specific outcomes—reach, subscribers, watch time, revenue—rather than declaring one format universally better."],
  patterns: ["A format can dominate reach while another dominates watch time or revenue.", "Subscriber conversion differences can reveal which format is doing more audience-building work."],
 },
 "revenue-chart": {
  whatItShows: "Revenue performance over time, including monetization metrics when the connected account and dataset permit them.",
  howToRead: ["Read total earnings and rate metrics separately.", "Compare revenue movement with views and content mix.", "Use matching time windows before attributing a change to a video or strategy shift."],
  patterns: ["Revenue can rise without equivalent view growth when RPM or viewer mix changes.", "Short-lived spikes should be separated from sustained monetization improvement."],
 },
 "consistency-heatmap": {
  whatItShows: "Publishing activity arranged as a calendar/heat pattern so cadence and gaps are visible immediately.",
  howToRead: ["Scan for clusters and long empty runs.", "Compare cadence with performance periods rather than assuming more uploads are always better.", "Use it as a production-pattern view, not a quality score."],
  patterns: ["Long gaps can explain discontinuities in channel momentum.", "Dense upload periods are useful comparison windows for understanding sustainable cadence."],
 },
 "recent-uploads": {
  whatItShows: "A side-by-side view of recent releases for quickly comparing how the newest videos are behaving.",
  howToRead: ["Compare videos at similar ages after publish when possible.", "Separate raw reach from retention and engagement quality.", "Open a deeper video view before diagnosing a single outlier."],
  patterns: ["Several consecutive weak releases can indicate a topic, packaging, or audience-fit issue.", "One breakout among otherwise similar releases is a useful candidate for pattern analysis."],
 },
}

export const guideWidgetTeaching = (widget: GuideWidgetDefinition): GuideWidgetTeaching => {
 const base = CATEGORY_TEACHING[widget.category] || CATEGORY_TEACHING.system
 const override = WIDGET_OVERRIDES[widget.id] || {}
 return {
  whatItShows: override.whatItShows || base.whatItShows,
  howToRead: override.howToRead || base.howToRead,
  patterns: override.patterns || base.patterns,
  controls: override.controls || base.controls,
  relatedWidgetIds: override.relatedWidgetIds || [],
 }
}
