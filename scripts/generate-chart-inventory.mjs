import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from "node:fs"
import { resolve } from "node:path"

const root = resolve(process.cwd())
const appRoutesPath = resolve(root, "src/app/AppRoutes.tsx")

const routeSource = readFileSync(appRoutesPath, "utf8")

const routeMatches = Array.from(
 routeSource.matchAll(/path="([^"]+)"\s+element={<([^>\s]+)/g),
).map((match) => ({
 route: match[1],
 element: match[2],
}))

const routeToEntry = new Map([
 [
  "/performance",
  {
   pageSection: "Performance Hub",
   toolbox: "CHANNEL ANALYSIS + CHANNEL",
   provider: "recharts + custom svg",
   dataSource: "canonical selectors (api/csv/hybrid)",
   timeWindowBehavior: "lifetime default, user-selectable windows",
   metricDependencies: ["views", "watchHours", "likes", "comments", "shares", "subs", "ctr", "retention", "impressions"],
  },
 ],
 [
  "/legacy/research-lab",
  {
   pageSection: "Research Lab",
   toolbox: "Legacy Lab Charts",
   provider: "google + recharts + custom",
   dataSource: "canonical selectors + cache adapters",
   timeWindowBehavior: "window-selectable",
   metricDependencies: ["views", "watchHours", "revenue", "ctr", "impressions", "retention", "demographics"],
  },
 ],
 [
  "/legacy/channelytics",
  {
   pageSection: "Channelytics",
   toolbox: "Channel Intelligence Lab",
   provider: "ChartEngine (google)",
   dataSource: "canonical selectors + uploaded csv",
   timeWindowBehavior: "lifetime-focused",
   metricDependencies: ["views", "watchHours", "subs", "likes", "comments", "shares"],
  },
 ],
 [
  "/legacy/data-vizualizations",
  {
   pageSection: "Data Visualizations",
   toolbox: "Graph Catalog",
   provider: "custom svg",
   dataSource: "canonical selectors",
   timeWindowBehavior: "lifetime",
   metricDependencies: ["views", "impressions", "ctr", "retention", "revenue"],
  },
 ],
 [
  "/charts-gallery/master-graphs",
  {
   pageSection: "Master Graphs Gallery",
   toolbox: "Charts Gallery",
   provider: "recharts",
   dataSource: "canonical selectors",
   timeWindowBehavior: "lifetime",
   metricDependencies: ["views", "retention", "ctr", "impressions", "revenue"],
  },
 ],
 [
  "/charts-gallery/toolbox-preview",
  {
   pageSection: "Toolbox Preview",
   toolbox: "ChannelyticsChartToolbox + ChartEngine",
   provider: "google + custom",
   dataSource: "canonical selectors + fixtures",
   timeWindowBehavior: "toggle by source dataset",
   metricDependencies: ["views", "watchHours", "ctr", "impressions", "retention"],
  },
 ],
 [
  "/studio/internal-analytics",
  {
   pageSection: "Internal Analytics",
   toolbox: "KPI Panel",
   provider: "recharts + tables",
   dataSource: "canonical selectors",
   timeWindowBehavior: "lifetime + selectable",
   metricDependencies: ["coverage", "availability", "window sync diagnostics"],
  },
 ],
])

const entries = routeMatches
 .filter((match) => routeToEntry.has(match.route))
 .map((match) => ({
  route: match.route,
  component: match.element,
  ...routeToEntry.get(match.route),
 }))

const jsonOut = {
 generatedAt: new Date().toISOString(),
 primaryScopeRoutes: entries.map((entry) => entry.route),
 viewNowLinks: entries.map((entry) => entry.route),
 entries,
}

mkdirSync(resolve(root, "src/generated"), { recursive: true })
mkdirSync(resolve(root, "docs"), { recursive: true })
writeFileSync(
 resolve(root, "src/generated/chart-inventory.json"),
 JSON.stringify(jsonOut, null, 2),
)

const lines = [
 "# Chart Inventory",
 "",
 `Generated: ${jsonOut.generatedAt}`,
 "",
 "| Route | Section / Toolbox | Component | Provider | Data source | Time window | Metric deps |",
 "|---|---|---|---|---|---|---|",
 ...entries.map(
  (entry) =>
   `| ${entry.route} | ${entry.pageSection} / ${entry.toolbox} | ${entry.component} | ${entry.provider} | ${entry.dataSource} | ${entry.timeWindowBehavior} | ${entry.metricDependencies.join(", ")} |`,
 ),
 "",
 "## View Now Links",
 ...entries.map((entry) => `- ${entry.route}`),
 "",
]

writeFileSync(resolve(root, "docs/chart-inventory.md"), lines.join("\n"))

const walk = (dir) => {
 const entries = readdirSync(dir)
 const files = []
 for (const entry of entries) {
  const full = resolve(dir, entry)
  const st = statSync(full)
  if (st.isDirectory()) {
   files.push(...walk(full))
   continue
  }
  if (full.endsWith(".ts") || full.endsWith(".tsx")) files.push(full)
 }
 return files
}

const classifyPath = (relativePath) => {
 if (relativePath.includes("analyticsSelectors") || relativePath.includes("canonical")) {
  return "canonical"
 }
 if (relativePath.includes("PerformanceHub") || relativePath.includes("ResearchLab")) {
  return "transitional"
 }
 return "legacy-only"
}

const analyticsPathHits = []
const srcFiles = walk(resolve(root, "src"))
for (const file of srcFiles) {
 const source = readFileSync(file, "utf8")
 if (!source.includes("yt_analytics_cache")) continue
 const relative = file.replace(`${root}/`, "")
 const lines = source.split("\n")
 lines.forEach((line, index) => {
  if (line.includes("yt_analytics_cache")) {
   analyticsPathHits.push({
    file: relative,
    line: index + 1,
    classification: classifyPath(relative),
    snippet: line.trim(),
   })
  }
 })
}

const pathInventory = {
 generatedAt: new Date().toISOString(),
 totalHits: analyticsPathHits.length,
 hits: analyticsPathHits,
}

writeFileSync(
 resolve(root, "src/generated/analytics-data-path-inventory.json"),
 JSON.stringify(pathInventory, null, 2),
)
writeFileSync(
 resolve(root, "docs/analytics-data-path-inventory.md"),
 [
  "# Analytics Data Path Inventory",
  "",
  `Generated: ${pathInventory.generatedAt}`,
  "",
  "| File | Line | Classification | Snippet |",
  "|---|---:|---|---|",
  ...analyticsPathHits.map(
   (hit) =>
    `| ${hit.file} | ${hit.line} | ${hit.classification} | \`${hit.snippet.replaceAll("`", "\\`")}\` |`,
  ),
  "",
 ].join("\n"),
)

console.log(
 `Generated chart inventory with ${entries.length} primary routes and ${analyticsPathHits.length} analytics cache path hits.`,
)
