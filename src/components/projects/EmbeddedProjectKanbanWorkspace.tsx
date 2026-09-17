import React from "react"
import ProjectKanbanWorkspace from "./ProjectKanbanWorkspace"

/**
 * Embedded Project Board keeps the board's action header visible so creator actions
 * such as New Project and Archived remain reachable inside the Projects Toolbox.
 * ProjectsToolboxModule remains the sole level-0 owner; the embedded board shell is
 * flattened while preserving its functional controls.
 */
const EmbeddedProjectKanbanWorkspace: React.FC = () => (
 <div
  data-vt-project-kanban-embedded="true"
  className="vt-projects-embedded-kanban min-w-0 [&>div]:overflow-visible [&>div]:rounded-none [&>div]:border-0 [&>div]:shadow-none"
 >
  <style>{`
   .vt-projects-embedded-kanban > div > header:first-child {
    border-top: 0 !important;
    border-left: 0 !important;
    border-right: 0 !important;
    border-radius: 0 !important;
   }
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
