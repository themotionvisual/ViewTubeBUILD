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

export const TOOLBOX_COMPONENT_REGISTRY = [
  "primary-button", "secondary-button", "neutral-button", "destructive-button",
  "square-icon-button", "split-left-button", "head-tail-action", "split-left-dropdown",
  "standard-dropdown", "select-menu", "context-menu", "text-input", "textarea",
  "search-field", "number-field", "input-action", "stepper", "slider", "range-slider",
  "toggle", "settings-switch", "checkbox", "radio", "segmented-control", "button-group",
  "tag", "removable-tag", "selectable-tag", "tag-editor", "badge", "status-badge",
  "progress-bar", "progress-value", "kpi", "stat-card", "metric-strip", "tooltip",
  "popover", "disclosure", "divider", "horizontal-scrollbar", "data-stats-module",
  "disabled-button", "disabled-split-button", "upload-frame", "pagination",
  "vertical-scrollbar", "vault-asset-modules", "knob-dial", "controller-switch",
  "led-light", "alphabetical-spectrum-tags", "icon-rail-control",
  "field-label", "surface", "state-panel", "output-card", "metric", "link-button",
  "data-table", "color-picker", "media-card", "selectable-list-row", "reorderable-row",
  "tabs", "alert", "step-indicator", "dialog", "drawer", "calendar", "loader", "skeleton", "toast",
  "hover-card", "meter", "avatar", "name-value-list", "breadcrumb", "carousel", "command-palette",
] as const

export type ToolboxComponentFamily = (typeof TOOLBOX_COMPONENT_REGISTRY)[number]
export type ToolboxComponentLevel = "l0" | "l1" | "l2"
export type ToolboxComponentState =
  | "rest" | "hover" | "pressed" | "focus" | "open" | "selected"
  | "disabled" | "error" | "loading" | "disconnected"

export const TOOLBOX_COMPONENT_RULES = {
  levels: ["l0", "l1", "l2"] as const,
  compactLevelRetired: true,
  splitRailIsSquare: true,
  splitRailUsesLevelHeight: true,
  flatFamiliesHaveNoShadow: true,
  fieldsUseInwardFocus: true,
  topLevelMobileToolboxesAreFullWidth: true,
  featureComponentsMayNotRedefinePrimitiveGeometry: true,
} as const

export const SUBTOOLBOX_MIGRATION_WAVES = [
  { id: 1, status: "complete", surfaces: ["ThumbnailStudio", "CommunityPostGenerator"] },
  { id: 2, status: "complete", surfaces: ["VideoManager", "VideoPublisher"] },
  { id: 3, status: "planned", surfaces: ["ScriptArchitect", "ActionableTactics", "MediaAnalyzer"] },
  { id: 4, status: "planned", surfaces: ["ProjectStudio", "StoryboardStudio"] },
  { id: 5, status: "planned", surfaces: ["SubToolboxChartModule", "SystemStatisticsSubToolbox", "remaining-consumers"] },
] as const
