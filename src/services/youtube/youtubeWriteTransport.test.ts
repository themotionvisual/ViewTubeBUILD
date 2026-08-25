import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({ unified: true }))

vi.mock("../account/accountCoordinator", () => ({
 accountUrl: (path: string) => `https://viewtube.test${path}`,
 isUnifiedAccountServerEnabled: () => mocks.unified,
}))

import { postUnifiedCommentReply, uploadUnifiedVideo, YouTubeWriteError } from "./youtubeWriteTransport"

describe("youtubeWriteTransport", () => {
 beforeEach(() => {
  vi.restoreAllMocks()
  mocks.unified = true
 })

 it("posts a reply through the session-authenticated server route", async () => {
  const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ id: "reply-1" }), { status: 200 }))
  await expect(postUnifiedCommentReply("comment123", "Thanks!")).resolves.toEqual({ id: "reply-1" })
  expect(fetchMock).toHaveBeenCalledWith(
   "https://viewtube.test/api/account/youtube/comment-replies",
   expect.objectContaining({ method: "POST", credentials: "include" }),
  )
  expect(String(fetchMock.mock.calls[0]?.[1]?.body)).toContain("Thanks!")
 })

 it("uploads chunks only through opaque ViewTube upload-session routes", async () => {
  const fetchMock = vi.spyOn(globalThis, "fetch")
   .mockResolvedValueOnce(new Response(JSON.stringify({ sessionId: "opaque-session", chunkSize: 4 }), { status: 201 }))
   .mockResolvedValueOnce(new Response(JSON.stringify({ complete: false }), { status: 200 }))
   .mockResolvedValueOnce(new Response(JSON.stringify({ complete: true, video: { id: "video-1" } }), { status: 200 }))

  await expect(uploadUnifiedVideo(new Blob(["12345678"], { type: "video/mp4" }), { title: "Test", description: "" })).resolves.toEqual({ id: "video-1" })
  expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
   "https://viewtube.test/api/account/youtube/uploads",
   "https://viewtube.test/api/account/youtube/uploads/opaque-session",
   "https://viewtube.test/api/account/youtube/uploads/opaque-session",
  ])
  expect(new Headers(fetchMock.mock.calls[1]?.[1]?.headers).get("Content-Range")).toBe("bytes 0-3/8")
 })

 it("preserves structured reconnect details from server write failures", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
   error: { code: "GOOGLE_RECONNECT_REQUIRED", message: "Reconnect Google.", retryable: false, reconnectRequired: true },
  }), { status: 409, headers: { "Content-Type": "application/json" } }))

  const request = postUnifiedCommentReply("comment123", "Thanks!")
  await expect(request).rejects.toBeInstanceOf(YouTubeWriteError)
  await expect(request).rejects.toMatchObject({
   code: "GOOGLE_RECONNECT_REQUIRED", status: 409, retryable: false, reconnectRequired: true,
  })
 })
})
