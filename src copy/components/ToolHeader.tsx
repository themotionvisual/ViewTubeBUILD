import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { BrainLinkRow } from './BrainLinkRow';
import { CustomIcon } from './CustomIcon';
import { Toolbox } from './Toolbox';

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
    // Deprecated wrapper: routed through canonical Toolbox primitive.
    <Toolbox
      variant="header"
      title={title}
      icon={
        typeof Icon === 'string' ? (
          <CustomIcon name={Icon} size={48} />
        ) : (
          <Icon size={48} className="text-black" />
        )
      }
      headerColor={titleBgColor}
      iconBoxColor={iconBgColor}
      headerActions={<BrainLinkRow />}
    />
  );
};
