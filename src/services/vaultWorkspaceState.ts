import type { VaultAssetKind } from "@/types"

export type VaultWorkspaceViewMode = "grid" | "list" | "timeline"
export type VaultWorkspaceSort = "updated-desc" | "updated-asc" | "name-asc" | "name-desc"

export interface VaultWorkspaceState {
 query: string
 selectedTag: string | null
 filterKind: "all" | VaultAssetKind
 source: "all" | "local" | "drive" | "generated" | "project" | "imported"
 sort: VaultWorkspaceSort
 special: "active" | "inbox" | "favorites" | "archive" | "trash"
 viewMode: VaultWorkspaceViewMode
}

const STORAGE_KEY = "vt_creator_vault_workspace_v1"

export const DEFAULT_VAULT_WORKSPACE_STATE: VaultWorkspaceState = {
 query: "",
 selectedTag: null,
 filterKind: "all",
 source: "all",
 sort: "updated-desc",
 special: "active",
 viewMode: "grid",
}

const canUseStorage = () => typeof window !== "undefined" && typeof localStorage !== "undefined"

export const readVaultWorkspaceState = (): VaultWorkspaceState => {
 if (!canUseStorage()) return DEFAULT_VAULT_WORKSPACE_STATE
 try {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return DEFAULT_VAULT_WORKSPACE_STATE
  const parsed = JSON.parse(raw) as Partial<VaultWorkspaceState>
  return {
   ...DEFAULT_VAULT_WORKSPACE_STATE,
   ...parsed,
  }
 } catch {
  return DEFAULT_VAULT_WORKSPACE_STATE
 }
}

export const writeVaultWorkspaceState = (state: VaultWorkspaceState): void => {
 if (!canUseStorage()) return
 localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}
