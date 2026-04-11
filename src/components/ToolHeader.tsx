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
    <div className={`relative flex flex-row items-center h-[72px] ${titleBgColor} border-[4px] border-black rounded-xl shadow-[6px_6px_0px_0px_black] px-6 w-full mb-8`}>
      
      {/* The floating intersecting Icon Box */}
      <div 
        className={`absolute -left-5 -top-4 w-14 h-14 ${iconBgColor} border-[4px] border-black rounded-xl shadow-[4px_4px_0px_0px_black] flex items-center justify-center transform rotate-[-6deg] hover:rotate-0 transition-transform duration-300 z-10`}
      >
        {typeof Icon === 'string' ? (
          <CustomIcon name={Icon} size={28} className="p-0.5" />
        ) : (
          <Icon className="text-black" size={28} strokeWidth={2.5} />
        )}
      </div>

      {/* The Application/Tool Title */}
      <h1 className="ml-10 text-3xl font-black italic tracking-tighter uppercase leading-none mt-1 text-black">
        {title}
      </h1>

      {/* Optional: The Brain Link array docked at the far right */}
      <div className="ml-auto h-full flex items-center">
        <BrainLinkRow />
      </div>

    </div>
  );
};
