import React, { useState, useEffect, useRef, useMemo } from 'react';
import JSZip from 'jszip';
import {
  Upload,
  FileText,
  Trash2,
  Zap,
  TrendingUp,
  Activity,
  Sparkles,
  Search,
  X,
  Database
} from 'lucide-react';
import { useBrain } from '../context/GlobalDataContext';
import { normalizeRow } from '../services/dataNormalization';
import { analyzeChannelData } from '../services/gemini';
import type { CsvFileWithTag, ChartConfig } from '../types';
import ReportViewer from '../components/ReportViewer';
import { RenderChart } from '../components/ChartEngine';
import { MobileLookChart } from '../components/MobileLookChart';
import { performSync } from '../services/analyticsSync';

const extractDateRangeFromName = (name: string): string => {
  const lowerName = name.toLowerCase();
  const pastDaysMatch = lowerName.match(/(?:past|last)\s+(\d+)\s+days/);
  if (pastDaysMatch) return `Past ${pastDaysMatch[1]} Days`;
  if (lowerName.match(/all[\s_]*time/) || lowerName.includes("lifetime")) return "All Time";
  const dateMatch = name.match(/(\d{4}[-/]\d{2}[-/]\d{2}).*?(\d{4}[-/]\d{2}[-/]\d{2})/);
  if (dateMatch) return `${dateMatch[1]} to ${dateMatch[2]}`;
  return "";
};

const Channelytics: React.FC = () => {
  const { brain, updateBrain, registerProvider, unregisterProvider } = useBrain();

  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'report' | 'data'>('dashboard');
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [activeChart, setActiveChart] = useState<ChartConfig | null>(null);

  // Advanced Data Integration States
  const [dataSource, setDataSource] = useState<'csv' | 'analytics' | 'both'>('both');
  const [preUploadType, setPreUploadType] = useState<string>('auto');
  const [parsedData, setParsedData] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    registerProvider('CHANNELYTICS');
    return () => unregisterProvider('CHANNELYTICS');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Process files when csvFiles or dataSource change
  useEffect(() => {
    const handleSync = () => {
      if (dataSource === 'analytics' || dataSource === 'both') {
        processFiles(brain.channelyticsState.csvFiles || []);
      }
    };
    window.addEventListener('yt_analytics_synced', handleSync);

    if ((brain.channelyticsState.csvFiles && brain.channelyticsState.csvFiles.length > 0) || dataSource === 'analytics' || dataSource === 'both') {
      processFiles(brain.channelyticsState.csvFiles || []);
    } else {
      setParsedData([]);
    }

    return () => {
      window.removeEventListener('yt_analytics_synced', handleSync);
    };
  }, [brain.channelyticsState.csvFiles, dataSource]);

  const parseCSV = (text: string) => {
    try {
      const lines = text.split('\n').filter((l) => l.trim());
      if (lines.length < 2) return [];
      const parseLine = (line: string) => {
        const result = [];
        let current = "";
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') inQuotes = !inQuotes;
          else if (char === "," && !inQuotes) {
            result.push(current);
            current = "";
          } else current += char;
        }
        result.push(current);
        return result.map((v) => v.trim().replace(/^"|"$/g, ""));
      };
      const headers = parseLine(lines[0]);
      return lines.slice(1).map((line) => {
        const values = parseLine(line);
        const obj: any = {};
        headers.forEach((h, i) => {
          let val = values[i];
          if (val !== undefined) {
            const cleanVal = val.replace(/%/g, "").replace(/,/g, "");
            if (cleanVal !== "" && !isNaN(Number(cleanVal))) obj[h] = Number(cleanVal);
            else obj[h] = val;
          }
        });
        return obj;
      });
    } catch (e) {
      return [];
    }
  };

  const processFiles = async (files: CsvFileWithTag[], initialDateRange?: string) => {
    let combined: any[] = [];

    // 1. Process CSV Data
    if (dataSource === 'csv' || dataSource === 'both') {
      for (const f of files) {
        const parsed = (f.data || []).map((row: any, idx: number) => {
          const newRow = { ...row };
          if (initialDateRange && (!newRow["Date"] || !String(newRow["Date"]).trim())) {
            newRow["Date"] = initialDateRange;
          }
          return {
            ...newRow,
            _sourceFile: f.name || 'CSV Upload',
            _userTag: f.tag || 'unknown',
            _id: `${f.name}-${idx}`,
          };
        });
        combined = [...combined, ...parsed];
      }
    }

    // 2. Process API Data
    if (dataSource === 'analytics' || dataSource === 'both') {
      try {
        const cacheRaw = localStorage.getItem('yt_analytics_cache');
        if (cacheRaw) {
          const cache = JSON.parse(cacheRaw);
          if (cache.videos && Array.isArray(cache.videos)) {
            const analyticsMap = new Map();
            if (cache.analytics && cache.analytics.rows && cache.analytics.columnHeaders) {
              const hNames = cache.analytics.columnHeaders.map((h: any) => h.name);
              const videoIdx = hNames.findIndex((n: string) => n.toLowerCase() === 'video');
              if (videoIdx !== -1) {
                cache.analytics.rows.forEach((row: any[]) => {
                  const vid = row[videoIdx];
                  if (vid) {
                    const rowObj: any = {};
                    hNames.forEach((name: string, i: number) => { rowObj[name] = row[i]; });
                    analyticsMap.set(vid, normalizeRow(rowObj));
                  }
                });
              }
            }
            const analyticsData = cache.videos.map((v: any, idx: number) => {
              const stat = (cache.stats && cache.stats[v.videoId]) || {};
              const analytic = analyticsMap.get(v.videoId) || {};
              const obj: any = {
                "Video title": v.title,
                "Video": v.title,
                "Dimension": v.videoId,
                "Video ID": v.videoId,
                "Date": v.publishedAt,
                "Views": analytic["Views"] || stat.viewCount || 0,
                "Watch Time (Hours)": analytic["Watch Time (Hours)"] || (stat.durationSeconds || 0) / 3600,
                "Likes": analytic["Likes"] || stat.likeCount || 0,
                "Comments": analytic["Comments"] || stat.commentCount || 0,
                "Subscribers Gained": analytic["Subscribers Gained"] || 0,
                "Subscribers": analytic["Subscribers Gained"] || 0,
                "AVD (Sec)": analytic["AVD (Sec)"] || 0,
                "AVP (%)": analytic["AVP (%)"] || 0,
                "CTR (%)": analytic["CTR (%)"] || 0,
                "Revenue": analytic["Revenue"] || 0,
              };
              Object.keys(analytic).forEach(key => { if (!obj.hasOwnProperty(key)) obj[key] = analytic[key]; });
              return {
                ...obj,
                _sourceFile: "YouTube API",
                _userTag: stat.isShort ? "shorts" : "long",
                _id: `yt-api-${v.videoId}-${idx}`,
              };
            });
            combined = [...combined, ...analyticsData];
          }
        }
      } catch (e) { console.error("Failed to parse yt_analytics_cache", e); }
    }

    setParsedData(prev => JSON.stringify(prev) === JSON.stringify(combined) ? prev : combined);
  };

  const detectTypeFromContent = async (file: File) => {
    try {
      const text = await file.text();
      const rows = parseCSV(text);
      if (rows.length === 0) return null;
      const dataRows = rows.filter((r) => r["Content"] !== "Total" && r["Video title"] !== "Total");
      if (dataRows.length === 0) return null;

      let shortCount = 0;
      let longCount = 0;
      for (const row of dataRows) {
        const stayedToWatch = parseFloat(row["Stayed to watch (%)"] || "0");
        const endScreenShown = parseInt(row["End screen elements shown"] || "0");
        const durationStr = row["Average view duration"] || row["Duration"] || "0:00";
        const parts = durationStr.split(":").map(Number);
        let durationSec = parts.length === 3 ? parts[0] * 3600 + parts[1] * 60 + parts[2] : parts.length === 2 ? parts[0] * 60 + parts[1] : parts[0] || 0;

        if (stayedToWatch > 0) shortCount++;
        if (endScreenShown > 0 || durationSec >= 181) longCount++;
      }

      const isSingle = dataRows.length === 1;
      if (shortCount > 0 && longCount > 0) return "mixed";
      if (shortCount > 0 && longCount === 0) return isSingle ? "single_short_video" : "shorts";
      if (longCount > 0 && shortCount === 0) return isSingle ? "single_long_video" : "long";
      return null;
    } catch (e) { return null; }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setIsUploading(true);
    let validFiles: File[] = [];
    let extractedDate = "";

    for (const f of Array.from(files)) {
      const nameToParse = f.webkitRelativePath || f.name;
      const dateFromName = extractDateRangeFromName(nameToParse);
      if (dateFromName && !extractedDate) extractedDate = dateFromName;

      if (f.name.toLowerCase().endsWith('.zip')) {
        try {
          const zip = await JSZip.loadAsync(f);
          for (const relativePath in zip.files) {
            const zipEntry = zip.files[relativePath];
            if (!zipEntry.dir && zipEntry.name.toLowerCase().endsWith('.csv')) {
              const blob = await zipEntry.async("blob");
              validFiles.push(new File([blob], `${f.name}/${zipEntry.name}`, { type: "text/csv" }));
            }
          }
        } catch (err) { console.error(err); }
      } else if (f.name.toLowerCase().endsWith('.csv')) {
        validFiles.push(f);
      }
    }

    if (validFiles.length > 0) {
      const newFilesWithTags = await Promise.all(validFiles.map(async (f) => {
        let tag: any = "unknown";
        if (preUploadType === "auto") {
          const name = f.name.toLowerCase();
          const path = (f.webkitRelativePath || f.name).toLowerCase();
          if (name.includes("content")) {
            const detected = await detectTypeFromContent(f);
            if (detected) tag = detected;
          }
          if (tag === "unknown") {
            if (path.includes("traffic") || path.includes("source")) tag = "traffic";
            else if (path.includes("geography") || path.includes("location") || path.includes("country")) tag = "geo";
            else if (path.includes("audience") || path.includes("viewer") || path.includes("subscriber")) tag = "audience";
            else if (path.includes("short")) tag = "shorts";
            else if (path.includes("long") || path.includes("video")) tag = "long";
            else if (path.includes("total") || path.includes("channel")) tag = "mixed";
            else tag = "other";
          }
        } else {
          tag = preUploadType;
        }
        const text = await f.text();
        return { id: crypto.randomUUID(), name: f.name, file: f, data: parseCSV(text), tag };
      }));

      const updatedFiles = [...(brain.channelyticsState.csvFiles || []), ...newFilesWithTags];
      updateBrain({ channelyticsState: { ...brain.channelyticsState, csvFiles: updatedFiles } });
    }
    setIsUploading(false);
  };

  const getCategoryColorClass = (type: string) => {
    switch (type) {
      case "shorts": return "bg-[#FF7497] text-white";
      case "long": return "bg-[#00CCFF] text-black";
      case "single_long_video": return "bg-white text-black border-dashed !border-[#00CCFF] border-[4px]";
      case "single_short_video": return "bg-white text-black border-dashed !border-[#FF7497] border-[4px]";
      case "traffic": return "bg-[#CCFF00] text-black";
      case "audience": return "bg-[#FFB158] text-black";
      case "geo": return "bg-[#B14AED] text-white";
      case "mixed": return "bg-[#FFDD00] text-black";
      default: return "bg-white text-black";
    }
  };

  const clearDataOnly = () => {
    updateBrain({
      channelyticsState: { ...brain.channelyticsState, csvFiles: [] }
    });
  };

  const clearAll = () => {
    updateBrain({
      channelyticsState: { ...brain.channelyticsState, csvFiles: [], analyticsResult: null }
    });
  };

  const removeFile = (id: string) => {
    const updatedFiles = brain.channelyticsState.csvFiles.filter(f => f.id !== id);
    updateBrain({
      channelyticsState: { ...brain.channelyticsState, csvFiles: updatedFiles }
    });
  };

  const clearReportOnly = () => {
    updateBrain({
      channelyticsState: { ...brain.channelyticsState, analyticsResult: null }
    });
  };

  const runAnalysis = async () => {
    if (!parsedData.length) return;
    setAnalysisLoading(true);
    try {
      const allHeaders = Array.from(new Set(parsedData.flatMap((row) => Object.keys(row))));
      const csvContent = [
        allHeaders.join(","),
        ...parsedData.map((row) => allHeaders.map((h) => JSON.stringify(row[h] || "")).join(",")),
      ].join("\n");

      const result = await analyzeChannelData(csvContent, undefined, (partial) => {
        updateBrain({ channelyticsState: { ...brain.channelyticsState, analyticsResult: { ...brain.channelyticsState.analyticsResult, ...partial } as any } });
      });

      updateBrain({
        channelyticsState: { ...brain.channelyticsState, analyticsResult: result }
      });
      setActiveTab('report');
    } catch (err) {
      console.error("Analysis failed", err);
      alert("Matrix interpretation failed.");
    } finally {
      setAnalysisLoading(false);
    }
  };

  const stats = useMemo(() => {
    if (!parsedData.length) return null;
    const views = parsedData.reduce((acc, curr) => acc + (Number(curr['Views']) || 0), 0);
    const subs = parsedData.reduce((acc, curr) => acc + (Number(curr['Subscribers Gained']) || 0), 0);

    return {
      totalViews: views.toLocaleString(),
      totalSubs: subs.toLocaleString(),
      fileCount: brain.channelyticsState.csvFiles.length
    };
  }, [parsedData, brain.channelyticsState.csvFiles]);

  const mobileChartData = useMemo(() => parsedData.slice(0, 15), [parsedData]);

  return (
    <div className="max-w-[1400px] mx-auto pb-40 animate-fade-in px-4">
      <div className="w-full bg-white border-[5px] border-black rounded-2xl shadow-[12px_12px_0px_0px_black] overflow-hidden flex flex-col transition-all duration-700">
        <header className="bg-[#ccff00] h-[80px] border-b-[5px] border-black flex items-center justify-between px-0 overflow-hidden">
          <div className="flex items-center h-full">
            <div className="bg-[#00ccff] h-full w-[80px] flex items-center justify-center border-r-[5px] border-black flex-shrink-0">
              <Activity size={40} strokeWidth={3} className="text-white" />
            </div>
            <h1 className="text-[50px] font-[1000] uppercase tracking-tighter text-black pl-8 leading-none">CHANNELYTICS LAB</h1>
          </div>
        </header>

        <div className="p-8">
          {/* Control Bar */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 mb-8 px-1">

            {/* Data Source Toggle (V5 Pop Brutalist Style) */}
            <div className="flex bg-black p-1.5 rounded-2xl shadow-[4px_4px_0px_0px_#00ccff] w-fit border-2 border-black shrink-0">
              {(['csv', 'analytics', 'both'] as const).map((source) => (
                <button
                  key={source}
                  onClick={() => setDataSource(source)}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${dataSource === source
                    ? 'bg-[#00ccff] text-black shadow-[2px_2px_0_0_black] translate-y-[-2px]'
                    : 'bg-transparent text-white hover:bg-white/10'
                    }`}
                >
                  {source === 'csv' ? 'CSV Only' : source === 'analytics' ? 'API Only' : 'Hybrid Matrix'}
                </button>
              ))}
            </div>

            <div className="flex-1 flex flex-wrap gap-4 w-full">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-8 py-3 rounded-2xl border-[4px] border-black font-black uppercase tracking-tighter transition-all shadow-[6px_6px_0px_0px_black] active:shadow-none translate-y-[-4px] active:translate-y-[2px] ${activeTab === 'dashboard' ? 'bg-[#00ccff] text-white' : 'bg-white text-black hover:bg-gray-50'}`}
              >
                Diagnostic Board
              </button>
              <button
                onClick={() => setActiveTab('report')}
                className={`px-8 py-3 rounded-2xl border-[4px] border-black font-black uppercase tracking-tighter transition-all shadow-[6px_6px_0px_0px_black] active:shadow-none translate-y-[-4px] active:translate-y-[2px] ${activeTab === 'report' ? 'bg-[#ff3399] text-white' : 'bg-white text-black hover:bg-gray-50'}`}
              >
                Strategy Report
              </button>
              <button
                onClick={() => setActiveTab('data')}
                className={`px-8 py-3 rounded-2xl border-[4px] border-black font-black uppercase tracking-tighter transition-all shadow-[6px_6px_0px_0px_black] active:shadow-none translate-y-[-4px] active:translate-y-[2px] ${activeTab === 'data' ? 'bg-[#ffb158] text-black' : 'bg-white text-black hover:bg-gray-50'}`}
              >
                Data Tables
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
              <div className="relative flex-1 lg:flex-none">
                <select
                  value={preUploadType}
                  onChange={(e) => setPreUploadType(e.target.value)}
                  className={`w-full lg:w-48 border-[3px] border-black rounded-xl px-4 py-3 font-black text-xs uppercase appearance-none outline-none shadow-[4px_4px_0px_0px_black] transition-colors cursor-pointer ${getCategoryColorClass(preUploadType)}`}
                >
                  <option value="auto">Auto-Detect</option>
                  <option value="mixed">Channel (Mixed)</option>
                  <option value="long">Long-form Data</option>
                  <option value="single_long_video">Single Long Video</option>
                  <option value="shorts">Shorts Data</option>
                  <option value="single_short_video">Single Short Video</option>
                  <option value="traffic">Traffic Sources</option>
                  <option value="audience">Audience Insights</option>
                  <option value="geo">Geography</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer bg-white text-black px-6 py-3 rounded-xl border-[3px] border-black shadow-[4px_4px_0px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_black] transition-all flex items-center justify-center gap-3 font-black uppercase text-sm flex-1 lg:flex-none"
              >
                {isUploading ? <Activity className="animate-spin" size={18} /> : <Upload size={18} />}
                <span>{isUploading ? "Reading..." : "CSV Load"}</span>
              </button>
              <input type="file" ref={fileInputRef} multiple accept=".csv,.zip" onChange={handleFileUpload} className="hidden" />

              <button
                onClick={async () => {
                  setAnalysisLoading(true);
                  try { await performSync(true); } catch (e) { console.error(e); }
                  setAnalysisLoading(false);
                }}
                disabled={analysisLoading}
                className="bg-black text-white px-8 py-3 rounded-xl border-[3px] border-black shadow-[4px_4px_0px_0px_#00CCFF] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#00CCFF] transition-all flex items-center justify-center gap-3 font-black uppercase text-sm flex-1 lg:flex-none"
              >
                {analysisLoading ? <Activity className="animate-spin" size={18} /> : <TrendingUp size={18} className="text-[#00CCFF]" />}
                <span>Live Sync</span>
              </button>

              {parsedData.length > 0 && (
                <button
                  onClick={runAnalysis}
                  disabled={analysisLoading}
                  className="bg-[#ccff00] text-black px-8 py-3 rounded-xl border-[3px] border-black shadow-[4px_4px_0_0_black] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_black] transition-all flex items-center justify-center gap-3 font-black uppercase text-sm flex-1 lg:flex-none"
                >
                  {analysisLoading ? <Activity className="animate-spin" /> : <Zap size={18} />}
                  <span>Oracle Scan</span>
                </button>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-h-0 bg-white border-[4px] border-black rounded-[28px] shadow-[12px_12px_0px_0px_black] overflow-hidden flex flex-col relative">

            {/* Floating Mini Stats */}
            {stats && (
              <div className="absolute top-6 right-8 flex gap-6 z-10 pointer-events-none">
                <div className="bg-black/5 backdrop-blur-md border-2 border-dashed border-black/20 px-4 py-1.5 rounded-full flex items-center gap-2">
                  <Search size={12} className="text-black/40" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-black/60">{stats.fileCount} Assets Processed</span>
                </div>
                <div className="bg-black/5 backdrop-blur-md border-2 border-dashed border-black/20 px-4 py-1.5 rounded-full flex items-center gap-2">
                  <TrendingUp size={12} className="text-black/40" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-black/60">{stats.totalViews} Views Logged</span>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-auto custom-scrollbar p-10">
              {activeTab === 'data' ? (
                <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {parsedData.length > 0 ? (
                    <div className="flex-1 bg-white border-[4px] border-black rounded-2xl overflow-hidden shadow-[8px_8px_0px_0px_black] flex flex-col min-h-0">
                      <div className="bg-[#ffb158] p-6 border-b-[4px] border-black flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-3">
                          <Database className="text-black" size={24} />
                          <h3 className="font-black uppercase tracking-tighter text-2xl">Raw Data Matrix</h3>
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={clearDataOnly} className="bg-white text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-[3px] border-black hover:bg-[#FF7497] hover:text-white transition-all shadow-[4px_4px_0px_0px_black] active:shadow-none active:translate-y-1">Clear Totals</button>
                          <button onClick={clearReportOnly} className="bg-white text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-[3px] border-black hover:bg-[#00CCFF] hover:text-white transition-all shadow-[4px_4px_0px_0px_black] active:shadow-none active:translate-y-1">Clear Chart Data</button>
                          <button onClick={clearAll} className="bg-black text-[#ffb158] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-[3px] border-black hover:scale-105 transition-all shadow-[4px_4px_0px_0px_black] active:shadow-none active:translate-y-1 flex items-center gap-2"><Trash2 size={14} /> Clear All</button>
                          <span className="bg-white text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-[3px] border-black shadow-[4px_4px_0px_0px_black] ml-2">{parsedData.length} Records</span>
                        </div>
                      </div>
                      <div className="flex-1 overflow-auto custom-scrollbar p-0 bg-gray-50/50">
                        <table className="w-full text-left border-collapse whitespace-nowrap text-sm">
                          <thead className="bg-black text-white sticky top-0 z-10 shadow-sm border-b-[2px] border-black">
                            <tr>
                              {Object.keys(parsedData[0]).filter(k => !k.startsWith('_')).map(header => (
                                <th key={header} className="p-4 font-black uppercase tracking-widest text-[10px] border-r-[2px] border-white/20 last:border-r-0">{header}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {parsedData.slice(0, 200).map((row, i) => (
                              <tr key={i} className="border-b-[2px] border-black/10 hover:bg-[#ffb158]/20 transition-colors bg-white">
                                {Object.keys(parsedData[0]).filter(k => !k.startsWith('_')).map(header => (
                                  <td key={header} className="p-4 font-bold text-black/80 border-r-[2px] border-black/5 last:border-r-0">
                                    {typeof row[header] === 'number' ? row[header].toLocaleString() : String(row[header] || '')}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {parsedData.length > 200 && (
                        <div className="bg-black text-white p-3 text-center font-black text-[10px] uppercase tracking-widest shrink-0">
                          Showing first 200 records for performance • Total Database: {parsedData.length}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[500px] text-center space-y-6 opacity-30">
                      <Database size={80} />
                      <h3 className="text-3xl font-black uppercase tracking-tighter">Database Empty</h3>
                      <p className="font-bold text-lg">Load channel data to view the raw matrix.</p>
                    </div>
                  )}
                </div>
              ) : activeTab === 'dashboard' ? (
                parsedData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[500px] text-center space-y-8 opacity-30">
                    <div className="relative">
                      <Database size={120} className="text-black" />
                      <Sparkles className="absolute -top-4 -right-4 text-[#ccff00]" size={48} />
                    </div>
                    <div className="max-w-md">
                      <h2 className="text-5xl font-black uppercase tracking-tighter leading-none mb-4">Matrix Offline</h2>
                      <p className="font-bold text-lg leading-tight uppercase">
                        Connect your channel via "Live Sync" or drop some CSV files to initialize the laboratory.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* File List Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {brain.channelyticsState.csvFiles.map(file => (
                        <div key={file.id} className={`border-[3px] border-black rounded-2xl p-6 flex flex-col shadow-[4px_4px_0px_0px_black] transition-all group relative ${getCategoryColorClass(file.tag || 'unknown')}`}>
                          <button
                            onClick={() => removeFile(file.id)}
                            className="absolute -top-3 -right-3 bg-black text-white p-2 rounded-full border-3 border-white opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                          >
                            <Trash2 size={14} />
                          </button>
                          <div className="flex items-center gap-4 mb-4">
                            <div className="bg-white border-2 border-black p-2 rounded-lg">
                              <FileText className="text-black" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-black truncate uppercase text-xs tracking-widest" title={file.name}>{file.name}</h4>
                              <span className="text-[10px] font-bold opacity-80">{file.data?.length || 0} Records</span>
                            </div>
                          </div>
                          <div className="mt-auto flex items-center justify-between border-t-2 border-black/5 pt-4">
                            <span className="bg-black text-white text-[9px] font-black px-3 py-1 rounded-md uppercase tracking-[0.2em]">Disk Asset</span>
                            <span className="text-[10px] font-black uppercase tracking-widest border-b-2 border-transparent">{file.tag.replace(/_/g, ' ')}</span>
                          </div>
                        </div>
                      ))}
                      {brain.channelyticsState.csvFiles.length > 0 && (
                        <button
                          onClick={clearAll}
                          className="border-[4px] border-dashed border-black/10 rounded-2xl p-6 flex flex-col items-center justify-center text-black/20 hover:text-[#ff3399] hover:bg-red-50 hover:border-[#ff3399]/20 transition-all group"
                        >
                          <Trash2 size={40} className="mb-2 group-hover:scale-110 transition-transform" />
                          <span className="font-black uppercase tracking-widest text-xs text-center">Purge Database<br /><span className="text-[9px] opacity-60">& Clear Report</span></span>
                        </button>
                      )}
                    </div>

                    {/* Featured Charts */}
                    <div className="space-y-8">
                      <div className="flex items-center gap-4 border-b-4 border-black pb-4">
                        <Activity className="text-[#ff3399]" />
                        <h3 className="text-3xl font-black uppercase tracking-tighter">Visual Telemetry</h3>
                      </div>

                      {/* Mobile-Style Chart Simulation */}
                      <div className="bg-black text-white p-10 rounded-[28px] border-[6px] border-black shadow-[16px_16px_0px_0px_#ccff00] overflow-hidden">
                        <div className="flex justify-between items-center mb-8">
                          <div>
                            <h4 className="text-4xl font-[1000] uppercase tracking-tighter text-[#ccff00]">Viral Trajectory</h4>
                            <p className="text-sm font-bold opacity-50 uppercase tracking-widest mt-1">Simulated Mobile-Kit Aesthetic</p>
                          </div>
                          <div className="bg-[#ccff00] text-black px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Live Sync</div>
                        </div>
                        {mobileChartData.length > 0 && (
                          <div className="w-full min-w-[250px] h-[250px] min-h-[250px] relative">
                            <MobileLookChart
                              data={mobileChartData}
                              xKey="Date"
                              yKey="Views"
                              color="#ccff00"
                              height={250}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )
              ) : (
                <div className="h-full">
                  {brain.channelyticsState.analyticsResult ? (
                    <div className="flex flex-col h-full">
                      <div className="flex justify-end mb-6">
                        <button
                          onClick={clearReportOnly}
                          className="bg-white text-black border-[3px] border-black px-6 py-2 rounded-xl font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 hover:bg-red-50 hover:text-[#ff3399] hover:border-[#ff3399] transition-all flex items-center gap-2"
                        >
                          <Trash2 size={16} /> Destroy Matrix Report
                        </button>
                      </div>
                      <ReportViewer
                        result={brain.channelyticsState.analyticsResult}
                        data={parsedData}
                        onLaunchVisualization={(chart: ChartConfig) => setActiveChart(chart)}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[500px] text-center space-y-8 opacity-20">
                      <Zap size={120} className="text-black" />
                      <div>
                        <h2 className="text-5xl font-black uppercase tracking-tighter">AI Oracle Offline</h2>
                        <p className="font-bold text-xl">Initiate "Gemini Scan" to generate strategic growth matrices.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal for Expanded Charts */}
        {activeChart && (
          <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-8 backdrop-blur-md animate-fade-in">
            <div className="bg-white border-[6px] border-black rounded-[3rem] w-full max-w-6xl h-[70vh] flex flex-col shadow-[20px_20px_0px_0px_#CCFF00]">
              <button
                onClick={() => setActiveChart(null)}
                className="absolute top-8 right-8 bg-[#FF7497] text-white p-3 rounded-full border-[4px] border-black hover:rotate-90 transition-all z-50 shadow-[4px_4px_0px_0px_black]"
              >
                <X size={24} />
              </button>
              <div className="flex-1 p-12 overflow-auto flex flex-col">
                <div className="border-b-[4px] border-black pb-4 mb-8 pr-16">
                  <h3 className="text-4xl font-[1000] uppercase tracking-tighter">{activeChart.title}</h3>
                  {activeChart.subtitle && (
                    <p className="text-sm font-bold text-black/50 uppercase mt-2 tracking-widest">{activeChart.subtitle}</p>
                  )}
                </div>
                <div className="flex-1 min-h-[500px]">
                  <RenderChart chart={activeChart} data={parsedData} isModal />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Channelytics;
