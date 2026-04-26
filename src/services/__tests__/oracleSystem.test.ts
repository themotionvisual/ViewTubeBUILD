import { describe, expect, it } from "vitest";

import { ORACLE_AGENT_PROFILES } from "../oracle/agents";
import { buildOraclePrompt, ORACLE_PROMPT_TEMPLATES } from "../oracle/prompts";
import { buildOracleSystemBundle, ORACLE_SKILL_SPECS } from "../oracle/registry";
import {
  buildSuggestionCard,
  createOracleQueueRuntime,
  suggestMaterializationMode,
  validateAgentRequest,
} from "../oracle/runtime";
import { DEFAULT_CREATIVE_RUBRIC, scoreCreativeQuality } from "../oracle/quality";
import { ORACLE_TOOL_CONTRACTS, validateToolPermission } from "../oracle/tools";

describe("Oracle skill-system contracts", () => {
  it("builds a bundle with aligned counts", () => {
    const bundle = buildOracleSystemBundle();
    expect(bundle.version).toBe("oracle_expert_v1");
    expect(bundle.skills.length).toBe(ORACLE_SKILL_SPECS.length);
    expect(bundle.agents.length).toBe(ORACLE_AGENT_PROFILES.length);
    expect(bundle.tools.length).toBe(ORACLE_TOOL_CONTRACTS.length);
    expect(bundle.promptTemplates.length).toBe(ORACLE_PROMPT_TEMPLATES.length);
  });

  it("enforces strict agent tool-call budgets", () => {
    const ok = validateAgentRequest("visual-motion", 6);
    const blocked = validateAgentRequest("visual-motion", 7);

    expect(ok.valid).toBe(true);
    expect(blocked.valid).toBe(false);
    expect(blocked.issue).toContain("Tool-call budget exceeded");
  });

  it("validates tool permissions for safety", () => {
    expect(validateToolPermission("render-profile-selector", ["read"])).toBe(true);
    expect(validateToolPermission("composition-assembler", ["read"])).toBe(false);
    expect(validateToolPermission("missing-tool", ["read", "propose"])).toBe(false);
  });

  it("scores and rejects low-quality creative output", () => {
    const low = scoreCreativeQuality(DEFAULT_CREATIVE_RUBRIC, {
      hookClarity: 25,
      visualContrastReadability: 33,
      pacingVariance: 20,
      semanticContinuity: 40,
      brandVoiceFit: 22,
      retentionInterruptTiming: 31,
    });

    expect(low.pass).toBe(false);
    expect(low.needsRevision).toBe(true);
    expect(low.reasons.length).toBeGreaterThan(0);
  });

  it("recommends hybrid-smart materialization based on complexity", () => {
    const lightweight = suggestMaterializationMode(30, "hybrid-smart");
    const heavy = suggestMaterializationMode(88, "hybrid-smart");

    expect(lightweight.mode).toBe("editable");
    expect(heavy.mode).toBe("prerendered");
  });

  it("builds prompt stacks with all sections filled", () => {
    const prompt = buildOraclePrompt({
      agentId: "hook-strategist",
      objective: "Improve first 20 seconds",
      channelVoiceDna: "assertive but educational",
      audienceStyle: "fast-paced tutorial seekers",
      creatorConstraints: ["avoid fear-mongering", "no clickbait"],
      timelineContextJson: '{"durationSec":42}',
    });

    expect(prompt).toContain("creative coach");
    expect(prompt).toContain("Improve first 20 seconds");
    expect(prompt).toContain("assertive but educational");
    expect(prompt).toContain("strict JSON");
  });

  it("tracks queue lifecycle without blocking editor thread assumptions", () => {
    const runtime = createOracleQueueRuntime();
    runtime.enqueue({
      id: "job_1",
      status: "queued",
      agentId: "retention-critic",
      request: {
        task: "audit",
        objective: "Find low-energy spans",
        userInitiated: true,
        surface: "oracle-only",
      },
      progress: 0,
      createdAtIso: new Date().toISOString(),
      updatedAtIso: new Date().toISOString(),
    });

    runtime.updateStatus("job_1", "running");
    runtime.updateStatus("job_1", "ready");

    const [job] = runtime.list();
    expect(job.status).toBe("ready");
    expect(job.progress).toBe(100);
  });

  it("creates suggestion cards that require explicit user confirmation", () => {
    const card = buildSuggestionCard({
      id: "sg_1",
      agentId: "story-beat",
      title: "Tighten setup and move payoff earlier",
      rationale: "Retention drop at 0:18",
      qualitySignals: {
        hookClarity: 82,
        visualContrastReadability: 79,
        pacingVariance: 76,
        semanticContinuity: 88,
        brandVoiceFit: 86,
        retentionInterruptTiming: 84,
      },
      complexityScore: 90,
    });

    expect(card.requiresConfirmation).toBe(true);
    expect(card.suggestedMode).toBe("prerendered");
    expect(card.qualityScore).toBeGreaterThanOrEqual(72);
  });
});
