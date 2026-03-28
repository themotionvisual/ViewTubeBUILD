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
  Cpu,
  Settings as SettingsIcon,
  Shield,
  Moon,
  Sun
} from 'lucide-react';
import { AccordionContainer } from '../components/AccordionContainer';
import { useBrain } from '../context/GlobalDataContext';
import { CustomIcon } from '../components/CustomIcon';

const SettingsHub: React.FC = () => {
  const { authState, login, logout } = useBrain();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [geminiKey, setGeminiKey] = useState(localStorage.getItem('yt_api_key') || 'AIzaSyBkVB4xL7K1etPwnb-PQLHmXwk7BcbgywQ');
  const [googleClientId, setGoogleClientId] = useState(localStorage.getItem('yt_google_client_id') || '365513395077-1cpc5mgn763t62ggcujkgbiv11rdbhsv.apps.googleusercontent.com');
  const [elevenLabsKey, setElevenLabsKey] = useState(localStorage.getItem('vt_elevenlabs_key') || '');
  const [auphonicKey, setAuphonicKey] = useState(localStorage.getItem('vt_auphonic_key') || '');
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('vt_dark_mode') === 'true');

  const handleSaveKeys = () => {
    if (geminiKey) localStorage.setItem('yt_api_key', geminiKey);
    if (googleClientId) localStorage.setItem('yt_google_client_id', googleClientId);
    localStorage.setItem('vt_elevenlabs_key', elevenLabsKey);
    localStorage.setItem('vt_auphonic_key', auphonicKey);
    setCopiedKey('saved');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleDarkMode = () => {
    const newVal = !isDarkMode;
    setIsDarkMode(newVal);
    localStorage.setItem('vt_dark_mode', newVal ? 'true' : 'false');
    if (newVal) {
      document.body.classList.add('dark-theme-override');
    } else {
      document.body.classList.remove('dark-theme-override');
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-40 animate-fade-in px-4">
      {/* Main Container - Matched to Reference Studio */}
      <div className="w-full bg-white border-[5px] border-black rounded-2xl shadow-[12px_12px_0px_0px_black] overflow-hidden flex flex-col transition-all duration-700">

        {/* Header Strip - Matched to Reference Studio */}
        <header className="bg-[#00CCFF] h-[80px] border-b-[5px] border-black flex items-center justify-between px-0 overflow-hidden">
          <div className="flex items-center h-full">
            <div className="bg-black h-full w-[80px] flex items-center justify-center border-r-[5px] border-black flex-shrink-0">
              <CustomIcon name="settings" size={48} className="text-[#00CCFF]" />
            </div>
            <h1 className="text-[50px] font-[1000] uppercase tracking-tighter text-black pl-8 leading-none">SYSTEM CALIBRATION</h1>
          </div>

          <div className="flex items-center gap-6 pr-6">
            <button
              onClick={toggleDarkMode}
              className={`flex items-center justify-center w-12 h-12 rounded-xl border-2 border-black transition-all shadow-[4px_4px_0px_0px_black] active:translate-y-1 active:shadow-none ${isDarkMode ? 'bg-black text-[#00CCFF]' : 'bg-white text-black'}`}
              title="Toggle Night Ops Mode"
            >
              {isDarkMode ? <Moon size={24} /> : <Sun size={24} />}
            </button>
            <div className="bg-black text-[#00CCFF] px-4 py-1 rounded-lg border-2 border-black font-black text-[10px] uppercase tracking-widest shadow-[4px_4px_0px_0px_#00CCFF]">
              Nexus v2.1.1
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8">

          <AccordionContainer
            title="Nexus Authentication"
            subtitle="Identity Protocol & Google Connectivity"
            headerColor="bg-black text-[#ccff00]"
            icon={<ShieldCheck size={24} />}
            isOpenInitial={true}
          >
            <div className="bg-white p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 group-hover:rotate-12 transition-transform duration-1000 pointer-events-none">
                <Cloud size={200} />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="space-y-4">
                  <h3 className="text-4xl font-[1000] uppercase tracking-tighter leading-none text-black">
                    Google <span className="text-[#ff3399]">Workspace</span> Nexus
                  </h3>
                  <p className="text-xl font-bold text-black/50 max-w-xl leading-relaxed uppercase tracking-tight">
                    Synchronize your channel, drive, and calendar for the ultimate frictionless Creator OS experience.
                  </p>
                </div>

                {authState.isAuthenticated ? (
                  <button
                    onClick={logout}
                    className="pop-button bg-black text-white px-10 py-5 text-lg flex items-center gap-4 shrink-0"
                  >
                    <LogOut size={24} /> Terminate Session
                  </button>
                ) : (
                  <button
                    onClick={login}
                    className="pop-button bg-[#ccff00] text-black px-10 py-5 text-lg flex items-center gap-4 shrink-0 animate-pulse"
                  >
                    <LogIn size={24} /> Authorize Nexus
                  </button>
                )}
              </div>
            </div>
          </AccordionContainer>

          <AccordionContainer
            title="Key Vault"
            subtitle="Universal API Bridge & AI Secrets"
            headerColor="bg-[#ff3399] text-white"
            icon={<Key size={24} />}
          >
            <div className="space-y-10 p-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Gemini AI */}
                <div className="pop-box p-10 group">
                  <div className="flex items-center gap-5 mb-8">
                    <div className="bg-[#FFDD00] text-black p-4 rounded-2xl border-[4px] border-black shadow-[4px_4px_0px_0px_black]">
                      <Zap size={32} />
                    </div>
                    <h4 className="text-3xl font-[1000] uppercase tracking-tighter">Gemini AI</h4>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black/30 ml-2">API Key</label>
                    <input
                      type="password"
                      value={geminiKey}
                      onChange={(e) => setGeminiKey(e.target.value)}
                      placeholder="AIza..."
                      className="pop-input w-full p-5"
                    />
                  </div>
                </div>

                {/* Google OAuth Client ID */}
                <div className="pop-box p-10 group">
                  <div className="flex items-center gap-5 mb-8">
                    <div className="bg-[#00CCFF] text-black p-4 rounded-2xl border-[4px] border-black shadow-[4px_4px_0px_0px_black]">
                      <ShieldCheck size={32} />
                    </div>
                    <h4 className="text-3xl font-[1000] uppercase tracking-tighter">Google OAuth</h4>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black/30 ml-2">Client ID</label>
                    <input
                      type="password"
                      value={googleClientId}
                      onChange={(e) => setGoogleClientId(e.target.value)}
                      placeholder="xxxxx.apps.googleusercontent.com"
                      className="pop-input w-full p-5"
                    />
                  </div>
                </div>

                {/* ElevenLabs */}
                <div className="pop-box p-10 group">
                  <div className="flex items-center gap-5 mb-8">
                    <div className="bg-[#ccff00] text-black p-4 rounded-2xl border-[4px] border-black shadow-[4px_4px_0px_0px_black]">
                      <CustomIcon name="mic" size={32} />
                    </div>
                    <h4 className="text-3xl font-[1000] uppercase tracking-tighter">ElevenLabs</h4>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black/30 ml-2">API Secret Token</label>
                    <input
                      type="password"
                      value={elevenLabsKey}
                      onChange={(e) => setElevenLabsKey(e.target.value)}
                      placeholder="sk_..."
                      className="pop-input w-full p-5"
                    />
                  </div>
                </div>

                {/* Auphonic */}
                <div className="pop-box p-10 group">
                  <div className="flex items-center gap-5 mb-8">
                    <div className="bg-[#ff3399] text-white p-4 rounded-2xl border-[4px] border-black shadow-[4px_4px_0px_0px_black]">
                      <CustomIcon name="volume" size={32} />
                    </div>
                    <h4 className="text-3xl font-[1000] uppercase tracking-tighter">Auphonic</h4>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black/30 ml-2">Bearer Auth Token</label>
                    <input
                      type="password"
                      value={auphonicKey}
                      onChange={(e) => setAuphonicKey(e.target.value)}
                      placeholder="ap_..."
                      className="pop-input w-full p-5"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 flex justify-center pb-8">
                <button
                  onClick={handleSaveKeys}
                  className="pop-button bg-black text-[#ccff00] px-16 py-8 text-2xl flex items-center gap-6 group"
                >
                  {copiedKey === 'saved' ? <Check size={32} /> : <Zap size={32} className="group-hover:animate-spin" />}
                  {copiedKey === 'saved' ? "VAULT LOCKED" : "SECURE ALL KEYS"}
                </button>
              </div>
            </div>
          </AccordionContainer>

          <AccordionContainer
            title="Engine Telemetry"
            subtitle="Persistence & Production Metrics"
            headerColor="bg-[#00ccff] text-black"
            icon={<Cpu size={24} />}
          >
            <div className="p-8 space-y-8">
              <div className="bg-black text-white/40 border-[6px] border-black rounded-[28px] p-12 shadow-[20px_20px_0px_0px_#ccff00] flex flex-col md:flex-row items-center justify-between gap-10 grayscale hover:grayscale-0 transition-all">
                <div className="flex items-center gap-8">
                  <Database size={48} className="text-[#00d2ff]" />
                  <div>
                    <h4 className="text-2xl font-[1000] uppercase text-white tracking-widest">Local Engine v2.1.1</h4>
                    <p className="font-bold uppercase text-xs tracking-widest">Persistence: LocalStorage + Session Memory</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-white/10 px-6 py-3 rounded-xl border-2 border-white/20 font-black uppercase text-xs">Offline Sync</div>
                  <div className="bg-[#ccff00]/20 text-[#ccff00] px-6 py-3 rounded-xl border-2 border-[#ccff00]/20 font-black uppercase text-xs">Production Grid</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="pop-box p-6 bg-[#f0f9ff]">
                  <Shield size={24} className="mb-3 text-[#00ccff]" />
                  <h5 className="font-black uppercase text-sm">Privacy Shield</h5>
                  <p className="text-[10px] font-bold text-black/50 uppercase mt-1">End-to-end encryption for all API tokens.</p>
                </div>
                <div className="pop-box p-6 bg-[#fff7ed]">
                  <Zap size={24} className="mb-3 text-[#ffb158]" />
                  <h5 className="font-black uppercase text-sm">High Velocity</h5>
                  <p className="text-[10px] font-bold text-black/50 uppercase mt-1">Multi-threaded AI generation pipelines.</p>
                </div>
                <div className="pop-box p-6 bg-[#fdf2f8]">
                  <SettingsIcon size={24} className="mb-3 text-[#ff3399]" />
                  <h5 className="font-black uppercase text-sm">Custom Tuning</h5>
                  <p className="text-[10px] font-bold text-black/50 uppercase mt-1">Adjustable creativity thresholds for LLMs.</p>
                </div>
              </div>
            </div>
          </AccordionContainer>
        </div>
      </div>
    </div>
  );
};

export default SettingsHub;
