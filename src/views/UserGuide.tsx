import React, { useMemo } from "react"
import { Link, useLocation } from "react-router-dom"
import { BookOpen, CheckCircle2, AlertTriangle, Wrench } from "lucide-react"
import {
  GUIDE_LAST_UPDATED,
  GUIDE_PROTOCOL_VERSION,
  userGuideSections,
} from "../content/userGuideContent"

const UserGuide: React.FC = () => {
  const location = useLocation()
  const activeHash = useMemo(() => location.hash.replace("#", ""), [location.hash])

  return (
    <div className="max-w-6xl mx-auto px-4 pb-24 pt-6 space-y-6 animate-fade-in">
      <section className="border-[4px] border-black rounded-2xl bg-[#CCFF00] shadow-[8px_8px_0px_0px_black]">
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b-[4px] border-black">
          <div className="flex items-center gap-3">
            <BookOpen size={24} strokeWidth={3} className="text-black" />
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tight text-black">
                ViewTubeX User Guide
              </h1>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/75">
                Protocol {GUIDE_PROTOCOL_VERSION} • Last Updated {GUIDE_LAST_UPDATED}
              </p>
            </div>
          </div>
          <Link
            to="/settings"
            className="px-4 py-2 border-[3px] border-black rounded-xl bg-white font-black uppercase text-sm shadow-[3px_3px_0px_0px_black]"
          >
            Back to Settings
          </Link>
        </div>
        <div className="p-5 bg-white rounded-b-[12px]">
          <p className="font-bold text-sm text-gray-800">
            This guide covers all live routes and core hidden tools in a practical format:
            How-To, Troubleshooting, and QA checks.
          </p>
        </div>
      </section>

      <section className="border-[4px] border-black rounded-2xl bg-white shadow-[6px_6px_0px_0px_black] p-4">
        <h2 className="text-lg font-black uppercase tracking-tight mb-3">Section Navigation</h2>
        <div className="flex flex-wrap gap-2">
          {userGuideSections.map((section) => {
            const isActive = activeHash === section.id
            return (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={`px-3 py-2 border-[3px] border-black rounded-xl text-xs font-black uppercase tracking-wide shadow-[2px_2px_0px_0px_black] ${
                  isActive ? "bg-[#40C6E9]" : "bg-[#E5E7EB]"
                }`}
              >
                {section.title}
              </a>
            )
          })}
        </div>
      </section>

      {userGuideSections.map((section) => (
        <section
          key={section.id}
          id={section.id}
          className="scroll-mt-24 border-[4px] border-black rounded-2xl bg-white shadow-[6px_6px_0px_0px_black] overflow-hidden"
        >
          <div className="px-5 py-4 border-b-[4px] border-black bg-[#FF8AAF]">
            <h3 className="text-2xl font-black uppercase tracking-tight">{section.title}</h3>
            <p className="text-xs font-bold uppercase tracking-[0.18em] mt-1">{section.audience}</p>
            <p className="text-xs font-bold mt-2">
              Routes: {section.routeRefs.join(" • ")}
            </p>
          </div>
          <div className="p-4 space-y-4">
            {section.tools.map((tool) => (
              <article
                key={tool.toolId}
                className="border-[3px] border-black rounded-xl bg-[#F3F4F6] p-4 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-lg font-black uppercase tracking-tight">{tool.toolName}</h4>
                    <p className="text-xs font-bold uppercase tracking-[0.14em]">
                      Route: {tool.routeRef}
                    </p>
                  </div>
                </div>

                <div className="border-[2px] border-black rounded-lg bg-white p-3">
                  <p className="text-xs font-black uppercase tracking-[0.14em] mb-1">What It Does</p>
                  <p className="text-sm font-bold text-gray-800">{tool.whatItDoes}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  <div className="border-[2px] border-black rounded-lg bg-white p-3">
                    <p className="text-xs font-black uppercase tracking-[0.14em] mb-2 flex items-center gap-1">
                      <Wrench size={14} /> How To Use
                    </p>
                    <ol className="space-y-1 text-sm font-bold list-decimal pl-4">
                      {tool.howToSteps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                  </div>

                  <div className="border-[2px] border-black rounded-lg bg-white p-3">
                    <p className="text-xs font-black uppercase tracking-[0.14em] mb-2 flex items-center gap-1">
                      <AlertTriangle size={14} /> Troubleshooting
                    </p>
                    <ul className="space-y-1 text-sm font-bold list-disc pl-4">
                      {tool.troubleshooting.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-[2px] border-black rounded-lg bg-white p-3">
                    <p className="text-xs font-black uppercase tracking-[0.14em] mb-2 flex items-center gap-1">
                      <CheckCircle2 size={14} /> QA Checklist
                    </p>
                    <ul className="space-y-1 text-sm font-bold list-disc pl-4">
                      {tool.qaChecks.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

export default UserGuide

