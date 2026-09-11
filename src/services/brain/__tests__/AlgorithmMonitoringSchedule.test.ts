import { describe, expect, it } from "vitest"
import { buildAlgorithmMonitoringSchedule } from "../AlgorithmMonitoringSchedule"

describe("AlgorithmMonitoringSchedule", () => {
 it("creates standard observation horizons up to one final evaluation horizon", () => {
  const schedule = buildAlgorithmMonitoringSchedule({
   sourceEventId: "event-1",
   startedAt: 1_000,
   evaluationTargets: [
    { metric: "ctr", direction: "increase", windowHours: 72 },
    { metric: "watch_quality", direction: "hold", windowHours: 72 },
   ],
  })

  expect(schedule.checkpoints.map((checkpoint) => checkpoint.horizonHours)).toEqual([1, 6, 24, 48, 72])
  expect(schedule.checkpoints.filter((checkpoint) => checkpoint.role === "final_evaluation")).toHaveLength(1)
  expect(schedule.checkpoints.at(-1)?.role).toBe("final_evaluation")
  expect(schedule.checkpoints.slice(0, -1).every((checkpoint) => checkpoint.role === "observe")).toBe(true)
 })

 it("extends monitoring through seven days when the declared evaluation window is 168 hours", () => {
  const schedule = buildAlgorithmMonitoringSchedule({
   sourceEventId: "event-2",
   startedAt: 1_000,
   evaluationTargets: [{ metric: "session_continuation", direction: "increase", windowHours: 168 }],
  })

  expect(schedule.checkpoints.map((checkpoint) => checkpoint.horizonHours)).toEqual([1, 6, 24, 48, 72, 168])
  expect(schedule.checkpoints.at(-1)).toMatchObject({ horizonHours: 168, role: "final_evaluation" })
 })

 it("does not create later observation horizons beyond the action's final evaluation window", () => {
  const schedule = buildAlgorithmMonitoringSchedule({
   sourceEventId: "event-3",
   startedAt: 1_000,
   evaluationTargets: [{ metric: "diagnosis_complete", direction: "inspect", windowHours: 24 }],
  })

  expect(schedule.checkpoints.map((checkpoint) => checkpoint.horizonHours)).toEqual([1, 6, 24])
  expect(schedule.finalEvaluationHour).toBe(24)
 })

 it("keeps all target metrics attached to every monitoring checkpoint without creating outcomes", () => {
  const schedule = buildAlgorithmMonitoringSchedule({
   sourceEventId: "event-4",
   startedAt: 1_000,
   evaluationTargets: [
    { metric: "qualified_views", direction: "increase", windowHours: 72 },
    { metric: "watch_quality", direction: "hold", windowHours: 72 },
   ],
  })

  expect(schedule.checkpoints.every((checkpoint) =>
   checkpoint.metrics.includes("qualified_views") && checkpoint.metrics.includes("watch_quality"),
  ).toBe(true)
  expect(schedule.checkpoints.map((checkpoint) => checkpoint.role)).toEqual([
   "observe",
   "observe",
   "observe",
   "observe",
   "final_evaluation",
  ])
 })
})
