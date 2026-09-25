import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/components/Toolbox.tsx"), "utf8")

describe("Toolbox collapse chevron runtime contract", () => {
 it("imports ChevronDown whenever the shared Toolbox renders it", () => {
  expect(source).toContain("<ChevronDown")
  expect(source).toMatch(/import\s*\{[^}]*ChevronDown[^}]*\}\s*from\s*['"]lucide-react['"]/s)
 })
})
