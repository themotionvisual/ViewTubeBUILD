// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest"
import { listVaultAssets } from "../vaultAdapter"
import {
 createVaultTextDocument,
 saveVaultTextDocument,
} from "../vaultTextDocuments"

describe("Vault text documents", () => {
 beforeEach(() => localStorage.clear())

 it("creates a canonical document asset with editable text content", () => {
  const asset = createVaultTextDocument({
   name: "Episode Notes",
   text: "# Opening\nAusterlitz",
   format: "markdown",
   projectId: "p-1",
   projectName: "Austerlitz",
  })

  expect(asset.kind).toBe("document")
  expect(asset.mimeType).toBe("text/markdown")
  expect(asset.metadata).toMatchObject({
   textContent: "# Opening\nAusterlitz",
   textFormat: "markdown",
  })
 })

 it("updates text without replacing the canonical asset id", () => {
  const asset = createVaultTextDocument({
   name: "Notes",
   text: "Draft",
   format: "plain",
  })
  const saved = saveVaultTextDocument(asset.id, {
   name: "Notes v2",
   text: "Revised",
   format: "plain",
  })

  expect(saved?.id).toBe(asset.id)
  expect(saved?.name).toBe("Notes v2")
  expect(saved?.metadata?.textContent).toBe("Revised")
  expect(listVaultAssets()).toHaveLength(1)
 })
})
