import { generateArchitectDiagnosis, generateKeywordResearch, generateOracleReport } from "./gemini";
import type {
  AlgorithmDiagnosis,
  ChartConfig,
  KeywordAnalysis,
  OracleSection,
  OracleReport,
  UltimateChannelReport,
  UltimateReportBlock,
  UnifiedTableSpec,
} from "./types";

type GenerateUltimateReportInput = {
  manualIntent?: string;
  autoContext?: string;
  dataSources?: string[];
};

const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const toFiniteNumber = (value: unknown, fallback = 0): number => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const toChartSuggestion = (value: unknown): ChartConfig | undefined => {
  const raw = toRecord(value);
  if (!raw.type || !raw.title || !raw.xAxisKey || !Array.isArray(raw.dataKeys)) return undefined;
  return {
    type: String(raw.type) as ChartConfig["type"],
    title: String(raw.title),
    xAxisKey: String(raw.xAxisKey),
    dataKeys: raw.dataKeys.map((entry) => String(entry)),
    description: raw.description ? String(raw.description) : undefined,
    provider: raw.provider === "google" ? "google" : "recharts",
    zAxisKey: raw.zAxisKey ? String(raw.zAxisKey) : undefined,
    videoCount: raw.videoCount ? toFiniteNumber(raw.videoCount) : undefined,
    sortType: raw.sortType as ChartConfig["sortType"] | undefined,
    durationType: raw.durationType as ChartConfig["durationType"] | undefined,
  };
};

const normalizeOracleSection = (value: unknown): OracleSection | null => {
  const raw = toRecord(value);
  const title = String(raw.title || raw.heading || "");
  const content = String(raw.content || raw.summary || raw.body || "");
  if (!title && !content) return null;
  return {
    title: title || "Untitled Section",
    content,
    chartSuggestion: toChartSuggestion(raw.chartSuggestion),
  };
};

const normalizeOracleReport = (input: unknown): OracleReport => {
  const raw = toRecord(input);
  const directSections = Array.isArray(raw.sections) ? raw.sections : [];
  const blockSections = Array.isArray(raw.blocks)
    ? raw.blocks.map((block) => {
        const entry = toRecord(block);
        return {
          title: entry.title || entry.heading || "Block",
          content: entry.summary || entry.content || "",
          chartSuggestion: entry.chartSuggestion,
        };
      })
    : [];
  const insightSections = Array.isArray(raw.insights)
    ? raw.insights.map((entry) => {
        const insight = toRecord(entry);
        return {
          title: insight.title || insight.name || "Insight",
          content: insight.content || insight.summary || "",
          chartSuggestion: insight.chartSuggestion,
        };
      })
    : [];
  const mergedSections = [...directSections, ...blockSections, ...insightSections]
    .map(normalizeOracleSection)
    .filter((section): section is OracleSection => Boolean(section));

  if (!Array.isArray(raw.sections)) {
    console.warn("[UltimateReport] Oracle response missing sections; using fallback shape.");
  }

  const statsRaw = toRecord(raw.stats);
  const stats = Object.fromEntries(
    Object.entries(statsRaw).map(([key, value]) => [key, toFiniteNumber(value)]),
  ) as Record<string, number>;

  return {
    executiveSummary: String(raw.executiveSummary || raw.summary || ""),
    sections: mergedSections,
    stats,
  };
};

const normalizeDiagnosis = (input: unknown): AlgorithmDiagnosis => {
  const raw = toRecord(input);
  const dailyBriefRaw = toRecord(raw.dailyBrief);
  const stepsRaw = Array.isArray(dailyBriefRaw.steps)
    ? dailyBriefRaw.steps.map((step) => String(step).trim()).filter(Boolean)
    : [];
  const audienceDNA = Array.isArray(raw.audienceDNA)
    ? raw.audienceDNA
        .map((entry) => {
          const point = toRecord(entry);
          return {
            interest: String(point.interest || point.label || ""),
            overlap: toFiniteNumber(point.overlap),
          };
        })
        .filter((entry) => entry.interest.length > 0)
    : [];
  return {
    clusterCenter: String(raw.clusterCenter || "Unknown"),
    nicheAuthority: toFiniteNumber(raw.nicheAuthority),
    audienceDNA,
    hiddenStory: String(raw.hiddenStory || raw.summary || ""),
    dailyBrief: {
      priority: String(dailyBriefRaw.priority || "No priority generated."),
      impact: String(dailyBriefRaw.impact || "No impact summary generated."),
      steps: stepsRaw,
    },
  };
};

const normalizeKeywordAnalysis = (input: unknown): KeywordAnalysis => {
  const raw = toRecord(input);
  const rowsOf = (value: unknown): Array<Record<string, unknown>> =>
    Array.isArray(value) ? value.map(toRecord) : [];
  return {
    marketAnalysis: String(raw.marketAnalysis || raw.summary || ""),
    trendData: rowsOf(raw.trendData).map((entry) => ({
      month: String(entry.month || ""),
      google: toFiniteNumber(entry.google),
      youtube: toFiniteNumber(entry.youtube),
    })),
    keywordMetrics: rowsOf(raw.keywordMetrics).map((entry) => ({
      keyword: String(entry.keyword || ""),
      volume: toFiniteNumber(entry.volume),
      difficulty: toFiniteNumber(entry.difficulty),
      relevance: toFiniteNumber(entry.relevance),
    })),
    contentFormats: rowsOf(raw.contentFormats).map((entry) => ({
      name: String(entry.name || entry.format || ""),
      percentage: toFiniteNumber(entry.percentage),
    })),
    sentimentAnalysis: rowsOf(raw.sentimentAnalysis).map((entry) => ({
      emotion: String(entry.emotion || ""),
      score: toFiniteNumber(entry.score),
    })),
    demographics: rowsOf(raw.demographics).map((entry) => ({
      group: String(entry.group || ""),
      percentage: toFiniteNumber(entry.percentage),
    })),
    lsiKeywords: Array.isArray(raw.lsiKeywords) ? raw.lsiKeywords.map((entry) => String(entry)) : [],
    longTailKeywords: Array.isArray(raw.longTailKeywords)
      ? raw.longTailKeywords.map((entry) => String(entry))
      : [],
    searchIntent: rowsOf(raw.searchIntent).map((entry) => ({
      query: String(entry.query || ""),
      intent: String(entry.intent || ""),
      contentAngle: String(entry.contentAngle || ""),
    })),
    viralHooks: Array.isArray(raw.viralHooks) ? raw.viralHooks.map((entry) => String(entry)) : [],
    retentionForecast: rowsOf(raw.retentionForecast).map((entry) => ({
      second: toFiniteNumber(entry.second),
      user: toFiniteNumber(entry.user),
      average: toFiniteNumber(entry.average),
    })),
    competitorScores: rowsOf(raw.competitorScores).map((entry) => ({
      metric: String(entry.metric || ""),
      user: toFiniteNumber(entry.user),
      competitor: toFiniteNumber(entry.competitor),
    })),
    ctrPowerWords: Array.isArray(raw.ctrPowerWords) ? raw.ctrPowerWords.map((entry) => String(entry)) : [],
    formatRoi: rowsOf(raw.formatRoi).map((entry) => ({
      format: String(entry.format || ""),
      effort: toFiniteNumber(entry.effort),
      potential: toFiniteNumber(entry.potential),
    })),
  };
};

const sectionByMatch = (report: OracleReport, ...tokens: string[]) => {
  const upperTokens = tokens.map((token) => token.toUpperCase());
  const sections = report.sections ?? [];
  return sections.find((section) =>
    upperTokens.some((token) => String(section.title || "").toUpperCase().includes(token)),
  );
};

const buildComparativeGrid = (report: OracleReport, keywordData: KeywordAnalysis): UnifiedTableSpec => {
  const stats = report.stats || {};
  const formatRows = keywordData.contentFormats.slice(0, 4).map((entry) => [
    entry.name,
    `${entry.percentage.toFixed(1)}%`,
  ]);
  return {
    title: "Comparative Analytics Grid",
    headers: ["Dimension", "Value", "Evidence"],
    rows: [
      ["Total Views", Number(stats.views || 0).toLocaleString(), "Oracle Stats"],
      ["CTR", `${Number(stats.ctr || 0).toFixed(2)}%`, "Oracle Stats"],
      ["Subscribers", Number(stats.subscribers || 0).toLocaleString(), "Oracle Stats"],
      ["Revenue", `$${Number(stats.revenue || 0).toFixed(2)}`, "Oracle Stats"],
      ...formatRows.map((row) => [`Format Mix: ${row[0]}`, row[1], "Keyword Lab"]),
    ],
  };
};

const buildExecutionQueue = (diagnosis: AlgorithmDiagnosis, report: OracleReport): string[] => {
  const actionSection = sectionByMatch(report, "ACTION", "PLAN", "MANDATE");
  const sectionActions = actionSection?.content
    ?.split("\n")
    .map((line) => line.replace(/^\s*[-*]\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 4) || [];
  const dailyBriefSteps = diagnosis.dailyBrief?.steps?.slice(0, 3) || [];
  return [...dailyBriefSteps, ...sectionActions].slice(0, 6);
};

const buildRiskFlags = (report: OracleReport): string[] => {
  const weakness = sectionByMatch(report, "WEAKNESS");
  const retention = sectionByMatch(report, "RETENTION");
  const content = `${weakness?.content || ""}\n${retention?.content || ""}`;
  const raw = content
    .split(/[.\n]/)
    .map((line) => line.trim())
    .filter((line) => line.length > 24)
    .slice(0, 4);
  if (raw.length > 0) return raw;
  return [
    "CTR variability indicates packaging inconsistency across otherwise similar topics.",
    "Retention decay in early sequence suggests hook and transition mismatch.",
  ];
};

const mapToBlocks = (
  diagnosis: AlgorithmDiagnosis,
  report: OracleReport,
  keywordData: KeywordAnalysis,
): UltimateReportBlock[] => {
  const honesty = sectionByMatch(report, "HONEST");
  const growth = sectionByMatch(report, "GROWTH");
  const weakness = sectionByMatch(report, "WEAKNESS");
  const engagement = sectionByMatch(report, "ENGAGEMENT");
  const velocity = sectionByMatch(report, "VELOCITY");
  const monetization = sectionByMatch(report, "MONETIZATION");
  const retention = sectionByMatch(report, "RETENTION");

  const opportunityTable: UnifiedTableSpec = {
    title: "Keyword Opportunities",
    headers: ["Keyword", "Volume", "Difficulty", "Relevance"],
    rows: keywordData.keywordMetrics.slice(0, 8).map((entry) => [
      entry.keyword,
      entry.volume,
      entry.difficulty,
      entry.relevance,
    ]),
  };

  const demographicTable: UnifiedTableSpec = {
    title: "Audience Demographic Intelligence",
    headers: ["Group", "Share"],
    rows: keywordData.demographics.slice(0, 8).map((entry) => [
      entry.group,
      `${entry.percentage.toFixed(1)}%`,
    ]),
  };

  const formatTable: UnifiedTableSpec = {
    title: "Format Opportunity Matrix",
    headers: ["Format", "Effort", "Potential"],
    rows: keywordData.formatRoi.slice(0, 8).map((entry) => [
      entry.format,
      entry.effort,
      entry.potential,
    ]),
  };

  return [
    {
      id: "1",
      title: "Executive Command Snapshot",
      summary: report.executiveSummary || diagnosis.hiddenStory || "No executive summary available.",
      recommendations: diagnosis.dailyBrief?.steps?.slice(0, 3) || [],
    },
    {
      id: "2",
      title: "Neural Nexus Context + Channel Mission",
      summary: diagnosis.hiddenStory || "Neural Nexus context generated from latest channel signals.",
      recommendations: ["Use this mission context as the baseline for all content decisions this cycle."],
    },
    {
      id: "3",
      title: "Algorithm Fingerprint",
      summary: `Cluster center: ${diagnosis.clusterCenter || "Unknown"}. Niche authority: ${diagnosis.nicheAuthority || 0}%.`,
      recommendations: ["Double down on high-authority clusters and remove low-alignment experiments."],
    },
    {
      id: "4",
      title: "Performance Truth Layer",
      summary: `${honesty?.content || ""}\n${weakness?.content || ""}\n${engagement?.content || ""}`.trim(),
      recommendations: ["Align packaging promise to actual viewer payoff in first 30 seconds."],
      chartSuggestion: honesty?.chartSuggestion || weakness?.chartSuggestion || engagement?.chartSuggestion,
    },
    {
      id: "5",
      title: "Retention & Viewer Quality",
      summary: retention?.content || "Retention profile unavailable; fallback to engagement trend quality.",
      recommendations: ["Improve intro transitions and mid-video pacing where drop-offs are concentrated."],
      chartSuggestion: retention?.chartSuggestion,
    },
    {
      id: "6",
      title: "Traffic & Discovery Dynamics",
      summary: growth?.content || "Traffic and discovery dynamics inferred from growth cluster behavior.",
      recommendations: ["Protect strongest discovery channels while testing one secondary source at a time."],
      chartSuggestion: growth?.chartSuggestion,
    },
    {
      id: "7",
      title: "Audience & Demographic Intelligence",
      summary: "Audience composition synthesized from demographic, engagement, and intent layers.",
      recommendations: ["Prioritize content packaging for highest share demographic first."],
      tableSpec: demographicTable,
    },
    {
      id: "8",
      title: "Content & Format Opportunity Matrix",
      summary: keywordData.marketAnalysis || "Format opportunity analysis unavailable.",
      recommendations: ["Scale high-potential formats and reduce production effort on low-yield formats."],
      chartSuggestion: {
        type: "bar",
        title: "Format ROI",
        xAxisKey: "format",
        dataKeys: ["potential", "effort"],
        description: "Potential vs effort by format.",
        provider: "recharts",
      },
      tableSpec: formatTable,
    },
    {
      id: "9",
      title: "Revenue & Monetization Engine",
      summary: monetization?.content || "Monetization profile synthesized from RPM and revenue patterns.",
      recommendations: ["Expand formats with stable RPM and stronger retention efficiency."],
      chartSuggestion: monetization?.chartSuggestion,
    },
    {
      id: "10",
      title: "Keyword & Market Intelligence",
      summary: keywordData.marketAnalysis || "Keyword intelligence unavailable.",
      recommendations: keywordData.longTailKeywords.slice(0, 3).map((keyword) => `Test long-tail concept: ${keyword}`),
      chartSuggestion: {
        type: "scatter",
        title: "Keyword Difficulty vs Volume",
        xAxisKey: "volume",
        dataKeys: ["difficulty"],
        description: "Higher volume with manageable difficulty indicates opportunity.",
        provider: "recharts",
      },
      tableSpec: opportunityTable,
    },
    {
      id: "11",
      title: "Comparative Analytics Grid",
      summary: "Cross-metric ranking grid for rapid scan of growth, quality, and monetization balance.",
      recommendations: ["Use this grid for weekly checks to prioritize action plan sequencing."],
      tableSpec: buildComparativeGrid(report, keywordData),
    },
    {
      id: "12",
      title: "AI Strategy Recommendations",
      summary: "Prioritized recommendations distilled from performance, retention, market, and monetization layers.",
      recommendations: buildExecutionQueue(diagnosis, report),
    },
    {
      id: "13",
      title: "Risk Flags & Guardrails",
      summary: "Primary failure modes identified from weak points in retention, CTR consistency, and dependency concentration.",
      recommendations: buildRiskFlags(report),
    },
    {
      id: "14",
      title: "Execution Queue + Progress Delta",
      summary: "Operational queue for next publishing cycle with baseline for next report delta comparison.",
      recommendations: buildExecutionQueue(diagnosis, report),
    },
  ];
};

export async function generateUltimateChannelReport(
  input: GenerateUltimateReportInput = {},
): Promise<{
  report: UltimateChannelReport;
  diagnosis: AlgorithmDiagnosis;
  oracle: OracleReport;
  keyword: KeywordAnalysis;
  resolvedContext: string;
}> {
  const manualIntent = input.manualIntent?.trim() || "";
  const autoContext = input.autoContext?.trim() || "";
  const resolvedContext =
    manualIntent && autoContext ? `${autoContext}\n\nUSER INTENT OVERRIDE:\n${manualIntent}`
    : manualIntent || autoContext || "Build a complete strategic channel analysis from available channel signals.";
  const contextMode = manualIntent && autoContext ? "hybrid" : manualIntent ? "manual" : "auto";

  const [diagnosisRaw, oracleRaw, keywordRaw] = await Promise.all([
    generateArchitectDiagnosis(resolvedContext),
    generateOracleReport(resolvedContext),
    generateKeywordResearch(resolvedContext, "Auto-Detected Niche"),
  ]);
  const diagnosis = normalizeDiagnosis(diagnosisRaw);
  const oracle = normalizeOracleReport(oracleRaw);
  const keyword = normalizeKeywordAnalysis(keywordRaw);

  const report: UltimateChannelReport = {
    meta: {
      generatedAt: new Date().toISOString(),
      dataSources: input.dataSources?.length ? input.dataSources : ["omni-brain", "analytics-cache", "csv/uploads"],
      contextMode,
    },
    executiveSummary: oracle.executiveSummary || diagnosis.hiddenStory || "No summary returned.",
    blocks: mapToBlocks(diagnosis, oracle, keyword),
    actionPlan: buildExecutionQueue(diagnosis, oracle),
    riskFlags: buildRiskFlags(oracle),
  };

  return { report, diagnosis, oracle, keyword, resolvedContext };
}

export const __test__ = {
  normalizeOracleReport,
  normalizeDiagnosis,
  normalizeKeywordAnalysis,
  sectionByMatch,
};
