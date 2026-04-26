import type {
  ExportArtifact,
  ExportJob,
  LaunchEditorProjectV1,
  RenderFormat,
  RenderRequest,
  TimelineState,
} from "../contracts";

const MIME_BY_FORMAT: Record<RenderFormat, string> = {
  mp4: "video/mp4",
  mov: "video/quicktime",
  wav: "audio/wav",
  svg: "image/svg+xml",
  gif: "image/gif",
  "png-sequence": "application/zip",
  json: "application/json",
  html: "text/html",
};

export const createExportArtifact = (
  format: RenderFormat,
  baseName: string,
): ExportArtifact => {
  const extension =
    format === "png-sequence"
      ? "zip"
      : format;

  return {
    id: `artifact-${format}-${Date.now()}`,
    format,
    filename: `${baseName}.${extension}`,
    mimeType: MIME_BY_FORMAT[format],
    status: "queued",
  };
};

export const createExportJob = (
  request: RenderRequest,
  baseName: string,
): ExportJob => {
  return {
    id: `job-${Date.now()}`,
    request,
    status: "queued",
    createdAt: new Date().toISOString(),
    artifacts: [createExportArtifact(request.format, baseName)],
  };
};

export const completeExportJob = (
  job: ExportJob,
  downloadUrl?: string,
): ExportJob => {
  return {
    ...job,
    status: "completed",
    artifacts: job.artifacts.map((artifact) => ({
      ...artifact,
      status: "ready",
      downloadUrl,
    })),
  };
};

export const buildProjectJson = (state: TimelineState): string => {
  return JSON.stringify(
    {
      version: 1,
      exportedAt: new Date().toISOString(),
      timeline: {
        fps: state.fps,
        clips: state.clips,
        tracks: state.tracks,
        keyframes: state.keyframes,
        transitions: state.transitions,
      },
    },
    null,
    2,
  );
};

export const buildLaunchProjectJson = (
  state: TimelineState,
  exportMeta: LaunchEditorProjectV1["exportMeta"] = {
    aspect: "16:9",
    resolutionProfile: "1080",
  },
): string => {
  const payload: LaunchEditorProjectV1 = {
    version: "LaunchEditorProjectV1",
    exportedAt: new Date().toISOString(),
    timeline: {
      fps: state.fps,
      playheadFrame: state.playheadFrame,
      zoom: state.zoom,
      snapping: state.snapping,
      tracks: state.tracks,
      clips: state.clips,
      keyframes: state.keyframes,
      transitions: state.transitions,
    },
    exportMeta,
  };
  return JSON.stringify(payload, null, 2);
};

export const parseLaunchProjectJson = (raw: string): LaunchEditorProjectV1 => {
  const parsed = JSON.parse(raw) as LaunchEditorProjectV1;
  if (parsed?.version !== "LaunchEditorProjectV1") {
    throw new Error("Invalid launch project file version.");
  }
  if (!parsed.timeline?.tracks || !parsed.timeline?.clips) {
    throw new Error("Invalid launch project file structure.");
  }
  return parsed;
};

export const buildHtmlPackage = (projectJson: string): string => {
  return `<!doctype html>
<html>
<head><meta charset="utf-8"><title>ViewTube Editor Export</title></head>
<body>
<h1>ViewTube Editor Project Package</h1>
<script type="application/json" id="viewtube-project">${projectJson.replace(/</g, "\\u003c")}</script>
<p>Import this package into ViewTube editor to restore timeline state.</p>
</body>
</html>`;
};

export const buildBasicSvgFrame = (state: TimelineState, width = 1080, height = 1920): string => {
  const visible = state.clips.filter(
    (clip) => clip.startFrame <= state.playheadFrame && clip.endFrame >= state.playheadFrame,
  );
  const blocks = visible
    .map((clip, index) => {
      const y = 80 + index * 90;
      return `<rect x="80" y="${y}" width="920" height="64" fill="${clip.color}" stroke="black" stroke-width="4" />`;
    })
    .join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
<rect width="100%" height="100%" fill="#f4f4f4"/>
${blocks}
</svg>`;
};
