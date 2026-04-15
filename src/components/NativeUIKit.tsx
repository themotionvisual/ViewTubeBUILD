import React, { useState, useEffect } from 'react';

// ============================================================================
// SECTION G: NATIVE NEO-BRUTALIST UI KIT
// Recreates all 22 ClaudeUI sections as proper React/Tailwind components
// Rules: Colorful, simple, NO gradients, NO large black sections, fun interactions
// ============================================================================

const SectionLabel = ({ label }: { label: string }) => (
   <div className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 mt-14 mb-4 pb-2 border-b-[3px] border-black">
      {label}
   </div>
);

// ─── 00: BOX SYSTEM ───
export const BoxSystemDemo = () => (
   <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
            { title: 'Standard Box', color: 'bg-[#CCFF00]', shadow: 'shadow-[8px_8px_0px_0px_black]' },
            { title: 'Hero Box', color: 'bg-[#00CCFF]', shadow: 'shadow-[12px_12px_0px_0px_black]' },
            { title: 'Compact Box', color: 'bg-[#FFDD00]', shadow: 'shadow-[4px_4px_0px_0px_black]' },
         ].map(b => (
            <div key={b.title} className={`border-[4px] border-black rounded-2xl ${b.shadow} overflow-hidden bg-white`}>
               <div className={`${b.color} h-14 border-b-[4px] border-black flex items-center px-4`}>
                  <span className="font-[1000] uppercase tracking-tighter text-lg">{b.title}</span>
               </div>
               <div className="p-6">
                  <p className="text-[10px] font-black uppercase tracking-widest text-black/30">Content renders here</p>
               </div>
            </div>
         ))}
      </div>
   </div>
);

// ─── 01: BUTTONS ───
export const ButtonsDemo = () => {
   const [clicked, setClicked] = useState('');
   const colors = [
      { label: 'Pink', bg: 'bg-[#FF3399]', text: 'text-white' },
      { label: 'Lime', bg: 'bg-[#CCFF00]', text: 'text-black' },
      { label: 'Cyan', bg: 'bg-[#00CCFF]', text: 'text-black' },
      { label: 'Yellow', bg: 'bg-[#FFDD00]', text: 'text-black' },
      { label: 'Orange', bg: 'bg-[#FFB158]', text: 'text-black' },
      { label: 'Black', bg: 'bg-black', text: 'text-[#CCFF00]' },
   ];
   return (
      <div className="space-y-6">
         <div className="flex flex-wrap gap-4">
            {colors.map(c => (
               <button key={c.label} onClick={() => setClicked(c.label)}
                  className={`${c.bg} ${c.text} px-6 py-3 border-[4px] border-black rounded-2xl font-[1000] uppercase tracking-tighter text-sm shadow-[4px_4px_0px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:scale-95 transition-all`}
               >{c.label}</button>
            ))}
         </div>
         <div className="flex flex-wrap gap-4">
            <button className="bg-white text-black px-8 py-4 border-[4px] border-black rounded-2xl font-[1000] uppercase tracking-tighter shadow-[8px_8px_0px_0px_black] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all text-xl">
               ⚡ Large Action
            </button>
            <button className="bg-[#FF3399] text-white px-4 py-2 border-[3px] border-black rounded-xl font-black uppercase text-[10px] tracking-widest shadow-[2px_2px_0px_0px_black] hover:shadow-none hover:translate-y-0.5 transition-all">
               Tiny
            </button>
            <button disabled className="bg-gray-200 text-black/20 px-6 py-3 border-[4px] border-black/20 rounded-2xl font-[1000] uppercase tracking-tighter text-sm cursor-not-allowed">
               Disabled
            </button>
         </div>
         {clicked && <p className="text-[10px] font-black uppercase tracking-widest text-black/40">Last clicked: {clicked}</p>}
      </div>
   );
};

// ─── 02: CHIPS & FILTERS ───
export const ChipsDemo = () => {
   const [active, setActive] = useState<string[]>(['All']);
   const chips = ['All', 'Long', 'Shorts', 'Tutorials', 'Vlogs', 'Reviews'];
   const toggle = (c: string) => setActive(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
   return (
      <div className="flex flex-wrap gap-3">
         {chips.map(c => (
            <button key={c} onClick={() => toggle(c)}
               className={`px-5 py-2 border-[3px] border-black rounded-xl font-black uppercase text-xs tracking-tighter transition-all shadow-[3px_3px_0px_0px_black] active:shadow-none active:translate-y-0.5 ${
                  active.includes(c) ? 'bg-[#CCFF00] text-black' : 'bg-white text-black/50 hover:bg-gray-50'
               }`}
            >{c}</button>
         ))}
      </div>
   );
};

// ─── 03: TOGGLES · CHECKBOXES · RADIOS ───
export const TogglesDemo = () => {
   const [toggles, setToggles] = useState([true, false, true]);
   const [checks, setChecks] = useState([true, false, true, false]);
   const [radio, setRadio] = useState(0);
   const checkLabels = ['Auto-Optimize SEO', 'Enable AI Hooks', 'Smart Scheduling', 'Beta Features'];
   return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-2">Toggles</p>
            {['Publish Alerts', 'Auto Thumbnails', 'Dark Analytics'].map((label, i) => (
               <div key={label} className="flex items-center gap-4">
                  <div onClick={() => { const n = [...toggles]; n[i] = !n[i]; setToggles(n); }}
                     className={`w-14 h-8 border-[3px] border-black rounded-full cursor-pointer transition-all relative ${toggles[i] ? 'bg-[#CCFF00]' : 'bg-gray-200'}`}>
                     <div className={`w-6 h-6 bg-white border-[3px] border-black rounded-full absolute top-[1px] transition-all ${toggles[i] ? 'left-[22px]' : 'left-[1px]'}`} />
                  </div>
                  <span className="font-black uppercase text-xs tracking-tighter">{label}</span>
               </div>
            ))}
         </div>
         <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-2">Checkboxes</p>
            {checkLabels.map((label, i) => (
               <div key={label} onClick={() => { const n = [...checks]; n[i] = !n[i]; setChecks(n); }}
                  className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-7 h-7 border-[3px] border-black rounded-lg flex items-center justify-center transition-all ${checks[i] ? 'bg-[#00CCFF]' : 'bg-white group-hover:bg-gray-50'}`}>
                     {checks[i] && <span className="text-black font-black text-sm">✓</span>}
                  </div>
                  <span className={`font-black uppercase text-xs tracking-tighter transition-all ${checks[i] ? 'text-black line-through' : 'text-black/60'}`}>{label}</span>
               </div>
            ))}
         </div>
         <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-2">Radio</p>
            {['Growth Mode', 'Monetize Mode', 'Engagement Mode'].map((label, i) => (
               <div key={label} onClick={() => setRadio(i)} className="flex items-center gap-3 cursor-pointer">
                  <div className={`w-7 h-7 border-[3px] border-black rounded-full flex items-center justify-center ${radio === i ? 'bg-[#FF3399]' : 'bg-white'}`}>
                     {radio === i && <div className="w-3 h-3 bg-white rounded-full" />}
                  </div>
                  <span className="font-black uppercase text-xs tracking-tighter">{label}</span>
               </div>
            ))}
         </div>
      </div>
   );
};

// ─── 04: TEXT INPUTS & FORMS ───
export const InputsDemo = () => (
   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
         <label className="text-[10px] font-black uppercase tracking-widest text-black/30">Video Title</label>
         <input placeholder="Enter title..." className="w-full border-[4px] border-black p-3 font-black uppercase text-lg rounded-xl outline-none focus:bg-[#CCFF00]/10 transition-colors" />
      </div>
      <div className="space-y-2">
         <label className="text-[10px] font-black uppercase tracking-widest text-black/30">Channel ID</label>
         <input placeholder="UC..." className="w-full border-[4px] border-black p-3 font-black uppercase text-lg rounded-xl outline-none focus:bg-[#00CCFF]/10 transition-colors" />
      </div>
      <div className="space-y-2 md:col-span-2">
         <label className="text-[10px] font-black uppercase tracking-widest text-black/30">Description</label>
         <textarea rows={3} placeholder="Describe your video..." className="w-full border-[4px] border-black p-3 font-bold text-sm rounded-xl outline-none focus:bg-[#FF3399]/5 resize-none transition-colors" />
      </div>
      <div className="space-y-2">
         <label className="text-[10px] font-black uppercase tracking-widest text-black/30">Category</label>
         <select className="w-full border-[4px] border-black p-3 font-black uppercase text-sm rounded-xl bg-white outline-none cursor-pointer">
            <option>Education</option><option>Entertainment</option><option>Gaming</option><option>Science</option>
         </select>
      </div>
   </div>
);

// ─── 05: SLIDERS ───
export const SlidersDemo = () => {
   const [vals, setVals] = useState([72, 58, 41, 85]);
   const labels = ['Brightness', 'Saturation', 'Contrast', 'Opacity'];
   const colors = ['#00CCFF', '#FF3399', '#CCFF00', '#FFDD00'];
   return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {labels.map((label, i) => (
            <div key={label} className="space-y-2">
               <div className="flex justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-black/30">{label}</span>
                  <span className="text-sm font-[1000] uppercase" style={{ color: colors[i] }}>{vals[i]}</span>
               </div>
               <input type="range" min={0} max={100} value={vals[i]}
                  onChange={e => { const n = [...vals]; n[i] = +e.target.value; setVals(n); }}
                  className="w-full h-3 appearance-none rounded-full border-[3px] border-black cursor-pointer"
                  style={{ accentColor: colors[i] }} />
            </div>
         ))}
      </div>
   );
};

// ─── 06: PROGRESS BARS ───
export const ProgressBarsDemo = () => {
   const bars = [
      { label: 'Subscribers', pct: 78, color: '#FF3399' },
      { label: 'CTR Goal', pct: 62, color: '#CCFF00' },
      { label: 'Watch Time', pct: 45, color: '#00CCFF' },
      { label: 'Revenue', pct: 91, color: '#FFDD00' },
   ];
   return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
         <div className="space-y-4">
            {bars.map(b => (
               <div key={b.label} className="space-y-1">
                  <div className="flex justify-between">
                     <span className="text-[10px] font-black uppercase tracking-widest text-black/40">{b.label}</span>
                     <span className="text-xs font-[1000]">{b.pct}%</span>
                  </div>
                  <div className="w-full h-5 bg-gray-100 border-[3px] border-black rounded-full overflow-hidden">
                     <div className="h-full rounded-full transition-all duration-700" style={{ width: `${b.pct}%`, backgroundColor: b.color }} />
                  </div>
               </div>
            ))}
         </div>
         <div className="flex items-center justify-center gap-8 flex-wrap py-4">
            {bars.map(b => (
               <div key={b.label + '-ring'} className="flex flex-col items-center gap-2">
                  <svg width="80" height="80" viewBox="0 0 100 100">
                     <circle cx="50" cy="50" r="38" fill="none" stroke="#E8E8E8" strokeWidth="10" />
                     <circle cx="50" cy="50" r="38" fill="none" stroke={b.color} strokeWidth="10"
                        strokeDasharray={`${b.pct * 2.39} ${239 - b.pct * 2.39}`} transform="rotate(-90 50 50)" strokeLinecap="round" />
                     <text x="50" y="55" textAnchor="middle" fontFamily="Inter" fontWeight="900" fontSize="18" fill="black">{b.pct}%</text>
                  </svg>
                  <span className="text-[9px] font-black uppercase tracking-widest text-black/40">{b.label}</span>
               </div>
            ))}
         </div>
      </div>
   );
};

// ─── 07: KPI STAT CARDS ───
export const StatCardsDemo = () => {
   const stats = [
      { label: 'Subscribers', value: '9.3K', delta: '↑ 12%', color: 'bg-[#FF3399]', up: true },
      { label: 'Avg CTR', value: '6.8%', delta: '↑ 0.4%', color: 'bg-[#CCFF00]', up: true },
      { label: 'Watch Time', value: '4.2h', delta: '↓ 5%', color: 'bg-[#00CCFF]', up: false },
      { label: 'Revenue', value: '$912', delta: '↑ 18%', color: 'bg-[#FFDD00]', up: true },
      { label: 'Impressions', value: '56K', delta: '↑ 8%', color: 'bg-[#FFB158]', up: true },
   ];
   return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
         {stats.map(s => (
            <div key={s.label} className={`${s.color} border-[4px] border-black rounded-2xl p-4 shadow-[4px_4px_0px_0px_black] hover:shadow-none hover:translate-y-1 transition-all cursor-default`}>
               <p className="text-[9px] font-black uppercase tracking-widest text-black/40 mb-1">{s.label}</p>
               <p className="text-3xl font-[1000] uppercase tracking-tighter leading-none">{s.value}</p>
               <p className={`text-[10px] font-black uppercase mt-1 ${s.up ? 'text-black/60' : 'text-red-600/60'}`}>{s.delta}</p>
            </div>
         ))}
      </div>
   );
};

// ─── 08: TABLE ───
export const TableDemo = () => {
   const [expanded, setExpanded] = useState<number[]>([]);
   const toggle = (i: number) => setExpanded(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
   const rows = [
      { title: 'Summer Vlog Series', status: 'LIVE', statusColor: 'bg-[#CCFF00]', views: '47.2K', ctr: '8.1%', date: 'May 18', children: ['Episode 1: Beach Day', 'Episode 2: Sunset Hike'] },
      { title: 'AI Tools Review', status: 'SCHED', statusColor: 'bg-[#FFDD00]', views: '—', ctr: '—', date: 'May 25', children: [] },
      { title: 'Rebrand Announcement', status: 'DRAFT', statusColor: 'bg-[#FF3399]', views: '—', ctr: '—', date: 'TBD', children: [] },
   ];
   return (
      <div className="border-[4px] border-black rounded-2xl overflow-hidden shadow-[8px_8px_0px_0px_black]">
         <table className="w-full text-left">
            <thead>
               <tr className="bg-white border-b-[4px] border-black">
                  <th className="p-3 w-10"></th>
                  <th className="p-3 font-black uppercase text-[10px] tracking-widest text-black/40">Title</th>
                  <th className="p-3 font-black uppercase text-[10px] tracking-widest text-black/40">Status</th>
                  <th className="p-3 font-black uppercase text-[10px] tracking-widest text-black/40">Views</th>
                  <th className="p-3 font-black uppercase text-[10px] tracking-widest text-black/40">CTR</th>
                  <th className="p-3 font-black uppercase text-[10px] tracking-widest text-black/40">Date</th>
               </tr>
            </thead>
            <tbody>
               {rows.map((r, i) => (
                  <React.Fragment key={i}>
                     <tr className="border-b-[2px] border-black/10 hover:bg-[#CCFF00]/10 transition-colors">
                        <td className="p-3">
                           {r.children.length > 0 && (
                              <button onClick={() => toggle(i)} className={`font-black text-xs transition-transform ${expanded.includes(i) ? 'rotate-90' : ''}`}>▶</button>
                           )}
                        </td>
                        <td className="p-3 font-black uppercase text-sm tracking-tighter">{r.title}</td>
                        <td className="p-3"><span className={`${r.statusColor} px-3 py-1 border-[2px] border-black rounded-lg text-[9px] font-black uppercase`}>{r.status}</span></td>
                        <td className="p-3 font-black text-sm">{r.views}</td>
                        <td className="p-3 font-black text-sm">{r.ctr}</td>
                        <td className="p-3 font-bold text-sm text-black/50">{r.date}</td>
                     </tr>
                     {expanded.includes(i) && r.children.map((child, ci) => (
                        <tr key={ci} className="bg-gray-50 border-b border-black/5">
                           <td className="p-3"></td>
                           <td className="p-3 pl-8 text-xs font-bold text-black/50" colSpan={5}>↳ {child}</td>
                        </tr>
                     ))}
                  </React.Fragment>
               ))}
            </tbody>
         </table>
      </div>
   );
};

// ─── 09: CALENDAR ───
export const CalendarDemo = () => {
   const [month, setMonth] = useState(new Date().getMonth());
   const [year] = useState(new Date().getFullYear());
   const [selected, setSelected] = useState<number | null>(null);
   const eventDays = [3, 7, 12, 18, 22, 25];
   const today = new Date().getDate();
   const daysInMonth = new Date(year, month + 1, 0).getDate();
   const startDay = new Date(year, month, 1).getDay();
   const monthName = new Date(year, month).toLocaleString('default', { month: 'long' }).toUpperCase();

   return (
      <div className="max-w-sm">
         <div className="flex items-center justify-between mb-4">
            <button onClick={() => setMonth(m => m - 1)} className="w-10 h-10 border-[3px] border-black rounded-xl font-black flex items-center justify-center hover:bg-[#CCFF00] transition-colors">◀</button>
            <span className="font-[1000] uppercase tracking-tighter text-xl">{monthName} {year}</span>
            <button onClick={() => setMonth(m => m + 1)} className="w-10 h-10 border-[3px] border-black rounded-xl font-black flex items-center justify-center hover:bg-[#CCFF00] transition-colors">▶</button>
         </div>
         <div className="grid grid-cols-7 gap-1 mb-1">
            {['S','M','T','W','T','F','S'].map((d,i) => (
               <div key={i} className="text-center text-[9px] font-black uppercase tracking-widest text-black/30 py-1">{d}</div>
            ))}
         </div>
         <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startDay }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
               const day = i + 1;
               const isToday = day === today && month === new Date().getMonth();
               const isEvent = eventDays.includes(day);
               const isSel = day === selected;
               return (
                  <button key={day} onClick={() => setSelected(day)}
                     className={`aspect-square rounded-xl text-sm font-black flex items-center justify-center transition-all border-[2px] ${
                        isSel ? 'bg-[#FF3399] text-white border-black scale-110' :
                        isToday ? 'bg-[#CCFF00] border-black' :
                        isEvent ? 'bg-[#00CCFF]/20 border-[#00CCFF] hover:bg-[#00CCFF]/40' :
                        'border-transparent hover:border-black/20 hover:bg-gray-50'
                     }`}>{day}</button>
               );
            })}
         </div>
         <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#FF3399] rounded-full border-[2px] border-black" /><span className="text-[9px] font-black uppercase tracking-widest text-black/40">Post Day</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#CCFF00] rounded-full border-[2px] border-black" /><span className="text-[9px] font-black uppercase tracking-widest text-black/40">Today</span></div>
         </div>
      </div>
   );
};

// ─── 10: LOADERS & SKELETONS ───
export const LoadersDemo = () => (
   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-4">
         <p className="text-[10px] font-black uppercase tracking-widest text-black/30">Skeleton Loading</p>
         <div className="w-full h-32 bg-gray-200 rounded-2xl animate-pulse border-[3px] border-black/10" />
         <div className="flex gap-3 items-center">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
            <div className="flex-1 space-y-2"><div className="w-3/4 h-3 bg-gray-200 rounded animate-pulse" /><div className="w-1/2 h-3 bg-gray-200 rounded animate-pulse" /></div>
         </div>
         <div className="w-full h-3 bg-gray-200 rounded animate-pulse" />
         <div className="w-2/3 h-3 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="space-y-6">
         <p className="text-[10px] font-black uppercase tracking-widest text-black/30">Spinners & Bars</p>
         <div className="w-full h-4 border-[3px] border-black rounded-full overflow-hidden">
            <div className="h-full bg-[#FF3399] animate-[loading_2s_ease-in-out_infinite] w-1/2 rounded-full" />
         </div>
         <div className="flex gap-4 items-center">
            {['#FF3399', '#00CCFF', '#CCFF00'].map(c => (
               <div key={c} className="w-8 h-8 border-[4px] border-black/20 rounded-full animate-spin" style={{ borderTopColor: c }} />
            ))}
         </div>
         <div className="flex gap-2 items-center">
            {[0, 1, 2].map(i => (
               <div key={i} className="w-3 h-3 bg-black rounded-full" style={{ animation: `bounce 1s ${i * 0.2}s ease-in-out infinite` }} />
            ))}
            <span className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-2">Loading…</span>
         </div>
      </div>
   </div>
);

// ─── 11: TABS & PILLS ───
export const TabsPillsDemo = () => {
   const [tab, setTab] = useState(0);
   const [pill, setPill] = useState(0);
   return (
      <div className="space-y-6">
         <div className="flex border-[4px] border-black rounded-2xl overflow-hidden">
            {['Studio', 'Analyzer', 'History', 'Archive'].map((t, i) => (
               <button key={t} onClick={() => setTab(i)}
                  className={`flex-1 py-3 font-[1000] uppercase tracking-tighter text-sm transition-all ${
                     tab === i ? 'bg-black text-[#CCFF00]' : 'bg-white text-black/30 hover:bg-gray-50 hover:text-black'
                  } ${i > 0 ? 'border-l-[3px] border-black' : ''}`}>{t}</button>
            ))}
         </div>
         <p className="text-xs font-bold uppercase text-black/30 tracking-widest">Tab {tab + 1} content renders here</p>
         <div className="flex gap-2">
            {['All', 'Long', 'Shorts'].map((p, i) => (
               <button key={p} onClick={() => setPill(i)}
                  className={`px-5 py-2 rounded-full border-[3px] border-black font-black uppercase text-[10px] tracking-tighter transition-all ${
                     pill === i ? 'bg-[#FF3399] text-white shadow-none' : 'bg-white text-black shadow-[3px_3px_0px_0px_black] hover:shadow-none hover:translate-y-0.5'
                  }`}>{p}</button>
            ))}
         </div>
      </div>
   );
};

// ─── 12: BADGES & DIVIDERS ───
export const BadgesDemo = () => (
   <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
         {[
            { label: '● Live', bg: 'bg-[#FF3399]', text: 'text-white' },
            { label: '✓ Published', bg: 'bg-[#CCFF00]', text: 'text-black' },
            { label: '⚑ Scheduled', bg: 'bg-[#FFDD00]', text: 'text-black' },
            { label: '↗ Trending', bg: 'bg-[#00CCFF]', text: 'text-black' },
            { label: '▲ Featured', bg: 'bg-[#FFB158]', text: 'text-black' },
            { label: '★ Top', bg: 'bg-black', text: 'text-white' },
            { label: '◯ Draft', bg: 'bg-white', text: 'text-black' },
         ].map(b => (
            <span key={b.label} className={`${b.bg} ${b.text} px-3 py-1 border-[2px] border-black rounded-lg text-[10px] font-black uppercase tracking-wider`}>{b.label}</span>
         ))}
      </div>
      <hr className="border-t-[3px] border-black" />
      <hr className="border-t-[3px] border-dashed border-black/20" />
      <div className="flex items-center gap-4"><div className="flex-1 h-[2px] bg-black/10" /><span className="text-[10px] font-black uppercase tracking-widest text-black/30">OR</span><div className="flex-1 h-[2px] bg-black/10" /></div>
   </div>
);

// ─── 13: RATINGS & TOASTS ───
export const RatingsToastsDemo = () => {
   const [rating, setRating] = useState(4);
   return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-black/30">Star Rating</p>
            <div className="flex items-center gap-1">
               {[1,2,3,4,5].map(i => (
                  <button key={i} onClick={() => setRating(i)}
                     className={`text-3xl transition-all hover:scale-125 ${i <= rating ? 'text-[#FFDD00]' : 'text-black/10'}`}>★</button>
               ))}
               <span className="ml-3 font-[1000] text-lg">{rating}/5</span>
            </div>
         </div>
         <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-black/30">Toast Notifications</p>
            <div className="bg-[#CCFF00] border-[3px] border-black rounded-xl px-4 py-3 flex items-center gap-3 shadow-[4px_4px_0px_0px_black]">
               <span className="font-black">✓</span><span className="font-bold text-sm flex-1">Video published successfully!</span><span className="font-black cursor-pointer hover:text-red-500">✕</span>
            </div>
            <div className="bg-[#FF3399] text-white border-[3px] border-black rounded-xl px-4 py-3 flex items-center gap-3 shadow-[4px_4px_0px_0px_black]">
               <span className="font-black">✕</span><span className="font-bold text-sm flex-1">Upload failed. Try again.</span><span className="font-black cursor-pointer">✕</span>
            </div>
            <div className="bg-[#00CCFF] border-[3px] border-black rounded-xl px-4 py-3 flex items-center gap-3 shadow-[4px_4px_0px_0px_black]">
               <span className="font-black">ℹ</span><span className="font-bold text-sm flex-1">AI tactics generated.</span><span className="font-black cursor-pointer hover:text-red-500">✕</span>
            </div>
         </div>
      </div>
   );
};

// ─── 14: HOVER CARDS ───
export const HoverCardsDemo = () => (
   <div className="flex flex-wrap gap-4">
      {[
         { label: '↗ Default Lift', hoverBg: 'hover:bg-[#CCFF00]' },
         { label: '⚡ Pink Lift', hoverBg: 'hover:bg-[#FF3399] hover:text-white' },
         { label: '→ Cyan Lift', hoverBg: 'hover:bg-[#00CCFF]' },
         { label: '★ Yellow Lift', hoverBg: 'hover:bg-[#FFDD00]' },
      ].map(c => (
         <div key={c.label}
            className={`w-36 text-center p-5 border-[4px] border-black rounded-2xl font-[1000] uppercase tracking-tighter text-sm bg-white shadow-[4px_4px_0px_0px_black] hover:shadow-[8px_8px_0px_0px_black] hover:-translate-y-2 transition-all cursor-pointer ${c.hoverBg}`}
         >{c.label}</div>
      ))}
   </div>
);

// ─── 15: ANIMATIONS ───
export const AnimationsDemo = () => (
   <div className="flex flex-wrap gap-6 items-end">
      {[
         { emoji: '💥', label: 'Pulse', color: 'bg-[#FF3399]', anim: 'animate-pulse' },
         { emoji: '🚀', label: 'Bounce', color: 'bg-[#CCFF00]', anim: 'animate-bounce' },
         { emoji: '⚙', label: 'Spin', color: 'bg-[#00CCFF]', anim: 'animate-spin' },
      ].map(a => (
         <div key={a.label} className="flex flex-col items-center gap-2">
            <div className={`w-16 h-16 ${a.color} border-[4px] border-black rounded-2xl flex items-center justify-center text-2xl shadow-[4px_4px_0px_0px_black] ${a.anim}`}>{a.emoji}</div>
            <span className="text-[9px] font-black uppercase tracking-widest text-black/40">{a.label}</span>
         </div>
      ))}
   </div>
);

// ─── 16: VIDEO CARDS ───
export const VideoCardsDemo = () => (
   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[
         { emoji: '🏖', title: "Sample Video One", views: '22.1K', ctr: '9.3%', status: 'LIVE', statusColor: 'bg-[#CCFF00]', dur: '22:14', thumbBg: 'bg-[#00CCFF]/20' },
         { emoji: '⚔️', title: 'Sample Video Two', views: '47.2K', ctr: '8.1%', status: 'SCHED', statusColor: 'bg-[#FFDD00]', dur: '35:07', thumbBg: 'bg-[#FF3399]/20' },
         { emoji: '👑', title: 'Sample Video Three', views: '—', ctr: '—', status: 'DRAFT', statusColor: 'bg-[#FF3399]', dur: '41:22', thumbBg: 'bg-gray-100' },
      ].map(v => (
         <div key={v.title} className="border-[4px] border-black rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_black] hover:shadow-[8px_8px_0px_0px_black] hover:-translate-y-1 transition-all bg-white cursor-pointer group">
            <div className={`${v.thumbBg} h-36 flex items-center justify-center text-5xl relative`}>
               {v.emoji}
               <div className="absolute bottom-2 right-2 bg-black text-white px-2 py-1 rounded-lg text-[10px] font-black">{v.dur}</div>
            </div>
            <div className="p-4 space-y-2">
               <h4 className="font-[1000] uppercase tracking-tighter text-sm leading-tight group-hover:text-[#FF3399] transition-colors">{v.title}</h4>
               <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black text-black/40">{v.views} views</span>
                  <span className="text-[10px] font-black text-black/40">{v.ctr} CTR</span>
                  <span className={`${v.statusColor} px-2 py-0.5 border-[2px] border-black rounded-md text-[8px] font-black uppercase`}>{v.status}</span>
               </div>
            </div>
         </div>
      ))}
   </div>
);

// ─── 17: MODAL ───
export const ModalDemo = () => {
   const [open, setOpen] = useState(false);
   return (
      <>
         <button onClick={() => setOpen(true)} className="bg-[#FF3399] text-white px-8 py-4 border-[4px] border-black rounded-2xl font-[1000] uppercase tracking-tighter shadow-[8px_8px_0px_0px_black] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all text-lg">
            Open Modal ↗
         </button>
         {open && (
            <div onClick={e => e.target === e.currentTarget && setOpen(false)}
               className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s]">
               <div className="bg-white border-[5px] border-black rounded-2xl shadow-[16px_16px_0px_0px_black] w-full max-w-md overflow-hidden">
                  <div className="bg-[#FFDD00] px-6 py-4 border-b-[4px] border-black flex justify-between items-center">
                     <span className="font-[1000] uppercase tracking-tighter text-xl">⚡ Generate Tactics</span>
                     <button onClick={() => setOpen(false)} className="w-10 h-10 bg-white border-[3px] border-black rounded-xl font-black flex items-center justify-center hover:bg-[#FF3399] hover:text-white transition-all">✕</button>
                  </div>
                  <div className="p-6 space-y-4">
                     <p className="font-bold text-sm leading-relaxed">AI will scan your channel and generate personalized success actions based on your goals.</p>
                     <select className="w-full border-[4px] border-black p-3 rounded-xl font-black uppercase text-sm">
                        <option>Growth</option><option>Monetization</option><option>Engagement</option>
                     </select>
                  </div>
                  <div className="px-6 py-4 border-t-[3px] border-black/10 flex justify-end gap-3">
                     <button onClick={() => setOpen(false)} className="px-6 py-2 border-[3px] border-black rounded-xl font-black uppercase text-xs hover:bg-gray-50 transition-colors">Cancel</button>
                     <button className="px-6 py-2 bg-[#FF3399] text-white border-[3px] border-black rounded-xl font-black uppercase text-xs shadow-[3px_3px_0px_0px_black] hover:shadow-none hover:translate-y-0.5 transition-all">⚡ Generate</button>
                  </div>
               </div>
            </div>
         )}
      </>
   );
};

// ─── 18: TREE ───
export const TreeDemo = () => {
   const [openNodes, setOpenNodes] = useState<string[]>(['root']);
   const toggle = (id: string) => setOpenNodes(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
   return (
      <div className="max-w-sm space-y-1">
         <div>
            <button onClick={() => toggle('root')} className="flex items-center gap-2 font-black uppercase text-sm tracking-tighter hover:text-[#FF3399] transition-colors w-full text-left py-1">
               <span className={`transition-transform ${openNodes.includes('root') ? 'rotate-90' : ''}`}>▶</span> 📁 Channel Assets
            </button>
            {openNodes.includes('root') && (
               <div className="ml-6 border-l-[3px] border-black/10 pl-4 space-y-1 mt-1">
                  <button onClick={() => toggle('videos')} className="flex items-center gap-2 font-black uppercase text-xs tracking-tighter hover:text-[#00CCFF] transition-colors w-full text-left py-1">
                     <span className={`transition-transform text-[10px] ${openNodes.includes('videos') ? 'rotate-90' : ''}`}>▶</span> 🎬 Videos
                  </button>
                  {openNodes.includes('videos') && (
                     <div className="ml-6 border-l-[2px] border-black/5 pl-3 space-y-1">
                        {['Episode 1 — Beach Day', 'Episode 2 — Sunset Hike', 'AI Tools Review (Draft)'].map(v => (
                           <div key={v} className="text-xs font-bold text-black/50 py-0.5 hover:text-black transition-colors cursor-pointer">{v}</div>
                        ))}
                     </div>
                  )}
                  <div className="text-xs font-bold text-black/50 py-0.5">📊 Analytics Export</div>
                  <div className="text-xs font-bold text-black/50 py-0.5">📝 Script Templates</div>
               </div>
            )}
         </div>
      </div>
   );
};

// ─── 19: SVG BAR CHART ───
export const BarChartDemo = () => {
   const [hovered, setHovered] = useState<number | null>(null);
   const data = [
      { label: 'Mon', value: 42, color: '#FF3399' }, { label: 'Tue', value: 68, color: '#CCFF00' },
      { label: 'Wed', value: 55, color: '#00CCFF' }, { label: 'Thu', value: 91, color: '#FFDD00' },
      { label: 'Fri', value: 73, color: '#FFB158' }, { label: 'Sat', value: 85, color: '#FF3399' },
      { label: 'Sun', value: 38, color: '#00CCFF' },
   ];
   return (
      <div className="border-[4px] border-black rounded-2xl bg-white shadow-[8px_8px_0px_0px_black] overflow-hidden">
         <div className="bg-[#00CCFF] border-b-[4px] border-black px-4 py-3 flex justify-between items-center">
            <span className="font-[1000] uppercase tracking-tighter">Weekly Views</span>
            <span className="text-[10px] font-black uppercase tracking-widest bg-white px-3 py-1 border-[2px] border-black rounded-lg">7 Days</span>
         </div>
         <div className="p-6">
            <svg viewBox="0 0 350 180" className="w-full">
               {[0, 25, 50, 75, 100].map(v => (
                  <React.Fragment key={v}>
                     <line x1="40" y1={150 - v * 1.3} x2="340" y2={150 - v * 1.3} stroke="#E5E7EB" strokeWidth="1" />
                     <text x="30" y={154 - v * 1.3} textAnchor="end" fontSize="8" fontWeight="900" fill="#999">{v}K</text>
                  </React.Fragment>
               ))}
               {data.map((d, i) => {
                  const x = 55 + i * 42; const h = d.value * 1.3; const y = 150 - h;
                  return (
                     <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} className="cursor-pointer">
                        <rect x={x - 14} y={y} width="28" height={h} fill={d.color} stroke="black" strokeWidth="2" rx="4"
                           className={`transition-all duration-200 ${hovered === i ? 'opacity-100' : 'opacity-80'}`} />
                        {hovered === i && <text x={x} y={y - 8} textAnchor="middle" fontSize="10" fontWeight="900" fill="black">{d.value}K</text>}
                        <text x={x} y="168" textAnchor="middle" fontSize="8" fontWeight="900" fill="#666">{d.label}</text>
                     </g>
                  );
               })}
            </svg>
         </div>
      </div>
   );
};

// ─── 20: SVG LINE CHART ───
export const LineChartDemo = () => {
   const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
   const data1 = [20, 45, 35, 60, 50, 80, 70, 95, 85, 75, 90, 88];
   const data2 = [10, 25, 40, 30, 55, 45, 65, 60, 70, 82, 78, 92];
   const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
   const toPath = (d: number[]) => d.map((v, i) => `${i === 0 ? 'M' : 'L'}${40 + i * 26},${150 - v * 1.3}`).join(' ');
   return (
      <div className="border-[4px] border-black rounded-2xl bg-white shadow-[8px_8px_0px_0px_black] overflow-hidden">
         <div className="bg-[#CCFF00] border-b-[4px] border-black px-4 py-3 flex justify-between items-center">
            <span className="font-[1000] uppercase tracking-tighter">Growth Trend</span>
            <div className="flex gap-3">
               <span className="flex items-center gap-1 text-[9px] font-black uppercase"><span className="w-3 h-1 bg-[#FF3399] rounded" />Subs</span>
               <span className="flex items-center gap-1 text-[9px] font-black uppercase"><span className="w-3 h-1 bg-[#00CCFF] rounded" />Views</span>
            </div>
         </div>
         <div className="p-6">
            <svg viewBox="0 0 350 180" className="w-full">
               {[0, 25, 50, 75, 100].map(v => (
                  <line key={v} x1="40" y1={150 - v * 1.3} x2="330" y2={150 - v * 1.3} stroke="#E5E7EB" strokeWidth="1" />
               ))}
               <path d={toPath(data1)} fill="none" stroke="#FF3399" strokeWidth="3" strokeLinejoin="round" />
               <path d={toPath(data2)} fill="none" stroke="#00CCFF" strokeWidth="3" strokeLinejoin="round" strokeDasharray="6 3" />
               {data1.map((v, i) => (
                  <circle key={i} cx={40 + i * 26} cy={150 - v * 1.3} r={hoveredPoint === i ? 6 : 3} fill="#FF3399" stroke="black" strokeWidth="2"
                     onMouseEnter={() => setHoveredPoint(i)} onMouseLeave={() => setHoveredPoint(null)} className="cursor-pointer transition-all" />
               ))}
               {hoveredPoint !== null && (
                  <text x={40 + hoveredPoint * 26} y={150 - data1[hoveredPoint] * 1.3 - 12} textAnchor="middle" fontSize="9" fontWeight="900" fill="black">
                     {data1[hoveredPoint]}K · {months[hoveredPoint]}
                  </text>
               )}
               {months.map((m, i) => <text key={m} x={40 + i * 26} y="168" textAnchor="middle" fontSize="7" fontWeight="800" fill="#999">{m}</text>)}
            </svg>
         </div>
      </div>
   );
};

// ─── 21: DONUT CHART ───
export const DonutChartDemo = () => {
   const [activeSlice, setActiveSlice] = useState<number | null>(null);
   const slices = [
      { label: 'Organic', pct: 42, color: '#CCFF00' }, { label: 'Search', pct: 28, color: '#00CCFF' },
      { label: 'Suggested', pct: 18, color: '#FF3399' }, { label: 'External', pct: 12, color: '#FFDD00' },
   ];
   let cumulative = 0;
   return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
         <div className="flex justify-center">
            <svg viewBox="0 0 120 120" className="w-48 h-48">
               {slices.map((s, i) => {
                  const start = cumulative; cumulative += s.pct;
                  const r = 45; const c = 2 * Math.PI * r;
                  const offset = c - (s.pct / 100) * c; const rotation = (start / 100) * 360 - 90;
                  return (
                     <circle key={i} cx="60" cy="60" r={r} fill="none" stroke={s.color} strokeWidth={activeSlice === i ? 16 : 12}
                        strokeDasharray={`${c}`} strokeDashoffset={offset} transform={`rotate(${rotation} 60 60)`}
                        onMouseEnter={() => setActiveSlice(i)} onMouseLeave={() => setActiveSlice(null)}
                        className="cursor-pointer transition-all duration-200" strokeLinecap="butt" />
                  );
               })}
               <text x="60" y="58" textAnchor="middle" fontSize="14" fontWeight="900" fill="black">
                  {activeSlice !== null ? `${slices[activeSlice].pct}%` : '100%'}
               </text>
               <text x="60" y="70" textAnchor="middle" fontSize="6" fontWeight="800" fill="#999">
                  {activeSlice !== null ? slices[activeSlice].label.toUpperCase() : 'TRAFFIC'}
               </text>
            </svg>
         </div>
         <div className="space-y-3">
            {slices.map((s, i) => (
               <div key={i} onMouseEnter={() => setActiveSlice(i)} onMouseLeave={() => setActiveSlice(null)}
                  className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all ${activeSlice === i ? 'bg-gray-50 scale-105' : ''}`}>
                  <div className="w-5 h-5 rounded-md border-[2px] border-black" style={{ backgroundColor: s.color }} />
                  <span className="font-black uppercase text-xs tracking-tighter flex-1">{s.label}</span>
                  <span className="font-[1000] text-lg">{s.pct}%</span>
               </div>
            ))}
         </div>
      </div>
   );
};

// ─── 22: RADAR / SPIDER CHART ───
export const RadarChartDemo = () => {
   const metrics = ['CTR', 'Watch Time', 'Subs Growth', 'Revenue', 'Engagement'];
   const values = [85, 60, 72, 90, 55];
   const cx = 120; const cy = 110; const maxR = 80;
   const getPoint = (i: number, r: number) => {
      const angle = (Math.PI * 2 * i) / metrics.length - Math.PI / 2;
      return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
   };
   const polygon = values.map((v, i) => { const p = getPoint(i, (v / 100) * maxR); return `${p.x},${p.y}`; }).join(' ');
   return (
      <div className="flex justify-center">
         <svg viewBox="0 0 240 240" className="w-64 h-64">
            {[20, 40, 60, 80, 100].map(r => (
               <polygon key={r} points={metrics.map((_, i) => { const p = getPoint(i, (r / 100) * maxR); return `${p.x},${p.y}`; }).join(' ')}
                  fill="none" stroke="#E5E7EB" strokeWidth="1" />
            ))}
            {metrics.map((_, i) => {
               const p = getPoint(i, maxR);
               return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#E5E7EB" strokeWidth="1" />;
            })}
            <polygon points={polygon} fill="rgba(204,255,0,0.25)" stroke="#CCFF00" strokeWidth="3" />
            {values.map((v, i) => {
               const p = getPoint(i, (v / 100) * maxR);
               return <circle key={i} cx={p.x} cy={p.y} r="5" fill="#FF3399" stroke="black" strokeWidth="2" />;
            })}
            {metrics.map((m, i) => {
               const p = getPoint(i, maxR + 16);
               return <text key={i} x={p.x} y={p.y + 3} textAnchor="middle" fontSize="7" fontWeight="900" fill="#666">{m.toUpperCase()}</text>;
            })}
         </svg>
      </div>
   );
};

// ─── 23: SCATTER PLOT ───
export const ScatterPlotDemo = () => {
   const [hovered, setHovered] = useState<number | null>(null);
   const points = [
      { x: 15, y: 30, s: 8, c: '#FF3399' }, { x: 30, y: 60, s: 12, c: '#CCFF00' }, { x: 45, y: 45, s: 6, c: '#00CCFF' },
      { x: 58, y: 80, s: 14, c: '#FFDD00' }, { x: 70, y: 55, s: 9, c: '#FFB158' }, { x: 82, y: 90, s: 11, c: '#FF3399' },
      { x: 25, y: 70, s: 7, c: '#00CCFF' }, { x: 90, y: 75, s: 10, c: '#CCFF00' },
   ];
   return (
      <div className="border-[4px] border-black rounded-2xl bg-white shadow-[8px_8px_0px_0px_black] overflow-hidden">
         <div className="bg-[#FFB158] border-b-[4px] border-black px-4 py-3">
            <span className="font-[1000] uppercase tracking-tighter">CTR vs Watch Time</span>
         </div>
         <div className="p-6">
            <svg viewBox="0 0 300 180" className="w-full">
               <line x1="30" y1="0" x2="30" y2="155" stroke="#DDD" strokeWidth="1" />
               <line x1="30" y1="155" x2="295" y2="155" stroke="#DDD" strokeWidth="1" />
               {points.map((p, i) => (
                  <circle key={i} cx={30 + p.x * 2.8} cy={155 - p.y * 1.5} r={hovered === i ? p.s + 3 : p.s} fill={p.c} stroke="black" strokeWidth="2"
                     onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
                     className="cursor-pointer transition-all duration-200" />
               ))}
               <text x="160" y="175" textAnchor="middle" fontSize="8" fontWeight="900" fill="#999">CTR %</text>
               <text x="10" y="80" textAnchor="middle" fontSize="8" fontWeight="900" fill="#999" transform="rotate(-90 10 80)">WATCH MIN</text>
            </svg>
         </div>
      </div>
   );
};

// ─── 24: DISTRIBUTION BLOCKS ───
export const DistributionDemo = () => {
   const items = [
      { label: 'Mobile', pct: 62, color: '#FF3399' }, { label: 'Desktop', pct: 22, color: '#00CCFF' },
      { label: 'Tablet', pct: 10, color: '#CCFF00' }, { label: 'TV', pct: 6, color: '#FFDD00' },
   ];
   return (
      <div className="space-y-4">
         <div className="flex h-32 border-[4px] border-black rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_black]">
            {items.map((item, i) => (
               <div key={i} style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                  className={`flex flex-col items-center justify-center ${i < items.length - 1 ? 'border-r-[3px] border-black' : ''} hover:opacity-90 transition-opacity cursor-pointer group`}>
                  <span className="font-[1000] text-xl tracking-tighter">{item.pct}%</span>
                  <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
               </div>
            ))}
         </div>
         <div className="grid grid-cols-4 gap-3">
            {items.map((item, i) => (
               <div key={i} className="border-[3px] border-black rounded-xl p-3 text-center shadow-[3px_3px_0px_0px_black]" style={{ backgroundColor: item.color }}>
                  <div className="font-[1000] text-lg">{item.pct}%</div>
                  <div className="text-[8px] font-black uppercase tracking-widest">{item.label}</div>
               </div>
            ))}
         </div>
      </div>
   );
};

// ─── 25: LIVE CLOCK ───
export const ClockDemo = () => {
   const [time, setTime] = useState(new Date());
   useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
   const s = time.getSeconds(); const m = time.getMinutes(); const h = time.getHours() % 12;
   return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
         <div className="flex justify-center">
            <svg viewBox="0 0 120 120" className="w-44 h-44">
               <circle cx="60" cy="60" r="55" fill="white" stroke="black" strokeWidth="4" />
               <circle cx="60" cy="60" r="50" fill="white" stroke="black" strokeWidth="2" />
               {[...Array(12)].map((_, i) => {
                  const angle = (i * 30 - 90) * (Math.PI / 180);
                  return <text key={i} x={60 + 40 * Math.cos(angle)} y={60 + 40 * Math.sin(angle) + 3} textAnchor="middle" fontSize="8" fontWeight="900">{i === 0 ? 12 : i}</text>;
               })}
               <line x1="60" y1="60" x2={60 + 28 * Math.cos(((h * 30 + m * 0.5) - 90) * Math.PI / 180)} y2={60 + 28 * Math.sin(((h * 30 + m * 0.5) - 90) * Math.PI / 180)} stroke="black" strokeWidth="4" strokeLinecap="round" />
               <line x1="60" y1="60" x2={60 + 36 * Math.cos((m * 6 - 90) * Math.PI / 180)} y2={60 + 36 * Math.sin((m * 6 - 90) * Math.PI / 180)} stroke="black" strokeWidth="3" strokeLinecap="round" />
               <line x1="60" y1="60" x2={60 + 40 * Math.cos((s * 6 - 90) * Math.PI / 180)} y2={60 + 40 * Math.sin((s * 6 - 90) * Math.PI / 180)} stroke="#FF3399" strokeWidth="1.5" strokeLinecap="round" />
               <circle cx="60" cy="60" r="4" fill="#FF3399" stroke="black" strokeWidth="2" />
            </svg>
         </div>
         <div className="space-y-4">
            <div className="flex gap-2">
               {[time.getHours().toString().padStart(2, '0'), time.getMinutes().toString().padStart(2, '0'), time.getSeconds().toString().padStart(2, '0')].map((v, i) => (
                  <React.Fragment key={i}>
                     {i > 0 && <span className="font-[1000] text-3xl text-[#FF3399] animate-pulse">:</span>}
                     <div className="bg-black text-[#CCFF00] px-4 py-3 rounded-xl border-[3px] border-black font-[1000] text-3xl tracking-tighter shadow-[4px_4px_0px_0px_#CCFF00]">{v}</div>
                  </React.Fragment>
               ))}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-black/30">{time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()}</span>
         </div>
      </div>
   );
};

// ─── 26: METERS (Grommet-Inspired) ───
export const MetersDemo = () => {
   const meters = [
      { label: 'CPU Load', value: 73, color: '#FF3399' }, { label: 'Upload', value: 45, color: '#CCFF00' },
      { label: 'Render', value: 88, color: '#00CCFF' }, { label: 'Storage', value: 61, color: '#FFDD00' },
   ];
   return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {meters.map((m, i) => (
            <div key={i} className="border-[4px] border-black rounded-2xl p-4 bg-white shadow-[4px_4px_0px_0px_black] text-center space-y-3">
               <svg viewBox="0 0 100 60" className="w-full">
                  <path d="M 10 55 A 40 40 0 0 1 90 55" fill="none" stroke="#E5E7EB" strokeWidth="10" strokeLinecap="round" />
                  <path d="M 10 55 A 40 40 0 0 1 90 55" fill="none" stroke={m.color} strokeWidth="10" strokeLinecap="round"
                     strokeDasharray={`${m.value * 1.26} 126`} />
                  <text x="50" y="52" textAnchor="middle" fontSize="16" fontWeight="900" fill="black">{m.value}</text>
               </svg>
               <span className="text-[9px] font-black uppercase tracking-widest text-black/40 block">{m.label}</span>
            </div>
         ))}
      </div>
   );
};

// ─── 27: AVATARS ───
export const AvatarsDemo = () => (
   <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
         {[
            { initials: 'CB', color: 'bg-[#FF3399]' }, { initials: 'AI', color: 'bg-[#CCFF00]' },
            { initials: 'VT', color: 'bg-[#00CCFF]' }, { initials: 'YT', color: 'bg-[#FFDD00]' },
         ].map((a, i) => (
            <div key={i} className="relative">
               <div className={`w-14 h-14 ${a.color} border-[3px] border-black rounded-full flex items-center justify-center font-[1000] text-lg shadow-[3px_3px_0px_0px_black]`}>{a.initials}</div>
               {i < 2 && <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#CCFF00] border-[2px] border-black rounded-full" />}
            </div>
         ))}
      </div>
      <div className="flex -space-x-3">
         {['bg-[#FF3399]','bg-[#CCFF00]','bg-[#00CCFF]','bg-[#FFDD00]','bg-[#FFB158]'].map((c, i) => (
            <div key={i} className={`w-10 h-10 ${c} border-[3px] border-black rounded-full flex items-center justify-center font-black text-xs`} style={{ zIndex: 5 - i }}>{i + 1}</div>
         ))}
         <div className="w-10 h-10 bg-gray-200 border-[3px] border-black rounded-full flex items-center justify-center font-black text-[10px]">+4</div>
      </div>
   </div>
);

// ─── 28: PAGINATION ───
export const PaginationDemo = () => {
   const [page, setPage] = useState(3);
   return (
      <div className="space-y-4">
         <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} className="w-10 h-10 border-[3px] border-black rounded-xl font-black flex items-center justify-center hover:bg-[#CCFF00] transition-colors shadow-[2px_2px_0px_0px_black]">◀</button>
            {[1,2,3,4,5].map(p => (
               <button key={p} onClick={() => setPage(p)}
                  className={`w-10 h-10 border-[3px] border-black rounded-xl font-[1000] text-sm flex items-center justify-center transition-all ${
                     page === p ? 'bg-[#FF3399] text-white shadow-none scale-110' : 'bg-white shadow-[2px_2px_0px_0px_black] hover:bg-gray-50'
                  }`}>{p}</button>
            ))}
            <span className="font-black text-black/30 mx-1">…</span>
            <button onClick={() => setPage(12)} className={`w-10 h-10 border-[3px] border-black rounded-xl font-[1000] text-sm flex items-center justify-center transition-all ${page === 12 ? 'bg-[#FF3399] text-white' : 'bg-white shadow-[2px_2px_0px_0px_black]'}`}>12</button>
            <button onClick={() => setPage(p => Math.min(12, p + 1))} className="w-10 h-10 border-[3px] border-black rounded-xl font-black flex items-center justify-center hover:bg-[#CCFF00] transition-colors shadow-[2px_2px_0px_0px_black]">▶</button>
         </div>
         <span className="text-[10px] font-black uppercase tracking-widest text-black/30">Page {page} of 12</span>
      </div>
   );
};

// ─── 29: NAME-VALUE LIST ───
export const NameValueListDemo = () => {
   const items = [
      { key: 'Channel', value: 'ViewTUBE OS' }, { key: 'Subscribers', value: '9,340' },
      { key: 'Total Videos', value: '127' }, { key: 'Created', value: 'Jan 2024' },
      { key: 'Niche', value: 'Creator Tools' }, { key: 'Status', value: 'Active', badge: true },
   ];
   return (
      <div className="border-[4px] border-black rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_black] divide-y-[2px] divide-black/10">
         {items.map((item, i) => (
            <div key={i} className="flex justify-between p-4 bg-white hover:bg-gray-50 transition-colors">
               <span className="text-[10px] font-black uppercase tracking-widest text-black/40">{item.key}</span>
               {item.badge ? (
                  <span className="bg-[#CCFF00] px-3 py-0.5 border-[2px] border-black rounded-lg text-[10px] font-black uppercase">{item.value}</span>
               ) : (
                  <span className="font-[1000] text-sm">{item.value}</span>
               )}
            </div>
         ))}
      </div>
   );
};

// ─── 30: STEP INDICATOR / WIZARD ───
export const StepIndicatorDemo = () => {
   const [step, setStep] = useState(2);
   const steps = ['Upload', 'Metadata', 'Thumbnail', 'Schedule', 'Publish'];
   return (
      <div className="space-y-6">
         <div className="flex items-center">
            {steps.map((s, i) => (
               <React.Fragment key={i}>
                  <button onClick={() => setStep(i)}
                     className={`w-10 h-10 rounded-full border-[3px] border-black font-[1000] text-sm flex items-center justify-center transition-all ${
                        i < step ? 'bg-[#CCFF00] text-black' : i === step ? 'bg-[#FF3399] text-white scale-110' : 'bg-gray-100 text-black/30'
                     }`}>{i < step ? '✓' : i + 1}</button>
                  {i < steps.length - 1 && <div className={`flex-1 h-[3px] mx-1 ${i < step ? 'bg-[#CCFF00]' : 'bg-black/10'}`} />}
               </React.Fragment>
            ))}
         </div>
         <div className="flex justify-between">
            {steps.map((s, i) => (
               <span key={i} className={`text-[8px] font-black uppercase tracking-widest ${i === step ? 'text-[#FF3399]' : 'text-black/30'}`}>{s}</span>
            ))}
         </div>
      </div>
   );
};

// ─── 31: ADVANCED SLIDERS ───
export const AdvancedSlidersDemo = () => {
   const [velocity, setVelocity] = useState(65);
   const [storage, setStorage] = useState(30);
   return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="bg-white border-[4px] border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_black] space-y-6">
            <div className="flex justify-between font-[1000] text-xl uppercase tracking-tighter">
               <span>Velocity</span><span className="text-[#FF3399]">{velocity}%</span>
            </div>
            <input type="range" min={0} max={100} value={velocity} onChange={e => setVelocity(+e.target.value)}
               className="w-full h-3 appearance-none rounded-full border-[3px] border-black cursor-pointer" style={{ accentColor: '#FF3399' }} />
            <div className="space-y-2">
               <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-black/40">
                  <span>Storage</span><span>{storage}/100 GB</span>
               </div>
               <div className="h-6 bg-gray-200 border-[3px] border-black rounded-full overflow-hidden">
                  <div className="h-full bg-[#00CCFF] transition-all duration-300 rounded-full" style={{ width: `${storage}%` }} />
               </div>
               <input type="range" min={0} max={100} value={storage} onChange={e => setStorage(+e.target.value)}
                  className="w-full h-2 appearance-none rounded-full cursor-pointer" style={{ accentColor: '#00CCFF' }} />
            </div>
         </div>
         <div className="bg-black border-[4px] border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_#CCFF00] flex items-center justify-center">
            <div className="relative w-40 h-40 flex items-center justify-center">
               <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#333" strokeWidth="10" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#CCFF00" strokeWidth="10" strokeLinecap="round"
                     strokeDasharray={`${2 * Math.PI * 40}`} strokeDashoffset={`${2 * Math.PI * 40 * (1 - velocity / 100)}`} className="transition-all duration-500" />
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <span className="text-3xl font-[1000] tracking-tighter">{velocity}%</span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-[#CCFF00]">System Load</span>
               </div>
            </div>
         </div>
      </div>
   );
};

// ─── 32: DROPDOWN ACTION MENU ───
export const DropdownMenuDemo = () => {
   const [open, setOpen] = useState(false);
   return (
      <div className="relative max-w-sm w-full self-start h-fit">
         <button onClick={() => setOpen(!open)}
            className="w-full bg-[#CCFF00] border-[4px] border-black rounded-2xl p-4 font-[1000] uppercase text-lg shadow-[6px_6px_0px_0px_black] flex justify-between items-center hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_black] transition-all">
            Select Protocol <span className={`transition-transform inline-block ${open ? 'rotate-180' : ''}`}>▼</span>
         </button>
         {open && (
            <div className="absolute top-full left-0 mt-3 w-full bg-white border-[4px] border-black rounded-2xl shadow-[12px_12px_0px_0px_black] overflow-hidden z-20">
               {['Launch Engine', 'Analyze Data', 'Export Report', 'Settings'].map((o, i) => (
                  <button key={o} onClick={() => setOpen(false)}
                     className={`w-full p-4 text-left font-black uppercase text-sm hover:bg-[#FF3399] hover:text-white transition-colors ${i < 3 ? 'border-b-[3px] border-black/10' : ''}`}>{o}</button>
               ))}
            </div>
         )}
      </div>
   );
};

// ─── 33: STACKED AREA CHART ───
export const AreaChartDemo = () => {
   const d1 = [20, 35, 30, 45, 40, 55, 50, 60];
   const d2 = [10, 20, 25, 20, 30, 25, 35, 30];
   const w = 320; const h = 140; const pad = 40;
   const xStep = (w - pad) / (d1.length - 1);
   const scale = (v: number) => h - 10 - (v / 100) * (h - 20);
   const area1 = d1.map((v, i) => `${pad + i * xStep},${scale(v + d2[i])}`).join(' ');
   const area2 = d1.map((v, i) => `${pad + i * xStep},${scale(v)}`).join(' ');
   const base = `${pad + (d1.length - 1) * xStep},${h - 10} ${pad},${h - 10}`;
   return (
      <div className="border-[4px] border-black rounded-2xl bg-white shadow-[8px_8px_0px_0px_black] overflow-hidden">
         <div className="bg-[#FF3399] border-b-[4px] border-black px-4 py-3 flex justify-between items-center">
            <span className="font-[1000] uppercase tracking-tighter text-white">Stacked Traffic</span>
            <div className="flex gap-3">
               <span className="flex items-center gap-1 text-[9px] font-black uppercase text-white/80"><span className="w-3 h-2 bg-[#CCFF00] rounded" />Organic</span>
               <span className="flex items-center gap-1 text-[9px] font-black uppercase text-white/80"><span className="w-3 h-2 bg-[#00CCFF] rounded" />Search</span>
            </div>
         </div>
         <div className="p-6">
            <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
               {[0, 25, 50, 75].map(v => <line key={v} x1={pad} y1={scale(v)} x2={w} y2={scale(v)} stroke="#E5E7EB" strokeWidth="1" />)}
               <polygon points={`${area1} ${base}`} fill="rgba(0,204,255,0.3)" stroke="none" />
               <polygon points={`${area2} ${base}`} fill="rgba(204,255,0,0.4)" stroke="none" />
               <polyline points={area1} fill="none" stroke="#00CCFF" strokeWidth="2.5" />
               <polyline points={area2} fill="none" stroke="#CCFF00" strokeWidth="2.5" />
               {['W1','W2','W3','W4','W5','W6','W7','W8'].map((l, i) => (
                  <text key={l} x={pad + i * xStep} y={h - 1} textAnchor="middle" fontSize="7" fontWeight="900" fill="#999">{l}</text>
               ))}
            </svg>
         </div>
      </div>
   );
};

// ============================================================================
// MASTER COMPONENT: EXPORTS ALL SECTIONS
// ============================================================================
export const NativeUIKit = () => (
   <div className="space-y-2">
      <SectionLabel label="00 — Box System" />
      <BoxSystemDemo />
      <SectionLabel label="01 — Buttons (All 6 Colors + Variants)" />
      <ButtonsDemo />
      <SectionLabel label="02 — Style Chips & Filters" />
      <ChipsDemo />
      <SectionLabel label="03 — Toggles · Checkboxes · Radios" />
      <TogglesDemo />
      <SectionLabel label="04 — Text Inputs & Form Fields" />
      <InputsDemo />
      <SectionLabel label="05 — Sliders" />
      <SlidersDemo />
      <SectionLabel label="06 — Progress Bars & Rings" />
      <ProgressBarsDemo />
      <SectionLabel label="07 — KPI Stat Cards" />
      <StatCardsDemo />
      <SectionLabel label="08 — Tables with Expandable Rows" />
      <TableDemo />
      <SectionLabel label="09 — Calendar" />
      <CalendarDemo />
      <SectionLabel label="10 — Skeletons & Loaders" />
      <LoadersDemo />
      <SectionLabel label="11 — Tabs & Pills" />
      <TabsPillsDemo />
      <SectionLabel label="12 — Badges, Dividers & Copy" />
      <BadgesDemo />
      <SectionLabel label="13 — Ratings & Toasts" />
      <RatingsToastsDemo />
      <SectionLabel label="14 — Hover Cards" />
      <HoverCardsDemo />
      <SectionLabel label="15 — Animations" />
      <AnimationsDemo />
      <SectionLabel label="16 — Video Cards" />
      <VideoCardsDemo />
      <SectionLabel label="17 — Modal Dialog" />
      <ModalDemo />
      <SectionLabel label="18 — Collapsible Tree" />
      <TreeDemo />
      <SectionLabel label="19 — SVG Bar Chart" />
      <BarChartDemo />
      <SectionLabel label="20 — SVG Line Chart (Multi-Series)" />
      <LineChartDemo />
      <SectionLabel label="21 — Donut Chart (Interactive)" />
      <DonutChartDemo />
      <SectionLabel label="22 — Radar / Spider Chart" />
      <RadarChartDemo />
      <SectionLabel label="23 — Scatter Plot (Bubble)" />
      <ScatterPlotDemo />
      <SectionLabel label="24 — Distribution Blocks" />
      <DistributionDemo />
      <SectionLabel label="25 — Live Clock (Analog + Digital)" />
      <ClockDemo />
      <SectionLabel label="26 — Gauge Meters" />
      <MetersDemo />
      <SectionLabel label="27 — Avatars & Avatar Groups" />
      <AvatarsDemo />
      <SectionLabel label="28 — Pagination" />
      <PaginationDemo />
      <SectionLabel label="29 — Name-Value List" />
      <NameValueListDemo />
      <SectionLabel label="30 — Step Indicator / Wizard" />
      <StepIndicatorDemo />
      <SectionLabel label="31 — Advanced Sliders & Ring Gauges" />
      <AdvancedSlidersDemo />
      <SectionLabel label="32 — Dropdown Action Menu" />
      <DropdownMenuDemo />
      <SectionLabel label="33 — Stacked Area Chart" />
      <AreaChartDemo />
   </div>
);
