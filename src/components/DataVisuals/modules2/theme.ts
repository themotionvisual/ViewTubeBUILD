/**
 * Theme context for DataVisuals-2 modules. Two visual modes:
 *
 *   "preserved"  — original neo-brutalist palette from the source viz app
 *                  (bright hue-blocks, hard black shadow, uppercase Chicago).
 *
 *   "adapted"    — viewtubeX brand-tokenized variant that keeps every module's
 *                  layout, motion, and interaction but swaps the palette so
 *                  Data Visuals 2 stays visually coherent with the rest of the
 *                  toolbox.
 *
 * Each module reads `useVt2Theme()` to select its palette and any per-mode
 * overrides. Modules should not fork into two separate components — they wire
 * palette values through the same JSX so parity is enforced by construction.
 */

import { createContext, useContext } from "react"

export type Vt2ThemeMode = "preserved" | "adapted"

export type Vt2Palette = {
  iconBg: string
  titleBg: string
  bodyBg?: string
  primary: string
  secondary: string
  accent: string
  positive: string
  warm: string
  purple: string
  hue: string[]           // 6-hue rotation used by sparklines etc.
  hoverLine: string
}

export const VT2_PALETTES: Record<Vt2ThemeMode, Vt2Palette> = {
  // Verbatim from the source: high-saturation blocks, black-on-color type.
  preserved: {
    iconBg: "#FF2D78",
    titleBg: "#FFB158",
    primary: "#00E5FF",
    secondary: "#A8FF3E",
    accent: "#FFE500",
    positive: "#A8FF3E",
    warm: "#FF6B00",
    purple: "#B14EFF",
    hue: ["#00E5FF", "#A8FF3E", "#FF2D78", "#FFE500", "#B14EFF", "#FF6B00"],
    hoverLine: "#000",
  },
  // viewtubeX brand palette — same layout, calmer surface, tokenized hues.
  // Sources: VtSyncDataVisualsToolbox already uses #36E0F6 / #FFDA47 / #F55EFC
  // for its toolbox chrome, so we build off the same palette family.
  adapted: {
    iconBg: "#F55EFC",
    titleBg: "#FFDA47",
    bodyBg: "#f9f7f0",
    primary: "#36E0F6",
    secondary: "#3FEE56",
    accent: "#FFDA47",
    positive: "#3FEE56",
    warm: "#FF7A2F",
    purple: "#B14AED",
    hue: ["#36E0F6", "#3FEE56", "#F55EFC", "#FFDA47", "#B14AED", "#FF7A2F"],
    hoverLine: "#111",
  },
}

export const Vt2ThemeContext = createContext<Vt2ThemeMode>("preserved")

export function useVt2Theme(): { mode: Vt2ThemeMode; palette: Vt2Palette } {
  const mode = useContext(Vt2ThemeContext)
  return { mode, palette: VT2_PALETTES[mode] }
}
