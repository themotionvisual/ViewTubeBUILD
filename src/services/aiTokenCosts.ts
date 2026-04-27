export const AI_TOKEN_COSTS = {
  thumbnailGenerate: 8,
  thumbnailAnalyze: 5,
  thumbnailAbPredict: 5,
  tagSuggestions: 1,
  askMeQuestion: 1,
  dailyOracleRefresh: 1,
  titleRewrite: 1,
  hashtagAnalyze: 1,
  commentMagicDraftPerThread: 1,
} as const

export type AiTokenCostKey = keyof typeof AI_TOKEN_COSTS

export const getAiTokenCost = (key: AiTokenCostKey): number => AI_TOKEN_COSTS[key]
