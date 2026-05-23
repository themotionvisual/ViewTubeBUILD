export const TOOLBOX_PALETTE = [
  "#FF83EA", // Violet
  "#FF8AAF", // Bubblegum Tint
  "#FFB570", // Sandy Brown
  "#FFFF61", // Canary Yellow
  "#4FFF5B", // Electric Green
  "#40C6E9", // Sky Aqua
  "#579AFF", // Cornflower Blue
  "#CC00FF", // Hyper Magenta
];

export const getPaletteColor = (index: number) => {
  const safe = Number.isFinite(index) ? Math.round(index) : 0;
  const len = TOOLBOX_PALETTE.length;
  const normalized = ((safe % len) + len) % len;
  return TOOLBOX_PALETTE[normalized];
};

export const getToolboxPaletteColors = (index: number) => ({
  header: getPaletteColor(index),
  icon: getPaletteColor(index + 4),
});
