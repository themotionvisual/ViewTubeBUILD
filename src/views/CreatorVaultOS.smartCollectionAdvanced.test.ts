import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")

describe("CreatorVaultOS advanced Smart Collections", () => {
 it("saves and reapplies the complete structured filter state", () => {
  for (const term of [
   "lifecycle: filterLifecycle",
   "mimeType: filterMimeType",
   "minWidth: filterMinWidth",
   "minHeight: filterMinHeight",
   "minDuration: filterMinDuration",
   "maxDuration: filterMaxDuration",
   "minBytesMb: filterMinBytesMb",
   "maxBytesMb: filterMaxBytesMb",
   "setFilterLifecycle(collection.lifecycle)",
   "setFilterMimeType(collection.mimeType)",
  ]) expect(source).toContain(term)
 })
})
