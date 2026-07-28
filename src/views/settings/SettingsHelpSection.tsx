import React from "react"
import { BookOpen } from "lucide-react"
import { SubToolbox } from "../../components/Toolbox"
import { GUIDE_LAST_UPDATED, GUIDE_PROTOCOL_VERSION } from "../../content/userGuideContent"

const canonicalButtonClass =
  "rounded-xl border-[3px] border-black shadow-[3px_3px_0px_0px_black] hover:translate-y-0.5 hover:shadow-[1.5px_1.5px_0px_0px_black] transition-all font-black uppercase"

type SettingsHelpSectionProps = {
  onNavigate: (to: string) => void
}

const HelpCard: React.FC<{
  accent: string
  cta: string
  description: string
  onClick: () => void
  title: string
}> = ({ accent, cta, description, onClick, title }) => (
  <button
    onClick={onClick}
    className="text-left border-[3px] border-black rounded-2xl bg-white p-4 shadow-[3px_3px_0px_0px_black] hover:translate-y-0.5 hover:shadow-[1.5px_1.5px_0px_0px_black] transition-all"
  >
    <div className="inline-flex px-3 py-1 rounded-lg border-[2px] border-black font-black uppercase text-[10px]" style={{ backgroundColor: accent }}>
      {cta}
    </div>
    <h3 className="mt-3 text-lg font-black uppercase tracking-tight">{title}</h3>
    <p className="mt-2 text-sm font-bold text-gray-700">{description}</p>
  </button>
)

export const SettingsHelpSection: React.FC<SettingsHelpSectionProps> = ({ onNavigate }) => (
  <div id="help-policies" className="scroll-mt-24">
    <SubToolbox
      title="Help & Policies"
      subtitle="Contextual guide links, account utilities, and legal pages"
      icon={<BookOpen size={20} strokeWidth={3} className="text-black" />}

      contentClassName="p-6 space-y-6"
    >
      <div>
        <p className="text-sm font-bold text-gray-700">
          Need help with this page? Open the exact guide lane you need instead of digging through unrelated internal workflows.
        </p>
        <p className="mt-2 text-xs font-black uppercase tracking-[0.15em] text-gray-600">
          Protocol {GUIDE_PROTOCOL_VERSION} • Updated {GUIDE_LAST_UPDATED}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <HelpCard accent="#40C6E9" cta="Account" description="Connection status, verified identity, and workspace link expectations." onClick={() => onNavigate("/user-guide#sync")} title="Account connection help" />
        <HelpCard accent="#CCFF00" cta="Billing" description="Plans, top-ups, referral setup, and credit-balance troubleshooting." onClick={() => onNavigate("/user-guide#billing")} title="Billing and credits" />
        <HelpCard accent="#FF83EA" cta="AI" description="Gemini key setup, AI workspace context, and model-selection guidance." onClick={() => onNavigate("/user-guide#sync")} title="AI key and models" />
        <HelpCard accent="#FFE357" cta="Data" description="Public handle resolution, exports, cache clearing, and account-linked data controls." onClick={() => onNavigate("/user-guide#sync")} title="Sync and data setup" />
        <HelpCard accent="#FFB570" cta="QA" description="Sitewide recovery flow for chart issues, stale data, billing blocks, and resets." onClick={() => onNavigate("/user-guide#troubleshooting")} title="Troubleshooting playbook" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[auto_auto_1fr] gap-4 items-start border-t-[3px] border-black pt-6">
        <button onClick={() => onNavigate("/user-guide")} className={`${canonicalButtonClass} bg-[#40C6E9] text-black px-6 py-4 text-sm`}>
          Open full user guide
        </button>
        <button onClick={() => onNavigate("/about")} className={`${canonicalButtonClass} bg-white text-black px-6 py-4 text-sm`}>
          About ViewTube
        </button>
        <div className="flex flex-wrap gap-3 lg:justify-end">
          <a href="/privacy.html" className={`${canonicalButtonClass} bg-white text-black px-6 py-4 text-sm inline-block`}>
            Privacy policy
          </a>
          <a href="/terms.html" className={`${canonicalButtonClass} bg-white text-black px-6 py-4 text-sm inline-block`}>
            Terms of service
          </a>
        </div>
      </div>
    </SubToolbox>
  </div>
)
