
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GlobalDataProvider } from './context/GlobalDataContext';
import { Sidebar } from './components/Sidebar';
import StoryboardStudio from './views/StoryboardStudio';
import SeoGenerator from './views/SeoGenerator';
import ThumbnailStudio from './views/ThumbnailStudio';
import Channelytics from './views/Channelytics';
import IdeasVault from './views/IdeasVault';
import Dashboard from './views/Dashboard';
import Settings from './views/Settings';
import LaunchCalendar from './views/LaunchCalendar';
import AssetVault from './views/AssetVault';

// Temporary Placeholder Views (Keeping one if needed, but Dashboard is live)
const PlaceholderView = ({ title }: { title: string }) => (
  <div className="flex-1 p-8 flex flex-col h-full">
    <div className="w-full h-full border-4 border-dashed border-black/20 rounded-2xl flex items-center justify-center relative overflow-hidden bg-white/50">
      <h2 className="text-6xl font-black text-black/10 uppercase italic tracking-tighter shadow-sm">{title}</h2>
    </div>
  </div>
);

function App() {
  return (
    <GlobalDataProvider>
      <BrowserRouter>
        <div className="flex h-screen w-screen bg-[#f3f4f6] overflow-hidden">
          <Sidebar />
          
          <main className="flex-1 h-full overflow-y-auto overflow-x-hidden pt-8 px-10 pb-8 relative">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/storyboard" element={<StoryboardStudio />} />
              <Route path="/seo" element={<SeoGenerator />} />
              <Route path="/thumbnail" element={<ThumbnailStudio />} />
              <Route path="/channelytics" element={<Channelytics />} />
              <Route path="/ideas" element={<IdeasVault />} />
              <Route path="/calendar" element={<LaunchCalendar />} />
              <Route path="/vault" element={<AssetVault />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </GlobalDataProvider>
  );
}

export default App;
