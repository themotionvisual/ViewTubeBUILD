import React from 'react';
import { BarChart3, TrendingUp, PieChart, Info, Blocks } from 'lucide-react';
import { useCanonicalAnalytics } from '../referenceStudio/useCanonicalAnalytics';
import { CHART_CARD_DEFINITIONS, ChartRendererSurface } from '../referenceStudio/chartSystem';
import { Toolbox } from '../../components/Toolbox';

const AnalyticsHubBench: React.FC = () => {
  const analytics = useCanonicalAnalytics('28d');
  const { summary } = analytics;

  // Select a mix of important charts for the hub
  const dashboardCharts = [
    CHART_CARD_DEFINITIONS.find(c => c.key === 'views-trend'),
    CHART_CARD_DEFINITIONS.find(c => c.key === 'watch-hours-trend'),
    CHART_CARD_DEFINITIONS.find(c => c.key === 'subscriber-growth'),
    CHART_CARD_DEFINITIONS.find(c => c.key === 'revenue-distribution'),
    CHART_CARD_DEFINITIONS.find(c => c.key === 'performance-matrix'),
  ].filter(Boolean) as typeof CHART_CARD_DEFINITIONS;

  return (
    <div className="space-y-12 pb-24">
      {/* Metric Summary Header */}
      <Toolbox
        variant="scaffold"
        title="CANONICAL ANALYTICS HUB"
        subtitle="Consolidated 28d performance data across all metric vectors"
        icon={<TrendingUp size={40} />}
        headerColor="bg-[#FFE357]"
        iconBoxColor="bg-[#CCFF00]"
        collapsible
        indicator="symbols"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Views', value: summary.totals.views, color: 'bg-[#00CCFF]', icon: <TrendingUp size={24} /> },
            { label: 'Watch Hrs', value: summary.totals.watchHours, color: 'bg-[#CCFF00]', icon: <BarChart3 size={24} /> },
            { label: 'Subs Gained', value: summary.totals.subscribersGained, color: 'bg-[#FF7497]', icon: <PieChart size={24} /> },
            { label: 'Revenue', value: summary.totals.revenue, color: 'bg-[#FFB158]', icon: <Blocks size={24} />, isCurrency: true }
          ].map((stat, i) => (
            <div key={i} className="bg-white border-[4px] border-black rounded-[2rem] p-6 shadow-[8px_8px_0px_0px_black] flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] font-black uppercase opacity-40 tracking-widest">{stat.label}</p>
                <div className={`p-2 rounded-xl border-[2px] border-black ${stat.color}`}>{stat.icon}</div>
              </div>
              <p className="text-4xl font-[1000] tracking-tighter italic">
                {stat.isCurrency ? `$${Number(stat.value).toLocaleString()}` : Number(stat.value).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </Toolbox>

      {/* Primary Analytics Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {dashboardCharts.map((card, index) => (
          <Toolbox
            key={card.key}
            variant="sub"
            title={card.title}
            subtitle={card.note}
            headerColor={index % 2 === 0 ? "bg-[#24D3FF]" : "bg-[#B14AED]"}
            icon={<BarChart3 size={20} />}
            outerClassName={card.size === 'full' ? 'xl:col-span-12' : card.size === 'half' ? 'xl:col-span-6' : 'xl:col-span-4'}
          >
            <div className="h-[350px] border-[3px] border-black rounded-2xl bg-white p-4">
              <ChartRendererSurface card={card} analytics={analytics} />
            </div>
          </Toolbox>
        ))}
      </div>

      {/* Engineering Footer */}
      <div className="bg-black text-white p-6 rounded-[2rem] border-[4px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,0.1)] flex items-center gap-4">
        <div className="p-3 bg-red-500 rounded-xl border-[2px] border-white">
          <Info size={20} />
        </div>
        <p className="text-xs font-bold leading-relaxed opacity-80">
          This dashboard uses hardware-isolated rendering to prevent Recharts/SVG style leakage. All data points are bound to the 28d canonical analytics hook.
        </p>
      </div>
    </div>
  );
};

export default AnalyticsHubBench;
