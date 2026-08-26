// Icon library for the primary navigation. Every icon is inline SVG in the
// same "heavy / Micro Solid" style — dense fills, 3.4px rounded strokes only
// where a form needs them, cut-out negative space keyed to `currentColor`'s
// container. Consumers render `<NavIcon id="dashboard" />` with `size` +
// `strokeWidth` overrides; the SVG inherits color from the surrounding
// text so the icon reads as ink on whichever palette-tinted chip it lives
// inside.
//
// Each id corresponds to a picked concept from the Heavy Icon Catalog
// (2026-08-25). Swap concepts by changing the mapping — no consumer
// touch required.

import React from "react"

export type NavIconId =
 | "dashboard"
 | "studio"
 | "projects"
 | "ai_brain"
 | "analytics"
 | "editor"
 | "settings"
 | "user_guide"

type IconRenderer = (cutFill: string) => React.ReactNode

// Individual icon renderers. Each accepts the "cut" fill color (usually the
// button background) so the cut-out negative space shows the ground behind,
// not white. This is how the Micro-Solid style produces depth on any hue.
const icons: Record<NavIconId, IconRenderer> = {
 // Dashboard — Concentric Target (dash-5)
 dashboard: () => (
  <>
   <circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
   <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
   <circle cx="12" cy="12" r="2.5" />
  </>
 ),

 // Studio — Clapper (studio-8) - clapper board with hinged top
 studio: (cut) => (
  <>
   <rect x="1" y="8" width="22" height="14" rx="1" />
   <path d="M1 8 L23 8 L20 3 H4 Z" />
   <path d="M5 4 L4 8 M9 4 L8 8 M13 4 L12 8 M17 4 L16 8 M21 4 L20 8" stroke={cut} strokeWidth="1.6" fill="none" />
  </>
 ),

 // Projects — Calendar (proj-7)
 projects: (cut) => (
  <>
   <rect x="2" y="4" width="20" height="18" rx="2" />
   <rect x="2" y="4" width="20" height="6" fill={cut} />
   <rect x="7" y="1" width="3" height="6" rx="1" />
   <rect x="14" y="1" width="3" height="6" rx="1" />
   <circle cx="12" cy="16" r="2.5" />
  </>
 ),

 // AI Brain — dual-hemisphere brain silhouette (brain-1)
 ai_brain: () => (
  <>
   <path d="M9 2 C6 2 4 4 4 6.5 C2.5 7 2 8.5 2.5 10 C1.5 11 1.5 13 2.5 14 C2 15.5 2.5 17 4 17.5 C4 19.5 6 22 9 22 C10.5 22 12 20.5 12 20.5 V3.5 C12 3.5 10.5 2 9 2 Z" />
   <path d="M15 2 C18 2 20 4 20 6.5 C21.5 7 22 8.5 21.5 10 C22.5 11 22.5 13 21.5 14 C22 15.5 21.5 17 20 17.5 C20 19.5 18 22 15 22 C13.5 22 12 20.5 12 20.5 V3.5 C12 3.5 13.5 2 15 2 Z" />
  </>
 ),

 // Analytics — Zig-zag trend arrow (analytics-6)
 analytics: () => (
  <>
   <path d="M22 5 L14 13 L10 9 L2 17" fill="none" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
   <path d="M15 5 H22 V12 Z" />
  </>
 ),

 // Editor — Film strip (editor-1)
 editor: (cut) => (
  <>
   <rect x="1" y="4" width="22" height="16" rx="1" />
   <rect x="3" y="6" width="4" height="4" fill={cut} />
   <rect x="10" y="6" width="4" height="4" fill={cut} />
   <rect x="17" y="6" width="4" height="4" fill={cut} />
   <rect x="3" y="14" width="4" height="4" fill={cut} />
   <rect x="10" y="14" width="4" height="4" fill={cut} />
   <rect x="17" y="14" width="4" height="4" fill={cut} />
  </>
 ),

 // Settings — Gear (settings-1)
 settings: (cut) => (
  <>
   <path d="M11 1 H13 V4 L15 4.5 L17 3 L19 5 L17.5 7 L18 9 H21 V15 H18 L17.5 17 L19 19 L17 21 L15 19.5 L13 20 V23 H11 V20 L9 19.5 L7 21 L5 19 L6.5 17 L6 15 H3 V9 H6 L6.5 7 L5 5 L7 3 L9 4.5 L11 4 Z" />
   <circle cx="12" cy="12" r="3.6" fill={cut} />
  </>
 ),

 // User Guide — Compass (guide-3)
 user_guide: (cut) => (
  <>
   <circle cx="12" cy="12" r="10" />
   <path d="M12 5 L15 12 L12 19 L9 12 Z" fill={cut} />
  </>
 ),
}

export interface NavIconProps {
 id: NavIconId
 size?: number
 /**
  * Color painted into the icon's cut-out shapes so negative space matches
  * the button background. Defaults to `currentColor` on a `<svg>` won't
  * help here — the cut fill needs to actually differ from the ink. Pass
  * the palette color used behind the icon (or omit for a solid look on a
  * light ground).
  */
 cutFill?: string
 className?: string
 title?: string
}

export const NavIcon: React.FC<NavIconProps> = ({ id, size = 20, cutFill = "transparent", className, title }) => {
 const render = icons[id]
 if (!render) return null
 return (
  <svg
   xmlns="http://www.w3.org/2000/svg"
   viewBox="0 0 24 24"
   width={size}
   height={size}
   className={className}
   aria-hidden={title ? undefined : true}
   role={title ? "img" : undefined}
   fill="currentColor"
   stroke="none"
  >
   {title ? <title>{title}</title> : null}
   {render(cutFill)}
  </svg>
 )
}
