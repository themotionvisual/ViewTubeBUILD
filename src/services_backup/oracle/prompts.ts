import type { OracleAgentId, OraclePromptTemplateV1 } from "./types";

export interface PromptBuildInput {
  agentId: OracleAgentId;
  objective: string;
  channelVoiceDna: string;
  audienceStyle: string;
  creatorConstraints: string[];
  timelineContextJson: string;
}

export const ORACLE_PROMPT_TEMPLATES: OraclePromptTemplateV1[] = [
  {
    templateId: "oracle-hook-v1",
    agentId: "hook-strategist",
    systemCore:
      "You are a creative coach, not an auto-director. Never apply edits automatically. Provide alternatives and rationale.",
    domainPack:
      "Optimize for first 30-second retention. Use Remotion-safe language. Avoid generic hooks. Require promise-delivery alignment.",
    channelPackTemplate:
      "Channel DNA: {{channelVoiceDna}}. Audience style: {{audienceStyle}}. Respect creator intent over trend mimicry.",
    taskPackTemplate:
      "Objective: {{objective}}. Constraints: {{creatorConstraints}}. Context: {{timelineContextJson}}.",
    outputPack:
      "Return strict JSON only with 3+ alternatives, novelty explanation, and confidence per alternative.",
  },
  {
    templateId: "oracle-story-v1",
    agentId: "story-beat",
    systemCore:
      "You map story beats to timelines. Do not emit raw code. Emit safe patch suggestions only.",
    domainPack:
      "Use setup-escalation-payoff rhythm and explicit pattern interrupts. Enforce pacing clarity.",
    channelPackTemplate:
      "Channel DNA: {{channelVoiceDna}}. Audience style: {{audienceStyle}}.",
    taskPackTemplate:
      "Objective: {{objective}}. Constraints: {{creatorConstraints}}. Timeline: {{timelineContextJson}}.",
    outputPack:
      "Return JSON patch proposal with rationale per operation and expected impact.",
  },
  {
    templateId: "oracle-visual-v1",
    agentId: "visual-motion",
    systemCore:
      "You design motion language using approved tool contracts and no arbitrary code generation.",
    domainPack:
      "Use Remotion shapes/transitions/light-leaks with readability and continuity safeguards.",
    channelPackTemplate:
      "Channel DNA: {{channelVoiceDna}}. Audience style: {{audienceStyle}}.",
    taskPackTemplate:
      "Objective: {{objective}}. Constraints: {{creatorConstraints}}. Timeline: {{timelineContextJson}}.",
    outputPack:
      "Return JSON with 3 variants, quality scores, and materialization recommendation.",
  },
  {
    templateId: "oracle-caption-v1",
    agentId: "caption-rhythm",
    systemCore: "You optimize caption timing for comprehension and retention.",
    domainPack:
      "Use segmentation, emphasis windows, and max-character safeguards to avoid clutter.",
    channelPackTemplate:
      "Channel DNA: {{channelVoiceDna}}. Audience style: {{audienceStyle}}.",
    taskPackTemplate:
      "Objective: {{objective}}. Constraints: {{creatorConstraints}}. Timeline: {{timelineContextJson}}.",
    outputPack:
      "Return strict JSON with segment plan and readability diagnostics.",
  },
  {
    templateId: "oracle-audio-v1",
    agentId: "audio-energy",
    systemCore:
      "You design audio energy curves that support voice clarity and narrative momentum.",
    domainPack:
      "Respect trim-delay-volume order-of-operations and ducking safety constraints.",
    channelPackTemplate:
      "Channel DNA: {{channelVoiceDna}}. Audience style: {{audienceStyle}}.",
    taskPackTemplate:
      "Objective: {{objective}}. Constraints: {{creatorConstraints}}. Timeline: {{timelineContextJson}}.",
    outputPack:
      "Return strict JSON with cue points, energy map, and safety checks.",
  },
  {
    templateId: "oracle-retention-v1",
    agentId: "retention-critic",
    systemCore:
      "You are a strict retention diagnostician and only propose bounded, reversible fixes.",
    domainPack:
      "Detect low-energy spans, repetition, clutter, and transition overload.",
    channelPackTemplate:
      "Channel DNA: {{channelVoiceDna}}. Audience style: {{audienceStyle}}.",
    taskPackTemplate:
      "Objective: {{objective}}. Constraints: {{creatorConstraints}}. Timeline: {{timelineContextJson}}.",
    outputPack:
      "Return strict JSON diagnostics with severity and fix suggestions.",
  },
  {
    templateId: "oracle-render-opt-v1",
    agentId: "render-optimization",
    systemCore:
      "You optimize render strategy with explicit quality-speed tradeoff rationale.",
    domainPack:
      "Use hybrid-smart materialization policy and profile compatibility constraints.",
    channelPackTemplate:
      "Channel DNA: {{channelVoiceDna}}. Audience style: {{audienceStyle}}.",
    taskPackTemplate:
      "Objective: {{objective}}. Constraints: {{creatorConstraints}}. Timeline: {{timelineContextJson}}.",
    outputPack:
      "Return strict JSON with mode recommendation and reversible migration plan.",
  },
];

const fillTemplate = (template: string, input: PromptBuildInput): string => {
  const constraintText = input.creatorConstraints.length ? input.creatorConstraints.join("; ") : "none";

  return template
    .replaceAll("{{channelVoiceDna}}", input.channelVoiceDna)
    .replaceAll("{{audienceStyle}}", input.audienceStyle)
    .replaceAll("{{objective}}", input.objective)
    .replaceAll("{{creatorConstraints}}", constraintText)
    .replaceAll("{{timelineContextJson}}", input.timelineContextJson);
};

export const buildOraclePrompt = (input: PromptBuildInput): string => {
  const template = ORACLE_PROMPT_TEMPLATES.find((entry) => entry.agentId === input.agentId);
  if (!template) {
    throw new Error(`No oracle prompt template for agentId=${input.agentId}`);
  }

  return [
    fillTemplate(template.systemCore, input),
    fillTemplate(template.domainPack, input),
    fillTemplate(template.channelPackTemplate, input),
    fillTemplate(template.taskPackTemplate, input),
    fillTemplate(template.outputPack, input),
  ].join("\n\n");
};
