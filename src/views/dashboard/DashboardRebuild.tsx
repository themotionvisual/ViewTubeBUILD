import React from "react"
import { useNavigate } from "react-router-dom"
import { DashboardCanvas } from "./DashboardCanvas"
import { useDashboardData } from "./useDashboardData"
import { recordDiagnostic } from "../../services/diagnostics"

// Module-scope marker — tells us when DashboardRebuild's own chunk loaded,
// distinct from parent Dashboard. Bisects the download-waterfall from
// Dashboard → DashboardRebuild → DashboardCanvas.
recordDiagnostic("info", "boot-timing", "DashboardRebuild module executed")

// Module-scoped render counter — tracks how many times DashboardRebuild
// renders (not just first-mount). If this spirals, the storm is real and
// its cadence tells us what setState is hammering the tree.
let renderCount = 0
let firstRenderTs: number | null = null

const DashboardRebuild: React.FC = () => {
  const navigate = useNavigate()
  const before = typeof performance !== "undefined" ? performance.now() : Date.now()
  const data = useDashboardData()
  const after = typeof performance !== "undefined" ? performance.now() : Date.now()
  const cost = Math.round(after - before)
  renderCount += 1
  if (firstRenderTs === null) firstRenderTs = before
  // Record milestones so we can eyeball the storm cadence from a screenshot:
  // render 1, 10, 50, 100, 500, 1000. The recordDiagnostic dedup collapses
  // repeated identical entries so we don't drown the buffer.
  if (renderCount === 1 || renderCount === 10 || renderCount === 50
      || renderCount === 100 || renderCount === 500 || renderCount === 1000) {
    const elapsed = Math.round(after - (firstRenderTs ?? after))
    recordDiagnostic("warn", "render-storm", `DashboardRebuild render #${renderCount} (${elapsed}ms since first)`)
  }
  // First-render cost of useDashboardData
  React.useEffect(() => {
    recordDiagnostic("info", "boot-timing", `useDashboardData first-run ${cost}ms`)
  }, [cost])
  return <DashboardCanvas data={data} onNavigate={(to) => navigate(to)} />
}

export default DashboardRebuild
