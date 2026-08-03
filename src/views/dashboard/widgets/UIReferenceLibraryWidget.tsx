import React, { useState } from 'react';
import { WidgetShell } from '../WidgetShell';

const STYLE_NAMES: Record<number, string> = {
  1: 'Solid Accent Rectangular Block (32px, 10px V-Margin)',
  2: 'Crisp White Rectangular Block + Black Rim (32px)',
  3: 'Dual-Tone Split Rectangular Block [White/Accent] (32px)',
  4: 'Tactile Ridged Fader Rectangular Slab (32px)',
  5: 'Industrial Hazard Rectangular Block (32px)',
  6: 'Hybrid Double-Border Box (Style 6 Rim + Style 8 Tint Shift)',
  7: 'Inverted Dual-Tone Rectangular Block [Accent/White] (32px)',
  8: 'Full Tinted Rectangular Plate + Black Frame (32px)'
};

export default function UIReferenceLibraryWidget({ widget, ...common }: any) {
  const [scrollStyle, setScrollStyle] = useState(1);

  return (
    <WidgetShell
      widget={widget}
      {...common}
    >
      <div className={`flex-1 flex flex-col h-full min-h-0 bg-[#f5f5f5] p-2 overflow-y-auto scrollbar-style-${scrollStyle}`}>
        {/* Style Selector Module */}
        <div className="flex flex-col gap-2 mb-3 bg-white p-3 rounded-lg border-2 border-black flex-shrink-0" style={{ boxShadow: '2px 2px 0 0 black' }}>
          <div className="flex items-center justify-between gap-2">
            <div className="text-[11px] font-black uppercase text-black">Widget Scrollbar Style:</div>
            <div className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-black/10 text-black border border-black/20">
              {scrollStyle}. {STYLE_NAMES[scrollStyle]}
            </div>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <button 
                key={i}
                onClick={() => setScrollStyle(i)}
                className={`px-2.5 py-1 border-2 border-black rounded-md text-[10px] font-black transition-all ${scrollStyle === i ? 'bg-black text-white scale-105' : 'bg-white text-black hover:bg-gray-100'}`}
              >
                Style {i}
              </button>
            ))}
          </div>
        </div>
        
        {/* Component Showcase Modules */}
        <div className="flex flex-col gap-4">
          <section className="bg-white border-2 border-black rounded-lg p-4" style={{ boxShadow: '2px 2px 0 0 rgba(0,0,0,0.1)' }}>
            <h3 className="text-xs font-black uppercase mb-2">Buttons</h3>
            <div className="flex gap-2 flex-wrap">
              <button className="vt-button primary">Primary</button>
              <button className="vt-button secondary">Secondary</button>
              <button className="vt-button" style={{ background: '#FFB570' }}>Custom Color</button>
            </div>
          </section>
          
          <section className="bg-white border-2 border-black rounded-lg p-4" style={{ boxShadow: '2px 2px 0 0 rgba(0,0,0,0.1)' }}>
            <h3 className="text-xs font-black uppercase mb-2">Text Inputs</h3>
            <div className="flex flex-col gap-2 max-w-[320px]">
              <input type="text" className="vt-input-standard" placeholder="Standard text input..." />
              <textarea className="vt-textarea-standard" placeholder="Standard textarea..."></textarea>
            </div>
          </section>
          
          <section className="bg-white border-2 border-black rounded-lg p-4" style={{ boxShadow: '2px 2px 0 0 rgba(0,0,0,0.1)' }}>
            <h3 className="text-xs font-black uppercase mb-2">Checkboxes & Radios</h3>
            <div className="flex gap-4 flex-wrap">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 border-2 border-black rounded-sm" />
                <span className="text-xs font-bold uppercase">Checkbox</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="radio-demo" className="w-4 h-4 border-2 border-black rounded-full" />
                <span className="text-xs font-bold uppercase">Option A</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="radio-demo" className="w-4 h-4 border-2 border-black rounded-full" />
                <span className="text-xs font-bold uppercase">Option B</span>
              </label>
            </div>
          </section>
          
          <section className="bg-white border-2 border-black rounded-lg p-4" style={{ boxShadow: '2px 2px 0 0 rgba(0,0,0,0.1)' }}>
            <h3 className="text-xs font-black uppercase mb-2">Dropdown / Select</h3>
            <div className="max-w-[220px]">
              <select className="vt-select w-full">
                <option>Option 1</option>
                <option>Option 2</option>
                <option>Option 3</option>
              </select>
            </div>
          </section>

          <section className="bg-white border-2 border-black rounded-lg p-4" style={{ boxShadow: '2px 2px 0 0 rgba(0,0,0,0.1)' }}>
            <h3 className="text-xs font-black uppercase mb-2">Long Content (Scroll Test)</h3>
            <div className="flex flex-col gap-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="p-3 border-2 border-black rounded-lg bg-[#f8f9fa]">
                  <div className="text-sm font-bold">List Item {i+1}</div>
                  <div className="text-xs text-gray-500">This placeholder content ensures scrolling is active so you can evaluate the scrollbar positioning outside module boxes and right inside the outer widget border.</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </WidgetShell>
  );
}
