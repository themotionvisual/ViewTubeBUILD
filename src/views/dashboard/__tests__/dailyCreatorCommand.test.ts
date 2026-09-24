import { describe, expect, it } from "vitest"
import { describeCreatorTasks, formatFocusTime } from "../widgets/dailyCreatorCommand"

describe("Daily Creator Command helpers", () => {
  it("summarizes today's tasks and selects the first incomplete task", () => {
    const summary = describeCreatorTasks([
      { id: "1", text: "Finished", completed: true },
      { id: "2", text: "Write hook", completed: false },
      { id: "3", text: "Build thumbnail", completed: false },
    ])

    expect(summary).toEqual({
      total: 3,
      done: 1,
      open: 2,
      focus: { id: "2", text: "Write hook", completed: false },
    })
  })

  it("returns no focus task when everything is complete", () => {
    expect(describeCreatorTasks([
      { id: "1", text: "Finished", completed: true },
    ]).focus).toBeNull()
  })

  it("formats a local focus-session countdown", () => {
    expect(formatFocusTime(25 * 60)).toBe("25:00")
    expect(formatFocusTime(61)).toBe("01:01")
    expect(formatFocusTime(0)).toBe("00:00")
  })
})
