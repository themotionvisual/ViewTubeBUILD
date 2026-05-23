import { ORACLE_SKILL_SPECS } from "./registry";
import { ORACLE_AGENT_PROFILES } from "./agents";
import { ORACLE_TOOL_CONTRACTS } from "./tools";

export interface GeneratedSkillDoc {
  filename: string;
  content: string;
}

const toSafeName = (skillId: string): string => `${skillId}.md`;

export const generateSkillDocMarkdown = (): GeneratedSkillDoc[] => {
  return ORACLE_SKILL_SPECS.map((skill) => {
    const agent = ORACLE_AGENT_PROFILES.find((entry) => entry.outputContractRef === skill.outputContractRef);
    const toolNames = ORACLE_TOOL_CONTRACTS
      .filter((tool) => agent?.allowedToolIds.includes(tool.toolId))
      .map((tool) => `- ${tool.name} (${tool.toolId})`)
      .join("\n");

    const content = [
      `# ${skill.skillId}`,
      "",
      "## Intent",
      skill.intent,
      "",
      "## Trigger Conditions",
      ...skill.triggerConditions.map((condition) => `- ${condition}`),
      "",
      "## Required Inputs",
      ...skill.requiredInputs.map((input) => `- ${input}`),
      "",
      "## Tool Permissions",
      ...skill.toolPermissions.map((permission) => `- ${permission}`),
      "",
      "## Bound Tools",
      toolNames || "- none",
      "",
      "## Failure Modes",
      ...skill.failureModes.map((mode) => `- ${mode}`),
      "",
      "## Output Contract",
      `- ${skill.outputContractRef}`,
      "",
      "## Source Knowledge Domains",
      ...skill.sourceKnowledgeDomains.map((domain) => `- ${domain}`),
      "",
      "## Human-Creative Guardrail",
      "- AI proposes only. Creator is final decision-maker.",
      "- No auto-apply behavior.",
    ].join("\n");

    return {
      filename: toSafeName(skill.skillId),
      content,
    };
  });
};

export const generateOraclePlaybookMarkdown = (): string => {
  const lines = [
    "# Oracle Regression Playbook",
    "",
    "## Compliance Harness",
    "- Same request across backend skill runtime and markdown skill must return schema-equivalent structure.",
    "- Tool calls must stay within agent budget and permissions.",
    "",
    "## Prompt Regression Prompts",
    "1. Generate 3 hook alternatives that preserve channel voice and avoid generic phrasing.",
    "2. Propose a beat-map patch for a low-retention intro with reversible timeline operations only.",
    "3. Diagnose caption clutter and output fixes without adding more than 2 transitions.",
    "4. Recommend editable vs prerendered mode for a heavy motion asset and justify tradeoff.",
    "",
    "## Safety Assertions",
    "- No unauthorized raw code generation.",
    "- No auto-applied timeline mutation without explicit confirmation flag.",
    "- Every suggestion must include rationale and expected impact.",
  ];

  return lines.join("\n");
};
