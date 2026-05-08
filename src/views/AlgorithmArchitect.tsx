import React, { useState, useEffect } from 'react';
import {
  generateAlgorithmDiagnosis,
  generateDailyBrief
} from '../services/gemini';
import type {
  AlgorithmDiagnosis,
  DailyBrief
} from '../types';
import { Zap } from 'lucide-react';
import { useBrain } from '../context/useBrain';
import { PostActionReflection } from '../components/PostActionReflection';

const AlgorithmArchitect: React.FC = () => {
  const { brain } = useBrain();
  const [diagnosis, setDiagnosis] = useState<AlgorithmDiagnosis | null>(null);
  const [brief, setBrief] = useState<DailyBrief | null>(null);
  const [loading, setLoading] = useState(false);

  // Layer 4 state – functional toggles
  const [ctrPivotEnabled, setCtrPivotEnabled] = useState(true);
  const [retentionRescueEnabled, setRetentionRescueEnabled] = useState(false);

  // Layer 4 — Target video selection
  const [recentVideos, setRecentVideos] = useState<{ videoId: string; title: string; publishedAt: string }[]>([]);
  const [targetVideoId, setTargetVideoId] = useState<string>('');

  const selectedVideoStats = (() => {
    if (!targetVideoId) return null;
    try {
      const cache = JSON.parse(localStorage.getItem('yt_analytics_cache') || '{}');
      return cache.stats?.[targetVideoId] || null;
    } catch { return null; }
  })();

  const performDiagnosis = async () => {
    setLoading(true);
    try {
      const cachedData = localStorage.getItem('yt_analytics_cache') || 'No data synced yet.';
      const diag = await generateAlgorithmDiagnosis(cachedData, brain);
      setDiagnosis(diag);
      localStorage.setItem('yt_algo_diagnosis', JSON.stringify(diag));
      const performanceContext = "Recent views trending up slightly. AVD is stable but CTR experiencing volatility.";
      const daily = await generateDailyBrief(diag, performanceContext, brain);
      setBrief(daily);
      localStorage.setItem('yt_algo_brief', JSON.stringify(daily));
    } catch (error) {
      console.error("Master Diagnosis failed:", error);
      alert("Analysis Failed. Ensure you have a valid API key in Settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedDiag = localStorage.getItem('yt_algo_diagnosis');
    const savedBrief = localStorage.getItem('yt_algo_brief');
    if (savedDiag) setDiagnosis(JSON.parse(savedDiag));
    if (savedBrief) setBrief(JSON.parse(savedBrief));

    // Load recent videos from sync cache
    try {
      const cache = JSON.parse(localStorage.getItem('yt_analytics_cache') || '{}');
      if (cache.videos && Array.isArray(cache.videos)) {
        setRecentVideos(cache.videos.slice(0, 20));
      }
    } catch (e) {
      console.warn('Could not load videos from cache');
    }
  }, []);

  const velocityBars = [40, 70, 45, 90, 65, 80, 55, 95, 30, 85, 50, 60, 75, 40];
  const avgVelocity = Math.round(velocityBars.reduce((a, b) => a + b, 0) / velocityBars.length);

  return (
    <div className="max-w-[1400px] mx-auto pb-40 animate-fade-in px-4">
      <div className="w-full bg-white border-[5px] border-black rounded-2xl shadow-[12px_12px_0px_0px_black] overflow-hidden flex flex-col transition-all duration-700">
        <header className="bg-[#CCFF00] h-[80px] border-b-[5px] border-black flex items-center justify-between px-0 overflow-hidden">
          <div className="flex items-center h-full">
            <div className="bg-black h-full w-[80px] flex items-center justify-center border-r-[5px] border-black flex-shrink-0">
              <Zap size={40} strokeWidth={3} className="text-[#CCFF00]" />
            </div>
            <h1 className="text-[50px] font-[1000] uppercase tracking-tighter text-black pl-8 leading-none">ALGORITHM ARCHITECT</h1>
          </div>
        </header>

        <div className="p-8 space-y-8 bg-white text-black">
          {/* Status Header */}
          <div className="pop-box flex flex-col md:flex-row justify-between items-center bg-gray-50 p-6 border-dashed border-[4px] gap-4">
            <div>
              <h4 className="text-xl font-black uppercase tracking-tight">System Status: {diagnosis ? 'CALIBRATED' : 'UNCALIBRATED'}</h4>
              <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest">Run a master diagnosis to align your content with the current algorithm cluster.</p>
            </div>
            <button
              onClick={performDiagnosis}
              disabled={loading}
              className="pop-button bg-[#CCFF00] text-black px-10 py-5 text-sm"
            >
              {loading ? 'CALCULATING...' : 'RUN MASTER DIAGNOSIS'}
            </button>
          </div>

          {/* Daily Command Brief — compact */}
          {brief && (
            <div className="pop-box">
              <div className="pop-header bg-black text-white h-12">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🎖️</span>
                  <h3 className="text-sm font-black uppercase">Daily Command Brief</h3>
                </div>
                <div className={`px-4 py-1 rounded-full text-[10px] font-black border-2 border-white ${brief.algorithmSentiment === 'positive' ? 'bg-[#CCFF00] text-black' : brief.algorithmSentiment === 'negative' ? 'bg-[#ff3399] text-black' : 'bg-[#FFDD00] text-black'}`}>
                  {brief.algorithmSentiment.toUpperCase()}
                </div>
              </div>
              <div className="p-8 bg-white">
                <h4 className="text-2xl font-black text-black uppercase leading-snug mb-6 tracking-tighter">{brief.mainPriority}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 space-y-4">
                    {brief.actionSteps.map((step, i) => (
                      <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 border-[3px] border-black rounded-2xl shadow-[6px_6px_0px_0px_black] hover:bg-white transition-colors">
                        <span className="bg-black text-white w-8 h-8 flex items-center justify-center rounded-xl flex-shrink-0 font-black text-sm">{i + 1}</span>
                        <span className="text-xs font-bold leading-snug tracking-tight uppercase mt-1">{step}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-[#FF3399] text-white p-8 border-[4px] border-black rounded-[32px] flex flex-col justify-center items-center text-center gap-2 shadow-[12px_12px_0px_0px_black]">
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none text-white/50">Estimated Impact</span>
                    <span className="text-xl font-black leading-tight uppercase">{brief.estimatedImpact}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {diagnosis && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-1000 delay-500">
               <PostActionReflection toolId="ALGORITHM_ARCHITECT" />
            </div>
          )}

          {/* 4-Layer Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* LAYER 1: Fingerprinting */}
            <div className="pop-box">
              <div className="pop-header bg-[#00CCFF] text-black border-b-[4px]">
                <span className="font-black text-sm uppercase text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">LAYER 1: ALGORITHMIC FINGERPRINTING</span>
              </div>
              <div className="p-8 space-y-6 bg-white">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 border-[3px] border-black rounded-2xl border-dashed">
                    <p className="text-[10px] font-black uppercase text-black/30 mb-2">Cluster Center</p>
                    <p className="text-sm font-black tracking-tighter uppercase">{diagnosis?.clusterCenter || 'Pending Mapping...'}</p>
                  </div>
                  <div className="bg-gray-50 p-6 border-[3px] border-black rounded-2xl border-dashed">
                    <p className="text-[10px] font-black uppercase text-black/30 mb-2">Niche Authority</p>
                    <p className="text-4xl font-black text-[#00CCFF] leading-none tracking-tighter">{diagnosis?.nicheAuthority ? `${diagnosis.nicheAuthority}%` : '—'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-black text-[10px] uppercase text-black/40 flex items-center gap-2 tracking-[0.2em]">
                    <div className="w-2 h-2 rounded-full bg-[#00CCFF]"></div>Audience DNA
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {diagnosis?.audienceDNA.map((dna, i) => (
                      <div key={i} className="flex justify-between items-center bg-white p-4 border-[3px] border-black rounded-2xl shadow-[4px_4px_0px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                        <span className="font-black text-xs uppercase tracking-tight">{dna.interest}</span>
                        <span className="bg-black text-[#CCFF00] px-3 py-1 rounded-lg text-[10px] font-black">{dna.overlap}%</span>
                      </div>
                    ))}
                  </div>
                  {!diagnosis && <p className="text-[10px] font-bold text-black/20 uppercase tracking-widest text-center py-4">Run Diagnosis to map your Audience DNA...</p>}
                </div>
                {diagnosis?.hiddenStory && (
                  <div className="p-6 bg-[#00CCFF]/5 border-[3px] border-black rounded-2xl border-dashed">
                    <p className="text-[10px] font-black uppercase text-[#00CCFF] mb-2 tracking-widest">The Hidden Story</p>
                    <p className="text-xs font-bold leading-relaxed tracking-tight uppercase">{diagnosis.hiddenStory}</p>
                  </div>
                )}
              </div>
            </div>

            {/* LAYER 2: The Sculpting Engine */}
            <div className="pop-box">
              <div className="pop-header bg-[#CCFF00] text-black border-b-[4px]">
                <span className="font-black text-sm uppercase">LAYER 2: THE SCULPTING ENGINE</span>
              </div>
              <div className="p-8 space-y-6 bg-white">
                <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest mb-2">Tools to shape algorithmic perception.</p>
                <div className="space-y-4">
                  {[
                    { icon: '🔎', title: 'Metadata Alignment Scan', desc: 'Verify titles and descriptions vs niche signals.' },
                    { icon: '🎭', title: 'Sentiment Harmonizing', desc: 'Tone analysis vs trending emotional hooks.' },
                    { icon: '🔗', title: 'Session Watch Optimizer', desc: 'Playlist restructuring for max retention.' }
                  ].map(tool => (
                    <div key={tool.title} className="p-5 border-[3px] border-black rounded-2xl bg-white shadow-[6px_6px_0px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer group">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl group-hover:scale-125 transition-transform">{tool.icon}</span>
                        <span className="font-black text-sm uppercase tracking-tighter">{tool.title}</span>
                      </div>
                      <p className="text-[10px] font-bold text-black/50 leading-snug uppercase tracking-tight">{tool.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-black text-[#CCFF00] p-4 rounded-[20px] text-center font-black text-[10px] uppercase tracking-[0.3em] border-[3px] border-black">
                  Connect channel for live scan
                </div>
              </div>
            </div>

            {/* LAYER 4: The Governor */}
            <div className="pop-box lg:col-span-2">
              <div className="pop-header bg-black text-white border-b-[4px] h-12">
                <span className="font-black uppercase text-sm">LAYER 4: THE GOVERNOR (REAL-TIME RESPONSE)</span>
                <div className="pop-module-id bg-[#FF3399] text-white border-none">ACTIVE</div>
              </div>
              <div className="p-8 space-y-8 bg-white">
                {/* Target Video Selector */}
                <div className="p-8 border-[4px] border-black rounded-[28px] bg-gray-50 space-y-4 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.1)]">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-black uppercase text-black/30 mb-1 tracking-[0.2em]">🎯 Target Video Monitoring</p>
                      <p className="text-xs font-bold text-black opacity-50 uppercase tracking-tighter">Engage real-time performance governance.</p>
                    </div>
                    {targetVideoId && <div className="bg-black text-[#CCFF00] px-4 py-1.5 rounded-full text-[10px] font-black uppercase animate-pulse">Monitoring...</div>}
                  </div>

                  {recentVideos.length > 0 ? (
                    <select
                      value={targetVideoId}
                      onChange={(e) => setTargetVideoId(e.target.value)}
                      className="w-full pop-input p-5 text-lg font-black uppercase tracking-tighter"
                    >
                      <option value="">— SELECT PRODUCTION TRACK —</option>
                      {recentVideos.map((v) => (
                        <option key={v.videoId} value={v.videoId}>
                          {v.title?.toUpperCase().slice(0, 80) || v.videoId}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex items-center gap-4 p-6 bg-white border-[3px] border-dashed border-black rounded-3xl">
                      <span className="text-3xl">📡</span>
                      <p className="text-xs font-black uppercase text-black/20 tracking-widest">Connect channel to initiate monitoring...</p>
                    </div>
                  )}

                  {/* Live metrics for the selected video */}
                  {targetVideoId && selectedVideoStats && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 animate-in slide-in-from-bottom-2">
                      <div className="bg-white p-6 border-[4px] border-black rounded-[28px] text-center shadow-[8px_8px_0px_0px_black]">
                        <p className="text-[10px] font-black uppercase text-black/30 mb-2">Views</p>
                        <p className="text-3xl font-black tracking-tighter leading-none">{Number(selectedVideoStats.viewCount).toLocaleString()}</p>
                      </div>
                      <div className="bg-white p-6 border-[4px] border-black rounded-[28px] text-center shadow-[8px_8px_0px_0px_black]">
                        <p className="text-[10px] font-black uppercase text-black/30 mb-2">Likes</p>
                        <p className="text-3xl font-black tracking-tighter leading-none">{Number(selectedVideoStats.likeCount).toLocaleString()}</p>
                      </div>
                      <div className="bg-white p-6 border-[4px] border-black rounded-[28px] text-center shadow-[8px_8px_0px_0px_black]">
                        <p className="text-[10px] font-black uppercase text-black/30 mb-2">Comments</p>
                        <p className="text-3xl font-black tracking-tighter leading-none">{Number(selectedVideoStats.commentCount).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* CTR Pivot */}
                  <div className={`p-8 border-[4px] border-black rounded-[28px] transition-all shadow-[12px_12px_0px_0px_black] ${ctrPivotEnabled ? 'bg-[#f0f9ff]' : 'bg-white'}`}>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">🔄</span>
                        <span className="font-black uppercase text-xl tracking-tighter">CTR Pivot</span>
                      </div>
                      <button
                        onClick={() => setCtrPivotEnabled(!ctrPivotEnabled)}
                        className={`w-16 h-8 border-[4px] border-black rounded-full relative transition-all ${ctrPivotEnabled ? 'bg-[#CCFF00]' : 'bg-gray-200'}`}
                      >
                        <div className={`absolute top-0.5 w-5 h-5 bg-black rounded-full transition-all ${ctrPivotEnabled ? 'right-1' : 'left-1'}`}></div>
                      </button>
                    </div>
                    <p className="text-xs font-bold text-black/60 leading-relaxed uppercase tracking-tight mb-6">
                      <strong className="font-black text-black">Protocol:</strong> Swap thumbnail for pre-prepared alt version if CTR drops below baseline.
                    </p>
                    <div className={`text-[10px] font-black uppercase tracking-[0.3em] ${ctrPivotEnabled ? 'text-black' : 'text-black/20 underline decoration-2'}`}>{ctrPivotEnabled ? '⚡ PROTOCOL ACTIVE' : '⏹️ PROTOCOL STANDBY'}</div>
                  </div>

                  {/* Retention Rescue */}
                  <div className={`p-8 border-[4px] border-black rounded-[28px] transition-all shadow-[12px_12px_0px_0px_black] ${retentionRescueEnabled ? 'bg-[#fff7ed]' : 'bg-white'}`}>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">🚑</span>
                        <span className="font-black uppercase text-xl tracking-tighter">Rescue Protocol</span>
                      </div>
                      <button
                        onClick={() => setRetentionRescueEnabled(!retentionRescueEnabled)}
                        className={`w-16 h-8 border-[4px] border-black rounded-full relative transition-all ${retentionRescueEnabled ? 'bg-[#ff3399]' : 'bg-gray-200'}`}
                      >
                        <div className={`absolute top-0.5 w-5 h-5 bg-black rounded-full transition-all ${retentionRescueEnabled ? 'right-1' : 'left-1'}`}></div>
                      </button>
                    </div>
                    <p className="text-xs font-bold text-black/60 leading-relaxed uppercase tracking-tight mb-6">
                      <strong className="font-black text-black">Protocol:</strong> Pin re-engagement comment at identified retention drop points.
                    </p>
                    <div className={`text-[10px] font-black uppercase tracking-[0.3em] ${retentionRescueEnabled ? 'text-black' : 'text-black/20 underline decoration-2'}`}>{retentionRescueEnabled ? '⚡ PROTOCOL ACTIVE' : '⏹️ PROTOCOL STANDBY'}</div>
                  </div>
                </div>

                {/* Velocity Chart */}
                <div className="border-[4px] border-black rounded-[28px] overflow-hidden shadow-[16px_16px_0px_0px_black] bg-white">
                  <div className="bg-black text-white px-8 py-4 flex items-center justify-between border-b-[4px] border-black">
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full bg-[#ff3399] animate-pulse"></span>
                      <span className="text-[11px] font-black uppercase tracking-[0.3em]">View Velocity Baseline</span>
                    </div>
                    <div className="flex items-center gap-6 text-[10px] font-black uppercase">
                      <span className="flex items-center gap-2"><span className="inline-block w-4 h-4 bg-[#ff3399] rounded-lg border-2 border-white"></span> Spike</span>
                      <span className="flex items-center gap-2"><span className="inline-block w-4 h-4 bg-gray-100 rounded-lg border-2 border-black/20"></span> Stable</span>
                    </div>
                  </div>
                  <div className="p-10">
                    <p className="text-[10px] font-bold text-black/30 mb-8 uppercase tracking-widest text-center">First-24h View Rate Distribution. Baseline Avg: <strong>{avgVelocity} units</strong>.</p>
                    <div className="h-40 flex items-end gap-3 px-4">
                      {velocityBars.map((h, i) => (
                        <div key={i} className={`flex-1 rounded-t-2xl border-[3px] border-black transition-all duration-700 relative group ${h > 80 ? 'bg-[#ff3399]' : 'bg-gray-100'} hover:scale-x-125 hover:z-10`} style={{ height: `${h}%` }}>
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-[#CCFF00] text-[10px] font-black px-3 py-1.5 rounded-xl shadow-[4px_4px_0px_0px_black] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 border-2 border-[#CCFF00]">{h}% GAIN</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between text-[10px] font-black text-black/20 uppercase mt-10 tracking-[0.5em] px-2">
                      <span>-14 UPLOADS</span>
                      <span>CURRENT SECTOR</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlgorithmArchitect;
