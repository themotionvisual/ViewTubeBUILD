import React, { useState, useEffect, useRef } from 'react';
import {
  VideoSnippet,
  VideoDetails,
  VideoStats,
  fetchVideoList,
  fetchVideoDetails,
  updateVideo,
  updateVideoThumbnail,
  fetchVideoStats,
  fetchSingleVideoAnalytics,
  SingleVideoAnalytics,
  fetchVideoCategories,
  fetchUserPlaylists,
  fetchVideoPlaylistMemberships,
  addToPlaylist,
  removeFromPlaylist,
  VideoCategory,
  Playlist,
  PlaylistMembership
} from '@/services/youtubeApi';
import { useGlobalData } from '@/components/GlobalDataContext';
import { AppView } from '@/types';
import { isChannelConnected } from '@/services/youtubeAuth';
import { generateTagSuggestions, analyzeExistingTags, TagSuggestion, hasGeminiKey } from '@/services/gemini';
import {
  FileVideo,
  Edit,
  Save,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Eye,
  ThumbsUp,
  MessageSquare,
  Clock,
  Share2,
  Percent,
  MousePointerClick,
  DollarSign,
  Type,
  AlignLeft,
  Tag,
  Lock,
  LayoutGrid,
  ListMusic,
  Plus,
  Trash2,
  Sparkles,
  BarChart3,
  Search,
  Upload,
  Image as ImageIcon,
  Save
} from 'lucide-react';

const TagBadge: React.FC<{
  tag: string;
  analysis?: TagSuggestion;
  onRemove?: () => void;
  onEdit?: () => void;
  onAdd?: () => void;
  isSuggested?: boolean;
  isAdded?: boolean;
}> = ({ tag, analysis, onRemove, onEdit, onAdd, isSuggested, isAdded }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#00CCFF'; // Blue
    if (score >= 80) return '#CCFF33'; // Lime
    if (score >= 70) return '#FFCC33'; // Yellow
    if (score >= 60) return '#FF9933'; // Orange
    return '#ffb158'; // Orange-ish
  };

  return (
    <div className="relative group">
      <div
        onClick={onEdit || onAdd}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`flex items-stretch min-w-[100px] border-[3.25px] border-black rounded-[20px] transition-all cursor-pointer overflow-hidden ${isAdded ? 'bg-gray-200 opacity-50 cursor-not-allowed' :
          isSuggested ? 'bg-white text-black hover:bg-gray-100' : 'bg-white text-black'
          }`}
        style={{ borderStyle: 'outset', lineHeight: '16px', fontSize: '14px' }}
      >
        {/* Left Icon */}
        <div className="pl-3 pr-1 flex items-center flex-shrink-0">
          {onRemove ? (
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="text-black hover:text-red-600 transition-colors flex items-center font-black"
            >
              <X size={14} strokeWidth={4} />
            </button>
          ) : isSuggested && !isAdded ? (
            <Plus size={14} strokeWidth={4} className="text-black" />
          ) : (
            <div className="w-[14px]" /> // Spacer if no icon
          )}
        </div>

        {/* Middle Title */}
        <span
          className="flex-1 flex items-center justify-center uppercase tracking-tight font-bold whitespace-nowrap px-2 py-1"
          style={{ fontFamily: 'Verdana, sans-serif', fontSize: '15px', lineHeight: '14px' }}
        >
          {tag}
        </span>

        {/* Right Score (Filled Tip) */}
        {analysis ? (
          <div
            className="px-3 flex items-center justify-center"
            style={{ backgroundColor: getScoreColor(analysis.score) }}
          >
            <span className="text-[14px] text-black font-bold">
              {analysis.score}
            </span>
          </div>
        ) : (
          <div className="w-3 flex-shrink-0" /> // Right spacer if no score
        )}
      </div>

      {showTooltip && analysis && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-4 bg-white border-[3px] border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-50 pointer-events-none">
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b-2 border-black pb-1">
              <span className="text-xs font-black uppercase">SEO Metrics</span>
              <span
                className="text-xs px-2 py-0.5 rounded-full text-black font-black"
                style={{ backgroundColor: getScoreColor(analysis.score) }}
              >
                Score: {analysis.score}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold uppercase">
              <div className="text-gray-500">Volume</div>
              <div className="text-right">{analysis.searchVolume.toLocaleString()}</div>

              <div className="text-gray-500">Competition</div>
              <div className="text-right">{analysis.competition.toLocaleString()}</div>

              <div className="text-gray-500">Est. Rank</div>
              <div className="text-right text-emerald-600">#{analysis.rank}</div>

              <div className="text-gray-500">Triple Keyword</div>
              <div className="text-right">
                {analysis.tripleKeyword ? (
                  <span className="text-emerald-600 flex items-center justify-end gap-1">
                    <CheckCircle size={10} /> YES
                  </span>
                ) : (
                  <span className="text-[#ffb158] flex items-center justify-end gap-1">
                    <X size={10} /> NO
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const VideoManager: React.FC = () => {
  const { setGlobalConcept, triggerGeneration } = useGlobalData();
  const [videos, setVideos] = useState<VideoSnippet[]>([]);
  const [videoSearchQuery, setVideoSearchQuery] = useState('');
  const [isSearchingVideos, setIsSearchingVideos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoDetails | null>(null);
  const [selectedVideoStats, setSelectedVideoStats] = useState<VideoStats | null>(null);
  const [videoAnalytics, setVideoAnalytics] = useState<SingleVideoAnalytics | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [playlistMenuOpen, setPlaylistMenuOpen] = useState(false);
  const playlistMenuRef = useRef<HTMLDivElement>(null);

  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
  const [currentPlaylists, setCurrentPlaylists] = useState<PlaylistMembership[]>([]);
  const [selectedPlaylistIds, setSelectedPlaylistIds] = useState<string[]>([]);

  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTags, setEditTags] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [isTagsExpanded, setIsTagsExpanded] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState<TagSuggestion[]>([]);

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);
  const [isDraggingThumbnail, setIsDraggingThumbnail] = useState(false);
  const [existingTagAnalysis, setExistingTagAnalysis] = useState<TagSuggestion[]>([]);
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const [isAnalyzingTags, setIsAnalyzingTags] = useState(false);
  const [editPrivacy, setEditPrivacy] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const connected = isChannelConnected();

  useEffect(() => {
    if (connected && videos.length === 0 && !loading) {
      loadInitialData();
    }
  }, [connected]);

  // Close playlist dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (playlistMenuRef.current && !playlistMenuRef.current.contains(event.target as Node)) {
        setPlaylistMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadInitialData = async () => {
    console.log("loadInitialData called");
    setLoading(true);
    try {
      // Fetch data independently so one failure doesn't block everything
      const results = await Promise.allSettled([
        fetchVideoList(50),
        fetchVideoCategories(),
        fetchUserPlaylists()
      ]);

      const videoList = results[0].status === 'fulfilled' ? results[0].value : [];
      const categoryList = results[1].status === 'fulfilled' ? results[1].value : [];
      const playlists = results[2].status === 'fulfilled' ? results[2].value : [];

      if (results[0].status === 'rejected') {
        console.warn("Video list fetch failed:", results[0].reason);
      }
      if (results[1].status === 'rejected') {
        console.warn("Categories fetch failed:", results[1].reason);
      }
      if (results[2].status === 'rejected') {
        console.warn("Playlists fetch failed:", results[2].reason);
      }

      console.log("loadInitialData finished");
      setVideos(videoList);
      setCategories(categoryList);
      setUserPlaylists(playlists);

      if (videoList.length > 0) {
        handleSelectVideo(videoList[0].videoId, playlists);
      }
    } catch (err: any) {
      console.error("Critical failure in loadInitialData", err);
      setError(err.message || "Failed to load initial data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadVideos = async (query?: string) => {
    console.log("loadVideos called", query);
    setLoading(true);
    setError(null);
    try {
      const data = await fetchVideoList(50, query);
      console.log("loadVideos finished");
      setVideos(data);
    } catch (err: any) {
      console.error("Failed to load videos", err);
      setError(err.message || "Failed to load videos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (dropdownOpen) {
        setIsSearchingVideos(true);
        loadVideos(videoSearchQuery).finally(() => setIsSearchingVideos(false));
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [videoSearchQuery, dropdownOpen]);

  const handleSelectVideo = async (videoId: string, playlistsToUse = userPlaylists) => {
    setLoading(true);
    setError(null);
    setSaveSuccess(false);
    setDropdownOpen(false);
    try {
      const [details, statsArray, analytics] = await Promise.all([
        fetchVideoDetails(videoId),
        fetchVideoStats([videoId]),
        fetchSingleVideoAnalytics(videoId)
      ]);

      setSelectedVideo(details);
      if (statsArray.length > 0) {
        setSelectedVideoStats(statsArray[0]);
      }
      setVideoAnalytics(analytics);
      setEditTitle(details.title);
      setEditDescription(details.description);
      setEditTags(details.tags.join(', '));
      setEditPrivacy(details.privacyStatus);
      setEditCategoryId(details.categoryId);
      setSuggestedTags([]); // Clear suggestions for new video
      setExistingTagAnalysis([]); // Clear analysis for new video

      // Fetch playlist memberships
      const memberships = await fetchVideoPlaylistMemberships(videoId, playlistsToUse.map(p => p.id));
      setCurrentPlaylists(memberships);
      setSelectedPlaylistIds(memberships.map(m => m.playlistId));

      // Analyze existing tags (only if key exists)
      if (details.tags.length > 0 && hasGeminiKey()) {
        setIsAnalyzingTags(true);
        analyzeExistingTags(details.title, details.description, details.tags)
          .then(analysis => setExistingTagAnalysis(analysis))
          .catch(err => {
            console.error("Auto-analyze tags failed:", err);
            const errMsg = err?.message || String(err);
            if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED')) {
              setError("AI Analysis quota exceeded. Please check your billing or try again later.");
            }
          })
          .finally(() => setIsAnalyzingTags(false));
      }

      // Automatically generate tag suggestions (only if key exists)
      if (details.title && details.description && hasGeminiKey()) {
        setIsGeneratingTags(true);
        generateTagSuggestions(details.title, details.description)
          .then(suggestions => {
            const sorted = [...suggestions].sort((a, b) => b.score - a.score).slice(0, 10);
            setSuggestedTags(sorted);
          })
          .catch(err => {
            console.error("Auto-generate tags failed:", err);
            const errMsg = err?.message || String(err);
            if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED')) {
              setError("AI Generation quota exceeded. Please check your billing or try again later.");
            }
          })
          .finally(() => setIsGeneratingTags(false));
      }

    } catch (err: any) {
      setError(err.message || "Failed to load video details");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedVideo) return;
    setSaving(true);
    setError(null);
    setSaveSuccess(false);
    try {
      // 1. Update basic metadata
      await updateVideo(selectedVideo.videoId, {
        title: editTitle,
        description: editDescription,
        tags: editTags.split(',').map(t => t.trim()).filter(t => t !== ''),
        privacyStatus: editPrivacy as any,
        categoryId: editCategoryId
      });

      // 2. Update thumbnail if selected
      if (thumbnailFile) {
        await updateVideoThumbnail(selectedVideo.videoId, thumbnailFile);
        setThumbnailFile(null);
        setThumbnailPreview(null);
      }

      // 3. Update playlists
      const toAdd = selectedPlaylistIds.filter(id => !currentPlaylists.some(m => m.playlistId === id));
      const toRemove = currentPlaylists.filter(m => !selectedPlaylistIds.includes(m.playlistId));

      await Promise.all([
        ...toAdd.map(id => addToPlaylist(id, selectedVideo.videoId)),
        ...toRemove.map(m => removeFromPlaylist(m.playlistItemId))
      ]);

      // Refresh current memberships
      const newMemberships = await fetchVideoPlaylistMemberships(selectedVideo.videoId, userPlaylists.map(p => p.id));
      setCurrentPlaylists(newMemberships);
      setSelectedPlaylistIds(newMemberships.map(m => m.playlistId));

      setSaveSuccess(true);
      // Refresh video list to show updated title
      const data = await fetchVideoList(50);
      setVideos(data);
    } catch (err: any) {
      setError(err.message || "Failed to update video");
    } finally {
      setSaving(false);
    }
  };

  const togglePlaylist = (playlistId: string) => {
    setSelectedPlaylistIds(prev =>
      prev.includes(playlistId)
        ? prev.filter(id => id !== playlistId)
        : [...prev, playlistId]
    );
  };

  const handleAddTag = (tag: string, analysis?: TagSuggestion) => {
    const trimmedTag = tag.trim();
    if (!trimmedTag) return;

    const currentTags = editTags ? editTags.split(',').map(t => t.trim()).filter(Boolean) : [];
    if (!currentTags.includes(trimmedTag)) {
      setEditTags([...currentTags, trimmedTag].join(', '));
      if (analysis) {
        setExistingTagAnalysis(prev => [...prev, analysis]);
      }
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = editTags.split(',').map(t => t.trim()).filter(Boolean);
    setEditTags(currentTags.filter(t => t !== tagToRemove).join(', '));
    setExistingTagAnalysis(prev => prev.filter(a => a.tag !== tagToRemove));
  };

  const handleEditTag = (tag: string) => {
    handleRemoveTag(tag);
    setTagInput(tag);
  };

  const handleThumbnailChange = (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      setThumbnailError("Image size must be under 2MB");
      return;
    }
    setThumbnailError(null);
    setThumbnailFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnailPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRefreshAnalysis = async () => {
    if (!selectedVideo || !editTags) return;
    setIsAnalyzingTags(true);
    try {
      const tags = editTags.split(',').map(t => t.trim()).filter(Boolean);
      const analysis = await analyzeExistingTags(editTitle, editDescription, tags);
      setExistingTagAnalysis(analysis);
    } catch (err: any) {
      console.error("Failed to refresh analysis:", err);
      const errMsg = err?.message || String(err);
      if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED')) {
        setError("AI Analysis quota exceeded. Please check your billing or try again later.");
      }
    } finally {
      setIsAnalyzingTags(false);
    }
  };

  const handleGenerateTags = async () => {
    if (!editTitle || !editDescription) return;
    setIsGeneratingTags(true);
    try {
      const suggestions = await generateTagSuggestions(editTitle, editDescription);
      const sorted = [...suggestions].sort((a, b) => b.score - a.score).slice(0, 10);
      setSuggestedTags(sorted);
    } catch (err: any) {
      console.error("Failed to generate tags:", err);
      const errMsg = err?.message || String(err);
      if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED')) {
        setError("AI Generation quota exceeded. Please check your billing or try again later.");
      }
    } finally {
      setIsGeneratingTags(false);
    }
  };

  const formatDuration = (secondsStr: string) => {
    const totalSeconds = parseInt(secondsStr, 10);
    if (isNaN(totalSeconds)) return "0:00";
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatNumber = (numStr: string) => {
    const num = parseInt(numStr, 10);
    if (isNaN(num)) return "0";
    return new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(num);
  };

  const EditableField = ({ label, icon: Icon, children }: { label: string, icon: any, children: React.ReactNode }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon size={14} className="text-[#00CCFF]" />
        <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">{label}</label>
      </div>
      <div className="relative group">
        {children}
      </div>
    </div>
  );

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-6">
        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_black]">
          <FileVideo size={40} className="text-gray-400" />
        </div>
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-black uppercase">Channel Not Connected</h2>
          <p className="text-gray-600 font-bold max-w-md">Connect your YouTube channel to manage your videos, optimize metadata, and view deep analytics.</p>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('yt_navigate', { detail: 'SETTINGS' }))}
            className="pop-button bg-[#FF0000] text-white px-8 py-3 text-lg"
          >
            GO TO SETTINGS TO CONNECT
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full pb-20">
      <div className="flex justify-between items-end border-b-4 border-black pb-4">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter text-black">Video Asset Optimizer</h1>
          <p className="text-xl font-bold text-gray-600 mt-1">Deep Metadata Tuning & Algorithmic Packaging</p>
        </div>
        <div className="bg-[#00CCFF] text-black p-3 rounded-xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform rotate-2 flex items-center justify-center">
          <FileVideo size={32} />
        </div>
      </div>

      {error && (
        <div className="bg-[#ffb158]/20 border-3 border-[#ffb158] p-4 rounded-xl flex items-center gap-4 text-[#ffb158] font-bold animate-shake">
          <AlertCircle size={24} />
          <p>{error}</p>
        </div>
      )}

      {saveSuccess && (
        <div className="bg-green-100 border-3 border-green-500 p-4 rounded-xl flex items-center gap-4 text-green-700 font-bold">
          <CheckCircle size={24} />
          <p>Video updated successfully!</p>
        </div>
      )}

      {loading && !selectedVideo ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="animate-spin text-[#00CCFF]" size={40} />
          <p className="font-bold uppercase">Fetching Cloud Data...</p>
        </div>
      ) : (
        selectedVideo ? (
          <>
            <div className="relative" ref={dropdownRef}>
              <div
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-6 rounded-2xl border-4 border-black transition-all cursor-pointer group ${dropdownOpen ? 'bg-gray-100 shadow-none translate-y-1' : 'bg-white shadow-[8px_8px_0px_0px_black] hover:bg-gray-50'}`}
              >
                <div className="flex gap-6 items-center flex-1 min-w-0">
                  <div className="relative flex-shrink-0">
                    <img
                      src={selectedVideo.thumbnail}
                      alt={selectedVideo.title}
                      className="w-48 h-28 object-cover rounded-xl border-3 border-black shadow-[4px_4px_0px_0px_black] group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-3xl font-black uppercase leading-tight line-clamp-2 mb-2 group-hover:text-[#00CCFF] transition-colors">{selectedVideo.title}</h2>
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => { setGlobalConcept(selectedVideo.title); triggerGeneration('upload'); window.dispatchEvent(new CustomEvent('yt_navigate', { detail: AppView.STUDIO_HUB })); }} className="bg-black text-white px-4 py-2 rounded-lg font-black uppercase text-xs">Upload Generator</button>
                      <button onClick={() => { setGlobalConcept(selectedVideo.title); triggerGeneration('thumbnail'); window.dispatchEvent(new CustomEvent('yt_navigate', { detail: AppView.STUDIO_HUB })); }} className="bg-black text-white px-4 py-2 rounded-lg font-black uppercase text-xs">Thumbnail Studio</button>
                      <button onClick={() => { setGlobalConcept(selectedVideo.title); triggerGeneration('analyze'); window.dispatchEvent(new CustomEvent('yt_navigate', { detail: AppView.STUDIO_HUB })); }} className="bg-black text-white px-4 py-2 rounded-lg font-black uppercase text-xs">Content Analyzer</button>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <p className="text-gray-500 font-bold text-sm">ID: {selectedVideo.videoId}</p>
                      <a
                        href={`https://youtube.com/watch?v=${selectedVideo.videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-xs font-black uppercase text-[#00CCFF] hover:underline"
                      >
                        View on YouTube <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center pl-4 border-l-2 border-transparent group-hover:border-gray-200 transition-colors">
                  <ChevronDown size={40} strokeWidth={2.5} className={`text-[#00CCFF] transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </div>
              </div>

              {dropdownOpen && (
                <div className="absolute left-0 right-0 mt-4 bg-white border-4 border-black rounded-3xl shadow-[24px_24px_0px_0px_black] z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-6 border-b-4 border-black bg-[#FFDD00]">
                    <div className="flex flex-col whitespace-nowrap">
                      <span className="font-black text-2xl uppercase tracking-tighter">Select Video</span>
                    </div>

                    <div className="relative w-full max-w-md">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        placeholder="Search videos by title..."
                        value={videoSearchQuery}
                        onChange={(e) => setVideoSearchQuery(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full pl-12 pr-4 py-3 bg-white border-3 border-black rounded-xl font-bold text-gray-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-y-[2px] focus:shadow-none transition-all outline-none"
                      />
                    </div>

                    <div className="flex gap-4 whitespace-nowrap">
                      <button
                        onClick={(e) => { e.stopPropagation(); loadVideos(videoSearchQuery); }}
                        className="bg-black text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#00CCFF] hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] active:translate-y-1 active:shadow-none"
                      >
                        Refresh List
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDropdownOpen(false); }}
                        className="bg-white text-black border-2 border-black px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-all shadow-[4px_4px_0px_0px_black] active:translate-y-1 active:shadow-none"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                  <div className="max-h-[70vh] overflow-y-auto custom-scrollbar flex flex-col bg-white">
                    {isSearchingVideos ? (
                      <div className="flex justify-center items-center py-12">
                        <Loader2 className="animate-spin text-black" size={32} />
                      </div>
                    ) : videos.length === 0 ? (
                      <div className="text-center py-12 font-bold text-gray-500 uppercase">
                        No videos found matching "{videoSearchQuery}"
                      </div>
                    ) : (
                      <>
                        {videos.map(video => (
                          <div
                            key={video.videoId}
                            onClick={(e) => { e.stopPropagation(); handleSelectVideo(video.videoId); }}
                            className={`group relative flex items-center gap-4 px-4 py-3 border-b-2 border-black cursor-pointer transition-all duration-300 hover:bg-gray-50 ${selectedVideo?.videoId === video.videoId ? 'bg-[#00CCFF]/10' : 'bg-white'}`}
                          >
                            <div className="relative flex-shrink-0 w-12 h-7 group-hover:w-40 group-hover:h-24 overflow-hidden rounded border border-black shadow-[1px_1px_0px_0px_black] group-hover:shadow-[4px_4px_0px_0px_black] transition-all duration-300 ease-in-out">
                              <img
                                src={video.thumbnail}
                                alt={video.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <h3 className="font-black text-lg leading-tight uppercase group-hover:text-[#00CCFF] transition-colors truncate">{video.title}</h3>
                              <div className="flex items-center gap-3 opacity-0 max-h-0 overflow-hidden group-hover:opacity-100 group-hover:max-h-8 group-hover:mt-1 transition-all duration-300 ease-in-out">
                                <span className="text-xs font-bold text-gray-500 uppercase whitespace-nowrap">ID: {video.videoId}</span>
                                <div className="h-1 w-1 rounded-full bg-gray-300 flex-shrink-0" />
                                <span className="text-xs font-bold text-gray-500 uppercase whitespace-nowrap">Published: {new Date(video.publishedAt).toLocaleDateString()}</span>
                                {selectedVideo?.videoId === video.videoId && (
                                  <span className="bg-black text-[#00CCFF] text-[10px] font-black px-2 py-0.5 rounded uppercase animate-pulse ml-auto whitespace-nowrap">Editing</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="bg-[#FFDD00] p-3 text-center border-t-2 border-black">
                          <span className="font-black text-sm uppercase tracking-widest">Use search to find older videos</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Stats & Thumbnail Tool */}
            {selectedVideoStats && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Left: Stats (2x4) */}
                <div className="bg-gray-50 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_black] p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
                    <div className="flex flex-col items-center justify-center p-2 bg-white border-2 border-black rounded-lg">
                      <Eye className="text-[#00CCFF] mb-1" size={18} />
                      <span className="font-black text-sm">{formatNumber(selectedVideoStats.views)}</span>
                      <span className="text-[8px] font-bold uppercase text-gray-400">Views</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 bg-white border-2 border-black rounded-lg">
                      <ThumbsUp className="text-[#00CCFF] mb-1" size={18} />
                      <span className="font-black text-sm">{formatNumber(selectedVideoStats.likes)}</span>
                      <span className="text-[8px] font-bold uppercase text-gray-400">Likes</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 bg-white border-2 border-black rounded-lg">
                      <MessageSquare className="text-[#00CCFF] mb-1" size={18} />
                      <span className="font-black text-sm">{formatNumber(selectedVideoStats.comments)}</span>
                      <span className="text-[8px] font-bold uppercase text-gray-400">Comments</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 bg-white border-2 border-black rounded-lg">
                      <Share2 className="text-[#00CCFF] mb-1" size={18} />
                      <span className="font-black text-sm">{videoAnalytics ? formatNumber(videoAnalytics.shares) : '0'}</span>
                      <span className="text-[8px] font-bold uppercase text-gray-400">Shares</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 bg-white border-2 border-black rounded-lg">
                      <Percent className="text-[#00CCFF] mb-1" size={18} />
                      <span className="font-black text-sm">{videoAnalytics ? `${videoAnalytics.averageViewPercentage}%` : '0%'}</span>
                      <span className="text-[8px] font-bold uppercase text-gray-400">APV</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 bg-white border-2 border-black rounded-lg">
                      <MousePointerClick className="text-[#00CCFF] mb-1" size={18} />
                      <span className="font-black text-sm">{videoAnalytics ? videoAnalytics.clickThroughRate : '0.0%'}</span>
                      <span className="text-[8px] font-bold uppercase text-gray-400">CTR</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 bg-white border-2 border-black rounded-lg">
                      <DollarSign className="text-[#00CCFF] mb-1" size={18} />
                      <span className="font-black text-sm">${videoAnalytics ? videoAnalytics.estimatedRevenue : '0.00'}</span>
                      <span className="text-[8px] font-bold uppercase text-gray-400">Rev</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 bg-white border-2 border-black rounded-lg">
                      <Clock className="text-gray-400 mb-1" size={18} />
                      <span className="font-black text-sm">{formatDuration(selectedVideoStats.duration)}</span>
                      <span className="text-[8px] font-bold uppercase text-gray-400">Time</span>
                    </div>
                  </div>
                </div>

                {/* Right: Thumbnail Tool */}
                <div className="bg-gray-50 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_black] p-4">
                  <div
                    className={`relative h-full min-h-[140px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 transition-all ${isDraggingThumbnail ? 'border-[#00CCFF] bg-[#00CCFF]/5' : 'border-gray-300 bg-white'}`}
                    onDragOver={(e) => { e.preventDefault(); setIsDraggingThumbnail(true); }}
                    onDragLeave={() => setIsDraggingThumbnail(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingThumbnail(false);
                      const file = e.dataTransfer.files[0];
                      if (file && file.type.startsWith('image/')) {
                        handleThumbnailChange(file);
                      }
                    }}
                  >
                    {thumbnailPreview ? (
                      <div className="relative w-full h-full group">
                        <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                          <button
                            onClick={() => { setThumbnailFile(null); setThumbnailPreview(null); }}
                            className="p-2 bg-white text-black rounded-full hover:bg-[#ffb158]/10 hover:text-[#ffb158] transition-colors"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center space-y-2">
                        <div className="mx-auto w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <Upload className="text-gray-400" size={20} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold uppercase tracking-tight">Drag & Drop Video or Image</p>
                          <p className="text-[10px] text-gray-400 uppercase font-bold">Max 2MB</p>
                        </div>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-[#00CCFF] hover:text-black transition-all"
                        >
                          Upload Thumbnail
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleThumbnailChange(file);
                          }}
                        />
                      </div>
                    )}
                    {thumbnailError && (
                      <div className="absolute bottom-2 left-0 right-0 text-center">
                        <span className="text-[8px] font-black text-[#ffb158] uppercase bg-white px-2 py-0.5 rounded border border-[#ffb158]">{thumbnailError}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <EditableField label="Video Title" icon={Type}>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-4 bg-white border-[3px] border-black rounded-2xl font-bold text-gray-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-y-[2px] focus:shadow-none transition-all outline-none"
                  placeholder="Enter high-retention title..."
                />
              </EditableField>

              <EditableField label="Description" icon={AlignLeft}>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={8}
                  className="w-full p-4 bg-white border-[3px] border-black rounded-2xl font-bold text-gray-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-y-[2px] focus:shadow-none transition-all outline-none resize-none"
                  placeholder="Enter SEO-optimized description..."
                />
              </EditableField>

              <EditableField label="Tags Manager" icon={Tag}>
                <div className="flex items-center justify-end w-full">
                  <button
                    onClick={() => setIsTagsExpanded(!isTagsExpanded)}
                    className="flex items-center justify-center w-8 h-8 bg-white border-2 border-black rounded-lg hover:bg-gray-50 transition-all"
                  >
                    <ChevronDown size={16} className={`transition-transform ${isTagsExpanded ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                {isTagsExpanded && (
                  <div className="flex items-center justify-between w-full mt-4">
                    <button
                      onClick={handleRefreshAnalysis}
                      disabled={isAnalyzingTags || !editTags}
                      className="flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-black rounded-xl text-xs font-black uppercase hover:bg-gray-50 disabled:opacity-50 transition-all"
                    >
                      {isAnalyzingTags ? <Loader2 size={14} className="animate-spin" /> : <BarChart3 size={14} />}
                      Refresh Analysis
                    </button>
                  </div>
                )}
                <div className={`text-xs font-black uppercase flex items-center gap-2 ${editTags.length > 500 ? 'text-[#ffb158]' : 'text-gray-500'}`}>
                  <span className="px-2 py-1 bg-black text-white rounded-lg">{editTags.length} / 500</span>
                  <span>Characters</span>
                </div>
                <div className="space-y-4 mt-4">
                  <div className={`w-full p-4 bg-white border-[3px] border-black rounded-2xl font-bold text-gray-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-wrap gap-2 content-start overflow-y-auto custom-scrollbar ${isTagsExpanded ? 'max-h-[600px]' : 'max-h-[140px]'}`}>
                    {editTags ? editTags.split(',').map((tag, idx) => {
                      const trimmed = tag.trim();
                      if (!trimmed) return null;
                      const analysis = existingTagAnalysis.find(a => a.tag.toLowerCase() === trimmed.toLowerCase());
                      return (
                        <TagBadge
                          key={`${trimmed}-${idx}`}
                          tag={trimmed}
                          analysis={analysis}
                          onEdit={() => handleEditTag(trimmed)}
                          onRemove={() => handleRemoveTag(trimmed)}
                        />
                      );
                    }) : (
                      <p className="text-gray-400 text-sm italic">No tags added yet...</p>
                    )}
                    {isAnalyzingTags && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border-2 border-black border-dashed rounded-xl animate-pulse">
                        <Loader2 size={14} className="animate-spin" />
                        <span className="text-xs font-bold uppercase">Analyzing...</span>
                      </div>
                    )}
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag(tagInput);
                        }
                      }}
                      onBlur={() => handleAddTag(tagInput)}
                      className="flex-1 min-w-[120px] p-1 font-bold text-gray-700 outline-none"
                      placeholder="Type tag and Enter..."
                    />
                  </div>

                  {isTagsExpanded && (
                    <div className="flex gap-4">
                      <button
                        onClick={handleGenerateTags}
                        disabled={isGeneratingTags}
                        className="flex items-center gap-2 px-6 py-4 bg-[#00CCFF] border-[3px] border-black rounded-2xl font-black uppercase tracking-tighter shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {isGeneratingTags ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                        AI Suggestions
                      </button>
                    </div>
                  )}

                  {isTagsExpanded && suggestedTags.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-black font-black uppercase text-xs tracking-widest flex items-center gap-2">
                          <Sparkles size={14} className="text-[#00CCFF]" />
                          Ranked AI Suggestions
                        </h4>
                        <button
                          onClick={() => setSuggestedTags([])}
                          className="text-gray-400 hover:text-black transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 max-h-[40px] overflow-hidden">
                        {suggestedTags.map((suggestion, idx) => {
                          const isAlreadyAdded = editTags.split(',').map(t => t.trim().toLowerCase()).includes(suggestion.tag.toLowerCase());
                          return (
                            <TagBadge
                              key={`${suggestion.tag}-${idx}`}
                              tag={suggestion.tag}
                              analysis={suggestion}
                              isSuggested={true}
                              isAdded={isAlreadyAdded}
                              onAdd={() => !isAlreadyAdded && handleAddTag(suggestion.tag, suggestion)}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </EditableField>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <EditableField label="Privacy Status" icon={Lock}>
                  <div className="relative">
                    <select
                      value={editPrivacy}
                      onChange={(e) => setEditPrivacy(e.target.value)}
                      className="w-full p-4 bg-white border-[3px] border-black rounded-2xl font-bold text-gray-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-y-[2px] focus:shadow-none transition-all outline-none appearance-none cursor-pointer"
                    >
                      <option value="public">Public</option>
                      <option value="unlisted">Unlisted</option>
                      <option value="private">Private</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" size={16} />
                  </div>
                </EditableField>

                <EditableField label="Category" icon={LayoutGrid}>
                  <div className="relative">
                    <select
                      value={editCategoryId}
                      onChange={(e) => setEditCategoryId(e.target.value)}
                      className="w-full p-4 bg-white border-[3px] border-black rounded-2xl font-bold text-gray-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-y-[2px] focus:shadow-none transition-all outline-none appearance-none cursor-pointer"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.title}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" size={16} />
                  </div>
                </EditableField>

                <EditableField label="Playlists" icon={ListMusic}>
                  <div className="relative" ref={playlistMenuRef}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPlaylistMenuOpen(!playlistMenuOpen);
                      }}
                      className="w-full p-4 bg-white border-[3px] border-black rounded-2xl font-bold text-gray-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between hover:bg-gray-50 transition-all"
                    >
                      <span className="truncate">
                        {selectedPlaylistIds.length === 0
                          ? 'Select Playlists'
                          : `${selectedPlaylistIds.length} Selected`}
                      </span>
                      <ChevronDown size={16} />
                    </button>

                    {playlistMenuOpen && (
                      <div className="absolute left-0 right-0 mt-2 bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_black] z-40 max-h-60 overflow-y-auto custom-scrollbar p-2 space-y-1">
                        {userPlaylists.length > 0 ? (
                          userPlaylists.map(playlist => (
                            <label
                              key={playlist.id}
                              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${selectedPlaylistIds.includes(playlist.id) ? 'border-[#00CCFF] bg-[#00CCFF]/5' : 'border-transparent hover:bg-gray-50'}`}
                            >
                              <input
                                type="checkbox"
                                checked={selectedPlaylistIds.includes(playlist.id)}
                                onChange={() => togglePlaylist(playlist.id)}
                                className="w-5 h-5 border-2 border-black rounded accent-[#00CCFF] cursor-pointer"
                              />
                              <span className="text-sm uppercase tracking-tight line-clamp-1">{playlist.title}</span>
                            </label>
                          ))
                        ) : (
                          <p className="text-xs text-gray-400 font-bold uppercase text-center py-4">No playlists found</p>
                        )}
                      </div>
                    )}
                  </div>
                </EditableField>
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-black text-white p-6 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-gray-900 transition-all disabled:opacity-50 shadow-[8px_8px_0px_0px_#00CCFF] active:translate-y-1 active:shadow-none"
              >
                {saving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
                {saving ? 'Pushing Changes...' : 'Save to YouTube'}
              </button>
            </div>
          </>
        ) : (
          <div className="h-full min-h-[500px] border-4 border-dashed border-black/20 rounded-3xl flex flex-col items-center justify-center p-12 text-center space-y-4">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center border-3 border-black/10">
              <Edit size={40} className="text-gray-300" />
            </div>
            <div>
              <h3 className="text-2xl font-black uppercase text-gray-400">No Video Found</h3>
              <p className="text-gray-400 font-bold max-w-xs mx-auto mt-2">Could not load any videos from your channel.</p>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default VideoManager;
