import React, { useEffect, useRef, useState } from 'react';
import { Brain, Zap, FileText, TrendingUp, Eye, Target, Loader2 } from 'lucide-react';
import type { OracleReport, AlgorithmDiagnosis, KeywordAnalysis, UltimateChannelReport } from './types';
import { IntelligenceChart } from './IntelligenceChart';
import { emitSignal } from '../../services/brain';
import { generateUltimateChannelReport } from './ultimateReport';

const ULTIMATE_REPORT_STORAGE_KEY = "vt_ultimate_channel_report_v1";
const ULTIMATE_REPORT_EVENT = "vt_generate_ultimate_report";

type IntelligenceHubProps = {
  autoContext?: string;
  dataSources?: string[];
  mode?: "full" | "ultimate";
};

const IntelligenceHub: React.FC<IntelligenceHubProps> = ({
  autoContext = "",
  dataSources = [],
  mode = "full",
}) => {
  const triggerRef = useRef<() => Promise<void>>(async () => {});
  const [loading, setLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState<AlgorithmDiagnosis | null>(null);
  const [report, setReport] = useState<OracleReport | null>(null);
  const [keywordData, setKeywordData] = useState<KeywordAnalysis | null>(null);
  const [ultimateReport, setUltimateReport] = useState<UltimateChannelReport | null>(() => {
    try {
      const raw = localStorage.getItem(ULTIMATE_REPORT_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as UltimateChannelReport) : null;
    } catch {
      return null;
    }
  });
  const [nexusContext, setNexusContext] = useState('');
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const showFullSurface = mode === "full";

  const runOmniBrain = async () => {
    setLoading(true);
    emitSignal('omni-brain', 'SYNC_DNA_RUN', { context: nexusContext || autoContext || "AUTO_CONTEXT" }).catch(console.error);
    try {
      const { report: unifiedReport, diagnosis: diagRes, oracle: oracleRes, keyword: kwRes } =
        await generateUltimateChannelReport({
          manualIntent: nexusContext,
          autoContext,
          dataSources,
        });
      setDiagnosis(diagRes);
      setReport(oracleRes);
      setKeywordData(kwRes);
      setUltimateReport(unifiedReport);
      localStorage.setItem(ULTIMATE_REPORT_STORAGE_KEY, JSON.stringify(unifiedReport));
      setActiveSectionIdx(0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  triggerRef.current = runOmniBrain;

  useEffect(() => {
    const handleGenerateEvent = () => {
      triggerRef.current().catch((error) => {
        console.error("Ultimate report event trigger failed", error);
      });
    };
    window.addEventListener(ULTIMATE_REPORT_EVENT, handleGenerateEvent);
    return () => window.removeEventListener(ULTIMATE_REPORT_EVENT, handleGenerateEvent);
  }, []);

  const isGenerated = diagnosis && report && keywordData;

  return (
    <div className="animate-fade-in max-w-[1500px] mx-auto pb-24">
      {showFullSurface ? (
        <div className="border-4 border-black bg-white rounded-3xl overflow-hidden shadow-[8px_8px_0px_0px_black] mb-12">
          <div className="bg-[#00CCFF] border-b-4 border-black px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain size={28} className="text-black" />
              <span className="text-3xl font-[1000] uppercase tracking-tight text-black">NEURAL NEXUS v2.0</span>
            </div>
            <span className="text-[10px] font-black opacity-50 tracking-widest uppercase">Strategy DNA Broadcast</span>
          </div>
          <div className="p-6 bg-black flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={nexusContext}
              onChange={(e) => setNexusContext(e.target.value)}
              placeholder="INPUT STRATEGIC INTENT OR PASTE CHANNEL METRICS..."
              className="flex-1 bg-transparent border-2 border-[#00CCFF] text-[#00CCFF] p-4 font-black text-sm uppercase tracking-widest outline-none placeholder:text-[#00CCFF]/30 rounded-xl"
              disabled={loading}
            />
            <button
              onClick={runOmniBrain}
              disabled={loading}
              className="bg-[#00CCFF] text-black font-[1000] text-xl uppercase px-12 py-4 rounded-xl border-2 border-[#00CCFF] hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="animate-spin" size={24} /> CALIBRATING...</> : 'SYNC DNA'}
            </button>
          </div>
        </div>
      ) : (
        <div className="border-4 border-black bg-white rounded-3xl overflow-hidden shadow-[8px_8px_0px_0px_black] mb-12">
          <div className="bg-[#CCFF00] border-b-4 border-black px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText size={24} className="text-black" />
              <span className="text-2xl font-[1000] uppercase tracking-tight text-black">Ultimate Report Generator</span>
            </div>
            <span className="text-[10px] font-black opacity-60 tracking-widest uppercase">No Required Manual Input</span>
          </div>
          <div className="p-6 bg-black flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={nexusContext}
              onChange={(e) => setNexusContext(e.target.value)}
              placeholder="OPTIONAL: ADD EXTRA STRATEGIC CONTEXT"
              className="flex-1 bg-transparent border-2 border-[#CCFF00] text-[#CCFF00] p-4 font-black text-sm uppercase tracking-widest outline-none placeholder:text-[#CCFF00]/35 rounded-xl"
              disabled={loading}
            />
            <button
              onClick={runOmniBrain}
              disabled={loading}
              className="bg-[#CCFF00] text-black font-[1000] text-xl uppercase px-12 py-4 rounded-xl border-2 border-[#CCFF00] hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="animate-spin" size={24} /> GENERATING...</> : 'GENERATE ULTIMATE REPORT'}
            </button>
          </div>
        </div>
      )}

      {ultimateReport && (
        <div className="border-4 border-black bg-white rounded-3xl overflow-hidden shadow-[8px_8px_0px_0px_black] mb-12">
          <div className="bg-[#CCFF00] border-b-4 border-black px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp size={24} className="text-black" />
              <span className="text-2xl font-[1000] uppercase tracking-tight text-black">Ultimate Channel Report</span>
            </div>
            <span className="text-[10px] font-black opacity-60 tracking-widest uppercase">
              {new Date(ultimateReport.meta.generatedAt).toLocaleString()}
            </span>
          </div>
          <div className="p-6 md:p-8 bg-[#f5f5f5] space-y-6">
            <div className="border-3 border-black bg-white rounded-2xl p-4 md:p-6">
              <h3 className="text-xl font-[1000] uppercase mb-2">Executive Command Snapshot</h3>
              <p className="text-sm font-bold whitespace-pre-wrap">{ultimateReport.executiveSummary}</p>
            </div>
            <div className="grid grid-cols-1 gap-5">
              {ultimateReport.blocks.map((block) => (
                <section key={block.id} className="border-3 border-black rounded-2xl bg-white overflow-hidden">
                  <header className="px-4 py-3 border-b-3 border-black bg-[#efefef] flex items-center justify-between">
                    <h4 className="font-[1000] uppercase tracking-tight text-sm md:text-base">{block.id}. {block.title}</h4>
                    <span className="text-[10px] font-black opacity-50 uppercase">Auto Generated</span>
                  </header>
                  <div className="p-4 md:p-5 space-y-4">
                    <p className="text-sm font-bold leading-relaxed whitespace-pre-wrap">{block.summary}</p>
                    {block.chartSuggestion && (
                      <div className="border-2 border-black rounded-xl bg-gray-50 p-4 overflow-x-auto">
                        <IntelligenceChart config={block.chartSuggestion} data={keywordData?.keywordMetrics || []} />
                      </div>
                    )}
                    {block.tableSpec && (
                      <div className="border-2 border-black rounded-xl overflow-auto max-h-[260px]">
                        <table className="w-full border-collapse text-xs">
                          <thead className="bg-black text-white sticky top-0">
                            <tr>
                              {block.tableSpec.headers.map((header) => (
                                <th key={header} className="text-left p-2 font-black uppercase tracking-wide border-r border-white/20">
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {block.tableSpec.rows.map((row, rowIdx) => (
                              <tr key={`${block.id}-row-${rowIdx}`} className={rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                {row.map((cell, cellIdx) => (
                                  <td key={`${block.id}-${rowIdx}-${cellIdx}`} className="p-2 border-t border-black/10 border-r border-black/10 font-bold whitespace-nowrap">
                                    {String(cell)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {block.recommendations.length > 0 && (
                      <ul className="space-y-1">
                        {block.recommendations.map((item, idx) => (
                          <li key={`${block.id}-rec-${idx}`} className="text-sm font-bold">
                            {idx + 1}. {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MASTER DOSSIER (Hidden until generated) */}
      {showFullSurface && isGenerated && !loading && (
        <div className="space-y-12 animate-fade-in">
          
          {/* HEADER: COMMAND BRIEF & GOVERNOR */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 border-4 border-black rounded-3xl overflow-hidden shadow-[6px_6px_0px_0px_black] bg-white flex flex-col">
              <div className="bg-black text-white px-6 py-3 font-black uppercase text-sm flex items-center gap-2">
                <Zap size={16} className="text-[#FFDD00]" /> DAILY COMMAND BRIEF
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
                <div className="md:col-span-2 space-y-4">
                  <h3 className="text-4xl font-[1000] uppercase tracking-tight leading-none">
                    {diagnosis?.dailyBrief?.priority || "STRATEGY CALIBRATED"}
                  </h3>
                  <div className="space-y-3 mt-4">
                    {diagnosis?.dailyBrief?.steps?.map((step, i) => (
                      <div key={i} className="flex gap-4 items-start p-3 bg-gray-50 border-2 border-black rounded-xl">
                        <span className="bg-black text-[#FFDD00] w-6 h-6 flex items-center justify-center rounded-full font-black text-xs flex-shrink-0">{i+1}</span>
                        <span className="font-bold text-sm">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-[#FFDD00] p-6 border-4 border-black rounded-3xl flex flex-col justify-center items-center text-center shadow-[4px_4px_0px_0px_black]">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Impact Potential</span>
                  <span className="text-5xl font-[1000]">{diagnosis?.dailyBrief?.impact || "0%"}</span>
                </div>
              </div>
            </div>

            <div className="border-4 border-black rounded-3xl overflow-hidden shadow-[6px_6px_0px_0px_black] bg-white flex flex-col">
              <div className="bg-[#FF3399] text-white px-6 py-3 font-black uppercase text-sm">THE GOVERNOR</div>
              <div className="p-6 space-y-4 flex-1">
                {[
                  { label: 'CTR Pivot Protocol', desc: 'Auto-swap thumbnails at 24h threshold', on: true },
                  { label: 'Retention Rescue', desc: 'Pin comments at major drop-off markers', on: false },
                  { label: 'Audience Seeding', desc: 'Cross-pollinate shorts viewers to long-form', on: true },
                ].map((g, i) => (
                  <div key={i} className="p-3 border-2 border-black rounded-xl bg-gray-50 flex justify-between items-center">
                    <div>
                      <p className="font-black text-xs uppercase">{g.label}</p>
                      <p className="text-[10px] font-bold opacity-50">{g.desc}</p>
                    </div>
                    <div className={`w-10 h-5 ${g.on ? 'bg-[#FF3399]' : 'bg-gray-300'} border-2 border-black rounded-full relative transition-colors`}>
                      <div className={`absolute ${g.on ? 'right-[2px]' : 'left-[2px]'} top-[2px] w-3 h-3 bg-black rounded-full transition-all`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ROW 1: ALGORITHMIC FINGERPRINTING */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border-4 border-black rounded-3xl overflow-hidden shadow-[6px_6px_0px_0px_black] bg-[#00CCFF]">
              <div className="px-6 py-3 font-black uppercase text-sm border-b-4 border-black bg-white">CLUSTER CENTER</div>
              <div className="p-6 flex items-center justify-center h-full">
                <span className="text-4xl font-[1000] uppercase text-center text-black leading-none">{diagnosis?.clusterCenter || "UNKNOWN"}</span>
              </div>
            </div>
            <div className="border-4 border-black rounded-3xl overflow-hidden shadow-[6px_6px_0px_0px_black] bg-white">
              <div className="px-6 py-3 font-black uppercase text-sm border-b-4 border-black bg-gray-100">NICHE AUTHORITY</div>
              <div className="p-6 flex items-center justify-center h-full">
                <span className="text-6xl font-[1000] text-[#00CCFF]">{diagnosis?.nicheAuthority || 0}%</span>
              </div>
            </div>
            <div className="border-4 border-black rounded-3xl overflow-hidden shadow-[6px_6px_0px_0px_black] bg-black">
              <div className="px-6 py-3 font-black uppercase text-sm border-b-4 border-black bg-white">TOPIC RESONANCE</div>
              <div className="p-6 flex items-end justify-between h-full gap-2">
                {[40, 70, 45, 90, 65, 80].map((h, i) => (
                  <div key={i} className="flex-1 bg-[#CCFF00] border-2 border-black rounded-t-md" style={{ height: `${h}%` }}></div>
                ))}
              </div>
            </div>
          </div>

          {/* ROW 2: ORACLE 9-SECTION STRATEGY */}
          {report?.sections && report.sections.length > 0 && (
            <div className="border-4 border-black rounded-3xl overflow-hidden shadow-[8px_8px_0px_0px_black] bg-white">
              <div className="bg-[#9D4EDD] text-white px-6 py-4 flex items-center gap-3 border-b-4 border-black">
                <Eye size={24} />
                <span className="text-2xl font-[1000] uppercase tracking-tight">ORACLE STRATEGY DOSSIER</span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
                {/* Navigation */}
                <div className="lg:col-span-3 border-b-4 lg:border-b-0 lg:border-r-4 border-black bg-gray-50 flex flex-col">
                  {report.sections.map((s, i) => (
                    <button 
                      key={i} 
                      onClick={() => setActiveSectionIdx(i)}
                      className={`text-left p-4 border-b-2 border-black font-black text-xs uppercase transition-colors flex items-center ${activeSectionIdx === i ? 'bg-[#9D4EDD] text-white' : 'hover:bg-gray-200 text-black'}`}
                    >
                      <span className="opacity-50 mr-3 text-[10px] w-4">{String(i+1).padStart(2,'0')}</span>
                      {s.title}
                    </button>
                  ))}
                </div>
                {/* Content */}
                <div className="lg:col-span-9 p-8 flex flex-col bg-white">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-3xl font-[1000] uppercase tracking-tight">{report.sections[activeSectionIdx]?.title}</h4>
                    <span className="text-[10px] font-black opacity-30 uppercase tracking-widest">Section {activeSectionIdx + 1} of {report.sections.length}</span>
                  </div>
                  <div className="prose max-w-none text-sm font-bold whitespace-pre-wrap leading-relaxed mb-8">
                    {report.sections[activeSectionIdx]?.content}
                  </div>
                  {report.sections[activeSectionIdx]?.chartSuggestion && (
                    <div className="mt-auto border-4 border-dashed border-black rounded-3xl p-6 bg-gray-50">
                      <IntelligenceChart config={report.sections[activeSectionIdx].chartSuggestion!} data={[]} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ROW 3: MARKET INTELLIGENCE (Keyword Lab) */}
          {keywordData && (
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="h-1 flex-1 bg-black"></div>
                <h2 className="text-3xl font-[1000] uppercase tracking-widest">MARKET INTELLIGENCE</h2>
                <div className="h-1 flex-1 bg-black"></div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {keywordData.keywordMetrics?.length > 0 && (
                  <div className="border-4 border-black rounded-3xl overflow-hidden shadow-[6px_6px_0px_0px_black] bg-white">
                    <div className="bg-[#FFB158] px-6 py-3 font-black uppercase text-sm border-b-4 border-black">OPPORTUNITY MATRIX</div>
                    <div className="p-6">
                      <IntelligenceChart config={{ type: 'scatter', title: 'Difficulty vs Volume', xAxisKey: 'volume', dataKeys: ['difficulty'] }} data={keywordData.keywordMetrics} />
                    </div>
                  </div>
                )}
                
                {keywordData.contentFormats?.length > 0 && (
                  <div className="border-4 border-black rounded-3xl overflow-hidden shadow-[6px_6px_0px_0px_black] bg-white">
                    <div className="bg-[#CCFF00] px-6 py-3 font-black uppercase text-sm border-b-4 border-black">WINNING FORMATS</div>
                    <div className="p-6">
                      <IntelligenceChart config={{ type: 'pie', title: 'Format Distribution', xAxisKey: 'name', dataKeys: ['percentage'] }} data={keywordData.contentFormats} />
                    </div>
                  </div>
                )}

                {keywordData.searchIntent?.length > 0 && (
                  <div className="lg:col-span-2 border-4 border-black rounded-3xl overflow-hidden shadow-[6px_6px_0px_0px_black] bg-white">
                    <div className="bg-black text-white px-6 py-3 font-black uppercase text-sm border-b-4 border-black flex items-center gap-2">
                      <Target size={16} /> SEARCH INTENT DECODER
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-100 border-b-4 border-black">
                            <th className="text-left p-4 font-black text-xs uppercase">Query</th>
                            <th className="text-left p-4 font-black text-xs uppercase">Intent</th>
                            <th className="text-left p-4 font-black text-xs uppercase">Content Angle</th>
                          </tr>
                        </thead>
                        <tbody>
                          {keywordData.searchIntent.map((si, i) => (
                            <tr key={i} className="border-b-2 border-gray-200 hover:bg-gray-50">
                              <td className="p-4 font-bold text-sm border-r-2 border-gray-200">{si.query}</td>
                              <td className="p-4 border-r-2 border-gray-200">
                                <span className="bg-black text-[#00CCFF] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">{si.intent}</span>
                              </td>
                              <td className="p-4 text-sm font-bold opacity-80">{si.contentAngle}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default IntelligenceHub;
