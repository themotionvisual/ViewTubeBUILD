import type {
 AIBrainAnswerModule,
 BrainQuickAction,
 CreatorGrowthContext,
 CreatorInitialInsight,
 CreatorInitialInsightDefinition,
} from "../types"
import type { AIBrainContextSnapshot } from "./aiBrainCommandInterface"
import { detectBrainAudienceVideoFormat } from "./brain/AudienceEvidenceCollector"

const module = (
 id: string,
 title: string,
 body: string,
 tone: AIBrainAnswerModule["tone"] = "green",
 source: AIBrainAnswerModule["source"] = "growth",
): AIBrainAnswerModule => ({ id, title, body, tone, source })

export const INITIAL_CREATOR_INSIGHT_DEFINITIONS: CreatorInitialInsightDefinition[] = [
 ["momentum-spike", "Momentum Spike", "views/watch time rising vs prior period", "line mini-chart + 3 ways to continue"],
 ["rebound-plan", "Rebound Plan", "views/watch time falling vs prior period", "cause list + 7-day recovery checklist"],
 ["subscriber-conversion-gap", "Subscriber Conversion Gap", "views rise but subscribers flat", "KPI comparison + CTA/action plan"],
 ["subscriber-momentum", "Subscriber Momentum", "subscribers rising faster than views", "pattern note + turn viewers into fans checklist"],
 ["revenue-efficiency", "Revenue Efficiency", "revenue diverges from views", "mini table: views/revenue/RPM + revenue levers"],
 ["watch-time-health", "Watch-Time Health", "watch hours or avg view duration changes", "retention diagnosis + pacing fixes"],
 ["upload-cadence-risk", "Upload Cadence Risk", "no upload in 14+ days", "calendar-style 7-day upload restart"],
 ["shorts-starter", "Shorts Starter", "channel rarely posts Shorts", "Shorts funnel explainer + first 3 Shorts ideas"],
 ["shorts-bridge", "Shorts Bridge", "Shorts outperform long form", "Shorts-to-long-form bridge plan"],
 ["long-form-moat", "Long-Form Moat", "long form clearly outperforms Shorts", "long-form repeatable series plan"],
 ["keyword-remix", "Keyword Remix", "top videos share title words/tags", "keyword cluster table + new video concept"],
 ["metadata-lane", "Metadata Lane", "tags/descriptions repeat in winners", "metadata rewrite checklist"],
 ["repeatable-format", "Repeatable Format", "top videos share structure/format", "format blueprint module"],
 ["recent-breakout", "Recent Breakout", "recent upload beats baseline", "double down now action card"],
 ["packaging-mismatch", "Packaging Mismatch", "recent upload underperforms similar topics", "title/thumbnail/hook repair card"],
 ["ctr-leak", "CTR Leak", "impressions exist but CTR trails baseline", "thumbnail/title test matrix"],
 ["hidden-gem", "Hidden Gem", "retention high but views low", "distribution + title promise repair"],
 ["overpromised-video", "Overpromised Video", "views high but retention weak", "hook/pacing fix list"],
 ["comment-heat", "Comment Heat", "comments/likes strong relative to views", "audience engagement module"],
 ["audience-request", "Audience Request", "comments repeat questions/topics", "audience request queue"],
 ["community-activation", "Community Activation", "low community/post activity", "5-post community plan"],
 ["monetization-path", "Monetization Path", "channel not monetized or revenue weak", "threshold/projection card using configured policy"],
 ["pace-projection", "Pace Projection", "current daily pace is stable enough", "baseline projection chart"],
 ["best-case-projection", "Best-Case Projection", "user has goal + advice path", "optimistic scenario chart with assumptions"],
 ["goal-gap", "Goal Gap", "1-month goal missing or behind pace", "goal tracker setup/recovery module"],
 ["niche-drift", "Niche Drift", "top topics are scattered", "niche simplification map"],
 ["audience-promise", "Audience Promise", "winning videos imply a clear viewer payoff", "promise statement + packaging checklist"],
 ["series-opportunity", "Series Opportunity", "repeated topic/format cluster exists", "recurring series name + episode map"],
 ["best-video-autopsy", "Best Video Autopsy", "user asks about most successful video", "why-it-worked breakdown + replication plan"],
 ["first-week-plan", "First Week Plan", "new user has enough starter data", "7-day prioritized action board"],
].map(([id, title, trigger, outputFormat]) => ({
 id,
 title,
 trigger,
 outputFormat,
 requiredEvidence: ["channel data"],
}))

const first = (values: string[], fallback: string): string =>
 values.map((value) => String(value || "").trim()).find(Boolean) || fallback

/**
 * Share of the channel's evidence videos that are Shorts.
 *
 * This replaces a check that tested whether the word "short" appeared in a topic
 * cluster name, which said nothing about the channel's actual format mix.
 */
const shortsShareOf = (snapshot: AIBrainContextSnapshot): number => {
 const videos = [...snapshot.evidencePack.topVideos, ...snapshot.evidencePack.recentVideos]
 if (!videos.length) return 0
 const shorts = videos.filter(
  (video) => detectBrainAudienceVideoFormat({ format: video.format }) === "short",
 ).length
 return shorts / videos.length
}

export const buildInitialCreatorInsights = (
 snapshot: AIBrainContextSnapshot,
 requestText = "",
 limit = 3,
): CreatorInitialInsight[] => {
 const insights: CreatorInitialInsight[] = []
 const clusters = snapshot.inferredProfile.topicClusters.slice(0, 5)
 const pillars = snapshot.inferredProfile.contentPillars.slice(0, 5)
 const topVideo = snapshot.inferredProfile.topEvidenceVideos[0]
 const hasVideos = snapshot.inferredProfile.videoCount > 0 || snapshot.vtSync.videos > 0
 const primaryLane = first(clusters, first(pillars, "your strongest recurring viewer promise"))
 const asksBestVideo = /\b(best|most successful|top)\b.*\b(video|upload)\b/i.test(requestText)

 if (hasVideos) {
  insights.push({
   id: "first-week-plan",
   title: "First Week Plan",
   priority: 90,
   reason: "Enough starter video evidence exists to give the creator a useful first action board.",
   modules: [
    module("first-week-focus", "What To Do Next", `Spend the next 7 days proving one lane: ${primaryLane}. Pick one topic, one title promise, and one repeatable structure instead of trying to optimize the whole channel at once.`, "green"),
    module("first-week-list", "7-Day Action Board", "Day 1: choose the lane. Day 2: rewrite three titles. Day 3: outline one repeatable episode. Day 4: build two thumbnail directions. Day 5: draft the opening hook. Day 6: publish or schedule. Day 7: review views, comments, retention, and subscriber conversion.", "yellow", "oracle"),
   ],
  })
 }

 if (clusters.length >= 3) {
  insights.push({
   id: "niche-drift",
   title: "Niche Simplification",
   priority: 86,
   reason: "Multiple topic clusters exist, so the Brain should help the creator choose a priority lane.",
   modules: [
    module("lane-map", "Choose The Main Lane", `Your clearest lanes look like ${clusters.slice(0, 3).join(", ")}. The next move is not to rename the channel; it is to choose which lane should lead the next 30 days of videos.`, "pink"),
    module("lane-test", "30-Day Goal Path", `Give ${primaryLane} four uploads or tests before judging it. Track views, subscriber conversion, comments, and watch time against the rest of the channel.`, "green", "analytics"),
   ],
  })
 }

 if (topVideo || asksBestVideo) {
  insights.push({
   id: "best-video-autopsy",
   title: "Best Video Autopsy",
   priority: asksBestVideo ? 100 : 82,
   reason: "A top-performing video or user request points to a repeatable success analysis.",
   modules: [
    module("why-it-worked", "Why It Worked", topVideo ? `Start with "${topVideo.title}". Its job is to reveal the topic, promise, format, and packaging pattern your viewers already rewarded.` : "Use your most successful video as the control sample. Compare its title promise, topic urgency, opening hook, thumbnail clarity, and audience payoff against recent uploads.", "blue", "analytics"),
    module("repeat-pattern", "Repeat This Pattern", "Create one new video that repeats the viewer promise and structure without copying the exact topic. Keep the first 30 seconds tighter, make the title easier to understand, and test a thumbnail that states the payoff faster.", "green"),
   ],
  })
 }

 if (pillars.length || clusters.length) {
  insights.push({
   id: "series-opportunity",
   title: "Series Opportunity",
   priority: 78,
   reason: "Repeated topics or formats can become a scheduled series.",
   modules: [
    module("series-name", "Series Opportunity", `Build a recurring series around ${primaryLane}. Give viewers a named promise they can recognize every week instead of isolated one-off uploads.`, "orange"),
    module("episode-map", "Episode Map", "Episode 1 explains the biggest viewer problem. Episode 2 shows the surprising example. Episode 3 compares two outcomes. Episode 4 answers the strongest audience objection or comment question.", "yellow", "journal"),
   ],
  })
 }

 // Previously `if (!hasShortEvidence && ...)` compared a function reference, so this
 // branch could never run. It now keys off the channel's real format mix.
 const shortsShare = shortsShareOf(snapshot)

 if (hasVideos && shortsShare < 0.2) {
  insights.push({
   id: "shorts-starter",
   title: "Shorts Starter",
   priority: 72,
   reason: "The channel publishes long-form but has little Shorts presence.",
   modules: [
    module("shorts-funnel", "Shorts Funnel", "Use Shorts as discovery trailers for the strongest long-form promise. Do not treat them as random clips; each Short should point viewers toward a bigger story, tutorial, or series.", "pink"),
    module("shorts-ideas", "First 3 Shorts Ideas", `Cut one surprising moment from ${primaryLane}, one before/after explanation, and one direct question your target viewer would answer in comments.`, "green"),
   ],
  })
 }

 if (hasVideos && shortsShare > 0.8) {
  insights.push({
   id: "shorts-bridge",
   title: "Shorts To Long-Form Bridge",
   priority: 76,
   reason: "Nearly all of this channel's evidence is Shorts, so the growth ceiling is watch time and returning viewers.",
   modules: [
    module("bridge-plan", "Where Shorts Stop Paying", "Shorts win discovery but cap watch time, session depth, and revenue. The next move is giving the audience you already reach somewhere longer to go.", "blue", "analytics"),
    module("bridge-first-video", "Your First Long-Form Cut", `Take the strongest proven idea in ${primaryLane} and build one longer video around it. Keep the same hook energy, then deliver the depth a Short physically cannot.`, "green"),
   ],
  })
 }

 return insights.sort((left, right) => right.priority - left.priority).slice(0, limit)
}

/**
 * Effort x reward scoring.
 *
 * The Brain decides what to raise on its own, so every candidate action is scored
 * for effort (1 trivial - 5 heavy) and expected result (1 marginal - 5
 * channel-moving), then ranked by ratio. An action is only emitted when the
 * evidence it depends on actually exists, which keeps these bound to the creator's
 * real channel instead of becoming a generic checklist.
 */
export const buildBrainQuickActions = (
 snapshot: AIBrainContextSnapshot,
 growthContext?: CreatorGrowthContext | null,
 limit = 2,
): BrainQuickAction[] => {
 const candidates: BrainQuickAction[] = []
 // The evidence pack carries format, which the inferred-profile summary does not,
 // and format decides which of these actions is even coherent to suggest.
 const topVideo = snapshot.evidencePack.topVideos[0]
 const topVideoFormat = topVideo ? detectBrainAudienceVideoFormat({ format: topVideo.format }) : "unknown"
 const clusters = snapshot.inferredProfile.topicClusters.slice(0, 3).filter(Boolean)
 const primaryLane = first(clusters, first(snapshot.inferredProfile.contentPillars, ""))
 const searchTerms = snapshot.evidencePack.searchTerms.slice(0, 2)
 const hasGoal = Boolean(
  snapshot.brain.futureStateMap || (growthContext?.currentGoal && growthContext.currentGoal.length > 0),
 )

 if (topVideo?.title) {
  candidates.push({
   id: "reuse-top-performer",
   title: "Turn your best video into the next one",
   body: `"${topVideo.title}" is your strongest signal. Outline one new video that keeps the same viewer payoff and structure but changes the topic angle.`,
   effort: 2,
   reward: 5,
   routeLabel: "Draft it in Creator Canvas",
  })

  // You can only cut a Short out of something longer than a Short.
  if (topVideoFormat === "long") {
   candidates.push({
    id: "short-from-top-performer",
    title: "Cut one Short from your top video",
    body: `Pull the single most surprising 30 seconds out of "${topVideo.title}" and publish it as a discovery Short pointing back to the full video.`,
    effort: 2,
    reward: 4,
    routeLabel: "Open Shorts extraction",
   })
  }

  if (topVideoFormat === "short") {
   candidates.push({
    id: "long-form-from-short",
    title: "Build a long-form video from your best Short",
    body: `"${topVideo.title}" already proved the topic lands. A longer version gives returning viewers somewhere to go and opens watch time and revenue that Shorts alone cannot.`,
    effort: 3,
    reward: 4,
    routeLabel: "Plan the long-form cut",
   })
  }
 }

 if (searchTerms.length) {
  const term = searchTerms[0]
  candidates.push({
   id: "answer-search-demand",
   title: `Make the video for "${term.value}"`,
   body: `Viewers are already finding you through "${term.value}". A video built to answer that exact search has demand waiting for it.`,
   effort: 3,
   reward: 5,
   routeLabel: "Plan this video",
  })
 }

 if (primaryLane) {
  candidates.push({
   id: "name-the-series",
   title: "Name a repeatable series",
   body: `Give ${primaryLane} a named series so returning viewers know exactly what they get each time instead of meeting a new one-off upload.`,
   effort: 3,
   reward: 4,
   routeLabel: "Build the series",
  })
 }

 if (!hasGoal) {
  candidates.push({
   id: "set-the-goal",
   title: "Pick this month's one result",
   body: "Tell me whether views, subscribers, revenue, watch time, or consistency matters most right now and I'll rank every recommendation against it.",
   effort: 1,
   reward: 4,
  })
 }

 if (snapshot.inferredProfile.status === "missing") {
  candidates.push({
   id: "confirm-the-lane",
   title: "Confirm what your channel is about",
   body: "Two sentences about who your videos are for and what they get would let me stop guessing and start giving specific advice.",
   effort: 1,
   reward: 4,
  })
 }

 return candidates
  .sort((left, right) => right.reward / right.effort - left.reward / left.effort)
  .slice(0, limit)
}

/**
 * Several insights and quick actions are two framings of the same advice about the
 * same video. Surfacing both is what made the hub feel repetitive, so when a quick
 * action is already on screen its matching insight is dropped.
 */
const INSIGHTS_COVERED_BY_ACTION: Record<string, string[]> = {
 "reuse-top-performer": ["best-video-autopsy"],
 "long-form-from-short": ["shorts-bridge"],
 "short-from-top-performer": ["shorts-starter"],
 "name-the-series": ["series-opportunity"],
 "confirm-the-lane": ["niche-drift"],
}

export const dedupeInsightsAgainstActions = (
 insights: CreatorInitialInsight[],
 actions: BrainQuickAction[],
): CreatorInitialInsight[] => {
 const covered = new Set(actions.flatMap((action) => INSIGHTS_COVERED_BY_ACTION[action.id] || []))
 return insights.filter((insight) => !covered.has(insight.id))
}

export const buildBrainGoalRecommendations = (
 snapshot: AIBrainContextSnapshot,
): AIBrainAnswerModule[] => {
 const videos = snapshot.vtSync.videos
 const views = snapshot.channel.totalViews
 const baselineViews = typeof views === "number" ? Math.max(100, Math.round(views * 0.08)) : null
 return [
  module("goal-views", "Views Target", baselineViews ? `A practical one-month starter target is ${baselineViews.toLocaleString()} additional views, then adjust after the next analytics refresh.` : "Set a one-month view target after the Brain can see enough recent pace.", "green", "analytics"),
  module("goal-output", "Output Target", videos > 0 ? "Pick a schedule you can repeat for four weeks: one strong long-form upload, three Shorts, or one series episode plus supporting clips." : "Set an output target first if analytics history is still light.", "yellow", "oracle"),
  module("goal-engagement", "Engagement Target", "Choose one comment prompt per upload and track whether viewers answer it. Comments tell the Brain which promise and language your audience is responding to.", "pink", "journal"),
 ]
}
