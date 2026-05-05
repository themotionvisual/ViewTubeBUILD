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
    <div className="min-h-screen flex flex-col bg-[#f3f4f6]">
      {/* Sticky A/B/C switcher - always visible at top */}
      <div className="sticky top-0 z-[100] bg-black px-3 py-2 flex gap-2 safe-area-inset-top">
        {options.map((o) => (
          <button
            key={o.id}
            onClick={() => setActive(o.id)}
            className="flex-1 py-3 rounded-xl border-[3px] text-center font-[900] uppercase tracking-tight transition-all"
            style={{
              backgroundColor: active === o.id ? o.color : "rgba(255,255,255,0.1)",
              color: active === o.id ? "#000" : "#fff",
              borderColor: active === o.id ? "#000" : "transparent",
              boxShadow: active === o.id ? "3px 3px 0px 0px #000" : "none",
            }}
          >
            <span className="text-lg">{o.id}</span>
            <span className="block text-[8px] font-bold opacity-70 mt-0.5">{o.label}</span>
          </button>
        ))}
      </div>

      {/* Full-width mockup content */}
      <div className="flex-1 overflow-auto">
        {active === "A" && <MobileMockupA />}
        {active === "B" && <MobileMockupB />}
        {active === "C" && <MobileMockupC />}
      </div>
    </div>
  )
}

export default MobileMockupShowcase
