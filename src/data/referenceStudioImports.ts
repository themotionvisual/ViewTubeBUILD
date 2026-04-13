export interface ReferenceStudioImportPack {
  id: string;
  label: string;
  addedOn: string;
  source: string;
  totalFiles: number;
  uiComponentFiles: number;
  variantFiles: number;
  path: string;
  highlights: string[];
}

export interface CurationPick {
  category: string;
  chosen: string;
  source: "Reference Studio" | "b_n4 style pack" | "claudeui";
  status: "integrated" | "queued";
}

export interface ToolboxCoverageItem {
  tool: string;
  baselineComponent: string;
  status: "integrated" | "queued";
}

export const referenceStudioImportPacks: ReferenceStudioImportPack[] = [
  {
    id: "b_n4S0QgDB6zU-1774607113118",
    label: "b_n4 Neo-Brutalist System Pack",
    addedOn: "2026-03-27",
    source: "/reference-studio-data/imports/b_n4S0QgDB6zU-1774607113118.zip",
    totalFiles: 87,
    uiComponentFiles: 57,
    variantFiles: 4,
    path: "/reference-studio-data/imports/b_n4S0QgDB6zU-1774607113118/app/page.tsx",
    highlights: [
      "comprehensive UI primitives",
      "neo-brutalist chart and interaction variants",
      "dark/light icon treatment references"
    ]
  }
];

export const externalStyleReferences = [
  {
    id: "claudeui",
    label: "Claude UI Style Reference",
    path: "/claudeui.html",
    note: "Use as visual benchmark for spacing rhythm, contrast, and glow cadence."
  }
];

export const curatedTopPicks: CurationPick[] = [
  { category: "Primary Button", chosen: "components/ui/button.tsx", source: "b_n4 style pack", status: "integrated" },
  { category: "Card Container", chosen: "components/ui/card.tsx", source: "b_n4 style pack", status: "integrated" },
  { category: "Data Table Shell", chosen: "Deep Data Hierarchy (Section E)", source: "Reference Studio", status: "integrated" },
  { category: "Chart Language", chosen: "Graph & Chart Sandbox + neo-brutalist/charts.tsx", source: "b_n4 style pack", status: "integrated" },
  { category: "Modal System", chosen: "Dialogue & Pop-out Engine", source: "Reference Studio", status: "integrated" },
  { category: "Inputs + Search", chosen: "Input & Text Foundry", source: "Reference Studio", status: "integrated" },
  { category: "Sidebar/Navigation", chosen: "components/ui/sidebar.tsx", source: "b_n4 style pack", status: "queued" },
  { category: "Dark Glow Treatment", chosen: "claudeui.html glow behavior", source: "claudeui", status: "integrated" }
];

export const toolboxBaselineCoverage: ToolboxCoverageItem[] = [
  { tool: "Dashboard", baselineComponent: "Realtime Views panel + metric cards", status: "integrated" },
  { tool: "Strategy (Projects)", baselineComponent: "Dashboard Widget Array cards", status: "integrated" },
  { tool: "Studio Hub", baselineComponent: "Input & Text Foundry + Dialogue Engine", status: "integrated" },
  { tool: "Shorts Studio", baselineComponent: "Viral Predictor stat pills", status: "queued" },
  { tool: "Performance Hub", baselineComponent: "Analytics Protocol + Retention Pulse", status: "integrated" },
  { tool: "Vault", baselineComponent: "Asset Vault grid card", status: "integrated" },
  { tool: "System Settings", baselineComponent: "System Status toggle cards", status: "integrated" },
  { tool: "Reference Studio", baselineComponent: "Section C + Section E master modules", status: "integrated" }
];
