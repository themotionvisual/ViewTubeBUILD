import { execFileSync } from "node:child_process";

const git = (...args) => {
  try {
    return execFileSync("git", args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
};

const readLiveRelease = async (url) => {
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) return { available: false, status: response.status };
    return { available: true, metadata: await response.json() };
  } catch (error) {
    return {
      available: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

export const collectReleaseStatus = async ({
  liveUrl = "https://viewtube.live/api/release",
} = {}) => {
  const upstream = git("rev-parse", "--abbrev-ref", "@{upstream}");
  const divergence = upstream
    ? git("rev-list", "--left-right", "--count", `${upstream}...HEAD`).split(/\s+/).map(Number)
    : [];

  return {
    branch: git("branch", "--show-current") || null,
    head: git("rev-parse", "HEAD") || null,
    dirtyFiles: git("status", "--porcelain").split("\n").filter(Boolean),
    upstream: upstream || null,
    upstreamHead: upstream ? git("rev-parse", upstream) || null : null,
    behindUpstream: Number.isFinite(divergence[0]) ? divergence[0] : null,
    aheadOfUpstream: Number.isFinite(divergence[1]) ? divergence[1] : null,
    originMain: git("rev-parse", "origin/main") || null,
    canonicalVercelProject: {
      name: "viewtubebuild",
      id: "prj_xCtpqziBwueQncNa8sEVKAXAgPbi",
    },
    live: await readLiveRelease(liveUrl),
  };
};

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(JSON.stringify(await collectReleaseStatus(), null, 2));
}
