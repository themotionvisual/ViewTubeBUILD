import { useEffect } from "react"
import { BrowserRouter, useLocation } from "react-router-dom"
import { GlobalDataProvider } from "./context/GlobalDataContext"
import { AppShell } from "./app/AppShell"
import { AppRoutes } from "./app/AppRoutes"

const DARK_THEME_CSS = `
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
`

/**
 * Inner component that can use useLocation (must be inside BrowserRouter).
 * Routes starting with /render-bench/ bypass AppShell entirely —
 * no sidebar, no padding, no app chrome. This is critical for iframe isolation.
 */
function AppInner() {
 const location = useLocation()
 const isBareRoute = location.pathname.startsWith("/render-bench")

 if (isBareRoute) {
  return <AppRoutes />
 }

 return (
  <AppShell>
   <AppRoutes />
  </AppShell>
 )
}

function App() {
 useEffect(() => {
  const isDark = localStorage.getItem("vt_dark_mode") === "true"
  if (isDark) {
   document.body.classList.add("dark-theme-override")
  } else {
   document.body.classList.remove("dark-theme-override")
  }
 }, [])

 return (
  <GlobalDataProvider>
   <style>{DARK_THEME_CSS}</style>
   <BrowserRouter>
    <AppInner />
   </BrowserRouter>
  </GlobalDataProvider>
 )
}

export default App
