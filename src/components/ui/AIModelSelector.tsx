import React from 'react'
import { useBrain } from '../../context/useBrain'
import { GEMINI_MODELS } from '../../config/aiConfig'
import { getPaletteColor } from '../../styles/toolboxPalette'

export const AIModelSelector: React.FC<{ compact?: boolean }> = ({ compact }) => {
  const { aiModel, setAiModel } = useBrain()

  // Use palette colors for better integration
  const accentColor = getPaletteColor(4) // Electric Green (#4FFF5B)
  const hoverColor = getPaletteColor(5) // Sky Aqua (#40C6E9)

  return (
    <div className={`flex items-center gap-2 ${compact ? '' : 'mb-2'}`}>
      {!compact && (
        <label className="font-black text-[10px] uppercase tracking-[0.16em] text-gray-500">
          Active AI Brain
        </label>
      )}
      <div className="relative">
        <select
          value={aiModel}
          onChange={(e) => setAiModel(e.target.value)}
          className={`
            ${compact ? 'px-2 py-1 text-[10px] h-[32px]' : 'px-4 py-3 text-[14px] h-[54px] w-full'}
            border-[3px] border-black rounded-xl
            bg-white
            font-black uppercase tracking-tight
            text-black outline-none
            shadow-[3px_3px_0_black]
            cursor-pointer
            appearance-none
            transition-all
            hover:-translate-y-[1px] hover:shadow-[4px_4px_0_black]
            active:translate-y-[1px] active:shadow-[2px_2px_0_black]
            focus:border-[${accentColor}]
            pr-10
          `}
          style={{ 
            borderColor: 'black' 
          }}
        >
          {GEMINI_MODELS.map((m) => {
            const isPro = m.tier === 'pro'
            return (
              <option key={m.id} value={m.id} className="font-black uppercase">
                {m.name} {isPro ? '💎' : '⚡'}
              </option>
            )
          })}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-1">
          <div className="w-[2px] h-4 bg-black/10 mr-1" />
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1.5L6 6.5L11 1.5" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
      
      {!compact && (
        <div className="flex flex-wrap gap-2 mt-2">
          {GEMINI_MODELS.filter(m => m.id === aiModel).map(m => (
             <div key="desc" className="bg-[#f3f4f6] border-2 border-black/10 rounded-lg p-3 w-full">
                <p className="text-[11px] font-bold text-gray-600 uppercase leading-relaxed">
                  {m.description}
                </p>
                <div className="flex items-center gap-2 mt-1">
                   <span className="text-[9px] font-black bg-black text-white px-2 py-0.5 rounded tracking-widest">
                     COST: {m.costMultiplier}X
                   </span>
                   <span className={`text-[9px] font-black px-2 py-0.5 rounded tracking-widest border-2 border-black ${m.tier === 'pro' ? 'bg-[#FFFF61]' : 'bg-[#4FFF5B]'}`}>
                     {m.tier.toUpperCase()}
                   </span>
                </div>
             </div>
          ))}
        </div>
      )}
    </div>
  )
}
