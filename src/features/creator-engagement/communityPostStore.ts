/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CommunityPostDraftV1, CommunityPostType } from "./types"

export const COMMUNITY_POST_STATE_KEY = "viewtube_community_post_state_v1"
export const COMMUNITY_POST_VAULT_KEY = "viewtube_community_post_vault_v1"
export const LEGACY_COMMUNITY_POST_VAULT_KEY = "viewtube_post_vault"
export const COMMUNITY_POST_CHANGED_EVENT = "vt_community_post_state_changed"

const postTypes = new Set<CommunityPostType>(["text", "image", "poll", "image-poll", "video"])
const now = () => new Date().toISOString()
const makeId = () => globalThis.crypto?.randomUUID?.() || `community-${Date.now()}-${Math.random().toString(16).slice(2)}`

export const emptyCommunityPostDraft = (): CommunityPostDraftV1 => {
 const timestamp = now()
 return {
  version: 1,
  id: makeId(),
  type: "text",
  content: "",
  prompt: "",
  pollOptions: ["", "", "", ""],
  imageUrl: "",
  imagePollUrls: ["", "", "", ""],
  linkedVideoId: "",
  style: "Educational",
  createdAt: timestamp,
  updatedAt: timestamp,
 }
}

export const normalizeCommunityPostDraft = (value: any): CommunityPostDraftV1 => {
 const fallback = emptyCommunityPostDraft()
 const type = postTypes.has(value?.type) ? value.type : "text"
 return {
  ...fallback,
  id: String(value?.id || fallback.id),
  type,
  content: String(value?.content || ""),
  prompt: String(value?.prompt || ""),
  pollOptions: Array.from({ length: 4 }, (_, index) => String(value?.pollOptions?.[index] || "")),
  imageUrl: String(value?.imageUrl || ""),
  imagePollUrls: Array.from({ length: 4 }, (_, index) => String(value?.imagePollUrls?.[index] || "")),
  linkedVideoId: String(value?.linkedVideoId || value?.selectedVideo || ""),
  style: String(value?.style || value?.postStyle || "Educational"),
  createdAt: String(value?.createdAt || value?.timestamp || fallback.createdAt),
  updatedAt: String(value?.updatedAt || value?.timestamp || fallback.updatedAt),
 }
}

const readJson = (key: string): any => {
 try { return JSON.parse(localStorage.getItem(key) || "null") } catch { return null }
}

export const readCommunityPostState = (): CommunityPostDraftV1 =>
 normalizeCommunityPostDraft(readJson(COMMUNITY_POST_STATE_KEY))

export const readCommunityPostVault = (): CommunityPostDraftV1[] => {
 const current = readJson(COMMUNITY_POST_VAULT_KEY)
 if (Array.isArray(current)) return current.map(normalizeCommunityPostDraft)
 const legacy = readJson(LEGACY_COMMUNITY_POST_VAULT_KEY)
 if (!Array.isArray(legacy)) return []
 const migrated = legacy.map(normalizeCommunityPostDraft)
 localStorage.setItem(COMMUNITY_POST_VAULT_KEY, JSON.stringify(migrated))
 return migrated
}

const announce = () => window.dispatchEvent(new Event(COMMUNITY_POST_CHANGED_EVENT))

export const writeCommunityPostState = (draft: CommunityPostDraftV1): void => {
 localStorage.setItem(COMMUNITY_POST_STATE_KEY, JSON.stringify({ ...draft, version: 1, updatedAt: now() }))
 announce()
}

export const writeCommunityPostVault = (vault: CommunityPostDraftV1[]): void => {
 localStorage.setItem(COMMUNITY_POST_VAULT_KEY, JSON.stringify(vault))
 localStorage.setItem(LEGACY_COMMUNITY_POST_VAULT_KEY, JSON.stringify(vault))
 announce()
}
