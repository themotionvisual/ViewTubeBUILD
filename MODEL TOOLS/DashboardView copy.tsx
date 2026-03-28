import React, { useEffect, useState } from 'react';
import DashboardBox from '@/components/DashboardBox';
import { LayoutDashboard } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const DashboardView: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);

  useEffect(() => {
    const loadData = () => {
      const cacheRaw = localStorage.getItem('yt_analytics_cache');
      if (cacheRaw) {
        try {
          const cache = JSON.parse(cacheRaw);
          if (cache.analytics && cache.analytics.rows && cache.analytics.columnHeaders) {
            const headers = cache.analytics.columnHeaders.map((h: any) => h.name);
            const videoMap = new Map();
            if (cache.videos) {
              cache.videos.forEach((v: any) => videoMap.set(v.videoId, v.title));
            }
            
            const data = cache.analytics.rows.map((row: any[]) => {
              const obj: any = {};
              headers.forEach((h: string, i: number) => {
                obj[h] = row[i];
              });
              
              if (obj["video"]) {
                const videoId = obj["video"];
                obj["title"] = videoMap.get(videoId) || videoId;
                // Truncate title for chart labels
                obj["shortTitle"] = obj["title"].length > 20 ? obj["title"].substring(0, 20) + '...' : obj["title"];
              }
              return obj;
            });
            setAnalyticsData(data);
          }
        } catch (e) {
          console.error("Failed to parse yt_analytics_cache", e);
        }
      }
    };

    loadData();
    window.addEventListener('yt_analytics_synced', loadData);
    return () => window.removeEventListener('yt_analytics_synced', loadData);
  }, []);

  const renderChart = (title: string, dataKey: string, color: string, data: any[]) => {
    // Sort data by the specific metric and take top 5
    const sortedData = [...data].sort((a, b) => (b[dataKey] || 0) - (a[dataKey] || 0)).slice(0, 5);
    
    return (
      <div className="bg-white p-4 border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl">
        <h4 className="font-bold mb-2">{title}</h4>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={sortedData} layout="vertical" margin={{ left: 50 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" />
            <YAxis dataKey="shortTitle" type="category" width={100} tick={{fontSize: 10}} />
            <Tooltip formatter={(value: number) => [Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 }), title.split(':')[1].trim()]} />
            <Bar dataKey={dataKey} fill={color} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      <div className="flex justify-between items-end border-b-4 border-black pb-4">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter text-black">Performance Command Center</h1>
          <p className="text-xl font-bold text-gray-600 mt-1">Live Data Stream & Growth Trajectory Analysis</p>
        </div>
        <div className="bg-[#00CCFF] text-black p-3 rounded-xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform rotate-2 flex items-center justify-center">
          <LayoutDashboard size={32} />
        </div>
      </div>
      
      {/* 2x2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardBox title="Key Trends" color="bg-[#ff7497]">
          <p>Analysis of key trends based on top performing videos.</p>
        </DashboardBox>
        <DashboardBox title="Winning Format" color="bg-[#CCFF00]">
          <p>Identify winning formats by comparing view duration and CTR.</p>
        </DashboardBox>
        <DashboardBox title="Weaknesses" color="bg-[#FF7497]">
          <p>Identify areas for improvement in underperforming videos.</p>
        </DashboardBox>
        <DashboardBox title="Action Plan" color="bg-[#FFDD00]">
          <p>Actionable steps to improve channel performance.</p>
        </DashboardBox>
      </div>

      {/* 2x3 Grid of Charts */}
      {analyticsData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderChart("Top 5: Views", "views", "#00CCFF", analyticsData)}
          {renderChart("Top 5: Watch Time (Mins)", "estimatedMinutesWatched", "#FFDD00", analyticsData)}
          {renderChart("Top 5: CTR (%)", "clickThroughRate", "#FF00FF", analyticsData)}
          {renderChart("Top 5: Revenue (USD)", "estimatedRevenue", "#CCFF00", analyticsData)}
          {renderChart("Top 5: Subscribers Gained", "subscribersGained", "#00FFCC", analyticsData)}
          {renderChart("Top 5: AVD (Secs)", "averageViewDuration", "#FF7497", analyticsData)}
        </div>
      ) : (
        <div className="text-center p-8 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300">
          <p className="text-gray-500 font-bold">No YouTube Analytics data available. Please sync your channel in Settings.</p>
        </div>
      )}
    </div>
  );
};

export default DashboardView;
