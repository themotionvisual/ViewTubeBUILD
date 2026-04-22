import { describe, expect, it } from "vitest";
import { applyTimelineCommand, createTimelineState } from "../timeline/reducer";

describe("timeline reducer", () => {
  it("handles insert, split, delete, undo, redo deterministically", () => {
    let state = createTimelineState();
    state = applyTimelineCommand(state, {
      type: "insertClip",
      clip: {
        id: "clip-a",
        trackId: "video-1",
        kind: "video",
        sourceId: "s1",
        title: "A",
        color: "#00FF00",
        startFrame: 0,
        endFrame: 60,
        speed: 1,
        groupedWithNext: false,
        keyframeIds: [],
        effectIds: [],
      },
    });

    state = applyTimelineCommand(state, {
      type: "splitClip",
      clipId: "clip-a",
      frame: 30,
      newClipId: "clip-b",
    });

    expect(state.clips).toHaveLength(2);
    expect(state.clips.map((clip) => [clip.id, clip.startFrame, clip.endFrame])).toEqual([
      ["clip-a", 0, 30],
      ["clip-b", 30, 60],
    ]);

    state = applyTimelineCommand(state, { type: "deleteClip", clipId: "clip-a" });
    expect(state.clips).toHaveLength(1);

    state = applyTimelineCommand(state, { type: "undo" });
    expect(state.clips).toHaveLength(2);

    state = applyTimelineCommand(state, { type: "redo" });
    expect(state.clips).toHaveLength(1);
    expect(state.clips[0].id).toBe("clip-b");
  });

  it("supports arrow-modified cuts and cross-track movement", () => {
    let state = createTimelineState(30);
    state = applyTimelineCommand(state, {
      type: "insertClip",
      clip: {
        id: "clip-cut",
        trackId: "video-1",
        kind: "video",
        sourceId: "src",
        title: "Cut Me",
        color: "#fff070",
        startFrame: 10,
        endFrame: 70,
        speed: 1,
        groupedWithNext: false,
        keyframeIds: [],
        effectIds: [],
      },
    });

    state = applyTimelineCommand(state, {
      type: "arrowCut",
      clipId: "clip-cut",
      frame: 40,
      deleteSide: "left",
    });

    const trimmed = state.clips.find((clip) => clip.id === "clip-cut");
    expect(trimmed?.startFrame).toBe(40);

    state = applyTimelineCommand(state, {
      type: "moveClip",
      clipId: "clip-cut",
      trackId: "text-1",
      startFrame: 43,
      endFrame: 73,
    });

    const moved = state.clips.find((clip) => clip.id === "clip-cut");
    expect(moved?.trackId).toBe("text-1");
  });
});
