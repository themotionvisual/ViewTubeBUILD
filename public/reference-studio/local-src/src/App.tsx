import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GlobalDataProvider } from './context/GlobalDataContext';
import { Sidebar } from './components/Sidebar';

import Dashboard from './views/Dashboard';
import StudioHub from './views/StudioHub';
import VideoManager from './views/VideoManager';
import PerformanceHub from './views/PerformanceHub';
import SettingsHub from './views/SettingsHub';
import ReferenceStudio from './views/ReferenceStudio';
import ProjectsV3 from './views/ProjectsV3';
import { ShortsStudio } from './views/ShortsStudio';
import { TheVault } from './views/TheVault';

const Placeholder = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-full">
    <div className="pop-box p-10 text-4xl font-black uppercase tracking-tighter shadow-[10px_10px_0px_0px_black]">{title} Initializing...</div>
  </div>
);

function App() {
  useEffect(() => {
    const isDark = localStorage.getItem('vt_dark_mode') === 'true';
    if (isDark) {
      document.body.classList.add('dark-theme-override');
    } else {
      document.body.classList.remove('dark-theme-override');
    }
  }, []);

  return (
    <GlobalDataProvider>
      <style>{`
        .dark-theme-override {
          background-color: #05070c;
          color: #e8f7ff;
        }

        .dark-theme-override .pop-box {
          background: #0f172a !important;
          color: #e8f7ff !important;
          border-color: #38bdf8 !important;
          box-shadow: 0 0 0 2px #000, 8px 8px 0 0 #000, 0 0 22px rgba(56, 189, 248, 0.35) !important;
        }

        .dark-theme-override .pop-header {
          border-color: #38bdf8 !important;
        }

        .dark-theme-override .pop-button {
          border-color: #38bdf8 !important;
          box-shadow: 0 0 0 2px #000, 6px 6px 0 0 #000, 0 0 16px rgba(204, 255, 0, 0.35) !important;
        }

        .dark-theme-override input,
        .dark-theme-override textarea,
        .dark-theme-override select {
          background: #0b1220 !important;
          color: #e8f7ff !important;
          border-color: #38bdf8 !important;
        }

        .dark-theme-override a {
          color: inherit;
        }

        .dark-theme-override img,
        .dark-theme-override video {
          filter: none;
        }
      `}</style>
      <BrowserRouter>
        <div className="flex h-screen w-screen bg-[#f3f4f6] overflow-hidden font-sans">
          <Sidebar />

          <main className="flex-1 h-full overflow-y-auto overflow-x-hidden p-8 relative pb-96">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/studio" element={<StudioHub />} />
              <Route path="/strategy" element={<ProjectsV3 />} />
              <Route path="/video-manager" element={<VideoManager />} />
              <Route path="/shorts" element={<ShortsStudio />} />
              <Route path="/performance" element={<PerformanceHub />} />
              <Route path="/user-guide" element={<Placeholder title="User Guide" />} />
              <Route path="/settings" element={<SettingsHub />} />
              <Route path="/reference-studio" element={<ReferenceStudio />} />
              <Route path="/vault" element={<TheVault />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </GlobalDataProvider>
  );
}

export default App;
