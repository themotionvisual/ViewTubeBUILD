import React, { useState } from 'react';
import { MessageSquare, Sparkles, Loader2, Copy, Check } from 'lucide-react';
import { generateCommunityPosts } from '../services/gemini';
import Markdown from 'react-markdown';

export const CommunityPostGenerator: React.FC = () => {
    const [schedule, setSchedule] = useState('');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        if (!schedule) return;
        setLoading(true);
        try {
            const cache = JSON.parse(localStorage.getItem('yt_analytics_cache') || '{}');
            const context = cache.profile ? JSON.stringify(cache.profile) : 'General YouTube Channel';
            const res = await generateCommunityPosts(schedule, context);
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
                    <label className="text-[10px] font-black uppercase tracking-widest text-black/50 ml-1">Upcoming Uploads & Plans</label>
                    <textarea
                        value={schedule}
                        onChange={(e) => setSchedule(e.target.value)}
                        placeholder="e.g. Uploading a video about Minecraft on Friday, and a Short on Tuesday..."
                        className="w-full h-40 p-4 border-[4px] border-black rounded-xl font-bold text-sm resize-none outline-none focus:bg-[#CCFF00]/10 transition-colors shadow-[4px_4px_0px_0px_black]"
                    />
                </div>
                <button onClick={handleGenerate} disabled={loading || !schedule} className="w-full bg-[#00CCFF] border-[4px] border-black p-4 font-black uppercase text-xl rounded-xl shadow-[6px_6px_0px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
                    Generate Schedule
                </button>
            </div>
            <div className="flex-1 bg-white border-[4px] border-black rounded-[24px] shadow-[8px_8px_0px_0px_black] p-8 overflow-y-auto max-h-[600px] custom-scrollbar relative">
                {result ? (
                    <>
                        <button onClick={handleCopy} className="absolute top-6 right-6 bg-black text-white p-2 rounded-xl border-2 border-black hover:scale-105 transition-transform shadow-[2px_2px_0px_0px_black] z-10">
                            {copied ? <Check size={18} className="text-[#00CCFF]" /> : <Copy size={18} />}
                        </button>
                        <div className="prose prose-sm max-w-none font-bold text-black/80 prose-headings:font-black prose-headings:uppercase pr-10"><Markdown>{result}</Markdown></div>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 py-12"><MessageSquare size={80} className="mb-4" /><p className="text-xl font-black uppercase">Awaiting Input</p></div>
                )}
            </div>
        </div>
    );
};