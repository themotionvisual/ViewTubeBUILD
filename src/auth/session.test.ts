import { describe, expect, it } from "vitest"
import { normalizeSimpleSession, SIGNED_OUT_SESSION } from "./session"

describe("normalizeSimpleSession", () => {
  it("fills missing capabilities for signed-out or stale session payloads", () => {
    expect(normalizeSimpleSession({
      status: "signed_out",
      user: null,
      channel: null,
    })).toEqual(SIGNED_OUT_SESSION)
  })

  it("preserves a valid ready session while normalizing booleans", () => {
    expect(normalizeSimpleSession({
      status: "ready",
      user: { id: "user-1", email: "creator@example.com", name: "Creator", avatar: null },
      channel: { id: "channel-1", title: "Channel", handle: "@channel", thumbnail: null },
      capabilities: {
        youtubeRead: true,
        youtubeWrite: true,
        analyticsRead: true,
        monetaryRead: false,
        upload: false,
      },
    })).toEqual({
      status: "ready",
      user: { id: "user-1", email: "creator@example.com", name: "Creator", avatar: null },
      channel: { id: "channel-1", title: "Channel", handle: "@channel", thumbnail: null },
      capabilities: {
        youtubeRead: true,
        youtubeWrite: true,
        analyticsRead: true,
        monetaryRead: false,
        upload: false,
      },
    })
  })

  it("falls back safely for malformed payloads", () => {
    expect(normalizeSimpleSession(null)).toEqual(SIGNED_OUT_SESSION)
    expect(normalizeSimpleSession({ status: "unexpected", capabilities: { youtubeRead: "yes" } })).toEqual(SIGNED_OUT_SESSION)
  })
})
