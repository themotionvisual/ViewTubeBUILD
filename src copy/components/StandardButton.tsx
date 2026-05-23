import React, { useState } from 'react';

interface StandardButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent';
  accentColor?: string;
  label?: string;
}

export const StandardButton: React.FC<StandardButtonProps> = ({ 
  children, 
  variant = 'primary', 
  accentColor = '#CCFF00', 
  className = '', 
  label,
  ...props 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const baseClasses = "border-black border-2 rounded-md px-3 py-1 text-[9px] uppercase tracking-[0.15em] font-medium transition-all duration-200";

  const getStyle = () => {
    if (isActive) return { backgroundColor: accentColor, boxShadow: `1px 1px 0px 0px ${accentColor}`, transform: 'translate(1px, 1px)' };
    if (isHovered) return { backgroundColor: 'white', boxShadow: `2px 2px 0px 0px ${accentColor}`, transform: 'translate(-1px, -1px)' };
    return { backgroundColor: 'white', boxShadow: '2px 2px 0px 0px rgba(156, 163, 175, 0.5)' };
  };

  return (
    <button
      className={`${baseClasses} ${className}`}
      style={getStyle()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setIsActive(false); }}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
      {...props}
    >
      {label || children}
    </button>
  );
};
