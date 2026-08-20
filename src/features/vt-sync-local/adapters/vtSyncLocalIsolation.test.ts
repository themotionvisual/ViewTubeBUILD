import { describe, expect, it } from "vitest"
import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative } from "node:path"

const root = join(process.cwd(), "src/features/vt-sync-local")

const sourceFiles = (dir: string): string[] =>
 readdirSync(dir).flatMap((entry) => {
  const path = join(dir, entry)
  if (statSync(path).isDirectory()) return sourceFiles(path)
  if (!/\.(ts|tsx)$/.test(path) || /\.test\.(ts|tsx)$/.test(path)) return []
  return [path]
 })

describe("VT Sync local isolation guard", () => {
 it("does not import forbidden Performance Hub or analytics cache dependencies", () => {
  const forbidden = [
   /from\s+["'][^"']*views\/PerformanceHub[^"']*["']/,
   /from\s+["'][^"']*services\/analytics\/DataStore[^"']*["']/,
   /from\s+["'][^"']*services\/analytics\/Selectors[^"']*["']/,
   /from\s+["'][^"']*services\/canonicalSync\/storage[^"']*["']/,
   /from\s+["'][^"']*services\/SyncCoordinator[^"']*["']/,
   /from\s+["'][^"']*services\/performanceHubTableRegistry[^"']*["']/,
   /yt_analytics_cache/,
   /ViewTubeCanonicalAnalyticsDB/,
   /readYouTubeAnalyticsCache/,
   /getMasterRows/,
  ]

  const violations = sourceFiles(root).flatMap((file) => {
   const text = readFileSync(file, "utf8")
   return forbidden
    .filter((pattern) => pattern.test(text))
    .map((pattern) => `${relative(process.cwd(), file)} matched ${pattern}`)
  })

  expect(violations).toEqual([])
 })
})
