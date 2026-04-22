import type { AIPatchPlan, AIPatchValidationResult, TimelineState } from "../contracts";
import { AIPatchPlanSchema } from "../schemas";
import { applyTimelineCommand } from "../timeline/reducer";

export const validateAIPatchPlan = (plan: unknown): AIPatchValidationResult => {
  const parsed = AIPatchPlanSchema.safeParse(plan);
  if (parsed.success) {
    return { valid: true, issues: [] };
  }
  return {
    valid: false,
    issues: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`),
  };
};

export const applyAIPatchPlan = (
  state: TimelineState,
  plan: AIPatchPlan,
): { state: TimelineState; validation: AIPatchValidationResult } => {
  const validation = validateAIPatchPlan(plan);
  if (!validation.valid) {
    return { state, validation };
  }

  const nextState = plan.operations.reduce((current, operation) => {
    switch (operation.op) {
      case "insertClip":
        return applyTimelineCommand(current, { type: "insertClip", clip: operation.clip });
      case "moveClip":
        return applyTimelineCommand(current, {
          type: "moveClip",
          clipId: operation.clipId,
          trackId: operation.trackId,
          startFrame: operation.startFrame,
          endFrame: operation.endFrame,
        });
      case "trimClip":
        return applyTimelineCommand(
          current,
          operation.side === "left"
            ? { type: "trimClipStart", clipId: operation.clipId, startFrame: operation.frame }
            : { type: "trimClipEnd", clipId: operation.clipId, endFrame: operation.frame },
        );
      case "splitClip":
        return applyTimelineCommand(current, {
          type: "splitClip",
          clipId: operation.clipId,
          frame: operation.frame,
          newClipId: operation.newClipId,
        });
      case "deleteClip":
        return applyTimelineCommand(current, { type: "deleteClip", clipId: operation.clipId });
      case "setTransition":
        return applyTimelineCommand(current, {
          type: "setTransition",
          transition: operation.transition,
        });
      case "setKeyframe":
        return applyTimelineCommand(current, {
          type: "setKeyframe",
          keyframe: operation.keyframe,
        });
      case "setClipColor":
        return applyTimelineCommand(current, {
          type: "setClipColor",
          clipId: operation.clipId,
          color: operation.color,
        });
      default:
        return current;
    }
  }, state);

  return { state: nextState, validation };
};
