import type { VaultAssetKind } from "@/types"

export type VaultWorkspaceViewMode = "grid" | "masonry" | "filmstrip" | "lineage" | "list" | "timeline"
export type VaultWorkspaceSort = "updated-desc" | "updated-asc" | "name-asc" | "name-desc"
export type VaultWorkspaceDensity = "comfortable" | "compact"
export type VaultAssetOperationsMode = "search" | "batch" | "groups" | "tools"
export type VaultImportTagsMode = "tags" | "import"
export type VaultWorkspaceModuleId =
 | "navigator"
 | "explorer"
 | "workspace-notes"
 | "asset-operations"
 | "import-tags"
 | "text-editor"
 | "asset-library"
 | "task-center"
 | "inspector"

export const DEFAULT_VAULT_MODULE_ORDER: VaultWorkspaceModuleId[] = [
 "workspace-notes",
 "import-tags",
 "text-editor",
 "asset-library",
 "task-center",
 "inspector",
]

const LEGACY_FULL_PAGE_MODULES = new Set<VaultWorkspaceModuleId>([
 "navigator",
 "explorer",
 "asset-operations",
])

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
 assetOperationsMode: VaultAssetOperationsMode
 importTagsMode: VaultImportTagsMode
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
 assetOperationsMode: "search",
 importTagsMode: "tags",
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
  const normalizeModules = (items: unknown[]): VaultWorkspaceModuleId[] => {
   const next: VaultWorkspaceModuleId[] = []
   for (const raw of items) {
    const id = String(raw)
    const normalized = id === "spectrum-tags" || id === "import-station"
     ? "import-tags"
     : id === "batch-processor"
      ? "asset-operations"
      : id
    if (LEGACY_FULL_PAGE_MODULES.has(normalized as VaultWorkspaceModuleId)) continue
    if (!DEFAULT_VAULT_MODULE_ORDER.includes(normalized as VaultWorkspaceModuleId)) continue
    if (!next.includes(normalized as VaultWorkspaceModuleId)) next.push(normalized as VaultWorkspaceModuleId)
   }
   return next
  }

  const rawVisible = Array.isArray(parsed.visibleModules) ? parsed.visibleModules : [...DEFAULT_VAULT_MODULE_ORDER]
  const rawOrder = Array.isArray(parsed.moduleOrder) ? parsed.moduleOrder : []
  const legacyWorkspace = parsed.importTagsMode == null
  const visibleSeed = legacyWorkspace
   ? [...rawVisible, "import-tags", "text-editor"]
   : rawVisible
  const orderSeed = legacyWorkspace
   ? [...rawOrder, "import-tags", "text-editor"]
   : rawOrder
  const visibleModules = normalizeModules(visibleSeed)
  const storedOrder = normalizeModules(orderSeed)
  const moduleOrder = [...storedOrder, ...DEFAULT_VAULT_MODULE_ORDER.filter((id) => !storedOrder.includes(id))]

  const rawOperationsMode = String(parsed.assetOperationsMode || "")
  const assetOperationsMode: VaultAssetOperationsMode = (
   ["search", "batch", "groups", "tools"] as VaultAssetOperationsMode[]
  ).includes(rawOperationsMode as VaultAssetOperationsMode)
   ? rawOperationsMode as VaultAssetOperationsMode
   : "search"
  const rawImportTagsMode = String(parsed.importTagsMode || "")
  const importTagsMode: VaultImportTagsMode = rawImportTagsMode === "import"
   || rawOperationsMode === "import"
   ? "import"
   : "tags"

  return {
   ...DEFAULT_VAULT_WORKSPACE_STATE,
   ...parsed,
   assetOperationsMode,
   importTagsMode,
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