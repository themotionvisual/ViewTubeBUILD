import React, { useState, useCallback, useMemo, useEffect } from 'react';
import JSZip from 'jszip';
import { 
  BarChart3, 
  Upload, 
  FileText, 
  Trash2, 
  Zap, 
  TrendingUp, 
  PieChart, 
  Activity,
  ChevronRight,
  Sparkles,
  Search,
  Maximize2,
  X
} from 'lucide-react';
import { useBrain } from '../context/GlobalDataContext';
import { ToolHeader } from '../components/ToolHeader';
import { processCSVText, generateFileId } from '../services/dataUtils';
import { analyzeChannelData } from '../services/gemini';
import { CsvFileWithTag, AnalyticsResult, ChartConfig } from '../types';
import ReportViewer from '../components/ReportViewer';
import { RenderChart } from '../components/ChartEngine';
import { MobileLookChart } from '../components/MobileLookChart';

const Channelytics: React.FC = () => {
  const { brain, updateBrain, registerProvider, unregisterProvider } = useBrain();
  
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'report'>('dashboard');
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [activeChart, setActiveChart] = useState<ChartConfig | null>(null);

  useEffect(() => {
    registerProvider('CHANNELYTICS');
    return () => unregisterProvider('CHANNELYTICS');
  }, [registerProvider, unregisterProvider]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);
    const newCsvFiles: CsvFileWithTag[] = [];

    try {
      for (const file of Array.from(files)) {
        if (file.name.endsWith('.zip')) {
          const zip = await JSZip.loadAsync(file);
          const zipFiles = Object.keys(zip.files).filter(name => name.endsWith('.csv'));
          
          for (const zipFileName of zipFiles) {
            const content = await zip.files[zipFileName].async('string');
            const processed = processCSVText(content, zipFileName, file.name, generateFileId(zipFileName));
            if (processed.length > 0) {
              newCsvFiles.push({
                id: crypto.randomUUID(),
                name: zipFileName,
                data: processed,
                tag: 'combined' // Default
              });
            }
          }
        } else if (file.name.endsWith('.csv')) {
          const content = await file.text();
          const processed = processCSVText(content, file.name, '', generateFileId(file.name));
          if (processed.length > 0) {
            newCsvFiles.push({
              id: crypto.randomUUID(),
              name: file.name,
              data: processed,
              tag: 'combined'
            });
          }
        }
      }

      const updatedFiles = [...(brain.channelyticsState.csvFiles || []), ...newCsvFiles];
      const allData = updatedFiles.flatMap(f => f.data);
      
      updateBrain({
        channelyticsState: {
          ...brain.channelyticsState,
          csvFiles: updatedFiles,
          allData
        }
      });
    } catch (err) {
      console.error("Upload failed", err);
      alert("Verification Protocol: Asset ingestion failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const clearFiles = () => {
    updateBrain({
      channelyticsState: {
        ...brain.channelyticsState,
        csvFiles: [],
        allData: []
      }
    });
  };

  const removeFile = (id: string) => {
    const updatedFiles = brain.channelyticsState.csvFiles.filter(f => f.id !== id);
    const allData = updatedFiles.flatMap(f => f.data);
    updateBrain({
      channelyticsState: {
        ...brain.channelyticsState,
        csvFiles: updatedFiles,
        allData
      }
    });
  };

  const runAnalysis = async () => {
    if (!brain.channelyticsState.allData.length) return;
    setAnalysisLoading(true);
    try {
      const result = await analyzeChannelData(brain.channelyticsState.allData);
      updateBrain({
        channelyticsState: {
          ...brain.channelyticsState,
          analyticsResult: result
        }
      });
      setActiveTab('report');
    } catch (err) {
      console.error("Analysis failed", err);
      alert("Gemini Scan: Matrix interpretation failed.");
    } finally {
      setAnalysisLoading(false);
    }
  };

  const stats = useMemo(() => {
    const data = brain.channelyticsState.allData || [];
    if (!data.length) return null;
    
    // Simple mock stats for the tool headers if no AI analysis yet
    const views = data.reduce((acc, curr) => acc + (Number(curr['Views']) || 0), 0);
    const subs = data.reduce((acc, curr) => acc + (Number(curr['Subscribers Gained']) || 0), 0);
    
    return {
      totalViews: views.toLocaleString(),
      totalSubs: subs.toLocaleString(),
      fileCount: brain.channelyticsState.csvFiles.length
    };
  }, [brain.channelyticsState.allData, brain.channelyticsState.csvFiles]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ToolHeader 
        title="Channelytics Lab" 
        icon="analytics" 
        titleBgColor="bg-[#ccff00]" 
        iconBgColor="bg-[#00ccff]" 
      />

      {/* Control Bar */}
      <div className="flex items-center gap-6 mb-8 px-1">
         <div className="flex-1 flex gap-4">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-8 py-3 rounded-2xl border-[4px] border-black font-black uppercase italic tracking-tighter transition-all shadow-[6px_6px_0px_0px_black] active:shadow-none translate-y-[-4px] active:translate-y-[2px] ${activeTab === 'dashboard' ? 'bg-[#00ccff] text-white' : 'bg-white text-black hover:bg-gray-50'}`}
            >
              Diagnostic Board
            </button>
            <button 
              onClick={() => setActiveTab('report')}
              className={`px-8 py-3 rounded-2xl border-[4px] border-black font-black uppercase italic tracking-tighter transition-all shadow-[6px_6px_0px_0px_black] active:shadow-none translate-y-[-4px] active:translate-y-[2px] ${activeTab === 'report' ? 'bg-[#ff3399] text-white' : 'bg-white text-black hover:bg-gray-50'}`}
            >
              Strategy Report
            </button>
         </div>

         <div className="flex items-center gap-4">
            <label className="cursor-pointer bg-black text-white px-6 py-3 rounded-xl border-[3px] border-black shadow-[4px_4px_0px_0px_#ccff00] hover:shadow-none transition-all flex items-center gap-3 font-black uppercase italic text-sm">
               <Upload size={18} />
               <span>Injest Data</span>
               <input type="file" multiple accept=".csv,.zip" onChange={handleFileUpload} className="hidden" />
            </label>
            {brain.channelyticsState.allData.length > 0 && (
              <button 
                onClick={runAnalysis}
                disabled={analysisLoading}
                className="bg-[#ccff00] text-black px-6 py-3 rounded-xl border-[3px] border-black shadow-[4px_4px_0px_0px_black] hover:shadow-none transition-all flex items-center gap-3 font-black uppercase italic text-sm"
              >
                {analysisLoading ? <Activity className="animate-spin" /> : <Zap size={18} />}
                <span>Scan with Gemini</span>
              </button>
            )}
         </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 bg-white border-[4px] border-black rounded-[40px] shadow-[12px_12px_0px_0px_black] overflow-hidden flex flex-col relative">
        
        {/* Floating Mini Stats */}
        {stats && (
          <div className="absolute top-6 right-8 flex gap-6 z-10 pointer-events-none">
             <div className="bg-black/5 backdrop-blur-md border-2 border-dashed border-black/20 px-4 py-1.5 rounded-full flex items-center gap-2">
                <Search size={12} className="text-black/40" />
                <span className="text-[10px] font-black uppercase tracking-widest text-black/60">{stats.fileCount} Assets Proccessed</span>
             </div>
             <div className="bg-black/5 backdrop-blur-md border-2 border-dashed border-black/20 px-4 py-1.5 rounded-full flex items-center gap-2">
                <TrendingUp size={12} className="text-black/40" />
                <span className="text-[10px] font-black uppercase tracking-widest text-black/60">{stats.totalViews} Views Detected</span>
             </div>
          </div>
        )}

        <div className="flex-1 overflow-auto custom-scrollbar p-10">
          {activeTab === 'dashboard' ? (
            <div className="space-y-12">
               {brain.channelyticsState.csvFiles.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-[500px] text-center space-y-8 opacity-20">
                    <div className="relative">
                       <Upload size={120} className="text-black" />
                       <Sparkles className="absolute -top-4 -right-4 text-[#ccff00]" size={48} />
                    </div>
                    <div>
                       <h2 className="text-5xl font-black uppercase italic tracking-tighter">Laboratory Offline</h2>
                       <p className="font-bold text-xl">Awaiting YouTube Studio CSV or ZIP bundle for asset scanning.</p>
                    </div>
                 </div>
               ) : (
                 <>
                   {/* File List Grid */}
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {brain.channelyticsState.csvFiles.map(file => (
                        <div key={file.id} className="bg-gray-50 border-[3px] border-black rounded-2xl p-6 flex flex-col shadow-[4px_4px_0px_0px_black] hover:bg-white transition-all group relative">
                           <button 
                             onClick={() => removeFile(file.id)}
                             className="absolute -top-3 -right-3 bg-[#ff3399] text-white p-2 rounded-full border-3 border-black opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                           >
                             <Trash2 size={14} />
                           </button>
                           <div className="flex items-center gap-4 mb-4">
                              <div className="bg-white border-2 border-black p-2 rounded-lg">
                                 <FileText className="text-[#00ccff]" />
                              </div>
                              <div className="flex-1 min-w-0">
                                 <h4 className="font-black truncate uppercase text-xs italic tracking-widest">{file.name}</h4>
                                 <span className="text-[10px] font-bold text-black/40">{file.data.length} Records</span>
                              </div>
                           </div>
                           <div className="mt-auto flex items-center justify-between border-t-2 border-black/5 pt-4">
                              <span className="bg-black text-[#ccff00] text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-[0.2em]">Source: Disk</span>
                              <ChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity" size={16} />
                           </div>
                        </div>
                      ))}
                      {brain.channelyticsState.csvFiles.length > 0 && (
                        <button 
                          onClick={clearFiles}
                          className="border-[4px] border-dashed border-black/10 rounded-2xl p-6 flex flex-col items-center justify-center text-black/20 hover:text-[#ff3399] hover:bg-red-50 hover:border-[#ff3399]/20 transition-all group"
                        >
                           <Trash2 size={40} className="mb-2 group-hover:scale-110 transition-transform" />
                           <span className="font-black uppercase tracking-widest text-xs">Purge Database</span>
                        </button>
                      )}
                   </div>

                   {/* Featured Charts (Placeholder/Auto-generated if we had more logic) */}
                   <div className="space-y-8">
                      <div className="flex items-center gap-4 border-b-4 border-black pb-4">
                         <Activity className="text-[#ff3399]" />
                         <h3 className="text-3xl font-black uppercase italic tracking-tighter">Visual Telemetry</h3>
                      </div>
                      
                      {/* NEW: Mobile-Style Chart Simulation */}
                      <div className="bg-black text-white p-10 rounded-[48px] border-[6px] border-black shadow-[16px_16px_0px_0px_#ccff00] overflow-hidden">
                         <div className="flex justify-between items-center mb-8">
                            <div>
                               <h4 className="text-4xl font-[1000] uppercase italic tracking-tighter text-[#ccff00]">Viral Trajectory</h4>
                               <p className="text-sm font-bold opacity-50 uppercase tracking-widest mt-1">Simulated Mobile-Kit Aesthetic</p>
                            </div>
                            <div className="bg-[#ccff00] text-black px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Live Sync</div>
                         </div>
                         <MobileLookChart 
                           data={brain.channelyticsState.allData.slice(0, 10)}
                           xKey="Dimension"
                           yKey="Views"
                           color="#ccff00"
                           height={250}
                         />
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                         {/* We can render some default charts if data exists */}
                         <RenderChart 
                            chart={{
                              title: "Raw Performance Snapshot",
                              type: "BarChart",
                              provider: "google",
                              xAxisKey: "Dimension",
                              dataKeys: ["Views", "Subscribers Gained"],
                              options: { 
                                hAxis: { title: "Views / Subs" },
                                vAxis: { title: "Video" }
                              }
                            }}
                            data={brain.channelyticsState.allData.slice(0, 15)}
                         />
                         <RenderChart 
                            chart={{
                              title: "Monetization Audit",
                              type: "PieChart",
                              provider: "google",
                              xAxisKey: "Dimension",
                              dataKeys: ["Revenue"],
                              options: {
                                pieHole: 0.4,
                                colors: ['#CCFF00', '#00CCFF', '#FF3399', '#FFDD00']
                              }
                            }}
                            data={brain.channelyticsState.allData.slice(0, 8)}
                         />
                      </div>
                   </div>
                 </>
               )}
            </div>
          ) : (
            <div className="h-full">
              {brain.channelyticsState.analyticsResult ? (
                <ReportViewer 
                  result={brain.channelyticsState.analyticsResult} 
                  data={brain.channelyticsState.allData}
                  onLaunchVisualization={(chart) => setActiveChart(chart)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-8 opacity-20">
                   <Zap size={120} className="text-black" />
                   <div>
                      <h2 className="text-5xl font-black uppercase italic tracking-tighter">AI Core Offline</h2>
                      <p className="font-bold text-xl italic">Initiate "Gemini Scan" to generate strategic growth matrices.</p>
                   </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal for Expanded Charts */}
      {activeChart && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-12 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white border-[6px] border-black rounded-[48px] w-full max-w-7xl h-full flex flex-col shadow-[24px_24px_0px_0px_black] relative overflow-hidden">
              <button 
                onClick={() => setActiveChart(null)}
                className="absolute top-8 right-8 bg-black text-white p-3 rounded-full border-4 border-black hover:rotate-90 transition-all z-10"
              >
                 <X size={24} />
              </button>
              <div className="flex-1 p-12 overflow-auto">
                 <ToolHeader 
                    title={activeChart.title} 
                    icon={Maximize2} 
                    titleBgColor="bg-[#ffdd00]" 
                    iconBgColor="bg-black" 
                 />
                 <div className="mt-8 h-[600px]">
                    <RenderChart chart={activeChart} data={brain.channelyticsState.allData} isModal />
                 </div>
                 {activeChart.subtitle && (
                   <div className="mt-8 p-8 bg-black/5 rounded-3xl border-3 border-dashed border-black/10 font-bold text-xl leading-relaxed italic">
                      {activeChart.subtitle}
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Channelytics;
