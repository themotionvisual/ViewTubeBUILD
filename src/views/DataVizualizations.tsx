import React, { useMemo } from 'react';
import { getMasterRows } from '../services/analyticsSelectors';

// --- HELPER COMPONENT: NEO-BRUTALIST CHART SHELL ---
const ChartContainer = ({ title, headerColor, children }: { title: string, headerColor: string, children: React.ReactNode }) => (
  <div className="bg-white border-[4px] border-black shadow-[8px_8px_0px_0px_black] flex flex-col overflow-hidden mb-8">
    <div className={`${headerColor} border-b-[4px] border-black p-4`}>
      <h2 className="font-black uppercase text-xl text-black tracking-wide">{title}</h2>
    </div>
    <div className="p-6 relative min-h-[400px] flex flex-col items-center justify-center">
      {children}
    </div>
  </div>
);

// --- CUSTOM SVG CHARTS TO REPLACE GOOGLE CHARTS ---

const CustomScatterPlot = ({ data, xLabel, yLabel, formatX = (v: number) => String(v), formatY = (v: number) => String(v), color = "#FF3399", bubbleMode = false }: any) => {
  if (!data || data.length === 0) return <div className="font-black text-black/50">NO DATA SYNCHED</div>;
  
  const maxX = Math.max(...data.map((d: any) => d.x)) || 1;
  const maxY = Math.max(...data.map((d: any) => d.y)) || 1;
  const maxZ = Math.max(...data.map((d: any) => d.z || 0)) || 1;

  // Grid lines
  const ticks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="w-full h-full flex flex-col pt-4">
      <div className="flex-1 relative w-full h-[300px]">
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="overflow-visible">
          {/* Grid */}
          {ticks.map(t => (
            <React.Fragment key={t}>
              <line x1="0" y1={t * 100} x2="100" y2={t * 100} stroke="#e5e7eb" strokeWidth="0.5" />
              <line x1={t * 100} y1="0" x2={t * 100} y2="100" stroke="#e5e7eb" strokeWidth="0.5" />
            </React.Fragment>
          ))}
          
          {/* Axes */}
          <line x1="0" y1="100" x2="100" y2="100" stroke="black" strokeWidth="1" />
          <line x1="0" y1="0" x2="0" y2="100" stroke="black" strokeWidth="1" />

          {/* Points */}
          {data.map((pt: any, i: number) => {
             const cx = (pt.x / maxX) * 100;
             const cy = 100 - ((pt.y / maxY) * 100);
             const r = bubbleMode && pt.z ? Math.max(2, (pt.z / maxZ) * 8) : 3;
             return (
               <g key={i} className="group">
                 <circle 
                   cx={cx} 
                   cy={cy} 
                   r={r} 
                   fill={pt.color || color}
                   stroke="black"
                   strokeWidth="0.5"
                   className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                 />
                 {/* Tooltip text (simplified naive SVG tooltip) */}
                 <text 
                   x={cx} 
                   y={cy - r - 2} 
                   textAnchor="middle" 
                   fontSize="3" 
                   fontWeight="bold" 
                   className="opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"
                 >
                   {pt.label}
                 </text>
               </g>
             );
          })}
        </svg>
        
        {/* Y Axis Labels (HTML for better font rendering) */}
        <div className="absolute top-0 -left-12 bottom-0 w-10 flex flex-col justify-between items-end pb-4 font-bold text-[10px]">
          <span>{formatY(maxY)}</span>
          <span>{formatY(maxY / 2)}</span>
          <span>0</span>
        </div>
      </div>
      
      {/* X Axis Labels */}
      <div className="h-8 flex justify-between items-center mt-2 pl-2 font-bold text-[10px]">
        <span>0</span>
        <span>{formatX(maxX / 2)}</span>
        <span>{formatX(maxX)}</span>
      </div>
      
      {/* Axis Titles */}
      <div className="flex justify-between items-center mt-2 text-xs font-black uppercase text-black/60">
        <div>^ {yLabel}</div>
        <div>{xLabel} &gt;</div>
      </div>
    </div>
  );
};

const CustomBarChart = ({ data, colorMap }: any) => {
  if (!data || data.length === 0) return <div className="font-black text-black/50">NO DATA SYNCHED</div>;
  const maxVal = Math.max(...data.map((d: any) => d.value)) || 1;

  return (
    <div className="w-full flex flex-col gap-4">
      {data.map((d: any, i: number) => {
        const width = (d.value / maxVal) * 100;
        const color = colorMap[i % colorMap.length];
        return (
          <div key={i} className="flex flex-col gap-1">
            <div className="flex justify-between text-xs font-black uppercase">
              <span>{d.label}</span>
              <span>{d.value.toLocaleString()}</span>
            </div>
            <div className="w-full h-8 bg-neutral-200 border-[2px] border-black rounded-lg overflow-hidden">
              <div 
                className="h-full border-r-[2px] border-black transition-all duration-1000 ease-out" 
                style={{ width: `${width}%`, backgroundColor: color }}
              />
            </div>
          </div>
        )
      })}
    </div>
  );
};

export default function DataVisualizations() {
  // Pull from Nexus Cache
  const data = useMemo(() => {
    try {
      const rows = getMasterRows('lifetime', 'api');
      return rows.map((row) => {
        const viewsCell = row.metrics.views;
        const revenueCell = row.metrics.revenue;
        const ctrCell = row.metrics.ctr;
        const avpCell = row.metrics.avp;
        const impressionsCell = row.metrics.impressions;

        const views = viewsCell.status === 'unavailable' || viewsCell.value === null ? 0 : viewsCell.value;
        const revenue =
          revenueCell.status === 'unavailable' || revenueCell.value === null
            ? 0
            : revenueCell.value;
        const ctr =
          ctrCell.status === 'unavailable' || ctrCell.value === null ? 0 : ctrCell.value;
        const adjustedAVP =
          avpCell.status === 'unavailable' || avpCell.value === null ? 0 : avpCell.value;
        const impressions =
          impressionsCell.status === 'unavailable' || impressionsCell.value === null
            ? 0
            : impressionsCell.value;

        return {
          title: row.title,
          views,
          revenue,
          ctr,
          adjustedAVP,
          impressions,
          archetype: row.format === 'shorts' ? "Shorts" : "Longform"
        }
      })
    } catch (e) {
      return []
    }
  }, [])

  // Use real data if available, else fallback to isolated demo-only mock rows.
  const finalVideos = data.length > 0 ? data : [
    { title: "Sample History Video A", views: 450000, revenue: 1200, ctr: 8.5, adjustedAVP: 65, impressions: 5000000, archetype: "Documentary" },
    { title: "Sample History Video B", views: 800000, revenue: 3400, ctr: 11.2, adjustedAVP: 82, impressions: 7100000, archetype: "Documentary" },
    { title: "Sample History Video C", views: 150000, revenue: 400, ctr: 5.1, adjustedAVP: 45, impressions: 2900000, archetype: "Explainer" },
  ];

  // Derive custom chart structures
  const bubblePoints = finalVideos.map(v => ({
    x: v.ctr,
    y: Math.min(v.adjustedAVP, 200),
    z: v.views,
    color: v.archetype === "Shorts" ? "#00CCFF" : "#FFDD00",
    label: v.title
  }));

  const scatterPoints = finalVideos.map(v => ({
    x: v.ctr,
    y: v.impressions,
    label: v.title
  }));

  const deviceData = [
    { label: "Mobile", value: 65 },
    { label: "Desktop (TV)", value: 25 },
    { label: "Tablet", value: 10 }
  ];

  const geoData = [
    { label: "United States", value: 1500000 },
    { label: "United Kingdom", value: 800000 },
    { label: "France", value: 450000 },
    { label: "Germany", value: 300000 }
  ];

  // Derive summary metrics from finalVideos
  const totalRevenue = finalVideos.reduce((acc, v) => acc + (v.revenue || 0), 0);
  const totalViews = finalVideos.reduce((acc, v) => acc + (v.views || 0), 0);
  const avgRetention = finalVideos.length ? finalVideos.reduce((acc, v) => acc + (v.adjustedAVP || 0), 0) / finalVideos.length : 0;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-[#f4f4f0] min-h-screen">
      
      {/* TOOL HEADER */}
      <div className="mb-12">
        <h1 className="text-4xl font-black uppercase italic text-black drop-shadow-[2px_2px_0px_rgba(0,204,255,1)]">
          Data Visualizations
        </h1>
        <p className="text-lg font-bold text-gray-700 uppercase tracking-widest mt-2">Master Graph Catalog</p>
      </div>

      {/* CHART 1: TOP PERFORMERS TRIO (Custom UI) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: "Total Revenue", val: `$${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
          { label: "Total Views", val: totalViews >= 1000000 ? `${(totalViews / 1000000).toFixed(1)}M` : totalViews.toLocaleString() },
          { label: "Avg Retention", val: `${avgRetention.toFixed(0)}%` }
        ].map((metric) => (
          <div key={metric.label} className="bg-[#CCFF00] border-[4px] border-black shadow-[6px_6px_0px_0px_black] p-6 text-center">
            <h3 className="font-black uppercase text-sm tracking-widest">{metric.label}</h3>
            <p className="font-black text-5xl mt-4 drop-shadow-[2px_2px_0px_white]">
              {metric.val}
            </p>
          </div>
        ))}
      </div>

      {/* CHART 2: VIDEO VALUE MATRIX (The Honesty Scale) */}
      <ChartContainer title="Video Value Matrix" headerColor="bg-[#FF3399]">
        <CustomScatterPlot 
          data={bubblePoints} 
          bubbleMode={true}
          xLabel="Click-Through Rate (%)"
          yLabel="Retention (AVP %)"
          formatX={(v: number) => `${v.toFixed(1)}%`}
          formatY={(v: number) => `${v.toFixed(0)}%`}
        />
        <div className="absolute top-4 right-4 flex gap-4 text-[10px] font-black uppercase">
           <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#FFDD00] border-2 border-black"/> Longform</div>
           <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#00CCFF] border-2 border-black"/> Shorts</div>
        </div>
      </ChartContainer>

      {/* CHART 4: ALGORITHM TRIGGER */}
      <ChartContainer title="Algorithm Trigger" headerColor="bg-[#00CCFF]">
        <CustomScatterPlot 
          data={scatterPoints}
          color="#FF3399"
          xLabel="Click-Through Rate (%)"
          yLabel="Total Impressions"
          formatX={(v: number) => `${v.toFixed(1)}%`}
          formatY={(v: number) => `${(v/1000000).toFixed(1)}M`}
        />
      </ChartContainer>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* CHART 5: DEVICE IMMERSION */}
        <ChartContainer title="Device Immersion" headerColor="bg-[#FFB158]">
          <CustomBarChart 
            data={deviceData} 
            colorMap={['#FF3399', '#00CCFF', '#CCFF00']} 
          />
        </ChartContainer>

        {/* CHART 7: GLOBAL FOOTPRINT */}
        <ChartContainer title="Global Footprint" headerColor="bg-[#B14AED]">
          <CustomBarChart 
            data={geoData} 
            colorMap={['#00CCFF', '#CCFF00', '#FFDD00', '#FFB158', '#FF3399']} 
          />
        </ChartContainer>
      </div>

    </div>
  );
}
