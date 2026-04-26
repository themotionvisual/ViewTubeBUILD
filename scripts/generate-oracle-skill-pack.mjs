import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd());
const registryPath = path.join(root, "src/services/oracle/oracle-skill-registry.v1.json");
const outputDir = path.resolve(root, "../docs/Video Editor/oracle-skill-pack/generated");

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
fs.mkdirSync(outputDir, { recursive: true });

for (const skill of registry.skills) {
  const lines = [
    `# ${skill.skill_id}`,
    "",
    "## Intent",
    skill.intent,
    "",
    "## Trigger Conditions",
    ...skill.trigger_conditions.map((c) => `- ${c}`),
    "",
    "## Required Inputs",
    ...skill.required_inputs.map((input) => `- ${input}`),
    "",
    "## Tool Permissions",
    ...skill.tool_permissions.map((p) => `- ${p}`),
    "",
    "## Quality Rubric",
    `- ${skill.quality_rubric}`,
    "",
    "## Failure Modes",
    ...skill.failure_modes.map((f) => `- ${f}`),
    "",
    "## Output Contract",
    `- ${skill.output_contract}`,
    "",
    "## Guardrail",
    "- Oracle-only, manual-copilot behavior. Never auto-apply.",
  ];

  fs.writeFileSync(path.join(outputDir, `${skill.skill_id}.md`), lines.join("\n"), "utf8");
}

console.log(`Generated ${registry.skills.length} oracle skill docs in ${outputDir}`);
