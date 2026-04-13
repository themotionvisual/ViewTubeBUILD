import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Maximize2, RefreshCw, ExternalLink } from 'lucide-react';
import { BENCH_REGISTRY } from './benchRegistry';

const BenchExplorer: React.FC = () => {
  const { benchId } = useParams<{ benchId: string }>();
  const navigate = useNavigate();
  const bench = BENCH_REGISTRY.find(b => b.id === benchId);

  if (!bench) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-20">
        <div className="border-[5px] border-white p-10 bg-black shadow-[10px_10px_0px_0px_#CCFF00] rounded-2xl text-white">
          <h1 className="text-4xl font-black uppercase tracking-tighter italic mb-4">Atomic Failure</h1>
          <p className="font-bold opacity-50">Unknown Bench Vector: {benchId}</p>
          <button onClick={() => navigate('/reference-studio-v2')} className="mt-8 px-6 py-3 bg-[#CCFF00] text-black font-black uppercase text-xs rounded-xl shadow-[4px_4px_0px_0px_white]">Return to Hub</button>
        </div>
      </div>
    );
  }

  const renderUrl = `/render-bench/${bench.id}`;

  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden">
      {/* Precision Header/Navigation */}
      <header className="h-16 bg-white border-b-[5px] border-black flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-6">
          <Link 
            to="/reference-studio-v2" 
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-800 transition-all border-[3px] border-black shadow-[4px_4px_0px_0px_#CCFF00]"
          >
            <ChevronLeft size={16} strokeWidth={3} />
            Back to Hub
          </Link>
          <div className="h-8 w-[2px] bg-black/10" />
          <div>
            <div className="flex items-center gap-3">
              <span className={`px-2 py-0.5 rounded text-[9px] font-[1000] uppercase text-black border-[2px] border-black ${bench.color}`}>{bench.tag}</span>
              <h1 className="text-2xl font-[1000] uppercase italic tracking-tighter leading-none">{bench.title}</h1>
            </div>
            <p className="text-[10px] font-black uppercase opacity-40 tracking-widest mt-1">
              Atomic Bench Isolation: <span className="text-black">{bench.id}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.location.reload()}
            className="p-3 border-[3px] border-black rounded-xl hover:bg-gray-50 transition-colors"
            title="Reload Hardware"
          >
            <RefreshCw size={18} strokeWidth={2.5} />
          </button>
          <a 
            href={renderUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-3 border-[3px] border-black rounded-xl hover:bg-gray-50 transition-colors"
            title="Open Raw Source"
          >
            <Maximize2 size={18} strokeWidth={2.5} />
          </a>
        </div>
      </header>

      {/* Atomic Iframe Container */}
      <main className="flex-1 relative bg-[#111]">
        {/* Shadow Overlay for Depth */}
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0px_10px_30px_rgba(0,0,0,0.5)] z-[5]" />
        
        {/* The hardware-isolated iframe */}
        <iframe 
          src={renderUrl}
          className="w-full h-full border-none"
          title={`Atomic Bench: ${bench.title}`}
          loading="lazy"
        />
      </main>

      {/* Minimal Footer */}
      <footer className="h-8 bg-black text-white/40 flex items-center justify-between px-6 text-[9px] font-black uppercase tracking-[0.2em] shrink-0">
        <div>Precise Layout Confinement Enabled</div>
        <div className="flex gap-4">
          <span>Vector: 28.D_CANONICAL</span>
          <span>Status: Operational</span>
        </div>
      </footer>
    </div>
  );
};

export default BenchExplorer;
