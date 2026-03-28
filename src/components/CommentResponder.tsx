import React, { useState } from 'react';
import { MessageCircle, Sparkles, Loader2, Copy, Check } from 'lucide-react';
import { generateCommentResponses } from '../services/gemini';
import Markdown from 'react-markdown';
import { toolboxActionButton, toolboxSystem } from './toolboxSystem';

export const CommentResponder: React.FC = () => {
    const [comments, setComments] = useState('');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        if (!comments) return;
        setLoading(true);
        try {
            const cache = JSON.parse(localStorage.getItem('yt_analytics_cache') || '{}');
            const context = cache.profile ? JSON.stringify(cache.profile) : 'General YouTube Channel';
            const res = await generateCommentResponses(comments, context);
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
        <div className={toolboxSystem.shellRow}>
            <div className={toolboxSystem.inputColumn}>
                <div className="space-y-2">
                    <label className={toolboxSystem.label}>Paste Recent Comments</label>
                    <textarea
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="Paste comments here..."
                        className={`${toolboxSystem.inputBase} h-40 resize-none focus:bg-[#FF3399]/10`}
                    />
                </div>
                <button onClick={handleGenerate} disabled={loading || !comments} className={toolboxActionButton('bg-[#FF3399]', 'text-white')}>
                    {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
                    Generate Replies
                </button>
            </div>
            <div className={toolboxSystem.resultPanel}>
                {result ? (
                    <>
                        <button onClick={handleCopy} className={toolboxSystem.copyButton}>
                            {copied ? <Check size={18} className="text-[#CCFF00]" /> : <Copy size={18} />}
                        </button>
                        <div className="prose prose-sm max-w-none font-bold text-black/80 prose-headings:font-black prose-headings:uppercase pr-10"><Markdown>{result}</Markdown></div>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 py-12"><MessageCircle size={80} className="mb-4" /><p className="text-xl font-black uppercase">Awaiting Comments</p></div>
                )}
            </div>
        </div>
    );
};
