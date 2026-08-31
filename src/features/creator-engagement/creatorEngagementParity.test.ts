import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const source = (relativePath: string) => readFileSync(new URL(relativePath, import.meta.url), "utf8")

describe("creator engagement cross-surface parity", () => {
 const studioComment = source("../../components/CommentResponder.tsx")
 const studioCommunity = source("../../components/CommunityPostGenerator.tsx")
 const dashboardComment = source("../../views/dashboard/widgets/CommentReplyWidget.tsx")
 const dashboardCommunity = source("../../views/dashboard/widgets/CommunityPostWidget.tsx")

 it("routes both comment surfaces through the shared controller", () => {
  expect(studioComment).toContain("useCommentResponderController")
  expect(dashboardComment).toContain("useCommentResponderController")
  expect(dashboardComment).not.toContain("fetchAllCommentThreads")
  expect(studioComment).not.toContain("yt_analytics_cache")
 })

 it("routes both community surfaces through shared persistence and actions", () => {
  for (const file of [studioCommunity, dashboardCommunity]) {
   expect(file).toContain("useCommunityPostController")
   expect(file).toContain("Copy Post")
   expect(file).toContain("Go to Channel")
   expect(file).not.toContain("yt_analytics_cache")
  }
 })

 it("keeps accessible labels and live feedback in the Studio renderers", () => {
  expect(studioComment).toContain('aria-live="polite"')
  expect(studioComment).toContain('htmlFor="comment-reply-copy"')
  expect(studioCommunity).toContain('aria-live="polite"')
  expect(studioCommunity).toContain('htmlFor="community-post-copy"')
  expect(studioCommunity).not.toContain("transition-all")
 })

 it("keeps owned-reply editing on the shared controller", () => {
  expect(studioComment).toContain("Edit reply")
  expect(studioComment).toContain("comments.saveEditedReply")
  expect(studioComment).toContain("authorChannelId?.value === context.channelId")
 })
})
