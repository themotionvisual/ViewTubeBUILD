import { listVaultAssets, updateVaultAsset } from "./vaultAdapter"

export type VaultCustomFieldType = "text" | "number" | "date" | "boolean"

export type VaultCustomField = {
 id: string
 name: string
 type: VaultCustomFieldType
 createdAt: number
 updatedAt: number
}

export type VaultCustomFieldValue = string | number | boolean | null

const STORAGE_KEY = "vt_creator_vault_custom_fields_v1"

const canUseStorage = () => typeof window !== "undefined" && typeof localStorage !== "undefined"

const writeFields = (fields: VaultCustomField[]) => {
 if (!canUseStorage()) return
 localStorage.setItem(STORAGE_KEY, JSON.stringify(fields))
}

export const listVaultCustomFields = (): VaultCustomField[] => {
 if (!canUseStorage()) return []
 try {
  const raw = localStorage.getItem(STORAGE_KEY)
  const parsed = raw ? JSON.parse(raw) : []
  return Array.isArray(parsed) ? parsed as VaultCustomField[] : []
 } catch {
  return []
 }
}

export const createVaultCustomField = (input: {
 name: string
 type: VaultCustomFieldType
}): VaultCustomField => {
 const name = input.name.trim()
 if (!name) throw new Error("Custom field name is required.")
 const now = Date.now()
 const field: VaultCustomField = {
  id: crypto.randomUUID(),
  name,
  type: input.type,
  createdAt: now,
  updatedAt: now,
 }
 writeFields([...listVaultCustomFields(), field])
 return field
}

export const deleteVaultCustomField = (id: string): void => {
 writeFields(listVaultCustomFields().filter((field) => field.id !== id))
 for (const asset of listVaultAssets()) {
  const current = asset.metadata?.customFields
  if (!current || typeof current !== "object" || Array.isArray(current)) continue
  const next = { ...(current as Record<string, unknown>) }
  if (!(id in next)) continue
  delete next[id]
  updateVaultAsset(asset.id, {
   metadata: {
    ...(asset.metadata || {}),
    customFields: next,
   },
  })
 }
}

const validateCustomFieldValue = (
 field: VaultCustomField,
 value: VaultCustomFieldValue,
): VaultCustomFieldValue => {
 if (value == null || value === "") return null
 if (field.type === "text") {
  if (typeof value !== "string") throw new Error(`${field.name} must be text.`)
  return value
 }
 if (field.type === "number") {
  if (typeof value !== "number" || !Number.isFinite(value)) {
   throw new Error(`${field.name} must be a number.`)
  }
  return value
 }
 if (field.type === "boolean") {
  if (typeof value !== "boolean") throw new Error(`${field.name} must be true or false.`)
  return value
 }
 if (field.type === "date") {
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
   throw new Error(`${field.name} must be a valid date.`)
  }
  return value
 }
 return value
}

export const setVaultCustomFieldValue = (
 assetId: string,
 fieldId: string,
 value: VaultCustomFieldValue,
) => {
 const field = listVaultCustomFields().find((candidate) => candidate.id === fieldId)
 if (!field) throw new Error("Custom field does not exist.")
 const asset = listVaultAssets().find((candidate) => candidate.id === assetId)
 if (!asset) throw new Error("Vault asset does not exist.")

 const validated = validateCustomFieldValue(field, value)
 const current = asset.metadata?.customFields
 const customFields = current && typeof current === "object" && !Array.isArray(current)
  ? { ...(current as Record<string, unknown>) }
  : {}

 if (validated == null) delete customFields[fieldId]
 else customFields[fieldId] = validated

 return updateVaultAsset(assetId, {
  metadata: {
   ...(asset.metadata || {}),
   customFields,
  },
 })
}
