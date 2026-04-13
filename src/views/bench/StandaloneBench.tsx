import React, { Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { BENCH_REGISTRY } from './benchRegistry';

const StandaloneBench: React.FC = () => {
  const { benchId } = useParams<{ benchId: string }>();
  const bench = BENCH_REGISTRY.find(b => b.id === benchId);

  if (!bench) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-20">
        <div className="border-[5px] border-black p-10 bg-white shadow-[10px_10px_0px_0px_black] rounded-2xl">
          <h1 className="text-4xl font-black uppercase tracking-tighter italic mb-4 text-red-600">Bench Not Found</h1>
          <p className="font-bold opacity-50">Invalid bench ID: <code className="bg-gray-100 p-1 rounded font-black">{benchId}</code></p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e5e5e5] p-12 overflow-x-hidden">
      <div className="max-w-[1450px] mx-auto">
        <Suspense fallback={
          <div className="min-h-[400px] flex items-center justify-center border-[5px] border-black bg-white shadow-[10px_10px_0px_0px_black] rounded-3xl">
            <p className="text-2xl font-black uppercase italic tracking-widest animate-pulse">Initializing Hardware...</p>
          </div>
        }>
          {bench.render()}
        </Suspense>
      </div>
    </div>
  );
};

export default StandaloneBench;
