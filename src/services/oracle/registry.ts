import { ORACLE_AGENT_PROFILES } from "./agents";
import { ORACLE_PROMPT_TEMPLATES } from "./prompts";
import { DEFAULT_CREATIVE_RUBRIC } from "./quality";
import { ORACLE_TOOL_CONTRACTS } from "./tools";
import type { OracleSkillSpecV1, OracleSystemBundleV1 } from "./types";

const SOURCE_KNOWLEDGE_DOMAINS = [
  "/Users/cwb/Downloads/viewtube/remotionbasix.txt",
  "/Users/cwb/Downloads/viewtube/docs/Video Editor/Reac:SVG:Remotion:AI Assets Video Generator Stuff copy.txt",
  "/Users/cwb/Downloads/viewtube/docs/Video Editor/remotion_full_docs copy 2.txt",
  "https://www.remotion.dev/docs",
];

export const ORACLE_SKILL_SPECS: OracleSkillSpecV1[] = [
  {
    skillId: "hook-strategist-v1",
    intent: "Create high-retention opening hooks while preserving creator voice.",
    triggerConditions: ["weak opening", "low early retention", "hook rewrite requested"],
    requiredInputs: ["channel_voice_dna", "timeline_context", "video_objective"],
    toolPermissions: ["propose"],
    qualityRubricId: DEFAULT_CREATIVE_RUBRIC.id,
    failureModes: ["generic hook", "promise mismatch", "voice mismatch"],
    outputContractRef: "contracts/oracle/hook-suggestion-v1",
    sourceKnowledgeDomains: SOURCE_KNOWLEDGE_DOMAINS,
  },
  {
    skillId: "story-beat-v1",
    intent: "Map story beats to timeline pacing safely.",
    triggerConditions: ["pacing issues", "story restructuring request", "retention drop-off"],
    requiredInputs: ["timeline_context", "story_goal", "constraints"],
    toolPermissions: ["propose", "apply-safe-patch"],
    qualityRubricId: DEFAULT_CREATIVE_RUBRIC.id,
    failureModes: ["overlong setup", "weak payoff", "beat monotony"],
    outputContractRef: "contracts/oracle/story-beat-patch-v1",
    sourceKnowledgeDomains: SOURCE_KNOWLEDGE_DOMAINS,
  },
  {
    skillId: "visual-motion-v1",
    intent: "Generate motion language variants with readability and continuity safeguards.",
    triggerConditions: ["visual refresh", "intro variant request", "motion block generation"],
    requiredInputs: ["timeline_context", "style_goals", "channel_visual_dna"],
    toolPermissions: ["propose", "apply-safe-patch"],
    qualityRubricId: DEFAULT_CREATIVE_RUBRIC.id,
    failureModes: ["effect overload", "visual clutter", "semantic drift"],
    outputContractRef: "contracts/oracle/visual-motion-patch-v1",
    sourceKnowledgeDomains: SOURCE_KNOWLEDGE_DOMAINS,
  },
  {
    skillId: "caption-rhythm-v1",
    intent: "Optimize caption rhythm for retention and readability.",
    triggerConditions: ["caption generation", "subtitle cleanup", "readability audit"],
    requiredInputs: ["transcript", "timeline_context", "reading_speed_profile"],
    toolPermissions: ["propose"],
    qualityRubricId: DEFAULT_CREATIVE_RUBRIC.id,
    failureModes: ["caption clutter", "late emphasis", "line overflow"],
    outputContractRef: "contracts/oracle/caption-rhythm-plan-v1",
    sourceKnowledgeDomains: SOURCE_KNOWLEDGE_DOMAINS,
  },
  {
    skillId: "audio-energy-v1",
    intent: "Shape audio dynamics for energy without harming speech clarity.",
    triggerConditions: ["flat audio", "music/sfx planning", "ducking optimization"],
    requiredInputs: ["audio_tracks", "speech_regions", "timeline_context"],
    toolPermissions: ["propose"],
    qualityRubricId: DEFAULT_CREATIVE_RUBRIC.id,
    failureModes: ["voice masking", "energy flatline", "cue spam"],
    outputContractRef: "contracts/oracle/audio-energy-plan-v1",
    sourceKnowledgeDomains: SOURCE_KNOWLEDGE_DOMAINS,
  },
  {
    skillId: "retention-critic-v1",
    intent: "Diagnose attention risks and suggest reversible fixes.",
    triggerConditions: ["retention audit", "drop-off investigation", "final quality review"],
    requiredInputs: ["timeline_context", "engagement_signals", "caption_audio_state"],
    toolPermissions: ["read", "propose"],
    qualityRubricId: DEFAULT_CREATIVE_RUBRIC.id,
    failureModes: ["false positives", "over-prescriptive edits", "style flattening"],
    outputContractRef: "contracts/oracle/retention-diagnostic-v1",
    sourceKnowledgeDomains: SOURCE_KNOWLEDGE_DOMAINS,
  },
  {
    skillId: "render-optimization-v1",
    intent: "Recommend editable vs pre-render output mode for speed and reversibility.",
    triggerConditions: ["heavy scene", "lag mitigation", "export optimization"],
    requiredInputs: ["asset_complexity", "timeline_context", "render_target"],
    toolPermissions: ["read", "propose", "apply-safe-patch"],
    qualityRubricId: DEFAULT_CREATIVE_RUBRIC.id,
    failureModes: ["irreversible flattening", "quality loss", "wrong profile"],
    outputContractRef: "contracts/oracle/render-optimization-v1",
    sourceKnowledgeDomains: SOURCE_KNOWLEDGE_DOMAINS,
  },
];

export const buildOracleSystemBundle = (): OracleSystemBundleV1 => ({
  version: "oracle_expert_v1",
  generatedAtIso: new Date().toISOString(),
  skills: ORACLE_SKILL_SPECS,
  agents: ORACLE_AGENT_PROFILES,
  tools: ORACLE_TOOL_CONTRACTS,
  promptTemplates: ORACLE_PROMPT_TEMPLATES,
  qualityRubrics: [DEFAULT_CREATIVE_RUBRIC],
});
