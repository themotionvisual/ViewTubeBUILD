import type {
  ContentAnalysisMode,
  ContentAnalysisResult,
  RetentionDataPoint,
  RetentionMeasurementResult,
  RetentionPredictionResult,
  ToolInspiredPromptPack,
} from "../types"

export const sampleRetentionPoints = (
  points: RetentionDataPoint[],
  step = 0.05,
): RetentionDataPoint[] => {
  if (!Array.isArray(points) || points.length === 0) return []
  const sampled = points.filter((point) => {
    const percentage = Math.round(Number(point.elapsedVideoTimeRatio || 0) * 100)
    return percentage % Math.round(step * 100) === 0
  })
  return sampled.length > 0 ? sampled : points
}

const formatPct = (value: number | undefined | null) =>
  `${Number.isFinite(Number(value)) ? Number(value).toFixed(1) : "0.0"}%`

export const buildRetentionMeasurementResult = (
  sampledPoints: RetentionDataPoint[],
): RetentionMeasurementResult | undefined => {
  if (!sampledPoints.length) return undefined
  const introPoint = sampledPoints.find((point) => point.elapsedVideoTimeRatio >= 0.2) || sampledPoints[Math.min(4, sampledPoints.length - 1)]
  const midPoint = sampledPoints.find((point) => point.elapsedVideoTimeRatio >= 0.5) || sampledPoints[Math.floor(sampledPoints.length / 2)]
  const outroPoint = sampledPoints.find((point) => point.elapsedVideoTimeRatio >= 0.8) || sampledPoints[sampledPoints.length - 1]
  const start = sampledPoints[0]
  const end = sampledPoints[sampledPoints.length - 1]

  return {
    sampledPoints,
    introDropoffSummary: `Intro retention moves from ${formatPct(start?.audienceWatchRatio)} to ${formatPct(introPoint?.audienceWatchRatio)} by the 20% mark.`,
    plateauSummary: `Mid-video stability settles around ${formatPct(midPoint?.audienceWatchRatio)} with relative retention near ${Number(midPoint?.relativeRetentionPerformance || 0).toFixed(2)}.`,
    outroSummary: `Late-video retention ends near ${formatPct(end?.audienceWatchRatio)} with the final major checkpoint around ${formatPct(outroPoint?.audienceWatchRatio)}.`,
    relativePerformanceSummary: `Relative retention performance closes at ${Number(end?.relativeRetentionPerformance || 0).toFixed(2)} against comparable videos.`,
    measuredAt: new Date().toISOString(),
  }
}

export const buildRetentionPredictionResult = (
  retentionCurve?: { timePoint: string; retention: number }[],
): RetentionPredictionResult | undefined => {
  if (!Array.isArray(retentionCurve) || retentionCurve.length === 0) return undefined
  const lowPoints = retentionCurve
    .filter((point) => Number(point.retention) <= 45)
    .slice(0, 3)
    .map((point) => `${point.timePoint} (${Math.round(point.retention)}%)`)
  const spikes = retentionCurve
    .filter((point, index, arr) => index > 0 && point.retention > arr[index - 1].retention)
    .slice(0, 3)
    .map((point) => `${point.timePoint} (${Math.round(point.retention)}%)`)

  return {
    summary: `Predicted retention stays conservative, with likely soft spots around ${lowPoints.join(", ") || "the first transition points"} and stronger moments around ${spikes.join(", ") || "the clearest narrative payoffs"}.`,
    confidence: retentionCurve.length >= 6 ? "medium" : "low",
    likelyDropoffMoments: lowPoints,
    likelySpikeMoments: spikes,
    basis: [
      "uploaded media pacing",
      "script structure",
      "brain context",
      "channel-history prompts when available",
    ],
  }
}

export const buildChannelHistorySummary = (
  recentVideos: Array<{ title: string; publishedAt?: string }>,
): string => {
  if (!recentVideos.length) return ""
  return recentVideos
    .slice(0, 5)
    .map((video, index) => {
      const stamp = video.publishedAt ? ` (${video.publishedAt.slice(0, 10)})` : ""
      return `${index + 1}. ${video.title}${stamp}`
    })
    .join("\n")
}

const summarizeAnalysis = (result: Pick<ContentAnalysisResult, "analysis" | "strategicAnalysis">) =>
  [result.analysis, result.strategicAnalysis].filter(Boolean).join("\n\n").trim()

export const buildInspiredPromptPack = (
  result: Pick<
    ContentAnalysisResult,
    | "analysis"
    | "strategicAnalysis"
    | "retentionMeasurement"
    | "retentionPrediction"
    | "publishedVideo"
    | "mode"
  >,
  context: {
    concept?: string
    niche?: string
    audience?: string
    transcriptText?: string
  },
): ToolInspiredPromptPack => {
  const diagnosis = summarizeAnalysis(result)
  const retentionSummary =
    result.retentionMeasurement?.introDropoffSummary ||
    result.retentionPrediction?.summary ||
    "No retention summary available."
  const identity = [
    context.concept ? `Concept: ${context.concept}` : "",
    context.niche ? `Niche: ${context.niche}` : "",
    context.audience ? `Audience: ${context.audience}` : "",
    result.publishedVideo?.title ? `Video: ${result.publishedVideo.title}` : "",
    `Mode: ${result.mode}`,
  ]
    .filter(Boolean)
    .join("\n")

  const transcriptFragment = context.transcriptText
    ? `Transcript Excerpt:\n${context.transcriptText.slice(0, 1200)}`
    : ""

  return {
    publisherPrompt: `${identity}\n\nUse this content analysis to package the upload for maximum clarity and retention.\n\nDiagnosis:\n${diagnosis}\n\nRetention:\n${retentionSummary}\n\n${transcriptFragment}`.trim(),
    managerPrompt: `${identity}\n\nUse this content analysis to recommend the best metadata, comments, descriptions, chapters, and update actions for the live video.\n\nDiagnosis:\n${diagnosis}\n\nRetention:\n${retentionSummary}`.trim(),
    hookPrompt: `${identity}\n\nGenerate sharper opening hooks and first-15-second rewrites based on this analysis.\n\nDiagnosis:\n${diagnosis}\n\nRetention:\n${retentionSummary}\n\n${transcriptFragment}`.trim(),
    thumbnailPrompt: `${identity}\n\nGenerate thumbnail guidance and packaging ideas that correct the biggest click/expectation mismatch from this analysis.\n\nDiagnosis:\n${diagnosis}\n\nRetention:\n${retentionSummary}`.trim(),
    tacticsPrompt: `${identity}\n\nGenerate actionable tactics for improving future content based on this analysis.\n\nDiagnosis:\n${diagnosis}\n\nRetention:\n${retentionSummary}`.trim(),
  }
}

export const buildRetentionResultTable = (points: RetentionDataPoint[]) => ({
  kind: "youtubeAnalytics#resultTable",
  columnHeaders: [
    {
      name: "elapsedVideoTimeRatio",
      columnType: "DIMENSION",
      dataType: "FLOAT",
    },
    {
      name: "audienceWatchRatio",
      columnType: "METRIC",
      dataType: "FLOAT",
    },
    {
      name: "relativeRetentionPerformance",
      columnType: "METRIC",
      dataType: "FLOAT",
    },
  ],
  rows: points.map((point) => [
    point.elapsedVideoTimeRatio,
    point.audienceWatchRatio,
    point.relativeRetentionPerformance,
  ]),
})

export const buildContentAnalysisStoragePayload = (
  result: ContentAnalysisResult,
  extra: {
    concept?: string
    niche?: string
    audience?: string
    script?: string
    directive?: string
    transcriptText?: string
  },
) => ({
  createdAt: new Date().toISOString(),
  concept: extra.concept || "",
  niche: extra.niche || "",
  audience: extra.audience || "",
  script: extra.script || "",
  directive: extra.directive || "",
  transcriptText: extra.transcriptText || result.transcript?.text || "",
  analysis: result.analysis,
  strategicAnalysis: result.strategicAnalysis || "",
  mode: result.mode,
  inspiredPrompts: result.inspiredPrompts,
  retentionMeasurement: result.retentionMeasurement,
  retentionPrediction: result.retentionPrediction,
})

export const createEmptyAnalysisResult = (
  mode: ContentAnalysisMode,
): ContentAnalysisResult => ({
  mode,
  analysis: "",
  strategicAnalysis: "",
  suggestions: [],
  retentionCurve: [],
  sourcesUsed: [],
})
