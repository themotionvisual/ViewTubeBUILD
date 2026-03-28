import React, { useState, useRef, useEffect } from 'react';
import { generateThumbnail, rateThumbnail, generateThumbnailConcept } from '../services/gemini';
import { AspectRatio, ImageSize, type SeoResult, type ThumbnailHistoryItem } from '../types';
import { useBrain } from '../context/GlobalDataContext';
import { CustomIcon } from '../components/CustomIcon';
import { AccordionContainer } from '../components/AccordionContainer';

interface ReferenceImage {
    id: string;
    file: File;
    previewUrl: string;
    usageType: string;
}

const ThumbnailStudio: React.FC = () => {
    const { brain } = useBrain();

    // Tab State
    const [activeTab, setActiveTab] = useState<'generate' | 'analyze'>('generate');

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

    // Feature Toggles (V2.1.2)
    const [useText, setUseText] = useState<boolean>(false);
    const [useReferenceImages, setUseReferenceImages] = useState<boolean>(true); // Default open in some views
    const [usePalette, setUsePalette] = useState<boolean>(false);
    const [useStyles, setUseStyles] = useState<boolean>(true); // Default open

    // Advanced States
    const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
    const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([]);
    const [palette, setPalette] = useState<string[]>(['#CCFF00', '#FF3399', '', '', '']);

    // Analyzer States
    const [analysisFile, setAnalysisFile] = useState<File | null>(null);
    const [analysisPreview, setAnalysisPreview] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const THUMBNAIL_STYLES = [
        "Educational", "Clickbait", "Cinematic", "Graphic", "Simplified",
        "Mysterious", "Minimalist", "Vibrant", "Dark & Moody", "Retro/Vintage",
        "Futuristic", "Hand-drawn", "3D Rendered", "Photorealistic", "Surreal",
        "Comic Book", "Neon/Cyberpunk", "Watercolor", "High Contrast", "Documentary"
    ];

    const currentSeoResult = brain.seoState.results[0] || null;

    // Automation: Auto-Refine
    useEffect(() => {
        const autoGen = async () => {
            if (currentSeoResult && !prompt && !conceptLoading) {
                setConceptLoading(true);
                try {
                    const concept = await generateThumbnailConcept(currentSeoResult);
                    setPrompt(concept.prompt);
                    setAspectRatio(concept.aspectRatio);
                } catch (e) {
                    console.error("Failed to auto-gen concept", e);
                } finally {
                    setConceptLoading(false);
                }
            }
        };
        if (currentSeoResult && prompt === '') {
            autoGen();
        }
    }, [currentSeoResult, prompt, conceptLoading]);

    const handleManualConceptGen = async () => {
        if (!currentSeoResult && !prompt) return;
        setConceptLoading(true);
        try {
            const concept = await generateThumbnailConcept(currentSeoResult || undefined, prompt);
            setPrompt(concept.prompt);
            setAspectRatio(concept.aspectRatio);
        } catch (e) {
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

    const handleReferenceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newImages = Array.from(e.target.files).map(file => ({
                id: crypto.randomUUID(),
                file,
                previewUrl: URL.createObjectURL(file),
                usageType: 'background'
            }));
            setReferenceImages(prev => [...prev, ...newImages]);
        }
    };

    const handleGenerate = async () => {
        if (!prompt) return;
        setGenLoading(true);
        try {
            const activeColors = palette.filter(c => c.trim() !== '');
            const paletteContext = usePalette && activeColors.length > 0 ? `\n\nCRITICAL COLOR PALETTE: You MUST strictly use this color palette: ${activeColors.join(', ')}.` : '';
            const styleContext = useStyles && selectedStyles.length > 0 ? `\n\nCRITICAL STYLE REQUIREMENTS: The thumbnail MUST be generated using a combination of the following styles: ${selectedStyles.join(', ')}.` : '';
            const finalPrompt = prompt + styleContext + paletteContext;
            const img = await generateThumbnail(
                finalPrompt,
                aspectRatio,
                imageSize,
                useText ? largeText : '',
                useText ? smallText : ''
            );
            setGeneratedImage(img);
            const newItem: ThumbnailHistoryItem = {
                id: crypto.randomUUID(),
                url: img,
                prompt: prompt,
                timestamp: Date.now()
            };
            setHistory([newItem, ...history]);
        } catch (e: any) {
            console.error(e);
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
                const context = currentSeoResult ? {
                    concept: currentSeoResult.concept,
                    niche: currentSeoResult.niche
                } : undefined;
                const result = await rateThumbnail(base64String, analysisFile.type, context);
                setAnalysisResult(result);
                setAnalyzeLoading(false);
            };
            reader.readAsDataURL(analysisFile);
        } catch (e) {
            setAnalyzeLoading(false);
            alert('Analysis failed.');
        }
    };

    // Helper for flush buttons in V2.1.2
    const AddButton = ({ onClick, color, icon, label }: { onClick: () => void, color: string, icon: string, label: string }) => (
        <button
            onClick={onClick}
            className={`flex items-center w-full h-16 border-[4px] border-black shadow-[8px_8px_0px_0px_black] rounded-[20px] overflow-hidden transition-all active:translate-x-1 active:translate-y-1 active:shadow-none group ${color}`}
        >
            <div className="bg-white h-full w-16 flex items-center justify-center border-r-[4px] border-black flex-shrink-0 group-hover:bg-gray-50">
                <CustomIcon name={icon} size={28} />
            </div>
            <span className="flex-1 text-center text-lg font-[1000] uppercase tracking-tighter text-black">{label}</span>
        </button>
    );

    return (
        <div className="min-h-screen w-full bg-[#f8fafc] flex flex-col p-8 overflow-y-auto custom-scrollbar animate-fade-in">

            {/* Main Toolbox Container (White Interior) */}
            <div className="w-full max-w-[1600px] mx-auto bg-white border-[6px] border-black rounded-[24px] shadow-[8px_8px_0px_0px_black] flex flex-col overflow-visible">

                {/* V2.1.2 Header (Yellow) */}
                <header className="bg-[#FFDD00] border-b-[6px] border-black h-24 flex items-center justify-between overflow-hidden rounded-t-[18px]">
                    <div className="flex items-center h-full">
                        {/* Flush Pink Icon Box */}
                        <div className="bg-[#FF3399] h-full w-24 flex items-center justify-center border-r-[6px] border-black flex-shrink-0">
                            <CustomIcon name="image" size={56} />
                        </div>
                        <div className="flex flex-col pl-8">
                            <h1 className="text-5xl font-[1000] uppercase tracking-[calc(-0.06em)] text-black leading-none">THUMBNAIL STUDIO</h1>
                            <span className="text-[10px] font-black uppercase text-black/30 tracking-[0.4em] mt-1">Creator OS v2.1.2 Protocol</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-10 px-10 h-full">
                        {/* High-Fidelity Tab Switcher */}
                        <div className="flex bg-black p-1.5 rounded-[24px] shadow-[4px_4px_0px_0px_black]">
                            <button
                                onClick={() => setActiveTab('generate')}
                                className={`px-8 py-3 text-sm font-[1000] uppercase tracking-tighter rounded-[20px] transition-all flex items-center gap-2 ${activeTab === 'generate' ? 'bg-white text-black translate-y-[-2px] shadow-[4px_4px_0px_0px_#888]' : 'text-white/30 hover:text-white/60'}`}
                            >
                                <CustomIcon name="image" size={18} />
                                Studio
                            </button>
                            <button
                                onClick={() => setActiveTab('analyze')}
                                className={`px-8 py-3 text-sm font-[1000] uppercase tracking-tighter rounded-[20px] transition-all flex items-center gap-2 ${activeTab === 'analyze' ? 'bg-white text-black translate-y-[-2px] shadow-[4px_4px_0px_0px_#888]' : 'text-white/30 hover:text-white/60'}`}
                            >
                                <CustomIcon name="analytics" size={18} />
                                Analyzer
                            </button>
                        </div>
                        <div className="flex items-center justify-center h-full px-4">
                            <CustomIcon name="SYMBOLS 22" size={48} className="opacity-80" />
                        </div>
                    </div>
                </header>

                {/* Toolbox Content */}
                <main className="flex-1 bg-white p-12">

                    {/* Generated History Bar */}
                    {activeTab === 'generate' && history.length > 0 && (
                        <div className="w-full mb-12 flex gap-6 overflow-x-auto pb-6 custom-scrollbar">
                            {history.map(item => (
                                <div
                                    key={item.id}
                                    onClick={() => { setGeneratedImage(item.url); setPrompt(item.prompt); }}
                                    className="flex-shrink-0 w-44 h-28 border-[4px] border-black rounded-[20px] cursor-pointer hover:translate-y-[-4px] transition-all relative group bg-white overflow-hidden shadow-[6px_6px_0px_0px_black]"
                                >
                                    <img src={item.url} className="w-full h-full object-cover" alt="History" />
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'generate' ? (
                        <div className="flex flex-col lg:flex-row gap-16 items-start">
                            {/* Left Column: Controls (Downward-only expansion) */}
                            <div className="w-full lg:w-[480px] flex flex-col space-y-6">

                                <AccordionContainer
                                    title="Visual Prompt"
                                    icon="!!!IDEA"
                                    headerColor="bg-[#00CCFF]"
                                    iconBoxColor="bg-[#FFDD00]"
                                    isOpenInitial={true}
                                >
                                    <div className="relative">
                                        <textarea
                                            value={prompt}
                                            onChange={(e) => setPrompt(e.target.value)}
                                            placeholder="Describe the image..."
                                            className="w-full h-40 p-0 text-xl font-bold bg-transparent outline-none resize-none border-none placeholder:text-black/10 text-black leading-relaxed"
                                        />
                                        <button
                                            onClick={handleManualConceptGen}
                                            disabled={conceptLoading}
                                            className="absolute bottom-0 right-0 bg-black text-[#CCFF00] border-2 border-black px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-[4px_4px_0px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                                        >
                                            {conceptLoading ? "REFining..." : "✨ Auto-Refine"}
                                        </button>
                                    </div>
                                </AccordionContainer>

                                {/* Styles Grid Section */}
                                {!useStyles ? (
                                    <AddButton onClick={() => setUseStyles(true)} color="bg-[#FFDD00]" icon="!!!COLLECTION" label="+ Add Styles" />
                                ) : (
                                    <AccordionContainer title="Thumbnail Styles" icon="!!!COLLECTION" headerColor="bg-[#FFDD00]" iconBoxColor="bg-white" isOpenInitial={true}>
                                        <div className="grid grid-cols-2 gap-3">
                                            {THUMBNAIL_STYLES.map(style => (
                                                <button
                                                    key={style}
                                                    onClick={() => handleStyleToggle(style)}
                                                    className={`px-3 py-2 border-[3px] border-black rounded-xl font-black uppercase text-[10px] shadow-[4px_4px_0px_0px_black] active:translate-x-1 active:shadow-none transition-all ${selectedStyles.includes(style) ? 'bg-[#FFDD00]' : 'bg-white'}`}
                                                >
                                                    {style}
                                                </button>
                                            ))}
                                        </div>
                                        <button onClick={() => setUseStyles(false)} className="w-full mt-4 text-[10px] font-black uppercase text-black/20 hover:text-black transition-colors">Close Section</button>
                                    </AccordionContainer>
                                )}

                                {/* Text Overlay Section */}
                                {!useText ? (
                                    <AddButton onClick={() => setUseText(true)} color="bg-[#00CCFF]" icon="!!!TEXT" label="+ Add Text Overlay" />
                                ) : (
                                    <AccordionContainer title="Text Overlay" icon="!!!TEXT" headerColor="bg-[#00CCFF]" iconBoxColor="bg-white" isOpenInitial={true}>
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-black/30 pl-1">Primary Header</label>
                                                <input value={largeText} onChange={e => setLargeText(e.target.value)} placeholder="e.g. 10X VIEWS" className="pop-input w-full p-4 border-[4px]" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-black/30 pl-1">Secondary Hook</label>
                                                <input value={smallText} onChange={e => setSmallText(e.target.value)} placeholder="Subtitle hook..." className="pop-input w-full p-4 border-[4px]" />
                                            </div>
                                            <button onClick={() => setUseText(false)} className="w-full mt-4 text-[10px] font-black uppercase text-black/20 hover:text-black">Close Section</button>
                                        </div>
                                    </AccordionContainer>
                                )}

                                {/* Reference Images Section */}
                                {!useReferenceImages ? (
                                    <AddButton onClick={() => setUseReferenceImages(true)} color="bg-[#FF3399]" icon="image" label="+ Add Reference Media" />
                                ) : (
                                    <AccordionContainer title="Reference Media" icon="image" headerColor="bg-[#FF3399]" iconBoxColor="bg-white" isOpenInitial={true}>
                                        <input type="file" multiple accept="image/*" onChange={handleReferenceImageUpload} className="hidden" id="ref-image-upload" />
                                        <label htmlFor="ref-image-upload" className="w-full h-16 bg-black text-[#CCFF00] border-[4px] border-black rounded-[20px] shadow-[8px_8px_0px_0px_black] flex items-center justify-center gap-4 cursor-pointer hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all mb-6">
                                            <CustomIcon name="!!!CLOUD" size={24} />
                                            <span className="font-[1000] uppercase text-lg tracking-tighter">Upload Assets</span>
                                        </label>
                                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                            {referenceImages.map(img => (
                                                <div key={img.id} className="border-[4px] border-black p-4 rounded-[20px] bg-gray-50 flex gap-4 items-center">
                                                    <img src={img.previewUrl} className="w-16 h-16 object-cover border-[3px] border-black rounded-xl" alt="ref" />
                                                    <div className="flex-1">
                                                        <select className="pop-input w-full p-2 text-[10px] uppercase font-black border-[3px]">
                                                            <option>Background</option>
                                                            <option>Subject</option>
                                                            <option>Expression</option>
                                                        </select>
                                                    </div>
                                                    <button onClick={() => setReferenceImages(prev => prev.filter(i => i.id !== img.id))} className="text-2xl font-black px-2 hover:scale-125 transition-transform">×</button>
                                                </div>
                                            ))}
                                        </div>
                                        <button onClick={() => setUseReferenceImages(false)} className="w-full mt-4 text-[10px] font-black uppercase text-black/20 hover:text-black">Close Section</button>
                                    </AccordionContainer>
                                )}

                                {/* Color Palette Section (RESTORED) */}
                                {!usePalette ? (
                                    <AddButton onClick={() => setUsePalette(true)} color="bg-[#CCFF00]" icon="!!!PALETTE" label="+ Add Color Palette" />
                                ) : (
                                    <AccordionContainer title="Color Palette" icon="!!!PALETTE" headerColor="bg-[#CCFF00]" iconBoxColor="bg-black" isOpenInitial={true}>
                                        <div className="flex justify-between items-center gap-4 py-4">
                                            {palette.map((c, i) => (
                                                <div key={i} className="flex flex-col items-center gap-3 flex-1">
                                                    <div
                                                        style={{ backgroundColor: c || '#f3f4f6' }}
                                                        className="w-full aspect-[2/3] border-[4px] border-black rounded-2xl shadow-[6px_6px_0px_0px_black] relative overflow-hidden group"
                                                    >
                                                        <input
                                                            type="color"
                                                            value={c || '#ffffff'}
                                                            onChange={(e) => { const n = [...palette]; n[i] = e.target.value; setPalette(n); }}
                                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                                        />
                                                        {c && (
                                                            <button onClick={() => { const n = [...palette]; n[i] = ''; setPalette(n); }} className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full border-2 border-black flex items-center justify-center font-black opacity-0 group-hover:opacity-100 transition-all z-10">×</button>
                                                        )}
                                                    </div>
                                                    <input value={c} onChange={e => { const n = [...palette]; n[i] = e.target.value; setPalette(n); }} className="pop-input w-full p-1 text-[8px] font-mono text-center uppercase" maxLength={7} />
                                                </div>
                                            ))}
                                        </div>
                                        <button onClick={() => setUsePalette(false)} className="w-full mt-4 text-[10px] font-black uppercase text-black/20 hover:text-black">Close Section</button>
                                    </AccordionContainer>
                                )}

                                {/* Final Generation Controls */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-black/30 tracking-[0.2em] pl-2">Ratio</label>
                                        <select value={aspectRatio} onChange={e => setAspectRatio(e.target.value as AspectRatio)} className="pop-input w-full p-4 border-[4px] text-lg">
                                            {Object.values(AspectRatio).map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-black/30 tracking-[0.2em] pl-2">Resolution</label>
                                        <select value={imageSize} onChange={e => setImageSize(e.target.value as ImageSize)} className="pop-input w-full p-4 border-[4px] text-lg">
                                            {Object.values(ImageSize).map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <button
                                    onClick={handleGenerate}
                                    disabled={genLoading || !prompt}
                                    className="w-full h-24 border-[6px] border-black bg-[#00CCFF] shadow-[12px_12px_0px_0px_black] rounded-[24px] hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:translate-y-3 transition-all text-4xl font-[1000] uppercase tracking-tighter text-black"
                                >
                                    {genLoading ? "RENDERING..." : "GENERATE ART"}
                                </button>
                            </div>

                            {/* Right Column: Canvas Preview */}
                            <div className="flex-1 min-h-[600px] w-full border-[6px] border-black bg-[#E8E8E8] rounded-[40px] shadow-[16px_16px_0px_0px_black] relative flex items-center justify-center p-12 overflow-hidden">
                                {generatedImage ? (
                                    <img src={generatedImage} alt="Gen" className="max-w-full max-h-full object-contain border-[6px] border-black rounded-[32px] shadow-[12px_12px_0px_0px_black] animate-pop-rotate" />
                                ) : (
                                    <div className="text-center p-20 bg-white border-[6px] border-black rounded-[40px] shadow-[12px_12px_0px_0px_black] w-full max-w-sm">
                                        <div className="w-24 h-24 bg-[#FF3399] border-[4px] border-black rounded-full mx-auto mb-10 flex items-center justify-center shadow-[6px_6px_0px_0px_black] animate-bounce">
                                            <CustomIcon name="!!!GENERATE1" size={48} />
                                        </div>
                                        <h3 className="text-4xl font-[1000] uppercase tracking-tighter text-black leading-none mb-6">Canvas Empty</h3>
                                        <p className="font-black text-black/20 uppercase tracking-[0.3em] text-[10px]">Awaiting Broadcast Signal</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* Analyzer Tab */
                        <div className="flex flex-col lg:flex-row gap-16 animate-fade-in">
                            <div className="w-full lg:w-1/3 space-y-10">
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full border-[6px] border-black bg-white rounded-[40px] shadow-[12px_12px_0px_0px_black] group cursor-pointer hover:translate-y-[-4px] transition-all"
                                >
                                    <div className="h-20 bg-[#FF3399] border-b-[6px] border-black flex items-center px-8 gap-6 rounded-t-[34px]">
                                        <div className="bg-white p-2 rounded-xl border-[3px] border-black shadow-[4px_4px_0px_0px_black] h-12 w-12 flex items-center justify-center">
                                            <CustomIcon name="!!!CLOUD" size={24} />
                                        </div>
                                        <span className="text-2xl font-[1000] uppercase tracking-tighter text-black">Upload Thumbnail</span>
                                    </div>
                                    <div className="h-80 flex flex-col items-center justify-center bg-gray-50 p-8">
                                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => {
                                            if (e.target.files?.[0]) {
                                                setAnalysisFile(e.target.files[0]);
                                                const r = new FileReader();
                                                r.onloadend = () => setAnalysisPreview(r.result as string);
                                                r.readAsDataURL(e.target.files[0]);
                                            }
                                        }} />
                                        {analysisPreview ? (
                                            <img src={analysisPreview} alt="Preview" className="h-full object-contain border-[6px] border-black rounded-2xl shadow-[8px_8px_0px_0px_black]" />
                                        ) : (
                                            <div className="text-center opacity-20">
                                                <CustomIcon name="search" size={80} />
                                                <p className="font-[1000] text-2xl uppercase mt-4">Select Asset</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={handleAnalyze}
                                    disabled={analyzeLoading || !analysisFile}
                                    className="w-full h-24 border-[6px] border-black bg-[#FFDD00] shadow-[12px_12px_0px_0px_black] rounded-[40px] text-4xl font-[1000] uppercase tracking-tighter text-black"
                                >
                                    {analyzeLoading ? "SCANNING..." : "SCAN POTENTIAL"}
                                </button>
                            </div>

                            <div className="flex-1 border-[8px] border-black bg-white rounded-[40px] shadow-[16px_16px_0px_0px_black] flex flex-col overflow-hidden">
                                <div className="h-24 bg-black flex items-center px-12 gap-8">
                                    <div className="bg-[#CCFF00] p-4 rounded-2xl border-[4px] border-black flex items-center justify-center">
                                        <CustomIcon name="analytics" size={40} />
                                    </div>
                                    <span className="text-4xl font-[1000] uppercase tracking-tighter text-white">Consultant Report</span>
                                </div>
                                <div className="flex-1 p-16 overflow-y-auto custom-scrollbar">
                                    {analysisResult ? (
                                        <div className="text-2xl font-black leading-relaxed whitespace-pre-wrap">{analysisResult}</div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center opacity-5">
                                            <CustomIcon name="!!!GENERATE2" size={200} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ThumbnailStudio;
