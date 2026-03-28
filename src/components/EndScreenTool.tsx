import React, { useState } from 'react';
import { LayoutTemplate, Sparkles, Loader2, Copy, Check } from 'lucide-react';
import { generateEndScreen } from '../services/gemini';
import Markdown from 'react-markdown';

export const EndScreenTool: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    try {
      const cache = JSON.parse(localStorage.getItem('yt_analytics_cache') || '{}');
      const context = cache.profile ? JSON.stringify(cache.profile) : 'General YouTube Channel';
      const res = await generateEndScreen(topic, context);
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-fade-in p-2">
      <div className="w-full lg:w-1/3 space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-black/50 ml-1">Video Topic</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. The History of Rome..."
            className="w-full p-4 border-[4px] border-black rounded-xl font-bold text-sm outline-none focus:bg-[#CCFF00]/10 transition-colors shadow-[4px_4px_0px_0px_black]"
          />
        </div>
        <button onClick={handleGenerate} disabled={loading || !topic} className="w-full bg-[#CCFF00] text-black border-[4px] border-black p-4 font-black uppercase text-xl rounded-xl shadow-[6px_6px_0px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
          Design End-Screen
        </button>
      </div>
      <div className="flex-1 bg-white border-[4px] border-black rounded-[24px] shadow-[8px_8px_0px_0px_black] p-8 overflow-y-auto max-h-[600px] custom-scrollbar relative">
        {result ? (
          <>
            <button onClick={handleCopy} className="absolute top-6 right-6 bg-black text-white p-2 rounded-xl border-2 border-black hover:scale-105 transition-transform shadow-[2px_2px_0px_0px_black] z-10">
              {copied ? <Check size={18} className="text-[#CCFF00]" /> : <Copy size={18} />}
            </button>
            <div className="prose prose-sm max-w-none font-bold text-black/80 prose-headings:font-black prose-headings:uppercase pr-10"><Markdown>{result}</Markdown></div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-20 py-12"><LayoutTemplate size={80} className="mb-4" /><p className="text-xl font-black uppercase">Awaiting Video Topic</p></div>
        )}
      </div>
    </div>
  );
};
