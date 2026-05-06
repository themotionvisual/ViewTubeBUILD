import React from 'react';

// Lazy imports for the benches
const ToolboxUISystem = React.lazy(() => import('../../components/ToolboxUISystem'));
const WidgetLabV2 = React.lazy(() => import('../referenceStudio/WidgetLabV2'));
const ChartCatalogV2 = React.lazy(() => import('../referenceStudio/ChartCatalogV2'));
const ChartSpecImplementationV2 = React.lazy(() => import('../referenceStudio/ChartSpecImplementationV2'));

const ToolboxRecreation = React.lazy(() => import('../referenceStudio/ToolboxRecreation'));
const ComponentCatalog = React.lazy(() => import('../referenceStudio/ComponentCatalog'));
const NativeUIKit = React.lazy(() => import('../../components/NativeUIKit'));
const AnalyticsHubBench = React.lazy(() => import('./AnalyticsHubBench'));
const ThumbnailStudio = React.lazy(() => import('../ThumbnailStudio'));
const AlgorithmArchitect = React.lazy(() => import('../AlgorithmArchitect'));
const StoryboardStudio = React.lazy(() => import('../StoryboardStudio'));
const LegacyStudio = React.lazy(() => import('../ReferenceStudio'));

export type BenchTag = 'UI' | 'WIDGET' | 'CHART' | 'ANALYTICS' | 'LAB' | 'SOURCE';

export interface BenchEntry {
  id: string;
  title: string;
  subtitle: string;
  tag: BenchTag;
  color: string;
  render: () => React.ReactNode;
}

export const BENCH_REGISTRY: BenchEntry[] = [
  {
    id: 'ui-system',
    title: 'Toolbox UI System',
    subtitle: 'Canonical reference for borders, shadows, and animations',
    tag: 'UI',
    color: 'bg-[#24D3FF]',
    render: () => React.createElement(ToolboxUISystem, { mode: 'ui-system' })
  },
  {
    id: 'component-grid',
    title: 'Component Grid',
    subtitle: 'Modular reference grid for layout testing',
    tag: 'UI',
    color: 'bg-[#FF3399]',
    render: () => React.createElement(ToolboxUISystem, { mode: 'component-grid' })
  },
  {
    id: 'component-catalog',
    title: 'Component Catalog',
    subtitle: 'Central index of all reusable Studio components',
    tag: 'UI',
    color: 'bg-[#CCFF00]',
    render: () => React.createElement(ComponentCatalog)
  },
  {
    id: 'widget-pipeline',
    title: 'Widget Pipeline',
    subtitle: 'Traceability and processing for atomic widget creation',
    tag: 'WIDGET',
    color: 'bg-[#B14AED]',
    render: () => React.createElement(WidgetLabV2)
  },
  {
    id: 'analytics-hub',
    title: 'Analytics Hub',
    subtitle: 'Consolidated high-density 28d performance dashboard',
    tag: 'ANALYTICS',
    color: 'bg-[#FFE357]',
    render: () => React.createElement(AnalyticsHubBench)
  },
  {
    id: 'chart-catalog',
    title: 'Chart Catalog',
    subtitle: 'Standardized visualization library with 28d binding',
    tag: 'CHART',
    color: 'bg-[#00CCFF]',
    render: () => React.createElement(ChartCatalogV2)
  },
  {
    id: 'chart-spec',
    title: 'Chart Spec Bench',
    subtitle: 'Class-based rendering tests and coverage tracking',
    tag: 'CHART',
    color: 'bg-[#FFE357]',
    render: () => React.createElement(ChartSpecImplementationV2)
  },
  {
    id: 'toolbox-recreation',
    title: 'Toolbox Recreation',
    subtitle: 'Experimental sandbox for rebuilding complex compositions',
    tag: 'LAB',
    color: 'bg-[#FF7497]',
    render: () => React.createElement(ToolboxRecreation)
  },
  {
    id: 'native-ui-kit',
    title: 'Native UI Kit',
    subtitle: 'Legacy component kit rendered in the V2 shell',
    tag: 'LAB',
    color: 'bg-[#CCFF00]',
    render: () => React.createElement(NativeUIKit)
  },
  {
    id: 'thumbnail-studio',
    title: 'Thumbnail Studio',
    subtitle: 'Niche-anchored image generation and analysis workbench',
    tag: 'LAB',
    color: 'bg-[#FFE357]',
    render: () => React.createElement(ThumbnailStudio)
  },
  {
    id: 'algorithm-architect',
    title: 'Algorithm Architect',
    subtitle: 'High-fidelity strategy diagnosis and performance roadmap',
    tag: 'LAB',
    color: 'bg-[#CCFF00]',
    render: () => React.createElement(AlgorithmArchitect)
  },
  {
    id: 'storyboard-studio',
    title: 'Storyboard Studio',
    subtitle: 'Scene-based script and visual pipeline with AI sync',
    tag: 'LAB',
    color: 'bg-[#FFB158]',
    render: () => React.createElement(StoryboardStudio)
  },
  {
    id: 'legacy-tools',
    title: 'Legacy Studio',
    subtitle: 'Original tabbed studio preserved in hardware isolation',
    tag: 'LAB',
    color: 'bg-[#FF7497]',
    render: () => React.createElement(LegacyStudio)
  }
];
