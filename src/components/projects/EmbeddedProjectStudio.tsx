import React from "react"
import { ProjectStudio } from "../ProjectStudio"

/** Transitional adapter while ProjectStudio receives a native embedded contract. */
const EmbeddedProjectStudio: React.FC = () => (
 <div className="vt-projects-embedded-studio min-w-0">
  <style>{`
   .vt-projects-embedded-studio > .vt-toolbox { overflow: visible !important; border: 0 !important; border-radius: 0 !important; box-shadow: none !important; margin-bottom: 0 !important; }
   .vt-projects-embedded-studio > .vt-toolbox > div:first-child { display: none !important; }
  `}</style>
  <ProjectStudio />
 </div>
)

export default EmbeddedProjectStudio
