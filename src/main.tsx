import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// Install error/rejection/fetch capture BEFORE anything else runs so we
// don't miss the very first failure — the whole point of the on-screen
// diagnostics is to be there when nothing else works.
import { installOnScreenDiagnostics } from './app/onScreenDiagnostics'
installOnScreenDiagnostics()
// Eagerly evaluate authSession so its OAuth redirect hash listener fires
// before the app mounts. This ensures the popup window handles the token
// and calls window.close() before React can boot any auth side-effects.
import './services/auth/authSession'
import App from './App.tsx'

// If this window was opened as an OAuth popup, the authSession module-level
// hash listener already handled the token and sent postMessage. Don't mount
// the full app — just let the popup close itself.
if (!window.opener || !window.location.hash.includes('access_token')) {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
