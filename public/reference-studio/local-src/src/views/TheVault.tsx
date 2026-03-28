import React from 'react';
import { ToolHeader } from '../components/ToolHeader';
import { CustomIcon } from '../components/CustomIcon';
import * as Native from '../components/NativeUIKit';
import { ShortsStudio } from './ShortsStudio';

const VaultSection = ({ title, children, accent = "#CCFF00" }: { title: string, children: React.ReactNode, accent?: string }) => (
  <div className="mb-16">
    <div 
      className="inline-block border-[5px] border-black px-8 py-3 rounded-full mb-8 shadow-[6px_6px_0px_0px_black]" 
      style={{ backgroundColor: accent }}
    >
      <h2 className="text-3xl font-[1000] uppercase italic tracking-tighter">{title}</h2>
    </div>
    <div className="grid grid-cols-1 gap-12">
      {children}
    </div>
  </div>
);

export const TheVault = () => {
  return (
    <div className="min-h-screen bg-white p-8 md:p-12">
      <ToolHeader 
        title="THE UI VAULT (v2.2)" 
        icon="zap" 
        accentColor="#ff3399" 
      />

      <div className="mt-12 space-y-24">
        
        {/* SECTION 1: THE BOX SYSTEM & HEADERS */}
        <VaultSection title="01. The Prime Container System" accent="#CCFF00">
           {/* PEAK FIDELITY REFERENCE BOX */}
           <div className="bg-white border-[5px] border-black rounded-[48px] shadow-[16px_16px_0px_0px_black] overflow-hidden max-w-5xl hover:shadow-[24px_24px_0px_0px_black] transition-all duration-500 group">
              <div className="bg-[#FFE357] h-[100px] flex items-center border-b-[5px] border-black">
                 {/* Large Icon Sidebox */}
                 <div className="bg-[#FF3399] h-full w-[100px] flex items-center justify-center border-r-[5px] border-black flex-shrink-0 group-hover:bg-black transition-colors duration-500">
                    <CustomIcon name="zap" size={56} className="group-hover:invert transition-all" />
                 </div>
                 <h3 className="text-[60px] font-[1000] uppercase italic tracking-[-0.05em] text-black pl-10 leading-none">THE MASTER BOX</h3>
              </div>
              
              <div className="p-10 space-y-8">
                 <div className="flex gap-6 items-center">
                    <div className="flex-1">
                       <p className="font-black text-2xl leading-tight uppercase italic mb-4">
                          v2.2 Standard: High-Density Signal Architecture
                       </p>
                       <p className="text-sm font-bold uppercase opacity-60 leading-relaxed">
                          This pattern utilizes a 100px identifier box, negative-tracking ultra-titles, and adaptive shadow depth. It is the definitive wrapper for all "Mega-Tools" and "Visualizer Stations".
                       </p>
                    </div>
                    <div className="w-[200px] h-[120px] bg-gray-100 border-[4px] border-black rounded-3xl shadow-[8px_8px_0px_0px_black] flex items-center justify-center relative overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-black/5" />
                       <CustomIcon name="!!!GENERATE2" size={64} />
                    </div>
                 </div>
                 
                 <div className="flex gap-4">
                    <button className="bg-[#CCFF00] border-[4px] border-black px-8 py-4 rounded-2xl font-[1000] uppercase text-xl shadow-[8px_8px_0px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:scale-95 transition-all">
                       Primary Action
                    </button>
                    <button className="bg-white border-[4px] border-black px-8 py-4 rounded-2xl font-[1000] uppercase text-xl shadow-[8px_8px_0px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:scale-95 transition-all">
                       Refine Logic
                    </button>
                 </div>
              </div>
           </div>
        </VaultSection>

        {/* SECTION 2: TOOL PREVIEWS (SHORTS STUDIO) */}
        <VaultSection title="02. Tool Mastery (Shorts Studio)" accent="#00CCFF">
           <div className="max-w-2xl">
              <ShortsStudio />
           </div>
           <div className="bg-[#ffdd00] border-[5px] border-black p-6 rounded-3xl shadow-[8px_8px_0px_0px_black]">
              <h4 className="font-black uppercase text-sm mb-2 opacity-50 italic">Technical Note</h4>
              <p className="font-bold uppercase text-xs">
                 Mega-Tools like the Shorts Studio are modular and can be rendered as stand-alone stations or embedded widgets inside the Vault.
              </p>
           </div>
        </VaultSection>

        {/* SECTION 3: NATIVE LIBRARIES */}
        <VaultSection title="03. The Component Library" accent="#ffdd00">
           <div className="space-y-12 bg-gray-50 p-12 rounded-[60px] border-[5px] border-dashed border-black/10">
              {/* Here we will map through several NativeUIKit components if they are exported individually */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                 {/* Since NativeUIKit exports large aggregate demos, we'll use those for the showcase */}
                 {/* Note: I'm assuming exported demos exist from previous turns */}
                 <div className="bg-white p-8 border-[4px] border-black rounded-[40px] shadow-[8px_8px_0px_0px_black]">
                    <h5 className="font-black uppercase mb-4 opacity-30">Statistic Hubs</h5>
                    {/* Placeholder for individual native components if needed */}
                    <div className="flex gap-4">
                       <div className="w-32 h-32 bg-[#CCFF00] border-[4px] border-black rounded-full flex items-center justify-center shadow-[6px_6px_0px_0px_black]">
                          <span className="text-2xl font-[1000]">88%</span>
                       </div>
                       <div className="flex-1 space-y-2">
                          <div className="h-4 bg-black w-full" />
                          <div className="h-4 bg-black w-3/4" />
                          <div className="h-4 bg-black w-1/2" />
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </VaultSection>

        {/* SECTION 4: THE ICON REGISTRY */}
        <VaultSection title="04. The Icon Signal Registry" accent="#ff3399">
           <div className="flex flex-wrap gap-8 p-12 bg-white border-[5px] border-black rounded-[48px] shadow-[12px_12px_0px_0px_black]">
              {['home', 'video', 'analytics', 'zap', 'settings', 'mic', 'layers', '!!!POST-VIDEO', '!!!GENERATE1', '!!!GENERATE2'].map(icon => (
                <div key={icon} className="flex flex-col items-center gap-2">
                  <div className="p-4 bg-gray-50 border-[3px] border-black rounded-2xl shadow-[4px_4px_0px_0px_black]">
                    <CustomIcon name={icon} size={40} />
                  </div>
                  <span className="text-[10px] font-black uppercase text-black/30">{icon}</span>
                </div>
              ))}
           </div>
        </VaultSection>

        {/* SECTION 5: DATA HUB & COMMAND PATTERNS */}
        <VaultSection title="05. Data Hub & Commander" accent="#ffb158">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="bg-white border-[5px] border-black rounded-[40px] shadow-[12px_12px_0px_0px_black] overflow-hidden">
                    <div className="bg-black text-[#CCFF00] p-4 flex justify-between items-center">
                        <span className="font-black uppercase tracking-widest text-xs">Universal Data Hub Overlay</span>
                        <CustomIcon name="database" size={20} className="invert" />
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="h-40 bg-gray-100 border-[3px] border-black rounded-xl border-dashed flex items-center justify-center">
                            <span className="font-black uppercase text-black/20">Data Ingestion Engine</span>
                        </div>
                    </div>
                </div>
                <div className="bg-white border-[5px] border-black rounded-[40px] shadow-[12px_12px_0px_0px_black] overflow-hidden">
                    <div className="bg-[#00CCFF] border-b-[5px] border-black p-4 flex gap-4 items-center">
                        <CustomIcon name="search" size={24} />
                        <span className="text-2xl font-[1000] uppercase italic">Nexus Commander</span>
                    </div>
                    <div className="p-6">
                        <div className="w-full bg-black/5 p-4 rounded-xl border-[3px] border-black font-mono text-xs font-bold mb-4 uppercase">
                            {'>'} SEARCH_OS_DATABASE...
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {['SEO', 'THUMB', 'SCRIPT', 'ANALYTICS'].map(tag => (
                                <span key={tag} className="bg-[#CCFF00] border-[2px] border-black px-2 py-0.5 rounded-md text-[9px] font-black">{tag}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </VaultSection>

      </div>

      {/* FOOTER BRAIN SYNC */}
      <div className="mt-24 pt-8 border-t-[5px] border-black flex justify-between items-center opacity-30 italic">
        <span className="font-black uppercase">ViewTUBE v2.2 Artifact Vault</span>
        <span className="font-black uppercase">Last Updated: 2026-03-25</span>
      </div>
    </div>
  );
};
