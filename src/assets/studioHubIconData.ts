export const STUDIO_HUB_ICON_SELECTIONS = {
  "Video Manager": { source: "image-gen-9(1).png", quadrant: "TL" },
  "Video Publisher": { source: "image-gen-2(8).png", quadrant: "TR" },
  "Content Analysis": { source: "image-gen-10(1).png", quadrant: "TL" },
  "Thumbnail Studio": { source: "image-gen-6(1).png", quadrant: "TL" },
  "Community Posts": { source: "image-gen-4(2).png", quadrant: "TL" },
  "Comment Responder": { source: "image-gen-1(8).png", quadrant: "TR" },
  "End-Screen Architect": { source: "image-gen-7(1).png", quadrant: "TL" },
  "Pre-Launch Priming": { source: "image-gen-8(1).png", quadrant: "TR" },
  "Hook Generator": { source: "image-gen-3(5).png", quadrant: "TL" },
  "Tactics Engine": { source: "image-gen-5(2).png", quadrant: "TL" },
} as const;

export type StudioHubIconTitle = keyof typeof STUDIO_HUB_ICON_SELECTIONS;
