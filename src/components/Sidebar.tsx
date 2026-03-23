import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { CustomIcon } from './CustomIcon';
import { 
  Zap,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const tools = [
    { id: 'DASHBOARD', path: '/', label: 'Overview', icon: 'home', color: 'text-[#ccff00]' },
    { id: 'STORYBOARD_STUDIO', path: '/storyboard', label: 'Storyboard', icon: 'video', color: 'text-[#ff3399]' },
    { id: 'SEO_GENERATOR', path: '/seo', label: 'SEO Engine', icon: 'search', color: 'text-[#00d2ff]' },
    { id: 'THUMBNAIL_STUDIO', path: '/thumbnail', label: 'Thumb Studio', icon: 'image', color: 'text-[#ccff00]' },
    { id: 'CHANNELYTICS', path: '/channelytics', label: 'Channelytics', icon: 'analytics', color: 'text-[#00ff99]' },
    { id: 'LAUNCH_CALENDAR', path: '/calendar', label: 'Launch Calendar', icon: 'calendar', color: 'text-[#ff00ff]' },
    { id: 'IDEAS_VAULT', path: '/ideas', label: 'Ideas Vault', icon: 'ideas', color: 'text-[#ffb158]' },
    { id: 'ASSET_VAULT', path: '/vault', label: 'Project Vault', icon: 'database', color: 'text-[#00ccff]' },
  ];

  return (
    <aside className="w-80 bg-white border-r-[8px] border-black h-screen flex flex-col p-8 z-50 shadow-[10px_0px_0px_0px_rgba(0,0,0,0.05)]">
      
      {/* Brand Header */}
      <div className="mb-14 flex items-center gap-5 group cursor-pointer">
        <div className="bg-black text-[#ccff00] p-4 rounded-[24px] border-[4px] border-black shadow-[6px_6px_0px_0px_black] group-hover:shadow-none group-hover:translate-x-1 group-hover:translate-y-1 transition-all">
          <Zap size={32} fill="currentColor" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-4xl font-[1000] uppercase tracking-tighter italic leading-none">View<span className="text-[#ff3399]">TUBE</span></h1>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30 mt-1">Creator OS v2.1</span>
        </div>
      </div>

      <nav className="flex-1 space-y-5">
        {tools.map((t) => (
          <NavLink
            key={t.id}
            to={t.path}
            className={({ isActive }) => 
              `flex items-center gap-6 w-full p-5 font-black uppercase italic tracking-tighter rounded-[24px] transition-all border-[5px] border-black shadow-[8px_8px_0px_0px_black] ${
                isActive 
                ? 'bg-black text-white shadow-none translate-x-2 translate-y-2' 
                : 'bg-white text-black hover:bg-gray-50 hover:translate-y-[-2px]'
              }`
            }
          >
                <CustomIcon 
                  name={t.icon} 
                  size={26} 
                  className={isActive ? 'invert-0 brightness-200' : 'grayscale brightness-50 opacity-100'} 
                />
                <span className="text-xl">{t.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="pt-10 border-t-[6px] border-black mt-10">
        <NavLink 
          to="/settings"
          className={({ isActive }) => 
            `w-full flex items-center gap-6 p-5 rounded-[24px] border-[5px] border-black font-black uppercase italic tracking-tighter transition-all shadow-[8px_8px_0px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 group ${
              isActive ? 'bg-black text-white shadow-none translate-x-1 translate-y-1' : 'bg-[#ffdd00] text-black'
            }`
          }
        >
          <CustomIcon name="settings" size={26} className="group-hover:rotate-90 transition-transform duration-500" />
          <span className="text-xl">Settings</span>
        </NavLink>
      </div>
    </aside>
  );
};

