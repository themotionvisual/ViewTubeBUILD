import React, { useEffect } from 'react';
import { useBrain } from '../context/GlobalDataContext';
import { NavLink } from 'react-router-dom';
import { CustomIcon } from './CustomIcon';
import { NexusCommander } from './NexusCommander';

export const Sidebar: React.FC = () => {
  const { authState, setAuthState } = useBrain();

  useEffect(() => {
    const handleSync = (e: any) => {
      const data = e.detail;
      if (data && data.profile) {
        setAuthState({
          channelName: data.profile.name,
          channelThumbnail: data.profile.profilePictureUrl,
          subscriberCount: parseInt(data.profile.subscriberCount),
          totalViews: parseInt(data.profile.totalViews)
        });
      }
    };

    window.addEventListener('yt_analytics_synced', handleSync as EventListener);
    return () => window.removeEventListener('yt_analytics_synced', handleSync as EventListener);
  }, [setAuthState]);

  const tools = [
    { id: 'DASHBOARD', path: '/', label: 'Overview', icon: 'home' },
    { id: 'STUDIO', path: '/studio', label: 'Studio', icon: '!!!POST-VIDEO' },
    { id: 'SHORTS', path: '/shorts', label: 'Shorts', icon: 'video' },
    { id: 'PERFORMANCE', path: '/performance', label: 'Performance', icon: '!!!ANALYTICS' },
    { id: 'SYSTEM', path: '/settings', label: 'System', icon: '!!!SETTINGS' },
  ];

  return (
    <aside className="w-80 bg-white border-r-[6px] border-black h-screen flex flex-col p-8 z-50">
      
      {/* Brand Header */}
      <div className="mb-12 flex items-start gap-4">
        <div className="bg-black p-3 rounded-2xl border-[3px] border-black shadow-[4px_4px_0px_0px_#ccff00]">
           <CustomIcon name="lightning" size={32} />
        </div>
        <div className="flex flex-col -mt-1">
          <h1 className="text-4xl font-[1000] uppercase tracking-tighter leading-none">
            <span className="text-black">VIEW</span>
            <span className="text-[#FF3399]">TUBE</span>
          </h1>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30 mt-1">Creator OS v2.1</span>
        </div>
      </div>

      <nav className="flex-1 space-y-5">
        {tools.map((t) => (
          <NavLink
            key={t.id}
            to={t.path}
            className={({ isActive }) => 
              `flex items-center gap-4 w-full p-4 font-black uppercase tracking-tighter rounded-[20px] transition-all border-[4px] border-black shadow-[6px_6px_0px_0px_black] ${
                isActive 
                ? 'bg-black text-white shadow-none translate-x-1 translate-y-1' 
                : 'bg-white text-black hover:bg-gray-50'
              }`
            }
          >
            <div className={`w-8 h-8 flex items-center justify-center`}>
              <CustomIcon 
                name={t.icon} 
                size={22} 
              />
            </div>
            <span className="text-xl">{t.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Channel Pulse Card (Live Telemetry) */}
      <div className="mt-auto mb-6 pop-box p-5 bg-white border-[4px] border-black rounded-[32px] shadow-[8px_8px_0px_0px_black] relative overflow-hidden">
        <div className="absolute top-2 right-4 flex items-center gap-1.5">
           <div className={`w-2 h-2 rounded-full ${authState.isAuthenticated ? 'bg-[#CCFF00] animate-pulse shadow-[0_0_8px_#CCFF00]' : 'bg-red-500'}`} />
           <span className="text-[7px] font-black uppercase text-black/20 tracking-widest">{authState.isAuthenticated ? 'LIVE' : 'OFFLINE'}</span>
        </div>
        
        <div className="flex items-center gap-4 mb-4 pb-4 border-b-2 border-dashed border-black/10">
          <div className="w-14 h-14 rounded-full border-[3px] border-black overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
             {authState.channelThumbnail ? (
               <img src={authState.channelThumbnail} alt="Channel" className="w-full h-full object-cover" />
             ) : (
               <span className="text-xs font-black text-black/10 uppercase">POOL</span>
             )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-[10px] font-[1000] uppercase leading-tight truncate">{authState.channelName || 'Sync Pulse'}</h4>
            <span className="text-[8px] font-bold text-black/30 uppercase tracking-[0.2em]">Global Telemetry</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-x-2 gap-y-4">
          <div className="space-y-0.5">
            <span className="block text-[8px] font-black text-black/30 uppercase">Reach</span>
            <span className="block text-sm font-[1000] uppercase truncate text-[#00CCFF]">
              {authState.totalViews ? (authState.totalViews / 1000).toFixed(1) + 'K' : '---'}
            </span>
          </div>
          <div className="space-y-0.5">
            <span className="block text-[8px] font-black text-black/30 uppercase">Growth</span>
            <span className="block text-sm font-[1000] uppercase truncate text-[#CCFF00]">
              {authState.subscriberCount ? (authState.subscriberCount / 1000).toFixed(1) + 'K' : '---'}
            </span>
          </div>
        </div>
      </div>

      <NavLink 
        to="/reference-studio"
        className={({ isActive }) => 
          `mt-auto flex items-center justify-center gap-2 w-full p-3 font-black uppercase tracking-widest text-[10px] rounded-xl transition-all border-[3px] border-black shadow-[4px_4px_0px_0px_black] ${
            isActive 
            ? 'bg-[#FF3399] text-white shadow-none translate-x-1 translate-y-1' 
            : 'bg-white text-black hover:bg-gray-50'
          }`
        }
      >
        <CustomIcon name="!!!GENERATE1" size={16} />
        Reference Studio
      </NavLink>

      <NexusCommander />

    </aside>
  );
};
