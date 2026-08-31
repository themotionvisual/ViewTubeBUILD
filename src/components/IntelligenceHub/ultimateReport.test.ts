import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/services/gemini", () => ({
  generateArchitectDiagnosis: vi.fn(),
  generateOracleReport: vi.fn(),
  generateKeywordResearch: vi.fn(),
  isGeminiConfigured: vi.fn(() => true),
}));

import { generateArchitectDiagnosis, generateKeywordResearch, generateOracleReport, isGeminiConfigured } from "@/services/gemini";
import { buildCanonicalIntelligenceEvidence } from "@/services/analytics-canon";
import { normalizeVtSyncSnapshot } from "@/features/vt-sync-local/adapters/snapshot";
import { __test__, generateUltimateChannelReport } from "./ultimateReport";

const buildEvidence = (overrides: Record<string, unknown> = {}) => buildCanonicalIntelligenceEvidence(normalizeVtSyncSnapshot({
  source: "vt-sync",
  snapshotId: "report-snapshot",
  capturedAt: new Date().toISOString(),
  channelId: "chan_1",
  channelName: "Test Channel",
  videos: [{ id: "v1", title: "Video A", metrics: { views: 1200, ctr: 4.5 } }],
  ...overrides,
}), { maximumRowsPerDataset: 1 });

describe("ultimateReport normalization", () => {
  it("normalizes oracle payload when sections are missing", () => {
    const normalized = __test__.normalizeOracleReport({
      executiveSummary: "summary",
      stats: { views: "1234", ctr: "2.5" },
    });

    expect(normalized.executiveSummary).toBe("summary");
    expect(normalized.sections).toEqual([]);
    expect(normalized.stats.views).toBe(1234);
    expect(normalized.stats.ctr).toBe(2.5);
  });

  it("uses the first substantive section when the model omits executiveSummary", () => {
    const normalized = __test__.normalizeOracleReport({
      executiveSummary: "",
      sections: [{ title: "Executive Summary", content: "Evidence-backed channel direction." }],
    });

    expect(normalized.executiveSummary).toBe("Evidence-backed channel direction.");
  });

  it("coerces malformed sections into safe section entries", () => {
    const normalized = __test__.normalizeOracleReport({
      sections: [
        { title: 101, content: 202 },
        null,
        { heading: "Fallback", summary: "Recovered" },
      ],
    });

    expect(normalized.sections.length).toBe(2);
    expect(normalized.sections[0].title).toBe("101");
    expect(normalized.sections[0].content).toBe("202");
    expect(normalized.sections[1].title).toBe("Fallback");
    expect(normalized.sections[1].content).toBe("Recovered");
  });

  it("sectionByMatch is safe and returns undefined for empty sections", () => {
    const section = __test__.sectionByMatch(
      { executiveSummary: "", sections: [], stats: {} },
      "RETENTION",
    );
    expect(section).toBeUndefined();
  });

  it("retries a transient model failure only once", async () => {
    const producer = vi.fn().mockRejectedValue({ status: 503, message: "Service unavailable" });
    const result = await __test__.withTimeoutRetry(producer, 100, "transient step");
    expect(producer).toHaveBeenCalledTimes(2);
    expect(result).toMatchObject({ failed: true, retryCount: 1, failure: { code: "AI_UPSTREAM_UNAVAILABLE" } });
  });
});

describe("ultimateReport generation integration", () => {
  const storage: Record<string, string> = {};
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isGeminiConfigured).mockReturnValue(true);
    Object.keys(storage).forEach((key) => delete storage[key]);
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => storage[key] ?? null,
      setItem: (key: string, value: string) => {
        storage[key] = value;
      },
      removeItem: (key: string) => {
        delete storage[key];
      },
    });
    globalThis.localStorage.setItem("vt_ultimate_tool_context_pack_v1", "brain ok");
    globalThis.localStorage.setItem(
      "yt_analytics_cache",
      JSON.stringify({
        profile: { id: "chan_1" },
        videos: [{ id: "v1" }],
        lastSynced: new Date().toISOString(),
      }),
    );
    globalThis.localStorage.setItem("vt_auth_state", JSON.stringify({ isAuthenticated: true }));
  });

  it("generates 14 blocks even when oracle has no sections", async () => {
    vi.mocked(generateArchitectDiagnosis).mockResolvedValue({
      clusterCenter: "History",
      nicheAuthority: 77,
      audienceDNA: [],
      hiddenStory: "Hidden story",
      dailyBrief: { priority: "P1", impact: "I1", steps: ["A", "B"] },
    });

    vi.mocked(generateOracleReport).mockResolvedValue({
      executiveSummary: "Executive summary only",
      stats: { views: 1000 },
      // sections intentionally missing
    });

    vi.mocked(generateKeywordResearch).mockResolvedValue({
      marketAnalysis: "Market view",
      trendData: [],
      keywordMetrics: [],
      contentFormats: [],
      sentimentAnalysis: [],
      demographics: [],
      lsiKeywords: [],
      longTailKeywords: [],
      searchIntent: [],
      viralHooks: [],
      retentionForecast: [],
      competitorScores: [],
      ctrPowerWords: [],
      formatRoi: [],
    });

    const result = await generateUltimateChannelReport({ evidence: buildEvidence(), autoContext: "ctx", generationId: "generation-from-ui" });
    expect(result.report.blocks).toHaveLength(14);
    expect(result.report.executiveSummary).toContain("Video A has 1,200 views");
    expect(result.report.meta.generationId).toBe("generation-from-ui");
    expect(result.oracle.sections).toHaveLength(9);
  });

  it("blocks generation when required sources are missing", async () => {
    await expect(generateUltimateChannelReport({ evidence: buildEvidence({ channelId: null, videos: [] }), autoContext: "ctx" })).rejects.toMatchObject({
      failure: expect.objectContaining({ code: "AI_GENERATION_FAILED", retryable: false }),
      details: expect.objectContaining({ preflight: expect.objectContaining({ ok: false }) }),
    });
  });

  it("passes the user_profile check from channel-scoped VT-SYNC identity", async () => {
    const result = await generateUltimateChannelReport({ evidence: buildEvidence(), autoContext: "ctx" });
    const profileGate = result.report.meta.diagnostics.preflight?.requiredSources.find((item) => item.key === "user_profile");
    expect(profileGate?.present).toBe(true);
    expect(result.report.meta.authoritativeSurface).toBe("/analytics");
    expect(result.report.meta.snapshotId).toBe("report-snapshot");
  });

  it("does not depend on a client-side Gemini key", async () => {
    vi.mocked(isGeminiConfigured).mockReturnValue(false);
    const result = await generateUltimateChannelReport({ evidence: buildEvidence(), autoContext: "ctx" });
    expect(result.report.executiveSummary).toContain("Video A has 1,200 views");
    expect(generateArchitectDiagnosis).not.toHaveBeenCalled();
    expect(generateOracleReport).not.toHaveBeenCalled();
    expect(generateKeywordResearch).not.toHaveBeenCalled();
  });

  it("uses an evidence-only degraded report when the managed provider is unavailable", async () => {
    const missingKey = new Error("Gemini API key is missing");
    vi.mocked(generateArchitectDiagnosis).mockRejectedValue(missingKey);
    vi.mocked(generateOracleReport).mockRejectedValue(missingKey);
    vi.mocked(generateKeywordResearch).mockRejectedValue(missingKey);

    const result = await generateUltimateChannelReport({ evidence: buildEvidence(), autoContext: "ctx" });
    expect(result.report.meta.overallStatus).toBe("degraded");
    expect(result.report.meta.diagnostics.modelRecoveryApplied).toBe(true);
    expect(result.report.validation?.valid).toBe(true);
    expect(generateArchitectDiagnosis).not.toHaveBeenCalled();
    expect(generateKeywordResearch).not.toHaveBeenCalled();
    expect(generateOracleReport).not.toHaveBeenCalled();
    expect(Object.keys(storage).some((key) => key.startsWith("vt_ultimate_generation_history_v1:"))).toBe(true);
  });

  it("keeps usable partial output as degraded and preserves dataset quality flags", async () => {
    vi.mocked(generateArchitectDiagnosis).mockResolvedValue({
      clusterCenter: "History",
      nicheAuthority: 70,
      audienceDNA: [],
      hiddenStory: "Evidence-backed story",
      dailyBrief: { priority: "P1", impact: "I1", steps: ["Act"] },
    });
    vi.mocked(generateKeywordResearch).mockResolvedValue({ marketAnalysis: "Market", keywordMetrics: [] } as never);
    vi.mocked(generateOracleReport)
      .mockRejectedValueOnce(new Error("Gemini API key is missing"))
      .mockResolvedValueOnce({ executiveSummary: "Recovered report", sections: [], stats: { views: 1200 } });

    const result = await generateUltimateChannelReport({ evidence: buildEvidence(), autoContext: "ctx" });
    expect(result.report.meta.overallStatus).toBe("degraded");
    expect(result.report.meta.failedCount).toBe(0);
    expect(result.report.sectionStates?.every((section) => section.status === "degraded")).toBe(true);
    expect(result.report.sectionStates?.some((section) => section.qualityFlags.some((flag) => flag.startsWith("dataset_")))).toBe(true);
    expect(Object.keys(storage).some((key) => key.startsWith("vt_ultimate_generation_history_v1:"))).toBe(true);
  });
});
