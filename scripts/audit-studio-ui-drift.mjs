import fs from "node:fs"
import path from "node:path"

const ROOT = process.cwd()
const SEARCH_ROOTS = ["src/views", "src/components"]
const STUDIO_HINTS = [
  "StudioHub",
  "VideoManager",
  "VideoPublisher",
  "CommentResponder",
  "Community",
  "Thumbnail",
  "MediaAnalyzer",
  "PreLaunchPriming",
  "HookGenerator",
  "ActionableTactics",
  "ScriptArchitect",
  "EndScreen",
  "UIReferenceLibrary",
]

const PATTERNS = [
  ["hardcoded 4px border", /border-\[4px\]/g],
  ["hardcoded 5px border", /border-\[5px\]/g],
  ["arbitrary radius", /rounded-\[[^\]]+\]/g],
  ["arbitrary shadow", /shadow-\[[^\]]+\]/g],
  ["arbitrary height", /\bh-\[[^\]]+\]/g],
  ["arbitrary minimum height", /\bmin-h-\[[^\]]+\]/g],
  ["hardcoded hex color", /#[0-9a-fA-F]{6}\b/g],
  ["dashed border", /border-dashed/g],
]

const walk = (dir) => {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return walk(full)
    return /\.(tsx?|jsx?)$/.test(entry.name) ? [full] : []
  })
}

const candidates = SEARCH_ROOTS
  .flatMap((root) => walk(path.join(ROOT, root)))
  .filter((file) => STUDIO_HINTS.some((hint) => path.basename(file).includes(hint)))

const findings = []
for (const file of candidates) {
  const source = fs.readFileSync(file, "utf8")
  const lines = source.split(/\r?\n/)
  lines.forEach((line, index) => {
    PATTERNS.forEach(([label, expression]) => {
      expression.lastIndex = 0
      const matches = [...line.matchAll(expression)]
      for (const match of matches) {
        findings.push({
          file: path.relative(ROOT, file),
          line: index + 1,
          label,
          value: match[0],
        })
      }
    })
  })
}

console.log(`Studio UI drift audit: ${candidates.length} candidate files, ${findings.length} review trigger(s).`)
for (const finding of findings) {
  console.log(`${finding.file}:${finding.line}  ${finding.label}: ${finding.value}`)
}

if (process.argv.includes("--check") && findings.length > 0) {
  console.error("\nStudio UI drift check failed. Review or register the findings as explicit exceptions.")
  process.exitCode = 1
}
