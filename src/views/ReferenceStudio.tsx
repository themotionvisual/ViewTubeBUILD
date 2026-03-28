import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { generateThumbnail, rateThumbnail, generateThumbnailConcept } from '../services/gemini';
import { AspectRatio, ImageSize, type ThumbnailHistoryItem } from '../types';
import { useBrain } from '../context/GlobalDataContext';
import { CustomIcon } from '../components/CustomIcon';
import { AccordionContainer } from '../components/AccordionContainer';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from 'recharts';

const ProjectStudio = React.lazy(() =>
    import('../components/ProjectStudio').then(module => ({ default: module.ProjectStudio }))
);
const NativeUIKit = React.lazy(() =>
    import('../components/NativeUIKit').then(module => ({ default: module.NativeUIKit }))
);
const UIReferenceLibraryContent = React.lazy(() => import('../components/UIReferenceLibraryContent'));

type ReferenceTab = 'curated' | 'thumbnail' | 'project' | 'matrix' | 'library' | 'native';

interface ReferenceImage {
    id: string;
    file: File;
    previewUrl: string;
    usageType: string;
}

interface MegaDroppedImage {
    id: string;
    file: File;
    previewUrl: string;
}

interface MegaRowLayout {
    id: number;
    stage: string;
    title: string;
    widths: number[];
    tone: string;
}

const MEGA_ROW_PATTERNS: number[][] = [
    [3, 2, 1],
    [1, 1, 1, 1],
    [2, 1],
    [1, 2, 1],
    [2, 2, 1],
    [1, 1, 2],
    [4, 1, 1],
    [2, 1, 1, 1],
    [3, 1],
    [1, 1, 1, 2],
    [2, 3],
    [1, 2, 2],
    [2, 1, 2],
    [3, 1, 1],
    [1, 3, 1],
    [2, 2, 2],
    [1, 1, 3],
    [4, 2],
    [2, 1, 1, 2],
    [3, 2, 2]
];

const MEGA_STAGES = ['Signal', 'Routing', 'Formatting', 'Behavior', 'Delivery'];
const MEGA_TONES = ['#00CCFF', '#CCFF00', '#FF7497', '#FFDD00', '#FFB158'];
const CAUSE_EFFECT_STEPS = [
    'Capture Inputs',
    'Normalize Rules',
    'Apply Format Logic',
    'Resolve Dependencies',
    'Render Interactive Output',
    'Track Feedback Loop'
];

const BEST_COMPONENTS = [
    {
        id: 'shell',
        title: 'Thumbnail Studio Shell',
        source: 'Header + Accordion composition',
        reason: 'Best visual hierarchy and interaction density.',
        tab: 'thumbnail' as const,
        accent: 'bg-[#FFE357]'
    },
    {
        id: 'project',
        title: 'Project Studio Core',
        source: 'Calendar + tasks + AI tactic rail',
        reason: 'Strongest operational workflow block.',
        tab: 'project' as const,
        accent: 'bg-[#FF7497]'
    },
    {
        id: 'matrix',
        title: 'Mega Toolbox Matrix',
        source: 'Cause-effect layouts + data table engine',
        reason: 'Most scalable container pattern.',
        tab: 'matrix' as const,
        accent: 'bg-[#00CCFF]'
    },
    {
        id: 'library',
        title: 'Reference Library',
        source: 'Section C + Section E components',
        reason: 'Primary source of reusable UI choices.',
        tab: 'library' as const,
        accent: 'bg-[#B14AED]'
    },
    {
        id: 'native',
        title: 'Native UI Kit',
        source: 'Integrated standalone component kit',
        reason: 'Fastest path to consistent production styling.',
        tab: 'native' as const,
        accent: 'bg-[#CCFF00]'
    }
];

const REFERENCE_TABS: { id: ReferenceTab; label: string; accent: string }[] = [
    { id: 'curated', label: 'Curated', accent: 'bg-[#B14AED]' },
    { id: 'thumbnail', label: 'Thumbnail', accent: 'bg-[#FFE357]' },
    { id: 'project', label: 'Project', accent: 'bg-[#FF7497]' },
    { id: 'matrix', label: 'Matrix', accent: 'bg-[#00CCFF]' },
    { id: 'library', label: 'Library', accent: 'bg-[#B14AED]' },
    { id: 'native', label: 'Native Kit', accent: 'bg-[#CCFF00]' }
];

const ReferenceStudio: React.FC = () => {
    const { brain } = useBrain();

    // Tab State
    const [activeTab, setActiveTab] = useState<'generate' | 'analyze'>('generate');
    const [isMainToolOpen, setIsMainToolOpen] = useState(true);
    const [activeReferenceTab, setActiveReferenceTab] = useState<ReferenceTab>('curated');

    // Loading States
    const [genLoading, setGenLoading] = useState(false);
    const [conceptLoading, setConceptLoading] = useState(false);
    const [analyzeLoading, setAnalyzeLoading] = useState(false);

    // Core States
    const [prompt, setPrompt] = useState('');
    const [largeText, setLargeText] = useState('');
    const [smallText, setSmallText] = useState('');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.LANDSCAPE_16_9);
    const [imageSize, setImageSize] = useState<ImageSize>(ImageSize.SIZE_1K);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [history, setHistory] = useState<ThumbnailHistoryItem[]>([]);

    // Advanced States
    const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
    const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([]);
    const [palette, setPalette] = useState<string[]>(['#C9F830', '#FF7497', '', '', '']);

    // Analyzer States
    const [analysisFile, setAnalysisFile] = useState<File | null>(null);
    const [analysisPreview, setAnalysisPreview] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Mega Toolbox States
    const [activeCauseStep, setActiveCauseStep] = useState(1);
    const [impactBias, setImpactBias] = useState(64);
    const [globalFormat, setGlobalFormat] = useState<'compact' | 'balanced' | 'expanded'>('balanced');
    const [megaFilter, setMegaFilter] = useState<'all' | 'signal' | 'delivery'>('all');
    const [megaDroppedImages, setMegaDroppedImages] = useState<MegaDroppedImage[]>([]);
    const [draggingMegaImageId, setDraggingMegaImageId] = useState<string | null>(null);
    const [activeMegaCells, setActiveMegaCells] = useState<Record<string, boolean>>({});
    const megaImageInputRef = useRef<HTMLInputElement>(null);
    const megaImagesRef = useRef<MegaDroppedImage[]>([]);

    const THUMBNAIL_STYLES = [
        "Educational", "Clickbait", "Cinematic", "Graphic", "Simplified",
        "Mysterious", "Minimalist", "Vibrant", "Dark & Moody", "Retro/Vintage",
        "Futuristic", "Hand-drawn"
    ];

    const currentSeoResult = brain.seoState?.results?.[0] || null;

    const megaRows = useMemo<MegaRowLayout[]>(
        () =>
            MEGA_ROW_PATTERNS.map((widths, index) => {
                const stage = MEGA_STAGES[index % MEGA_STAGES.length];
                return {
                    id: index + 1,
                    stage,
                    title: `${stage} Interaction Matrix ${String(index + 1).padStart(2, '0')}`,
                    widths,
                    tone: MEGA_TONES[index % MEGA_TONES.length]
                };
            }),
        []
    );

    const filteredMegaRows = useMemo(() => {
        if (megaFilter === 'all') return megaRows;
        if (megaFilter === 'signal') return megaRows.filter((_, idx) => idx % 2 === 0);
        return megaRows.filter((_, idx) => idx % 2 === 1);
    }, [megaRows, megaFilter]);

    const impactTrendData = useMemo(
        () =>
            CAUSE_EFFECT_STEPS.map((_, index) => {
                const phase = index + 1;
                const influence = Math.round(
                    impactBias + phase * 4 + (activeCauseStep >= phase ? 9 : -4) + ((phase % 2) * 3 - 1)
                );
                const stability = Math.max(24, Math.round(98 - phase * 6 + (activeCauseStep >= phase ? 3 : -6)));
                return {
                    phase: `S${phase}`,
                    influence,
                    stability
                };
            }),
        [activeCauseStep, impactBias]
    );

    const outputMixData = useMemo(
        () =>
            ['Charts', 'Tables', 'State Flows', 'Media Rails', 'Function Buses'].map((label, index) => ({
                label,
                value: Math.max(
                    12,
                    Math.round(
                        impactBias / 2 +
                            index * 7 +
                            (index + 1 <= activeCauseStep ? 12 : -2) +
                            (globalFormat === 'expanded' ? 8 : globalFormat === 'compact' ? -4 : 2)
                    )
                )
            })),
        [activeCauseStep, globalFormat, impactBias]
    );

    useEffect(() => {
        megaImagesRef.current = megaDroppedImages;
    }, [megaDroppedImages]);

    useEffect(() => {
        return () => {
            megaImagesRef.current.forEach(image => URL.revokeObjectURL(image.previewUrl));
        };
    }, []);

    // Automation: Auto-Refine
    useEffect(() => {
        const autoGen = async () => {
            if (currentSeoResult && !prompt && !conceptLoading) {
                setConceptLoading(true);
                try {
                    const concept = await generateThumbnailConcept(currentSeoResult);
                    setPrompt(concept.prompt);
                    setAspectRatio(concept.aspectRatio);
                } catch {
                    console.error("Failed to auto-gen concept");
                } finally {
                    setConceptLoading(false);
                }
            }
        };
        if (currentSeoResult && prompt === '') autoGen();
    }, [currentSeoResult, prompt, conceptLoading]);

    const handleManualConceptGen = async () => {
        if (!currentSeoResult && !prompt) return;
        setConceptLoading(true);
        try {
            const concept = await generateThumbnailConcept(currentSeoResult || undefined, prompt);
            setPrompt(concept.prompt);
            setAspectRatio(concept.aspectRatio);
        } catch {
            alert("Failed to generate concept.");
        } finally {
            setConceptLoading(false);
        }
    };

    const handleStyleToggle = (style: string) => {
        setSelectedStyles(prev => {
            if (prev.includes(style)) return prev.filter(s => s !== style);
            if (prev.length >= 4) return prev;
            return [...prev, style];
        });
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            const newImages = files.map(file => ({
                id: crypto.randomUUID(),
                file,
                previewUrl: URL.createObjectURL(file),
                usageType: 'background'
            }));
            setReferenceImages(prev => [...prev, ...newImages]);
        }
    }, []);

    const handleDragOver = (e: React.DragEvent) => e.preventDefault();

    const addMegaImages = useCallback((files: File[]) => {
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        if (!imageFiles.length) return;

        const uploaded = imageFiles.map(file => ({
            id: crypto.randomUUID(),
            file,
            previewUrl: URL.createObjectURL(file)
        }));

        setMegaDroppedImages(prev => [...uploaded, ...prev].slice(0, 18));
    }, []);

    const handleMegaToolboxDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        addMegaImages(Array.from(e.dataTransfer.files));
    }, [addMegaImages]);

    const handleMegaToolboxDragOver = (e: React.DragEvent) => e.preventDefault();

    const handleMegaImageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        addMegaImages(Array.from(e.target.files));
        e.target.value = '';
    };

    const removeMegaImage = (id: string) => {
        setMegaDroppedImages(prev => {
            const toRemove = prev.find(img => img.id === id);
            if (toRemove) URL.revokeObjectURL(toRemove.previewUrl);
            return prev.filter(img => img.id !== id);
        });
    };

    const reorderMegaImages = (targetId: string) => {
        if (!draggingMegaImageId || draggingMegaImageId === targetId) return;
        setMegaDroppedImages(prev => {
            const from = prev.findIndex(img => img.id === draggingMegaImageId);
            const to = prev.findIndex(img => img.id === targetId);
            if (from < 0 || to < 0) return prev;
            const next = [...prev];
            const [moved] = next.splice(from, 1);
            next.splice(to, 0, moved);
            return next;
        });
        setDraggingMegaImageId(null);
    };

    const toggleMegaCell = (cellId: string) => {
        setActiveMegaCells(prev => ({ ...prev, [cellId]: !prev[cellId] }));
    };

    const handleGenerate = async () => {
        if (!prompt) return;
        setGenLoading(true);
        try {
            const img = await generateThumbnail(prompt, aspectRatio, imageSize, largeText, smallText);
            setGeneratedImage(img);
            setHistory([{ id: crypto.randomUUID(), url: img, prompt: prompt, timestamp: Date.now() }, ...history]);
        } catch {
            alert('Generation Failed.');
        } finally {
            setGenLoading(false);
        }
    };

    const handleAnalyze = async () => {
        if (!analysisFile) return;
        setAnalyzeLoading(true);
        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = (reader.result as string).split(',')[1];
                const res = await rateThumbnail(base64String, analysisFile.type);
                setAnalysisResult(res);
                setAnalyzeLoading(false);
            };
            reader.readAsDataURL(analysisFile);
        } catch {
            setAnalyzeLoading(false);
        }
    };

    const openReferenceTab = (tab: ReferenceTab) => {
        setActiveReferenceTab(tab);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const sectionLoadingFallback = (
        <div className="w-full max-w-[1400px] mx-auto mb-24 bg-white border-[6px] border-black rounded-2xl shadow-[12px_12px_0px_0px_black] p-12 text-center">
            <p className="text-xs font-black uppercase tracking-[0.24em] opacity-50">Loading section...</p>
        </div>
    );

    return (
        <div className="min-h-screen w-full bg-[#f3f4f6] flex flex-col p-4 overflow-y-auto custom-scrollbar animate-fade-in">

            <div className="w-full max-w-[1400px] mx-auto mb-16 bg-white border-[6px] border-black rounded-[28px] shadow-[12px_12px_0px_0px_black] overflow-hidden">
                <header className="h-[78px] bg-[#B14AED] border-b-[6px] border-black flex items-center px-0">
                    <div className="h-full w-[78px] bg-[#CCFF00] border-r-[6px] border-black flex items-center justify-center">
                        <CustomIcon name="!!!GENERATE1" size={42} />
                    </div>
                    <div className="px-6">
                        <h2 className="text-[36px] font-[1000] uppercase tracking-tighter text-white leading-none">Best Components Curation</h2>
                        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/70 mt-1">Pinned picks while keeping full library below</p>
                    </div>
                </header>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 bg-[#f8fafc]">
                    {BEST_COMPONENTS.map((item) => (
                        <article key={item.id} className="bg-white border-[4px] border-black rounded-2xl shadow-[6px_6px_0px_0px_black] overflow-hidden flex flex-col">
                            <div className={`h-10 border-b-[4px] border-black px-3 flex items-center ${item.accent}`}>
                                <span className="text-[10px] font-black uppercase tracking-widest">{item.source}</span>
                            </div>
                            <div className="p-4 flex-1 flex flex-col gap-3">
                                <h3 className="text-sm font-[1000] uppercase tracking-tight leading-tight">{item.title}</h3>
                                <p className="text-[10px] font-bold uppercase leading-relaxed opacity-60">{item.reason}</p>
                                <button
                                    onClick={() => openReferenceTab(item.tab)}
                                    className="mt-auto h-9 border-[3px] border-black rounded-lg bg-white text-[10px] font-black uppercase tracking-widest shadow-[3px_3px_0px_0px_black] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                                >
                                    Open Section
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            </div>

            <div className="w-full max-w-[1400px] mx-auto mb-10 bg-white border-[5px] border-black rounded-2xl shadow-[8px_8px_0px_0px_black] p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                    {REFERENCE_TABS.map(tab => {
                        const isActive = activeReferenceTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveReferenceTab(tab.id)}
                                className={`h-11 border-[3px] border-black rounded-xl font-black uppercase text-[11px] tracking-widest transition-all ${
                                    isActive
                                        ? `${tab.accent} shadow-[3px_3px_0px_0px_black]`
                                        : 'bg-white hover:bg-[#f3f4f6]'
                                }`}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Main Toolbox (V2.1.8 — Full Polish) */}
            {activeReferenceTab === 'curated' && (
                <div className="w-full max-w-[1400px] mx-auto mb-24 bg-white border-[6px] border-black rounded-2xl shadow-[12px_12px_0px_0px_black] p-12 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.35em] opacity-50">Curation mode active</p>
                    <h3 className="text-3xl font-[1000] uppercase tracking-tighter mt-4">Choose a tab to load a section</h3>
                </div>
            )}

            {activeReferenceTab === 'thumbnail' && (
            <div className="w-full max-w-[1400px] mx-auto mb-40 bg-white border-[6px] border-black rounded-2xl shadow-[12px_12px_0px_0px_black] transition-all duration-700 ease-in-out flex flex-col overflow-hidden">

                {/* Main Header — Large Icon + Ultra-Large Title (Image #3 Style) */}
                <header className={`bg-[#FFE357] h-[80px] flex items-center justify-between px-0 overflow-hidden transition-all duration-700 ${isMainToolOpen ? 'border-b-[6px] border-black' : ''}`}>
                    <div onClick={() => setIsMainToolOpen(!isMainToolOpen)} className="flex items-center h-full cursor-pointer">
                        {/* Large Colored Icon Box */}
                        <div className="bg-[#FF7497] h-full w-[80px] flex items-center justify-center border-r-[6px] border-black flex-shrink-0">
                            <CustomIcon name="image" size={48} />
                        </div>
                        <h1 className="text-[50px] font-[1000] uppercase tracking-tighter text-black pl-8 leading-none">THUMBNAIL STUDIO</h1>
                    </div>

                    <div className="flex items-center gap-6 pr-6">
                        {/* Tab Switcher */}
                        <div className="flex bg-white border-[4px] border-black p-1 rounded-xl shadow-[3px_3px_0px_0px_black]">
                            <button
                                onClick={() => setActiveTab('generate')}
                                className={`px-5 py-2 text-[11px] font-[1000] uppercase tracking-tighter rounded-lg transition-all flex items-center gap-2 ${activeTab === 'generate' ? 'bg-black text-white' : 'text-black/30 hover:text-black'}`}
                            >
                                Studio
                            </button>
                            <button
                                onClick={() => setActiveTab('analyze')}
                                className={`px-5 py-2 text-[11px] font-[1000] uppercase tracking-tighter rounded-lg transition-all flex items-center gap-2 ${activeTab === 'analyze' ? 'bg-black text-white' : 'text-black/30 hover:text-black'}`}
                            >
                                Analyzer
                            </button>
                        </div>

                        <div onClick={() => setIsMainToolOpen(!isMainToolOpen)} className={`cursor-pointer transition-all duration-700 ease-in-out transform ${isMainToolOpen ? 'rotate-180 scale-110' : 'rotate-0 scale-100'}`}>
                            <CustomIcon name={isMainToolOpen ? "SYMBOLS 19" : "SYMBOLS 22"} size={48} className="opacity-80 hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                </header>

                {/* Main Content Area — Grid-based for perfect collapse */}
                <div className={`grid transition-all duration-1000 ease-in-out ${isMainToolOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                        <main className="p-8 bg-white min-h-[600px] relative">
                            {/* Studio Tab — Animated Transition */}
                            <div className={`transition-all duration-500 transform ${activeTab === 'generate' ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-95 -translate-x-10 pointer-events-none absolute inset-8'}`}>
                                <div className="grid grid-cols-2 gap-8 items-stretch h-full">

                                    {/* Column 1: Narrower Tool Stack */}
                                    <div className="flex flex-col h-full gap-6">
                                        <AccordionContainer title="Concept" icon="!!!IDEA" headerColor="bg-[#24D3FF]" iconBoxColor="bg-[#FFE357]" isOpenInitial={true}>
                                            <div className="space-y-4">
                                                <textarea
                                                    value={prompt}
                                                    onChange={(e) => setPrompt(e.target.value)}
                                                    placeholder="Describe the image concept..."
                                                    className="w-full h-28 p-0 text-sm font-bold bg-transparent outline-none resize-none border-none placeholder:text-black/10 text-black leading-tight"
                                                />
                                                <div className="flex justify-end">
                                                    <button
                                                        onClick={handleManualConceptGen}
                                                        disabled={conceptLoading}
                                                        className="bg-[#C9F830] text-[10px] font-black uppercase text-black px-4 py-1.5 rounded-lg border-[2px] border-black shadow-[2px_2px_0px_0px_black] hover:shadow-none hover:translate-y-0.5 transition-all"
                                                    >
                                                        {conceptLoading ? "REFRESHING..." : "✨ AUTO-REFINE"}
                                                    </button>
                                                </div>
                                            </div>
                                        </AccordionContainer>

                                        <AccordionContainer
                                            title="Styles"
                                            icon="!!!COLLECTION"
                                            headerColor="bg-[#C9F830]"
                                            iconBoxColor="bg-[#24D3FF]"
                                        >
                                            <div className="grid grid-cols-3 gap-2">
                                                {THUMBNAIL_STYLES.map(style => (
                                                    <button
                                                        key={style}
                                                        onClick={() => handleStyleToggle(style)}
                                                        className={`px-2 py-2 border-[2px] border-black rounded-lg font-black uppercase text-[9px] shadow-[2px_2px_0px_0px_black] active:translate-y-0.5 active:shadow-none transition-all ${selectedStyles.includes(style) ? 'bg-[#FFE357]' : 'bg-white'}`}
                                                    >
                                                        {style}
                                                    </button>
                                                ))}
                                            </div>
                                        </AccordionContainer>

                                        <AccordionContainer
                                            title="Text"
                                            icon="!!!TEXT"
                                            headerColor="bg-[#FFE357]"
                                            iconBoxColor="bg-[#C9F830]"
                                        >
                                            <div className="space-y-4">
                                                <input value={largeText} onChange={e => setLargeText(e.target.value)} placeholder="TITLE" className="pop-input w-full p-3 border-[3px] text-sm rounded-lg" />
                                                <input value={smallText} onChange={e => setSmallText(e.target.value)} placeholder="SUBTITLE" className="pop-input w-full p-3 border-[3px] text-sm rounded-lg" />
                                            </div>
                                        </AccordionContainer>

                                        <AccordionContainer
                                            title="Images"
                                            icon="image"
                                            headerColor="bg-[#FCAF57]"
                                            iconBoxColor="bg-[#FFE357]"
                                        >
                                            <div className="space-y-4">
                                                <div
                                                    onDrop={handleDrop}
                                                    onDragOver={handleDragOver}
                                                    className="w-full h-28 border-[3px] border-black border-dashed rounded-xl bg-gray-50 flex flex-col items-center justify-center gap-2 group hover:bg-gray-100 transition-colors cursor-pointer"
                                                    onClick={() => document.getElementById('med-up')?.click()}
                                                >
                                                    <input type="file" multiple id="med-up" className="hidden" onChange={(e) => {
                                                        if (e.target.files) {
                                                            const news = Array.from(e.target.files).map(f => ({
                                                                id: crypto.randomUUID(), file: f, previewUrl: URL.createObjectURL(f), usageType: 'background'
                                                            }));
                                                            setReferenceImages(prev => [...prev, ...news]);
                                                        }
                                                    }} />
                                                    <div className="bg-white p-2 rounded-full border-[2px] border-black shadow-[2px_2px_0px_0px_black]">
                                                        <CustomIcon name="!!!CLOUD" size={20} />
                                                    </div>
                                                    <span className="font-black uppercase text-[10px] tracking-tight text-black/30 group-hover:text-black transition-colors">Drop files or Click to Upload</span>
                                                </div>
                                                <button
                                                    onClick={() => document.getElementById('med-up')?.click()}
                                                    className="w-full h-10 bg-[#FCAF57] border-[3px] border-black rounded-xl font-[1000] uppercase text-sm tracking-tighter shadow-[3px_3px_0px_0px_black] hover:shadow-none hover:translate-y-0.5 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <CustomIcon name="!!!CLOUD" size={16} />
                                                    Upload Images
                                                </button>
                                                <div className="grid grid-cols-1 gap-2">
                                                    {referenceImages.map(img => (
                                                        <div key={img.id} className="border-[2px] border-black p-2 rounded-lg bg-white flex gap-3 items-center shadow-[3px_3px_0px_0px_black]">
                                                            <img src={img.previewUrl} className="w-10 h-10 object-cover border-[2px] border-black rounded-md" alt="ref" />
                                                            <select className="pop-input flex-1 p-1 text-[9px] font-black uppercase border-[2px] rounded-md">
                                                                <option>Background</option>
                                                                <option>Subject</option>
                                                            </select>
                                                            <button onClick={() => setReferenceImages(prev => prev.filter(i => i.id !== img.id))} className="text-xl font-black px-2 hover:text-red-500 transition-colors">×</button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </AccordionContainer>

                                        <AccordionContainer
                                            title="Palette"
                                            icon="!!!PALETTE"
                                            headerColor="bg-[#FF7497]"
                                            iconBoxColor="bg-[#FCAF57]"
                                        >
                                            <div className="flex justify-between items-start gap-3 py-2">
                                                {palette.map((c, i) => (
                                                    <div key={i} className="flex flex-col items-center gap-2 flex-1">
                                                        <div
                                                            style={{ backgroundColor: c || '#f3f4f6' }}
                                                            onClick={() => document.getElementById(`cp7-${i}`)?.click()}
                                                            className="w-full aspect-[2/3] border-[3px] border-black rounded-xl shadow-[4px_4px_0px_0px_black] relative overflow-hidden flex items-center justify-center cursor-pointer group"
                                                        >
                                                            <input id={`cp7-${i}`} type="color" value={c || '#ffffff'} onChange={e => { const n = [...palette]; n[i] = e.target.value; setPalette(n); }} className="absolute inset-0 opacity-0 pointer-events-none" />
                                                            {!c && <span className="text-black/10 font-black text-lg">+</span>}
                                                        </div>
                                                        <input value={c} onChange={e => { const n = [...palette]; n[i] = e.target.value; setPalette(n); }} className="pop-input w-full p-1.5 text-xs font-mono text-center border-[2px] rounded-md uppercase font-black" maxLength={7} />
                                                    </div>
                                                ))}
                                            </div>
                                        </AccordionContainer>
                                    </div>

                                    {/* Column 2: Canvas (Matched Width) + Controls */}
                                    <div className="flex flex-col h-full gap-6 min-h-[520px]">
                                        <div className="flex-1 w-full border-[4px] border-black bg-[#f1f5f9] rounded-[48px] shadow-[12px_12px_0px_0px_black] relative flex items-center justify-center p-8 overflow-hidden transition-all duration-700">
                                            {generatedImage ? (
                                                <img src={generatedImage} alt="Gen" className="max-w-full max-h-full object-contain border-[4px] border-black rounded-3xl shadow-[8px_8px_0px_0px_black]" />
                                            ) : (
                                                <div className="text-center p-12 bg-white border-[4px] border-black rounded-[48px] shadow-[8px_8px_0px_0px_black] w-full max-w-sm transform hover:scale-[1.02] transition-transform duration-500">
                                                    <div className="w-20 h-20 bg-[#FF7497] border-[4px] border-black rounded-full mx-auto mb-8 flex items-center justify-center shadow-[6px_6px_0px_0px_black] animate-pulse">
                                                        <CustomIcon name="zap" size={32} />
                                                    </div>
                                                    <h3 className="text-4xl font-[1000] uppercase tracking-tighter text-black leading-none mb-4 italic">CANVAS STANDBY</h3>
                                                    <p className="font-black text-black/20 uppercase tracking-[0.3em] text-[10px]">Generator Sequence Ready</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Moved Controls Section */}
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-black/20 tracking-[0.2em] pl-1">Vibe Ratio</label>
                                                <select value={aspectRatio} onChange={e => setAspectRatio(e.target.value as AspectRatio)} className="pop-input w-full h-[64px] px-6 border-[4px] border-black text-xl rounded-2xl font-[1000] appearance-none bg-white cursor-pointer shadow-[4px_4px_0_0_black] hover:shadow-none transition-all">
                                                    {Object.values(AspectRatio).map(r => <option key={r} value={r}>{r}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-black/20 tracking-[0.2em] pl-1">Resolution</label>
                                                <select value={imageSize} onChange={e => setImageSize(e.target.value as ImageSize)} className="pop-input w-full h-[64px] px-6 border-[4px] border-black text-xl rounded-2xl font-[1000] appearance-none bg-white cursor-pointer shadow-[4px_4px_0_0_black] hover:shadow-none transition-all">
                                                    {Object.values(ImageSize).map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Generate Button — Styled to EXACTLY match sub-toolbox titles (High Density) */}
                                        <button
                                            onClick={handleGenerate}
                                            disabled={genLoading || !prompt}
                                            className="w-full h-14 bg-[#f3f4f6] border-[4px] border-black rounded-2xl overflow-hidden flex items-center group transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed shadow-[6px_6px_0px_0px_black] hover:shadow-none translate-y-0 hover:translate-y-1 hover:translate-x-1"
                                        >
                                            <div className="bg-gray-200 h-full w-14 flex items-center justify-center border-r-[4px] border-black flex-shrink-0 group-hover:bg-[#FF7497] transition-colors">
                                                <CustomIcon name="zap" size={32} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                            <div className="flex-1 flex items-center justify-center pr-14">
                                                <span className="text-[36px] font-[1000] uppercase tracking-tighter text-black/30 group-hover:text-black transition-colors leading-none mt-[-2px]">
                                                    {genLoading ? "CREATING..." : "GENERATE ART"}
                                                </span>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Analyzer Tab — Animated Transition */}
                            <div className={`transition-all duration-500 transform ${activeTab === 'analyze' ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-95 translate-x-10 pointer-events-none absolute inset-8'}`}>
                                <div className="flex flex-col lg:flex-row gap-10 h-full">
                                    <div className="w-full lg:w-1/2 flex flex-col gap-6">
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full border-[4px] border-black bg-white rounded-2xl shadow-[8px_8px_0px_0px_black] group cursor-pointer overflow-hidden"
                                        >
                                            <div className="h-14 bg-[#FF7497] border-b-[4px] border-black flex items-center px-6 gap-4">
                                                <div className="bg-white p-2 rounded-lg border-[2px] border-black shadow-[2px_2px_0px_0px_black]">
                                                    <CustomIcon name="!!!CLOUD" size={20} />
                                                </div>
                                                <span className="text-lg font-[1000] uppercase tracking-tighter text-black">Upload Visuals</span>
                                            </div>
                                            <div className="h-[300px] flex items-center justify-center bg-gray-50 p-6">
                                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => {
                                                    if (e.target.files?.[0]) {
                                                        setAnalysisFile(e.target.files[0]);
                                                        const r = new FileReader(); r.onloadend = () => setAnalysisPreview(r.result as string);
                                                        r.readAsDataURL(e.target.files[0]);
                                                    }
                                                }} />
                                                {analysisPreview ? (
                                                    <img src={analysisPreview} alt="Preview" className="h-full object-contain border-[4px] border-black rounded-xl shadow-[6px_6px_0px_0px_black]" />
                                                ) : (
                                                    <div className="text-center opacity-20">
                                                        <CustomIcon name="search" size={64} />
                                                        <p className="font-black mt-4 uppercase">No Media Loaded</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1 bg-gray-50 rounded-2xl border-[4px] border-black p-6">
                                        <div className="flex items-center justify-between gap-3 mb-4">
                                            <h4 className="text-xl font-black uppercase">Analysis Result</h4>
                                            <button
                                                onClick={handleAnalyze}
                                                disabled={!analysisFile || analyzeLoading}
                                                className="h-10 px-4 border-[3px] border-black rounded-lg bg-[#CCFF00] text-[10px] font-black uppercase shadow-[3px_3px_0px_0px_black] disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                {analyzeLoading ? 'Running...' : 'Run Analysis'}
                                            </button>
                                        </div>
                                        <div className="prose max-w-none text-sm font-bold">
                                            {analyzeLoading ? "Running Neural Analysis..." : analysisResult || "Upload a thumbnail to see scores."}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
            )}

            {activeReferenceTab === 'project' && (
            <div className="w-full max-w-[1400px] mx-auto mb-40 animate-slide-up duration-1000">
                <React.Suspense fallback={sectionLoadingFallback}>
                    <ProjectStudio />
                </React.Suspense>
            </div>
            )}

            {activeReferenceTab === 'matrix' && (
            <div className="w-full max-w-[1400px] mx-auto mb-40 bg-white border-[6px] border-black rounded-[36px] shadow-[12px_12px_0px_0px_black] overflow-hidden">
                <header className="h-[82px] bg-[#00CCFF] border-b-[6px] border-black flex items-center justify-between px-0">
                    <div className="flex items-center h-full">
                        <div className="h-full w-[82px] bg-[#CCFF00] border-r-[6px] border-black flex items-center justify-center">
                            <CustomIcon name="!!!COLLECTION" size={46} />
                        </div>
                        <h2 className="text-[42px] font-[1000] uppercase tracking-tighter text-black pl-6 leading-none">
                            MEGA TOOLBOX MATRIX
                        </h2>
                    </div>
                    <div className="pr-6 flex items-center gap-2">
                        <span className="px-3 py-1 bg-white border-[3px] border-black rounded-lg text-[10px] font-black uppercase tracking-widest">
                            20 Rows
                        </span>
                        <span className="px-3 py-1 bg-[#FF7497] border-[3px] border-black rounded-lg text-[10px] font-black uppercase tracking-widest">
                            Interactive
                        </span>
                    </div>
                </header>

                <div className="p-8 bg-[#f8fafc] space-y-8">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        <section className="border-[4px] border-black rounded-2xl bg-white shadow-[8px_8px_0px_0px_black] overflow-hidden">
                            <div className="h-12 bg-[#FFDD00] border-b-[4px] border-black flex items-center px-4">
                                <h3 className="text-lg font-[1000] uppercase tracking-tighter">Cause / Effect Rail</h3>
                            </div>
                            <div className="p-4 space-y-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest">Format Mode</label>
                                    <label className="text-[10px] font-black uppercase tracking-widest">Row Filter</label>
                                    <select
                                        value={globalFormat}
                                        onChange={(e) => setGlobalFormat(e.target.value as 'compact' | 'balanced' | 'expanded')}
                                        className="h-10 border-[3px] border-black rounded-lg px-2 text-xs font-black uppercase bg-white shadow-[3px_3px_0px_0px_black]"
                                    >
                                        <option value="compact">Compact</option>
                                        <option value="balanced">Balanced</option>
                                        <option value="expanded">Expanded</option>
                                    </select>
                                    <select
                                        value={megaFilter}
                                        onChange={(e) => setMegaFilter(e.target.value as 'all' | 'signal' | 'delivery')}
                                        className="h-10 border-[3px] border-black rounded-lg px-2 text-xs font-black uppercase bg-white shadow-[3px_3px_0px_0px_black]"
                                    >
                                        <option value="all">All Rows</option>
                                        <option value="signal">Signal Rows</option>
                                        <option value="delivery">Delivery Rows</option>
                                    </select>
                                </div>

                                <div>
                                    <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                                        <span>Interaction Bias</span>
                                        <span>{impactBias}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min={35}
                                        max={95}
                                        value={impactBias}
                                        onChange={(e) => setImpactBias(Number(e.target.value))}
                                        className="w-full accent-[#FF7497]"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    {CAUSE_EFFECT_STEPS.map((step, index) => {
                                        const isActive = activeCauseStep === index + 1;
                                        return (
                                            <button
                                                key={step}
                                                onClick={() => setActiveCauseStep(index + 1)}
                                                className={`h-10 border-[3px] border-black rounded-lg text-[9px] font-black uppercase tracking-tight transition-all ${
                                                    isActive
                                                        ? 'bg-[#CCFF00] shadow-[3px_3px_0px_0px_black]'
                                                        : 'bg-white hover:bg-[#f3f4f6]'
                                                }`}
                                            >
                                                {index + 1}. {step}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </section>

                        <section className="border-[4px] border-black rounded-2xl bg-white shadow-[8px_8px_0px_0px_black] overflow-hidden">
                            <div className="h-12 bg-[#FF7497] border-b-[4px] border-black flex items-center px-4">
                                <h3 className="text-lg font-[1000] uppercase tracking-tighter">Interactive Charts</h3>
                            </div>
                            <div className="p-4 grid grid-rows-2 gap-4 h-[360px]">
                                <div className="border-[3px] border-black rounded-xl bg-[#f8fafc]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={impactTrendData} margin={{ top: 12, right: 18, left: 0, bottom: 0 }}>
                                            <CartesianGrid stroke="#111" strokeDasharray="4 4" />
                                            <XAxis dataKey="phase" tick={{ fontSize: 10, fontWeight: 700 }} />
                                            <YAxis tick={{ fontSize: 10, fontWeight: 700 }} />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="influence" stroke="#ff3399" strokeWidth={3} />
                                            <Line type="monotone" dataKey="stability" stroke="#00ccff" strokeWidth={3} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="border-[3px] border-black rounded-xl bg-[#f8fafc]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={outputMixData} margin={{ top: 12, right: 18, left: 0, bottom: 0 }}>
                                            <CartesianGrid stroke="#111" strokeDasharray="4 4" />
                                            <XAxis dataKey="label" tick={{ fontSize: 9, fontWeight: 700 }} />
                                            <YAxis tick={{ fontSize: 10, fontWeight: 700 }} />
                                            <Tooltip />
                                            <Bar dataKey="value" fill="#CCFF00" stroke="#000" strokeWidth={2} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </section>

                        <section className="border-[4px] border-black rounded-2xl bg-white shadow-[8px_8px_0px_0px_black] overflow-hidden">
                            <div className="h-12 bg-[#CCFF00] border-b-[4px] border-black flex items-center px-4 justify-between">
                                <h3 className="text-lg font-[1000] uppercase tracking-tighter">Drag / Drop Image Rail</h3>
                                <button
                                    onClick={() => megaImageInputRef.current?.click()}
                                    className="h-8 px-3 border-[2px] border-black rounded-md bg-white text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_black]"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="p-4 space-y-4">
                                <input
                                    ref={megaImageInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={handleMegaImageInput}
                                />
                                <div
                                    onDrop={handleMegaToolboxDrop}
                                    onDragOver={handleMegaToolboxDragOver}
                                    className="min-h-[120px] border-[3px] border-black border-dashed rounded-xl bg-[#f8fafc] p-3 text-center flex items-center justify-center"
                                >
                                    <div className="space-y-1">
                                        <p className="text-xs font-black uppercase">Drop Images To Attach Interactions</p>
                                        <p className="text-[10px] font-bold uppercase opacity-50">
                                            Reorder by dragging cards onto each other
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 max-h-[180px] overflow-y-auto custom-scrollbar">
                                    {megaDroppedImages.map((img) => (
                                        <div
                                            key={img.id}
                                            draggable
                                            onDragStart={() => setDraggingMegaImageId(img.id)}
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={() => reorderMegaImages(img.id)}
                                            className="border-[3px] border-black rounded-lg bg-white p-2 shadow-[3px_3px_0px_0px_black] cursor-grab active:cursor-grabbing"
                                        >
                                            <img src={img.previewUrl} alt={img.file.name} className="w-full h-16 object-cover border-[2px] border-black rounded-md" />
                                            <div className="mt-2 flex items-center justify-between gap-2">
                                                <span className="text-[9px] font-black uppercase truncate">{img.file.name}</span>
                                                <button
                                                    onClick={() => removeMegaImage(img.id)}
                                                    className="w-5 h-5 border-[2px] border-black rounded bg-[#FF7497] text-[10px] font-black"
                                                >
                                                    X
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {!megaDroppedImages.length && (
                                        <div className="col-span-2 text-center text-[10px] uppercase font-black opacity-40 py-6">
                                            No images attached yet
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="space-y-4">
                        {filteredMegaRows.map((row) => (
                            <section key={row.id} className="border-[4px] border-black rounded-2xl overflow-hidden bg-white shadow-[8px_8px_0px_0px_black]">
                                <div className="h-12 border-b-[4px] border-black flex items-center justify-between px-4" style={{ backgroundColor: row.tone }}>
                                    <div className="flex items-center gap-3">
                                        <span className="h-7 w-7 border-[3px] border-black rounded-md bg-white flex items-center justify-center text-[10px] font-black">
                                            {row.id}
                                        </span>
                                        <h4 className="text-sm md:text-base font-[1000] uppercase tracking-tight">{row.title}</h4>
                                    </div>
                                    <div className="text-[10px] font-black uppercase bg-white border-[2px] border-black rounded-md px-2 py-1">
                                        {row.widths.length} Modules
                                    </div>
                                </div>

                                <div className="p-4 bg-[#f8fafc]">
                                    <div className="flex flex-wrap xl:flex-nowrap gap-4">
                                        {row.widths.map((weight, cellIndex) => {
                                            const cellId = `row-${row.id}-cell-${cellIndex}`;
                                            const isCellActive = activeMegaCells[cellId] ?? cellIndex === 0;
                                            const headers =
                                                globalFormat === 'compact'
                                                    ? ['Feature', 'State', 'Impact']
                                                    : globalFormat === 'balanced'
                                                        ? ['Feature', 'Function', 'State', 'Impact']
                                                        : ['Feature', 'Function', 'Trigger', 'State', 'Impact', 'Output'];

                                            const baseRows = globalFormat === 'compact' ? 3 : globalFormat === 'balanced' ? 5 : 7;
                                            const rowCount = baseRows + ((row.id + cellIndex) % 3);
                                            const tableRows = Array.from({ length: rowCount }, (_, tableIndex) => {
                                                const step = CAUSE_EFFECT_STEPS[(tableIndex + activeCauseStep - 1) % CAUSE_EFFECT_STEPS.length];
                                                const impact = Math.max(
                                                    10,
                                                    Math.round((impactBias + row.id * 3 + cellIndex * 5 + tableIndex * 4) % 100)
                                                );
                                                return {
                                                    feature: `F-${row.id}.${cellIndex + 1}.${tableIndex + 1}`,
                                                    functionName: `${row.stage} Link ${tableIndex + 1}`,
                                                    trigger: step,
                                                    state: isCellActive ? (tableIndex % 2 === 0 ? 'Live' : 'Queued') : 'Dormant',
                                                    impact: `${impact}%`,
                                                    output: `${Math.round(impact * 1.7)} pts`
                                                };
                                            });

                                            return (
                                                <article
                                                    key={cellId}
                                                    style={{ flexGrow: weight, flexBasis: 0, minWidth: '260px' }}
                                                    className={`border-[3px] border-black rounded-xl bg-white overflow-hidden ${isCellActive ? 'shadow-[6px_6px_0px_0px_black]' : ''}`}
                                                >
                                                    <div className="h-10 bg-[#FFDD00] border-b-[3px] border-black flex items-center justify-between px-3">
                                                        <span className="text-[10px] font-black uppercase tracking-widest">
                                                            Module {row.id}.{cellIndex + 1}
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => setActiveCauseStep((prev) => (prev % CAUSE_EFFECT_STEPS.length) + 1)}
                                                                className="h-6 px-2 text-[9px] font-black uppercase border-[2px] border-black rounded bg-white"
                                                            >
                                                                Step+
                                                            </button>
                                                            <button
                                                                onClick={() => toggleMegaCell(cellId)}
                                                                className={`h-6 px-2 text-[9px] font-black uppercase border-[2px] border-black rounded ${isCellActive ? 'bg-[#CCFF00]' : 'bg-white'}`}
                                                            >
                                                                {isCellActive ? 'Live' : 'Dormant'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="p-3 space-y-3">
                                                        <div className="flex flex-wrap gap-1">
                                                            {CAUSE_EFFECT_STEPS.slice(0, 4).map((step, idx) => (
                                                                <span
                                                                    key={step}
                                                                    className={`px-2 py-1 border-[2px] border-black rounded text-[9px] font-black uppercase ${
                                                                        activeCauseStep >= idx + 1 ? 'bg-[#00CCFF]' : 'bg-[#f8fafc]'
                                                                    }`}
                                                                >
                                                                    {idx + 1}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <div className="overflow-x-auto custom-scrollbar">
                                                            <table className="w-full text-left border-collapse text-[10px] font-black uppercase">
                                                                <thead>
                                                                    <tr className="bg-[#f3f4f6] border-y-[2px] border-black">
                                                                        {headers.map((header) => (
                                                                            <th key={header} className="px-2 py-2 whitespace-nowrap">
                                                                                {header}
                                                                            </th>
                                                                        ))}
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {tableRows.map((tableRow) => (
                                                                        <tr key={tableRow.feature} className="border-b border-black/20">
                                                                            <td className="px-2 py-1 whitespace-nowrap">{tableRow.feature}</td>
                                                                            {globalFormat !== 'compact' && (
                                                                                <td className="px-2 py-1 whitespace-nowrap">{tableRow.functionName}</td>
                                                                            )}
                                                                            {globalFormat === 'expanded' && (
                                                                                <td className="px-2 py-1 whitespace-nowrap">{tableRow.trigger}</td>
                                                                            )}
                                                                            <td className="px-2 py-1 whitespace-nowrap">{tableRow.state}</td>
                                                                            <td className="px-2 py-1 whitespace-nowrap">{tableRow.impact}</td>
                                                                            {globalFormat === 'expanded' && (
                                                                                <td className="px-2 py-1 whitespace-nowrap">{tableRow.output}</td>
                                                                            )}
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </article>
                                            );
                                        })}
                                    </div>
                                </div>
                            </section>
                        ))}
                    </div>
                </div>
            </div>
            )}

            {/* 3. Global UI Reference Library — Unified Design System Layer */}
            {activeReferenceTab === 'library' && (
            <div className="w-full max-w-[1400px] mx-auto mb-40">
                <div className="p-12 border-b-[12px] border-black bg-white mb-20 text-black shadow-[16px_16px_0px_0px_black] rounded-[3rem] border-[4px]">
                    <div className="max-w-[1400px] mx-auto text-center">
                        <h2 className="text-6xl font-[1000] uppercase italic tracking-tighter bg-[#B14AED] text-white inline-block px-12 py-6 rounded-2xl border-[5px] border-black shadow-[10px_10px_0px_0px_black]">
                            REFERENCE LIBRARY
                        </h2>
                        <p className="mt-8 font-black uppercase text-lg opacity-50 tracking-[0.3em] text-black">
                            Tokyo-Pop Component Repository & Design Tokens
                        </p>
                    </div>
                </div>
                <React.Suspense fallback={sectionLoadingFallback}>
                    <UIReferenceLibraryContent />
                </React.Suspense>
            </div>
            )}

            {activeReferenceTab === 'native' && (
            <div className="w-full max-w-[1400px] mx-auto mb-40">
                <div className="p-12 border-b-[12px] border-black bg-white mb-20 text-black shadow-[16px_16px_0px_0px_black] rounded-[3rem] border-[4px]">
                    <div className="max-w-[1400px] mx-auto text-center">
                        <h2 className="text-6xl font-[1000] uppercase italic tracking-tighter bg-[#CCFF00] text-black inline-block px-12 py-6 rounded-2xl border-[5px] border-black shadow-[10px_10px_0px_0px_black]">
                            NATIVE UI KIT
                        </h2>
                        <p className="mt-8 font-black uppercase text-lg opacity-50 tracking-[0.3em] text-black">
                            Standalone Component Kit Pulled In From Shared Library Modules
                        </p>
                    </div>
                </div>
                <div className="bg-white border-[6px] border-black rounded-[48px] shadow-[12px_12px_0px_0px_black] overflow-hidden">
                    <div className="bg-black text-white px-8 py-4 flex justify-between items-center">
                        <span className="font-[1000] uppercase tracking-widest text-lg">Native UI Kit</span>
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#FF3399]" />
                            <div className="w-3 h-3 rounded-full bg-[#CCFF00]" />
                            <div className="w-3 h-3 rounded-full bg-[#00CCFF]" />
                        </div>
                    </div>
                    <div className="p-8 bg-white">
                        <React.Suspense fallback={sectionLoadingFallback}>
                            <NativeUIKit />
                        </React.Suspense>
                    </div>
                </div>
            </div>
            )}
        </div>
    );
};

export default ReferenceStudio;
