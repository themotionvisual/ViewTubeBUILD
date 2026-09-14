export const SUBTOOLBOX_RECIPES = {
  form: { description: "Labeled fields with one primary action", status: "ready" },
  editor: { description: "Large editable surface with supporting controls", status: "ready" },
  preview: { description: "Read-only output with copy/export actions", status: "ready" },
  list: { description: "Bounded selectable rows with explicit empty state", status: "ready" },
  upload: { description: "File target, progress and replace/remove actions", status: "prototype" },
  analytics: { description: "Chart, context, legend and insight regions", status: "migrating" },
  command: { description: "Status, approvals, primary action and run log", status: "prototype" },
} as const

export type SubToolboxRecipe = keyof typeof SUBTOOLBOX_RECIPES

export const SUBTOOLBOX_MIGRATION_WAVES = [
  { id: 1, status: "complete", surfaces: ["ThumbnailStudio", "CommunityPostGenerator"] },
  { id: 2, status: "complete", surfaces: ["VideoManager", "VideoPublisher"] },
  { id: 3, status: "planned", surfaces: ["ScriptArchitect", "ActionableTactics", "MediaAnalyzer"] },
  { id: 4, status: "planned", surfaces: ["ProjectStudio", "StoryboardStudio"] },
  { id: 5, status: "planned", surfaces: ["SubToolboxChartModule", "SystemStatisticsSubToolbox", "remaining-consumers"] },
] as const
