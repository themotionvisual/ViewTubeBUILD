import React, { useState } from "react"
import MobileMockupA from "./MobileMockupA"
import MobileMockupB from "./MobileMockupB"
import MobileMockupC from "./MobileMockupC"

const MobileMockupShowcase: React.FC = () => {
  const [active, setActive] = useState<"A" | "B" | "C">("A")

  const options = [
    { id: "A" as const, label: "Bottom Tabs", color: "#FF8AAF" },
    { id: "B" as const, label: "Drawer Nav", color: "#00CCFF" },
    { id: "C" as const, label: "Pill Tabs", color: "#CCFF00" },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-[#111]">
      {/* Sticky switcher bar */}
      <div className="sticky top-0 z-50 bg-[#111] border-b-[3px] border-white/10 px-4 py-3 flex gap-2">
        {options.map((o) => (
          <button
            key={o.id}
            onClick={() => setActive(o.id)}
            className="flex-1 py-2.5 rounded-xl border-[3px] border-black text-xs font-[900] uppercase tracking-tight transition-all"
            style={{
              backgroundColor: active === o.id ? o.color : "transparent",
              color: active === o.id ? "#000" : "#fff",
              borderColor: active === o.id ? "#000" : "rgba(255,255,255,0.15)",
              boxShadow: active === o.id ? "3px 3px 0px 0px #000" : "none",
            }}
          >
            <span className="block text-[10px] font-black">{o.id}</span>
            <span className="block text-[9px] font-bold opacity-80">{o.label}</span>
          </button>
        ))}
      </div>

      {/* Full-screen mockup — no wrapper, no frame */}
      <div className="flex-1">
        {active === "A" && <MobileMockupA />}
        {active === "B" && <MobileMockupB />}
        {active === "C" && <MobileMockupC />}
      </div>
    </div>
  )
}

export default MobileMockupShowcase
