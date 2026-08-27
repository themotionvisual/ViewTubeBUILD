// Primary-nav icon set — Phosphor "fill" weight so every icon lands with
// the same super-heavy character (matches the reference photos the user
// approved: dense filled shapes, no thin outlines, uniform visual weight
// across the whole set). One library, one weight — the whole nav reads
// as a coherent icon family instead of eight hand-drawn one-offs.

import React from "react"
import type { Icon as PhosphorIcon, IconWeight } from "@phosphor-icons/react"
import {
 Target,
 FilmSlate,
 Calendar,
 Brain,
 TrendUp,
 FilmStrip,
 Gear,
 Compass,
} from "@phosphor-icons/react"

export type NavIconId =
 | "dashboard"
 | "studio"
 | "projects"
 | "ai_brain"
 | "analytics"
 | "editor"
 | "settings"
 | "user_guide"

const icons: Record<NavIconId, PhosphorIcon> = {
 dashboard:  Target,      // Concentric target — Dashboard's aim/focus metaphor
 studio:     FilmSlate,   // Clapperboard — Studio's production metaphor
 projects:   Calendar,    // Filled calendar — Projects' scheduling metaphor
 ai_brain:   Brain,       // Dual-hemisphere brain silhouette
 analytics:  TrendUp,     // Zig-zag arrow chart — matches user's approved shape
 editor:     FilmStrip,   // Perforated film strip — Editor's video metaphor
 settings:   Gear,        // Dense-toothed cog
 user_guide: Compass,     // North-pointing compass rose
}

export interface NavIconProps {
 id: NavIconId
 size?: number
 /**
  * Phosphor weight. Defaults to "fill" — the heaviest visual weight,
  * which is what the "extra bold" style calls for. "duotone" and "bold"
  * are viable alternatives if a specific slot needs less visual mass.
  */
 weight?: IconWeight
 /**
  * Optional CSS color override. Icons inherit `currentColor` from the
  * containing nav button by default, so this is rarely needed.
  */
 color?: string
 className?: string
 title?: string
}

export const NavIcon: React.FC<NavIconProps> = ({
 id,
 size = 22,
 weight = "fill",
 color,
 className,
 title,
}) => {
 const Icon = icons[id]
 if (!Icon) return null
 return (
  <Icon
   size={size}
   weight={weight}
   color={color}
   className={className}
   aria-hidden={title ? undefined : true}
  >
   {title ? <title>{title}</title> : null}
  </Icon>
 )
}
