import React, { useState } from "react"
import MobileMockupA from "./MobileMockupA"
import MobileMockupB from "./MobileMockupB"
import MobileMockupC from "./MobileMockupC"

/**
 * Mobile Layout Mockup Showcase
 * 
 * Displays three different mobile layout approaches for comparison:
 * 
 * A) Bottom Tab Navigation + Card Stack
 *    - Fixed bottom tab bar like iOS/Android native apps
 *    - Horizontal KPI carousel at top
 *    - Vertically stacked widget cards
 *    - FAB for quick AI actions
 * 
 * B) Drawer Navigation + Collapsible Sections
 *    - Hamburger menu with slide-out drawer
 *    - Accordion-style collapsible sections
 *    - Search bar in header
 *    - More traditional web-app feel
 * 
 * C) Gesture-Based Tabs + Hero Cards
 *    - Top pill navigation (swipeable feel)
 *    - Large hero metric card
 *    - Horizontal scrolling content rows
 *    - Dark header with light content area
 */

const MobileMockupShowcase: React.FC = () => {
  const [selectedMockup, setSelectedMockup] = useState<"A" | "B" | "C" | "all">("all")

  const mockups = [
    {
      id: "A" as const,
      title: "Bottom Tab Navigation",
      description: "Native app feel with fixed bottom tabs, KPI carousel, and floating action button",
      features: ["iOS/Android native pattern", "Swipeable KPI cards", "FAB for AI actions", "Stacked widget cards"],
      color: "#FF8AAF",
    },
    {
      id: "B" as const,
      title: "Drawer Navigation",
      description: "Traditional web app with hamburger menu, collapsible sections, and search",
      features: ["Slide-out drawer menu", "Accordion sections", "Search in header", "Channel info in drawer"],
      color: "#00CCFF",
    },
    {
      id: "C" as const,
      title: "Gesture-Based Tabs",
      description: "Modern hybrid with pill navigation, hero cards, and horizontal scrolling",
      features: ["Pill tab switcher", "Hero metric card", "Horizontal scroll rows", "Dark/light contrast"],
      color: "#CCFF00",
    },
  ]

  return (
    <div className="min-h-screen bg-[#1a1a1a] p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-4xl md:text-5xl font-[1000] uppercase tracking-tighter text-white mb-2">
          Mobile <span className="text-[#00CCFF]">Mockups</span>
        </h1>
        <p className="text-white/50 text-sm font-semibold">
          Three different layout approaches for Dashboard & Studio Hub on mobile
        </p>
      </div>

      {/* Selector */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedMockup("all")}
            className={`px-4 py-2 rounded-lg border-[2px] border-white/20 text-sm font-bold uppercase tracking-tight transition-all ${
              selectedMockup === "all"
                ? "bg-white text-black"
                : "text-white/60 hover:text-white"
            }`}
          >
            View All
          </button>
          {mockups.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMockup(m.id)}
              className={`px-4 py-2 rounded-lg border-[2px] text-sm font-bold uppercase tracking-tight transition-all ${
                selectedMockup === m.id
                  ? "border-black shadow-[3px_3px_0px_0px_black]"
                  : "border-white/20 text-white/60 hover:text-white"
              }`}
              style={{
                backgroundColor: selectedMockup === m.id ? m.color : "transparent",
                color: selectedMockup === m.id ? "black" : undefined,
              }}
            >
              Option {m.id}
            </button>
          ))}
        </div>
      </div>

      {/* Mockup Cards Overview (when "all" is selected) */}
      {selectedMockup === "all" && (
        <div className="max-w-7xl mx-auto mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockups.map((m) => (
            <div
              key={m.id}
              className="bg-white/5 rounded-2xl p-5 border border-white/10"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-[1000]"
                  style={{ backgroundColor: m.color }}
                >
                  {m.id}
                </div>
                <h3 className="text-white font-[900] text-sm uppercase tracking-tight">{m.title}</h3>
              </div>
              <p className="text-white/50 text-xs mb-4">{m.description}</p>
              <ul className="space-y-1">
                {m.features.map((f, i) => (
                  <li key={i} className="text-white/40 text-[10px] flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full" style={{ backgroundColor: m.color }} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Mockup Display */}
      <div className={`max-w-7xl mx-auto ${selectedMockup === "all" ? "grid grid-cols-1 lg:grid-cols-3 gap-6" : "flex justify-center"}`}>
        {(selectedMockup === "all" || selectedMockup === "A") && (
          <div className="flex flex-col items-center">
            <div className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] mb-3">
              Option A - Bottom Tabs
            </div>
            <div className="rounded-[40px] overflow-hidden border-[4px] border-white/20 shadow-2xl">
              <MobileMockupA />
            </div>
          </div>
        )}
        
        {(selectedMockup === "all" || selectedMockup === "B") && (
          <div className="flex flex-col items-center">
            <div className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] mb-3">
              Option B - Drawer Nav
            </div>
            <div className="rounded-[40px] overflow-hidden border-[4px] border-white/20 shadow-2xl">
              <MobileMockupB />
            </div>
          </div>
        )}
        
        {(selectedMockup === "all" || selectedMockup === "C") && (
          <div className="flex flex-col items-center">
            <div className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] mb-3">
              Option C - Pill Tabs
            </div>
            <div className="rounded-[40px] overflow-hidden border-[4px] border-white/20 shadow-2xl">
              <MobileMockupC />
            </div>
          </div>
        )}
      </div>

      {/* Feature Comparison */}
      {selectedMockup === "all" && (
        <div className="max-w-4xl mx-auto mt-12">
          <h2 className="text-white text-lg font-[900] uppercase tracking-tight mb-4 text-center">
            Feature Comparison
          </h2>
          <div className="bg-white/5 rounded-2xl overflow-hidden border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-white/50 font-bold uppercase text-xs">Feature</th>
                  <th className="p-4 text-center" style={{ color: "#FF8AAF" }}>A</th>
                  <th className="p-4 text-center" style={{ color: "#00CCFF" }}>B</th>
                  <th className="p-4 text-center" style={{ color: "#CCFF00" }}>C</th>
                </tr>
              </thead>
              <tbody className="text-white/70 text-xs">
                <tr className="border-b border-white/5">
                  <td className="p-4">Primary Navigation</td>
                  <td className="p-4 text-center">Bottom Tabs</td>
                  <td className="p-4 text-center">Drawer</td>
                  <td className="p-4 text-center">Top Pills</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="p-4">KPI Display</td>
                  <td className="p-4 text-center">Carousel</td>
                  <td className="p-4 text-center">Accordion</td>
                  <td className="p-4 text-center">Hero Card</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="p-4">Content Layout</td>
                  <td className="p-4 text-center">Stacked</td>
                  <td className="p-4 text-center">Collapsible</td>
                  <td className="p-4 text-center">Horizontal Scroll</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="p-4">Quick Actions</td>
                  <td className="p-4 text-center">FAB</td>
                  <td className="p-4 text-center">Header</td>
                  <td className="p-4 text-center">Chips</td>
                </tr>
                <tr>
                  <td className="p-4">Best For</td>
                  <td className="p-4 text-center">Native Feel</td>
                  <td className="p-4 text-center">Dense Info</td>
                  <td className="p-4 text-center">Visual Appeal</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default MobileMockupShowcase
