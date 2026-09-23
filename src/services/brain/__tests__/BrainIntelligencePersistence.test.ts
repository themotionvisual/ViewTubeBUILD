import { afterEach, describe, expect, it, vi } from "vitest"
import { persistBrainIntelligence } from "../BrainIntelligencePersistence"

afterEach(() => {
 vi.unstubAllGlobals()
})

describe("BrainIntelligencePersistence", () => {
 it("batches large lifecycle histories below the API payload boundary", async () => {
  const calls: Array<{ events: unknown[]; observations: unknown[] }> = []
  vi.stubGlobal("fetch", vi.fn(async (_url: string, init?: RequestInit) => {
   const body = JSON.parse(String(init?.body || "{}")) as { events?: unknown[]; observations?: unknown[] }
   calls.push({ events: body.events || [], observations: body.observations || [] })
   return new Response(JSON.stringify({
    ok: true,
    channelId: "channel-1",
    eventCount: body.events?.length || 0,
    observationCount: body.observations?.length || 0,
   }), { status: 200, headers: { "Content-Type": "application/json" } })
  }))

  const observations = Array.from({ length: 1600 }, (_, index) => ({ id: index }))
  const result = await persistBrainIntelligence({ channelId: "channel-1", observations })

  expect(calls).toHaveLength(3)
  expect(calls.map((call) => call.observations.length)).toEqual([750, 750, 100])
  expect(result).toMatchObject({ observationCount: 1600, eventCount: 0, batches: 3 })
 })

 it("stops safely when the account session is unavailable", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 401 })))
  const result = await persistBrainIntelligence({
   channelId: "channel-1",
   events: [{ id: "event-1" }],
  })
  expect(result).toBeNull()
 })
})
