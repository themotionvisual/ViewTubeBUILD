export const VIEWTUBE_PALETTE = [
  '#f05a67','#ff765d','#ff9b45','#ffd34e','#a8dc4a','#50c878',
  '#3cc7ad','#34cdea','#528ffa','#8c68e8','#cf65dc','#f36bb5',
] as const;

export const VIEWTUBE_INK = '#171717';
export const VIEWTUBE_WHITE = '#ffffff';

export const CANVASES = {
  landscape: {width: 1920, height: 1080, aspectRatio: '16:9'},
  portrait: {width: 1080, height: 1920, aspectRatio: '9:16'},
  square: {width: 1080, height: 1080, aspectRatio: '1:1'},
} as const;

export const TYPOGRAPHY = {
  display: {fontWeight: 999, lineHeight: 0.9},
  heading: {fontWeight: 900, lineHeight: 1},
  body: {fontWeight: 700, lineHeight: 1.2},
  label: {fontWeight: 900, lineHeight: 1, letterSpacing: 0.3},
} as const;
