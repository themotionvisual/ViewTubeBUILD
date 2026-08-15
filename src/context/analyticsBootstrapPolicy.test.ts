import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const readSource = (relativePath: string): string =>
 fs.readFileSync(path.resolve(process.cwd(), relativePath), "utf8")

describe("analytics bootstrap policy", () => {
 it("starts channel overview on account boot and refreshes it once on first daily action", () => {
  const bootstrapContext = readSource("src/context/InitialChannelBootstrapContext.tsx")
  const assetCatalogContext = readSource("src/context/VideoAssetCatalogContext.tsx")
  const globalDataContext = readSource("src/context/GlobalDataContext.tsx")

  expect(bootstrapContext).toMatch(/useEffect\([\s\S]*?refresh\(false\)/)
  expect(bootstrapContext).toContain("viewtube:initial-channel-bootstrap:first-action")
  expect(bootstrapContext).toContain("pointerdown")
  expect(assetCatalogContext).toContain('options.reason === "manual" || options.reason === "sync"')
  expect(globalDataContext).toContain("syncChannelBootstrap")
  expect(globalDataContext).not.toContain('reason: "legacy_login"')
 })
})
