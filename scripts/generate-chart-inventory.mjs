import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs"
import { resolve, relative } from "node:path"

const root = resolve(process.cwd())
const srcRoot = resolve(root, "src")
const generatedRoot = resolve(srcRoot, "generated")
const docsRoot = resolve(root, "docs")
const routesPath = resolve(srcRoot, "app/AppRoutes.tsx")
const unifiedSpecPath = resolve(srcRoot, "chartSystem/unifiedChartSpec.ts")
const spec40Path = resolve(srcRoot, "views/performanceHub40/chartSpec40.ts")
const registry40Path = resolve(srcRoot, "views/performanceHub40/chartRegistry.ts")

const KNOWN_METRICS = [
  "views",
  "watchHours",
  "revenue",
  "subscribers",
  "ctr",
  "impressions",
  "likes",
  "comments",
  "shares",
  "avd",
  "avp",
  "engagedViews",
  "country",
  "device",
  "trafficSource",
  "contentType",
]

const CHART_TOKEN_REGEX =
  /\b(LineChart|AreaChart|BarChart|ScatterChart|PieChart|RadarChart|Treemap|ComposedChart|FunnelChart|RadialBarChart|ChartEngine|ChartRendererSurface|GoogleChart|Chart)\b/g

const ROUTE_FAMILY_HINTS = new Map([
  ["/performance", "Performance Hub"],
  ["/legacy/channelytics", "Legacy Channelytics"],
  ["/legacy/research-lab", "Legacy Research Lab"],
  ["/legacy/data-vizualizations", "Legacy Data Vizualizations"],
  ["/graphs", "Graphs Page"],
  ["/graphs/shorts-retention", "Graphs Shorts Retention"],
  ["/charts-gallery/master-graphs", "Charts Gallery"],
  ["/charts-gallery/toolbox-preview", "Charts Gallery Toolbox"],
  ["/studio/internal-analytics", "Internal Analytics"],
  ["/reference-studio/:tabId", "Reference Studio"],
  ["/reference-studio-v2", "Reference Studio V2"],
])

const walk = (dir) => {
  const entries = readdirSync(dir)
  const files = []
  for (const entry of entries) {
    const full = resolve(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) {
      if (entry === "generated") continue
      files.push(...walk(full))
      continue
    }
    if (/\.(ts|tsx|js|jsx)$/.test(full)) files.push(full)
  }
  return files
}

const parseRoutes = () => {
  const source = readFileSync(routesPath, "utf8")
  const importMap = new Map()
  for (const match of source.matchAll(
    /import\s+([A-Za-z0-9_{} ,*]+)\s+from\s+"([^"]+)"/g,
  )) {
    const imported = match[1].trim()
    const from = match[2].trim()
    if (!from.startsWith(".")) continue
    if (imported.startsWith("{")) continue
    importMap.set(imported, from)
  }

  const routes = []
  for (const match of source.matchAll(
    /<Route\s+path="([^"]+)"\s+element={<([^>\s/]+)/g,
  )) {
    const route = match[1]
    const component = match[2]
    routes.push({
      route,
      component,
      importPath: importMap.get(component) ?? null,
    })
  }
  return routes
}

const detectRendererFamily = (source) => {
  const hasRecharts =
    source.includes("from \"recharts\"") || source.includes("from 'recharts'")
  const hasGoogle =
    source.includes("react-google-charts") ||
    source.includes("ChartEngine") ||
    source.includes("google.visualization")
  if (hasRecharts && hasGoogle) return "Recharts+GoogleChart"
  if (hasRecharts) return "Recharts"
  if (hasGoogle) return "GoogleChart"
  return "Custom"
}

const extractChartTypes = (source) => {
  const matches = new Set()
  for (const match of source.matchAll(CHART_TOKEN_REGEX)) {
    matches.add(match[1])
  }
  return Array.from(matches)
}

const extractMetrics = (source) => {
  const lower = source.toLowerCase()
  return KNOWN_METRICS.filter((metric) => lower.includes(metric.toLowerCase()))
}

const extractStyleTokens = (source) => {
  const hexes = Array.from(source.matchAll(/#[0-9A-Fa-f]{3,8}/g)).map(
    (m) => m[0],
  )
  const tailwindTokens = Array.from(
    source.matchAll(/\b(?:bg|text|border)-\[[^\]]+\]/g),
  ).map((m) => m[0])
  return Array.from(new Set([...hexes, ...tailwindTokens])).slice(0, 24)
}

const extractAxisHints = (source) => {
  const axisTokens = ["xaxis", "yaxis", "x-axis", "y-axis", "duration", "retention", "impressions", "ctr", "views", "watch"]
  const lower = source.toLowerCase()
  return axisTokens.filter((token) => lower.includes(token))
}

const parseUnifiedSpecs = () => {
  const src = readFileSync(unifiedSpecPath, "utf8")
  const ids = Array.from(src.matchAll(/id:\s*"([^"]+)"/g)).map((m) => m[1])
  return new Set(ids)
}

const parseSpec40Ids = () => {
  const src = readFileSync(spec40Path, "utf8")
  return Array.from(src.matchAll(/\{\s*id:\s*"([^"]+)"/g)).map((m) => m[1])
}

const parseRegistry40 = () => {
  const src = readFileSync(registry40Path, "utf8")
  const out = new Map()
  for (const block of src.matchAll(
    /\{\s*chartId:\s*"([^"]+)"[\s\S]*?stage:\s*"([^"]+)"[\s\S]*?analyticsReady:\s*(true|false)[\s\S]*?notes:\s*"([^"]+)"/g,
  )) {
    out.set(block[1], {
      stage: block[2],
      analyticsReady: block[3] === "true",
      notes: block[4],
    })
  }
  return out
}

const routes = parseRoutes()
const routeByComponent = new Map(routes.map((r) => [r.component, r]))
const files = walk(srcRoot)
const unifiedIds = parseUnifiedSpecs()
const spec40Ids = parseSpec40Ids()
const registry40 = parseRegistry40()

const chartFiles = []

for (const file of files) {
  const source = readFileSync(file, "utf8")
  const looksChartLike =
    source.includes("Chart") ||
    source.includes("chart") ||
    source.includes("recharts") ||
    source.includes("react-google-charts")
  if (!looksChartLike) continue

  const chartTypes = extractChartTypes(source)
  const rendererFamily = detectRendererFamily(source)
  const metrics = extractMetrics(source)
  if (chartTypes.length === 0 && rendererFamily === "Custom" && metrics.length === 0) {
    continue
  }

  const rel = relative(root, file)
  const base = rel.split("/").pop()?.replace(/\.(ts|tsx|js|jsx)$/, "") ?? rel
  const routeInfo = routeByComponent.get(base)
  const surface = routeInfo?.route ?? "internal/shared"

  chartFiles.push({
    file: rel,
    chartComponent: base,
    chartTypes,
    rendererFamily,
    dataKeys: metrics,
    routeSurface: surface,
    pageFamily: ROUTE_FAMILY_HINTS.get(surface) ?? "Shared/Internal",
    axes: extractAxisHints(source),
    styleTokens: extractStyleTokens(source),
    evidenceSnippet: source.split("\n").find((line) => line.includes("Chart"))?.trim() ?? "",
  })
}

chartFiles.sort((a, b) => a.file.localeCompare(b.file))

const onboarding = spec40Ids.map((chartId) => {
  const inUnifiedSpec = unifiedIds.has(chartId)
  const registry = registry40.get(chartId) ?? null
  const status = !inUnifiedSpec
    ? "not_ready_contract"
    : registry?.analyticsReady
      ? "ready_for_rollout"
      : "not_ready_data"
  return {
    chartId,
    inUnifiedSpec,
    lifecycleStage: registry?.stage ?? "incubator",
    analyticsReady: registry?.analyticsReady ?? false,
    onboardingStatus: status,
    notes:
      registry?.notes ??
      "Missing registry entry. Add chartRegistry mapping before promotion.",
  }
})

const summary = {
  generatedAt: new Date().toISOString(),
  scope: "viewtubeX/src",
  totals: {
    chartFiles: chartFiles.length,
    uniqueRouteSurfaces: new Set(chartFiles.map((item) => item.routeSurface)).size,
    rolloutCharts: onboarding.length,
    readyForRollout: onboarding.filter((x) => x.onboardingStatus === "ready_for_rollout").length,
    notReady: onboarding.filter((x) => x.onboardingStatus !== "ready_for_rollout").length,
  },
}

const inventory = {
  ...summary,
  entries: chartFiles,
  onboarding,
}

const csvHeader = [
  "file",
  "chartComponent",
  "chartTypes",
  "rendererFamily",
  "dataKeys",
  "routeSurface",
  "pageFamily",
  "axes",
  "onboardingStatus",
  "lifecycleStage",
].join(",")

const onboardingById = new Map(onboarding.map((item) => [item.chartId, item]))

const csvRows = chartFiles.map((entry) => {
  const onboardingGuess = onboardingById.get(entry.chartComponent) ?? null
  const row = [
    entry.file,
    entry.chartComponent,
    entry.chartTypes.join("|"),
    entry.rendererFamily,
    entry.dataKeys.join("|"),
    entry.routeSurface,
    entry.pageFamily,
    entry.axes.join("|"),
    onboardingGuess?.onboardingStatus ?? "",
    onboardingGuess?.lifecycleStage ?? "",
  ]
  return row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
})

const playbookLines = [
  "# PerformanceHub Chart Onboarding Playbook",
  "",
  `Generated: ${summary.generatedAt}`,
  "",
  "## Pipeline",
  "1. Inventory chart-bearing files (`chart-inventory.json`).",
  "2. Bind each chart to a unified spec entry (`unifiedChartSpec.ts`).",
  "3. Bind renderer + metrics alias adapters (`performanceHub40/adapter.ts`, `performanceHub40/capability.ts`).",
  "4. Register lifecycle and rollout state (`performanceHub40/chartRegistry.ts`).",
  "5. Promote by pack in `PerformanceHubChartRollout` when capability is ready.",
  "",
  "## Chart Actions",
  "| Chart ID | Status | Stage | Action |",
  "|---|---|---|---|",
  ...onboarding.map((item) => {
    const action =
      item.onboardingStatus === "ready_for_rollout"
        ? "Assign/verify in active pack and validate rendering."
        : item.onboardingStatus === "not_ready_contract"
          ? "Add missing unified spec contract fields."
          : "Complete metric adapter coverage and set analyticsReady=true."
    return `| ${item.chartId} | ${item.onboardingStatus} | ${item.lifecycleStage} | ${action} |`
  }),
  "",
]

mkdirSync(generatedRoot, { recursive: true })
mkdirSync(docsRoot, { recursive: true })

writeFileSync(resolve(generatedRoot, "chart-inventory.json"), JSON.stringify(inventory, null, 2))
writeFileSync(resolve(generatedRoot, "chart-inventory.csv"), [csvHeader, ...csvRows].join("\n"))
writeFileSync(resolve(docsRoot, "performancehub-chart-onboarding.md"), playbookLines.join("\n"))

console.log(
  `Generated chart inventory: ${summary.totals.chartFiles} chart files, ${summary.totals.rolloutCharts} rollout charts.`,
)
