import React from "react"
import {
 BarChart3,
 Boxes,
 Clapperboard,
 FileText,
 Film,
 Image as ImageIcon,
 Lightbulb,
 Rocket,
 Search,
 Sparkles,
 Type,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import type { Project } from "../../types"
import { getContentBuild } from "../../services/asset-engine/ContentBuildRepository"
import type { ContentBuildSnapshot } from "../../services/asset-engine/contracts"
import { SubToolboxGrid, SubToolboxSection, SubToolboxStack } from "../subtoolbox/SubToolboxLayouts"
import { SubToolboxBadge, SubToolboxButton, SubToolboxStatePanel, SubToolboxSurface } from "../subtoolbox/SubToolboxPrimitives"

type StageCard = {
 id: string
 title: string
 subtitle: string
 route: string
 icon: React.ElementType
 ready: (project: Project) => boolean
}

type AssetSlot = {
 id: string
 label: string
 detail: string
 icon: React.ElementType
 fallback: (project: Project, build: ContentBuildSnapshot | null) => boolean
}

const STAGES: StageCard[] = [
 { id: "idea", title: "Idea + Strategy", subtitle: "Concept, audience promise and production intent", route: "/projects", icon: Lightbulb, ready: p => Boolean(p.concept || p.plan?.concept) },
 { id: "research", title: "Research", subtitle: "Evidence, references and source material", route: "/research-lab", icon: Search, ready: p => (p.plan?.references?.length || 0) > 0 },
 { id: "script", title: "Script + Story", subtitle: "Narrative, script and storyboard structure", route: "/script-architect", icon: FileText, ready: p => Boolean(p.script?.trim()) },
 { id: "production", title: "Production", subtitle: "Storyboard, media, audio and editor handoff", route: "/storyboard-studio", icon: Clapperboard, ready: p => (p.storyboard?.length || 0) > 0 },
 { id: "package", title: "Packaging", subtitle: "Title, thumbnail and discovery package", route: "/thumbnail-studio", icon: Boxes, ready: p => Boolean(p.videoTitle && p.thumbnailUrl) },
 { id: "publish", title: "Publish", subtitle: "Metadata, schedule, readiness and launch", route: "/video-publisher", icon: Rocket, ready: p => Boolean(p.publishDate && p.description && p.tags) },
 { id: "learn", title: "Performance", subtitle: "Analytics, outcomes and reusable learning", route: "/analytics", icon: BarChart3, ready: p => ["published", "completed"].includes(String(p.status)) },
]

const ASSET_SLOTS: AssetSlot[] = [
 { id: "script", label: "Script", detail: "Narrative source", icon: FileText, fallback: p => Boolean(p.script?.trim()) },
 { id: "storyboard", label: "Storyboard", detail: "Scene / sequence plan", icon: Clapperboard, fallback: p => (p.storyboard?.length || 0) > 0 },
 { id: "title", label: "Title", detail: "Selected package title", icon: Type, fallback: p => Boolean(p.videoTitle?.trim()) },
 { id: "thumbnail", label: "Thumbnail", detail: "Selected package image", icon: ImageIcon, fallback: p => Boolean(p.thumbnailUrl) },
 { id: "description", label: "Description", detail: "Publishing description", icon: FileText, fallback: p => Boolean(p.description?.trim()) },
 { id: "tags", label: "Tags / SEO", detail: "Search metadata", icon: Search, fallback: p => Boolean(p.tags?.trim()) },
 { id: "final-render", label: "Final Video", detail: "Render / publish artifact", icon: Film, fallback: (_p, build) => Boolean(build?.youtube?.finalRenderAssetId) },
]

const slotState = (project: Project, build: ContentBuildSnapshot | null, slot: AssetSlot) => {
 const group = build?.variantGroups?.find(candidate => candidate.slot === slot.id)
 const versions = build?.versions?.filter(candidate => candidate.slot === slot.id) || []
 const selected = build?.selections?.[slot.id] || null
 if (group?.finalAssetId) return { label: "FINAL", detail: group.finalAssetId, tone: "accent" as const }
 if (selected) return { label: "SELECTED", detail: selected, tone: "accent" as const }
 if ((group?.members?.length || 0) > 1) return { label: "VARIANTS", detail: `${group?.members.length || 0} candidates`, tone: "subtle" as const }
 if (versions.length || group?.members?.length) return { label: "WORKING", detail: `${Math.max(versions.length, group?.members?.length || 0)} recorded`, tone: "subtle" as const }
 if (slot.fallback(project, build)) return { label: "LEGACY", detail: "Not yet attached as a canonical asset", tone: "subtle" as const }
 return { label: "EMPTY", detail: "No durable asset selected", tone: "subtle" as const }
}

const ProjectAssetEngineSimple: React.FC<{ project: Project }> = ({ project }) => {
 const navigate = useNavigate()
 const build = project.contentBuildId ? getContentBuild(project.contentBuildId) : null

 return <SubToolboxStack density="comfortable">
  <div className="flex flex-wrap gap-2">
   <SubToolboxBadge>{build?.assetIds.length || 0} assets</SubToolboxBadge>
   <SubToolboxBadge>{build?.relations.length || 0} relations</SubToolboxBadge>
   <SubToolboxBadge>{build?.stage || "idea"}</SubToolboxBadge>
   <SubToolboxBadge>revision {build?.revision || 1}</SubToolboxBadge>
   {build?.youtube?.videoId ? <SubToolboxBadge>youtube linked</SubToolboxBadge> : null}
  </div>

  {!build ? <SubToolboxStatePanel state="blocked" message="This project has not resolved a ContentBuild yet." /> : null}

  <SubToolboxSection label="Content lifecycle">
   <SubToolboxGrid minItemWidth="wide" density="dense">
    {STAGES.map(stage => {
     const Icon = stage.icon
     const ready = stage.ready(project)
     return <SubToolboxSurface key={stage.id} tone={ready ? "accent" : "subtle"}>
      <div className="grid gap-3 p-2">
       <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
         <Icon size={22} className="shrink-0" />
         <div className="min-w-0">
          <div className="text-[13px] font-[1000] uppercase leading-none">{stage.title}</div>
          <div className="mt-1 text-[9px] font-bold leading-snug opacity-55">{stage.subtitle}</div>
         </div>
        </div>
        <SubToolboxBadge>{ready ? "READY" : "NEXT"}</SubToolboxBadge>
       </div>
       <SubToolboxButton
        size="compact"
        tone={ready ? "neutral" : "accent"}
        icon={ready ? <Sparkles size={14} /> : <Icon size={14} />}
        onClick={() => navigate(stage.route)}
       >
        {ready ? "Review / Continue" : "Open Stage"}
       </SubToolboxButton>
      </div>
     </SubToolboxSurface>
    })}
   </SubToolboxGrid>
  </SubToolboxSection>

  <SubToolboxSection label="Durable asset slots">
   <SubToolboxGrid minItemWidth="compact" density="dense">
    {ASSET_SLOTS.map(slot => {
     const Icon = slot.icon
     const state = slotState(project, build, slot)
     return <SubToolboxSurface key={slot.id} tone={state.tone}>
      <div className="grid gap-2 p-2">
       <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
         <Icon size={18} className="shrink-0" />
         <div className="min-w-0">
          <div className="text-[11px] font-[1000] uppercase leading-none">{slot.label}</div>
          <div className="mt-1 text-[8px] font-black uppercase opacity-45">{slot.detail}</div>
         </div>
        </div>
        <SubToolboxBadge>{state.label}</SubToolboxBadge>
       </div>
       <div className="truncate text-[9px] font-bold opacity-55" title={state.detail}>{state.detail}</div>
      </div>
     </SubToolboxSurface>
    })}
   </SubToolboxGrid>
  </SubToolboxSection>
 </SubToolboxStack>
}

export default ProjectAssetEngineSimple
