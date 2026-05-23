import React from 'react';
import './assetAnimations.css';

interface Props {
  className?: string;
}

export const AnimatedSubscribe: React.FC<Props> = ({ className = '' }) => {
  return (
    <svg 
      className={`w-full h-full ${className}`} 
      viewBox="0 0 300 100" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible' }}
    >
      <g className="animate-pop-spring">
        {/* Layer 5 (Bottom) */}
        <text 
          x="50%" y="60%" 
          textAnchor="middle" 
          dominantBaseline="middle"
          className="vector-stroke-thick"
          style={{ fill: '#000', fontSize: '60px', fontWeight: '900', fontFamily: 'Impact, sans-serif', transform: 'translateY(16px)' }}
        >
          SUBSCRIBE
        </text>
        {/* Layer 4 */}
        <text 
          x="50%" y="60%" 
          textAnchor="middle" 
          dominantBaseline="middle"
          className="vector-stroke-thick delay-100"
          style={{ fill: '#CC00FF', fontSize: '60px', fontWeight: '900', fontFamily: 'Impact, sans-serif', transform: 'translateY(12px)' }}
        >
          SUBSCRIBE
        </text>
        {/* Layer 3 */}
        <text 
          x="50%" y="60%" 
          textAnchor="middle" 
          dominantBaseline="middle"
          className="vector-stroke-thick delay-200"
          style={{ fill: '#24D3FF', fontSize: '60px', fontWeight: '900', fontFamily: 'Impact, sans-serif', transform: 'translateY(8px)' }}
        >
          SUBSCRIBE
        </text>
        {/* Layer 2 */}
        <text 
          x="50%" y="60%" 
          textAnchor="middle" 
          dominantBaseline="middle"
          className="vector-stroke-thick delay-300"
          style={{ fill: '#4FFF5B', fontSize: '60px', fontWeight: '900', fontFamily: 'Impact, sans-serif', transform: 'translateY(4px)' }}
        >
          SUBSCRIBE
        </text>
        {/* Layer 1 (Top) */}
        <text 
          x="50%" y="60%" 
          textAnchor="middle" 
          dominantBaseline="middle"
          className="vector-stroke-thick delay-400"
          style={{ fill: '#FFFF61', fontSize: '60px', fontWeight: '900', fontFamily: 'Impact, sans-serif' }}
        >
          SUBSCRIBE
        </text>
      </g>
    </svg>
  );
};
