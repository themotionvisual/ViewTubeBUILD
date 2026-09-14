import React from "react"
import PublishingScheduleArchitect from "../../views/PublishingScheduleArchitect"

/**
 * MIGRATE: compatibility adapter for the legacy scheduler while Projects owns T0.
 * It removes only the scheduler's duplicated exterior/header. Scheduling behavior,
 * search, view controls, calendar surfaces and backlog remain owned by the legacy view.
 * Replace this adapter once PublishingScheduleArchitect exposes a native embedded mode.
 */
const EmbeddedPublishingSchedule: React.FC = () => (
 <div className="vt-projects-embedded-schedule min-w-0">
  <style>{`
   .vt-projects-embedded-schedule > div {
    overflow: visible !important;
    border: 0 !important;
    border-radius: 0 !important;
    box-shadow: none !important;
   }
   .vt-projects-embedded-schedule > div > header:first-child {
    display: none !important;
   }
  `}</style>
  <PublishingScheduleArchitect collapsible={false} isOpenInitial />
 </div>
)

export default EmbeddedPublishingSchedule
