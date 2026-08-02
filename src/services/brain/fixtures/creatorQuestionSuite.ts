// TEST-ONLY — see ./types.ts. Not importable by shipped application code.

import type { AIBrainAnswerModule, CreatorBrainResponse } from "../../../types"

/** Evidence a good answer to a scenario should draw on. */
export type BrainScenarioEvidenceType = "top_videos" | "search_terms" | "clusters" | "goal" | "none"

export interface BrainGoldenScenario {
 id: string
 /** Which canonical fixture this question is asked against. */
 fixtureId: string
 question: string
 /** The question family, for coverage tracking. One of QUESTION_FAMILIES. */
 family: string
 /** The response mode the Brain should route this question to. */
 expectedIntent: CreatorBrainResponse["mode"]
 requiredEvidenceTypes: BrainScenarioEvidenceType[]
 /** Module kinds a good answer may include. Enforced once producers tag `kind` (Phase 8.4). */
 expectedModuleKinds?: NonNullable<AIBrainAnswerModule["kind"]>[]
 forbiddenModuleKinds?: NonNullable<AIBrainAnswerModule["kind"]>[]
 /** Whether a single clarifying follow-up question is acceptable here. */
 mayAskQuestion: boolean
 /** Whether routing to a reviewed tool handoff is acceptable here. */
 mayOfferHandoff: boolean
}

/** The 20 question families the suite must cover (handoff §8.2). */
export const QUESTION_FAMILIES = [
 "clearest_niche",
 "best_video",
 "views_up",
 "views_down",
 "publish_next",
 "daily_oracle",
 "retention",
 "packaging",
 "seo",
 "subscribers",
 "revenue",
 "goal_pace",
 "shorts",
 "series",
 "audience_request",
 "schedule",
 "repeat_winners",
 "repair_weak",
 "what_needed",
 "highest_leverage",
] as const

/**
 * At least 24 scenarios across all four fixtures. Each question's wording is chosen so
 * the Brain's own intent detector routes it to `expectedIntent`; the suite test proves
 * that mapping holds, so drift in either the questions or the router is caught.
 */
export const CREATOR_QUESTION_SUITE: BrainGoldenScenario[] = [
 // --- Restoration (rich) ---
 { id: "rest-niche", fixtureId: "restoration-rich", family: "clearest_niche", question: "What is my clearest niche right now?", expectedIntent: "strategy_brief", requiredEvidenceTypes: ["clusters"], mayAskQuestion: false, mayOfferHandoff: false },
 { id: "rest-best-video", fixtureId: "restoration-rich", family: "best_video", question: "What is my best performing video and why did it work?", expectedIntent: "analytics_diagnosis", requiredEvidenceTypes: ["top_videos"], mayAskQuestion: false, mayOfferHandoff: false },
 { id: "rest-views-up", fixtureId: "restoration-rich", family: "views_up", question: "Why did my views rise this month?", expectedIntent: "analytics_diagnosis", requiredEvidenceTypes: ["top_videos"], mayAskQuestion: false, mayOfferHandoff: false },
 { id: "rest-views-down", fixtureId: "restoration-rich", family: "views_down", question: "Why did my views fall recently?", expectedIntent: "analytics_diagnosis", requiredEvidenceTypes: ["top_videos"], mayAskQuestion: false, mayOfferHandoff: false },
 { id: "rest-publish-next", fixtureId: "restoration-rich", family: "publish_next", question: "What video idea should I make next?", expectedIntent: "video_idea_sprint", requiredEvidenceTypes: ["clusters"], mayAskQuestion: false, mayOfferHandoff: true },
 { id: "rest-retention", fixtureId: "restoration-rich", family: "retention", question: "How can I improve retention?", expectedIntent: "analytics_diagnosis", requiredEvidenceTypes: ["top_videos"], mayAskQuestion: false, mayOfferHandoff: false },
 { id: "rest-packaging", fixtureId: "restoration-rich", family: "packaging", question: "What title and thumbnail should I test?", expectedIntent: "seo_keyword_plan", requiredEvidenceTypes: ["clusters"], mayAskQuestion: false, mayOfferHandoff: true },
 { id: "rest-seo", fixtureId: "restoration-rich", family: "seo", question: "What SEO opportunity should I pursue?", expectedIntent: "seo_keyword_plan", requiredEvidenceTypes: ["search_terms"], mayAskQuestion: false, mayOfferHandoff: true },
 { id: "rest-subs", fixtureId: "restoration-rich", family: "subscribers", question: "How do I turn more viewers into subscribers?", expectedIntent: "audience_insight", requiredEvidenceTypes: ["top_videos"], mayAskQuestion: false, mayOfferHandoff: false },
 { id: "rest-revenue", fixtureId: "restoration-rich", family: "revenue", question: "How can I increase revenue?", expectedIntent: "revenue_levers", requiredEvidenceTypes: ["top_videos"], mayAskQuestion: false, mayOfferHandoff: false },
 { id: "rest-goal-pace", fixtureId: "restoration-rich", family: "goal_pace", question: "Am I on pace for my goal this month?", expectedIntent: "goal_coach", requiredEvidenceTypes: ["goal"], mayAskQuestion: false, mayOfferHandoff: false },
 { id: "rest-shorts", fixtureId: "restoration-rich", family: "shorts", question: "Should I publish more Shorts?", expectedIntent: "publishing_checklist", requiredEvidenceTypes: ["top_videos"], mayAskQuestion: false, mayOfferHandoff: false },
 { id: "rest-series", fixtureId: "restoration-rich", family: "series", question: "What series should I create?", expectedIntent: "video_idea_sprint", requiredEvidenceTypes: ["clusters"], mayAskQuestion: false, mayOfferHandoff: true },
 { id: "rest-audience", fixtureId: "restoration-rich", family: "audience_request", question: "What audience request keeps coming up for me?", expectedIntent: "audience_insight", requiredEvidenceTypes: ["clusters"], mayAskQuestion: true, mayOfferHandoff: false },
 { id: "rest-schedule", fixtureId: "restoration-rich", family: "schedule", question: "How should I improve my upload schedule?", expectedIntent: "publishing_checklist", requiredEvidenceTypes: ["top_videos"], mayAskQuestion: false, mayOfferHandoff: false },
 { id: "rest-repeat", fixtureId: "restoration-rich", family: "repeat_winners", question: "What pattern should I repeat from my recent winners?", expectedIntent: "strategy_brief", requiredEvidenceTypes: ["top_videos"], mayAskQuestion: false, mayOfferHandoff: false },
 { id: "rest-repair", fixtureId: "restoration-rich", family: "repair_weak", question: "Which of my weaker videos should I fix first?", expectedIntent: "strategy_brief", requiredEvidenceTypes: ["top_videos"], mayAskQuestion: false, mayOfferHandoff: false },
 { id: "rest-daily-oracle", fixtureId: "restoration-rich", family: "daily_oracle", question: "Run my Daily Oracle for today.", expectedIntent: "goal_coach", requiredEvidenceTypes: ["top_videos"], mayAskQuestion: false, mayOfferHandoff: false },
 { id: "rest-what-needed", fixtureId: "restoration-rich", family: "what_needed", question: "What do you still need to know about my channel?", expectedIntent: "strategy_brief", requiredEvidenceTypes: ["none"], mayAskQuestion: true, mayOfferHandoff: false },
 { id: "rest-leverage", fixtureId: "restoration-rich", family: "highest_leverage", question: "Summarize the one highest-leverage action for today.", expectedIntent: "goal_coach", requiredEvidenceTypes: ["top_videos"], mayAskQuestion: false, mayOfferHandoff: false },

 // --- Military history (rich) — cross-channel differentiation ---
 { id: "mil-best-video", fixtureId: "military-history-rich", family: "best_video", question: "What is my best performing video and why did it work?", expectedIntent: "analytics_diagnosis", requiredEvidenceTypes: ["top_videos"], mayAskQuestion: false, mayOfferHandoff: false },
 { id: "mil-revenue", fixtureId: "military-history-rich", family: "revenue", question: "How do I grow ad and membership revenue?", expectedIntent: "revenue_levers", requiredEvidenceTypes: ["top_videos"], mayAskQuestion: false, mayOfferHandoff: false },
 { id: "mil-niche", fixtureId: "military-history-rich", family: "clearest_niche", question: "What is my clearest niche?", expectedIntent: "strategy_brief", requiredEvidenceTypes: ["clusters"], mayAskQuestion: false, mayOfferHandoff: false },

 // --- Gaming (sparse) — cautious, useful, asks for what's missing ---
 { id: "game-focus", fixtureId: "gaming-sparse", family: "clearest_niche", question: "What should I focus on with such a small channel?", expectedIntent: "strategy_brief", requiredEvidenceTypes: ["clusters"], mayAskQuestion: true, mayOfferHandoff: false },
 { id: "game-goal", fixtureId: "gaming-sparse", family: "goal_pace", question: "What goal should I set this month?", expectedIntent: "goal_coach", requiredEvidenceTypes: ["none"], mayAskQuestion: true, mayOfferHandoff: false },

 // --- Empty channel — names what's missing, invents nothing ---
 { id: "empty-start", fixtureId: "empty-channel", family: "what_needed", question: "How do I get started?", expectedIntent: "strategy_brief", requiredEvidenceTypes: ["none"], mayAskQuestion: true, mayOfferHandoff: false },
]
