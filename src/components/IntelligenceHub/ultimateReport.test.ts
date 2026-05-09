import { describe, expect, it, vi } from "vitest";

vi.mock("./gemini", () => ({
  generateArchitectDiagnosis: vi.fn(),
  generateOracleReport: vi.fn(),
  generateKeywordResearch: vi.fn(),
}));

import { generateArchitectDiagnosis, generateKeywordResearch, generateOracleReport } from "./gemini";
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
    expect(result.oracle.sections).toEqual([]);
  });
});
