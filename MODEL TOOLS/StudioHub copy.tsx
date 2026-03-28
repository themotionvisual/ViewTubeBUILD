import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Zap, Image, Search, Magnet, Rocket, Layers, FileVideo } from 'lucide-react';
import PreLaunchPriming from '@/components/PreLaunchPriming';
import { SeoResult, AspectRatio, ImageSize, MediaAnalysisResult, ThumbnailHistoryItem } from '@/types';
import { transcribeMediaContent, analyzeMediaContent } from '@/services/gemini';

import SeoGenerator from '@/views/SeoGenerator';
import ThumbnailStudio from '@/views/ThumbnailStudio';
import MediaAnalyzer from '@/views/MediaAnalyzer';
import HookGenerator from '@/views/HookGenerator';
import VideoManager from '@/views/VideoManager';

interface StudioHubProps {
  // SEO State
  currentSeoResult: SeoResult | null;
  onSeoResultGenerated: (result: SeoResult) => void;
  
  // Thumbnail State
  thumbnailPrompt: string;
  setThumbnailPrompt: (s: string) => void;
  thumbnailAspectRatio: AspectRatio;
  setThumbnailAspectRatio: (a: AspectRatio) => void;
  thumbnailImageSize: ImageSize;
  setThumbnailImageSize: (s: ImageSize) => void;
  generatedThumbnail: string | null;
  setGeneratedThumbnail: (s: string | null) => void;
  thumbnailHistory: ThumbnailHistoryItem[];
  setThumbnailHistory: (h: ThumbnailHistoryItem[]) => void;

  // Media Analyzer State
  mediaFile: File | null;
  setMediaFile: (f: File | null) => void;
  mediaPreview: string | null;
  setMediaPreview: (s: string | null) => void;
  mediaAnalysisResult: MediaAnalysisResult | null;
  setMediaAnalysisResult: (s: MediaAnalysisResult | null) => void;
  mediaTranscriptResult: string;
  setMediaTranscriptResult: (s: string) => void;
  mediaPrompt: string;
  setMediaPrompt: (s: string) => void;

  // Global Shared State
  globalConcept: string;
  setGlobalConcept: (s: string) => void;
  globalNiche: string;
  setGlobalNiche: (s: string) => void;
  globalVideoLength: string;
  setGlobalVideoLength: (s: string) => void;
  globalChannelUrl: string;
  setGlobalChannelUrl: (s: string) => void;
  globalCurrentStats: string;
  setGlobalCurrentStats: (s: string) => void;
  globalInternalLinks: string;
  setGlobalInternalLinks: (s: string) => void;
  globalVideoFormat: string;
  setGlobalVideoFormat: (s: string) => void;
}

const StudioHub: React.FC<StudioHubProps> = (props) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    videoManager: true,
    seo: true,
    thumbnail: true,
    analyzer: true,
    hook: true,
    priming: true
  });
  const [isProcessingGlobal, setIsProcessingGlobal] = useState(false);
  const [triggerUpload, setTriggerUpload] = useState(0);
  const [triggerThumbnail, setTriggerThumbnail] = useState(0);
  const [triggerAnalyze, setTriggerAnalyze] = useState(0);
  const [triggerHook, setTriggerHook] = useState(0);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [activeThumbnailTab, setActiveThumbnailTab] = useState<'generate' | 'analyze'>('generate');

  useEffect(() => {
    const handleTrigger = (e: any) => {
      const type = e.detail;
      if (type === 'upload') {
        setTriggerUpload(prev => prev + 1);
        setExpandedSections(prev => ({ ...prev, seo: true }));
      } else if (type === 'thumbnail') {
        setTriggerThumbnail(prev => prev + 1);
        setExpandedSections(prev => ({ ...prev, thumbnail: true }));
      } else if (type === 'analyze') {
        setTriggerAnalyze(prev => prev + 1);
        setExpandedSections(prev => ({ ...prev, analyzer: true }));
      } else if (type === 'hook') {
        setTriggerHook(prev => prev + 1);
        setExpandedSections(prev => ({ ...prev, hook: true }));
      }
    };
    window.addEventListener('trigger_generation', handleTrigger);
    return () => window.removeEventListener('trigger_generation', handleTrigger);
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleMasterGenerate = () => {
    setTriggerUpload(prev => prev + 1);
    setTriggerThumbnail(prev => prev + 1);
    setTriggerAnalyze(prev => prev + 1);
    setTriggerHook(prev => prev + 1);
  };

  return (
    <div className="space-y-6 animate-fade-in w-full pb-20">
      <div className="flex justify-between items-end border-b-4 border-black pb-4">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter">Creator Command Center</h1>
          <p className="text-xl font-bold text-gray-600 mt-2">AI-Powered Optimization for Retention, SEO, and Growth</p>
        </div>
        <div className="bg-[#00CCFF] text-black px-4 py-2 rounded-xl border-3 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform rotate-2">
          CREATOR TOOLS
        </div>
      </div>

      {/* Video Editor */}
      <div className="pop-box">
        <div 
          className="pop-header bg-[#00CCFF] text-black flex flex-wrap justify-between items-center cursor-pointer gap-4"
          onClick={() => toggleSection('videoManager')}
        >
          <div className="flex items-center gap-2 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-[#FFB158] border-2 border-black rounded-lg flex items-center justify-center shadow-[2px_2px_0px_0px_black]">
              <FileVideo size={32} className="text-black" />
            </div>
            <span className="text-[38px] font-black uppercase">Video Editor</span>
          </div>
          <span className="text-2xl">{expandedSections.videoManager ? '−' : '+'}</span>
        </div>
        <div className={`pop-content ${expandedSections.videoManager ? 'block' : 'hidden'}`}>
          <VideoManager />
        </div>
      </div>

      {/* Upload Generator (Combined Assets + SEO) */}
      <div className="pop-box">
        <div 
          className="pop-header bg-[#CCFF33] text-black flex flex-wrap justify-between items-center cursor-pointer gap-4"
          onClick={() => toggleSection('seo')}
        >
          <div className="flex items-center gap-2 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-[#FFB158] border-2 border-black rounded-lg flex items-center justify-center shadow-[2px_2px_0px_0px_black]">
              <Zap size={44} className="text-black" />
            </div>
            <span className="text-[38px] font-black uppercase">Upload Generator</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:gap-4">
             <div className="flex flex-wrap items-center gap-2 md:gap-4" onClick={e => e.stopPropagation()}>
                 {/* Format Toggle */}
                 <div className="flex items-center gap-2 bg-white border-2 border-black rounded-xl p-1 shadow-[2px_2px_0px_0px_black]">
                     <button 
                       onClick={() => props.setGlobalVideoFormat('Longform')}
                       className={`px-3 py-1 text-xs md:text-sm font-bold uppercase rounded-lg transition-colors text-black ${props.globalVideoFormat === 'Longform' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
                     >
                       Longform
                     </button>
                     <button 
                       onClick={() => props.setGlobalVideoFormat('Shorts')}
                       className={`px-3 py-1 text-xs md:text-sm font-bold uppercase rounded-lg transition-colors text-black ${props.globalVideoFormat === 'Shorts' ? 'bg-[#FF7497] text-white' : 'hover:bg-gray-100'}`}
                     >
                       Shorts
                     </button>
                 </div>
                 {/* Mode Toggle */}
                 <div className="flex items-center gap-2 bg-white border-2 border-black rounded-xl p-1 shadow-[2px_2px_0px_0px_black]">
                     <button 
                       onClick={() => setIsBulkMode(false)}
                       className={`px-3 py-1 text-xs md:text-sm font-bold uppercase rounded-lg transition-colors text-black ${!isBulkMode ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
                     >
                       Single
                     </button>
                     <button 
                       onClick={() => setIsBulkMode(true)}
                       className={`px-3 py-1 text-xs md:text-sm font-bold uppercase rounded-lg transition-colors text-black ${isBulkMode ? 'bg-[#FF7497] text-white' : 'hover:bg-gray-100'}`}
                     >
                       Bulk
                     </button>
                 </div>
                 {/* Reset Button */}
                 {props.currentSeoResult && !isBulkMode && (
                    <button onClick={() => props.onSeoResultGenerated(null!)} className="pop-button bg-white text-black px-4 md:px-6 py-1 md:py-2 text-xs md:text-sm w-full md:w-auto">Reset</button>
                 )}
             </div>
             <span className="text-2xl ml-2">{expandedSections.seo ? '−' : '+'}</span>
          </div>
        </div>
        <div className={`pop-content ${expandedSections.seo ? 'block' : 'hidden'}`}>
          <SeoGenerator 
            currentResult={props.currentSeoResult} 
            onResultGenerated={props.onSeoResultGenerated} 
            globalVideoFile={props.mediaFile}
            setGlobalVideoFile={props.setMediaFile}
            globalScript={props.mediaTranscriptResult}
            setGlobalScript={props.setMediaTranscriptResult}
            globalConcept={props.globalConcept}
            setGlobalConcept={props.setGlobalConcept}
            globalNiche={props.globalNiche}
            setGlobalNiche={props.setGlobalNiche}
            triggerGenerate={triggerUpload}
            globalVideoLength={props.globalVideoLength}
            setGlobalVideoLength={props.setGlobalVideoLength}
            globalChannelUrl={props.globalChannelUrl}
            setGlobalChannelUrl={props.setGlobalChannelUrl}
            globalCurrentStats={props.globalCurrentStats}
            setGlobalCurrentStats={props.setGlobalCurrentStats}
            globalInternalLinks={props.globalInternalLinks}
            setGlobalInternalLinks={props.setGlobalInternalLinks}
            globalVideoFormat={props.globalVideoFormat as any}
            setGlobalVideoFormat={props.setGlobalVideoFormat}
            setMediaPreview={props.setMediaPreview}
            isBulkMode={isBulkMode}
            setIsBulkMode={setIsBulkMode}
          />
        </div>
      </div>

        {/* Thumbnail Studio */}
        <div className="pop-box">
          <div 
            className="pop-header bg-[#FFE850] text-black flex flex-wrap justify-between items-center cursor-pointer gap-4"
            onClick={() => toggleSection('thumbnail')}
          >
            <div className="flex items-center gap-2 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-[#FF7497] border-2 border-black rounded-lg flex items-center justify-center shadow-[2px_2px_0px_0px_black]">
                <Image size={44} className="text-black" />
              </div>
              <span className="text-[38px] font-black uppercase">Thumbnail Studio</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:gap-4">
              <div className="flex items-center gap-2 bg-white border-2 border-black rounded-xl p-1 shadow-[2px_2px_0px_0px_black]" onClick={e => e.stopPropagation()}>
                 <button 
                   onClick={() => setActiveThumbnailTab('generate')}
                   className={`px-3 py-1 text-xs md:text-sm font-bold uppercase rounded-lg transition-colors text-black ${activeThumbnailTab === 'generate' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
                 >
                   Thumbnail Studio
                 </button>
                 <button 
                   onClick={() => setActiveThumbnailTab('analyze')}
                   className={`px-3 py-1 text-xs md:text-sm font-bold uppercase rounded-lg transition-colors text-black ${activeThumbnailTab === 'analyze' ? 'bg-[#FF7497] text-white' : 'hover:bg-gray-100'}`}
                 >
                   Thumbnail Analyzer
                 </button>
              </div>
              <span className="text-2xl ml-2">{expandedSections.thumbnail ? '−' : '+'}</span>
            </div>
          </div>
          <div className={`pop-content ${expandedSections.thumbnail ? 'block' : 'hidden'}`}>
            <div className="flex bg-[#F3F4F6] p-1.5 rounded-2xl border-2 border-black mb-6 w-fit mx-auto shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
              <button 
                onClick={() => setActiveThumbnailTab('generate')}
                className={`px-6 py-2 rounded-xl font-black uppercase transition-all ${activeThumbnailTab === 'generate' ? 'bg-[#FF7497] text-black border-2 border-black shadow-[2px_2px_0_0_black]' : 'text-gray-500 hover:text-black'}`}
              >
                Generate
              </button>
              <button 
                onClick={() => setActiveThumbnailTab('analyze')}
                className={`px-6 py-2 rounded-xl font-black uppercase transition-all ${activeThumbnailTab === 'analyze' ? 'bg-[#FF7497] text-black border-2 border-black shadow-[2px_2px_0_0_black]' : 'text-gray-500 hover:text-black'}`}
              >
                Master Analysis
              </button>
            </div>

            {activeThumbnailTab === 'generate' ? (
              <ThumbnailStudio 
                currentSeoResult={props.currentSeoResult}
                prompt={props.thumbnailPrompt}
                setPrompt={props.setThumbnailPrompt}
                aspectRatio={props.thumbnailAspectRatio}
                setAspectRatio={props.setThumbnailAspectRatio}
                imageSize={props.thumbnailImageSize}
                setImageSize={props.setThumbnailImageSize}
                generatedImage={props.generatedThumbnail}
                setGeneratedImage={props.setGeneratedThumbnail}
                history={props.thumbnailHistory}
                setHistory={props.setThumbnailHistory}
                activeTab={activeThumbnailTab}
              />
            ) : (
              <div className="bg-white p-8 rounded-2xl border-3 border-black shadow-[6px_6px_0_0_black]">
                 <div className="flex flex-col items-center justify-center py-10">
                   <div className="w-16 h-16 bg-[#CCFF00] border-2 border-black rounded-full flex items-center justify-center mb-4 shadow-[3px_3px_0_0_black]">
                     <Search size={32} />
                   </div>
                   <h3 className="text-2xl font-black uppercase">Thumbnail Master Analysis</h3>
                   <p className="text-gray-600 font-bold text-center mt-2 max-w-md">Compare CTR potential, color theory, and visual hierarchy across your thumbnails.</p>
                   <button className="pop-button mt-6 bg-black text-white px-8 py-3">Deep Scan Assets</button>
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* Content Analyzer */}
        <div className="pop-box">
          <div 
            className="pop-header bg-[#FFB158] text-black flex justify-between items-center cursor-pointer"
            onClick={() => toggleSection('analyzer')}
          >
            <div className="flex items-center gap-2 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-[#FF7497] border-2 border-black rounded-lg flex items-center justify-center shadow-[2px_2px_0px_0px_black]">
                <Search size={44} className="text-black" />
              </div>
              <span className="text-[38px] font-black uppercase">Content Analyzer</span>
            </div>
            <span className="text-2xl">{expandedSections.analyzer ? '−' : '+'}</span>
          </div>
          <div className={`pop-content ${expandedSections.analyzer ? 'block' : 'hidden'}`}>
            <MediaAnalyzer
              file={props.mediaFile}
              setFile={props.setMediaFile}
              preview={props.mediaPreview}
              setPreview={props.setMediaPreview}
              analysisResult={props.mediaAnalysisResult}
              setAnalysisResult={props.setMediaAnalysisResult}
              transcriptResult={props.mediaTranscriptResult}
              setTranscriptResult={props.setMediaTranscriptResult}
              prompt={props.mediaPrompt}
              setPrompt={props.setMediaPrompt}
              triggerGenerate={triggerAnalyze}
            />
          </div>
        </div>

        {/* Hook Generator */}
        <div className="pop-box">
          <div 
            className="pop-header bg-[#FF6666] text-black flex justify-between items-center cursor-pointer"
            onClick={() => toggleSection('hook')}
          >
            <div className="flex items-center gap-2 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-[#FFE850] border-2 border-black rounded-lg flex items-center justify-center shadow-[2px_2px_0px_0px_black]">
                <Magnet size={44} className="text-black" />
              </div>
              <span className="text-[38px] font-black uppercase">Hook Generator</span>
            </div>
            <span className="text-2xl">{expandedSections.hook ? '−' : '+'}</span>
          </div>
          <div className={`pop-content ${expandedSections.hook ? 'block' : 'hidden'}`}>
            <HookGenerator 
              globalScript={props.mediaTranscriptResult} 
              triggerGenerate={triggerHook}
            />
          </div>
        </div>

        {/* Pre-Launch Priming */}
        <div className="pop-box">
          <div 
            className="pop-header bg-[#CC99FF] text-black flex justify-between items-center cursor-pointer"
            onClick={() => toggleSection('priming')}
          >
            <div className="flex items-center gap-2 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-[#FFE850] border-2 border-black rounded-lg flex items-center justify-center shadow-[2px_2px_0px_0px_black]">
                <Rocket size={44} className="text-black" />
              </div>
              <span className="text-[38px] font-black uppercase">Pre-Launch Priming</span>
            </div>
            <span className="text-2xl">{expandedSections.priming ? '−' : '+'}</span>
          </div>
          <div className={`pop-content ${expandedSections.priming ? 'block' : 'hidden'} p-6`}>
            <PreLaunchPriming />
          </div>
        </div>
      </div>
  );
};

export default StudioHub;
