import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Zap, 
  Palette, 
  Layers, 
  Scan, 
  Download, 
  Check, 
  History,
  Type,
  Maximize2
} from 'lucide-react';
import { generateThumbnail, rateThumbnail, generateThumbnailConcept } from '../services/gemini';
import { AspectRatio, ImageSize } from '../types';
import { useBrain } from '../context/GlobalDataContext';
import { ToolHeader } from '../components/ToolHeader';

const ThumbnailStudio: React.FC = () => {
  const { brain, updateBrain, registerProvider, unregisterProvider } = useBrain();
  
  const [activeTab, setActiveTab] = useState<'generate' | 'analyze'>('generate');
  const [loading, setLoading] = useState(false);
  const [conceptLoading, setConceptLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(brain.thumbnailState.activeImageUrl);
  
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.LANDSCAPE_16_9);
  const [imageSize, setImageSize] = useState<ImageSize>(ImageSize.SIZE_1K);
  
  const [analysisPreview, setAnalysisPreview] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    registerProvider('THUMBNAIL_STUDIO');
    return () => unregisterProvider('THUMBNAIL_STUDIO');
  }, [registerProvider, unregisterProvider]);

  // Handle automatic concept generation from Brain context (SEO title)
  const handleAutoConcept = async () => {
    if (!brain.seoState.winningTitle && !brain.coreConcept) {
      alert("Please define a concept or generate SEO first.");
      return;
    }
    setConceptLoading(true);
    try {
      // Mock SEO result for the service call if we don't have a full one yet
      const mockSeo = brain.seoState.winningTitle ? {
        concept: brain.coreConcept,
        niche: brain.targetNiche,
        titleSets: [{ title: brain.seoState.winningTitle, thumbnailPrompt: '', thumbnailText: '' }]
      } : null;

      const concept = await generateThumbnailConcept(mockSeo as any, prompt);
      setPrompt(concept.prompt);
      setAspectRatio(concept.aspectRatio);
    } catch (e) {
      console.error(e);
    } finally {
      setConceptLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const img = await generateThumbnail(prompt, aspectRatio, imageSize);
      setGeneratedImage(img);
      updateBrain({ 
        thumbnailState: { 
          ...brain.thumbnailState, 
          activeImageUrl: img 
        } 
      });
    } catch (e: any) {
      alert(`Generation failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => setAnalysisPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!analysisPreview) return;
    setAnalyzeLoading(true);
    try {
      const base64 = analysisPreview.split(',')[1];
      const result = await rateThumbnail(base64, 'image/png');
      setAnalysisResult(result);
    } catch (e) {
      alert("Analysis protocol failed.");
    } finally {
      setAnalyzeLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ToolHeader 
        title="Thumbnail Studio" 
        icon="image" 
        titleBgColor="bg-[#ffb158]" 
        iconBgColor="bg-[#ff3399]" 
      />

      {/* Tab Switcher */}
      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => setActiveTab('generate')}
          className={`flex-1 py-4 border-[4px] border-black rounded-2xl font-black uppercase italic tracking-tighter transition-all shadow-[6px_6px_0px_0px_black] active:shadow-none translate-y-[-4px] active:translate-y-[2px] ${activeTab === 'generate' ? 'bg-[#ff3399] text-white' : 'bg-white text-black hover:bg-gray-50'}`}
        >
          Visual Generation
        </button>
        <button 
          onClick={() => setActiveTab('analyze')}
          className={`flex-1 py-4 border-[4px] border-black rounded-2xl font-black uppercase italic tracking-tighter transition-all shadow-[6px_6px_0px_0px_black] active:shadow-none translate-y-[-4px] active:translate-y-[2px] ${activeTab === 'analyze' ? 'bg-[#ff3399] text-white' : 'bg-white text-black hover:bg-gray-50'}`}
        >
          CTR Analytics
        </button>
      </div>

      {activeTab === 'generate' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Controls */}
          <div className="bg-white border-[4px] border-black rounded-3xl p-8 shadow-[8px_8px_0px_0px_black] space-y-6 flex flex-col">
            <div className="flex items-center justify-between border-b-4 border-black pb-4">
              <div className="flex items-center gap-3">
                <Sparkles className="text-[#ff3399]" size={24} />
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">Articulator</h3>
              </div>
              <button 
                onClick={handleAutoConcept}
                disabled={conceptLoading}
                className="bg-black text-[#ccff00] px-4 py-2 rounded-xl font-black uppercase text-xs shadow-[4px_4px_0px_0px_#ff3399] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-2"
              >
                {conceptLoading ? '...' : <><Zap size={14} /> Brain Concept</>}
              </button>
            </div>

            <div className="space-y-2 flex-1">
              <label className="text-xs font-black uppercase tracking-widest text-black/40 ml-1">Composition Prompt</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your visual vision..."
                className="w-full h-48 bg-gray-50 border-[3px] border-black rounded-xl p-6 font-bold text-lg focus:bg-white transition-all outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <label className="text-xs font-black uppercase tracking-widest text-black/40 ml-1">Aspect Ratio</label>
                 <select 
                   value={aspectRatio}
                   onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                   className="w-full bg-gray-50 border-[3px] border-black rounded-xl p-3 font-black uppercase text-sm outline-none"
                 >
                   {Object.values(AspectRatio).map(r => <option key={r} value={r}>{r}</option>)}
                 </select>
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-black uppercase tracking-widest text-black/40 ml-1">Resolution</label>
                 <select 
                   value={imageSize}
                   onChange={(e) => setImageSize(e.target.value as ImageSize)}
                   className="w-full bg-gray-50 border-[3px] border-black rounded-xl p-3 font-black uppercase text-sm outline-none"
                 >
                   {Object.values(ImageSize).map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
               </div>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={loading || !prompt}
              className="w-full bg-[#ccff00] p-6 border-[4px] border-black rounded-2xl shadow-[6px_6px_0px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:translate-x-2 active:translate-y-2 transition-all flex items-center justify-center gap-4"
            >
              {loading ? (
                <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Maximize2 size={24} />
                  <span className="text-2xl font-black uppercase italic tracking-tighter">Render Thumbnail</span>
                </>
              )}
            </button>
          </div>

          {/* Preview Panel */}
          <div className="flex flex-col gap-6">
            <div className="bg-white border-[4px] border-black rounded-3xl shadow-[8px_8px_0px_0px_black] flex-1 relative overflow-hidden flex items-center justify-center bg-checkered p-4">
              {generatedImage ? (
                <img src={generatedImage} className="max-w-full max-h-full object-contain border-[4px] border-black rounded-lg shadow-[8px_8px_20px_0px_rgba(0,0,0,0.3)]" alt="Generated" />
              ) : (
                <div className="text-center space-y-4 opacity-20">
                  <ImageIcon size={120} className="mx-auto" />
                  <span className="block font-black uppercase text-3xl italic tracking-tighter">Waiting for Render</span>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black text-white p-6 rounded-2xl border-[4px] border-black shadow-[4px_4px_0px_0px_#ccff00] flex items-center gap-4">
                <Palette className="text-[#ccff00]" />
                <div>
                   <span className="block text-[10px] font-black uppercase text-white/50">Current Style</span>
                   <span className="font-bold text-sm">{brain.thumbnailState.selectedStyle || 'No Style Selected'}</span>
                </div>
              </div>
              <button 
                onClick={() => generatedImage && window.open(generatedImage)}
                disabled={!generatedImage}
                className="bg-white p-6 rounded-2xl border-[4px] border-black shadow-[4px_4px_0px_0px_black] flex items-center gap-4 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <Download />
                <span className="font-black uppercase italic">Export</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Analyze Tab */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="space-y-6">
             <div 
               onClick={() => fileInputRef.current?.click()}
               className="bg-white border-[4px] border-black rounded-3xl h-96 shadow-[8px_8px_0px_0px_black] cursor-pointer hover:bg-gray-50 transition-all flex flex-col items-center justify-center relative overflow-hidden group"
             >
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                {analysisPreview ? (
                  <img src={analysisPreview} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <div className="text-center space-y-4 group-hover:scale-110 transition-transform">
                     <Scan size={80} className="mx-auto text-[#ff3399]" />
                     <span className="block font-black uppercase text-2xl italic tracking-tighter">Upload for Analysis</span>
                  </div>
                )}
             </div>
             <button 
               onClick={handleAnalyze}
               disabled={analyzeLoading || !analysisPreview}
               className="w-full bg-[#00d2ff] p-5 border-[4px] border-black rounded-2xl shadow-[6px_6px_0px_0px_black] font-black uppercase italic tracking-tighter text-2xl hover:shadow-none translate-y-[-4px] active:translate-y-0 transition-all flex items-center justify-center gap-4"
             >
               {analyzeLoading ? 'Scanning...' : 'Protocol: CTR Assessment'}
             </button>
           </div>

           <div className="bg-black text-white border-[4px] border-black rounded-3xl p-8 shadow-[8px_8px_0px_0px_#ff3399] overflow-auto h-full max-h-[600px]">
              <div className="flex items-center gap-3 border-b-2 border-white/20 pb-4 mb-6">
                 <History className="text-[#ff3399]" />
                 <h4 className="font-black uppercase italic text-xl">Consultant Log</h4>
              </div>
              {analysisResult ? (
                <div className="font-medium text-lg text-white/90 leading-relaxed whitespace-pre-wrap">
                  {analysisResult}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full opacity-30 text-center space-y-4">
                  <Layers size={48} />
                  <p className="font-bold">Awaiting asset scan...</p>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default ThumbnailStudio;
