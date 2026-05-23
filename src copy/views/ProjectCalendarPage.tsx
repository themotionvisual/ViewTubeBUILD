import React from "react";
import { ProjectStudio } from "../components/ProjectStudio";
import StoryboardStudio from "./StoryboardStudio";

const ProjectCalendarPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-8 max-w-[1600px] mx-auto pb-24">
      <ProjectStudio />
      <StoryboardStudio collapsible isOpenInitial={false} />
    </div>
  );
};

export default ProjectCalendarPage;
