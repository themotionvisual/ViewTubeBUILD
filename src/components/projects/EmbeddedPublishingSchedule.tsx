import React from "react"
import PublishingScheduleArchitect from "../../views/PublishingScheduleArchitect"

/**
 * Transitional adapter while the scheduler receives a native embedded contract.
 * Projects owns T0. Phone layouts remove the 840px desktop minimums and collapse
 * seven-column calendar surfaces vertically so the scheduler stays usable without
 * page-level horizontal overflow. Native agenda-first selection remains follow-up work.
 */
const EmbeddedPublishingSchedule: React.FC<{ onOpenProject?: (projectId: string) => void }> = ({ onOpenProject }) => (
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
  <PublishingScheduleArchitect collapsible={false} isOpenInitial onOpenProject={onOpenProject} />
 </div>
)

export default EmbeddedPublishingSchedule
