import React, { useState, useEffect } from 'react';
import { useBrain } from '../context/GlobalDataContext';
import { generateChatResponse, hasGeminiKey } from '../services/gemini';
import { ArrowRight, Sparkles, Loader2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Advice {
  text: string;
  action: string;
  route: string;
  color: string;
}

export const DailyAdviceWidget: React.FC = () => {
  const { authState } = useBrain();
  const navigate = useNavigate();
  const [adviceList, setAdviceList] = useState<Advice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastGenerated, setLastGenerated] = useState<number | null>(null);
  
  const canUseGemini = hasGeminiKey();

  useEffect(() => {
    try {
      const cached = localStorage.getItem('vt_daily_oracle_advice');
      const cachedTs = localStorage.getItem('vt_daily_oracle_advice_ts');
      if (cached) {
        const parsed = JSON.parse(cached) as Advice[];
        if (Array.isArray(parsed)) setAdviceList(parsed.slice(0, 5));
      }
      if (cachedTs) setLastGenerated(parseInt(cachedTs));
    } catch {
      // ignore cache errors
    }
  }, []);

  const fetchAdvice = async () => {
    if (!canUseGemini || !authState.isAuthenticated) return;
    setLoading(true);
    setError(null);

    const prompt = `
        Generate EXACTLY 5 actionable, single-sentence tips for a YouTube creator.
        The channel has ${authState.subscriberCount || 0} subs and ${authState.totalViews || 0} views.
        Make the tips specific, data-driven, and brief.
        
        For each tip, pick the most relevant 'route' from the following list ONLY:
        /studio (for Upload, Scripting, Optimization)
        /project-calendar (for Scheduling, Tasks, Planning)
        /shorts (for Shorts creation, splicing)
        /performance (for checking Analytics, Metrics, Retention)
        /settings (for API keys, accounts)
        
        Also assign a 'color' from this exact list: #FF83EA, #FF8AAF, #FFB570, #FFFF61, #4FFF5B, #40C6E9, #579AFF, #CC00FF
        
        Return pure JSON array of objects.
        Format:
        [
          {
            "text": "Try testing a new thumbnail on your latest underperforming video.",
            "route": "/studio",
            "action": "Fix",
            "color": "#FF3399"
          }
        ]
      `;

    try {
      const resultText = await generateChatResponse([], prompt);

      // Clean markdown JSON if present
      let cleaned = resultText.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/```json\n?/, '').replace(/```\n?$/, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/```\n?/, '').replace(/```\n?$/, '');
      }

      const parsed = JSON.parse(cleaned) as Advice[];
      if (Array.isArray(parsed)) {
        const sliced = parsed.slice(0, 5);
        setAdviceList(sliced);
        const now = Date.now();
        setLastGenerated(now);
        localStorage.setItem('vt_daily_oracle_advice', JSON.stringify(sliced));
        localStorage.setItem('vt_daily_oracle_advice_ts', String(now));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!authState.isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-white border-[5px] border-black rounded-[2rem] shadow-[12px_12px_0px_0px_black] overflow-hidden flex flex-col mt-10">
      <header className="bg-[#FFFF61] text-black px-8 py-5 border-b-[5px] border-black flex items-center justify-between gap-4">
        <h2 className="text-3xl font-[1000] uppercase tracking-tighter flex items-center gap-3">
          <Sparkles /> Daily Oracle Advice
        </h2>
        <div className="flex items-center gap-3">
          {lastGenerated && (
            <span className="text-[10px] font-black uppercase tracking-widest text-black/50">
              Last run: {new Date(lastGenerated).toLocaleDateString()}
            </span>
          )}
          <button
            onClick={fetchAdvice}
            disabled={!canUseGemini || loading}
            className="bg-white text-black px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl border-[3px] border-black shadow-[4px_4px_0_0_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating...' : 'Generate'}
          </button>
          {!canUseGemini && (
            <div className="bg-[#FF8AAF] px-3 py-2 text-white text-[10px] font-black uppercase tracking-widest rounded-xl border-2 border-transparent flex items-center gap-2">
              <AlertTriangle size={14} /> Gemini Offline
            </div>
          )}
        </div>
      </header>
      
      <div className="p-8 bg-gray-50 flex flex-col gap-4">
        {loading && (
          <div className="flex flex-col items-center justify-center py-10 gap-4 opacity-50">
            <Loader2 className="animate-spin text-black" size={40} />
            <span className="font-black uppercase text-xs tracking-widest">Consulting Data Streams...</span>
          </div>
        )}
        
        {error && !loading && (
          <div className="bg-[#FF8AAF]/10 border-[3px] border-[#FF8AAF] text-[#FF8AAF] p-6 rounded-2xl font-bold font-mono text-sm leading-relaxed shadow-[4px_4px_0_0_#FF8AAF]">
            {error}
          </div>
        )}

        {!loading && !error && adviceList.length > 0 && (
          <div className="space-y-4">
            {adviceList.map((advice, i) => (
              <div key={i} className="flex group bg-white border-[4px] border-black rounded-2xl p-4 items-center gap-6 shadow-[6px_6px_0_0_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0_0_black] transition-all">
                <div 
                  className="w-4 h-12 rounded-full border-2 border-black shrink-0" 
                  style={{ backgroundColor: advice.color }}
                />
                
                <div className="flex-1 font-bold text-lg text-black leading-tight">
                  {advice.text}
                </div>
                
                <button 
                  onClick={() => navigate(advice.route)}
                  className="bg-white text-black w-14 h-14 rounded-xl border-[3px] border-black flex flex-col items-center justify-center gap-1 shrink-0 shadow-[4px_4px_0_0_black] hover:bg-[#CCFF00] active:shadow-none transition-all group-hover:scale-105 group-hover:shadow-[6px_6px_0_0_black]"
                  style={{ boxShadow: `6px 6px 0 0 ${advice.color}`, backgroundColor: advice.color }}
                >
                  <ArrowRight size={20} strokeWidth={4} />
                  <span className="text-[8px] font-black uppercase leading-none opacity-80 group-hover:opacity-100">{advice.action}</span>
                </button>
              </div>
            ))}
          </div>
        )}
        
        {!loading && !error && adviceList.length === 0 && canUseGemini && (
          <div className="py-10 text-center font-black opacity-30 uppercase tracking-widest text-lg">
            Analytics processing pending
          </div>
        )}
      </div>
    </div>
  );
};
