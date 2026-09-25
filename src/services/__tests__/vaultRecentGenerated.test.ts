// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest"
import { searchVaultAssets } from "../vaultAdapter"

const storageKey = "vt_creator_vault_assets_v1"

const asset = (input: {
 id: string
 name: string
 updatedAt: number
 source?: "local" | "generated"
 generationId?: string | null
}) => ({
 id: input.id,
 name: input.name,
 kind: "image",
 source: input.source || "local",
 projectId: "p-1",
 projectName: "Project",
 toolId: null,
 generationId: input.generationId ?? null,
 driveFileId: null,
 folderId: null,
 url: null,
 previewUrl: null,
 mimeType: "image/png",
 tags: ["tagged"],
 metadata: {},
 createdAt: input.updatedAt,
 updatedAt: input.updatedAt,
})

describe("Vault Recent and Generated modes", () => {
 beforeEach(() => localStorage.clear())

 it("shows active assets updated within the last 30 days in Recent", () => {
  const now = Date.now()
  localStorage.setItem(storageKey, JSON.stringify([
   asset({ id: "recent", name: "Recent", updatedAt: now - 2 * 86400000 }),
   asset({ id: "old", name: "Old", updatedAt: now - 45 * 86400000 }),
  ]))

  expect(searchVaultAssets({ special: "recent", limit: 100 }).map((item) => item.id))
   .toEqual(["recent"])
 })

 it("shows generation-backed assets in Generated", () => {
  const now = Date.now()
  localStorage.setItem(storageKey, JSON.stringify([
   asset({ id: "generated-source", name: "Generated A", updatedAt: now, source: "generated" }),
   asset({ id: "generated-id", name: "Generated B", updatedAt: now, generationId: "gen-1" }),
   asset({ id: "local", name: "Local", updatedAt: now }),
  ]))

  expect(searchVaultAssets({ special: "generated", limit: 100 }).map((item) => item.id).sort())
   .toEqual(["generated-id", "generated-source"])
 })
})
