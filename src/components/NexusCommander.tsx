import React, { useState, useEffect } from 'react';
import { useBrain } from '../context/useBrain';
import { CustomIcon } from './CustomIcon';
import { Sparkles, X, ChevronDown } from 'lucide-react';

export const NexusCommander: React.FC = () => {
  const { brain, updateBrain } = useBrain();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(brain.coreConcept);
  const [isSyncing, setIsSyncing] = useState(false);

  // Autonomous Sync Logic (Debounced)
  useEffect(() => {
    if (inputValue === brain.coreConcept) return;

    setIsSyncing(true);
    const timer = setTimeout(() => {
      updateBrain({ coreConcept: inputValue });
      setIsSyncing(false);
    }, 800); 

    return () => clearTimeout(timer);
  }, [inputValue, brain.coreConcept, updateBrain]);

  return (
    <div className="w-full flex flex-col items-center mt-4">
      {isOpen ? (
        <div className="pop-box w-full bg-black text-white p-1 mb-4 animate-in slide-in-from-bottom-2 duration-300 border-[4px] border-[#00CCFF] shadow-[8px_8px_0px_0px_rgba(0,204,255,0.3)]">
          <div className="pop-header bg-[#00CCFF] h-11 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-black" />
              <h3 className="text-sm font-[1000] uppercase text-black tracking-tighter">Neural Nexus</h3>
            </div>
            <div className="flex items-center gap-4">
              {isSyncing && (
                <div className="flex items-center gap-2 bg-black/20 px-2 py-0.5 rounded-full">
                  <div className="w-2 h-2 bg-black rounded-full animate-ping" />
                  <span className="text-[8px] font-black text-black">SYNCING</span>
                </div>
              )}
              <button 
                onClick={() => setIsOpen(false)} 
                className="w-7 h-7 flex items-center justify-center bg-black/10 hover:bg-black/20 rounded-lg transition-colors"
                title="CLOSE"
              >
                <X size={18} strokeWidth={3} className="text-black" />
              </button>
            </div>
          </div>
          <div className="p-5 space-y-4">
             <div className="space-y-1">
                <span className="block text-[10px] font-black text-[#00CCFF] uppercase tracking-widest">Global Context Broadcast</span>
                <p className="text-[9px] font-medium text-white/40 uppercase leading-tight">
                   Whatever you type here becomes the primary focus for every AI module in the OS (The Oracle, SEO, Storyboards).
                </p>
             </div>
             
             <div className="relative">
                <textarea 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="ENTER GLOBAL STRATEGY (e.g. 30-Day Budget Tech Challenge)..."
                  className="w-full h-32 bg-white/5 border-[3px] border-white/10 rounded-xl p-4 font-black uppercase text-xs placeholder:text-white/10 resize-none focus:border-[#00CCFF] focus:bg-white/10 transition-all outline-none"
                />
                <div className="absolute bottom-3 right-3 opacity-20">
                   <CustomIcon name="!!!IDEA" size={24} />
                </div>
             </div>

             <div className="flex justify-between items-center pt-2 border-t border-white/10">
                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Protocol v2.1</span>
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-[#CCFF00]" />
                   <span className="text-[8px] font-black text-[#CCFF00] uppercase">Brain Link Active</span>
                </div>
             </div>
          </div>
        </div>
      ) : null}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-3 px-6 py-5 transition-all hover:scale-[1.02] active:scale-[0.98] border-[4px] border-black rounded-[24px] shadow-[8px_8px_0px_0px_black] ${isOpen ? 'bg-white text-black border-[#00CCFF] shadow-none translate-x-1 translate-y-1' : 'bg-[#00CCFF] text-black hover:bg-[#33d6ff]'}`}
      >
        <div className="flex items-center gap-3">
          <Sparkles size={24} className={isSyncing ? 'animate-spin' : 'animate-pulse'} />
          <span className="font-[1000] uppercase tracking-tighter text-xl">
            {isOpen ? 'Nexus Active' : 'Nexus Commander'}
          </span>
        </div>
        <div className={`w-8 h-8 rounded-full border-2 border-black flex items-center justify-center bg-white ${isOpen ? 'rotate-180' : ''} transition-transform`}>
           <ChevronDown size={18} strokeWidth={4} />
        </div>
      </button>
    </div>
  );
};
