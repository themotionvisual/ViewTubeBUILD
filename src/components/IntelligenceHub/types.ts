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
  summary: string;
  recommendations: string[];
  chartSuggestion?: ChartConfig;
  tableSpec?: UnifiedTableSpec;
}

export interface UltimateChannelReport {
  meta: {
    generatedAt: string;
    dataSources: string[];
    contextMode: "auto" | "manual" | "hybrid";
  };
  executiveSummary: string;
  blocks: UltimateReportBlock[];
  actionPlan: string[];
  riskFlags: string[];
}
