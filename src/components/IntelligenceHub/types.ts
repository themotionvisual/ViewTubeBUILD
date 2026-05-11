export interface ChartConfig {
  type: 'bar' | 'line' | 'scatter' | 'radar' | 'pie' | 'bubble' | 'quadrant' | 'frequency' | 'geo' | 'table' | 'combo' | 'steppedArea';
  title: string;
  xAxisKey: string;
  dataKeys: string[];
  zAxisKey?: string;
  description?: string;
  provider?: 'recharts' | 'google';
  videoCount?: number;
  sortType?: 'recent' | 'highest_rated' | 'alphabetical' | 'none';
  durationType?: 'long' | 'shorts' | 'both';
}

export interface OracleSection {
  title: string;
  content: string;
  chartSuggestion?: ChartConfig;
}

export interface OracleReport {
  executiveSummary: string;
  sections: OracleSection[];
  stats: Record<string, number>;
  miniSpreadsheets?: UnifiedTableSpec[];
  keywordComparisonTable?: UnifiedTableSpec;
  analysisMode?: "channel" | "retention";
}

export interface AlgorithmDiagnosis {
  clusterCenter: string;
  nicheAuthority: number;
  audienceDNA: { interest: string; overlap: number }[];
  hiddenStory: string;
  dailyBrief: {
    priority: string;
    impact: string;
    steps: string[];
  };
}

export interface KeywordAnalysis {
  marketAnalysis: string;
  trendData: { month: string; google: number; youtube: number }[];
  keywordMetrics: { keyword: string; volume: number; difficulty: number; relevance: number }[];
  contentFormats: { name: string; percentage: number }[];
  sentimentAnalysis: { emotion: string; score: number }[];
  demographics: { group: string; percentage: number }[];
  lsiKeywords: string[];
  longTailKeywords: string[];
  searchIntent: { query: string; intent: string; contentAngle: string }[];
  viralHooks: string[];
  retentionForecast: { second: number; user: number; average: number }[];
  competitorScores: { metric: string; user: number; competitor: number }[];
  ctrPowerWords: string[];
  formatRoi: { format: string; effort: number; potential: number }[];
}

export interface UnifiedTableSpec {
  title: string;
  headers: string[];
  rows: Array<Array<string | number>>;
}

export interface UltimateReportBlock {
  id: string;
  title: string;
  subtitle?: string;
  summary: string;
  recommendations: string[];
  styleVariant?: "executive" | "forensic" | "trend" | "audience" | "finance" | "ops";
  payload?: ReportSectionPayload;
  chartSuggestion?: ChartConfig;
  tableSpec?: UnifiedTableSpec;
}

export interface ReportSectionPayload {
  bullets?: string[];
  metrics?: Array<{ label: string; value: string | number; evidence?: string }>;
  notes?: string[];
  sourceLabels?: string[];
  evidenceRefs?: string[];
  confidence?: number;
  actions?: string[];
  stageOrigin?: "A" | "B" | "fused";
  qualityFlags?: string[];
}

export type SectionGenerationStatus = "queued" | "running" | "complete" | "degraded" | "failed";

export interface ReportSectionState {
  id: string;
  order: number;
  title: string;
  subtitle?: string;
  status: SectionGenerationStatus;
  summary: string;
  bullets: string[];
  metrics: Array<{ label: string; value: string | number; evidence?: string }>;
  notes: string[];
  sourceLabels: string[];
  evidenceRefs: string[];
  confidence: number;
  qualityFlags: string[];
  actions: string[];
  chartSpec?: ChartConfig;
  tableSpec?: UnifiedTableSpec;
  styleVariant?: "executive" | "forensic" | "trend" | "audience" | "finance" | "ops";
}

export interface SectionGenerationEvent {
  sectionId: string;
  status: SectionGenerationStatus;
  ts: string;
  note: string;
}

export interface ContextSourceSnapshot {
  brainContext: string;
  masterDataSnapshot: string;
  apiSnapshot: string;
  aiJournalContext: string;
  userProfileContext: string;
}

export interface ReportPreflightResult {
  ok: boolean;
  checkedAt: string;
  sourceWindow?: "lifetime" | "365d" | "90d" | "28d" | "7d";
  sourceMode?: "hybrid" | "api" | "csv";
  requiredSources: Array<{
    key: "brain" | "master_table" | "api" | "user_profile";
    present: boolean;
    freshness: "fresh" | "stale" | "unknown";
    lastUpdatedAt?: string;
    detail: string;
    evidence?: string;
  }>;
  blockers: string[];
  remediation: string[];
}

export interface StageAReport extends OracleReport {
  stage: "A";
  promptVersion: string;
}

export interface StageBRefinement extends OracleReport {
  stage: "B";
  promptVersion: string;
}

export interface SectionFusionDecision {
  sectionTitle: string;
  winner: "A" | "B";
  reason: string;
  confidence: number;
}

export interface FusionReport extends OracleReport {
  stage: "fused";
  decisions: SectionFusionDecision[];
}

export interface GenerationRecord {
  id: string;
  generatedAt: string;
  promptPackVersion: string;
  analysisMode: "channel" | "retention";
  contextMode: "auto" | "manual" | "hybrid";
  contextSnapshot: string;
  report: UltimateChannelReport;
  sectionStates?: ReportSectionState[];
  sourceSnapshot?: ContextSourceSnapshot;
}

export interface ChannelKnowledgeModel {
  profile: string;
  strategyPosture: string;
  confidence: number;
  guardrails: string[];
}

export interface ToolContextPack {
  version: string;
  promptInjection: string;
  generatedAt: string;
}

export interface BrainUpdateResult {
  updated: boolean;
  notes: string[];
  qualityFlags: string[];
}

export interface UltimateChannelReport {
  meta: {
    generationId: string;
    generatedAt: string;
    startedAt?: string;
    finishedAt?: string;
    overallStatus?: "running" | "complete" | "degraded" | "failed";
    partialRender?: boolean;
    completedCount?: number;
    failedCount?: number;
    degradedCount?: number;
    dataSources: string[];
    contextMode: "auto" | "manual" | "hybrid";
    analysisMode: "channel" | "retention";
    promptPackVersion: string;
    authoritativeSurface: "/performance";
    aliases: string[];
    diagnostics: {
      modelRecoveryApplied: boolean;
      missingSectionsRecovered: boolean;
      warningCount: number;
      preflight?: ReportPreflightResult;
      generationDiagnostics?: GenerationDiagnostics;
    };
  };
  executiveSummary: string;
  blocks: UltimateReportBlock[];
  sectionStates?: ReportSectionState[];
  generationEvents?: SectionGenerationEvent[];
  actionPlan: string[];
  riskFlags: string[];
  keywordComparisonTable?: UnifiedTableSpec;
  miniSpreadsheets?: UnifiedTableSpec[];
  channelKnowledge?: ChannelKnowledgeModel;
  toolContextPack?: ToolContextPack;
  brainUpdate?: BrainUpdateResult;
  staged?: {
    stageA?: StageAReport;
    stageB?: StageBRefinement;
    fusion?: FusionReport;
  };
}

export interface GenerationDiagnostics {
  stageA: { status: "complete" | "degraded" | "failed"; reason?: string; elapsedMs?: number; retryCount?: number };
  stageB: { status: "complete" | "degraded" | "failed"; reason?: string; elapsedMs?: number; retryCount?: number };
  diagnosis?: { status: "complete" | "degraded" | "failed"; reason?: string; elapsedMs?: number; retryCount?: number };
  keyword?: { status: "complete" | "degraded" | "failed"; reason?: string; elapsedMs?: number; retryCount?: number };
  fusion: { status: "complete" | "degraded" | "failed"; reason?: string; elapsedMs?: number; retryCount?: number };
  blocked?: boolean;
}
