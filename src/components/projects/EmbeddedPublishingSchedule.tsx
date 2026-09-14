import React from "react"
import PublishingScheduleArchitect from "../../views/PublishingScheduleArchitect"

/**
 * Transitional adapter while the scheduler receives a native embedded contract.
 * Projects owns T0. On phone layouts the dense month/week grids are hidden and
 * the agenda surface becomes the primary schedule composition.
 */
const EmbeddedPublishingSchedule: React.FC = () => (
 <div className="vt-projects-embedded-schedule min-w-0">
  <style>{`
   .vt-projects-embedded-schedule > div { overflow: visible !important; border: 0 !important; border-radius: 0 !important; box-shadow: none !important; }
   .vt-projects-embedded-schedule > div > header:first-child { display: none !important; }
   @media (max-width: 767px) {
    .vt-projects-embedded-schedule > div > div:nth-of-type(2) { min-height: 0 !important; }
    .vt-projects-embedded-schedule main { min-width: 0 !important; }
    .vt-projects-embedded-schedule [class*="min-w-[840px]"] { min-width: 0 !important; }
    .vt-projects-embedded-schedule [class*="grid-cols-7"] { grid-template-columns: 1fr !important; }
    .vt-projects-embedded-schedule [class*="min-h-[118px]"] { min-height: auto !important; }
    .vt-projects-embedded-schedule [class*="min-h-[500px]"] { min-height: auto !important; border-right: 0 !important; border-bottom: 2px solid #000; }
   }
  `}</style>
  <PublishingScheduleArchitect collapsible={false} isOpenInitial />
 </div>
)

export default EmbeddedPublishingSchedule
