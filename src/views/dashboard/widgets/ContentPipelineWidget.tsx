import React, { useMemo, useState } from "react"
import { Boxes, ChevronRight, Workflow } from "lucide-react"
import { listContentBuildSnapshots } from "../../../services/assetEngine"
import type { ContentBuildSnapshot, ContentBuildStage } from "../../../services/asset-engine/contracts"
import { WidgetShell } from "../WidgetShell"
import {
  WidgetBadge,
  WidgetMetric,
  WidgetProgressBar,
  WidgetSizedButton,
  WidgetStatePanel,
} from "../WidgetPrimitives"
import type { DashboardData } from "../useDashboardData"
import type { CommonWidgetProps } from "../types"
import "./ContentPipelineWidget.css"

type LifecycleBucket = "IDEA" | "BUILD" | "PACKAGE" | "LIVE" | "LEARN"

const BUCKETS: readonly LifecycleBucket[] = ["IDEA", "BUILD", "PACKAGE", "LIVE", "LEARN"]

const bucketForStage = (stage: ContentBuildStage): LifecycleBucket => {
  if (stage === "idea" || stage === "research" || stage === "concept") return "IDEA"
  if (stage === "outline" || stage === "script" || stage === "storyboard" || stage === "media" || stage === "edit") return "BUILD"
  if (stage === "package" || stage === "review" || stage === "scheduled") return "PACKAGE"
  if (stage === "published" || stage === "launch" || stage === "monitor") return "LIVE"
  return "LEARN"
}

const fallbackBuilds = (data: DashboardData) => {
  const counts = {
    IDEA: Array.isArray((data.brain as any)?.ideas || (data.brain as any)?.ideaBank)
      ? ((data.brain as any)?.ideas || (data.brain as any)?.ideaBank).length
      : 0,
    BUILD: (data.todayTasks || []).length,
    PACKAGE: (data.upcomingDays || []).reduce((sum, day) => sum + (day.tasks?.length || 0), 0),
    LIVE: (data.recentUploads || []).length,
    LEARN: 0,
  }
  return counts
}

const LifecycleRail: React.FC<{
  counts: Record<LifecycleBucket, number>
  activeBucket: LifecycleBucket
  onBucketChange: (bucket: LifecycleBucket) => void
}> = ({ counts, activeBucket, onBucketChange }) => (
  <div className="vt-content-lifecycle-rail" aria-label="Content lifecycle rail">
    <div className="vt-content-lifecycle-rail__track" aria-hidden="true" />
    {BUCKETS.map((bucket, index) => (
      <React.Fragment key={bucket}>
        <button
          type="button"
          className="vt-content-lifecycle-rail__station"
          data-active={activeBucket === bucket ? "true" : "false"}
          aria-pressed={activeBucket === bucket}
          onClick={() => onBucketChange(bucket)}
        >
          <span>{String(index + 1).padStart(2, "0")}</span>
          <b>{counts[bucket]}</b>
          <strong>{bucket}</strong>
        </button>
        {index < BUCKETS.length - 1 ? <ChevronRight className="vt-content-lifecycle-rail__connector" aria-hidden="true" /> : null}
      </React.Fragment>
    ))}
  </div>
)

export const ContentPipelineWidget: React.FC<CommonWidgetProps & { data: DashboardData; onNavigate?: (to: string) => void }> = ({ data, onNavigate, ...common }) => {
  const builds = useMemo(() => listContentBuildSnapshots(), [data.brain, data.todayTasks, data.recentUploads, data.upcomingDays])
  const canonical = builds.length > 0

  const counts = useMemo<Record<LifecycleBucket, number>>(() => {
    if (!canonical) return fallbackBuilds(data)
    return builds.reduce((result, build) => {
      const bucket = bucketForStage(build.stage)
      result[bucket] += 1
      return result
    }, { IDEA: 0, BUILD: 0, PACKAGE: 0, LIVE: 0, LEARN: 0 } as Record<LifecycleBucket, number>)
  }, [builds, canonical, data])

  const firstNonEmpty = BUCKETS.find((bucket) => counts[bucket] > 0) || "IDEA"
  const [activeBucket, setActiveBucket] = useState<LifecycleBucket>(firstNonEmpty)

  const bucketBuilds = useMemo(
    () => canonical ? builds.filter((build) => bucketForStage(build.stage) === activeBucket) : [],
    [activeBucket, builds, canonical],
  )
  const selectedBuild: ContentBuildSnapshot | null = bucketBuilds[0] || builds[0] || null
  const blockers = selectedBuild?.workflow?.blockerIds?.length || 0
  const selectedAssets = selectedBuild ? Object.values(selectedBuild.selections || {}).filter(Boolean).length : 0
  const progress = selectedBuild
    ? Math.round(((BUCKETS.indexOf(bucketForStage(selectedBuild.stage)) + 1) / BUCKETS.length) * 100)
    : Math.round(((BUCKETS.indexOf(activeBucket) + 1) / BUCKETS.length) * 100)

  return (
    <WidgetShell {...common} icon={<Workflow size={22} />}>
      <div className="vt-content-pipeline-widget">
        <div className="vt-content-pipeline-widget__source">
          <span>{canonical ? "CONTENTBUILD LIFECYCLE" : "DASHBOARD FALLBACK"}</span>
          <WidgetBadge height={24} status={canonical ? "positive" : "warning"}>
            {canonical ? `${builds.length} BUILDS` : "NO BUILDS"}
          </WidgetBadge>
        </div>

        <LifecycleRail counts={counts} activeBucket={activeBucket} onBucketChange={setActiveBucket} />

        {canonical && selectedBuild ? (
          <section className="vt-content-pipeline-widget__build-inspector">
            <div className="vt-content-pipeline-widget__build-head">
              <div>
                <span>ACTIVE CONTENT BUILD</span>
                <strong>{selectedBuild.legacyProjectName || selectedBuild.profile.workingConcept || selectedBuild.id}</strong>
                <small>{selectedBuild.stage.toUpperCase()} · REV {selectedBuild.revision}</small>
              </div>
              <WidgetBadge height={24}>{activeBucket}</WidgetBadge>
            </div>

            <WidgetProgressBar
              value={progress}
              max={100}
              label="LIFECYCLE POSITION"
              displayValue={progress + "%"}
              height={24}
            />

            <div className="vt-content-pipeline-widget__build-metrics">
              <WidgetMetric label="ASSETS" value={selectedBuild.assetIds.length} />
              <WidgetMetric label="SELECTED" value={selectedAssets} />
              <WidgetMetric label="BLOCKERS" value={blockers} />
            </div>
          </section>
        ) : (
          <section className="vt-content-pipeline-widget__queue">
            <span>NEXT QUEUE ITEM</span>
            <strong>{data.todayTasks[0]?.text || "NO TASK SCHEDULED"}</strong>
            <small>FALLBACK VIEW · CREATE OR SYNC A PROJECT TO ACTIVATE CONTENTBUILD LIFECYCLE</small>
          </section>
        )}

        <div className="vt-content-pipeline-widget__actions">
          <WidgetSizedButton height={32} tone="primary" textFit="adaptive" onClick={() => onNavigate?.("/projects")}>
            <Workflow aria-hidden="true" /> OPEN PROJECTS
          </WidgetSizedButton>
          <WidgetSizedButton height={32} tone="default" textFit="adaptive" onClick={() => onNavigate?.("/studio")}>
            <Boxes aria-hidden="true" /> OPEN ASSET ENGINE
          </WidgetSizedButton>
        </div>

        {!canonical && !Object.values(counts).some(Boolean) ? (
          <WidgetStatePanel state={{
            status: "empty",
            data: null,
            message: "No project, task, or published lifecycle evidence is available yet.",
          }} />
        ) : null}
      </div>
    </WidgetShell>
  )
}
