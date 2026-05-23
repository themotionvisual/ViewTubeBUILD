import React, { useState } from 'react';
import { useBrain } from '../context/useBrain';
import { reflectAndCompress } from '../services/brain';
import { ToolboxScaffold, SubToolbox } from '../components/Toolbox';
import { Brain, Sparkles, Dna, BarChart3, Map, MessageSquare, Send, Zap } from 'lucide-react';

interface BrainSectionProps {
  title: string;
  content: string;
  icon: React.ReactNode;
  paletteIndex: number;
  sectionKey: string;
}

const BrainSection: React.FC<BrainSectionProps> = ({ title, content, icon, paletteIndex, sectionKey }) => {
  const { emitSignal } = useBrain();
  const [comment, setComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);

  const handleSendComment = async () => {
    if (!comment.trim()) return;
    try {
      await emitSignal('INTELLIGENCE_HUB', 'SECTION_COMMENT', {
        section: sectionKey,
        comment: comment.trim()
      });
      setComment('');
      setIsCommenting(false);
    } catch (e) {
      console.error("Failed to send brain comment", e);
    }
  };

  return (
    <SubToolbox 
      title={title} 
      icon={icon} 
      paletteIndex={paletteIndex} 
      collapsible 
      isOpenInitial={true}
    >
      <div className="flex flex-col gap-4">
        <div className="p-4 bg-gray-50 border-[3px] border-black rounded-xl font-bold text-sm leading-relaxed text-black/80">
          {content}
        </div>
        
        <div className="flex flex-col gap-2">
          {!isCommenting ? (
            <button 
              onClick={() => setIsCommenting(true)}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-black/40 hover:text-black transition-colors"
            >
              <MessageSquare size={14} /> Add Note or Correction
            </button>
          ) : (
            <div className="flex gap-2 animate-in slide-in-from-top-2 duration-200">
              <input 
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Clarify this for the AI..."
                className="flex-1 bg-white border-[3px] border-black rounded-xl px-3 py-2 text-xs font-bold outline-none"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
              />
              <button 
                onClick={handleSendComment}
                className="bg-black text-[#ccff00] p-2 rounded-xl border-[3px] border-black shadow-[2px_2px_0px_0px_black] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none transition-all"
              >
                <Send size={14} />
              </button>
              <button 
                onClick={() => setIsCommenting(false)}
                className="px-3 text-[10px] font-black uppercase text-black/40 hover:text-black"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </SubToolbox>
  );
};

export const IntelligenceHub: React.FC<{ collapsible?: boolean; isOpenInitial?: boolean; paletteIndex?: number }> = ({ 
  collapsible = true, 
  isOpenInitial = true,
  paletteIndex = 11
}) => {
  const { getBrainMemory: getMemory } = useBrain();
  const memory = getMemory();

  return (
    <ToolboxScaffold
      title="Intelligence Hub"
      subtitle="The Brain's evolved understanding of your channel, audience, and goals."
      icon={<Brain size={40} strokeWidth={3} className="text-black" />}
      headerColor="bg-[#FF3399]"
      iconBoxColor="bg-[#ccff00]"
      paletteIndex={paletteIndex}
      collapsible={collapsible}
      isOpen={isOpenInitial}
      helpText="This is your Global User Context. It updates automatically as you use tools. Add notes to sections to correct or refine the AI's understanding."
    >
      <div className="space-y-6">
        {memory.strategicAdvice && (
          <div className="bg-black text-[#ccff00] p-6 rounded-2xl border-[4px] border-black shadow-[6px_6px_0px_0px_black] animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-[#ccff00] rounded-lg border-2 border-black">
                <Zap size={24} className="text-black" />
              </div>
              <div className="flex-1">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ccff00]/60 mb-1">
                  Active OODA Loop Directive
                </h3>
                <p className="text-xl font-[1000] leading-tight tracking-tight uppercase italic">
                  "{memory.strategicAdvice}"
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <BrainSection 
            title="Channel ID" 
            content={memory.identityAndAspirations}
            icon={<Sparkles size={20} strokeWidth={3} />}
            paletteIndex={0}
            sectionKey="identityAndAspirations"
          />
          <BrainSection 
            title="Content Style" 
            content={memory.contentDNA}
            icon={<Dna size={20} strokeWidth={3} />}
            paletteIndex={1}
            sectionKey="contentDNA"
          />
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <BrainSection 
            title="Performance" 
            content={memory.performanceLedger}
            icon={<BarChart3 size={20} strokeWidth={3} />}
            paletteIndex={2}
            sectionKey="performanceLedger"
          />
          <BrainSection 
            title="Outlook" 
            content={memory.futureStateMap}
            icon={<Map size={20} strokeWidth={3} />}
            paletteIndex={3}
            sectionKey="futureStateMap"
          />
        </div>

        {/* Action Bar */}
        <div className="pt-4 border-t-[4px] border-black/5 flex items-center justify-between">
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 bg-[#ccff00] rounded-full animate-pulse shadow-[0_0_8px_#ccff00]" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">
               Intelligence Synced: {new Date(memory.lastReflection).toLocaleTimeString()}
             </span>
           </div>
           
           <button 
             onClick={async () => {
               try {
                 await reflectAndCompress();
                 alert("Reflection cycle complete.");
                 window.location.reload();
               } catch (e) {
                 alert("Reflection failed.");
               }
             }}
             className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl border-[3px] border-black shadow-[4px_4px_0px_0px_#ccff00] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all text-[11px] font-[1000] uppercase tracking-tighter"
           >
             <Zap size={14} className="text-[#ccff00]" /> Force Reflection
           </button>
        </div>
      </div>
    </ToolboxScaffold>
  );
};
