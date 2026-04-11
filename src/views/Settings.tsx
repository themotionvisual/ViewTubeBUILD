import React, { useState, useEffect } from 'react';
import { 
  Key, 
  Check, 
  Copy, 
  LogOut, 
  LogIn,
  Zap,
  Database,
  Cloud
} from 'lucide-react';
import { useBrain } from '../context/GlobalDataContext';
import { ToolHeader } from '../components/ToolHeader';
import { CustomIcon } from '../components/CustomIcon';
import { authService } from '../services/authService';

const Settings: React.FC = () => {
  const { updateBrain } = useBrain();
  const [isAuth, setIsAuth] = useState(authService.isAuthenticated());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Local state for API keys during editing
  const [elevenLabsKey, setElevenLabsKey] = useState(localStorage.getItem('vt_elevenlabs_key') || '');
  const [auphonicKey, setAuphonicKey] = useState(localStorage.getItem('vt_auphonic_key') || '');

  useEffect(() => {
    const checkAuth = setInterval(() => {
      setIsAuth(authService.isAuthenticated());
    }, 1000);
    return () => clearInterval(checkAuth);
  }, []);

  const handleSaveKeys = () => {
    localStorage.setItem('vt_elevenlabs_key', elevenLabsKey);
    localStorage.setItem('vt_auphonic_key', auphonicKey);
    setCopiedKey('saved');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden italic">
      <ToolHeader 
        title="Key Vault & Settings" 
        icon="settings" 
        titleBgColor="bg-[#ffdd00]" 
        iconBgColor="bg-black text-[#ffdd00]" 
      />

      <div className="flex-1 overflow-auto p-1">
        <div className="max-w-6xl mx-auto space-y-12 pb-20 mt-8">
          
          {/* Auth Section */}
          <div className="bg-white border-[6px] border-black rounded-[48px] p-12 shadow-[20px_20px_0px_0px_black] relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 group-hover:rotate-12 transition-transform duration-1000">
                <Cloud size={200} />
             </div>
             <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="space-y-4">
                   <div className="inline-flex items-center gap-3 bg-black text-[#ccff00] px-5 py-2 rounded-full font-black uppercase text-xs tracking-widest italic">
                      <ShieldCheck size={16} /> Identity Protocol
                   </div>
                   <h2 className="text-5xl font-[1000] uppercase tracking-tighter italic leading-none">
                     Google <span className="text-[#ff3399]">Workspace</span> Nexus
                   </h2>
                   <p className="text-xl font-bold text-black/50 max-w-xl leading-relaxed italic">
                      Connect your channel, drive, and calendar for a synchronized creator experience without pop-ups.
                   </p>
                </div>
                
                {isAuth ? (
                  <button 
                    onClick={() => authService.logout()}
                    className="bg-black text-white px-10 py-5 rounded-2xl font-black uppercase italic tracking-widest text-lg shadow-[8px_8px_0px_0px_#ff3399] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-4 shrink-0"
                  >
                    <LogOut size={24} /> Terminate Session
                  </button>
                ) : (
                  <button 
                    onClick={() => authService.login()}
                    className="bg-[#ccff00] text-black border-[4px] border-black px-10 py-5 rounded-2xl font-black uppercase italic tracking-widest text-lg shadow-[10px_10px_0px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-4 shrink-0 animate-pulse"
                  >
                    <LogIn size={24} /> Authorize Nexus
                  </button>
                )}
             </div>
          </div>

          {/* Key Vault Section */}
          <div className="space-y-8">
             <div className="flex items-center gap-6 border-b-[6px] border-black pb-6">
                <Key size={40} className="text-[#ff3399]" />
                <h3 className="text-5xl font-black uppercase italic tracking-tighter">Universal API Bridge</h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* ElevenLabs */}
                <div className="bg-white border-[6px] border-black p-10 rounded-[48px] shadow-[16px_16px_0px_0px_black] group">
                   <div className="flex items-center gap-5 mb-8">
                      <div className="bg-[#ccff00] text-black p-4 rounded-2xl border-[4px] border-black shadow-[4px_4px_0px_0px_black]">
                         <CustomIcon name="mic" size={32} />
                      </div>
                      <h4 className="text-3xl font-[1000] uppercase tracking-tighter italic">ElevenLabs</h4>
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-black/30 ml-2">API Secret Token</label>
                      <input 
                        type="password" 
                        value={elevenLabsKey}
                        onChange={(e) => setElevenLabsKey(e.target.value)}
                        placeholder="sk_..."
                        className="w-full bg-gray-50 border-[4px] border-black p-5 rounded-2xl font-bold italic focus:outline-none focus:bg-[#ccff00]/10 transition-colors"
                      />
                   </div>
                </div>

                {/* Auphonic */}
                <div className="bg-white border-[6px] border-black p-10 rounded-[48px] shadow-[16px_16px_0px_0px_black] group">
                   <div className="flex items-center gap-5 mb-8">
                      <div className="bg-[#ff3399] text-white p-4 rounded-2xl border-[4px] border-black shadow-[4px_4px_0px_0px_black]">
                         <CustomIcon name="volume" size={32} />
                      </div>
                      <h4 className="text-3xl font-[1000] uppercase tracking-tighter italic">Auphonic</h4>
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-black/30 ml-2">Bearer Auth Token</label>
                      <input 
                        type="password" 
                        value={auphonicKey}
                        onChange={(e) => setAuphonicKey(e.target.value)}
                        placeholder="ap_..."
                        className="w-full bg-gray-50 border-[4px] border-black p-5 rounded-2xl font-bold italic focus:outline-none focus:bg-[#ff3399]/10 transition-colors"
                      />
                   </div>
                </div>
             </div>

             <div className="pt-6 flex justify-center">
                <button 
                  onClick={handleSaveKeys}
                  className="bg-black text-[#ccff00] px-16 py-6 rounded-3xl font-black uppercase italic tracking-[0.2em] text-2xl shadow-[12px_12px_0px_0px_#ff3399] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-6 group"
                >
                   {copiedKey === 'saved' ? <Check size={32} /> : <Zap size={32} className="group-hover:animate-spin" />}
                   {copiedKey === 'saved' ? "Vault Locked" : "Secure all Keys"}
                </button>
             </div>
          </div>

          {/* System Info */}
          <div className="bg-black text-white/40 border-[6px] border-black rounded-[48px] p-12 shadow-[20px_20px_0px_0px_#ccff00] flex flex-col md:flex-row items-center justify-between gap-10 grayscale hover:grayscale-0 transition-all">
              <div className="flex items-center gap-8">
                 <Database size={48} className="text-[#00d2ff]" />
                 <div>
                    <h4 className="text-2xl font-black uppercase text-white tracking-widest italic">Local Engine v2.1.0</h4>
                    <p className="font-bold italic">Persistence: LocalStorage + Session Memory</p>
                 </div>
              </div>
              <div className="flex gap-4">
                 <div className="bg-white/10 px-6 py-3 rounded-xl border-2 border-white/20 font-black uppercase text-xs">Offline Sync</div>
                 <div className="bg-[#ccff00]/20 text-[#ccff00] px-6 py-3 rounded-xl border-2 border-[#ccff00]/20 font-black uppercase text-xs italic">Production Grid</div>
              </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Settings;
