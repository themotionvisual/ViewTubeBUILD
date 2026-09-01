// Community Post Studio — draft + schedule store.
//
// Uses IndexedDB via a hand-rolled thin wrapper so the widget can persist
// drafts, scheduled posts, and AI-generated variants without pulling in
// another dependency. Falls back to localStorage on browsers where IDB is
// disabled (private-mode Safari, some enterprise policies).

export type CommunityPostType = "text" | "image" | "image_collection" | "poll" | "video"

export type CommunityPostDraft = {
  id: string
  type: CommunityPostType
  text: string
  imageAssetIds: string[]
  pollOptions?: string[]
  attachedVideoId?: string
  scheduledAt?: number
  publishedAt?: number
  createdAt: number
  updatedAt: number
  aiMeta?: {
    generation?: string
    scoreForecast?: number
    primingFor?: string
    reason?: string
  }
}

const DB_NAME = "vt_community_posts_v1"
const STORE = "posts"
const LS_KEY = "vt_community_posts_v1_fallback"

const idbOpen = (): Promise<IDBDatabase | null> => new Promise((resolve) => {
  if (typeof indexedDB === "undefined") return resolve(null)
  const req = indexedDB.open(DB_NAME, 1)
  req.onupgradeneeded = () => {
    const db = req.result
    if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" })
  }
  req.onsuccess = () => resolve(req.result)
  req.onerror = () => resolve(null)
})

const idbAll = async (): Promise<CommunityPostDraft[]> => {
  const db = await idbOpen()
  if (!db) {
    try {
      const raw = localStorage.getItem(LS_KEY)
      return raw ? JSON.parse(raw) as CommunityPostDraft[] : []
    } catch { return [] }
  }
  return new Promise((resolve) => {
    const tx = db.transaction(STORE, "readonly")
    const req = tx.objectStore(STORE).getAll()
    req.onsuccess = () => resolve(req.result as CommunityPostDraft[])
    req.onerror = () => resolve([])
  })
}

const idbPut = async (post: CommunityPostDraft): Promise<void> => {
  const db = await idbOpen()
  if (!db) {
    try {
      const list = await idbAll()
      const next = [post, ...list.filter((p) => p.id !== post.id)]
      localStorage.setItem(LS_KEY, JSON.stringify(next.slice(0, 200)))
    } catch { /* noop */ }
    return
  }
  return new Promise((resolve) => {
    const tx = db.transaction(STORE, "readwrite")
    tx.objectStore(STORE).put(post)
    tx.oncomplete = () => resolve()
    tx.onerror = () => resolve()
  })
}

const idbDelete = async (id: string): Promise<void> => {
  const db = await idbOpen()
  if (!db) {
    const list = await idbAll()
    localStorage.setItem(LS_KEY, JSON.stringify(list.filter((p) => p.id !== id)))
    return
  }
  return new Promise((resolve) => {
    const tx = db.transaction(STORE, "readwrite")
    tx.objectStore(STORE).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => resolve()
  })
}

export const listCommunityPosts = idbAll
export const saveCommunityPost = idbPut
export const deleteCommunityPost = idbDelete

export const newDraft = (type: CommunityPostType): CommunityPostDraft => ({
  id: `cp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  type,
  text: "",
  imageAssetIds: [],
  pollOptions: type === "poll" ? ["", ""] : undefined,
  createdAt: Date.now(),
  updatedAt: Date.now(),
})
