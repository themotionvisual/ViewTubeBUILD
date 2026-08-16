import { chromium } from "playwright"

const baseUrl = process.env.VT_SMOKE_BASE_URL || "http://localhost:5173"
const headless = process.env.VT_SMOKE_HEADLESS !== "0"

const storageKeys = {
 generations: "vt_supertool_generations_v1",
 vault: "vt_creator_vault_assets_v1",
 workflows: "vt_supertool_workflows_v1",
 experiments: "vt_retention_experiments_v1",
 brainActions: "vt_brain_command_actions_v1",
}

const routes = [
 {
  id: "creator-canvas-os",
  toolboxText: "Sub-Toolboxes",
  moduleText: "Idea Intake",
  actionText: "Build Persisted Packet",
  run: async (page) => {
   await page.getByPlaceholder("Topic, clip, audience question, or rough concept").fill("Smoke test creator idea")
   await page.getByPlaceholder("Explain, entertain, convert, serialize, or launch a new lane").fill("Prove packet persistence")
   await page.getByPlaceholder("Target viewer, proof points, format, runtime, objections, and desired payoff").fill("QA note with evidence and storyboard handoff")
   await page.getByRole("button", { name: /Build Persisted Packet/i }).click()
   await page.getByText(/packet saved, vault artifact created, and workflow chain queued/i).waitFor({ timeout: 10000 })
   await page.getByPlaceholder("Smoke test creator idea").fill("Smoke test creator idea")
   await page.getByPlaceholder("Viewer segment or audience need").fill("Creators who need repeatable launch systems")
   await page.getByPlaceholder("Evidence, examples, objections, or repeated audience signal").fill("Viewer asks repeat around workflow and packaging")
   await page.getByPlaceholder("Clips, screenshots, B-roll, graphics, audio, or VT_E1 needs").fill("Need intro scene, proof card, and CTA scene")
   await page.getByRole("button", { name: /Save Idea Action Packet/i }).click()
   await page.getByText(/Idea action packet saved/i).waitFor({ timeout: 10000 })
   await page.getByRole("button", { name: /Save Storyboard Handoff/i }).click()
   await page.getByText(/Storyboard handoff packet saved/i).waitFor({ timeout: 10000 })
  },
  verify: ({ before, after, signals }) => {
   assertDeltaAtLeast("creator generations", before.generations, after.generations, 3)
   assertDeltaAtLeast("creator vault assets", before.vault, after.vault, 3)
   assertDeltaAtLeast("creator workflows", before.workflows, after.workflows, 3)
   assertDeltaAtLeast("creator brain signals", before.signals, signals, 3)
  },
 },
 {
  id: "shorts-extraction-studio",
  toolboxText: "Toolbox Modules",
  moduleText: "Source Clip Intake",
  actionText: "Create Shorts Workflow",
  run: async (page) => {
   await page.getByPlaceholder("Long-form episode, stream, or source video").fill("Smoke test source episode")
   await page.getByPlaceholder("00:01:24-00:02:04 or chapter/clip range").fill("00:01:24-00:02:04")
   await page.getByPlaceholder("Why this clip is worth cutting: hook, proof moment, retention spike, comment request").fill("Retention spike around proof moment")
   await page.getByPlaceholder("Editor target, caption/FX instruction, render note, or next agent reminder").fill("Send to VT_E1 with caption-led layout")
   await page.getByRole("button", { name: /Create Shorts Workflow/i }).click()
   await page.getByText(/Shorts workflow created and sent to Workflow Chain Builder/i).waitFor({ timeout: 10000 })
  },
  verify: ({ before, after, signals }) => {
   assertDelta("shorts generations", before.generations, after.generations)
   assertDelta("shorts vault assets", before.vault, after.vault)
   assertDelta("shorts workflows", before.workflows, after.workflows)
   assertDelta("shorts brain signals", before.signals, signals)
  },
 },
 {
  id: "retention-autopsy-experiment-engine",
  toolboxText: "Toolbox Modules",
  moduleText: "Retention Curve Intake",
 actionText: "Queue Experiment",
 run: async (page) => {
   await page.getByRole("button", { name: /^Queue Experiment$/i }).click()
   await page.getByText(/Experiment queued and workflow chain created/i).waitFor({ timeout: 10000 })
  },
  verify: ({ before, after, signals }) => {
   assertDelta("retention experiments", before.experiments, after.experiments)
   assertDelta("retention workflows", before.workflows, after.workflows)
   assertDelta("retention brain signals", before.signals, signals)
  },
 },
 {
  id: "brain-command-center",
  toolboxText: "Toolbox Modules",
  moduleText: "Brain Signals",
  actionText: "Save Brain Signal",
  run: async (page) => {
   await page.getByPlaceholder("Correct a Brain assumption, add a priority, or explain what the next agent should remember.").fill("Smoke test command note with confidence boundary")
   await page.getByPlaceholder("Source evidence, one item per line: artifact id, workflow id, metric, user correction, or doc reference").fill("smoke-artifact-id\nsmoke-workflow-id")
   await page.getByRole("button", { name: /Save Brain Signal/i }).click()
   await page.getByText(/Command note saved to the Brain signal loop/i).waitFor({ timeout: 10000 })
  },
  verify: ({ before, after, signals }) => {
   assertDelta("brain command signals", before.signals, signals)
   assertDelta("brain command actions", before.brainActions, after.brainActions)
   assertDelta("brain command generations", before.generations, after.generations)
   assertDelta("brain command workflows", before.workflows, after.workflows)
  },
 },
 {
  id: "workflow-chain-builder",
  toolboxText: "Toolbox Modules",
  moduleText: "Chain Templates",
  actionText: "Create Chain",
  run: async (page) => {
   await page.getByPlaceholder("Idea To Publish").fill("Smoke test workflow chain")
   await page.getByPlaceholder("Move one idea from concept to package, edit, publish, and audience follow-up.").fill("Prove workflow creation and artifact attachment")
   await page.getByRole("button", { name: /Create Chain/i }).click()
   await page.getByText(/Created workflow: Smoke test workflow chain/i).waitFor({ timeout: 10000 })
   await page.getByPlaceholder("Paste generation, vault, or export artifact id").fill("smoke-artifact-id")
   await page.getByRole("button", { name: /^Attach$/i }).click()
   await page.getByText(/Artifact attached to selected workflow/i).waitFor({ timeout: 10000 })
   await page.getByPlaceholder("What is blocking this step?").fill("Smoke blocker reason")
   await page.getByPlaceholder("What should the next agent inspect or do?").fill("Smoke next agent note")
   await page.getByRole("button", { name: /^blocked$/i }).first().click()
   await page.getByText(/Step marked blocked/i).waitFor({ timeout: 10000 })
  },
  verify: ({ before, after, signals }) => {
   assertDelta("workflow chains", before.workflows, after.workflows)
   assertDelta("workflow brain signals", before.signals, signals)
   const latest = after.workflowRecords[0]
   if (!latest?.artifactIds?.includes("smoke-artifact-id")) {
    throw new Error("workflow artifact attachment was not persisted")
   }
   const blockedStep = latest?.steps?.find((step) => step.status === "blocked")
   if (!blockedStep?.details?.includes("Smoke blocker reason") || !blockedStep?.details?.includes("Smoke next agent note")) {
    throw new Error("workflow blocker reason and next-agent note were not persisted")
   }
  },
 },
]

const prototypeRoutes = [
 { id: "creator-canvas-os", title: "Creator Canvas", labels: ["Idea intake queue", "Storyboard bridge"] },
 { id: "audience-loop-studio", title: "Audience Loop", labels: ["Comment stream", "Reply and community composer"] },
 { id: "packaging-lab-pro", title: "Packaging Lab", labels: ["Variant scoring table", "Visual board"] },
 { id: "project-command-kanban", title: "Project Command", labels: ["Idea Backlog", "Published"] },
 { id: "series-and-theme-generator", title: "Series Generator", labels: ["Theme Cluster Map", "Franchise Map"] },
 { id: "publishing-schedule-architect", title: "Publishing Architect", labels: ["Publishing board", "Gate checklist"] },
 { id: "shorts-extraction-studio", title: "Shorts Studio", labels: ["Source 16:9", "Export 9:16", "Frame scrubber and keyframes", "cropWindow", "cropLeft"] },
 { id: "cinematic-analytics-lab", title: "Cinematic Analytics", labels: ["Canonical controls", "Chart and contrast surface"] },
 { id: "retention-autopsy-experiment-engine", title: "Retention Engine", labels: ["Avg retention 40.09%", "Intervention"] },
 { id: "brain-command-center", title: "Brain Command", labels: ["Routing", "Confidence"] },
 { id: "workflow-chain-builder", title: "Workflow Chain", labels: ["Outputs", "Blockers"] },
]

const builderMapLabels = [
 "Creator Canvas OS",
 "Audience Loop Studio",
 "Packaging Lab Pro",
 "Project Command Kanban",
 "Motion Scene Builder",
 "Creator Vault OS",
 "Workflow Chain Builder",
]

const forbiddenPrototypeCopy = [
 "Prototype Workspace",
 "Selected prototype state",
 "future-tool layout preview",
 "Future toolbox layout",
 "planned controls",
 "Evidence and handoff",
 "Action bar",
 "Select a prototype card",
 "No prototype cards",
 "User asks strategic question",
 "Brain cites evidence",
 "Accepted answer becomes workflow",
 "Builder Map",
 "Canonical Docs",
 "Portfolio Plan",
 "Overlap/Synthesis",
]

const forbiddenPrototypePatterns = [
 /future\s+toolbox/i,
 /future[-\s]+tool/i,
 /prototype\s+workspace/i,
 /prototype\s+card/i,
 /planned\s+controls/i,
 /planning\s+copy/i,
 /what\s+this\s+tool\s+does/i,
 /current\s+build\s+state/i,
]

const readJson = (raw) => {
 if (!raw) return []
 try {
  const parsed = JSON.parse(raw)
  return Array.isArray(parsed) ? parsed : []
 } catch {
  return []
 }
}

const assertDelta = (label, before, after) => {
 if (after <= before) {
  throw new Error(`${label} did not increase: before=${before} after=${after}`)
 }
}

const assertDeltaAtLeast = (label, before, after, minimum) => {
 const delta = after - before
 if (delta < minimum) {
  throw new Error(`${label} did not increase by ${minimum}: before=${before} after=${after}`)
 }
}

const readBrainSignalsCount = async (page) =>
 page.evaluate(async () => {
  const db = await new Promise((resolve, reject) => {
   const request = indexedDB.open("ViewTubeBrainDB", 2)
   request.onsuccess = () => resolve(request.result)
   request.onerror = () => reject(request.error)
  })
  if (!db.objectStoreNames.contains("brain_signals")) {
   db.close()
   return 0
  }
  const count = await new Promise((resolve, reject) => {
   const tx = db.transaction("brain_signals", "readonly")
   const request = tx.objectStore("brain_signals").count()
   request.onsuccess = () => resolve(request.result)
   request.onerror = () => reject(request.error)
  })
  db.close()
  return count
 })

const readSnapshot = async (page) => {
 const data = await page.evaluate((keys) => {
  const pick = (key) => localStorage.getItem(key)
  return {
   generationsRaw: pick(keys.generations),
   vaultRaw: pick(keys.vault),
   workflowsRaw: pick(keys.workflows),
   experimentsRaw: pick(keys.experiments),
   brainActionsRaw: pick(keys.brainActions),
  }
 }, storageKeys)
 const workflowRecords = readJson(data.workflowsRaw)
  return {
   generations: readJson(data.generationsRaw).length,
   vault: readJson(data.vaultRaw).length,
   workflows: workflowRecords.length,
   workflowRecords,
   experiments: readJson(data.experimentsRaw).length,
   brainActions: readJson(data.brainActionsRaw).length,
   signals: await readBrainSignalsCount(page),
  }
}

const clearSmokeState = async (page) => {
 await page.evaluate((keys) => {
  Object.values(keys).forEach((key) => localStorage.removeItem(key))
 }, storageKeys)
 await page.evaluate(async () => {
  await new Promise((resolve) => {
   const request = indexedDB.deleteDatabase("ViewTubeBrainDB")
   request.onsuccess = () => resolve()
   request.onerror = () => resolve()
   request.onblocked = () => resolve()
  })
 })
}

const launchBrowser = async () => {
 try {
  return await chromium.launch({ headless })
 } catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  if (!message.includes("Executable doesn't exist")) {
   throw error
  }
  const macChrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  try {
   return await chromium.launch({ executablePath: macChrome, headless })
  } catch {
   return chromium.launch({ channel: "chrome", headless })
  }
 }
}

const runPrototypeChecks = async (page) => {
 await page.goto(`${baseUrl}/data-transparency`, { waitUntil: "domcontentloaded" })
 await page.locator("[data-super-tool-builder-map]").waitFor({ timeout: 15000 })
 await page.getByText("Super-Tool Builder Map").first().waitFor({ timeout: 15000 })
 await page.getByText("Prototype Gallery").first().waitFor({ timeout: 15000 })
 await page.getByText("Creator Vault is supporting utility").first().waitFor({ timeout: 15000 })
 await page.getByText("VT_E1 editor-bound").first().waitFor({ timeout: 15000 })
 for (const label of builderMapLabels) {
  await page.getByText(label).first().waitFor({ timeout: 15000 })
 }
 console.log("PASS super-tool builder map")

 for (const route of prototypeRoutes) {
  const url = `${baseUrl}/data-transparency?internalTool=${route.id}`
  await page.goto(url, { waitUntil: "domcontentloaded" })
  await page.locator("[data-super-tool-builder-map]").waitFor({ timeout: 15000 })
  await page.locator(`[data-super-tool-clarity-card="${route.id}"]`).waitFor({ timeout: 15000 })
  await page.locator(`[data-super-tool-doc-links="${route.id}"]`).first().waitFor({ timeout: 15000 })
  await page.locator(`[data-super-tool-builder-map-section="${route.id}"]`).waitFor({ timeout: 15000 })
  await page.getByText("Builder Map").first().waitFor({ timeout: 15000 })
  await page.getByText("Prototype Gallery").first().waitFor({ timeout: 15000 })
  await page.getByText("Canonical Docs").first().waitFor({ timeout: 15000 })
  await page.getByText("Portfolio Plan").first().waitFor({ timeout: 15000 })
  await page.getByText("Tool Plan").first().waitFor({ timeout: 15000 })
  await page.getByText("Overlap/Synthesis").first().waitFor({ timeout: 15000 })
  await page.getByText("Prototype available here").first().waitFor({ timeout: 15000 })
  const prototype = page.locator(`[data-super-tool-prototype="${route.id}"][data-prototype-layout="toolbox-shell"]`)
  await prototype.waitFor({ timeout: 15000 })
  const prototypeText = await prototype.innerText()
  const forbiddenCopy = forbiddenPrototypeCopy.filter((copy) => prototypeText.includes(copy))
  if (forbiddenCopy.length) {
   throw new Error(`${route.id} prototype still contains planning copy: ${forbiddenCopy.join(", ")}`)
  }
  const forbiddenPattern = forbiddenPrototypePatterns.find((pattern) => pattern.test(prototypeText))
  if (forbiddenPattern) {
   throw new Error(`${route.id} prototype still matches planning-copy pattern: ${forbiddenPattern}`)
  }
  const desktopMetrics = await prototype.evaluate((element) => {
   const rect = element.getBoundingClientRect()
   return {
    width: rect.width,
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
   }
  })
  if (desktopMetrics.width < 1000) {
   throw new Error(`${route.id} prototype is not full-width at desktop: width=${desktopMetrics.width}`)
  }
  const allowsIntentionalHorizontalScroll = route.id === "project-command-kanban" || route.id === "shorts-extraction-studio"
  if (!allowsIntentionalHorizontalScroll && desktopMetrics.scrollWidth - desktopMetrics.clientWidth > 8) {
   throw new Error(`${route.id} prototype has internal desktop horizontal overflow`)
  }
  const brokenImageCount = await prototype.locator("img").evaluateAll((images) =>
   images.filter((image) => image instanceof HTMLImageElement && image.complete && image.naturalWidth === 0).length,
  )
  if (brokenImageCount > 0) {
   throw new Error(`${route.id} prototype has ${brokenImageCount} broken image(s)`)
  }
  await page.getByText(route.title).first().waitFor({ timeout: 15000 })
  for (const label of route.labels) {
   await page.getByText(label).first().waitFor({ timeout: 15000 })
  }
  console.log(`PASS prototype ${route.id}`)
 }

 await page.setViewportSize({ width: 375, height: 900 })
 for (const route of prototypeRoutes) {
  const url = `${baseUrl}/data-transparency?internalTool=${route.id}`
  await page.goto(url, { waitUntil: "domcontentloaded" })
  const prototype = page.locator(`[data-super-tool-prototype="${route.id}"][data-prototype-layout="toolbox-shell"]`)
  await prototype.waitFor({ timeout: 15000 })
  const mobileMetrics = await prototype.evaluate((element) => ({
   clientWidth: element.clientWidth,
   scrollWidth: element.scrollWidth,
  }))
  if (mobileMetrics.clientWidth < 300) {
   throw new Error(`${route.id} prototype is too narrow on mobile: width=${mobileMetrics.clientWidth}`)
  }
  const allowsIntentionalHorizontalScroll = route.id === "project-command-kanban" || route.id === "shorts-extraction-studio"
  if (!allowsIntentionalHorizontalScroll && mobileMetrics.scrollWidth - mobileMetrics.clientWidth > 8) {
   throw new Error(`${route.id} prototype has internal mobile horizontal overflow`)
  }
  console.log(`PASS prototype mobile ${route.id}`)
 }
 await page.setViewportSize({ width: 1440, height: 1100 })

 await page.goto(`${baseUrl}/data-transparency?internalTool=project-command-kanban`, { waitUntil: "domcontentloaded" })
 await page.locator('[data-super-tool-prototype="project-command-kanban"][data-prototype-layout="toolbox-shell"]').waitFor({ timeout: 15000 })
 await page.getByText(/Selected: Sponsor launch sprint/i).waitFor({ timeout: 10000 })
 await page.getByRole("button", { name: /Move Right/i }).click()
 await page.getByText(/Lane: In Progress/i).waitFor({ timeout: 10000 })
 await page.getByRole("button", { name: /Mark Blocked/i }).click()
 await page.getByText(/Lane: Blocked/i).waitFor({ timeout: 10000 })
 await page.getByRole("button", { name: /Mark Launch Ready/i }).click()
 await page.getByText(/Lane: Launch Ready/i).waitFor({ timeout: 10000 })
 console.log("PASS prototype project-command-kanban movement")
}

const run = async () => {
 const browser = await launchBrowser()
 const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } })
 const failures = []
 const consoleErrors = []
 page.on("pageerror", (error) => failures.push(`pageerror: ${error.message}`))
 page.on("console", (message) => {
  if (message.type() === "error") {
   consoleErrors.push(message.text())
  }
 })

 await page.goto(`${baseUrl}/data-transparency?internalTool=creator-canvas-os`, { waitUntil: "domcontentloaded" })
 await clearSmokeState(page)

 await runPrototypeChecks(page)

 for (const route of routes) {
  const url = `${baseUrl}/data-transparency?internalTool=${route.id}`
  await page.goto(url, { waitUntil: "domcontentloaded" })
  await page.getByText(route.toolboxText).first().waitFor({ timeout: 15000 })
  await page.getByText(route.moduleText).first().waitFor({ timeout: 15000 })
  await page.getByText(/Builder Evidence|Agent Self-Improvement Loop/i).first().waitFor({ timeout: 15000 })
  await page.getByRole("button", { name: new RegExp(route.actionText, "i") }).first().waitFor({ timeout: 15000 })
  const before = await readSnapshot(page)
  await route.run(page)
  await page.waitForTimeout(300)
  const after = await readSnapshot(page)
  route.verify({ before, after, signals: after.signals })
  console.log(`PASS ${route.id}`)
 }

 await browser.close()

 if (failures.length || consoleErrors.length) {
  console.error([...failures, ...consoleErrors].join("\n"))
  process.exit(1)
 }
}

run().catch((error) => {
 console.error(error)
 process.exit(1)
})
