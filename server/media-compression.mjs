import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { spawn } from "node:child_process";

const MAX_DURATION_SECONDS = Number(process.env.MEDIA_ANALYSIS_MAX_DURATION_SECONDS || 300);
const MAX_OUTPUT_BYTES = Number(process.env.MEDIA_ANALYSIS_MAX_OUTPUT_BYTES || 12 * 1024 * 1024);

const ALLOWED_MIME_TYPES = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-matroska",
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/mp4",
  "audio/x-m4a",
  "audio/aac",
  "audio/ogg",
  "audio/webm",
]);

const json = (res, status, payload) => {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
  });
  res.end(JSON.stringify(payload));
};

const runFfmpeg = (args) =>
  new Promise((resolve, reject) => {
    const ff = spawn("ffmpeg", args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    ff.stderr.on("data", (chunk) => {
      stderr += String(chunk || "");
    });
    ff.on("error", reject);
    ff.on("close", (code) => {
      if (code === 0) return resolve();
      reject(new Error(stderr || `ffmpeg exited ${code}`));
    });
  });

const parseBoundary = (contentType) => {
  const match = String(contentType || "").match(/boundary=(?:\"([^\"]+)\"|([^;]+))/i);
  return match ? (match[1] || match[2]).trim() : "";
};

const splitBuffer = (buffer, delim) => {
  const parts = [];
  let start = 0;
  let index = buffer.indexOf(delim, start);
  while (index !== -1) {
    parts.push(buffer.subarray(start, index));
    start = index + delim.length;
    index = buffer.indexOf(delim, start);
  }
  parts.push(buffer.subarray(start));
  return parts;
};

export const parseMultipartSingleFile = (bodyBuffer, boundary) => {
  const boundaryBuffer = Buffer.from(`--${boundary}`);
  const chunks = splitBuffer(bodyBuffer, boundaryBuffer).slice(1, -1);
  let mode = "";
  let filePart = null;

  for (const rawPart of chunks) {
    const part = rawPart.subarray(rawPart.indexOf(Buffer.from("\r\n")) + 2);
    const headerEnd = part.indexOf(Buffer.from("\r\n\r\n"));
    if (headerEnd < 0) continue;
    const headerText = part.subarray(0, headerEnd).toString("utf8");
    const payloadRaw = part.subarray(headerEnd + 4);
    const payload = payloadRaw.subarray(0, Math.max(0, payloadRaw.length - 2));

    const nameMatch = headerText.match(/name=\"([^\"]+)\"/i);
    const filenameMatch = headerText.match(/filename=\"([^\"]*)\"/i);
    const contentTypeMatch = headerText.match(/content-type:\s*([^\r\n]+)/i);
    const name = nameMatch ? nameMatch[1] : "";

    if (!filenameMatch && name === "mode") {
      mode = payload.toString("utf8").trim();
      continue;
    }

    if (filenameMatch && name === "file") {
      filePart = {
        filename: filenameMatch[1] || "upload.bin",
        mimeType: (contentTypeMatch ? contentTypeMatch[1] : "application/octet-stream").trim(),
        data: payload,
      };
    }
  }

  return { mode, filePart };
};

const readBody = async (req) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => {
      chunks.push(chunk);
    });
    req.on("error", reject);
    req.on("end", () => resolve(Buffer.concat(chunks)));
  });
};

const safeUnlink = async (filePath) => {
  if (!filePath) return;
  try {
    await fs.unlink(filePath);
  } catch {}
};

const mimeToExt = (mimeType) => {
  if (mimeType.startsWith("video/")) return "mp4";
  if (mimeType.startsWith("audio/")) return "m4a";
  return "bin";
};

export const handleCompressAnalysisRoute = async (req, res) => {
  try {
    const contentType = String(req.headers["content-type"] || "");
    if (!contentType.toLowerCase().includes("multipart/form-data")) {
      return json(res, 400, { error: "INVALID_CONTENT_TYPE", message: "Use multipart/form-data." });
    }
    const boundary = parseBoundary(contentType);
    if (!boundary) {
      return json(res, 400, { error: "MISSING_BOUNDARY", message: "Multipart boundary missing." });
    }

    const body = await readBody(req);
    const { mode, filePart } = parseMultipartSingleFile(body, boundary);

    if (mode !== "analysis") {
      return json(res, 400, { error: "INVALID_MODE", message: "mode must be analysis" });
    }
    if (!filePart || !filePart.data || filePart.data.length === 0) {
      return json(res, 400, { error: "FILE_REQUIRED", message: "file is required" });
    }

    if (!ALLOWED_MIME_TYPES.has(filePart.mimeType)) {
      return json(res, 415, { error: "UNSUPPORTED_MEDIA_TYPE", mimeType: filePart.mimeType });
    }

    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "vt-analysis-"));
    const inputPath = path.join(tempRoot, `input-${crypto.randomUUID()}.${mimeToExt(filePart.mimeType)}`);
    const outputPath = path.join(tempRoot, `output-${crypto.randomUUID()}.mp4`);

    try {
      await fs.writeFile(inputPath, filePart.data);

      const ffmpegArgs = [
        "-y",
        "-i", inputPath,
        "-map", "0:v?",
        "-map", "0:a?",
        "-vf", "scale='min(640,iw)':'min(360,ih)':force_original_aspect_ratio=decrease,fps=12",
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-profile:v", "baseline",
        "-level", "3.0",
        "-b:v", "240k",
        "-maxrate", "260k",
        "-bufsize", "520k",
        "-c:a", "aac",
        "-ac", "1",
        "-ar", "22050",
        "-b:a", "48k",
        "-movflags", "+faststart",
        "-t", String(MAX_DURATION_SECONDS),
        outputPath,
      ];

      await runFfmpeg(ffmpegArgs);
      const compressed = await fs.readFile(outputPath);
      if (compressed.length > MAX_OUTPUT_BYTES) {
        return json(res, 413, {
          error: "COMPRESSED_FILE_TOO_LARGE",
          message: "Compressed output is still too large for analysis.",
          maxOutputBytes: MAX_OUTPUT_BYTES,
        });
      }

      const originalBytes = filePart.data.length;
      const compressedBytes = compressed.length;
      const reductionRatio = originalBytes > 0 ? Number((1 - compressedBytes / originalBytes).toFixed(4)) : 0;

      res.writeHead(200, {
        "Content-Type": "video/mp4",
        "Content-Length": String(compressedBytes),
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST,OPTIONS",
        "X-VT-Original-Bytes": String(originalBytes),
        "X-VT-Compressed-Bytes": String(compressedBytes),
        "X-VT-Reduction-Ratio": String(reductionRatio),
        "X-VT-Mime-Type": "video/mp4",
        "X-VT-Compression-Profile": "ultra_small_v1",
      });
      res.end(compressed);
    } finally {
      await safeUnlink(inputPath);
      await safeUnlink(outputPath);
      try {
        await fs.rmdir(tempRoot);
      } catch {}
    }
  } catch (error) {
    console.error("[media-compress] failed", error);
    return json(res, 500, {
      error: "COMPRESSION_FAILED",
      message: "Compression failed. Ensure ffmpeg is installed and retry.",
    });
  }
};
