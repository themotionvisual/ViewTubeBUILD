import type { VaultAssetKind } from "@/types"

export type VaultWorkspaceViewMode = "grid" | "masonry" | "filmstrip" | "list" | "timeline"
export type VaultWorkspaceSort = "updated-desc" | "updated-asc" | "name-asc" | "name-desc"
export type VaultWorkspaceDensity = "comfortable" | "compact"
export type VaultWorkspaceModuleId =
 | "navigator"
 | "explorer"
 | "workspace-notes"
 | "spectrum-tags"
 | "asset-library"
 | "import-station"
 | "task-center"
 | "batch-processor"
 | "inspector"

export const DEFAULT_VAULT_MODULE_ORDER: VaultWorkspaceModuleId[] = [
 "navigator",
 "explorer",
 "workspace-notes",
 "spectrum-tags",
 "asset-library",
 "import-station",
 "task-center",
 "batch-processor",
 "inspector",
]

export interface VaultWorkspaceState {
 query: string
 selectedTag: string | null
 filterKind: "all" | VaultAssetKind
 source: "all" | "local" | "drive" | "generated" | "project" | "imported"
 sort: VaultWorkspaceSort
 special: "active" | "recent" | "generated" | "inbox" | "favorites" | "archive" | "trash"
 filterLifecycle: string
 filterOrientation: "all" | "landscape" | "portrait" | "square"
 filterUpdatedFrom: string
 filterUpdatedTo: string
 filterMimeType: string
 filterMinWidth: string
 filterMinHeight: string
 filterMinDuration: string
 filterMaxDuration: string
 filterMinBytesMb: string
 filterMaxBytesMb: string
 viewMode: VaultWorkspaceViewMode
 density: VaultWorkspaceDensity
 arrangeMode: boolean
 visibleModules: VaultWorkspaceModuleId[]
 moduleOrder: VaultWorkspaceModuleId[]
}

const STORAGE_KEY = "vt_creator_vault_workspace_v1"

export const DEFAULT_VAULT_WORKSPACE_STATE: VaultWorkspaceState = {
 query: "",
 selectedTag: null,
 filterKind: "all",
 source: "all",
 sort: "updated-desc",
 special: "active",
 filterLifecycle: "all",
 filterOrientation: "all",
 filterUpdatedFrom: "",
 filterUpdatedTo: "",
 filterMimeType: "",
 filterMinWidth: "",
 filterMinHeight: "",
 filterMinDuration: "",
 filterMaxDuration: "",
 filterMinBytesMb: "",
 filterMaxBytesMb: "",
 viewMode: "grid",
 density: "comfortable",
 arrangeMode: false,
 visibleModules: [...DEFAULT_VAULT_MODULE_ORDER],
 moduleOrder: [...DEFAULT_VAULT_MODULE_ORDER],
}

const canUseStorage = () => typeof window !== "undefined" && typeof localStorage !== "undefined"

export const readVaultWorkspaceState = (): VaultWorkspaceState => {
 if (!canUseStorage()) return DEFAULT_VAULT_WORKSPACE_STATE
 try {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return DEFAULT_VAULT_WORKSPACE_STATE
  const parsed = JSON.parse(raw) as Partial<VaultWorkspaceState>
  const visibleModules = Array.isArray(parsed.visibleModules)
   ? parsed.visibleModules.filter((id): id is VaultWorkspaceModuleId => DEFAULT_VAULT_MODULE_ORDER.includes(id as VaultWorkspaceModuleId))
   : [...DEFAULT_VAULT_MODULE_ORDER]
  const storedOrder = Array.isArray(parsed.moduleOrder)
   ? parsed.moduleOrder.filter((id): id is VaultWorkspaceModuleId => DEFAULT_VAULT_MODULE_ORDER.includes(id as VaultWorkspaceModuleId))
   : []
  const moduleOrder = [...storedOrder, ...DEFAULT_VAULT_MODULE_ORDER.filter((id) => !storedOrder.includes(id))]
  return {
   ...DEFAULT_VAULT_WORKSPACE_STATE,
   ...parsed,
   visibleModules,
   moduleOrder,
  }
 } catch {
  return DEFAULT_VAULT_WORKSPACE_STATE
 }
}

export const writeVaultWorkspaceState = (state: VaultWorkspaceState): void => {
 if (!canUseStorage()) return
 localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}
