import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  CheckSquare, 
  X, 
  Zap,
  Tag,
  Clock,
  Cloud
} from 'lucide-react';
import { useBrain } from '../context/GlobalDataContext';
import { ToolHeader } from '../components/ToolHeader';
import type { Project, DayTask } from '../types';
import { CustomIcon } from '../components/CustomIcon';
import { nexusSyncService } from '../services/nexusSyncService';

const PROJECT_COLORS = ['#FF3399', '#CCFF00', '#00CCFF', '#FFDD00', '#9933FF', '#FF9900'];

const LaunchCalendar: React.FC = () => {
  const { brain, updateBrain } = useBrain();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newDayTask, setNewDayTask] = useState('');
  const [isPushing, setIsPushing] = useState<string | null>(null);

  const projects = brain.projects || [];
  const dayTasks = brain.calendarState?.dayTasks || {};

  // Calendar Generation Logic (Legacy Port from ZZZ)
  const calendarData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 4-month range: past 1, current, next 2
    const startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    startDate.setDate(startDate.getDate() - startDate.getDay()); // Back to Sunday

    const endDate = new Date(today.getFullYear(), today.getMonth() + 3, 0); 
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay())); // Forward to Saturday

    const weeks = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        const dateString = currentDate.toISOString().split('T')[0];
        const isToday = dateString === today.toISOString().split('T')[0];
        const isCurrentMonth = currentDate.getMonth() === today.getMonth();
        
        // Find events/tasks for this day
        const dayProjectTasks = projects.flatMap(p => 
          p.tasks.filter(t => t.dueDate === dateString).map(t => ({ ...t, projectId: p.id, color: p.color }))
        );
        const dayPublishEvents = projects.filter(p => p.publishDate === dateString);
        const manualTasks = dayTasks[dateString] || [];

        week.push({
          id: dateString,
          date: new Date(currentDate),
          isToday,
          isCurrentMonth,
          hasEvent: dayProjectTasks.length > 0 || dayPublishEvents.length > 0 || manualTasks.length > 0,
          dateString,
          allTasks: [
            ...dayPublishEvents.map(p => ({ id: `pub-${p.id}`, text: `PUBLISH: ${p.name}`, color: p.color, completed: false, isPublish: true })),
            ...dayProjectTasks.map(t => ({ ...t, isProjectTask: true })),
            ...manualTasks
          ]
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeks.push(week);
    }
    return weeks;
  }, [projects, dayTasks]);

  const handleAddManualTask = () => {
    if (!newDayTask.trim()) return;
    const newTask: DayTask = {
      id: crypto.randomUUID(),
      text: newDayTask,
      completed: false,
      projectId: 'manual'
    };
    
    const updatedDayTasks = {
      ...dayTasks,
      [selectedDate]: [...(dayTasks[selectedDate] || []), newTask]
    };

    updateBrain({
      calendarState: {
        ...brain.calendarState,
        dayTasks: updatedDayTasks
      }
    });
    setNewDayTask('');
  };

  const toggleTask = (date: string, taskId: string) => {
    if (taskId.startsWith('pub-')) return; // Can't toggle publish events here
    
    // Check if it's a manual task
    if (dayTasks[date]?.some(t => t.id === taskId)) {
       const updated = dayTasks[date].map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
       updateBrain({
         calendarState: { ...brain.calendarState, dayTasks: { ...dayTasks, [date]: updated } }
       });
       return;
    }

    // Check if it's a project task
    const [prefix, pId, tId] = taskId.split('-');
    if (prefix === 'ptask') {
       // Logic to update project task status
       const updatedProjects = projects.map(p => {
         if (p.id === pId) {
           return { ...p, tasks: p.tasks.map(t => t.id === tId ? { ...t, completed: !t.completed } : t) };
         }
         return p;
       });
       updateBrain({ projects: updatedProjects });
    }
  };

  const handlePushToCalendar = async (publishEvent: any) => {
    // Find the original project object
    const project = projects.find(p => `pub-${p.id}` === publishEvent.id);
    if (!project) return;

    setIsPushing(publishEvent.id);
    try {
      await nexusSyncService.pushToCalendar(project);
      alert(`${project.name} pushed to Google Calendar!`);
    } catch (e: any) {
      console.error(e);
      alert(`Calendar Push failed: ${e.message}`);
    } finally {
      setIsPushing(null);
    }
  };

  // SVG Cell Renderer (The secret sauce from ZZZ)
  const renderCellBackground = (tasks: any[]) => {
    if (tasks.length === 0) return null;
    
    const colors = tasks.map(t => t.color || '#000000').slice(0, 4);
    const count = colors.length;

    if (count === 1) return <div className="absolute inset-0" style={{ backgroundColor: colors[0] }} />;
    
    return (
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {count === 2 && (
          <>
            <polygon points="0,0 100,0 0,100" fill={colors[0]} />
            <polygon points="100,0 100,100 0,100" fill={colors[1]} />
          </>
        )}
        {count === 3 && (
          <>
            <rect x="0" y="0" width="100" height="33" fill={colors[0]} />
            <rect x="0" y="33" width="100" height="34" fill={colors[1]} />
            <rect x="0" y="67" width="100" height="33" fill={colors[2]} />
          </>
        )}
        {count >= 4 && (
          <>
            <polygon points="0,0 50,0 50,50 0,50" fill={colors[0]} />
            <polygon points="50,0 100,0 100,50 50,50" fill={colors[1]} />
            <polygon points="0,50 50,50 50,100 0,100" fill={colors[2]} />
            <polygon points="50,50 100,50 100,100 50,100" fill={colors[3]} />
          </>
        )}
        <line x1="0" y1="0" x2="100" y2="100" stroke="black" strokeWidth="2" opacity="0.2" />
      </svg>
    );
  };

  const selectedDayData = calendarData.flat().find(d => d.dateString === selectedDate);
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  return (
    <div className="flex flex-col h-full overflow-hidden italic">
      <ToolHeader 
        title="Launch Calendar" 
        icon="calendar" 
        titleBgColor="bg-[#ff3399]" 
        iconBgColor="bg-black text-[#ff3399]" 
      />

      <div className="flex-1 flex gap-8 p-1 min-h-0">
         {/* Calendar Grid (Contribution Style) */}
         <div className="flex-1 bg-white border-[6px] border-black rounded-[48px] shadow-[16px_16px_0px_0px_black] p-10 flex flex-col">
            <div className="flex justify-between items-center mb-10">
               <div>
                  <h3 className="text-4xl font-[1000] uppercase tracking-tighter italic">Production Grid</h3>
                  <p className="font-bold opacity-50 uppercase tracking-widest text-xs mt-1">Simulated 120-Day Velocity Horizon</p>
               </div>
               <div className="flex gap-2">
                  <button className="bg-black text-white p-3 rounded-2xl border-4 border-black hover:bg-gray-800 transition-all">
                     <ChevronLeft size={24} />
                  </button>
                  <button className="bg-black text-white p-3 rounded-2xl border-4 border-black hover:bg-gray-800 transition-all">
                     <ChevronRight size={24} />
                  </button>
               </div>
            </div>

            <div className="flex-1 overflow-x-auto custom-scrollbar pb-6">
               <div className="min-w-max flex gap-2">
                  {/* Days Label Column */}
                  <div className="flex flex-col gap-2 mt-6 mr-4 opacity-30">
                     {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
                        <div key={d} className="h-10 flex items-center justify-end text-[10px] font-black">{d}</div>
                     ))}
                  </div>

                  {calendarData.map((week, wIdx) => (
                     <div key={wIdx} className="flex flex-col gap-2">
                        {/* Month Indicator (Simple) */}
                        <div className="h-4 text-[9px] font-black uppercase opacity-20 text-center">
                           {week[0].date.getDate() <= 7 ? months[week[0].date.getMonth()] : ''}
                        </div>
                        {week.map(day => (
                           <div 
                             key={day.id}
                             onClick={() => setSelectedDate(day.dateString)}
                             className={`w-10 h-10 rounded-xl border-[3px] border-black relative overflow-hidden transition-all cursor-pointer group
                                ${day.isToday ? 'scale-110 shadow-[4px_4px_0px_0px_black] z-10' : 'hover:scale-105'}
                                ${selectedDate === day.dateString ? 'ring-4 ring-[#ff3399] ring-offset-4' : ''}
                                ${!day.isCurrentMonth ? 'opacity-30' : ''}
                                ${!day.hasEvent ? 'bg-gray-50' : ''}
                             `}
                           >
                              {renderCellBackground(day.allTasks)}
                              {day.isToday && !day.hasEvent && <div className="absolute inset-0 bg-black/10 animate-pulse" />}
                              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/5 flex items-center justify-center pointer-events-none transition-opacity">
                                 <span className="text-[10px] font-black text-black">{day.date.getDate()}</span>
                              </div>
                           </div>
                        ))}
                     </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Selection Sidebar (Task List) */}
         <div className="w-[450px] flex flex-col gap-8 min-h-0">
            {/* Selected Date Header */}
            <div className="bg-[#ccff00] border-[6px] border-black p-8 rounded-[40px] shadow-[12px_12px_0px_0px_black]">
               <div className="flex items-center gap-4 mb-2">
                  <div className="bg-black text-[#ccff00] p-3 rounded-2xl border-4 border-black">
                     <Clock size={24} />
                  </div>
                  <h4 className="text-3xl font-[1000] uppercase tracking-tighter italic">
                     {new Date(selectedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </h4>
               </div>
               <p className="font-bold opacity-60 uppercase tracking-widest text-[10px]">Active Production Nodes for this Sector</p>
            </div>

            {/* Task Area */}
            <div className="flex-1 bg-white border-[6px] border-black rounded-[48px] shadow-[16px_16px_0px_0px_black] p-8 flex flex-col min-h-0">
               <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-4">
                  {selectedDayData?.allTasks.length === 0 ? (
                     <div className="h-full flex flex-col items-center justify-center text-center opacity-20 space-y-4">
                        <CalendarIcon size={64} className="text-black" />
                        <p className="font-black uppercase italic tracking-tighter text-2xl">Quiet Sector</p>
                        <p className="font-bold text-sm">No production pulses detected.</p>
                     </div>
                  ) : (
                     selectedDayData?.allTasks.map((task: any) => (
                        <div 
                          key={task.id}
                          className={`flex items-center gap-4 p-4 rounded-2xl border-4 border-black transition-all group
                             ${task.completed ? 'bg-gray-100 opacity-50' : 'bg-white shadow-[6px_6px_0px_0px_black] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_black]'}
                          `}
                        >
                           <button 
                             disabled={task.isPublish}
                             onClick={() => toggleTask(selectedDate, task.id)}
                             style={{ backgroundColor: task.completed ? 'black' : (task.color || 'white') }}
                             className={`w-8 h-8 rounded-lg border-[3px] border-black flex items-center justify-center shrink-0
                                ${task.isPublish ? 'cursor-not-allowed cursor-help' : 'cursor-pointer'}
                             `}
                             title={task.isPublish ? "Fixed Publish Event" : "Toggle Task Status"}
                           >
                              {task.completed ? <X size={20} className="text-white" /> : (task.isPublish && <Zap size={14} className="text-black" />)}
                           </button>
                            <div className="flex-1 min-w-0">
                              <p className={`font-black uppercase italic tracking-tighter text-sm truncate ${task.completed ? 'line-through' : ''}`}>
                                 {task.text}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                 <Tag size={10} className="opacity-40" />
                                 <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">
                                    {task.isPublish ? 'Milestone' : (task.isProjectTask ? 'Asset Goal' : 'Custom Task')}
                                 </span>
                              </div>
                           </div>
                           {task.isPublish && (
                              <button 
                                onClick={() => handlePushToCalendar(task)}
                                disabled={isPushing === task.id}
                                className="bg-[#00d2ff] text-black px-3 py-1.5 rounded-xl border-2 border-black font-[1000] uppercase text-[10px] italic shadow-[4px_4px_0px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-2 group"
                              >
                                {isPushing === task.id ? <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <Cloud size={14} className="group-hover:scale-125 transition-transform" />}
                                Sync
                              </button>
                           )}
                        </div>
                     ))
                  )}
               </div>

               {/* Quick Add (Internal Only) */}
               <div className="mt-8 pt-6 border-t-4 border-black flex gap-2">
                  <input 
                    type="text" 
                    value={newDayTask}
                    onChange={(e) => setNewDayTask(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddManualTask()}
                    placeholder="INITIATE NEW TASK..."
                    className="flex-1 bg-gray-50 border-4 border-black px-6 py-4 rounded-2xl font-black uppercase italic tracking-widest text-xs focus:ring-4 focus:ring-[#ccff00] outline-none"
                  />
                  <button 
                    onClick={handleAddManualTask}
                    className="bg-[#ccff00] text-black p-4 rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_black] active:shadow-none active:translate-y-[4px] transition-all"
                  >
                     <Plus size={24} />
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default LaunchCalendar;
