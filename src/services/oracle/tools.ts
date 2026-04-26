import type { OracleToolContractV1 } from "./types";

export const ORACLE_TOOL_CONTRACTS: OracleToolContractV1[] = [
  {
    toolId: "composition-assembler",
    name: "Composition Assembler",
    category: "composition",
    permission: "apply-safe-patch",
    description: "Assembles timeline-safe composition blocks without raw code emission.",
    inputSchemaRef: "schemas/oracle/composition-assembler-input-v1",
    outputSchemaRef: "schemas/oracle/composition-assembler-output-v1",
    explainabilityFields: ["intent", "changedBlocks", "whyThisOrder"],
  },
  {
    toolId: "timeline-sequence-mapper",
    name: "Timeline Sequence Mapper",
    category: "timeline",
    permission: "apply-safe-patch",
    description: "Maps story beats to sequence ranges with pacing constraints.",
    inputSchemaRef: "schemas/oracle/timeline-sequence-mapper-input-v1",
    outputSchemaRef: "schemas/oracle/timeline-sequence-mapper-output-v1",
    explainabilityFields: ["beatMap", "timingReasoning", "riskWarnings"],
  },
  {
    toolId: "transition-timing-planner",
    name: "Transition Timing Planner",
    category: "transitions",
    permission: "propose",
    description: "Plans transition types and durations using retention-safe timing rules.",
    inputSchemaRef: "schemas/oracle/transition-timing-planner-input-v1",
    outputSchemaRef: "schemas/oracle/transition-timing-planner-output-v1",
    explainabilityFields: ["transitionPlan", "timingTradeoffs", "overloadChecks"],
  },
  {
    toolId: "caption-rhythm-planner",
    name: "Caption Rhythm Planner",
    category: "captions",
    permission: "propose",
    description: "Builds caption segmentation and emphasis rhythm for retention.",
    inputSchemaRef: "schemas/oracle/caption-rhythm-planner-input-v1",
    outputSchemaRef: "schemas/oracle/caption-rhythm-planner-output-v1",
    explainabilityFields: ["segmentRules", "emphasisWindows", "readabilitySafeguards"],
  },
  {
    toolId: "audio-energy-orchestrator",
    name: "Audio Energy Orchestrator",
    category: "audio",
    permission: "propose",
    description: "Suggests trim/delay/ducking/SFX order-of-operations with clarity constraints.",
    inputSchemaRef: "schemas/oracle/audio-energy-orchestrator-input-v1",
    outputSchemaRef: "schemas/oracle/audio-energy-orchestrator-output-v1",
    explainabilityFields: ["energyCurve", "duckingPlan", "speechProtection"],
  },
  {
    toolId: "render-profile-selector",
    name: "Render Profile Selector",
    category: "render",
    permission: "read",
    description: "Chooses export profile tradeoffs for quality vs speed.",
    inputSchemaRef: "schemas/oracle/render-profile-selector-input-v1",
    outputSchemaRef: "schemas/oracle/render-profile-selector-output-v1",
    explainabilityFields: ["profileChoice", "qualityTradeoff", "latencyEstimate"],
  },
  {
    toolId: "materialization-advisor",
    name: "Materialization Advisor",
    category: "materialization",
    permission: "apply-safe-patch",
    description: "Determines editable vs pre-render materialization with reversible provenance.",
    inputSchemaRef: "schemas/oracle/materialization-advisor-input-v1",
    outputSchemaRef: "schemas/oracle/materialization-advisor-output-v1",
    explainabilityFields: ["complexityScore", "recommendedMode", "recoveryPath"],
  },
];

export const getToolContract = (toolId: string): OracleToolContractV1 | undefined =>
  ORACLE_TOOL_CONTRACTS.find((tool) => tool.toolId === toolId);

export const validateToolPermission = (
  toolId: string,
  allowed: OracleToolContractV1["permission"][],
): boolean => {
  const contract = getToolContract(toolId);
  if (!contract) return false;
  return allowed.includes(contract.permission);
};
