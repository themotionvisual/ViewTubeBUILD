import http from 'node:http';
import crypto from 'node:crypto';
import { createReadStream, promises as fs } from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../..');
const DATA_DIR = path.join(ROOT, '.vt-e1-render');
const JOBS_FILE = path.join(DATA_DIR, 'jobs.json');
const JOB_PAYLOAD_DIR = path.join(DATA_DIR, 'payloads');
const OUTPUT_DIR = path.join(DATA_DIR, 'output');
const SVG_FRAME_DIR = path.join(DATA_DIR, 'svg-frame-renders');
const SVG_FRAME_UPLOAD_DIR = path.join(DATA_DIR, 'svg-frame-uploads');
const AI_ASSET_DIR = path.join(DATA_DIR, 'ai-assets');
const RENDER_ASSET_DIR = path.join(DATA_DIR, 'render-assets');
const REMOTION_APP_DIR = path.join(ROOT, 'src', 'remotion-editor');
const REMOTION_BIN = path.join(REMOTION_APP_DIR, 'node_modules', '.bin', 'remotion');
const FFMPEG_BIN = process.env.FFMPEG_BIN || '/opt/homebrew/bin/ffmpeg';

const PORT = Number(process.env.VT_E1_RENDER_PORT || 3001);
const ORIGIN = process.env.VT_E1_RENDER_ORIGIN || '*';
const SHARED_SECRET = String(process.env.VT_E1_RENDER_SHARED_SECRET || '').trim();
const RENDER_JOB_SCHEMA_VERSION = 'RemotionRenderJobV1';
const SVG_RENDER_JOB_SCHEMA_VERSION = 'SvgFrameRenderJobV1';
const SVG_ZIP_RENDER_JOB_SCHEMA_VERSION = 'SvgFrameZipRenderJobV1';
const SUPPORTED_LAYER_TYPES = new Set(['text', 'shape', 'media', 'audio', 'svg-overlay', 'generative-shape']);

let activeJobId = null;

const sendJson = (res, status, payload) => {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': ORIGIN,
    'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-VT-File-Name, X-VT-Mime-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(payload));
};

const nowIso = () => new Date().toISOString();
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const ensureStore = async () => {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(JOB_PAYLOAD_DIR, { recursive: true });
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.mkdir(SVG_FRAME_DIR, { recursive: true });
  await fs.mkdir(SVG_FRAME_UPLOAD_DIR, { recursive: true });
  await fs.mkdir(AI_ASSET_DIR, { recursive: true });
  await fs.mkdir(RENDER_ASSET_DIR, { recursive: true });
  try {
    await fs.access(JOBS_FILE);
  } catch {
    await fs.writeFile(JOBS_FILE, JSON.stringify({ records: {} }, null, 2), 'utf8');
  }
};

const readBody = async (req) => new Promise((resolve, reject) => {
  const chunks = [];
  req.on('data', (chunk) => chunks.push(chunk));
  req.on('error', reject);
  req.on('end', () => resolve(Buffer.concat(chunks)));
});

const timingSafeEqualString = (a, b) => {
  const left = Buffer.from(String(a || ''));
  const right = Buffer.from(String(b || ''));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
};

const isAuthorizedRenderRequest = (req) => {
  if (!SHARED_SECRET) return true;
  const header = String(req.headers.authorization || '').trim();
  const token = header.toLowerCase().startsWith('bearer ') ? header.slice(7).trim() : header;
  return timingSafeEqualString(token, SHARED_SECRET);
};

const inferRequestOrigin = (req) => {
  const forwardedProto = String(req.headers['x-forwarded-proto'] || '').trim();
  const proto = forwardedProto || 'http';
  const host = String(req.headers.host || `localhost:${PORT}`).trim() || `localhost:${PORT}`;
  return `${proto}://${host}`;
};

const sanitizeFileName = (value, fallback = 'asset.bin') => {
  const raw = String(value || '').trim();
  const base = path.basename(raw || fallback);
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, '_');
  return cleaned || fallback;
};

const guessMimeFromExt = (fileName = '') => {
  const ext = path.extname(String(fileName || '')).toLowerCase();
  if (ext === '.mp4') return 'video/mp4';
  if (ext === '.mov') return 'video/quicktime';
  if (ext === '.webm') return 'video/webm';
  if (ext === '.ogg') return 'video/ogg';
  if (ext === '.m4v') return 'video/x-m4v';
  if (ext === '.mp3') return 'audio/mpeg';
  if (ext === '.wav') return 'audio/wav';
  if (ext === '.m4a') return 'audio/mp4';
  if (ext === '.aac') return 'audio/aac';
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.gif') return 'image/gif';
  if (ext === '.svg') return 'image/svg+xml';
  return 'application/octet-stream';
};

const extensionForMime = (mimeType = 'application/octet-stream') => {
  const normalized = String(mimeType || '').toLowerCase();
  if (normalized.includes('video/mp4')) return '.mp4';
  if (normalized.includes('quicktime')) return '.mov';
  if (normalized.includes('webm')) return '.webm';
  if (normalized.includes('ogg')) return '.ogg';
  if (normalized.includes('mpeg')) return '.mp3';
  if (normalized.includes('wav')) return '.wav';
  if (normalized.includes('audio/mp4')) return '.m4a';
  if (normalized.includes('aac')) return '.aac';
  if (normalized.includes('png')) return '.png';
  if (normalized.includes('jpeg') || normalized.includes('jpg')) return '.jpg';
  if (normalized.includes('gif')) return '.gif';
  if (normalized.includes('svg')) return '.svg';
  return '.bin';
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const getGeminiApiKey = (body = {}) => String(
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  body.apiKey ||
  ''
).trim();
const mimeToExt = (mime = 'application/octet-stream') => {
  const normalized = String(mime || '').toLowerCase();
  if (normalized.includes('wav')) return 'wav';
  if (normalized.includes('mpeg') || normalized.includes('mp3')) return 'mp3';
  if (normalized.includes('ogg')) return 'ogg';
  if (normalized.includes('webm')) return 'webm';
  return 'bin';
};
const normalizeGeminiError = (status, payload = {}) => {
  const upstream = String(payload?.error?.message || payload?.message || '').trim();
  if (status === 401) return { code: 'GEMINI_UNAUTHORIZED', message: upstream || 'Gemini rejected the request as unauthorized.' };
  if (status === 403) return { code: 'GEMINI_FORBIDDEN', message: upstream || 'Gemini rejected the request. Check API key permissions and enabled APIs.' };
  if (status === 404) return { code: 'GEMINI_MODEL_NOT_FOUND', message: upstream || 'Gemini model or endpoint was not found.' };
  if (status === 429) return { code: 'GEMINI_RATE_LIMITED', message: upstream || 'Gemini rate limited the request.' };
  if (status >= 500) return { code: 'GEMINI_UPSTREAM_ERROR', message: upstream || 'Gemini upstream error.' };
  return { code: 'GEMINI_REQUEST_FAILED', message: upstream || `Gemini request failed with status ${status}.` };
};
const callGeminiApi = async ({ model, apiKey, payload, retries = 3 }) => {
  const resolvedKey = String(apiKey || '').trim();
  if (!resolvedKey) {
    const error = new Error('Gemini API key is missing. Set GEMINI_API_KEY on the server or provide a local override in VT_E1.');
    error.statusCode = 400;
    error.errorCode = 'GEMINI_API_KEY_MISSING';
    throw error;
  }
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${resolvedKey}`;
  for (let attempt = 0; attempt < retries; attempt += 1) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (response.ok) return data;
    const normalized = normalizeGeminiError(response.status, data);
    if ((response.status === 429 || response.status >= 500) && attempt < retries - 1) {
      await sleep(500 * (attempt + 1));
      continue;
    }
    const error = new Error(normalized.message);
    error.statusCode = response.status;
    error.errorCode = normalized.code;
    error.upstream = data;
    throw error;
  }
  throw new Error('Gemini request failed after retries.');
};
const writeAiAsset = async (base64Data, mimeType = 'application/octet-stream') => {
  const extension = mimeToExt(mimeType);
  const fileName = `ai_${crypto.randomUUID().replace(/-/g, '').slice(0, 24)}.${extension}`;
  const filePath = path.join(AI_ASSET_DIR, fileName);
  await fs.writeFile(filePath, Buffer.from(String(base64Data || ''), 'base64'));
  return { fileName, filePath };
};

const parseJsonBody = async (req, res) => {
  const body = await readBody(req);
  try {
    return JSON.parse(body.toString('utf8') || '{}');
  } catch {
    sendJson(res, 400, { error: 'Invalid JSON body.' });
    return null;
  }
};

const readJobsDb = async () => {
  await ensureStore();
  const raw = await fs.readFile(JOBS_FILE, 'utf8');
  try {
    const parsed = JSON.parse(raw || '{}');
    return parsed && typeof parsed === 'object' && parsed.records && typeof parsed.records === 'object'
      ? { ...parsed, records: { ...parsed.records } }
      : { records: {} };
  } catch {
    return { records: {} };
  }
};

const writeJobsDb = async (db) => {
  await ensureStore();
  await fs.writeFile(JOBS_FILE, JSON.stringify(db, null, 2), 'utf8');
};

const sanitizeJob = (job) => ({
  jobId: job.jobId,
  projectId: job.projectId,
  compositionId: job.compositionId,
  kind: job.kind,
  renderMode: job.renderMode,
  status: job.status,
  outputFormat: job.outputFormat,
  createdAt: job.createdAt,
  updatedAt: job.updatedAt,
  startedAt: job.startedAt,
  completedAt: job.completedAt,
  progress: job.progress,
  failureReason: job.failureReason,
  warnings: job.warnings || [],
  diagnostics: job.diagnostics || {},
  downloadUrl: job.downloadUrl,
});

const isProbablyVideo = (value) => /\.(mp4|webm|mov|m4v|ogg)(\?|#|$)/i.test(String(value || ''));
const isProbablyAudio = (value) => /\.(mp3|wav|m4a|aac|flac|oga|ogg|opus)(\?|#|$)/i.test(String(value || ''));
const isVideoPayload = (payload = {}) => (
  payload?.mediaKind === 'video'
  || String(payload?.mediaMime || '').toLowerCase().startsWith('video/')
  || isProbablyVideo(payload?.mediaUrl)
  || isProbablyVideo(payload?.mediaName)
);
const isAudioPayload = (payload = {}) => (
  payload?.mediaKind === 'audio'
  || String(payload?.mediaMime || '').toLowerCase().startsWith('audio/')
  || isProbablyAudio(payload?.mediaUrl)
  || isProbablyAudio(payload?.mediaName)
);
const isBlockedAssetUrl = (value) => {
  const url = String(value || '').trim().toLowerCase();
  return !url || url.startsWith('blob:') || url.startsWith('data:');
};
const SUPPORTED_TRANSITION_TYPES = new Set(['cut', 'fade', 'crossfade', 'slide', 'slideLeft', 'slideRight', 'wipeLeft', 'wipeRight', 'zoom']);
const clipDuration = (clip) => Math.max(0.05, Number(clip?.end || 0) - Number(clip?.start || 0));
const transitionWindow = (transition, leftClip, rightClip) => {
  const durationSec = Math.max(0.05, Math.min(8, Number(transition?.durationSec || 0.35)));
  const halfDurationSec = durationSec / 2;
  const nominal = Number(transition?.nominalSeamSec);
  const seamSec = Number.isFinite(nominal) ? nominal : ((Number(leftClip?.end || 0) + Number(rightClip?.start || 0)) / 2);
  return { durationSec, halfDurationSec, seamSec, startSec: seamSec - halfDurationSec, endSec: seamSec + halfDurationSec };
};
const layerForClip = (project, clip) => (project?.layers || []).find((layer) => layer.id === clip?.layerId) || null;
const isVideoClip = (project, clip) => {
  const layer = layerForClip(project, clip);
  return layer?.type === 'media' && isVideoPayload(layer?.payload);
};
const videoSourceInfo = (project, clip) => {
  const layer = layerForClip(project, clip);
  const layerDuration = Number(layer?.payload?.sourceDurationSec ?? layer?.payload?.mediaDurationSec ?? layer?.payload?.durationSec);
  const sourceDurationSec = Number.isFinite(Number(clip?.sourceDurationSec))
    ? Number(clip.sourceDurationSec)
    : (Number.isFinite(layerDuration) && layerDuration > 0 ? layerDuration : undefined);
  const sourceInSec = Math.max(0, Number.isFinite(Number(clip?.sourceInSec)) ? Number(clip.sourceInSec) : 0);
  const fallbackOut = Number.isFinite(sourceDurationSec) ? Math.min(sourceDurationSec, sourceInSec + clipDuration(clip)) : undefined;
  const sourceOutSec = Number.isFinite(Number(clip?.sourceOutSec)) ? Number(clip.sourceOutSec) : fallbackOut;
  return {
    sourceInSec,
    sourceOutSec,
    sourceDurationSec,
    sourceDurationUnknown: Boolean(clip?.sourceDurationUnknown) || !Number.isFinite(sourceDurationSec),
  };
};
const sourceTimeForClipAt = (project, clip, sec) => {
  const source = videoSourceInfo(project, clip);
  return Math.max(0, Number(source.sourceInSec || 0) + Math.max(0, Number(sec || 0) - Number(clip?.start || 0)));
};
const transitionHandleErrors = (project, transition, leftClip, rightClip) => {
  const errors = [];
  const windowInfo = transitionWindow(transition, leftClip, rightClip);
  const check = (clip, role) => {
    if (!isVideoClip(project, clip)) return;
    const source = videoSourceInfo(project, clip);
    if (source.sourceDurationUnknown) {
      errors.push(`Transition ${transition?.id || 'unknown'} ${role} video source duration is unknown.`);
      return;
    }
    const available = role === 'left'
      ? Math.max(0, Number(source.sourceDurationSec || 0) - Number(source.sourceOutSec || 0))
      : Math.max(0, Number(source.sourceInSec || 0));
    if (available + 0.0001 < windowInfo.halfDurationSec) {
      errors.push(`Transition ${transition?.id || 'unknown'} ${role} video needs ${windowInfo.halfDurationSec.toFixed(2)}s ${role === 'left' ? 'end' : 'start'} handle.`);
    }
  };
  check(leftClip, 'left');
  check(rightClip, 'right');
  return errors;
};

const validateRenderPayload = (payload) => {
  const errors = [];
  const warnings = [];
  const project = payload?.project;
  const compositionMeta = payload?.compositionMeta || {};
  const tracks = Array.isArray(project?.tracks) ? project.tracks : [];
  const layers = Array.isArray(project?.layers) ? project.layers : [];
  const clips = Array.isArray(project?.clips) ? project.clips : [];
  const transitions = Array.isArray(project?.transitions) ? project.transitions : [];
  const layerIds = new Set(layers.map((layer) => layer.id));
  const trackIds = new Set(tracks.map((track) => track.id));
  const outputFormat = String(payload?.outputFormat || payload?.targetFormat || '').trim().toLowerCase();
  const fps = Number(compositionMeta.fps);
  const width = Number(compositionMeta.width);
  const height = Number(compositionMeta.height);
  const durationInFrames = Number(compositionMeta.durationInFrames);
  const durationInSeconds = Number(compositionMeta.durationInSeconds || (durationInFrames > 0 && fps > 0 ? durationInFrames / fps : 0));

  if (payload?.schemaVersion !== RENDER_JOB_SCHEMA_VERSION) errors.push(`schemaVersion must be ${RENDER_JOB_SCHEMA_VERSION}.`);
  if (payload?.kind !== 'remotionRender') errors.push('kind must be remotionRender.');
  if (outputFormat !== 'mp4') errors.push('Phase 1 renderer supports mp4 only.');
  if (!Number.isFinite(fps) || fps <= 0) errors.push('compositionMeta.fps must be > 0.');
  if (!Number.isFinite(width) || width <= 0) errors.push('compositionMeta.width must be > 0.');
  if (!Number.isFinite(height) || height <= 0) errors.push('compositionMeta.height must be > 0.');
  if (!Number.isFinite(durationInFrames) || durationInFrames <= 0) errors.push('compositionMeta.durationInFrames must be > 0.');
  if (!Number.isFinite(durationInSeconds) || durationInSeconds <= 0) errors.push('compositionMeta.durationInSeconds must be > 0.');
  if (!project || typeof project !== 'object') errors.push('project payload is required.');
  if (!tracks.length) warnings.push('timeline has no tracks.');
  if (!layers.length) warnings.push('timeline has no layers.');
  if (!clips.length) warnings.push('timeline has no clips.');
  transitions.forEach((transition) => {
    if (!SUPPORTED_TRANSITION_TYPES.has(String(transition?.type || 'cut'))) {
      errors.push(`Transition ${transition?.id || 'unknown'} type '${transition?.type || 'unknown'}' is not supported by final MP4 render.`);
      return;
    }
    const leftClip = clips.find((clip) => clip.id === transition?.leftClipId);
    const rightClip = clips.find((clip) => clip.id === transition?.rightClipId);
    if (!leftClip || !rightClip) {
      errors.push(`Transition ${transition?.id || 'unknown'} references missing seam clips.`);
      return;
    }
    transitionHandleErrors(project, transition, leftClip, rightClip).forEach((error) => errors.push(error));
  });

  layers.forEach((layer) => {
    if (!SUPPORTED_LAYER_TYPES.has(layer?.type)) {
      errors.push(`Layer ${layer?.id || 'unknown'} uses unsupported type '${layer?.type || 'unknown'}'.`);
    }
    if (!trackIds.has(layer?.trackId)) {
      errors.push(`Layer ${layer?.id || 'unknown'} references missing track '${layer?.trackId || 'unknown'}'.`);
    }
    if (layer?.payload?.overlayKind || layer?.payload?.overlayEffectId) {
      errors.push(`Layer ${layer?.payload?.layerName || layer?.id || 'unknown'} uses overlay FX that the server renderer does not support yet.`);
    }
    if (layer?.type === 'svg-overlay' && !Array.isArray(layer?.payload?.svgOverlayConfig?.svgPaths)) {
      errors.push(`Layer ${layer?.payload?.layerName || layer?.id || 'unknown'} is missing svgOverlayConfig.svgPaths.`);
    }
    if (layer?.type === 'generative-shape') {
      const cfg = layer?.payload?.generativeShapeConfig || {};
      const hasElements = Array.isArray(cfg.elements);
      const hasBlobs = Array.isArray(cfg.blobs);
      if (!hasElements && !hasBlobs) {
        errors.push(`Layer ${layer?.payload?.layerName || layer?.id || 'unknown'} is missing generative shape data.`);
      }
    }
    if ((layer?.type === 'media' || layer?.type === 'audio') && isBlockedAssetUrl(layer?.payload?.mediaUrl)) {
      errors.push(`Layer ${layer?.payload?.layerName || layer?.id || 'unknown'} needs a stable media URL. Blob/data URLs cannot be rendered on the server.`);
    }
  });

  clips.forEach((clip) => {
    const start = Number(clip?.start);
    const end = Number(clip?.end);
    if (!layerIds.has(clip?.layerId)) errors.push(`Clip ${clip?.id || 'unknown'} references missing layer '${clip?.layerId || 'unknown'}'.`);
    if (!trackIds.has(clip?.trackId)) errors.push(`Clip ${clip?.id || 'unknown'} references missing track '${clip?.trackId || 'unknown'}'.`);
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      errors.push(`Clip ${clip?.id || 'unknown'} has invalid timing.`);
      return;
    }
    if (start < 0 || end > durationInSeconds + 0.001) {
      errors.push(`Clip ${clip?.id || 'unknown'} falls outside the composition duration.`);
    }
    if (clip?.entryAnimationId || clip?.exitAnimationId || clip?.introPresetId || clip?.outroPresetId) {
      warnings.push(`Clip ${clip?.id || 'unknown'} contains entry/exit animation metadata that phase 1 currently ignores.`);
    }
  });

  const assetManifest = layers
    .filter((layer) => layer?.type === 'media' || layer?.type === 'audio')
    .map((layer) => ({
      layerId: layer.id,
      layerName: layer?.payload?.layerName || layer.id,
      type: layer.type,
      src: String(layer?.payload?.mediaUrl || '').trim(),
      mediaKind: isVideoPayload(layer?.payload)
        ? 'video'
        : (isAudioPayload(layer?.payload) ? 'audio' : 'still'),
    }));

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    assetManifest,
  };
};
const validateSvgFramePayload = (payload) => {
  const errors = [];
  const warnings = [];
  const project = payload?.project;
  const compositionMeta = payload?.compositionMeta || {};
  const layers = Array.isArray(project?.layers) ? project.layers : [];
  const clips = Array.isArray(project?.clips) ? project.clips : [];
  const transitions = Array.isArray(project?.transitions) ? project.transitions : [];
  const policy = String(payload?.svgRenderPolicy || 'exact-svg');
  const outputFormat = String(payload?.outputFormat || payload?.targetFormat || '').trim().toLowerCase();
  const exactRenderableTypes = new Set(['text', 'shape', 'svg-overlay', 'generative-shape', 'audio']);
  if (payload?.schemaVersion !== SVG_RENDER_JOB_SCHEMA_VERSION) errors.push(`schemaVersion must be ${SVG_RENDER_JOB_SCHEMA_VERSION}.`);
  if (payload?.kind !== 'svgFrameRender') errors.push('kind must be svgFrameRender.');
  if (outputFormat !== 'mp4') errors.push('SVG frame renderer currently outputs mp4 only.');
  if (!project || typeof project !== 'object') errors.push('project payload is required.');
  if (!Number.isFinite(Number(compositionMeta.fps)) || Number(compositionMeta.fps) <= 0) errors.push('compositionMeta.fps must be > 0.');
  if (!Number.isFinite(Number(compositionMeta.width)) || Number(compositionMeta.width) <= 0) errors.push('compositionMeta.width must be > 0.');
  if (!Number.isFinite(Number(compositionMeta.height)) || Number(compositionMeta.height) <= 0) errors.push('compositionMeta.height must be > 0.');
  if (!Number.isFinite(Number(compositionMeta.durationInFrames)) || Number(compositionMeta.durationInFrames) <= 0) errors.push('compositionMeta.durationInFrames must be > 0.');
  if (transitions.length) errors.push('Transitions are not exact-SVG render-safe yet.');
  layers.forEach((layer) => {
    const name = layer?.payload?.layerName || layer?.id || 'unknown';
    const mediaUrl = String(layer?.payload?.mediaUrl || '').trim();
    if (policy === 'exact-svg' && !exactRenderableTypes.has(layer?.type)) {
      errors.push(`${name}: layer type '${layer?.type || 'unknown'}' requires raster fallback.`);
    } else if (policy !== 'exact-svg' && !exactRenderableTypes.has(layer?.type)) {
      warnings.push(`${name}: layer type '${layer?.type || 'unknown'}' will fall back to Remotion MP4.`);
    }
    if (layer?.payload?.overlayKind || layer?.payload?.overlayEffectId) {
      if (policy === 'exact-svg') errors.push(`${name}: generated overlay FX is not supported in exact SVG mode.`);
      else warnings.push(`${name}: generated overlay FX will fall back to Remotion MP4.`);
    }
    if ((layer?.type === 'audio' || layer?.type === 'media') && isBlockedAssetUrl(mediaUrl)) {
      errors.push(`${name}: needs a stable media URL after asset staging.`);
    }
  });
  if (!clips.length) warnings.push('timeline has no clips.');
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
};

const buildQueueStatus = async () => {
  const db = await readJobsDb();
  const jobs = Object.values(db.records || {});
  return {
    activeJobId,
    totalJobs: jobs.length,
    queuedJobs: jobs.filter((job) => job?.status === 'queued').length,
    renderingJobs: jobs.filter((job) => job?.status === 'rendering').length,
    completedJobs: jobs.filter((job) => job?.status === 'succeeded').length,
    failedJobs: jobs.filter((job) => job?.status === 'failed').length,
  };
};

const checkWritableDir = async (dirPath, label) => {
  const testPath = path.join(dirPath, `.readiness-${crypto.randomUUID()}.tmp`);
  try {
    await fs.mkdir(dirPath, { recursive: true });
    await fs.writeFile(testPath, 'ok', 'utf8');
    await fs.rm(testPath, { force: true });
    return { label, path: dirPath, writable: true };
  } catch (error) {
    return {
      label,
      path: dirPath,
      writable: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

const buildRendererReadiness = async () => {
  const checks = [];
  const blocked = [];
  let rendererInstalled = false;
  let svgFramesInstalled = false;

  try {
    await ensureStore();
    checks.push({ id: 'store', ok: true });
  } catch (error) {
    checks.push({ id: 'store', ok: false, error: error instanceof Error ? error.message : String(error) });
    blocked.push('store');
  }

  try {
    await ensureRendererInstalled();
    rendererInstalled = true;
    checks.push({ id: 'remotion', ok: true, path: REMOTION_BIN });
  } catch (error) {
    checks.push({ id: 'remotion', ok: false, path: REMOTION_BIN, error: error instanceof Error ? error.message : String(error) });
    blocked.push('remotion');
  }

  try {
    await ensureFfmpegInstalled();
    svgFramesInstalled = true;
    checks.push({ id: 'ffmpeg', ok: true, path: FFMPEG_BIN });
  } catch (error) {
    checks.push({ id: 'ffmpeg', ok: false, path: FFMPEG_BIN, error: error instanceof Error ? error.message : String(error) });
    blocked.push('ffmpeg');
  }

  const storageChecks = await Promise.all([
    checkWritableDir(JOB_PAYLOAD_DIR, 'payloads'),
    checkWritableDir(OUTPUT_DIR, 'output'),
    checkWritableDir(RENDER_ASSET_DIR, 'render-assets'),
    checkWritableDir(SVG_FRAME_UPLOAD_DIR, 'svg-frame-uploads'),
  ]);
  storageChecks.forEach((check) => {
    checks.push({ id: `storage:${check.label}`, ok: check.writable, path: check.path, error: check.error || '' });
    if (!check.writable) blocked.push(`storage:${check.label}`);
  });

  const queue = await buildQueueStatus();
  const storageReady = storageChecks.every((check) => check.writable);
  const ready = rendererInstalled && svgFramesInstalled && storageReady;
  const degraded = rendererInstalled && storageReady && !ready;
  return {
    online: true,
    ready,
    status: ready ? 'ready' : degraded ? 'degraded' : 'unavailable',
    checks,
    blocked,
    queue,
    storage: {
      strategy: 'local-worker-disk',
      persistent: false,
      writable: storageReady,
      dataDir: DATA_DIR,
      outputDir: OUTPUT_DIR,
      renderAssetDir: RENDER_ASSET_DIR,
    },
    renderer: {
      installed: rendererInstalled,
      compositionId: 'VTE1Renderer',
      svgFramesInstalled,
      remotionBin: REMOTION_BIN,
      ffmpegBin: FFMPEG_BIN,
    },
  };
};

const renderCapabilities = (readiness = {}) => ({
  service: 'vt-e1-render-server',
  online: readiness.online !== false,
  ready: Boolean(readiness.ready),
  status: readiness.status || 'unavailable',
  primaryFormat: 'mp4',
  supportedFormats: ['mp4'],
  previewFormats: ['webm', 'mov'],
  executor: 'remotion-hosted-worker',
  renderModes: ['remotion-mp4', 'svg-frames-mp4'],
  svgRenderPolicies: ['exact-svg', 'hybrid-raster', 'best-effort'],
  assetStrategy: 'stage-local-assets-before-render',
  supports: {
    layerTypes: [...SUPPORTED_LAYER_TYPES],
    remoteUrls: true,
    stagedLocalAssets: true,
    svgFrameZipImport: true,
  },
  blocked: {
    transitions: true,
    overlayFx: true,
    blobDataUrls: true,
    outputFormats: ['mov', 'gif', 'png-sequence', 'wav'],
    readiness: Array.isArray(readiness.blocked) ? readiness.blocked : [],
  },
  queue: readiness.queue || { activeJobId: null, totalJobs: 0, queuedJobs: 0, renderingJobs: 0, completedJobs: 0, failedJobs: 0 },
  storage: readiness.storage || { strategy: 'local-worker-disk', persistent: false, writable: false },
  maxDurationSec: 600,
  maxResolution: { width: 3840, height: 3840 },
});

const ensureRendererInstalled = async () => {
  try {
    await fs.access(REMOTION_BIN);
  } catch {
    throw new Error("Remotion dependencies are missing. Run 'cd src/remotion-editor && npm install'.");
  }
};
const ensureFfmpegInstalled = async () => {
  try {
    await fs.access(FFMPEG_BIN);
  } catch {
    throw new Error(`FFmpeg is missing at ${FFMPEG_BIN}.`);
  }
};

const createJobRecord = ({ payload, validation }) => {
  const jobId = `rjob_${crypto.randomUUID().replace(/-/g, '').slice(0, 24)}`;
  const createdAt = nowIso();
  return {
    jobId,
    projectId: String(payload?.projectId || payload?.project?.meta?.projectId || 'local-project'),
    compositionId: String(payload?.compositionId || 'VTE1Renderer'),
    schemaVersion: String(payload?.schemaVersion || RENDER_JOB_SCHEMA_VERSION),
    sourceEditor: String(payload?.sourceEditor || 'VT_E1'),
    kind: String(payload?.kind || 'remotionRender'),
    renderMode: String(payload?.renderMode || 'remotion-mp4'),
    status: 'queued',
    outputFormat: 'mp4',
    createdAt,
    updatedAt: createdAt,
    startedAt: null,
    completedAt: null,
    progress: 0,
    failureReason: null,
    warnings: validation.warnings,
    diagnostics: {
      validationWarnings: validation.warnings,
      previewParity: payload?.previewParity || null,
      assetManifest: validation.assetManifest,
    },
    downloadUrl: null,
    outputPath: null,
    payload,
  };
};

const updateJob = async (jobId, updater) => {
  const db = await readJobsDb();
  const current = db.records?.[jobId];
  if (!current) return null;
  const next = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
  next.updatedAt = nowIso();
  db.records[jobId] = next;
  await writeJobsDb(db);
  return next;
};

const runRemotionRender = async (job) => {
  await ensureRendererInstalled();
  const payloadPath = path.join(JOB_PAYLOAD_DIR, `${job.jobId}.json`);
  const outputPath = path.join(OUTPUT_DIR, `${job.jobId}.mp4`);
  await fs.writeFile(payloadPath, JSON.stringify(job.payload, null, 2), 'utf8');

  const args = [
    'render',
    job.compositionId,
    outputPath,
    '--gl=angle',
    '--props',
    JSON.stringify({ renderJob: job.payload }),
  ];

  await new Promise((resolve, reject) => {
    const child = spawn(REMOTION_BIN, args, {
      cwd: REMOTION_APP_DIR,
      env: { ...process.env, FORCE_COLOR: '0' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString('utf8');
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString('utf8');
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) return resolve({ stdout, stderr, outputPath });
      return reject(new Error((stderr || stdout || `Remotion exited with code ${code}.`).trim()));
    });
  });

  return outputPath;
};
const runCommand = async (command, args, options = {}) => {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd || ROOT,
      env: { ...process.env, ...(options.env || {}) },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString('utf8');
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString('utf8');
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) return resolve({ stdout, stderr });
      return reject(new Error((stderr || stdout || `${command} exited with code ${code}.`).trim()));
    });
  });
};
const sortTracks = (project) => [...(project?.tracks || [])].sort((a, b) => Number(a?.order || 0) - Number(b?.order || 0));
const valueFromKeyframes = (base, keyframes, prop, localT) => {
  const list = (keyframes || [])
    .filter((kf) => kf.values && Object.prototype.hasOwnProperty.call(kf.values, prop))
    .sort((a, b) => a.offsetSec - b.offsetSec);
  if (!list.length) return base;
  if (localT <= list[0].offsetSec) return list[0].values[prop];
  if (localT >= list[list.length - 1].offsetSec) return list[list.length - 1].values[prop];
  let left = list[0];
  let right = list[list.length - 1];
  for (let i = 0; i < list.length - 1; i += 1) {
    if (localT >= list[i].offsetSec && localT <= list[i + 1].offsetSec) {
      left = list[i];
      right = list[i + 1];
      break;
    }
  }
  const lv = left.values[prop];
  const rv = right.values[prop];
  const span = right.offsetSec - left.offsetSec || 1;
  const t = clamp((localT - left.offsetSec) / span, 0, 1);
  return typeof lv === 'number' && typeof rv === 'number'
    ? Number(lv) + (Number(rv) - Number(lv)) * t
    : (t < 1 ? lv : rv);
};
const evaluateLayerPayloadAt = (layer, clip, sec) => {
  const payload = JSON.parse(JSON.stringify(layer?.payload || {}));
  const localT = clamp(Number(sec) - Number(clip?.start || 0), 0, Math.max(0.001, Number(clip?.end || 0) - Number(clip?.start || 0)));
  ['x', 'y', 'scale', 'rotation', 'opacity', 'width', 'height', 'fontSize', 'strokeWidth', 'blur', 'saturation', 'brightness', 'hue'].forEach((prop) => {
    payload[prop] = valueFromKeyframes(payload[prop], clip?.keyframes || [], prop, localT);
  });
  return payload;
};
const escapeXml = (value) => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');
const polygonPoints = (sides = 5, radius = 50) => {
  const safeSides = Math.max(3, Math.round(Number(sides || 5)));
  const pts = [];
  for (let index = 0; index < safeSides; index += 1) {
    const angle = (-Math.PI / 2) + (index * ((Math.PI * 2) / safeSides));
    pts.push(`${Math.cos(angle) * radius},${Math.sin(angle) * radius}`);
  }
  return pts.join(' ');
};
const buildResolvedSvgScene = (project, sec, compositionMeta) => {
  const trackOrderMap = Object.fromEntries(sortTracks(project).map((track, index) => [track.id, index]));
  return (project?.layers || [])
    .filter((layer) => layer?.visible !== false && layer?.type !== 'audio')
    .flatMap((layer) => {
      const clips = (project?.clips || []).filter((clip) => clip.layerId === layer.id && sec >= Number(clip.start || 0) && sec <= Number(clip.end || 0));
      return clips.map((clip) => {
        const payload = evaluateLayerPayloadAt(layer, clip, sec);
        return {
          layer,
          clip,
          payload,
          order: trackOrderMap[layer.trackId] ?? 999,
          centerX: (compositionMeta.width / 2) + Number(payload.x || 0),
          centerY: (compositionMeta.height / 2) + Number(payload.y || 0),
        };
      });
    })
    .sort((a, b) => b.order - a.order);
};
const sceneEntryToSvg = (entry) => {
  const payload = entry.payload || {};
  const transform = `translate(${entry.centerX} ${entry.centerY}) rotate(${Number(payload.rotation || 0)}) scale(${Number(payload.scale || 1)})`;
  const opacity = clamp(Number(payload.opacity ?? 1), 0, 1);
  if (entry.layer.type === 'text') {
    const sw = Math.max(0, Number(payload.strokeWidth ?? 0));
    const stroke = sw > 0 ? `stroke="${escapeXml(payload.strokeColor || '#111')}" stroke-width="${sw * 2}" paint-order="stroke fill"` : '';
    return `<g transform="${transform}" opacity="${opacity}"><text x="0" y="0" text-anchor="middle" dominant-baseline="middle" font-size="${Number(payload.fontSize || 40)}" font-family="${escapeXml(payload.fontFamily || 'Outfit')}" font-weight="900" fill="${escapeXml(payload.fillColor || '#fff')}" ${stroke}>${escapeXml(payload.text || '')}</text></g>`;
  }
  if (entry.layer.type === 'shape') {
    const width = Number(payload.width || 200);
    const height = Number(payload.height || 120);
    const fill = escapeXml(payload.fillColor || '#ffffff');
    const strokeWidth = Number(payload.strokeWidth || 0);
    const stroke = strokeWidth > 0 ? escapeXml(payload.strokeColor || '#111111') : 'none';
    if (payload.shape === 'circle') {
      const radius = Math.max(4, Math.min(width, height) / 2);
      return `<g transform="${transform}" opacity="${opacity}"><circle cx="0" cy="0" r="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" /></g>`;
    }
    if (payload.shape === 'polygon') {
      const points = polygonPoints(payload.polygonSides || 5, Math.min(width, height) / 2);
      return `<g transform="${transform}" opacity="${opacity}"><polygon points="${points}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" /></g>`;
    }
    return `<g transform="${transform}" opacity="${opacity}"><rect x="${-width / 2}" y="${-height / 2}" width="${width}" height="${height}" rx="${Number(payload.cornerRadius || 0)}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" /></g>`;
  }
  if (entry.layer.type === 'svg-overlay') {
    const cfg = payload.svgOverlayConfig || {};
    const paths = Array.isArray(cfg.svgPaths) ? cfg.svgPaths : [];
    const nodes = paths.map((d) => `<path d="${escapeXml(d)}" fill="none" stroke="${escapeXml(cfg.strokeColor || '#39FF14')}" stroke-width="3" stroke-linecap="round" />`).join('');
    return `<g transform="${transform}" opacity="${opacity}"><svg x="-100" y="-100" width="200" height="200" viewBox="0 0 200 200">${nodes}</svg></g>`;
  }
  if (entry.layer.type === 'generative-shape') {
    const cfg = payload.generativeShapeConfig || {};
    const colors = Array.isArray(cfg.colors) && cfg.colors.length ? cfg.colors : ['#FF0055', '#00FFCC', '#FFCC00'];
    const elements = Array.isArray(cfg.elements) ? cfg.elements : [];
    const nodes = elements.map((element, idx) => {
      if (element.type === 'circle') {
        return `<circle cx="${Number(element.attrs?.cx || 100)}" cy="${Number(element.attrs?.cy || 100)}" r="${Number(element.attrs?.r || 40)}" fill="${escapeXml(colors[idx % colors.length])}" />`;
      }
      return `<rect x="${Number(element.attrs?.x || 60)}" y="${Number(element.attrs?.y || 60)}" width="${Number(element.attrs?.width || 80)}" height="${Number(element.attrs?.height || 80)}" rx="${Number(element.attrs?.rx || 8)}" fill="${escapeXml(colors[idx % colors.length])}" />`;
    }).join('');
    return `<g transform="${transform}" opacity="${opacity}"><svg x="-100" y="-100" width="200" height="200" viewBox="0 0 200 200">${nodes}</svg></g>`;
  }
  return '';
};
const renderSceneToSvg = (project, sec, compositionMeta) => {
  const layers = buildResolvedSvgScene(project, sec, compositionMeta);
  const nodes = layers.map((entry) => sceneEntryToSvg(entry)).filter(Boolean).join('\n  ');
  const background = project?.meta?.chromaEnabled ? project.meta.chromaColor : '#111111';
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${compositionMeta.width}" height="${compositionMeta.height}" viewBox="0 0 ${compositionMeta.width} ${compositionMeta.height}">\n  <rect width="100%" height="100%" fill="${escapeXml(background)}" />\n  ${nodes}\n</svg>`;
};
const resolveLocalAssetPath = (value = '') => {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (raw.startsWith('/api/vt-e1/render/assets/')) {
    return path.join(RENDER_ASSET_DIR, sanitizeFileName(raw.split('/').pop() || ''));
  }
  try {
    const parsed = new URL(raw);
    if ((parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') && parsed.pathname.startsWith('/api/vt-e1/render/assets/')) {
      return path.join(RENDER_ASSET_DIR, sanitizeFileName(parsed.pathname.split('/').pop() || ''));
    }
  } catch {}
  return raw;
};
const buildAudioFilterGraph = (inputs = []) => {
  const activeInputs = inputs.filter((entry) => entry && entry.src);
  if (!activeInputs.length) return null;
  const filterParts = [];
  const mixRefs = [];
  activeInputs.forEach((entry, index) => {
    const delayMs = Math.max(0, Math.round(Number(entry.delaySec || 0) * 1000));
    const volume = clamp(Number(entry.volume ?? 1), 0, 2);
    const sourceInSec = Math.max(0, Number(entry.sourceInSec || 0));
    const durationSec = Math.max(0.01, Number(entry.durationSec || 0));
    filterParts.push(`[${index + 1}:a]atrim=start=${sourceInSec}:duration=${durationSec},asetpts=PTS-STARTPTS,adelay=${delayMs}|${delayMs},volume=${volume}[a${index}]`);
    mixRefs.push(`[a${index}]`);
  });
  filterParts.push(`${mixRefs.join('')}amix=inputs=${mixRefs.length}:normalize=0[aout]`);
  return filterParts.join(';');
};
const getSvgZipFrameEntries = (zip) => Object.values(zip.files || {})
  .filter((entry) => !entry.dir && /\.svg$/i.test(entry.name || ''))
  .sort((a, b) => {
    const aNum = Number((path.basename(a.name).match(/(\d+)/) || [])[1] || 0);
    const bNum = Number((path.basename(b.name).match(/(\d+)/) || [])[1] || 0);
    if (aNum !== bNum) return aNum - bNum;
    return String(a.name).localeCompare(String(b.name));
  });
const readSvgZipManifest = async (zip) => {
  const manifestEntry = Object.values(zip.files || {}).find((entry) => !entry.dir && /manifest\.json$/i.test(entry.name || ''));
  if (!manifestEntry) return null;
  try {
    return JSON.parse(await manifestEntry.async('string'));
  } catch {
    return null;
  }
};
const inferSvgDimensions = (svg = '') => {
  const width = Number((String(svg).match(/\bwidth=["']?([0-9.]+)/i) || [])[1] || 0);
  const height = Number((String(svg).match(/\bheight=["']?([0-9.]+)/i) || [])[1] || 0);
  const viewBox = (String(svg).match(/\bviewBox=["']\s*[-0-9.]+\s+[-0-9.]+\s+([0-9.]+)\s+([0-9.]+)\s*["']/i) || []);
  return {
    width: width || Number(viewBox[1] || 0),
    height: height || Number(viewBox[2] || 0),
  };
};
const inspectSvgFrameZip = async (buffer) => {
  const zip = await JSZip.loadAsync(buffer);
  const frameEntries = getSvgZipFrameEntries(zip);
  if (!frameEntries.length) {
    return { valid: false, errors: ['SVG ZIP contains no .svg frames.'], warnings: [] };
  }
  const manifest = await readSvgZipManifest(zip);
  const firstSvg = await frameEntries[0].async('string');
  const inferred = inferSvgDimensions(firstSvg);
  const fps = Math.max(1, Math.round(Number(manifest?.fps || 30)));
  const width = Math.round(Number(manifest?.width || inferred.width || 0));
  const height = Math.round(Number(manifest?.height || inferred.height || 0));
  const frameCount = frameEntries.length;
  const errors = [];
  const warnings = [];
  if (!width || !height) errors.push('Could not infer SVG frame width/height from manifest or first SVG.');
  if (manifest?.frameCount && Number(manifest.frameCount) !== frameCount) {
    warnings.push(`Manifest frameCount ${manifest.frameCount} differs from ${frameCount} SVG files; using actual SVG count.`);
  }
  if (frameCount > 3600) errors.push('SVG ZIP exceeds the 3600-frame server conversion limit.');
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    manifest,
    frameCount,
    fps,
    width,
    height,
  };
};
const rasterizeSvgFramesToPng = async ({ svgDir, pngDir, width, height, frameCount }) => {
  await fs.mkdir(pngDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({
      viewport: { width, height },
      deviceScaleFactor: 1,
    });
    for (let index = 1; index <= frameCount; index += 1) {
      const svgPath = path.join(svgDir, `frame_${String(index).padStart(6, '0')}.svg`);
      const pngPath = path.join(pngDir, `frame_${String(index).padStart(6, '0')}.png`);
      const svg = await fs.readFile(svgPath, 'utf8');
      const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
      await page.setContent(`<!doctype html><html><head><style>html,body{margin:0;width:${width}px;height:${height}px;overflow:hidden;background:#000}img{display:block;width:${width}px;height:${height}px}</style></head><body><img src="${dataUrl}" /></body></html>`);
      await page.screenshot({ path: pngPath, type: 'png', clip: { x: 0, y: 0, width, height } });
    }
  } finally {
    await browser.close();
  }
};
const runSvgFrameZipRender = async (job) => {
  await ensureFfmpegInstalled();
  const zipPath = String(job.payload?.zipPath || '');
  if (!zipPath) throw new Error('SVG frame ZIP payload is missing zipPath.');
  const buffer = await fs.readFile(zipPath);
  const zip = await JSZip.loadAsync(buffer);
  const frameEntries = getSvgZipFrameEntries(zip);
  if (!frameEntries.length) throw new Error('SVG ZIP contains no .svg frames.');
  const frameRoot = path.join(SVG_FRAME_DIR, job.jobId);
  const framesDir = path.join(frameRoot, 'frames');
  await fs.mkdir(framesDir, { recursive: true });
  for (let index = 0; index < frameEntries.length; index += 1) {
    const svg = await frameEntries[index].async('nodebuffer');
    await fs.writeFile(path.join(framesDir, `frame_${String(index + 1).padStart(6, '0')}.svg`), svg);
  }
  const fps = Math.max(1, Math.round(Number(job.payload?.compositionMeta?.fps || job.payload?.fps || 30)));
  const width = Math.max(2, Math.round(Number(job.payload?.compositionMeta?.width || 1920)));
  const height = Math.max(2, Math.round(Number(job.payload?.compositionMeta?.height || 1080)));
  const pngDir = path.join(frameRoot, 'png-frames');
  await rasterizeSvgFramesToPng({ svgDir: framesDir, pngDir, width, height, frameCount: frameEntries.length });
  const outputPath = path.join(OUTPUT_DIR, `${job.jobId}.mp4`);
  await runCommand(FFMPEG_BIN, [
    '-y',
    '-framerate', String(fps),
    '-i', path.join(pngDir, 'frame_%06d.png'),
    '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
    '-pix_fmt', 'yuv420p',
    '-c:v', 'libx264',
    '-movflags', '+faststart',
    outputPath,
  ]);
  return outputPath;
};
const runSvgFrameRender = async (job) => {
  await ensureFfmpegInstalled();
  const project = job.payload?.project || {};
  const compositionMeta = job.payload?.compositionMeta || {};
  const policy = String(job.payload?.svgRenderPolicy || 'exact-svg');
  const exactRenderableTypes = new Set(['text', 'shape', 'svg-overlay', 'generative-shape', 'audio']);
  const hasUnsupported = (project.layers || []).some((layer) => !exactRenderableTypes.has(layer?.type) || layer?.payload?.overlayKind || layer?.payload?.overlayEffectId);
  if (policy !== 'exact-svg' && hasUnsupported) {
    const remotionPayload = {
      ...job.payload,
      kind: 'remotionRender',
      schemaVersion: RENDER_JOB_SCHEMA_VERSION,
      renderMode: 'remotion-mp4',
    };
    return await runRemotionRender({ ...job, compositionId: 'VTE1Renderer', payload: remotionPayload });
  }
  const frameRoot = path.join(SVG_FRAME_DIR, job.jobId);
  const framesDir = path.join(frameRoot, 'frames');
  await fs.mkdir(framesDir, { recursive: true });
  const fps = Number(compositionMeta.fps || 30);
  const durationInFrames = Number(compositionMeta.durationInFrames || 1);
  for (let frame = 0; frame < durationInFrames; frame += 1) {
    const sec = frame / fps;
    const svg = renderSceneToSvg(project, sec, compositionMeta);
    const filePath = path.join(framesDir, `frame_${String(frame + 1).padStart(6, '0')}.svg`);
    await fs.writeFile(filePath, svg, 'utf8');
  }
  const pngDir = path.join(frameRoot, 'png-frames');
  await rasterizeSvgFramesToPng({
    svgDir: framesDir,
    pngDir,
    width: Math.max(2, Math.round(Number(compositionMeta.width || 1920))),
    height: Math.max(2, Math.round(Number(compositionMeta.height || 1080))),
    frameCount: durationInFrames,
  });
  const silentOutputPath = path.join(frameRoot, `${job.jobId}.silent.mp4`);
  await runCommand(FFMPEG_BIN, [
    '-y',
    '-framerate', String(fps),
    '-i', path.join(pngDir, 'frame_%06d.png'),
    '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
    '-pix_fmt', 'yuv420p',
    '-c:v', 'libx264',
    '-movflags', '+faststart',
    silentOutputPath,
  ]);
  const tracks = Array.isArray(project.tracks) ? project.tracks : [];
  const soloTrackIds = tracks.filter((track) => track?.solo).map((track) => track.id);
  const activeTrackIds = tracks.length
    ? new Set(
      (soloTrackIds.length
        ? tracks.filter((track) => soloTrackIds.includes(track.id))
        : tracks.filter((track) => !track?.muted))
        .filter((track) => track?.visible !== false)
        .map((track) => track.id),
    )
    : null;
  const clipsByLayer = new Map();
  (project.clips || []).forEach((clip) => {
    if (!clipsByLayer.has(clip.layerId)) clipsByLayer.set(clip.layerId, []);
    clipsByLayer.get(clip.layerId).push(clip);
  });
  const audioInputs = (project.layers || [])
    .filter((layer) => {
      const payload = layer?.payload || {};
      if (!String(payload.mediaUrl || '').trim()) return false;
      if (layer?.visible === false || payload.muted) return false;
      if (activeTrackIds && !activeTrackIds.has(layer?.trackId)) return false;
      return layer?.type === 'audio' || (layer?.type === 'media' && isVideoPayload(payload) && payload.audioEnabled !== false);
    })
    .flatMap((layer) => {
      const payload = layer?.payload || {};
      return (clipsByLayer.get(layer.id) || []).map((clip) => ({
        src: resolveLocalAssetPath(payload.mediaUrl),
        delaySec: Number(clip.start || 0),
        sourceInSec: sourceTimeForClipAt(project, clip, Number(clip.start || 0)),
        durationSec: clipDuration(clip),
        volume: Number(payload.volume ?? (layer?.type === 'audio' ? 0.6 : 1)),
      }));
    })
    .filter((entry) => entry.durationSec > 0);
  if (!audioInputs.length) return silentOutputPath;
  const outputPath = path.join(OUTPUT_DIR, `${job.jobId}.mp4`);
  const args = ['-y', '-i', silentOutputPath];
  audioInputs.forEach((entry) => {
    args.push('-i', entry.src);
  });
  const filterGraph = buildAudioFilterGraph(audioInputs);
  args.push('-filter_complex', filterGraph, '-map', '0:v:0', '-map', '[aout]', '-c:v', 'copy', '-c:a', 'aac', '-shortest', outputPath);
  await runCommand(FFMPEG_BIN, args);
  return outputPath;
};

const processQueue = async () => {
  if (activeJobId) return;
  const db = await readJobsDb();
  const next = Object.values(db.records || {})
    .filter((job) => job.status === 'queued')
    .sort((a, b) => Date.parse(a.createdAt || 0) - Date.parse(b.createdAt || 0))[0];
  if (!next) return;

  activeJobId = next.jobId;
  try {
    await updateJob(next.jobId, (job) => ({
      ...job,
      status: 'rendering',
      startedAt: job.startedAt || nowIso(),
      progress: 0.2,
      failureReason: null,
    }));
    const outputPath = next.kind === 'svgFrameZipRender'
      ? await runSvgFrameZipRender(next)
      : next.kind === 'svgFrameRender'
        ? await runSvgFrameRender(next)
        : await runRemotionRender(next);
    await updateJob(next.jobId, (job) => ({
      ...job,
      status: 'succeeded',
      completedAt: nowIso(),
      progress: 1,
      outputPath,
      downloadUrl: next.kind === 'svgFrameRender' || next.kind === 'svgFrameZipRender'
        ? `/api/vt-e1/render-svg-frames/${job.jobId}/download`
        : `/api/vt-e1/render/${job.jobId}/download`,
    }));
  } catch (error) {
    await updateJob(next.jobId, (job) => ({
      ...job,
      status: 'failed',
      completedAt: nowIso(),
      progress: 1,
      failureReason: error instanceof Error ? error.message : String(error),
    }));
  } finally {
    activeJobId = null;
    setImmediate(() => {
      processQueue().catch((error) => {
        console.error('[vt-e1-render] queue failure', error);
      });
    });
  }
};

const handleCreateJob = async (req, res) => {
  const payload = await parseJsonBody(req, res);
  if (!payload) return;
  const validation = validateRenderPayload(payload);
  if (!validation.valid) {
    return sendJson(res, 400, { error: 'RENDER_VALIDATION_FAILED', validation });
  }
  const db = await readJobsDb();
  const job = createJobRecord({ payload, validation });
  db.records[job.jobId] = job;
  await writeJobsDb(db);
  void processQueue();
  return sendJson(res, 200, { job: sanitizeJob(job), validation });
};
const handleCreateSvgFrameJob = async (req, res) => {
  const payload = await parseJsonBody(req, res);
  if (!payload) return;
  const validation = validateSvgFramePayload(payload);
  if (!validation.valid) {
    return sendJson(res, 400, { error: 'SVG_RENDER_VALIDATION_FAILED', validation });
  }
  const db = await readJobsDb();
  const job = createJobRecord({ payload, validation });
  db.records[job.jobId] = job;
  await writeJobsDb(db);
  void processQueue();
  return sendJson(res, 200, { job: sanitizeJob(job), validation });
};
const handleCreateSvgFrameZipJob = async (req, res) => {
  await ensureStore();
  const buffer = await readBody(req);
  if (!buffer?.length) {
    return sendJson(res, 400, { error: 'SVG_ZIP_REQUIRED', validation: { valid: false, errors: ['Upload a VT_E1 SVG frame ZIP.'], warnings: [] } });
  }
  let inspection;
  try {
    inspection = await inspectSvgFrameZip(buffer);
  } catch (error) {
    return sendJson(res, 400, {
      error: 'SVG_ZIP_INVALID',
      validation: { valid: false, errors: [error instanceof Error ? error.message : String(error)], warnings: [] },
    });
  }
  if (!inspection.valid) {
    return sendJson(res, 400, { error: 'SVG_ZIP_VALIDATION_FAILED', validation: inspection });
  }
  const validation = {
    valid: true,
    errors: [],
    warnings: inspection.warnings || [],
  };
  const payload = {
    kind: 'svgFrameZipRender',
    schemaVersion: SVG_ZIP_RENDER_JOB_SCHEMA_VERSION,
    sourceEditor: 'VT_E1',
    renderMode: 'svg-zip-mp4',
    outputFormat: 'mp4',
    targetFormat: 'mp4',
    projectId: inspection.manifest?.projectName || 'svg-frame-sequence',
    compositionId: 'SvgFrameZipSequence',
    compositionMeta: {
      fps: inspection.fps,
      width: inspection.width,
      height: inspection.height,
      durationInFrames: inspection.frameCount,
      durationInSeconds: inspection.frameCount / inspection.fps,
      aspectRatio: inspection.width >= inspection.height ? '16:9' : '9:16',
    },
    frameCount: inspection.frameCount,
    manifest: inspection.manifest || null,
  };
  const db = await readJobsDb();
  const job = createJobRecord({ payload, validation });
  const zipPath = path.join(SVG_FRAME_UPLOAD_DIR, `${job.jobId}.zip`);
  await fs.writeFile(zipPath, buffer);
  job.payload = { ...job.payload, zipPath };
  db.records[job.jobId] = job;
  await writeJobsDb(db);
  void processQueue();
  return sendJson(res, 200, { job: sanitizeJob(job), validation });
};

const handleGetCapabilities = async (req, res) => {
  try {
    const readiness = await buildRendererReadiness();
    const capabilities = renderCapabilities(readiness);
    return sendJson(res, 200, {
      ok: true,
      online: true,
      ready: readiness.ready,
      status: readiness.status,
      origin: inferRequestOrigin(req),
      capabilities,
      renderer: readiness.renderer,
      queue: readiness.queue,
      storage: readiness.storage,
      checks: readiness.checks,
    });
  } catch (error) {
    const readiness = {
      online: true,
      ready: false,
      status: 'unavailable',
      blocked: ['readiness-check'],
      renderer: {
        installed: false,
        compositionId: 'VTE1Renderer',
        svgFramesInstalled: false,
        error: error instanceof Error ? error.message : String(error),
      },
    };
    return sendJson(res, 503, {
      ok: false,
      online: true,
      ready: false,
      status: 'unavailable',
      origin: inferRequestOrigin(req),
      capabilities: renderCapabilities(readiness),
      renderer: readiness.renderer,
    });
  }
};

const handleGetHealth = async (req, res) => {
  return sendJson(res, 200, {
    ok: true,
    status: 'live',
    service: 'vt-e1-render-server',
    origin: inferRequestOrigin(req),
    timestamp: nowIso(),
    activeJobId,
  });
};

const handleCreateRenderAsset = async (req, res) => {
  const mimeType = String(req.headers['x-vt-mime-type'] || req.headers['content-type'] || 'application/octet-stream').trim();
  const fileNameHeader = sanitizeFileName(req.headers['x-vt-file-name'], `asset${extensionForMime(mimeType)}`);
  const body = await readBody(req);
  if (!body.length) {
    return sendJson(res, 400, { error: 'RENDER_ASSET_BODY_REQUIRED', message: 'Asset upload body is empty.' });
  }
  const extension = path.extname(fileNameHeader) || extensionForMime(mimeType);
  const outputName = sanitizeFileName(`${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}_${fileNameHeader.replace(/\.[^/.]+$/, '')}${extension}`);
  const outputPath = path.join(RENDER_ASSET_DIR, outputName);
  await fs.writeFile(outputPath, body);
  const origin = inferRequestOrigin(req);
  return sendJson(res, 200, {
    ok: true,
    asset: {
      fileName: outputName,
      originalFileName: fileNameHeader,
      mimeType,
      bytes: body.length,
      assetUrl: `${origin}/api/vt-e1/render/assets/${encodeURIComponent(outputName)}`,
    },
  });
};

const handleGetJob = async (res, jobId) => {
  const db = await readJobsDb();
  const job = db.records?.[jobId];
  if (!job) return sendJson(res, 404, { error: 'RENDER_JOB_NOT_FOUND' });
  return sendJson(res, 200, { job: sanitizeJob(job) });
};

const handleDownloadJob = async (res, jobId) => {
  const db = await readJobsDb();
  const job = db.records?.[jobId];
  if (!job) return sendJson(res, 404, { error: 'RENDER_JOB_NOT_FOUND' });
  if (job.status !== 'succeeded' || !job.outputPath) {
    return sendJson(res, 409, { error: 'RENDER_NOT_READY', status: job.status });
  }
  try {
    await fs.access(job.outputPath);
  } catch {
    return sendJson(res, 404, { error: 'RENDER_OUTPUT_MISSING' });
  }
  res.writeHead(200, {
    'Content-Type': 'video/mp4',
    'Content-Disposition': `attachment; filename="${job.jobId}.mp4"`,
    'Access-Control-Allow-Origin': ORIGIN,
  });
  return createReadStream(job.outputPath).pipe(res);
};

const handleGetRenderAsset = async (res, fileName) => {
  const safeName = sanitizeFileName(fileName, '');
  if (!safeName) return sendJson(res, 400, { error: 'RENDER_ASSET_NAME_REQUIRED' });
  const filePath = path.join(RENDER_ASSET_DIR, safeName);
  try {
    await fs.access(filePath);
  } catch {
    return sendJson(res, 404, { error: 'RENDER_ASSET_NOT_FOUND' });
  }
  res.writeHead(200, {
    'Content-Type': guessMimeFromExt(filePath),
    'Access-Control-Allow-Origin': ORIGIN,
  });
  return createReadStream(filePath).pipe(res);
};

const handleAiChat = async (req, res) => {
  const body = await parseJsonBody(req, res);
  if (!body) return;
  const apiKey = getGeminiApiKey(body);
  const model = String(body.model || 'gemini-2.5-flash');
  const userPrompt = String(body.userPrompt || '').trim();
  const systemInstruction = String(body.systemInstruction || '').trim();
  const temperature = Number.isFinite(Number(body.temperature)) ? Number(body.temperature) : 0.7;
  const responseMimeType = body.responseMimeType === 'text/plain' ? 'text/plain' : 'application/json';
  if (!userPrompt) return sendJson(res, 400, { error: 'AI_USER_PROMPT_REQUIRED' });
  try {
    const data = await callGeminiApi({
      model,
      apiKey,
      payload: {
        contents: [{ parts: [{ text: userPrompt }] }],
        systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
        generationConfig: {
          temperature,
          responseMimeType,
        },
      },
    });
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return sendJson(res, 200, { ok: true, text, model, responseMimeType });
  } catch (error) {
    return sendJson(res, Number(error.statusCode || 500), {
      error: error.errorCode || 'AI_CHAT_FAILED',
      message: error.message || 'AI chat request failed.',
    });
  }
};

const handleAiTts = async (req, res) => {
  const body = await parseJsonBody(req, res);
  if (!body) return;
  const apiKey = getGeminiApiKey(body);
  const model = String(body.model || 'gemini-2.5-flash-preview-tts');
  const text = String(body.text || '').trim();
  const voiceName = String(body.voiceName || 'Puck').trim() || 'Puck';
  if (!text) return sendJson(res, 400, { error: 'AI_TTS_TEXT_REQUIRED' });
  try {
    const data = await callGeminiApi({
      model,
      apiKey,
      payload: {
        contents: [{ parts: [{ text }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName,
              },
            },
          },
        },
      },
    });
    const inlineData = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData || {};
    const base64Data = String(inlineData.data || '');
    const mimeType = String(inlineData.mimeType || 'audio/wav');
    if (!base64Data) {
      return sendJson(res, 502, { error: 'AI_TTS_EMPTY', message: 'Gemini returned no audio payload.' });
    }
    const asset = await writeAiAsset(base64Data, mimeType);
    return sendJson(res, 200, {
      ok: true,
      model,
      mimeType,
      assetUrl: `/api/vt-e1/ai/assets/${asset.fileName}`,
    });
  } catch (error) {
    return sendJson(res, Number(error.statusCode || 500), {
      error: error.errorCode || 'AI_TTS_FAILED',
      message: error.message || 'AI TTS request failed.',
    });
  }
};

const handleAiAsset = async (res, fileName) => {
  const safeName = path.basename(String(fileName || ''));
  if (!safeName) return sendJson(res, 400, { error: 'AI_ASSET_NAME_REQUIRED' });
  const filePath = path.join(AI_ASSET_DIR, safeName);
  try {
    await fs.access(filePath);
  } catch {
    return sendJson(res, 404, { error: 'AI_ASSET_NOT_FOUND' });
  }
  const ext = path.extname(filePath).toLowerCase();
  const contentType = ext === '.mp3'
    ? 'audio/mpeg'
    : ext === '.ogg'
      ? 'audio/ogg'
      : ext === '.webm'
        ? 'audio/webm'
        : 'audio/wav';
  res.writeHead(200, {
    'Content-Type': contentType,
    'Access-Control-Allow-Origin': ORIGIN,
  });
  return createReadStream(filePath).pipe(res);
};

const server = http.createServer(async (req, res) => {
  const method = req.method || 'GET';
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname.replace(/\/$/, '') || '/';

  try {
    if (method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': ORIGIN,
        'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-VT-File-Name, X-VT-Mime-Type',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      });
      return res.end();
    }

    const isRenderApi = pathname.startsWith('/api/vt-e1/render') || pathname.startsWith('/api/vt-e1/render-svg-frames');
    const isPublicHealth = method === 'GET' && pathname === '/api/vt-e1/render/health';
    if (isRenderApi && !isPublicHealth && !isAuthorizedRenderRequest(req)) {
      return sendJson(res, 401, {
        ok: false,
        error: 'VT_E1_RENDER_UNAUTHORIZED',
        message: 'Hosted VT_E1 render worker requires a valid server-to-server shared secret.',
      });
    }

    if (method === 'POST' && pathname === '/api/vt-e1/render') {
      return await handleCreateJob(req, res);
    }
    if (method === 'POST' && pathname === '/api/vt-e1/render-svg-frames/from-zip') {
      return await handleCreateSvgFrameZipJob(req, res);
    }
    if (method === 'POST' && pathname === '/api/vt-e1/render-svg-frames') {
      return await handleCreateSvgFrameJob(req, res);
    }

    if (method === 'GET' && pathname === '/api/vt-e1/render/health') {
      return await handleGetHealth(req, res);
    }

    if (method === 'GET' && pathname === '/api/vt-e1/render/capabilities') {
      return await handleGetCapabilities(req, res);
    }

    if (method === 'POST' && pathname === '/api/vt-e1/render/assets') {
      return await handleCreateRenderAsset(req, res);
    }

    if (method === 'POST' && pathname === '/api/vt-e1/ai/chat') {
      return await handleAiChat(req, res);
    }

    if (method === 'POST' && pathname === '/api/vt-e1/ai/tts') {
      return await handleAiTts(req, res);
    }

    if (pathname.startsWith('/api/vt-e1/render/assets/')) {
      const parts = pathname.split('/').filter(Boolean);
      const fileName = parts[4];
      if (method === 'GET' && fileName) return await handleGetRenderAsset(res, fileName);
    }

    if (pathname.startsWith('/api/vt-e1/render/')) {
      const parts = pathname.split('/').filter(Boolean);
      const jobId = parts[3];
      const suffix = parts[4] || '';
      if (!jobId) return sendJson(res, 400, { error: 'RENDER_JOB_ID_REQUIRED' });
      if (method === 'GET' && !suffix) return await handleGetJob(res, jobId);
      if (method === 'GET' && suffix === 'download') return await handleDownloadJob(res, jobId);
    }
    if (pathname.startsWith('/api/vt-e1/render-svg-frames/')) {
      const parts = pathname.split('/').filter(Boolean);
      const jobId = parts[3];
      const suffix = parts[4] || '';
      if (!jobId) return sendJson(res, 400, { error: 'RENDER_JOB_ID_REQUIRED' });
      if (method === 'GET' && !suffix) return await handleGetJob(res, jobId);
      if (method === 'GET' && suffix === 'download') return await handleDownloadJob(res, jobId);
    }

    if (pathname.startsWith('/api/vt-e1/ai/assets/')) {
      const parts = pathname.split('/').filter(Boolean);
      const fileName = parts[4];
      if (method === 'GET' && fileName) return await handleAiAsset(res, fileName);
    }

    if (method === 'GET' && pathname === '/') {
      return sendJson(res, 200, {
        ok: true,
        service: 'vt-e1-render-server',
        hint: 'Use GET /api/vt-e1/render/capabilities, POST /api/vt-e1/render for Remotion MP4, and POST /api/vt-e1/render-svg-frames for SVG-frame MP4.',
      });
    }

    return sendJson(res, 404, { error: `Not found: ${method} ${pathname}` });
  } catch (error) {
    console.error('[vt-e1-render] internal error', error);
    return sendJson(res, 500, { error: error instanceof Error ? error.message : String(error) });
  }
});

server.listen(PORT, async () => {
  await ensureStore();
  console.log(`[vt-e1-render] listening on http://localhost:${PORT}`);
});
