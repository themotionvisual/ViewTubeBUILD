import type { FeatureRegistryEntry } from "./contracts";

export const FEATURE_REGISTRY: FeatureRegistryEntry[] = [
  {
    featureName: "Timeline snap toggle + edge/grid/playhead snapping",
    canonicalSource: "CLINE_VIDX_V2",
    status: "implemented",
    ownerModule: "src/editor-core/timeline/reducer.ts",
  },
  {
    featureName: "Arrow-modified cut actions",
    canonicalSource: "Feature harvest: 89f8f + timeline functions",
    status: "implemented",
    ownerModule: "src/editor-core/timeline/reducer.ts",
  },
  {
    featureName: "Seam grouping and transition seam controls",
    canonicalSource: "Feature harvest: 89f8f V2/V3",
    status: "implemented",
    ownerModule: "src/editor-ui/IntegratedRemotionEditor.tsx",
  },
  {
    featureName: "Viewport-aware track collapse/taper",
    canonicalSource: "Feature harvest: timeline functions + NOTES",
    status: "implemented",
    ownerModule: "src/editor-ui/IntegratedRemotionEditor.tsx",
  },
  {
    featureName: "Media upload JPEG/JPG/PNG/SVG/MP4/MP3/WAV",
    canonicalSource: "CLINE_VIDX_V1/V2 + feature harvest",
    status: "implemented",
    ownerModule: "src/editor-core/media/mediaImport.ts",
  },
  {
    featureName: "Export queue + mp4/mov/wav/svg/gif/png-sequence/json/html",
    canonicalSource: "CLINE_VIDX_V2 + feature harvest",
    status: "implemented",
    ownerModule: "src/editor-core/export/exportEngine.ts",
  },
  {
    featureName: "AI prompt to schema-validated timeline patch",
    canonicalSource: "Current ViewTube editor-core",
    status: "implemented",
    ownerModule: "src/editor-core/ai/patchEngine.ts",
  },
  {
    featureName: "Multicam and collaborative cursors",
    canonicalSource: "Feature harvest ideas",
    status: "deferred",
    ownerModule: "n/a",
  },
];
