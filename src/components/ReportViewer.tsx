import React from 'react';
import Markdown from 'react-markdown';
import { AnalyticsResult, ChartConfig } from '../types';
import { Shield, Zap, Sparkles, BarChart3, TrendingUp, Target } from 'lucide-react';
import { RenderChart } from './ChartEngine';

interface ReportViewerProps {
  result: AnalyticsResult;
  data?: any[];
  onLaunchVisualization?: (chart: ChartConfig) => void;
}

const ReportViewer: React.FC<ReportViewerProps> = ({ result, data = [], onLaunchVisualization }) => {
  return (
    <div className="flex-1 p-8 space-y-16 overflow-auto bg-[#f8f8f8]" style={{ backgroundImage: 'radial-gradient(rgba(0,0,0,0.08) 1.5px, transparent 0)', backgroundSize: '40px 40px' }}>
      
       <div className="bg-white border-[6px] border-black rounded-[48px] shadow-[24px_24px_0px_0px_rgba(0,0,0,1)] p-12 space-y-20 relative overflow-hidden">
          
          <div className="absolute top-10 right-14 flex flex-col items-end gap-3 text-right">
             <div className="flex gap-4 text-black/20">
                <Shield size={32} />
                <Zap size={32} />
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.3em] leading-tight max-w-[200px] opacity-30 italic">
               Advanced Algorithmic Fingerprinting & Strategy Module V21.4
             </p>
          </div>

          <div className="space-y-4">
             <div className="inline-flex items-center gap-2 bg-black text-[#CCFF00] px-4 py-1.5 rounded-full font-black uppercase text-xs tracking-widest italic">
                <Sparkles size={14} /> AI Diagnostic Report
             </div>
             <h1 className="text-7xl font-black uppercase tracking-tighter italic leading-none">The Strategy <span className="text-[#FF3399]">Pulse</span></h1>
          </div>

          {/* --- SECTION 01 & 02: EXECUTIVE SUMMARY & STATS --- */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
             <div className="lg:col-span-8 space-y-8">
                <div className="flex items-center gap-6">
                   <span className="bg-black text-white font-black px-4 py-2 rounded-2xl text-2xl italic tracking-tighter">01</span>
                   <h4 className="text-4xl font-black uppercase tracking-tighter italic">Executive Summary</h4>
                </div>
                <div className="prose prose-xl max-w-none">
                   <div className="mb-10 p-8 bg-black text-[#CCFF00] rounded-3xl border-[4px] border-black font-black text-lg italic leading-relaxed shadow-[12px_12px_0px_0px_rgba(204,255,0,0.2)]">
                     Creative Oracle Protocol: Cross-referencing multi-point data exports to identify high-velocity growth patterns and retention friction.
                   </div>
                   <div className="font-bold text-gray-800 leading-relaxed text-xl space-y-6">
                     <Markdown>{result.executiveSummary}</Markdown>
                   </div>
                </div>
             </div>

             <div className="lg:col-span-4 bg-white border-[6px] border-black rounded-[40px] p-10 shadow-[12px_12px_0px_0px_black] space-y-8">
                <div className="flex items-center gap-4">
                   <span className="bg-[#CCFF00] text-black font-black px-3 py-1 rounded-xl text-sm italic tracking-tighter">02</span>
                   <h5 className="font-black uppercase text-base tracking-widest italic">Channel Metrics</h5>
                </div>
                {result.stats && (
                  <div className="grid grid-cols-1 gap-6">
                     {Object.entries(result.stats).map(([key, val]) => (
                       <div key={key} className="flex items-center justify-between border-b-4 border-black/5 pb-4 group hover:border-[#FF3399] transition-colors">
                          <span className="text-xs font-black uppercase text-black/40 tracking-widest group-hover:text-black transition-colors">{key}</span>
                          <span className="text-3xl font-black italic tracking-tighter tabular-nums group-hover:text-[#FF3399] transition-colors">
                            {typeof val === 'number' ? (val % 1 !== 0 ? val.toFixed(2) : val.toLocaleString()) : val}
                          </span>
                       </div>
                     ))}
                  </div>
                )}
             </div>
          </div>

          {/* Core Insights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
             {result.sections.filter(s => !s.chartSuggestion).map((section, idx) => (
               <div key={idx} className="bg-white border-[5px] border-black rounded-[36px] overflow-hidden shadow-[16px_16px_0px_0px_black] flex flex-col hover:translate-y-[-8px] transition-transform cursor-default">
                  <div className={`p-8 border-b-[5px] border-black font-black uppercase text-sm tracking-widest flex items-center justify-between ${
                    ['bg-[#CCFF00] text-black', 'bg-[#FF3399] text-white', 'bg-[#00CCFF] text-black', 'bg-[#FFDD00] text-black'][idx % 4]
                  }`}>
                     <div className="flex items-center gap-3">
                        {idx % 4 === 0 && <Target size={20} />}
                        {idx % 4 === 1 && <Zap size={20} />}
                        {idx % 4 === 2 && <TrendingUp size={20} />}
                        {idx % 4 === 3 && <BarChart3 size={20} />}
                        <span className="italic">{section.title}</span>
                     </div>
                     <span className="text-xs opacity-40">INSIGHT #0{idx+1}</span>
                  </div>
                  <div className="p-10 font-bold text-lg leading-relaxed text-gray-700 flex-1 italic">
                     <Markdown>{section.content}</Markdown>
                  </div>
               </div>
             ))}
          </div>

          {/* Data Visualizations */}
          <div className="space-y-16 pt-10">
             <div className="flex items-center justify-between border-b-[6px] border-black pb-6">
                <h4 className="text-6xl font-black uppercase tracking-tighter italic">Deep Data <span className="text-[#00CCFF]">Sync</span></h4>
                <div className="flex gap-4">
                   <div className="w-16 h-3 bg-black"></div>
                   <div className="w-6 h-3 bg-[#FF3399]"></div>
                   <div className="w-6 h-3 bg-[#CCFF00]"></div>
                </div>
             </div>

             <div className="space-y-24">
                {result.sections.filter(s => s.chartSuggestion).map((section, idx) => (
                   <div key={idx} className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${idx * 200}ms` }}>
                      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-[5px] border-black pb-4">
                         <div className="space-y-2">
                            <h5 className="text-4xl font-black uppercase tracking-tight italic">{section.title}</h5>
                            <div className="flex items-center gap-3">
                               <div className="w-2 h-2 rounded-full bg-[#FF3399] animate-pulse"></div>
                               <p className="text-xs font-black uppercase tracking-[0.2em] text-black/30">Holographic Diagnostic Engine // Active</p>
                            </div>
                         </div>
                         {onLaunchVisualization && (
                           <button 
                              onClick={() => onLaunchVisualization(section.chartSuggestion!)}
                              className="bg-black text-[#CCFF00] font-black uppercase text-xs py-4 px-10 rounded-2xl shadow-[6px_6px_0px_0px_#FF3399] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all italic tracking-widest"
                           >
                              Expand Visualization
                           </button>
                         )}
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                         <div className="lg:col-span-5 font-bold text-lg text-gray-700 leading-relaxed bg-black/[0.03] p-10 rounded-[40px] border-[3px] border-dashed border-black/10 italic">
                            <Markdown>{section.content}</Markdown>
                         </div>
                         <div className="lg:col-span-7">
                            <RenderChart chart={section.chartSuggestion!} data={data} />
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          </div>

          {/* Efficiency Matrix Table */}
          {result.keywordComparisonTable && (
             <div className="bg-white border-[6px] border-black rounded-[40px] overflow-hidden shadow-[20px_20px_0px_0px_black]">
                <div className="bg-[#CCFF00] p-10 border-b-[6px] border-black flex items-center justify-between">
                   <div className="space-y-1">
                      <h5 className="text-4xl font-black uppercase tracking-tighter italic">Efficiency Matrix</h5>
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Weighted Performance Correlation Index</span>
                   </div>
                   <Zap size={48} className="text-black" />
                </div>
                <div className="overflow-x-auto p-2">
                   <table className="w-full text-left text-base border-collapse">
                     <thead className="bg-black text-[#CCFF00] border-b-[4px] border-black">
                       <tr>
                         {result.keywordComparisonTable.headers.map((h, i) => (
                           <th key={i} className="p-6 border-r border-white/10 font-black uppercase italic tracking-tighter text-sm">{h}</th>
                         ))}
                       </tr>
                     </thead>
                     <tbody>
                       {result.keywordComparisonTable.rows.map((row, ri) => (
                         <tr key={ri} className="border-b-[4px] border-black/5 hover:bg-black/5 group transition-colors italic">
                           {row.map((cell, ci) => (
                             <td key={ci} className={`p-6 border-r border-black/5 font-black ${ci === 0 ? 'text-black' : 'text-gray-500'} ${ci === 4 ? 'text-2xl' : ''}`}>
                               {ci === 4 ? <span className="text-[#FF3399]">{cell}</span> : cell}
                             </td>
                           ))}
                         </tr>
                       ))}
                     </tbody>
                   </table>
                </div>
             </div>
          )}

          {/* Mini Collections */}
          {result.miniSpreadsheets && (
             <div className="space-y-12">
                <h4 className="text-4xl font-black uppercase tracking-tighter italic border-b-[5px] border-black pb-4">Comparative <span className="text-[#FF3399]">Micro-Data</span></h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                   {result.miniSpreadsheets.map((sheet, si) => (
                     <div key={si} className="bg-white border-[5px] border-black rounded-[32px] overflow-hidden shadow-[12px_12px_0px_0px_black] hover:rotate-1 transition-transform">
                       <div className={`px-6 py-4 border-b-[5px] border-black text-xs font-black uppercase tracking-widest italic ${
                         ['bg-[#00CCFF] text-black', 'bg-[#FF3399] text-white', 'bg-[#CCFF00] text-black'][si % 3]
                       }`}>
                         {sheet.title}
                       </div>
                       <div className="overflow-x-auto p-1">
                         <table className="w-full text-left text-[11px] border-collapse italic">
                           <thead className="bg-black/5 border-b-[3px] border-black">
                             <tr>
                               {sheet.headers.map((h, i) => (
                                 <th key={i} className="p-3 border-r border-black/10 font-black uppercase text-black/40 text-[9px] tracking-widest">{h}</th>
                               ))}
                             </tr>
                           </thead>
                           <tbody className="font-bold">
                             {sheet.rows.map((row, ri) => (
                               <tr key={ri} className="border-b-[2px] border-black/5 hover:bg-black/5">
                                 {row.map((cell, ci) => (
                                   <td key={ci} className="p-3 border-r border-black/5">{cell}</td>
                                 ))}
                               </tr>
                             ))}
                           </tbody>
                         </table>
                       </div>
                     </div>
                   ))}
                </div>
             </div>
          )}
       </div>
    </div>
  );
};

export default ReportViewer;
