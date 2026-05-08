import React, { useState, useMemo } from 'react';
import { useBrain } from '../context/useBrain';
import { CustomIcon } from './CustomIcon';
import { AccordionContainer } from './Toolbox';
import {
    Calendar,
    Plus,
    ChevronLeft,
    ChevronRight,
    Target,
    Check,
    CheckSquare,
    AlignLeft,
    FileText,
    Zap,
    Sparkles,
    Loader2,
    X,
    Image as ImageIcon,
    Layout,
    LayoutGrid
} from 'lucide-react';
import { generateProjectStrategy, generateStoryboard } from '../services/gemini';
import type { Project } from '../types';

interface LocalDayTask {
    id: string;
    text: string;
    completed: boolean;
    projectId?: string;
    isPublishEvent?: boolean;
    isProjectTask?: boolean;
    originalTaskId?: string;
    color?: string;
}

const PROJECT_COLORS = ['#ff3399', '#ccff00', '#00ccff', '#ffdd00', '#9933FF', '#FF9900'];

export const ProjectStudio: React.FC = () => {
    const { brain, addProject, updateProject, setChannelHub } = useBrain();
    const [isMainToolOpen, setIsMainToolOpen] = useState(true);
    const [viewContext, setViewContext] = useState<'channel' | 'projects'>('channel');
    const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
    const [showNewProjectModal, setShowNewProjectModal] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGeneratingStoryboard, setIsGeneratingStoryboard] = useState(false);

    const [weekOffset, setWeekOffset] = useState(0);
    const [dateDisplayMode, setDateDisplayMode] = useState<'Hover' | 'Some' | 'All'>('Hover');
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [dayTasks, setDayTasks] = useState<Record<string, LocalDayTask[]>>({});
    const [newDayTask, setNewDayTask] = useState('');
    const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
    const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);

    // Form States for New Project
    const [newName, setNewName] = useState('');
    const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
    const [newColor, setNewColor] = useState(PROJECT_COLORS[0]);
    const [newTodoInput, setNewTodoInput] = useState('');
    const [newGoalInput, setNewGoalInput] = useState('');

    const channelTodos = Array.isArray(brain.channelHub?.toDos) ? brain.channelHub.toDos : [];
    const channelGoals = Array.isArray(brain.channelHub?.goals) ? brain.channelHub.goals : [];

    // Calendar logic
    const calendarData = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Start 2 weeks ago (Sunday) and apply offset
        const start = new Date(today);
        start.setDate(today.getDate() - today.getDay() - 14 + (weekOffset * 7));

        const weeks = [];
        let curr = new Date(start);
        for (let i = 0; i < 15; i++) { // Exactly 15 weeks visible
            const week = [];
            for (let j = 0; j < 7; j++) {
                const dateString = curr.toISOString().split('T')[0];
                const isToday = dateString === new Date().toISOString().split('T')[0];
                const isCurrentMonth = curr.getMonth() === new Date().getMonth();

                week.push({
                    id: dateString,
                    date: new Date(curr),
                    isToday,
                    isCurrentMonth,
                    dateString
                });
                curr.setDate(curr.getDate() + 1);
            }
            weeks.push(week);
        }
        return weeks;
    }, [weekOffset]);

    // Calculate dynamic month headers based on the visible 15 weeks
    const monthLabels = useMemo(() => {
        const labels: { month: string, flex: number }[] = [];
        let currentMonth = -1;
        calendarData.forEach((week) => {
            const weekMonth = week[0].date.getMonth();
            if (weekMonth !== currentMonth) {
                labels.push({
                    month: week[0].date.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
                    flex: 1
                });
                currentMonth = weekMonth;
            } else {
                labels[labels.length - 1].flex += 1;
            }
        });
        return labels;
    }, [calendarData]);

    const activeProject = brain.projects.find(p => p.id === activeProjectId) || null;

    const handleCreateProject = () => {
        if (!newName.trim()) return;
        const newProject: Project = {
            id: `p-${Date.now()}`,
            name: newName,
            videoTitle: newName,
            status: 'ideation',
            color: newColor,
            publishDate: newDate,
            tasks: [],
            script: '',
            description: '',
            tags: '',
            plan: {
                concept: '',
                niche: '',
                topic: '',
                description: '',
                length: '',
                audience: '',
                vision: '',
                hook: ''
            },
            storyboard: []
        };
        addProject(newProject);
        setActiveProjectId(newProject.id);
        setNewName('');
        setShowNewProjectModal(false);
    };

    const handleGenerateStrategy = async () => {
        if (!activeProject) return;
        setIsGenerating(true);
        try {
            const plan = await generateProjectStrategy(activeProject, brain.targetNiche, brain.coreConcept);
            updateProject(activeProject.id, { plan });
        } catch (error) {
            console.error('Failed to generate strategy:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAddTodo = () => {
        if (!newTodoInput.trim()) return;
        const newTodo = { id: `ct-${Date.now()}`, text: newTodoInput, completed: false };
        setChannelHub({ toDos: [...channelTodos, newTodo] });
        setNewTodoInput('');
    };

    const handleAddGoal = () => {
        if (!newGoalInput.trim()) return;
        const newGoal = { id: `cg-${Date.now()}`, text: newGoalInput, category: 'Growth', completed: false };
        setChannelHub({ goals: [...channelGoals, newGoal] });
        setNewGoalInput('');
    };

    const handleGenerateStoryboard = async () => {
        if (!activeProject || !activeProject.script) return;
        setIsGeneratingStoryboard(true);
        try {
            const storyboard = await generateStoryboard(activeProject.script);
            updateProject(activeProject.id, { storyboard });
        } catch (error) {
            console.error('Failed to generate storyboard:', error);
        } finally {
            setIsGeneratingStoryboard(false);
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const [y, m, d] = dateStr.split('-');
        const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
        const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
        const day = date.getDate();
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        return `${weekday}, ${month} ${day}`;
    };

    const handleGenerateDailyTasks = async () => {
        setIsGeneratingSuggestions(true);
        setTimeout(() => {
            setAiSuggestions([
                "Review comments from yesterday's video",
                "A/B test thumbnail for underperforming video",
                "Post a community poll",
                "Update channel banner for upcoming series"
            ]);
            setIsGeneratingSuggestions(false);
        }, 1500);
    };

    const selectedDayTasks: LocalDayTask[] = useMemo(() => {
        return [
            ...brain.projects.filter(p => p.publishDate === selectedDate).map(p => ({
                id: `pub-${p.id}`,
                text: `Publish: ${p.name}`,
                completed: false,
                projectId: p.id,
                isPublishEvent: true,
                color: p.color
            })),
            ...brain.projects.flatMap(p => (p.tasks || []).filter(t => t.dueDate === selectedDate).map(t => ({
                id: `ptask-${p.id}-${t.id}`,
                text: `${p.name}: ${t.text}`,
                completed: t.completed,
                projectId: p.id,
                isProjectTask: true,
                originalTaskId: t.id,
                color: p.color
            }))),
            ...(dayTasks[selectedDate] || []).map(t => ({ ...t, color: '#ccff00' }))
        ];
    }, [brain.projects, dayTasks, selectedDate]);

    const BigActionButton = ({ text, onClick, icon: IconComponent, colorClass = "bg-[#FF7497]", disabled = false, isSpinning = false }: any) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className="w-full h-14 bg-[#f3f4f6] border-[4px] border-black rounded-2xl overflow-hidden flex items-center group transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed shadow-[6px_6px_0px_0px_black] hover:shadow-none translate-y-0 hover:translate-y-1 hover:translate-x-1"
        >
            <div className={`bg-gray-200 h-full w-14 flex items-center justify-center border-r-[4px] border-black flex-shrink-0 group-hover:${colorClass} transition-colors`}>
                <IconComponent size={32} className={`opacity-40 group-hover:opacity-100 transition-opacity text-black ${isSpinning ? 'animate-spin' : ''}`} />
            </div>
            <div className="flex-1 flex items-center justify-center pr-14">
                <span className="text-[28px] font-[1000] uppercase tracking-tighter text-black/30 group-hover:text-black transition-colors leading-none mt-[-2px]">
                    {text}
                </span>
            </div>
        </button>
    );

    return (
        <div className="w-full max-w-[1400px] mx-auto mb-40 bg-white border-[6px] border-black rounded-2xl shadow-[12px_12px_0px_0px_black] transition-all duration-700 ease-in-out flex flex-col overflow-hidden">

            {/* 1. Header Strip */}
            <header className={`bg-[#ff3399] h-[80px] flex items-center justify-between px-0 overflow-hidden transition-all duration-700 ${isMainToolOpen ? 'border-b-[6px] border-black' : ''}`}>
                <div onClick={() => setIsMainToolOpen(!isMainToolOpen)} className="flex items-center h-full cursor-pointer">
                    <div className="bg-[#ccff00] h-full w-[80px] flex items-center justify-center border-r-[6px] border-black flex-shrink-0">
                        <CustomIcon name="analytics" size={48} className="text-black" />
                    </div>
                    <h1 className="text-[50px] font-[1000] uppercase tracking-tighter text-black pl-8 leading-none">PROJECT PLANNING</h1>
                </div>

                <div className="flex items-center gap-6 pr-6">
                    {brain.projects.length === 0 ? (
                        <button
                            onClick={() => setShowNewProjectModal(true)}
                            className="px-6 py-3 bg-black text-[#ccff00] font-[1000] uppercase tracking-tighter rounded-xl transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:scale-105"
                        >
                            START NEW PROJECT
                        </button>
                    ) : (
                        <div className="flex bg-white border-[4px] border-black p-1 rounded-xl shadow-[3px_3px_0px_0px_black]">
                            <button
                                onClick={() => setViewContext('channel')}
                                className={`px-5 py-2 text-[11px] font-[1000] uppercase tracking-tighter rounded-lg transition-all flex items-center gap-2 ${viewContext === 'channel' ? 'bg-black text-white' : 'text-black/30 hover:text-black'}`}
                            >
                                CHANNEL
                            </button>
                            <button
                                onClick={() => setViewContext('projects')}
                                className={`px-5 py-2 text-[11px] font-[1000] uppercase tracking-tighter rounded-lg transition-all flex items-center gap-2 ${viewContext === 'projects' ? 'bg-black text-white' : 'text-black/30 hover:text-black'}`}
                            >
                                PROJECTS
                            </button>
                        </div>
                    )}

                    <div onClick={() => setIsMainToolOpen(!isMainToolOpen)} className={`cursor-pointer transition-all duration-700 ease-in-out transform ${isMainToolOpen ? 'rotate-180 scale-110' : 'rotate-0 scale-100'}`}>
                        <CustomIcon name={isMainToolOpen ? "SYMBOLS 19" : "SYMBOLS 22"} size={48} className="opacity-80 hover:opacity-100 transition-opacity" />
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <div className={`grid transition-all duration-1000 ease-in-out ${isMainToolOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden flex flex-col">
                    {/* 2. Content Calendar & Daily Planner */}
                    <section className="border-b-[5px] border-black bg-white flex flex-col xl:flex-row">
                        {/* Left: Calendar Grid */}
                        <div className="flex-1 p-8 border-b-[5px] xl:border-b-0 xl:border-r-[5px] border-black overflow-hidden flex flex-col">
                            <div className="flex items-center justify-between gap-4 mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="bg-white border-[4px] border-black rounded-2xl p-2 shadow-[4px_4px_0px_0px_black]">
                                        <Calendar size={32} />
                                    </div>
                                    <h2 className="text-[32px] font-[1000] uppercase tracking-tighter leading-none hidden sm:block">Content Calendar</h2>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setDateDisplayMode(prev => prev === 'Hover' ? 'Some' : prev === 'Some' ? 'All' : 'Hover')}
                                        className="bg-white border-[3px] border-black px-4 py-2 rounded-xl text-xs font-black uppercase shadow-[2px_2px_0px_0px_black] active:shadow-none active:translate-y-1 transition-all mr-2"
                                    >
                                        Dates: {dateDisplayMode}
                                    </button>
                                    <button onClick={() => setWeekOffset(prev => prev - 1)} className="bg-white text-black p-2 rounded-xl border-[3px] border-black shadow-[2px_2px_0px_0px_black] active:shadow-none active:translate-y-1 transition-all hover:bg-gray-100">
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button onClick={() => setWeekOffset(prev => prev + 1)} className="bg-white text-black p-2 rounded-xl border-[3px] border-black shadow-[2px_2px_0px_0px_black] active:shadow-none active:translate-y-1 transition-all hover:bg-gray-100">
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="w-full pb-4 flex-1 flex flex-col">
                                <div className="flex-1 flex flex-col">
                                    <div className="flex text-sm font-black uppercase tracking-widest text-black/40 mb-2 ml-8">
                                        {monthLabels.map((m, i) => (
                                            <div key={i} style={{ flex: m.flex }} className="text-left pl-1">{m.month}</div>
                                        ))}
                                    </div>
                                    <div className="flex gap-1 flex-1">
                                        <div className="flex flex-col gap-1 text-sm font-black text-black/20 mt-[2px] w-6">
                                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                                                <div key={i} className="flex-1 flex items-center justify-center min-h-[24px]">{d}</div>
                                            ))}
                                        </div>
                                        <div className="flex flex-1 gap-1">
                                            {calendarData.map((week, i) => (
                                                <div key={i} className="flex flex-col flex-1 gap-1">
                                                    {week.map((day) => {
                                                        const isSelected = selectedDate === day.dateString;
                                                        const tasksOnDay = [
                                                            ...brain.projects.filter(p => p.publishDate === day.dateString).map(p => p.color),
                                                            ...brain.projects.flatMap(p => (p.tasks || []).filter(t => t.dueDate === day.dateString).map(t => p.color)),
                                                            ...(dayTasks[day.dateString] || []).map(() => '#ccff00')
                                                        ];

                                                        const shouldShowDate = dateDisplayMode === 'All' ||
                                                            (dateDisplayMode === 'Some' && (day.date.getDate() === 1 || day.date.getDate() % 5 === 0 || day.isToday));

                                                        let backgroundContent = null;
                                                        const taskCount = tasksOnDay.length;
                                                        if (taskCount === 1) {
                                                            backgroundContent = <div className="absolute inset-0" style={{ backgroundColor: tasksOnDay[0] }} />;
                                                        } else if (taskCount === 2) {
                                                            backgroundContent = (
                                                                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                                                    <polygon points="0,0 100,0 0,100" fill={tasksOnDay[0]} />
                                                                    <polygon points="100,0 100,100 0,100" fill={tasksOnDay[1]} />
                                                                    <line x1="0" y1="100" x2="100" y2="0" stroke="black" strokeWidth="6" />
                                                                </svg>
                                                            );
                                                        } else if (taskCount === 3) {
                                                            backgroundContent = (
                                                                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                                                    <rect x="0" y="0" width="100" height="33.33" fill={tasksOnDay[0]} />
                                                                    <rect x="0" y="33.33" width="100" height="33.34" fill={tasksOnDay[1]} />
                                                                    <rect x="0" y="66.67" width="100" height="33.33" fill={tasksOnDay[2]} />
                                                                    <line x1="0" y1="33.33" x2="100" y2="33.33" stroke="black" strokeWidth="6" />
                                                                    <line x1="0" y1="66.67" x2="100" y2="66.67" stroke="black" strokeWidth="6" />
                                                                </svg>
                                                            );
                                                        } else if (taskCount >= 4) {
                                                            backgroundContent = (
                                                                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                                                    <polygon points="0,0 100,0 50,50" fill={tasksOnDay[0]} />
                                                                    <polygon points="100,0 100,100 50,50" fill={tasksOnDay[1]} />
                                                                    <polygon points="100,100 0,100 50,50" fill={tasksOnDay[2]} />
                                                                    <polygon points="0,100 0,0 50,50" fill={tasksOnDay[3]} />
                                                                    <line x1="0" y1="0" x2="100" y2="100" stroke="black" strokeWidth="6" />
                                                                    <line x1="100" y1="0" x2="0" y2="100" stroke="black" strokeWidth="6" />
                                                                </svg>
                                                            );
                                                        }

                                                        return (
                                                            <div
                                                                key={day.id}
                                                                onClick={() => setSelectedDate(day.dateString)}
                                                                className={`flex-1 w-full aspect-square min-h-[24px] rounded-md cursor-pointer transition-all relative overflow-hidden group ${day.isToday ? 'border-[3px] border-black' : 'border-[2px] border-black'
                                                                    } ${isSelected ? 'ring-4 ring-black z-20 scale-110' : 'z-10 hover:scale-110'
                                                                    } ${taskCount === 0 ? (day.isCurrentMonth ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-50 opacity-40') : ''
                                                                    }`}
                                                            >
                                                                {backgroundContent}

                                                                {/* Date Overlay */}
                                                                <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-200 z-20 ${shouldShowDate ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 bg-black/10'}`}>
                                                                    <span className={`text-[10px] font-black drop-shadow-md ${taskCount > 0 && !day.isToday ? 'text-white mix-blend-difference' : 'text-black'}`}>
                                                                        {day.date.getDate()}
                                                                    </span>
                                                                </div>

                                                                {day.isToday && taskCount > 0 && (
                                                                    <div className="absolute top-1 left-1 w-2 h-2 bg-white border border-black rounded-full z-10" />
                                                                )}
                                                                {taskCount === 0 && day.isToday && (
                                                                    <div className="absolute inset-0 m-auto w-2 h-2 bg-black rounded-full" />
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

                        {/* Middle: Selected Day Tasks */}
                        <div className="xl:w-[360px] p-8 border-b-[5px] xl:border-b-0 xl:border-r-[5px] border-black flex flex-col bg-gray-50">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b-[3px] border-black/10">
                                <div className="p-2 bg-[#FF87F3] rounded-xl border-[3px] border-black shadow-[2px_2px_0px_0px_black]">
                                    <CheckSquare size={24} className="text-black" />
                                </div>
                                <h2 className="text-2xl font-[1000] uppercase tracking-tighter leading-none">{formatDate(selectedDate)}</h2>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-3 mb-6 pr-2 custom-scrollbar">
                                {selectedDayTasks.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center opacity-30 text-center px-4">
                                        <Calendar size={48} className="mb-4" />
                                        <p className="font-black uppercase tracking-widest text-xs">Sector Clear</p>
                                        <p className="font-bold text-[10px] mt-1">No tasks scheduled for this day.</p>
                                    </div>
                                ) : (
                                    selectedDayTasks.map(task => (
                                        <div key={task.id} className="flex items-start gap-3 group bg-white p-3 rounded-xl border-[3px] border-black shadow-[3px_3px_0px_0px_black] hover:translate-x-1 transition-all">
                                            <button
                                                onClick={() => {
                                                    if (task.isPublishEvent) return;
                                                    if (task.isProjectTask && task.originalTaskId && task.projectId) {
                                                        const proj = brain.projects.find(p => p.id === task.projectId);
                                                        if (proj) {
                                                            const updatedTasks = (proj.tasks || []).map(t => t.id === task.originalTaskId ? { ...t, completed: !t.completed } : t);
                                                            updateProject(proj.id, { tasks: updatedTasks });
                                                        }
                                                    } else {
                                                        setDayTasks(prev => ({
                                                            ...prev,
                                                            [selectedDate]: prev[selectedDate].map(t => t.id === task.id ? { ...t, completed: !t.completed } : t)
                                                        }));
                                                    }
                                                }}
                                                style={{ backgroundColor: task.completed ? '#000000' : (task.color || '#ffffff') }}
                                                className={`w-6 h-6 rounded-md border-[2px] border-black flex items-center justify-center shrink-0 transition-colors mt-0.5 ${task.isPublishEvent ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
                                            >
                                                {task.completed && <Check size={14} className="text-white" />}
                                                {task.isPublishEvent && !task.completed && <Zap size={12} className="text-black" />}
                                            </button>
                                            <div className="flex-1 min-w-0">
                                                <span className={`block text-xs font-black uppercase tracking-tight leading-tight ${task.completed ? 'line-through text-black/30' : 'text-black'}`}>
                                                    {task.text}
                                                </span>
                                                {task.projectId && (
                                                    <span className="text-[9px] font-bold text-black/40 uppercase tracking-widest mt-1 block truncate">
                                                        {task.isPublishEvent ? 'Launch Event' : 'Project Node'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="mt-auto flex gap-2">
                                <input
                                    type="text"
                                    value={newDayTask}
                                    onChange={(e) => setNewDayTask(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && newDayTask.trim()) {
                                            const newTask: LocalDayTask = { id: Date.now().toString(), text: newDayTask.trim(), completed: false };
                                            setDayTasks(prev => ({ ...prev, [selectedDate]: [...(prev[selectedDate] || []), newTask] }));
                                            setNewDayTask('');
                                        }
                                    }}
                                    placeholder="Add manual task..."
                                    className="flex-1 p-3 rounded-xl border-[3px] border-black focus:outline-none focus:ring-2 focus:ring-black text-xs font-black uppercase bg-white shadow-[2px_2px_0px_0px_black]"
                                />
                                <button
                                    onClick={() => {
                                        if (newDayTask.trim()) {
                                            const newTask: LocalDayTask = { id: Date.now().toString(), text: newDayTask.trim(), completed: false };
                                            setDayTasks(prev => ({ ...prev, [selectedDate]: [...(prev[selectedDate] || []), newTask] }));
                                            setNewDayTask('');
                                        }
                                    }}
                                    className="bg-black text-[#ccff00] p-3 rounded-xl border-[3px] border-black hover:scale-105 active:scale-95 transition-transform shadow-[2px_2px_0px_0px_black]"
                                >
                                    <Plus size={18} strokeWidth={3} />
                                </button>
                            </div>
                        </div>

                        {/* Right: AI Suggestions */}
                        <div className="xl:w-[360px] p-8 flex flex-col bg-[#ccff00]/10">
                            <div className="flex items-center justify-between mb-6 pb-4 border-b-[3px] border-black/10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-[#00d2ff] rounded-xl border-[3px] border-black shadow-[2px_2px_0px_0px_black]">
                                        <Sparkles size={24} className="text-black" />
                                    </div>
                                    <h2 className="text-2xl font-[1000] uppercase tracking-tighter leading-none">AI Tactics</h2>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-3 mb-6 pr-2 custom-scrollbar">
                                {aiSuggestions.length === 0 && !isGeneratingSuggestions ? (
                                    <div className="h-full flex flex-col items-center justify-center opacity-40 text-center px-4">
                                        <Zap size={40} className="mb-4 text-black" />
                                        <p className="font-black uppercase tracking-widest text-xs">No Tactics Loaded</p>
                                        <p className="font-bold text-[10px] mt-1 leading-tight">Scan channel telemetry to generate daily success actions.</p>
                                    </div>
                                ) : isGeneratingSuggestions ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center px-4 space-y-4">
                                        <Loader2 size={32} className="animate-spin text-black" />
                                        <p className="font-black uppercase tracking-widest text-xs animate-pulse">Consulting Oracle...</p>
                                    </div>
                                ) : (
                                    aiSuggestions.map((sug, i) => (
                                        <div key={i} className="bg-white border-[3px] border-black rounded-xl p-3 shadow-[3px_3px_0px_0px_black] group hover:-translate-y-1 transition-transform flex flex-col gap-2">
                                            <span className="text-xs font-bold leading-tight">{sug}</span>
                                            <button
                                                onClick={() => {
                                                    const newTask: LocalDayTask = { id: Date.now().toString(), text: sug, completed: false };
                                                    setDayTasks(prev => ({ ...prev, [selectedDate]: [...(prev[selectedDate] || []), newTask] }));
                                                    setAiSuggestions(prev => prev.filter((_, idx) => idx !== i));
                                                }}
                                                className="self-end bg-black text-[#00d2ff] px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1 hover:scale-105 transition-transform"
                                            >
                                                <Plus size={12} /> Add to Day
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>

                            <button
                                onClick={handleGenerateDailyTasks}
                                disabled={isGeneratingSuggestions}
                                className="w-full bg-black text-[#ccff00] py-4 rounded-xl border-[3px] border-black font-black uppercase text-sm tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-none hover:translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isGeneratingSuggestions ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
                                Generate Tactics
                            </button>
                        </div>
                    </section>

                    {/* 3. Main Tool Area (Context Dependent) */}
                    <div className="flex-1 bg-white">
	                        {viewContext === 'channel' ? (
	                            /* CHANNEL VIEW (Picture #1 Bottom) */
	                            <div className="p-10 animate-fade-in flex flex-col gap-10">
	                                <div className="grid grid-cols-2 gap-10">
                                    {/* To-Do List */}
                                    <AccordionContainer
                                        title="CHANNEL TO-DO LIST"
                                        icon={<CheckSquare size={32} />}
                                        headerColor="bg-[#ff3399]"
                                        iconBoxColor="bg-white"
                                        isOpenInitial={true}
                                    >
                                        <div className="space-y-6">
                                            <div className="flex gap-2">
                                                <input
                                                    value={newTodoInput}
                                                    onChange={(e) => setNewTodoInput(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
                                                    placeholder="Add a channel task..."
                                                    className="pop-input w-full p-3 border-[3px] text-sm rounded-lg"
                                                />
                                                <button onClick={handleAddTodo} className="bg-black text-white px-4 rounded-xl font-black shadow-[2px_2px_0px_0px_black]"><Plus /></button>
                                            </div>
                                            <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                                {channelTodos.map(todo => (
                                                    <div key={todo.id} className="p-3 border-[3px] border-black rounded-lg flex items-center justify-between group bg-white shadow-[3px_3px_0px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                                                        <span className="font-bold uppercase text-sm">{todo.text}</span>
                                                        <CheckSquare size={18} className="opacity-20 group-hover:opacity-100 cursor-pointer" />
                                                    </div>
                                                ))}
                                                {channelTodos.length === 0 && (
                                                    <div className="min-h-[200px] border-[3px] border-black border-dashed rounded-[32px] bg-gray-50/50 flex items-center justify-center grayscale opacity-20">
                                                        <p className="font-black uppercase italic">No tasks active</p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="pt-2">
                                                <BigActionButton text="GENERATE IDEAS" onClick={() => { }} icon={Sparkles} colorClass="bg-[#ccff00]" />
                                            </div>
                                        </div>
                                    </AccordionContainer>

                                    {/* Goals List */}
                                    <AccordionContainer
                                        title="CHANNEL GOALS"
                                        icon={<Target size={32} />}
                                        headerColor="bg-[#ccff00]"
                                        iconBoxColor="bg-white"
                                        isOpenInitial={true}
                                    >
                                        <div className="space-y-6">
                                            <div className="flex gap-2">
                                                <input
                                                    value={newGoalInput}
                                                    onChange={(e) => setNewGoalInput(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleAddGoal()}
                                                    placeholder="Add a channel goal..."
                                                    className="pop-input w-full p-3 border-[3px] text-sm rounded-lg"
                                                />
                                                <button onClick={handleAddGoal} className="bg-black text-white px-4 rounded-xl font-black shadow-[2px_2px_0px_0px_black]"><Plus /></button>
                                            </div>
                                            <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                                {channelGoals.map(goal => (
                                                    <div key={goal.id} className="p-3 border-[3px] border-black rounded-lg flex items-center justify-between group bg-white shadow-[3px_3px_0px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                                                        <div className="flex flex-col">
                                                            <span className="font-black uppercase text-[10px] opacity-30 leading-none mb-1">{goal.category}</span>
                                                            <span className="font-bold uppercase text-sm">{goal.text}</span>
                                                        </div>
                                                        <Target size={18} className="opacity-20 group-hover:opacity-100 cursor-pointer" />
                                                    </div>
                                                ))}
                                                {channelGoals.length === 0 && (
                                                    <div className="min-h-[200px] border-[3px] border-black border-dashed rounded-[32px] bg-gray-50 flex flex-col items-center justify-center opacity-30 scale-90 grayscale">
                                                        <Plus size={48} className="mb-4" />
                                                        <p className="font-black uppercase tracking-widest text-sm text-center">No Goals Defined</p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="pt-2">
                                                <BigActionButton text="GENERATE IDEAS" onClick={() => { }} icon={Sparkles} colorClass="bg-[#ff3399]" />
                                            </div>
                                        </div>
                                    </AccordionContainer>
                                </div>
                            </div>
                        ) : (
                            /* PROJECTS VIEW */
                            <div className="p-10 animate-fade-in flex flex-col gap-10">
                                {activeProjectId ? (
                                    /* DETAILED PROJECT */
                                    <div className="space-y-16 animate-fade-in">
                                        {/* 1. Metadata Top Section (Picture #1) */}
                                        <div className="grid grid-cols-[460px_1fr] gap-12">
                                            <div className="relative group h-full">
                                                <div className="w-full h-full aspect-video border-[5px] border-black border-dashed rounded-[48px] bg-gray-50 flex flex-col items-center justify-center transition-all hover:bg-gray-100 cursor-pointer overflow-hidden shadow-[12px_12px_0px_0px_black] group-hover:shadow-none translate-y-0 group-hover:translate-y-2 group-hover:translate-x-2">
                                                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                                                        <ImageIcon size={80} className="opacity-10 mb-4" />
                                                    </div>
                                                    <div className="relative z-10 flex flex-col items-center">
                                                        <div className="bg-white border-[4px] border-black p-4 rounded-full shadow-[4px_4px_0px_0px_black] mb-4">
                                                            <Plus size={32} />
                                                        </div>
                                                        <span className="font-black uppercase tracking-widest text-sm opacity-30">DROP OR CLICK</span>
                                                    </div>
                                                    <div className="absolute top-6 left-10 overflow-hidden">
                                                        <span className="font-black uppercase tracking-tighter text-xs opacity-20">THUMBNAIL PREVIEW</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col justify-between py-2">
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-4">
                                                        <button onClick={() => setActiveProjectId(null)} className="bg-black text-white border-[3px] border-black rounded-2xl p-3 hover:scale-110 transition-transform shadow-[4px_4px_0px_0px_gray]">
                                                            <LayoutGrid size={28} />
                                                        </button>
                                                        <label className="font-black uppercase text-xs tracking-[0.4em] text-black/20">VIDEO TITLE</label>
                                                    </div>
                                                    <input
                                                        className="w-full text-7xl font-[1000] uppercase tracking-tighter leading-[0.9] border-b-[8px] border-black pb-6 bg-transparent outline-none focus:border-[#ff3399] transition-colors"
                                                        value={activeProject?.videoTitle}
                                                        onChange={(e) => updateProject(activeProject!.id, { videoTitle: e.target.value })}
                                                        placeholder="ENTER TITLE..."
                                                    />
                                                </div>
                                                <div className="space-y-4">
                                                    <label className="font-black uppercase text-xs tracking-[0.4em] text-black/30 ml-2">SEARCH TAGS</label>
                                                    <div className="border-[5px] border-black rounded-[32px] p-8 shadow-[12px_12px_0px_0px_black] bg-white">
                                                        <input
                                                            className="w-full bg-transparent outline-none font-bold text-2xl uppercase tracking-tight placeholder:text-black/10"
                                                            placeholder="tech, news, review, ai, creator..."
                                                            value={activeProject?.tags}
                                                            onChange={(e) => updateProject(activeProject!.id, { tags: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 2. Tool Grid (Picture #2 & #3) */}
                                        <div className="grid grid-cols-2 gap-8 items-start">
                                            {/* Left Column */}
                                            <div className="flex flex-col">
                                                <AccordionContainer title="Description" icon={<AlignLeft size={32} />} headerColor="bg-[#ccff00]" iconBoxColor="bg-white" isOpenInitial={true}>
                                                    <div className="space-y-4">
                                                        <textarea
                                                            className="w-full min-h-[200px] p-0 bg-transparent outline-none font-bold text-sm resize-none border-none placeholder:text-black/10 text-black leading-relaxed"
                                                            placeholder="Project description..."
                                                            value={activeProject?.description}
                                                            onChange={(e) => updateProject(activeProject!.id, { description: e.target.value })}
                                                        />
                                                    </div>
                                                </AccordionContainer>

                                                <AccordionContainer title="Checklist" icon={<CheckSquare size={32} />} headerColor="bg-[#ff3399]" iconBoxColor="bg-white" isOpenInitial={true}>
                                                    <div className="space-y-4">
                                                        <div className="flex gap-4 mb-4 pb-4 border-b-2 border-black/10">
                                                            <div className="flex-1">
                                                                <span className="text-[10px] font-black uppercase text-black/30 tracking-[0.2em] pl-1">STATUS</span>
                                                                <select
                                                                    className="pop-input w-full p-3 border-[3px] text-xs font-black uppercase rounded-lg bg-white shadow-[2px_2px_0px_0px_black] outline-none cursor-pointer"
                                                                    value={activeProject?.status}
                                                                    onChange={(e) => updateProject(activeProject!.id, { status: e.target.value as any })}
                                                                >
                                                                    <option value="ideation">IDEATION</option>
                                                                    <option value="scripting">SCRIPTING</option>
                                                                    <option value="producing">PRODUCING</option>
                                                                </select>
                                                            </div>
                                                            <div className="flex-1">
                                                                <span className="text-[10px] font-black uppercase text-black/30 tracking-[0.2em] pl-1">PUBLISH DATE</span>
                                                                <input
                                                                    type="date"
                                                                    className="pop-input w-full p-3 border-[3px] text-xs font-black uppercase rounded-lg bg-white shadow-[2px_2px_0px_0px_black] outline-none cursor-pointer"
                                                                    value={activeProject?.publishDate}
                                                                    onChange={(e) => updateProject(activeProject!.id, { publishDate: e.target.value })}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-2">
                                                            {(activeProject?.tasks || []).map((task, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    onClick={() => {
                                                                        if (!activeProject) return;
                                                                        const newTasks = (activeProject.tasks || []).map(t => t.id === task.id ? { ...t, completed: !t.completed } : t);
                                                                        updateProject(activeProject.id, { tasks: newTasks });
                                                                    }}
                                                                    className="flex items-center gap-3 group hover:translate-x-1 transition-transform cursor-pointer bg-gray-50 border-[2px] border-black p-3 rounded-lg"
                                                                >
                                                                    <div className={`w-6 h-6 border-[2px] border-black rounded-md flex items-center justify-center transition-all ${task.completed ? 'bg-[#ff3399]' : 'bg-white shadow-[2px_2px_0px_0px_black] group-hover:shadow-none translate-y-0 group-hover:translate-y-[1px]'}`}>
                                                                        {task.completed && <Check size={14} className="text-white" />}
                                                                    </div>
                                                                    <span className={`font-black uppercase text-xs leading-none tracking-tight ${task.completed ? 'line-through opacity-30' : ''}`}>{task.text}</span>
                                                                </div>
                                                            ))}
                                                            {(activeProject?.tasks || []).length === 0 && (
                                                                <div className="h-full flex items-center justify-center opacity-10 py-4">
                                                                    <CheckSquare size={32} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="mt-4 pt-4 border-t-[2px] border-dashed border-black/10 flex gap-2 shrink-0">
                                                            <input
                                                                className="pop-input w-full p-3 border-[3px] text-sm rounded-lg"
                                                                placeholder="Add next step..."
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        const val = (e.target as HTMLInputElement).value;
                                                                        if (val) {
                                                                            updateProject(activeProject!.id, { tasks: [...(activeProject!.tasks || []), { id: Date.now().toString(), text: val, completed: false }] });
                                                                            (e.target as HTMLInputElement).value = '';
                                                                        }
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </AccordionContainer>
                                            </div>

                                            {/* Right Column */}
                                            <div className="flex flex-col gap-6">
                                                <AccordionContainer title="Script" icon={<FileText size={32} />} headerColor="bg-[#00ccff]" iconBoxColor="bg-white" isOpenInitial={true}>
                                                    <textarea
                                                        className="w-full h-[300px] p-0 bg-transparent outline-none font-bold text-sm resize-none border-none placeholder:text-black/10 text-black leading-relaxed"
                                                        placeholder="Start writing your script here..."
                                                        value={activeProject?.script}
                                                        onChange={(e) => updateProject(activeProject!.id, { script: e.target.value })}
                                                    />
                                                </AccordionContainer>

                                                <AccordionContainer title="Notes" icon={<Zap size={32} />} headerColor="bg-[#FF9900]" iconBoxColor="bg-white">
                                                    <textarea
                                                        className="w-full h-[300px] p-0 bg-transparent outline-none font-bold text-sm resize-none border-none placeholder:text-black/10 text-black leading-relaxed"
                                                        placeholder="Add any additional notes here..."
                                                        value={activeProject?.notes}
                                                        onChange={(e) => updateProject(activeProject!.id, { notes: e.target.value })}
                                                    />
                                                </AccordionContainer>
                                            </div>
                                        </div>

                                        <div className="space-y-6 mt-6">
                                            <AccordionContainer title="STRATEGY ENGINE" icon={<Target size={32} />} headerColor="bg-[#9933FF]" iconBoxColor="bg-white">
                                                <div className="grid grid-cols-2 gap-6 pb-4">
                                                    {(['topic', 'description', 'length', 'audience'] as const).map(f => (
                                                        <div key={f} className="border-[3px] border-black rounded-xl p-4 bg-white flex flex-col gap-1 transition-all shadow-[3px_3px_0px_0px_black] group">
                                                            <span className="text-[9px] font-black uppercase tracking-widest opacity-30 leading-none">{f}</span>
                                                            <input
                                                                className="bg-transparent outline-none font-black uppercase text-sm w-full pt-1"
                                                                value={activeProject?.plan?.[f] || ''}
                                                                onChange={(e) => updateProject(activeProject!.id, {
                                                                    plan: {
                                                                        concept: activeProject?.plan?.concept || '',
                                                                        niche: activeProject?.plan?.niche || '',
                                                                        ...activeProject?.plan,
                                                                        [f]: e.target.value
                                                                    }
                                                                })}
                                                                placeholder={`Specify ${f}...`}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                                <BigActionButton
                                                    text={isGenerating ? "GENERATING..." : "GENERATE PRODUCTION ARCHITECTURE"}
                                                    onClick={handleGenerateStrategy}
                                                    icon={Sparkles}
                                                    colorClass="bg-[#ccff00]"
                                                    disabled={isGenerating}
                                                    isSpinning={isGenerating}
                                                />
                                            </AccordionContainer>

                                            <AccordionContainer title="VISUAL STORYBOARD" icon={<CustomIcon name="video" size={32} />} headerColor="bg-[#ff3399]" iconBoxColor="bg-white">
                                                <div className="space-y-8">
                                                    {activeProject?.storyboard && activeProject.storyboard.length > 0 ? (
                                                        <div className="grid grid-cols-3 gap-6">
                                                            {activeProject.storyboard.map((scene, idx) => (
                                                                <div key={scene.id} className="bg-white border-[3px] border-black rounded-2xl overflow-hidden shadow-[6px_6px_0px_0px_black] group transition-all">
                                                                    <div className="aspect-video bg-black/5 border-b-[3px] border-black relative">
                                                                        {scene.imageUrl ? <img src={scene.imageUrl} className="w-full h-full object-cover" alt="" /> : <ImageIcon size={32} className="opacity-20 absolute inset-0 m-auto" />}
                                                                    </div>
                                                                    <div className="p-4">
                                                                        <h5 className="font-black uppercase text-xs truncate mb-2">{scene.name}</h5>
                                                                        <div className="flex justify-between items-center text-[10px] font-black opacity-30 uppercase">
                                                                            <span>{scene.durationEstimate}S</span>
                                                                            <span>{scene.emotionScore}% ENERGY</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="h-40 border-[4px] border-black border-dashed rounded-[32px] flex items-center justify-center opacity-20 italic font-black uppercase text-sm">Storyboard empty. Generate from script.</div>
                                                    )}
                                                    <BigActionButton
                                                        text={isGeneratingStoryboard ? "MAPPING..." : "MAP VISUALS FROM SCRIPT"}
                                                        onClick={handleGenerateStoryboard}
                                                        icon={Sparkles}
                                                        colorClass="bg-[#00ccff]"
                                                        disabled={isGeneratingStoryboard || !activeProject?.script}
                                                        isSpinning={isGeneratingStoryboard}
                                                    />
                                                </div>
                                            </AccordionContainer>
                                        </div>
                                    </div>
                                ) : (
                                    /* PROJECT LIST (If no project selected) */
                                    <div className="animate-fade-in flex flex-col gap-10">
                                        <BigActionButton text="NEW PROJECT" onClick={() => setShowNewProjectModal(true)} icon={Plus} colorClass="bg-[#00ccff]" />
                                        <div className="grid grid-cols-3 gap-10">
                                            {brain.projects.map(p => (
                                                <div
                                                    key={p.id}
                                                    onClick={() => setActiveProjectId(p.id)}
                                                    className="bg-white border-[5px] border-black rounded-[40px] shadow-[8px_8px_0px_0px_black] p-10 cursor-pointer hover:-translate-y-2 transition-all group"
                                                >
                                                    <div className="w-16 h-16 border-[4px] border-black rounded-[24px] mb-6 shadow-[4px_4px_0px_0px_black] flex items-center justify-center" style={{ backgroundColor: p.color }}>
                                                        <Layout size={32} className="text-black/40 group-hover:scale-110 transition-transform" />
                                                    </div>
                                                    <h3 className="text-3xl font-[1000] uppercase tracking-tighter leading-none mb-4 group-hover:text-[#ff3399] transition-colors">{p.name}</h3>
                                                    <p className="text-xs font-black uppercase text-black/30 tracking-widest">{p.status} | {p.publishDate}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. New Project Modal (Picture #2) */}
                {showNewProjectModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-8 animate-in fade-in duration-300">
                        <div className="bg-white border-[6px] border-black rounded-[48px] shadow-[24px_24px_0px_0px_black] w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-500">
                            <div className="bg-[#ff3399] p-8 border-b-[6px] border-black flex justify-between items-center">
                                <h2 className="text-4xl font-[1000] uppercase tracking-tighter italic text-black">CREATE NEW PROJECT</h2>
                                <button onClick={() => setShowNewProjectModal(false)} className="bg-white text-black p-2 rounded-xl border-[4px] border-black hover:scale-110 transition-transform">
                                    <X size={32} />
                                </button>
                            </div>
                            <div className="p-12 space-y-8">
                                <div className="flex flex-col items-center">
                                    <div className="w-32 h-32 bg-gray-100 border-[4px] border-black rounded-full flex items-center justify-center shadow-[6px_6px_0px_0px_black] mb-4">
                                        <ImageIcon size={48} className="text-black/20" />
                                    </div>
                                    <button className="text-[10px] font-black uppercase flex items-center gap-2 tracking-widest bg-black text-white px-4 py-1 rounded-full border-2 border-black">
                                        <Plus size={14} /> Upload Photo
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-2">PROJECT NAME</label>
                                        <input
                                            placeholder="e.g. VLOG #42"
                                            className="w-full text-3xl p-6 border-[4px] border-black rounded-[32px] font-[1000] uppercase tracking-tighter outline-none shadow-[8px_8px_0px_0px_black] focus:translate-x-1 focus:translate-y-1 focus:shadow-none transition-all"
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-2">PROJECT TYPE</label>
                                        <select className="w-full p-6 border-[4px] border-black rounded-[32px] font-[1000] uppercase tracking-tighter outline-none shadow-[8px_8px_0px_0px_black] appearance-none cursor-pointer">
                                            <option>Long Form Video</option>
                                            <option>YouTube Short</option>
                                            <option>Series / Playlist</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-2">PLANNED PUBLISH DATE</label>
                                        <input
                                            type="date"
                                            className="w-full p-6 border-[4px] border-black rounded-[32px] font-[1000] uppercase tracking-tighter outline-none shadow-[8px_8px_0px_0px_black] cursor-pointer"
                                            value={newDate}
                                            onChange={(e) => setNewDate(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-2">PROJECT COLOR</label>
                                        <div className="flex gap-4">
                                            {PROJECT_COLORS.map(c => (
                                                <button
                                                    key={c}
                                                    onClick={() => setNewColor(c)}
                                                    className={`w-14 h-14 rounded-full border-[4px] border-black shadow-[4px_4px_0px_0px_black] transition-all hover:scale-110 active:scale-95 ${newColor === c ? 'scale-110 shadow-[8px_8px_0px_0px_black] border-dashed' : ''}`}
                                                    style={{ backgroundColor: c }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCreateProject}
                                    className="w-full bg-[#ff3399] text-black border-[5px] border-black py-8 rounded-[40px] font-[1000] text-3xl uppercase tracking-tighter shadow-[12px_12px_0px_0px_black] transition-all hover:bg-[#ff3399]/80 active:shadow-none active:translate-y-2 active:translate-x-2"
                                >
                                    INITIALIZE PROJECT
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
