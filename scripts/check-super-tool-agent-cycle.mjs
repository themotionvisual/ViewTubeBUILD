import fs from "node:fs"
import path from "node:path"
import process from "node:process"

const repoRoot = process.cwd()
const phase1Dir = path.join(repoRoot, "docs/VT Brain/super-tool-agent-plans/phase-1")
const phase3Report = path.join(
 repoRoot,
 "docs/VT Brain/super-tool-agent-plans/phase-3/VIEWTUBEX_SUPER_TOOL_AGENT_OPTIMIZATION_REPORTS.md",
)
const runtimeRegistry = path.join(repoRoot, "src/services/superToolRuntimePlanRegistry.ts")
const superToolRegistry = path.join(repoRoot, "src/services/superToolRegistry.ts")
const dataTransparency = path.join(repoRoot, "src/views/DataTransparencyCenter.tsx")
const smokeScript = path.join(repoRoot, "scripts/smoke-super-tools.mjs")

const agentSlugs = [
 "agent-01-creator-canvas-os",
 "agent-02-audience-loop-studio",
 "agent-03-packaging-lab-pro",
 "agent-04-project-command-kanban",
 "agent-05-series-and-theme-generator",
 "agent-06-publishing-schedule-architect",
 "agent-07-motion-scene-builder",
 "agent-08-timeline-asset-vault-dock",
 "agent-09-template-and-foley-forge",
 "agent-10-caption-and-fx-pipeline",
 "agent-11-shorts-extraction-studio",
 "agent-12-cinematic-analytics-lab",
 "agent-13-retention-autopsy-experiment-engine",
 "agent-14-brain-command-center",
 "agent-15-workflow-chain-builder",
]

const requiredContracts = [
 "GenerationRecord",
 "VaultAsset",
 "WorkflowChain",
 "BrainSignalEnvelope",
 "ToolContextPack",
 "VT_E1",
]

const read = (file) => fs.readFileSync(file, "utf8")

const assert = (condition, message) => {
 if (!condition) {
  throw new Error(message)
 }
}

const report = read(phase3Report)
const registry = read(runtimeRegistry)
const canonicalRegistry = read(superToolRegistry)
const dataTransparencyText = read(dataTransparency)
const smoke = read(smokeScript)

const unique = (items) => Array.from(new Set(items))
const quotedValues = (text) => unique([...text.matchAll(/"([^"]+)"/g)].map((match) => match[1]))
const objectKeys = (text, objectName) => {
 const marker = `${objectName}:`
 if (!text.includes(marker)) return []
 const start = text.indexOf(marker)
 const rest = text.slice(start)
 return unique([...rest.matchAll(/^\s*"([^"]+)":\s*\{/gm)].map((match) => match[1]))
}
const arrayValues = (text, arrayName) => {
 const match = text.match(new RegExp(`export const ${arrayName} = new Set<SuperToolId>\\(\\[([\\s\\S]*?)\\]\\)`))
 return match ? quotedValues(match[1]) : []
}

const canonicalToolIds = unique([...canonicalRegistry.matchAll(/^\s*id:\s*"([^"]+)"/gm)].map((match) => match[1]))
const runtimeRecordIds = objectKeys(registry, "SUPER_TOOL_RUNTIME_PLAN_RECORDS")
const mountedIds = arrayValues(registry, "MOUNTED_INTERNAL_TOOL_IDS")
const editorBoundIds = arrayValues(registry, "EDITOR_BOUND_TOOL_IDS")
const supportingIds = arrayValues(registry, "SUPPORTING_TOOL_IDS")

const sameMembers = (label, left, right) => {
 const missing = left.filter((item) => !right.includes(item))
 const extra = right.filter((item) => !left.includes(item))
 assert(!missing.length && !extra.length, `${label} mismatch. Missing=${missing.join(", ") || "none"} Extra=${extra.join(", ") || "none"}`)
}

sameMembers("Canonical SUPER_TOOLS vs runtime records", canonicalToolIds, runtimeRecordIds)
assert(supportingIds.includes("creator-vault-os"), "Creator Vault OS must be represented as a supporting runtime record")
assert(!mountedIds.includes("creator-vault-os"), "Creator Vault OS must not be a mounted Data Transparency prototype")
for (const id of mountedIds) assert(runtimeRecordIds.includes(id), `Mounted id missing runtime record: ${id}`)
for (const id of editorBoundIds) assert(runtimeRecordIds.includes(id), `Editor-bound id missing runtime record: ${id}`)
for (const id of supportingIds) assert(runtimeRecordIds.includes(id), `Supporting id missing runtime record: ${id}`)
for (const id of editorBoundIds) assert(!mountedIds.includes(id), `Editor-bound tool is incorrectly mounted: ${id}`)
for (const id of supportingIds) assert(!editorBoundIds.includes(id), `Supporting tool is incorrectly editor-bound: ${id}`)
for (const id of supportingIds) assert(!mountedIds.includes(id), `Supporting tool is incorrectly mounted: ${id}`)

for (const slug of agentSlugs) {
 const phase1File = path.join(phase1Dir, `${slug}.md`)
 assert(fs.existsSync(phase1File), `Missing Phase 1 file: ${slug}`)
 assert(report.includes(slug), `Missing Phase 3 report entry: ${slug}`)
 assert(registry.includes(slug), `Missing runtime registry record: ${slug}`)
}

for (const contract of requiredContracts) {
 assert(report.includes(contract), `Phase 3 report does not mention required shared contract: ${contract}`)
}

assert(report.includes("Creator Vault OS"), "Phase 3 report must include Creator Vault OS as supporting utility")
assert(report.includes("Prototype purity rule"), "Phase 3 report must include prototype purity rule")
assert(report.includes("Tools 07-10"), "Phase 3 report must preserve Tools 07-10 editor-bound boundary")
assert(dataTransparencyText.includes("superToolRuntimePlanRegistry"), "Data Transparency must use runtime plan registry")
assert(
 dataTransparencyText.includes("Array.from(MOUNTED_INTERNAL_TOOL_IDS)"),
 "Data Transparency mounted gallery must derive from MOUNTED_INTERNAL_TOOL_IDS",
)
assert(smoke.includes("forbiddenPrototypeCopy"), "Smoke test must enforce prototype-purity forbidden copy")
assert(smoke.includes("forbiddenPrototypePatterns"), "Smoke test must enforce broad prototype-purity patterns")

console.log("PASS super-tool agent optimization cycle checks")
