import { describe, expect, it } from "vitest"
import { clusterAudienceRequests } from "../widgets/audienceRequestModel"

describe("Audience request clustering", () => {
  it("groups repeated normalized requests while preserving evidence", () => {
    const result = clusterAudienceRequests([
      { text: "Please make a video about Napoleon's cavalry", author: "A" },
      { text: "Can you make a video about Napoleons cavalry?", author: "B" },
      { text: "Please explain the Guard at Austerlitz", author: "C" },
    ])

    expect(result[0]).toMatchObject({
      count: 2,
      label: "napoleons cavalry",
    })
    expect(result[0].requests).toHaveLength(2)
  })

  it("keeps one-off requests visible instead of inventing repetition", () => {
    const result = clusterAudienceRequests([
      { text: "Could you cover Davout at Austerlitz?", author: "A" },
    ])

    expect(result).toHaveLength(1)
    expect(result[0].count).toBe(1)
  })
})
