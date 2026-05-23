import React from "react"
import { Link2 } from "lucide-react"

const sections: Array<{ title: string; items: Array<{ label: string; href: string; note: string }> }> = [
 {
  title: "Core App",
  items: [
   { label: "Dashboard", href: "/", note: "Main workspace and widgets" },
   { label: "Studio Hub", href: "/studio", note: "Tool launcher + creator workflows" },
   { label: "Performance Hub", href: "/performance", note: "Analytics and reporting" },
   { label: "Graphs", href: "/graphs", note: "Chart gallery and graph experiments" },
   { label: "Settings / Account", href: "/account", note: "Account, billing, workspace, data controls" },
  ],
 },
 {
  title: "Billing + Signup",
  items: [
   { label: "Subscribe", href: "/subscribe", note: "Plan selection and checkout start" },
   { label: "Billing Panel Anchor", href: "/account?panel=billing", note: "Direct billing/meter section" },
   { label: "Billing Meter", href: "/account#billing-meter", note: "Credits, meter, top-up, referral" },
   { label: "API Keys", href: "/account#api-keys", note: "Executive/owner-only key controls" },
  ],
 },
 {
  title: "Guides + Support",
  items: [
   { label: "User Guide", href: "/user-guide", note: "Main help and operational guide" },
   { label: "Billing Help", href: "/user-guide#billing", note: "Checkout, plans, meter troubleshooting" },
   { label: "Sync + Data Help", href: "/user-guide#sync", note: "Connect channel + ingest modes" },
   { label: "Graph Troubleshooting", href: "/user-guide#graphs", note: "Chart diagnostics and validation" },
  ],
 },
 {
  title: "Hidden Tool Routes",
  items: [
   { label: "Media Analyzer", href: "/media-analyzer", note: "Asset and content diagnostics" },
   { label: "Video Publisher", href: "/seo-generator", note: "Title/description optimization" },
   { label: "Video Publisher", href: "/video-publisher", note: "Publishing workflow" },
   { label: "Hook Generator", href: "/hook-generator", note: "Hook ideation and testing" },
   { label: "Thumbnail Studio", href: "/thumbnail-studio", note: "Thumbnail creation and analysis" },
  ],
 },
]

const AllLinksPage: React.FC = () => {
 return (
  <div className="max-w-[1400px] mx-auto pb-24 px-4 pt-8 space-y-8 animate-fade-in">
   <div className="border-[4px] border-black rounded-2xl bg-[#40C6E9] shadow-[6px_6px_0px_0px_rgba(0,0,0,0.25)] p-5 flex items-center gap-3">
    <Link2 size={28} strokeWidth={3} />
    <div>
     <h1 className="text-4xl font-black uppercase tracking-tight">All Links</h1>
     <p className="text-sm font-bold uppercase tracking-wide">Quick-access map for signup, billing, account, and app routes.</p>
    </div>
   </div>

   <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
    {sections.map((section) => (
     <section
      key={section.title}
      className="border-[4px] border-black rounded-2xl bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,0.16)] p-5 space-y-3">
      <h2 className="text-2xl font-black uppercase tracking-tight">{section.title}</h2>
      <div className="space-y-2">
       {section.items.map((item) => (
        <a
         key={item.href}
         href={item.href}
         className="block border-[2px] border-black rounded-xl bg-[#f3f4f6] px-3 py-2 hover:bg-[#CCFF00] transition-colors">
         <p className="text-sm font-black uppercase">{item.label}</p>
         <p className="text-xs font-bold text-gray-700">{item.note}</p>
         <p className="text-[11px] font-black text-gray-500">{item.href}</p>
        </a>
       ))}
      </div>
     </section>
    ))}
   </div>
  </div>
 )
}

export default AllLinksPage
