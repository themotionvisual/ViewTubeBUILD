import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { BrainLinkRow } from './BrainLinkRow';
import { CustomIcon } from './CustomIcon';

interface ToolHeaderProps {
  title: string;
  icon: LucideIcon | string;
  titleBgColor?: string; // Example: 'bg-[#ccff00]'
  iconBgColor?: string; // Example: 'bg-[#ff3399]'
}

export const ToolHeader: React.FC<ToolHeaderProps> = ({ 
  title, 
  icon: Icon,
  titleBgColor = 'bg-[#ccff00]',
  iconBgColor = 'bg-[#ff3399]'
}) => {
  return (
    <header className={`${titleBgColor} h-[80px] flex items-center justify-between px-0 overflow-hidden border-b-[5px] border-black rounded-t-2xl mb-0`}>
      <div className="flex items-center h-full">
        {/* Large Colored Icon Box */}
        <div className={`${iconBgColor} h-full w-[80px] flex items-center justify-center border-r-[5px] border-black flex-shrink-0`}>
          {typeof Icon === 'string' ? (
            <CustomIcon name={Icon} size={48} />
          ) : (
            <Icon size={48} className="text-black" />
          )}
        </div>
        <h1 className="text-[50px] font-[1000] uppercase tracking-tighter text-black pl-8 leading-none mt-1">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-6 pr-6">
        <BrainLinkRow />
      </div>
    </header>
  );
};
