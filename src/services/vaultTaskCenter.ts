export type VaultTaskStatus = "queued" | "processing" | "completed" | "failed"
export type VaultTaskType =
 | "ingest-preflight"
 | "metadata"
 | "hash"
 | "thumbnail"
 | "transcript"
 | "proxy"

export type VaultTask = {
 id: string
 type: VaultTaskType
 label: string
 assetName?: string | null
 status: VaultTaskStatus
 progress: number
 detail: string
 createdAt: number
 updatedAt: number
}

const STORAGE_KEY = "vt_creator_vault_tasks_v1"

const canUseStorage = () => typeof window !== "undefined" && typeof localStorage !== "undefined"

const writeVaultTasks = (tasks: VaultTask[]) => {
 if (!canUseStorage()) return
 localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

export const listVaultTasks = (): VaultTask[] => {
 if (!canUseStorage()) return []
 try {
  const raw = localStorage.getItem(STORAGE_KEY)
  const parsed = raw ? JSON.parse(raw) : []
  return Array.isArray(parsed) ? (parsed as VaultTask[]) : []
 } catch {
  return []
 }
}

export const createVaultTask = (input: {
 type: VaultTaskType
 label: string
 assetName?: string | null
 detail?: string
}): VaultTask => {
 const now = Date.now()
 const task: VaultTask = {
  id: crypto.randomUUID(),
  type: input.type,
  label: input.label,
  assetName: input.assetName || null,
  status: "queued",
  progress: 0,
  detail: input.detail || "",
  createdAt: now,
  updatedAt: now,
 }
 writeVaultTasks([task, ...listVaultTasks()].slice(0, 100))
 return task
}

export const updateVaultTask = (
 id: string,
 patch: Partial<Pick<VaultTask, "status" | "progress" | "detail" | "label">>,
): VaultTask | null => {
 const tasks = listVaultTasks()
 const current = tasks.find((task) => task.id === id)
 if (!current) return null
 const updated: VaultTask = {
  ...current,
  ...patch,
  progress: Math.max(0, Math.min(100, patch.progress ?? current.progress)),
  updatedAt: Date.now(),
 }
 writeVaultTasks(tasks.map((task) => (task.id === id ? updated : task)))
 return updated
}

export const clearCompletedVaultTasks = (): void => {
 writeVaultTasks(listVaultTasks().filter((task) => task.status !== "completed"))
}
