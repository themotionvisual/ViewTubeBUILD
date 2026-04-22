import { describe, expect, it } from "vitest";
import {
  buildBasicSvgFrame,
  buildHtmlPackage,
  buildProjectJson,
  completeExportJob,
  createExportJob,
  createTimelineState,
} from "../index";

describe("export engine", () => {
  it("creates and completes export jobs", () => {
    const job = createExportJob({ format: "json", presetId: "default" }, "vt-export");
    expect(job.status).toBe("queued");
    expect(job.artifacts[0].format).toBe("json");

    const done = completeExportJob(job, "blob:test");
    expect(done.status).toBe("completed");
    expect(done.artifacts[0].status).toBe("ready");
  });

  it("builds json/html/svg payloads", () => {
    const state = createTimelineState(30);
    const json = buildProjectJson(state);
    const html = buildHtmlPackage(json);
    const svg = buildBasicSvgFrame(state);

    expect(json).toContain("timeline");
    expect(html).toContain("ViewTube Editor Project Package");
    expect(svg).toContain("<svg");
  });
});
