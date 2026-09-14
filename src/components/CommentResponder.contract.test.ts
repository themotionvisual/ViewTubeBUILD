import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8")

describe("Comment Responder Studio Hub contract", () => {
 const view = read("src/components/CommentResponder.tsx")
 const controller = read("src/features/creator-engagement/useCommentResponderController.ts")

 it("keeps the workspace mounted and exposes explicit data states", () => {
  expect(view).toContain("data-vt-comment-responder")
  expect(view).toContain('dataState = !context.connected ? "disconnected"')
  expect(view).toContain('dataState === "empty"')
  expect(view).toContain('dataState === "error"')
 })

 it("uses canonical Studio controls for freeform reply and queue navigation", () => {
  expect(view).toContain("StudioTextArea")
  expect(view).toContain("StudioButton")
  expect(view).toContain("StudioIconButton")
  expect(view).not.toContain("StandardTextArea")
 })

 it("does not report disconnection as a comment-load error", () => {
  expect(controller).toContain("if (!context.connected)")
  expect(controller).toContain("setError(null)")
  expect(controller).not.toContain('setError("Connect your YouTube channel to load comments.")')
 })

 it("offers connection as an action while preserving the normal tool", () => {
  expect(view).toContain("Connect YouTube Channel")
  expect(view).toContain("comments.reconnect")
  expect(view).toContain('SubToolbox title="Comment Queue"')
  expect(view).toContain('SubToolbox title="Current Comment"')
  expect(view).toContain('SubToolbox title={comments.tab === "history" ? "Follow-Up Reply" : "Reply Composer"}')
 })
})
