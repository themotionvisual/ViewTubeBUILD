import React from 'react';
import { AccordionContainer } from '../components/AccordionContainer';
import VideoManager from './VideoManager';
import AlgorithmArchitect from './AlgorithmArchitect';
import Channelytics from './Channelytics';
import ResearchLab from './ResearchLab';
import { performSync } from '../services/analyticsSync';
import { Activity, TrendingUp } from 'lucide-react';

const PerformanceHub: React.FC = () => {
  const [syncLoading, setSyncLoading] = React.useState(false);
  const [lastSync, setLastSync] = React.useState<string>(localStorage.getItem('yt_analytics_last_sync') || 'Never');

  React.useEffect(() => {
    const handleSync = () => {
      setLastSync(new Date().toLocaleTimeString());
    };
    window.addEventListener('yt_analytics_synced', handleSync);
    return () => window.removeEventListener('yt_analytics_synced', handleSync);
  }, []);

  const handleGlobalSync = async () => {
    setSyncLoading(true);
    try {
      await performSync(true);
      setLastSync(new Date().toLocaleTimeString());
    } catch (e) {
      console.error(e);
    } finally {
      setSyncLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-2 max-w-7xl mx-auto pb-24">
      
      {/* Page Header */}
      <div className="mb-10 px-2 mt-4 flex flex-col items-center">
        <h2 className="text-7xl font-[1000] uppercase tracking-[calc(-0.06em)] leading-none text-black text-center">
          PERFORMANCE <span className="text-[#00CCFF]">HUB</span>
        </h2>
        <div className="flex items-center gap-6 mt-6">
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20">Post-Publish Analysis & Growth Phase</p>
           <div className="w-1.5 h-1.5 rounded-full bg-black/10"></div>
           <button 
             onClick={handleGlobalSync}
             disabled={syncLoading}
             className="bg-black text-[#CCFF00] px-6 py-2 rounded-xl border-[3px] border-black font-black uppercase text-[10px] tracking-widest shadow-[4px_4px_0px_0px_#00CCFF] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-3"
           >
             {syncLoading ? <Activity size={14} className="animate-spin" /> : <TrendingUp size={14} />}
             <span>Neural Global Sync</span>
           </button>
           <div className="flex flex-col">
             <span className="text-[8px] font-black uppercase text-black/30 tracking-widest">Last Telemetry</span>
             <span className="text-[10px] font-black uppercase text-[#00CCFF] leading-none">{lastSync}</span>
           </div>
        </div>
      </div>

      <div className="space-y-6">
        <AccordionContainer 
          title="Video Manager" 
          subtitle="Channel Inventory & Optimization"
          headerColor="bg-[#00CCFF]"
          icon="video"
          isOpenInitial={false}
          unmountWhenClosed={true}
        >
          <div className="bg-gray-50 p-1 rounded-[28px] border-[4px] border-black overflow-hidden shadow-[8px_8px_0px_0px_black]">
             <VideoManager />
          </div>
        </AccordionContainer>

        <AccordionContainer 
           title="Channelytics" 
           subtitle="Unified Analytics Oracle"
           headerColor="bg-[#CCFF00]"
           icon="analytics"
           isOpenInitial={false}
           unmountWhenClosed={true}
        >
          <div className="bg-gray-50 p-1 rounded-[28px] border-[4px] border-black overflow-hidden shadow-[8px_8px_0px_0px_black]">
             <Channelytics />
          </div>
        </AccordionContainer>

        <AccordionContainer 
           title="Research Lab" 
           subtitle="Advanced Multi-Dimensional Visualization"
           headerColor="bg-[#ff3399]"
           icon="!!!METRICS-GRID"
           isOpenInitial={false}
           unmountWhenClosed={true}
        >
          <div className="bg-gray-50 p-1 rounded-[28px] border-[4px] border-black overflow-hidden shadow-[8px_8px_0px_0px_black]">
             <ResearchLab />
          </div>
        </AccordionContainer>
 
        <AccordionContainer 
           title="Algorithm Architect" 
           subtitle="Deep Algorithmic Cluster Mapping"
           headerColor="bg-[#FF3399]"
           icon="!!!A:B-TESTING"
           isOpenInitial={false}
           unmountWhenClosed={true}
        >
          <div className="bg-gray-50 p-1 rounded-[28px] border-[4px] border-black overflow-hidden shadow-[8px_8px_0px_0px_black]">
             <AlgorithmArchitect />
          </div>
        </AccordionContainer>
      </div>
    </div>
  );
};

export default PerformanceHub;
