import fs from "node:fs"
import path from "node:path"

const ROOT = process.cwd()
const SRC_DIR = path.join(ROOT, "src")
const APP_ROUTES = path.join(SRC_DIR, "app", "AppRoutes.tsx")
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"])
const TEST_EXTENSIONS = [".test.ts", ".test.tsx"]

function walk(dir, out = []) {
 if (!fs.existsSync(dir)) return out
 for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
  const full = path.join(dir, entry.name)
  if (entry.isDirectory()) walk(full, out)
  else out.push(full)
 }
 return out
}

const files = walk(SRC_DIR)
const sourceFiles = files.filter((file) => SOURCE_EXTENSIONS.has(path.extname(file)))
const testFiles = files.filter((file) =>
 TEST_EXTENSIONS.some((ext) => file.endsWith(ext)),
)

const violations = {
 renderTimeNavigate: [],
 quarantineImports: [],
 duplicateServiceTests: [],
 directLegacyRoutes: [],
}

for (const file of sourceFiles) {
 const text = fs.readFileSync(file, "utf8")
 if (/useState\s*\(\s*\(\)\s*=>[\s\S]{0,300}navigate\(/m.test(text)) {
  violations.renderTimeNavigate.push(path.relative(ROOT, file))
 }
 if (
  text.includes("_quarantine/") ||
  text.includes("../_quarantine/") ||
  text.includes("/_quarantine/")
 ) {
  violations.quarantineImports.push(path.relative(ROOT, file))
 }
}

const serviceTestsByBase = new Map()
for (const file of testFiles.filter((f) => f.includes(`${path.sep}services${path.sep}`))) {
 const base = path.basename(file).replace(/\.test\.tsx?$/, "")
 const list = serviceTestsByBase.get(base) || []
 list.push(path.relative(ROOT, file))
 serviceTestsByBase.set(base, list)
}

for (const [base, list] of serviceTestsByBase.entries()) {
 if (list.length > 1) {
  violations.duplicateServiceTests.push(`${base}: ${list.join(" | ")}`)
 }
}

if (fs.existsSync(APP_ROUTES)) {
 const routes = fs.readFileSync(APP_ROUTES, "utf8")
 const legacyMustRedirect = [
  "/stuff",
  "/stuff/:tabId",
  "/sources-lab",
  "/component-catalog",
  "/component-grid",
  "/charts-gallery",
  "/charts-gallery/master-graphs",
  "/charts-gallery/toolbox-preview",
  "/thumbnail-studio",
  "/reference-studio-v2",
 ]
 for (const route of legacyMustRedirect) {
  const directMountPattern = new RegExp(
   `path=\\"${route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\"[\\s\\S]{0,120}element=<\\{(?!Navigate)`,
  )
  if (directMountPattern.test(routes)) {
   violations.directLegacyRoutes.push(route)
  }
 }
}

const hasViolations = Object.values(violations).some((list) => list.length > 0)

if (hasViolations) {
 if (violations.renderTimeNavigate.length) {
  console.error("\nRender-time navigate anti-patterns:")
  for (const v of violations.renderTimeNavigate) console.error(`- ${v}`)
 }
 if (violations.quarantineImports.length) {
  console.error("\nQuarantine import violations:")
  for (const v of violations.quarantineImports) console.error(`- ${v}`)
 }
 if (violations.duplicateServiceTests.length) {
  console.error("\nDuplicate service test basenames:")
  for (const v of violations.duplicateServiceTests) console.error(`- ${v}`)
 }
 if (violations.directLegacyRoutes.length) {
  console.error("\nLegacy routes mounted directly (must redirect):")
  for (const v of violations.directLegacyRoutes) console.error(`- ${v}`)
 }
 process.exit(1)
}

console.log(
 "src governance check passed: no render-time navigate patterns, no duplicate service tests, no quarantine imports, and no direct legacy route mounts.",
)
