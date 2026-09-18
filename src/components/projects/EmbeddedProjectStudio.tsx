import React from "react"
import { ProjectStudio } from "../ProjectStudio"
import ProjectPlanningSubtoolboxes from "./ProjectPlanningSubtoolboxes"
import { SubToolboxStack } from "../subtoolbox/SubToolboxLayouts"

/** Restored original Project Studio plus project-specific planning controls. */
const EmbeddedProjectStudio: React.FC = () => <SubToolboxStack density="comfortable"><ProjectStudio embedded /><ProjectPlanningSubtoolboxes /></SubToolboxStack>

export default EmbeddedProjectStudio
