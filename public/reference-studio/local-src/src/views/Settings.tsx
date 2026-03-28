import React, { useState, useEffect } from 'react';
import {
   Key,
   Check,
   LogOut,
   LogIn,
   Zap,
   Database,
   Cloud,
   ShieldCheck,
   RotateCcw,
   Settings as SettingsIcon
} from 'lucide-react';
import { useBrain } from '../context/GlobalDataContext';
import { CustomIcon } from '../components/CustomIcon';
import { authService } from '../services/authService';

const Settings: React.FC = () => {
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
      <div className="max-w-[1400px] mx-auto pb-40 animate-fade-in px-4">
         <div className="w-full bg-white border-[5px] border-black rounded-2xl shadow-[12px_12px_0px_0px_black] overflow-hidden flex flex-col transition-all duration-700">
            <header className="bg-[#00CCFF] h-[80px] border-b-[5px] border-black flex items-center justify-between px-0 overflow-hidden">
               <div className="flex items-center h-full">
                  <div className="bg-black h-full w-[80px] flex items-center justify-center border-r-[5px] border-black flex-shrink-0">
                     <SettingsIcon size={40} strokeWidth={3} className="text-[#00CCFF]" />
                  </div>
                  <h1 className="text-[50px] font-[1000] uppercase tracking-tighter text-black pl-8 leading-none">SYSTEM CALIBRATION</h1>
               </div>
               <div className="flex items-center gap-6 pr-6">
                  <div className="bg-black text-[#00CCFF] px-4 py-1 rounded-lg border-2 border-black font-black text-[10px] uppercase tracking-widest shadow-[4px_4px_0px_0px_#00CCFF]">
                     Nexus v2.1.0
                  </div>
               </div>
            </header>

            <div className="p-8 space-y-8">

               {/* Auth Section */}
               <div className="pop-box bg-white overflow-hidden group">
                  <div className="pop-header bg-[#FF3399] text-white">
                     <h3 className="text-sm font-black uppercase">Nexus Identity Protocol</h3>
                     <div className="pop-module-id bg-black/20 border-none">GCP AUTH</div>
                  </div>
                  <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-10">
                     <div className="space-y-4 max-w-xl">
                        <h4 className="text-4xl font-black uppercase tracking-tighter leading-none">
                           Google <span className="text-[#FF3399]">Workspace</span> Nexus
                        </h4>
                        <p className="font-bold text-black/40 text-sm uppercase leading-relaxed">
                           Connect your channel, drive, and calendar for a synchronized creator experience without manual overrides.
                        </p>
                     </div>

                     {isAuth ? (
                        <button
                           onClick={() => authService.logout()}
                           className="pop-button bg-black text-white px-10 py-4 text-sm"
                        >
                           Terminate Session
                        </button>
                     ) : (
                        <button
                           onClick={() => authService.login()}
                           className="pop-button bg-[#CCFF00] text-black px-10 py-4 text-sm animate-pulse"
                        >
                           Authorize Nexus
                        </button>
                     )}
                  </div>
               </div>

               {/* API Bridge Section */}
               <div className="space-y-6">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-black flex items-center justify-center rounded-xl shadow-[3px_3px_0px_0px_#FF3399]">
                        <Key size={20} className="text-[#FF3399]" />
                     </div>
                     <h3 className="text-2xl font-black uppercase tracking-tighter">Universal API Bridge</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {/* ElevenLabs */}
                     <div className="pop-box h-full">
                        <div className="pop-header bg-[#CCFF00]">
                           <h4 className="text-xs font-black uppercase">ElevenLabs</h4>
                        </div>
                        <div className="p-6 space-y-4">
                           <div className="flex items-center gap-4 mb-2">
                              <CustomIcon name="mic" size={40} />
                              <div className="flex flex-col">
                                 <span className="text-[10px] font-black uppercase text-black/30">Voice Synergy</span>
                                 <span className="text-sm font-bold uppercase">Speech Synth Node</span>
                              </div>
                           </div>
                           <div className="space-y-1">
                              <label className="text-[8px] font-black uppercase tracking-widest text-black/20 ml-1">Secret Key</label>
                              <input
                                 type="password"
                                 value={elevenLabsKey}
                                 onChange={(e) => setElevenLabsKey(e.target.value)}
                                 placeholder="sk_..."
                                 className="pop-input w-full p-3 font-bold text-xs"
                              />
                           </div>
                        </div>
                     </div>

                     {/* Auphonic */}
                     <div className="pop-box h-full">
                        <div className="pop-header bg-[#00CCFF]">
                           <h4 className="text-xs font-black uppercase">Auphonic</h4>
                        </div>
                        <div className="p-6 space-y-4">
                           <div className="flex items-center gap-4 mb-2">
                              <CustomIcon name="volume" size={40} />
                              <div className="flex flex-col">
                                 <span className="text-[10px] font-black uppercase text-black/30">Audio Mastery</span>
                                 <span className="text-sm font-bold uppercase">Loudness Normalizer</span>
                              </div>
                           </div>
                           <div className="space-y-1">
                              <label className="text-[8px] font-black uppercase tracking-widest text-black/20 ml-1">Bearer Token</label>
                              <input
                                 type="password"
                                 value={auphonicKey}
                                 onChange={(e) => setAuphonicKey(e.target.value)}
                                 placeholder="ap_..."
                                 className="pop-input w-full p-3 font-bold text-xs"
                              />
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="pt-4">
                     <button
                        onClick={handleSaveKeys}
                        className="w-full py-6 pop-button bg-black text-[#CCFF00] text-xl flex items-center justify-center gap-4 shadow-[12px_12px_0px_0px_#FF3399]"
                     >
                        {copiedKey === 'saved' ? <Check size={28} /> : <Zap size={28} />}
                        {copiedKey === 'saved' ? "Vault Locked & Encrypted" : "Synchronize All Tokens"}
                     </button>
                  </div>
               </div>

               {/* System Diagnostics */}
               <div className="pop-box bg-black text-white/40 p-10 flex flex-col md:flex-row items-center justify-between gap-8 group grayscale hover:grayscale-0 transition-all">
                  <div className="flex items-center gap-8">
                     <div className="w-16 h-16 border-[4px] border-white/10 rounded-full flex items-center justify-center">
                        <Database size={32} className="text-[#00CCFF] group-hover:animate-pulse" />
                     </div>
                     <div className="space-y-1">
                        <h4 className="text-2xl font-black uppercase text-white tracking-widest group-hover:text-[#00CCFF] transition-colors">Local Persistence Engine</h4>
                        <p className="font-bold uppercase text-xs">Runtime Memory: Optimistic + LocalStorage Mirror</p>
                     </div>
                  </div>
                  <div className="flex gap-3">
                     <div className="bg-white/5 border border-white/10 px-6 py-2 rounded-xl text-[10px] font-black uppercase">v2.1.0-STABLE</div>
                     <div className="bg-[#CCFF00]/10 border border-[#CCFF00]/20 text-[#CCFF00] px-6 py-2 rounded-xl text-[10px] font-black uppercase">PROD-SYNC</div>
                  </div>
               </div>

            </div>
         </div>
      </div>
   );
};

export default Settings;
