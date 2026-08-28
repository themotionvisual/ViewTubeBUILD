import { useEffect, useMemo } from "react"
import { BrowserRouter, useLocation } from "react-router-dom"
import { SpeedInsights } from "@vercel/speed-insights/react"
import { GlobalDataProvider } from "./context/GlobalDataContext"
import { UnifiedAccountProvider } from "./context/UnifiedAccountContext"
import { VideoAssetCatalogProvider } from "./context/VideoAssetCatalogContext"
import { InitialChannelBootstrapProvider } from "./context/InitialChannelBootstrapContext"
import { GeminiKeyProvider } from "./context/GeminiKeyContext"
import { AppShell } from "./app/AppShell"
import { AppRoutes } from "./app/AppRoutes"
import { ScrollToTop } from "./app/ScrollToTop"
import { DiagnosticOverlay } from "./app/DiagnosticOverlay"
import { recordBootPhase } from "./app/onScreenDiagnostics"
import { isDeveloperDiagnosticsEnabled } from "./services/diagnostics"
import { SimpleAuthProvider } from "./auth/AuthProvider"

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
 // Diagnostics are intentionally visible by default during the current
 // auth/API stabilization period. ?vtDiagnostics=0 is the explicit opt-out.
 const showDiag = useMemo(() => isDeveloperDiagnosticsEnabled(), [])

 if (isBareRoute) {
  return (
   <>
    <AppRoutes />
    {showDiag ? <DiagnosticOverlay /> : null}
   </>
  )
 }

 return (
  <>
   {/* QW#7 — reset scroll position on route change (hash navigation exempted). */}
   <ScrollToTop />
   <AppShell>
    <AppRoutes />
   </AppShell>
   {showDiag ? <DiagnosticOverlay /> : null}
  </>
 )
}

function App() {
 // Boot-phase breadcrumb so the on-screen diagnostic log shows whether the
 // App root actually mounted (as opposed to the whole thing crashing before
 // React commits). Cheap: one log entry per session mount.
 useEffect(() => { recordBootPhase("App mounted") }, [])
 const isDarkTheme = useMemo(
  () => localStorage.getItem("vt_dark_mode") === "true",
  [],
 )

 return (
  <div className={isDarkTheme ? "dark-theme-override" : undefined}>
   <SimpleAuthProvider>
    <UnifiedAccountProvider>
     <GeminiKeyProvider>
     <InitialChannelBootstrapProvider>
      <VideoAssetCatalogProvider>
       <GlobalDataProvider>
        <style>{DARK_THEME_CSS}</style>
        <BrowserRouter>
         <AppInner />
        </BrowserRouter>
        {/*
          Vercel Speed Insights — invisible reporter of Core Web Vitals
          (LCP, INP, CLS, TTFB, FCP) from every real visitor's browser back
          to the Vercel dashboard. No user-facing effect. Data appears under
          Project → Speed Insights within ~1 hour of deploy, broken out by
          route, device type, country, and connection. Also enable the
          feature toggle in the Vercel dashboard's Speed Insights tab if it
          isn't already on.
        */}
        {import.meta.env.PROD && <SpeedInsights />}
       </GlobalDataProvider>
      </VideoAssetCatalogProvider>
     </InitialChannelBootstrapProvider>
     </GeminiKeyProvider>
    </UnifiedAccountProvider>
   </SimpleAuthProvider>
  </div>
 )
}

export default App
