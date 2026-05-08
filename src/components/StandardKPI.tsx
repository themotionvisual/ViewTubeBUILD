import React from 'react';
import { UI_CONSTANTS } from './ToolboxUISystem';

interface StandardKPIProps {
  label: string;
  value: string | number;
  trend?: string;
  color?: string;
}

export const StandardKPI: React.FC<StandardKPIProps> = ({ label, value, trend, color = "bg-white" }) => {
  return (
    <div className={`p-4 ${UI_CONSTANTS.border} ${UI_CONSTANTS.radius} ${color} ${UI_CONSTANTS.shadow}`}>
      <p className="text-[9px] font-black uppercase tracking-widest text-black/50 mb-1">{label}</p>
      <p className="text-3xl font-[1000] uppercase tracking-tighter leading-none">{value}</p>
      {trend && <p className="text-[10px] font-black uppercase mt-1 text-black/60">{trend}</p>}
    </div>
  );
};
