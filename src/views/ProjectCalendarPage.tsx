import React from "react";
import { ProjectStudio } from "../components/ProjectStudio";
import StoryboardStudio from "./StoryboardStudio";
import ProjectCommandKanban from "./ProjectCommandKanban";
import PublishingScheduleArchitect from "./PublishingScheduleArchitect";

/**
 * Projects surface.
 *
 * Project Command Kanban and Publishing Schedule Architect are mounted here
 * because that is where the super-tool registry routes them ("/projects"); both
 * render `embedded` so the page keeps one hero instead of three.
 */
const ProjectCalendarPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-8 max-w-[1600px] mx-auto pb-24">
      <ProjectStudio />
      <StoryboardStudio collapsible isOpenInitial={false} paletteIndex={1} />

      <section id="project-kanban" className="scroll-mt-24 flex flex-col gap-3">
        <h2 className="text-3xl font-[1000] uppercase tracking-[-0.04em] text-black">
          Project Command <span className="text-[#FA618A]">Kanban</span>
        </h2>
        <ProjectCommandKanban embedded />
      </section>

      <section id="publishing-schedule" className="scroll-mt-24 flex flex-col gap-3">
        <h2 className="text-3xl font-[1000] uppercase tracking-[-0.04em] text-black">
          Publishing <span className="text-[#36E0F6]">Schedule</span>
        </h2>
        <PublishingScheduleArchitect embedded />
      </section>
    </div>
  );
};

export default ProjectCalendarPage;
