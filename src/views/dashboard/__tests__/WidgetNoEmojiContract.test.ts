import { readdirSync, readFileSync } from "node:fs"
import { extname, join, resolve } from "node:path"
import { describe, expect, it } from "vitest"

const WIDGET_ROOT = resolve(process.cwd(), "src/views/dashboard/widgets")
const EMOJI = /\p{Extended_Pictographic}/u

const sourceFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return sourceFiles(path)
    return [".ts", ".tsx"].includes(extname(entry.name)) ? [path] : []
  })

describe("dashboard widget icon contract", () => {
  it("uses icon components instead of emoji characters in widget source", () => {
    const offenders = sourceFiles(WIDGET_ROOT)
      .filter((path) => EMOJI.test(readFileSync(path, "utf8")))
      .map((path) => path.slice(WIDGET_ROOT.length + 1))

    expect(offenders).toEqual([])
  })
})
