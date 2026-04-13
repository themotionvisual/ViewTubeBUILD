import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, ArrowUpRight, Zap, Boxes, Microscope, PieChart, Info } from 'lucide-react';
import { BENCH_REGISTRY, type BenchTag } from './bench/benchRegistry';

const TAG_ICON_MAP: Record<BenchTag, React.ReactNode> = {
  UI: <Zap size={20} />,
  WIDGET: <Boxes size={20} />,
  SOURCE: <Microscope size={20} />,
  CHART: <PieChart size={20} />,
  ANALYTICS: <LayoutGrid size={20} />,
  LAB: <Info size={20} />
};

const ReferenceStudioV2: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#e5e5e5] p-12">
      <div className="max-w-[1450px] mx-auto">
        {/* Hub Header */}
        <header className="mb-16">
          <div className="flex items-center gap-6 mb-8">
            <h1 className="text-8xl font-[1000] uppercase italic tracking-tighter bg-black text-[#CCFF00] inline-block px-12 py-6 rounded-[2rem] border-[8px] border-black shadow-[20px_20px_0px_0px_rgba(0,0,0,0.1)]">
              ATOMIC STUDIO
            </h1>
            <div className="h-24 w-[10px] bg-black/10 rounded-full" />
            <div>
              <p className="text-4xl font-[1000] uppercase italic tracking-tight opacity-20 leading-none mb-2">V2.0 / MULTI-BENCH</p>
              <p className="text-xs font-black uppercase tracking-[0.4em] opacity-40">Precise Layout Isolation & Traceability Bench</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="px-6 py-4 bg-white border-[4px] border-black rounded-2xl shadow-[8px_8px_0px_0px_black] flex items-center gap-4">
              <div className="p-3 bg-red-500 text-white rounded-xl border-[3px] border-black">
                <Info size={24} strokeWidth={3} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase opacity-40 tracking-widest">Active Isolation</p>
                <p className="text-sm font-[1000] uppercase tracking-tight">Iframe Hardware Confinement Enabled</p>
              </div>
            </div>
          </div>
        </header>

        {/* Bench Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {BENCH_REGISTRY.map((bench) => (
            <Link 
              key={bench.id} 
              to={`/bench/${bench.id}`}
              className="group relative bg-white border-[5px] border-black rounded-[2.5rem] p-8 transition-all hover:-translate-y-2 hover:translate-x-2 hover:shadow-[-12px_12px_0px_0px_black] shadow-[0px_0px_0px_0px_black] flex flex-col h-[320px]"
            >
              <div className="flex items-start justify-between mb-6">
                <div className={`p-5 rounded-2xl border-[4px] border-black shadow-[6px_6px_0px_0px_black] ${bench.color}`}>
                  {TAG_ICON_MAP[bench.tag]}
                </div>
                <div className="p-3 bg-black text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight size={24} strokeWidth={3} />
                </div>
              </div>

              <div className="mt-auto">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30">{bench.tag} // {bench.id}</span>
                </div>
                <h3 className="text-3xl font-[1000] uppercase italic tracking-tighter mb-4 group-hover:text-black transition-colors">
                  {bench.title}
                </h3>
                <p className="text-xs font-bold leading-relaxed opacity-50 max-w-[240px]">
                  {bench.subtitle}
                </p>
              </div>

              {/* Decorative status ring */}
              <div className="absolute top-6 right-6 flex gap-1">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full border border-black/20 ${i === 1 ? 'bg-green-500 animate-pulse' : 'bg-black/5'}`} />
                ))}
              </div>
            </Link>
          ))}
          
          {/* Coming Soon Card */}
          <div className="border-[5px] border-black border-dashed rounded-[2.5rem] p-8 flex flex-col items-center justify-center opacity-30 text-center grayscale">
            <div className="w-16 h-16 border-[4px] border-black border-dashed rounded-full flex items-center justify-center mb-4">
              <Zap size={24} />
            </div>
            <p className="text-sm font-black uppercase tracking-widest">More Benches<br/>Incoming</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferenceStudioV2;
