import React, { useState, useMemo } from 'react';
import { Calendar, CheckSquare, Image as ImageIcon, FileText, Plus, MoreVertical, X, Upload, Columns, AlertTriangle, ChevronLeft, ChevronRight, Tag, AlignLeft, Check, Sparkles, Loader2, Trash2, Target, TrendingUp, Zap } from 'lucide-react';
import { generateProjectSuggestions, analyzeChannelGoals, generateChannelTaskSuggestions } from '../services/gemini';
import { ProjectPlan } from '../types';

interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
}

interface DayTask {
  id: string;
  text: string;
  completed: boolean;
  projectId: string;
  isPublishEvent?: boolean;
  isProjectTask?: boolean;
  originalTaskId?: string;
}

type ProjectType = 'long' | 'short' | 'post';
type ProjectStatus = 'ideation' | 'scripting' | 'filming' | 'editing' | 'publishing' | 'published';

interface ProjectTask {
  id: string;
  text: string;
  completed: boolean;
  isEssential: boolean;
  dueDate?: string;
}

interface ChannelGoal {
  id: string;
  metric: string;
  targetValue: number;
  currentValue: number;
  targetDate: string;
  analysis?: string;
  guidance?: string;
  outline?: string;
}

interface ChannelTask {
  id: string;
  text: string;
  completed: boolean;
}

interface Project {
  id: string;
  name: string;
  videoTitle: string;
  type: ProjectType;
  status: ProjectStatus;
  photoUrl: string;
  publishDate: string;
  script: string;
  description: string;
  notes: string;
  tags: string;
  thumbnailUrl: string;
  media: MediaItem[];
  color: string;
  tasks: ProjectTask[];
  plan: ProjectPlan;
}

const TASK_SUGGESTIONS = [
  { short: 'default tags', full: 'Define default tags for your channel' },
  { short: 'description', full: 'Write a compelling default description' },
  { short: 'profile picture', full: 'Upload a high-quality profile picture' },
  { short: 'Channel Banner', full: 'Design and upload a professional channel banner' },
  { short: 'social media', full: 'Link your social media accounts' },
  { short: 'Channel trailer', full: 'Create and set a channel trailer' },
  { short: 'playlists', full: 'Organize your videos into playlists' },
  { short: 'about section', full: "Optimize your channel's About section" },
  { short: 'footer', full: 'Write a standard channel footer' },
  { short: 'new viewers video', full: "Add 'new viewers' video to channel page" },
  { short: 'weekly routine', full: 'Establish a weekly publishing routine' },
  { short: 'custom URL', full: 'Create a custom channel URL' },
  { short: 'watermark', full: 'Add a branding watermark to your videos' },
  { short: 'upload defaults', full: 'Set up your upload defaults in Studio' },
  { short: 'community post', full: 'Create your first community tab post' },
  { short: 'end screens', full: 'Design a standard end screen template' },
  { short: 'cards', full: 'Plan a strategy for using info cards' },
  { short: 'subtitles', full: 'Enable auto-captions or upload subtitles' },
  { short: 'channel keywords', full: 'Add relevant keywords to channel settings' },
  { short: 'branding', full: 'Define your channel brand colors and fonts' },
];

const GOAL_SUGGESTIONS = [
  { short: 'subscribers', metric: 'Subscribers', target: 1000 },
  { short: 'views', metric: 'Total Views', target: 50000 },
  { short: 'Watch hours', metric: 'Watch Hours', target: 4000 },
  { short: 'new videos', metric: 'New Videos', target: 12 },
  { short: 'retention', metric: 'Avg View Duration (%)', target: 45 },
  { short: 'revenue', metric: 'Monthly Revenue ($)', target: 100 },
  { short: 'CTR', metric: 'Click-Through Rate (%)', target: 8 },
  { short: 'comments', metric: 'Avg Comments per Video', target: 20 },
];

const SuggestionSlider = ({ items, onAdd, color }: { items: any[], onAdd: (item: any) => void, color: string }) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="flex items-center gap-2 mt-4">
      <button 
        onClick={() => scroll('left')}
        className="p-2 border-2 border-black rounded-lg hover:opacity-90 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none"
        style={{ backgroundColor: color }}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      
      <div 
        ref={scrollRef}
        className="flex-1 flex gap-3 overflow-hidden scrollbar-hide py-2 px-1"
      >
        {items.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onAdd(item)}
            className="shrink-0 px-4 py-2 border-2 border-black rounded-xl font-bold text-xs uppercase tracking-tight hover:opacity-90 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none whitespace-nowrap"
            style={{ backgroundColor: color }}
          >
            {item.short}
          </button>
        ))}
      </div>

      <button 
        onClick={() => scroll('right')}
        className="p-2 border-2 border-black rounded-lg hover:opacity-90 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none"
        style={{ backgroundColor: color }}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

const SectionBox = ({ title, icon: Icon, color, children, iconBg = "white", className = "", contentClassName = "h-48", action }: { title: string, icon: any, color: string, children: React.ReactNode, iconBg?: string, className?: string, contentClassName?: string, action?: React.ReactNode }) => (
  <div className={`flex flex-col rounded-2xl border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden bg-white ${className}`}>
    <div className="flex items-center justify-between px-6 py-4 border-b-[3px] border-black" style={{ backgroundColor: color }}>
      <div className="flex items-center gap-4">
        <div 
          className="rounded-[13px] border-[4px] border-black flex items-center justify-center p-[9px] m-[-7px_-3px_-7px_-15px] w-[51px] h-[50px]"
          style={{ backgroundColor: iconBg, borderStyle: 'outset' }}
        >
          <Icon className="w-7 h-7" strokeWidth={2.5} />
        </div>
        <h3 className="text-2xl font-black uppercase tracking-tight">{title}</h3>
      </div>
      {action && <div>{action}</div>}
    </div>
    <div className={`${contentClassName} p-6`}>
      {children}
    </div>
  </div>
);

const PROJECT_COLORS = ['#FF87F3', '#CCFF00', '#00CCFF', '#FF3366', '#9933FF', '#FF9900'];

const KANBAN_COLUMNS: { id: ProjectStatus; label: string }[] = [
  { id: 'ideation', label: 'Ideation' },
  { id: 'scripting', label: 'Scripting' },
  { id: 'filming', label: 'Filming' },
  { id: 'editing', label: 'Editing' },
  { id: 'publishing', label: 'Publishing' },
  { id: 'published', label: 'Published' }
];

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Project One',
      videoTitle: 'A deep dive into the latest tech news.',
      type: 'long',
      status: 'ideation',
      photoUrl: 'https://picsum.photos/seed/project1/100/100',
      publishDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().split('T')[0],
      script: 'Hey guys, welcome back to the channel...',
      description: 'A deep dive into the latest tech news.',
      notes: '',
      tags: 'tech, news, review',
      thumbnailUrl: 'https://picsum.photos/seed/thumb/300/200',
      media: [],
      color: '#00CCFF',
      tasks: [],
      plan: {
        topic: '',
        description: '',
        length: '',
        audience: '',
        vision: '',
        hook: ''
      }
    }
  ]);

  const [activeTab, setActiveTab] = useState<string>('channel');
  const activeProject = activeTab !== 'channel' ? projects.find(p => p.id === activeTab) || null : null;
  
  const [channelGoals, setChannelGoals] = useState<ChannelGoal[]>([]);
  const [channelTasks, setChannelTasks] = useState<ChannelTask[]>([]);
  const [isAnalyzingGoals, setIsAnalyzingGoals] = useState(false);
  const [isGeneratingChannelTasks, setIsGeneratingChannelTasks] = useState(false);

  const handleGenerateChannelTasks = async () => {
    setIsGeneratingChannelTasks(true);
    try {
      const cache = JSON.parse(localStorage.getItem('yt_analytics_cache') || '{}');
      const channelData = cache.profile || null;
      const suggestions = await generateChannelTaskSuggestions(channelData, channelTasks);
      const newTasks = suggestions.map(text => ({
        id: Math.random().toString(36).substr(2, 9),
        text,
        completed: false
      }));
      setChannelTasks([...channelTasks, ...newTasks]);
    } catch (error) {
      console.error("Failed to generate channel tasks:", error);
    } finally {
      setIsGeneratingChannelTasks(false);
    }
  };

  const handleAnalyzeChannelGoals = async () => {
    setIsAnalyzingGoals(true);
    try {
      const cache = JSON.parse(localStorage.getItem('yt_analytics_cache') || '{}');
      const channelData = cache.profile || null;
      const csvData = cache.csvData || [];
      
      const results = await analyzeChannelGoals(channelGoals, channelData, csvData);
      
      setChannelGoals(channelGoals.map(goal => {
        const result = results.find((r: any) => r.id === goal.id);
        if (result) {
          return {
            ...goal,
            analysis: result.analysis,
            guidance: result.guidance,
            outline: result.outline
          };
        }
        return goal;
      }));
    } catch (error) {
      console.error("Failed to analyze channel goals", error);
    } finally {
      setIsAnalyzingGoals(false);
    }
  };
  
  // Selected Day State
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dayTasks, setDayTasks] = useState<Record<string, DayTask[]>>({});
  const [newDayTask, setNewDayTask] = useState('');

  // AI Suggestions State
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);

  const handleGenerateSuggestions = async () => {
    if (!activeProject) return;
    setIsGeneratingSuggestions(true);
    try {
      const cache = JSON.parse(localStorage.getItem('yt_analytics_cache') || '{}');
      const channelData = cache.profile || null;
      const csvData = cache.csvData || [];
      
      const newSuggestions = await generateProjectSuggestions(activeProject, channelData, csvData);
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error("Failed to generate suggestions", error);
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const handleAddSuggestionToTasks = (suggestionText: string) => {
    const newTask = {
      id: `task-${Date.now()}`,
      text: suggestionText,
      completed: false,
      isEssential: false
    };
    
    setProjects(projects.map(p => {
      if (p.id === activeTab) {
        return { ...p, tasks: [...p.tasks, newTask] };
      }
      return p;
    }));
    
    // Remove the added suggestion from the list
    setSuggestions(suggestions.filter(s => s !== suggestionText));
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const year = date.getFullYear();
    return `${weekday}, ${day} ${month} ${year}`;
  };

  const handleAddDayTask = () => {
    if (newDayTask.trim()) {
      const newTask: DayTask = { 
        id: Date.now().toString(), 
        text: newDayTask, 
        completed: false,
        projectId: activeProject?.id || ''
      };
      setDayTasks(prev => ({
        ...prev,
        [selectedDate]: [...(prev[selectedDate] || []), newTask]
      }));
      setNewDayTask('');
    }
  };

  const toggleDayTask = (date: string, taskId: string) => {
    setDayTasks(prev => ({
      ...prev,
      [date]: prev[date].map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
    }));
  };
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmProject, setDeleteConfirmProject] = useState<Project | null>(null);
  const [deleteCheckboxChecked, setDeleteCheckboxChecked] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectType, setNewProjectType] = useState<ProjectType>('long');
  const [newProjectDate, setNewProjectDate] = useState('');
  const [newProjectPhoto, setNewProjectPhoto] = useState('');
  const [newProjectColor, setNewProjectColor] = useState(PROJECT_COLORS[0]);

  const updateActiveProject = (updates: Partial<Project>) => {
    if (!activeProject) return;
    setProjects(projects.map(p => p.id === activeProject.id ? { ...p, ...updates } : p));
  };

  const moveProjectStatus = (projectId: string, direction: -1 | 1) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        const currentIndex = KANBAN_COLUMNS.findIndex(c => c.id === p.status);
        const newIndex = Math.max(0, Math.min(KANBAN_COLUMNS.length - 1, currentIndex + direction));
        return { ...p, status: KANBAN_COLUMNS[newIndex].id };
      }
      return p;
    }));
  };

  const toggleProjectTask = (taskId: string) => {
    if (!activeProject) return;
    const updatedTasks = activeProject.tasks.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    updateActiveProject({ tasks: updatedTasks });
  };

  const addProjectTask = (text: string) => {
    if (!activeProject) return;
    const newTask: ProjectTask = {
      id: Date.now().toString(),
      text,
      completed: false,
      isEssential: false
    };
    updateActiveProject({ tasks: [...activeProject.tasks, newTask] });
  };

  const updateProjectTaskDate = (taskId: string, date: string) => {
    if (!activeProject) return;
    const updatedTasks = activeProject.tasks.map(t => 
      t.id === taskId ? { ...t, dueDate: date } : t
    );
    updateActiveProject({ tasks: updatedTasks });
  };

  const removeProjectTask = (taskId: string) => {
    if (!activeProject) return;
    const updatedTasks = activeProject.tasks.filter(t => t.id !== taskId);
    updateActiveProject({ tasks: updatedTasks });
  };

  const isReadyToPublish = activeProject && activeProject.tasks.length > 0 && activeProject.tasks.filter(t => t.isEssential).every(t => t.completed);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setNewProjectPhoto(url);
    }
  };

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      const newProject: Project = {
        id: Date.now().toString(),
        name: newProjectName,
        videoTitle: newProjectName,
        type: newProjectType,
        status: 'ideation',
        photoUrl: newProjectPhoto || `https://picsum.photos/seed/${newProjectName}/100/100`,
        publishDate: newProjectDate,
        script: '',
        description: '',
        notes: '',
        tags: '',
        thumbnailUrl: '',
        media: [],
        color: newProjectColor,
        tasks: [],
        plan: {
          topic: '',
          description: '',
          length: '',
          audience: '',
          vision: '',
          hook: ''
        }
      };
      setProjects([...projects, newProject]);
      setActiveTab(newProject.id);
      setIsModalOpen(false);
      setNewProjectName('');
      setNewProjectType('long');
      setNewProjectDate('');
      setNewProjectPhoto('');
      setNewProjectColor(PROJECT_COLORS[0]);
    }
  };

  // Generate calendar data (4 months: past 1, current, next 2)
  const calendarData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    startDate.setDate(startDate.getDate() - startDate.getDay()); // Back to Sunday

    const endDate = new Date(today.getFullYear(), today.getMonth() + 3, 0); // End of month + 2
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay())); // Forward to Saturday

    const weeks = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        const isToday = currentDate.getTime() === today.getTime();
        const isCurrentMonth = currentDate.getMonth() === today.getMonth();
        const dateString = currentDate.toISOString().split('T')[0];
        
        // Highlight if ANY project has a publish date on this day OR if there are day tasks OR if any project task has a due date on this day
        const hasEvent = projects.some(p => p.publishDate === dateString || p.tasks.some(t => t.dueDate === dateString)) || (dayTasks[dateString]?.length > 0);

        week.push({
          id: dateString,
          date: new Date(currentDate),
          isToday,
          isCurrentMonth,
          hasEvent,
          dateString
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeks.push(week);
    }
    return weeks;
  }, [projects, dayTasks]);

  const months = [];
  for(let i = -1; i <= 2; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() + i);
    months.push(d.toLocaleString('default', { month: 'short' }));
  }
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="w-full pb-20">
      <div className="pop-box">
        <div className="pop-header bg-[#FF87F3] text-black flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-[#CCFF00] border-2 border-black rounded-lg flex items-center justify-center shadow-[2px_2px_0px_0px_black]">
              <Calendar size={32} className="text-black" />
            </div>
            <span className="text-[38px] font-black uppercase">Project Planning</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="pop-button bg-black text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Project
            </button>
          </div>
        </div>
        
        <div className="pop-content">
          
          {/* Calendar Section (Always at the top) */}
          <div className="bg-white rounded-2xl border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden mb-8 flex flex-col lg:flex-row">
            {/* Calendar Grid */}
            <div className="flex-1 p-6 border-b-[3px] lg:border-b-0 lg:border-r-[3px] border-black overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#CCFF00] rounded-lg border-2 border-black">
                  <Calendar className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">Content Calendar</h2>
              </div>
              
              <div className="overflow-x-auto pb-4">
                <div className="min-w-max">
                    <div className="flex text-sm font-bold text-gray-500 mb-2 ml-8">
                      {months.map((month, i) => (
                        <div key={i} className="flex-1 text-center">{month}</div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <div className="flex flex-col gap-1 text-sm font-bold text-gray-400 mt-[2px] w-6">
                        {daysOfWeek.map((day, i) => (
                          <div key={i} className="h-8 leading-8 text-center">{day}</div>
                        ))}
                      </div>
                      <div className="flex gap-1">
                        {calendarData.map((week, i) => (
                          <div key={i} className="flex flex-col gap-1">
                            {week.map((day) => {
                              const isSelected = selectedDate === day.dateString;
                              
                              const dayTasksList: DayTask[] = [
                                ...projects.filter(p => p.publishDate === day.dateString).map(p => ({
                                  id: `pub-${p.id}`,
                                  text: `Publish: ${p.name}`,
                                  completed: false,
                                  projectId: p.id,
                                  isPublishEvent: true
                                })),
                                ...projects.flatMap(p => p.tasks.filter(t => t.dueDate === day.dateString).map(t => ({
                                  id: `ptask-${p.id}-${t.id}`,
                                  text: `${p.name}: ${t.text}`,
                                  completed: t.completed,
                                  projectId: p.id,
                                  isProjectTask: true,
                                  originalTaskId: t.id
                                }))),
                                ...(dayTasks[day.dateString] || [])
                              ];

                              const hasDayTasks = dayTasksList.length > 0;
                              const hasEvent = day.hasEvent || hasDayTasks;
                              
                              const getTaskColor = (task: DayTask) => {
                                if (task.completed) return '#000000';
                                const proj = projects.find(p => p.id === task.projectId);
                                return proj ? proj.color : '#ffffff';
                              };

                              let backgroundContent = null;
                              const taskCount = dayTasksList.length;

                              if (taskCount === 1) {
                                backgroundContent = <div className="absolute inset-0" style={{ backgroundColor: getTaskColor(dayTasksList[0]) }} />;
                              } else if (taskCount === 2) {
                                backgroundContent = (
                                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                    <polygon points="0,0 100,0 0,100" fill={getTaskColor(dayTasksList[0])} />
                                    <polygon points="100,0 100,100 0,100" fill={getTaskColor(dayTasksList[1])} />
                                    <line x1="0" y1="100" x2="100" y2="0" stroke="black" strokeWidth="6" />
                                  </svg>
                                );
                              } else if (taskCount === 3) {
                                backgroundContent = (
                                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                    <rect x="0" y="0" width="100" height="33.33" fill={getTaskColor(dayTasksList[0])} />
                                    <rect x="0" y="33.33" width="100" height="33.34" fill={getTaskColor(dayTasksList[1])} />
                                    <rect x="0" y="66.67" width="100" height="33.33" fill={getTaskColor(dayTasksList[2])} />
                                    <line x1="0" y1="33.33" x2="100" y2="33.33" stroke="black" strokeWidth="6" />
                                    <line x1="0" y1="66.67" x2="100" y2="66.67" stroke="black" strokeWidth="6" />
                                  </svg>
                                );
                              } else if (taskCount >= 4) {
                                backgroundContent = (
                                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                    <polygon points="0,0 100,0 50,50" fill={getTaskColor(dayTasksList[0])} />
                                    <polygon points="100,0 100,100 50,50" fill={getTaskColor(dayTasksList[1])} />
                                    <polygon points="100,100 0,100 50,50" fill={getTaskColor(dayTasksList[2])} />
                                    <polygon points="0,100 0,0 50,50" fill={getTaskColor(dayTasksList[3])} />
                                    <line x1="0" y1="0" x2="100" y2="100" stroke="black" strokeWidth="6" />
                                    <line x1="100" y1="0" x2="0" y2="100" stroke="black" strokeWidth="6" />
                                  </svg>
                                );
                              }

                              return (
                                <div
                                  key={day.id}
                                  onClick={() => setSelectedDate(day.dateString)}
                                  className={`w-8 h-8 rounded-md cursor-pointer transition-all relative overflow-hidden ${
                                    day.isToday ? 'border-[3px] border-black' : 'border-2 border-black'
                                  } ${
                                    isSelected ? 'ring-2 ring-black z-20 scale-110' : 'z-10 hover:scale-110'
                                  } ${
                                    taskCount === 0 ? (day.isCurrentMonth ? 'bg-gray-100' : 'bg-gray-300') : ''
                                  }`}
                                  title={`${day.dateString}${hasEvent ? ' - Event Planned' : ''}${day.isToday ? ' (Today)' : ''}`}
                                >
                                  {backgroundContent}
                                  {day.isToday && taskCount > 0 && (
                                    <div className="absolute top-0.5 left-0.5 w-2 h-2 bg-white border border-black rounded-full z-10" />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
              </div>
            </div>

            {/* Selected Day To-Do List */}
            <div className="lg:w-80 p-6 border-b-[3px] lg:border-b-0 lg:border-r-[3px] border-black flex flex-col h-[400px] lg:h-auto">
              <div className="flex items-center gap-3 mb-4 border-b-2 border-black pb-4">
                <div className="p-2 bg-[#FF87F3] rounded-lg border-2 border-black">
                  <CheckSquare className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tight">{formatDate(selectedDate)}</h2>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
                {(() => {
                  const selectedDayTasks: DayTask[] = [
                    ...projects.filter(p => p.publishDate === selectedDate).map(p => ({
                      id: `pub-${p.id}`,
                      text: `Publish: ${p.name}`,
                      completed: false,
                      projectId: p.id,
                      isPublishEvent: true
                    })),
                    ...projects.flatMap(p => p.tasks.filter(t => t.dueDate === selectedDate).map(t => ({
                      id: `ptask-${p.id}-${t.id}`,
                      text: `${p.name}: ${t.text}`,
                      completed: t.completed,
                      projectId: p.id,
                      isProjectTask: true,
                      originalTaskId: t.id
                    }))),
                    ...(dayTasks[selectedDate] || [])
                  ];

                  if (selectedDayTasks.length === 0) {
                    return <p className="text-sm text-gray-500 font-bold italic mt-4 text-center">No tasks planned for this day.</p>;
                  }

                  return selectedDayTasks.map(task => {
                    const proj = projects.find(p => p.id === task.projectId);
                    const taskColor = proj ? proj.color : '#ffffff';
                    return (
                      <div key={task.id} className="flex items-start gap-3 group">
                        <button 
                          onClick={() => {
                            if (task.isPublishEvent) return;
                            if (task.isProjectTask && task.originalTaskId) {
                              setProjects(projects.map(p => p.id === task.projectId ? {
                                ...p,
                                tasks: p.tasks.map(t => t.id === task.originalTaskId ? { ...t, completed: !t.completed } : t)
                              } : p));
                            } else {
                              toggleDayTask(selectedDate, task.id);
                            }
                          }}
                          style={{ backgroundColor: task.completed ? '#000000' : taskColor }}
                          className={`w-8 h-8 border-2 border-black flex items-center justify-center shrink-0 transition-colors ${task.isPublishEvent ? 'cursor-default' : ''}`}
                        >
                          {task.completed && <X className="w-6 h-6 text-white" />}
                          {task.isPublishEvent && !task.completed && <Calendar className="w-4 h-4 text-black" />}
                        </button>
                        <span 
                          onClick={() => {
                            if (task.projectId) {
                              setActiveTab(task.projectId);
                            }
                          }}
                          className={`flex-1 text-sm font-bold pt-1.5 ${task.completed ? 'line-through text-gray-400' : 'text-black'} ${task.isPublishEvent ? 'uppercase' : ''} ${task.projectId ? 'cursor-pointer hover:underline' : ''}`}
                        >
                          {task.text}
                        </span>
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Add Task Input */}
              <div className="flex gap-2 mt-auto pt-4 border-t-2 border-black">
                <input
                  type="text"
                  value={newDayTask}
                  onChange={(e) => setNewDayTask(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddDayTask()}
                  placeholder="Add a task..."
                  className="flex-1 px-3 py-2 rounded-lg border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#FF87F3]/50 text-sm font-bold"
                />
                <button 
                  onClick={handleAddDayTask}
                  className="bg-black text-white p-2 rounded-lg hover:bg-gray-800 transition-colors border-2 border-black"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Project Selection List */}
            <div className="lg:w-64 p-6 flex flex-col bg-gray-50/50 h-[400px] lg:h-auto">
              <div className="flex items-center gap-3 mb-4 border-b-2 border-black pb-4">
                <div className="p-2 bg-[#FFB158] rounded-lg border-2 border-black">
                  <Columns className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tight">Planning</h2>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                <button
                  onClick={() => setActiveTab('channel')}
                  className={`w-full text-left px-4 py-3 rounded-xl border-[3px] border-black font-black uppercase text-[10px] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none ${activeTab === 'channel' ? 'bg-[#CCFF00] -translate-y-0.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-white hover:bg-gray-50'}`}
                >
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Channel
                  </div>
                </button>
                
                <div className="h-[2px] bg-black/10 my-2"></div>

                <div className="text-[10px] font-black uppercase text-gray-400 mb-1 ml-1">Projects</div>

                {projects.map(p => (
                  <div key={p.id} className="relative group/proj">
                    <button
                      onClick={() => setActiveTab(p.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl border-[3px] border-black font-black uppercase text-[10px] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none ${activeTab === p.id ? 'bg-[#CCFF00] -translate-y-0.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-white hover:bg-gray-50'}`}
                    >
                      <div className="flex items-center gap-2 pr-6">
                        <div className="w-3 h-3 rounded-full border border-black shrink-0" style={{ backgroundColor: p.color }} />
                        <span className="truncate">{p.name}</span>
                      </div>
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmProject(p);
                        setDeleteCheckboxChecked(false);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-red-500 opacity-0 group-hover/proj:opacity-100 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {projects.length === 0 && (
                  <p className="text-[10px] font-bold text-gray-400 italic text-center py-4">No projects yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Alerts Section */}
          {projects.some(p => p.publishDate && new Date(p.publishDate) < new Date() && p.status !== 'published') && (
            <div className="mb-8 bg-red-100 border-[3px] border-red-500 rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(239,68,68,1)] flex items-start gap-4">
              <div className="p-2 bg-red-500 rounded-lg border-2 border-black shrink-0">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-black text-red-700 uppercase tracking-tight mb-1">Projects Behind Schedule</h3>
                <div className="flex flex-wrap gap-2">
                  {projects.filter(p => p.publishDate && new Date(p.publishDate) < new Date() && p.status !== 'published').map(p => (
                    <button 
                      key={p.id}
                      onClick={() => {
                        setActiveTab(p.id);
                      }}
                      className="text-sm font-bold bg-white border-2 border-red-500 text-red-700 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      {p.name} (Due {p.publishDate.split('-').slice(1).join('/')})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Main Content Area */}
          {activeTab === 'channel' ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="rounded-2xl border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden mb-8">
                <div className="bg-[#FF87F3] px-8 py-6 border-b-[3px] border-black flex items-center gap-4">
                  <div className="p-2 bg-white rounded-xl border-[3px] border-black shadow-[4px_4px_0px_0px_black]">
                    <Target className="w-8 h-8" />
                  </div>
                  <h2 className="text-4xl font-black uppercase tracking-tight">Channel Management</h2>
                </div>
                <div className="bg-white p-8">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Channel To-Do List Section */}
                    <div className="space-y-6">
                      <SectionBox 
                        title="Channel To-Do List" 
                        icon={CheckSquare} 
                        color="#FF87F3" 
                        iconBg="white"
                        action={
                          <button 
                            onClick={handleGenerateChannelTasks}
                            disabled={isGeneratingChannelTasks}
                            className="pop-button bg-black text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-2 text-xs disabled:opacity-50 border-2 border-white"
                          >
                            {isGeneratingChannelTasks ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                            Generate Ideas
                          </button>
                        }
                      >
                        <div className="space-y-4">
                          {channelTasks.map(task => (
                            <div key={task.id} className="flex items-center gap-4 group">
                              <button 
                                onClick={() => setChannelTasks(channelTasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t))}
                                className={`w-8 h-8 border-2 border-black flex items-center justify-center shrink-0 transition-colors ${task.completed ? 'bg-black' : 'bg-white'}`}
                              >
                                {task.completed && <Check className="w-6 h-6 text-white" />}
                              </button>
                              <span className={`flex-1 font-bold ${task.completed ? 'line-through text-gray-400' : 'text-black'}`}>
                                {task.text}
                              </span>
                              <button 
                                onClick={() => setChannelTasks(channelTasks.filter(t => t.id !== task.id))}
                                className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          ))}

                          <div className="flex gap-2 pt-4 border-t-2 border-black">
                            <input
                              type="text"
                              placeholder="Add a channel task..."
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                  const newTask: ChannelTask = {
                                    id: Date.now().toString(),
                                    text: e.currentTarget.value.trim(),
                                    completed: false
                                  };
                                  setChannelTasks([...channelTasks, newTask]);
                                  e.currentTarget.value = '';
                                }
                              }}
                              className="flex-1 px-3 py-2 rounded-lg border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#FF87F3]/50 font-bold"
                            />
                          </div>
                        </div>
                      </SectionBox>

                      <SuggestionSlider 
                        items={TASK_SUGGESTIONS} 
                        color="#FF87F3"
                        onAdd={(item) => {
                          const newTask: ChannelTask = {
                            id: Date.now().toString(),
                            text: item.full,
                            completed: false
                          };
                          setChannelTasks([...channelTasks, newTask]);
                        }} 
                      />
                    </div>

                    {/* Channel Goals Section */}
                    <div className="space-y-6">
                      <SectionBox 
                        title="Channel Goals" 
                        icon={Target} 
                        color="#CCFF00" 
                        iconBg="white"
                        action={
                          <button 
                            onClick={handleAnalyzeChannelGoals}
                            disabled={isAnalyzingGoals || channelGoals.length === 0}
                            className="pop-button bg-black text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-2 text-xs disabled:opacity-50 border-2 border-white"
                          >
                            {isAnalyzingGoals ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                            Generate Ideas
                          </button>
                        }
                      >
                        <div className="space-y-4">
                          <div className="space-y-4">
                            {channelGoals.map(goal => (
                              <div key={goal.id} className="bg-white rounded-2xl border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden group">
                                <div className="p-6 border-b-[3px] border-black relative">
                                  <button 
                                    onClick={() => setChannelGoals(channelGoals.filter(g => g.id !== goal.id))}
                                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all z-10"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                  <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                      <input 
                                        type="text" 
                                        value={goal.metric}
                                        onChange={(e) => setChannelGoals(channelGoals.map(g => g.id === goal.id ? { ...g, metric: e.target.value } : g))}
                                        className="text-xl font-black uppercase bg-transparent border-b-2 border-transparent focus:border-black focus:outline-none w-full"
                                      />
                                      <div className="flex items-center gap-4 mt-2">
                                        <div className="flex flex-col">
                                          <label className="text-[10px] font-black uppercase text-gray-400">Target Value</label>
                                          <input 
                                            type="number" 
                                            value={goal.targetValue}
                                            onChange={(e) => setChannelGoals(channelGoals.map(g => g.id === goal.id ? { ...g, targetValue: parseInt(e.target.value) || 0 } : g))}
                                            className="text-sm font-bold bg-transparent focus:outline-none"
                                          />
                                        </div>
                                        <div className="flex flex-col">
                                          <label className="text-[10px] font-black uppercase text-gray-400">Current Value</label>
                                          <input 
                                            type="number" 
                                            value={goal.currentValue}
                                            onChange={(e) => setChannelGoals(channelGoals.map(g => g.id === goal.id ? { ...g, currentValue: parseInt(e.target.value) || 0 } : g))}
                                            className="text-sm font-bold bg-transparent focus:outline-none"
                                          />
                                        </div>
                                        <div className="flex flex-col">
                                          <label className="text-[10px] font-black uppercase text-gray-400">Target Date</label>
                                          <input 
                                            type="date" 
                                            value={goal.targetDate}
                                            onChange={(e) => setChannelGoals(channelGoals.map(g => g.id === goal.id ? { ...g, targetDate: e.target.value } : g))}
                                            className="text-sm font-bold bg-transparent focus:outline-none"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right ml-4">
                                      <div className="text-2xl font-black">{goal.targetValue > 0 ? Math.round((goal.currentValue / goal.targetValue) * 100) : 0}%</div>
                                      <p className="text-[10px] font-bold uppercase text-gray-400">Progress</p>
                                    </div>
                                  </div>
                                  <div className="w-full h-4 bg-gray-100 border-2 border-black rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-[#CCFF00] border-r-2 border-black transition-all duration-500"
                                      style={{ width: `${Math.min(100, goal.targetValue > 0 ? (goal.currentValue / goal.targetValue) * 100 : 0)}%` }}
                                    />
                                  </div>
                                </div>
                                
                                {(goal.analysis || goal.guidance || goal.outline) && (
                                  <div className="p-6 bg-gray-50 space-y-4">
                                    {goal.analysis && (
                                      <div>
                                        <div className="flex items-center gap-2 mb-2">
                                          <TrendingUp className="w-4 h-4 text-blue-600" />
                                          <span className="text-xs font-black uppercase">Analysis</span>
                                        </div>
                                        <p className="text-sm font-bold leading-relaxed">{goal.analysis}</p>
                                      </div>
                                    )}
                                    {goal.guidance && (
                                      <div>
                                        <div className="flex items-center gap-2 mb-2">
                                          <Zap className="w-4 h-4 text-yellow-500" />
                                          <span className="text-xs font-black uppercase">Growth Strategy</span>
                                        </div>
                                        <p className="text-sm font-bold leading-relaxed">{goal.guidance}</p>
                                      </div>
                                    )}
                                    {goal.outline && (
                                      <div className="bg-white p-4 rounded-xl border-2 border-black">
                                        <div className="flex items-center gap-2 mb-3">
                                          <Calendar className="w-4 h-4 text-[#FF87F3]" />
                                          <span className="text-xs font-black uppercase">Execution Outline</span>
                                        </div>
                                        <div className="text-sm font-bold whitespace-pre-wrap leading-relaxed">{goal.outline}</div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                            
                            <button 
                              onClick={() => {
                                const newGoal: ChannelGoal = {
                                  id: Date.now().toString(),
                                  metric: 'New Goal',
                                  targetValue: 0,
                                  currentValue: 0,
                                  targetDate: new Date().toISOString().split('T')[0]
                                };
                                setChannelGoals([...channelGoals, newGoal]);
                              }}
                              className="w-full py-4 border-2 border-dashed border-black rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                            >
                              <Plus className="w-5 h-5" />
                              Add Channel Goal
                            </button>
                          </div>
                        </div>
                      </SectionBox>

                      <SuggestionSlider 
                        items={GOAL_SUGGESTIONS} 
                        color="#CCFF00"
                        onAdd={(item) => {
                          const newGoal: ChannelGoal = {
                            id: Date.now().toString(),
                            metric: item.metric,
                            targetValue: item.target,
                            currentValue: 0,
                            targetDate: new Date(new Date().setMonth(new Date().getMonth() + 2)).toISOString().split('T')[0]
                          };
                          setChannelGoals([...channelGoals, newGoal]);
                        }} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : activeProject ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="rounded-2xl border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden mb-8">
                <div className="px-8 py-6 border-b-[3px] border-black flex flex-wrap justify-between items-center gap-6" style={{ backgroundColor: activeProject.color }}>
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white rounded-xl border-[3px] border-black shadow-[4px_4px_0px_0px_black]">
                      <Columns className="w-8 h-8" />
                    </div>
                    <input 
                      type="text" 
                      value={activeProject.name} 
                      onChange={(e) => updateActiveProject({ name: e.target.value })}
                      className="text-4xl font-black uppercase tracking-tight bg-transparent border-none focus:outline-none w-full"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-3 bg-white/20 p-2 rounded-xl border-2 border-black/20 backdrop-blur-sm">
                      <span className="font-black text-xs uppercase">Status</span>
                      <select
                        value={activeProject.status}
                        onChange={(e) => updateActiveProject({ status: e.target.value as Project['status'] })}
                        className="p-2 rounded-lg border-2 border-black focus:outline-none font-black uppercase text-xs bg-white cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      >
                        {KANBAN_COLUMNS.map(col => (
                          <option key={col.id} value={col.id}>{col.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-3 bg-white/20 p-2 rounded-xl border-2 border-black/20 backdrop-blur-sm">
                      <span className="font-black text-xs uppercase">Publish Date</span>
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-white rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <input 
                          type="date" 
                          className="p-2 rounded-lg border-2 border-black focus:outline-none font-bold text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" 
                          value={activeProject.publishDate} 
                          onChange={e => updateActiveProject({ publishDate: e.target.value })} 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8">
                  <div className="flex flex-col lg:flex-row gap-8 mb-8">
                    {/* Thumbnail */}
                    <div className="w-full lg:w-64 shrink-0 flex flex-col gap-3">
                      <label className="block font-black text-sm uppercase">Thumbnail</label>
                      <label 
                        className="aspect-video bg-gray-50 rounded-2xl border-[3px] border-black border-dashed overflow-hidden relative group cursor-pointer flex items-center justify-center hover:bg-gray-100 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const file = e.dataTransfer.files?.[0];
                          if (file && file.type.startsWith('image/')) {
                            const url = URL.createObjectURL(file);
                            updateActiveProject({ thumbnailUrl: url });
                          }
                        }}
                      >
                        {activeProject.thumbnailUrl ? (
                          <img src={activeProject.thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center p-4">
                            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <span className="font-bold text-sm text-gray-500">Drop or Click</span>
                          </div>
                        )}
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = URL.createObjectURL(file);
                              updateActiveProject({ thumbnailUrl: url });
                            }
                          }} 
                        />
                      </label>
                    </div>

                    {/* Video Title & Tags */}
                    <div className="flex-1 flex flex-col gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="block font-black text-sm uppercase">Video Title</label>
                        <input
                          type="text"
                          value={activeProject.videoTitle || activeProject.name}
                          onChange={(e) => updateActiveProject({ videoTitle: e.target.value })}
                          placeholder="Enter your YouTube video title..."
                          className="text-2xl font-black uppercase tracking-tight border-b-4 border-black focus:outline-none bg-transparent w-full pb-2"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="block font-black text-sm uppercase flex items-center gap-2">
                          <Tag className="w-4 h-4" /> Tags
                        </label>
                        <input
                          type="text"
                          value={activeProject.tags}
                          onChange={(e) => updateActiveProject({ tags: e.target.value })}
                          placeholder="Add tags (comma separated)..."
                          className="w-full p-3 rounded-xl border-[3px] border-black focus:outline-none focus:ring-4 focus:ring-gray-200 font-bold text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Description */}
                    <SectionBox title="Description" icon={AlignLeft} color="#CCFF00" iconBg="white">
                      <textarea
                        value={activeProject.description}
                        onChange={(e) => updateActiveProject({ description: e.target.value })}
                        placeholder="Project description..."
                        className="w-full h-80 p-6 rounded-2xl border-[3px] border-black resize-none focus:outline-none focus:ring-8 focus:ring-[#CCFF00]/10 text-sm font-bold shadow-[inset_4px_4px_0px_0px_rgba(0,0,0,0.05)]"
                      />
                    </SectionBox>

                    {/* Checklist */}
                    <SectionBox 
                      title="Checklist" 
                      icon={CheckSquare} 
                      color="#FF87F3" 
                      iconBg="white"
                    >
                      <div className="flex flex-col h-full">
                        {isReadyToPublish && (
                          <div className="mb-4 px-4 py-2 bg-[#CCFF00] border-[3px] border-black rounded-xl font-black text-sm uppercase tracking-wider animate-bounce shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
                            Ready to Publish!
                          </div>
                        )}
                        
                        <div className="flex-1 space-y-0 bg-gray-50 rounded-2xl border-[3px] border-black h-80 overflow-y-auto scrollbar-hide shadow-[inset_4px_4px_0px_0px_rgba(0,0,0,0.05)]">
                          {activeProject.tasks.map(task => (
                            <div key={task.id} className="flex items-center gap-4 group py-3 last:border-0 hover:bg-black/5 px-4 transition-all">
                              <div className="flex-1">
                                <span className={`text-base font-bold ${task.completed ? 'line-through text-gray-400' : 'text-black'}`}>
                                  {task.text}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="relative">
                                  <input 
                                    type="date" 
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    value={task.dueDate || ''}
                                    onChange={(e) => updateProjectTaskDate(task.id, e.target.value)}
                                  />
                                  <button className={`w-7 h-7 border-2 border-black rounded-lg flex items-center justify-center shrink-0 transition-colors hover:bg-gray-100 ${task.dueDate ? 'bg-[#CCFF00]' : 'bg-white'}`} title={task.dueDate ? `Due: ${task.dueDate}` : "Set Due Date"}>
                                    <Calendar className="w-3.5 h-3.5 text-black" />
                                  </button>
                                </div>
                                <button 
                                  onClick={() => removeProjectTask(task.id)}
                                  className="w-7 h-7 border-2 border-black rounded-lg flex items-center justify-center shrink-0 transition-colors hover:bg-red-100 bg-white"
                                  title="Remove Task"
                                >
                                  <X className="w-3.5 h-3.5 text-black" />
                                </button>
                                <button 
                                  onClick={() => toggleProjectTask(task.id)}
                                  style={{ backgroundColor: task.completed ? '#000000' : 'white' }}
                                  className={`w-7 h-7 border-2 border-black rounded-lg flex items-center justify-center shrink-0 transition-colors`}
                                >
                                  {task.completed && <Check className="w-4 h-4 text-white" />}
                                </button>
                              </div>
                            </div>
                          ))}
                          {activeProject.tasks.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8">
                              <CheckSquare className="w-12 h-12 mb-2 opacity-20" />
                              <p className="text-sm font-bold italic text-center">No tasks yet. Add some below or use AI suggestions.</p>
                            </div>
                          )}
                        </div>
                        <div className="mt-4 flex gap-2">
                          <input
                            type="text"
                            placeholder="Add a task..."
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                addProjectTask(e.currentTarget.value.trim());
                                e.currentTarget.value = '';
                              }
                            }}
                            className="flex-1 px-3 py-2 rounded-lg border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#FF87F3]/50 font-bold text-sm"
                          />
                        </div>
                      </div>
                    </SectionBox>

                    {/* Plan */}
                    <SectionBox title="Project Plan" icon={Target} color="#B197FC" iconBg="white" className="lg:col-span-2" contentClassName="h-auto">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Topic" value={activeProject.plan.topic} onChange={(e) => updateActiveProject({ plan: { ...activeProject.plan, topic: e.target.value } })} className="pop-input" />
                        <input type="text" placeholder="Description" value={activeProject.plan.description} onChange={(e) => updateActiveProject({ plan: { ...activeProject.plan, description: e.target.value } })} className="pop-input" />
                        <input type="text" placeholder="Length" value={activeProject.plan.length} onChange={(e) => updateActiveProject({ plan: { ...activeProject.plan, length: e.target.value } })} className="pop-input" />
                        <input type="text" placeholder="Audience" value={activeProject.plan.audience} onChange={(e) => updateActiveProject({ plan: { ...activeProject.plan, audience: e.target.value } })} className="pop-input" />
                        <textarea placeholder="Visual/Editing Vision" value={activeProject.plan.vision} onChange={(e) => updateActiveProject({ plan: { ...activeProject.plan, vision: e.target.value } })} className="pop-input col-span-2" />
                        <textarea placeholder="Hook/Intro Idea" value={activeProject.plan.hook} onChange={(e) => updateActiveProject({ plan: { ...activeProject.plan, hook: e.target.value } })} className="pop-input col-span-2" />
                      </div>
                    </SectionBox>

                    {/* Script */}
                    <SectionBox title="Script" icon={FileText} color="#00CCFF" iconBg="white">
                      <textarea
                        value={activeProject.script}
                        onChange={(e) => updateActiveProject({ script: e.target.value })}
                        className="w-full h-80 p-6 rounded-2xl border-[3px] border-black resize-none focus:outline-none focus:ring-8 focus:ring-[#00CCFF]/10 font-mono text-sm shadow-[inset_4px_4px_0px_0px_rgba(0,0,0,0.05)]"
                        placeholder="Start writing your script here..."
                      />
                    </SectionBox>

                    {/* Notes */}
                    <SectionBox title="Notes" icon={Zap} color="#FFB158" iconBg="white">
                      <textarea
                        value={activeProject.notes}
                        onChange={(e) => updateActiveProject({ notes: e.target.value })}
                        className="w-full h-80 p-6 rounded-2xl border-[3px] border-black resize-none focus:outline-none focus:ring-8 focus:ring-[#FFB158]/10 text-sm font-bold shadow-[inset_4px_4px_0px_0px_rgba(0,0,0,0.05)]"
                        placeholder="Add any additional notes here..."
                      />
                    </SectionBox>
                  </div>

                  {/* AI Suggestions Section */}
                  <div className="mt-12 border-t-[3px] border-black pt-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-black text-white rounded-xl border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                          <Sparkles className="w-8 h-8" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-black uppercase tracking-tight">AI Recommendations</h3>
                          <p className="text-sm font-bold text-gray-500">Smart suggestions based on your channel data</p>
                        </div>
                      </div>
                      <button
                        onClick={handleGenerateSuggestions}
                        disabled={isGeneratingSuggestions}
                        className="flex items-center justify-center gap-3 bg-[#CCFF00] text-black px-8 py-4 rounded-2xl border-[4px] border-black font-black uppercase tracking-tight hover:bg-[#b3e600] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
                      >
                        {isGeneratingSuggestions ? (
                          <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-6 h-6" />
                            Generate Ideas
                          </>
                        )}
                      </button>
                    </div>

                    {suggestions.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {suggestions.map((suggestion, index) => (
                          <div 
                            key={index}
                            className="bg-white p-6 rounded-2xl border-[3px] border-black flex flex-col justify-between gap-6 hover:translate-y-[-4px] transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                          >
                            <p className="text-base font-bold text-gray-800 leading-relaxed">{suggestion}</p>
                            <button
                              onClick={() => handleAddSuggestionToTasks(suggestion)}
                              className="w-full flex items-center justify-center gap-2 text-sm font-black uppercase tracking-tight bg-[#FF87F3] border-[3px] border-black px-4 py-3 rounded-xl hover:bg-[#ff66f0] transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
                            >
                              <Plus className="w-5 h-5" /> Add to Checklist
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 border-[3px] border-black border-dashed rounded-2xl p-12 text-center shadow-[inset_4px_4px_0px_0px_rgba(0,0,0,0.05)]">
                        <div className="w-20 h-20 bg-white rounded-full border-[3px] border-black flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                          <Sparkles className="w-10 h-10 text-gray-300" />
                        </div>
                        <h4 className="text-xl font-black uppercase mb-2">No recommendations yet</h4>
                        <p className="text-sm text-gray-500 font-bold max-w-md mx-auto">Click the button above to get AI-powered suggestions for your project based on your channel data and script.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border-[3px] border-black border-dashed rounded-2xl p-12 text-center shadow-[inset_4px_4px_0px_0px_rgba(0,0,0,0.05)]">
              <div className="w-20 h-20 bg-white rounded-full border-[3px] border-black flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Columns className="w-10 h-10 text-gray-300" />
              </div>
              <h4 className="text-xl font-black uppercase mb-2">No Project Selected</h4>
              <p className="text-sm text-gray-500 font-bold max-w-md mx-auto">Select a project from the tabs above or create a new one to view and edit details.</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmProject && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="pop-box w-full max-w-md bg-white animate-in fade-in zoom-in duration-200">
            <div className="pop-header bg-red-500 text-white">
              <span className="font-black text-xl uppercase tracking-tight">Delete Project?</span>
              <button 
                onClick={() => setDeleteConfirmProject(null)}
                className="p-1 hover:bg-black/10 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="pop-content space-y-6">
              <div className="flex items-center gap-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                <AlertTriangle className="w-10 h-10 text-red-500 shrink-0" />
                <p className="text-sm font-bold text-red-700">
                  Are you sure you want to delete <span className="font-black underline">"{deleteConfirmProject.name}"</span>? This action is permanent and cannot be undone.
                </p>
              </div>

              <label className="flex items-center gap-3 p-4 border-[3px] border-black rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <input 
                  type="checkbox" 
                  checked={deleteCheckboxChecked}
                  onChange={(e) => setDeleteCheckboxChecked(e.target.checked)}
                  className="w-6 h-6 border-[3px] border-black rounded-lg checked:bg-red-500 transition-all cursor-pointer"
                />
                <span className="font-black uppercase text-sm">I understand this is permanent</span>
              </label>

              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteConfirmProject(null)}
                  className="flex-1 pop-button bg-gray-100 text-black py-3"
                >
                  Cancel
                </button>
                <button 
                  disabled={!deleteCheckboxChecked}
                  onClick={() => {
                    const remaining = projects.filter(p => p.id !== deleteConfirmProject.id);
                    setProjects(remaining);
                    if (activeTab === deleteConfirmProject.id) {
                      setActiveTab('pipeline');
                    }
                    setDeleteConfirmProject(null);
                  }}
                  className={`flex-1 pop-button bg-red-500 text-white py-3 ${!deleteCheckboxChecked ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="pop-box w-full max-w-md bg-white animate-in fade-in zoom-in duration-200">
            <div className="pop-header bg-[#CCFF00]">
              <span className="font-black text-xl">Create New Project</span>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-black/10 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="pop-content space-y-5">
              
              {/* Photo Upload */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative w-24 h-24 rounded-full border-[3px] border-black bg-gray-100 overflow-hidden flex items-center justify-center shadow-[4px_4px_0px_0px_black]">
                  {newProjectPhoto ? (
                    <img src={newProjectPhoto} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handlePhotoUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <span className="text-sm font-bold text-gray-500 flex items-center gap-1">
                  <Upload className="w-4 h-4" /> Upload Photo
                </span>
              </div>

              <div>
                <label className="block font-black text-sm uppercase mb-2">Project Name</label>
                <input 
                  type="text" 
                  className="pop-input w-full p-3 text-lg" 
                  placeholder="e.g. VLOG #42"
                  value={newProjectName} 
                  onChange={e => setNewProjectName(e.target.value)} 
                />
              </div>

              <div>
                <label className="block font-black text-sm uppercase mb-2">Project Type</label>
                <select 
                  className="pop-input w-full p-3 text-lg capitalize"
                  value={newProjectType}
                  onChange={e => setNewProjectType(e.target.value as ProjectType)}
                >
                  <option value="long">Long Form Video</option>
                  <option value="short">Short Form Video</option>
                  <option value="post">Community Post / Graphic</option>
                </select>
              </div>

              <div>
                <label className="block font-black text-sm uppercase mb-2">Planned Publish Date</label>
                <input 
                  type="date" 
                  className="pop-input w-full p-3 text-lg" 
                  value={newProjectDate} 
                  onChange={e => setNewProjectDate(e.target.value)} 
                />
              </div>

              <div>
                <label className="block font-black text-sm uppercase mb-2">Project Color</label>
                <div className="flex gap-3">
                  {PROJECT_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setNewProjectColor(c)}
                      style={{ backgroundColor: c }}
                      className={`w-10 h-10 rounded-full border-[3px] border-black transition-transform ${newProjectColor === c ? 'scale-125 shadow-[2px_2px_0px_0px_black]' : 'hover:scale-110'}`}
                    />
                  ))}
                </div>
              </div>

              <button 
                className="pop-button w-full bg-[#FF87F3] text-black py-4 mt-2 text-lg" 
                onClick={handleCreateProject}
                disabled={!newProjectName}
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
