import type {
 AIBrainAnswerModule,
 AIBrainConversationDigest,
 AIBrainConversationTurn,
 AIBrainLearningEntry,
 AIBrainQuestionAnswer,
 CreatorBrainLearningQuestion,
 CreatorBrainResponse,
 CreatorGrowthContext,
 CreatorGrowthCapabilityStatus,
} from "../types"
import {
 listAIBrainConversationTurnsDB,
 saveAIBrainConversationTurnDB,
} from "./brain/Persistence"
import {
 buildConversationAnalyticDigest,
 captureAIBrainLearningEvent,
} from "./aiBrainSelfImprovement"
import type { AIBrainContextSnapshot } from "./aiBrainCommandInterface"

const nowIso = () => new Date().toISOString()

const makeId = (prefix: string): string => {
 const random =
  typeof crypto !== "undefined" && "randomUUID" in crypto
   ? crypto.randomUUID()
   : `${Date.now()}-${Math.random().toString(36).slice(2)}`
 return `${prefix}_${random}`
}

const clean = (value: unknown): string => String(value || "").replace(/\s+/g, " ").trim()

export const sanitizeCreatorFacingBrainCopy = (value: string): string =>
 clean(value)
  .replace(/\bVT-SYNC\b/gi, "your synced channel data")
  .replace(/\bsync bundles?\b/gi, "data areas")
  .replace(/\bbundles?\b/gi, "data areas")
  .replace(/\bmanifest\b/gi, "channel data summary")
  .replace(/\bdiagnostics?\b/gi, "channel data notes")
  .replace(/\bIndexedDB\b/g, "saved Brain memory")
  .replace(/\blocalStorage\b/g, "saved Brain memory")
  .replace(/\bAPI\b/g, "channel data")
  .replace(/\bfunctions?\b/gi, "tools")
  .replace(/\btechnical\b/gi, "channel")
  .replace(/\bfailed\b/gi, "incomplete")
  .replace(/\berror\b/gi, "gap")
  .replace(/\bsync process\b/gi, "channel data")
  .replace(/\bProfile Confidence\b/gi, "Channel Read")
  .replace(/\bWhat The Brain Learned\b/gi, "Saved Context")
  .replace(/\bBest Next Action\b/gi, "What To Do Next")

const statusFor = (ready: boolean, partial: boolean): CreatorGrowthCapabilityStatus =>
 ready ? "ready" : partial ? "partial" : "missing"

const firstOr = (values: string[], fallback: string): string => values.map(clean).find(Boolean) || fallback

export const buildCreatorGrowthContext = (
 snapshot: AIBrainContextSnapshot,
 recentTurns: AIBrainConversationTurn[] = [],
 learningEntries: AIBrainLearningEntry[] = [],
): CreatorGrowthContext => {
 const profileReady = snapshot.inferredProfile.status !== "missing"
 const pillars = snapshot.inferredProfile.contentPillars.slice(0, 5)
 const topVideos = snapshot.inferredProfile.topEvidenceVideos.slice(0, 5)
 const recentFacts = recentTurns
  .flatMap((turn) => turn.digest?.keyFacts || [])
  .map(sanitizeCreatorFacingBrainCopy)
  .slice(0, 8)
 const learnedFacts = learningEntries
  .filter((entry) => ["creator_goal", "content_style", "channel_fact", "preference"].includes(entry.category))
  .map((entry) => sanitizeCreatorFacingBrainCopy(entry.summary))
  .slice(0, 8)
 const profileScore =
  snapshot.inferredProfile.status === "ready" ? 88
  : profileReady ? Math.min(78, 38 + snapshot.inferredProfile.topicClusters.length * 5 + Math.min(20, snapshot.inferredProfile.videoCount / 50))
  : 24
 const currentGoal = snapshot.brain.futureStateMap || firstOr(learnedFacts, "Pick one measurable channel goal for this month.")
 const topPatterns = snapshot.inferredProfile.successDrivers.length
  ? snapshot.inferredProfile.successDrivers.map(sanitizeCreatorFacingBrainCopy)
  : topVideos.map((video) => `${video.title}${typeof video.views === "number" ? ` has ${video.views.toLocaleString()} views` : ""}`)
 const audiencePromise = profileReady
  ? `Your audience promise appears connected to ${firstOr(snapshot.inferredProfile.topicClusters.slice(0, 3), "your strongest recurring channel themes")}. Make the next upload clearly promise that payoff in the title, opening hook, and thumbnail.`
  : "The Brain needs more title, topic, and audience evidence before it can state a reliable audience promise."
 const seoQueue = snapshot.inferredProfile.topicClusters.slice(0, 5).map((cluster) =>
  `Build one search-friendly title and description angle around ${cluster}.`,
 )
 const dailyActions = [
  "Choose one growth goal before changing titles or formats.",
  profileReady ? "Turn the strongest profile lane into one repeatable upload idea." : "Answer one profile question so the Brain can rank opportunities.",
  "Improve one title, hook, thumbnail promise, or end screen today.",
 ]

 return {
  profileConfidenceScore: Math.round(profileScore),
  currentGoal,
  inferredNiche: snapshot.inferredProfile.niche || "Channel niche still needs stronger creator confirmation.",
  contentPillars: pillars,
  topPerformerPatterns: topPatterns,
  audiencePromise,
  memoryChanges: learnedFacts,
  newUploadFitChecklist: [
   "Does the topic match one confirmed content pillar?",
   "Does the title promise a clear viewer payoff?",
   "Does the first 30 seconds prove the promise fast?",
   "Does the thumbnail make the audience and outcome obvious?",
  ],
  dailyOracleActions: dailyActions,
  journalProfileUpdates: learningEntries
   .filter((entry) => entry.source === "journal")
   .map((entry) => sanitizeCreatorFacingBrainCopy(entry.summary))
   .slice(0, 5),
  goalAwareRecommendations: [
   `Current goal direction: ${sanitizeCreatorFacingBrainCopy(currentGoal)}`,
   "Rank ideas by the goal they serve: views, subscribers, revenue, watch time, consistency, or workflow.",
  ],
  seoOpportunityQueue: seoQueue.length ? seoQueue : ["Confirm the channel niche, then build a focused SEO opportunity queue."],
  unresolvedQuestions: recentTurns
   .flatMap((turn) => turn.response?.questions || [])
   .map((question) => question.question)
   .slice(0, 6),
  recentConversationFacts: recentFacts,
  capabilities: [
   {
    id: "profile_confidence",
    label: "Channel Profile Read",
    status: statusFor(profileReady, snapshot.inferredProfile.videoCount > 0),
    summary: profileReady ? "The Brain has enough channel evidence to start with inferred lanes before asking confirmation questions." : "The Brain can still help, but creator confirmation will make recommendations sharper.",
   },
   {
    id: "creator_confirmation",
    label: "Creator Confirmation",
    status: statusFor(recentTurns.some((turn) => turn.questionAnswers.length > 0), recentTurns.length > 0),
    summary: "Creator answers are saved into the Brain conversation thread.",
   },
   {
    id: "top_performer_patterns",
    label: "Top Performer Patterns",
    status: statusFor(topPatterns.length > 0, topVideos.length > 0),
    summary: firstOr(topPatterns, "Top performer patterns need more video evidence."),
   },
   {
    id: "audience_promise",
    label: "Audience Promise",
    status: statusFor(profileReady, snapshot.inferredProfile.topicClusters.length > 0),
    summary: audiencePromise,
   },
   {
    id: "memory_change_log",
    label: "Memory Change Log",
    status: statusFor(learningEntries.length > 0, recentTurns.length > 0),
    summary: learningEntries.length ? `${learningEntries.length} recent Brain learning entries.` : "No recent creator learning entries yet.",
   },
   {
    id: "new_upload_fit",
    label: "New Upload Fit",
    status: statusFor(profileReady, snapshot.inferredProfile.topicClusters.length > 0),
    summary: "Draft ideas can be checked against niche, pillar, promise, hook, and packaging fit.",
   },
   {
    id: "daily_oracle",
    label: "Daily Oracle",
    status: "ready",
    summary: dailyActions[0],
   },
   {
    id: "journal_profile_updates",
    label: "Journal Profile Updates",
    status: statusFor(learningEntries.some((entry) => entry.source === "journal"), learningEntries.length > 0),
    summary: "AI Journal entries can update goals, style, constraints, and audience notes.",
   },
   {
    id: "goal_aware_recommendations",
    label: "Goal-Aware Recommendations",
    status: currentGoal ? "ready" : "partial",
    summary: sanitizeCreatorFacingBrainCopy(currentGoal),
   },
   {
    id: "seo_opportunity_queue",
    label: "SEO Opportunity Queue",
    status: statusFor(seoQueue.length > 0, profileReady),
    summary: firstOr(seoQueue, "SEO queue needs clearer topic clusters."),
   },
  ],
 }
}

export const formatCreatorGrowthModules = (
 response: CreatorBrainResponse,
 growthContext: CreatorGrowthContext,
): AIBrainAnswerModule[] => {
 const modules = response.modules?.length ? response.modules : (response.sections || []).map((section) => ({
  id: section.id,
  title: section.title,
  body: section.body,
  tone: section.tone,
  source: section.id === "why" ? "analytics" : "growth",
 }))
 const cleaned = modules
  .map((item) => ({
   ...item,
   title: sanitizeCreatorFacingBrainCopy(item.title),
   body: sanitizeCreatorFacingBrainCopy(item.body),
  }))
  .filter((item) => !/profile confidence|growth read|content opportunity|what the brain learned|best next action|seo queue/i.test(item.title))

 if (cleaned.length >= 2) return cleaned.slice(0, 4)

 const topPattern = firstOr(growthContext.topPerformerPatterns, firstOr(growthContext.contentPillars, growthContext.inferredNiche))
 const goal = sanitizeCreatorFacingBrainCopy(growthContext.currentGoal)
 return [
  {
   id: "what-to-do-next",
   title: "What To Do Next",
   body: sanitizeCreatorFacingBrainCopy(response.nextAction || response.keyInsight || `Pick one repeatable channel move tied to ${goal}.`),
   tone: "green",
   source: "growth",
  },
  {
   id: "why-this-is-happening",
   title: "Why This Is Happening",
   body: topPattern
    ? `The clearest channel pattern to use right now is ${sanitizeCreatorFacingBrainCopy(topPattern)}. Build the next decision around that evidence instead of treating every upload as a new experiment.`
    : "The safest move is to connect the next upload to one clear viewer promise, then judge it by views, watch time, subscribers, and comments.",
   tone: "blue",
   source: "analytics",
  },
  {
   id: "thirty-day-goal-path",
   title: "30-Day Goal Path",
   body: goal || "Choose one 30-day target for views, subscribers, watch time, revenue, output, CTR, comments, or RPM so the Brain can rank advice by the result that matters.",
   tone: "yellow",
   source: "oracle",
  },
 ].slice(0, 3)
}

export const saveAIBrainConversationTurn = async (input: {
 channelId?: string | null
 userText: string
 assistantText: string
 response?: CreatorBrainResponse
 answerModules?: AIBrainAnswerModule[]
 questionAnswers?: AIBrainQuestionAnswer[]
 feedback?: AIBrainConversationTurn["feedback"]
 learningEntryIds?: string[]
 metadata?: Record<string, unknown>
}): Promise<AIBrainConversationTurn> => {
 const createdAt = nowIso()
 const channelId = input.channelId || null
 const digest: AIBrainConversationDigest = buildConversationAnalyticDigest({
  channelId,
  userText: input.userText,
  response: input.response || input.assistantText,
  learningEntryIds: input.learningEntryIds || [],
 })
 const turn: AIBrainConversationTurn = {
  id: makeId("ai_brain_turn"),
  threadId: `ai_brain_thread_${channelId || "default"}`,
  channelId,
  createdAt,
  userText: sanitizeCreatorFacingBrainCopy(input.userText),
  assistantText: sanitizeCreatorFacingBrainCopy(input.assistantText),
  response: input.response,
  answerModules: input.answerModules || input.response?.modules || [],
  questionAnswers: input.questionAnswers || [],
  feedback: input.feedback,
  learningEntryIds: input.learningEntryIds || [],
  digest,
  metadata: input.metadata,
 }
 await saveAIBrainConversationTurnDB(turn)
 return turn
}

export const listAIBrainConversationTurns = async (input: {
 channelId?: string | null
 limit?: number
} = {}): Promise<AIBrainConversationTurn[]> => {
 const turns = await listAIBrainConversationTurnsDB(input.channelId)
 return turns.slice(0, input.limit || 20)
}

export const answerAIBrainQuestionModule = async (input: {
 channelId?: string | null
 question: CreatorBrainLearningQuestion
 answer: string
}): Promise<AIBrainQuestionAnswer> => {
 const entry = await captureAIBrainLearningEvent({
  channelId: input.channelId || null,
  source: "copilot",
  summary: `Creator answered: ${input.question.question}`,
  detail: input.answer,
  category: input.question.category,
  confidence: "high",
  evidence: ["AI Brain question module"],
 })
 const answer: AIBrainQuestionAnswer = {
  id: makeId("ai_brain_question_answer"),
  questionId: input.question.id,
  channelId: input.channelId || null,
  question: input.question.question,
  answer: sanitizeCreatorFacingBrainCopy(input.answer),
  category: input.question.category,
  createdAt: nowIso(),
  learningEntryId: entry.id,
 }
 await saveAIBrainConversationTurn({
  channelId: input.channelId || null,
  userText: input.answer,
  assistantText: `Saved your answer for: ${input.question.question}`,
  questionAnswers: [answer],
  learningEntryIds: [entry.id],
  metadata: { source: "question_module" },
 })
 return answer
}
