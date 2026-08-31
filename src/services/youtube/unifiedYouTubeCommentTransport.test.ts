// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest"
import { fetchAllUnifiedCommentThreads } from "./unifiedYouTubeCommentTransport"

afterEach(() => vi.unstubAllGlobals())

describe("unified YouTube comment transport", () => {
 it("paginates through the unified account route only", async () => {
  const fetchMock = vi.fn()
   .mockResolvedValueOnce(new Response(JSON.stringify({ items: [{ id: "thread-1" }], nextPageToken: "page-2" }), { status: 200 }))
   .mockResolvedValueOnce(new Response(JSON.stringify({ items: [{ id: "thread-2" }] }), { status: 200 }))
  vi.stubGlobal("fetch", fetchMock)
  const controller = new AbortController()

  await expect(fetchAllUnifiedCommentThreads(100, controller.signal)).resolves.toEqual([{ id: "thread-1" }, { id: "thread-2" }])
  expect(fetchMock).toHaveBeenCalledTimes(2)
  expect(String(fetchMock.mock.calls[0][0])).toContain("/api/account/youtube/comment-threads?maxResults=100")
  expect(String(fetchMock.mock.calls[1][0])).toContain("pageToken=page-2")
  expect(String(fetchMock.mock.calls[0][0])).not.toContain("/api/youtube/comments/threads")
  expect(fetchMock.mock.calls[0][1]).toMatchObject({ credentials: "include", signal: controller.signal })
 })

 it("marks reconnectable list failures for the caller", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: "Reconnect your YouTube channel." }), { status: 409 })))

  await expect(fetchAllUnifiedCommentThreads()).rejects.toMatchObject({
   status: 409,
   reconnectRequired: true,
  })
 })
})
