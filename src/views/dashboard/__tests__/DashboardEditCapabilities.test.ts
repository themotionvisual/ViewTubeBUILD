import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const source = readFileSync(new URL("../DashboardCanvas.tsx", import.meta.url), "utf8")

describe("dashboard edit capability ownership", () => {
  it("does not couple resize and remove actions to drag capability", () => {
    expect(source).toContain("const canDragReorder=editMode&&!layout.locked")
    expect(source).toContain("const canResize=editMode")
    expect(source).toContain("const canHide=editMode")
    expect(source).not.toContain("if(canDrag)updateInstance")
    expect(source).not.toContain("if(!canDrag)return")
  })

  it("keeps drag locking separate while edit controls remain enabled in edit mode", () => {
    expect(source).toContain("disabled={!canDragReorder}")
    expect(source).toContain("canEdit={editMode}")
    expect(source).toContain("if(canDragReorder)")
  })
})
