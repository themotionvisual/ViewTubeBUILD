import React, { useState } from 'react';
import { Lightbulb, Copy, Check, Sparkles, Box, Layout, BarChart, Settings, Activity, Search, TrendingUp, PieChart } from 'lucide-react';
import { useBrain } from '../context/GlobalDataContext';
import { ToolHeader } from '../components/ToolHeader';

// Consolidated ideas data
const ideasData = [
  {
    cat: "Strategic Growth Patterns",
    ideas: [
      {
        title: "The Zero-Budget Viral Framework",
        prompt: "Analyze how to create high-retention content without expensive equipment. Focus on storytelling, pacing, and visual pattern interrupts that keep viewers engaged."
      },
      {
        title: "Micro-Niche Dominance Strategy",
        prompt: "Identify underserved sub-topics within a major niche. Create a content plan to become the #1 authority in that specific micro-segment."
      }
    ]
  },
  {
    cat: "Technical UI & Features",
    ideas: [
      {
        title: "Dynamic Dashboard Overhaul",
        prompt: "Design a centralized hub that pulls key metrics from all tools into a single, actionable dashboard with neo-brutalist styling."
      },
      {
        title: "Multi-Model AI Comparison",
        prompt: "Implement a feature to generate content using multiple AI models (Gemini Flash vs Pro) and compare outputs side-by-side."
      }
    ]
  },
  {
    cat: "Analytics & Data Viz",
    ideas: [
      {
        title: "Success Quadrants Matrix",
        prompt: "Scatter plot mapping CTR vs. Retention, divided into four performance quadrants: Gold Standard, Clickbait Trap, Hidden Gem, and Failure."
      },
      {
        title: "Retention Forecast Engine",
        prompt: "AI-driven prediction of audience retention curves based on script sentiment and previous video performance data."
      }
    ]
  },
  {
     cat: "Workflow Optimization",
     ideas: [
        {
           title: "Integrated Storyboard Creator",
           prompt: "Build a visual storyboarding tool within the project interface. Pair each storyboard frame with a text description and an estimated duration."
        },
        {
           title: "Automated Publishing Checklist",
           prompt: "Build a smart checklist that automatically verifies if a project is ready for publishing based on SEO and packaging standards."
        }
     ]
  }
];

const IdeasVault: React.FC = () => {
  const [copiedGlobal, setCopiedGlobal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const globalPrompt = "Please provide a highly detailed and specific implementation plan covering the exact UI components, state management, and API integrations needed. Ensure the code aligns perfectly with the existing React and Tailwind CSS architecture, maintaining the brutalist design system.";

  const handleCopyGlobal = () => {
    navigator.clipboard.writeText(globalPrompt);
    setCopiedGlobal(true);
    setTimeout(() => setCopiedGlobal(false), 2000);
  };

  const handleCopyPrompt = (prompt: string, id: string) => {
    navigator.clipboard.writeText(prompt);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ToolHeader 
        title="Content Ideas Vault" 
        icon="ideas" 
        titleBgColor="bg-[#ffbb00]" 
        iconBgColor="bg-black" 
      />

      <div className="flex-1 overflow-auto p-1">
        <div className="max-w-7xl mx-auto space-y-12 pb-20 mt-8">
          
          {/* Global Prompt Card */}
          <div className="bg-black text-[#ffbb00] border-[6px] border-black rounded-[40px] p-10 relative overflow-hidden shadow-[16px_16px_0px_0px_rgba(0,0,0,0.1)]">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <Sparkles size={120} />
             </div>
             <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                <div className="space-y-4 max-w-2xl">
                   <h3 className="text-4xl font-black uppercase italic tracking-tighter">Global Implementation Protocol</h3>
                   <p className="font-bold text-white/60 text-lg leading-relaxed italic">
                     "{globalPrompt}"
                   </p>
                </div>
                <button 
                  onClick={handleCopyGlobal}
                  className="bg-[#ffbb00] text-black px-10 py-5 rounded-2xl font-black uppercase italic tracking-widest text-lg shadow-[8px_8px_0px_0px_#ffffff] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-4 shrink-0"
                >
                  {copiedGlobal ? <Check size={28} /> : <Copy size={28} />}
                  <span>{copiedGlobal ? "Cloned" : "Copy Global"}</span>
                </button>
             </div>
          </div>

          {/* Ideas Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {ideasData.map((section, idx) => (
              <div key={idx} className="bg-white border-[6px] border-black rounded-[40px] overflow-hidden shadow-[16px_16px_0px_0px_black] flex flex-col hover:rotate-1 transition-transform">
                <div className={`p-8 border-b-[6px] border-black font-black uppercase italic text-lg tracking-widest flex items-center justify-between ${
                  ['bg-[#FF7497] text-white', 'bg-[#00CCFF] text-black', 'bg-[#CCFF00] text-black', 'bg-black text-white'][idx % 4]
                }`}>
                   <span>{section.cat}</span>
                   <div className="bg-white text-black px-3 py-1 rounded-xl text-xs border-[3px] border-black">
                      {section.ideas.length}
                   </div>
                </div>
                <div className="flex-1">
                   <ul className="divide-y-[4px] divide-black/5">
                      {section.ideas.map((idea, i) => (
                        <li key={i} className="p-8 hover:bg-black/[0.02] transition-colors group">
                           <div className="flex flex-col gap-4">
                              <div className="flex items-start gap-4">
                                 <span className="text-4xl font-black text-black/10 group-hover:text-black transition-colors">{String(i+1).padStart(2,'0')}</span>
                                 <h5 className="text-xl font-black uppercase tracking-tight italic leading-none pt-2">{idea.title}</h5>
                              </div>
                              <div className="bg-black/5 p-6 rounded-2xl border-[3px] border-dashed border-black/10 relative group/prompt">
                                 <p className="text-sm font-bold text-gray-600 italic leading-relaxed pr-10">
                                    {idea.prompt}
                                 </p>
                                 <button 
                                   onClick={() => handleCopyPrompt(idea.prompt, `${idx}-${i}`)}
                                   className="absolute top-4 right-4 text-black opacity-0 group-hover/prompt:opacity-100 transition-all hover:scale-125"
                                 >
                                    {copiedId === `${idx}-${i}` ? <Check size={20} className="text-[#00CCFF]" /> : <Copy size={20} />}
                                 </button>
                              </div>
                           </div>
                        </li>
                      ))}
                   </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Visualization Inspiration Section */}
          <div className="bg-white border-[6px] border-black rounded-[48px] p-12 shadow-[20px_20px_0px_0px_black] space-y-10">
              <div className="flex items-center gap-6 border-b-[6px] border-black pb-8">
                 <BarChart size={48} className="text-[#FF3399]" />
                 <h3 className="text-5xl font-black uppercase italic tracking-tighter">Diagnostic Matrix Suggestions</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  { title: "Title Length vs CTR", icon: Layout },
                  { title: "Success Quadrants", icon: Box },
                  { title: "Revenue ROI", icon: Sparkles },
                  { title: "Audience Loyalty", icon: Activity },
                  { title: "Traffic Breakdown", icon: Search },
                  { title: "Keyword Trend", icon: TrendingUp },
                  { title: "Sentiment Flow", icon: PieChart },
                  { title: "Competitor Radar", icon: Settings }
                ].map((item, i) => (
                  <div key={i} className="bg-gray-50 border-[4px] border-black p-8 rounded-[36px] hover:bg-[#ccff00] transition-colors group cursor-default">
                     <item.icon size={32} className="mb-6 group-hover:scale-125 transition-transform" />
                     <h4 className="font-black uppercase italic tracking-tight text-lg leading-none">{item.title}</h4>
                  </div>
                ))}
              </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default IdeasVault;
