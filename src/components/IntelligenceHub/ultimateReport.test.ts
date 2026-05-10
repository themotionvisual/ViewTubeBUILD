import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/services/gemini", () => ({
  generateArchitectDiagnosis: vi.fn(),
  generateOracleReport: vi.fn(),
  generateKeywordResearch: vi.fn(),
}));
vi.mock("@/services/analyticsSelectors", () => ({
  getMetricSummary: vi.fn(() => ({
    totals: { views: 1200, revenue: 15, subscribersGained: 12, watchHours: 95 },
    averages: { ctr: 0, rpm: 0 },
  })),
  getMasterRows: vi.fn(() => [
    {
      title: "Video A",
      metrics: {
        views: { value: 1200 },
        ctr: { value: 4.5 },
      },
    },
  ]),
}));

import { generateArchitectDiagnosis, generateKeywordResearch, generateOracleReport } from "@/services/gemini";
import { __test__, generateUltimateChannelReport } from "./ultimateReport";

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
});

describe("ultimateReport generation integration", () => {
  const storage: Record<string, string> = {};
  beforeEach(() => {
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

    const result = await generateUltimateChannelReport({ autoContext: "ctx" });
    expect(result.report.blocks).toHaveLength(14);
    expect(result.report.executiveSummary).toBe("Executive summary only");
    expect(result.oracle.sections).toHaveLength(9);
  });

  it("blocks generation when required sources are missing", async () => {
    globalThis.localStorage.removeItem("vt_ultimate_tool_context_pack_v1");
    globalThis.localStorage.removeItem("yt_analytics_cache");
    globalThis.localStorage.removeItem("vt_auth_state");
    await expect(generateUltimateChannelReport({ autoContext: "ctx" })).rejects.toThrow(
      /REPORT_PREFLIGHT_BLOCKED::/,
    );
  });

  it("passes user_profile check via auth state when cache profile is missing", async () => {
    globalThis.localStorage.setItem(
      "yt_analytics_cache",
      JSON.stringify({
        videos: [{ id: "v1" }],
        lastSynced: new Date().toISOString(),
      }),
    );
    globalThis.localStorage.setItem("vt_auth_state", JSON.stringify({ isAuthenticated: true }));
    const result = await generateUltimateChannelReport({ autoContext: "ctx" });
    const profileGate = result.report.meta.diagnostics.preflight?.requiredSources.find((item) => item.key === "user_profile");
    expect(profileGate?.present).toBe(true);
  });
});
