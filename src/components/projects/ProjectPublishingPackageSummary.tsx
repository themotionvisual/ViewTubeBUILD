import React, { useMemo } from "react"
import { PackageCheck, Send } from "lucide-react"
import { useNavigate } from "react-router-dom"
import type { Project } from "../../types"
import { getContentBuild } from "../../services/asset-engine/ContentBuildRepository"
import { findVideoPackageByProject } from "../../services/video-package/VideoPackageRepository"
import { SubToolbox } from "../Toolbox"
import { SubToolboxGrid, SubToolboxSection, SubToolboxStack } from "../subtoolbox/SubToolboxLayouts"
import {
  SubToolboxBadge,
  SubToolboxButton,
  SubToolboxProgressValue,
  SubToolboxStatePanel,
  SubToolboxSurface,
} from "../subtoolbox/SubToolboxPrimitives"

const hasText = (value: unknown) => typeof value === "string" && value.trim().length > 0

const ProjectPublishingPackageSummary: React.FC<{ project: Project }> = ({ project }) => {
  const navigate = useNavigate()
  const build = project.contentBuildId ? getContentBuild(project.contentBuildId) : null
  const videoPackage = findVideoPackageByProject(project.id, project.contentBuildId || null)
  const publishing = project.plan?.publishingPackage || {}

  const items = useMemo(() => [
    { id: "title", label: "Title", ready: Boolean(build?.selections.title || hasText(project.videoTitle)) },
    { id: "thumbnail", label: "Thumbnail", ready: Boolean(build?.selections.thumbnail || hasText(project.thumbnailUrl)) },
    { id: "description", label: "Description", ready: Boolean(build?.selections.description || hasText(project.description)) },
    { id: "tags", label: "Tags / SEO", ready: Boolean(build?.selections.tags || hasText(project.tags)) },
    { id: "category", label: "Category", ready: hasText(publishing.category) },
    { id: "audience", label: "Audience", ready: hasText(publishing.audience) },
    { id: "visibility", label: "Visibility", ready: hasText(publishing.visibility) },
    { id: "schedule", label: "Schedule", ready: hasText(publishing.publishAt || project.publishDate) },
  ], [
    build?.selections.description,
    build?.selections.tags,
    build?.selections.thumbnail,
    build?.selections.title,
    project.description,
    project.publishDate,
    project.tags,
    project.thumbnailUrl,
    project.videoTitle,
    publishing.audience,
    publishing.category,
    publishing.publishAt,
    publishing.visibility,
  ])

  const complete = items.filter(item => item.ready).length
  const percent = Math.round((complete / items.length) * 100)
  const blockers = videoPackage?.workflow.blockers.filter(blocker => blocker.severity === "blocking" && !blocker.resolved) || []

  return <SubToolbox
    title="PUBLISHING PACKAGE"
    subtitle="Compact YouTube readiness summary for this ContentBuild"
    icon={<PackageCheck />}
    collapsible
    isOpenInitial
    openUnits={4}
  >
    <SubToolboxStack density="comfortable">
      <SubToolboxProgressValue value={percent} label="PUBLISH READINESS" />

      <div className="flex flex-wrap gap-2">
        <SubToolboxBadge>{complete}/{items.length} core fields</SubToolboxBadge>
        <SubToolboxBadge>{videoPackage ? "Video Package linked" : "Video Package pending"}</SubToolboxBadge>
        <SubToolboxBadge>{blockers.length} blockers</SubToolboxBadge>
      </div>

      <SubToolboxGrid minItemWidth="compact" density="dense">
        {items.map(item => <SubToolboxSurface key={item.id} tone={item.ready ? "accent" : "subtle"}>
          <div className="flex min-h-9 items-center justify-between gap-2 p-1">
            <strong className="text-[10px] font-[1000] uppercase">{item.label}</strong>
            <SubToolboxBadge>{item.ready ? "READY" : "MISSING"}</SubToolboxBadge>
          </div>
        </SubToolboxSurface>)}
      </SubToolboxGrid>

      {blockers.length ? <SubToolboxSection label="Blocking issues">
        <SubToolboxStack density="dense">
          {blockers.map(blocker => <SubToolboxStatePanel key={blocker.id} state="blocked" message={blocker.message || blocker.id} />)}
        </SubToolboxStack>
      </SubToolboxSection> : null}

      <SubToolboxButton tone="accent" icon={<Send size={15} />} onClick={() => navigate("/video-publisher")}>
        Open Video Publisher
      </SubToolboxButton>
    </SubToolboxStack>
  </SubToolbox>
}

export default ProjectPublishingPackageSummary
