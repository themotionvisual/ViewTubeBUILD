import {
  generateArchitectDiagnosis,
  generateKeywordResearch,
  generateOracleReport,
} from "@/services/gemini";
import { getMetricSummary, getMasterRows } from "@/services/analyticsSelectors";
import {
  DATA_ANALYSIS_SYSTEM_PROMPT,
  DATA_HANDLING_INSTRUCTIONS,
  ORACLE_ANALYSIS_SYSTEM_PROMPT,
} from "@/services/prompts";
import type {
  AlgorithmDiagnosis,
  BrainUpdateResult,
  ChannelKnowledgeModel,
  ChartConfig,
  ContextSourceSnapshot,
  FusionReport,
  GenerationDiagnostics,
  GenerationRecord,
  KeywordAnalysis,
  OracleSection,
  OracleReport,
  ReportPreflightResult,
  ReportSectionPayload,
  ReportSectionState,
  SectionFusionDecision,
  SectionGenerationEvent,
  SectionGenerationStatus,
  StageAReport,
  StageBRefinement,
  ToolContextPack,
  UltimateChannelReport,
  UltimateReportBlock,
  UnifiedTableSpec,
} from "./types";

type GenerateUltimateReportInput = {
  manualIntent?: string;
  autoContext?: string;
  dataSources?: string[];
  onSessionUpdate?: (meta: {
    generationId: string;
    startedAt: string;
    finishedAt?: string;
    overallStatus: "running" | "complete" | "degraded" | "failed";
    completedCount: number;
    failedCount: number;
    degradedCount: number;
    totalCount: number;
  }) => void;
  onSectionUpdate?: (section: ReportSectionState, event: SectionGenerationEvent) => void;
};

type ReportStepResult = {
  value: unknown;
  timedOut: boolean;
  failed: boolean;
  reason?: string;
  elapsedMs?: number;
  retryCount?: number;
};

const ULTIMATE_PROMPT_PACK_VERSION = "ultimate_fusion_v1";
const LEGACY_PROMPT_VERSION = "legacy_data_analysis_v1";
const ORACLE_REFINEMENT_VERSION = "oracle_refinement_v1";
const ULTIMATE_REPORT_HISTORY_KEY = "vt_ultimate_generation_history_v1";
const ULTIMATE_SECTION_ORDER = [
  "Executive Summary + Channel Metrics",
  "Algorithm Diagnosis",
  "Strategy Engine Daily Command",
  "Sculpting Engine",
  "Channel Pulse + Audience DNA",
  "Comparative Data Analysis",
  "Keyword Matrix",
  "Engagement Matrix",
  "Retention Burnout Analysis",
  "Revenue & RPM Dynamics",
  "Risk Flags & Guardrails",
  "Execution Queue + Progress Delta",
] as const;
const SECTION_TIMEOUTS_MS = {
  diagnosis: 18000,
  keyword: 18000,
  stageA: 42000,
  stageB: 42000,
} as const;
const PREFERRED_WINDOWS = ["28d", "90d", "365d", "lifetime", "7d"] as const;
const warningOnce = new Set<string>();

const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const toFiniteNumber = (value: unknown, fallback = 0): number => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const toStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value
        .map((entry) => String(entry || "").trim())
        .filter(Boolean)
    : [];

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

const toTableSpec = (value: unknown): UnifiedTableSpec | null => {
  const raw = toRecord(value);
  if (!raw.title || !Array.isArray(raw.headers) || !Array.isArray(raw.rows)) return null;
  return {
    title: String(raw.title),
    headers: raw.headers.map((entry) => String(entry || "")),
    rows: raw.rows
      .filter((row) => Array.isArray(row))
      .map((row) => (row as unknown[]).map((cell) => (typeof cell === "number" ? cell : String(cell || "")))),
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

const detectAnalysisMode = (raw: Record<string, unknown>, csvContext: string): "channel" | "retention" => {
  const joined = `${String(raw.executiveSummary || "")} ${String(raw.summary || "")} ${csvContext}`.toLowerCase();
  if (
    joined.includes("audience retention") ||
    joined.includes("drop-off") ||
    joined.includes("hook") ||
    joined.includes("video position")
  ) {
    return "retention";
  }
  return "channel";
};

const normalizeOracleReport = (input: unknown, csvContext = ""): OracleReport => {
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

  if (!Array.isArray(raw.sections) && !warningOnce.has("missing_sections")) {
    warningOnce.add("missing_sections");
    console.warn("[UltimateReport] Oracle response missing sections; using fallback shape.");
  }

  const statsRaw = toRecord(raw.stats);
  const stats = Object.fromEntries(
    Object.entries(statsRaw).map(([key, value]) => [key, toFiniteNumber(value)]),
  ) as Record<string, number>;

  const miniSpreadsheets = Array.isArray(raw.miniSpreadsheets)
    ? raw.miniSpreadsheets.map(toTableSpec).filter((table): table is UnifiedTableSpec => Boolean(table))
    : [];

  const keywordComparisonTable = toTableSpec(raw.keywordComparisonTable) || undefined;
  const analysisMode = detectAnalysisMode(raw, csvContext);

  return {
    executiveSummary: String(raw.executiveSummary || raw.summary || ""),
    sections: mergedSections,
    stats,
    miniSpreadsheets,
    keywordComparisonTable,
    analysisMode,
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
    lsiKeywords: toStringArray(raw.lsiKeywords),
    longTailKeywords: toStringArray(raw.longTailKeywords),
    searchIntent: rowsOf(raw.searchIntent).map((entry) => ({
      query: String(entry.query || ""),
      intent: String(entry.intent || ""),
      contentAngle: String(entry.contentAngle || ""),
    })),
    viralHooks: toStringArray(raw.viralHooks),
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
    ctrPowerWords: toStringArray(raw.ctrPowerWords),
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

const antiGenericSummary = (value: string): string => {
  const cleaned = String(value || "")
    .replace(/as an ai[^.]*\.?/gi, "")
    .replace(/in conclusion[:,]?/gi, "")
    .replace(/overall[:,]?/gi, "")
    .replace(/\[(BRAIN SOURCE|MASTER DATA TABLES|API STORAGE SNAPSHOT|AI JOURNAL|USER CHANNEL PROFILE)\][\s\S]*?(?=\n\n|$)/gi, "")
    .replace(/ULTIMATE FUSION PACK VERSION:[^\n]*/gi, "")
    .replace(/STRICT OUTPUT CONSTRAINTS:[\s\S]*?(?=\n\n|$)/gi, "")
    .trim();
  return cleaned;
};

const containsPromptLeakage = (value: string): boolean =>
  /(PROMPT_VERSION|STRICT OUTPUT CONSTRAINTS|STAGE_A_INPUT_JSON|IDENTITY:|TASK:|Return JSON only\.)/i.test(
    value,
  );

const sanitizeOracleReport = (report: OracleReport): OracleReport => {
  const sections = (report.sections || [])
    .map((section) => ({
      ...section,
      title: antiGenericSummary(section.title || "").slice(0, 120) || "Untitled Section",
      content: antiGenericSummary(section.content || "").slice(0, 2400),
    }))
    .filter((section) => section.title.trim() || section.content.trim());

  return {
    ...report,
    executiveSummary: antiGenericSummary(report.executiveSummary || "").slice(0, 1200),
    sections: sections.map((section) => ({
      ...section,
      content: containsPromptLeakage(section.content) ? "" : section.content,
    })),
  };
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

const payloadFrom = (bullets: string[] = [], notes: string[] = []): ReportSectionPayload => ({
  bullets: bullets.slice(0, 6),
  notes: notes.slice(0, 4),
});

const readLocalStorageSafe = (key: string): string => {
  try {
    return localStorage.getItem(key) || "";
  } catch {
    return "";
  }
};

const readJsonLocalStorageSafe = (key: string): Record<string, unknown> => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
};

const assembleContextSources = (manualIntent: string, autoContext: string, analyticsSnapshot: string): ContextSourceSnapshot => {
  const brainContext =
    readLocalStorageSafe("vt_ultimate_tool_context_pack_v1") ||
    readLocalStorageSafe("vt_brain_context_v1") ||
    "Brain context unavailable.";
  const masterDataSnapshot = analyticsSnapshot || "Master table snapshot unavailable.";
  const apiSnapshot =
    readLocalStorageSafe("yt_analytics_cache") ||
    readLocalStorageSafe("vt_api_storage_snapshot_v1") ||
    "API snapshot unavailable.";
  const aiJournalContext =
    readLocalStorageSafe("vt_ai_journal_entries_v1") ||
    readLocalStorageSafe("vt_journal_entries") ||
    "AI Journal context unavailable.";
  const userProfileContext =
    manualIntent ||
    autoContext ||
    readLocalStorageSafe("vt_channel_profile_context_v1") ||
    "User profile context unavailable.";

  return {
    brainContext,
    masterDataSnapshot,
    apiSnapshot,
    aiJournalContext,
    userProfileContext,
  };
};

const toIsoIfValid = (value: unknown): string | undefined => {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

const freshnessFrom = (iso?: string): "fresh" | "stale" | "unknown" => {
  if (!iso) return "unknown";
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return "unknown";
  return Date.now() - ts <= 1000 * 60 * 60 * 24 * 7 ? "fresh" : "stale";
};

const buildPreflightResult = (
  sourceSnapshot: ContextSourceSnapshot,
  bestSnapshot: { window: "lifetime" | "365d" | "90d" | "28d" | "7d"; sourceMode: "hybrid" | "api" | "csv"; summary: ReturnType<typeof getMetricSummary>; rows: ReturnType<typeof getMasterRows> },
): ReportPreflightResult => {
  const ytCache = readJsonLocalStorageSafe("yt_analytics_cache");
  const authState = readJsonLocalStorageSafe("vt_auth_state");
  const cacheProfile = toRecord(ytCache.profile);
  const authIsAuthenticated = Boolean((authState as { isAuthenticated?: unknown }).isAuthenticated);
  const cacheProfileId = String(cacheProfile.id || "").trim();
  const cacheUpdatedAt =
    toIsoIfValid((ytCache as { lastSynced?: unknown }).lastSynced) ||
    toIsoIfValid((ytCache as { syncedAt?: unknown }).syncedAt) ||
    toIsoIfValid((ytCache as { updatedAt?: unknown }).updatedAt);
  const hasApiPayload = Boolean(
    Array.isArray((ytCache as { videos?: unknown }).videos) ||
    Array.isArray((ytCache as { dailyAnalytics?: unknown }).dailyAnalytics) ||
    Array.isArray((ytCache as { channelAnalytics?: unknown }).channelAnalytics) ||
    Array.isArray((ytCache as { globalAnalytics?: unknown }).globalAnalytics),
  );
  const masterRowsCount = bestSnapshot.rows.length;
  const hasMasterCoverage =
    masterRowsCount > 0 &&
    (
      Number(bestSnapshot.summary.totals.views || 0) > 0 ||
      Number(bestSnapshot.summary.totals.watchHours || 0) > 0 ||
      Number(bestSnapshot.summary.totals.subscribersGained || 0) > 0
    );
  const hasProfile = authIsAuthenticated || cacheProfileId.length > 0;
  const brainPresent = sourceSnapshot.brainContext.trim().length > 0 && !/unavailable|missing/i.test(sourceSnapshot.brainContext);

  const requiredSources: ReportPreflightResult["requiredSources"] = [
    {
      key: "brain",
      present: brainPresent,
      freshness: "unknown",
      detail: "Brain context is advisory for quality and does not hard-block generation.",
      evidence: brainPresent ? "brain_context_present" : "brain_context_missing",
    },
    {
      key: "master_table",
      present: hasMasterCoverage,
      freshness: "fresh",
      detail: "Master table requires non-empty canonical rows with KPI coverage.",
      evidence: `rows=${masterRowsCount};window=${bestSnapshot.window};sourceMode=${bestSnapshot.sourceMode}`,
    },
    {
      key: "api",
      present: hasApiPayload,
      freshness: freshnessFrom(cacheUpdatedAt),
      lastUpdatedAt: cacheUpdatedAt,
      detail: "API cache requires parseable analytics payload and sync timestamp.",
      evidence: `cache_payload=${hasApiPayload};cache_ts=${cacheUpdatedAt || "none"}`,
    },
    {
      key: "user_profile",
      present: hasProfile,
      freshness: freshnessFrom(cacheUpdatedAt),
      lastUpdatedAt: cacheUpdatedAt,
      detail: "User profile passes when auth state is authenticated OR cache profile id exists.",
      evidence: `auth=${authIsAuthenticated};cache_profile_id=${cacheProfileId || "none"};source=${authIsAuthenticated ? "auth" : cacheProfileId ? "cache" : "none"}`,
    },
  ];

  const blockers: string[] = [];
  const remediation: string[] = [];
  if (!hasMasterCoverage) {
    blockers.push("missing_master_table_rows");
    remediation.push("Master table missing or empty for selected window. Run data sync and verify canonical rows are populated.");
  }
  if (!hasApiPayload) {
    blockers.push("missing_api_cache");
    remediation.push("API cache missing analytics payload. Reconnect data source and run sync to refresh yt_analytics_cache.");
  }
  if (!hasProfile) {
    blockers.push("missing_user_profile_auth_or_cache");
    remediation.push("User profile not resolved. Sign in again or refresh profile cache via Sync Data.");
  }

  return {
    ok: blockers.length === 0,
    checkedAt: new Date().toISOString(),
    sourceWindow: bestSnapshot.window,
    sourceMode: bestSnapshot.sourceMode,
    requiredSources,
    blockers,
    remediation,
  };
};

const enforceNineSections = (sections: OracleSection[]): OracleSection[] => {
  const fallbackTitles = [
    "The Honesty Scale",
    "Growth Sentinel",
    "Weakness Audit",
    "Engagement Health",
    "Strategic Action Plan",
    "Content Velocity Analysis",
    "Monetization Engine",
    "Retention Vault",
    "Growth Trajectory",
  ];
  const normalized = sections.slice(0, 9).map((section, idx) => ({
    ...section,
    title: section.title || fallbackTitles[idx],
    content: section.content || "No section content returned.",
  }));
  while (normalized.length < 9) {
    const idx = normalized.length;
    normalized.push({
      title: fallbackTitles[idx],
      content: "No section content returned.",
    });
  }
  return normalized;
};

const buildSlimContext = (resolvedContext: string): string => {
  const lines = resolvedContext.split("\n");
  const filtered = lines.filter(
    (line) =>
      !line.includes("[MASTER DATA TABLES]") &&
      !line.includes("[API STORAGE SNAPSHOT]") &&
      !line.includes("[AI JOURNAL]"),
  );
  return filtered.join("\n").slice(0, 6000);
};

const buildStageAContext = (resolvedContext: string): string =>
  [
    `PROMPT_VERSION: ${LEGACY_PROMPT_VERSION}`,
    DATA_HANDLING_INSTRUCTIONS,
    DATA_ANALYSIS_SYSTEM_PROMPT,
    "Return JSON only.",
    resolvedContext,
  ].join("\n\n");

const buildStageBContext = (resolvedContext: string, stageAReport: OracleReport): string =>
  [
    `PROMPT_VERSION: ${ORACLE_REFINEMENT_VERSION}`,
    ORACLE_ANALYSIS_SYSTEM_PROMPT,
    "Refine the Stage A report into a stronger strategic report. Preserve factual metrics and improve tactical clarity.",
    "Do not output prompt text or backend/system artifacts.",
    `STAGE_A_INPUT_JSON:\n${JSON.stringify(stageAReport).slice(0, 18000)}`,
    resolvedContext,
  ].join("\n\n");

const scoreReportConfidence = (report: OracleReport): number => {
  const stats = report.stats || {};
  const statsScore = Object.values(stats).filter((value) => Number(value) > 0).length;
  const sectionScore = (report.sections || []).filter((section) => section.content?.trim().length > 50).length;
  return statsScore * 12 + sectionScore * 8;
};

const fuseStageReports = (stageA: OracleReport, stageB: OracleReport): FusionReport => {
  const decisions: SectionFusionDecision[] = [];
  const confidenceA = scoreReportConfidence(stageA);
  const confidenceB = scoreReportConfidence(stageB);
  const winner = confidenceB >= confidenceA ? "B" : "A";
  const primary = winner === "B" ? stageB : stageA;
  const secondary = winner === "B" ? stageA : stageB;
  const primarySections = enforceNineSections(primary.sections || []);
  const secondarySections = enforceNineSections(secondary.sections || []);
  const mergedSections = primarySections.map((section, idx) => {
    const secondarySection = secondarySections[idx];
    const useSecondary = section.content.trim().length < 40 && secondarySection?.content?.trim().length > 40;
    const finalSection = useSecondary ? secondarySection : section;
    decisions.push({
      sectionTitle: finalSection.title,
      winner: useSecondary ? (winner === "B" ? "A" : "B") : winner,
      reason: useSecondary ? "Primary section too sparse; fallback to alternate stage." : "Higher confidence stage.",
      confidence: Math.max(confidenceA, confidenceB),
    });
    return finalSection;
  });

  return {
    stage: "fused",
    decisions,
    executiveSummary: primary.executiveSummary || secondary.executiveSummary,
    sections: mergedSections,
    stats: Object.keys(primary.stats || {}).length > 0 ? primary.stats : secondary.stats,
    miniSpreadsheets:
      (primary.miniSpreadsheets && primary.miniSpreadsheets.length > 0)
        ? primary.miniSpreadsheets
        : secondary.miniSpreadsheets,
    keywordComparisonTable: primary.keywordComparisonTable || secondary.keywordComparisonTable,
    analysisMode: primary.analysisMode || secondary.analysisMode,
  };
};

const toSectionStates = (
  report: UltimateChannelReport,
  sourceSnapshot: ContextSourceSnapshot,
): ReportSectionState[] => {
  const byOrder = report.blocks.slice(0, ULTIMATE_SECTION_ORDER.length);
  return byOrder.map((block, idx) => {
    const payload = block.payload || {};
    const sourceLabels = payload.sourceLabels?.length
      ? payload.sourceLabels
      : ["brain", "master_table", "api", "journal", "user_profile"];
    const evidenceRefs = payload.evidenceRefs?.length
      ? payload.evidenceRefs
      : [
          `brain:${sourceSnapshot.brainContext ? "available" : "missing"}`,
          `master_table:${sourceSnapshot.masterDataSnapshot ? "available" : "missing"}`,
          `api:${sourceSnapshot.apiSnapshot ? "available" : "missing"}`,
          `journal:${sourceSnapshot.aiJournalContext ? "available" : "missing"}`,
          `profile:${sourceSnapshot.userProfileContext ? "available" : "missing"}`,
        ];

    return {
      id: block.id,
      order: idx + 1,
      title: ULTIMATE_SECTION_ORDER[idx] || block.title,
      subtitle: block.subtitle,
      status: "queued",
      summary: block.summary,
      bullets: payload.bullets || [],
      metrics: payload.metrics || [],
      notes: payload.notes || [],
      sourceLabels,
      evidenceRefs,
      confidence: payload.confidence ?? 82,
      qualityFlags: [],
      actions: payload.actions || block.recommendations || [],
      chartSpec: block.chartSuggestion,
      tableSpec: block.tableSpec,
      styleVariant: block.styleVariant,
    };
  });
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
  const monetization = sectionByMatch(report, "MONETIZATION", "REVENUE");
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
    rows: keywordData.demographics.slice(0, 8).map((entry) => [entry.group, `${entry.percentage.toFixed(1)}%`]),
  };

  const formatTable: UnifiedTableSpec = {
    title: "Format Opportunity Matrix",
    headers: ["Format", "Effort", "Potential"],
    rows: keywordData.formatRoi.slice(0, 8).map((entry) => [entry.format, entry.effort, entry.potential]),
  };

  return [
    {
      id: "1",
      title: "Executive Command Snapshot",
      subtitle: "Top-line channel posture and immediate directive",
      styleVariant: "executive",
      summary: antiGenericSummary(report.executiveSummary || diagnosis.hiddenStory || "No executive summary available."),
      recommendations: diagnosis.dailyBrief?.steps?.slice(0, 3) || [],
      payload: {
        ...payloadFrom(diagnosis.dailyBrief?.steps || []),
        sourceLabels: ["brain", "master_table", "api", "user_profile"],
        evidenceRefs: ["summary:executive", "stats:totals"],
        confidence: 80,
        stageOrigin: "fused",
      },
    },
    {
      id: "2",
      title: "Channel Stats Header",
      subtitle: "Core KPI strip from normalized report stats",
      styleVariant: "forensic",
      summary: "Views, watch time, RPM, CTR, subscribers, and revenue normalized for this report run.",
      recommendations: ["Use KPI movement as gating criteria before changing content format mix."],
      payload: {
        metrics: [
          { label: "Views", value: Number(report.stats.views || 0).toLocaleString(), evidence: "Oracle Stats" },
          { label: "Watch Time", value: Number(report.stats.watchTime || 0).toLocaleString(), evidence: "Oracle Stats" },
          { label: "CTR", value: `${Number(report.stats.ctr || 0).toFixed(2)}%`, evidence: "Oracle Stats" },
          { label: "RPM", value: Number(report.stats.rpm || 0).toFixed(2), evidence: "Oracle Stats" },
        ],
        sourceLabels: ["master_table", "api"],
        evidenceRefs: ["stats:views", "stats:watchTime", "stats:ctr", "stats:rpm"],
        confidence: 90,
        stageOrigin: "fused",
      },
    },
    {
      id: "3",
      title: "Key Trends",
      subtitle: "What is consistently working",
      styleVariant: "trend",
      summary: antiGenericSummary(honesty?.content || growth?.content || diagnosis.hiddenStory),
      recommendations: ["Scale proven themes before introducing unrelated topic experiments."],
      chartSuggestion: honesty?.chartSuggestion || growth?.chartSuggestion,
    },
    {
      id: "4",
      title: "Winning Format / Source",
      subtitle: "Format and discovery blend with strongest payout",
      styleVariant: "trend",
      summary: antiGenericSummary(growth?.content || "Winning format inferred from trend and discovery behavior."),
      recommendations: ["Keep the dominant format stable for two cycles before testing alternatives."],
      payload: {
        ...payloadFrom(keywordData.contentFormats.slice(0, 3).map((x) => `${x.name}: ${x.percentage.toFixed(1)}%`)),
        sourceLabels: ["master_table", "api", "brain"],
        evidenceRefs: ["formats:mix", "sections:growth"],
        confidence: 78,
        stageOrigin: "fused",
      },
    },
    {
      id: "5",
      title: "Weaknesses & Gaps",
      subtitle: "Primary failure modes this cycle",
      styleVariant: "forensic",
      summary: antiGenericSummary(weakness?.content || "No explicit weakness section returned by model."),
      recommendations: buildRiskFlags(report),
    },
    {
      id: "6",
      title: "Action Plan",
      subtitle: "Daily command and tactical queue",
      styleVariant: "ops",
      summary: "Execution queue distilled from diagnosis and Oracle action cues.",
      recommendations: buildExecutionQueue(diagnosis, report),
      payload: {
        ...payloadFrom(buildExecutionQueue(diagnosis, report)),
        sourceLabels: ["brain", "user_profile", "master_table"],
        evidenceRefs: ["dailyBrief:steps", "sections:action"],
        confidence: 84,
        stageOrigin: "fused",
      },
    },
    {
      id: "7",
      title: "Packaging vs Payoff (CTR & AVD)",
      subtitle: "Clicks versus retained attention quality",
      styleVariant: "forensic",
      summary: antiGenericSummary(`${honesty?.content || ""}\n${retention?.content || ""}`.trim()),
      recommendations: ["Prioritize intro and title parity: promise and payoff must align in first 30 seconds."],
      chartSuggestion: retention?.chartSuggestion,
    },
    {
      id: "8",
      title: "Audience Alignment & Discovery Strategy",
      subtitle: "Who engages and how they find the content",
      styleVariant: "audience",
      summary: "Audience composition and discovery path synthesized from demographics and intent signals.",
      recommendations: ["Lead with the highest-share segment in opening framing and thumbnail language."],
      tableSpec: demographicTable,
    },
    {
      id: "9",
      title: "Traffic Funnels & Conversion",
      subtitle: "From view to subscriber to return session",
      styleVariant: "ops",
      summary: antiGenericSummary(engagement?.content || "Conversion funnel inferred from engagement and repeat behavior."),
      recommendations: ["Strengthen end-screen and pinned-comment bridge into the next relevant asset."],
    },
    {
      id: "10",
      title: "Revenue & RPM Optimization Strategy",
      subtitle: "Monetization quality and leverage paths",
      styleVariant: "finance",
      summary: antiGenericSummary(monetization?.content || "Monetization profile synthesized from normalized stats."),
      recommendations: ["Pair high-retention formats with sponsor-friendly narrative windows."],
      tableSpec: formatTable,
    },
    {
      id: "11",
      title: "Comparative Data Analysis",
      subtitle: "Cross-metric command grid",
      styleVariant: "forensic",
      summary: "Comparative matrix for weekly prioritization and report-to-report deltas.",
      recommendations: ["Use this grid to rank what to fix, scale, and retire."],
      tableSpec: buildComparativeGrid(report, keywordData),
      chartSuggestion: {
        type: "bar",
        title: "Comparative Value by Dimension",
        xAxisKey: "dimension",
        dataKeys: ["value"],
        description: "Cross-metric normalization view for rapid prioritization.",
        provider: "recharts",
      },
    },
    {
      id: "12",
      title: "Top Title Keyword Performance",
      subtitle: "Keyword-led outcome map",
      styleVariant: "trend",
      summary: keywordData.marketAnalysis || "Keyword intelligence unavailable.",
      recommendations: keywordData.longTailKeywords.slice(0, 4).map((keyword) => `Test long-tail: ${keyword}`),
      tableSpec: report.keywordComparisonTable || opportunityTable,
      chartSuggestion: {
        type: "bar",
        title: "Keyword Efficiency Scoreboard",
        xAxisKey: "keyword",
        dataKeys: ["efficiencyScore"],
        description: "Top keyword opportunities by modeled efficiency.",
        provider: "recharts",
      },
    },
    {
      id: "13",
      title: "Engagement Matrix",
      subtitle: "Retention versus subscriber conversion",
      styleVariant: "audience",
      summary: "Engagement matrix generated from keyword and retention datasets.",
      recommendations: ["Replicate high-retention/high-subscribe intersections; isolate low-CTR outliers."],
      chartSuggestion: {
        type: "scatter",
        title: "Engagement Matrix",
        xAxisKey: "avgRetention",
        dataKeys: ["avgSubs"],
        description: "Retention versus subscriber conversion by keyword cluster.",
        provider: "recharts",
      },
    },
    {
      id: "14",
      title: "Execution Queue + Progress Delta",
      subtitle: "Next cycle commitments and carry-over risks",
      styleVariant: "ops",
      summary: "Operational queue for next publishing cycle with baseline for report delta comparison.",
      recommendations: buildExecutionQueue(diagnosis, report),
      payload: {
        ...payloadFrom(buildExecutionQueue(diagnosis, report), buildRiskFlags(report)),
        sourceLabels: ["brain", "master_table", "api", "user_profile"],
        evidenceRefs: ["risk:flags", "action:queue"],
        confidence: 82,
        stageOrigin: "fused",
      },
    },
  ];
};

const buildFusionPromptContext = (mode: "channel" | "retention"): string => {
  const channelSections = [
    "Key Trends",
    "Winning Format",
    "Weaknesses",
    "Action Plan",
    "Packaging vs. Payoff (CTR & AVD)",
    "Audience Alignment & Niche Dilution",
    "Traffic Funnels & Bingeability",
    "Conversion & Lead Magnets",
    "Revenue & RPM Optimization Strategy",
  ];

  const retentionSections = [
    "Retention Overview",
    "The Hook (First 30 Seconds)",
    "Subscriber vs. Non-Subscriber Behavior",
    "New vs. Returning Viewer Behavior",
    "Organic vs. Paid Traffic Performance",
    "Major Drop-off Points",
    "High Retention Zones",
    "Pacing & Content Structure Feedback",
    "Actionable Editing & Scripting Next Steps",
  ];

  const sectionList = mode === "retention" ? retentionSections : channelSections;
  return [
    `ULTIMATE FUSION PACK VERSION: ${ULTIMATE_PROMPT_PACK_VERSION}`,
    "STRICT OUTPUT CONSTRAINTS:",
    "- Evidence-linked statements only.",
    "- Tactical concise language; no generic filler.",
    "- Return stats + exactly 9 strategic sections.",
    "- Include miniSpreadsheets and keywordComparisonTable when available.",
    `SECTION ORCHESTRATION (${mode.toUpperCase()} MODE): ${sectionList.join(" | ")}`,
  ].join("\n");
};

const buildToolContextPack = (
  diagnosis: AlgorithmDiagnosis,
  report: OracleReport,
  analysisMode: "channel" | "retention",
): ToolContextPack => ({
  version: ULTIMATE_PROMPT_PACK_VERSION,
  generatedAt: new Date().toISOString(),
  promptInjection: [
    `MODE: ${analysisMode}`,
    `CLUSTER: ${diagnosis.clusterCenter}`,
    `AUTHORITY: ${diagnosis.nicheAuthority}%`,
    `EXEC_SUMMARY: ${report.executiveSummary.slice(0, 280)}`,
  ].join("\n"),
});

const buildChannelKnowledgeModel = (
  diagnosis: AlgorithmDiagnosis,
  report: OracleReport,
  riskFlags: string[],
): ChannelKnowledgeModel => ({
  profile: diagnosis.clusterCenter || "Unknown cluster",
  strategyPosture: report.executiveSummary || diagnosis.hiddenStory || "No strategy posture generated.",
  confidence: Math.max(0, Math.min(100, diagnosis.nicheAuthority || 0)),
  guardrails: riskFlags.slice(0, 4),
});

const persistGenerationRecord = (record: GenerationRecord): void => {
  try {
    const raw = localStorage.getItem(ULTIMATE_REPORT_HISTORY_KEY);
    const existing = raw ? (JSON.parse(raw) as GenerationRecord[]) : [];
    const next = [record, ...existing].slice(0, 40);
    localStorage.setItem(ULTIMATE_REPORT_HISTORY_KEY, JSON.stringify(next));
  } catch (error) {
    console.warn("[UltimateReport] Failed to persist generation record", error);
  }
};

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<ReportStepResult> => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  const startedAt = Date.now();
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs);
    });
    const value = await Promise.race([promise, timeoutPromise]);
    if (timeoutId) clearTimeout(timeoutId);
    return { value, timedOut: false, failed: false, elapsedMs: Date.now() - startedAt, retryCount: 0 };
  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId);
    const reason = error instanceof Error ? error.message : String(error);
    return {
      value: null,
      timedOut: /timed out/i.test(reason),
      failed: true,
      reason,
      elapsedMs: Date.now() - startedAt,
      retryCount: 0,
    };
  }
};

const withTimeoutRetry = async <T>(
  producer: (compact: boolean) => Promise<T>,
  timeoutMs: number,
  label: string,
): Promise<ReportStepResult> => {
  const first = await withTimeout(producer(false), timeoutMs, label);
  if (!first.failed) return first;
  const second = await withTimeout(producer(true), Math.floor(timeoutMs * 0.7), `${label} retry`);
  if (!second.failed) return { ...second, retryCount: 1 };
  return {
    ...second,
    reason: `${first.reason || label}; retry failed: ${second.reason || label}`,
    elapsedMs: (first.elapsedMs || 0) + (second.elapsedMs || 0),
    retryCount: 1,
  };
};

const sectionHasRenderableContent = (section: ReportSectionState): boolean =>
  Boolean(section.summary?.trim()) ||
  (section.metrics?.length || 0) > 0 ||
  ((section.tableSpec?.rows?.length || 0) > 0 && (section.tableSpec?.headers?.length || 0) > 0) ||
  Boolean(section.chartSpec) ||
  (section.actions?.length || 0) > 0 ||
  (section.bullets?.length || 0) > 0;

const resolveBestAnalyticsSnapshot = (): {
  window: "lifetime" | "365d" | "90d" | "28d" | "7d";
  sourceMode: "hybrid" | "api" | "csv";
  summary: ReturnType<typeof getMetricSummary>;
  rows: ReturnType<typeof getMasterRows>;
} => {
  const sourceModes: Array<"hybrid" | "api" | "csv"> = ["hybrid", "api", "csv"];
  let best: {
    window: "lifetime" | "365d" | "90d" | "28d" | "7d";
    sourceMode: "hybrid" | "api" | "csv";
    summary: ReturnType<typeof getMetricSummary>;
    rows: ReturnType<typeof getMasterRows>;
    score: number;
  } | null = null;

  for (const window of PREFERRED_WINDOWS) {
    for (const sourceMode of sourceModes) {
      const summary = getMetricSummary(window, sourceMode, []);
      const rows = getMasterRows(window, sourceMode, []);
      const score =
        Number(summary.totals.views || 0) +
        Number(summary.totals.watchHours || 0) * 5 +
        Number(summary.totals.subscribersGained || 0) * 50 +
        Number(summary.totals.revenue || 0) * 20;
      if (!best || score > best.score) {
        best = { window, sourceMode, summary, rows, score };
      }
    }
  }

  if (best) return { window: best.window, sourceMode: best.sourceMode, summary: best.summary, rows: best.rows };
  const fallbackSummary = getMetricSummary("lifetime", "api", []);
  const fallbackRows = getMasterRows("lifetime", "api", []);
  return { window: "lifetime", sourceMode: "api", summary: fallbackSummary, rows: fallbackRows };
};

export async function generateUltimateChannelReport(
  input: GenerateUltimateReportInput = {},
): Promise<{
  report: UltimateChannelReport;
  diagnosis: AlgorithmDiagnosis;
  oracle: OracleReport;
  keyword: KeywordAnalysis;
  resolvedContext: string;
  generationRecord: GenerationRecord;
}> {
  const manualIntent = input.manualIntent?.trim() || "";
  const autoContext = input.autoContext?.trim() || "";
  const startedAt = new Date().toISOString();

  const bestSnapshot = resolveBestAnalyticsSnapshot();
  const summary = bestSnapshot.summary;
  const topRows = bestSnapshot.rows.slice(0, 18);

  const analyticsSnapshot = `
[CHANNEL SUMMARY DATA]
Window: ${bestSnapshot.window}
Views: ${summary.totals.views}
Revenue: ${summary.totals.revenue}
Subscribers: ${summary.totals.subscribersGained}
Watch Hours: ${summary.totals.watchHours}
Averages: CTR: ${summary.averages.ctr}%, RPM: ${summary.averages.rpm}

[TOP PERFORMING VIDEOS]
${topRows.map((r) => `${r.title} | Views: ${r.metrics.views.value} | CTR: ${r.metrics.ctr.value}%`).join("\n")}
`;

  const modeHint = /retention|drop[- ]off|audience retention|hook/i.test(`${manualIntent} ${autoContext}`)
    ? "retention"
    : "channel";

  const sourceSnapshot = assembleContextSources(manualIntent, autoContext, analyticsSnapshot);
  const preflight = buildPreflightResult(sourceSnapshot, bestSnapshot);

  if (!preflight.ok) {
    const generationId = crypto.randomUUID();
    input.onSessionUpdate?.({
      generationId,
      startedAt,
      finishedAt: new Date().toISOString(),
      overallStatus: "failed",
      completedCount: 0,
      failedCount: ULTIMATE_SECTION_ORDER.length,
      degradedCount: 0,
      totalCount: ULTIMATE_SECTION_ORDER.length,
    });
    throw new Error(
      `REPORT_PREFLIGHT_BLOCKED::${JSON.stringify({
        message: "Required report sources are missing. Sync required sources and retry.",
        preflight,
      })}`,
    );
  }

  const resolvedContext = [
    manualIntent && `USER STRATEGIC INTENT: ${manualIntent}`,
    autoContext && `AUTO-DETECTED CONTEXT: ${autoContext}`,
    `REAL-TIME ANALYTICS SNAPSHOT:\n${analyticsSnapshot}`,
    `[BRAIN SOURCE]\n${sourceSnapshot.brainContext.slice(0, 900)}`,
    `[MASTER DATA TABLES]\n${sourceSnapshot.masterDataSnapshot.slice(0, 900)}`,
    `[API STORAGE SNAPSHOT]\n${sourceSnapshot.apiSnapshot.slice(0, 900)}`,
    `[AI JOURNAL]\n${sourceSnapshot.aiJournalContext.slice(0, 900)}`,
    `[USER CHANNEL PROFILE]\n${sourceSnapshot.userProfileContext.slice(0, 900)}`,
    buildFusionPromptContext(modeHint),
  ]
    .filter(Boolean)
    .join("\n\n");

  const contextMode = manualIntent && autoContext ? "hybrid" : manualIntent ? "manual" : "auto";
  const stageAStartReason = "Stage A (legacy analysis) started.";
  const stageBStartReason = "Stage B (oracle refinement) started.";
  input.onSectionUpdate?.(
    {
      id: "stageA",
      order: 0,
      title: "Stage A Legacy Analysis",
      status: "running",
      summary: stageAStartReason,
      bullets: [],
      metrics: [],
      notes: [],
      sourceLabels: ["brain", "master_table", "api", "user_profile"],
      evidenceRefs: [],
      confidence: 0,
      qualityFlags: [],
      actions: [],
    },
    { sectionId: "stageA", status: "running", ts: new Date().toISOString(), note: stageAStartReason },
  );

  const [diagnosisStep, stageAStep, keywordStep] = await Promise.all([
    withTimeoutRetry(
      async (compact) => generateArchitectDiagnosis(compact ? buildSlimContext(resolvedContext) : resolvedContext),
      SECTION_TIMEOUTS_MS.diagnosis,
      "architect diagnosis",
    ),
    withTimeoutRetry(
      async (compact) => generateOracleReport(buildStageAContext(compact ? buildSlimContext(resolvedContext) : resolvedContext)),
      SECTION_TIMEOUTS_MS.stageA,
      "stage A report",
    ),
    withTimeoutRetry(
      async (compact) => generateKeywordResearch(compact ? buildSlimContext(resolvedContext) : resolvedContext, "YouTube Channel"),
      SECTION_TIMEOUTS_MS.keyword,
      "keyword research",
    ),
  ]);

  const stageAOracle = normalizeOracleReport(stageAStep.value, resolvedContext);
  const stageA: StageAReport = {
    ...sanitizeOracleReport(stageAOracle),
    stage: "A",
    promptVersion: LEGACY_PROMPT_VERSION,
    sections: enforceNineSections(stageAOracle.sections || []),
  };

  input.onSectionUpdate?.(
    {
      id: "stageA",
      order: 0,
      title: "Stage A Legacy Analysis",
      status: stageAStep.failed ? "failed" : "complete",
      summary: stageAStep.failed ? `Stage A failed: ${stageAStep.reason || "unknown"}` : "Stage A completed.",
      bullets: [],
      metrics: [],
      notes: [],
      sourceLabels: ["brain", "master_table", "api", "user_profile"],
      evidenceRefs: [],
      confidence: stageAStep.failed ? 0 : 70,
      qualityFlags: stageAStep.failed ? ["stage_a_failed"] : [],
      actions: [],
    },
    {
      sectionId: "stageA",
      status: stageAStep.failed ? "failed" : "complete",
      ts: new Date().toISOString(),
      note: stageAStep.failed ? `Stage A failed: ${stageAStep.reason || "unknown"}` : "Stage A completed.",
    },
  );

  input.onSectionUpdate?.(
    {
      id: "stageB",
      order: 0,
      title: "Stage B Oracle Refinement",
      status: "running",
      summary: stageBStartReason,
      bullets: [],
      metrics: [],
      notes: [],
      sourceLabels: ["brain", "master_table", "api", "user_profile"],
      evidenceRefs: [],
      confidence: 0,
      qualityFlags: [],
      actions: [],
    },
    { sectionId: "stageB", status: "running", ts: new Date().toISOString(), note: stageBStartReason },
  );

  const stageBStep = await withTimeoutRetry(
    async (compact) =>
      generateOracleReport(
        buildStageBContext(compact ? buildSlimContext(resolvedContext) : resolvedContext, stageA),
      ),
    SECTION_TIMEOUTS_MS.stageB,
    "stage B report",
  );
  const stageBOracle = normalizeOracleReport(stageBStep.value, resolvedContext);
  const stageB: StageBRefinement = {
    ...sanitizeOracleReport(stageBOracle),
    stage: "B",
    promptVersion: ORACLE_REFINEMENT_VERSION,
    sections: enforceNineSections(stageBOracle.sections || []),
  };

  input.onSectionUpdate?.(
    {
      id: "stageB",
      order: 0,
      title: "Stage B Oracle Refinement",
      status: stageBStep.failed ? "failed" : "complete",
      summary: stageBStep.failed ? `Stage B failed: ${stageBStep.reason || "unknown"}` : "Stage B completed.",
      bullets: [],
      metrics: [],
      notes: [],
      sourceLabels: ["brain", "master_table", "api", "user_profile"],
      evidenceRefs: [],
      confidence: stageBStep.failed ? 0 : 78,
      qualityFlags: stageBStep.failed ? ["stage_b_failed"] : [],
      actions: [],
    },
    {
      sectionId: "stageB",
      status: stageBStep.failed ? "failed" : "complete",
      ts: new Date().toISOString(),
      note: stageBStep.failed ? `Stage B failed: ${stageBStep.reason || "unknown"}` : "Stage B completed.",
    },
  );

  const diagnosis = normalizeDiagnosis(diagnosisStep.value);
  const fused = sanitizeOracleReport(fuseStageReports(stageA, stageB)) as FusionReport;
  const oracle = fused;
  const keyword = normalizeKeywordAnalysis(keywordStep.value);

  const analysisMode = oracle.analysisMode || modeHint;
  const actionPlan = buildExecutionQueue(diagnosis, oracle);
  const riskFlags = buildRiskFlags(oracle);
  const generationId = crypto.randomUUID();
  const totalSections = ULTIMATE_SECTION_ORDER.length;
  input.onSessionUpdate?.({
    generationId,
    startedAt,
    overallStatus: "running",
    completedCount: 0,
    failedCount: 0,
    degradedCount: 0,
    totalCount: totalSections,
  });
  const toolContextPack = buildToolContextPack(diagnosis, oracle, analysisMode);
  const channelKnowledge = buildChannelKnowledgeModel(diagnosis, oracle, riskFlags);
  const brainUpdate: BrainUpdateResult = {
    updated: true,
    notes: ["Generation captured and queued for Brain reflection."],
    qualityFlags: oracle.sections.length ? [] : ["oracle_sections_recovered"],
  };

  const generationDiagnostics: GenerationDiagnostics = {
    stageA: {
      status: stageAStep.failed ? "failed" : "complete",
      reason: stageAStep.reason,
      elapsedMs: stageAStep.elapsedMs,
      retryCount: stageAStep.retryCount,
    },
    stageB: {
      status: stageBStep.failed ? "failed" : "complete",
      reason: stageBStep.reason,
      elapsedMs: stageBStep.elapsedMs,
      retryCount: stageBStep.retryCount,
    },
    diagnosis: {
      status: diagnosisStep.failed ? "failed" : "complete",
      reason: diagnosisStep.reason,
      elapsedMs: diagnosisStep.elapsedMs,
      retryCount: diagnosisStep.retryCount,
    },
    keyword: {
      status: keywordStep.failed ? "failed" : "complete",
      reason: keywordStep.reason,
      elapsedMs: keywordStep.elapsedMs,
      retryCount: keywordStep.retryCount,
    },
    fusion: { status: "complete", elapsedMs: 0, retryCount: 0 },
  };

  const report: UltimateChannelReport = {
    meta: {
      generationId,
      generatedAt: new Date().toISOString(),
      startedAt,
      dataSources: input.dataSources?.length ? input.dataSources : ["omni-brain", "analytics-cache", "api"],
      contextMode,
      analysisMode,
      promptPackVersion: ULTIMATE_PROMPT_PACK_VERSION,
      authoritativeSurface: "/performance",
      aliases: ["performance hub", "analytics", "channel intelligence lab"],
      diagnostics: {
        modelRecoveryApplied:
          diagnosisStep.failed || stageAStep.failed || stageBStep.failed || keywordStep.failed,
        missingSectionsRecovered: oracle.sections.length === 0,
        warningCount:
          (oracle.sections.length === 0 ? 1 : 0) +
          (diagnosisStep.failed ? 1 : 0) +
          (stageAStep.failed ? 1 : 0) +
          (stageBStep.failed ? 1 : 0) +
          (keywordStep.failed ? 1 : 0),
        preflight,
        generationDiagnostics,
      },
    },
    executiveSummary: antiGenericSummary(oracle.executiveSummary || diagnosis.hiddenStory || "No summary returned."),
    blocks: mapToBlocks(diagnosis, oracle, keyword),
    actionPlan,
    riskFlags,
    keywordComparisonTable: oracle.keywordComparisonTable,
    miniSpreadsheets: oracle.miniSpreadsheets,
    channelKnowledge,
    toolContextPack,
    brainUpdate,
    staged: {
      stageA,
      stageB,
      fusion: fused,
    },
  };

  const sectionStates = toSectionStates(report, sourceSnapshot);
  const generationEvents: SectionGenerationEvent[] = [];
  let completedCount = 0;
  let failedCount = 0;
  let degradedCount = 0;
  for (const section of sectionStates) {
    const running: ReportSectionState = { ...section, status: "running" };
    const runningEvent: SectionGenerationEvent = {
      sectionId: section.id,
      status: "running",
      ts: new Date().toISOString(),
      note: `${section.title} generation started.`,
    };
    generationEvents.push(runningEvent);
    input.onSectionUpdate?.(running, runningEvent);

    let nextStatus: SectionGenerationStatus = "complete";
    const nextFlags: string[] = [];
    const stageAFailed = stageAStep.failed;
    const stageBFailed = stageBStep.failed;
    const bothStagesFailed = stageAFailed && stageBFailed;
    const hasRenderable = sectionHasRenderableContent(section);
    if (!hasRenderable) {
      nextStatus = "failed";
      nextFlags.push("failed_invalid_payload");
      nextFlags.push("no_renderable_content");
      failedCount += 1;
    } else if (bothStagesFailed) {
      nextStatus = "failed";
      nextFlags.push("source_stage_failed");
      failedCount += 1;
    } else if (stageAFailed || stageBFailed || section.sourceLabels.length < 3) {
      nextStatus = "degraded";
      nextFlags.push(stageAFailed || stageBFailed ? "source_stage_partial" : "partial_sources");
      degradedCount += 1;
    } else {
      completedCount += 1;
    }

    const completeSection: ReportSectionState = {
      ...section,
      status: nextStatus,
      qualityFlags: nextFlags,
    };
    const completeEvent: SectionGenerationEvent = {
      sectionId: section.id,
      status: nextStatus,
      ts: new Date().toISOString(),
      note:
        nextStatus === "complete"
          ? `${section.title} completed.`
          : nextStatus === "degraded"
            ? `${section.title} completed in degraded mode.`
            : `${section.title} failed.`,
    };
    generationEvents.push(completeEvent);
    input.onSectionUpdate?.(completeSection, completeEvent);
  }

  const finishedAt = new Date().toISOString();
  const overallStatus: "complete" | "degraded" | "failed" =
    failedCount > 0 ? "failed" : degradedCount > 0 || report.meta.diagnostics.warningCount > 0 ? "degraded" : "complete";
  report.sectionStates = sectionStates.map((section) => {
    const perSectionEvents = generationEvents.filter((event) => event.sectionId === section.id);
    const finalEvent = perSectionEvents[perSectionEvents.length - 1];
    return {
      ...section,
      status: (finalEvent?.status as SectionGenerationStatus) || "queued",
      qualityFlags:
        finalEvent?.status === "degraded"
          ? ["partial_sources"]
          : finalEvent?.status === "failed"
            ? ["failed_invalid_payload"]
            : [],
    };
  });
  report.generationEvents = generationEvents;
  report.meta.finishedAt = finishedAt;
  report.meta.overallStatus = overallStatus;
  report.meta.completedCount = completedCount;
  report.meta.failedCount = failedCount;
  report.meta.degradedCount = degradedCount;
  report.meta.partialRender = failedCount > 0 || degradedCount > 0;

  const generationRecord: GenerationRecord = {
    id: generationId,
    generatedAt: report.meta.generatedAt,
    promptPackVersion: ULTIMATE_PROMPT_PACK_VERSION,
    analysisMode,
    contextMode,
    contextSnapshot: resolvedContext.slice(0, 4000),
    report,
    sectionStates: report.sectionStates,
    sourceSnapshot,
  };

  persistGenerationRecord(generationRecord);

  if (diagnosisStep.failed || stageAStep.failed || stageBStep.failed || keywordStep.failed) {
    if (!warningOnce.has(`degraded_${generationId}`)) {
      warningOnce.add(`degraded_${generationId}`);
    console.warn("[UltimateReport] Generation degraded mode", {
      diagnosis: diagnosisStep.reason,
      stageA: stageAStep.reason,
      stageB: stageBStep.reason,
      keyword: keywordStep.reason,
    });
    }
  }

  input.onSessionUpdate?.({
    generationId,
    startedAt,
    finishedAt,
    overallStatus,
    completedCount,
    failedCount,
    degradedCount,
    totalCount: totalSections,
  });

  return { report, diagnosis, oracle, keyword, resolvedContext, generationRecord };
}

export const __test__ = {
  normalizeOracleReport,
  normalizeDiagnosis,
  normalizeKeywordAnalysis,
  sectionByMatch,
  detectAnalysisMode,
  buildPreflightResult,
};
