import React from 'react';
import { AccordionContainer } from '../components/AccordionContainer';
import { useBrain } from '../context/GlobalDataContext';

const StrategyHub: React.FC = () => {
  const { brain } = useBrain();

  return (
    <div className="flex flex-col space-y-2 max-w-7xl mx-auto pb-24">
      
      {/* Page Header */}
      <div className="mb-10 px-2 mt-4 text-center">
        <h2 className="text-7xl font-[1000] uppercase tracking-[calc(-0.06em)] leading-none text-black">
          STRATEGY <span className="text-[#FFDD00]">HUB</span>
        </h2>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20 mt-4">High-Level Concept & Planning Phase</p>
      </div>

      {/* Accordion Modules */}
      <div className="space-y-6">
        
        {/* Project Management Accordion */}
        <AccordionContainer 
          title="Project Management" 
          subtitle="Kanban & Production Lifecycles"
          headerColor="bg-[#FFDD00]"
          icon="!!!FOLDER1"
          iconBoxColor="bg-[#FF3399]"
          isOpenInitial={true}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {['IDEATION', 'PRODUCTION', 'POST-PROD'].map(phase => (
                <div key={phase} className="pop-box p-8 bg-white border-[4px] border-black rounded-[24px] flex flex-col min-h-[200px]">
                  <h4 className="text-xs font-black uppercase text-black/30 mb-6 tracking-widest">{phase}</h4>
                  <div className="space-y-4">
                     {brain.projects.filter(p => {
                       if (phase === 'IDEATION') return p.status === 'ideation';
                       if (phase === 'PRODUCTION') return p.status === 'filming' || p.status === 'scripting';
                       return p.status === 'editing' || p.status === 'publishing';
                     }).map(p => (
                        <div key={p.id} className="bg-white border-[3px] border-black p-4 rounded-2xl font-black uppercase text-[11px] shadow-[4px_4px_0px_0px_black] tracking-tighter">
                           {p.name}
                        </div>
                     ))}
                  </div>
               </div>
             ))}
          </div>
        </AccordionContainer>

        {/* Ideas Vault Accordion */}
        <AccordionContainer 
          title="Ideas Vault" 
          subtitle="Creative Prompt Library"
          headerColor="bg-[#00CCFF]"
          icon="!!!IDEA"
          iconBoxColor="bg-[#FFDD00]"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div className="pop-box p-10 bg-white border-[4px] border-black rounded-[24px] shadow-[8px_8px_0px_0px_black]">
                <h4 className="text-2xl font-[1000] uppercase mb-6 tracking-tighter">Core Resonance</h4>
                <p className="font-bold text-base text-black/60 uppercase leading-relaxed tracking-tight">
                   Currently analyzing: <span className="text-[#00CCFF]">{brain.coreConcept || 'STANDBY'}</span>
                </p>
                <div className="mt-8 space-y-4">
                    <div className="bg-black text-[#CCFF00] p-6 rounded-[24px] font-black uppercase text-sm tracking-tight border-[3px] border-[#CCFF00]/20">
                       SYSTEM PROMPT: GENERATE 5 VIRAL HOOKS BASED ON NICHE...
                   </div>
                </div>
             </div>
             <div className="space-y-4">
                {['High-Speed Tutorial', 'Deep Dive Analysis', 'Viral Challenge', 'Reaction Mashup'].map(idea => (
                   <div key={idea} className="pop-box p-6 bg-[#00CCFF]/10 border-[3px] border-black rounded-3xl flex justify-between items-center group cursor-pointer hover:bg-[#00CCFF]/20 transition-all shadow-pop-3d">
                      <span className="font-[1000] uppercase tracking-tighter text-lg">{idea}</span>
                      <div className="pop-module-id bg-black text-white hover:bg-gray-800 transition-colors border-none p-3 px-6">USE</div>
                   </div>
                ))}
             </div>
          </div>
        </AccordionContainer>

        {/* Research Lab Accordion */}
        <AccordionContainer 
          title="Research Lab" 
          subtitle="Deep Competitive Analysis"
          headerColor="bg-[#FF3399]"
          icon="!!!TRAFIC"
          iconBoxColor="bg-[#00CCFF]"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
             {[
               { label: 'Market Vibe', val: 'VIBRANT', color: 'text-[#CCFF00]' },
               { label: 'Traffic Flow', val: 'UPWARD', color: 'text-[#00CCFF]' },
               { label: 'Niche Authority', val: 'STABLE', color: 'text-white' },
               { label: 'Competition', val: 'MEDIUM', color: 'text-[#FFDD00]' }
             ].map(m => (
                <div key={m.label} className="pop-box p-8 bg-black flex flex-col items-center justify-center text-center shadow-[10px_10px_0px_0px_#FF3399] rounded-[32px]">
                   <span className="text-[10px] font-black uppercase text-white/30 mb-3 tracking-widest">{m.label}</span>
                   <span className={`text-3xl font-[1000] uppercase tracking-tighter ${m.color}`}>{m.val}</span>
                </div>
             ))}
          </div>
          <div className="mt-10 pop-box p-12 bg-gray-50 border-dashed border-[4px] border-black/10 rounded-[32px] text-center opacity-40">
             <h4 className="text-2xl font-[1000] uppercase text-black/20 tracking-tighter">Competitor Telemetry Offline</h4>
             <p className="text-xs font-bold uppercase mt-3 tracking-widest">Connect YouTube Data API to unlock deep competitive scanning.</p>
          </div>
        </AccordionContainer>

      </div>
    </div>
  );
};

export default StrategyHub;
