import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const source = (relativePath: string) =>
 readFileSync(new URL(relativePath, import.meta.url), "utf8")

describe("YouTube API stabilization governance", () => {
 it("keeps Video Manager off legacy auth and YouTube facades", () => {
  const videoManager = source("../../views/VideoManager.tsx")
  expect(videoManager).toContain('from "../auth/AuthProvider"')
  expect(videoManager).toContain('from "../services/simpleYouTubeApi"')
  expect(videoManager).not.toContain('from "../services/youtubeService"')
  expect(videoManager).not.toContain("useUnifiedAccount")
  expect(videoManager).not.toContain("useAccountStatus")
  expect(videoManager).not.toContain("useVideoAssetCatalog")
  expect(videoManager).not.toContain("googleapis.com")
 })

 it("keeps Comment Responder on the typed server API", () => {
  const controller = source("../../features/creator-engagement/useCommentResponderController.ts")
  expect(controller).toContain("fetchAllSimpleCommentThreads")
  expect(controller).toContain("postSimpleCommentReply")
  expect(controller).not.toContain("fetchAllCommentThreads")
  expect(controller).not.toContain("googleapis.com")
 })

 it("keeps dashboard top-level comment posting on the typed route", () => {
  const widget = source("../../views/dashboard/widgets/VideoCommentOperatorWidget.tsx")
  expect(widget).toContain("postSimpleTopLevelComment")
  expect(widget).not.toContain("postVideoTopLevelComment")
 })
})
