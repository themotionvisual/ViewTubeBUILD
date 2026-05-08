import React from 'react';
import { UI_CONSTANTS } from './ToolboxUISystem';

interface StandardDropdownProps {
  options: { label: string; value: string }[];
  value?: string;
  onChange: (value: string) => void;
  color?: string;
}

export const StandardDropdown: React.FC<StandardDropdownProps> = ({ options, value = "", onChange, color = "border-black" }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full bg-white ${UI_CONSTANTS.border} ${UI_CONSTANTS.radius} p-4 font-black uppercase text-sm appearance-none ${color}`}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};
