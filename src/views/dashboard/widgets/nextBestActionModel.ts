import type { AlgorithmRecommendation } from "../../../services/brain/AlgorithmStrategyEngine"
import { describeDashboardRecommendation } from "./dashboardAlgorithmContext"

type NextBestActionInput = {
  recommendations?: readonly AlgorithmRecommendation[] | null
  canonicalRows?: readonly any[] | null
  todayTasks?: readonly any[] | null
  topPerformer?: any
}

const numericViews = (row: any) => Number(row?.metrics?.views?.value ?? row?.metrics?.views ?? row?.views ?? 0) || 0

export const buildNextBestActionModel = (input: NextBestActionInput) => {
  const recommendations = Array.isArray(input.recommendations) ? input.recommendations : []
  if (recommendations.length) {
    return {
      source: "algorithm-intelligence" as const,
      actions: recommendations.slice(0, 3).map((recommendation) => {
        const item = describeDashboardRecommendation(recommendation)
        return {
          id: item.id,
          priority: item.command,
          title: item.title,
          reason: item.rationale,
          route: item.route,
          score: item.score,
          confidence: item.confidence,
          evidenceCount: item.evidenceCount,
          checkpoint: item.checkpoint,
        }
      }),
    }
  }

  const rows = Array.isArray(input.canonicalRows) ? [...input.canonicalRows] : []
  const todayTasks = Array.isArray(input.todayTasks) ? input.todayTasks : []

  if (!rows.length) {
    return {
      source: "dashboard-fallback" as const,
      actions: [{
        id: "connect-data",
        priority: "CONNECT DATA",
        command: "CONNECT DATA",
        title: "Sync or import channel data",
        reason: "ViewTube needs canonical channel evidence before it can rank a creator action.",
        route: "/analytics",
        score: 0,
        confidence: "low" as const,
        evidenceCount: 0,
        checkpoint: "Connect or refresh channel data, then rerun the decision.",
      }],
    }
  }

  const latest = rows.sort((a, b) => new Date(b.uploadDate || 0).getTime() - new Date(a.uploadDate || 0).getTime())[0]
  const views = numericViews(latest)
  const avg = rows.reduce((sum, row) => sum + numericViews(row), 0) / Math.max(rows.length, 1)

  if (views < avg * 0.7) {
    return {
      source: "dashboard-fallback" as const,
      actions: [{
        id: "fallback-repackage",
        priority: "HIGH PRIORITY",
        command: "REPACKAGE",
        title: "Repackage your latest upload",
        reason: `${latest?.title || "Latest upload"} is tracking below the catalog view baseline. Review its title and thumbnail promise first.`,
        route: "/studio",
        score: 70,
        confidence: "medium" as const,
        evidenceCount: rows.length,
        checkpoint: "Compare performance after one controlled packaging change.",
      }],
    }
  }

  if (todayTasks.length) {
    return {
      source: "dashboard-fallback" as const,
      actions: [{
        id: "fallback-task",
        priority: "TODAY",
        command: "EXECUTE",
        title: "Clear the next production task",
        reason: `${todayTasks.length} scheduled task${todayTasks.length === 1 ? " is" : "s are"} ready. Keep the publishing pipeline moving before adding another idea.`,
        route: "/projects",
        score: 60,
        confidence: "medium" as const,
        evidenceCount: todayTasks.length,
        checkpoint: "Re-evaluate after the next scheduled task is cleared.",
      }],
    }
  }

  return {
    source: "dashboard-fallback" as const,
    actions: [{
      id: "fallback-followup",
      priority: "OPPORTUNITY",
      command: "CREATE FOLLOWUP",
      title: "Build a follow-up to the current winner",
      reason: `Use ${input.topPerformer?.title || "your top performer"} as the evidence base for the next topic, hook, and packaging direction.`,
      route: "/projects",
      score: 55,
      confidence: "medium" as const,
      evidenceCount: rows.length,
      checkpoint: "Validate the follow-up against audience and project evidence before production.",
    }],
  }
}
