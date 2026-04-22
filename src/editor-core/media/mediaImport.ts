import type { ImportRequest, ImportResult, MediaAsset, TrackKind } from "../contracts";

const ACCEPTED_MIME = new Map<string, TrackKind>([
  ["image/jpeg", "image"],
  ["image/jpg", "image"],
  ["image/png", "image"],
  ["image/svg+xml", "image"],
  ["video/mp4", "video"],
  ["audio/mpeg", "audio"],
  ["audio/mp3", "audio"],
  ["audio/wav", "audio"],
  ["audio/x-wav", "audio"],
]);

const ACCEPTED_EXT = new Map<string, TrackKind>([
  ["jpg", "image"],
  ["jpeg", "image"],
  ["png", "image"],
  ["svg", "image"],
  ["mp4", "video"],
  ["mp3", "audio"],
  ["wav", "audio"],
]);

const inferFromName = (fileName: string): TrackKind | null => {
  const ext = fileName.toLowerCase().split(".").pop() ?? "";
  return ACCEPTED_EXT.get(ext) ?? null;
};

export const validateImportRequest = (request: ImportRequest): ImportResult => {
  const byMime = ACCEPTED_MIME.get(request.mimeType);
  const byName = inferFromName(request.fileName);
  const kind = byMime ?? byName;

  if (!kind) {
    return {
      accepted: false,
      reason: "Unsupported media format.",
    };
  }

  if (request.sizeBytes <= 0) {
    return {
      accepted: false,
      reason: "Empty files cannot be imported.",
    };
  }

  return {
    accepted: true,
    kind,
  };
};

export const createMediaAssetFromFile = async (file: File): Promise<MediaAsset> => {
  const validation = validateImportRequest({
    fileName: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
  });

  if (!validation.accepted || !validation.kind) {
    throw new Error(validation.reason ?? "Import rejected.");
  }

  const sourceUrl = URL.createObjectURL(file);

  return {
    id: `asset-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    name: file.name,
    kind: validation.kind,
    sourceUrl,
    metadata: {
      sizeBytes: file.size,
      mimeType: file.type,
    },
  };
};

export const sanitizeSvg = (svg: string): string => {
  return svg
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/on[a-z]+\s*=\s*"[^"]*"/gi, "")
    .replace(/on[a-z]+\s*=\s*'[^']*'/gi, "");
};
