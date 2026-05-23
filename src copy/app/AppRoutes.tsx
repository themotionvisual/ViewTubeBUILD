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
import ResearchLabToolbox from "../views/ResearchLabToolbox"
import BenchExplorer from "../views/bench/BenchExplorer"
import StandaloneBench from "../views/bench/StandaloneBench"
import EditorV1Page from "../views/EditorV1Page"
import ProjectCalendarPage from "../views/ProjectCalendarPage"
import DataTransparencyCenter from "../views/DataTransparencyCenter"
import InternalAnalyticsPanel from "../views/InternalAnalyticsPanel"
import SimpleAnalytics from "../views/SimpleAnalytics"
import MediaAnalyzer from "../views/MediaAnalyzer"
import SeoGenerator from "../views/SeoGenerator"
import VideoPublisher from "../views/VideoPublisher"
import HookGenerator from "../views/HookGenerator"
import AlgorithmArchitect from "../views/AlgorithmArchitect"
import StoryboardStudio from "../views/StoryboardStudio"
import { ComponentGridLab } from "../components/ComponentGridLab"
import GraphsPage from "../views/GraphsPage"
import GraphsShortsRetentionPage from "../views/GraphsShortsRetentionPage"
import UserGuide from "../views/UserGuide"
import ComponentAudit from "../views/debug/ComponentAudit"
import Subscribe from "../views/Subscribe"

export const AppRoutes: React.FC = () => {
 return (
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
   <Route path="/settings" element={<Settings />} />
   <Route path="/subscribe" element={<Subscribe />} />
   <Route path="/data-transparency" element={<DataTransparencyCenter />} />

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
   <Route path="/algorithm-architect" element={<AlgorithmArchitect />} />
   <Route path="/storyboard-studio" element={<StoryboardStudio />} />
   <Route path="/component-grid-lab" element={<ComponentGridLab />} />
   <Route path="/audit" element={<ComponentAudit />} />

   <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
 )
}
