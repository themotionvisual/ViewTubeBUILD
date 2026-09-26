import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")
const moduleSource = fs.readFileSync(path.resolve(process.cwd(), "src/components/subtoolbox/VaultAssetModule.tsx"), "utf8")
const moduleCss = fs.readFileSync(path.resolve(process.cwd(), "src/styles/vault-asset-module.css"), "utf8")

describe("CreatorVaultOS reference-parity asset modules", () => {
 it("renders persisted asset previews through the canonical Vault module", () => {
  expect(source).toContain("<VaultAssetModule")
  expect(source).toContain("previewUrl={asset.previewUrl || asset.url || null}")
  expect(moduleSource).toContain("vt-vault-media-frame")
  expect(moduleSource).toContain("<img src={previewSrc}")
 })

 it("keeps title and tags on cards while Inspector owns persisted notes", () => {
  expect(source).toContain("onTitleChange={(nextTitle) => updateAssetTitle(asset, nextTitle)}")
  expect(source).toContain("onTagsChange={(tags) =>")
  expect(source).toContain("updateVaultAsset(asset.id, { tags })")
  expect(source).toContain('aria-label="Asset notes"')
  expect(source).toContain("onBlur={(event) => updateAssetNotes(selectedAsset, event.target.value)}")
  expect(moduleSource).toContain("VaultEditableTitle")
  expect(moduleSource).toContain("VaultAssetTagEditor")
  expect(moduleSource).not.toContain("VaultAssetNotes")
 })

 it("uses the ViewTube ink token instead of hard-coded black card chrome", () => {
  expect(moduleCss).toContain("--vt-vault-ink:var(--vt-ink,#16161d)")
  expect(moduleCss).not.toContain("#000")
  expect(moduleCss).not.toContain("color:#000")
 })

 it("maps image/video orientation plus audio/document to the donor variants", () => {
  expect(source).toContain('return "audio"')
  expect(source).toContain('return "document"')
  expect(source).toContain('if (vaultPreviewAspectRatio(asset) < 0.9) return "portrait-single"')
  expect(source).toContain('return "landscape"')
  expect(moduleSource).toContain('"landscape-swapped"')
  expect(source).toContain('"portrait-double"')
  expect(moduleSource).toContain('"portrait-double"')
 })
})