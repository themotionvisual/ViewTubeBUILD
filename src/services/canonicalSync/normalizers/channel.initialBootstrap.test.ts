import { describe, expect, it } from "vitest"
import { normalizeChannelRecord } from "./channel"

describe("initial bootstrap channel normalization", () => {
 it("uses the best identity metadata and preserves hidden subscribers as missing", () => {
  const channel = normalizeChannelRecord({
   id: "channel-1",
   snippet: {
    title: "Channel",
    customUrl: "@channel",
    publishedAt: "2020-01-01T00:00:00Z",
    defaultLanguage: "en",
    localized: { title: "Localized Channel" },
    thumbnails: { high: { url: "https://example.test/avatar.jpg" } },
   },
   statistics: {
    hiddenSubscriberCount: true,
    viewCount: "0",
    videoCount: "0",
   },
   localizations: { fr: { title: "Chaine" } },
   status: { privacyStatus: "public" },
  })
  expect(channel.currentSubscribers).toBeNull()
  expect(channel.publicViewCount).toBe(0)
  expect(channel.publicVideoCount).toBe(0)
  expect(channel.url).toBe("https://www.youtube.com/@channel")
  expect(channel.localizations?.fr).toEqual({ title: "Chaine" })
 })
})
