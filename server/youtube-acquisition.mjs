import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { spawn } from "node:child_process";

const YOUTUBE_AUDIO_MAX_BYTES = Number(
  process.env.YOUTUBE_AUDIO_MAX_BYTES || 12 * 1024 * 1024,
);

const json = (res, status, payload) => {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
  });
  res.end(JSON.stringify(payload));
};

const readBody = async (req) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("error", reject);
    req.on("end", () => resolve(Buffer.concat(chunks)));
  });

const parseJsonBody = async (req, res) => {
  const raw = await readBody(req);
  try {
    return JSON.parse(raw.toString("utf8") || "{}");
  } catch {
    json(res, 400, { error: "INVALID_JSON", message: "Invalid JSON body." });
    return null;
  }
};

const runCommand = (command, args, options = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ["ignore", "pipe", "pipe"],
      ...options,
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += String(chunk || "");
    });
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk || "");
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) return resolve({ stdout, stderr });
      reject(new Error(stderr || `${command} exited ${code}`));
    });
  });

const safeUnlink = async (filePath) => {
  if (!filePath) return;
  try {
    await fs.unlink(filePath);
  } catch {}
};

const stripVtt = (rawText) => {
  return String(rawText || "")
    .split(/\r?\n/)
    .filter((line) => {
      const trimmed = line.trim();
      if (!trimmed) return false;
      if (trimmed === "WEBVTT") return false;
      if (/^\d+$/.test(trimmed)) return false;
      if (/^\d{2}:\d{2}:\d{2}\.\d{3}\s+-->\s+\d{2}:\d{2}:\d{2}\.\d{3}/.test(trimmed)) return false;
      if (/^\d{2}:\d{2}\.\d{3}\s+-->\s+\d{2}:\d{2}\.\d{3}/.test(trimmed)) return false;
      return true;
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
};

const findFirstByExt = async (dir, extensions) => {
  const entries = await fs.readdir(dir);
  const match = entries.find((entry) =>
    extensions.some((ext) => entry.toLowerCase().endsWith(ext)),
  );
  return match ? path.join(dir, match) : null;
};

const normalizeYouTubeUrl = (payload) => {
  if (payload.videoUrl && String(payload.videoUrl).trim()) return String(payload.videoUrl).trim();
  if (payload.videoId && String(payload.videoId).trim()) {
    return `https://www.youtube.com/watch?v=${String(payload.videoId).trim()}`;
  }
  return "";
};

const getMetadata = async (url) => {
  const { stdout } = await runCommand("yt-dlp", [
    "--dump-single-json",
    "--skip-download",
    url,
  ]);
  const parsed = JSON.parse(stdout || "{}");
  return {
    videoId: parsed.id || "",
    title: parsed.title || "",
    channelTitle: parsed.channel || parsed.uploader || "",
    thumbnail: parsed.thumbnail || "",
    durationSeconds: Number(parsed.duration || 0) || undefined,
  };
};

const acquireTranscript = async (url, tempDir) => {
  try {
    await runCommand(
      "yt-dlp",
      [
        "--write-sub",
        "--write-auto-sub",
        "--skip-download",
        "--sub-langs",
        "en.*,en",
        "--convert-subs",
        "vtt",
        "-o",
        path.join(tempDir, "transcript.%(ext)s"),
        url,
      ],
      { cwd: tempDir },
    );
  } catch {
    // We still inspect the temp folder because yt-dlp can partially succeed.
  }

  const transcriptFile =
    (await findFirstByExt(tempDir, [".en.vtt", ".vtt"])) ||
    (await findFirstByExt(tempDir, [".en.srt", ".srt"]));

  if (!transcriptFile) {
    return {
      status: "missing",
      source: "unknown",
      text: "",
      warning: "No subtitles were available for this video.",
    };
  }

  const transcriptRaw = await fs.readFile(transcriptFile, "utf8");
  const isAuto = path.basename(transcriptFile).includes(".en.");
  return {
    status: "available",
    source: isAuto ? "auto_subtitles" : "manual_subtitles",
    languageCode: "en",
    text: stripVtt(transcriptRaw),
  };
};

const acquireAudio = async (url, tempDir, includeAudioBase64) => {
  if (!includeAudioBase64) {
    return { status: "skipped" };
  }

  await runCommand(
    "yt-dlp",
    [
      "-x",
      "--audio-format",
      "mp3",
      "-o",
      path.join(tempDir, "audio.%(ext)s"),
      url,
    ],
    { cwd: tempDir },
  );

  const audioPath = await findFirstByExt(tempDir, [".mp3", ".m4a", ".webm"]);
  if (!audioPath) {
    return {
      status: "error",
      error: "Audio extraction completed without a readable output file.",
    };
  }

  const buffer = await fs.readFile(audioPath);
  if (buffer.length > YOUTUBE_AUDIO_MAX_BYTES) {
    return {
      status: "error",
      error: `Extracted audio exceeds the ${Math.round(
        YOUTUBE_AUDIO_MAX_BYTES / 1024 / 1024,
      )}MB website ingestion limit.`,
    };
  }

  return {
    status: "available",
    mimeType: "audio/mpeg",
    fileName: path.basename(audioPath),
    byteSize: buffer.length,
    base64: buffer.toString("base64"),
  };
};

export const handleYouTubeAcquireRoute = async (req, res) => {
  const payload = await parseJsonBody(req, res);
  if (!payload) return;

  const url = normalizeYouTubeUrl(payload);
  if (!url) {
    return json(res, 400, {
      error: "VIDEO_REQUIRED",
      message: "videoId or videoUrl is required.",
    });
  }

  try {
    await runCommand("yt-dlp", ["--version"]);
  } catch {
    return json(res, 500, {
      error: "YT_DLP_UNAVAILABLE",
      message: "yt-dlp is not installed on the server/runtime.",
    });
  }

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "vt-youtube-"));
  try {
    const metadata = await getMetadata(url);
    const transcript = await acquireTranscript(url, tempDir);
    const audio = await acquireAudio(url, tempDir, payload.includeAudioBase64 !== false);

    return json(res, 200, {
      ok: true,
      metadata,
      transcript,
      audio,
    });
  } catch (error) {
    console.error("[youtube-acquire] failed", error);
    return json(res, 500, {
      error: "YOUTUBE_ACQUISITION_FAILED",
      message: error instanceof Error ? error.message : "Acquisition failed.",
    });
  } finally {
    try {
      const entries = await fs.readdir(tempDir);
      await Promise.all(entries.map((entry) => safeUnlink(path.join(tempDir, entry))));
      await fs.rmdir(tempDir);
    } catch {}
  }
};
