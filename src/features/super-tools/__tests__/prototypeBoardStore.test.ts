// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest"
import {
 PROTOTYPE_BOARD_KEY,
 hasStoredBoard,
 loadBoardCards,
 makeBoardCardId,
 resetBoardCards,
 saveBoardCards,
} from "../prototypeBoardStore"

type Card = { id: string; laneId: string; title: string; origin?: "sample" | "creator"; blocker?: string }

const LANES = ["backlog", "active", "blocked", "ready"]
const SEEDS: Card[] = [
 { id: "seed-1", laneId: "backlog", title: "Seeded one" },
 { id: "seed-2", laneId: "active", title: "Seeded two" },
]
/** What the board should see: config cards, labelled as the samples they are. */
const TAGGED = SEEDS.map((seed) => ({ origin: "sample", ...seed }))

beforeEach(() => {
 localStorage.clear()
})

describe("loadBoardCards", () => {
 it("returns the config seeds when nothing is stored", () => {
  expect(loadBoardCards("kanban", SEEDS, LANES)).toEqual(TAGGED)
 })

 it("keeps a card the creator moved across a reload", () => {
  saveBoardCards("kanban", [
   { ...SEEDS[0], laneId: "ready", origin: "sample" },
   { ...SEEDS[1], origin: "sample" },
  ])
  const loaded = loadBoardCards<Card>("kanban", SEEDS, LANES)
  expect(loaded.find((card) => card.id === "seed-1")?.laneId).toBe("ready")
 })

 it("keeps a blocker the creator wrote", () => {
  saveBoardCards("kanban", [{ ...SEEDS[0], laneId: "blocked", blocker: "Waiting on the B-roll", origin: "sample" }])
  expect(loadBoardCards<Card>("kanban", SEEDS, LANES)[0].blocker).toBe("Waiting on the B-roll")
 })

 it("keeps cards the creator added and marks their origin", () => {
  const own: Card = { id: "own-1", laneId: "active", title: "My launch", origin: "creator" }
  saveBoardCards("kanban", [...SEEDS, own])
  const loaded = loadBoardCards<Card>("kanban", SEEDS, LANES)
  expect(loaded.find((card) => card.id === "own-1")).toMatchObject({ title: "My launch", origin: "creator" })
  expect(loaded.filter((card) => card.origin === "sample")).toHaveLength(2)
 })

 it("lets the creator's stored card win over the config copy", () => {
  // Once a board has been touched it is the creator's, so a reworded sample in
  // the config must not overwrite what they are looking at.
  saveBoardCards("kanban", [{ ...SEEDS[0], laneId: "blocked", origin: "sample" }])
  const renamedSeeds: Card[] = [{ ...SEEDS[0], title: "Seeded one, reworded" }, SEEDS[1]]
  const card = loadBoardCards<Card>("kanban", renamedSeeds, LANES).find((item) => item.id === "seed-1")
  expect(card?.laneId).toBe("blocked")
  expect(card?.title).toBe("Seeded one")
 })

 it("appends a seed the creator has never seen", () => {
  saveBoardCards("kanban", [{ ...SEEDS[0], origin: "sample" }])
  const withNew: Card[] = [...SEEDS, { id: "seed-3", laneId: "backlog", title: "New sample" }]
  expect(loadBoardCards<Card>("kanban", withNew, LANES).map((card) => card.id)).toEqual([
   "seed-1",
   "seed-2",
   "seed-3",
  ])
 })

 it("drops a stored sample the config no longer ships", () => {
  saveBoardCards("kanban", [
   { ...SEEDS[0], origin: "sample" },
   { id: "retired", laneId: "active", title: "Removed sample", origin: "sample" },
  ])
  expect(loadBoardCards<Card>("kanban", SEEDS, LANES).map((card) => card.id)).toEqual(["seed-1", "seed-2"])
 })

 it("rescues a card whose lane no longer exists", () => {
  saveBoardCards("kanban", [{ ...SEEDS[0], laneId: "lane-that-was-removed", origin: "sample" }])
  expect(loadBoardCards<Card>("kanban", SEEDS, LANES)[0].laneId).toBe("backlog")
 })

 it("keeps boards separate per tool", () => {
  saveBoardCards("kanban", [{ ...SEEDS[0], laneId: "ready", origin: "sample" }])
  expect(loadBoardCards<Card>("shorts", SEEDS, LANES)).toEqual(TAGGED)
 })

 it("repairs corrupt storage instead of throwing", () => {
  localStorage.setItem(PROTOTYPE_BOARD_KEY, "{not json")
  expect(loadBoardCards("kanban", SEEDS, LANES)).toEqual(TAGGED)
  localStorage.setItem(PROTOTYPE_BOARD_KEY, JSON.stringify({ version: 99, boards: { kanban: {} } }))
  expect(loadBoardCards("kanban", SEEDS, LANES)).toEqual(TAGGED)
 })

 it("skips junk entries inside an otherwise valid board", () => {
  localStorage.setItem(
   PROTOTYPE_BOARD_KEY,
   JSON.stringify({
    version: 1,
    boards: {
     kanban: { cards: [null, 7, "x", { laneId: "active" }, { ...SEEDS[1], laneId: "ready" }], updatedAt: "" },
    },
   }),
  )
  const loaded = loadBoardCards<Card>("kanban", SEEDS, LANES)
  expect(loaded.map((card) => card.id)).toEqual(["seed-2", "seed-1"])
  expect(loaded.find((card) => card.id === "seed-2")?.laneId).toBe("ready")
 })
})

describe("saveBoardCards", () => {
 it("survives a storage quota failure without throwing", () => {
  const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
   throw new Error("QuotaExceededError")
  })
  expect(saveBoardCards("kanban", SEEDS)).toBe(false)
  setItem.mockRestore()
 })
})

describe("resetBoardCards", () => {
 it("returns the tool to its config seeds", () => {
  saveBoardCards("kanban", [{ ...SEEDS[0], laneId: "ready", origin: "sample" }])
  expect(hasStoredBoard("kanban")).toBe(true)
  resetBoardCards("kanban")
  expect(hasStoredBoard("kanban")).toBe(false)
  expect(loadBoardCards("kanban", SEEDS, LANES)).toEqual(TAGGED)
 })
})

describe("makeBoardCardId", () => {
 it("does not collide", () => {
  const ids = new Set(Array.from({ length: 200 }, makeBoardCardId))
  expect(ids.size).toBe(200)
 })
})
