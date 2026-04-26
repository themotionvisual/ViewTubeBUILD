import type { OracleAgentProfileV1 } from "./types";

export const ORACLE_AGENT_PROFILES: OracleAgentProfileV1[] = [
  {
    agentId: "hook-strategist",
    name: "HookStrategistAgent",
    responsibility: "Design opening hooks with novelty and promise-fulfillment constraints.",
    allowedToolIds: ["timeline-sequence-mapper", "caption-rhythm-planner"],
    maxToolCallsPerSuggestion: 4,
    qualityRubricId: "creative-quality-default-v1",
    outputContractRef: "contracts/oracle/hook-suggestion-v1",
  },
  {
    agentId: "story-beat",
    name: "StoryBeatAgent",
    responsibility: "Map setup-escalation-payoff beat structure to timeline segments.",
    allowedToolIds: ["timeline-sequence-mapper", "transition-timing-planner"],
    maxToolCallsPerSuggestion: 5,
    qualityRubricId: "creative-quality-default-v1",
    outputContractRef: "contracts/oracle/story-beat-patch-v1",
  },
  {
    agentId: "visual-motion",
    name: "VisualMotionAgent",
    responsibility: "Compose motion language using Remotion-safe shape/transition grammar.",
    allowedToolIds: ["composition-assembler", "transition-timing-planner", "materialization-advisor"],
    maxToolCallsPerSuggestion: 6,
    qualityRubricId: "creative-quality-default-v1",
    outputContractRef: "contracts/oracle/visual-motion-patch-v1",
  },
  {
    agentId: "caption-rhythm",
    name: "CaptionRhythmAgent",
    responsibility: "Generate retention-safe caption rhythm and emphasis plans.",
    allowedToolIds: ["caption-rhythm-planner"],
    maxToolCallsPerSuggestion: 4,
    qualityRubricId: "creative-quality-default-v1",
    outputContractRef: "contracts/oracle/caption-rhythm-plan-v1",
  },
  {
    agentId: "audio-energy",
    name: "AudioEnergyAgent",
    responsibility: "Create audio-energy plans with intelligibility and pacing safeguards.",
    allowedToolIds: ["audio-energy-orchestrator", "materialization-advisor"],
    maxToolCallsPerSuggestion: 5,
    qualityRubricId: "creative-quality-default-v1",
    outputContractRef: "contracts/oracle/audio-energy-plan-v1",
  },
  {
    agentId: "retention-critic",
    name: "RetentionCriticAgent",
    responsibility: "Diagnose attention risks and propose bounded fixes.",
    allowedToolIds: ["timeline-sequence-mapper", "caption-rhythm-planner", "transition-timing-planner"],
    maxToolCallsPerSuggestion: 5,
    qualityRubricId: "creative-quality-default-v1",
    outputContractRef: "contracts/oracle/retention-diagnostic-v1",
  },
  {
    agentId: "render-optimization",
    name: "RenderOptimizationAgent",
    responsibility: "Optimize output materialization and render profile selection.",
    allowedToolIds: ["materialization-advisor", "render-profile-selector"],
    maxToolCallsPerSuggestion: 4,
    qualityRubricId: "creative-quality-default-v1",
    outputContractRef: "contracts/oracle/render-optimization-v1",
  },
];

export const getOracleAgentProfile = (agentId: OracleAgentProfileV1["agentId"]): OracleAgentProfileV1 | undefined =>
  ORACLE_AGENT_PROFILES.find((agent) => agent.agentId === agentId);
