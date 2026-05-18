import React, { useState, useEffect } from 'react';
import { 
  Activity, TrendingDown, Users, DollarSign, ArrowUpRight,
  Target, Sparkles, Crosshair, BarChart2, MessageCircle,
  CalendarDays, AlignLeft, CheckSquare, Image as ImageIcon,
  MessageSquareHeart, Trophy, Link, ShoppingBag, Share2,
  Clock, Mic2, Star, Zap, SplitSquareHorizontal, Leaf
} from 'lucide-react';

// Brand Colors derived from the provided CSS
const COLORS = {
  lime: 'bg-[#C9F830]',
  cyan: 'bg-[#24D3FF]',
  pink: 'bg-[#FF7497]',
  yellow: 'bg-[#FFE357]',
  orange: 'bg-[#FCAF57]',
  purple: 'bg-[#B14AED]',
};

// --- Reusable Neo-Brutalist Subtoolbox Wrapper ---
const Widget = ({ title, icon: Icon, color, className = "", children }) => (
  <div className={`w-full bg-white overflow-hidden relative flex flex-col shrink-0 transition-all duration-300 border-[4px] border-black rounded-[16px] shadow-[8px_8px_0px_0px_black] hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_black] ${className}`}>
    <header className={`h-[56px] min-h-[56px] flex items-center justify-between select-none relative z-20 border-b-[4px] border-black ${color}`}>
      <div className="flex items-center h-full flex-1">
        <div className={`h-full w-[56px] flex items-center justify-center shrink-0 border-r-[4px] border-black bg-white/30 backdrop-blur-sm`}>
          <Icon className="text-black" size={26} strokeWidth={2.5} />
        </div>
        <div className="flex items-center pl-3 h-full pointer-events-none select-none">
          <h3 className="font-[900] uppercase tracking-tighter text-black leading-none text-[22px] sm:text-[26px] mt-1">
            {title}
          </h3>
        </div>
      </div>
    </header>
    <main className="bg-white w-full p-4 text-black flex flex-col flex-1 overflow-hidden relative">
      {children}
    </main>
  </div>
);

export default function CreatorToolbox() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-screen bg-[#f3f4f6] p-4 md:p-8 font-sans selection:bg-[#CCFF00]">
      
      {/* Main Header */}
      <header className="max-w-[1600px] mx-auto bg-[#FFE357] h-[80px] rounded-[16px] border-[6px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,0.5)] flex items-center justify-between mb-8 overflow-hidden z-30 relative">
        <div className="flex items-center h-full">
          <div className="h-full w-[80px] flex items-center justify-center border-r-[6px] border-black bg-[#FF7497]">
            <Zap size={40} strokeWidth={2.5} className="text-black" />
          </div>
          <h1 className="text-[30px] md:text-[44px] font-[1000] uppercase tracking-tighter leading-none pl-6 text-black mt-1">
            Creator Ultimate Dashboard
          </h1>
        </div>
        <div className="hidden md:flex pr-6 gap-3">
          <div className="px-4 py-2 bg-white border-[3px] border-black rounded-xl font-black text-[14px]">
            MRBEAST_MODE: ON
          </div>
        </div>
      </header>

      {/* Masonry-style Grid Layout */}
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 auto-rows-[280px]">

        {/* 1. Velocity Pulse (Line Chart) */}
        <Widget title="Velocity Pulse" icon={Activity} color={COLORS.cyan}>
          <div className="flex justify-between items-end mb-2">
            <span className="font-black text-3xl tracking-tighter">4,281<span className="text-sm">/min</span></span>
            <span className="font-bold text-[#FF7497] border-2 border-black rounded-full px-2 text-xs">+12% avg</span>
          </div>
          <div className="flex-1 w-full border-[3px] border-black rounded-xl bg-gray-50 relative overflow-hidden flex items-end">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute w-full h-full stroke-black stroke-[3px] fill-[#24D3FF]/30">
              <path d="M0,100 L0,50 Q10,60 20,40 T40,30 T60,60 T80,20 T100,10 L100,100 Z" />
            </svg>
          </div>
        </Widget>

        {/* 2. Retention "Valley" Alert (Bar Chart) */}
        <Widget title="Retention Valleys" icon={TrendingDown} color={COLORS.pink}>
          <p className="font-bold text-xs uppercase tracking-wider text-black/60 mb-2">Latest Upload: 2 Drops Detected</p>
          <div className="flex-1 flex items-end gap-1.5 w-full">
            {[80, 75, 72, 68, 65, 30, 60, 58, 55, 52, 20, 48].map((val, i) => (
              <div key={i} className="flex-1 bg-white border-[3px] border-black relative rounded-t-sm group" style={{ height: `${val}%` }}>
                <div className={`absolute inset-0 ${val < 40 ? 'bg-[#FF7497] animate-pulse' : 'bg-[#C9F830]'} group-hover:opacity-50`} />
              </div>
            ))}
          </div>
          <div className="mt-2 text-xs font-black uppercase text-center bg-black text-white py-1 rounded">Review timestamps: 2:14, 8:05</div>
        </Widget>

        {/* 3. Project Calendar (Grid - Spans 2 Cols, 2 Rows) */}
        <Widget title="Content Calendar" icon={CalendarDays} color={COLORS.yellow} className="md:col-span-2 md:row-span-2">
          <div className="grid grid-cols-7 gap-2 flex-1 h-full">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
              <div key={d} className="font-black text-center border-b-[3px] border-black pb-1 uppercase">{d}</div>
            ))}
            {Array.from({ length: 28 }).map((_, i) => {
              const isUpload = i === 4 || i === 18;
              const isShoot = i === 2 || i === 16;
              return (
                <div key={i} className={`border-[3px] border-black rounded-lg p-1 flex flex-col justify-between ${isUpload ? 'bg-[#FF7497]' : isShoot ? 'bg-[#24D3FF]' : 'bg-gray-50'}`}>
                  <span className="font-bold text-xs opacity-50">{i + 1}</span>
                  {isUpload && <span className="font-black text-[10px] leading-none uppercase">Go Live</span>}
                  {isShoot && <span className="font-black text-[10px] leading-none uppercase">Shoot</span>}
                </div>
              );
            })}
          </div>
        </Widget>

        {/* 4. Audience Demographics (Pie Chart) */}
        <Widget title="Demographics" icon={Users} color={COLORS.orange}>
          <div className="flex-1 flex items-center justify-center relative">
            {/* CSS Conic Gradient Pie Chart */}
            <div className="w-[140px] h-[140px] rounded-full border-[4px] border-black shadow-[4px_4px_0px_0px_black] relative"
                 style={{ background: 'conic-gradient(#B14AED 0% 45%, #24D3FF 45% 80%, #C9F830 80% 100%)' }}>
              <div className="absolute inset-4 bg-white rounded-full border-[4px] border-black flex items-center justify-center">
                <span className="font-black text-xl">GEN Z</span>
              </div>
            </div>
          </div>
          <div className="flex justify-between text-xs font-bold uppercase mt-4 border-t-[3px] border-black pt-2">
            <span className="text-[#B14AED] stroke-black">â–  18-24 (45%)</span>
            <span className="text-[#24D3FF]">â–  25-34 (35%)</span>
          </div>
        </Widget>

        {/* 5. Sub Momentum (Big Number) */}
        <Widget title="Sub Momentum" icon={ArrowUpRight} color={COLORS.lime}>
          <div className="flex flex-col items-center justify-center flex-1 text-center">
            <h2 className="text-[64px] font-[1000] tracking-tighter leading-none" style={{ WebkitTextStroke: '2px black', color: 'white', textShadow: '4px 4px 0px black' }}>
              +1,204
            </h2>
            <p className="font-black uppercase text-xl mt-2 bg-[#24D3FF] px-3 py-1 border-[3px] border-black rounded-lg transform -rotate-2">
              Last 24 Hours
            </p>
          </div>
        </Widget>

        {/* 6. Revenue Heatmap (Grid) */}
        <Widget title="RPM Heatmap" icon={DollarSign} color={COLORS.purple}>
          <div className="grid grid-cols-4 grid-rows-4 gap-1.5 flex-1">
            {Array.from({ length: 16 }).map((_, i) => {
              const opacities = [10, 30, 80, 100, 20, 40, 90, 100, 10, 20, 60, 80, 10, 10, 40, 60];
              return (
                <div key={i} className="border-[3px] border-black rounded-md relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-[#C9F830]" style={{ opacity: opacities[i] / 100 }} />
                  <span className="relative z-10 font-bold text-[10px] mix-blend-difference text-white">
                    ${(opacities[i] / 10).toFixed(1)}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-center font-bold text-[10px] mt-2 uppercase">Best Time: Wed 4PM ($10 RPM)</p>
        </Widget>

        {/* 7. The Golden Thumbnail */}
        <Widget title="Golden Thumb" icon={ImageIcon} color={COLORS.yellow}>
          <div className="flex-1 w-full border-[4px] border-black rounded-xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
              <span className="font-black text-4xl opacity-20">THUMBNAIL</span>
            </div>
            <div className="absolute top-2 right-2 bg-[#C9F830] border-[3px] border-black rounded-full px-2 py-1 font-black text-sm rotate-6 shadow-[2px_2px_0px_0px_black]">
              12.4% CTR
            </div>
            <div className="absolute bottom-0 w-full bg-white/90 border-t-[4px] border-black font-bold text-xs p-2 uppercase truncate">
              I survived 50 days in...
            </div>
          </div>
        </Widget>

        {/* 8. Keyword Bubble Pop */}
        <Widget title="Trending Tags" icon={Target} color={COLORS.cyan}>
          <div className="flex flex-wrap gap-2 content-start flex-1 overflow-hidden pt-2">
            {[
              { t: 'MrBeast', c: 'bg-[#C9F830]', s: 'scale-110' },
              { t: 'Challenge', c: 'bg-[#FF7497]', s: 'scale-100' },
              { t: 'Survive', c: 'bg-[#FFE357]', s: 'scale-105' },
              { t: 'Island', c: 'bg-white', s: 'scale-90' },
              { t: '100 Days', c: 'bg-[#B14AED] text-white', s: 'scale-100' },
              { t: 'Minecraft', c: 'bg-[#FCAF57]', s: 'scale-95' },
            ].map((tag, i) => (
              <span key={i} className={`${tag.c} ${tag.s} border-[3px] border-black rounded-full px-3 py-1 font-black uppercase text-sm shadow-[2px_2px_0px_0px_black] hover:translate-y-1 transition-transform cursor-pointer`}>
                #{tag.t}
              </span>
            ))}
          </div>
        </Widget>

        {/* 9. Competitor Shadow (Horizontal Bars) */}
        <Widget title="Rival Shadow" icon={Crosshair} color={COLORS.pink}>
          <div className="flex flex-col justify-center gap-3 flex-1">
            {[
              { name: 'You', w: '95%', c: 'bg-[#C9F830]' },
              { name: 'Rival A', w: '70%', c: 'bg-gray-300' },
              { name: 'Rival B', w: '40%', c: 'bg-gray-300' }
            ].map((r, i) => (
              <div key={i} className="w-full">
                <div className="font-black text-xs uppercase mb-1">{r.name}</div>
                <div className="w-full h-6 border-[3px] border-black rounded-full bg-gray-50 overflow-hidden">
                  <div className={`h-full border-r-[3px] border-black ${r.c}`} style={{ width: r.w }} />
                </div>
              </div>
            ))}
          </div>
        </Widget>

        {/* 10. Topic Gap Finder (Gauge) */}
        <Widget title="Gap Finder" icon={Sparkles} color={COLORS.lime}>
          <div className="flex flex-col items-center justify-center flex-1">
            <div className="w-32 h-16 overflow-hidden relative">
              <div className="w-32 h-32 border-[6px] border-black rounded-full border-b-[#FF7497] border-r-[#FFE357] border-l-[#24D3FF] border-t-[#C9F830] transform rotate-45"></div>
              {/* Needle */}
              <div className="absolute bottom-0 left-1/2 w-1 h-14 bg-black origin-bottom -translate-x-1/2 rotate-45 transition-transform duration-1000" />
              <div className="absolute bottom-[-6px] left-1/2 w-4 h-4 bg-black rounded-full -translate-x-1/2" />
            </div>
            <div className="mt-4 font-black uppercase text-center bg-black text-white px-3 py-1 rounded-md">
              High Search / Low Comp
            </div>
            <p className="font-bold text-xs mt-2 text-center">Topic: "Space Base Building"</p>
          </div>
        </Widget>

        {/* 11. Production Timeline (Gantt) - Spans 2 Cols */}
        <Widget title="Production Pipeline" icon={AlignLeft} color={COLORS.purple} className="md:col-span-2">
          <div className="flex flex-col justify-center gap-4 flex-1 w-full pt-4">
            {[
              { t: 'Scripting', left: '0%', w: '30%', c: 'bg-[#FF7497]' },
              { t: 'Filming', left: '20%', w: '40%', c: 'bg-[#24D3FF]' },
              { t: 'Editing', left: '50%', w: '50%', c: 'bg-[#C9F830]' }
            ].map((g, i) => (
              <div key={i} className="relative w-full h-8 border-b-[3px] border-dashed border-gray-300">
                <div 
                  className={`absolute top-[-10px] h-10 border-[3px] border-black rounded-xl ${g.c} flex items-center px-2 font-black uppercase text-xs shadow-[3px_3px_0px_0px_black] hover:scale-105 transition-transform cursor-pointer z-10`}
                  style={{ left: g.left, width: g.w }}
                >
                  {g.t}
                </div>
              </div>
            ))}
          </div>
        </Widget>

        {/* 12. Script Hook Analyzer */}
        <Widget title="Hook Score" icon={MessageSquareHeart} color={COLORS.yellow}>
          <div className="flex-1 flex flex-col items-center justify-center">
             <div className="w-[120px] h-[120px] border-[6px] border-black rounded-full flex flex-col items-center justify-center shadow-[4px_4px_0px_0px_black] bg-[#C9F830] transform rotate-[-5deg]">
               <span className="font-[1000] text-[50px] leading-none mt-2">A+</span>
               <span className="font-black text-[10px] uppercase">Grade</span>
             </div>
             <p className="mt-4 font-bold text-xs text-center border-t-[3px] border-black pt-2">Retains 85% of viewers at 0:30</p>
          </div>
        </Widget>

        {/* 13. A/B/C Test Results (Spans 2 cols) */}
        <Widget title="A/B Testing Live" icon={SplitSquareHorizontal} color={COLORS.pink} className="md:col-span-2">
          <div className="flex h-full gap-4 pt-2">
            {[
              { l: 'A', ctr: '8.2%', c: 'bg-white', w: false },
              { l: 'B', ctr: '12.4%', c: 'bg-[#C9F830]', w: true },
              { l: 'C', ctr: '4.1%', c: 'bg-gray-200', w: false }
            ].map((t, i) => (
              <div key={i} className={`flex-1 border-[4px] border-black rounded-xl p-2 flex flex-col justify-between relative ${t.c} shadow-[4px_4px_0px_0px_black]`}>
                {t.w && <div className="absolute -top-3 -right-3 bg-black text-white font-black text-[10px] px-2 py-1 rounded-md rotate-12 z-10">WINNER</div>}
                <div className="w-full h-[80px] bg-black/10 border-[2px] border-black rounded-lg flex items-center justify-center">
                  <span className="font-black text-2xl opacity-30">IMG_{t.l}</span>
                </div>
                <div className="font-black text-center text-xl mt-2">{t.ctr} CTR</div>
              </div>
            ))}
          </div>
        </Widget>

        {/* 14. Sponsorship Pipeline (Kanban) - Spans 2 Cols, 2 Rows */}
        <Widget title="Sponsor Pipeline" icon={DollarSign} color={COLORS.cyan} className="md:col-span-2 md:row-span-2">
          <div className="flex gap-4 h-full bg-gray-100 p-4 border-[4px] border-black rounded-xl inset-shadow">
            {[
              { t: 'Inquiry', items: ['NordVPN', 'GFuel'], c: 'bg-white' },
              { t: 'Negotiating', items: ['SeatGeek'], c: 'bg-[#FFE357]' },
              { t: 'Signed', items: ['Raid'], c: 'bg-[#C9F830]' }
            ].map((col, i) => (
              <div key={i} className="flex-1 flex flex-col gap-2">
                <h4 className="font-black uppercase text-sm border-b-[3px] border-black pb-1">{col.t}</h4>
                {col.items.map((item, j) => (
                  <div key={j} className={`${col.c} border-[3px] border-black p-3 rounded-lg font-bold shadow-[3px_3px_0px_0px_black] hover:-translate-y-1 cursor-grab`}>
                    {item}
                    <div className="h-2 w-12 bg-black/20 rounded-full mt-2" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Widget>

        {/* 15. Comment Sentiment */}
        <Widget title="Comment Vibe" icon={MessageCircle} color={COLORS.orange}>
          <div className="flex-1 flex flex-col justify-center gap-4">
            {[
              { e: 'ðŸ¤£', label: 'Funny', p: '65%', w: '65%', c: 'bg-[#C9F830]' },
              { e: 'ðŸ˜®', label: 'Shocked', p: '25%', w: '25%', c: 'bg-[#24D3FF]' },
              { e: 'ðŸ¤¬', label: 'Angry', p: '10%', w: '10%', c: 'bg-[#FF7497]' }
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-2xl">{s.e}</span>
                <div className="flex-1 h-6 bg-gray-100 border-[3px] border-black rounded-full overflow-hidden flex">
                  <div className={`h-full border-r-[3px] border-black ${s.c} flex items-center px-2 font-black text-[10px] uppercase`} style={{ width: s.w }}>
                    {s.p}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Widget>

        {/* 16. Upload Checklist */}
        <Widget title="Upload Checklist" icon={CheckSquare} color={COLORS.purple}>
          <div className="flex flex-col gap-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {[
              { t: '4K Render Verified', d: true },
              { t: 'Thumbnail Uploaded', d: true },
              { t: 'Tags & Description', d: true },
              { t: 'Pinned Comment', d: false },
              { t: 'Community Post', d: false }
            ].map((item, i) => (
              <label key={i} className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-6 h-6 border-[3px] border-black rounded flex items-center justify-center transition-colors ${item.d ? 'bg-[#C9F830]' : 'bg-white group-hover:bg-gray-100'}`}>
                  {item.d && <div className="w-3 h-3 bg-black rounded-sm" />}
                </div>
                <span className={`font-bold uppercase text-sm ${item.d ? 'line-through opacity-50' : ''}`}>{item.t}</span>
              </label>
            ))}
          </div>
        </Widget>

        {/* 17. Superchat Ticker */}
        <Widget title="Live Ticker" icon={Star} color={COLORS.lime}>
          <div className="flex-1 flex flex-col justify-center relative overflow-hidden bg-black border-[4px] border-black rounded-xl">
             <div className="flex flex-col gap-2 absolute w-full px-2" style={{ animation: 'marquee 10s linear infinite' }}>
               <style>{`
                 @keyframes marquee { 0% { transform: translateY(100%); } 100% { transform: translateY(-100%); } }
               `}</style>
               {['$50 - "Love this!"', '$5 - "Notice me"', '$100 - "W video"', '$20 - "Keep it up"'].map((c, i) => (
                 <div key={i} className="bg-[#FF7497] border-[3px] border-black rounded-lg p-2 font-black uppercase text-sm">
                   {c}
                 </div>
               ))}
             </div>
          </div>
        </Widget>

        {/* 18. Member Loyalty */}
        <Widget title="Member Tiers" icon={Trophy} color={COLORS.orange}>
          <div className="flex flex-col justify-end h-full gap-1 pt-4 px-4">
            <div className="w-full bg-[#FFE357] border-[3px] border-black rounded-t-xl h-[40px] flex items-center justify-center font-black uppercase text-xs">Gold (15%)</div>
            <div className="w-full bg-gray-300 border-[3px] border-black rounded-t-xl h-[60px] flex items-center justify-center font-black uppercase text-xs">Silver (35%)</div>
            <div className="w-full bg-[#FCAF57] border-[3px] border-black rounded-t-xl h-[90px] flex items-center justify-center font-black uppercase text-xs">Bronze (50%)</div>
          </div>
        </Widget>

        {/* 19. Affiliate Links (Spans 2 cols) */}
        <Widget title="Affiliate Clicks" icon={Link} color={COLORS.yellow} className="md:col-span-2">
          <div className="flex flex-col justify-around h-full">
            {[
              { n: 'Camera Gear', v: 342, c: 'bg-[#24D3FF]' },
              { n: 'VPN Promo', v: 890, c: 'bg-[#FF7497]' },
              { n: 'Music Sub', v: 156, c: 'bg-[#B14AED]' }
            ].map((a, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="w-32 font-black uppercase text-xs text-right truncate">{a.n}</span>
                <div className="flex-1 h-8 bg-gray-100 border-[3px] border-black rounded-r-xl">
                  <div className={`h-full border-r-[3px] border-black ${a.c}`} style={{ width: `${(a.v/1000)*100}%` }} />
                </div>
                <span className="w-12 font-black text-sm">{a.v}</span>
              </div>
            ))}
          </div>
        </Widget>

        {/* 20. Merch Snapshot */}
        <Widget title="Merch Sales" icon={ShoppingBag} color={COLORS.cyan}>
           <div className="flex flex-col gap-2 h-full justify-center">
             <div className="flex items-center justify-between border-[3px] border-black p-2 rounded-lg bg-white shadow-[2px_2px_0px_0px_black]">
               <div className="w-8 h-8 bg-[#FF7497] border-2 border-black rounded-sm" />
               <span className="font-bold text-xs uppercase">Logo Hoodie</span>
               <span className="font-black">$450</span>
             </div>
             <div className="flex items-center justify-between border-[3px] border-black p-2 rounded-lg bg-white shadow-[2px_2px_0px_0px_black]">
               <div className="w-8 h-8 bg-[#C9F830] border-2 border-black rounded-sm" />
               <span className="font-bold text-xs uppercase">Sticker Pack</span>
               <span className="font-black">$120</span>
             </div>
             <div className="font-black text-center mt-2 border-t-[3px] border-black pt-2">TOTAL: $570</div>
           </div>
        </Widget>

        {/* 21. Cross-Platform Echo */}
        <Widget title="Social Echo" icon={Share2} color={COLORS.pink}>
           <div className="flex flex-col justify-center h-full gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-black rounded-md border-2 border-black">TT</div>
                <div className="flex-1 h-6 bg-gray-100 border-[3px] border-black rounded-full overflow-hidden"><div className="w-[80%] h-full bg-[#24D3FF] border-r-[3px] border-black" /></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-tr from-yellow-400 to-purple-500 text-white flex items-center justify-center font-black rounded-md border-2 border-black">IG</div>
                <div className="flex-1 h-6 bg-gray-100 border-[3px] border-black rounded-full overflow-hidden"><div className="w-[40%] h-full bg-[#FF7497] border-r-[3px] border-black" /></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 text-white flex items-center justify-center font-black rounded-md border-2 border-black">X</div>
                <div className="flex-1 h-6 bg-gray-100 border-[3px] border-black rounded-full overflow-hidden"><div className="w-[20%] h-full bg-blue-400 border-r-[3px] border-black" /></div>
              </div>
           </div>
        </Widget>

        {/* 22. Mid-roll Sweet Spot */}
        <Widget title="Ad Placement" icon={Clock} color={COLORS.lime}>
          <div className="flex-1 flex flex-col justify-center gap-4">
             <div className="w-full h-12 border-[4px] border-black rounded-full bg-gray-100 relative flex items-center">
                <div className="absolute left-[30%] w-[15%] h-full bg-[#FFE357] border-x-[4px] border-black animate-pulse" />
                <div className="absolute top-14 left-[30%] -translate-x-1/2 font-black text-xs">4:20</div>
                <div className="absolute top-14 left-[45%] -translate-x-1/2 font-black text-xs">6:00</div>
             </div>
             <p className="text-center font-bold text-[11px] uppercase bg-black text-white p-2 rounded mt-2">Optimal: High retention zone</p>
          </div>
        </Widget>

        {/* 23. Audio Vibe Meter */}
        <Widget title="Audio Mix" icon={Mic2} color={COLORS.orange}>
           <div className="flex-1 flex items-end justify-center gap-2 pt-4">
             {[40, 70, 100, 60, 30].map((h, i) => (
               <div key={i} className="w-6 border-[3px] border-black rounded-t-sm bg-gradient-to-t from-[#FFE357] to-[#FF7497]" style={{ height: `${h}%` }} />
             ))}
           </div>
           <div className="flex justify-between font-black text-[10px] mt-2 uppercase border-t-[3px] border-black pt-2">
             <span>SFX</span>
             <span>VOICE</span>
             <span>MUSIC</span>
           </div>
        </Widget>

        {/* 24. Evergreen Tracker */}
        <Widget title="Evergreen" icon={Leaf} color={COLORS.purple}>
           <div className="flex flex-col items-center justify-center h-full">
              <div className="w-20 h-20 bg-[#C9F830] border-[4px] border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_black] mb-4">
                <ArrowUpRight size={40} strokeWidth={3} />
              </div>
              <h4 className="font-black uppercase text-sm text-center">Video from 2022</h4>
              <p className="font-bold text-xs bg-black text-white px-2 py-1 rounded mt-1">+500 views today</p>
           </div>
        </Widget>

        {/* 25. AI Title Battle (Spans 2 Cols) */}
        <Widget title="AI Title Battle" icon={BarChart2} color={COLORS.yellow} className="md:col-span-2">
           <div className="flex flex-col justify-around h-full">
             <div className="flex items-center gap-4 bg-[#C9F830] border-[3px] border-black p-3 rounded-xl shadow-[4px_4px_0px_0px_black] transform rotate-1">
               <div className="font-black text-3xl">92</div>
               <div className="flex-1 font-bold uppercase">"I Spent 50 Hours In A Locked Room..."</div>
               <div className="bg-black text-white font-black text-[10px] px-2 py-1 rounded">WINNER</div>
             </div>
             
             <div className="flex items-center justify-center">
               <div className="bg-white border-2 border-black rounded-full p-1 z-10 font-black text-xs">VS</div>
               <div className="h-1 w-full bg-black absolute" />
             </div>

             <div className="flex items-center gap-4 bg-gray-100 border-[3px] border-black p-3 rounded-xl transform -rotate-1">
               <div className="font-black text-3xl opacity-50">64</div>
               <div className="flex-1 font-bold uppercase opacity-70">"Surviving 2 Days Trapped Inside"</div>
             </div>
           </div>
        </Widget>

      </div>
    </div>
  );
}