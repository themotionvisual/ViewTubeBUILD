import React from "react"
import { Routes, Route, Navigate } from "react-router-dom"

import { lazyRoute, RouteSuspense } from "./lazyRoute"

// `lazyRoute` = `React.lazy` + one retry on chunk-load failure + a single
// hard-reload backstop when the retry also fails (usually a stale
// cached index.html after a Vercel deploy). This keeps the app from
// hanging on the Suspense spinner when the JS chunks the browser expects
// are no longer on the CDN.
const lazy = lazyRoute

// Dashboard was the only eagerly-imported route — pulling DashboardRebuild,
// WidgetRenderer (1292 lines), and all widget deps into the entry chunk.
// Lazy-loading it keeps ~200KB+ out of the critical path on mobile.
const Dashboard = lazy(() => import("../views/Dashboard"))

// Route-level code splitting: every top-level view is loaded on demand so the
// initial bundle only contains the shell + the first route the user lands on.
// This keeps the multi-thousand-line views (ResearchLab, PerformanceHub,
// GraphsPageCharts, ToolboxUISystem, ...) and their heavy chart/AI deps out of
// the critical path until they are actually navigated to.
const DashboardLegacy = lazy(() => import("../views/DashboardLegacy"))
const StudioHub = lazy(() => import("../views/StudioHub"))
const PerformanceHub = lazy(() => import("../views/PerformanceHub"))
const Channelytics = lazy(() => import("../views/Channelytics"))
const ResearchLab = lazy(() => import("../views/ResearchLab"))
const DataVisualizations = lazy(() => import("../views/DataVizualizations"))
const Settings = lazy(() => import("../views/Settings"))
const ReferenceStudio = lazy(() => import("../views/ReferenceStudio"))
const ResearchLabToolbox = lazy(() => import("../views/ResearchLabToolbox"))
const BenchExplorer = lazy(() => import("../views/bench/BenchExplorer"))
const StandaloneBench = lazy(() => import("../views/bench/StandaloneBench"))
const EditorV1Page = lazy(() => import("../views/EditorV1Page"))
const ProjectCalendarPage = lazy(() => import("../views/ProjectCalendarPage"))
const DataTransparencyCenter = lazy(() => import("../views/DataTransparencyCenter"))
const InternalAnalyticsPanel = lazy(() => import("../views/InternalAnalyticsPanel"))
const SimpleAnalytics = lazy(() => import("../views/SimpleAnalytics"))
const MediaAnalyzer = lazy(() => import("../views/MediaAnalyzer"))
const SeoGenerator = lazy(() => import("../views/SeoGenerator"))
const VideoPublisher = lazy(() => import("../views/VideoPublisher"))
const HookGenerator = lazy(() => import("../views/HookGenerator"))
const StoryboardStudio = lazy(() => import("../views/StoryboardStudio"))
const ComponentGridLab = lazy(() =>
 import("../components/ComponentGridLab").then((m) => ({ default: m.ComponentGridLab })),
)
const GraphsPage = lazy(() => import("../views/GraphsPage"))
const GraphsShortsRetentionPage = lazy(() => import("../views/GraphsShortsRetentionPage"))
const UserGuide = lazy(() => import("../views/UserGuide"))
const About = lazy(() => import("../views/About"))
const ComponentAudit = lazy(() => import("../views/debug/ComponentAudit"))
const Subscribe = lazy(() => import("../views/Subscribe"))
const VtSyncLocalAnalyticsPage = lazy(
 () => import("../features/vt-sync-local/shell/VtSyncLocalAnalyticsPage"),
)
const AIBrainCommandInterface = lazy(() => import("../views/AIBrainCommandInterface"))
const AccountConnectPage = lazy(() => import("../views/AccountConnectPage"))

export const AppRoutes: React.FC = () => {
 return (
  <RouteSuspense>
   <Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/dashboard-legacy" element={<DashboardLegacy />} />
    <Route path="/studio" element={<StudioHub />} />
    <Route path="/performance" element={<PerformanceHub />} />
    <Route path="/legacy/channelytics" element={<Channelytics />} />
    <Route path="/legacy/research-lab" element={<ResearchLab />} />
    <Route path="/research-lab" element={<ResearchLabToolbox />} />
    <Route path="/graphs" element={<GraphsPage />} />
    <Route path="/graphs/shorts-retention" element={<GraphsShortsRetentionPage />} />
    <Route path="/legacy/data-vizualizations" element={<DataVisualizations />} />
    <Route path="/studio/internal-analytics" element={<InternalAnalyticsPanel />} />
    <Route path="/account" element={<Settings />} />
    <Route path="/account/connect" element={<AccountConnectPage />} />
    <Route path="/settings" element={<Settings />} />
    <Route path="/subscribe" element={<Subscribe />} />
    <Route path="/data-transparency" element={<DataTransparencyCenter />} />
    <Route path="/ai-brain" element={<AIBrainCommandInterface />} />
    <Route path="/local-analytics" element={<VtSyncLocalAnalyticsPage />} />
    <Route path="/analytics" element={<VtSyncLocalAnalyticsPage />} />
    <Route path="/vt-sync-local" element={<VtSyncLocalAnalyticsPage />} />

    <Route path="/shorts" element={<Navigate to="/editor" replace />} />
    <Route path="/editor" element={<EditorV1Page />} />
    <Route path="/editor-v1" element={<Navigate to="/editor" replace />} />
    <Route path="/internal/editor-v1-legacy" element={<Navigate to="/editor" replace />} />
    <Route path="/internal/editor-dev" element={<Navigate to="/editor" replace />} />
    <Route path="/projects" element={<ProjectCalendarPage />} />
    <Route path="/project-calendar" element={<ProjectCalendarPage />} />
    <Route
     path="/reference-studio"
     element={<Navigate to="/reference-studio/toolbox-system" replace />}
    />
    <Route path="/reference-studio/:tabId" element={<ReferenceStudio />} />
    <Route path="/reference-studio-v2" element={<Navigate to="/reference-studio/charts-gallery" replace />} />
    <Route path="/stuff" element={<Navigate to="/reference-studio/stuff" replace />} />
    <Route path="/stuff/:tabId" element={<Navigate to="/reference-studio/stuff" replace />} />
    <Route path="/sources-lab" element={<Navigate to="/reference-studio/stuff" replace />} />
    <Route path="/component-catalog" element={<Navigate to="/reference-studio/component-catalog" replace />} />
    <Route path="/component-grid" element={<Navigate to="/reference-studio/component-grid" replace />} />
    <Route path="/bench/:benchId" element={<BenchExplorer />} />
    <Route
     path="/render-bench/reference-studio"
     element={<Navigate to="/render-bench/reference-studio/toolbox-system" replace />}
    />
    <Route path="/render-bench/reference-studio/:tabId" element={<ReferenceStudio />} />
    <Route path="/render-bench/:benchId" element={<StandaloneBench />} />
    <Route path="/user-guide" element={<UserGuide />} />
    <Route path="/about" element={<About />} />

    {/* Charts Gallery aliases -> Reference Studio */}
    <Route path="/charts-gallery" element={<Navigate to="/reference-studio/charts-gallery" replace />} />
    <Route path="/charts-gallery/master-graphs" element={<Navigate to="/reference-studio/charts-master" replace />} />
    <Route path="/charts-gallery/toolbox-preview" element={<Navigate to="/reference-studio/charts-toolbox-preview" replace />} />
    <Route
     path="/charts-gallery/research-lab"
     element={<Navigate to="/legacy/research-lab" replace />}
    />
    <Route
     path="/charts-gallery/performance-hub"
     element={<Navigate to="/performance" replace />}
    />
    <Route
     path="/charts-gallery/channelytics"
     element={<Navigate to="/legacy/channelytics" replace />}
    />
    <Route
     path="/charts-gallery/data-viz"
     element={<Navigate to="/legacy/data-vizualizations" replace />}
    />
    <Route
     path="/charts-gallery/kpi"
     element={<Navigate to="/studio/internal-analytics" replace />}
    />

    <Route path="/video-manager" element={<Navigate to="/studio" replace />} />
    <Route path="/strategy" element={<Navigate to="/studio" replace />} />
    <Route
     path="/vault"
     element={<Navigate to="/reference-studio/toolbox-system" replace />}
    />

    {/* Hidden Routes - Access by typing URL directly */}
    <Route path="/simple-analytics" element={<SimpleAnalytics />} />
    <Route path="/media-analyzer" element={<MediaAnalyzer />} />
    <Route path="/seo-generator" element={<SeoGenerator />} />
    <Route path="/video-publisher" element={<VideoPublisher />} />
    <Route path="/hook-generator" element={<HookGenerator />} />
    <Route path="/thumbnail-studio" element={<Navigate to="/reference-studio/thumbnail-studio" replace />} />
    {/* Algorithm Architect is now an evidence-backed mode of the Brain, not a
        separate page. The component still exists for Reference Studio / bench. */}
    <Route path="/algorithm-architect" element={<Navigate to="/ai-brain?ask=algorithm-diagnosis" replace />} />
    <Route path="/storyboard-studio" element={<StoryboardStudio />} />
    <Route path="/component-grid-lab" element={<ComponentGridLab />} />
    <Route path="/audit" element={<ComponentAudit />} />

    <Route path="*" element={<Navigate to="/" replace />} />
   </Routes>
  </RouteSuspense>
 )
}
