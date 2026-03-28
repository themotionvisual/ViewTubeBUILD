"use client"

import { useState } from "react"

// Neo-Brutalist Variants (Set A)
import {
  ButtonV1, ButtonV2, ButtonV3, ButtonV4, ButtonV5, ButtonV6, ButtonV7, ButtonV8, ButtonV9, ButtonV10,
  CardV1, CardV2, CardV3, CardV4, CardV5, CardV6, CardV7, CardV8, CardV9, CardV10,
  InputV1, InputV2, InputV3, InputV4, InputV5, InputV6, InputV7, InputV8, InputV9, InputV10,
  BadgeV1, BadgeV2, BadgeV3, BadgeV4, BadgeV5, BadgeV6, BadgeV7, BadgeV8, BadgeV9, BadgeV10,
  AccordionV1, AccordionV2, AccordionV3, AccordionV4, AccordionV5, AccordionV6, AccordionV7, AccordionV8, AccordionV9, AccordionV10,
  CheckboxV1, CheckboxV2, CheckboxV3, CheckboxV4, CheckboxV5, CheckboxV6, CheckboxV7, CheckboxV8, CheckboxV9, CheckboxV10,
  ProgressBarV1, ProgressBarV2, ProgressBarV3, ProgressBarV4, ProgressBarV5, ProgressBarV6, ProgressBarV7, ProgressBarV8, ProgressBarV9, ProgressBarV10,
  SwitchV1, SwitchV2, SwitchV3, SwitchV4, SwitchV5, SwitchV6, SwitchV7, SwitchV8, SwitchV9, SwitchV10,
} from "@/components/variants/neo-brutalist-variants"

// Retro-Futuristic Variants (Set B)
import {
  RetroButtonV1, RetroButtonV2, RetroButtonV3, RetroButtonV4, RetroButtonV5, RetroButtonV6, RetroButtonV7, RetroButtonV8, RetroButtonV9, RetroButtonV10,
  RetroCardV1, RetroCardV2, RetroCardV3, RetroCardV4, RetroCardV5, RetroCardV6, RetroCardV7, RetroCardV8, RetroCardV9, RetroCardV10,
  RetroInputV1, RetroInputV2, RetroInputV3, RetroInputV4, RetroInputV5, RetroInputV6, RetroInputV7, RetroInputV8, RetroInputV9, RetroInputV10,
  RetroBadgeV1, RetroBadgeV2, RetroBadgeV3, RetroBadgeV4, RetroBadgeV5, RetroBadgeV6, RetroBadgeV7, RetroBadgeV8, RetroBadgeV9, RetroBadgeV10,
  RetroProgressV1, RetroProgressV2, RetroProgressV3, RetroProgressV4, RetroProgressV5, RetroProgressV6, RetroProgressV7, RetroProgressV8, RetroProgressV9, RetroProgressV10,
  RetroSwitchV1, RetroSwitchV2, RetroSwitchV3, RetroSwitchV4, RetroSwitchV5, RetroSwitchV6, RetroSwitchV7, RetroSwitchV8, RetroSwitchV9, RetroSwitchV10,
} from "@/components/variants/retro-futuristic-variants"

type StyleSet = "neo" | "retro"

export default function ComponentShowcase() {
  const [activeSet, setActiveSet] = useState<StyleSet>("neo")
  const [activeComponent, setActiveComponent] = useState("buttons")

  const components = [
    { id: "buttons", label: "Buttons" },
    { id: "cards", label: "Cards" },
    { id: "inputs", label: "Inputs" },
    { id: "badges", label: "Badges" },
    { id: "accordions", label: "Accordions" },
    { id: "checkboxes", label: "Checkboxes" },
    { id: "progress", label: "Progress Bars" },
    { id: "switches", label: "Switches" },
  ]

  return (
    <div className={`min-h-screen ${activeSet === "retro" ? "bg-[#0a0a0f]" : "bg-[#f3f4f6]"}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 border-b-4 ${
        activeSet === "retro" 
          ? "bg-[#1a1a2e] border-[#00d4ff]" 
          : "bg-white border-black"
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className={`text-2xl font-black uppercase tracking-wider ${
              activeSet === "retro" ? "text-[#00d4ff]" : "text-black"
            }`}>
              Component Variants Library
            </h1>
            
            {/* Style Set Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveSet("neo")}
                className={`px-4 py-2 font-bold uppercase text-sm border-3 transition-all ${
                  activeSet === "neo"
                    ? "bg-[#ff66cc] border-black shadow-[4px_4px_0px_black] -translate-x-1 -translate-y-1"
                    : "bg-white border-black hover:bg-gray-100"
                }`}
              >
                Set A: Neo-Brutalist
              </button>
              <button
                onClick={() => setActiveSet("retro")}
                className={`px-4 py-2 font-bold uppercase text-sm border-2 transition-all ${
                  activeSet === "retro"
                    ? "bg-[#00d4ff] border-[#00d4ff] text-black shadow-[0_0_15px_#00d4ff]"
                    : "bg-[#1a1a2e] border-white/30 text-white hover:border-[#00d4ff]"
                }`}
              >
                Set B: Retro-Futuristic
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Component Navigation */}
        <nav className={`mb-8 flex flex-wrap gap-2 p-4 border-4 ${
          activeSet === "retro"
            ? "bg-[#1a1a2e] border-white/30"
            : "bg-white border-black shadow-[4px_4px_0px_black]"
        }`}>
          {components.map((comp) => (
            <button
              key={comp.id}
              onClick={() => setActiveComponent(comp.id)}
              className={`px-4 py-2 font-bold uppercase text-sm transition-all ${
                activeSet === "retro"
                  ? activeComponent === comp.id
                    ? "bg-[#ff1493] text-white shadow-[0_0_10px_#ff1493]"
                    : "bg-transparent text-white/70 hover:text-[#ff1493]"
                  : activeComponent === comp.id
                    ? "bg-[#ccff00] border-3 border-black shadow-[3px_3px_0px_black] -translate-x-0.5 -translate-y-0.5"
                    : "bg-white border-3 border-black hover:bg-gray-100"
              }`}
            >
              {comp.label}
            </button>
          ))}
        </nav>

        {/* Component Grid */}
        <div className={`p-6 border-4 ${
          activeSet === "retro"
            ? "bg-[#1a1a2e] border-white/30"
            : "bg-white border-black shadow-[6px_6px_0px_black]"
        }`}>
          {/* Buttons */}
          {activeComponent === "buttons" && (
            <div>
              <h2 className={`text-xl font-black uppercase mb-6 ${
                activeSet === "retro" ? "text-[#00d4ff]" : "text-black"
              }`}>
                Button Variants (10 Versions)
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {activeSet === "neo" ? (
                  <>
                    <div className="flex flex-col items-center gap-2">
                      <ButtonV1>Classic</ButtonV1>
                      <span className="text-xs font-bold">V1</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <ButtonV2>Chunky</ButtonV2>
                      <span className="text-xs font-bold">V2</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <ButtonV3>Ghost</ButtonV3>
                      <span className="text-xs font-bold">V3</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 py-2">
                      <ButtonV4>Stacked</ButtonV4>
                      <span className="text-xs font-bold">V4</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <ButtonV5>Split</ButtonV5>
                      <span className="text-xs font-bold">V5</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <ButtonV6>Pill</ButtonV6>
                      <span className="text-xs font-bold">V6</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <ButtonV7>Icon</ButtonV7>
                      <span className="text-xs font-bold">V7</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <ButtonV8>Press</ButtonV8>
                      <span className="text-xs font-bold">V8</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <ButtonV9>Underline</ButtonV9>
                      <span className="text-xs font-bold">V9</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <ButtonV10>Neon</ButtonV10>
                      <span className="text-xs font-bold">V10</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col items-center gap-2">
                      <RetroButtonV1>Neon</RetroButtonV1>
                      <span className="text-xs font-bold text-white/50">V1</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <RetroButtonV2>Checker</RetroButtonV2>
                      <span className="text-xs font-bold text-white/50">V2</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <RetroButtonV3>Speed</RetroButtonV3>
                      <span className="text-xs font-bold text-white/50">V3</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 py-6">
                      <RetroButtonV4>Star</RetroButtonV4>
                      <span className="text-xs font-bold text-white/50">V4</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <RetroButtonV5>Scan</RetroButtonV5>
                      <span className="text-xs font-bold text-white/50">V5</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <RetroButtonV6>Gradient</RetroButtonV6>
                      <span className="text-xs font-bold text-white/50">V6</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <RetroButtonV7>Pixel</RetroButtonV7>
                      <span className="text-xs font-bold text-white/50">V7</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <RetroButtonV8>Comic</RetroButtonV8>
                      <span className="text-xs font-bold text-white/50">V8</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <RetroButtonV9>Holo</RetroButtonV9>
                      <span className="text-xs font-bold text-white/50">V9</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <RetroButtonV10>Double</RetroButtonV10>
                      <span className="text-xs font-bold text-white/50">V10</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Cards */}
          {activeComponent === "cards" && (
            <div>
              <h2 className={`text-xl font-black uppercase mb-6 ${
                activeSet === "retro" ? "text-[#00d4ff]" : "text-black"
              }`}>
                Card Variants (10 Versions)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeSet === "neo" ? (
                  <>
                    <CardV1 title="V1 Classic"><p>Standard card with colored header.</p></CardV1>
                    <div className="pt-6"><CardV2 title="V2 Offset"><p>Floating header design.</p></CardV2></div>
                    <CardV3 title="V3 Side Accent"><p>Left border accent.</p></CardV3>
                    <CardV4 title="V4 Notched"><p>Corner notch detail.</p></CardV4>
                    <CardV5 title="V5 Gradient"><p>Gradient header.</p></CardV5>
                    <div className="pt-4"><CardV6 title="V6 Stacked"><p>Multiple layer effect.</p></CardV6></div>
                    <CardV7 title="V7 Badge"><p>With status badge.</p></CardV7>
                    <CardV8 title="V8 Striped"><p>Striped background.</p></CardV8>
                    <CardV9 title="V9 Inverted"><p className="text-white">Dark mode style.</p></CardV9>
                    <CardV10 title="V10 Double"><p>Double border frame.</p></CardV10>
                  </>
                ) : (
                  <>
                    <RetroCardV1 title="V1 Neon"><p>Glowing border effect.</p></RetroCardV1>
                    <RetroCardV2 title="V2 Checker"><p>Checkered header pattern.</p></RetroCardV2>
                    <RetroCardV3 title="V3 Gradient"><p>Gradient border frame.</p></RetroCardV3>
                    <RetroCardV4 title="V4 Scan"><p>Scan line overlay.</p></RetroCardV4>
                    <RetroCardV5 title="V5 Corners"><p>Corner accent markers.</p></RetroCardV5>
                    <RetroCardV6 title="V6 Glitch"><p>Glitch effect layers.</p></RetroCardV6>
                    <RetroCardV7 title="V7 Stripe"><p>Diagonal stripe header.</p></RetroCardV7>
                    <RetroCardV8 title="V8 Dotted"><p>Dashed border style.</p></RetroCardV8>
                    <RetroCardV9 title="V9 Inverted"><p>Light on dark contrast.</p></RetroCardV9>
                    <RetroCardV10 title="V10 Cyber"><p>Cyberpunk glow effect.</p></RetroCardV10>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Inputs */}
          {activeComponent === "inputs" && (
            <div>
              <h2 className={`text-xl font-black uppercase mb-6 ${
                activeSet === "retro" ? "text-[#00d4ff]" : "text-black"
              }`}>
                Input Variants (10 Versions)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeSet === "neo" ? (
                  <>
                    <InputV1 label="V1 Classic" placeholder="Type here..." />
                    <InputV2 label="V2 Underline" placeholder="Type here..." />
                    <InputV3 label="V3 Filled" placeholder="Type here..." />
                    <InputV4 label="V4 With Icon" placeholder="Username" />
                    <InputV5 label="V5 Floating" placeholder="Enter text..." />
                    <InputV6 label="V6 Shadow" placeholder="Type here..." />
                    <InputV7 label="V7 Accent" placeholder="Type here..." />
                    <InputV8 label="V8 Chunky" placeholder="Bold input" />
                    <InputV9 label="V9 Minimal" placeholder="Type here..." />
                    <InputV10 label="V10 Boxed" placeholder="Type here..." />
                  </>
                ) : (
                  <>
                    <RetroInputV1 label="V1 Neon Glow" placeholder="Type here..." />
                    <RetroInputV2 label="V2 Underline" placeholder="Type here..." />
                    <RetroInputV3 label="V3 Gradient" placeholder="Type here..." />
                    <RetroInputV4 label="V4 Scan Lines" placeholder="Type here..." />
                    <RetroInputV5 label="V5 Cyberpunk" placeholder="Enter command..." />
                    <RetroInputV6 label="V6 Pill" placeholder="Type here..." />
                    <RetroInputV7 label="V7 Accent" placeholder="Type here..." />
                    <RetroInputV8 label="V8 Double" placeholder="Type here..." />
                    <RetroInputV9 label="V9 Glowing" placeholder="Type here..." />
                    <RetroInputV10 label="V10 Matrix" placeholder="Enter data..." />
                  </>
                )}
              </div>
            </div>
          )}

          {/* Badges */}
          {activeComponent === "badges" && (
            <div>
              <h2 className={`text-xl font-black uppercase mb-6 ${
                activeSet === "retro" ? "text-[#00d4ff]" : "text-black"
              }`}>
                Badge Variants (10 Versions)
              </h2>
              <div className="flex flex-wrap gap-4 items-center">
                {activeSet === "neo" ? (
                  <>
                    <BadgeV1>V1 Classic</BadgeV1>
                    <BadgeV2>V2 Pill</BadgeV2>
                    <BadgeV3>V3 Shadow</BadgeV3>
                    <BadgeV4>V4 Inverted</BadgeV4>
                    <BadgeV5>V5 Outline</BadgeV5>
                    <BadgeV6>V6 Dot</BadgeV6>
                    <BadgeV7>V7 Rotated</BadgeV7>
                    <BadgeV8>V8 Stacked</BadgeV8>
                    <BadgeV9>V9 Icon</BadgeV9>
                    <BadgeV10>V10 Double</BadgeV10>
                  </>
                ) : (
                  <>
                    <RetroBadgeV1>V1 Neon</RetroBadgeV1>
                    <RetroBadgeV2>V2 Outline</RetroBadgeV2>
                    <RetroBadgeV3>V3 Gradient</RetroBadgeV3>
                    <RetroBadgeV4>V4 Pill</RetroBadgeV4>
                    <RetroBadgeV5>V5 Bordered</RetroBadgeV5>
                    <RetroBadgeV6>V6 Glitch</RetroBadgeV6>
                    <RetroBadgeV7>V7 Dot</RetroBadgeV7>
                    <RetroBadgeV8>V8 Angled</RetroBadgeV8>
                    <RetroBadgeV9>V9 Inverted</RetroBadgeV9>
                    <RetroBadgeV10>V10 Striped</RetroBadgeV10>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Accordions */}
          {activeComponent === "accordions" && (
            <div>
              <h2 className={`text-xl font-black uppercase mb-6 ${
                activeSet === "retro" ? "text-[#00d4ff]" : "text-black"
              }`}>
                Accordion Variants (10 Versions)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeSet === "neo" ? (
                  <>
                    <AccordionV1 title="V1 Classic" color="#ff66cc"><p>Standard accordion with toggle.</p></AccordionV1>
                    <AccordionV2 title="V2 Slide" color="#ccff00"><p>Smooth slide animation.</p></AccordionV2>
                    <AccordionV3 title="V3 Bordered" color="#00ccff"><p>Left border accent.</p></AccordionV3>
                    <AccordionV4 title="V4 Minimal"><p>Underline style.</p></AccordionV4>
                    <div className="pt-2"><AccordionV5 title="V5 Stacked" color="#ffdd00"><p>Multiple layer effect.</p></AccordionV5></div>
                    <AccordionV6 title="V6 Icon" color="#ffb158"><p>With icon prefix.</p></AccordionV6>
                    <AccordionV7 title="V7 Tab" color="#ff66cc"><p>Tab-like appearance.</p></AccordionV7>
                    <AccordionV8 title="V8 Numbered" color="#ccff00"><p>With step number.</p></AccordionV8>
                    <AccordionV9 title="V9 Full Width" color="#00ccff"><p>Large header style.</p></AccordionV9>
                    <AccordionV10 title="V10 Gradient"><p>Gradient header.</p></AccordionV10>
                  </>
                ) : (
                  <div className="col-span-2 text-center py-12 text-white/50">
                    <p className="text-lg">Retro-Futuristic accordion variants use the same patterns.</p>
                    <p className="text-sm mt-2">Switch to Neo-Brutalist to see all accordion variants.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Checkboxes */}
          {activeComponent === "checkboxes" && (
            <div>
              <h2 className={`text-xl font-black uppercase mb-6 ${
                activeSet === "retro" ? "text-[#00d4ff]" : "text-black"
              }`}>
                Checkbox Variants (10 Versions)
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {activeSet === "neo" ? (
                  <>
                    <CheckboxV1 label="V1 Classic" />
                    <CheckboxV2 label="V2 Shadow" />
                    <CheckboxV3 label="V3 Circle" />
                    <CheckboxV4 label="V4 Cross" />
                    <CheckboxV5 label="V5 Fill" />
                    <CheckboxV6 label="V6 Toggle" />
                    <CheckboxV7 label="V7 Star" />
                    <CheckboxV8 label="V8 Strike" />
                    <CheckboxV9 label="V9 Large" />
                    <CheckboxV10 label="V10 Invert" />
                  </>
                ) : (
                  <div className="col-span-5 text-center py-12 text-white/50">
                    <p className="text-lg">Retro-Futuristic checkbox variants use the same patterns.</p>
                    <p className="text-sm mt-2">Switch to Neo-Brutalist to see all checkbox variants.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Progress Bars */}
          {activeComponent === "progress" && (
            <div>
              <h2 className={`text-xl font-black uppercase mb-6 ${
                activeSet === "retro" ? "text-[#00d4ff]" : "text-black"
              }`}>
                Progress Bar Variants (10 Versions)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeSet === "neo" ? (
                  <>
                    <ProgressBarV1 value={65} label="V1 Classic" />
                    <ProgressBarV2 value={45} label="V2 Chunky" />
                    <ProgressBarV3 value={70} label="V3 Segmented" />
                    <ProgressBarV4 value={55} label="V4 Gradient" />
                    <ProgressBarV5 value={80} label="V5 Striped" />
                    <ProgressBarV6 value={60} label="V6 Labeled" />
                    <ProgressBarV7 value={75} label="V7 Thin" />
                    <ProgressBarV8 value={50} label="V8 Bullet" />
                    <ProgressBarV9 value={85} label="V9 Stacked" />
                    <div className="bg-black p-4">
                      <ProgressBarV10 value={40} label="V10 Inverted" />
                    </div>
                  </>
                ) : (
                  <>
                    <RetroProgressV1 value={65} label="V1 Neon" />
                    <RetroProgressV2 value={45} label="V2 Gradient" />
                    <RetroProgressV3 value={70} label="V3 Segmented" />
                    <RetroProgressV4 value={55} label="V4 Scan Lines" />
                    <RetroProgressV5 value={80} label="V5 Thick" />
                    <RetroProgressV6 value={60} label="V6 Striped" />
                    <RetroProgressV7 value={75} label="V7 Minimal" />
                    <RetroProgressV8 value={50} label="V8 Labeled" />
                    <RetroProgressV9 value={85} label="V9 Double" />
                    <RetroProgressV10 value={40} label="V10 Pixel" />
                  </>
                )}
              </div>
            </div>
          )}

          {/* Switches */}
          {activeComponent === "switches" && (
            <div>
              <h2 className={`text-xl font-black uppercase mb-6 ${
                activeSet === "retro" ? "text-[#00d4ff]" : "text-black"
              }`}>
                Switch Variants (10 Versions)
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {activeSet === "neo" ? (
                  <>
                    <SwitchV1 label="V1" />
                    <SwitchV2 label="V2" />
                    <SwitchV3 label="V3" />
                    <SwitchV4 label="V4" />
                    <SwitchV5 label="V5" />
                    <SwitchV6 label="V6" />
                    <SwitchV7 label="V7" />
                    <SwitchV8 label="V8" />
                    <SwitchV9 label="V9" />
                    <SwitchV10 label="V10" />
                  </>
                ) : (
                  <>
                    <RetroSwitchV1 label="V1" />
                    <RetroSwitchV2 label="V2" />
                    <RetroSwitchV3 label="V3" />
                    <RetroSwitchV4 label="V4" />
                    <RetroSwitchV5 label="V5" />
                    <RetroSwitchV6 label="V6" />
                    <RetroSwitchV7 label="V7" />
                    <RetroSwitchV8 label="V8" />
                    <RetroSwitchV9 label="V9" />
                    <RetroSwitchV10 label="V10" />
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Style Guide Footer */}
        <footer className={`mt-8 p-6 border-4 ${
          activeSet === "retro"
            ? "bg-[#1a1a2e] border-white/30 text-white/70"
            : "bg-white border-black text-black shadow-[4px_4px_0px_black]"
        }`}>
          <h3 className={`text-lg font-black uppercase mb-4 ${
            activeSet === "retro" ? "text-[#ff1493]" : "text-black"
          }`}>
            {activeSet === "neo" ? "Neo-Brutalist Style Guide (Set A)" : "Retro-Futuristic Style Guide (Set B)"}
          </h3>
          {activeSet === "neo" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <h4 className="font-bold uppercase mb-2">Colors</h4>
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-[#ff66cc] border-2 border-black" title="Pink" />
                  <div className="w-8 h-8 bg-[#ccff00] border-2 border-black" title="Lime" />
                  <div className="w-8 h-8 bg-[#00ccff] border-2 border-black" title="Cyan" />
                  <div className="w-8 h-8 bg-[#ffdd00] border-2 border-black" title="Yellow" />
                  <div className="w-8 h-8 bg-[#ffb158] border-2 border-black" title="Orange" />
                </div>
              </div>
              <div>
                <h4 className="font-bold uppercase mb-2">Borders</h4>
                <p>3-4px solid black borders on all elements</p>
              </div>
              <div>
                <h4 className="font-bold uppercase mb-2">Shadows</h4>
                <p>Hard-edge offset shadows (4-6px, no blur)</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <h4 className="font-bold uppercase mb-2 text-[#00d4ff]">Colors</h4>
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-[#00d4ff] border border-white/30" title="Electric Blue" />
                  <div className="w-8 h-8 bg-[#ff1493] border border-white/30" title="Hot Pink" />
                  <div className="w-8 h-8 bg-[#39ff14] border border-white/30" title="Neon Green" />
                  <div className="w-8 h-8 bg-[#8b5cf6] border border-white/30" title="Violet" />
                  <div className="w-8 h-8 bg-[#ffff00] border border-white/30" title="Yellow" />
                </div>
              </div>
              <div>
                <h4 className="font-bold uppercase mb-2 text-[#00d4ff]">Effects</h4>
                <p>Neon glow, scan lines, checkered patterns</p>
              </div>
              <div>
                <h4 className="font-bold uppercase mb-2 text-[#00d4ff]">Background</h4>
                <p>Dark surfaces with vibrant neon accents</p>
              </div>
            </div>
          )}
        </footer>
      </div>
    </div>
  )
}
