import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ENVIRONMENTS = new Set(["development", "preview", "production"]);

const text = (value) => String(value || "").trim();

const readGit = (args) => {
  try {
    return text(execFileSync("git", args, {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }));
  } catch {
    return "";
  }
};

const deploymentUrl = (env, environment) => {
  const candidate = environment === "production"
    ? text(env.VERCEL_PROJECT_PRODUCTION_URL || env.VERCEL_URL)
    : text(env.VERCEL_URL);
  if (candidate) return candidate.startsWith("http") ? candidate : `https://${candidate}`;
  return environment === "development" ? "http://localhost:5173" : null;
};

export const buildReleaseMetadata = ({
  env = process.env,
  git = readGit,
} = {}) => {
  const vercelEnvironment = text(env.VERCEL_ENV);
  const environment = ENVIRONMENTS.has(vercelEnvironment)
    ? vercelEnvironment
    : text(env.NODE_ENV) === "production"
      ? "production"
      : "development";

  return Object.freeze({
    app: "viewtube",
    commit: text(env.VERCEL_GIT_COMMIT_SHA || env.VT_BUILD_COMMIT) || git(["rev-parse", "HEAD"]) || "unknown",
    branch: text(env.VERCEL_GIT_COMMIT_REF || env.VT_BUILD_BRANCH) || git(["branch", "--show-current"]) || "unknown",
    environment,
    deployedAt: text(env.VT_BUILD_TIME) || null,
    url: deploymentUrl(env, environment),
  });
};

export const getReleaseMetadata = () => buildReleaseMetadata();
