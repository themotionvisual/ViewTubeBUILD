import React from 'react';

interface ToolboxScaffoldProps {
  title: string;
  icon: React.ReactNode;
  headerColor: string;
  iconBoxColor: string;
  embedded?: boolean;
  outerClassName?: string;
  shellClassName?: string;
  contentClassName?: string;
  children: React.ReactNode;
}

export const ToolboxScaffold: React.FC<ToolboxScaffoldProps> = ({
  title,
  icon,
  headerColor,
  iconBoxColor,
  embedded = false,
  outerClassName = '',
  shellClassName = '',
  contentClassName = '',
  children,
}) => {
  if (embedded) {
    return <div className={`w-full ${contentClassName}`.trim()}>{children}</div>;
  }

  return (
    <div className={`w-full ${outerClassName}`.trim()}>
      <div
        className={`w-full bg-white border-[5px] border-black rounded-2xl shadow-[12px_12px_0px_0px_black] overflow-hidden flex flex-col transition-all duration-700 ${shellClassName}`.trim()}
      >
        <header className={`${headerColor} h-[80px] border-b-[5px] border-black flex items-center justify-between px-0 overflow-hidden`}>
          <div className="flex items-center h-full">
            <div className={`${iconBoxColor} h-full w-[80px] flex items-center justify-center border-r-[5px] border-black flex-shrink-0`}>
              {icon}
            </div>
            <h1 className="text-[50px] font-[1000] uppercase tracking-tighter text-black pl-8 leading-none">{title}</h1>
          </div>
        </header>
        <div className={contentClassName}>{children}</div>
      </div>
    </div>
  );
};
