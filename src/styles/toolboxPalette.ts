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

/**
 * Canonical metric order for VT-SYNC visual encodings.
 *
 * Keep this list aligned with the 12-stop ViewTube spectrum. Visual modules
 * should resolve semantic metric colours here instead of assigning local
 * colours, so a metric never changes colour between modules.
 */
export const VT_VISUAL_METRIC_ORDER = [
  "views",
  "watchTime",
  "subscribers",
  "engagedViews",
  "revenue",
  "comments",
  "shares",
  "likes",
  "saves",
  "avp",
  "avd",
  "rpm",
] as const;

export type VtVisualMetricKey = (typeof VT_VISUAL_METRIC_ORDER)[number];

export const VT_VISUAL_METRIC_COLORS: Readonly<Record<VtVisualMetricKey, string>> =
  Object.freeze(
    Object.fromEntries(
      VT_VISUAL_METRIC_ORDER.map((metric, index) => [metric, VT_SPECTRUM_PALETTE_06[index]]),
    ) as Record<VtVisualMetricKey, string>,
  );

const VT_VISUAL_METRIC_ALIASES: Readonly<Record<string, VtVisualMetricKey>> = Object.freeze({
  views: "views",
  view: "views",
  watch: "watchTime",
  "watch time": "watchTime",
  "watch hrs": "watchTime",
  "watch hours": "watchTime",
  subs: "subscribers",
  subscriber: "subscribers",
  subscribers: "subscribers",
  "subs gained": "subscribers",
  "subscribers gained": "subscribers",
  engaged: "engagedViews",
  "eng views": "engagedViews",
  "engaged views": "engagedViews",
  revenue: "revenue",
  rev: "revenue",
  "$ rev": "revenue",
  "est revenue": "revenue",
  "estimated revenue": "revenue",
  comments: "comments",
  comment: "comments",
  cmnts: "comments",
  shares: "shares",
  likes: "likes",
  like: "likes",
  saves: "saves",
  save: "saves",
  "playlist saves": "saves",
  "playlist saves net": "saves",
  "added to playlists": "saves",
  "videos added to playlists": "saves",
  avp: "avp",
  "avg viewed": "avp",
  "avg % viewed": "avp",
  "avg percentage viewed": "avp",
  "average viewed": "avp",
  "average percentage viewed": "avp",
  avd: "avd",
  "avg duration": "avd",
  "avg view dur": "avd",
  "avg view duration": "avd",
  "average view duration": "avd",
  rpm: "rpm",
});

const normalizeMetricLabel = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[._/]+/g, " ")
    .replace(/\s+/g, " ");

export const resolveVtVisualMetricKey = (label: string): VtVisualMetricKey | undefined => {
  const normalized = normalizeMetricLabel(label);
  const exact = VT_VISUAL_METRIC_ALIASES[normalized];
  if (exact) return exact;

  // Prefer the longest alias so specific labels such as "engaged views" and
  // "playlist saves" win before their shorter components.
  const alias = Object.keys(VT_VISUAL_METRIC_ALIASES)
    .sort((left, right) => right.length - left.length)
    .find(
      (candidate) =>
        normalized === candidate ||
        normalized.startsWith(`${candidate} `) ||
        normalized.endsWith(` ${candidate}`) ||
        normalized.includes(` ${candidate} `),
    );
  return alias ? VT_VISUAL_METRIC_ALIASES[alias] : undefined;
};

export const getVtVisualMetricColor = (label: string): string | undefined => {
  const metric = resolveVtVisualMetricKey(label);
  return metric ? VT_VISUAL_METRIC_COLORS[metric] : undefined;
};

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
