/**
 * Durable boards for the internal super-tool workspaces.
 *
 * Every prototype board (the Kanban, the shorts queue, the retention lanes)
 * held its cards in React state seeded from the tool's config, so a creator
 * who moved a card, marked a blocker or added their own work lost all of it on
 * reload — which is why those boards read as demos. One store backs all of
 * them: cards are keyed by tool, persisted to localStorage, and reconciled
 * against the config seeds on load so a config change still reaches the board.
 *
 * Follows the script-architect store: versioned payload, defensive
 * normalization (corrupt storage is repaired, never thrown), and a write that
 * can fail on quota without interrupting the creator.
 */

export const PROTOTYPE_BOARD_KEY = "viewtube_supertool_boards_v1"
export const PROTOTYPE_BOARD_CHANGED_EVENT = "vt_supertool_board_changed"

/** What the store needs of a card; the workspace's own card type is a superset. */
export interface BoardCardLike {
 id: string
 laneId: string
 /** "sample" cards come from the tool config; "creator" cards were added in the app. */
 origin?: "sample" | "creator"
}

interface BoardPayloadV1 {
 version: 1
 boards: Record<string, { cards: unknown[]; updatedAt: string }>
}

const emptyPayload = (): BoardPayloadV1 => ({ version: 1, boards: {} })

const readPayload = (): BoardPayloadV1 => {
 if (typeof localStorage === "undefined") return emptyPayload()
 try {
  const raw = localStorage.getItem(PROTOTYPE_BOARD_KEY)
  if (!raw) return emptyPayload()
  const parsed = JSON.parse(raw) as Partial<BoardPayloadV1>
  if (!parsed || typeof parsed !== "object" || parsed.version !== 1) return emptyPayload()
  const boards = parsed.boards
  if (!boards || typeof boards !== "object") return emptyPayload()
  return { version: 1, boards: boards as BoardPayloadV1["boards"] }
 } catch {
  // Corrupt storage is repaired by starting over rather than breaking the tool.
  return emptyPayload()
 }
}

const writePayload = (payload: BoardPayloadV1): boolean => {
 if (typeof localStorage === "undefined") return false
 try {
  localStorage.setItem(PROTOTYPE_BOARD_KEY, JSON.stringify(payload))
  if (typeof window !== "undefined") {
   window.dispatchEvent(new CustomEvent(PROTOTYPE_BOARD_CHANGED_EVENT))
  }
  return true
 } catch {
  // Quota or a private window: the board stays usable for this session.
  return false
 }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
 Boolean(value) && typeof value === "object" && !Array.isArray(value)

/** Config cards are samples unless they say otherwise, so the board can label them. */
const asSamples = <T extends BoardCardLike>(seeds: T[]): T[] =>
 seeds.map((seed) => ({ origin: "sample", ...seed }) as T)

/**
 * Merge what the creator did with what the config now says.
 *
 * - a stored card the creator added is always kept;
 * - a stored card that matches a seed wins over the seed: once a board has been
 *   touched it is the creator's, so a reworded example must not overwrite what
 *   they are looking at;
 * - a seed the creator has never seen is appended;
 * - a stored sample whose seed is gone from the config is dropped, since it is
 *   an example the tool no longer ships.
 *
 * A card in a lane that no longer exists falls back to the first lane instead
 * of vanishing into an unrendered column.
 */
export const loadBoardCards = <T extends BoardCardLike>(
 toolId: string,
 seeds: T[],
 laneIds: string[],
): T[] => {
 const stored = readPayload().boards[toolId]
 if (!stored || !Array.isArray(stored.cards)) return asSamples(seeds)
 const fallbackLaneId = laneIds[0]
 const lanes = new Set(laneIds)
 const seedById = new Map(seeds.map((seed) => [seed.id, seed]))
 const merged: T[] = []
 const seen = new Set<string>()

 for (const entry of stored.cards) {
  if (!isRecord(entry)) continue
  const id = typeof entry.id === "string" ? entry.id : ""
  if (!id || seen.has(id)) continue
  const seed = seedById.get(id)
  if (!seed && entry.origin !== "creator") continue
  const laneId =
   typeof entry.laneId === "string" && lanes.has(entry.laneId) ?
    entry.laneId
   : seed?.laneId && lanes.has(seed.laneId) ? seed.laneId
   : fallbackLaneId
  if (!laneId) continue
  seen.add(id)
  merged.push({
   ...(seed || {}),
   ...(entry as Partial<T>),
   laneId,
   origin: entry.origin === "creator" ? "creator" : "sample",
  } as T)
 }

 for (const seed of seeds) {
  if (seen.has(seed.id)) continue
  merged.push({ origin: "sample", ...seed } as T)
 }

 return merged
}

/** Returns false when the write could not be persisted (quota, private window). */
export const saveBoardCards = <T extends BoardCardLike>(toolId: string, cards: T[]): boolean => {
 const payload = readPayload()
 payload.boards[toolId] = { cards, updatedAt: new Date().toISOString() }
 return writePayload(payload)
}

/** Drops the creator's board so the tool falls back to its config seeds. */
export const resetBoardCards = (toolId: string): boolean => {
 const payload = readPayload()
 if (!(toolId in payload.boards)) return true
 delete payload.boards[toolId]
 return writePayload(payload)
}

export const hasStoredBoard = (toolId: string): boolean => Boolean(readPayload().boards[toolId])

export const makeBoardCardId = (): string =>
 `card-${globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(16).slice(2, 8)}`}`
