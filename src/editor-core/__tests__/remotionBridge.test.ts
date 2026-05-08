import { describe, expect, it } from "vitest";
import {
  createRemotionRenderJobPayload,
  createRenderJobRequestFromBridgePayload,
  createTimelineState,
} from "../index";

describe("remotion bridge", () => {
  it("maps timeline to remotion payload", () => {
    const state = createTimelineState(30);
    state.clips = [
      {
        id: "clip-1",
        trackId: "video-1",
        kind: "video",
        sourceId: "asset-1",
        title: "Intro",
        color: "#00FF00",
        startFrame: 0,
        endFrame: 150,
        speed: 1,
        groupedWithNext: false,
        keyframeIds: [],
        effectIds: [],
      },
    ];

    const payload = createRemotionRenderJobPayload({
      state,
      format: "mp4",
      resolutionProfile: "1080",
      aspect: "16:9",
      renderMode: "quality",
    });

    expect(payload.kind).toBe("remotionRender");
    expect(payload.schemaVersion).toBe("RenderRequestV2");
    expect(payload.compositionMeta.fps).toBe(30);
    expect(payload.compositionMeta.durationInSeconds).toBe(5);
    expect(payload.compositionMeta.width).toBe(1920);
    expect(payload.compositionMeta.height).toBe(1080);
    expect(payload.validation.valid).toBe(true);
  });

  it("builds render-job request from remotion payload", () => {
    const state = createTimelineState(24);
    state.clips = [
      {
        id: "clip-1",
        trackId: "video-1",
        kind: "video",
        sourceId: "asset-1",
        title: "Intro",
        color: "#00FF00",
        startFrame: 0,
        endFrame: 240,
        speed: 1,
        groupedWithNext: false,
        keyframeIds: [],
        effectIds: [],
      },
    ];

    const payload = createRemotionRenderJobPayload({
      state,
      format: "webp",
      resolutionProfile: "720",
      aspect: "9:16",
      renderMode: "frame-perfect",
    });
    const request = createRenderJobRequestFromBridgePayload(payload, "launch-1");

    expect(request.projectId).toBe("launch-1");
    expect(request.format).toBe("webp");
    expect(request.aspect).toBe("9:16");
    expect(request.compositionSpec.durationInFrames).toBe(240);
    expect(request.compositionSpec.width).toBe(720);
    expect(request.compositionSpec.height).toBe(1280);
    expect(request.renderMode).toBe("frame-perfect");
    expect(request.frameAuditConfig?.enabled).toBe(true);
  });
});
