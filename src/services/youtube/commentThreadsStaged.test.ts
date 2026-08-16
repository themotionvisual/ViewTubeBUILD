import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("./youtubeApiClient", async () => {
  const actual = await vi.importActual<typeof import("./youtubeApiClient")>("./youtubeApiClient")
  return {
    ...actual,
    proxyFetch: vi.fn(),
    refreshTokenIfExpired: vi.fn().mockResolvedValue("mock-token"),
  }
})

import { proxyFetch } from "./youtubeApiClient"
import { fetchAllCommentThreads } from "./youtubeDataFetcher"

const thread = (id: string, repliedBy?: string) => ({
  id,
  snippet: {
    totalReplyCount: repliedBy ? 1 : 0,
    topLevelComment: { id: `parent-${id}` },
  },
  replies: repliedBy
    ? { comments: [{ snippet: { authorChannelId: { value: repliedBy } } }] }
    : undefined,
})

describe("fetchAllCommentThreads staged hydration", () => {
  beforeEach(() => vi.mocked(proxyFetch).mockReset())

  it("publishes the first three unreplied comments before the remaining pages finish", async () => {
    let releaseBackground!: () => void
    const backgroundGate = new Promise<void>((resolve) => { releaseBackground = resolve })

    vi.mocked(proxyFetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [thread("new-1"), thread("old-1", "channel-1"), thread("new-2")],
          nextPageToken: "page-2",
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [thread("new-3")], nextPageToken: "page-3" }),
      } as Response)
      .mockImplementationOnce(async () => {
        await backgroundGate
        return {
          ok: true,
          json: async () => ({ items: [thread("new-4")] }),
        } as Response
      })

    let resolveInitial!: (threads: unknown[]) => void
    const initialResult = new Promise<unknown[]>((resolve) => { resolveInitial = resolve })
    const fullResult = fetchAllCommentThreads(100, "channel-1", {
      initialNewCount: 3,
      onInitialResults: (threads) => resolveInitial(threads),
    })

    await expect(initialResult).resolves.toMatchObject([
      { id: "new-1" },
      { id: "new-2" },
      { id: "new-3" },
    ])

    releaseBackground()
    await expect(fullResult).resolves.toMatchObject([
      { id: "new-1" },
      { id: "old-1" },
      { id: "new-2" },
      { id: "new-3" },
      { id: "new-4" },
    ])
  })
})
