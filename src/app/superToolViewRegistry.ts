import type { ComponentType, LazyExoticComponent } from "react"
import { lazyRoute as lazy } from "./lazyRoute"
import {
 MOUNTED_INTERNAL_TOOL_IDS,
 SUPPORTING_TOOL_IDS,
} from "../services/superToolRuntimePlanRegistry"
import type { SuperToolId } from "../types"

/**
 * Super-tool view registry — the door the runtime plan always assumed existed.
 *
 * Every internal super-tool ships a finished view, but until now nothing read
 * the `?internalTool=` address the registry documents, so none of them could be
 * opened from the running app. This maps each tool id to its view so a single
 * route (`/tools/:toolId`) can resolve any of them.
 *
 * Views load through `lazyRoute`, so a stale chunk after a deploy retries and
 * falls back the same way every other route does.
 *
 * Editor-bound tools (motion-scene-builder, timeline-asset-vault-dock,
 * template-and-foley-forge, caption-and-fx-pipeline) are deliberately absent:
 * their runtime boundary is VT_E1, and mounting them standalone would fork the
 * editor. Their ids resolve to nothing here, which is the correct answer.
 */

/** Every mountable view takes the same optional prop, so hubs can embed them. */
export type SuperToolView = ComponentType<{ embedded?: boolean }>

export const SUPER_TOOL_VIEWS: Partial<
 Record<SuperToolId, LazyExoticComponent<SuperToolView>>
> = {
 "creator-canvas-os": lazy(() => import("../views/CreatorCanvasOS")),
 "audience-loop-studio": lazy(() => import("../views/AudienceLoopStudio")),
 "packaging-lab-pro": lazy(() => import("../views/PackagingLabPro")),
 "series-and-theme-generator": lazy(() => import("../views/SeriesThemeGenerator")),
 "project-command-kanban": lazy(() => import("../views/ProjectCommandKanban")),
 "publishing-schedule-architect": lazy(() => import("../views/PublishingScheduleArchitect")),
 "cinematic-analytics-lab": lazy(() => import("../views/CinematicAnalyticsLab")),
 "retention-autopsy-experiment-engine": lazy(
  () => import("../views/RetentionAutopsyExperimentEngine"),
 ),
 "brain-command-center": lazy(() => import("../views/BrainCommandCenter")),
 "workflow-chain-builder": lazy(() => import("../views/WorkflowChainBuilder")),
 "shorts-extraction-studio": lazy(() => import("../views/ShortsExtractionStudio")),
 "creator-vault-os": lazy(() => import("../views/CreatorVaultOS")),
}

/** Ids this router can actually render, in registry order. */
export const MOUNTABLE_SUPER_TOOL_IDS = Object.keys(SUPER_TOOL_VIEWS) as SuperToolId[]

export const isMountableSuperTool = (value: unknown): value is SuperToolId =>
 typeof value === "string" && value in SUPER_TOOL_VIEWS

export const getSuperToolView = (id: string): LazyExoticComponent<SuperToolView> | null =>
 isMountableSuperTool(id) ? SUPER_TOOL_VIEWS[id] ?? null : null

/** Canonical address for an internal tool. */
export const superToolRoute = (id: SuperToolId): string => `/tools/${id}`

/**
 * Ids the runtime plan claims are mounted — used by the governance test to
 * prove the plan and the router agree.
 */
export const PLANNED_MOUNTED_TOOL_IDS: SuperToolId[] = [
 ...Array.from(MOUNTED_INTERNAL_TOOL_IDS),
 ...Array.from(SUPPORTING_TOOL_IDS),
]
