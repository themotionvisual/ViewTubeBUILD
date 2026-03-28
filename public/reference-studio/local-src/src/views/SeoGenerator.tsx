import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Download,
  Trash2,
  Type,
  Hash,
  FileText,
  Zap,
  Target,
  BarChart3,
  Link as LinkIcon,
  Search,
  BookOpen,
  ExternalLink,
  Cloud,
  Database
} from 'lucide-react';
import { generateSeoData } from '../services/gemini';
import type { SeoResult } from '../types';
import Markdown from 'react-markdown';
import JSZip from 'jszip';
import { useBrain } from '../context/GlobalDataContext';
import { ToolHeader } from '../components/ToolHeader';
import { sheetsService } from '../services/sheetsService';
import { nexusSyncService } from '../services/nexusSyncService';

// --- Sub-components (The "Pop" Style) ---
const CopyBox: React.FC<{ label: string; content: string; multiline?: boolean; headerColor?: string; icon?: React.ReactNode }> = ({ label, content, multiline = false, headerColor = 'bg-[#ccff00]', icon }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border-[4px] border-black rounded-2xl shadow-[6px_6px_0px_0px_black] overflow-hidden flex flex-col h-full transform hover:-translate-y-1 transition-transform">
      <div className={`p-4 border-b-[4px] border-black flex items-center justify-between ${headerColor}`}>
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-black uppercase tracking-tighter text-lg">{label}</span>
        </div>
        <button
          onClick={handleCopy}
          className="bg-black text-white p-2 rounded-lg hover:scale-110 active:scale-95 transition-all"
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
        </button>
      </div>
      <div className="p-6 overflow-auto max-h-[400px]">
        {multiline ? (
          <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap">{content}</div>
        ) : (
          <div className="font-black text-2xl tracking-tight">{content}</div>
        )}
      </div>
    </div>
  );
};

const ConsolidatedCopyBox: React.FC<{ label: string; items: string[]; headerColor?: string; icon?: React.ReactNode }> = ({ label, items, headerColor = 'bg-[#00d2ff]', icon }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="bg-white border-[4px] border-black rounded-2xl shadow-[6px_6px_0px_0px_black] overflow-hidden flex flex-col h-full transform hover:-translate-y-1 transition-transform">
      <div className={`p-4 border-b-[4px] border-black flex items-center justify-between ${headerColor}`}>
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-black uppercase tracking-tighter text-lg">{label}</span>
        </div>
        <span className="bg-black text-white text-[10px] font-black px-2 py-0.5 rounded-full">{items.length}</span>
      </div>
      <div className="divide-y-2 divide-black/5 overflow-auto max-h-[400px]">
        {items.map((item, idx) => (
          <div key={idx} className="p-4 flex items-start gap-4 hover:bg-gray-50 group transition-colors">
            <span className="font-black text-black/20 group-hover:text-black mt-1">{idx + 1}</span>
            <div className="flex-1 font-bold text-sm leading-tight">{item}</div>
            <button
              onClick={() => handleCopy(item, idx)}
              className="opacity-0 group-hover:opacity-100 p-2 bg-black text-white rounded-lg transition-all"
            >
              {copiedIndex === idx ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const SeoGenerator: React.FC = () => {
  const { brain, updateBrain, registerProvider, unregisterProvider, setSeoState, authState } = useBrain();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SeoResult | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [exportUrl, setExportUrl] = useState<string | null>(null);

  // Local state for the form, but synchronized with Brain where appropriate
  const [concept, setConcept] = useState(brain.coreConcept);
  const [niche, setNiche] = useState(brain.targetNiche);
  const [script, setScript] = useState('');
  const [videoLength, setVideoLength] = useState('10:00');

  useEffect(() => {
    registerProvider('SEO_GENERATOR');
    return () => unregisterProvider('SEO_GENERATOR');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerate = async () => {
    if (!concept || !niche) return;
    setLoading(true);
    try {
      // Sync core concept and niche to brain before generating
      updateBrain({ coreConcept: concept, targetNiche: niche });

      const data = await generateSeoData(
        concept,
        niche,
        script,
        '', // stats
        videoLength,
        '@YourChannel',
        '', // links
        'Longform'
      );

      setResult(data);

      // EXTREMELY CRITICAL: Push "Winning" state to Global Brain
      setSeoState({
        winningTitle: data.titleSets[0].title,
        winningKeywords: data.tags.split(',').map(k => k.trim()).slice(0, 5),
        descriptionDraft: data.description
      });

    } catch (e: any) {
      console.error(e);
      alert(`SEO Protocols failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!result) return;
    setIsExporting(true);
    try {
      const exportRes = await sheetsService.exportSeoResult(concept, result);
      setExportUrl(exportRes.spreadsheetUrl);
    } catch (e) {
      console.error(e);
      alert('Sheets Export failed. Check connection.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSyncToDrive = async () => {
    if (!result) return;
    setIsSyncing(true);
    try {
      await nexusSyncService.syncSeoToDrive(concept, result);
      alert('SEO Assets synced to Cloud Vault!');
    } catch (e: any) {
      console.error(e);
      alert(`Cloud Sync failed: ${e.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDownloadZip = async () => {
    if (!result) return;
    const zip = new JSZip();
    zip.file("seo_report.txt", `VIEW TUBE SEO REPORT\nConcept: ${concept}\n\nTITLES:\n${result.titleSets.map(t => t.title).join('\n')}\n\nDESCRIPTION:\n${result.description}`);
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `viewtube_seo_${Date.now()}.zip`;
    a.click();
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-40 animate-fade-in px-4">
      <div className="w-full bg-white border-[5px] border-black rounded-2xl shadow-[12px_12px_0px_0px_black] overflow-hidden flex flex-col transition-all duration-700">
        <header className="bg-[#00d2ff] h-[80px] border-b-[5px] border-black flex items-center justify-between px-0 overflow-hidden">
          <div className="flex items-center h-full">
            <div className="bg-[#ccff00] h-full w-[80px] flex items-center justify-center border-r-[5px] border-black flex-shrink-0">
              <Search size={40} strokeWidth={3} className="text-black" />
            </div>
            <h1 className="text-[50px] font-[1000] uppercase tracking-tighter text-black pl-8 leading-none">SEO GENERATOR</h1>
          </div>
        </header>

        <div className="p-8">
          {/* Main UI Layout */}
          {!result ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Inputs Section */}
              <div className="bg-white border-[4px] border-black rounded-3xl p-8 shadow-[8px_8px_0px_0px_black] space-y-6">
                <div className="flex items-center gap-3 border-b-4 border-black pb-4 mb-6">
                  <Zap className="text-[#ccff00] fill-black" size={32} />
                  <h2 className="text-3xl font-black uppercase tracking-tighter">Viral Engine</h2>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-black/50 ml-1">Video Concept</label>
                  <input
                    type="text"
                    value={concept}
                    onChange={(e) => setConcept(e.target.value)}
                    placeholder="e.g. Scaling a SaaS to $100k/mo using only AI agents"
                    className="w-full bg-gray-50 border-[3px] border-black rounded-xl p-4 font-bold text-lg focus:bg-white focus:ring-4 focus:ring-[#ccff00]/20 transition-all outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-black/50 ml-1">Target Niche</label>
                    <input
                      type="text"
                      value={niche}
                      onChange={(e) => setNiche(e.target.value)}
                      placeholder="e.g. AI Business"
                      className="w-full bg-gray-50 border-[3px] border-black rounded-xl p-4 font-bold outline-none focus:border-[#ccff00]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-black/50 ml-1">Duration</label>
                    <input
                      type="text"
                      value={videoLength}
                      onChange={(e) => setVideoLength(e.target.value)}
                      placeholder="10:00"
                      className="w-full bg-gray-50 border-[3px] border-black rounded-xl p-4 font-bold text-center outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-black/50 ml-1">Full Script (Optional)</label>
                  <textarea
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    placeholder="Paste your script here to refine SEO density..."
                    className="w-full h-40 bg-gray-50 border-[3px] border-black rounded-xl p-4 font-medium text-sm resize-none outline-none focus:bg-white transition-all"
                  />
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={loading || !concept || !niche}
                  className="w-full bg-[#ff3399] p-5 border-[4px] border-black rounded-2xl shadow-[6px_6px_0px_0px_black] hover:shadow-[2px_2px_0px_0px_black] hover:translate-x-[4px] hover:translate-y-[4px] active:shadow-none active:translate-x-[6px] active:translate-y-[6px] transition-all group flex items-center justify-center gap-4"
                >
                  {loading ? (
                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="text-white group-hover:rotate-12 transition-transform" size={28} />
                      <span className="text-white text-2xl font-black uppercase tracking-tighter">Execute Launch Protocol</span>
                    </>
                  )}
                </button>
              </div>

              {/* Right Column: Concept Pre-Visuals */}
              <div className="flex flex-col gap-6">
                <div className="bg-black text-white p-8 rounded-3xl border-[4px] border-black shadow-[8px_8px_0px_0px_#ccff00] flex-1 flex flex-col items-center justify-center text-center space-y-6">
                  <Target size={64} className="text-[#ccff00] animate-pulse" />
                  <h3 className="text-4xl font-black uppercase tracking-tighter">Ready for Orbit?</h3>
                  <p className="font-bold text-white/60 max-w-sm">Every generated title and keyword will be instantly accessible by the Storyboard Studio for real-time visual alignment.</p>
                </div>
              </div>
            </div>
          ) : (
            /* Results View */
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between p-6 bg-white border-[4px] border-black rounded-2xl shadow-[6px_6px_0px_0px_black]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#00ff99] border-[3px] border-black rounded-xl flex items-center justify-center shadow-[3px_3px_0px_0px_black]">
                    <Check className="text-black" size={24} strokeWidth={3} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">Protocol Success</h2>
                    <p className="text-xs font-bold text-black/50 uppercase mt-1">Global Brain has been updated with viral assets.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  {authState.isAuthenticated && (
                    <button
                      onClick={handleExport}
                      disabled={isExporting}
                      className="bg-black text-[#ccff00] px-6 py-2 font-black uppercase text-sm rounded-xl shadow-[4px_4px_0px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-2"
                    >
                      {isExporting ? <div className="w-4 h-4 border-2 border-[#ccff00] border-t-transparent rounded-full animate-spin" /> : <Database size={18} />}
                      {exportUrl ? 'Re-Sync Sheets' : 'Export to Sheets'}
                    </button>
                  )}
                  <button
                    onClick={handleSyncToDrive}
                    disabled={isSyncing}
                    className="bg-black text-[#00d2ff] px-6 py-2 font-black uppercase text-sm rounded-xl shadow-[4px_4px_0px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-2"
                  >
                    {isSyncing ? <div className="w-4 h-4 border-2 border-[#00d2ff] border-t-transparent rounded-full animate-spin" /> : <Cloud size={18} />}
                    Sync to Drive
                  </button>
                  <button
                    onClick={handleDownloadZip}
                    className="bg-[#ccff00] border-[3px] border-black px-6 py-2 font-black uppercase text-sm rounded-xl shadow-[4px_4px_0px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-2"
                  >
                    <Download size={18} /> Download All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <ConsolidatedCopyBox
                  label="Winning Titles"
                  items={result.titleSets.map(t => t.title)}
                  headerColor="bg-[#ff3399]"
                  icon={<Type size={20} className="text-white" />}
                />
                <ConsolidatedCopyBox
                  label="Thumbnail Overlays"
                  items={result.titleSets.map(t => t.thumbnailText)}
                  headerColor="bg-[#ccff00]"
                  icon={<BarChart3 size={20} />}
                />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <CopyBox
                  label="Optimized Description"
                  content={result.description}
                  multiline
                  headerColor="bg-[#00d2ff]"
                  icon={<FileText size={20} />}
                />
                <div className="space-y-8">
                  <CopyBox
                    label="Key Moments"
                    content={result.educationMoments}
                    multiline
                    headerColor="bg-[#ffb158]"
                    icon={<BookOpen size={20} />}
                  />
                  <div className="bg-black text-white p-6 rounded-2xl border-[4px] border-black shadow-[6px_6px_0px_0px_black]">
                    <h3 className="font-black uppercase text-xl mb-4 text-[#ccff00]">Strategic Analysis</h3>
                    <div className="prose prose-invert prose-sm max-w-none font-medium text-white/80">
                      <Markdown>{result.analysis}</Markdown>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeoGenerator;
