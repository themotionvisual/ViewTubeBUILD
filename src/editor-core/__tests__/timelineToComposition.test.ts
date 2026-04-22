import { describe, expect, it } from "vitest";
import { timelineToComposition } from "../compiler/timelineToComposition";
import { applyTimelineCommand, createTimelineState } from "../timeline/reducer";

describe("timeline to composition", () => {
  it("maps timeline duration and transitions into composition spec", () => {
    let state = createTimelineState(30);
    state = applyTimelineCommand(state, {
      type: "insertClip",
      clip: {
        id: "c1",
        trackId: "video-1",
        kind: "video",
        sourceId: "s1",
        title: "One",
        color: "#00FF00",
        startFrame: 0,
        endFrame: 45,
        speed: 1,
        groupedWithNext: true,
        keyframeIds: [],
        effectIds: [],
      },
    });

    state = applyTimelineCommand(state, {
      type: "insertClip",
      clip: {
        id: "c2",
        trackId: "video-1",
        kind: "video",
        sourceId: "s2",
        title: "Two",
        color: "#FF00FF",
        startFrame: 45,
        endFrame: 90,
        speed: 1,
        groupedWithNext: false,
        keyframeIds: [],
        effectIds: [],
      },
    });

    state = applyTimelineCommand(state, {
      type: "setTransition",
      transition: {
        id: "t1",
        fromClipId: "c1",
        toClipId: "c2",
        type: "crossfade",
        durationInFrames: 12,
      },
    });

    const spec = timelineToComposition(state, {
      compositionId: "test",
      width: 1080,
      height: 1920,
      fps: 30,
      durationInFrames: 1,
    });

    expect(spec.durationInFrames).toBe(90);
    expect(spec.sequences).toHaveLength(2);
    expect(spec.sequences[0].transitionType).toBe("crossfade");
    expect(spec.sequences[0].groupedWithNext).toBe(true);
  });
});
