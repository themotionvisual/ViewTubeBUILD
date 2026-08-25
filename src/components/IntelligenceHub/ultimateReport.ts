import {
  generateArchitectDiagnosis,
  generateKeywordResearch,
  generateOracleReport,
} from "@/services/gemini";
import {
  INTELLIGENCE_SECTION_DATASETS,
  type CanonicalIntelligenceEvidenceBundle,
} from "@/services/analytics-canon";
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
  IntelligenceReportGenerationRecord,
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
  evidence: CanonicalIntelligenceEvidenceBundle;
  brainContext?: string;
  manualIntent?: string;
  autoContext?: string;
  dataSources?: string[];
  signal?: AbortSignal;
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
const ULTIMATE_SECTION_EVIDENCE_KEYS = [
  "executive-summary",
  "algorithm-diagnosis",
  "strategy-engine",
  "sculpting-engine",
  "channel-pulse",
  "comparative-analysis",
  "keyword-matrix",
  "engagement-matrix",
  "retention-burnout",
  "revenue-dynamics",
  "risk-guardrails",
  "execution-queue",
] as const;
const SECTION_TIMEOUTS_MS = {
  diagnosis: 18000,
  keyword: 18000,
  stageA: 42000,
  stageB: 42000,
} as const;
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

const freshnessFrom = (iso?: string): "fresh" | "stale" | "unknown" => {
  if (!iso) return "unknown";
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return "unknown";
  return Date.now() - ts <= 1000 * 60 * 60 * 24 * 7 ? "fresh" : "stale";
};

const buildPreflightResult = (
  sourceSnapshot: ContextSourceSnapshot,
  evidence: CanonicalIntelligenceEvidenceBundle,
): ReportPreflightResult => {
  const coreIds = new Set(["videos", "daily", "weekly", "monthly", "channel_totals"]);
  const coreDatasets = evidence.datasets.filter((dataset) => coreIds.has(dataset.id));
  const coreRows = coreDatasets.reduce((total, dataset) => total + dataset.rowCount, 0);
  const hasMasterCoverage = coreRows > 0;
  const hasCanonicalPayload = evidence.coverage.available + evidence.coverage.partial + evidence.coverage.stale > 0;
  const hasProfile = Boolean(evidence.channelId);
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
      freshness: freshnessFrom(evidence.capturedAt),
      lastUpdatedAt: evidence.capturedAt,
      detail: "VT-SYNC core channel/time datasets require at least one real row.",
      evidence: `core_rows=${coreRows};window=${evidence.selectedWindow};snapshot=${evidence.snapshotId}`,
    },
    {
      key: "api",
      present: hasCanonicalPayload,
      freshness: freshnessFrom(evidence.capturedAt),
      lastUpdatedAt: evidence.capturedAt,
      detail: "Canonical VT-SYNC evidence must contain at least one available, partial, or preserved stale dataset.",
      evidence: `available=${evidence.coverage.available};partial=${evidence.coverage.partial};stale=${evidence.coverage.stale}`,
    },
    {
      key: "user_profile",
      present: hasProfile,
      freshness: freshnessFrom(evidence.capturedAt),
      lastUpdatedAt: evidence.capturedAt,
      detail: "A channel-scoped VT-SYNC snapshot is required to prevent cross-channel report writes.",
      evidence: `channel_id=${evidence.channelId || "none"};channel_name=${evidence.channelName || "none"}`,
    },
  ];

  const blockers: string[] = [];
  const remediation: string[] = [];
  if (!hasMasterCoverage) {
    blockers.push("missing_master_table_rows");
    remediation.push("Master table missing or empty for selected window. Run data sync and verify canonical rows are populated.");
  }
  if (!hasCanonicalPayload) {
    blockers.push("missing_vt_sync_evidence");
    remediation.push("No canonical VT-SYNC datasets are available. Sync or import channel data, then retry.");
  }
  if (!hasProfile) {
    blockers.push("missing_channel_identity");
    remediation.push("Connect a channel or wait for VT-SYNC channel identity to resolve before generating.");
  }

  return {
    ok: blockers.length === 0,
    checkedAt: new Date().toISOString(),
    sourceWindow: evidence.selectedWindow,
    sourceMode: "vt-sync",
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
  evidence: CanonicalIntelligenceEvidenceBundle,
): ReportSectionState[] => {
  const byOrder = report.blocks.slice(0, ULTIMATE_SECTION_ORDER.length);
  return byOrder.map((block, idx) => {
    const payload = block.payload || {};
    const evidenceKey = ULTIMATE_SECTION_EVIDENCE_KEYS[idx];
    const configuredDatasetIds = INTELLIGENCE_SECTION_DATASETS[evidenceKey] || [];
    const dependentDatasets = configuredDatasetIds.length
      ? evidence.datasets.filter((dataset) => configuredDatasetIds.includes(dataset.id))
      : evidence.datasets;
    const unavailableDatasets = dependentDatasets.filter(
      (dataset) => dataset.status === "unavailable" || dataset.status === "failed",
    );
    const limitedDatasets = dependentDatasets.filter(
      (dataset) => dataset.status === "partial" || dataset.status === "stale",
    );
    const sourceLabels = Array.from(new Set([
      ...(payload.sourceLabels?.length
        ? payload.sourceLabels
        : ["brain", "vt-sync", "user_profile"]),
      ...dependentDatasets.flatMap((dataset) => dataset.sources),
    ]));
    const evidenceRefs = Array.from(new Set([
      ...(payload.evidenceRefs?.length
        ? payload.evidenceRefs
        : [
          `brain:${sourceSnapshot.brainContext ? "available" : "missing"}`,
          `vt-sync:${evidence.snapshotId}`,
          `journal:${sourceSnapshot.aiJournalContext ? "available" : "missing"}`,
          `profile:${sourceSnapshot.userProfileContext ? "available" : "missing"}`,
        ]),
      ...dependentDatasets.flatMap((dataset) =>
        dataset.evidenceRefs.length
          ? dataset.evidenceRefs
          : [`${evidence.snapshotId}:${dataset.id}:${dataset.status}`],
      ),
    ]));
    const qualityFlags = [
      ...unavailableDatasets.map((dataset) => `dataset_${dataset.status}:${dataset.id}`),
      ...limitedDatasets.map((dataset) => `dataset_${dataset.status}:${dataset.id}`),
    ];
    const datasetNotes = unavailableDatasets.length
      ? [`Unavailable evidence: ${unavailableDatasets.map((dataset) => dataset.label).join(", ")}.`]
      : [];

    return {
      id: block.id,
      order: idx + 1,
      title: ULTIMATE_SECTION_ORDER[idx] || block.title,
      subtitle: block.subtitle,
      status: "queued",
      summary: block.summary,
      bullets: payload.bullets || [],
      metrics: payload.metrics || [],
      notes: [...(payload.notes || []), ...datasetNotes],
      sourceLabels,
      evidenceRefs,
      confidence: Math.max(0, (payload.confidence ?? 82) - unavailableDatasets.length * 6 - limitedDatasets.length * 2),
      qualityFlags,
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
  generationId: string,
  evidence: CanonicalIntelligenceEvidenceBundle,
): ToolContextPack => ({
  id: `${generationId}:intelligence-context`,
  runId: generationId,
  channelId: evidence.channelId,
  createdAt: new Date().toISOString(),
  sourceSnapshotId: evidence.snapshotId,
  evidenceFingerprint: `${evidence.snapshotId}:${evidence.datasets.map((dataset) => `${dataset.id}:${dataset.rowCount}:${dataset.status}`).join("|")}`,
  promptVersion: ULTIMATE_PROMPT_PACK_VERSION,
  summary: report.executiveSummary.slice(0, 600),
  contextBlock: [
    `MODE: ${analysisMode}`,
    `CLUSTER: ${diagnosis.clusterCenter}`,
    `AUTHORITY: ${diagnosis.nicheAuthority}%`,
    `EXEC_SUMMARY: ${report.executiveSummary.slice(0, 280)}`,
  ].join("\n"),
  evidenceIds: evidence.datasets.flatMap((dataset) => dataset.evidenceRefs).slice(0, 160),
  confidence: diagnosis.nicheAuthority >= 70 ? "high" : diagnosis.nicheAuthority >= 40 ? "medium" : "low",
  unavailableInputs: evidence.datasets.filter((dataset) => dataset.status === "unavailable" || dataset.status === "failed").map((dataset) => dataset.id),
});

const buildChannelKnowledgeModel = (
  diagnosis: AlgorithmDiagnosis,
  report: OracleReport,
  riskFlags: string[],
  generationId: string,
  evidence: CanonicalIntelligenceEvidenceBundle,
): ChannelKnowledgeModel => ({
  id: `${generationId}:channel-knowledge`,
  runId: generationId,
  channelId: evidence.channelId,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  sourceSnapshotId: evidence.snapshotId,
  evidenceFingerprint: `${evidence.snapshotId}:${evidence.coverage.available}:${evidence.coverage.partial}`,
  niche: diagnosis.clusterCenter ? [{
    id: `${generationId}:niche`,
    label: diagnosis.clusterCenter,
    summary: diagnosis.hiddenStory || report.executiveSummary,
    confidence: diagnosis.nicheAuthority >= 70 ? "high" : diagnosis.nicheAuthority >= 40 ? "medium" : "low",
    evidenceIds: evidence.datasets.find((dataset) => dataset.id === "videos")?.evidenceRefs.slice(0, 12) || [],
  }] : [],
  contentFormats: [],
  audience: diagnosis.audienceDNA.slice(0, 8).map((item, index) => ({
    id: `${generationId}:audience:${index + 1}`,
    label: item.interest,
    summary: `${item.overlap}% audience overlap reported by the current diagnosis.`,
    confidence: item.overlap >= 70 ? "high" : item.overlap >= 40 ? "medium" : "low",
    evidenceIds: evidence.datasets.find((dataset) => dataset.id === "demographics")?.evidenceRefs.slice(0, 8) || [],
  })),
  visualIdentity: [],
  creatorCommunication: [],
  growthOpportunities: report.sections.slice(0, 6).map((section, index) => ({
    id: `${generationId}:growth:${index + 1}`,
    label: section.title,
    summary: section.content,
    confidence: "medium",
    evidenceIds: evidence.datasets.flatMap((dataset) => dataset.evidenceRefs).slice(index * 3, index * 3 + 3),
  })),
  contradictions: riskFlags.slice(0, 6).map((risk, index) => ({
    id: `${generationId}:risk:${index + 1}`,
    label: `Guardrail ${index + 1}`,
    summary: risk,
    confidence: "medium",
    evidenceIds: [],
  })),
  summary: report.executiveSummary || diagnosis.hiddenStory,
  confidence: diagnosis.nicheAuthority >= 70 ? "high" : diagnosis.nicheAuthority >= 40 ? "medium" : "low",
});

const persistGenerationRecord = (record: IntelligenceReportGenerationRecord): void => {
  try {
    const key = `${ULTIMATE_REPORT_HISTORY_KEY}:${record.report.meta.channelId}`;
    const raw = localStorage.getItem(key);
    const existing = raw ? (JSON.parse(raw) as IntelligenceReportGenerationRecord[]) : [];
    const next = [record, ...existing].slice(0, 40);
    localStorage.setItem(key, JSON.stringify(next));
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

export async function generateUltimateChannelReport(
  input: GenerateUltimateReportInput,
): Promise<{
  report: UltimateChannelReport;
  diagnosis: AlgorithmDiagnosis;
  oracle: OracleReport;
  keyword: KeywordAnalysis;
  resolvedContext: string;
  generationRecord: IntelligenceReportGenerationRecord;
}> {
  input.signal?.throwIfAborted();
  const manualIntent = input.manualIntent?.trim() || "";
  const autoContext = input.autoContext?.trim() || "";
  const startedAt = new Date().toISOString();
  const evidence = input.evidence;
  const analyticsSnapshot = evidence.contextText;

  const modeHint = /retention|drop[- ]off|audience retention|hook/i.test(`${manualIntent} ${autoContext}`)
    ? "retention"
    : "channel";

  const sourceSnapshot: ContextSourceSnapshot = {
    brainContext: input.brainContext?.trim() || "Brain context unavailable.",
    masterDataSnapshot: analyticsSnapshot || "VT-SYNC evidence unavailable.",
    apiSnapshot: JSON.stringify({
      snapshotId: evidence.snapshotId,
      capturedAt: evidence.capturedAt,
      coverage: evidence.coverage,
      datasets: evidence.datasets.map((dataset) => ({
        id: dataset.id,
        status: dataset.status,
        rows: dataset.rowCount,
        sources: dataset.sources,
      })),
    }),
    aiJournalContext: "AI Journal is not a required analytics source.",
    userProfileContext: manualIntent || autoContext || evidence.channelName || evidence.channelId || "User profile unavailable.",
  };
  const preflight = buildPreflightResult(sourceSnapshot, evidence);

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
    `VT-SYNC CANONICAL EVIDENCE:\n${analyticsSnapshot}`,
    `[BRAIN SOURCE]\n${sourceSnapshot.brainContext.slice(0, 900)}`,
    `[VT-SYNC COVERAGE MANIFEST]\n${sourceSnapshot.apiSnapshot.slice(0, 4000)}`,
    `[AI JOURNAL]\n${sourceSnapshot.aiJournalContext.slice(0, 900)}`,
    `[USER CHANNEL PROFILE]\n${sourceSnapshot.userProfileContext.slice(0, 900)}`,
    buildFusionPromptContext(modeHint),
  ]
    .filter(Boolean)
    .join("\n\n");
  input.signal?.throwIfAborted();

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
  input.signal?.throwIfAborted();

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
  input.signal?.throwIfAborted();
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
  input.signal?.throwIfAborted();
  const toolContextPack = buildToolContextPack(diagnosis, oracle, analysisMode, generationId, evidence);
  const channelKnowledge = buildChannelKnowledgeModel(diagnosis, oracle, riskFlags, generationId, evidence);
  const brainUpdate: BrainUpdateResult = {
    status: "pending",
    updated: false,
    notes: ["Report generated; canonical Brain persistence is pending."],
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
      dataSources: input.dataSources?.length ? input.dataSources : ["vt-sync", "analytics-canon", "ai-brain"],
      contextMode,
      analysisMode,
      promptPackVersion: ULTIMATE_PROMPT_PACK_VERSION,
      authoritativeSurface: "/analytics",
      channelId: evidence.channelId,
      snapshotId: evidence.snapshotId,
      datasetCoverage: evidence.coverage,
      omittedDatasetIds: evidence.omittedDatasetIds,
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

  const sectionStates = toSectionStates(report, sourceSnapshot, evidence);
  const generationEvents: SectionGenerationEvent[] = [];
  let completedCount = 0;
  let failedCount = 0;
  let degradedCount = 0;
  for (const section of sectionStates) {
    input.signal?.throwIfAborted();
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
    } else if (stageAFailed || stageBFailed || section.sourceLabels.length < 3 || section.qualityFlags.length > 0) {
      nextStatus = "degraded";
      nextFlags.push(stageAFailed || stageBFailed ? "source_stage_partial" : "partial_sources");
      degradedCount += 1;
    } else {
      completedCount += 1;
    }

    const completeSection: ReportSectionState = {
      ...section,
      status: nextStatus,
      qualityFlags: [...section.qualityFlags, ...nextFlags],
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

  const generationRecord: IntelligenceReportGenerationRecord = {
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
