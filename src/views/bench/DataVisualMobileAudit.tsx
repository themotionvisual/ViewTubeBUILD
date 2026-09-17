import React from "react"
import {
 DATA_VISUAL_MODULE_CONTRACTS,
 type RegisteredDataVisualModuleId,
} from "../../components/dataVisualModuleContract"
import {
 EngagementLinesModule,
 ShortsRetentionWidgetModule,
 TrafficSourceEvolutionModule,
} from "../../components/GraphsPageCharts"
import {
 TubeExplorerClockRadialBurst,
 TubeExplorerContentTreemap,
 TubeExplorerPublishOptimalClock,
 TubeExplorerThermalImaging,
 type TubeExplorerVisualProps,
} from "../../components/TubeExplorerVisualModules"
import { buildDataVisualAuditProps } from "./dataVisualAuditFixture"

/**
 * Deterministic audit bench for the migrated Data Visual modules.
 *
 * Mounted bare (no AppShell, no auth, no VT-Sync snapshot) at
 * `/render-bench/data-visual-audit` so `scripts/capture-data-visual-mobile-audit.mjs`
 * can screenshot every registered visual at the four target phone viewports and
 * assert the canvas contract against what the browser actually laid out.
 *
 * This is a lab route: it renders the production modules with fixture data, it
 * does not reimplement them.
 */

type AuditEntry = {
 id: RegisteredDataVisualModuleId
 title: string
 render: (props: TubeExplorerVisualProps) => React.ReactNode
}

const AUDIT_MODULES: AuditEntry[] = [
 { id: "shorts-retention", title: "Shorts Retention", render: (props) => <ShortsRetentionWidgetModule {...props} /> },
 { id: "publish-optimal-clock", title: "Publish Optimal Clock", render: (props) => <TubeExplorerPublishOptimalClock {...props} /> },
 { id: "clock-radial-burst", title: "Clock Radial Burst", render: (props) => <TubeExplorerClockRadialBurst {...props} /> },
 { id: "heat-matrix", title: "Heat Matrix", render: (props) => <TubeExplorerThermalImaging {...props} /> },
 { id: "content-treemap", title: "Content Treemap", render: (props) => <TubeExplorerContentTreemap {...props} /> },
 { id: "traffic-source-evolution", title: "Traffic Source Evolution", render: (props) => <TrafficSourceEvolutionModule {...props} /> },
 { id: "engagement-pulse", title: "Engagement Pulse", render: (props) => <EngagementLinesModule {...props} /> },
]

const DataVisualMobileAudit: React.FC = () => {
 const visualProps = React.useMemo(() => buildDataVisualAuditProps() as TubeExplorerVisualProps, [])

 // Publish the registered contracts so the audit harness asserts against the
 // same source of truth the renderers read, instead of keeping a second copy.
 React.useEffect(() => {
  ;(window as unknown as Record<string, unknown>).__VT_DATA_VISUAL_CONTRACTS__ = DATA_VISUAL_MODULE_CONTRACTS
 }, [])

 const only = new URLSearchParams(window.location.search).get("only")
 const entries = only ? AUDIT_MODULES.filter((entry) => entry.id === only) : AUDIT_MODULES

 return (
  <div
   /* Its own scroll container: `html, body, #root` are pinned to 100% height,
      so a module taller than the viewport would otherwise be unreachable —
      which is exactly the case this bench exists to photograph. */
   className="h-screen w-full min-w-0 max-w-full overflow-y-auto overflow-x-hidden bg-[#e5e5e5]"
   data-vt-data-visual-audit="root"
   data-vt-audit-module-count={entries.length}
  >
   <div className="mx-auto flex w-full min-w-0 max-w-[1450px] flex-col gap-4 px-3 py-4">
    {entries.map((entry) => {
     const contract = DATA_VISUAL_MODULE_CONTRACTS[entry.id]
     return (
      <section
       key={entry.id}
       data-vt-audit-visual={entry.id}
       data-vt-data-visual-module-root={entry.id}
       data-vt-audit-canvas-aspect={contract.canvasAspect}
       data-vt-audit-family={contract.family}
      >
       <h2 className="mb-1 text-[11px] font-black uppercase tracking-[0.14em] text-black/55">
        {entry.title} · {contract.family} · {contract.canvasAspect}
       </h2>
       {entry.render(visualProps)}
      </section>
     )
    })}
   </div>
  </div>
 )
}

export default DataVisualMobileAudit
