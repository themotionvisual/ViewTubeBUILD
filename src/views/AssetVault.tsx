import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  FileText, 
  Image as ImageIcon, 
  MoreVertical, 
  RefreshCcw, 
  ExternalLink,
  ChevronRight,
  Database
} from 'lucide-react';
import { useBrain } from '../context/GlobalDataContext';
import { ToolHeader } from '../components/ToolHeader';
import { nexusSyncService } from '../services/nexusSyncService';
import { CustomIcon } from '../components/CustomIcon';

const AssetVault: React.FC = () => {
  const { brain } = useBrain();
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState(brain.coreConcept || 'General');

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const files = await nexusSyncService.fetchProjectAssets(selectedProject);
      setAssets(files);
    } catch (e) {
      console.error('Vault fetch failed', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [selectedProject]);

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('image')) return <ImageIcon size={20} className="text-[#ff3399]" />;
    if (mimeType.includes('json') || mimeType.includes('text')) return <FileText size={20} className="text-[#00d2ff]" />;
    return <Folder size={20} className="text-[#ccff00]" />;
  };

  return (
    <div className="flex flex-col h-full bg-[#f3f4f6]">
      <ToolHeader 
        title="Project Vault" 
        icon="database" 
        titleBgColor="bg-[#00ccff]" 
        iconBgColor="bg-black" 
      />

      <div className="flex flex-col lg:flex-row gap-8 flex-1 overflow-hidden">
        {/* Sidebar: Project Selection */}
        <div className="w-full lg:w-72 flex flex-col gap-4">
          <div className="bg-white border-[4px] border-black rounded-3xl p-6 shadow-[6px_6px_0px_0px_black]">
            <h3 className="text-xs font-black uppercase tracking-widest text-black/50 mb-4 px-2 italic">Active Project</h3>
            <div className="space-y-3">
               {['General', ...brain.projects.map(p => p.name)].map((p) => (
                 <button 
                  key={p}
                  onClick={() => setSelectedProject(p)}
                  className={`w-full text-left p-4 rounded-2xl border-[3px] border-black font-black uppercase italic tracking-tighter transition-all flex items-center justify-between group ${selectedProject === p ? 'bg-black text-[#ccff00] translate-x-1' : 'bg-white text-black hover:bg-gray-50 hover:translate-x-1'}`}
                 >
                   <span className="truncate">{p}</span>
                   {selectedProject === p && <ChevronRight size={18} />}
                 </button>
               ))}
            </div>
          </div>

          <div className="bg-[#ccff00] border-[4px] border-black rounded-3xl p-6 shadow-[6px_6px_0px_0px_black] group">
            <h4 className="font-black uppercase italic tracking-tighter text-black mb-2 flex items-center gap-2">
              <RefreshCcw size={16} className="group-hover:rotate-180 transition-transform duration-700" />
              Sync Protocol
            </h4>
            <p className="text-[10px] font-bold text-black/60 leading-tight uppercase tracking-widest">
              Nexus is active. Files created in Storyboard or SEO will automatically appear here.
            </p>
          </div>
        </div>

        {/* Main: Asset Grid */}
        <div className="flex-1 flex flex-col bg-white border-[4px] border-black rounded-[40px] shadow-[8px_8px_0px_0px_black] overflow-hidden">
          <div className="p-6 border-b-[4px] border-black flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-black p-3 rounded-2xl border-[3px] border-black shadow-[4px_4px_0px_0px_#00ccff]">
                <Folder className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-[1000] uppercase tracking-tighter italic leading-none">{selectedProject}</h2>
                <span className="text-[10px] font-black uppercase tracking-widest text-black/40 mt-1 block">{assets.length} ASSETS REGISTERED</span>
              </div>
            </div>
            
            <button 
              onClick={fetchAssets}
              disabled={loading}
              className="bg-black text-white px-6 py-3 rounded-2xl font-black uppercase italic tracking-tighter border-[3px] border-black shadow-[4px_4px_0px_0px_#ccff00] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-3 disabled:opacity-50"
            >
              {loading ? <RefreshCcw className="animate-spin" size={18} /> : <Database size={18} />}
              Refresh Nexus
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            {assets.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-black/20 space-y-4">
                <Database size={100} strokeWidth={1} />
                <p className="font-black uppercase text-xl italic tracking-tighter">No assets detected for this protocol.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {assets.map((file) => (
                  <div key={file.id} className="bg-white border-[3px] border-black rounded-3xl p-5 shadow-[5px_5px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[5px_5px_0px_0px_#ff3399] transition-all group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-gray-50 rounded-xl border-[2px] border-black group-hover:bg-[#ff3399]/10 transition-colors">
                        {getFileIcon(file.mimeType)}
                      </div>
                      <button className="text-black/30 hover:text-black transition-colors"><MoreVertical size={18} /></button>
                    </div>
                    
                    <h4 className="font-black text-sm uppercase tracking-tight truncate mb-1">{file.name}</h4>
                    <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest block mb-4">
                      {file.mimeType.split('/')[1] || 'Unknown'} / Cloud Asset
                    </span>

                    <button className="w-full bg-[#f3f4f6] hover:bg-black hover:text-white p-3 rounded-xl border-[2px] border-black transition-all flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest group-hover:scale-[1.02]">
                       <ExternalLink size={12} /> View in Drive
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetVault;
