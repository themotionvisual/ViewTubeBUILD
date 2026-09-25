import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")

describe("CreatorVaultOS Asset Operations utility tools", () => {
 it("includes fast selected-asset navigation and inspection utilities", () => {
  for (const label of [
   "Open Quick Look",
   "Compare Selected Pair",
   "Open Filmstrip",
   "Open Lineage",
   "Copy Asset ID",
  ]) expect(source).toContain(label)
 })
})
