import React, { useState } from "react";
import { CalendarDays, Columns3, LayoutList, PanelsTopLeft } from "lucide-react";
import ProjectKanbanWorkspace from "../components/projects/ProjectKanbanWorkspace";
import { ProjectStudio } from "../components/ProjectStudio";
import StoryboardStudio from "./StoryboardStudio";
import PublishingScheduleArchitect from "./PublishingScheduleArchitect";

type ProjectsView = "board" | "calendar" | "studio" | "storyboard";

const PROJECT_VIEWS: Array<{ id: ProjectsView; label: string; icon: React.ComponentType<{ size?: number }> }> = [
  { id: "board", label: "Board", icon: Columns3 },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "studio", label: "Studio", icon: LayoutList },
  { id: "storyboard", label: "Storyboard", icon: PanelsTopLeft },
];

/**
 * User-facing Projects workspace.
 *
 * Planning surfaces share the existing persisted project records, but only one
 * major workspace is mounted at a time. This keeps Projects compact on phones
 * and prevents the board, calendar, studio, and storyboard from becoming one
 * extremely long page.
 */
const ProjectCalendarPage: React.FC = () => {
  const [view, setView] = useState<ProjectsView>("board");

  return (
    <div className="mx-auto flex max-w-[1800px] flex-col gap-3 pb-24">
      <nav
        aria-label="Projects workspace views"
        className="sticky top-[70px] z-30 grid grid-cols-4 overflow-hidden rounded-[10px] border-[3px] border-black bg-white shadow-[4px_4px_0_rgba(0,0,0,0.16)] md:static"
      >
        {PROJECT_VIEWS.map(({ id, label, icon: Icon }, index) => {
          const active = view === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={active}
              onClick={() => setView(id)}
              className={`flex min-h-11 items-center justify-center gap-1.5 px-2 text-[9px] font-[1000] uppercase tracking-[-0.01em] transition-colors sm:text-[10px] ${index ? "border-l-[2px] border-black" : ""} ${active ? "bg-[#CCFF00]" : "bg-white hover:bg-black/5"}`}
            >
              <Icon size={14} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      <main className="min-w-0">
        {view === "board" ? (
          <div id="project-kanban" className="scroll-mt-[126px]">
            <ProjectKanbanWorkspace />
          </div>
        ) : null}

        {view === "calendar" ? (
          <div id="publishing-schedule" className="scroll-mt-[126px]">
            <PublishingScheduleArchitect collapsible={false} isOpenInitial paletteIndex={3} />
          </div>
        ) : null}

        {view === "studio" ? <ProjectStudio /> : null}

        {view === "storyboard" ? (
          <StoryboardStudio collapsible={false} isOpenInitial paletteIndex={1} />
        ) : null}
      </main>
    </div>
  );
};

export default ProjectCalendarPage;
