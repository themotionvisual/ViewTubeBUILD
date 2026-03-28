import React from 'react';
import { useBrain } from '../context/GlobalDataContext';
import { Link } from 'react-router-dom';
import { youtubeService } from '../services/youtubeService';
import { CustomIcon } from '../components/CustomIcon';
import { MobileLookChart } from '../components/MobileLookChart';
import { TrendingUp, Zap, type LucideIcon } from 'lucide-react';

const DashboardMetric = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <div className="pop-box h-28 flex flex-col justify-between p-5 bg-white border-[4px] border-black rounded-3xl shadow-[6px_6px_0px_0px_black] hover:translate-y-[-4px] transition-transform">
    <span className="text-[10px] font-black uppercase text-black/20 tracking-widest leading-none">{label}</span>
    <span className={`text-3xl font-[1000] uppercase tracking-tighter ${color}`}>{value}</span>
  </div>
);

const HubCard = ({
  title,
  path,
  color,
  status,
  icon,
  subtitle,
}: {
  title: string;
  path: string;
  color: string;
  status: string;
  icon: string;
  subtitle: string;
}) => (
  <Link to={path} className="pop-box flex flex-col h-full hover:scale-[1.02] transition-transform group border-[4px] border-black rounded-[28px] overflow-hidden shadow-[12px_12px_0px_0px_black]">
    <div className={`pop-header ${color} h-16 border-b-[4px] border-black px-8`}>
      <h4 className="text-sm font-[1000] uppercase text-black tracking-tighter">{title}</h4>
      <div className="pop-module-id bg-black text-white px-4 py-1.5 text-[10px] font-black border-none shadow-none">{status}</div>
    </div>
    <div className="p-10 flex items-center gap-8 bg-white flex-1">
      <div className="p-4 bg-white border-[3px] border-black rounded-3xl shadow-[6px_6px_0px_0px_black] group-hover:bg-gray-50 transition-colors w-24 h-24 flex items-center justify-center">
        <CustomIcon name={icon} size={48} animate={false} />
      </div>
      <div className="flex flex-col">
        <span className="text-[11px] font-black uppercase text-black/30 tracking-[0.2em]">{subtitle}</span>
        <span className="text-xl font-[1000] uppercase text-black mt-2 tracking-tighter leading-none">Ready for Sync</span>
      </div>
    </div>
  </Link>
);

const ToolboxContainer = ({
  title,
  icon: Icon,
  headerColor,
  children,
}: {
  title: string;
  icon: LucideIcon;
  headerColor: string;
  children: React.ReactNode;
}) => (
  <div className="pop-box bg-white border-[6px] border-black rounded-[32px] overflow-hidden shadow-[10px_10px_0px_0px_black] h-full">
    <div className={`${headerColor} border-b-[6px] border-black px-6 py-4 flex items-center justify-between toolbox-drag-handle cursor-grab`}>
      <h4 className="text-lg font-[1000] uppercase tracking-tight text-black">{title}</h4>
      <Icon size={18} className="text-black" />
    </div>
    <div className="h-[calc(100%-70px)]">{children}</div>
  </div>
);

const formatHumanNumber = (value: unknown): string => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return '---';
  return Math.round(parsed).toLocaleString();
};

const formatDurationLabel = (seconds: number | null): string => {
  if (!seconds || !Number.isFinite(seconds) || seconds <= 0) return '---';
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const Dashboard: React.FC = () => {
  const { brain, authState, setAuthState, login } = useBrain();
  const [channelData, setChannelData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [dailyData, setDailyData] = React.useState<any[]>([]);
  const [cacheSummary, setCacheSummary] = React.useState<{
    totalViews: number | null;
    subscribers: number | null;
    avgViewDurationSec: number | null;
    viralTrendLabel: string;
  }>({
    totalViews: null,
    subscribers: null,
    avgViewDurationSec: null,
    viralTrendLabel: '---'
  });

  const recentDailyData = React.useMemo(() => dailyData.slice(-14), [dailyData]);

  const loadCacheData = React.useCallback(() => {
    try {
      const cacheRaw = localStorage.getItem('yt_analytics_cache');
      if (!cacheRaw) return;

      const cache = JSON.parse(cacheRaw);
      if (cache.dailyMetrics?.columnHeaders && Array.isArray(cache.dailyMetrics?.rows)) {
        const headers = cache.dailyMetrics.columnHeaders.map((h: any) => h.name);
        const dayIdx = headers.indexOf('day');
        const viewsIdx = headers.indexOf('views');
        if (dayIdx !== -1 && viewsIdx !== -1) {
          const formatted = cache.dailyMetrics.rows.map((row: any[]) => ({
            Date: row[dayIdx],
            Views: Number(row[viewsIdx]) || 0,
          }));
          setDailyData((prev) => (JSON.stringify(prev) === JSON.stringify(formatted) ? prev : formatted));
        }
      }

      const profileStats = cache.profile?.statistics || {};
      const totalViews = Number(profileStats.viewCount ?? cache.profile?.totalViews ?? authState.totalViews ?? 0);
      const subscribers = Number(profileStats.subscriberCount ?? cache.profile?.subscriberCount ?? authState.subscriberCount ?? 0);

      let avgViewDurationSec: number | null = null;
      if (cache.channelAnalytics?.columnHeaders && Array.isArray(cache.channelAnalytics?.rows)) {
        const channelHeaders = cache.channelAnalytics.columnHeaders.map((h: any) => h.name);
        const avdIdx = channelHeaders.indexOf('averageViewDuration');
        if (avdIdx !== -1) {
          const avdValues = cache.channelAnalytics.rows
            .map((row: any[]) => Number(row[avdIdx]) || 0)
            .filter((v: number) => v > 0);
          if (avdValues.length > 0) {
            avgViewDurationSec = avdValues.reduce((sum: number, value: number) => sum + value, 0) / avdValues.length;
          }
        }
      }

      let viralTrendLabel = '---';
      if (cache.dailyMetrics?.columnHeaders && Array.isArray(cache.dailyMetrics?.rows)) {
        const dailyHeaders = cache.dailyMetrics.columnHeaders.map((h: any) => h.name);
        const viewsIdx = dailyHeaders.indexOf('views');
        if (viewsIdx !== -1 && cache.dailyMetrics.rows.length >= 14) {
          const viewRows = cache.dailyMetrics.rows.map((row: any[]) => Number(row[viewsIdx]) || 0);
          const last7 = viewRows.slice(-7).reduce((a: number, b: number) => a + b, 0);
          const prev7 = viewRows.slice(-14, -7).reduce((a: number, b: number) => a + b, 0);
          if (prev7 > 0) {
            const pct = ((last7 - prev7) / prev7) * 100;
            viralTrendLabel = `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`;
          } else if (last7 > 0) {
            viralTrendLabel = '+100.0%';
          }
        }
      }

      setCacheSummary((prev) => {
        const next = {
          totalViews: Number.isFinite(totalViews) && totalViews > 0 ? totalViews : prev.totalViews,
          subscribers: Number.isFinite(subscribers) && subscribers > 0 ? subscribers : prev.subscribers,
          avgViewDurationSec,
          viralTrendLabel
        };
        return JSON.stringify(prev) === JSON.stringify(next) ? prev : next;
      });
    } catch (e) {
      console.warn('Failed to load dashboard cache data', e);
    }
  }, [authState.subscriberCount, authState.totalViews]);

  React.useEffect(() => {
    loadCacheData();
    window.addEventListener('yt_analytics_synced', loadCacheData);
    return () => window.removeEventListener('yt_analytics_synced', loadCacheData);
  }, [loadCacheData]);

  React.useEffect(() => {
    if (!authState.isAuthenticated) return;

    setIsLoading(true);
    youtubeService
      .getChannelOverview()
      .then((data) => {
        setChannelData(data);

        if (
          authState.channelName !== data.title ||
          authState.channelThumbnail !== data.thumbnail ||
          authState.subscriberCount !== data.stats.subscriberCount ||
          authState.totalViews !== data.stats.viewCount
        ) {
          setAuthState({
            ...authState,
            channelName: data.title,
            channelThumbnail: data.thumbnail,
            subscriberCount: data.stats.subscriberCount,
            totalViews: data.stats.viewCount,
          });
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState.isAuthenticated]);

  const totalReachValue = channelData?.stats?.viewCount ?? cacheSummary.totalViews ?? authState.totalViews;
  const loyalSubsValue = channelData?.stats?.subscriberCount ?? cacheSummary.subscribers ?? authState.subscriberCount;

  const stats = [
    { label: 'Total Reach', value: formatHumanNumber(totalReachValue), color: 'text-[#00CCFF]' },
    { label: 'Retention Avg', value: formatDurationLabel(cacheSummary.avgViewDurationSec), color: 'text-[#FF3399]' },
    { label: 'Loyal Subs', value: formatHumanNumber(loyalSubsValue), color: 'text-[#CCFF00]' },
    { label: 'Viral Prob', value: cacheSummary.viralTrendLabel, color: 'text-black' },
  ];

  return (
    <div className="flex flex-col space-y-12 max-w-7xl mx-auto pb-32 pt-8">
      <div className="pop-box bg-[#FFDD00] h-24 flex items-center px-12 justify-between border-[6px] border-black rounded-[32px] shadow-[16px_16px_0px_0px_black]">
        <div className="flex items-center gap-8">
          <div className="bg-black p-4 rounded-3xl border-[4px] border-black shadow-[6px_6px_0px_0px_white] rotate-[-2deg]">
            <CustomIcon name="lightning" size={40} />
          </div>
          <div>
            <h2 className="text-5xl font-[1000] uppercase tracking-tighter text-black leading-none font-black">
              COMMAND <span className="text-white">CENTER</span>
            </h2>
            <p className="text-[11px] font-black uppercase tracking-[0.5em] text-black/40 mt-2">Visualizing Creator OS v2.1 Protocol</p>
          </div>
        </div>
        <div className="flex items-center gap-6 bg-black/5 p-3 px-6 rounded-3xl border-2 border-black/10">
          <div className={`w-5 h-5 rounded-full ${authState.isAuthenticated ? 'bg-black' : 'bg-[#FF3399]'} ${authState.isAuthenticated ? '' : 'animate-pulse shadow-[0_0_15px_#FF3399]'}`} />
          <span className="text-[11px] font-black uppercase tracking-[0.2em]">{authState.isAuthenticated ? 'System Finalized' : 'Telemetry Offline'}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((s) => (
          <DashboardMetric key={s.label} {...s} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-10">
          <HubCard
            title="Reference Studio"
            subtitle="Components / Design"
            path="/reference-studio"
            color="bg-[#B14AED]"
            status="CURATED"
            icon="!!!GENERATE1"
          />
          <HubCard
            title="Studio Hub"
            subtitle="Production / SEO"
            path="/studio"
            color="bg-[#00CCFF]"
            status="OPTIMIZING"
            icon="!!!POST-VIDEO"
          />
          <HubCard
            title="Performance Hub"
            subtitle="Analytics / Growth"
            path="/performance"
            color="bg-[#CCFF00]"
            status="SECURE"
            icon="!!!ANALYTICS"
          />
          <div className="pop-box p-10 bg-black border-[6px] border-black rounded-[32px] shadow-[16px_16px_0px_0px_#FF3399] flex flex-col justify-center">
            <h4 className="text-4xl font-[1000] uppercase text-white tracking-tighter leading-none mb-4">
              System <span className="text-[#FF3399]">Pulse</span>
            </h4>
            <p className="text-xs font-bold uppercase text-white/40 tracking-[0.34em] leading-relaxed">
              API Sync Status: {isLoading ? 'PENDING' : authState.isAuthenticated ? 'SYNCED' : 'DISCONNECTED'}
            </p>
          </div>
        </div>

        <div className="space-y-10">
          <div className="pop-box bg-black border-[6px] border-black rounded-[32px] p-6 shadow-[12px_12px_0px_0px_#CCFF00] flex flex-col gap-4 min-h-[260px]">
            <div className="flex justify-between items-center">
              <h4 className="text-xl font-[1000] uppercase text-[#CCFF00] tracking-tight">Realtime Views</h4>
              <TrendingUp size={18} className="text-[#CCFF00]" />
            </div>
            {recentDailyData.length > 0 ? (
              <div className="w-full h-[170px]">
                <MobileLookChart data={recentDailyData} xKey="Date" yKey="Views" color="#CCFF00" height={160} />
              </div>
            ) : (
              <div className="text-white/40 text-xs font-bold uppercase tracking-widest flex-1 flex items-center justify-center border-2 border-dashed border-white/20 rounded-2xl">
                Awaiting Telemetry Stream
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-2">
        <h3 className="text-3xl font-[1000] uppercase tracking-tighter mb-6 flex items-center gap-3">
          <TrendingUp size={28} className="text-[#FF3399]" /> Modular Workspace Engine
        </h3>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <ToolboxContainer title="Traffic Pulse" icon={TrendingUp} headerColor="bg-[#CCFF00]">
            <div className="p-6 h-full flex flex-col bg-black">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black uppercase text-white/50 tracking-widest leading-none">Global Traffic Pulse</span>
                <TrendingUp size={16} className="text-[#CCFF00]" />
              </div>
              {recentDailyData.length > 0 ? (
                <div className="w-full flex-1 relative min-h-[120px]">
                  <MobileLookChart data={recentDailyData} xKey="Date" yKey="Views" color="#CCFF00" height={120} />
                </div>
              ) : (
                <div className="text-white/30 text-xs font-bold flex-1 flex items-center justify-center">Awaiting Telemetry...</div>
              )}
            </div>
          </ToolboxContainer>

          <ToolboxContainer title="The Oracle" icon={Zap} headerColor="bg-[#FF3399]">
            <div className="p-8 h-full flex flex-col items-center justify-center text-center bg-[#f8fafc]">
              <div className="w-20 h-20 bg-black border-[4px] border-black rounded-full flex items-center justify-center shadow-[6px_6px_0px_0px_#FF3399] animate-pop-rotate mb-6">
                <CustomIcon name="!!!GENERATE1" size={40} />
              </div>
              <p className="text-xs font-black uppercase text-black/50 tracking-widest leading-relaxed mb-6">
                {brain.coreConcept ? `Optimizing for: ${brain.coreConcept}` : 'Standing by for Creator concept broadcast...'}
              </p>
              {!authState.isAuthenticated && (
                <button
                  onClick={login}
                  className="bg-black text-white px-6 py-3 rounded-xl border-[3px] border-black shadow-[4px_4px_0px_0px_#FF3399] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all font-black uppercase text-sm"
                >
                  Initialize Nexus
                </button>
              )}
            </div>
          </ToolboxContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
