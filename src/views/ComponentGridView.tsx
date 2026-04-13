import React from 'react';
import ToolboxUISystem from '../components/ToolboxUISystem';

const ComponentGridView: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#e5e5e5] p-12 overflow-y-auto">
      <div className="max-w-[1450px] mx-auto">
        <header className="mb-12">
          <h1 className="text-6xl font-[1000] uppercase italic tracking-tighter bg-[#FF3399] text-white inline-block px-10 py-5 rounded-2xl border-[5px] border-black shadow-[10px_10px_0px_0px_black]">
            COMPONENT GRID
          </h1>
          <p className="mt-4 font-black uppercase text-sm opacity-40 tracking-[0.4em] pl-2">Stand-alone Reference Grid</p>
        </header>

        <ToolboxUISystem mode="component-grid" />
      </div>
    </div>
  );
};

export default ComponentGridView;
