import React from "react"
import { ProjectStudio } from "../ProjectStudio"

/**
 * MIGRATE: compatibility adapter for ProjectStudio's legacy ToolboxScaffold.
 * Projects already supplies the canonical T0 shell, so the nested scaffold chrome
 * is suppressed while all planning/calendar behavior remains mounted.
 * Replace with a native embedded prop on ProjectStudio during its primitive migration.
 */
const EmbeddedProjectStudio: React.FC = () => (
 <div className="vt-projects-embedded-studio min-w-0">
  <style>{`
   .vt-projects-embedded-studio > .vt-toolbox {
    overflow: visible !important;
    border: 0 !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    margin-bottom: 0 !important;
   }
   .vt-projects-embedded-studio > .vt-toolbox > div:first-child {
    display: none !important;
   }
  `}</style>
  <ProjectStudio />
 </div>
)

export default EmbeddedProjectStudio
