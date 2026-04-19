import React from "react"
import { Routes, Route, Navigate } from "react-router-dom"

import Dashboard from "../views/Dashboard"
import DashboardLegacy from "../views/DashboardLegacy"
import StudioHub from "../views/StudioHub"
import PerformanceHub from "../views/PerformanceHub"
import Channelytics from "../views/Channelytics"
import ResearchLab from "../views/ResearchLab"
import DataVisualizations from "../views/DataVizualizations"
import Settings from "../views/Settings"
import ReferenceStudio from "../views/ReferenceStudio"
import ReferenceStudioIsolated from "../views/ReferenceStudioIsolated"
import ReferenceStudioV2 from "../views/ReferenceStudioV2"
import Stuff from "../views/Stuff"
import SourcesLabView from "../views/SourcesLabView"
import ComponentCatalogView from "../views/ComponentCatalogView"
import ComponentGridView from "../views/ComponentGridView"
import BenchExplorer from "../views/bench/BenchExplorer"
import StandaloneBench from "../views/bench/StandaloneBench"
import { ShortsStudio } from "../views/ShortsStudio"
import ProjectCalendarPage from "../views/ProjectCalendarPage"
import ChartsGalleryHome from "../views/ChartsGallery/ChartsGalleryHome"
import MasterGraphsPage from "../views/ChartsGallery/MasterGraphsPage"
import ToolboxPreviewPage from "../views/ChartsGallery/ToolboxPreviewPage"
import DataTransparencyCenter from "../views/DataTransparencyCenter"
import InternalAnalyticsPanel from "../views/InternalAnalyticsPanel"

const Placeholder = ({ title }: { title: string }) => (
 <div className="flex items-center justify-center h-full">
  <div className="pop-box p-10 text-4xl font-black uppercase tracking-tighter shadow-[10px_10px_0px_0px_black]">
   {title} Initializing...
  </div>
 </div>
)

export const AppRoutes: React.FC = () => {
 return (
  <Routes>
   <Route path="/" element={<Dashboard />} />
   <Route path="/dashboard-legacy" element={<DashboardLegacy />} />
   <Route path="/studio" element={<StudioHub />} />
   <Route path="/performance" element={<PerformanceHub />} />
   <Route path="/legacy/channelytics" element={<Channelytics />} />
   <Route path="/legacy/research-lab" element={<ResearchLab />} />
   <Route path="/legacy/data-vizualizations" element={<DataVisualizations />} />
   <Route path="/studio/internal-analytics" element={<InternalAnalyticsPanel />} />
   <Route path="/settings" element={<Settings />} />
   <Route path="/data-transparency" element={<DataTransparencyCenter />} />

   <Route path="/shorts" element={<ShortsStudio />} />
   <Route path="/project-calendar" element={<ProjectCalendarPage />} />
   <Route
    path="/reference-studio"
    element={<Navigate to="/reference-studio/toolbox-system" replace />}
   />
   <Route path="/reference-studio/:tabId" element={<ReferenceStudio />} />
   <Route path="/reference-studio-v2" element={<ReferenceStudioV2 />} />
   <Route
    path="/stuff"
    element={<Navigate to="/stuff/sources-lab" replace />}
   />
   <Route path="/stuff/:tabId" element={<Stuff />} />
   <Route path="/sources-lab" element={<SourcesLabView />} />
   <Route path="/component-catalog" element={<ComponentCatalogView />} />
   <Route path="/component-grid" element={<ComponentGridView />} />
   <Route path="/bench/:benchId" element={<BenchExplorer />} />
   <Route
    path="/render-bench/reference-studio"
    element={<Navigate to="/render-bench/reference-studio/toolbox-system" replace />}
   />
   <Route path="/render-bench/reference-studio/:tabId" element={<ReferenceStudio />} />
   <Route path="/render-bench/:benchId" element={<StandaloneBench />} />
   <Route path="/user-guide" element={<Placeholder title="User Guide" />} />

   {/* Charts Gallery Routes */}
   <Route path="/charts-gallery" element={<ChartsGalleryHome />} />
   <Route path="/charts-gallery/master-graphs" element={<MasterGraphsPage />} />
   <Route
    path="/charts-gallery/toolbox-preview"
    element={<ToolboxPreviewPage />}
   />
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
   <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
 )
}
