import React from 'react';
import { 
  BarChart3, 
  Sparkles, 
  Search, 
  Image as ImageIcon, 
  LayoutTemplate,
  Zap,
  ArrowUpRight,
  Target,
  Clock,
  ChevronRight
} from 'lucide-react';
import { useBrain } from '../context/GlobalDataContext';
import { ToolHeader } from '../components/ToolHeader';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { youtubeService } from '../services/youtubeService';

const Dashboard: React.FC = () => {
  const { brain } = useBrain();
  const [isAuth, setIsAuth] = React.useState(authService.isAuthenticated());
  const [channelData, setChannelData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (isAuth) {
      setIsLoading(true);
      youtubeService.getChannelOverview()
        .then(setChannelData)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [isAuth]);

  const stats = [
    { label: 'SEO Efficiency', value: brain.seoState.results.length > 0 ? '94%' : '--', icon: Search, color: 'bg-[#00d2ff]' },
    { label: 'Subscribers', value: channelData?.stats?.subscriberCount?.toLocaleString() || '--', icon: Sparkles, color: 'bg-[#ff3399]' },
    { label: 'Channel Views', value: channelData?.stats?.viewCount?.toLocaleString() || '--', icon: BarChart3, color: 'bg-[#ccff00]' },
    { label: 'Total Videos', value: channelData?.stats?.videoCount?.toLocaleString() || '--', icon: Target, color: 'bg-[#ffdd00]' },
  ];

  const tools = [
    { name: 'Storyboard', path: '/storyboard', icon: LayoutTemplate, desc: 'Map out your next viral hit with AI concepts.' },
    { name: 'SEO Engine', path: '/seo', icon: Search, desc: 'Optimize titles and descriptions for maximum reach.' },
    { name: 'Thumb Studio', path: '/thumbnail', icon: ImageIcon, desc: 'Generate high-CTR thumbnails using GenAI.' },
    { name: 'Channelytics', path: '/channelytics', icon: BarChart3, desc: 'Deep dive into your YouTube Studio data.' },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ToolHeader 
        title="Creator Command Center" 
        icon="zap" 
        titleBgColor="bg-black text-[#ccff00]" 
        iconBgColor="bg-[#ccff00]" 
      />

      <div className="flex-1 overflow-auto p-1">
        <div className="max-w-7xl mx-auto space-y-12 pb-20 mt-8">
          
          {/* Hero Welcome */}
          <div className="bg-white border-[6px] border-black rounded-[48px] p-12 shadow-[20px_20px_0px_0px_black] relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 group-hover:rotate-12 transition-transform duration-1000">
                <Zap size={200} />
             </div>
             <div className="relative z-10 space-y-6">
                <div className={`inline-flex items-center gap-3 px-5 py-2 rounded-full font-black uppercase text-xs tracking-widest italic animate-bounce ${isAuth ? 'bg-black text-[#ccff00]' : 'bg-[#ff3399] text-white'}`}>
                   <Sparkles size={16} /> {isAuth ? (isLoading ? 'Syncing...' : 'System Online') : 'System Offline'}
                </div>
                <h2 className="text-7xl font-[1000] uppercase tracking-tighter italic leading-none">
                  {isAuth ? (
                    <>Welcome back, <span className="text-[#ff3399]">{channelData?.title || 'Creator'}</span>.</>
                  ) : (
                    <>The Nexus is <span className="text-[#ff3399]">Disconnected</span>.</>
                  )}
                </h2>
                <p className="text-2xl font-bold text-black/50 max-w-2xl leading-relaxed italic">
                   {isAuth ? (
                     <>Your creative engine is synchronized with <span className="text-black font-black underline decoration-[#00d2ff] decoration-4">{channelData?.title}</span>. Data flow is optimal.</>
                   ) : (
                     <>Connect your YouTube channel to unlock live telemetry, automated SEO publishing, and direct Channelytics integration.</>
                   )}
                </p>
                <div className="flex gap-6 pt-4">
                   {isAuth ? (
                     <>
                        <Link to="/channelytics" className="bg-black text-white px-10 py-5 rounded-2xl font-black uppercase italic tracking-widest text-lg shadow-[8px_8px_0px_0px_#ccff00] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-4">
                           Run Diagnostic <ArrowUpRight size={24} />
                        </Link>
                        <Link to="/seo" className="bg-white text-black border-[4px] border-black px-10 py-5 rounded-2xl font-black uppercase italic tracking-widest text-lg shadow-[8px_8px_0px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                           Optimize SEO
                        </Link>
                     </>
                   ) : (
                     <button 
                       onClick={() => authService.login()}
                       className="bg-black text-white px-10 py-5 rounded-2xl font-black uppercase italic tracking-widest text-lg shadow-[8px_8px_0px_0px_#ccff00] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-4"
                     >
                       Authorize YouTube Nexus <Zap size={24} />
                     </button>
                   )}
                </div>
             </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
             {stats.map((stat, i) => (
                <div key={i} className="bg-white border-[5px] border-black p-8 rounded-[40px] shadow-[12px_12px_0px_0px_black] hover:translate-y-[-8px] transition-transform">
                   <div className={`${stat.color} w-16 h-16 rounded-2xl border-[4px] border-black flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_black]`}>
                      <stat.icon size={28} />
                   </div>
                   <div className="space-y-1">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30 italic">{stat.label}</h4>
                      <p className="text-5xl font-[1000] tracking-tighter italic">{stat.value}</p>
                   </div>
                </div>
             ))}
          </div>

          {/* Quick Access Tools */}
          <div className="space-y-8">
             <div className="flex items-center gap-6 border-b-[6px] border-black pb-6">
                <LayoutTemplate size={40} />
                <h3 className="text-5xl font-black uppercase italic tracking-tighter">Satellite Tools</h3>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {tools.map((tool, i) => (
                   <Link key={i} to={tool.path} className="bg-white border-[6px] border-black p-10 rounded-[48px] shadow-[16px_16px_0px_0px_black] group hover:bg-black hover:text-white transition-all">
                      <div className="flex justify-between items-start mb-6">
                         <div className="bg-[#ccff00] text-black p-5 rounded-3xl border-[4px] border-black shadow-[6px_6px_0px_0px_black] group-hover:shadow-none group-hover:translate-x-1 group-hover:translate-y-1 transition-all">
                            <tool.icon size={36} />
                         </div>
                         <ArrowUpRight size={40} className="opacity-10 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="space-y-2">
                         <h4 className="text-4xl font-[1000] uppercase tracking-tighter italic">{tool.name}</h4>
                         <p className="font-bold text-lg opacity-40 italic group-hover:opacity-70">{tool.desc}</p>
                      </div>
                   </Link>
                ))}
             </div>
          </div>

          {/* Activity Feed / Brain Logs Placeholder */}
          <div className="bg-black text-white border-[6px] border-black rounded-[48px] p-12 shadow-[20px_20px_0px_0px_#ccff00] relative overflow-hidden italic">
             <div className="flex justify-between items-center mb-10 border-b-[4px] border-white/10 pb-6">
                <div className="flex items-center gap-6">
                   <Clock size={32} className="text-[#00d2ff]" />
                   <h3 className="text-4xl font-black uppercase tracking-tighter">Brain Logs</h3>
                </div>
                <span className="bg-white text-black px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Real-Time Sync</span>
             </div>
             <div className="space-y-6">
                {[
                  { time: '2m ago', event: 'New SEO SEO Strategy generated for "YouTube Mastery"', color: 'text-[#ccff00]' },
                  { time: '1h ago', event: 'Channelytics data synchronized from TableData.csv', color: 'text-[#00d2ff]' },
                  { time: '4h ago', event: '3 New Thumbnail concepts finalized', color: 'text-[#ff3399]' }
                ].map((log, i) => (
                  <div key={i} className="flex items-center gap-6 group cursor-pointer hover:bg-white/5 p-4 rounded-2xl transition-colors">
                     <span className="text-xs font-black uppercase tracking-widest text-white/30 whitespace-nowrap">{log.time}</span>
                     <div className={`w-2 h-2 rounded-full ${log.color.replace('text-', 'bg-')}`}></div>
                     <p className="text-xl font-bold flex-1">{log.event}</p>
                     <ChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
