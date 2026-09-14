import React from "react"
import PublishingScheduleArchitect from "../../views/PublishingScheduleArchitect"

/** Transitional adapter while the scheduler receives a native embedded contract. */
const EmbeddedPublishingSchedule: React.FC = () => (
 <div className="vt-projects-embedded-schedule min-w-0">
  <style>{`
   .vt-projects-embedded-schedule > div { overflow: visible !important; border: 0 !important; border-radius: 0 !important; box-shadow: none !important; }
   .vt-projects-embedded-schedule > div > header:first-child { display: none !important; }
  `}</style>
  <PublishingScheduleArchitect collapsible={false} isOpenInitial />
 </div>
)

export default EmbeddedPublishingSchedule
