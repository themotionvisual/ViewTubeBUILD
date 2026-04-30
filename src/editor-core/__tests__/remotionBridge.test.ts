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
    });

    expect(payload.kind).toBe("remotionRender");
    expect(payload.schemaVersion).toBe("EditorProjectV3");
    expect(payload.composition.fps).toBe(30);
    expect(payload.composition.durationInSeconds).toBe(5);
    expect(payload.composition.width).toBe(1920);
    expect(payload.composition.height).toBe(1080);
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
      format: "mov",
      resolutionProfile: "720",
      aspect: "9:16",
    });
    const request = createRenderJobRequestFromBridgePayload(payload, "launch-1");

    expect(request.projectId).toBe("launch-1");
    expect(request.format).toBe("mov");
    expect(request.aspect).toBe("9:16");
    expect(request.compositionSpec.durationInFrames).toBe(240);
    expect(request.compositionSpec.width).toBe(720);
    expect(request.compositionSpec.height).toBe(1280);
  });
});
