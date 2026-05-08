import React from 'react';
import { UI_CONSTANTS } from './ToolboxUISystem';

interface StandardInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  color?: string;
  isResizable?: boolean;
}

export const StandardInput: React.FC<StandardInputProps> = ({ 
  color = "border-black", 
  isResizable = false, 
  className = "", 
  ...props 
}) => {
  return (
    <div className="relative w-full">
      <input
        className={`w-full bg-white ${UI_CONSTANTS.border} ${UI_CONSTANTS.radius} p-4 font-black uppercase text-sm ${className} ${color}`}
        {...props}
      />
      {isResizable && (
        <div className="absolute bottom-2 right-2 cursor-nwse-resize select-none">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
            <path d="M18 18L6 6M18 12V18H12" />
          </svg>
        </div>
      )}
    </div>
  );
};
