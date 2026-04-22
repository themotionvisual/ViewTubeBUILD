import { describe, expect, it } from "vitest";
import { interpolateKeyframes } from "../keyframes/interpolation";

describe("keyframe interpolation", () => {
  it("returns deterministic interpolated values", () => {
    const keyframes = [
      {
        id: "k1",
        clipId: "clip-1",
        frame: 0,
        easing: "linear" as const,
        value: { x: 0, opacity: 0, scale: 1 },
      },
      {
        id: "k2",
        clipId: "clip-1",
        frame: 100,
        easing: "bezier" as const,
        value: { x: 100, opacity: 1, scale: 2 },
      },
    ];

    const first = interpolateKeyframes(keyframes, 50);
    const second = interpolateKeyframes(keyframes, 50);

    expect(first).toEqual(second);
    expect(first.x).toBeGreaterThan(30);
    expect(first.x).toBeLessThan(95);
    expect(first.opacity).toBeGreaterThan(0.3);
    expect(first.opacity).toBeLessThan(0.95);
    expect(first.scale).toBeGreaterThan(1.3);
  });
});
