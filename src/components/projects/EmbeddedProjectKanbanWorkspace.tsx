import React from "react"
import ProjectKanbanWorkspace from "./ProjectKanbanWorkspace"

/**
 * Transitional embedded adapter while ProjectKanbanWorkspace is decomposed into
 * canonical T1/T2 primitives. ProjectsToolboxModule remains the sole T0 owner.
 * Mobile uses one full board lane at a time with horizontal snap navigation.
 */
const EmbeddedProjectKanbanWorkspace: React.FC = () => (
 <div
  data-vt-project-kanban-embedded="true"
  className="vt-projects-embedded-kanban min-w-0 [&>div]:overflow-visible [&>div]:rounded-none [&>div]:border-0 [&>div]:shadow-none [&>div>header:first-child]:hidden"
 >
  <style>{`
   @media (max-width: 767px) {
    .vt-projects-embedded-kanban [class*="overflow-x-auto"] {
     scroll-snap-type: x mandatory;
     overscroll-behavior-inline: contain;
     scrollbar-width: thin;
    }
    .vt-projects-embedded-kanban [class*="overflow-x-auto"] > [class*="min-w-max"] {
     min-width: 100% !important;
    }
    .vt-projects-embedded-kanban [class*="overflow-x-auto"] > [class*="min-w-max"] > section {
     flex: 0 0 calc(100vw - 48px) !important;
     min-width: calc(100vw - 48px) !important;
     scroll-snap-align: start;
     scroll-snap-stop: always;
    }
   }
  `}</style>
  <ProjectKanbanWorkspace />
 </div>
)

export default EmbeddedProjectKanbanWorkspace
