export type BrainPrimaryGoal =
 | "views"
 | "subscribers"
 | "revenue"
 | "retention"
 | "consistency"
 | "watch_time"
 | "output"
 | "engagement"
 | "comments"
 | "ctr"
 | "rpm"

export type AiBrainGoalMetric =
 | "views"
 | "subscribers"
 | "watch_hours"
 | "revenue"
 | "new_videos"
 | "ctr"
 | "comments"
 | "rpm"

export type AiBrainGoalTarget = {
 metric: AiBrainGoalMetric
 label: string
 currentValue: number | null
 recommendedTarget: number | null
 userTarget: number | null
 rationale: string
 source: "analytics" | "creator" | "default"
}

export type AiBrainCreatorProfile = {
 channelDescription: string
 mainTopicFocus: string
 audienceDescription: string
 successDefinition: string
 mainYoutubeGoal: string
 recurringSeriesName: string
 recurringSeriesDescription: string
 biggestWeakness: string
 mostSuccessfulVideo: string
 signupReason: string
}

export type AiBrainContext = AiBrainCreatorProfile & {
 whatNext: string
 primaryGoal: BrainPrimaryGoal
 audienceNiche: string
 oneMonthGoals: AiBrainGoalTarget[]
 completedAt: string | null
 deferredAt: string | null
 updatedAt: string | null
 source: "wizard" | "settings_migration" | "legacy" | "system"
 version: 2
}

export type AiBrainContextInput = Partial<AiBrainCreatorProfile> &
 Partial<Pick<AiBrainContext, "whatNext" | "primaryGoal" | "audienceNiche" | "oneMonthGoals" | "deferredAt" | "source">>

export const AI_BRAIN_INTAKE_QUESTIONS: Array<{
 id: keyof AiBrainCreatorProfile
 label: string
 prompt: string
 placeholder: string
}> = [
 {
  id: "channelDescription",
  label: "Channel Description",
  prompt: "How would you describe your channel in 3 sentences?",
  placeholder: "What do you make, who is it for, and why should viewers care?",
 },
 {
  id: "mainTopicFocus",
  label: "Topic Focus",
  prompt: "What is your channel's main topic focus or niche?",
  placeholder: "Example: cinematic military history explainers, restoration projects, creator business advice...",
 },
 {
  id: "audienceDescription",
  label: "Audience",
  prompt: "How would you describe your channel's audience and subscribers?",
  placeholder: "Who watches, what do they want, and what do they already know?",
 },
 {
  id: "successDefinition",
  label: "Success",
  prompt: "How would you define success for your channel?",
  placeholder: "Views, subscribers, watch time, revenue, output, brand deals, a community, better videos...",
 },
 {
  id: "mainYoutubeGoal",
  label: "Main Goal",
  prompt: "What is your main goal on YouTube?",
  placeholder: "Example: reach monetization, grow long-form views, make revenue steadier, publish weekly...",
 },
 {
  id: "recurringSeriesName",
  label: "Series Name",
  prompt: "If you released a regular video series, what would you call it?",
  placeholder: "Example: History in Motion, Creator Clinic, 7-Day Build...",
 },
 {
  id: "recurringSeriesDescription",
  label: "Series Idea",
  prompt: "What would that recurring video series be about?",
  placeholder: "Describe the format, viewer payoff, and why someone would return for another episode.",
 },
 {
  id: "biggestWeakness",
  label: "Biggest Weakness",
  prompt: "What would you say your biggest weakness is on YouTube and why?",
  placeholder: "Examples: consistency, titles, thumbnails, retention, speed, niche clarity, editing, monetization...",
 },
 {
  id: "mostSuccessfulVideo",
  label: "Best Video",
  prompt: "What is your most successful video to date?",
  placeholder: "Paste the title or describe it. Add why you think it worked if you know.",
 },
 {
  id: "signupReason",
  label: "Why ViewTube",
  prompt: "What made you connect ViewTube?",
  placeholder: "Example: understand analytics, plan better content, monetize, generate ideas, manage the channel...",
 },
]

const STORAGE_KEY = "vt_ai_brain_context_v1"
const COMPLETED_KEY = "vt_ai_brain_context_completed_v1"
const DISMISSED_KEY = "vt_ai_brain_context_dismissed_v1"

const defaultGoalTargets = (): AiBrainGoalTarget[] => [
 { metric: "views", label: "Views", currentValue: null, recommendedTarget: null, userTarget: null, rationale: "Set a realistic one-month view target once the Brain sees your current pace.", source: "default" },
 { metric: "subscribers", label: "Subscribers", currentValue: null, recommendedTarget: null, userTarget: null, rationale: "Use a subscriber target that matches your view volume and conversion rate.", source: "default" },
 { metric: "watch_hours", label: "Watch Hours", currentValue: null, recommendedTarget: null, userTarget: null, rationale: "Watch-hour goals help the Brain prioritize retention and long-form structure.", source: "default" },
 { metric: "revenue", label: "Revenue", currentValue: null, recommendedTarget: null, userTarget: null, rationale: "Revenue goals should follow monetization status, RPM, and upload mix.", source: "default" },
 { metric: "new_videos", label: "New Videos", currentValue: null, recommendedTarget: null, userTarget: null, rationale: "Output goals keep strategy connected to an upload schedule you can actually sustain.", source: "default" },
 { metric: "ctr", label: "CTR", currentValue: null, recommendedTarget: null, userTarget: null, rationale: "CTR goals help prioritize titles, thumbnails, and topic packaging.", source: "default" },
 { metric: "comments", label: "Comments", currentValue: null, recommendedTarget: null, userTarget: null, rationale: "Comment goals help the Brain improve audience prompts and community engagement.", source: "default" },
 { metric: "rpm", label: "RPM", currentValue: null, recommendedTarget: null, userTarget: null, rationale: "RPM goals help separate pure view growth from revenue efficiency.", source: "default" },
]

const defaultContext: AiBrainContext = {
 channelDescription: "",
 mainTopicFocus: "",
 audienceDescription: "",
 successDefinition: "",
 mainYoutubeGoal: "",
 recurringSeriesName: "",
 recurringSeriesDescription: "",
 biggestWeakness: "",
 mostSuccessfulVideo: "",
 signupReason: "",
 whatNext: "",
 primaryGoal: "views",
 audienceNiche: "",
 oneMonthGoals: defaultGoalTargets(),
 completedAt: null,
 deferredAt: null,
 updatedAt: null,
 source: "system",
 version: 2,
}

const clean = (value: unknown): string => String(value || "").replace(/\s+/g, " ").trim()

const normalizePrimaryGoal = (value: unknown): BrainPrimaryGoal => {
 const allowed: BrainPrimaryGoal[] = ["views", "subscribers", "revenue", "retention", "consistency", "watch_time", "output", "engagement", "comments", "ctr", "rpm"]
 return allowed.includes(value as BrainPrimaryGoal) ? (value as BrainPrimaryGoal) : "views"
}

const normalizeGoalTargets = (value: unknown): AiBrainGoalTarget[] => {
 const defaults = defaultGoalTargets()
 if (!Array.isArray(value)) return defaults
 const byMetric = new Map(defaults.map((goal) => [goal.metric, goal]))
 value.forEach((entry) => {
  if (!entry || typeof entry !== "object") return
  const target = entry as Partial<AiBrainGoalTarget>
  if (!target.metric || !byMetric.has(target.metric)) return
  const current = byMetric.get(target.metric)!
  byMetric.set(target.metric, {
   ...current,
   ...target,
   label: clean(target.label) || current.label,
   currentValue: typeof target.currentValue === "number" && Number.isFinite(target.currentValue) ? target.currentValue : current.currentValue,
   recommendedTarget: typeof target.recommendedTarget === "number" && Number.isFinite(target.recommendedTarget) ? target.recommendedTarget : current.recommendedTarget,
   userTarget: typeof target.userTarget === "number" && Number.isFinite(target.userTarget) ? target.userTarget : current.userTarget,
   rationale: clean(target.rationale) || current.rationale,
   source: target.source || current.source,
  })
 })
 return Array.from(byMetric.values())
}

const normalizeContext = (parsed: Partial<AiBrainContext> = {}): AiBrainContext => {
 const legacyWhatNext = clean(parsed.whatNext)
 const legacyAudience = clean(parsed.audienceNiche)
 return {
  ...defaultContext,
  channelDescription: clean(parsed.channelDescription),
  mainTopicFocus: clean(parsed.mainTopicFocus || legacyAudience),
  audienceDescription: clean(parsed.audienceDescription || legacyAudience),
  successDefinition: clean(parsed.successDefinition || legacyWhatNext),
  mainYoutubeGoal: clean(parsed.mainYoutubeGoal || legacyWhatNext),
  recurringSeriesName: clean(parsed.recurringSeriesName),
  recurringSeriesDescription: clean(parsed.recurringSeriesDescription),
  biggestWeakness: clean(parsed.biggestWeakness),
  mostSuccessfulVideo: clean(parsed.mostSuccessfulVideo),
  signupReason: clean(parsed.signupReason),
  whatNext: legacyWhatNext,
  primaryGoal: normalizePrimaryGoal(parsed.primaryGoal),
  audienceNiche: legacyAudience,
  oneMonthGoals: normalizeGoalTargets(parsed.oneMonthGoals),
  completedAt: parsed.completedAt || null,
  deferredAt: parsed.deferredAt || null,
  updatedAt: parsed.updatedAt || parsed.completedAt || null,
  source: parsed.version === 2 ? parsed.source || "system" : "legacy",
  version: 2,
 }
}

export const loadAiBrainContext = (): AiBrainContext => {
 try {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return defaultContext
  return normalizeContext(JSON.parse(raw) as Partial<AiBrainContext>)
 } catch {
  return defaultContext
 }
}

export const saveAiBrainContext = (next: AiBrainContextInput): AiBrainContext => {
 const previous = loadAiBrainContext()
 const updatedAt = new Date().toISOString()
 const payload = normalizeContext({
  ...previous,
  ...next,
  whatNext: clean(next.whatNext ?? next.mainYoutubeGoal ?? previous.whatNext),
  primaryGoal: normalizePrimaryGoal(next.primaryGoal || previous.primaryGoal),
  audienceNiche: clean(next.audienceNiche ?? next.mainTopicFocus ?? previous.audienceNiche),
  oneMonthGoals: normalizeGoalTargets(next.oneMonthGoals || previous.oneMonthGoals),
  completedAt: updatedAt,
  deferredAt: null,
  updatedAt,
  source: next.source || "wizard",
  version: 2,
 })
 localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
 localStorage.setItem(COMPLETED_KEY, "true")
 localStorage.removeItem(DISMISSED_KEY)
 return payload
}

export const hasCompletedAiBrainContext = (): boolean =>
 localStorage.getItem(COMPLETED_KEY) === "true" || Boolean(loadAiBrainContext().completedAt)

export const shouldShowAiBrainIntake = (isAuthenticated: boolean): boolean => {
 if (!isAuthenticated) return false
 if (hasCompletedAiBrainContext()) return false
 if (localStorage.getItem(DISMISSED_KEY) === "true") return false
 const hasSignupEmail = clean(localStorage.getItem("vt_signup_email")).length > 0
 const hasKnownEmail = clean(localStorage.getItem("vt_known_user_email")).length > 0
 return hasSignupEmail || hasKnownEmail
}

export const dismissAiBrainIntake = (): void => {
 const current = loadAiBrainContext()
 const deferredAt = new Date().toISOString()
 localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, deferredAt, updatedAt: deferredAt }))
 localStorage.setItem(DISMISSED_KEY, "true")
}
