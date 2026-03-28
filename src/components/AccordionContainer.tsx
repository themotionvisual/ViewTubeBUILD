import React, { useState } from 'react';
import { CustomIcon } from './CustomIcon';

interface AccordionContainerProps {
  title: string;
  subtitle?: string;
  icon: string | React.ReactNode;
  children: React.ReactNode;
  headerColor?: string;
  iconBoxColor?: string;
  isOpenInitial?: boolean;
  unmountWhenClosed?: boolean;
}

export const AccordionContainer: React.FC<AccordionContainerProps> = ({
  title,
  subtitle,
  icon,
  children,
  headerColor = "bg-[#FFDD00]",
  iconBoxColor = "bg-[#FF3399]",
  isOpenInitial = false,
  unmountWhenClosed = false,
}) => {
  const [isOpen, setIsOpen] = useState(isOpenInitial);

  return (
    <div className="w-full border-[4px] border-black rounded-2xl bg-white overflow-hidden">
      {/* Header mirrors the polished Reference Studio toolboxes. */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`${headerColor} h-14 flex items-center justify-between cursor-pointer select-none sticky top-0 z-20 group border-b-[4px] ${isOpen ? 'border-black' : 'border-transparent'}`}
      >
        <div className="flex items-center h-full">
          {/* Square Colored Icon Box — icon fills 90% (50/56) */}
          <div className={`${iconBoxColor} h-full aspect-square flex items-center justify-center border-r-[4px] border-black flex-shrink-0`}>
            {typeof icon === 'string' ? <CustomIcon name={icon} size={40} /> : icon}
          </div>
          <div className="flex flex-col justify-center pl-4">
            <h3 className="text-[32px] font-[900] uppercase tracking-tighter text-black leading-none mt-0.5">{title}</h3>
            {subtitle && (
              <span className="text-[10px] font-black uppercase tracking-widest text-black/50 leading-none mt-0.5">{subtitle}</span>
            )}
          </div>
        </div>

        {/* Toggle — Solid dark, large, fills 90% of header height */}
        <div className={`px-4 flex items-center justify-center transition-all duration-700 ease-in-out transform ${isOpen ? 'rotate-180 scale-110' : 'rotate-0 scale-100 group-hover:scale-110'}`}>
          <CustomIcon name={isOpen ? "SYMBOLS 19" : "SYMBOLS 22"} size={48} className="opacity-80" />
        </div>
      </div>

      {/* Content Container — Grid-based height for smooth tracking (no max-height glitches) */}
      <div
        className={`grid transition-all duration-1000 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          {(!unmountWhenClosed || isOpen) && (
            <div className="p-6 bg-white text-black">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
