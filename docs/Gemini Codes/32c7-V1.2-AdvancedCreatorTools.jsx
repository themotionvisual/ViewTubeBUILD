import React, { useState } from 'react';
import { 
  FileText, SplitSquareHorizontal, Megaphone, 
  Volume2, Briefcase, Rocket, Image as ImageIcon,
  Plus, Check, X, Play, BarChart, Crosshair, Sparkles
} from 'lucide-react';

// Brand Colors from the reference UI
const COLORS = {
  lime: '#C9F830',
  cyan: '#24D3FF',
  pink: '#FF7497',
  yellow: '#FFE357',
  orange: '#FCAF57',
  purple: '#B14AED',
};

// --- Core Reusable Neo-Brutalist Wrapper ---
const ToolboxModule = ({ title, icon: Icon, mainColor, iconColor, children }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="w-full bg-white overflow-hidden relative flex flex-col shrink-0 transition-all duration-300 border-[4px] border-black rounded-[16px] shadow-[8px_8px_0px_0px_black] mb-8">
      {/* Header matching the exact reference code style */}
      <header 
        onClick={() => setIsOpen(!isOpen)}
        className="h-[64px] min-h-[64px] flex items-center justify-between select-none relative z-20 cursor-pointer border-b-[4px] border-black group"
        style={{ backgroundColor: mainColor }}
      >
        <div className="flex items-center h-full flex-1">
          <div 
            className="h-full w-[64px] flex items-center justify-center shrink-0 border-r-[4px] border-black"
            style={{ backgroundColor: iconColor }}
          >
            <Icon className="text-black" size={32} strokeWidth={2.5} />
          </div>
          <div className="flex items-center pl-4 h-full pointer-events-none select-none">
            <h3 className="font-[900] uppercase tracking-tighter text-black leading-none text-[32px] md:text-[42px] pt-1">
              {title}
            </h3>
          </div>
        </div>
        
        {/* Expand/Collapse Toggle */}
        <div className="flex items-center justify-center w-[64px] h-full border-l-[4px] border-black bg-white/20 hover:bg-white/40 transition-colors">
          <div className="w-8 h-8 border-[3px] border-black rounded-full flex items-center justify-center bg-white shadow-[2px_2px_0px_0px_black]">
            <Plus className={`transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`} size={20} strokeWidth={4} />
          </div>
        </div>
      </header>

      {/* Expandable Content Area */}
      <div className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden min-h-0">
          <main className="bg-[#f8fafc] w-full p-4 md:p-6 text-black flex flex-col gap-4">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

// --- Mini Reusable UI Elements ---
const BrutalistInput = ({ placeholder, defaultValue = "" }) => (
  <input 
    type="text"
    placeholder={placeholder} 
    defaultValue={defaultValue}
    className="w-full h-[48px] px-4 border-[3px] border-black font-black uppercase text-sm rounded-xl outline-none focus:ring-[4px] focus:ring-[#C9F830]/50 transition-all bg-white shadow-[2px_2px_0px_0px_black] focus:shadow-[4px_4px_0px_0px_black]" 
  />
);

const BrutalistBtn = ({ children, color = COLORS.lime, className = "" }) => (
  <button 
    className={`h-[48px] border-[3px] border-black rounded-xl font-[900] uppercase tracking-tight text-sm px-6 flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_black] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_black] active:translate-y-1 active:shadow-[0px_0px_0px_0px_black] transition-all ${className}`}
    style={{ backgroundColor: color }}
  >
    {children}
  </button>
);


export default function AdvancedCreatorTools() {
  return (
    <div className="min-h-screen bg-[#e5e5e5] p-4 md:p-8 font-sans selection:bg-[#CCFF00]">
      
      {/* Global Header */}
      <header className="max-w-[1200px] mx-auto bg-white h-[80px] rounded-[16px] border-[6px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,0.5)] flex items-center justify-between mb-10 overflow-hidden z-30 relative">
        <div className="flex items-center h-full flex-1">
          <div className="h-full w-[80px] flex items-center justify-center shrink-0 bg-black">
            <Sparkles size={40} strokeWidth={2.5} className="text-[#C9F830]" />
          </div>
          <h1 className="text-[28px] md:text-[46px] font-[1000] uppercase tracking-tighter leading-none pl-6 text-black mt-1">
            CREATOR STUDIO SUITE
          </h1>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto">
        
        {/* MODULE 1: A/B THUMBNAIL LAB */}
        <ToolboxModule title="A/B/C Test Lab" icon={SplitSquareHorizontal} mainColor={COLORS.yellow} iconColor={COLORS.cyan}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['A', 'B', 'C'].map((variant, i) => (
              <div key={variant} className="flex flex-col gap-3 p-4 bg-white border-[4px] border-black rounded-2xl shadow-[4px_4px_0px_0px_black]">
                <div className="flex items-center justify-between border-b-[3px] border-black pb-2">
                  <span className="font-[1000] text-2xl uppercase">Variant {variant}</span>
                  {i === 1 && <span className="bg-[#C9F830] border-2 border-black rounded-md px-2 py-0.5 text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_black] rotate-3">AI Favored</span>}
                </div>
                
                {/* Image Dropzone */}
                <div className="w-full aspect-video border-[3px] border-[#9ca3af] border-dashed rounded-xl bg-gray-50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-100 transition-colors">
                  <ImageIcon size={32} className="opacity-40" />
                  <span className="text-[10px] font-black uppercase text-black/50">Drop Image {variant}</span>
                </div>
                
                <BrutalistInput placeholder={`TITLE VARIANT ${variant}...`} defaultValue={i === 0 ? "I Survived 50 Days..." : ""} />
                
                {/* Prediction Gauge */}
                <div className="w-full bg-gray-200 border-[3px] border-black rounded-full h-6 mt-2 relative overflow-hidden">
                  <div 
                    className="h-full border-r-[3px] border-black bg-gradient-to-r from-[#FF7497] via-[#FFE357] to-[#C9F830]" 
                    style={{ width: i === 0 ? '65%' : i === 1 ? '85%' : '40%' }} 
                  />
                  <div className="absolute inset-0 flex items-center justify-center font-black text-[10px] mix-blend-difference text-white">
                    Est. CTR: {i === 0 ? '5.2%' : i === 1 ? '8.4%' : '3.1%'}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <BrutalistBtn color={COLORS.cyan} className="w-full md:w-auto text-lg h-[60px]">
              <Rocket size={24} /> LAUNCH LIVE TEST ON YOUTUBE
            </BrutalistBtn>
          </div>
        </ToolboxModule>

        {/* MODULE 2: SCRIPT ARCHITECT */}
        <ToolboxModule title="Script Architect" icon={FileText} mainColor={COLORS.cyan} iconColor={COLORS.pink}>
          <div className="flex flex-col md:flex-row gap-6 h-[500px]">
            {/* Editor Area */}
            <div className="flex-1 border-[4px] border-black bg-white rounded-2xl flex flex-col overflow-hidden shadow-[4px_4px_0px_0px_black]">
              <div className="h-[48px] bg-black text-white flex items-center px-4 font-black uppercase tracking-widest text-sm border-b-[4px] border-black shrink-0">
                Main Editor - Scene 1
              </div>
              <textarea 
                className="flex-1 w-full p-4 resize-none outline-none font-bold text-lg leading-relaxed text-gray-800 placeholder:text-gray-300"
                placeholder="Start writing your masterpiece...&#10;&#10;[0:00] HOOK:&#10;In this video, I am going to..."
                defaultValue={"[0:00] HOOK:\nIn this video, I'm locking myself in a completely white room for 50 hours to see what happens to my mind.\n\n[0:30] INTRO:\nThe rules are simple. No phones, no clocks, no windows. Just me, white walls, and a camera.\n\n[1:15] ACT 1: THE DESCENT\nHour 1: I'm feeling confident. It's just like a vacation, right?"}
              />
              <div className="h-[48px] bg-[#f8fafc] border-t-[4px] border-black flex items-center px-4 gap-4 shrink-0">
                <span className="font-black text-[10px] uppercase bg-[#C9F830] border-2 border-black px-2 py-1 rounded">450 Words</span>
                <span className="font-black text-[10px] uppercase bg-[#24D3FF] border-2 border-black px-2 py-1 rounded">~3 Mins Est.</span>
              </div>
            </div>

            {/* Pacing Sidebar */}
            <div className="w-full md:w-[320px] flex flex-col gap-4">
              <div className="bg-white border-[4px] border-black rounded-2xl p-4 shadow-[4px_4px_0px_0px_black]">
                <h4 className="font-black uppercase text-xl border-b-[3px] border-black pb-2 mb-4">Video Pacing</h4>
                <div className="flex flex-col gap-3">
                  {[
                    { label: 'The Hook', time: '0:00 - 0:30', c: 'bg-[#FF7497]' },
                    { label: 'Context Build', time: '0:30 - 2:00', c: 'bg-[#FCAF57]' },
                    { label: 'Escalation', time: '2:00 - 6:00', c: 'bg-[#FFE357]' },
                    { label: 'The Climax', time: '6:00 - 8:30', c: 'bg-[#C9F830]' },
                    { label: 'Payoff & Outro', time: '8:30 - 9:00', c: 'bg-[#24D3FF]' },
                  ].map((p, i) => (
                    <div key={i} className="flex items-center gap-3 group cursor-pointer">
                      <div className={`w-8 h-8 ${p.c} border-[3px] border-black rounded-lg flex items-center justify-center font-black text-xs shadow-[2px_2px_0px_0px_black] group-hover:-translate-y-1 transition-transform`}>
                        {i+1}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-[900] uppercase text-sm leading-none">{p.label}</span>
                        <span className="font-bold text-[10px] text-gray-500">{p.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <BrutalistBtn className="w-full mt-6 h-[40px] text-xs" color="white">
                  + Add Scene Block
                </BrutalistBtn>
              </div>
            </div>
          </div>
        </ToolboxModule>

        {/* MODULE 3: SFX SOUNDBOARD */}
        <ToolboxModule title="SFX Soundboard" icon={Volume2} mainColor={COLORS.orange} iconColor={COLORS.yellow}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { t: 'Sub Drop', c: COLORS.lime },
              { t: 'Riser Long', c: COLORS.cyan },
              { t: 'Whoosh Fast', c: COLORS.pink },
              { t: 'Impact Heavy', c: COLORS.yellow },
              { t: 'Glitch Sweep', c: COLORS.purple },
              { t: 'Cash Register', c: '#ffffff' },
              { t: 'Crowd Gasp', c: COLORS.orange },
              { t: 'Record Scratch', c: '#ffffff' }
            ].map((sfx, i) => (
              <button 
                key={i}
                className="aspect-square border-[4px] border-black rounded-2xl flex flex-col items-center justify-center p-4 shadow-[6px_6px_0px_0px_black] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_black] active:translate-y-2 active:shadow-[0px_0px_0px_0px_black] transition-all relative group"
                style={{ backgroundColor: sfx.c }}
              >
                <Play className="mb-2 transition-transform group-hover:scale-125" size={40} strokeWidth={2} />
                <span className="font-black uppercase text-center text-sm md:text-md leading-tight">{sfx.t}</span>
                <div className="absolute top-2 right-2 border-2 border-black rounded-full w-6 h-6 flex items-center justify-center text-[10px] font-black bg-white">
                  {i+1}
                </div>
              </button>
            ))}
          </div>
        </ToolboxModule>

        {/* MODULE 4: COMMUNITY POLL CRAFTER */}
        <ToolboxModule title="Poll Builder" icon={Megaphone} mainColor={COLORS.lime} iconColor={COLORS.purple}>
          <div className="bg-white border-[4px] border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_black]">
            <h4 className="font-black uppercase text-sm mb-2">The Question</h4>
            <textarea 
              className="w-full h-[80px] p-3 border-[3px] border-black rounded-xl font-bold text-lg outline-none focus:ring-[4px] focus:ring-[#C9F830]/50 transition-all resize-none shadow-[inset_4px_4px_0px_0px_rgba(0,0,0,0.05)]"
              defaultValue="What video should I make next?"
            />
            
            <h4 className="font-black uppercase text-sm mb-2 mt-6">Voting Options (With Images)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((opt) => (
                <div key={opt} className="flex bg-[#f8fafc] border-[3px] border-black rounded-xl overflow-hidden h-[64px]">
                  <div className="w-[64px] border-r-[3px] border-black bg-white flex flex-col items-center justify-center cursor-pointer hover:bg-[#FFE357] transition-colors">
                     <ImageIcon size={20} className="mb-1" />
                     <span className="text-[8px] font-black uppercase">IMG</span>
                  </div>
                  <input 
                    type="text" 
                    placeholder={`Option ${opt}...`}
                    className="flex-1 bg-transparent px-3 font-bold uppercase text-sm outline-none"
                    defaultValue={opt === 1 ? "100 Days in Minecraft" : opt === 2 ? "IRL Squid Game" : ""}
                  />
                </div>
              ))}
            </div>
            
            <div className="border-t-[4px] border-black mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="w-8 h-8 border-[3px] border-black rounded-md flex items-center justify-center bg-[#C9F830]">
                  <div className="w-4 h-4 bg-black rounded-sm" />
                </div>
                <span className="font-black uppercase text-sm">Schedule for Tomorrow</span>
              </label>
              <BrutalistBtn color={COLORS.pink} className="w-full md:w-auto h-[60px] text-lg px-8">
                <Megaphone size={24} /> BLAST TO COMMUNITY
              </BrutalistBtn>
            </div>
          </div>
        </ToolboxModule>

        {/* MODULE 5: SPONSORSHIP PIPELINE */}
        <ToolboxModule title="Brand Deals" icon={Briefcase} mainColor={COLORS.purple} iconColor={COLORS.orange}>
          <div className="flex flex-col lg:flex-row gap-4 overflow-x-auto pb-4">
            {/* Kanban Columns */}
            {[
              { title: "Inbound", color: COLORS.cyan, deals: [{ brand: 'NordVPN', val: '$5k', type: 'Mid-roll' }, { brand: 'Manscaped', val: 'TBD', type: 'Dedicated' }] },
              { title: "Negotiation", color: COLORS.yellow, deals: [{ brand: 'SeatGeek', val: '$8k', type: 'Integration' }] },
              { title: "Confirmed", color: COLORS.lime, deals: [{ brand: 'Raycon', val: '$12k', type: 'Pre-roll' }, { brand: 'Shopify', val: '$10k', type: 'Link in Bio' }] },
            ].map((col, i) => (
              <div key={i} className="flex-1 min-w-[300px] bg-white border-[4px] border-black rounded-2xl flex flex-col shadow-[6px_6px_0px_0px_black] overflow-hidden">
                <div className="h-[48px] border-b-[4px] border-black flex items-center justify-between px-4" style={{ backgroundColor: col.color }}>
                  <span className="font-black uppercase text-lg">{col.title}</span>
                  <span className="w-6 h-6 border-2 border-black bg-white rounded-full flex items-center justify-center font-black text-xs">{col.deals.length}</span>
                </div>
                <div className="p-4 flex flex-col gap-4 bg-gray-50 flex-1">
                  {col.deals.map((deal, j) => (
                    <div key={j} className="bg-white border-[3px] border-black rounded-xl p-3 shadow-[4px_4px_0px_0px_black] hover:-translate-y-1 cursor-grab transition-transform">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-black uppercase text-xl leading-none">{deal.brand}</h4>
                        <span className="font-black bg-black text-[#C9F830] px-2 py-1 rounded text-xs">{deal.val}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-[10px] font-bold uppercase border-2 border-black rounded-full px-2 py-0.5">{deal.type}</span>
                      </div>
                    </div>
                  ))}
                  <button className="h-[40px] border-[3px] border-dashed border-gray-400 rounded-xl font-bold uppercase text-gray-500 hover:border-black hover:text-black transition-colors text-sm">
                    + Add Deal
                  </button>
                </div>
              </div>
            ))}
          </div>
        </ToolboxModule>

        {/* MODULE 6: UPLOAD FLIGHT CHECK */}
        <ToolboxModule title="Flight Check" icon={Check} mainColor={COLORS.pink} iconColor={COLORS.lime}>
          <div className="bg-white border-[4px] border-black rounded-2xl shadow-[6px_6px_0px_0px_black] overflow-hidden">
            {/* Overall Progress */}
            <div className="h-[60px] bg-gray-100 border-b-[4px] border-black flex items-center px-4 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 bg-[#C9F830] border-r-[4px] border-black w-[60%]" />
              <span className="relative z-10 font-[1000] uppercase text-2xl">Readiness: 60%</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 p-0">
              {/* Checklist Items */}
              <div className="flex flex-col border-b md:border-b-0 md:border-r-[4px] border-black">
                {[
                  { text: 'Rendered in 4K 60fps', status: true },
                  { text: 'Color Grade Approved', status: true },
                  { text: 'Thumbnail A/B Uploaded', status: true },
                  { text: 'Tags & Description SEO', status: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border-b-[3px] last:border-b-0 border-black/10 hover:bg-gray-50 cursor-pointer">
                    <div className={`w-8 h-8 border-[3px] border-black rounded-lg flex items-center justify-center transition-colors ${item.status ? 'bg-[#24D3FF]' : 'bg-white shadow-[inset_2px_2px_0px_0px_rgba(0,0,0,0.1)]'}`}>
                      {item.status && <Check size={20} strokeWidth={4} />}
                    </div>
                    <span className={`font-black uppercase text-lg ${item.status ? 'opacity-50 line-through' : ''}`}>{item.text}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col">
                {[
                  { text: 'Sponsor Link in Desc', status: false },
                  { text: 'Cards & End Screens', status: false },
                  { text: 'Community Post Drafted', status: false },
                  { text: 'Monetization Checks Pass', status: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border-b-[3px] last:border-b-0 border-black/10 hover:bg-gray-50 cursor-pointer">
                    <div className={`w-8 h-8 border-[3px] border-black rounded-lg flex items-center justify-center transition-colors ${item.status ? 'bg-[#24D3FF]' : 'bg-white shadow-[inset_2px_2px_0px_0px_rgba(0,0,0,0.1)]'}`}>
                      {item.status && <Check size={20} strokeWidth={4} />}
                    </div>
                    <span className={`font-black uppercase text-lg ${item.status ? 'opacity-50 line-through' : ''}`}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 bg-[#f8fafc] border-t-[4px] border-black">
              <BrutalistBtn color={COLORS.lime} className="w-full h-[70px] text-2xl !opacity-50 !cursor-not-allowed">
                <Rocket size={32} /> INITIATE PUBLISH SEQUENCE
              </BrutalistBtn>
              <p className="text-center font-bold text-xs uppercase mt-2 text-red-500">Finish checklist to unlock</p>
            </div>
          </div>
        </ToolboxModule>

      </div>
    </div>
  );
}