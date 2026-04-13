import React from "react"
import { Routes, Route, Navigate } from "react-router-dom"

import Dashboard from "../views/Dashboard"
import StudioHub from "../views/StudioHub"
import PerformanceHub from "../views/PerformanceHub"
import Settings from "../views/Settings"
import ReferenceStudio from "../views/ReferenceStudio"
import ReferenceStudioV2 from "../views/ReferenceStudioV2"
import SourcesLabView from "../views/SourcesLabView"
import ComponentCatalogView from "../views/ComponentCatalogView"
import ComponentGridView from "../views/ComponentGridView"
import BenchExplorer from "../views/bench/BenchExplorer"
import StandaloneBench from "../views/bench/StandaloneBench"
import { ShortsStudio } from "../views/ShortsStudio"
import ProjectCalendarPage from "../views/ProjectCalendarPage"
import ChartsGalleryHome from "../views/ChartsGallery/ChartsGalleryHome"
import MasterGraphsPage from "../views/ChartsGallery/MasterGraphsPage"
import Projects from "../views/Projects"
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
   <Route path="/studio" element={<StudioHub />} />
   <Route path="/performance" element={<PerformanceHub />} />
   <Route path="/analytics" element={<InternalAnalyticsPanel />} />
   <Route path="/studio/internal-analytics" element={<InternalAnalyticsPanel />} />
   <Route path="/projects" element={<Projects />} />
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
   <Route path="/sources-lab" element={<SourcesLabView />} />
   <Route path="/component-catalog" element={<ComponentCatalogView />} />
   <Route path="/component-grid" element={<ComponentGridView />} />
   <Route path="/bench/:benchId" element={<BenchExplorer />} />
   <Route path="/render-bench/:benchId" element={<StandaloneBench />} />
   <Route path="/user-guide" element={<Placeholder title="User Guide" />} />

   {/* Charts Gallery Routes */}
   <Route path="/charts-gallery" element={<ChartsGalleryHome />} />
   <Route path="/charts-gallery/master-graphs" element={<MasterGraphsPage />} />

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
