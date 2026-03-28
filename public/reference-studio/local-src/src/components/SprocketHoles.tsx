import React from 'react';

interface SprocketHolesProps {
  className?: string;
  count?: number;
  color?: string;
}

export const SprocketHoles: React.FC<SprocketHolesProps> = ({ 
  className = "", 
  count = 8, 
  color = "white" 
}) => {
  // Each hole is 10x12 with 6px spacing (16 total per unit)
  // Standard user SVG width was 134 for 8 holes (8 * 16 + 6)
  const holes = Array.from({ length: count });
  const width = count * 16 + 4;

  return (
    <svg 
      width="100%" 
      height="100%" 
      viewBox={`0 0 ${width} 22`} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="none"
    >
      <g id="sprocket-holes" fill={color}>
        {holes.map((_, i) => (
          <rect 
            key={i} 
            x={5 + (i * 16)} 
            y={5} 
            width={10} 
            height={12} 
            rx={2} 
          />
        ))}
      </g>
    </svg>
  );
};
