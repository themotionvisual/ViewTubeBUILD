export const VT_SPECTRUM_PALETTE_06 = [
  "#FA618A", // Rose
  "#FF7F6B", // Coral
  "#FFA85C", // Orange
  "#FFDA47", // Yellow
  "#C0F240", // Lime
  "#3FEE56", // Green
  "#4EE4BE", // Teal
  "#36E0F6", // Cyan
  "#528FFA", // Royal
  "#A467F4", // Purple
  "#F55EFC", // Magenta
  "#FF7AC8", // Pink
] as const;

export const VT_NAV_PALETTE_06 = [
  VT_SPECTRUM_PALETTE_06[0], // Rose
  VT_SPECTRUM_PALETTE_06[1], // Coral
  VT_SPECTRUM_PALETTE_06[2], // Orange
  VT_SPECTRUM_PALETTE_06[3], // Yellow
  VT_SPECTRUM_PALETTE_06[4], // Lime
  VT_SPECTRUM_PALETTE_06[5], // Green
  VT_SPECTRUM_PALETTE_06[7], // Cyan
  VT_SPECTRUM_PALETTE_06[8], // Royal
  VT_SPECTRUM_PALETTE_06[9], // Purple
  VT_SPECTRUM_PALETTE_06[11], // Pink
] as const;

export const VT_NAV_PALETTE_12 = VT_SPECTRUM_PALETTE_06;

export const APPLICATIONS_TOOLBOX_PALETTE = VT_SPECTRUM_PALETTE_06;

export const TOOLBOX_PALETTE = APPLICATIONS_TOOLBOX_PALETTE;

const normalizePaletteIndex = (index: number, length: number) => {
  const safe = Number.isFinite(index) ? Math.round(index) : 0;
  return ((safe % length) + length) % length;
};

export const getPaletteColor = (index: number) => {
  const len = TOOLBOX_PALETTE.length;
  const normalized = normalizePaletteIndex(index, len);
  return TOOLBOX_PALETTE[normalized];
};

export const getNavPaletteColor = (index: number) => {
  const len = VT_NAV_PALETTE_06.length;
  const normalized = normalizePaletteIndex(index, len);
  return VT_NAV_PALETTE_06[normalized];
};

export const getToolboxPaletteColors = (index: number) => ({
  header: getPaletteColor(index),
  icon: getPaletteColor(index + 4),
});

export const getDashboardWidgetPaletteColors = (index: number) => {
  const palette = getToolboxPaletteColors(index);
  return {
    headerColor: palette.header,
    iconRailColor: palette.icon,
  };
};
