export interface UiTokenScale {
 colors: {
  neonGreen: string
  neonMagenta: string
  neonCyan: string
  neonOrange: string
  neonYellow: string
  black: string
  white: string
 }
 borders: {
  standard: string
  strong: string
 }
 radius: {
  card: string
  pill: string
 }
 shadows: {
  standard: string
  strong: string
 }
 spacing: {
  section: string
  control: string
 }
}

export const UI_TOKEN_SCALE: UiTokenScale = {
 colors: {
  neonGreen: "#CCFF00",
  neonMagenta: "#B14AED",
  neonCyan: "#24D3FF",
  neonOrange: "#FFB158",
  neonYellow: "#FFE357",
  black: "#000000",
  white: "#FFFFFF",
 },
 borders: {
  standard: "border-[4px] border-black",
  strong: "border-[6px] border-black",
 },
 radius: {
  card: "rounded-2xl",
  pill: "rounded-xl",
 },
 shadows: {
  standard: "shadow-[8px_8px_0px_0px_black]",
  strong: "shadow-[12px_12px_0px_0px_black]",
 },
 spacing: {
  section: "p-6",
  control: "p-4",
 },
}
