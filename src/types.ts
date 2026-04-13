// src/types.ts

export type AppTool =
  | 'STORYBOARD_STUDIO'
  | 'SEO_GENERATOR'
  | 'THUMBNAIL_STUDIO'
  | 'CHANNELYTICS'
  | 'RESEARCH_LAB'
  | 'IDEAS_VAULT'
  | 'LAUNCH_CALENDAR';

export type ProjectStatus = 'ideation' | 'scripting' | 'filming' | 'editing' | 'publishing' | 'published';

export interface ProjectTask {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
}

export interface Project {
  id: string;
  name: string;
  videoTitle: string;
  status: ProjectStatus;
  color: string;
  publishDate: string;
  tasks: ProjectTask[];
  script: string;
  description: string;
  notes: string;
  tags: string;
  thumbnailUrl: string;
  plan: ProjectPlan;
  storyboard: Scene[];
  shortsStrategyGenerated?: boolean;
}

export interface DayTask {
  id: string;
  text: string;
  completed: boolean;
  projectId: string;
  isPublishEvent?: boolean;
}

export interface ProjectPlan {
  topic: string;
  description: string;
  length: string;
  audience: string;
  vision: string;
  hook: string;
}

export const AspectRatio = {
  SQUARE: "1:1",
  PORTRAIT_2_3: "2:3",
  LANDSCAPE_3_2: "3:2",
  PORTRAIT_3_4: "3:4",
  LANDSCAPE_4_3: "4:3",
  PORTRAIT_9_16: "9:16",
  LANDSCAPE_16_9: "16:9",
  CINEMATIC_21_9: "21:9"
} as const;
export type AspectRatio = typeof AspectRatio[keyof typeof AspectRatio];

export const ImageSize = {
  SIZE_1K: "1K",
  SIZE_2K: "2K",
  SIZE_4K: "4K"
} as const;
export type ImageSize = typeof ImageSize[keyof typeof ImageSize];

// --- Analytics / Channelytics Types ---

export type CsvTag =
  | 'shorts'
  | 'long'
  | 'combined'
  | 'mixed'
  | 'single_long_video'
  | 'single_short_video'
  | 'geo'
  | 'audience'
  | 'traffic'
  | 'external'
  | 'search'
  | 'daily'
  | 'other'
  | 'unknown';

export type CsvUploadType = 'auto' | CsvTag;
 
export interface CsvFileWithTag {
  id: string;
  name: string;
  tag: CsvTag;
  file?: File;
  data?: any[];
  dateRange?: string;
  featureName?: string;
  analyticsWindow?: '7d' | '28d' | '90d' | '365d' | 'lifetime';
  exportKind?: 'table_data' | 'totals' | 'chart' | 'unknown';
}

export interface ChartConfig {
  id?: string;
  title: string;
  subtitle?: string;
  type: string; // LineChart, BarChart, etc.
  provider: 'google' | 'recharts';
  xAxisKey: string;
  dataKeys: string[];
  zAxisKey?: string;
  options?: any;
  data?: () => any[]; // For dynamic Google Charts data
  videoCount?: number;
  sortType?: 'recent' | 'highest_rated' | 'alphabetical';
  durationType?: 'shorts' | 'long' | 'combined';
}

export interface AnalysisSection {
  title: string;
  content: string;
  chartSuggestion?: ChartConfig;
}

export interface KeywordComparisonTable {
  headers: string[];
  rows: string[][];
}

export interface MiniSpreadsheet {
  title: string;
  headers: string[];
  rows: string[][];
}

export interface AnalyticsResult {
  executiveSummary: string;
  stats: Record<string, string | number>;
  sections: AnalysisSection[];
  keywordComparisonTable?: KeywordComparisonTable;
  miniSpreadsheets?: MiniSpreadsheet[];
}


export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}

export type SeoResult = {
  id?: string;
  timestamp?: number;
  concept?: string;
  niche?: string;
  analysis: string;
  filenames: { video: string; thumbnail: string };
  titleSets: { title: string; thumbnailPrompt: string; thumbnailText: string }[];
  description: string;
  tags: string;
  category: string;
  pinnedComment: string[];
  communityPost: string[];
  shortsScript: string;
  educationMoments: string;
  social: { twitter: string; email: string };
  groundingUrls?: string[];
};

export interface KeywordAnalysisResult {
  lsiKeywords: string[];
  longTailKeywords: string[];
  searchIntent: {
    query: string;
    intent: 'Informational' | 'Transactional' | 'Navigational' | 'Commercial';
    contentAngle: string;
  }[];
  viralHooks: string[];
  trendData: {
    month: string;
    google: number;
    youtube: number;
  }[];
  keywordMetrics: {
    keyword: string;
    volume: number;
    difficulty: number;
    relevance: number;
  }[];
  demographics: {
    group: string;
    percentage: number;
  }[];
  contentFormats: {
    format: string;
    percentage: number;
  }[];
  sentimentAnalysis: {
    emotion: string;
    score: number;
  }[];
  retentionForecast: {
    timePoint: string;
    retention: number;
  }[];
  competitorScores: {
    aspect: string;
    score: number;
  }[];
  ctrPowerWords: {
    word: string;
    score: number;
  }[];
  formatRoi: {
    format: string;
    effort: number;
    impact: number;
  }[];
  marketAnalysis: string;
}

export interface TagSuggestion {
  tag: string;
  score: number;
  searchVolume: number;
  competition: number;
  rank: number;
  tripleKeyword: boolean;
}

export interface MediaAnalysisResult {
  analysis: string;
  strategicAnalysis?: string;
  retentionCurve?: {
    timePoint: string;
    retention: number;
  }[];
}

export interface HookResult {
  styleName: string;
  explanation: string;
  script: string;
  timeline: { time: string; audio: string; visuals: string; }[];
  assemblyInstructions: string;
}

export interface PollBlueprint {
  question: string;
  options: string[];
  strategy: string;
}

export interface ShortsConcept {
  hook: string;
  script: string;
  visuals: string;
  bridgeStrategy: string;
}

export interface ThumbnailHistoryItem {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

export interface Scene {
  id: string;
  name: string;
  text: string;
  broll: string;
  imageUrl: string | null;
  voiceoverUrl?: string | null; // NEW: Voiceover support
  emotionScore: number;
  durationEstimate: number;
}

export type AlgorithmDiagnosis = {
  clusterCenter: string;
  nicheAuthority: number;
  audienceDNA: { interest: string; overlap: number }[];
  hiddenStory: string;
};

export type DailyBrief = {
  algorithmSentiment: 'positive' | 'neutral' | 'negative';
  mainPriority: string;
  actionSteps: string[];
  estimatedImpact: string;
};

export interface AuthState {
  isAuthenticated: boolean;
  channelName: string | null;
  channelThumbnail: string | null;
  subscriberCount: number | null;
  totalViews: number | null;
}

export interface WorkspaceBrain {
  // Global Tracking
  activeProviders: AppTool[];

  // 1. The Core Idea
  coreConcept: string;
  targetNiche: string;

  // 2. Metadata & SEO (from SeoGenerator)
  seoState: {
    winningTitle: string | null;
    winningKeywords: string[];
    descriptionDraft: string;
    results: SeoResult[];
  };

  // 3. Narrative & Visuals (from StoryboardStudio)
  storyboardState: {
    scenes: Scene[];
    estimatedDuration: number;
    pacingHealth: 'Excellent' | 'Warning' | 'Critical';
  };

  // 4. Packaging (from ThumbnailStudio)
  thumbnailState: {
    selectedStyle: string;
    activeImageUrl: string | null;
    prompt?: string;
  };

  // 5. Analytical Constraints
  analyticalConstraints: {
    provenFormats: string[];
    forbiddenTopics: string[];
  };

  // 6. Channelytics & Data
  channelyticsState: {
    csvFiles: CsvFileWithTag[];
    allData: any[];
    analyticsResult: AnalyticsResult | null;
  };

  researchLabState: {
    csvFiles: CsvFileWithTag[];
    allData: any[]; // Store the parsed CSV rows persistently
    analyticsResult: AnalyticsResult | null;
  };

  videoFlags: Record<
    string,
    { excludeAnalysis?: boolean; includeOnly?: boolean; priorityAnalysis?: boolean }
  >;

  // 7. Project & Calendar Management
  projects: Project[];
  calendarState: {
    dayTasks: Record<string, DayTask[]>; // dateString -> tasks
  };
  channelHub: {
    toDos: ProjectTask[];
    goals: { id: string; text: string; category: string; completed: boolean }[];
  };
}

// Product + Data Architecture Contracts
export type MasterTableType =
  | 'master_channel_identity'
  | 'master_video_core'
  | 'master_audience'
  | 'master_geography'
  | 'master_traffic'
  | 'master_device_playback'
  | 'master_retention'
  | 'master_monetization'
  | 'master_external_signals'
  | 'master_formula_metrics'
  | 'master_coverage_registry';

export type IngestMode = 'connected' | 'import' | 'hybrid' | 'public_handle';

export type MetricAccuracyClass =
  | 'exact'
  | 'derived_exact'
  | 'estimated'
  | 'unavailable';
