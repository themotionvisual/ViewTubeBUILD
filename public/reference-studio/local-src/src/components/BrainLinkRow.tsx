import React from 'react';
import { useBrain } from '../context/GlobalDataContext';
import { LayoutTemplate, Search, Image as ImageIcon, BarChart2, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { AppTool } from '../types';

interface ToolConfig {
  icon: LucideIcon;
  color: string;
  label: string;
}

const TOOL_MAP: Record<AppTool, ToolConfig> = {
  STORYBOARD_STUDIO: { icon: LayoutTemplate, color: 'text-[#ff3399]', label: 'Storyboard' },
  SEO_GENERATOR: { icon: Search, color: 'text-[#00d2ff]', label: 'SEO' },
  THUMBNAIL_STUDIO: { icon: ImageIcon, color: 'text-[#ccff00]', label: 'Thumbnail' },
  CHANNELYTICS: { icon: BarChart2, color: 'text-[#00ff99]', label: 'Channelytics' },
  IDEAS_VAULT: { icon: Sparkles, color: 'text-[#ffb158]', label: 'Ideas Vault' },
};

export const BrainLinkRow: React.FC = () => {
  const { brain } = useBrain();
  
  if (brain.activeProviders.length === 0) return null;

  return (
    <div className="flex items-center gap-2 h-full">
      {/* Subtle indicator label */}
      <span className="text-[10px] font-black uppercase text-black/50 tracking-widest mr-2 hidden md:inline-block">
        Brain Sync Active
      </span>

      {brain.activeProviders.map((tool) => {
        const config = TOOL_MAP[tool];
        if (!config) return null;
        const Icon = config.icon;
        
        return (
          <div 
            key={tool}
            title={`Receiving context from ${config.label}`}
            className="w-8 h-8 rounded-md bg-black border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(255,255,255,0.8)] animate-pulse hover:animate-none transition-all cursor-crosshair group relative"
          >
            <Icon className={config.color} size={16} strokeWidth={3} />
            
            {/* Tooltip */}
            <div className="absolute top-10 right-0 bg-black text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none">
              Pulling from {config.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};
