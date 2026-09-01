import { describe, expect, it } from "vitest"
import {
  getDashboardEdgeScrollDelta,
  getDashboardInteractionPermissions,
} from "../dashboardDrag"

describe("dashboard drag behavior", () => {
  it("allows the dedicated Drag me handle while normal dashboard editing is off", () => {
    expect(getDashboardInteractionPermissions({ editMode: false, locked: false })).toEqual({
      canEdit: false,
      canReorder: true,
    })
  })

  it("scrolls upward with increasing speed as the pointer reaches the browser edge", () => {
    const nearEdge = getDashboardEdgeScrollDelta({
      pointerY: 70,
      viewportHeight: 900,
      scrollTop: 500,
      scrollHeight: 3000,
    })
    const atEdge = getDashboardEdgeScrollDelta({
      pointerY: 0,
      viewportHeight: 900,
      scrollTop: 500,
      scrollHeight: 3000,
    })

    expect(nearEdge).toBeLessThan(0)
    expect(atEdge).toBeLessThan(nearEdge)
  })

  it("scrolls down at the lower edge, stays still in the middle, and never passes the page limits", () => {
    const base = {
      viewportHeight: 900,
      scrollHeight: 3000,
    }

    expect(getDashboardEdgeScrollDelta({ ...base, pointerY: 450, scrollTop: 500 })).toBe(0)
    expect(getDashboardEdgeScrollDelta({ ...base, pointerY: 900, scrollTop: 500 })).toBeGreaterThan(0)
    expect(getDashboardEdgeScrollDelta({ ...base, pointerY: 0, scrollTop: 0 })).toBe(0)
    expect(getDashboardEdgeScrollDelta({ ...base, pointerY: 900, scrollTop: 2100 })).toBe(0)
  })

  it("blocks both editing and reordering while the dashboard is locked", () => {
    expect(getDashboardInteractionPermissions({ editMode: true, locked: true })).toEqual({
      canEdit: false,
      canReorder: false,
    })
  })
})
