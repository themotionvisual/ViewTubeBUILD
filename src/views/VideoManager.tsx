import React, { useState, useEffect, useRef } from 'react';
import {
  fetchVideoList,
  fetchVideoDetails,
  updateVideo,
  updateVideoThumbnail,
  fetchVideoStats,
  fetchSingleVideoAnalytics,
  fetchVideoCategories,
  fetchUserPlaylists,
  fetchVideoPlaylistMemberships,
  addToPlaylist,
  removeFromPlaylist
} from '../services/youtubeApi';
import type {
  VideoSnippet,
  VideoDetails,
  VideoStats,
  SingleVideoAnalytics,
  VideoCategory,
  Playlist,
  PlaylistMembership
} from '../services/youtubeApi';
import { useBrain } from '../context/GlobalDataContext';
import { isChannelConnected } from '../services/youtubeAuth';
import {
  generateTagSuggestions,
  analyzeExistingTags,
  hasGeminiKey
} from '../services/gemini';
import type { TagSuggestion } from '../services/gemini';
import {
  X,
  Loader2,
  Plus,
  Search,
  Tag,
  FileVideo,
  Eye,
  ThumbsUp,
  MessageSquare,
  Share2,
  Percent,
  MousePointerClick,
  DollarSign,
  Clock,
  Upload,
  Trash2,
  Save,
  ChevronDown,
  Sparkles,
  BarChart3,
  AlertCircle,
  CheckCircle,
  AlignLeft,
  Lock,
  LayoutGrid,
  ListMusic,
  Edit,
  ExternalLink
} from 'lucide-react';

const TagBadge: React.FC<{
  tag: string;
  analysis?: TagSuggestion;
  onRemove?: () => void;
  onAdd?: () => void;
  isSuggested?: boolean;
  isAdded?: boolean;
}> = ({ tag, analysis, onRemove, onAdd, isSuggested, isAdded }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#00CCFF';
    if (score >= 80) return '#ccff00';
    if (score >= 70) return '#ffdd00';
    return '#ff3399';
  };

  return (
    <div className="relative group">
      <div
        onClick={isAdded ? undefined : (onAdd || onRemove)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`flex items-stretch min-w-[100px] border-[3.5px] border-black rounded-[20px] transition-all cursor-pointer overflow-hidden shadow-[4px_4px_0px_0px_black] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_black] ${isAdded ? 'bg-gray-200 opacity-50 cursor-not-allowed' : isSuggested ? 'bg-white text-black hover:bg-gray-100' : 'bg-white text-black'}`}
      >
        <div className="pl-3 pr-1 flex items-center flex-shrink-0">
          {onRemove ? (
            <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="text-black hover:text-[#ff3399]">
              <X size={14} strokeWidth={4} />
            </button>
          ) : isSuggested && !isAdded ? (
            <Plus size={14} strokeWidth={4} className="text-black" />
          ) : (
            <Tag size={12} strokeWidth={4} className="text-gray-400" />
          )}
        </div>
        <div className="px-2 py-1.5 flex flex-col justify-center">
          <span className="font-black text-[12px] uppercase tracking-tighter truncate max-w-[120px]">{tag}</span>
          {analysis && (
            <div className="flex items-center gap-1 mt-0.5">
              <div className="h-1 rounded-full flex-1 min-w-[30px] border border-black/10" style={{ backgroundColor: getScoreColor(analysis.score) }} />
              <span className="text-[10px] font-black">{analysis.score}</span>
            </div>
          )}
        </div>
      </div>
      {showTooltip && analysis && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 bg-black text-white p-3 rounded-2xl z-50 shadow-[4px_4px_0px_0px_#00CCFF] border-2 border-white pointer-events-none">
          <div className="space-y-2 text-[10px] font-bold uppercase">
            <div className="flex justify-between border-b border-white/20 pb-1 mb-1">
              <span className="text-[#00ccff]">SEO Metrics</span>
              <span className="text-black px-2 py-0.5 rounded-full font-black" style={{ backgroundColor: getScoreColor(analysis.score) }}>
                {analysis.score}
              </span>
            </div>
            <div className="flex justify-between"><span>Search Vol:</span><span>{(analysis.searchVolume / 1000).toFixed(1)}K</span></div>
            <div className="flex justify-between"><span>Comp:</span><span>{analysis.competition}</span></div>
            <div className="flex justify-between"><span>Rank:</span><span className="text-[#ccff00]">#{analysis.rank}</span></div>
            <div className="flex justify-between mt-1 pt-1 border-t border-white/20">
              <span>Triple Keyword:</span>
              <span>
                {analysis.tripleKeyword ? (
                  <span className="text-[#00ff99] flex items-center gap-1"><CheckCircle size={10} /> YES</span>
                ) : (
                  <span className="text-[#ff3399] flex items-center gap-1"><X size={10} /> NO</span>
                )}
              </span>
            </div>
          </div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black rotate-45 border-r border-b border-white" />
        </div>
      )}
    </div>
  );
};

const VideoManager: React.FC = () => {
  const { updateBrain } = useBrain();
  const [videos, setVideos] = useState<VideoSnippet[]>([]);
  const [videoSearchQuery, setVideoSearchQuery] = useState('');
  const [isSearchingVideos, setIsSearchingVideos] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [videoDetails, setVideoDetails] = useState<VideoDetails | null>(null);
  const [videoStats, setVideoStats] = useState<VideoStats | null>(null);
  const [videoAnalytics, setVideoAnalytics] = useState<SingleVideoAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [playlistMenuOpen, setPlaylistMenuOpen] = useState(false);
  const playlistMenuRef = useRef<HTMLDivElement>(null);

  // Edit State
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editPrivacy, setEditPrivacy] = useState('public');
  const [editCategoryId, setEditCategoryId] = useState('27');

  // Playlists
  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
  const [currentPlaylists, setCurrentPlaylists] = useState<PlaylistMembership[]>([]);
  const [selectedPlaylistIds, setSelectedPlaylistIds] = useState<string[]>([]);

  // AI State
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const [isAnalyzingTags, setIsAnalyzingTags] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState<TagSuggestion[]>([]);
  const [existingTagAnalysis, setExistingTagAnalysis] = useState<TagSuggestion[]>([]);
  const [isTagsExpanded, setIsTagsExpanded] = useState(false);

  const [tagInput, setTagInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [isDraggingThumbnail, setIsDraggingThumbnail] = useState(false);

  const connected = isChannelConnected();

  // Derived: the full selected video object used throughout JSX
  const selectedVideo: (VideoSnippet & Partial<VideoDetails>) | null =
    selectedVideoId
      ? ({
        ...(videos.find(v => v.videoId === selectedVideoId) ?? {}),
        ...(videoDetails ?? {}),
      } as VideoSnippet & Partial<VideoDetails>)
      : null;

  useEffect(() => {
    if (connected && videos.length === 0 && !loading) {
      loadInitialData();
    }
  }, [connected]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.allSettled([
        fetchVideoList(50),
        fetchVideoCategories(),
        fetchUserPlaylists()
      ]);

      const videoList = results[0].status === 'fulfilled' ? results[0].value : [];
      const categoryList = results[1].status === 'fulfilled' ? results[1].value : [];
      const playlists = results[2].status === 'fulfilled' ? results[2].value : [];

      setVideos(videoList);
      setCategories(categoryList);
      setUserPlaylists(playlists);

      if (videoList.length > 0) {
        handleSelectVideo(videoList[0].videoId, playlists);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load initial data");
    } finally {
      setLoading(false);
    }
  };

  const loadVideos = async (query?: string) => {
    setLoading(true);
    try {
      const data = await fetchVideoList(50, query);
      setVideos(data);
    } catch (err: any) {
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
    setSelectedVideoId(videoId);
    setLoading(true);
    setError(null);
    setSaveSuccess(false);
    setDropdownOpen(false);
    setThumbnailPreview(null);
    setThumbnailFile(null);
    try {
      const [details, stats, analytics] = await Promise.all([
        fetchVideoDetails(videoId),
        fetchVideoStats([videoId]),
        fetchSingleVideoAnalytics(videoId)
      ]);
      setVideoDetails(details);
      setVideoStats(stats[0] || null);
      setVideoAnalytics(analytics);
      setEditTitle(details.title);
      setEditDescription(details.description);
      setEditTags(details.tags.join(', '));
      setEditPrivacy(details.privacyStatus);
      setEditCategoryId(details.categoryId);
      setSuggestedTags([]);

      const memberships = await fetchVideoPlaylistMemberships(videoId, playlistsToUse.map(p => p.id));
      setCurrentPlaylists(memberships);
      setSelectedPlaylistIds(memberships.map(m => m.playlistId));

      if (hasGeminiKey() && details.tags.length > 0) {
        setIsAnalyzingTags(true);
        analyzeExistingTags(details.title, details.description, details.tags)
          .then(analysis => setExistingTagAnalysis(analysis))
          .catch(e => console.warn(e))
          .finally(() => setIsAnalyzingTags(false));
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to load video details.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshAnalysis = async () => {
    if (!videoDetails || !editTags || !hasGeminiKey()) return;
    setIsAnalyzingTags(true);
    try {
      const tags = editTags.split(',').map(t => t.trim()).filter(Boolean);
      const analysis = await analyzeExistingTags(editTitle, editDescription, tags);
      setExistingTagAnalysis(analysis);
    } catch (err) {
      console.error("Failed to refresh analysis:", err);
    } finally {
      setIsAnalyzingTags(false);
    }
  };

  const handleGenerateTags = async () => {
    if (!hasGeminiKey()) return;
    setIsGeneratingTags(true);
    try {
      const suggestions = await generateTagSuggestions(editTitle, editDescription);
      const sorted = [...suggestions].sort((a, b) => b.score - a.score).slice(0, 10);
      setSuggestedTags(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingTags(false);
    }
  };

  const handleAddTag = (tag: string, analysis?: TagSuggestion) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    const current = editTags.split(',').map(t => t.trim()).filter(Boolean);
    if (!current.map(t => t.toLowerCase()).includes(trimmed.toLowerCase())) {
      setEditTags([...current, trimmed].join(', '));
      if (analysis) setExistingTagAnalysis(prev => [...prev, analysis]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    setEditTags(editTags.split(',').map(t => t.trim()).filter(t => t.toLowerCase() !== tag.toLowerCase()).join(', '));
    setExistingTagAnalysis(prev => prev.filter(t => t.tag.toLowerCase() !== tag.toLowerCase()));
  };

  const togglePlaylist = (playlistId: string) => {
    setSelectedPlaylistIds(prev =>
      prev.includes(playlistId)
        ? prev.filter(id => id !== playlistId)
        : [...prev, playlistId]
    );
  };

  const handleThumbnailChange = (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      alert("Image size must be under 2MB");
      return;
    }
    setThumbnailFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setThumbnailPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!selectedVideoId) return;
    setSaving(true);
    setError(null);
    setSaveSuccess(false);
    try {
      await updateVideo(selectedVideoId, {
        title: editTitle,
        description: editDescription,
        tags: editTags.split(',').map(t => t.trim()).filter(Boolean),
        categoryId: editCategoryId,
        privacyStatus: editPrivacy as any
      });

      if (thumbnailFile) {
        await updateVideoThumbnail(selectedVideoId, thumbnailFile);
        setThumbnailFile(null);
      }

      const toAdd = selectedPlaylistIds.filter(id => !currentPlaylists.some(m => m.playlistId === id));
      const toRemove = currentPlaylists.filter(m => !selectedPlaylistIds.includes(m.playlistId));

      await Promise.all([
        ...toAdd.map(id => addToPlaylist(id, selectedVideoId)),
        ...toRemove.map(m => removeFromPlaylist(m.playlistItemId))
      ]);

      setSaveSuccess(true);
      handleSelectVideo(selectedVideoId, userPlaylists);
      loadVideos(videoSearchQuery); // refresh title in list
    } catch (err: any) {
      setError('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const formatViews = (views: string) => {
    const num = parseInt(views);
    if (isNaN(num)) return "0";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDuration = (secondsStr: string) => {
    const totalSeconds = parseInt(secondsStr, 10);
    if (isNaN(totalSeconds)) return "0:00";
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const EditableField = ({ label, icon: Icon, headerColor = "bg-[#00CCFF]", rightAction, children }: { label: string, icon: any, headerColor?: string, rightAction?: React.ReactNode, children: React.ReactNode }) => (
    <div className="bg-white border-[4px] border-black rounded-[24px] shadow-[8px_8px_0px_0px_black] overflow-hidden flex flex-col">
      <div className={`${headerColor} p-4 border-b-[4px] border-black flex justify-between items-center`}>
        <div className="flex items-center gap-3">
          <Icon size={24} className="text-black" strokeWidth={3} />
          <span className="font-black uppercase text-xl tracking-tighter text-black">{label}</span>
        </div>
        {rightAction && <div>{rightAction}</div>}
      </div>
      <div className="p-6 flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );

  if (!connected) {
    return (
      <div className="max-w-[1400px] mx-auto pb-40 animate-fade-in px-4">
        <div className="w-full bg-white border-[5px] border-black rounded-2xl shadow-[12px_12px_0px_0px_black] overflow-hidden flex flex-col items-center justify-center p-20 text-center space-y-6">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center border-[4px] border-black shadow-[4px_4px_0px_0px_black]">
            <FileVideo size={48} className="text-black" />
          </div>
          <div className="space-y-4 max-w-md">
            <h2 className="text-4xl font-[1000] uppercase tracking-tighter">Channel Offline</h2>
            <p className="text-gray-600 font-bold">Connect your YouTube channel in Settings to manage assets, optimize metadata, and run AI tag analysis.</p>
            <button
              onClick={() => window.location.href = '/settings'}
              className="w-full bg-[#00CCFF] border-[4px] border-black rounded-xl p-4 font-black uppercase text-xl shadow-[6px_6px_0px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
            >
              Go To Settings
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-40 animate-fade-in px-4">
      <div className="w-full bg-white border-[5px] border-black rounded-2xl shadow-[12px_12px_0px_0px_black] overflow-hidden flex flex-col transition-all duration-700">
        <header className="bg-[#FF3399] h-[80px] border-b-[5px] border-black flex items-center justify-between px-0 overflow-hidden">
          <div className="flex items-center h-full">
            <div className="bg-[#CCFF00] h-full w-[80px] flex items-center justify-center border-r-[5px] border-black flex-shrink-0">
              <FileVideo size={40} strokeWidth={3} className="text-black" />
            </div>
            <h1 className="text-[50px] font-[1000] uppercase tracking-tighter text-white pl-8 leading-none">VIDEO ASSET OPTIMIZER</h1>
          </div>
        </header>

        <div className="p-8">
          {error && (
            <div className="mb-6 bg-[#ffb158]/20 border-[4px] border-[#ffb158] p-4 rounded-2xl flex items-center gap-4 text-[#ffb158] font-black uppercase shadow-[4px_4px_0px_0px_#ffb158]">
              <AlertCircle size={24} />
              <p>{error}</p>
            </div>
          )}
          {saveSuccess && (
            <div className="mb-6 bg-[#00ff99]/20 border-[4px] border-[#00ff99] p-4 rounded-2xl flex items-center gap-4 text-black font-black uppercase shadow-[4px_4px_0px_0px_#00ff99]">
              <CheckCircle size={24} className="text-[#00ff99]" />
              <p>Asset Deployed Successfully</p>
            </div>
          )}

          {loading && !selectedVideo ? (
            <div className="h-[500px] flex flex-col items-center justify-center font-black uppercase text-2xl text-black/20 animate-pulse">
              <Loader2 size={48} className="mb-4 animate-spin" />Syncing Database...
            </div>
          ) : selectedVideo ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

              {/* V3 Dropdown Selector */}
              <div className="relative z-40" ref={dropdownRef}>
                <div
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-6 rounded-[24px] border-[4px] border-black transition-all cursor-pointer group ${dropdownOpen ? 'bg-gray-100 shadow-none translate-y-1' : 'bg-white shadow-[8px_8px_0px_0px_black] hover:bg-gray-50'}`}
                >
                  <div className="flex gap-6 items-center flex-1 min-w-0">
                    <div className="relative flex-shrink-0 w-48 aspect-video rounded-xl border-[3px] border-black overflow-hidden bg-black shadow-[4px_4px_0px_0px_black]">
                      <img src={selectedVideo.thumbnail} alt={selectedVideo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-3xl font-[1000] uppercase leading-tight line-clamp-2 mb-2 group-hover:text-[#FF3399] transition-colors tracking-tighter">{selectedVideo.title}</h2>
                      <div className="flex gap-2 mt-2">
                        <button onClick={(e) => { e.stopPropagation(); updateBrain({ coreConcept: selectedVideo.title }); window.location.href = '/studio'; }} className="bg-black text-[#CCFF00] px-4 py-2 rounded-lg font-black uppercase text-[10px] tracking-widest border-2 border-black hover:scale-105 transition-transform shadow-[2px_2px_0px_0px_#CCFF00]">To Studio Hub</button>
                        <button onClick={(e) => { e.stopPropagation(); updateBrain({ coreConcept: selectedVideo.title }); window.location.href = '/reference-studio'; }} className="bg-black text-[#00CCFF] px-4 py-2 rounded-lg font-black uppercase text-[10px] tracking-widest border-2 border-black hover:scale-105 transition-transform shadow-[2px_2px_0px_0px_#00CCFF]">To Reference Studio</button>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3">
                        <p className="text-black/50 font-black text-xs uppercase tracking-widest">ID: {selectedVideo.videoId}</p>
                        <a href={`https://youtube.com/watch?v=${selectedVideo.videoId}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-widest text-[#00CCFF] hover:text-[#FF3399] transition-colors">
                          View on YouTube <ExternalLink size={14} strokeWidth={3} />
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center pl-4 group-hover:scale-110 transition-transform">
                    <ChevronDown size={48} strokeWidth={3} className={`text-black transition-transform duration-300 ${dropdownOpen ? 'rotate-180 text-[#FF3399]' : ''}`} />
                  </div>
                </div>

                {dropdownOpen && (
                  <div className="absolute left-0 right-0 mt-4 bg-white border-[5px] border-black rounded-[24px] shadow-[16px_16px_0px_0px_black] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="bg-[#FFDD00] p-6 border-b-[5px] border-black flex flex-col md:flex-row justify-between items-center gap-4">
                      <span className="font-[1000] text-3xl uppercase tracking-tighter text-black whitespace-nowrap">Select Asset</span>
                      <div className="relative w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" size={24} />
                        <input
                          type="text"
                          placeholder="SEARCH ASSETS..."
                          value={videoSearchQuery}
                          onChange={e => setVideoSearchQuery(e.target.value)}
                          onClick={e => e.stopPropagation()}
                          className="w-full pl-14 pr-4 py-4 bg-white border-[4px] border-black rounded-xl font-black uppercase text-lg outline-none focus:bg-[#CCFF00]/10 transition-colors"
                        />
                      </div>
                      <div className="flex gap-4">
                        <button onClick={e => { e.stopPropagation(); loadVideos(videoSearchQuery); }} className="bg-black text-[#CCFF00] px-6 py-4 rounded-xl font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]">Refresh</button>
                        <button onClick={e => { e.stopPropagation(); setDropdownOpen(false); }} className="bg-white text-black border-[3px] border-black px-6 py-4 rounded-xl font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-[4px_4px_0px_0px_black]">Close</button>
                      </div>
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto custom-scrollbar bg-gray-50">
                      {isSearchingVideos ? (
                        <div className="flex justify-center items-center py-20">
                          <Loader2 className="animate-spin text-black" size={48} />
                        </div>
                      ) : videos.length === 0 ? (
                        <div className="text-center py-20 font-black text-black/30 uppercase tracking-widest text-xl">
                          No videos found matching "{videoSearchQuery}"
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 divide-y-[3px] divide-black/10">
                          {videos.map(video => (
                            <div
                              key={video.videoId}
                              onClick={e => { e.stopPropagation(); handleSelectVideo(video.videoId); }}
                              className={`group relative flex items-center gap-6 p-4 cursor-pointer transition-all duration-300 hover:bg-white ${selectedVideo?.videoId === video.videoId ? 'bg-[#CCFF00]/20' : ''}`}
                            >
                              <div className="w-32 aspect-video rounded-lg border-[3px] border-black overflow-hidden bg-black shadow-[4px_4px_0px_0px_black] group-hover:scale-105 transition-transform">
                                <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-[1000] text-xl uppercase tracking-tighter line-clamp-2 group-hover:text-[#FF3399] transition-colors">{video.title}</h3>
                                <div className="flex items-center gap-4 mt-2">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-black/50">ID: {video.videoId}</span>
                                  <span className="text-[10px] font-black uppercase tracking-widest text-black/50">PUB: {new Date(video.publishedAt).toLocaleDateString()}</span>
                                  {selectedVideo?.videoId === video.videoId && (
                                    <span className="bg-black text-[#CCFF00] px-3 py-1 rounded-md text-[10px] font-black uppercase animate-pulse">Active</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {/* Main Editor Elements */}
              {/* Stats & Thumbnail Row */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* 8-Grid Stats */}
                <div className="xl:col-span-2 bg-white border-[4px] border-black rounded-[24px] shadow-[8px_8px_0px_0px_black] p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-full">
                    <div className="bg-gray-50 border-[3px] border-black rounded-xl p-3 flex flex-col items-center justify-center text-center hover:bg-[#00CCFF] hover:text-black transition-colors group">
                      <Eye className="text-[#00CCFF] group-hover:text-black mb-1" size={24} strokeWidth={3} />
                      <span className="font-[1000] text-2xl">{formatViews(videoStats?.views || '0')}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-black/40 group-hover:text-black/60">Views</span>
                    </div>
                    <div className="bg-gray-50 border-[3px] border-black rounded-xl p-3 flex flex-col items-center justify-center text-center hover:bg-[#FF3399] hover:text-black transition-colors group">
                      <ThumbsUp className="text-[#FF3399] group-hover:text-black mb-1" size={24} strokeWidth={3} />
                      <span className="font-[1000] text-2xl">{formatViews(videoStats?.likes || '0')}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-black/40 group-hover:text-black/60">Likes</span>
                    </div>
                    <div className="bg-gray-50 border-[3px] border-black rounded-xl p-3 flex flex-col items-center justify-center text-center hover:bg-[#CCFF00] hover:text-black transition-colors group">
                      <MessageSquare className="text-[#CCFF00] group-hover:text-black mb-1" size={24} strokeWidth={3} />
                      <span className="font-[1000] text-2xl">{formatViews(videoStats?.comments || '0')}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-black/40 group-hover:text-black/60">Comments</span>
                    </div>
                    <div className="bg-gray-50 border-[3px] border-black rounded-xl p-3 flex flex-col items-center justify-center text-center hover:bg-[#ffb158] hover:text-black transition-colors group">
                      <Share2 className="text-[#ffb158] group-hover:text-black mb-1" size={24} strokeWidth={3} />
                      <span className="font-[1000] text-2xl">{formatViews(videoAnalytics?.shares || '0')}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-black/40 group-hover:text-black/60">Shares</span>
                    </div>
                    <div className="bg-gray-50 border-[3px] border-black rounded-xl p-3 flex flex-col items-center justify-center text-center hover:bg-[#00CCFF] hover:text-black transition-colors group">
                      <Percent className="text-[#00CCFF] group-hover:text-black mb-1" size={24} strokeWidth={3} />
                      <span className="font-[1000] text-2xl">{videoAnalytics?.averageViewPercentage || '0'}%</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-black/40 group-hover:text-black/60">APV</span>
                    </div>
                    <div className="bg-gray-50 border-[3px] border-black rounded-xl p-3 flex flex-col items-center justify-center text-center hover:bg-[#FF3399] hover:text-black transition-colors group">
                      <MousePointerClick className="text-[#FF3399] group-hover:text-black mb-1" size={24} strokeWidth={3} />
                      <span className="font-[1000] text-2xl">{videoAnalytics?.clickThroughRate || '0%'}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-black/40 group-hover:text-black/60">CTR</span>
                    </div>
                    <div className="bg-gray-50 border-[3px] border-black rounded-xl p-3 flex flex-col items-center justify-center text-center hover:bg-[#CCFF00] hover:text-black transition-colors group">
                      <DollarSign className="text-[#CCFF00] group-hover:text-black mb-1" size={24} strokeWidth={3} />
                      <span className="font-[1000] text-2xl">${videoAnalytics?.estimatedRevenue || '0'}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-black/40 group-hover:text-black/60">Revenue</span>
                    </div>
                    <div className="bg-gray-50 border-[3px] border-black rounded-xl p-3 flex flex-col items-center justify-center text-center hover:bg-black hover:text-white transition-colors group">
                      <Clock className="text-black group-hover:text-white mb-1" size={24} strokeWidth={3} />
                      <span className="font-[1000] text-2xl">{formatDuration(videoStats?.duration || '0')}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-black/40 group-hover:text-white/60">Length</span>
                    </div>
                  </div>
                </div>

                {/* Thumbnail Drag/Drop */}
                <div className="xl:col-span-1 bg-white border-[4px] border-black rounded-[24px] shadow-[8px_8px_0px_0px_black] p-6 flex flex-col min-h-[300px]">
                  <h3 className="font-black text-sm uppercase tracking-widest text-black/50 mb-4">Thumbnail Asset</h3>
                  <div
                    className={`flex-1 relative rounded-xl border-[4px] border-dashed flex flex-col items-center justify-center p-4 transition-all overflow-hidden ${isDraggingThumbnail ? 'border-[#FF3399] bg-[#FF3399]/10' : 'border-black/20 bg-gray-50'}`}
                    onDragOver={(e) => { e.preventDefault(); setIsDraggingThumbnail(true); }}
                    onDragLeave={() => setIsDraggingThumbnail(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingThumbnail(false);
                      if (e.dataTransfer.files[0]) handleThumbnailChange(e.dataTransfer.files[0]);
                    }}
                  >
                    {thumbnailPreview || selectedVideo.thumbnail ? (
                      <div className="relative w-full h-full group">
                        <img src={thumbnailPreview || selectedVideo.thumbnail} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 rounded-lg backdrop-blur-sm">
                          <button onClick={() => fileInputRef.current?.click()} className="bg-[#CCFF00] p-4 rounded-xl border-[4px] border-black hover:scale-110 transition-transform"><Upload size={24} strokeWidth={3} /></button>
                          {thumbnailPreview && <button onClick={() => { setThumbnailFile(null); setThumbnailPreview(null); }} className="bg-[#FF3399] text-white p-4 rounded-xl border-[4px] border-black hover:scale-110 transition-transform"><Trash2 size={24} strokeWidth={3} /></button>}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload size={48} className="mx-auto mb-4 text-black/20" />
                        <p className="font-black uppercase text-sm text-black/40">Drag Image Here</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Metadata Text */}
              <EditableField label="Text Metadata" icon={AlignLeft} headerColor="bg-[#00CCFF]">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[12px] font-black uppercase tracking-widest text-black/50 ml-1">Video Title</label>
                    <input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full bg-gray-50 border-[4px] border-black rounded-xl p-5 font-black uppercase text-xl focus:bg-white focus:border-[#00CCFF] focus:shadow-[4px_4px_0px_0px_#00CCFF] outline-none transition-all" placeholder="TITLE..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] font-black uppercase tracking-widest text-black/50 ml-1">Description</label>
                    <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} className="w-full h-80 bg-gray-50 border-[4px] border-black rounded-xl p-5 font-bold text-base focus:bg-white focus:border-[#00CCFF] focus:shadow-[4px_4px_0px_0px_#00CCFF] outline-none resize-none transition-all" placeholder="DESCRIPTION..." />
                  </div>
                </div>
              </EditableField>

              {/* Tag Manager */}
              <EditableField
                label="AI Tag Engine"
                icon={Tag}
                headerColor="bg-[#CCFF00]"
                rightAction={
                  <div className="flex gap-2">
                    <button onClick={handleRefreshAnalysis} disabled={isAnalyzingTags || !editTags} className="bg-black text-white px-4 py-2 rounded-lg font-black uppercase text-[10px] tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-50 flex items-center gap-2">
                      {isAnalyzingTags ? <Loader2 size={14} className="animate-spin" /> : <BarChart3 size={14} />} Refresh Rank
                    </button>
                    <button onClick={() => setIsTagsExpanded(!isTagsExpanded)} className="bg-black text-white p-2 rounded-lg hover:bg-white hover:text-black transition-colors">
                      <ChevronDown size={16} className={`transition-transform ${isTagsExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                }
              >
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddTag(tagInput)} className="flex-1 bg-gray-50 border-[4px] border-black rounded-xl p-5 font-black uppercase text-lg focus:bg-white outline-none" placeholder="ADD TAG..." />
                    <button onClick={() => handleAddTag(tagInput)} className="bg-black text-white px-10 font-black uppercase rounded-xl border-[4px] border-black shadow-[6px_6px_0px_0px_#FF3399] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_#FF3399] transition-all text-xl">ADD</button>
                  </div>

                  <div className={`w-full bg-gray-50 border-[4px] border-black rounded-xl p-4 flex flex-wrap gap-2 content-start overflow-y-auto custom-scrollbar transition-all ${isTagsExpanded ? 'max-h-[600px]' : 'max-h-[160px]'}`}>
                    {editTags ? editTags.split(',').map(t => t.trim()).filter(Boolean).map(t => (
                      <TagBadge key={t} tag={t} onRemove={() => handleRemoveTag(t)} analysis={existingTagAnalysis.find(a => a.tag.toLowerCase() === t.toLowerCase())} />
                    )) : <p className="text-black/30 font-black uppercase text-sm w-full text-center py-6">No tags populated...</p>}
                  </div>

                  {isTagsExpanded && (
                    <div className="space-y-6 pt-6 border-t-[4px] border-dashed border-black/10">
                      <button onClick={handleGenerateTags} disabled={isGeneratingTags} className="w-full bg-[#FF3399] text-white p-6 rounded-2xl border-[4px] border-black font-[1000] uppercase text-2xl flex items-center justify-center gap-4 shadow-[8px_8px_0px_0px_black] hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50">
                        {isGeneratingTags ? <Loader2 size={32} className="animate-spin" /> : <Sparkles size={32} />}
                        {isGeneratingTags ? 'Scanning Market...' : 'Generate Algorithm Suggestions'}
                      </button>
                      {suggestedTags.length > 0 && (
                        <div className="space-y-4">
                          <label className="text-[12px] font-black uppercase tracking-widest text-black/50 ml-1">Ranked Suggestions</label>
                          <div className="flex flex-wrap gap-2 p-6 border-[4px] border-black rounded-xl bg-white shadow-[inset_0_4px_10px_rgba(0,0,0,0.05)]">
                            {suggestedTags.map(st => (
                              <TagBadge key={st.tag} tag={st.tag} isSuggested isAdded={editTags.toLowerCase().includes(st.tag.toLowerCase())} onAdd={() => handleAddTag(st.tag, st)} analysis={st} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </EditableField>

              {/* Routing */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <EditableField label="Privacy" icon={Lock} headerColor="bg-[#FFDD00]">
                  <select value={editPrivacy} onChange={e => setEditPrivacy(e.target.value)} className="w-full bg-gray-50 border-[4px] border-black rounded-xl p-4 font-black uppercase outline-none text-lg">
                    <option value="public">Public</option><option value="unlisted">Unlisted</option><option value="private">Private</option>
                  </select>
                </EditableField>

                <EditableField label="Niche" icon={LayoutGrid} headerColor="bg-[#ffb158]">
                  <select value={editCategoryId} onChange={e => setEditCategoryId(e.target.value)} className="w-full bg-gray-50 border-[4px] border-black rounded-xl p-4 font-black uppercase outline-none text-lg">
                    {categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </EditableField>

                <EditableField label="Playlists" icon={ListMusic} headerColor="bg-[#CC99FF]">
                  <div className="relative flex-1" ref={playlistMenuRef}>
                    <button onClick={(e) => { e.stopPropagation(); setPlaylistMenuOpen(!playlistMenuOpen); }} className="w-full bg-gray-50 border-[4px] border-black rounded-xl p-4 font-black uppercase flex justify-between items-center hover:bg-gray-100 transition-colors text-lg">
                      <span className="truncate">{selectedPlaylistIds.length === 0 ? 'None Selected' : `${selectedPlaylistIds.length} Linked`}</span>
                      <ChevronDown size={20} />
                    </button>
                    {playlistMenuOpen && (
                      <div className="absolute left-0 right-0 bottom-full mb-4 bg-white border-[4px] border-black rounded-2xl shadow-[12px_12px_0px_0px_black] max-h-72 overflow-y-auto z-50 p-3 space-y-2">
                        {userPlaylists.length > 0 ? userPlaylists.map(p => (
                          <label key={p.id} className={`flex items-center gap-4 p-4 rounded-xl border-[3px] cursor-pointer transition-all ${selectedPlaylistIds.includes(p.id) ? 'border-[#00CCFF] bg-[#00CCFF]/10' : 'border-black hover:bg-gray-100'}`}>
                            <input type="checkbox" checked={selectedPlaylistIds.includes(p.id)} onChange={() => togglePlaylist(p.id)} className="w-6 h-6 border-[3px] border-black accent-black" />
                            <span className="font-black text-sm uppercase truncate">{p.title}</span>
                          </label>
                        )) : <p className="font-bold text-sm uppercase text-center py-6 text-black/40">No Playlists Found</p>}
                      </div>
                    )}
                  </div>
                </EditableField>
              </div>

              {/* Deploy Button */}
              <button onClick={handleSave} disabled={saving} className="w-full bg-[#CCFF00] border-[6px] border-black text-black p-8 rounded-[32px] font-[1000] uppercase text-4xl tracking-tighter shadow-[16px_16px_0px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-[8px_8px_0px_0px_black] active:translate-y-3 active:shadow-none transition-all flex items-center justify-center gap-6 disabled:opacity-50 mt-8">
                {saving ? <Loader2 className="animate-spin" size={40} /> : <Save size={40} strokeWidth={3} />}
                {saving ? 'Transmitting to Server...' : 'DEPLOY ASSET UPDATES'}
              </button>
            </div>
          ) : (
            <div className="h-[500px] flex flex-col items-center justify-center font-black uppercase text-3xl tracking-tighter text-black/20">
              <Edit size={100} strokeWidth={1} className="mb-6 opacity-50" />
              Awaiting Asset Selection
            </div>
          )}
          <input type="file" ref={fileInputRef} onChange={e => e.target.files?.[0] && handleThumbnailChange(e.target.files[0])} className="hidden" accept="image/*" />
        </div>
      </div>
    </div>
  );
};

export default VideoManager;
