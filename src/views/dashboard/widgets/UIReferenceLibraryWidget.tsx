import React, { useState } from 'react';
import { WidgetShell } from '../WidgetShell';
import { WidgetChoice, WidgetScrollArea, WidgetSelect } from '../WidgetPrimitives';

export default function UIReferenceLibraryWidget({ widget, ...common }: any) {
  const [referenceOption, setReferenceOption] = useState('option-1');
  const [referenceCheckbox, setReferenceCheckbox] = useState(false);
  const [referenceRadio, setReferenceRadio] = useState('a');

  return (
    <WidgetShell
      widget={widget}
      {...common}
    >
      <WidgetScrollArea ariaLabel="Widget component reference" contentClassName="flex min-h-full flex-col bg-[#f5f5f5] p-2">
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
              <WidgetChoice label="Checkbox" checked={referenceCheckbox} onChange={() => setReferenceCheckbox((checked) => !checked)} />
              <WidgetChoice label="Option A" type="radio" name="radio-demo" value="a" checked={referenceRadio === 'a'} onChange={() => setReferenceRadio('a')} />
              <WidgetChoice label="Option B" type="radio" name="radio-demo" value="b" checked={referenceRadio === 'b'} onChange={() => setReferenceRadio('b')} />
            </div>
          </section>
          
          <section className="bg-white border-2 border-black rounded-lg p-4" style={{ boxShadow: '2px 2px 0 0 rgba(0,0,0,0.1)' }}>
            <h3 className="text-xs font-black uppercase mb-2">Dropdown / Select</h3>
            <div className="max-w-[220px]">
              <WidgetSelect
                value={referenceOption}
                onChange={setReferenceOption}
                label="Reference option"
                options={[
                  { value: 'option-1', label: 'Option 1' },
                  { value: 'option-2', label: 'Option 2' },
                  { value: 'option-3', label: 'Option 3' },
                ]}
              />
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
      </WidgetScrollArea>
    </WidgetShell>
  );
}
