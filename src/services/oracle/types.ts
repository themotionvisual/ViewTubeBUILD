export type OracleSurface = "oracle-only";

export type MaterializationMode = "editable" | "prerendered" | "hybrid-smart";

export type OracleJobStatus = "queued" | "running" | "ready" | "rejected" | "failed";

export type OracleToolCategory =
  | "composition"
  | "timeline"
  | "transitions"
  | "captions"
  | "audio"
  | "render"
  | "materialization";

export type OracleToolPermission = "read" | "propose" | "apply-safe-patch";

export type OracleAgentId =
  | "hook-strategist"
  | "story-beat"
  | "visual-motion"
  | "caption-rhythm"
  | "audio-energy"
  | "retention-critic"
  | "render-optimization";

export interface CreativeQualityRubricV1 {
  id: string;
  minScore: number;
  weights: {
    hookClarity: number;
    visualContrastReadability: number;
    pacingVariance: number;
    semanticContinuity: number;
    brandVoiceFit: number;
    retentionInterruptTiming: number;
  };
}

export interface OracleToolContractV1 {
  toolId: string;
  name: string;
  category: OracleToolCategory;
  permission: OracleToolPermission;
  description: string;
  inputSchemaRef: string;
  outputSchemaRef: string;
  explainabilityFields: string[];
}

export interface OracleAgentProfileV1 {
  agentId: OracleAgentId;
  name: string;
  responsibility: string;
  allowedToolIds: string[];
  maxToolCallsPerSuggestion: number;
  qualityRubricId: string;
  outputContractRef: string;
}

export interface OraclePromptTemplateV1 {
  templateId: string;
  agentId: OracleAgentId;
  systemCore: string;
  domainPack: string;
  channelPackTemplate: string;
  taskPackTemplate: string;
  outputPack: string;
}

export interface OracleSkillSpecV1 {
  skillId: string;
  intent: string;
  triggerConditions: string[];
  requiredInputs: string[];
  toolPermissions: OracleToolPermission[];
  qualityRubricId: string;
  failureModes: string[];
  outputContractRef: string;
  sourceKnowledgeDomains: string[];
}

export interface OracleProvenanceRecordV1 {
  id: string;
  feature: string;
  model: string;
  provider: string;
  promptHash: string;
  tokenUsage: {
    input: number;
    output: number;
    total: number;
  };
  estimatedCostUsd: number;
  createdAtIso: string;
  chosenByUser: boolean;
}

export interface AiAssetVariant {
  variantId: string;
  name: string;
  summary: string;
  noveltyScore: number;
  qualityScore: number;
  estimatedComplexity: number;
}

export interface AiAsset {
  id: string;
  kind: "hook" | "motion" | "caption" | "audio" | "transition";
  sourcePrompt: string;
  selectedVariantId: string | null;
  variants: AiAssetVariant[];
  complexityScore: number;
}

export interface AiOutputMaterializationV1 {
  mode: MaterializationMode;
  complexityThresholdForPrerender: number;
  reversibleToEditable: boolean;
}

export interface OracleJobV1 {
  id: string;
  status: OracleJobStatus;
  agentId: OracleAgentId;
  request: {
    task: string;
    objective: string;
    userInitiated: boolean;
    surface: OracleSurface;
  };
  progress: number;
  createdAtIso: string;
  updatedAtIso: string;
  error?: string;
}

export interface SuggestionCard {
  id: string;
  agentId: OracleAgentId;
  title: string;
  rationale: string;
  estimatedImpact: "low" | "medium" | "high";
  qualityScore: number;
  requiresConfirmation: boolean;
  suggestedMode: MaterializationMode;
}

export interface RetentionDiagnostic {
  timelineSpanSec: { start: number; end: number };
  riskType:
    | "low-energy"
    | "repetition"
    | "caption-overload"
    | "transition-overload"
    | "audio-flatline";
  severity: "low" | "medium" | "high";
  recommendedFixes: string[];
}

export interface OracleSystemBundleV1 {
  version: "oracle_expert_v1";
  generatedAtIso: string;
  skills: OracleSkillSpecV1[];
  agents: OracleAgentProfileV1[];
  tools: OracleToolContractV1[];
  promptTemplates: OraclePromptTemplateV1[];
  qualityRubrics: CreativeQualityRubricV1[];
}
