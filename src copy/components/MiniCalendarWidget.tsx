import React, { useState, useEffect } from 'react';
import { useBrain } from '../context/useBrain';

export const MiniCalendarWidget: React.FC = () => {
  const { brain, authState } = useBrain();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Generate next 14 days
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingDays = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const tasks = brain.calendarState?.dayTasks?.[dateStr] || [];
    return { date: d, dateStr, tasks };
  });

  const activeDayTasks = upcomingDays[0].tasks;

  return (
    <div className="w-full bg-black border-[6px] border-black rounded-[32px] shadow-[16px_16px_0px_0px_#CCFF00] p-6 lg:p-8 flex flex-col lg:flex-row items-center gap-8 mb-12 relative overflow-hidden group">
      {/* Background Decor */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#CCFF00] rounded-full opacity-10 blur-3xl group-hover:opacity-20 transition-opacity"></div>
      
      {/* Profile & Time Zone */}
      <div className="flex items-center gap-6 z-10 w-full lg:w-auto shrink-0">
        <div className="w-20 h-20 rounded-full border-[4px] border-[#CCFF00] overflow-hidden bg-gray-900 shadow-[0_0_20px_rgba(204,255,0,0.3)] shrink-0">
          {authState.channelThumbnail ? (
            <img src={authState.channelThumbnail} alt="Creator" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#CCFF00] font-[1000] text-xl">OS</div>
          )}
        </div>
        <div>
          <h3 className="text-[#CCFF00] font-[1000] text-3xl uppercase tracking-tighter leading-none mb-1">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </h3>
          <p className="text-white/50 font-black uppercase tracking-widest text-xs">
            {currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* 14-Day Ribbon */}
      <div className="flex-1 w-full bg-white/5 border-2 border-white/10 rounded-2xl p-4 flex flex-col justify-center z-10 min-w-0">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-black uppercase text-white/50 tracking-widest pl-1">
            14-Day Telemetry Ribbon
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
          {upcomingDays.map((day) => {
            const hasTasks = day.tasks.length > 0;
            return (
              <div 
                key={day.dateStr} 
                className="flex flex-col items-center gap-1.5 shrink-0 group/day cursor-pointer"
                title={`${day.tasks.length} tasks`}
              >
                <div 
                  className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${
                    hasTasks 
                      ? 'bg-[#FF3399] border-[#FF3399] shadow-[0_0_10px_rgba(255,51,153,0.4)] hover:bg-[#CCFF00] hover:border-[#CCFF00]' 
                      : 'bg-white/5 border-white/10 hover:border-white/30'
                  }`}
                >
                  <span className={`text-[10px] font-black ${hasTasks ? 'text-black' : 'text-white/30'}`}>
                    {day.date.getDate()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Today's Tasks Summary */}
      <div className="w-full lg:w-72 bg-[#CCFF00] border-[4px] border-black rounded-2xl p-4 z-10 shrink-0 rotate-1 hover:rotate-0 transition-transform shadow-[6px_6px_0px_0px_black]">
        <h4 className="font-[1000] uppercase text-black text-sm tracking-tighter mb-3 border-b-2 border-black/20 pb-2">
          Active Protocol
        </h4>
        <div className="space-y-2">
          {activeDayTasks.length > 0 ? (
            activeDayTasks.slice(0, 3).map((t: any) => (
              <div key={t.id} className="flex items-start gap-2">
                <div className={`mt-0.5 w-3 h-3 rounded-sm border-2 border-black flex-shrink-0 ${t.completed ? 'bg-black' : 'bg-transparent'}`} />
                <span className={`text-xs font-bold uppercase leading-tight line-clamp-1 ${t.completed ? 'opacity-40 line-through' : 'text-black'}`}>
                  {t.text}
                </span>
              </div>
            ))
          ) : (
             <div className="text-xs font-black uppercase tracking-widest text-black/40 text-center py-2">
               No Directives
             </div>
          )}
          {activeDayTasks.length > 3 && (
            <div className="text-[10px] font-black uppercase text-black/50 text-center pt-1">
              + {activeDayTasks.length - 3} MORE
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
